import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Search, CheckCircle2, Clock, AlertCircle, FileCheck2, Loader2, ArrowRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { BRAND } from "@/lib/brand";

const STATUS_STEPS = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  "Not Started": { icon: <Clock size={18} />, color: "#6B7280", label: "Queued" },
  "In Progress": { icon: <Loader2 size={18} className="animate-spin" />, color: "#3B82F6", label: "In Progress" },
  "Waiting on Client": { icon: <AlertCircle size={18} />, color: "#EAB308", label: "Action Needed" },
  "Submitted": { icon: <FileCheck2 size={18} />, color: "#8B5CF6", label: "Submitted" },
  "Completed": { icon: <CheckCircle2 size={18} />, color: "#22C55E", label: "Completed" },
};

const DEPT_LABELS: Record<string, string> = {
  bizdoc: "BizDoc Consult",
  systemise: "Systemise",
  skills: "HAMZURY Skills",
};

export default function TrackPage() {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [queryRef, setQueryRef] = useState("");
  const [queryPhone, setQueryPhone] = useState("");

  const { data, isLoading, error } = trpc.tracking.lookup.useQuery(
    { ref: queryRef, phone: queryPhone || undefined },
    { enabled: submitted && queryRef.length > 0, retry: false }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = ref.trim().toUpperCase();
    if (!cleaned) return;
    setQueryRef(cleaned);
    setQueryPhone(phone.trim());
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setRef("");
    setPhone("");
    setQueryRef("");
    setQueryPhone("");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BRAND.bg }}>
      <PageMeta
        title="My Update — HAMZURY"
        description="Check the status of your compliance file using your reference number and phone number."
      />

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 backdrop-blur-md border-b z-50 flex justify-between items-center"
        style={{ backgroundColor: `${BRAND.bg}EE`, borderColor: `${BRAND.federal}15` }}
      >
        <Link href="/" className="text-[13px] font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: BRAND.federal }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[13px] font-semibold uppercase tracking-wider opacity-40" style={{ color: BRAND.federal }}>
          My Update
        </span>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 md:px-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase mb-4 block" style={{ color: BRAND.gold }}>
            Client Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3" style={{ color: BRAND.federal }}>
            My Update
          </h1>
          <p className="text-[15px] font-light opacity-60 mb-12 leading-relaxed" style={{ color: BRAND.text }}>
            Enter your reference number and the phone number used when you registered to view your file status.
          </p>

          {/* SEARCH FORM */}
          {!submitted || (!isLoading && data?.found === false && data?.reason === "not_found") ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: BRAND.federal, opacity: 0.6 }}>
                  Reference Number
                </label>
                <input
                  type="text"
                  value={ref}
                  onChange={e => { setRef(e.target.value); setSubmitted(false); }}
                  placeholder="e.g. BZ-2026-0041"
                  className="w-full px-5 py-4 rounded-xl text-[15px] outline-none transition-all"
                  style={{
                    backgroundColor: "white",
                    border: `1.5px solid ${BRAND.federal}20`,
                    color: BRAND.federal,
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                  onFocus={e => (e.target.style.borderColor = BRAND.federal + "60")}
                  onBlur={e => (e.target.style.borderColor = BRAND.federal + "20")}
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-2 block" style={{ color: BRAND.federal, opacity: 0.6 }}>
                  Phone Number <span className="font-normal opacity-50 normal-case tracking-normal">(used at registration)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678"
                  className="w-full px-5 py-4 rounded-xl text-[15px] outline-none transition-all"
                  style={{
                    backgroundColor: "white",
                    border: `1.5px solid ${BRAND.federal}20`,
                    color: BRAND.federal,
                  }}
                  onFocus={e => (e.target.style.borderColor = BRAND.federal + "60")}
                  onBlur={e => (e.target.style.borderColor = BRAND.federal + "20")}
                />
              </div>

              <button
                type="submit"
                disabled={!ref.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[14px] font-semibold tracking-wide transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: BRAND.federal, color: BRAND.gold }}
              >
                <Search size={16} /> Track File
              </button>
            </form>
          ) : null}

          {/* LOADING */}
          {submitted && isLoading && (
            <div className="flex items-center justify-center gap-3 py-16 text-[14px]" style={{ color: BRAND.federal, opacity: 0.5 }}>
              <Loader2 size={20} className="animate-spin" />
              Looking up your file…
            </div>
          )}

          {/* ERROR */}
          {submitted && error && (
            <div className="mt-6 p-5 rounded-2xl border text-center" style={{ borderColor: "#EF444430", backgroundColor: "#EF444408" }}>
              <p className="text-[14px] font-medium" style={{ color: "#EF4444" }}>Something went wrong. Please try again.</p>
              <button onClick={handleReset} className="mt-3 text-[13px] underline opacity-60 hover:opacity-100" style={{ color: BRAND.federal }}>
                Try again
              </button>
            </div>
          )}

          {/* NOT FOUND */}
          {submitted && !isLoading && data?.found === false && data?.reason === "not_found" && (
            <div className="mt-8 p-6 rounded-2xl border text-center" style={{ borderColor: `${BRAND.federal}15`, backgroundColor: "white" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${BRAND.federal}08` }}>
                <Search size={20} style={{ color: BRAND.federal, opacity: 0.4 }} />
              </div>
              <p className="font-semibold text-[15px] mb-2" style={{ color: BRAND.federal }}>No file found</p>
              <p className="text-[13px] opacity-50 mb-4" style={{ color: BRAND.text }}>
                We couldn't find a file matching that reference number. Check the reference code and try again.
              </p>
              <button onClick={handleReset} className="text-[13px] font-semibold underline hover:opacity-70" style={{ color: BRAND.federal }}>
                Search again
              </button>
            </div>
          )}

          {/* PHONE MISMATCH */}
          {submitted && !isLoading && data?.found === false && data?.reason === "phone_mismatch" && (
            <div className="mt-8 p-6 rounded-2xl border text-center" style={{ borderColor: "#EAB30830", backgroundColor: "#EAB30808" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#EAB30810" }}>
                <AlertCircle size={20} style={{ color: "#B45309" }} />
              </div>
              <p className="font-semibold text-[15px] mb-2" style={{ color: "#B45309" }}>Phone number doesn't match</p>
              <p className="text-[13px] opacity-70 mb-4" style={{ color: BRAND.text }}>
                The phone number entered doesn't match the one on file for this reference. Please use the phone number you provided when you registered with us.
              </p>
              <button onClick={handleReset} className="text-[13px] font-semibold underline hover:opacity-70" style={{ color: BRAND.federal }}>
                Try again
              </button>
            </div>
          )}

          {/* FOUND — RESULT */}
          {submitted && !isLoading && data?.found === true && (
            <TrackResult data={data} phone={queryPhone} onReset={handleReset} />
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 px-6 md:px-12 border-t text-center" style={{ borderColor: `${BRAND.federal}10` }}>
        <p className="text-[12px] opacity-40" style={{ color: BRAND.text }}>
          Issues with your file? Contact your CSO via WhatsApp.{" "}
          <Link href="/" className="underline hover:opacity-100" style={{ color: BRAND.federal }}>
            Return home
          </Link>
        </p>
      </footer>
    </div>
  );
}

// ─── Result Display ───────────────────────────────────────────────────────────

function TrackResult({
  data,
  phone,
  onReset,
}: {
  data: {
    ref: string;
    clientName: string;
    businessName?: string | null;
    service: string;
    department?: string | null;
    status: string;
    statusIndex: number;
    statusTotal: number;
    statusSteps: string[];
    statusMessage: string;
    deadline?: string | null;
    lastUpdated: Date | string;
    createdAt: Date | string;
  };
  phone: string;
  onReset: () => void;
}) {
  const cfg = STATUS_CONFIG[data.status];
  const progressPct = Math.round(((data.statusIndex + 1) / data.statusTotal) * 100);

  return (
    <div className="mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* File Header Card */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${BRAND.federal}12` }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase mb-1 block" style={{ color: BRAND.gold }}>
              {DEPT_LABELS[data.department || "bizdoc"] || "BizDoc Consult"}
            </span>
            <h2 className="text-2xl font-bold font-mono tracking-wider" style={{ color: BRAND.federal }}>{data.ref}</h2>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ backgroundColor: `${cfg?.color}15`, color: cfg?.color }}
          >
            {cfg?.icon}
            {cfg?.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px] mb-5" style={{ color: BRAND.text }}>
          <div>
            <span className="opacity-40 block text-[11px] uppercase tracking-wider mb-0.5">Client</span>
            <span className="font-medium">{data.clientName}</span>
          </div>
          {data.businessName && (
            <div>
              <span className="opacity-40 block text-[11px] uppercase tracking-wider mb-0.5">Business</span>
              <span className="font-medium">{data.businessName}</span>
            </div>
          )}
          <div>
            <span className="opacity-40 block text-[11px] uppercase tracking-wider mb-0.5">Service</span>
            <span className="font-medium">{data.service}</span>
          </div>
          {data.deadline && (
            <div>
              <span className="opacity-40 block text-[11px] uppercase tracking-wider mb-0.5">Target Date</span>
              <span className="font-medium">{data.deadline}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] mb-2 opacity-50" style={{ color: BRAND.federal }}>
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: `${BRAND.federal}10` }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                backgroundColor: data.status === "Completed" ? "#22C55E" : data.status === "Waiting on Client" ? "#EAB308" : BRAND.federal,
              }}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${BRAND.federal}12` }}>
        <h3 className="text-[12px] font-bold uppercase tracking-wider mb-3 opacity-50" style={{ color: BRAND.federal }}>
          Current Status
        </h3>
        <p className="text-[15px] leading-relaxed" style={{ color: BRAND.text }}>
          {data.statusMessage}
        </p>
        {data.status === "Waiting on Client" && (
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "#EAB30810", border: "1px solid #EAB30830" }}>
            <p className="text-[13px] font-semibold" style={{ color: "#B45309" }}>
              Action required — Please check your WhatsApp for a message from our team.
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${BRAND.federal}12` }}>
        <h3 className="text-[12px] font-bold uppercase tracking-wider mb-4 opacity-50" style={{ color: BRAND.federal }}>
          File Timeline
        </h3>
        <div className="space-y-3">
          {STATUS_STEPS.map((step, i) => {
            const isDone = i <= data.statusIndex;
            const isCurrent = i === data.statusIndex;
            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{
                    backgroundColor: isDone ? (isCurrent && data.status === "Waiting on Client" ? "#EAB308" : BRAND.federal) : `${BRAND.federal}10`,
                    color: isDone ? (isCurrent && data.status === "Waiting on Client" ? "white" : BRAND.gold) : `${BRAND.federal}40`,
                  }}
                >
                  {isDone && !isCurrent ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <span
                  className="text-[13px]"
                  style={{
                    color: isCurrent ? BRAND.federal : `${BRAND.federal}${isDone ? "80" : "30"}`,
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {step}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: BRAND.gold }}>
                      ← Current
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Updated & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <p className="text-[12px] opacity-40" style={{ color: BRAND.text }}>
          Last updated: {new Date(data.lastUpdated).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onReset}
            className="text-[12px] font-semibold px-4 py-2 rounded-lg border hover:opacity-70 transition-opacity"
            style={{ borderColor: `${BRAND.federal}20`, color: BRAND.federal }}
          >
            Track another file
          </button>
          <a
            href={`https://wa.me/234?text=Hello,%20I'm%20following%20up%20on%20file%20${data.ref}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: BRAND.federal, color: BRAND.gold }}
          >
            Contact CSO <ArrowRight size={12} />
          </a>
          <button
            onClick={() => {
              localStorage.setItem("hamzury-client-session", JSON.stringify({
                phone,
                name: data.clientName,
                ref: data.ref,
                businessName: data.businessName,
                service: data.service,
                status: data.status,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
              }));
              window.location.href = "/client/dashboard";
            }}
            className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: BRAND.gold, color: BRAND.federal }}
          >
            My Dashboard <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
