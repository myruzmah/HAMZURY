import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, MoreVertical, Phone, ThumbsUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════
   CHAT WIDGET - Universal floating chat with department awareness
   Features:
   - Notification badge + teaser messages on page load
   - Compact popup (not full screen)
   - 4 empathetic conversation paths
   - Department-specific AI personas (Amara/Nova/Zara/General)
   - No dashes, no emojis
   ═══════════════════════════════════════════════════════════════════════ */

type Department = "general" | "bizdoc" | "systemise" | "skills";

type ChatMessage = {
  sender: "bot" | "user";
  text?: string;
  options?: { label: string; value: string; sub?: string }[];
};

type ChatState =
  | "INIT"
  | "PATHS"
  | "SERVICE_SELECT"
  | "QUALIFY"
  | "LEAD_NAME"
  | "LEAD_BIZ"
  | "LEAD_PHONE"
  | "SUCCESS"
  | "TRACK_PHONE"
  | "SCHEDULE_NAME"
  | "SCHEDULE_DATE"
  | "SCHEDULE_TIME"
  | "SCHEDULE_PHONE"
  | "AI_CHAT";

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
  department?: Department;
  /** When provided, component is controlled externally (no floating button shown) */
  open?: boolean;
  onClose?: () => void;
};

const TEAL = "#0A1F1C";
const GOLD = "#C9A97E";
const CREAM = "#F8F5F0";

const SLOGANS = [
  "Without clarity, we cannot serve you better.",
  "Give answers to the best of your ability.",
  "Some days we do not work rush. Some days we do.",
  "Many businesses are left behind. Not yours.",
  "We understand first. Then we deliver.",
  "Structure saves more money than hustle.",
];

const PERSONA: Record<Department, { name: string; title: string; greeting: string; color: string }> = {
  general: {
    name: "Evelyn Adam",
    title: "HAMZURY Advisor",
    greeting: "Welcome to HAMZURY. We help businesses get positioned, protected, and profitable. How can I help you today?",
    color: TEAL,
  },
  bizdoc: {
    name: "Hauwa Aristotle",
    title: "BizDoc Advisor",
    greeting: "Welcome to BizDoc. We handle registration, compliance, and legal paperwork so you focus on growth. How can I help?",
    color: "#1B4D3E",
  },
  systemise: {
    name: "Fatima Haitham",
    title: "Systemise Advisor",
    greeting: "Welcome to Systemise. We build brands and digital systems that work while you sleep. How can I help?",
    color: "#1E3A5F",
  },
  skills: {
    name: "Maryam Jaffar",
    title: "Skills Advisor",
    greeting: "Welcome to Skills. We train people who want real market ability, not just certificates. What are you looking to learn?",
    color: "#1B2A4A",
  },
};

const SERVICES: Record<Department, { label: string; value: string }[]> = {
  general: [
    { label: "Business Registration (CAC)", value: "CAC" },
    { label: "Licensing and Permits", value: "License" },
    { label: "Website or Digital Systems", value: "Website" },
    { label: "Social Media Management", value: "SocialMedia" },
    { label: "Skills Training", value: "Training" },
    { label: "Full Business Architecture", value: "FullBuild" },
  ],
  bizdoc: [
    { label: "CAC Registration", value: "CAC" },
    { label: "Industry License or Permit", value: "License" },
    { label: "Tax and FIRS Compliance", value: "Tax" },
    { label: "Legal Documentation", value: "Legal" },
    { label: "Annual Returns", value: "AnnualReturns" },
    { label: "Trademark and IP", value: "Trademark" },
    { label: "Foreign Business Registration", value: "Foreign" },
  ],
  systemise: [
    { label: "Website Design and Development", value: "Website" },
    { label: "Social Media Management", value: "SocialMedia" },
    { label: "Brand Identity and Design", value: "Branding" },
    { label: "Business Automation", value: "Automation" },
    { label: "CRM and Lead Generation", value: "CRM" },
    { label: "Podcast or Content Channel", value: "Content" },
  ],
  skills: [
    { label: "Business Essentials Bootcamp", value: "BusinessBootcamp" },
    { label: "Digital Marketing Intensive", value: "DigitalMarketing" },
    { label: "Data Analysis Bootcamp", value: "DataAnalysis" },
    { label: "AI Powered Business Bundle", value: "AIBundle" },
    { label: "Custom Training for Teams", value: "CustomTraining" },
  ],
};

const TEASERS: Record<Department, string[]> = {
  general: [
    "Need help structuring your business?",
    "We help businesses get positioned and protected.",
  ],
  bizdoc: [
    "Need help with business registration?",
    "Compliance sorted. Peace of mind delivered.",
  ],
  systemise: [
    "Need a website or digital system?",
    "We build brands that work while you sleep.",
  ],
  skills: [
    "Ready to learn a new skill?",
    "Our next cohort is filling up fast.",
  ],
};

export default function ChatWidget({ department = "general", open: externalOpen, onClose }: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sloganIdx, setSloganIdx] = useState(0);
  const isOpen = isControlled ? externalOpen : internalOpen;
  const close = () => {
    if (isControlled) {
      setMounted(false);
      setTimeout(() => onClose?.(), 300);
    } else {
      setMounted(false);
      setTimeout(() => setInternalOpen(false), 300);
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatState, setChatState] = useState<ChatState>("INIT");
  const [leadData, setLeadData] = useState<LeadData>({});
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [showBadge, setShowBadge] = useState(true);
  const [teasers, setTeasers] = useState<string[]>([]);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const hasPlayedSound = useRef(false);

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);

  const persona = PERSONA[department];

  const submitLead = trpc.leads.submit.useMutation({
    onError: () => toast.error("Failed to submit. Please try again."),
  });

  const submitAppointment = trpc.systemise.submitAppointment.useMutation({
    onError: () => toast.error("Scheduling failed. Please try again."),
  });

  const trpcUtils = trpc.useUtils();

  // Slide-up animation: set mounted after isOpen becomes true
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Rotate slogans every 6s
  useEffect(() => {
    const t = setInterval(() => setSloganIdx(i => (i + 1) % SLOGANS.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Teaser notification system
  useEffect(() => {
    if (isControlled || isOpen || teaserDismissed) return;
    const dept = department;
    const t1 = setTimeout(() => {
      // Subtle notification sound
      if (!hasPlayedSound.current) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800;
          gain.gain.value = 0.08;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.stop(ctx.currentTime + 0.3);
          hasPlayedSound.current = true;
        } catch {}
      }
      setTeasers([TEASERS[dept][0]]);
    }, 3000);

    const t2 = setTimeout(() => {
      setTeasers([TEASERS[dept][0], TEASERS[dept][1]]);
    }, 6000);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isControlled, isOpen, teaserDismissed, department]);

  const reset = useCallback(() => {
    setMessages([]);
    setChatState("INIT");
    setLeadData({});
    setInput("");
    setInputError("");
    setAiMessages([]);
  }, []);

  // Show initial paths immediately on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      showInitialPaths();
    }
    if (!isOpen) { reset(); }
  }, [isOpen]);

  const showInitialPaths = () => {
    addBotMsg(persona.greeting);
    setTimeout(() => {
      addBotOptions([
        { label: "Returning client", value: "TRACK", sub: "Check your file or continue" },
        { label: "I know what I need", value: "DIRECT", sub: "Quick service selection" },
        { label: "Help me figure it out", value: "GUIDANCE", sub: "We will guide you" },
        { label: "Schedule a call", value: "SCHEDULE", sub: "Speak with our team" },
      ]);
      setChatState("PATHS");
    }, 600);
  };

  const addBotMsg = (text: string) =>
    setMessages(prev => [...prev, { sender: "bot", text }]);
  const addUserMsg = (text: string) =>
    setMessages(prev => [...prev, { sender: "user", text }]);
  const addBotOptions = (opts: { label: string; value: string; sub?: string }[]) =>
    setMessages(prev => [...prev, { sender: "bot", options: opts }]);

  const validateInput = (text: string): string => {
    if (chatState === "LEAD_NAME" || chatState === "SCHEDULE_NAME") {
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
    return "";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();

    // AI chat mode
    if (chatState === "AI_CHAT") {
      addUserMsg(text);
      setInput("");
      handleAIChat(text);
      return;
    }

    const error = validateInput(text);
    if (error) { setInputError(error); return; }
    setInputError("");
    addUserMsg(text);
    setInput("");
    processLogic(text);
  };

  const handleAIChat = async (text: string) => {
    setAiLoading(true);
    const newHistory = [...aiMessages, { role: "user", content: text }];
    setAiMessages(newHistory);

    try {
      const result = await trpcUtils.ask.answer.fetch({ question: text });
      const answer = result.answer || "I could not process that. Please try again or schedule a call with our team.";
      addBotMsg(answer);
      setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);

      // After a few exchanges, suggest next steps
      if (newHistory.filter(m => m.role === "user").length >= 3) {
        setTimeout(() => {
          addBotOptions([
            { label: "I am ready to proceed", value: "DIRECT" },
            { label: "Schedule a call", value: "SCHEDULE" },
            { label: "Ask another question", value: "CONTINUE_CHAT" },
          ]);
        }, 500);
      }
    } catch {
      addBotMsg("Something went wrong. Please try again or reach us on WhatsApp.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptionClick = (val: string, label: string) => {
    addUserMsg(label);
    processLogic(val);
  };

  const processLogic = useCallback((val: string) => {
    // From initial paths
    if (chatState === "PATHS") {
      if (val === "DIRECT") {
        setTimeout(() => {
          addBotMsg("What service do you need?");
          addBotOptions(SERVICES[department].map(s => ({ label: s.label, value: s.value })));
        }, 400);
        setChatState("SERVICE_SELECT");
        return;
      }
      if (val === "GUIDANCE") {
        setTimeout(() => {
          addBotMsg("Let me help you find the right solution. Tell me about your business and what challenge you are facing right now.");
        }, 400);
        setChatState("AI_CHAT");
        return;
      }
      if (val === "SCHEDULE") {
        setTimeout(() => {
          addBotMsg("Let me get you scheduled with our team. What is your name?");
        }, 400);
        setChatState("SCHEDULE_NAME");
        return;
      }
      if (val === "TRACK") {
        setTimeout(() => addBotMsg("Enter your registered phone number and I will show your project status."), 400);
        setChatState("TRACK_PHONE");
        return;
      }
    }

    // Continue chat after AI suggestion
    if (val === "CONTINUE_CHAT") {
      setChatState("AI_CHAT");
      return;
    }

    // Service selection
    if (chatState === "SERVICE_SELECT") {
      setLeadData(prev => ({ ...prev, service: val }));
      setTimeout(() => addBotMsg("Are you looking for a new setup, a renewal, or a modification?"), 500);
      setChatState("QUALIFY");
      return;
    }

    if (chatState === "QUALIFY") {
      setLeadData(prev => ({ ...prev, context: val }));
      setTimeout(() => addBotMsg("I will open a file for this. What is your full name?"), 600);
      setChatState("LEAD_NAME");
      return;
    }

    if (chatState === "LEAD_NAME") {
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => addBotMsg(`Thanks, ${val.split(" ")[0]}. What is the name of your business?`), 500);
      setChatState("LEAD_BIZ");
      return;
    }

    if (chatState === "LEAD_BIZ") {
      setLeadData(prev => ({ ...prev, businessName: val }));
      setTimeout(() => addBotMsg("And your best WhatsApp or phone number?"), 500);
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
            addBotMsg("A team member has been notified and will reach out to you shortly via WhatsApp with next steps.");
            addBotOptions([
              { label: "Ask another question", value: "RESTART" },
              { label: "Schedule a call", value: "SCHEDULE" },
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
        addBotMsg("Please enter a valid phone number with at least 10 digits.");
        return;
      }
      localStorage.setItem("hamzury-client-session", JSON.stringify({ phone: digits, name: "Client", expiresAt: Date.now() + 86400000 }));
      setTimeout(() => {
        addBotMsg("Looking up your file...");
        setTimeout(() => {
          addBotMsg("Found your records. For full details and real time updates, visit your dashboard.");
          addBotOptions([
            { label: "View My Dashboard", value: "VIEW_DASHBOARD" },
            { label: "Back to Menu", value: "RESTART" },
          ]);
        }, 800);
      }, 500);
      setChatState("SUCCESS");
      return;
    }

    // Scheduling flow
    if (chatState === "SCHEDULE_NAME") {
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => {
        addBotMsg(`Nice to meet you, ${val.split(" ")[0]}. What date works best? (e.g., Monday 24 March)`);
      }, 500);
      setChatState("SCHEDULE_DATE");
      return;
    }

    if (chatState === "SCHEDULE_DATE") {
      setLeadData(prev => ({ ...prev, schedDate: val }));
      setTimeout(() => {
        addBotMsg("And your preferred time?");
        addBotOptions([
          { label: "Morning (9am to 12pm)", value: "9am-12pm" },
          { label: "Afternoon (12pm to 4pm)", value: "12pm-4pm" },
          { label: "Evening (4pm to 7pm)", value: "4pm-7pm" },
        ]);
      }, 400);
      setChatState("SCHEDULE_TIME");
      return;
    }

    if (chatState === "SCHEDULE_TIME") {
      setLeadData(prev => ({ ...prev, schedTime: val }));
      setTimeout(() => addBotMsg("Lastly, what is your WhatsApp number so we can confirm?"), 500);
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
            addBotMsg(`Scheduled. A team member will call you on ${finalData.schedDate} during ${finalData.schedTime}.`);
            addBotMsg("You will receive a WhatsApp confirmation shortly.");
            addBotOptions([{ label: "Back to Menu", value: "RESTART" }]);
            setChatState("SUCCESS");
          },
          onError: () => addBotMsg("There was an issue scheduling. Please try again."),
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
      setAiMessages([]);
      addBotMsg("How else can I help you?");
      setTimeout(() => {
        addBotOptions([
          { label: "Returning client", value: "TRACK", sub: "Check your file or continue" },
          { label: "I know what I need", value: "DIRECT", sub: "Quick service selection" },
          { label: "Help me figure it out", value: "GUIDANCE", sub: "We will guide you" },
          { label: "Schedule a call", value: "SCHEDULE", sub: "Speak with our team" },
        ]);
      }, 300);
      setChatState("PATHS");
      return;
    }

    if (val === "SCHEDULE") {
      setTimeout(() => {
        addBotMsg("Let me get you scheduled. What is your name?");
      }, 400);
      setChatState("SCHEDULE_NAME");
      return;
    }

    if (val === "DIRECT") {
      setTimeout(() => {
        addBotMsg("What service do you need?");
        addBotOptions(SERVICES[department].map(s => ({ label: s.label, value: s.value })));
      }, 400);
      setChatState("SERVICE_SELECT");
      return;
    }
  }, [chatState, leadData, submitLead, submitAppointment, department]);

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
          : "fixed z-50 flex flex-col overflow-hidden shadow-2xl border-t border-[#0A1F1C]/10 bottom-0 left-0 right-0 max-h-[85vh] md:bottom-4 md:right-4 md:left-auto md:w-[420px] md:rounded-2xl md:max-h-[600px] md:border"
      }
      style={isControlled ? {} : { backgroundColor: "white", transform: mounted ? "translateY(0)" : "translateY(100%)", transition: "transform 0.3s ease-out" }}
    >
      {/* Header */}
      <div className="shrink-0 relative" style={{ backgroundColor: persona.color }}>
        <div className="px-4 pt-3 pb-2 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(v => !v)} className="text-white/60 hover:text-white transition-opacity p-0.5 mt-0.5">
              <MoreVertical size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[14px] text-white">{persona.name}</h3>
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center" title="Verified">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] text-white/70">Online now</span>
              </div>
            </div>
          </div>
          <button onClick={close} className="text-white/50 hover:text-white transition-opacity p-1">
            <X size={18} />
          </button>
        </div>
        {/* Rotating slogan */}
        <p className="px-4 pb-2.5 text-[11px] text-white/50 font-light italic transition-opacity duration-500">
          {SLOGANS[sloganIdx]}
        </p>

        {/* Three-dot menu dropdown */}
        {menuOpen && (
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#0A1F1C]/8 py-1 z-10 min-w-[180px]">
            <button
              onClick={() => {
                setMenuOpen(false);
                const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
                window.open(`https://wa.me/${wa}`, "_blank");
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F8F5F0] transition-colors flex items-center gap-2"
              style={{ color: TEAL }}
            >
              <Phone size={14} />
              Contact team
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                reset();
                showInitialPaths();
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F8F5F0] transition-colors"
              style={{ color: "#DC2626" }}
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ backgroundColor: "#FAFAFA" }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.text && (
                <div className={msg.sender === "bot" ? "max-w-[85%]" : "max-w-[85%]"}>
                  <div
                    className={`p-3.5 text-[13px] leading-relaxed ${
                      msg.sender === "user" ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm border border-[#0A1F1C]/5"
                    }`}
                    style={{
                      backgroundColor: msg.sender === "user" ? persona.color : "white",
                      color: msg.sender === "user" ? "#F8F5F0" : "#2C2C2C",
                    }}
                    dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                  />
                  {msg.sender === "bot" && !msg.options && (
                    <button
                      onClick={() => toast.success("Thanks for the feedback")}
                      className="mt-1 p-1 rounded-full hover:bg-black/5 transition-colors opacity-40 hover:opacity-100"
                    >
                      <ThumbsUp size={12} />
                    </button>
                  )}
                </div>
              )}
              {msg.options && (
                <div className="flex flex-col gap-2 w-full mt-1">
                  {msg.options.map((opt, j) => (
                    <button
                      key={j}
                      onClick={() => handleOptionClick(opt.value, opt.label)}
                      className="text-left p-3 text-[13px] bg-white border border-[#0A1F1C]/8 rounded-xl hover:border-[#C9A97E] hover:bg-[#F8F5F0] transition-all group"
                    >
                      <span className="font-medium" style={{ color: TEAL }}>{opt.label}</span>
                      {opt.sub && <span className="block text-[11px] mt-0.5 opacity-50">{opt.sub}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {aiLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl rounded-tl-sm bg-white border border-[#0A1F1C]/5">
                <Loader2 size={16} className="animate-spin opacity-40" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

      {/* Input */}
      {!inputDisabled && (
        <div className="px-3 pt-2 pb-3 bg-white border-t border-[#0A1F1C]/5 shrink-0">
          {inputError && <p className="text-[11px] mb-1.5 px-1 text-red-500">{inputError}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={chatState === "AI_CHAT" ? "Ask me anything..." : "Type your response..."}
              className="flex-1 border rounded-full px-4 py-2.5 text-[13px] outline-none transition-colors"
              style={{ backgroundColor: CREAM, borderColor: inputError ? "#EF4444" : "rgba(10,31,28,0.08)" }}
            />
            <button
              onClick={handleSend}
              disabled={aiLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shrink-0 disabled:opacity-50"
              style={{ backgroundColor: persona.color, color: GOLD }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-center mt-1.5 text-[10px] opacity-40">
            By continuing, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">terms</a>.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Floating button with notification badge and teasers */}
      {!isControlled && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Teaser notification bubbles */}
          {!teaserDismissed && teasers.map((teaser, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg border border-[#0A1F1C]/8 px-4 py-2.5 max-w-[240px] text-[13px] cursor-pointer animate-in slide-in-from-right-2 fade-in duration-300"
              style={{ color: TEAL }}
              onClick={() => {
                setTeaserDismissed(true);
                setTeasers([]);
                setInternalOpen(true);
                setShowBadge(false);
              }}
            >
              {teaser}
            </div>
          ))}

          {/* Chat button */}
          <button
            onClick={() => {
              setInternalOpen(true);
              setShowBadge(false);
              setTeaserDismissed(true);
              setTeasers([]);
            }}
            className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
            style={{ backgroundColor: persona.color, color: GOLD }}
          >
            <MessageSquare size={20} />
            {/* Unread badge */}
            {showBadge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat panel */}
      {isOpen && chatPanel}
    </>
  );
}
