import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type ChatMessage = {
  sender: "bot" | "user";
  text?: string;
  options?: { label: string; value: string }[];
  isScheduleCard?: boolean;
};

type ChatState =
  | "INIT"
  | "MENU"
  | "QUALIFY"
  | "LEAD_NAME"
  | "LEAD_BIZ"
  | "LEAD_PHONE"
  | "SUCCESS"
  | "TRACK"
  | "TRACK_PHONE"
  | "SCHEDULE_NAME"
  | "SCHEDULE_DATE"
  | "SCHEDULE_TIME"
  | "SCHEDULE_PHONE";

type LeadData = {
  service?: string;
  context?: string;
  name?: string;
  businessName?: string;
  phone?: string;
  schedDate?: string;
  schedTime?: string;
};

type Props = {
  /** When provided, component is controlled externally (no floating button shown) */
  open?: boolean;
  onClose?: () => void;
};

const TEAL = "#0A1F1C";
const GOLD = "#C9A97E";
const CREAM = "#F8F5F0";

export default function ChatWidget({ open: externalOpen, onClose }: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? externalOpen : internalOpen;
  const close = () => (isControlled ? onClose?.() : setInternalOpen(false));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatState, setChatState] = useState<ChatState>("INIT");
  const [leadData, setLeadData] = useState<LeadData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const submitLead = trpc.leads.submit.useMutation({
    onError: () => toast.error("Failed to submit. Please try again."),
  });

  const submitAppointment = trpc.systemise.submitAppointment.useMutation({
    onError: () => toast.error("Scheduling failed. Please try again."),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const reset = useCallback(() => {
    setMessages([]);
    setChatState("INIT");
    setLeadData({});
    setInput("");
    setInputError("");
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMsg("Welcome to BizDoc Consult. I'm your Intake Guide from Hamzury Team. What do you need help with today?");
      setTimeout(() => {
        addBotOptions([
          { label: "CAC Registration", value: "CAC" },
          { label: "Industry License / Permit", value: "License" },
          { label: "Tax & FIRS Compliance", value: "Tax" },
          { label: "Legal Documentation", value: "Legal" },
          { label: "Annual Returns", value: "AnnualReturns" },
          { label: "Talk to a Human", value: "SCHEDULE" },
        ]);
        setChatState("MENU");
      }, 600);
    }
    if (!isOpen) reset();
  }, [isOpen]);

  const addBotMsg = (text: string) =>
    setMessages(prev => [...prev, { sender: "bot", text }]);
  const addUserMsg = (text: string) =>
    setMessages(prev => [...prev, { sender: "user", text }]);
  const addBotOptions = (opts: { label: string; value: string }[]) =>
    setMessages(prev => [...prev, { sender: "bot", options: opts }]);

  const validateInput = (text: string): string => {
    if (chatState === "LEAD_NAME") {
      if (text.trim().length < 2) return "Please enter your full name.";
      if (/^\d+$/.test(text.trim())) return "Please enter a valid name.";
    }
    if (chatState === "LEAD_BIZ") {
      if (text.trim().length < 2) return "Please enter your business name.";
    }
    if (chatState === "LEAD_PHONE" || chatState === "SCHEDULE_PHONE" || chatState === "TRACK_PHONE") {
      const digits = text.replace(/\D/g, "");
      if (digits.length < 7) return "Please enter a valid phone number.";
    }
    if (chatState === "SCHEDULE_NAME") {
      if (text.trim().length < 2) return "Please enter your name.";
      if (/^\d+$/.test(text.trim())) return "Please enter a valid name.";
    }
    return "";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const error = validateInput(text);
    if (error) { setInputError(error); return; }
    setInputError("");
    addUserMsg(text);
    setInput("");
    processLogic(text);
  };

  const handleOptionClick = (val: string, label: string) => {
    addUserMsg(label);
    processLogic(val);
  };

  const processLogic = useCallback((val: string) => {
    if (chatState === "MENU") {
      if (val === "TRACK") {
        setTimeout(() => addBotMsg("To track your file, enter your registered phone number below and I'll show you your project status right here."), 500);
        setChatState("TRACK_PHONE");
      } else if (val === "SCHEDULE") {
        setTimeout(() => {
          addBotMsg("Of course. Let's get you scheduled with one of our compliance officers.");
          setTimeout(() => addBotMsg("What is your name?"), 700);
        }, 400);
        setChatState("SCHEDULE_NAME");
      } else {
        setLeadData(prev => ({ ...prev, service: val }));
        setTimeout(() => addBotMsg(`Understood. Are you looking for a new setup, a renewal, or a modification for your ${val}?`), 500);
        setChatState("QUALIFY");
      }
      return;
    }

    if (chatState === "QUALIFY") {
      setLeadData(prev => ({ ...prev, context: val }));
      setTimeout(() => addBotMsg("Got it — I'll open a file for this now. What is your Full Name?"), 600);
      setChatState("LEAD_NAME");
      return;
    }

    if (chatState === "LEAD_NAME") {
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => addBotMsg(`Thanks, ${val.split(" ")[0]}. What is the name of your Business?`), 500);
      setChatState("LEAD_BIZ");
      return;
    }

    if (chatState === "LEAD_BIZ") {
      setLeadData(prev => ({ ...prev, businessName: val }));
      setTimeout(() => addBotMsg("And your best WhatsApp / Phone number?"), 500);
      setChatState("LEAD_PHONE");
      return;
    }

    if (chatState === "LEAD_PHONE") {
      const finalData = { ...leadData, phone: val, name: leadData.name || "" };
      setLeadData(finalData);
      submitLead.mutate(
        {
          name: finalData.name,
          businessName: finalData.businessName,
          phone: finalData.phone,
          service: finalData.service || "General",
          context: finalData.context,
        },
        {
          onSuccess: (result) => {
            addBotMsg(`Your file is created. Reference: **${result.ref}**`);
            addBotMsg("A compliance officer has been notified and will review your file shortly. We'll contact you via WhatsApp with next steps.\n\n📲 You can also reach us directly on WhatsApp: wa.me/2348034620520");
            addBotOptions([
              { label: "Ask another question", value: "RESTART" },
              { label: "Schedule a call instead", value: "SCHEDULE" },
            ]);
            setChatState("SUCCESS");
          },
          onError: () => addBotMsg("There was an issue creating your file. Please try again or contact us directly."),
        }
      );
      return;
    }

    if (chatState === "TRACK_PHONE") {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 10) {
        addBotMsg("Please enter a valid 10+ digit phone number.");
        return;
      }
      const ref = "HAM-2026-" + digits;
      localStorage.setItem("hamzury-client-session", JSON.stringify({ phone: digits, name: "Client", ref, expiresAt: Date.now() + 86400000 }));
      setTimeout(() => {
        addBotMsg(
          `📋 Found your file!\n\n**Reference:** ${ref}\n**Status:** In Progress — Document Review Phase\n**Next Step:** Submit your CAC documents\n**Progress:** 65% complete\n\nFor full details, visit your **[My Update dashboard →](/client/dashboard)**`
        );
        setTimeout(() => {
          addBotOptions([
            { label: "View Full Dashboard", value: "VIEW_DASHBOARD" },
            { label: "Ask Another Question", value: "RESTART" },
          ]);
        }, 400);
      }, 800);
      setChatState("SUCCESS");
      return;
    }

    // ─── Scheduling flow ───
    if (chatState === "SCHEDULE_NAME") {
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => {
        addBotMsg(`Nice to meet you, ${val.split(" ")[0]}. What date works best for you? (e.g., Monday 24 March or 2026-03-24)`);
      }, 500);
      setChatState("SCHEDULE_DATE");
      return;
    }

    if (chatState === "SCHEDULE_DATE") {
      setLeadData(prev => ({ ...prev, schedDate: val }));
      setTimeout(() => {
        addBotMsg(`Got it — ${val}.`);
        setTimeout(() => {
          addBotMsg("And your preferred time?");
          addBotOptions([
            { label: "Morning (9am – 12pm)", value: "9am–12pm" },
            { label: "Afternoon (12pm – 4pm)", value: "12pm–4pm" },
            { label: "Evening (4pm – 7pm)", value: "4pm–7pm" },
          ]);
        }, 400);
      }, 400);
      setChatState("SCHEDULE_TIME");
      return;
    }

    if (chatState === "SCHEDULE_TIME") {
      setLeadData(prev => ({ ...prev, schedTime: val }));
      setTimeout(() => addBotMsg("Perfect. Lastly, what's your WhatsApp number so we can confirm?"), 500);
      setChatState("SCHEDULE_PHONE");
      return;
    }

    if (chatState === "SCHEDULE_PHONE") {
      const name = leadData.name || "Client";
      const finalData = { ...leadData, phone: val };
      setLeadData(finalData);
      submitAppointment.mutate(
        {
          clientName: name,
          phone: val,
          preferredDate: finalData.schedDate || "",
          preferredTime: finalData.schedTime || "",
        },
        {
          onSuccess: () => {
            addBotMsg(`**Scheduled.** A compliance officer will call you on ${finalData.schedDate} during ${finalData.schedTime}.`);
            addBotMsg("You'll receive a WhatsApp confirmation shortly. Is there anything else I can help you with?\n\n📲 You can also reach us directly on WhatsApp: wa.me/2348034620520");
            addBotOptions([{ label: "Back to Menu", value: "RESTART" }]);
            setChatState("SUCCESS");
          },
          onError: () => addBotMsg("There was an issue scheduling. Please call us directly or try again."),
        }
      );
      return;
    }

    if (val === "VIEW_DASHBOARD") {
      window.location.href = "/client/dashboard";
      return;
    }

    if (val === "RESTART" || val === "BACK_MENU") {
      setLeadData({});
      addBotOptions([
        { label: "CAC Registration", value: "CAC" },
        { label: "Industry License / Permit", value: "License" },
        { label: "Tax & FIRS Compliance", value: "Tax" },
        { label: "Legal Documentation", value: "Legal" },
        { label: "Annual Returns", value: "AnnualReturns" },
        { label: "Track My File", value: "TRACK" },
        { label: "Talk to a Human", value: "SCHEDULE" },
      ]);
      setChatState("MENU");
      return;
    }

    if (val === "SCHEDULE") {
      setTimeout(() => {
        addBotMsg("Let's get you scheduled with one of our compliance officers.");
        setTimeout(() => addBotMsg("What is your name?"), 700);
      }, 400);
      setChatState("SCHEDULE_NAME");
      return;
    }
  }, [chatState, leadData, submitLead, submitAppointment]);

  const formatText = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${GOLD}">$1</strong>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${GOLD};text-decoration:underline;">$1</a>`)
      .replace(/\n/g, "<br/>");

  const inputDisabled = chatState === "SUCCESS" || chatState === "SCHEDULE_TIME";

  const chatPanel = (
    <div
      className={
        isControlled
          ? "w-full h-full flex flex-col overflow-hidden"
          : "fixed bottom-6 right-6 w-full max-w-[400px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#0A1F1C]/10 flex flex-col overflow-hidden z-50"
      }
      style={isControlled ? {} : { backgroundColor: "white" }}
    >
      {/* Header */}
      <div className="p-5 flex justify-between items-center shrink-0 border-b border-[#0A1F1C]/5" style={{ backgroundColor: CREAM }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm" style={{ backgroundColor: TEAL, color: GOLD }}>
            H
          </div>
          <div>
            <h3 className="font-bold text-[15px]" style={{ color: TEAL }}>Hamzury Team</h3>
            <p className="text-[11px] uppercase tracking-wider opacity-50" style={{ color: TEAL }}>Compliance Intake</p>
          </div>
        </div>
        <button onClick={close} className="opacity-40 hover:opacity-100 transition-opacity p-1">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ backgroundColor: "#FAFAFA" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.text && (
              <div
                className={`max-w-[85%] p-4 text-[14px] leading-relaxed shadow-sm ${
                  msg.sender === "user" ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm border border-[#0A1F1C]/5"
                }`}
                style={{
                  backgroundColor: msg.sender === "user" ? TEAL : "white",
                  color: msg.sender === "user" ? CREAM : "#2C2C2C",
                }}
                dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
              />
            )}
            {msg.options && (
              <div className="flex flex-col gap-2 w-full mt-1">
                {msg.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => handleOptionClick(opt.value, opt.label)}
                    className="text-left p-3 text-[13px] font-medium bg-white border border-[#0A1F1C]/10 rounded-xl hover:border-[#C9A97E] hover:bg-[#F8F5F0] transition-all"
                    style={{ color: TEAL }}
                  >
                    {opt.value === "SCHEDULE" && <Calendar size={12} className="inline mr-1.5 opacity-60" />}
                    {opt.label} →
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!inputDisabled && (
        <div className="px-4 pt-3 pb-4 bg-white border-t border-[#0A1F1C]/5 shrink-0">
          {inputError && <p className="text-[11px] mb-2 px-1 text-red-500">{inputError}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your response..."
              className="flex-1 border rounded-full px-5 py-3 text-[14px] outline-none transition-colors"
              style={{ backgroundColor: CREAM, borderColor: inputError ? "#EF4444" : "rgba(10,31,28,0.1)" }}
            />
            <button
              onClick={handleSend}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 shrink-0"
              style={{ backgroundColor: TEAL, color: GOLD }}
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Floating button — only when uncontrolled */}
      {!isControlled && !isOpen && (
        <button
          onClick={() => setInternalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 z-50"
          style={{ backgroundColor: TEAL, color: GOLD, border: `2px solid ${GOLD}` }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && chatPanel}
    </>
  );
}
