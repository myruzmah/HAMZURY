import { useState, useEffect, useRef, useMemo } from "react";
import {
  CheckCircle, Circle, ChevronRight, Loader2, AlertCircle, LogOut,
  Send, MessageSquare, Calendar,
  Phone, CreditCard, Copy,
  Unlock, ArrowRight, Quote,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import ChatWidget from "../components/ChatWidget";
import { trpc } from "@/lib/trpc";

/* ── Brand constants ── */
const CREAM = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";
const GREEN = "#22C55E";
const BORDER = "#2D2D2D08";

const DEPT_COLORS: Record<string, string> = {
  bizdoc: "#1B4D3E",
  systemise: "#2563EB",
  skills: "#1E3A5F",
  general: "#2D2D2D",
};

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

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ── Next Unlock logic ── */
function getNextUnlock(service: string, department: string, _status: string) {
  const s = (service || "").toLowerCase();

  if (s.includes("cac") || s.includes("registration")) {
    return {
      title: "Tax Compliance (TIN + VAT)",
      why: "Without tax compliance, you cannot bid for government contracts or get a Tax Clearance Certificate. This is what separates serious businesses from informal ones.",
      dept: "bizdoc",
    };
  }
  if (s.includes("tax") || s.includes("tin") || s.includes("tcc")) {
    return {
      title: "Industry Licence for Your Sector",
      why: "Every sector has specific regulatory requirements. Operating without the right licence puts your business at risk of shutdown or penalties.",
      dept: "bizdoc",
    };
  }
  if (s.includes("licence") || s.includes("permit") || s.includes("nafdac")) {
    return {
      title: "Brand Identity & Website",
      why: "Your compliance is sorted. Now premium clients need to trust you instantly when they find you online. A strong brand and website make that happen.",
      dept: "systemise",
    };
  }
  if (s.includes("website") || s.includes("brand")) {
    return {
      title: "Business Automation & CRM",
      why: "Your brand is live. Now automate the parts of your business that repeat every week -- follow-ups, invoicing, lead management. Stop doing it manually.",
      dept: "systemise",
    };
  }
  if (s.includes("automation") || s.includes("crm") || s.includes("dashboard")) {
    return {
      title: "Team Training & Enablement",
      why: "Systems are only as good as the people using them. Train your team to operate the tools and processes you have built.",
      dept: "skills",
    };
  }
  if (s.includes("training") || s.includes("skill") || s.includes("cohort")) {
    return {
      title: "Full Business Documentation",
      why: "You have the skills and systems. Make sure your business structure, contracts, and compliance are fully documented and protected.",
      dept: "bizdoc",
    };
  }
  return {
    title: "Business Positioning Guide",
    why: "Not sure what your business needs next? Our advisor can map your full business requirements based on your sector and goals.",
    dept: "general",
  };
}

/* ── Service importance descriptions ── */
function getServiceImportance(service: string): string {
  const s = (service || "").toLowerCase();
  if (s.includes("cac")) return "Your business is now legally recognized. This unlocks banking, contracts, tax filing, and tender eligibility.";
  if (s.includes("tin") || s.includes("tax")) return "Tax compliance protects you from penalties and enables you to get a Tax Clearance Certificate.";
  if (s.includes("licence") || s.includes("nafdac")) return "Your sector licence means you can legally operate and avoid regulatory shutdown.";
  if (s.includes("website")) return "Your online presence makes clients trust you before they even call.";
  if (s.includes("brand")) return "A strong brand identity makes premium clients choose you over competitors.";
  if (s.includes("automation")) return "Automated workflows save your team hours every week on repetitive tasks.";
  if (s.includes("training") || s.includes("skill")) return "Real capability means your team delivers better, faster, and with less supervision.";
  if (s.includes("social") || s.includes("media")) return "Consistent social media presence builds authority and attracts clients who already trust you.";
  if (s.includes("foreign") || s.includes("cerpac")) return "Your foreign business registration enables you to operate legally in Nigeria with full compliance.";
  if (s.includes("scuml")) return "SCUML registration is a mandatory anti-money laundering requirement for designated non-financial businesses.";
  return "This service strengthens your business structure and reduces risk.";
}

/** Context-aware upsell -- changes based on client's current service */
function getSmartPrompts(service: string, status: string, dept: string) {
  const s = (service || "").toLowerCase();
  const done = status === "Completed";

  if (s.includes("cac") || s.includes("registration") || dept === "bizdoc") {
    return [
      { q: done ? "Registration done. But does your business have TIN, tax compliance, and proper contracts? Most don't." : "While we handle your registration, consider this: are your tax filings and contracts also sorted?", cta: "Check what I'm missing", chat: true },
      { q: "73% of registered businesses also need a proper website and brand identity to win premium clients.", cta: "Talk to my advisor about this", chat: true },
      { q: done ? "Your team will need to use these new documents properly. Want us to train them?" : "Want your staff trained on compliance processes while we handle the paperwork?", cta: "Ask about training", chat: true },
    ];
  }
  if (s.includes("website") || s.includes("brand") || s.includes("system") || dept === "systemise") {
    return [
      { q: "A great system is useless if your business documents are not in order. Is your compliance fully sorted?", cta: "Check my compliance", chat: true },
      { q: done ? "Your system is ready. Now your team needs to know how to use it properly." : "Once your system is live, will your team actually use it without training?", cta: "Ask about team training", chat: true },
      { q: "Are you also managing your social media? We can handle that while you focus on your business.", cta: "Talk about social media", chat: true },
    ];
  }
  if (s.includes("training") || s.includes("skill") || dept === "skills") {
    return [
      { q: "Skills are powerful when your business structure supports them. Is your compliance and documentation solid?", cta: "Check my business structure", chat: true },
      { q: "Ready to apply what you learned? We can build the systems and dashboards your business needs.", cta: "Talk about systems", chat: true },
      { q: "Want your whole team trained, not just you? Corporate training packages start from custom pricing.", cta: "Ask about team training", chat: true },
    ];
  }
  return [
    { q: "Every serious business needs proper documentation, strong systems, and capable people. Which is your weakest link?", cta: "Find out what I need", chat: true },
    { q: "Is your brand making premium clients trust you? If not, that's fixable.", cta: "Talk to my advisor", chat: true },
    { q: "Want to build real skills that lead to earning? Our programs are built for action, not theory.", cta: "See what fits me", chat: true },
  ];
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

const STATUS_STEPS = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];

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

/* ────────────────────────────────────────────────────────────────────────── */
/*  BUSINESS GROWTH GUIDE                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [claimedInvoices, setClaimedInvoices] = useState<Set<string>>(new Set());
  const [copiedAcct, setCopiedAcct] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const s = loadClientSession();
    setSession(s);
    setSessionLoaded(true);
    if (!s) {
      window.location.href = "/client";
    }
  }, []);

  /* ── Random founder quote (stable per session) ── */
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
    window.location.href = "/client";
  }

  function handleSendMessage() {
    if (!message.trim() || !session?.ref) return;
    noteMutation.mutate({ ref: session.ref, message: message.trim() });
  }

  /* ── Loading / error states ── */
  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <Loader2 className="animate-spin" size={24} style={{ color: DARK }} />
      </div>
    );
  }
  if (!session) return null;
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: CREAM }}>
        <Loader2 className="animate-spin" size={24} style={{ color: DARK }} />
        <p className="text-[13px] font-light" style={{ color: DARK, opacity: 0.5 }}>Loading your growth guide...</p>
      </div>
    );
  }
  if (isError || !data || !data.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: CREAM }}>
        <AlertCircle size={32} style={{ color: "#DC2626" }} />
        <div className="text-center">
          <p className="text-[15px] font-light mb-1" style={{ color: DARK }}>File not found</p>
          <p className="text-[12px] opacity-40" style={{ color: DARK }}>Reference: {session.ref}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[12px] font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
          style={{ backgroundColor: DARK, color: GOLD }}
        >
          Try a different reference
        </button>
      </div>
    );
  }

  /* ── Destructure data ── */
  const task = data.task;
  const checklist = data.checklist || [];
  const activity = data.activity || [];
  const invoiceSummary = data.invoiceSummary;
  const completedChecklist = checklist.filter((c) => c.checked);
  const clientMessages = activity.filter((a) => a.action === "client_note");

  const isBizdoc = (task.department || "").toLowerCase() === "bizdoc";
  const activeBankDetails = bankDetails
    ? isBizdoc && bankDetails.bizdoc.configured
      ? bankDetails.bizdoc
      : bankDetails.general
    : null;

  const smartPrompts = getSmartPrompts(task.service, task.status, task.department);

  /* ── Computed: service status counts ── */
  const isCompleted = task.status === "Completed";
  const isActive = !isCompleted && task.status !== "Not Started";
  const deliveredCount = isCompleted ? 1 : 0;
  const activeCount = isActive ? 1 : (task.status === "Not Started" ? 1 : 0);
  const nextUnlock = getNextUnlock(task.service, task.department, task.status);
  const nextUnlockColor = DEPT_COLORS[nextUnlock.dept] || GOLD;

  /* ── Departments the client is NOT using ── */
  const currentDept = (task.department || "").toLowerCase();
  const allDepts = [
    {
      key: "bizdoc",
      name: "BIZDOC",
      color: DEPT_COLORS.bizdoc,
      desc: "Compliance, licences, templates, contracts",
      pitch: "Is your business fully documented?",
      url: "/bizdoc",
    },
    {
      key: "systemise",
      name: "SYSTEMISE",
      color: DEPT_COLORS.systemise,
      desc: "Brand, website, automation, AI agents",
      pitch: "Does your brand make premium clients trust you instantly?",
      url: "/systemise",
    },
    {
      key: "skills",
      name: "SKILLS",
      color: DEPT_COLORS.skills,
      desc: "Founder programs, team training, AI skills",
      pitch: "Learn what actually works.",
      url: "/skills",
    },
  ];
  const unusedDepts = allDepts.filter((d) => d.key !== currentDept);

  /* ── Invoices ── */
  const hasInvoices = invoiceSummary && invoiceSummary.invoices.length > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title={`${task.businessName || task.clientName} - Business Growth Guide | HAMZURY`}
        description="Your personal business growth guide. Track services, unlock next steps, and talk to your advisor."
      />

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  HEADER                                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
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
            08067149356
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

      <main className="max-w-2xl mx-auto px-5 md:px-8">

        {/* ── Welcome header ── */}
        <div className="pt-10 pb-8">
          <p className="text-[14px] font-light mb-1" style={{ color: MUTED }}>
            Welcome back, {task.clientName}
          </p>
          <h1
            className="text-[24px] md:text-[28px] font-light tracking-tight leading-tight"
            style={{ color: DARK, letterSpacing: "-0.025em" }}
          >
            {task.businessName || task.clientName}
          </h1>
        </div>


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 1: YOUR GROWTH JOURNEY                                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: MUTED }}
          >
            Your Growth Journey
          </p>

          {/* Active/Delivered service card */}
          <div
            className="rounded-2xl p-6 mb-4"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${isCompleted ? GREEN : GOLD}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: isCompleted ? `${GREEN}12` : `${GOLD}12`,
                  color: isCompleted ? GREEN : GOLD,
                }}
              >
                {isCompleted ? "Delivered" : task.status === "Not Started" ? "Queued" : "Active"}
              </span>
              <span
                className="text-[11px] font-light"
                style={{ color: MUTED }}
              >
                {task.department || "HAMZURY"}
              </span>
            </div>

            <h3
              className="text-[18px] font-medium leading-snug mb-2"
              style={{ color: DARK }}
            >
              {task.service}
            </h3>

            {/* Progress bar (only if not completed) */}
            {!isCompleted && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-light" style={{ color: MUTED }}>
                    {task.status}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums" style={{ color: GOLD }}>
                    {task.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: `${DARK}08` }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${task.progress}%`, backgroundColor: GOLD }}
                  />
                </div>
              </div>
            )}

            {/* Delivered date or deadline */}
            {isCompleted && task.updatedAt && (
              <p className="text-[12px] font-light mb-3" style={{ color: MUTED }}>
                Delivered: {formatDate(task.updatedAt)}
              </p>
            )}
            {!isCompleted && task.deadline && (
              <p className="text-[12px] font-light mb-3" style={{ color: MUTED }}>
                Expected: {formatDate(task.deadline)}
              </p>
            )}

            {/* Why this matters */}
            <p
              className="text-[13px] font-light leading-relaxed italic"
              style={{ color: `${DARK}80` }}
            >
              "{getServiceImportance(task.service)}"
            </p>

            {/* Checklist mini-summary if exists */}
            {checklist.length > 0 && (
              <div
                className="flex items-center gap-3 mt-4 pt-3"
                style={{ borderTop: `1px solid ${DARK}06` }}
              >
                <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: `${DARK}08` }}>
                  <div
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((completedChecklist.length / checklist.length) * 100)}%`,
                      backgroundColor: completedChecklist.length === checklist.length ? GREEN : GOLD,
                    }}
                  />
                </div>
                <span className="text-[11px] font-light" style={{ color: MUTED }}>
                  {completedChecklist.length}/{checklist.length} steps
                </span>
              </div>
            )}
          </div>

          {/* Subscription monthly tasks if applicable */}
          {subHistory && subHistory.monthlyTasks.length > 0 && (
            <div
              className="rounded-2xl p-6 mb-4"
              style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: MUTED }}>
                Monthly Service: {subHistory.service}
              </p>
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
          )}

          {/* NEXT UNLOCK card */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: WHITE,
              border: `1px solid ${GOLD}25`,
              borderLeft: `3px solid ${GOLD}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Unlock size={14} style={{ color: GOLD }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: GOLD }}
              >
                Next Unlock
              </span>
            </div>
            <h3
              className="text-[16px] font-medium leading-snug mb-2"
              style={{ color: DARK }}
            >
              {nextUnlock.title}
            </h3>
            <p
              className="text-[13px] font-light leading-relaxed mb-5"
              style={{ color: `${DARK}80` }}
            >
              "{nextUnlock.why}"
            </p>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: nextUnlockColor, color: WHITE }}
            >
              Activate this
              <ArrowRight size={14} />
            </button>
          </div>
        </div>


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 2: SIMPLE ANALYTICS                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Active services", value: activeCount, color: isActive ? GREEN : MUTED },
            { label: "Delivered", value: deliveredCount, color: deliveredCount > 0 ? GREEN : MUTED },
            { label: "Next unlock", value: 1, color: GOLD },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 text-center"
              style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
            >
              <p
                className="text-[28px] font-light tabular-nums mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p className="text-[11px] font-light" style={{ color: MUTED }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 3: DEPARTMENTS NOT YET ACTIVATED                      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {unusedDepts.length > 0 && (
          <div className="mb-8">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
              style={{ color: MUTED }}
            >
              Departments Not Yet Activated
            </p>
            <div className="space-y-3">
              {unusedDepts.map((dept) => (
                <button
                  key={dept.key}
                  onClick={() => setChatOpen(true)}
                  className="w-full text-left rounded-2xl p-5 transition-all hover:shadow-sm group"
                  style={{
                    backgroundColor: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${dept.color}`,
                  }}
                >
                  <p
                    className="text-[14px] font-medium mb-1"
                    style={{ color: dept.color }}
                  >
                    {dept.name}
                  </p>
                  <p className="text-[12px] font-light mb-1" style={{ color: MUTED }}>
                    {dept.desc}
                  </p>
                  <p
                    className="text-[13px] font-light italic mb-3"
                    style={{ color: `${DARK}70` }}
                  >
                    "{dept.pitch}"
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-medium transition-all group-hover:gap-2"
                    style={{ color: dept.color }}
                  >
                    Explore
                    <ChevronRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 4: FOUNDER QUOTE                                      */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-8"
          style={{
            backgroundColor: WHITE,
            border: `1px solid ${GOLD}15`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${GOLD}10` }}
            >
              <Quote size={14} style={{ color: GOLD }} />
            </div>
            <div>
              <p
                className="text-[14px] font-light leading-relaxed italic mb-3"
                style={{ color: DARK }}
              >
                "{founderQuote}"
              </p>
              <p className="text-[12px] font-medium" style={{ color: GOLD }}>
                -- Muhammad Hamzury
              </p>
            </div>
          </div>
        </div>


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 5: ACTIONS                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setChatOpen(true)}
            className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all hover:shadow-sm"
            style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
          >
            <MessageSquare size={18} style={{ color: DARK }} />
            <span className="text-[11px] font-medium text-center leading-tight" style={{ color: DARK }}>
              Talk to my advisor
            </span>
          </button>
          <button
            onClick={() =>
              window.open(
                "https://wa.me/2348067149356?text=I'd like to schedule a call. My ref: " + task.ref,
                "_blank"
              )
            }
            className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all hover:shadow-sm"
            style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
          >
            <Calendar size={18} style={{ color: DARK }} />
            <span className="text-[11px] font-medium text-center leading-tight" style={{ color: DARK }}>
              Schedule a call
            </span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("message-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all hover:shadow-sm"
            style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
          >
            <Send size={18} style={{ color: DARK }} />
            <span className="text-[11px] font-medium text-center leading-tight" style={{ color: DARK }}>
              Send a message
            </span>
          </button>
        </div>


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  INVOICES (if any)                                             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {hasInvoices && (
          <div className="mb-8">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
              style={{ color: MUTED }}
            >
              Invoices
            </p>

            {/* Summary strip */}
            <div
              className="grid grid-cols-3 gap-4 rounded-2xl p-5 mb-4"
              style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: MUTED }}>
                  Total
                </p>
                <p className="text-[16px] font-semibold" style={{ color: DARK }}>
                  {formatNaira(invoiceSummary!.total)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: MUTED }}>
                  Paid
                </p>
                <p className="text-[16px] font-semibold" style={{ color: GREEN }}>
                  {formatNaira(invoiceSummary!.paid)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: MUTED }}>
                  Balance
                </p>
                <p
                  className="text-[16px] font-semibold"
                  style={{
                    color: invoiceSummary!.total - invoiceSummary!.paid > 0 ? "#DC2626" : GREEN,
                  }}
                >
                  {formatNaira(invoiceSummary!.total - invoiceSummary!.paid)}
                </p>
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
                        <span className="text-[11px] font-mono font-medium" style={{ color: DARK }}>
                          {inv.number}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${statusColor}12`, color: statusColor }}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold" style={{ color: DARK }}>
                          {formatNaira(inv.total)}
                        </span>
                        {balance > 0 && (
                          <span className="text-[11px] font-light" style={{ color: "#DC2626" }}>
                            Balance: {formatNaira(balance)}
                          </span>
                        )}
                      </div>
                      {inv.dueDate && (
                        <p className="text-[10px] mt-1" style={{ color: `${DARK}30` }}>
                          Due: {formatDate(inv.dueDate)}
                        </p>
                      )}
                    </div>

                    {/* Bank transfer section */}
                    {!isPaid && balance > 0 && activeBankDetails?.configured && (
                      <div className="px-5 pb-4">
                        <div
                          className="rounded-xl p-3 mb-3"
                          style={{ backgroundColor: CREAM, border: `1px solid ${DARK}06` }}
                        >
                          <p
                            className="text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                            style={{ color: DARK }}
                          >
                            <CreditCard size={10} /> Bank Transfer Details
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px]" style={{ color: MUTED }}>Bank</span>
                              <span className="text-[11px] font-medium" style={{ color: DARK }}>
                                {activeBankDetails!.bankName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px]" style={{ color: MUTED }}>Account Name</span>
                              <span className="text-[11px] font-medium" style={{ color: DARK }}>
                                {activeBankDetails!.accountName}
                              </span>
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
                              <p className="text-[10px] text-center" style={{ color: GREEN }}>
                                Copied!
                              </p>
                            )}
                          </div>
                          <p className="text-[10px] mt-2 text-center" style={{ color: MUTED }}>
                            Transfer {formatNaira(balance)} then click below
                          </p>
                        </div>

                        {hasClaimed ? (
                          <div
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl"
                            style={{ backgroundColor: "#DCFCE7" }}
                          >
                            <CheckCircle size={12} style={{ color: GREEN }} />
                            <span className="text-[11px] font-medium" style={{ color: "#166534" }}>
                              Payment claim received -- we'll confirm shortly
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              claimMutation.mutate({
                                invoiceNumber: inv.number,
                                clientName: inv.clientName,
                              })
                            }
                            disabled={claimMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: DARK, color: GOLD }}
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
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 6: MESSAGE                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div id="message-section" className="mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-4"
            style={{ color: MUTED }}
          >
            Send a message to your team
          </p>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
          >
            {messageSent && (
              <div
                className="flex items-center gap-2 p-3 mx-5 mt-4 rounded-xl"
                style={{ backgroundColor: "#DCFCE7" }}
              >
                <CheckCircle size={14} style={{ color: GREEN }} />
                <p className="text-[12px] font-medium" style={{ color: "#166534" }}>
                  Message sent. Your team has been notified.
                </p>
              </div>
            )}

            <textarea
              ref={msgRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-5 text-[14px] font-light bg-transparent resize-none focus:outline-none"
              style={{ color: DARK, minHeight: 100 }}
              maxLength={1000}
            />
            <div className="flex items-center justify-between px-5 pb-4">
              <span className="text-[10px]" style={{ color: `${DARK}25` }}>
                {message.length}/1000
              </span>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || noteMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-30"
                style={{ backgroundColor: DARK, color: GOLD }}
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
            <div
              className="flex items-center gap-2 p-3 rounded-xl mt-3"
              style={{ backgroundColor: "#FEE2E2" }}
            >
              <AlertCircle size={14} style={{ color: "#DC2626" }} />
              <p className="text-[12px]" style={{ color: "#991B1B" }}>
                Failed to send message. Please try again.
              </p>
            </div>
          )}

          {/* Previous messages */}
          {clientMessages.length > 0 && (
            <div className="mt-4">
              <p
                className="text-[11px] font-medium uppercase tracking-wider mb-3"
                style={{ color: `${DARK}35` }}
              >
                Previous Messages
              </p>
              <div className="space-y-2">
                {clientMessages.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl px-4 py-3"
                    style={{ backgroundColor: WHITE, border: `1px solid ${BORDER}` }}
                  >
                    <p className="text-[13px] font-light" style={{ color: DARK }}>
                      {a.details?.replace("Client message: ", "")}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: `${DARK}30` }}>
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity log */}
          {activity.length > 0 && (
            <div className="mt-4">
              <p
                className="text-[11px] font-medium uppercase tracking-wider mb-3"
                style={{ color: `${DARK}35` }}
              >
                Recent Activity
              </p>
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
                    <span className="text-[10px]" style={{ color: `${DARK}30` }}>
                      {timeAgo(a.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  FOOTER                                                        */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div
          className="text-center pt-6 pb-8"
          style={{ borderTop: `1px solid ${DARK}06` }}
        >
          <p className="text-[10px]" style={{ color: `${DARK}30` }}>
            Ref: {task.ref} &middot; Last updated: {formatDate(task.updatedAt)}
          </p>
        </div>
      </main>

      {/* AI Advisor Chat -- controlled, opens when client clicks upsell */}
      <ChatWidget department="general" open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
