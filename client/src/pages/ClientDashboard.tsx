import { useState, useEffect } from "react";
import { CheckCircle, Circle, Download, ChevronRight, Loader2, AlertCircle, LogOut } from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const WHITE = "#FFFFFF";
const DARK  = "#2C2C2C";

const STATUS_STEPS = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];

const STATUS_MESSAGES: Record<string, string> = {
  "Not Started": "Your file has been received and is queued for processing. A compliance officer will begin work shortly.",
  "In Progress": "Your file is actively being worked on. Documents are being prepared and reviewed.",
  "Waiting on Client": "We need additional information or documents from you. Please check your WhatsApp for details.",
  "Submitted": "Your documents have been submitted to the relevant authority. We are awaiting their response.",
  "Completed": "Your file has been completed successfully. Please contact us to arrange document pickup.",
};

const PROMPTS = [
  {
    q: "Do you want to know exactly what your business needs to grow?",
    cta: "Get a free diagnosis →",
    href: "/bizdoc",
    accent: TEAL,
  },
  {
    q: "Need brand identity or business automation?",
    cta: "Explore Systemise →",
    href: "/systemise",
    accent: "#1B4D3E",
  },
  {
    q: "Want to upskill yourself or your team?",
    cta: "See Skills programs →",
    href: "/skills",
    accent: GOLD,
    dark: true,
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

export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const s = loadClientSession();
    setSession(s);
    setSessionLoaded(true);
    if (!s) {
      window.location.href = "/client";
    }
  }, []);

  const { data, isLoading, isError } = trpc.leads.clientPortalByRef.useQuery(
    { ref: session?.ref ?? "" },
    {
      enabled: !!session?.ref,
      retry: false,
      refetchInterval: 30000,
    }
  );

  const { data: subHistory } = trpc.subscriptions.clientHistory.useQuery(
    { ref: session?.ref ?? "" },
    { enabled: !!session?.ref, retry: false }
  );

  function handleLogout() {
    localStorage.removeItem("hamzury-client-session");
    window.location.href = "/client";
  }

  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <Loader2 className="animate-spin" size={24} style={{ color: TEAL }} />
      </div>
    );
  }

  if (!session) return null; // redirect fires in useEffect

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: CREAM }}>
        <Loader2 className="animate-spin" size={24} style={{ color: TEAL }} />
        <p className="text-[13px] font-light" style={{ color: TEAL, opacity: 0.5 }}>Loading your file…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6" style={{ backgroundColor: CREAM }}>
        <AlertCircle size={32} style={{ color: "#DC2626" }} />
        <div className="text-center">
          <p className="text-[15px] font-light mb-1" style={{ color: TEAL }}>File not found</p>
          <p className="text-[12px] opacity-40" style={{ color: DARK }}>Reference: {session.ref}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[12px] font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-70"
          style={{ backgroundColor: TEAL, color: GOLD }}
        >
          Try a different reference
        </button>
      </div>
    );
  }

  const task = data.task;
  const checklist = data.checklist || [];
  const statusIndex = STATUS_STEPS.indexOf(task.status);
  const progress = Math.round(((statusIndex + 1) / STATUS_STEPS.length) * 100);
  const completedItems = checklist.filter(c => c.checked);
  const activeItem = checklist.find(c => !c.checked);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title="My File — HAMZURY"
        description="Track your business compliance file and next steps."
      />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 px-5 h-14 flex items-center justify-between"
        style={{ backgroundColor: `${CREAM}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${TEAL}0d` }}
      >
        <a href="/" className="text-[15px] font-light tracking-tight" style={{ color: TEAL, letterSpacing: "-0.03em" }}>
          HAMZURY
        </a>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono opacity-40" style={{ color: TEAL }}>{task.ref}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: TEAL }}
          >
            <LogOut size={12} />
            <span>Exit</span>
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-5 py-10 space-y-8">

        {/* ── Greeting ─────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[12px] font-medium tracking-wider uppercase mb-1" style={{ color: GOLD }}>
            {task.service}
          </p>
          <h1 className="text-[28px] font-light tracking-tight leading-tight" style={{ color: TEAL, letterSpacing: "-0.025em" }}>
            {task.businessName || task.clientName}
          </h1>
        </div>

        {/* ── Progress card ────────────────────────────────────────────────── */}
        <div className="rounded-3xl p-7" style={{ backgroundColor: TEAL, color: WHITE }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-[12px] font-medium uppercase tracking-wider opacity-50">File Progress</span>
            <span className="text-[22px] font-light" style={{ color: GOLD }}>{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full mb-6" style={{ backgroundColor: `${WHITE}18` }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: GOLD }}
            />
          </div>

          {/* Status label */}
          <div className="mb-4">
            <span
              className="inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: `${GOLD}25`, color: GOLD }}
            >
              {task.status}
            </span>
          </div>

          {/* Status message */}
          <p className="text-[14px] font-light leading-relaxed opacity-80">
            {STATUS_MESSAGES[task.status] || "Status update pending."}
          </p>

          {/* Deadline */}
          {task.deadline && (
            <p className="mt-4 text-[11px] opacity-40">
              Target completion: {task.deadline}
            </p>
          )}
        </div>

        {/* ── Checklist / progress items ───────────────────────────────────── */}
        {checklist.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
              File Progress ({completedItems.length}/{checklist.length})
            </p>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#16A34A" }} />
                  <span className="text-[14px] font-light leading-snug" style={{ color: DARK }}>{item.label}</span>
                </div>
              ))}
              {activeItem && (
                <div className="flex items-start gap-3 opacity-50">
                  <Circle size={16} className="mt-0.5 shrink-0" style={{ color: TEAL }} />
                  <span className="text-[14px] font-light leading-snug" style={{ color: TEAL }}>{activeItem.label}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Status steps ─────────────────────────────────────────────────── */}
        {checklist.length === 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
              Process Steps
            </p>
            <div className="space-y-2">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  {i < statusIndex ? (
                    <CheckCircle size={16} className="shrink-0" style={{ color: "#16A34A" }} />
                  ) : i === statusIndex ? (
                    <Circle size={16} className="shrink-0" style={{ color: GOLD }} />
                  ) : (
                    <Circle size={16} className="shrink-0 opacity-20" style={{ color: DARK }} />
                  )}
                  <span
                    className="text-[13px] font-light"
                    style={{
                      color: i < statusIndex ? "#16A34A" : i === statusIndex ? TEAL : DARK,
                      opacity: i > statusIndex ? 0.3 : 1,
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Subscription History (Tax Pro Max / Monthly services) ── */}
        {subHistory && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-4" style={{ color: DARK, opacity: 0.4 }}>
              Monthly Service — {subHistory.service}
            </p>
            <div className="space-y-2">
              {subHistory.monthlyTasks.length === 0 ? (
                <p className="text-[13px] font-light opacity-40" style={{ color: TEAL }}>No monthly tasks yet for this subscription.</p>
              ) : (
                subHistory.monthlyTasks.map(t => (
                  <div key={t.month} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: WHITE, border: `1px solid ${TEAL}08` }}>
                    <div className="flex items-center gap-3">
                      {t.kpiApproved ? (
                        <CheckCircle size={16} style={{ color: "#16A34A" }} />
                      ) : t.status === "Completed" ? (
                        <CheckCircle size={16} style={{ color: "#16A34A", opacity: 0.5 }} />
                      ) : (
                        <Circle size={16} style={{ color: TEAL, opacity: 0.3 }} />
                      )}
                      <span className="text-[13px] font-light" style={{ color: TEAL }}>{t.month}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      t.kpiApproved ? "bg-green-100 text-green-700" :
                      t.status === "Submitted" ? "bg-blue-100 text-blue-700" :
                      t.status === "In Progress" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {t.kpiApproved ? "Filed ✓" : t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div style={{ height: 1, backgroundColor: `${TEAL}0d` }} />

        {/* ── Smart prompts ────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {PROMPTS.map((p) => (
            <a
              key={p.q}
              href={p.href}
              className="flex items-center justify-between rounded-2xl px-6 py-5 group transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                backgroundColor: p.dark ? p.accent : WHITE,
                border: `1px solid ${p.accent}20`,
              }}
            >
              <div>
                <p className="text-[14px] font-light leading-snug mb-1" style={{ color: p.dark ? GOLD : TEAL }}>
                  {p.q}
                </p>
                <span className="text-[12px] font-semibold" style={{ color: p.dark ? `${GOLD}80` : p.accent }}>
                  {p.cta}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="shrink-0 ml-4 transition-transform group-hover:translate-x-1"
                style={{ color: p.dark ? GOLD : p.accent, opacity: 0.5 }}
              />
            </a>
          ))}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="text-center pt-4 space-y-2">
          <p className="text-[11px] opacity-25" style={{ color: DARK }}>
            Questions? WhatsApp your CSO on 08067149356
          </p>
          <p className="text-[10px] opacity-15" style={{ color: DARK }}>
            Ref: {task.ref} · Last updated: {new Date(task.updatedAt).toLocaleDateString("en-NG")}
          </p>
        </div>
      </main>
    </div>
  );
}
