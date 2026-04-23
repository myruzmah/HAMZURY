/**
 * AssessmentForm — shared multi-step form used by all 4 division assessments.
 *
 * Route pattern: /bizdoc/assessment, /scalar/assessment, /medialy/assessment,
 *                /hub/enroll
 *
 * CSO shares these URLs via WhatsApp. Client fills → submits via
 * trpc.leads.submit → lands in CSO queue for qualification.
 *
 * Each division passes its own config: accent colour, copy, question set,
 * CSO handoff context line.
 */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PageMeta from "@/components/PageMeta";

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  /** Radio-style single select, or text area if no options. */
  options?: string[];
  /** "text" = short input, "textarea" = paragraph, undefined = single-select. */
  kind?: "text" | "textarea";
  /** If true, must be answered before "Next". */
  required?: boolean;
};

export type AssessmentStep = {
  title: string;
  sub?: string;
  questions: AssessmentQuestion[];
};

export type AssessmentConfig = {
  division: "bizdoc" | "scalar" | "medialy" | "hub";
  pageTitle: string;
  pageDescription: string;
  /** Full-brand hero — e.g. "BIZDOC ASSESSMENT" */
  brand: string;
  /** What the client should know — shown on welcome */
  welcome: { title: string; sub: string; bullets?: string[] };
  /** Accent hex (dark) — matches the division landing page */
  accent: string;
  /** Highlight hex (gold/warm) — action colour */
  highlight: string;
  /** Ordered steps */
  steps: AssessmentStep[];
  /** Thank-you copy shown after submit */
  thankYou: { title: string; sub: string; nextStep: string };
};

export default function AssessmentForm({ cfg }: { cfg: AssessmentConfig }) {
  const [stepIndex, setStepIndex] = useState(-1); // -1 = welcome screen
  const [contact, setContact] = useState({ name: "", businessName: "", phone: "", email: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const submitMut = trpc.leads.submit.useMutation({
    onSuccess: (data: any) => {
      setSubmittedRef(data?.ref || null);
      toast.success("Received. We'll be in touch.");
    },
    onError: (e) => toast.error(e.message || "Submission failed. Try again."),
  });

  const G  = cfg.accent;
  const Au = cfg.highlight;
  const W  = "#FFFFFF";
  const BG = "#FFFAF6";
  const TEXT = "#1A1A1A";
  const MUTED = "#6B7280";

  const totalSteps = cfg.steps.length + 1; // +1 contact step at the end
  const progress = stepIndex < 0 ? 0 : Math.round(((stepIndex + 1) / (totalSteps + 1)) * 100);

  const isContactStep = stepIndex === cfg.steps.length;
  const currentStep = stepIndex >= 0 && stepIndex < cfg.steps.length ? cfg.steps[stepIndex] : null;

  const canAdvance = (() => {
    if (stepIndex < 0) return true;
    if (isContactStep) return contact.name.trim().length > 0 && contact.phone.trim().length > 0;
    if (!currentStep) return false;
    return currentStep.questions.every(q => !q.required || (answers[q.id] && answers[q.id].trim().length > 0));
  })();

  const submit = () => {
    if (!contact.name.trim() || !contact.phone.trim()) {
      toast.error("Name and phone required.");
      return;
    }
    // Build a structured context string the CSO can read at a glance
    const block: string[] = [
      `━━━ ${cfg.brand.toUpperCase()} ━━━`,
      ...cfg.steps.flatMap(step => [
        `[${step.title}]`,
        ...step.questions.map(q => `  Q: ${q.prompt}\n  A: ${answers[q.id] || "—"}`),
      ]),
    ];
    submitMut.mutate({
      name: contact.name.trim(),
      businessName: contact.businessName.trim() || undefined,
      phone: contact.phone.trim(),
      email: contact.email.trim() || undefined,
      service: `${cfg.brand} Assessment`,
      context: block.join("\n"),
      source: `assessment_${cfg.division}`,
    } as any);
  };

  const next = () => {
    if (stepIndex < cfg.steps.length) setStepIndex(stepIndex + 1);
    else submit();
  };
  const back = () => setStepIndex(Math.max(-1, stepIndex - 1));

  /* ─── Thank you ─── */
  if (submittedRef !== null) {
    return (
      <Shell G={G} Au={Au} BG={BG} W={W}>
        <PageMeta title={`${cfg.pageTitle} — Received`} description="We've received your submission." />
        <div className="max-w-xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${G}10` }}>
            <CheckCircle2 size={28} style={{ color: G }} />
          </div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: Au }}>
            Received
          </p>
          <h1 className="text-[clamp(26px,3.5vw,38px)] font-light tracking-tight leading-tight mb-4" style={{ color: G }}>
            {cfg.thankYou.title}
          </h1>
          <p className="text-[15px] leading-[1.7] mb-6" style={{ color: TEXT, opacity: 0.6 }}>
            {cfg.thankYou.sub}
          </p>
          {submittedRef && (
            <div className="inline-block px-5 py-3 rounded-xl mb-6 font-mono text-[13px]" style={{ backgroundColor: `${G}08`, color: G }}>
              Reference: <strong>{submittedRef}</strong>
            </div>
          )}
          <p className="text-[13px] mb-8" style={{ color: MUTED }}>
            {cfg.thankYou.nextStep}
          </p>
          <Link
            href="/"
            className="inline-block px-7 py-3 rounded-full text-[13px] font-semibold transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: G, color: Au }}
          >
            Back to HAMZURY →
          </Link>
        </div>
      </Shell>
    );
  }

  /* ─── Welcome screen (stepIndex === -1) ─── */
  if (stepIndex < 0) {
    return (
      <Shell G={G} Au={Au} BG={BG} W={W}>
        <PageMeta title={cfg.pageTitle} description={cfg.pageDescription} />
        <div className="max-w-xl mx-auto px-6 py-20 md:py-28">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: Au }}>
            {cfg.brand}
          </p>
          <h1 className="text-[clamp(30px,4vw,46px)] font-light tracking-tight leading-[1.1] mb-5" style={{ color: G }}>
            {cfg.welcome.title}
          </h1>
          <p className="text-[16px] leading-[1.7] mb-8" style={{ color: TEXT, opacity: 0.65 }}>
            {cfg.welcome.sub}
          </p>
          {cfg.welcome.bullets && (
            <ul className="space-y-2 mb-10">
              {cfg.welcome.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px]" style={{ color: TEXT, opacity: 0.75 }}>
                  <span style={{ color: Au, fontWeight: 700 }}>•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setStepIndex(0)}
            className="px-7 py-3.5 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: G, color: Au }}
          >
            Begin <ArrowRight size={14} />
          </button>
        </div>
      </Shell>
    );
  }

  /* ─── Step view ─── */
  return (
    <Shell G={G} Au={Au} BG={BG} W={W}>
      <PageMeta title={cfg.pageTitle} description={cfg.pageDescription} />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ backgroundColor: `${G}08` }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: Au }}
        />
      </div>

      <div className="max-w-xl mx-auto px-6 py-16 md:py-20">
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase mb-8 transition-opacity hover:opacity-70"
          style={{ color: MUTED }}
        >
          <ArrowLeft size={12} /> Back
        </button>

        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: Au }}>
          Step {Math.min(stepIndex + 1, totalSteps)} / {totalSteps}
        </p>

        {isContactStep ? (
          <>
            <h2 className="text-[clamp(24px,3vw,34px)] font-light tracking-tight leading-tight mb-2" style={{ color: G }}>
              Last step — how do we reach you?
            </h2>
            <p className="text-[14px] mb-8" style={{ color: MUTED }}>
              We'll get back to you within 2 business hours.
            </p>
            <div className="flex flex-col gap-4 mb-10">
              <FormInput label="Full name *" value={contact.name} onChange={v => setContact({ ...contact, name: v })} G={G} W={W} />
              <FormInput label="Business name (optional)" value={contact.businessName} onChange={v => setContact({ ...contact, businessName: v })} G={G} W={W} />
              <FormInput label="Phone (WhatsApp) *" value={contact.phone} onChange={v => setContact({ ...contact, phone: v })} G={G} W={W} type="tel" />
              <FormInput label="Email (optional)" value={contact.email} onChange={v => setContact({ ...contact, email: v })} G={G} W={W} type="email" />
            </div>
          </>
        ) : currentStep ? (
          <>
            <h2 className="text-[clamp(24px,3vw,34px)] font-light tracking-tight leading-tight mb-2" style={{ color: G }}>
              {currentStep.title}
            </h2>
            {currentStep.sub && (
              <p className="text-[14px] mb-8" style={{ color: MUTED }}>{currentStep.sub}</p>
            )}
            <div className="flex flex-col gap-8 mb-10">
              {currentStep.questions.map(q => (
                <QuestionBlock
                  key={q.id}
                  q={q}
                  value={answers[q.id] || ""}
                  onChange={v => setAnswers({ ...answers, [q.id]: v })}
                  G={G}
                  Au={Au}
                  W={W}
                />
              ))}
            </div>
          </>
        ) : null}

        <button
          onClick={next}
          disabled={!canAdvance || submitMut.isPending}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: G, color: Au }}
        >
          {submitMut.isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Submitting…</>
          ) : isContactStep ? (
            <>Submit <ArrowRight size={14} /></>
          ) : (
            <>Next <ArrowRight size={14} /></>
          )}
        </button>
      </div>
    </Shell>
  );
}

/* ─── Shell ─── */
function Shell({ G, Au, BG, W, children }: { G: string; Au: string; BG: string; W: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "Inter, -apple-system, sans-serif" }}>
      <nav className="py-5 px-6 border-b" style={{ backgroundColor: W, borderColor: `${G}08` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[12px] tracking-[0.3em] font-medium uppercase" style={{ color: G }}>
            HAMZURY
          </Link>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: Au }}>
            Built to Last
          </span>
        </div>
      </nav>
      {children}
    </div>
  );
}

/* ─── Question block ─── */
function QuestionBlock({
  q, value, onChange, G, Au, W,
}: {
  q: AssessmentQuestion;
  value: string;
  onChange: (v: string) => void;
  G: string; Au: string; W: string;
}) {
  return (
    <div>
      <p className="text-[15px] leading-[1.6] font-medium mb-4" style={{ color: G }}>
        {q.prompt}
        {q.required && <span style={{ color: Au, marginLeft: 4 }}>*</span>}
      </p>

      {q.kind === "text" ? (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all focus:shadow-sm"
          style={{ backgroundColor: W, color: G, border: `1px solid ${G}15` }}
        />
      ) : q.kind === "textarea" ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all focus:shadow-sm resize-none"
          style={{ backgroundColor: W, color: G, border: `1px solid ${G}15` }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {(q.options || []).map(opt => {
            const selected = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className="text-left px-4 py-3 rounded-xl text-[14px] transition-all flex items-center gap-3"
                style={{
                  backgroundColor: selected ? `${Au}10` : W,
                  border: `1px solid ${selected ? Au : `${G}10`}`,
                  color: G,
                }}
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ border: `2px solid ${selected ? Au : `${G}30`}`, backgroundColor: W }}
                >
                  {selected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: Au }} />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Form input (contact step) ─── */
function FormInput({ label, value, onChange, G, W, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; G: string; W: string; type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: G, opacity: 0.55 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-4 py-3 rounded-xl text-[14px] outline-none transition-all focus:shadow-sm"
        style={{ backgroundColor: W, color: G, border: `1px solid ${G}15` }}
      />
    </label>
  );
}
