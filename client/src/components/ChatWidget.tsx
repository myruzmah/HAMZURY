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
  | "TRACK_REF"
  | "REFERRAL_ASK"
  | "REFERRAL_CODE"
  | "REFERRAL_SOURCE"
  | "SCHEDULE_NAME"
  | "SCHEDULE_DATE"
  | "SCHEDULE_TIME"
  | "SCHEDULE_PHONE"
  | "AI_CHAT"
  | "DIRECT_TELL"
  | "DIRECT_PACKAGE"
  | "SELF_SERVICE"
  | "PAYMENT_SHOW"
  | "PAYMENT_CONFIRM"
  | "POSITIONING_GUIDE"
  | "CANT_EXPLAIN"
  | "LANG_INPUT";

type LeadData = {
  service?: string;
  context?: string;
  name?: string;
  businessName?: string;
  phone?: string;
  schedDate?: string;
  schedTime?: string;
  selectedServices?: string[];
  referralCode?: string;
  referrerName?: string;
  referralSourceType?: string;
  notifyCso?: boolean;
  /** Stores the next state to resume after referral capture */
  postReferralState?: ChatState;
};

type Props = {
  department?: Department;
  /** When provided, component is controlled externally (no floating button shown) */
  open?: boolean;
  onClose?: () => void;
};

const TEAL = "#1B4D3E";   // BizDoc leaf green
const GOLD = "#B48C4C";
const CREAM = "#FFFAF6";

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
    name: "HAMZURY Advisor",
    title: "HAMZURY Client Advisor",
    greeting: "Welcome to HAMZURY.\n\nWe help businesses become ready to start, operate, grow, and scale through compliance, systems, and practical training.\n\nWhich language do you prefer?",
    subtitle: "Get helpful guidance on business registration, digital systems, and growth strategies.",
    color: "#2D2D2D",
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
    color: "#2563EB",
  },
  skills: {
    name: "Maryam",
    title: "Skills Advisor",
    greeting: "Welcome to Skills. We train people who want real market ability, not just certificates. What are you looking to learn?",
    subtitle: "Get guidance on bootcamps, digital skills training, and cohort programs.",
    color: "#1E3A5F",
  },
};

const SERVICES: Record<Department, { label: string; value: string }[]> = {
  general: [
    { label: "Business Registration (CAC)", value: "CAC" },
    { label: "Licensing and Permits", value: "License" },
    { label: "Compliance Management", value: "ComplianceMgmt" },
    { label: "Contract/Document Templates", value: "Templates" },
    { label: "Website or Digital Systems", value: "Website" },
    { label: "Social Media Management", value: "SocialMedia" },
    { label: "AI Agent or Automation", value: "AIAgent" },
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
    { label: "Contract/Document Templates", value: "Templates" },
    { label: "Compliance Management Sub", value: "ComplianceMgmt" },
    { label: "Sector Compliance Roadmap", value: "SectorRoadmap" },
  ],
  systemise: [
    { label: "Website Design and Development", value: "Website" },
    { label: "Social Media Management", value: "SocialMedia" },
    { label: "Brand Identity and Positioning", value: "Branding" },
    { label: "Business Automation", value: "Automation" },
    { label: "AI Agent (Custom Bot)", value: "AIAgent" },
    { label: "CRM and Lead Generation", value: "CRM" },
    { label: "Dashboard Build", value: "Dashboard" },
    { label: "Content Strategy and Production", value: "Content" },
    { label: "Support Retainer", value: "Retainer" },
  ],
  skills: [
    { label: "AI Founder Launchpad", value: "AIFounder" },
    { label: "Vibe Coding for Founders", value: "VibeCoding" },
    { label: "AI Sales Operator", value: "AISales" },
    { label: "Service Business in 21 Days", value: "ServiceBiz21" },
    { label: "Operations Automation Sprint", value: "OpsSprint" },
    { label: "AI Marketing and Content Engine", value: "AIMarketing" },
    { label: "Corporate Staff Training", value: "CorporateTraining" },
    { label: "Robotics and Creative Tech Lab", value: "RoboticsLab" },
    { label: "RIDI Sponsorship", value: "RIDI" },
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
  Templates: { label: "Contract/Document Templates", price: "from \u20A615,000", amount: 15000 },
  ComplianceMgmt: { label: "Compliance Management Sub", price: "\u20A650,000/mo", amount: 50000 },
  SectorRoadmap: { label: "Sector Compliance Roadmap", price: "\u20A630,000", amount: 30000 },
  AIAgent: { label: "AI Agent (Custom Bot)", price: "from \u20A6150,000", amount: 150000 },
  Dashboard: { label: "Dashboard Build", price: "from \u20A6200,000", amount: 200000 },
  Retainer: { label: "Support Retainer", price: "from \u20A680,000/mo", amount: 80000 },
  AIFounder: { label: "AI Founder Launchpad", price: "\u20A675,000", amount: 75000 },
  VibeCoding: { label: "Vibe Coding for Founders", price: "\u20A665,000", amount: 65000 },
  AISales: { label: "AI Sales Operator", price: "\u20A655,000", amount: 55000 },
  ServiceBiz21: { label: "Service Business in 21 Days", price: "\u20A645,000", amount: 45000 },
  OpsSprint: { label: "Operations Automation Sprint", price: "\u20A660,000", amount: 60000 },
  AIMarketing: { label: "AI Marketing Engine", price: "\u20A655,000", amount: 55000 },
  CorporateTraining: { label: "Corporate Staff Training", price: "Contact us", amount: 0 },
  RoboticsLab: { label: "Robotics & Creative Tech", price: "\u20A645,000", amount: 45000 },
  RIDI: { label: "RIDI Sponsorship", price: "Sponsored", amount: 0 },
  Training: { label: "Skills Training", price: "from \u20A645,000", amount: 45000 },
  FullBuild: { label: "Full Business Setup", price: "from \u20A6500,000", amount: 500000 },
};

const TEASERS: Record<Department, string[]> = {
  general: [
    "Not sure what your business needs?",
    "We can help you figure it out.",
  ],
  bizdoc: [
    "Documents, licences, compliance — handled.",
    "Tell us your sector and we show you the path.",
  ],
  systemise: [
    "Still doing things manually?",
    "We automate what slows your business down.",
  ],
  skills: [
    "Build real skills that earn.",
    "AI, coding, business — practical training.",
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

  // Auto-capture referral from URL params (e.g. hamzury.com/?ref=AFF-396)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setLeadData(prev => ({ ...prev, referralCode: ref }));
    }
  }, []);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [userLang, setUserLang] = useState("english");
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

  // Bank details for payment step
  const bankQuery = trpc.invoices.bankDetails.useQuery(undefined, { enabled: false });
  const fetchBankDetails = async () => {
    try {
      const data = await trpcUtils.invoices.bankDetails.fetch();
      const acct = department === "bizdoc" && data.bizdoc.configured ? data.bizdoc : data.general;
      if (!acct.configured) return null;
      return acct;
    } catch { return null; }
  };

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

    // Auto-dismiss teasers after 4 seconds of showing
    const t3 = setTimeout(() => {
      setTeasers([]);
      setTeaserDismissed(true);
    }, 10000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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
      const ctx = localStorage.getItem("hamzury-chat-context");
      if (ctx) {
        localStorage.removeItem("hamzury-chat-context");
        // Skip language selection, go straight to AI with context
        setShowInitTyping(true);
        setTimeout(() => {
          setShowInitTyping(false);
          addUserMsg(ctx);
          setChatState("AI_CHAT");
          handleAIChat(ctx);
        }, 800);
      } else {
        showInitialPaths();
      }
    }
    if (!isOpen) { reset(); }
  }, [isOpen]);

  /** Menu labels per language */
  const MENU_LABELS: Record<string, { know: string; need: string; wrong: string; track: string; talk: string }> = {
    english:  { know: "I know what I need", need: "What does my business need?", wrong: "Something feels wrong", track: "Track my file", talk: "Talk to someone" },
    hausa:    { know: "Na san abin da nake bukata", need: "Me kasuwancina ke bukata?", wrong: "Wani abu bai dace ba", track: "Duba fayilina", talk: "Yi magana da mutum" },
    pidgin:   { know: "I know wetin I need", need: "Wetin my business need?", wrong: "Something no dey right", track: "Check my file", talk: "Talk to person" },
    arabic:   { know: "أعرف ما أحتاج", need: "ماذا يحتاج عملي؟", wrong: "شيء ما ليس صحيحاً", track: "تتبع ملفي", talk: "تحدث مع شخص" },
    french:   { know: "Je sais ce qu'il me faut", need: "De quoi mon entreprise a-t-elle besoin?", wrong: "Quelque chose ne va pas", track: "Suivre mon dossier", talk: "Parler à quelqu'un" },
  };

  /** Show main menu in the user's selected language */
  const showMainButtons = (langOverride?: string) => {
    const lang = (langOverride || userLang).toLowerCase();
    const labels = MENU_LABELS[lang] || MENU_LABELS.english;
    addBotOptions([
      { label: labels.know, value: "SELF_SERVICE" },
      { label: labels.need, value: "POSITIONING_GUIDE" },
      { label: labels.wrong, value: "CANT_EXPLAIN" },
      { label: labels.track, value: "TRACK" },
      { label: labels.talk, value: "TALK_HUMAN" },
    ]);
    setChatState("PATHS");
  };

  /** Check for returning client in localStorage */
  const getReturningClient = (): { name?: string; ref?: string; service?: string } | null => {
    try {
      const session = localStorage.getItem("hamzury-client-session");
      if (session) {
        const data = JSON.parse(session);
        if (data.expiresAt && data.expiresAt > Date.now()) return data;
      }
      // Also check lead data from previous chat
      const chatHistory = localStorage.getItem("hamzury-chat-client");
      if (chatHistory) return JSON.parse(chatHistory);
    } catch {}
    return null;
  };

  /** Save client info for next visit */
  const saveClientForReturn = (name: string, ref?: string, service?: string) => {
    try {
      localStorage.setItem("hamzury-chat-client", JSON.stringify({ name, ref, service }));
    } catch {}
  };

  const showInitialPaths = () => {
    setShowInitTyping(true);
    setTimeout(() => {
      setShowInitTyping(false);
      // Check for returning client
      const returning = getReturningClient();
      if (returning?.name) {
        addBotMsg(`Welcome back, ${returning.name}. ${returning.service ? `Last time you were working on ${returning.service}.` : ""}\n\nWhat would you like to do?`);
        addBotOptions([
          { label: "Continue where I left off", value: "TRACK" },
          { label: "Start something new", value: "NEW_CLIENT" },
          { label: "Track my file", value: "TRACK" },
        ]);
        setChatState("PATHS");
      } else {
        addBotMsg(persona.greeting);
        setChatState("LANG_INPUT");
      }
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
    if (chatState === "TRACK_REF") {
      if (text.trim().length < 4) return "Please enter a valid reference or phone number.";
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

    // Add a placeholder bot message that we will update with streaming tokens
    const placeholderIdx = messages.length; // current length = index of next message
    setMessages(prev => [...prev, { sender: "bot", text: "" }]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          history: newHistory.slice(-10).map(h => ({ role: h.role, content: h.content })),
          department,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              // Update the placeholder message in-place
              setMessages(prev => {
                const updated = [...prev];
                // Find the last bot message with empty or partial text (our placeholder)
                for (let i = updated.length - 1; i >= 0; i--) {
                  if (updated[i].sender === "bot" && !updated[i].options) {
                    updated[i] = { ...updated[i], text: fullText };
                    break;
                  }
                }
                return updated;
              });
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      const answer = fullText || "Our team will answer that directly. Start a chat or reach out via the contact options.";
      // Ensure final state
      setMessages(prev => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].sender === "bot" && !updated[i].options) {
            updated[i] = { ...updated[i], text: answer };
            break;
          }
        }
        return updated;
      });
      setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);

      // After 2 exchanges, offer to close the lead
      const userCount = newHistory.filter(m => m.role === "user").length;
      if (userCount >= 2) {
        setTimeout(() => {
          // Check if AI mentioned starting/proceeding — show action buttons
          const lower = answer.toLowerCase();
          if (lower.includes("want me to") || lower.includes("ready to") || lower.includes("set this up") || lower.includes("get started") || lower.includes("open a file") || lower.includes("proceed")) {
            addBotOptions([
              { label: "Yes, let's start", value: "AI_CLOSE_YES" },
              { label: "Tell me more first", value: "AI_CLOSE_MORE" },
              { label: "Book a call instead", value: "SCHEDULE" },
            ]);
          } else {
            addBotOptions([
              { label: "Start my request", value: "AI_CLOSE_YES" },
              { label: "Keep chatting", value: "AI_CLOSE_MORE" },
            ]);
          }
        }, 800);
      }
    } catch {
      // Fallback to non-streaming tRPC endpoint
      try {
        const result = await trpcUtils.ask.answer.fetch({ question: text });
        const answer = result.answer || "Our team will answer that directly.";
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === "bot" && !updated[i].options) {
              updated[i] = { ...updated[i], text: answer };
              break;
            }
          }
          return updated;
        });
        setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);
      } catch {
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === "bot" && !updated[i].options) {
              updated[i] = { ...updated[i], text: "Something went wrong. Please try again or reach us on WhatsApp." };
              break;
            }
          }
          return updated;
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptionClick = (val: string, label: string) => {
    addUserMsg(label);
    processLogic(val);
  };

  const processLogic = useCallback((val: string) => {
    // Language typed by client — store it and show main menu in that language
    if (chatState === "LANG_INPUT") {
      const lang = val.toLowerCase().trim();
      setUserLang(lang);
      const greetings: Record<string, string> = {
        hausa: "Nagode. Yaya zan taimake ka yau?",
        pidgin: "Thank you. How I fit help you today?",
        arabic: "شكرا. كيف يمكنني مساعدتك اليوم؟",
        french: "Merci. Comment puis-je vous aider?",
      };
      const greeting = greetings[lang] || "Great. How can I help you today?";
      setTimeout(() => {
        addBotMsg(greeting);
        showMainButtons(lang);
      }, 400);
      return;
    }

    // From initial paths
    if (chatState === "PATHS") {
      if (val === "NEW_CLIENT") {
        // Returning client wants something new — go to language then menu
        addBotMsg("Which language do you prefer?");
        setChatState("LANG_INPUT");
        return;
      }
      if (val === "TALK_HUMAN") {
        setTimeout(() => {
          addBotMsg("I can connect you with our team. How would you prefer?");
          addBotOptions([
            { label: "WhatsApp now", value: "WHATSAPP_NOW" },
            { label: "Book a call", value: "SCHEDULE" },
          ]);
        }, 400);
        return;
      }
      if (val === "WHATSAPP_NOW") {
        const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
        window.open(`https://wa.me/${wa}`, "_blank");
        return;
      }
      if (val === "TRACK") {
        setTimeout(() => addBotMsg("Enter your reference (e.g. HMZ-26/3-XXXX) or phone number."), 400);
        setChatState("TRACK_REF");
        return;
      }
      if (val === "SELF_SERVICE") {
        // Quick self-service: show service checklist
        setTimeout(() => {
          addBotMsg("Pick the services you need. You can select more than one.");
          const allServices = SERVICES[department].map(s => {
            const p = PRICING[s.value];
            return { label: p ? `${s.label} (${p.price})` : s.label, value: s.value };
          });
          addBotOptions([...allServices, { label: "Something else (type it)", value: "TYPE_SERVICE" }, { label: "Done selecting", value: "DONE_SELECTING" }]);
        }, 400);
        setLeadData(prev => ({ ...prev, selectedServices: [] }));
        setChatState("SELF_SERVICE");
        return;
      }
      if (val === "GUIDANCE" || val === "QUESTION") {
        setTimeout(() => {
          addBotMsg("Tell me about your business and what you need help with.");
        }, 400);
        setChatState("AI_CHAT");
        return;
      }
      if (val === "POSITIONING_GUIDE") {
        setTimeout(() => {
          addBotMsg("I'll help you understand what your business likely needs to operate properly and grow with less confusion. Tell me your business type or sector.");
        }, 400);
        setChatState("AI_CHAT");
        return;
      }
      if (val === "CANT_EXPLAIN") {
        setTimeout(() => {
          addBotMsg("That's okay. You do not need to explain it perfectly. What feels most true right now?");
          addBotOptions([
            { label: "My business feels stuck", value: "STUCK" },
            { label: "Things are scattered", value: "SCATTERED" },
            { label: "I don't know what I need", value: "DONT_KNOW" },
            { label: "I'm losing time", value: "LOSING_TIME" },
            { label: "I need clarity", value: "NEED_CLARITY" },
          ]);
        }, 400);
        setChatState("CANT_EXPLAIN");
        return;
      }
      if (val === "SCHEDULE") {
        setTimeout(() => addBotMsg("What is your name?"), 400);
        setChatState("SCHEDULE_NAME");
        return;
      }
      if (val === "CONTACT_TEAM") {
        const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
        window.open(`https://wa.me/${wa}`, "_blank");
        return;
      }
      // Golden rule: any free text in PATHS goes to AI
      if (!["SELF_SERVICE", "TRACK", "GUIDANCE", "POSITIONING_GUIDE", "CANT_EXPLAIN", "TALK_HUMAN", "WHATSAPP_NOW", "NEW_CLIENT", "SCHEDULE", "DIRECT"].includes(val)) {
        setChatState("AI_CHAT");
        handleAIChat(val);
        return;
      }
    }

    if (chatState === "CANT_EXPLAIN") {
      // User selected a feeling — use it as context for AI chat
      setTimeout(() => {
        addBotMsg("I understand. Let me ask you one thing to help narrow it down. What is frustrating you most right now?");
      }, 400);
      setLeadData(prev => ({ ...prev, context: `Client feeling: ${val}` }));
      setChatState("AI_CHAT");
      return;
    }

    // Self-service flow: tick services from list, then show payment, then lead capture
    if (chatState === "SELF_SERVICE") {
      if (val === "TYPE_SERVICE") {
        setTimeout(() => addBotMsg("Type the service you need and I will add it."), 300);
        setChatState("DIRECT_TELL");
        return;
      }
      if (val === "DONE_SELECTING") {
        const selected = leadData.selectedServices || [];
        if (selected.length === 0) {
          setTimeout(() => addBotMsg("No worries. What is your full name so I can open a file?"), 400);
          setChatState("LEAD_NAME");
          return;
        }
        // Show pricing summary then payment details
        setTimeout(async () => {
          addBotMsg(buildPricingSummary(selected));
          const acct = await fetchBankDetails();
          if (acct) {
            setTimeout(() => {
              addBotMsg(`To proceed, make a transfer to:\n\nBank: ${acct.bankName}\nAccount: ${acct.accountNumber}\nName: ${acct.accountName}\n\nOnce you have paid, tap the button below.`);
              addBotOptions([
                { label: "I have paid", value: "PAID" },
                { label: "I will pay later", value: "PAY_LATER" },
              ]);
              setChatState("PAYMENT_SHOW");
            }, 800);
          } else {
            setTimeout(() => addBotMsg("What is your full name?"), 600);
            setChatState("LEAD_NAME");
          }
        }, 400);
        return;
      }
      // User selected a service — add it and show remaining
      const updated = [...(leadData.selectedServices || []), val];
      setLeadData(prev => ({ ...prev, selectedServices: updated }));
      const p = PRICING[val];
      setTimeout(() => {
        addBotMsg(`Added: ${p?.label || val}. Anything else?`);
        const remaining = SERVICES[department]
          .filter(s => !updated.includes(s.value))
          .map(s => {
            const pr = PRICING[s.value];
            return { label: pr ? `${s.label} (${pr.price})` : s.label, value: s.value };
          });
        addBotOptions([...remaining, { label: "Something else (type it)", value: "TYPE_SERVICE" }, { label: "Done selecting", value: "DONE_SELECTING" }]);
      }, 300);
      return;
    }

    // Payment flow
    if (chatState === "PAYMENT_SHOW") {
      if (val === "PAID") {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [PAYMENT CLAIMED]" }));
        setTimeout(() => addBotMsg("Thanks for paying. What is your full name so I can open your file?"), 400);
        setTimeout(() => addBotMsg("You can also send your payment receipt via WhatsApp to +234 806 714 9356 for faster verification."), 1200);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "PAY_LATER") {
        setTimeout(() => addBotMsg("No problem, you can pay anytime. What is your full name so I can open a file?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
    }

    // Referral is now auto-captured via URL ?ref= parameter only
    // No manual referral flow needed in chat

    // Track by reference or phone
    if (chatState === "TRACK_REF") {
      const trimmed = val.trim();
      // Check if it looks like a reference (contains letters + numbers)
      if (/[A-Za-z]/.test(trimmed) && /\d/.test(trimmed)) {
        // Reference-based tracking
        localStorage.setItem("hamzury-client-session", JSON.stringify({ ref: trimmed, name: "Client", expiresAt: Date.now() + 86400000 }));
        setTimeout(() => {
          addBotMsg("Looking up your reference...");
          setTimeout(() => {
            addBotMsg("Found your records. For full details and real-time updates, visit your dashboard.");
            addBotOptions([
              { label: "View My Dashboard", value: "VIEW_DASHBOARD" },
              { label: "Back to Menu", value: "RESTART" },
            ]);
          }, 800);
        }, 500);
        setChatState("SUCCESS");
        return;
      }
      // Fallback to phone-based tracking
      const digits = trimmed.replace(/\D/g, "");
      if (digits.length >= 10) {
        localStorage.setItem("hamzury-client-session", JSON.stringify({ phone: digits, name: "Client", expiresAt: Date.now() + 86400000 }));
        setTimeout(() => {
          addBotMsg("Looking up your file...");
          setTimeout(() => {
            addBotMsg("Found your records. For full details and real-time updates, visit your dashboard.");
            addBotOptions([
              { label: "View My Dashboard", value: "VIEW_DASHBOARD" },
              { label: "Back to Menu", value: "RESTART" },
            ]);
          }, 800);
        }, 500);
        setChatState("SUCCESS");
        return;
      }
      addBotMsg("Please enter a valid reference (e.g. HMZ-26/3-XXXX) or phone number.");
      return;
    }

    // Continue chat after AI suggestion
    if (val === "CONTINUE_CHAT") {
      setChatState("AI_CHAT");
      return;
    }

    // From AI chat: user is ready to self-service
    // AI closing — user agreed to start
    if (val === "AI_CLOSE_YES") {
      // Get the service context from the AI conversation
      const lastAiMsg = aiMessages.filter(m => m.role === "assistant").pop()?.content || "";
      const inferredService = lastAiMsg.toLowerCase().includes("bizdoc") || lastAiMsg.toLowerCase().includes("compliance") || lastAiMsg.toLowerCase().includes("cac") || lastAiMsg.toLowerCase().includes("registration")
        ? "BizDoc Compliance"
        : lastAiMsg.toLowerCase().includes("systemise") || lastAiMsg.toLowerCase().includes("website") || lastAiMsg.toLowerCase().includes("brand") || lastAiMsg.toLowerCase().includes("automation")
        ? "Systemise Systems"
        : lastAiMsg.toLowerCase().includes("skills") || lastAiMsg.toLowerCase().includes("training") || lastAiMsg.toLowerCase().includes("founder")
        ? "Skills Training"
        : "General Consultation";
      setLeadData(prev => ({ ...prev, service: inferredService, context: aiMessages.map(m => `${m.role}: ${m.content}`).slice(-4).join("\n") }));
      // Skip name if already given
      if (leadData.name) {
        setTimeout(() => addBotMsg(`Got it, ${leadData.name.split(" ")[0]}. What is your business name?`), 400);
        setChatState("LEAD_BIZ");
      } else {
        setTimeout(() => addBotMsg("Let me get your details. What is your full name?"), 400);
        setChatState("LEAD_NAME");
      }
      return;
    }

    // AI closing — user wants more info
    if (val === "AI_CLOSE_MORE") {
      setChatState("AI_CHAT");
      return;
    }

    if (val === "SELF_SERVICE_FROM_CHAT") {
      setTimeout(() => {
        addBotMsg("Pick the services you need.");
        const allServices = SERVICES[department].map(s => {
          const p = PRICING[s.value];
          return { label: p ? `${s.label} (${p.price})` : s.label, value: s.value };
        });
        addBotOptions([...allServices, { label: "Something else (type it)", value: "TYPE_SERVICE" }, { label: "Done selecting", value: "DONE_SELECTING" }]);
      }, 400);
      setLeadData(prev => ({ ...prev, selectedServices: [] }));
      setChatState("SELF_SERVICE");
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
        setTimeout(async () => {
          addBotMsg(buildPricingSummary(selected));
          const acct = await fetchBankDetails();
          if (acct) {
            setTimeout(() => {
              addBotMsg(`To proceed, make a transfer to:\n\nBank: ${acct.bankName}\nAccount: ${acct.accountNumber}\nName: ${acct.accountName}\n\nOnce you have paid, tap the button below.`);
              addBotOptions([
                { label: "I have paid", value: "PAID" },
                { label: "I will pay later", value: "PAY_LATER" },
              ]);
              setChatState("PAYMENT_SHOW");
            }, 800);
          } else {
            setTimeout(() => addBotMsg("What is your full name?"), 600);
            setChatState("LEAD_NAME");
          }
        }, 400);
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
          referralCode: leadData.referralCode,
          referrerName: leadData.referrerName,
          referralSourceType: leadData.referralSourceType,
          notifyCso: leadData.notifyCso,
        },
        {
          onSuccess: (result) => {
            const hasPaid = (finalData.context || "").includes("[PAYMENT CLAIMED]");
            if (hasPaid) {
              addBotMsg(`Your file is created. Reference: **${result.ref}**\n\nSave this reference to track your progress anytime on our website.`);
            } else {
              addBotMsg(`Your request has been received. Our team will review it and reach out to you shortly.\n\nOnce payment is confirmed, you will receive your tracking reference.`);
            }
            saveClientForReturn(finalData.name, hasPaid ? result.ref : undefined, allServices);
            addBotOptions([
              { label: "Ask another question", value: "RESTART" },
              { label: "Make payment now", value: "SHOW_PAYMENT_DETAILS" },
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

    if (val === "SHOW_PAYMENT_DETAILS") {
      (async () => {
        const acct = await fetchBankDetails();
        if (acct) {
          addBotMsg(`Transfer to:\n\nBank: ${acct.bankName}\nAccount: ${acct.accountNumber}\nName: ${acct.accountName}\n\nOnce paid, your tracking reference will be sent to you.`);
          addBotOptions([
            { label: "I have paid", value: "LATE_PAYMENT_CLAIM" },
            { label: "Back to menu", value: "RESTART" },
          ]);
        } else {
          addBotMsg("Contact our finance team on WhatsApp: +234 806 714 9356 to complete payment.");
          addBotOptions([{ label: "Back to menu", value: "RESTART" }]);
        }
      })();
      return;
    }

    if (val === "LATE_PAYMENT_CLAIM") {
      addBotMsg("Payment noted. Our team will verify and send your tracking reference shortly. You can also send your receipt via WhatsApp to +234 806 714 9356.");
      addBotOptions([{ label: "Back to menu", value: "RESTART" }]);
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
      setTimeout(() => showMainButtons(), 300);
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
          : "fixed z-50 flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-[#1A1A1A]/10 inset-x-3 bottom-24 top-auto md:inset-auto md:bottom-24 md:right-4 md:w-[400px]"
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
                  // If in language input, process language then show menu
                  if (chatState === "LANG_INPUT") {
                    addUserMsg(input.trim());
                    setInput("");
                    processLogic(input.trim());
                  } else {
                    // Transition to conversation mode
                    addUserMsg(input.trim());
                    setInput("");
                    setChatState("AI_CHAT");
                    handleAIChat(input.trim());
                  }
                }
              }}
              placeholder={chatState === "LANG_INPUT" ? "Type your language" : "Ask a question"}
              className="flex-1 rounded-full px-4 py-2.5 text-[13px] outline-none border-0"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", caretColor: "white" }}
            />
            <button
              onClick={() => {
                if (input.trim()) {
                  if (chatState === "LANG_INPUT") {
                    addUserMsg(input.trim());
                    setInput("");
                    processLogic(input.trim());
                  } else {
                    addUserMsg(input.trim());
                    setInput("");
                    setChatState("AI_CHAT");
                    handleAIChat(input.trim());
                  }
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
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#1A1A1A]/8 py-1 z-10 min-w-[180px]">
            <button
              onClick={() => {
                setMenuOpen(false);
                const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
                window.open(`https://wa.me/${wa}`, "_blank");
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors flex items-center gap-2"
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
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors"
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
                  style={{ backgroundColor: "#F5F5F5", color: "#1A1A1A" }}
                  dangerouslySetInnerHTML={{ __html: formatText(messages.find(m => m.sender === "bot" && m.text)?.text || "") }}
                />
              </div>
            )}

            {/* Language prompt — client types freely */}
            <p className="text-[14px] font-semibold mb-1" style={{ color: "#1A1A1A" }}>
              Type your preferred language
            </p>
            <p className="text-[13px] mb-4" style={{ color: "#6B7280" }}>
              e.g. English, Hausa, Pidgin, Arabic, French
            </p>

            {/* Spacer */}
            <div className="flex-1" />
          </>
        )}
      </div>

      {/* ─── Footer disclaimer ─── */}
      <div className="shrink-0 px-5 py-3 border-t border-[#1A1A1A]/5" style={{ backgroundColor: "white" }}>
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
          : "fixed z-50 flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-[#1A1A1A]/10 inset-x-3 bottom-24 top-auto md:inset-auto md:bottom-24 md:right-4 md:w-[400px]"
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
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#1A1A1A]/8 py-1 z-10 min-w-[180px]">
            <button
              onClick={() => {
                setMenuOpen(false);
                const wa = department === "bizdoc" ? "2348067149356" : "2349130700056";
                window.open(`https://wa.me/${wa}`, "_blank");
              }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors flex items-center gap-2"
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
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors"
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
                    color: msg.sender === "user" ? "#FFFAF6" : "#1A1A1A",
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
                    className="w-full text-left px-4 py-2.5 text-[13px] border rounded-full hover:border-[#B48C4C] hover:bg-[#FFFAF6] transition-all"
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
            <div className="rounded-2xl rounded-tl-sm bg-white border border-[#1A1A1A]/5">
              <TypingDots color={persona.color} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input pinned at bottom ─── */}
      {!inputDisabled && (
        <div className="px-4 pt-2 pb-3 bg-white border-t border-[#1A1A1A]/5 shrink-0">
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
              className="bg-white rounded-xl shadow-lg border border-[#1A1A1A]/8 px-4 py-2.5 max-w-[240px] text-[13px] cursor-pointer animate-in slide-in-from-right-2 fade-in duration-300"
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
            data-chat-trigger
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
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#1A1A1A]/10 p-5 w-72">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[14px] font-semibold" style={{ color: TEAL }}>Rate your experience</p>
            <button onClick={() => setFeedbackOpen(false)} className="opacity-40 hover:opacity-100"><X size={16} /></button>
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setFeedbackRating(n)} className="transition-transform hover:scale-110">
                <Star size={28} fill={n <= feedbackRating ? "#B48C4C" : "none"} stroke={n <= feedbackRating ? "#B48C4C" : "#D1D5DB"} strokeWidth={1.5} />
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
