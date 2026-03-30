import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  CheckCircle, Circle, ChevronDown, Loader2, AlertCircle, LogOut,
  Send, MessageSquare, Calendar,
  Phone, CreditCard, Copy,
  ArrowRight, Quote,
  Shield, Globe, Zap, TrendingUp, Clock,
  Users, Sparkles, Palette,
  X, UserPlus, FileCheck, Award, GraduationCap, Lock, Unlock,
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
@keyframes stagePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
}
@keyframes expandDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 600px; }
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
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
    const svc = task.service || "";
    const st = task.status || "";
    // Build context-aware greeting
    let g = `Hi ${fn}.`;
    if (svc.toLowerCase().includes("full business") || svc.toLowerCase().includes("architecture")) {
      g += ` Your ${svc} is ${st.toLowerCase()}. Registration is being handled and tax, brand, and systems are queued. Once registration completes, we'll move to tax compliance next.`;
    } else if (svc) {
      g += ` Your ${svc} service is currently ${st.toLowerCase()}.`;
    }
    g += ` Anything you'd like to know?`;
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


          {/* ═══ 5 VERTICAL BUSINESS PILLARS ═══ */}
          {(() => {
            /* ── Pillar definitions ── */
            const PILLARS = [
              {
                id: "compliance",
                icon: Shield,
                label: "Compliance & Documents",
                desc: "Registration, tax, licences, contracts, templates",
                pitch: "Is your business legally protected? Most businesses miss at least 2 critical documents.",
                color: "#1B4D3E",
                items: [
                  { id: "cac", label: "CAC Registration", short: "CAC" },
                  { id: "tin", label: "TIN Registration", short: "TIN" },
                  { id: "tcc", label: "Tax Clearance", short: "TCC" },
                  { id: "licence", label: "Sector Licence", short: "Licence" },
                  { id: "contracts", label: "Contracts & Legal", short: "Legal" },
                  { id: "templates", label: "Document Templates", short: "Docs" },
                  { id: "annual", label: "Annual Returns", short: "Returns" },
                  { id: "management", label: "Compliance Mgmt", short: "Mgmt" },
                ],
              },
              {
                id: "branding",
                icon: Palette,
                label: "Branding & Strategy",
                desc: "Brand identity, positioning, website, strategy",
                pitch: "If a premium client finds you online, will they trust you enough to pay?",
                color: "#2563EB",
                items: [
                  { id: "brand_id", label: "Brand Identity", short: "Brand" },
                  { id: "positioning", label: "Positioning", short: "Position" },
                  { id: "website", label: "Website", short: "Web" },
                  { id: "content_strategy", label: "Content Strategy", short: "Content" },
                  { id: "materials", label: "Business Materials", short: "Materials" },
                  { id: "pitch_deck", label: "Pitch Deck", short: "Pitch" },
                ],
              },
              {
                id: "visibility",
                icon: Globe,
                label: "Visibility & Presence",
                desc: "Social media, content, online presence",
                pitch: "Are premium clients finding you? If not, you are invisible to the market.",
                color: "#2563EB",
                items: [
                  { id: "social_setup", label: "Social Media Setup", short: "Setup" },
                  { id: "social_mgmt", label: "Social Media Mgmt", short: "Mgmt" },
                  { id: "content", label: "Content Creation", short: "Content" },
                  { id: "seo", label: "Search Visibility", short: "SEO" },
                  { id: "reputation", label: "Online Reputation", short: "Trust" },
                ],
              },
              {
                id: "tools",
                icon: Zap,
                label: "Tools & Systems",
                desc: "Automation, CRM, dashboard, AI agents",
                pitch: "Are repeated tasks still wasting your team's time every week?",
                color: "#2563EB",
                items: [
                  { id: "crm", label: "CRM & Leads", short: "CRM" },
                  { id: "automation", label: "Automation", short: "Auto" },
                  { id: "dashboard", label: "Dashboard", short: "Dash" },
                  { id: "ai_agent", label: "AI Agent", short: "AI" },
                  { id: "research", label: "Research Tools", short: "Research" },
                ],
              },
              {
                id: "skills",
                icon: GraduationCap,
                label: "Skills & Growth",
                desc: "Training, team capability, programs",
                pitch: "Can your team run the business without you being there every day?",
                color: "#1E3A5F",
                items: [
                  { id: "founder", label: "Founder Program", short: "Founder" },
                  { id: "team", label: "Team Training", short: "Team" },
                  { id: "ai_skills", label: "AI Skills", short: "AI" },
                  { id: "growth", label: "Growth Strategy", short: "Growth" },
                ],
              },
            ];

            type ItemState = "delivered" | "in_progress" | "paid" | "inactive";

            /* ── Map service to active items ── */
            function mapServiceToItems(service: string, status: string): Record<string, ItemState> {
              const s = service.toLowerCase();
              const done = status === "Completed";
              const active: Record<string, ItemState> = {};

              if (s.includes("full business") || s.includes("architecture")) {
                active.cac = done ? "delivered" : "in_progress";
                active.tin = "paid"; active.tcc = "paid";
                active.brand_id = "paid"; active.website = "paid";
                active.social_setup = "paid"; active.social_mgmt = "paid";
              }
              if (s.includes("cac") || s.includes("registration")) active.cac = done ? "delivered" : "in_progress";
              if (s.includes("tax") || s.includes("tin")) active.tin = done ? "delivered" : "in_progress";
              if (s.includes("tcc")) active.tcc = done ? "delivered" : "in_progress";
              if (s.includes("licence") || s.includes("nafdac")) active.licence = done ? "delivered" : "in_progress";
              if (s.includes("website")) active.website = done ? "delivered" : "in_progress";
              if (s.includes("brand")) active.brand_id = done ? "delivered" : "in_progress";
              if (s.includes("social media")) { active.social_setup = done ? "delivered" : "in_progress"; active.social_mgmt = done ? "delivered" : "in_progress"; }
              if (s.includes("automation") || s.includes("crm")) { active.crm = done ? "delivered" : "in_progress"; active.automation = done ? "delivered" : "in_progress"; }
              if (s.includes("dashboard")) active.dashboard = done ? "delivered" : "in_progress";
              if (s.includes("training") || s.includes("skill") || s.includes("cohort")) active.team = done ? "delivered" : "in_progress";
              if (s.includes("contract") || s.includes("legal")) active.contracts = done ? "delivered" : "in_progress";

              return active;
            }

            const activeItems = mapServiceToItems(task.service || "", task.status || "");

            /* ── Business Strength ── */
            const pillarsWithActive = PILLARS.filter(p => p.items.some(it => activeItems[it.id]));
            const strengthPct = Math.round((pillarsWithActive.length / 5) * 100);

            const strengthMessages: Record<number, string> = {
              0: "Your business is unstructured. Let's fix that.",
              20: "You've started. But 4 critical areas are still exposed.",
              40: "Getting stronger. But gaps remain.",
              60: "Solid foundation. A few more steps to full protection.",
              80: "Almost there. One more area to complete.",
              100: "Fully structured. Your business is built to last.",
            };
            const strengthMessage = strengthMessages[strengthPct] || strengthMessages[0];

            function itemStateColor(state: ItemState): string {
              if (state === "delivered") return GREEN;
              if (state === "in_progress") return GREEN;
              if (state === "paid") return GOLD;
              return `${GREY}60`;
            }

            function lineColor(fromState: ItemState, toState: ItemState): string {
              if (fromState !== "inactive" && toState !== "inactive") return GREEN;
              if (fromState !== "inactive" || toState !== "inactive") return GOLD;
              return `${GREY}40`;
            }

            return (
              <>
                {/* ═══ BUSINESS STRENGTH METER ═══ */}
                <div
                  className="mt-6 mb-6 rounded-2xl p-5 md:p-6 flex items-center gap-5"
                  style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
                >
                  {/* Circular gauge */}
                  <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke={`${GREY}30`} strokeWidth="6" />
                      <circle
                        cx="40" cy="40" r="34" fill="none"
                        stroke={strengthPct >= 60 ? GREEN : strengthPct >= 20 ? GOLD : GREY}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(strengthPct / 100) * 213.6} 213.6`}
                        transform="rotate(-90 40 40)"
                        style={{ transition: "stroke-dasharray 0.7s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[20px] font-semibold tabular-nums" style={{ color: DARK }}>{strengthPct}%</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: LABEL }}>
                      Business Strength
                    </p>
                    <p className="text-[14px] font-medium leading-snug mb-1" style={{ color: DARK }}>
                      {pillarsWithActive.length} of 5 pillars active
                    </p>
                    <p className="text-[12px] font-light leading-relaxed" style={{ color: MUTED }}>
                      {strengthMessage}
                    </p>
                  </div>
                </div>

                {/* ═══ PILLAR CARDS ═══ */}
                <div className="space-y-3 mb-8">
                  {PILLARS.map((pillar) => {
                    const PillarIcon = pillar.icon;
                    const activeCount = pillar.items.filter(it => activeItems[it.id]).length;
                    const totalCount = pillar.items.length;
                    const isExpanded = expandedArea === pillar.id;
                    const pillarColor = activeCount > 0 ? pillar.color : GREY;

                    return (
                      <div
                        key={pillar.id}
                        className="rounded-2xl overflow-hidden transition-all"
                        style={{
                          backgroundColor: WHITE,
                          borderLeft: `3px solid ${pillarColor}`,
                          border: `1px solid ${BORDER}`,
                          borderLeftWidth: 3,
                          borderLeftColor: pillarColor,
                        }}
                      >
                        {/* Collapsed header */}
                        <button
                          onClick={() => { setExpandedArea(isExpanded ? null : pillar.id); setSelectedItem(null); }}
                          className="w-full px-4 py-4 flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="shrink-0 flex items-center justify-center"
                              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${pillarColor}10` }}
                            >
                              <PillarIcon size={20} style={{ color: pillarColor }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold truncate" style={{ color: DARK }}>{pillar.label}</p>
                              <p className="text-[12px] font-light truncate" style={{ color: MUTED }}>{pillar.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {activeCount > 0 ? (
                              <span
                                className="text-[11px] font-medium px-2 py-0.5"
                                style={{ backgroundColor: `${GREEN}20`, color: GREEN, borderRadius: 12 }}
                              >
                                {activeCount}/{totalCount}
                              </span>
                            ) : (
                              <Lock size={14} style={{ color: GREY }} />
                            )}
                            <ChevronDown
                              size={16}
                              style={{ color: LABEL, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                            />
                          </div>
                        </button>

                        {/* Pitch for inactive pillars */}
                        {!isExpanded && activeCount === 0 && (
                          <div className="px-4 pb-3 -mt-1">
                            <p className="text-[12px] font-light italic" style={{ color: LABEL }}>{pillar.pitch}</p>
                          </div>
                        )}

                        {/* Expanded: horizontal timeline + item detail */}
                        {isExpanded && (
                          <div style={{ animation: "expandDown 0.3s ease-out both" }}>
                            {/* Horizontal scrollable items */}
                            <div className="overflow-x-auto px-4 pb-2">
                              <div className="flex items-center gap-1 py-4" style={{ minWidth: "max-content" }}>
                                {pillar.items.map((item, i) => {
                                  const state: ItemState = activeItems[item.id] || "inactive";
                                  const isSelected = selectedItem === item.id;
                                  const bgColor = state === "delivered" ? GREEN
                                    : state === "in_progress" ? GREEN
                                    : state === "paid" ? GOLD
                                    : `${GREY}40`;

                                  return (
                                    <div key={item.id} className="flex items-center">
                                      {i > 0 && (
                                        <div
                                          className="shrink-0"
                                          style={{
                                            width: 24,
                                            height: 2,
                                            backgroundColor: lineColor(
                                              activeItems[pillar.items[i - 1].id] || "inactive",
                                              state
                                            ),
                                          }}
                                        />
                                      )}
                                      <div
                                        className="shrink-0 text-center cursor-pointer"
                                        onClick={() => setSelectedItem(isSelected ? null : item.id)}
                                      >
                                        <div
                                          className="flex items-center justify-center mx-auto"
                                          style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: "50%",
                                            backgroundColor: bgColor,
                                            animation: state === "in_progress" ? "stagePulse 2s infinite" : "none",
                                            boxShadow: isSelected ? `0 0 0 3px ${bgColor}40` : "none",
                                            transition: "box-shadow 0.2s",
                                          }}
                                        >
                                          {state === "delivered" ? (
                                            <CheckCircle size={20} color="white" />
                                          ) : state === "in_progress" ? (
                                            <Clock size={20} color="white" />
                                          ) : state === "paid" ? (
                                            <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>N</span>
                                          ) : (
                                            <Lock size={16} color="#999" />
                                          )}
                                        </div>
                                        <p className="text-[10px] mt-1 leading-tight" style={{ color: state === "inactive" ? LABEL : MUTED }}>
                                          {item.short}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Item detail panel */}
                            {selectedItem && (() => {
                              const item = pillar.items.find(it => it.id === selectedItem);
                              if (!item) return null;
                              const state: ItemState = activeItems[item.id] || "inactive";

                              return (
                                <div
                                  className="mx-4 mb-4 rounded-xl p-4"
                                  style={{ backgroundColor: CREAM, border: `1px solid ${BORDER}`, animation: "fadeIn 0.2s ease-out" }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-[13px] font-medium" style={{ color: DARK }}>{item.label}</p>
                                    <span
                                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor: state === "delivered" ? `${GREEN}15` : state === "in_progress" ? `${GREEN}15` : state === "paid" ? `${GOLD}15` : `${GREY}20`,
                                        color: state === "delivered" ? GREEN : state === "in_progress" ? GREEN : state === "paid" ? GOLD : LABEL,
                                      }}
                                    >
                                      {state === "delivered" ? "Delivered" : state === "in_progress" ? "In Progress" : state === "paid" ? "Paid, Queued" : "Not Active"}
                                    </span>
                                  </div>

                                  {(state === "delivered" || state === "in_progress") && (
                                    <p className="text-[12px] font-light italic" style={{ color: MUTED }}>
                                      {state === "delivered"
                                        ? `Completed${task.createdAt ? ` -- ${formatDate(task.createdAt)}` : ""}. This item is in place.`
                                        : `Currently being handled.${task.deadline ? ` Expected: ${formatDate(task.deadline)}` : ""}`}
                                    </p>
                                  )}

                                  {state === "paid" && (
                                    <p className="text-[12px] font-light italic" style={{ color: MUTED }}>
                                      Paid and queued. This will start once the current active work completes.
                                    </p>
                                  )}

                                  {state === "inactive" && (
                                    <>
                                      <p className="text-[12px] font-light leading-relaxed mb-3" style={{ color: DARK }}>
                                        {pillar.pitch}
                                      </p>
                                      <button
                                        onClick={() => {
                                          setMobileChatOpen(true);
                                          setTimeout(() => handleChatSend(`I want to activate ${item.label}. What does it include and how do I get started?`), 100);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all hover:opacity-90"
                                        style={{ backgroundColor: GOLD, color: WHITE }}
                                      >
                                        <Unlock size={13} /> Activate <ArrowRight size={13} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              );
                            })()}

                            {/* If no item selected and pillar is inactive, show activate CTA */}
                            {!selectedItem && activeCount === 0 && (
                              <div className="mx-4 mb-4">
                                <button
                                  onClick={() => {
                                    setMobileChatOpen(true);
                                    setTimeout(() => handleChatSend(`I want to build my ${pillar.label.toLowerCase()}. What's included?`), 100);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all hover:opacity-90"
                                  style={{ backgroundColor: DARK, color: GOLD }}
                                >
                                  <Unlock size={13} /> Activate {pillar.label} <ArrowRight size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>


                {/* ═══ DOCUMENTS SECTION ═══ */}
                <div
                  className="rounded-2xl p-4 mb-8"
                  style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: GOLD }}>
                    Documents
                  </p>
                  {checklist.length > 0 ? (
                    <div className="space-y-1">
                      {checklist.map((item, ci) => (
                        <div key={ci} className="flex items-center gap-2 py-1.5">
                          {item.checked ? (
                            <CheckCircle size={16} style={{ color: GREEN }} />
                          ) : (
                            <Circle size={16} style={{ color: GREY }} />
                          )}
                          <span className="text-[13px] font-light flex-1" style={{ color: item.checked ? DARK : LABEL }}>
                            {item.label}
                          </span>
                          {item.checked && (
                            <span className="text-[11px]" style={{ color: LABEL }}>Received</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] font-light" style={{ color: LABEL }}>No documents needed at this stage.</p>
                  )}
                  <button
                    onClick={() => window.open(`https://wa.me/2348067149356?text=I need to upload documents. Ref: ${task.ref}`)}
                    className="mt-3 text-[12px] font-light"
                    style={{ color: GOLD, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Upload via WhatsApp →
                  </button>
                </div>


                {/* ═══ ACTIVE SERVICE CARD ═══ */}
                <div className="mb-8">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
                    style={{ color: LABEL }}
                  >
                    Active Service
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

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {task.createdAt && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: LABEL }}>
                            <Calendar size={10} /> Started: {formatDate(task.createdAt)}
                          </span>
                        )}
                        {task.deadline && !isCompleted && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: LABEL }}>
                            <Clock size={10} /> Due: {formatDate(task.deadline)}
                          </span>
                        )}
                      </div>

                      {invoiceSummary && invoiceSummary.paid > 0 && (
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: LABEL }}>
                            <CreditCard size={10} /> Paid: {formatNaira(invoiceSummary.paid)}
                          </span>
                          {invoiceSummary.total - invoiceSummary.paid > 0 && (
                            <span className="text-[11px] font-medium" style={{ color: ORANGE }}>
                              Balance: {formatNaira(invoiceSummary.total - invoiceSummary.paid)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    {!isCompleted && (task.progress || 0) > 0 && (
                      <div className="px-5 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <ProgressBar pct={task.progress || 0} color={deptAccent} />
                          </div>
                          <span className="text-[11px] font-medium tabular-nums" style={{ color: deptAccent }}>
                            {task.progress}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


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
              </>
            );
          })()}
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
