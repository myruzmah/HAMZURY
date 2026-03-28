import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, MoreVertical, Phone, Star, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════
   CHAT WIDGET - AWS "Ask" style floating chat with department awareness
   Features:
   - Fixed-size panel with scrollable messages area
   - AWS-style initial view: colored header band, pills, disclaimer
   - Typing animation on open
   - Feedback star icon beside floating button
   - 4 empathetic conversation paths
   - Department-specific AI personas
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
  | "AI_CHAT"
  | "DIRECT_TELL"
  | "DIRECT_PACKAGE";

type LeadData = {
  service?: string;
  context?: string;
  name?: string;
  businessName?: string;
  phone?: string;
  schedDate?: string;
  schedTime?: string;
  selectedServices?: string[];
};

type Props = {
  department?: Department;
  /** When provided, component is controlled externally (no floating button shown) */
  open?: boolean;
  onClose?: () => void;
};

const TEAL = "#1B4D3E";   // BizDoc leaf green
const GOLD = "#C9A97E";
const CREAM = "#FAFAF8";

const SLOGANS = [
  "Without clarity, we cannot serve you better.",
  "Give answers to the best of your ability.",
  "Some days we do not work rush. Some days we do.",
  "Many businesses are left behind. Not yours.",
  "We understand first. Then we deliver.",
  "Structure saves more money than hustle.",
];

const PERSONA: Record<Department, { name: string; title: string; greeting: string; subtitle: string; color: string }> = {
  general: {
    name: "Evelyn",
    title: "HAMZURY Advisor",
    greeting: "Welcome to HAMZURY. How can I help you today?",
    subtitle: "Get helpful guidance on business registration, digital systems, and growth strategies.",
    color: TEAL,
  },
  bizdoc: {
    name: "Hauwa",
    title: "BizDoc Advisor",
    greeting: "Welcome to BizDoc. How can I help you?",
    subtitle: "Get guidance on CAC registration, licensing, compliance, and legal documentation.",
    color: "#1B4D3E",
  },
  systemise: {
    name: "Fatima",
    title: "Systemise Advisor",
    greeting: "Welcome to Systemise. How can I help you?",
    subtitle: "Get guidance on websites, branding, automation, and digital growth systems.",
    color: "#1E3A5F",
  },
  skills: {
    name: "Maryam",
    title: "Skills Advisor",
    greeting: "Welcome to Skills. We train people who want real market ability, not just certificates. What are you looking to learn?",
    subtitle: "Get guidance on bootcamps, digital skills training, and cohort programs.",
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
    { label: "SCUML Registration", value: "SCUML" },
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

const PRICING: Record<string, { label: string; price: string; amount: number }> = {
  CAC: { label: "CAC Registration", price: "\u20A650,000", amount: 50000 },
  License: { label: "Industry License", price: "\u20A680,000", amount: 80000 },
  Tax: { label: "Tax Compliance", price: "\u20A660,000", amount: 60000 },
  Legal: { label: "Legal Documentation", price: "from \u20A640,000", amount: 40000 },
  AnnualReturns: { label: "Annual Returns", price: "\u20A630,000", amount: 30000 },
  Trademark: { label: "Trademark & IP", price: "\u20A675,000", amount: 75000 },
  Foreign: { label: "Foreign Registration", price: "\u20A6150,000", amount: 150000 },
  SCUML: { label: "SCUML Registration", price: "\u20A645,000", amount: 45000 },
  Website: { label: "Website Design", price: "from \u20A6200,000", amount: 200000 },
  SocialMedia: { label: "Social Media Management", price: "\u20A6100,000/mo", amount: 100000 },
  Branding: { label: "Brand Identity", price: "from \u20A6150,000", amount: 150000 },
  Automation: { label: "Business Automation", price: "from \u20A6120,000", amount: 120000 },
  CRM: { label: "CRM & Lead Gen", price: "from \u20A6180,000", amount: 180000 },
  Content: { label: "Podcast/Content", price: "from \u20A6100,000", amount: 100000 },
  BusinessBootcamp: { label: "Business Bootcamp", price: "\u20A635,000", amount: 35000 },
  DigitalMarketing: { label: "Digital Marketing", price: "\u20A645,000", amount: 45000 },
  DataAnalysis: { label: "Data Analysis", price: "\u20A650,000", amount: 50000 },
  AIBundle: { label: "AI Business Bundle", price: "\u20A655,000", amount: 55000 },
  CustomTraining: { label: "Custom Training", price: "Contact us", amount: 0 },
  FullBuild: { label: "Full Business Setup", price: "from \u20A6500,000", amount: 500000 },
  Training: { label: "Skills Training", price: "from \u20A635,000", amount: 35000 },
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

/* ── Typing dots component ─────────────────────────────────────────── */
function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.5,
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

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

  // Typing indicator for initial greeting
  const [showInitTyping, setShowInitTyping] = useState(false);

  // Track whether conversation has started (user clicked an option or typed)
  const hasInteracted = messages.some(m => m.sender === "user");

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
    setShowInitTyping(false);
  }, []);

  /** Build pricing summary from selected services */
  const buildPricingSummary = (services: string[]): string => {
    const lines = services.map(s => {
      const p = PRICING[s];
      return p ? `- ${p.label}: ${p.price}` : `- ${s}`;
    });
    const total = services.reduce((sum, s) => sum + (PRICING[s]?.amount || 0), 0);
    const hasContactUs = services.some(s => PRICING[s]?.amount === 0);
    const totalLine = hasContactUs
      ? `Estimated total: \u20A6${total.toLocaleString()} (plus items requiring a custom quote)`
      : `Estimated total: \u20A6${total.toLocaleString()}`;
    return `Here is your package summary:\n\n${lines.join("\n")}\n\n${totalLine}\n\nThis is an estimate. Final pricing depends on your specific requirements.`;
  };

  /** Show remaining services for multi-select in DIRECT_PACKAGE */
  const showRemainingServices = (alreadySelected: string[]) => {
    const available = SERVICES[department]
      .filter(s => !alreadySelected.includes(s.value))
      .map(s => {
        const p = PRICING[s.value];
        return { label: p ? `${s.label} (${p.price})` : s.label, value: s.value };
      });
    const opts = [
      ...available,
      { label: "That is all I need", value: "DONE_SELECTING" },
    ];
    addBotOptions(opts);
  };

  // Show initial paths with typing animation on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      showInitialPaths();
    }
    if (!isOpen) { reset(); }
  }, [isOpen]);

  const showInitialPaths = () => {
    setShowInitTyping(true);
    setTimeout(() => {
      setShowInitTyping(false);
      addBotMsg(persona.greeting);
      setChatState("PATHS");
    }, 1200);
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
      if (val === "TRACK") {
        setTimeout(() => addBotMsg("Enter your registered phone number and I will show your project status."), 400);
        setChatState("TRACK_PHONE");
        return;
      }
      if (val === "GUIDANCE") {
        setTimeout(() => {
          addBotMsg("Let me help you find the right solution. Tell me about your business and what challenge you are facing right now.");
        }, 400);
        setChatState("AI_CHAT");
        return;
      }
      if (val === "CONTACT_TEAM") {
        const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
        window.open(`https://wa.me/${wa}`, "_blank");
        return;
      }
      if (val === "CHANGE_LANG") {
        setTimeout(() => {
          addBotMsg("Language selection is coming soon. For now, our team speaks English, Hausa, and Pidgin. How can I help you?");
          addBotOptions([
            { label: "Track my progress", value: "TRACK" },
            { label: "I need guidance", value: "GUIDANCE" },
            { label: "Contact team", value: "CONTACT_TEAM" },
          ]);
        }, 400);
        return;
      }
      if (val === "DIRECT") {
        setTimeout(() => {
          addBotMsg("Tell me what you need. Be as specific as you like.");
        }, 400);
        setChatState("DIRECT_TELL");
        return;
      }
      if (val === "SCHEDULE") {
        setTimeout(() => {
          addBotMsg("Let me get you scheduled with our team. What is your name?");
        }, 400);
        setChatState("SCHEDULE_NAME");
        return;
      }
    }

    // Continue chat after AI suggestion
    if (val === "CONTINUE_CHAT") {
      setChatState("AI_CHAT");
      return;
    }

    // DIRECT_TELL: user typed what they need
    if (chatState === "DIRECT_TELL") {
      setLeadData(prev => ({ ...prev, service: val }));
      setTimeout(() => {
        addBotMsg("Got it. Would you like us to handle just that, or would you prefer a full diagnosis so we can recommend the best package for your situation?");
        addBotOptions([
          { label: "Just this, please", value: "JUST_THIS" },
          { label: "Full diagnosis", value: "FULL_DIAGNOSIS" },
        ]);
      }, 500);
      return;
    }

    if (val === "JUST_THIS") {
      setLeadData(prev => ({ ...prev, selectedServices: [] }));
      setTimeout(() => {
        addBotMsg("Based on what you need, here are services you might also want to consider. Select all that apply.");
        showRemainingServices([]);
      }, 400);
      setChatState("DIRECT_PACKAGE");
      return;
    }

    if (val === "FULL_DIAGNOSIS") {
      setTimeout(() => {
        addBotMsg("Let me help you find the right solution. Tell me about your business and what challenge you are facing right now.");
      }, 400);
      setChatState("AI_CHAT");
      return;
    }

    // DIRECT_PACKAGE: multi-select services
    if (chatState === "DIRECT_PACKAGE") {
      if (val === "DONE_SELECTING") {
        const selected = leadData.selectedServices || [];
        if (selected.length === 0) {
          setTimeout(() => {
            addBotMsg("No problem. Let me open a file for you. What is your full name?");
          }, 400);
          setChatState("LEAD_NAME");
          return;
        }
        setTimeout(() => {
          addBotMsg(buildPricingSummary(selected));
          setTimeout(() => {
            addBotMsg("I will open a file for this. What is your full name?");
          }, 600);
        }, 400);
        setChatState("LEAD_NAME");
        return;
      }
      // User selected an additional service
      const updated = [...(leadData.selectedServices || []), val];
      setLeadData(prev => ({ ...prev, selectedServices: updated }));
      const p = PRICING[val];
      const lbl = p ? p.label : val;
      setTimeout(() => {
        addBotMsg(`Added: ${lbl}. Anything else?`);
        showRemainingServices(updated);
      }, 300);
      return;
    }

    // Service selection (legacy path from AI_CHAT "I am ready to proceed")
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
      const allServices = [
        finalData.service || "General",
        ...(finalData.selectedServices || []).map(s => PRICING[s]?.label || s),
      ].join(", ");
      submitLead.mutate(
        {
          name: finalData.name,
          businessName: finalData.businessName,
          phone: finalData.phone,
          service: allServices,
          context: finalData.context,
        },
        {
          onSuccess: (result) => {
            addBotMsg(`Your file is created. Reference: **${result.ref}**\n\nWe have sent your reference and a guide on how to track your file on our website to your WhatsApp.\n\nTo track anytime, visit our site and click Track.`);
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
          { label: "Track my progress", value: "TRACK" },
          { label: "I need guidance", value: "GUIDANCE" },
          { label: "Contact team", value: "CONTACT_TEAM" },
          { label: "Change language", value: "CHANGE_LANG" },
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
        addBotMsg("Tell me what you need. Be as specific as you like.");
      }, 400);
      setChatState("DIRECT_TELL");
      return;
    }
  }, [chatState, leadData, submitLead, submitAppointment, department]);

  const formatText = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${GOLD}">$1</strong>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${GOLD};text-decoration:underline;">$1</a>`)
      .replace(/\n/g, "<br/>");

  const inputDisabled = chatState === "SUCCESS" || chatState === "SCHEDULE_TIME" || chatState === "DIRECT_PACKAGE";

  /* ══════════════════════════════════════════════════════════════════
     INITIAL VIEW — AWS "Ask" style
     Shown before user has interacted (no user messages yet)
     Layout: colored header band (name + subtitle + input) -> white area (pills + disclaimer)
     ══════════════════════════════════════════════════════════════════ */
  const initialView = (
    <div
      className={
        isControlled
          ? "w-full h-full flex flex-col overflow-hidden"
          : "fixed z-50 flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-[#0A1F1C]/10 inset-x-3 bottom-24 top-auto md:inset-auto md:bottom-24 md:right-4 md:w-[400px]"
      }
      style={isControlled ? {} : {
        backgroundColor: "white",
        maxHeight: "calc(100dvh - 110px)",
        transform: mounted ? "scale(1)" : "scale(0.95)",
        opacity: mounted ? 1 : 0,
        transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
      }}
    >
      {/* ─── Colored header band ─── */}
      <div className="shrink-0 relative" style={{ backgroundColor: persona.color }}>
        {/* Top row: menu, title, minimize */}
        <div className="px-4 pt-3 pb-1 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setMenuOpen(v => !v)} className="text-white/40 hover:text-white/80 p-0.5 transition-colors">
              <MoreVertical size={16} />
            </button>
            <h3 className="font-semibold text-[14px] text-white tracking-wide">
              Ask {persona.name}
            </h3>
          </div>
          <button onClick={close} className="text-white/40 hover:text-white/80 p-1 transition-colors" title="Minimize">
            <Minus size={16} />
          </button>
        </div>

        {/* Subtitle */}
        <p className="px-4 pb-3 text-[12px] text-white/60 leading-snug">
          {persona.subtitle}
        </p>

        {/* Input on colored bg */}
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
              onKeyDown={e => {
                if (e.key === "Enter" && input.trim()) {
                  // Transition to conversation mode
                  addUserMsg(input.trim());
                  setInput("");
                  setChatState("AI_CHAT");
                  handleAIChat(input.trim());
                }
              }}
              placeholder="Ask a question"
              className="flex-1 rounded-full px-4 py-2.5 text-[13px] outline-none border-0"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", caretColor: "white" }}
            />
            <button
              onClick={() => {
                if (input.trim()) {
                  addUserMsg(input.trim());
                  setInput("");
                  setChatState("AI_CHAT");
                  handleAIChat(input.trim());
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-105"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Three-dot menu dropdown */}
        {menuOpen && (
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#0A1F1C]/8 py-1 z-10 min-w-[180px]">
            <button
              onClick={() => {
                setMenuOpen(false);
                const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
                window.open(`https://wa.me/${wa}`, "_blank");
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FAFAF8] transition-colors flex items-center gap-2"
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
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FAFAF8] transition-colors"
              style={{ color: "#DC2626" }}
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>

      {/* ─── White area: typing indicator or greeting + pills ─── */}
      <div className="flex-1 flex flex-col px-5 pt-5 overflow-y-auto" style={{ backgroundColor: "white" }}>
        {showInitTyping ? (
          <div className="flex justify-start mb-3">
            <div className="bg-[#F5F5F5] rounded-2xl rounded-tl-sm">
              <TypingDots color={persona.color} />
            </div>
          </div>
        ) : (
          <>
            {/* Bot greeting message */}
            {messages.filter(m => m.sender === "bot" && m.text).length > 0 && (
              <div className="flex justify-start mb-4">
                <div
                  className="max-w-[85%] px-4 py-3 text-[13px] leading-relaxed rounded-2xl rounded-tl-sm"
                  style={{ backgroundColor: "#F5F5F5", color: "#1D1D1F" }}
                  dangerouslySetInnerHTML={{ __html: formatText(messages.find(m => m.sender === "bot" && m.text)?.text || "") }}
                />
              </div>
            )}

            {/* "Want help getting started?" + pills */}
            <p className="text-[14px] font-semibold mb-1" style={{ color: "#1D1D1F" }}>
              Want help getting started?
            </p>
            <p className="text-[13px] mb-4" style={{ color: "#6B7280" }}>
              Tell us a little about what you are looking for.
            </p>

            {/* 4 vertical pill buttons */}
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Track my progress", value: "TRACK" },
                { label: "I need guidance", value: "GUIDANCE" },
                { label: "Contact team", value: "CONTACT_TEAM" },
                { label: "Change language", value: "CHANGE_LANG" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value, opt.label)}
                  className="w-full text-left px-4 py-3 text-[13px] border rounded-full hover:border-[#C9A97E] hover:bg-[#FAFAF8] transition-all"
                  style={{ borderColor: "rgba(10,31,28,0.12)", color: TEAL }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />
          </>
        )}
      </div>

      {/* ─── Footer disclaimer ─── */}
      <div className="shrink-0 px-5 py-3 border-t border-[#0A1F1C]/5" style={{ backgroundColor: "white" }}>
        <p className="text-center text-[11px]" style={{ color: "#9CA3AF" }}>
          By chatting, you agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">disclaimer</a>.
        </p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════
     CONVERSATION VIEW — after user has interacted
     Fixed size, scrollable messages, input pinned at bottom
     ══════════════════════════════════════════════════════════════════ */
  const conversationView = (
    <div
      className={
        isControlled
          ? "w-full h-full flex flex-col overflow-hidden"
          : "fixed z-50 flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-[#0A1F1C]/10 inset-x-3 bottom-24 top-auto md:inset-auto md:bottom-24 md:right-4 md:w-[400px]"
      }
      style={isControlled ? {} : {
        backgroundColor: "white",
        maxHeight: "calc(100dvh - 110px)",
        transform: mounted ? "scale(1)" : "scale(0.95)",
        opacity: mounted ? 1 : 0,
        transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
      }}
    >
      {/* ─── Header — simplified: name + minimize ─── */}
      <div className="shrink-0 relative" style={{ backgroundColor: persona.color }}>
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setMenuOpen(v => !v)} className="text-white/40 hover:text-white/80 p-0.5 transition-colors">
              <MoreVertical size={16} />
            </button>
            <h3 className="font-semibold text-[14px] text-white tracking-wide">
              Ask {persona.name}
            </h3>
          </div>
          <button onClick={close} className="text-white/40 hover:text-white/80 p-1 transition-colors" title="Minimize">
            <Minus size={16} />
          </button>
        </div>

        {/* Three-dot menu dropdown */}
        {menuOpen && (
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#0A1F1C]/8 py-1 z-10 min-w-[180px]">
            <button
              onClick={() => {
                setMenuOpen(false);
                const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
                window.open(`https://wa.me/${wa}`, "_blank");
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FAFAF8] transition-colors flex items-center gap-2"
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
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FAFAF8] transition-colors"
              style={{ color: "#DC2626" }}
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>

      {/* ─── Scrollable messages area ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#FAFAFA" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.text && (
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-2xl rounded-tr-sm"
                      : "rounded-2xl rounded-tl-sm"
                  }`}
                  style={{
                    backgroundColor: msg.sender === "user" ? persona.color : "white",
                    color: msg.sender === "user" ? "#FAFAF8" : "#1D1D1F",
                    ...(msg.sender === "bot" ? { border: "1px solid rgba(10,31,28,0.06)" } : {}),
                  }}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
              </div>
            )}
            {msg.options && (
              <div className="flex flex-col gap-2 mt-2">
                {msg.options.map((opt, j) => (
                  <button
                    key={j}
                    onClick={() => handleOptionClick(opt.value, opt.label)}
                    className="w-full text-left px-4 py-2.5 text-[13px] border rounded-full hover:border-[#C9A97E] hover:bg-[#FAFAF8] transition-all"
                    style={{ borderColor: "rgba(10,31,28,0.12)", color: TEAL }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white border border-[#0A1F1C]/5">
              <TypingDots color={persona.color} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input pinned at bottom ─── */}
      {!inputDisabled && (
        <div className="px-4 pt-2 pb-3 bg-white border-t border-[#0A1F1C]/5 shrink-0">
          {inputError && <p className="text-[11px] mb-1.5 px-1 text-red-500">{inputError}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={aiLoading ? "Responding..." : "Ask a question"}
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
          <p className="text-center mt-1.5 text-[10px]" style={{ color: "#9CA3AF" }}>
            By chatting, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">terms</a>.
          </p>
        </div>
      )}
    </div>
  );

  // Choose which view to show
  const chatPanel = hasInteracted ? conversationView : initialView;

  // Feedback rating state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const submitFeedback = () => {
    if (feedbackRating === 0) return;
    toast.success(`Thank you for your ${feedbackRating}-star feedback`);
    setFeedbackOpen(false);
    setFeedbackRating(0);
    setFeedbackMsg("");
  };

  return (
    <>
      {/* Teaser bubbles — only when chat is closed */}
      {!isControlled && !isOpen && !teaserDismissed && (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
          {teasers.map((teaser, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg border border-[#0A1F1C]/8 px-4 py-2.5 max-w-[240px] text-[13px] cursor-pointer animate-in slide-in-from-right-2 fade-in duration-300"
              style={{ color: TEAL }}
              onClick={() => { setTeaserDismissed(true); setTeasers([]); setInternalOpen(true); setShowBadge(false); }}
            >
              {teaser}
            </div>
          ))}
        </div>
      )}

      {/* Chat panel */}
      {isOpen && chatPanel}

      {/* Floating buttons — ALWAYS visible (star + chat) */}
      {!isControlled && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
          {/* Feedback star */}
          <button
            onClick={() => setFeedbackOpen(v => !v)}
            className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border"
            style={{ backgroundColor: "white", borderColor: "rgba(10,31,28,0.1)", color: GOLD }}
            title="Rate us"
          >
            <Star size={18} />
          </button>

          {/* Chat button */}
          <button
            onClick={() => {
              if (isOpen) { close(); } else { setInternalOpen(true); setShowBadge(false); setTeaserDismissed(true); setTeasers([]); }
            }}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
            style={{ backgroundColor: persona.color, color: GOLD }}
          >
            {isOpen ? <Minus size={22} /> : <MessageSquare size={22} />}
            {!isOpen && showBadge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
            )}
          </button>
        </div>
      )}

      {/* Feedback popup — 1-5 star rating + message */}
      {feedbackOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#0A1F1C]/10 p-5 w-72">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[14px] font-semibold" style={{ color: TEAL }}>Rate your experience</p>
            <button onClick={() => setFeedbackOpen(false)} className="opacity-40 hover:opacity-100"><X size={16} /></button>
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setFeedbackRating(n)} className="transition-transform hover:scale-110">
                <Star size={28} fill={n <= feedbackRating ? "#C9A97E" : "none"} stroke={n <= feedbackRating ? "#C9A97E" : "#D1D5DB"} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <textarea
            value={feedbackMsg}
            onChange={e => setFeedbackMsg(e.target.value)}
            placeholder="Tell us more (optional)"
            className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none h-20 mb-3"
            style={{ borderColor: "rgba(10,31,28,0.1)", backgroundColor: "#FAFAFA" }}
          />
          <button
            onClick={submitFeedback}
            disabled={feedbackRating === 0}
            className="w-full py-2.5 rounded-full text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: persona.color }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
}
