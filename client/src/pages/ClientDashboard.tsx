import { useState, useEffect, useRef } from "react";
import {
  CheckCircle, Circle, ChevronRight, Loader2, AlertCircle, LogOut,
  Clock, Send, MessageSquare, Receipt, Activity, Calendar,
  Building2, Phone, User, FileText, CreditCard, Copy,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

/* ── Unified brand — all refs are HAM-XXXX-YYYY (general grey) ── */
const THEME = { primary: "#86868B", accent: "#C9A97E", label: "HAMZURY" };
function getDeptTheme(_ref: string) { return THEME; }

const CREAM = "#FAFAF8";   // Milk white
const WHITE = "#FFFFFF";
const DARK = "#1D1D1F";
const GREY = "#86868B";    // Apple grey — general/client

const STATUS_STEPS = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];

const STATUS_MESSAGES: Record<string, string> = {
  "Not Started": "Your file has been received and is queued for processing. A compliance officer will begin work shortly.",
  "In Progress": "Your file is actively being worked on. Documents are being prepared and reviewed.",
  "Waiting on Client": "We need additional information or documents from you. Please check your WhatsApp for details.",
  "Submitted": "Your documents have been submitted to the relevant authority. We are awaiting their response.",
  "Completed": "Your file has been completed successfully. Please contact us to arrange document pickup.",
};

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

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
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

const PROMPTS = [
  {
    q: "Do you want to know exactly what your business needs to grow?",
    cta: "Get a free diagnosis",
    href: "/bizdoc",
  },
  {
    q: "Need brand identity or business automation?",
    cta: "Explore Systemise",
    href: "/systemise",
  },
  {
    q: "Want to upskill yourself or your team?",
    cta: "See Skills programs",
    href: "/skills",
  },
];

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

type TabId = "overview" | "activity" | "invoices" | "message";

export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [claimedInvoices, setClaimedInvoices] = useState<Set<string>>(new Set());
  const [copiedAcct, setCopiedAcct] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const s = loadClientSession();
    setSession(s);
    setSessionLoaded(true);
    if (!s) {
      window.location.href = "/client";
    }
  }, []);

  const theme = getDeptTheme(session?.ref ?? "");
  const PRIMARY = theme.primary;
  const ACCENT = theme.accent;

  // Full lookup query
  const { data, isLoading, isError } = trpc.tracking.fullLookup.useQuery(
    { ref: session?.ref ?? "", phone: session?.phone },
    {
      enabled: !!session?.ref,
      retry: false,
      refetchInterval: 30000,
    }
  );

  // Subscription history (for monthly service clients)
  const { data: subHistory } = trpc.subscriptions.clientHistory.useQuery(
    { ref: session?.ref ?? "" },
    { enabled: !!session?.ref, retry: false }
  );

  // Bank details (public)
  const { data: bankDetails } = trpc.invoices.bankDetails.useQuery(undefined, { staleTime: Infinity });

  // Claim payment mutation
  const claimMutation = trpc.invoices.claimPayment.useMutation({
    onSuccess: (_, vars) => {
      setClaimedInvoices(prev => new Set(prev).add(vars.invoiceNumber));
    },
  });

  // Client note mutation
  const noteMutation = trpc.tracking.submitClientNote.useMutation({
    onSuccess: () => {
      setMessage("");
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 4000);
    },
  });

  function handleLogout() {
    localStorage.removeItem("hamzury-client-session");
    window.location.href = "/client";
  }

  function handleSendMessage() {
    if (!message.trim() || !session?.ref) return;
    noteMutation.mutate({ ref: session.ref, message: message.trim() });
  }

  // Loading states
  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <Loader2 className="animate-spin" size={24} style={{ color: PRIMARY }} />
      </div>
    );
  }
  if (!session) return null;
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: CREAM }}>
        <Loader2 className="animate-spin" size={24} style={{ color: PRIMARY }} />
        <p className="text-[13px] font-light" style={{ color: PRIMARY, opacity: 0.5 }}>Loading your file...</p>
      </div>
    );
  }
  if (isError || !data || !data.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: CREAM }}>
        <AlertCircle size={32} style={{ color: "#DC2626" }} />
        <div className="text-center">
          <p className="text-[15px] font-light mb-1" style={{ color: PRIMARY }}>File not found</p>
          <p className="text-[12px] opacity-40" style={{ color: DARK }}>Reference: {session.ref}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[12px] font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-70"
          style={{ backgroundColor: PRIMARY, color: ACCENT }}
        >
          Try a different reference
        </button>
      </div>
    );
  }

  const task = data.task;
  const checklist = data.checklist || [];
  const activity = data.activity || [];
  const invoiceSummary = data.invoiceSummary;
  const completedChecklist = checklist.filter(c => c.checked);
  const statusIndex = task.statusIndex;
  const progress = task.progress;

  const tabs: { id: TabId; label: string; icon: React.ReactElement }[] = [
    { id: "overview", label: "Overview", icon: <FileText size={14} /> },
    { id: "activity", label: "Activity", icon: <Activity size={14} /> },
    { id: "invoices", label: "Invoices", icon: <Receipt size={14} /> },
    { id: "message", label: "Message", icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title={`${task.businessName || task.clientName} - HAMZURY`}
        description="Track your business compliance file, invoices, and activity."
      />

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-30 px-5 h-14 flex items-center justify-between"
        style={{ backgroundColor: `${CREAM}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${PRIMARY}0d` }}
      >
        <a href="/" className="text-[15px] font-light tracking-tight" style={{ color: PRIMARY, letterSpacing: "-0.03em" }}>
          HAMZURY
        </a>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono opacity-40" style={{ color: PRIMARY }}>{task.ref}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: PRIMARY }}
          >
            <LogOut size={12} />
            <span>Exit</span>
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-5 py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}>
              {theme.label}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-30" style={{ color: DARK }}>
              {task.department}
            </span>
          </div>
          <h1 className="text-[26px] md:text-[30px] font-light tracking-tight leading-tight" style={{ color: PRIMARY, letterSpacing: "-0.025em" }}>
            {task.businessName || task.clientName}
          </h1>
          <p className="text-[13px] font-light mt-1 opacity-50" style={{ color: DARK }}>
            {task.service}
          </p>
        </div>

        {/* ── Progress card ── */}
        <div className="rounded-3xl p-7 mb-6" style={{ backgroundColor: PRIMARY, color: WHITE }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-medium uppercase tracking-wider opacity-50">File Progress</span>
            <span className="text-[22px] font-light" style={{ color: ACCENT }}>{progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full mb-5" style={{ backgroundColor: `${WHITE}18` }}>
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, backgroundColor: ACCENT }}
            />
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between mb-5">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className="w-3 h-3 rounded-full mb-1.5 transition-colors"
                  style={{
                    backgroundColor: i < statusIndex ? "#16A34A" : i === statusIndex ? ACCENT : `${WHITE}25`,
                    boxShadow: i === statusIndex ? `0 0 0 3px ${ACCENT}30` : undefined,
                  }}
                />
                <span className="text-[8px] md:text-[9px] text-center leading-tight font-medium" style={{
                  color: i <= statusIndex ? `${WHITE}cc` : `${WHITE}35`,
                }}>
                  {step.replace("Waiting on Client", "Awaiting Info")}
                </span>
              </div>
            ))}
          </div>

          {/* Status badge + message */}
          <div className="mb-3">
            <span
              className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: `${ACCENT}25`, color: ACCENT }}
            >
              {task.status}
            </span>
          </div>
          <p className="text-[13px] font-light leading-relaxed opacity-75">
            {STATUS_MESSAGES[task.status] || "Status update pending."}
          </p>

          {task.deadline && (
            <div className="flex items-center gap-1.5 mt-4 opacity-40">
              <Calendar size={12} />
              <span className="text-[11px]">Target: {task.deadline}</span>
            </div>
          )}
        </div>

        {/* ── Client info strip ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          {task.clientName && (
            <div className="flex items-center gap-1.5 text-[11px] font-light opacity-40" style={{ color: DARK }}>
              <User size={12} /> {task.clientName}
            </div>
          )}
          {task.phone && (
            <div className="flex items-center gap-1.5 text-[11px] font-light opacity-40" style={{ color: DARK }}>
              <Phone size={12} /> {task.phone}
            </div>
          )}
          {task.department && (
            <div className="flex items-center gap-1.5 text-[11px] font-light opacity-40" style={{ color: DARK }}>
              <Building2 size={12} /> {task.department}
            </div>
          )}
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ backgroundColor: `${PRIMARY}08` }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? WHITE : "transparent",
                color: activeTab === tab.id ? PRIMARY : `${DARK}60`,
                boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.06)" : undefined,
              }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="space-y-6">

          {/* === OVERVIEW TAB === */}
          {activeTab === "overview" && (
            <>
              {/* Checklist */}
              {checklist.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
                    File Checklist ({completedChecklist.length} of {checklist.length} completed)
                  </p>
                  {/* Overall checklist progress */}
                  <div className="w-full h-1 rounded-full mb-4" style={{ backgroundColor: `${PRIMARY}10` }}>
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${checklist.length > 0 ? Math.round((completedChecklist.length / checklist.length) * 100) : 0}%`,
                        backgroundColor: completedChecklist.length === checklist.length ? "#16A34A" : ACCENT,
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 py-2 px-3 rounded-xl" style={{
                        backgroundColor: item.checked ? `#16A34A08` : WHITE,
                        border: `1px solid ${item.checked ? "#16A34A15" : `${PRIMARY}06`}`,
                      }}>
                        {item.checked ? (
                          <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#16A34A" }} />
                        ) : (
                          <Circle size={16} className="mt-0.5 shrink-0 opacity-25" style={{ color: PRIMARY }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] font-light leading-snug" style={{
                            color: item.checked ? "#16A34A" : DARK,
                            opacity: item.checked ? 0.7 : 1,
                          }}>
                            {item.label}
                          </span>
                          {item.phase && (
                            <span className="ml-2 text-[9px] font-bold uppercase tracking-wider opacity-30" style={{ color: DARK }}>
                              {item.phase}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status steps (fallback when no checklist) */}
              {checklist.length === 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
                    Process Steps
                  </p>
                  <div className="space-y-1">
                    {STATUS_STEPS.map((step, i) => (
                      <div key={step} className="flex items-center gap-3 py-2 px-3 rounded-xl" style={{
                        backgroundColor: i === statusIndex ? `${ACCENT}08` : "transparent",
                      }}>
                        {i < statusIndex ? (
                          <CheckCircle size={16} className="shrink-0" style={{ color: "#16A34A" }} />
                        ) : i === statusIndex ? (
                          <div className="relative">
                            <Circle size={16} className="shrink-0" style={{ color: ACCENT }} />
                            <div className="absolute inset-0 animate-ping" style={{ color: ACCENT, opacity: 0.3 }}>
                              <Circle size={16} />
                            </div>
                          </div>
                        ) : (
                          <Circle size={16} className="shrink-0 opacity-20" style={{ color: DARK }} />
                        )}
                        <span className="text-[13px] font-light" style={{
                          color: i < statusIndex ? "#16A34A" : i === statusIndex ? PRIMARY : DARK,
                          opacity: i > statusIndex ? 0.3 : 1,
                          fontWeight: i === statusIndex ? 500 : 300,
                        }}>
                          {step}
                        </span>
                        {i === statusIndex && (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subscription History */}
              {subHistory && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
                    Monthly Service -- {subHistory.service}
                  </p>
                  <div className="space-y-2">
                    {subHistory.monthlyTasks.length === 0 ? (
                      <p className="text-[13px] font-light opacity-40" style={{ color: PRIMARY }}>No monthly tasks yet.</p>
                    ) : (
                      subHistory.monthlyTasks.map((t: { month: string | null; status: string; kpiApproved: boolean }) => (
                        <div key={t.month} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: WHITE, border: `1px solid ${PRIMARY}08` }}>
                          <div className="flex items-center gap-3">
                            {t.kpiApproved ? (
                              <CheckCircle size={16} style={{ color: "#16A34A" }} />
                            ) : t.status === "Completed" ? (
                              <CheckCircle size={16} style={{ color: "#16A34A", opacity: 0.5 }} />
                            ) : (
                              <Circle size={16} style={{ color: PRIMARY, opacity: 0.3 }} />
                            )}
                            <span className="text-[13px] font-light" style={{ color: PRIMARY }}>{t.month}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            t.kpiApproved ? "bg-green-100 text-green-700" :
                            t.status === "Submitted" ? "bg-blue-100 text-blue-700" :
                            t.status === "In Progress" ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {t.kpiApproved ? "Filed" : t.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Quick invoice summary (on overview) */}
              {invoiceSummary && (
                <div className="rounded-2xl p-5" style={{ backgroundColor: WHITE, border: `1px solid ${PRIMARY}08` }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
                    Invoice Summary
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider opacity-40 mb-1" style={{ color: DARK }}>Total</p>
                      <p className="text-[16px] font-semibold" style={{ color: PRIMARY }}>{formatNaira(invoiceSummary.total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider opacity-40 mb-1" style={{ color: DARK }}>Paid</p>
                      <p className="text-[16px] font-semibold" style={{ color: "#16A34A" }}>{formatNaira(invoiceSummary.paid)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider opacity-40 mb-1" style={{ color: DARK }}>Balance</p>
                      <p className="text-[16px] font-semibold" style={{
                        color: invoiceSummary.total - invoiceSummary.paid > 0 ? "#DC2626" : "#16A34A",
                      }}>
                        {formatNaira(invoiceSummary.total - invoiceSummary.paid)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* === ACTIVITY TAB === */}
          {activeTab === "activity" && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
                Recent Activity
              </p>
              {activity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={32} className="mx-auto mb-3 opacity-15" style={{ color: DARK }} />
                  <p className="text-[13px] font-light opacity-40" style={{ color: DARK }}>No activity recorded yet.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-3 bottom-3 w-px" style={{ backgroundColor: `${PRIMARY}10` }} />
                  <div className="space-y-1">
                    {activity.map((a, i) => (
                      <div key={a.id} className="flex items-start gap-4 py-3 pl-1 relative">
                        {/* Timeline dot */}
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                          style={{
                            backgroundColor: a.action === "client_note" ? `${ACCENT}20` :
                              a.action === "status_change" ? `${PRIMARY}15` :
                              a.action === "payment_confirmed" ? "#16A34A15" :
                              `${DARK}08`,
                          }}
                        >
                          {a.action === "client_note" ? <MessageSquare size={10} style={{ color: ACCENT }} /> :
                           a.action === "status_change" ? <Activity size={10} style={{ color: PRIMARY }} /> :
                           a.action === "payment_confirmed" ? <Receipt size={10} style={{ color: "#16A34A" }} /> :
                           <Clock size={10} style={{ color: DARK, opacity: 0.4 }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium" style={{ color: PRIMARY }}>
                            {ACTIVITY_LABELS[a.action] || a.action.replace(/_/g, " ")}
                          </p>
                          {a.details && (
                            <p className="text-[11px] font-light mt-0.5 leading-relaxed opacity-55" style={{ color: DARK }}>
                              {a.details.replace("Client message: ", "")}
                            </p>
                          )}
                          <p className="text-[10px] mt-1 opacity-30" style={{ color: DARK }}>
                            {timeAgo(a.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === INVOICES TAB === */}
          {activeTab === "invoices" && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
                Invoices & Payments
              </p>
              {!invoiceSummary || invoiceSummary.invoices.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt size={32} className="mx-auto mb-3 opacity-15" style={{ color: DARK }} />
                  <p className="text-[13px] font-light opacity-40" style={{ color: DARK }}>No invoices generated yet.</p>
                  <p className="text-[11px] font-light mt-1 opacity-25" style={{ color: DARK }}>
                    Your invoices will appear here once generated by the team.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: PRIMARY }}>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: `${WHITE}50` }}>Total</p>
                        <p className="text-[16px] font-semibold" style={{ color: WHITE }}>{formatNaira(invoiceSummary.total)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: `${WHITE}50` }}>Paid</p>
                        <p className="text-[16px] font-semibold" style={{ color: ACCENT }}>{formatNaira(invoiceSummary.paid)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: `${WHITE}50` }}>Balance</p>
                        <p className="text-[16px] font-semibold" style={{
                          color: invoiceSummary.total - invoiceSummary.paid > 0 ? "#F87171" : "#4ADE80",
                        }}>
                          {formatNaira(invoiceSummary.total - invoiceSummary.paid)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Individual invoices */}
                  <div className="space-y-3">
                    {invoiceSummary.invoices.map((inv) => {
                      const balance = inv.total - inv.paid;
                      const isPaid = inv.status === "paid";
                      const hasClaimed = claimedInvoices.has(inv.number);
                      const statusBg = isPaid ? "bg-green-100 text-green-700" :
                        inv.status === "partial" ? "bg-amber-100 text-amber-700" :
                        inv.status === "overdue" ? "bg-red-100 text-red-700" :
                        inv.status === "sent" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-500";
                      return (
                        <div key={inv.number} className="rounded-xl overflow-hidden" style={{ backgroundColor: WHITE, border: `1px solid ${PRIMARY}08` }}>
                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-mono font-medium" style={{ color: PRIMARY }}>{inv.number}</span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBg}`}>
                                {inv.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[14px] font-semibold" style={{ color: PRIMARY }}>{formatNaira(inv.total)}</span>
                              {balance > 0 && (
                                <span className="text-[11px] font-light" style={{ color: "#DC2626" }}>
                                  Balance: {formatNaira(balance)}
                                </span>
                              )}
                            </div>
                            {inv.dueDate && (
                              <p className="text-[10px] mt-1 opacity-30" style={{ color: DARK }}>
                                Due: {new Date(inv.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>

                          {/* Bank transfer section — only for unpaid/partial invoices */}
                          {!isPaid && balance > 0 && bankDetails?.configured && (
                            <div className="px-4 pb-4">
                              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: `${PRIMARY}06`, border: `1px solid ${PRIMARY}12` }}>
                                <p className="text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: PRIMARY }}>
                                  <CreditCard size={10} /> Bank Transfer Details
                                </p>
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px] opacity-50" style={{ color: DARK }}>Bank</span>
                                    <span className="text-[11px] font-medium" style={{ color: DARK }}>{bankDetails.bankName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px] opacity-50" style={{ color: DARK }}>Account Name</span>
                                    <span className="text-[11px] font-medium" style={{ color: DARK }}>{bankDetails.accountName}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[11px] opacity-50" style={{ color: DARK }}>Account No.</span>
                                    <button
                                      className="flex items-center gap-1 text-[11px] font-mono font-bold transition-opacity hover:opacity-70"
                                      style={{ color: PRIMARY }}
                                      onClick={() => {
                                        navigator.clipboard.writeText(bankDetails.accountNumber);
                                        setCopiedAcct(true);
                                        setTimeout(() => setCopiedAcct(false), 2000);
                                      }}
                                    >
                                      {bankDetails.accountNumber}
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                  {copiedAcct && (
                                    <p className="text-[10px] text-center" style={{ color: "#16A34A" }}>Copied!</p>
                                  )}
                                </div>
                                <p className="text-[10px] mt-2 opacity-40 text-center" style={{ color: DARK }}>
                                  Transfer {formatNaira(balance)} then click below
                                </p>
                              </div>

                              {hasClaimed ? (
                                <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl" style={{ backgroundColor: "#DCFCE7" }}>
                                  <CheckCircle size={12} style={{ color: "#16A34A" }} />
                                  <span className="text-[11px] font-medium" style={{ color: "#166534" }}>
                                    Payment claim received — we'll confirm shortly
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => claimMutation.mutate({ invoiceNumber: inv.number, clientName: inv.clientName })}
                                  disabled={claimMutation.isPending}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-40"
                                  style={{ backgroundColor: PRIMARY, color: ACCENT }}
                                >
                                  {claimMutation.isPending ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <CheckCircle size={12} />
                                  )}
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

          {/* === MESSAGE TAB === */}
          {activeTab === "message" && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: DARK, opacity: 0.4 }}>
                Send a Message
              </p>
              <p className="text-[12px] font-light mb-4 opacity-50" style={{ color: DARK }}>
                Leave a note for your assigned team. They will see it in their dashboard and respond via WhatsApp.
              </p>

              {messageSent && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: "#DCFCE7" }}>
                  <CheckCircle size={14} style={{ color: "#16A34A" }} />
                  <p className="text-[12px] font-medium" style={{ color: "#166534" }}>Message sent successfully. Your team has been notified.</p>
                </div>
              )}

              <div className="rounded-2xl p-1" style={{ backgroundColor: WHITE, border: `1px solid ${PRIMARY}0a` }}>
                <textarea
                  ref={msgRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here... (e.g., document updates, questions about your file)"
                  className="w-full p-4 text-[14px] font-light bg-transparent resize-none focus:outline-none"
                  style={{ color: DARK, minHeight: 120 }}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <span className="text-[10px] opacity-25" style={{ color: DARK }}>{message.length}/1000</span>
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || noteMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-30"
                    style={{ backgroundColor: PRIMARY, color: ACCENT }}
                  >
                    {noteMutation.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
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

              {/* Previous client messages from activity */}
              {activity.filter(a => a.action === "client_note").length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: DARK, opacity: 0.4 }}>
                    Your Previous Messages
                  </p>
                  <div className="space-y-2">
                    {activity.filter(a => a.action === "client_note").map(a => (
                      <div key={a.id} className="rounded-xl px-4 py-3" style={{ backgroundColor: `${ACCENT}08`, border: `1px solid ${ACCENT}15` }}>
                        <p className="text-[13px] font-light" style={{ color: DARK }}>
                          {a.details?.replace("Client message: ", "")}
                        </p>
                        <p className="text-[10px] mt-1 opacity-30" style={{ color: DARK }}>{timeAgo(a.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="my-8" style={{ height: 1, backgroundColor: `${PRIMARY}0d` }} />

        {/* ── Cross-sell prompts ── */}
        <div className="space-y-3">
          {PROMPTS.map((p) => (
            <a
              key={p.q}
              href={p.href}
              className="flex items-center justify-between rounded-2xl px-5 py-4 group transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ backgroundColor: WHITE, border: `1px solid ${PRIMARY}08` }}
            >
              <div>
                <p className="text-[13px] font-light leading-snug mb-0.5" style={{ color: PRIMARY }}>
                  {p.q}
                </p>
                <span className="text-[11px] font-semibold" style={{ color: ACCENT }}>
                  {p.cta}
                </span>
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 ml-3 transition-transform group-hover:translate-x-1 opacity-30"
                style={{ color: PRIMARY }}
              />
            </a>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="text-center pt-8 pb-4 space-y-2">
          <p className="text-[11px] opacity-25" style={{ color: DARK }}>
            Questions? WhatsApp your CSO on 08067149356
          </p>
          <p className="text-[10px] opacity-15" style={{ color: DARK }}>
            Ref: {task.ref} | Last updated: {new Date(task.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </main>
    </div>
  );
}
