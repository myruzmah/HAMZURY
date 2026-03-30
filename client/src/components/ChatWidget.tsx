import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, MoreVertical, Phone, Star, Minus, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════
   HAMZURY v7 CHAT WIDGET
   One calm, human, premium advisor. Not a menu machine. Not three bots.
   ═══════════════════════════════════════════════════════════════════════ */

type Department = "general" | "bizdoc" | "systemise" | "skills";

type ChatMessage = {
  sender: "bot" | "user";
  text?: string;
  buttons?: { label: string; value: string }[];
};

type ChatState =
  | "INIT"
  | "LANG_SELECT"
  | "MAIN_MENU"
  | "AI_CHAT"
  | "START_REQUEST"
  | "TRACK_REF"
  | "HELP_CHOOSE"
  | "POSITIONING"
  | "CANT_EXPLAIN"
  | "SPECIFIC_SERVICE"
  | "SPECIFIC_DEPT"
  | "SPECIFIC_SELECT"
  | "LEAD_NAME"
  | "LEAD_BIZ"
  | "LEAD_PHONE"
  | "PAYMENT_STAGE"
  | "SCHEDULE_NAME"
  | "SCHEDULE_DATE"
  | "SCHEDULE_TIME"
  | "SCHEDULE_PHONE"
  | "SUCCESS";

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
  department?: string;
};

type Props = {
  department?: Department;
  /** Controlled mode — no floating button */
  open?: boolean;
  onClose?: () => void;
  /** Dashboard mode — show dashboard-specific buttons and tone preference */
  isDashboard?: boolean;
};

/* ── Brand constants ── */
const CHARCOAL = "#2D2D2D";
const GOLD = "#B48C4C";
const CREAM = "#FFFAF6";
const DARK = "#1A1A1A";

/* ── Service catalog with pricing ── */
const SERVICES: Record<string, { label: string; value: string; price: string; amount: number }[]> = {
  bizdoc: [
    { label: "CAC Registration", value: "CAC", price: "₦50,000", amount: 50000 },
    { label: "Industry License or Permit", value: "License", price: "₦80,000", amount: 80000 },
    { label: "Tax Compliance (TIN/TCC)", value: "Tax", price: "₦60,000", amount: 60000 },
    { label: "Legal Documentation", value: "Legal", price: "from ₦40,000", amount: 40000 },
    { label: "Annual Returns", value: "AnnualReturns", price: "₦30,000", amount: 30000 },
    { label: "Trademark & IP", value: "Trademark", price: "₦75,000", amount: 75000 },
    { label: "Foreign Business Registration", value: "Foreign", price: "₦150,000", amount: 150000 },
    { label: "SCUML Registration", value: "SCUML", price: "₦45,000", amount: 45000 },
    { label: "Contract/Document Templates", value: "Templates", price: "from ₦15,000", amount: 15000 },
    { label: "Compliance Management Sub", value: "ComplianceMgmt", price: "₦50,000/mo", amount: 50000 },
    { label: "Sector Compliance Roadmap", value: "SectorRoadmap", price: "₦30,000", amount: 30000 },
  ],
  systemise: [
    { label: "Website Design & Development", value: "Website", price: "from ₦200,000", amount: 200000 },
    { label: "Social Media Management", value: "SocialMedia", price: "₦100,000/mo", amount: 100000 },
    { label: "Brand Identity", value: "Branding", price: "from ₦150,000", amount: 150000 },
    { label: "Business Automation", value: "Automation", price: "from ₦120,000", amount: 120000 },
    { label: "AI Agent (Custom)", value: "AIAgent", price: "from ₦150,000", amount: 150000 },
    { label: "CRM & Lead Generation", value: "CRM", price: "from ₦180,000", amount: 180000 },
    { label: "Dashboard Build", value: "Dashboard", price: "from ₦200,000", amount: 200000 },
    { label: "Support Retainer", value: "Retainer", price: "from ₦80,000/mo", amount: 80000 },
  ],
  skills: [
    { label: "AI Founder Launchpad", value: "AIFounder", price: "₦75,000", amount: 75000 },
    { label: "Vibe Coding for Founders", value: "VibeCoding", price: "₦65,000", amount: 65000 },
    { label: "AI Sales Operator", value: "AISales", price: "₦55,000", amount: 55000 },
    { label: "Service Business in 21 Days", value: "ServiceBiz21", price: "₦45,000", amount: 45000 },
    { label: "Operations Automation Sprint", value: "OpsSprint", price: "₦60,000", amount: 60000 },
    { label: "AI Marketing Engine", value: "AIMarketing", price: "₦55,000", amount: 55000 },
    { label: "Corporate Staff Training", value: "CorporateTraining", price: "Contact us", amount: 0 },
    { label: "Robotics & Creative Tech", value: "RoboticsLab", price: "₦45,000", amount: 45000 },
    { label: "RIDI Sponsorship", value: "RIDI", price: "Sponsored", amount: 0 },
  ],
};

/* ── Payment accounts ── */
const PAYMENT_ACCOUNTS = {
  general: { bank: "Moniepoint", name: "Hamzury Ltd.", number: "8034620520" },
  bizdoc: { bank: "Moniepoint", name: "BIZDOC LTD", number: "8067149356" },
};

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: CHARCOAL,
            opacity: 0.5,
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes typingBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-4px);opacity:0.8} }`}</style>
    </div>
  );
}

export default function ChatWidget({ department = "general", open: externalOpen, onClose, isDashboard }: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isOpen = isControlled ? externalOpen : internalOpen;

  const close = () => {
    if (isControlled) { setMounted(false); setTimeout(() => onClose?.(), 300); }
    else { setMounted(false); setTimeout(() => setInternalOpen(false), 300); }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatState, setChatState] = useState<ChatState>("INIT");
  const [leadData, setLeadData] = useState<LeadData>({});
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [userLang, setUserLang] = useState("English");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dashboard tone preference
  const [tonePreference, setTonePreference] = useState("Professional");

  // Silent referral capture from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const source = params.get("source");
    const owner = params.get("lead_owner");
    if (ref) setLeadData(prev => ({ ...prev, referralCode: ref, referrerName: params.get("referrer") || undefined, referralSourceType: source || undefined, notifyCso: source === "CSO" }));
  }, []);

  const submitLead = trpc.leads.submit.useMutation({ onError: () => toast.error("Failed to submit. Please try again.") });
  const submitAppointment = trpc.systemise.submitAppointment.useMutation({ onError: () => toast.error("Scheduling failed.") });
  const trpcUtils = trpc.useUtils();

  // Animations
  useEffect(() => { if (isOpen) { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); } }, [isOpen]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const reset = useCallback(() => {
    setMessages([]); setChatState("INIT"); setLeadData(prev => ({ referralCode: prev.referralCode, referrerName: prev.referrerName, referralSourceType: prev.referralSourceType, notifyCso: prev.notifyCso }));
    setInput(""); setInputError(""); setAiMessages([]);
  }, []);

  // Show initial flow on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Check for context passed from portal pages
      const ctx = localStorage.getItem("hamzury-chat-context");
      if (ctx) {
        localStorage.removeItem("hamzury-chat-context");
        addBotMsg(ctx);
        setChatState("AI_CHAT");
        handleAIChat(ctx);
        return;
      }
      // Check for returning client
      const session = loadClientSession();
      if (session?.name) {
        addBotMsg(`Welcome back, ${session.name}. How can I help you today?`);
        showMainMenu();
        return;
      }
      // v7 opening: welcome + language buttons
      addBotMsg("Welcome to HAMZURY.\n\nWe help businesses become ready to start, operate, grow, and scale through compliance, systems, and practical training.\n\nBefore we continue, which language would you prefer?");
      addBotButtons([
        { label: "English", value: "English" },
        { label: "Pidgin", value: "Pidgin" },
        { label: "Arabic", value: "Arabic" },
        { label: "French", value: "French" },
      ]);
      setChatState("LANG_SELECT");
    }
    if (!isOpen) reset();
  }, [isOpen]);

  /* ── Helpers ── */
  const addBotMsg = (text: string) => setMessages(prev => [...prev, { sender: "bot", text }]);
  const addUserMsg = (text: string) => setMessages(prev => [...prev, { sender: "user", text }]);
  const addBotButtons = (btns: { label: string; value: string }[]) => setMessages(prev => [...prev, { sender: "bot", buttons: btns }]);

  function loadClientSession() {
    try {
      const raw = localStorage.getItem("hamzury-client-session");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) { localStorage.removeItem("hamzury-client-session"); return null; }
      return parsed;
    } catch { return null; }
  }

  function showMainMenu() {
    if (isDashboard) {
      addBotButtons([
        { label: "View updates", value: "DASH_UPDATES" },
        { label: "Continue my request", value: "DASH_CONTINUE" },
        { label: "Upload what you need", value: "DASH_UPLOAD" },
        { label: "Ask about this case", value: "AI_CHAT" },
        { label: "See recommended next service", value: "DASH_UPSELL" },
        { label: "Talk to support", value: "TALK_SUPPORT" },
      ]);
    } else {
      addBotButtons([
        { label: "Start a request", value: "START_REQUEST" },
        { label: "Track my work", value: "TRACK_MY_WORK" },
        { label: "Help me choose", value: "HELP_CHOOSE" },
        { label: "Positioning Guide", value: "POSITIONING" },
        { label: "I can't explain my problem", value: "CANT_EXPLAIN" },
        { label: "I came for a specific service", value: "SPECIFIC_SERVICE" },
      ]);
    }
    setChatState("MAIN_MENU");
  }

  function buildPricingSummary(services: string[], dept: string): string {
    const catalog = SERVICES[dept] || SERVICES.bizdoc;
    const lines = services.map(s => {
      const item = catalog.find(c => c.value === s);
      return item ? `${item.label}: ${item.price}` : s;
    });
    const total = services.reduce((sum, s) => {
      const item = catalog.find(c => c.value === s);
      return sum + (item?.amount || 0);
    }, 0);
    const hasCustom = services.some(s => { const item = catalog.find(c => c.value === s); return !item || item.amount === 0; });
    const totalLine = hasCustom
      ? `Estimated total: ₦${total.toLocaleString()} (plus items requiring a custom quote)`
      : `Estimated total: ₦${total.toLocaleString()}`;
    return `Here is your package summary:\n\n${lines.join("\n")}\n\n${totalLine}\n\nThis is an estimate. Final pricing depends on your specific requirements.`;
  }

  /* ── AI Chat via streaming ── */
  const handleAIChat = async (text: string) => {
    setAiLoading(true);
    const newHistory = [...aiMessages, { role: "user", content: text }];
    setAiMessages(newHistory);
    setMessages(prev => [...prev, { sender: "bot", text: "" }]);

    const endpoint = isDashboard ? "/api/chat/dashboard-message" : "/api/chat/message";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newHistory.slice(-10).map(h => ({ role: h.role, content: h.content })),
          department,
          language: userLang,
          tone_preference: isDashboard ? tonePreference : undefined,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              setMessages(prev => {
                const updated = [...prev];
                for (let i = updated.length - 1; i >= 0; i--) {
                  if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: fullText }; break; }
                }
                return updated;
              });
            }
          } catch {}
        }
      }

      const answer = fullText || "Our team will answer that directly. Let me connect you.";
      setMessages(prev => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: answer }; break; }
        }
        return updated;
      });
      setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);

      // After 2 exchanges, offer action buttons
      const userCount = newHistory.filter(m => m.role === "user").length;
      if (userCount >= 2) {
        const lower = answer.toLowerCase();
        setTimeout(() => {
          if (lower.includes("want me to") || lower.includes("ready to") || lower.includes("set this up") || lower.includes("get started") || lower.includes("proceed")) {
            addBotButtons([
              { label: "Yes, let's start", value: "AI_CLOSE_YES" },
              { label: "Tell me more first", value: "AI_CLOSE_MORE" },
              { label: "Book a call instead", value: "SCHEDULE" },
            ]);
          } else {
            addBotButtons([
              { label: "Start my request", value: "AI_CLOSE_YES" },
              { label: "Keep chatting", value: "AI_CLOSE_MORE" },
            ]);
          }
        }, 600);
      }
    } catch {
      try {
        const result = await trpcUtils.ask.answer.fetch({ question: text });
        const answer = result.answer || "Our team will answer that directly.";
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: answer }; break; }
          }
          return updated;
        });
        setAiMessages(prev => [...prev, { role: "assistant", content: answer }]);
      } catch {
        setMessages(prev => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].sender === "bot" && !updated[i].buttons) { updated[i] = { ...updated[i], text: "Something went wrong. Please try again." }; break; }
          }
          return updated;
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Input handler ── */
  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInputError("");
    addUserMsg(text);
    setInput("");

    if (chatState === "AI_CHAT" || chatState === "START_REQUEST" || chatState === "POSITIONING" || chatState === "CANT_EXPLAIN" || chatState === "HELP_CHOOSE") {
      handleAIChat(text);
      return;
    }
    processInput(text);
  };

  /* ── Button click ── */
  const handleButtonClick = (val: string, label: string) => {
    addUserMsg(label);
    processInput(val);
  };

  /* ── Core logic router ── */
  const processInput = useCallback((val: string) => {
    // Language selection
    if (chatState === "LANG_SELECT") {
      setUserLang(val);
      setTimeout(() => {
        addBotMsg("Great. Tell me what you need help with, and I will guide you to the right next step.");
        showMainMenu();
      }, 400);
      return;
    }

    // Main menu selections
    if (chatState === "MAIN_MENU") {
      if (val === "START_REQUEST") {
        setTimeout(() => addBotMsg("Let us start simply. Tell me what you need help with right now."), 400);
        setChatState("AI_CHAT");
        return;
      }
      if (val === "TRACK_MY_WORK") {
        setTimeout(() => addBotMsg("Enter your reference number to continue.\n\nExample: HMZ-26/3-1042"), 400);
        setChatState("TRACK_REF");
        return;
      }
      if (val === "HELP_CHOOSE") {
        setTimeout(() => {
          addBotMsg("I will help you choose the right path. Which of these feels closest to what you need?");
          addBotButtons([
            { label: "Compliance or documents", value: "CHOOSE_BIZDOC" },
            { label: "Brand, website, systems, or automation", value: "CHOOSE_SYSTEMISE" },
            { label: "Training or team capability", value: "CHOOSE_SKILLS" },
            { label: "I need full business clarity", value: "CHOOSE_CLARITY" },
          ]);
        }, 400);
        setChatState("HELP_CHOOSE");
        return;
      }
      if (val === "POSITIONING") {
        setTimeout(() => addBotMsg("Good choice. I will help you understand what your business likely needs to operate properly, reduce risk, and grow with less confusion.\n\nTell me your business type or sector first."), 400);
        setChatState("AI_CHAT");
        return;
      }
      if (val === "CANT_EXPLAIN") {
        setTimeout(() => {
          addBotMsg("That is okay. You do not need to explain it perfectly. I will help you figure it out step by step.\n\nWhat feels most true right now?");
          addBotButtons([
            { label: "My business feels stuck", value: "STUCK" },
            { label: "Things are scattered", value: "SCATTERED" },
            { label: "I do not know what I need", value: "DONT_KNOW" },
            { label: "I am losing time", value: "LOSING_TIME" },
            { label: "I am losing opportunities", value: "LOSING_OPP" },
            { label: "I need clarity", value: "NEED_CLARITY" },
          ]);
        }, 400);
        setChatState("CANT_EXPLAIN");
        return;
      }
      if (val === "SPECIFIC_SERVICE") {
        setTimeout(() => {
          addBotMsg("Already know what you want? Choose your department and I will guide you.");
          addBotButtons([
            { label: "BizDoc services", value: "DEPT_BIZDOC" },
            { label: "Systemise services", value: "DEPT_SYSTEMISE" },
            { label: "Skills programs", value: "DEPT_SKILLS" },
          ]);
        }, 400);
        setChatState("SPECIFIC_DEPT");
        return;
      }
      // Dashboard-specific
      if (val === "DASH_UPDATES" || val === "DASH_CONTINUE" || val === "DASH_UPSELL" || val === "DASH_UPLOAD") {
        setChatState("AI_CHAT");
        handleAIChat(val === "DASH_UPDATES" ? "Show me my latest updates" : val === "DASH_CONTINUE" ? "I want to continue my request" : val === "DASH_UPSELL" ? "What service should I consider next?" : "I need to upload something");
        return;
      }
      if (val === "TALK_SUPPORT") {
        window.open("https://wa.me/2349130700056", "_blank");
        return;
      }
      // Free text in main menu → AI chat
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // Help me choose sub-buttons
    if (chatState === "HELP_CHOOSE") {
      const contextMap: Record<string, string> = {
        CHOOSE_BIZDOC: "The user needs compliance, registration, or documentation help. Guide them through BizDoc services.",
        CHOOSE_SYSTEMISE: "The user needs brand, website, systems, or automation help. Guide them through Systemise services.",
        CHOOSE_SKILLS: "The user needs training or team capability building. Guide them through Skills programs.",
        CHOOSE_CLARITY: "The user needs full business clarity. Use the positioning guide approach to diagnose what they need.",
      };
      if (contextMap[val]) {
        setChatState("AI_CHAT");
        handleAIChat(contextMap[val]);
        return;
      }
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // Can't explain sub-buttons
    if (chatState === "CANT_EXPLAIN") {
      setLeadData(prev => ({ ...prev, context: `Client feeling: ${val}` }));
      setTimeout(() => addBotMsg("I understand. Let me ask you one thing. What is frustrating you most right now?"), 400);
      setChatState("AI_CHAT");
      return;
    }

    // Track by reference only (v7 rule: no phone tracking)
    if (chatState === "TRACK_REF") {
      const trimmed = val.trim();
      if (trimmed.length < 4) { addBotMsg("Please enter a valid reference number. Example: HMZ-26/3-1042"); return; }
      localStorage.setItem("hamzury-client-session", JSON.stringify({ ref: trimmed, name: "Client", expiresAt: Date.now() + 86400000 }));
      setTimeout(() => {
        addBotMsg("Looking up your reference...");
        setTimeout(() => {
          addBotMsg("Found your records. For full details and real-time updates, visit your dashboard.");
          addBotButtons([
            { label: "View My Dashboard", value: "VIEW_DASHBOARD" },
            { label: "Back to Menu", value: "RESTART" },
          ]);
        }, 800);
      }, 500);
      setChatState("SUCCESS");
      return;
    }

    // Specific service: department selection
    if (chatState === "SPECIFIC_DEPT") {
      const deptMap: Record<string, string> = { DEPT_BIZDOC: "bizdoc", DEPT_SYSTEMISE: "systemise", DEPT_SKILLS: "skills" };
      const dept = deptMap[val];
      if (dept) {
        setLeadData(prev => ({ ...prev, department: dept, selectedServices: [] }));
        const catalog = SERVICES[dept] || [];
        setTimeout(() => {
          addBotMsg("Pick the services you need. You can select more than one.");
          addBotButtons([
            ...catalog.map(s => ({ label: `${s.label} (${s.price})`, value: s.value })),
            { label: "Done selecting", value: "DONE_SELECTING" },
          ]);
        }, 400);
        setChatState("SPECIFIC_SELECT");
        return;
      }
      setChatState("AI_CHAT");
      handleAIChat(val);
      return;
    }

    // Specific service: multi-select
    if (chatState === "SPECIFIC_SELECT") {
      if (val === "DONE_SELECTING") {
        const selected = leadData.selectedServices || [];
        const dept = leadData.department || "bizdoc";
        if (selected.length === 0) {
          setTimeout(() => addBotMsg("No worries. What is your full name so I can open a file?"), 400);
          setChatState("LEAD_NAME");
          return;
        }
        setTimeout(() => {
          addBotMsg(buildPricingSummary(selected, dept));
          // Show payment
          const acct = dept === "bizdoc" ? PAYMENT_ACCOUNTS.bizdoc : PAYMENT_ACCOUNTS.general;
          setTimeout(() => {
            addBotMsg(`To proceed, transfer to:\n\nBank: ${acct.bank}\nAccount: ${acct.number}\nName: ${acct.name}\n\nOnce paid, tap below.`);
            addBotButtons([
              { label: "I've made payment", value: "PAID" },
              { label: "I will pay later", value: "PAY_LATER" },
              { label: "Upload receipt", value: "UPLOAD_RECEIPT" },
              { label: "Talk to finance", value: "TALK_FINANCE" },
            ]);
            setChatState("PAYMENT_STAGE");
          }, 800);
        }, 400);
        return;
      }
      // Add service to selection
      const updated = [...(leadData.selectedServices || []), val];
      setLeadData(prev => ({ ...prev, selectedServices: updated }));
      const dept = leadData.department || "bizdoc";
      const catalog = SERVICES[dept] || [];
      const item = catalog.find(s => s.value === val);
      setTimeout(() => {
        addBotMsg(`Added: ${item?.label || val}. Anything else?`);
        const remaining = catalog.filter(s => !updated.includes(s.value));
        addBotButtons([
          ...remaining.map(s => ({ label: `${s.label} (${s.price})`, value: s.value })),
          { label: "Done selecting", value: "DONE_SELECTING" },
        ]);
      }, 300);
      return;
    }

    // Payment stage
    if (chatState === "PAYMENT_STAGE") {
      if (val === "PAID") {
        setLeadData(prev => ({ ...prev, context: (prev.context || "") + " [PAYMENT CLAIMED]" }));
        setTimeout(() => addBotMsg("Thanks for paying. What is your full name so I can open your file?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "PAY_LATER" || val === "Continue after payment") {
        setTimeout(() => addBotMsg("No problem, you can pay anytime. What is your full name so I can open a file?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "UPLOAD_RECEIPT") {
        setTimeout(() => addBotMsg("Please send your payment receipt via WhatsApp to +234 806 714 9356 for faster verification. What is your full name?"), 400);
        setChatState("LEAD_NAME");
        return;
      }
      if (val === "TALK_FINANCE") {
        window.open("https://wa.me/2348067149356", "_blank");
        return;
      }
    }

    // AI close actions
    if (val === "AI_CLOSE_YES") {
      const lastAi = aiMessages.filter(m => m.role === "assistant").pop()?.content || "";
      const inferredService = lastAi.toLowerCase().includes("bizdoc") || lastAi.toLowerCase().includes("compliance") || lastAi.toLowerCase().includes("cac")
        ? "BizDoc Compliance"
        : lastAi.toLowerCase().includes("systemise") || lastAi.toLowerCase().includes("website") || lastAi.toLowerCase().includes("brand")
        ? "Systemise Systems"
        : lastAi.toLowerCase().includes("skills") || lastAi.toLowerCase().includes("training")
        ? "Skills Training"
        : "General Consultation";
      setLeadData(prev => ({ ...prev, service: inferredService, context: aiMessages.map(m => `${m.role}: ${m.content}`).slice(-4).join("\n") }));
      if (leadData.name) {
        setTimeout(() => addBotMsg(`Got it, ${leadData.name!.split(" ")[0]}. What is your business name?`), 400);
        setChatState("LEAD_BIZ");
      } else {
        setTimeout(() => addBotMsg("Let me get your details. What is your full name?"), 400);
        setChatState("LEAD_NAME");
      }
      return;
    }
    if (val === "AI_CLOSE_MORE") { setChatState("AI_CHAT"); return; }

    // Schedule flow
    if (val === "SCHEDULE") {
      setTimeout(() => addBotMsg("Let me get you scheduled. What is your name?"), 400);
      setChatState("SCHEDULE_NAME");
      return;
    }
    if (chatState === "SCHEDULE_NAME") {
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => addBotMsg(`Nice to meet you, ${val.split(" ")[0]}. What date works best?`), 400);
      setChatState("SCHEDULE_DATE");
      return;
    }
    if (chatState === "SCHEDULE_DATE") {
      setLeadData(prev => ({ ...prev, schedDate: val }));
      setTimeout(() => {
        addBotMsg("And your preferred time?");
        addBotButtons([
          { label: "Morning (9am-12pm)", value: "9am-12pm" },
          { label: "Afternoon (12pm-4pm)", value: "12pm-4pm" },
          { label: "Evening (4pm-7pm)", value: "4pm-7pm" },
        ]);
      }, 400);
      setChatState("SCHEDULE_TIME");
      return;
    }
    if (chatState === "SCHEDULE_TIME") {
      setLeadData(prev => ({ ...prev, schedTime: val }));
      setTimeout(() => addBotMsg("Lastly, what is your WhatsApp number so we can confirm?"), 400);
      setChatState("SCHEDULE_PHONE");
      return;
    }
    if (chatState === "SCHEDULE_PHONE") {
      const finalData = { ...leadData, phone: val };
      submitAppointment.mutate(
        { clientName: finalData.name || "Client", phone: val, preferredDate: finalData.schedDate || "", preferredTime: finalData.schedTime || "" },
        {
          onSuccess: () => {
            addBotMsg(`Scheduled. A team member will call you on ${finalData.schedDate} during ${finalData.schedTime}.`);
            addBotButtons([{ label: "Back to Menu", value: "RESTART" }]);
            setChatState("SUCCESS");
          },
        }
      );
      return;
    }

    // Lead capture
    if (chatState === "LEAD_NAME") {
      if (val.trim().length < 2) { setInputError("Please enter your full name."); return; }
      setLeadData(prev => ({ ...prev, name: val }));
      setTimeout(() => addBotMsg(`Thanks, ${val.split(" ")[0]}. What is the name of your business?`), 400);
      setChatState("LEAD_BIZ");
      return;
    }
    if (chatState === "LEAD_BIZ") {
      setLeadData(prev => ({ ...prev, businessName: val }));
      setTimeout(() => addBotMsg("And your best WhatsApp or phone number?"), 400);
      setChatState("LEAD_PHONE");
      return;
    }
    if (chatState === "LEAD_PHONE") {
      const digits = val.replace(/\D/g, "");
      if (digits.length < 7) { setInputError("Please enter a valid phone number."); return; }
      const finalData = { ...leadData, phone: val };
      const allServices = [finalData.service || "General", ...(finalData.selectedServices || [])].join(", ");
      submitLead.mutate(
        {
          name: finalData.name || "", businessName: finalData.businessName, phone: val, service: allServices, context: finalData.context,
          referralCode: finalData.referralCode, referrerName: finalData.referrerName, referralSourceType: finalData.referralSourceType, notifyCso: finalData.notifyCso,
        },
        {
          onSuccess: (result) => {
            const hasPaid = (finalData.context || "").includes("[PAYMENT CLAIMED]");
            if (hasPaid) {
              addBotMsg(`Your file is created. Reference: ${result.ref}\n\nSave this reference to track your progress anytime.`);
            } else {
              addBotMsg("Your request has been received. Our team will review it and reach out to you shortly.");
            }
            try { localStorage.setItem("hamzury-chat-client", JSON.stringify({ name: finalData.name, ref: hasPaid ? result.ref : undefined, service: allServices })); } catch {}
            addBotButtons([
              { label: "Ask another question", value: "RESTART" },
              { label: "View my dashboard", value: "VIEW_DASHBOARD" },
            ]);
            setChatState("SUCCESS");
          },
        }
      );
      return;
    }

    // Navigation actions
    if (val === "VIEW_DASHBOARD") { window.location.href = "/client/dashboard"; return; }
    if (val === "RESTART") {
      setLeadData(prev => ({ referralCode: prev.referralCode, referrerName: prev.referrerName, referralSourceType: prev.referralSourceType, notifyCso: prev.notifyCso }));
      setAiMessages([]);
      addBotMsg("How else can I help you?");
      setTimeout(() => showMainMenu(), 300);
      return;
    }

    // Catch-all: go to AI chat
    setChatState("AI_CHAT");
    handleAIChat(val);
  }, [chatState, leadData, aiMessages, department, isDashboard, userLang, tonePreference]);

  const formatText = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${GOLD}">$1</strong>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${GOLD};text-decoration:underline;">$1</a>`)
      .replace(/\n/g, "<br/>");

  const inputDisabled = chatState === "SUCCESS" || chatState === "SCHEDULE_TIME" || chatState === "SPECIFIC_SELECT";
  const hasInteracted = messages.some(m => m.sender === "user");

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  const chatPanel = (
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
      {/* ── Header ── */}
      <div className="shrink-0 relative" style={{ backgroundColor: CHARCOAL }}>
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setMenuOpen(v => !v)} className="text-white/40 hover:text-white/80 p-0.5 transition-colors">
              <MoreVertical size={16} />
            </button>
            <h3 className="font-semibold text-[14px] text-white tracking-wide">
              HAMZURY Advisor
            </h3>
          </div>
          <button onClick={close} className="text-white/40 hover:text-white/80 p-1 transition-colors" title="Minimize">
            <Minus size={16} />
          </button>
        </div>

        {/* Menu dropdown */}
        {menuOpen && (
          <div className="absolute left-3 top-14 bg-white rounded-xl shadow-lg border border-[#1A1A1A]/8 py-1 z-10 min-w-[180px]">
            {isDashboard && (
              <div className="px-4 py-2 border-b border-[#1A1A1A]/5">
                <p className="text-[11px] text-[#666] mb-1">Tone preference</p>
                {["Friendly", "Professional", "Executive"].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTonePreference(t); setMenuOpen(false); }}
                    className={`block w-full text-left px-2 py-1.5 text-[12px] rounded transition-colors ${t === tonePreference ? "font-medium" : ""}`}
                    style={{ color: t === tonePreference ? GOLD : DARK }}
                  >
                    {t === tonePreference ? `● ${t}` : t}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { setMenuOpen(false); window.open("https://wa.me/2349130700056", "_blank"); }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors flex items-center gap-2"
              style={{ color: CHARCOAL }}
            >
              <Phone size={14} />
              Contact team
            </button>
            <button
              onClick={() => { setMenuOpen(false); reset(); if (isOpen) { addBotMsg("Welcome to HAMZURY.\n\nWhich language would you prefer?"); addBotButtons([{ label: "English", value: "English" }, { label: "Pidgin", value: "Pidgin" }, { label: "Arabic", value: "Arabic" }, { label: "French", value: "French" }]); setChatState("LANG_SELECT"); } }}
              className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#FFFAF6] transition-colors"
              style={{ color: "#DC2626" }}
            >
              Clear conversation
            </button>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#FAFAFA" }}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.text && (
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${msg.sender === "user" ? "rounded-2xl rounded-tr-sm" : "rounded-2xl rounded-tl-sm"}`}
                  style={{
                    backgroundColor: msg.sender === "user" ? CHARCOAL : "white",
                    color: msg.sender === "user" ? CREAM : DARK,
                    ...(msg.sender === "bot" ? { border: "1px solid rgba(10,31,28,0.06)" } : {}),
                  }}
                  dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                />
              </div>
            )}
            {msg.buttons && (
              <div className="flex flex-col gap-2 mt-2">
                {msg.buttons.map((btn, j) => (
                  <button
                    key={j}
                    onClick={() => handleButtonClick(btn.value, btn.label)}
                    className="w-full text-left px-4 py-2.5 text-[13px] border rounded-full hover:bg-[#FFFAF6] transition-all"
                    style={{ borderColor: "rgba(45,45,45,0.12)", color: CHARCOAL }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = GOLD)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(45,45,45,0.12)")}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white border border-[#1A1A1A]/5"><TypingDots /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      {!inputDisabled && (
        <div className="px-4 pt-2 pb-3 bg-white border-t border-[#1A1A1A]/5 shrink-0">
          {inputError && <p className="text-[11px] mb-1.5 px-1 text-red-500">{inputError}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); if (inputError) setInputError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={aiLoading ? "Responding..." : chatState === "TRACK_REF" ? "Enter reference (HMZ-26/3-XXXX)" : "Type a message"}
              className="flex-1 border rounded-full px-4 py-2.5 text-[13px] outline-none transition-colors"
              style={{ backgroundColor: CREAM, borderColor: inputError ? "#EF4444" : "rgba(45,45,45,0.08)" }}
            />
            <button
              onClick={handleSend}
              disabled={aiLoading}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 shrink-0 disabled:opacity-50"
              style={{ backgroundColor: CHARCOAL, color: GOLD }}
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

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  return (
    <>
      {isOpen && chatPanel}

      {/* Floating buttons */}
      {!isControlled && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
          <button
            onClick={() => setFeedbackOpen(v => !v)}
            className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border"
            style={{ backgroundColor: "white", borderColor: "rgba(45,45,45,0.1)", color: GOLD }}
            title="Rate us"
          >
            <Star size={18} />
          </button>
          <button
            data-chat-trigger
            onClick={() => {
              if (isOpen) close();
              else { setInternalOpen(true); setShowBadge(false); }
            }}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
            style={{ backgroundColor: CHARCOAL, color: GOLD }}
          >
            {isOpen ? <Minus size={22} /> : <MessageSquare size={22} />}
            {!isOpen && showBadge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
            )}
          </button>
        </div>
      )}

      {/* Feedback popup */}
      {feedbackOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#1A1A1A]/10 p-5 w-72">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[14px] font-semibold" style={{ color: CHARCOAL }}>Rate your experience</p>
            <button onClick={() => setFeedbackOpen(false)} className="opacity-40 hover:opacity-100"><X size={16} /></button>
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setFeedbackRating(n)} className="transition-transform hover:scale-110">
                <Star size={28} fill={n <= feedbackRating ? GOLD : "none"} stroke={n <= feedbackRating ? GOLD : "#D1D5DB"} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <textarea
            value={feedbackMsg}
            onChange={e => setFeedbackMsg(e.target.value)}
            placeholder="Tell us more (optional)"
            className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none h-20 mb-3"
            style={{ borderColor: "rgba(45,45,45,0.1)", backgroundColor: "#FAFAFA" }}
          />
          <button
            onClick={() => { if (feedbackRating) { toast.success(`Thank you for your ${feedbackRating}-star feedback`); setFeedbackOpen(false); setFeedbackRating(0); setFeedbackMsg(""); } }}
            disabled={feedbackRating === 0}
            className="w-full py-2.5 rounded-full text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: CHARCOAL }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
}
