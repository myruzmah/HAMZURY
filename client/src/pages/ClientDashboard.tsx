import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  CheckCircle, Circle, ChevronDown, Loader2, AlertCircle, LogOut,
  Send, MessageSquare, Calendar,
  Phone, CreditCard, Copy,
  ArrowRight, Quote,
  Shield, Globe, Zap, TrendingUp, Clock,
  Users, Sparkles,
  X,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

/* ── Brand constants ── */
const CREAM = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const LABEL = "#999999";
const GOLD = "#B48C4C";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const GREY = "#D1D5DB";
const BORDER = "rgba(45,45,45,0.024)";
const CHAT_USER_BG = "#2D2D2D";
const CHAT_BOT_BG = "#F5F5F5";

const DEPT_ACCENT: Record<string, string> = {
  bizdoc: "#1B4D3E",
  systemise: "#2563EB",
  skills: "#1E3A5F",
};

/* ── 5 Business Health Areas ── */
interface HealthItem {
  name: string;
  done: boolean;
  inProgress: boolean;
}

interface HealthArea {
  key: string;
  title: string;
  icon: typeof Shield;
  score: number;
  max: number;
  items: HealthItem[];
  pitch: string;
  emptyPitch: string;
  includes: string[];
  dept: string;
}

type HealthLevel = "strong" | "building" | "weak" | "none";

function getHealthLevel(score: number, max: number): HealthLevel {
  if (score <= 0) return "none";
  const pct = score / max;
  if (pct >= 0.7) return "strong";
  if (pct >= 0.3) return "building";
  return "weak";
}

function healthLevelLabel(level: HealthLevel): string {
  if (level === "strong") return "Strong";
  if (level === "building") return "Building";
  if (level === "weak") return "Weak";
  return "None";
}

function healthLevelColor(level: HealthLevel): string {
  if (level === "strong") return GREEN;
  if (level === "building") return GOLD;
  if (level === "weak") return ORANGE;
  return GREY;
}

/* ── Calculate health from all services ── */
function calculateBusinessHealth(service: string, status: string): HealthArea[] {
  const s = (service || "").toLowerCase();
  const isDone = status === "Completed";
  const isActive = status === "In Progress" || status === "Pending";

  const legal: HealthArea = {
    key: "legal", title: "Legal Protection", icon: Shield,
    score: 0, max: 5, items: [],
    pitch: "Without tax compliance, you cannot get clearance for government contracts.",
    emptyPitch: "Your business has no legal protection. No CAC, no TIN, no contracts. One compliance audit could shut you down.",
    includes: ["CAC Business Registration", "Tax Compliance (TIN/VAT)", "Industry Licences", "Contracts & Legal Templates", "SCUML / AML Compliance"],
    dept: "bizdoc",
  };

  const brand: HealthArea = {
    key: "brand", title: "Brand & Trust", icon: Globe,
    score: 0, max: 3, items: [],
    pitch: "Premium clients check you online before calling. What do they find?",
    emptyPitch: "If a premium client finds you online right now, will they trust you enough to pay?",
    includes: ["Brand Identity & Positioning", "Professional Website", "Social Media Presence"],
    dept: "systemise",
  };

  const systems: HealthArea = {
    key: "systems", title: "Systems & Automation", icon: Zap,
    score: 0, max: 3, items: [],
    pitch: "Manual processes are costing you hours every week.",
    emptyPitch: "Are you still doing things manually that should already be automated?",
    includes: ["CRM & Client Management", "Workflow Automation", "Dashboard & AI Agents"],
    dept: "systemise",
  };

  const team: HealthArea = {
    key: "team", title: "Team & Skills", icon: Users,
    score: 0, max: 2, items: [],
    pitch: "Systems are only as good as the people using them.",
    emptyPitch: "Can your team run the business properly without you being there every day?",
    includes: ["Staff Training & Onboarding", "Skills Development Programs"],
    dept: "skills",
  };

  const growth: HealthArea = {
    key: "growth", title: "Growth & Scale", icon: TrendingUp,
    score: 0, max: 2, items: [],
    pitch: "You have the foundation. Now it's time to scale deliberately.",
    emptyPitch: "Is your business ready to handle 10x more clients without breaking?",
    includes: ["Business Strategy & Expansion", "Management Subscription"],
    dept: "bizdoc",
  };

  // Map current service to health areas
  if (s.includes("cac") || s.includes("registration") || s.includes("business name")) {
    legal.items.push({ name: "Business Registration (CAC)", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("foreign") || s.includes("cerpac") || s.includes("apostille") || s.includes("eq")) {
    legal.items.push({ name: "Foreign Business Registration", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("tax") || s.includes("tin") || s.includes("tcc") || s.includes("vat") || s.includes("paye")) {
    legal.items.push({ name: "Tax Compliance", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("scuml") || s.includes("aml")) {
    legal.items.push({ name: "SCUML / AML Compliance", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("licence") || s.includes("permit") || s.includes("nafdac") || s.includes("son") || s.includes("dpr")) {
    legal.items.push({ name: "Industry Licence", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("contract") || s.includes("legal") || s.includes("agreement")) {
    legal.items.push({ name: "Contracts & Legal", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("website") || s.includes("brand identity")) {
    brand.items.push({ name: "Brand & Website", done: isDone, inProgress: isActive && !isDone });
    brand.score += isDone ? 1 : 0.5;
  }
  if (s.includes("social media") || s.includes("social")) {
    brand.items.push({ name: "Social Media Presence", done: isDone, inProgress: isActive && !isDone });
    brand.score += isDone ? 1 : 0.5;
  }
  if (s.includes("automation") || s.includes("crm") || s.includes("dashboard") || s.includes("ai agent")) {
    systems.items.push({ name: "Business Automation", done: isDone, inProgress: isActive && !isDone });
    systems.score += isDone ? 1 : 0.5;
  }
  if (s.includes("training") || s.includes("skill") || s.includes("cohort")) {
    team.items.push({ name: "Team Training", done: isDone, inProgress: isActive && !isDone });
    team.score += isDone ? 1 : 0.5;
  }
  if (s.includes("strategy") || s.includes("expansion") || s.includes("management")) {
    growth.items.push({ name: "Business Strategy", done: isDone, inProgress: isActive && !isDone });
    growth.score += isDone ? 1 : 0.5;
  }

  // "Full Business Architecture" touches multiple areas
  if (s.includes("full business") || s.includes("architecture")) {
    legal.items.push({ name: "Business Documentation", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
    brand.items.push({ name: "Business Positioning", done: false, inProgress: isActive });
    brand.score += isDone ? 0.5 : 0.25;
    systems.items.push({ name: "Basic Systems Setup", done: false, inProgress: isActive });
    systems.score += isDone ? 0.5 : 0.25;
  }

  return [legal, brand, systems, team, growth];
}

/* ── Founder quotes ── */
const FOUNDER_QUOTES = [
  "Businesses deserve more than consultants who disappear after the invoice. We stay until the work is done.",
  "Structure is what separates businesses that last from businesses that don't.",
  "If your business can't run without you, you don't have a business. You have a job.",
  "Compliance is not a cost. It is the price of being taken seriously.",
  "The businesses that win are the ones that got structured early.",
  "Every document, every system, every skill -- it all adds up to a business that lasts.",
  "We don't just register businesses. We prepare them to operate, compete, and scale.",
];

/* ── Utility functions ── */
function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

/* ── Session ── */
interface ClientSession {
  ref: string;
  phone?: string;
  expiresAt: number;
}

function loadClientSession(): ClientSession | null {
  try {
    const raw = localStorage.getItem("hamzury-client-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientSession;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem("hamzury-client-session");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const ACTIVITY_LABELS: Record<string, string> = {
  task_created: "File created",
  status_change: "Status updated",
  checklist_toggled: "Checklist updated",
  note_added: "Internal note added",
  document_uploaded: "Document uploaded",
  client_note: "Your message received",
  payment_confirmed: "Payment confirmed",
  invoice_created: "Invoice generated",
  commission_created: "Commission recorded",
  kpi_approved: "Quality approved",
};

/* ── Animations ── */
const cssAnimations = `
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

/* ── Chat message type ── */
type ChatMsg = { role: "user" | "assistant"; content: string };

/* ── Load persisted chat ── */
function loadChatMessages(ref: string): ChatMsg[] {
  try {
    const raw = localStorage.getItem(`hamzury-dashboard-chat-${ref}`);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMsg[];
  } catch {
    return [];
  }
}

function saveChatMessages(ref: string, msgs: ChatMsg[]) {
  try {
    localStorage.setItem(`hamzury-dashboard-chat-${ref}`, JSON.stringify(msgs.slice(-50)));
  } catch { /* full storage */ }
}

/* ── Progress Bar Component ── */
function ProgressBar({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: `${DARK}08` }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
      />
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════════ */
/*  BUSINESS HEALTH DASHBOARD                                                 */
/* ════════════════════════════════════════════════════════════════════════════ */

export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [claimedInvoices, setClaimedInvoices] = useState<Set<string>>(new Set());
  const [copiedAcct, setCopiedAcct] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(false);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  /* Chat state */
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [autoGreeted, setAutoGreeted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  /* Message to staff */
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const s = loadClientSession();
    setSession(s);
    setSessionLoaded(true);
    if (!s) {
      window.location.href = "/client";
    }
  }, []);

  /* Random founder quote (stable per session) */
  const founderQuote = useMemo(
    () => FOUNDER_QUOTES[Math.floor(Math.random() * FOUNDER_QUOTES.length)],
    []
  );

  /* ── tRPC queries ── */
  const { data, isLoading, isError } = trpc.tracking.fullLookup.useQuery(
    { ref: session?.ref ?? "", phone: session?.phone },
    { enabled: !!session?.ref, retry: false, refetchInterval: 30000 }
  );

  const { data: subHistory } = trpc.subscriptions.clientHistory.useQuery(
    { ref: session?.ref ?? "" },
    { enabled: !!session?.ref, retry: false }
  );

  const { data: bankDetails } = trpc.invoices.bankDetails.useQuery(undefined, { staleTime: Infinity });

  const claimMutation = trpc.invoices.claimPayment.useMutation({
    onSuccess: (_, vars) => {
      setClaimedInvoices((prev) => new Set(prev).add(vars.invoiceNumber));
    },
  });

  const noteMutation = trpc.tracking.submitClientNote.useMutation({
    onSuccess: () => {
      setMessage("");
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 4000);
    },
  });

  function handleLogout() {
    localStorage.removeItem("hamzury-client-session");
    if (session?.ref) localStorage.removeItem(`hamzury-dashboard-chat-${session.ref}`);
    window.location.href = "/client";
  }

  function handleSendMessage() {
    if (!message.trim() || !session?.ref) return;
    noteMutation.mutate({ ref: session.ref, message: message.trim() });
  }

  /* ── Load persisted chat on session ready + auto-greet ── */
  useEffect(() => {
    if (!session?.ref) return;
    const saved = loadChatMessages(session.ref);
    if (saved.length > 0) {
      setChatMessages(saved);
      setAutoGreeted(true);
    }
  }, [session?.ref]);

  /* Auto-greeting handled inline after data check below */

  /* ── Persist chat messages ── */
  useEffect(() => {
    if (session?.ref && chatMessages.length > 0) {
      saveChatMessages(session.ref, chatMessages);
    }
  }, [chatMessages, session?.ref]);

  /* ── Auto-scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ── Streaming AI Chat ── */
  const handleChatSend = useCallback(async (text?: string) => {
    const msg = (text || chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput("");

    const userMsg: ChatMsg = { role: "user", content: msg };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    // Add placeholder
    setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const history = [...chatMessages, userMsg].slice(-10).map(h => ({ role: h.role, content: h.content }));
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: msg,
          history,
          department: "general",
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
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;
          try {
            const parsed = JSON.parse(d);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              setChatMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullText };
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }

      const answer = fullText || "Our team will answer that directly. Start a chat or reach out via the contact options.";
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: answer };
        return updated;
      });
    } catch {
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Connection issue. Please try again or call us at 08067149356." };
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages]);

  /* ── Send chat from health card ── */
  const sendFromHealthCard = useCallback((areaTitle: string, level: HealthLevel) => {
    const msg = level === "none"
      ? `I want to build my ${areaTitle.toLowerCase()}`
      : `I want to strengthen my ${areaTitle.toLowerCase()}`;
    setMobileChatOpen(true);
    setTimeout(() => handleChatSend(msg), 100);
  }, [handleChatSend]);

  /* ── Loading / error — NO early returns to preserve hook order ── */
  if (!sessionLoaded || !session || isLoading || isError || !data || !data.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: CREAM }}>
        {(!sessionLoaded || isLoading) ? (
          <>
            <Loader2 className="animate-spin" size={24} style={{ color: DARK }} />
            <p className="text-[13px] font-light" style={{ color: DARK, opacity: 0.5 }}>Loading your business health...</p>
          </>
        ) : (isError || !data || (data && !data.found)) ? (
          <>
            <AlertCircle size={32} style={{ color: "#DC2626" }} />
            <p className="text-[15px] font-light mb-1" style={{ color: DARK }}>File not found</p>
            <p className="text-[12px] opacity-40" style={{ color: DARK }}>Reference: {session?.ref}</p>
            <button onClick={handleLogout} className="text-[12px] font-medium px-4 py-2 rounded-lg" style={{ backgroundColor: DARK, color: GOLD }}>Try a different reference</button>
          </>
        ) : null}
      </div>
    );
  }

  /* ── Destructure data ── */
  const task = data.task;
  const checklist = data.checklist || [];
  const activity = data.activity || [];
  const invoiceSummary = data.invoiceSummary;

  const isBizdoc = (task.department || "").toLowerCase() === "bizdoc";
  const activeBankDetails = bankDetails
    ? isBizdoc && bankDetails.bizdoc.configured
      ? bankDetails.bizdoc
      : bankDetails.general
    : null;

  /* ── Calculate Business Health ── */
  const healthAreas = calculateBusinessHealth(task.service, task.status);
  const areasWithScore = healthAreas.filter(a => a.score > 0);
  const overallAreasActive = areasWithScore.length;
  const overallPct = overallAreasActive * 20;

  const overallMessages: Record<number, string> = {
    0: "Your business is unstructured. Let's fix that.",
    20: "You've started. But 4 critical areas are still exposed.",
    40: "Getting stronger. But gaps remain.",
    60: "Solid foundation. A few more steps to full protection.",
    80: "Almost there. One more area to complete.",
    100: "Fully structured. Your business is built to last.",
  };
  const overallMessage = overallMessages[overallPct] || overallMessages[0];

  /* ── Auto-greeting (safe — after data is available, runs once) ── */
  if (!autoGreeted && chatMessages.length === 0) {
    const fn = (task.clientName || "").split(" ")[0];
    const g = overallPct <= 20
      ? `Hi ${fn}. Your business is ${overallPct}% structured. Most areas are still unprotected. Want me to show you what to prioritize?`
      : overallPct <= 60
      ? `Welcome back, ${fn}. Your business health is at ${overallPct}%. Let me show you the next area that makes the biggest difference.`
      : `Great to see you, ${fn}. Your business is ${overallPct}% structured. A few more steps and you're fully protected.`;
    // Use setTimeout to avoid setState during render
    setTimeout(() => { setChatMessages([{ role: "assistant", content: g }]); setAutoGreeted(true); }, 0);
  }

  const hasInvoices = invoiceSummary && invoiceSummary.invoices.length > 0;
  const isCompleted = task.status === "Completed";
  const deptAccent = DEPT_ACCENT[(task.department || "").toLowerCase()] || DARK;

  /* ── Chat panel component ── */
  const ChatPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`flex flex-col ${isMobile ? "h-[70vh]" : "h-full"}`}
      style={{ backgroundColor: WHITE }}
    >
      {/* Chat header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${GOLD}15` }}
          >
            <Sparkles size={16} style={{ color: GOLD }} />
          </div>
          <div>
            <p className="text-[14px] font-medium" style={{ color: DARK }}>Your Advisor</p>
            <p className="text-[10px]" style={{ color: MUTED }}>Ask anything about your business</p>
          </div>
        </div>
        {isMobile && (
          <button onClick={() => setMobileChatOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} style={{ color: MUTED }} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
            <Sparkles size={32} style={{ color: `${GOLD}40` }} className="mb-3" />
            <p className="text-[13px] font-light" style={{ color: MUTED }}>
              Ask about compliance, tax, branding, or any business question.
            </p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5"
              style={{
                backgroundColor: msg.role === "user" ? CHAT_USER_BG : CHAT_BOT_BG,
                color: msg.role === "user" ? WHITE : DARK,
                borderBottomRightRadius: msg.role === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.role === "user" ? 16 : 4,
              }}
            >
              {msg.content ? (
                <p className="text-[13px] font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: `${DARK}40`, animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: `${DARK}40`, animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: `${DARK}40`, animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-2"
        style={{ borderTop: `1px solid ${BORDER}` }}
      >
        <input
          ref={chatInputRef}
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
          placeholder="Type a message..."
          className="flex-1 text-[13px] font-light bg-transparent focus:outline-none py-2 px-3 rounded-xl"
          style={{ color: DARK, backgroundColor: CREAM, border: `1px solid ${BORDER}` }}
          disabled={chatLoading}
        />
        <button
          onClick={() => handleChatSend()}
          disabled={!chatInput.trim() || chatLoading}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:opacity-80 disabled:opacity-30"
          style={{ backgroundColor: GOLD, color: WHITE }}
        >
          {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <style>{cssAnimations}</style>
      <PageMeta
        title={`${task.businessName || task.clientName} - Business Health | HAMZURY`}
        description="Your business health dashboard. See your strengths, gaps, and next steps."
      />

      {/* ═══ HEADER NAV ═══ */}
      <nav
        className="sticky top-0 z-30 px-5 md:px-8 h-14 flex items-center justify-between"
        style={{
          backgroundColor: `${CREAM}f0`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <a
          href="/"
          className="text-[15px] font-light tracking-tight"
          style={{ color: DARK, letterSpacing: "-0.03em" }}
        >
          HAMZURY
        </a>
        <div className="flex items-center gap-4">
          <a
            href="tel:08067149356"
            className="flex items-center gap-1.5 text-[12px] font-light"
            style={{ color: MUTED }}
          >
            <Phone size={12} />
            <span className="hidden sm:inline">08067149356</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[11px] font-medium opacity-40 hover:opacity-70 transition-opacity px-3 py-1.5 rounded-lg"
            style={{ color: DARK, backgroundColor: `${DARK}06` }}
          >
            <LogOut size={12} />
            Exit
          </button>
        </div>
      </nav>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="flex h-[calc(100vh-56px)]">

        {/* ─── LEFT SIDE: Business Health (scrollable) ─── */}
        <div className="flex-1 md:w-[60%] overflow-y-auto px-5 md:px-8 pb-12">

          {/* Welcome header */}
          <div className="pt-8 pb-2">
            <p className="text-[13px] font-light mb-1" style={{ color: MUTED }}>
              Welcome back, {(task.clientName || "").split(" ")[0]}
            </p>
            <h1
              className="text-[22px] md:text-[28px] font-light tracking-tight leading-tight"
              style={{ color: DARK, letterSpacing: "-0.025em" }}
            >
              {task.businessName || task.clientName}
            </h1>
            <p className="text-[12px] font-light mt-1" style={{ color: LABEL }}>
              {task.department || "HAMZURY"} &middot; Ref: {task.ref}
            </p>
          </div>


          {/* ═══ OVERALL BUSINESS SCORE ═══ */}
          <div
            className="rounded-2xl p-6 mt-6 mb-8"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: LABEL }}>
                  Business Health
                </p>
                <p className="text-[32px] font-light tabular-nums leading-none" style={{ color: DARK }}>
                  {overallPct}<span className="text-[18px]" style={{ color: LABEL }}>%</span>
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: overallPct >= 60
                    ? `conic-gradient(${GREEN} ${overallPct * 3.6}deg, ${DARK}08 0deg)`
                    : overallPct > 0
                    ? `conic-gradient(${GOLD} ${overallPct * 3.6}deg, ${DARK}08 0deg)`
                    : `${DARK}08`,
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: WHITE }}>
                  <span className="text-[11px] font-semibold" style={{ color: overallPct >= 60 ? GREEN : overallPct > 0 ? GOLD : LABEL }}>
                    {overallAreasActive}/5
                  </span>
                </div>
              </div>
            </div>

            <ProgressBar pct={overallPct} color={overallPct >= 60 ? GREEN : overallPct > 0 ? GOLD : GREY} height={8} />

            <p className="text-[13px] font-light mt-4 leading-relaxed" style={{ color: MUTED }}>
              {overallMessage}
            </p>

            <p className="text-[11px] mt-2" style={{ color: LABEL }}>
              {overallAreasActive} of 5 areas have at least one service active or delivered.
            </p>
          </div>


          {/* ═══ 5 HEALTH CARDS ═══ */}
          <div className="mb-8">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
              style={{ color: LABEL }}
            >
              Your 5 Business Areas
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthAreas.map((area) => {
                const level = getHealthLevel(area.score, area.max);
                const levelColor = healthLevelColor(level);
                const pct = area.max > 0 ? Math.round((area.score / area.max) * 100) : 0;
                const AreaIcon = area.icon;
                const isExpanded = expandedArea === area.key;
                const accent = DEPT_ACCENT[area.dept] || DARK;
                const hasItems = area.items.length > 0;

                return (
                  <div
                    key={area.key}
                    className="rounded-2xl overflow-hidden transition-all"
                    style={{
                      backgroundColor: WHITE,
                      border: `1px solid ${BORDER}`,
                      animation: "fadeIn 0.4s ease-out both",
                    }}
                  >
                    {/* Card header */}
                    <button
                      onClick={() => setExpandedArea(isExpanded ? null : area.key)}
                      className="w-full text-left px-5 py-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${levelColor}12` }}
                          >
                            <AreaIcon size={18} style={{ color: levelColor }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium leading-tight" style={{ color: DARK }}>
                              {area.title}
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: levelColor }}>
                              {healthLevelLabel(level)}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          size={16}
                          style={{ color: LABEL, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                        />
                      </div>

                      {/* Mini progress bar */}
                      <ProgressBar pct={pct} color={levelColor} height={4} />
                      <p className="text-[10px] mt-1.5 tabular-nums" style={{ color: LABEL }}>{pct}%</p>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-5 pb-5" style={{ borderTop: `1px solid ${DARK}06` }}>
                        {/* Items if client has services in this area */}
                        {hasItems && (
                          <div className="mt-4 space-y-2">
                            {area.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2.5">
                                {item.done ? (
                                  <CheckCircle size={14} style={{ color: GREEN }} />
                                ) : item.inProgress ? (
                                  <Circle size={14} style={{ color: GOLD }} />
                                ) : (
                                  <Circle size={14} style={{ color: `${DARK}15` }} />
                                )}
                                <span
                                  className="text-[12px] font-light"
                                  style={{ color: item.done ? DARK : MUTED }}
                                >
                                  {item.name} {item.done ? "-- Done" : item.inProgress ? "-- In Progress" : "-- Needed"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pitch / insight */}
                        <p
                          className="text-[12px] font-light leading-relaxed mt-4 italic"
                          style={{ color: MUTED }}
                        >
                          "{hasItems ? area.pitch : area.emptyPitch}"
                        </p>

                        {/* What this includes (for empty areas) */}
                        {!hasItems && (
                          <div className="mt-3">
                            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: LABEL }}>
                              What this includes
                            </p>
                            <div className="space-y-1.5">
                              {area.includes.map((inc, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accent }} />
                                  <span className="text-[11px] font-light" style={{ color: DARK }}>{inc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CTA button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendFromHealthCard(area.title, level);
                          }}
                          className="w-full flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all hover:opacity-90"
                          style={{ backgroundColor: accent, color: WHITE }}
                        >
                          {level === "none" ? (
                            <>Build my {area.title.toLowerCase().split(" ")[0]} <ArrowRight size={13} /></>
                          ) : (
                            <>Strengthen this area <ArrowRight size={13} /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


          {/* ═══ YOUR ACTIVE SERVICES ═══ */}
          <div className="mb-8">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
              style={{ color: LABEL }}
            >
              Your Active Services
            </p>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[15px] font-medium" style={{ color: DARK }}>{task.service}</p>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: isCompleted ? `${GREEN}12` : `${GOLD}12`,
                      color: isCompleted ? GREEN : GOLD,
                    }}
                  >
                    {task.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {task.createdAt && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: LABEL }}>
                      <Calendar size={10} /> Started: {formatDate(task.createdAt)}
                    </span>
                  )}
                  {task.deadline && !isCompleted && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: LABEL }}>
                      <Clock size={10} /> Expected: {formatDate(task.deadline)}
                    </span>
                  )}
                  {invoiceSummary && invoiceSummary.paid > 0 && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: LABEL }}>
                      <CreditCard size={10} /> Paid: {formatNaira(invoiceSummary.paid)}
                      {invoiceSummary.total - invoiceSummary.paid > 0 && (
                        <span style={{ color: ORANGE }}>&middot; Balance: {formatNaira(invoiceSummary.total - invoiceSummary.paid)}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Checklist progress */}
              {checklist.length > 0 && (
                <div className="px-5 pb-4">
                  {/* Progress bar */}
                  {!isCompleted && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1">
                        <ProgressBar pct={task.progress || 0} color={deptAccent} />
                      </div>
                      <span className="text-[11px] font-medium tabular-nums" style={{ color: deptAccent }}>
                        {task.progress}%
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {checklist.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-2.5">
                        {c.checked ? (
                          <CheckCircle size={14} style={{ color: GREEN }} />
                        ) : (
                          <Circle size={14} style={{ color: `${DARK}18` }} />
                        )}
                        <span
                          className="text-[12px] font-light"
                          style={{ color: c.checked ? DARK : MUTED }}
                        >
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* ═══ SUBSCRIPTION MONTHLY TASKS ═══ */}
          {subHistory && subHistory.monthlyTasks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={14} style={{ color: GOLD }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: LABEL }}>
                  Monthly: {subHistory.service}
                </p>
              </div>
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
              >
                <div className="space-y-2">
                  {subHistory.monthlyTasks.map((t: { month: string | null; status: string; kpiApproved: boolean }) => (
                    <div
                      key={t.month}
                      className="flex items-center justify-between rounded-xl px-4 py-2.5"
                      style={{ backgroundColor: CREAM, border: `1px solid ${DARK}06` }}
                    >
                      <div className="flex items-center gap-2.5">
                        {t.kpiApproved || t.status === "Completed" ? (
                          <CheckCircle size={14} style={{ color: GREEN }} />
                        ) : (
                          <Circle size={14} style={{ color: `${DARK}25` }} />
                        )}
                        <span className="text-[13px] font-light" style={{ color: DARK }}>
                          {t.month}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: t.kpiApproved ? `${GREEN}12` : t.status === "In Progress" ? `${GOLD}12` : `${DARK}08`,
                          color: t.kpiApproved ? GREEN : t.status === "In Progress" ? GOLD : MUTED,
                        }}
                      >
                        {t.kpiApproved ? "Filed" : t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {/* ═══ INVOICES (collapsible) ═══ */}
          {hasInvoices && (
            <div className="mb-8">
              <button
                onClick={() => setInvoicesOpen(!invoicesOpen)}
                className="flex items-center gap-2 mb-4 group"
              >
                <CreditCard size={14} style={{ color: LABEL }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: LABEL }}>
                  Invoices
                </p>
                <ChevronDown
                  size={14}
                  style={{ color: LABEL, transform: invoicesOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                />
                {invoiceSummary && invoiceSummary.total - invoiceSummary.paid > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                    {formatNaira(invoiceSummary.total - invoiceSummary.paid)} due
                  </span>
                )}
              </button>

              {invoicesOpen && (
                <>
                  {/* Summary row */}
                  <div
                    className="grid grid-cols-3 gap-4 rounded-2xl p-5 mb-4"
                    style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
                  >
                    <div className="text-center">
                      <p className="text-[16px] font-semibold" style={{ color: DARK }}>{formatNaira(invoiceSummary!.total)}</p>
                      <p className="text-[9px] font-medium uppercase tracking-wider mt-0.5" style={{ color: LABEL }}>Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-semibold" style={{ color: GREEN }}>{formatNaira(invoiceSummary!.paid)}</p>
                      <p className="text-[9px] font-medium uppercase tracking-wider mt-0.5" style={{ color: LABEL }}>Paid</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[16px] font-semibold" style={{ color: invoiceSummary!.total - invoiceSummary!.paid > 0 ? "#DC2626" : GREEN }}>
                        {formatNaira(invoiceSummary!.total - invoiceSummary!.paid)}
                      </p>
                      <p className="text-[9px] font-medium uppercase tracking-wider mt-0.5" style={{ color: LABEL }}>Balance</p>
                    </div>
                  </div>

                  {/* Individual invoices */}
                  <div className="space-y-3">
                    {invoiceSummary!.invoices.map((inv) => {
                      const balance = inv.total - inv.paid;
                      const isPaid = inv.status === "paid";
                      const hasClaimed = claimedInvoices.has(inv.number);
                      const statusColor =
                        isPaid ? GREEN
                        : inv.status === "partial" ? GOLD
                        : inv.status === "overdue" ? "#DC2626"
                        : inv.status === "sent" ? "#2563EB"
                        : MUTED;
                      return (
                        <div
                          key={inv.number}
                          className="rounded-2xl overflow-hidden"
                          style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
                        >
                          <div className="px-5 py-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-mono font-medium" style={{ color: DARK }}>{inv.number}</span>
                              <span
                                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${statusColor}12`, color: statusColor }}
                              >
                                {inv.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[14px] font-semibold" style={{ color: DARK }}>{formatNaira(inv.total)}</span>
                              {balance > 0 && (
                                <span className="text-[11px] font-light" style={{ color: "#DC2626" }}>Balance: {formatNaira(balance)}</span>
                              )}
                            </div>
                            {inv.dueDate && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={9} style={{ color: `${DARK}30` }} />
                                <p className="text-[10px]" style={{ color: `${DARK}30` }}>Due: {formatDate(inv.dueDate)}</p>
                              </div>
                            )}
                          </div>

                          {!isPaid && balance > 0 && activeBankDetails?.configured && (
                            <div className="px-5 pb-4">
                              <div
                                className="rounded-xl p-3 mb-3"
                                style={{ backgroundColor: CREAM, border: `1px solid ${DARK}06` }}
                              >
                                <p className="text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: DARK }}>
                                  <CreditCard size={10} /> Bank Transfer Details
                                </p>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px]" style={{ color: MUTED }}>Bank</span>
                                    <span className="text-[11px] font-medium" style={{ color: DARK }}>{activeBankDetails!.bankName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px]" style={{ color: MUTED }}>Account Name</span>
                                    <span className="text-[11px] font-medium" style={{ color: DARK }}>{activeBankDetails!.accountName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px]" style={{ color: MUTED }}>Account No.</span>
                                    <button
                                      className="flex items-center gap-1 text-[11px] font-mono font-bold transition-opacity hover:opacity-70"
                                      style={{ color: DARK }}
                                      onClick={() => {
                                        navigator.clipboard.writeText(activeBankDetails!.accountNumber);
                                        setCopiedAcct(true);
                                        setTimeout(() => setCopiedAcct(false), 2000);
                                      }}
                                    >
                                      {activeBankDetails!.accountNumber}
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                  {copiedAcct && (
                                    <p className="text-[10px] text-center" style={{ color: GREEN }}>Copied!</p>
                                  )}
                                </div>
                                <p className="text-[10px] mt-2 text-center" style={{ color: MUTED }}>
                                  Transfer {formatNaira(balance)} then click below
                                </p>
                              </div>

                              {hasClaimed ? (
                                <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl" style={{ backgroundColor: "#DCFCE7" }}>
                                  <CheckCircle size={12} style={{ color: GREEN }} />
                                  <span className="text-[11px] font-medium" style={{ color: "#166534" }}>
                                    Payment claim received -- we'll confirm shortly
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => claimMutation.mutate({ invoiceNumber: inv.number, clientName: task.clientName })}
                                  disabled={claimMutation.isPending}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-40"
                                  style={{ backgroundColor: DARK, color: GOLD }}
                                >
                                  {claimMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                                  I've Paid
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}


          {/* ═══ SEND MESSAGE TO STAFF ═══ */}
          <div id="message-section" className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Send size={14} style={{ color: LABEL }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: LABEL }}>
                Send a message to your team
              </p>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
            >
              {messageSent && (
                <div className="flex items-center gap-2 p-3 mx-5 mt-4 rounded-xl" style={{ backgroundColor: "#DCFCE7" }}>
                  <CheckCircle size={14} style={{ color: GREEN }} />
                  <p className="text-[12px] font-medium" style={{ color: "#166534" }}>
                    Message sent. Your team has been notified.
                  </p>
                </div>
              )}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-5 text-[14px] font-light bg-transparent resize-none focus:outline-none"
                style={{ color: DARK, minHeight: 80 }}
                maxLength={1000}
              />
              <div className="flex items-center justify-between px-5 pb-4">
                <span className="text-[10px]" style={{ color: `${DARK}25` }}>{message.length}/1000</span>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || noteMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-30"
                  style={{ backgroundColor: DARK, color: GOLD }}
                >
                  {noteMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Send
                </button>
              </div>
            </div>

            {noteMutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded-xl mt-3" style={{ backgroundColor: "#FEE2E2" }}>
                <AlertCircle size={14} style={{ color: "#DC2626" }} />
                <p className="text-[12px]" style={{ color: "#991B1B" }}>Failed to send message. Please try again.</p>
              </div>
            )}

            {/* Recent activity log */}
            {activity.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock size={11} style={{ color: `${DARK}35` }} />
                  <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: `${DARK}35` }}>
                    Recent Activity
                  </p>
                </div>
                <div className="space-y-1">
                  {activity.filter(a => a.action !== "client_note").slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{ backgroundColor: CREAM }}
                    >
                      <span className="text-[12px] font-light" style={{ color: DARK }}>
                        {ACTIVITY_LABELS[a.action] || a.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px]" style={{ color: `${DARK}30` }}>{timeAgo(a.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* ═══ FOUNDER QUOTE ═══ */}
          <div
            className="rounded-2xl p-6 mb-8 relative overflow-hidden"
            style={{ backgroundColor: WHITE, border: `1px solid ${GOLD}15` }}
          >
            <Quote size={60} className="absolute top-3 right-4" style={{ color: GOLD, opacity: 0.06 }} />
            <div className="relative flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${GOLD}10` }}
              >
                <Quote size={16} style={{ color: GOLD }} />
              </div>
              <div>
                <p className="text-[13px] font-light leading-relaxed italic mb-2" style={{ color: DARK }}>
                  "{founderQuote}"
                </p>
                <p className="text-[11px] font-medium" style={{ color: GOLD }}>-- Muhammad Hamzury</p>
              </div>
            </div>
          </div>


          {/* ═══ FOOTER ═══ */}
          <div className="text-center pt-4 pb-6" style={{ borderTop: `1px solid ${DARK}06` }}>
            <p className="text-[10px]" style={{ color: `${DARK}30` }}>
              Ref: {task.ref} &middot; Last updated: {formatDate(task.updatedAt)}
            </p>
          </div>
        </div>


        {/* ─── RIGHT SIDE: Persistent AI Chat (desktop only) ─── */}
        <div
          className="hidden md:flex w-[40%] flex-col border-l"
          style={{ borderColor: BORDER, backgroundColor: WHITE }}
        >
          <ChatPanel />
        </div>
      </div>


      {/* ═══ MOBILE: Chat button + bottom sheet ═══ */}
      <div className="md:hidden">
        {/* Floating chat button */}
        {!mobileChatOpen && (
          <button
            onClick={() => setMobileChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: GOLD, color: WHITE }}
          >
            <MessageSquare size={24} />
          </button>
        )}

        {/* Bottom sheet overlay */}
        {mobileChatOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              onClick={() => setMobileChatOpen(false)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden"
              style={{
                backgroundColor: WHITE,
                animation: "slideUp 0.3s ease-out",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <ChatPanel isMobile />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
