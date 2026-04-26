/**
 * BizdocDiagnostic — 8-question per-site compliance diagnostic for the
 * Bizdoc division. SEPARATE flow from the existing 14-q Hamzury Clarity
 * Session — visually identical (Fraunces serif + cream background, ported
 * from `diagnostic.css`) but shorter and Bizdoc-only.
 *
 * Questions verbatim from `MASTER-CHAT-FLOW.md` section
 * "OPTION 5 — BIZDOC DIAGNOSTIC".
 *
 * On submit:
 *   - Calls `trpc.diagnostics.submitBizdoc`
 *   - Server creates ONE row in `leads` with source = "diagnostic_bizdoc"
 *   - Email alert sent to CSO
 *   - User sees the reference number + 48h written report promise
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import "@/styles/diagnostic.css";

// ─── Question schema (local to this form) ────────────────────────────────────

type Question =
  | {
      type: "single";
      section: string;
      question: string;
      helper?: string;
      options: string[];
    }
  | {
      type: "textarea";
      section: string;
      question: string;
      helper?: string;
      placeholder?: string;
    };

const QUESTIONS: Question[] = [
  {
    type: "single",
    section: "Registration",
    question: "Is your business currently registered with CAC?",
    helper: "Corporate Affairs Commission — the federal business registry.",
    options: ["Yes", "No", "Not sure"],
  },
  {
    type: "single",
    section: "Tax ID",
    question: "Do you have a TIN?",
    helper: "Tax Identification Number — issued by FIRS.",
    options: ["Yes", "No", "Not sure"],
  },
  {
    type: "single",
    section: "Tax filing",
    question: "When did you last file taxes?",
    options: [
      "Within 12 months",
      "Over 1 year ago",
      "Never",
      "Not applicable",
    ],
  },
  {
    type: "single",
    section: "Annual returns",
    question: "Are you up to date on annual returns?",
    helper: "CAC requires every registered business to file each year.",
    options: ["Yes", "No", "Not sure"],
  },
  {
    type: "textarea",
    section: "Your business",
    question: "What kind of business do you run?",
    helper: "A short line is fine — industry or what you sell.",
    placeholder: "e.g. fashion retail, fintech, logistics, consulting…",
  },
  {
    type: "single",
    section: "Stage",
    question: "What stage is your business at?",
    options: ["Just starting", "Growing", "Established"],
  },
  {
    type: "textarea",
    section: "What's on your mind",
    question:
      "What's the <em>biggest compliance worry</em> on your mind?",
    helper: "The one that keeps coming back. Be specific if you can.",
    placeholder: "e.g. unsure if my taxes are filed, scared of FIRS letter…",
  },
  {
    type: "single",
    section: "Regulator letters",
    question:
      "Have you received any letters from FIRS, CAC, or any regulator recently?",
    options: ["Yes", "No"],
  },
];

// ─── Validation (mirrors server) ─────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function countDigits(s: string): number {
  const m = s.match(/\d/g);
  return m ? m.length : 0;
}
function isPhoneOk(s: string): boolean {
  if (!/^[\d+\s()\-]+$/.test(s.trim())) return false;
  return countDigits(s) >= 10;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ContactState {
  name: string;
  business: string;
  email: string;
  phone: string;
  consent: boolean;
}

type AnswerMap = Record<number, string>;

const TOTAL = QUESTIONS.length;
const CONTACT_STEP = TOTAL; // step right after the last question
const STEP_COUNT = TOTAL + 1; // questions + contact step (for progress bar)

export default function BizdocDiagnostic() {
  // -1 = intro, 0..TOTAL-1 = question, TOTAL = contact, TOTAL+1 = outro
  const [index, setIndex] = useState<number>(-1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [contact, setContact] = useState<ContactState>({
    name: "",
    business: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [contactError, setContactError] = useState<string>("");
  const [submittedRef, setSubmittedRef] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  const submitMutation = trpc.diagnostics.submitBizdoc.useMutation();

  useEffect(() => {
    document.title = "Bizdoc Diagnostic · Hamzury";
  }, []);

  useEffect(() => {
    if (index < 0) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [index]);

  const isIntro = index === -1;
  const isContact = index === CONTACT_STEP;
  const isOutro = index === CONTACT_STEP + 1;
  const currentQ = useMemo<Question | undefined>(
    () => (!isIntro && !isContact && !isOutro ? QUESTIONS[index] : undefined),
    [index, isIntro, isContact, isOutro],
  );

  function handleStart() {
    setIndex(0);
  }

  function handleBack() {
    if (index > 0) {
      setContactError("");
      setIndex(index - 1);
    }
  }

  function setAnswer(i: number, value: string) {
    setAnswers((prev) => ({ ...prev, [i]: value }));
  }

  async function submit() {
    const trimmedName = contact.name.trim();
    const trimmedEmail = contact.email.trim();
    const trimmedPhone = contact.phone.trim();
    const trimmedBusiness = contact.business.trim();

    if (!trimmedName) return setContactError("Please enter your name.");
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail))
      return setContactError("Please enter a valid email address.");
    if (!trimmedPhone || !isPhoneOk(trimmedPhone))
      return setContactError(
        "Please enter a valid WhatsApp number (at least 10 digits).",
      );
    if (!contact.consent)
      return setContactError("Please confirm you agree to be contacted.");
    setContactError("");

    const qa = QUESTIONS.map((q, i) => ({
      section: q.section,
      // strip inline <em> tags for the persisted record
      question: q.question.replace(/<\/?em>/g, ""),
      answer: answers[i] ?? null,
    }));

    try {
      const res = await submitMutation.mutateAsync({
        qa,
        contact: {
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          businessName: trimmedBusiness || undefined,
        },
        ndprConsent: true,
      });
      setSubmittedRef(res.ref);
      setIndex(CONTACT_STEP + 1);
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Something went wrong. Please try again.";
      toast.error(msg);
    }
  }

  function handleNext() {
    if (currentQ) {
      setIndex(index + 1);
      return;
    }
    if (isContact) {
      void submit();
    }
  }

  function handleRestart() {
    setAnswers({});
    setContact({
      name: "",
      business: "",
      email: "",
      phone: "",
      consent: false,
    });
    setContactError("");
    setSubmittedRef("");
    setIndex(-1);
  }

  // ─── Renderers ─────────────────────────────────────────────────────────────

  function renderIntro() {
    return (
      <div className="form-body">
        <div className="intro-card">
          <div className="intro-eyebrow">Bizdoc compliance check</div>
          <h1 className="intro-title">
            Find your <em>compliance gaps</em>.
          </h1>
          <p className="intro-body">
            A short, focused diagnostic for the compliance side of your
            business — CAC, TIN, taxes, annual returns. Eight quick questions.
            We review your answers and send you a personalised written report
            within 48 hours, plus the option of a 20-minute call.
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Duration</div>
              <div className="v">~3 minutes</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Questions</div>
              <div className="v">8 questions</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Privacy</div>
              <div className="v">Private · Bizdoc-only</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleStart}
          >
            Begin when ready →
          </button>
        </div>
      </div>
    );
  }

  function renderQuestion(q: Question, i: number) {
    const a = answers[i];
    return (
      <>
        <div className="form-body">
          <div className="form-card">
            <div className="section-label">{q.section}</div>
            <h2
              className="question"
              dangerouslySetInnerHTML={{ __html: q.question }}
            />
            {q.helper ? <p className="helper">{q.helper}</p> : null}

            {q.type === "textarea" ? (
              <textarea
                ref={(el) => {
                  inputRef.current = el;
                }}
                className="input-textarea"
                placeholder={q.placeholder ?? ""}
                value={typeof a === "string" ? a : ""}
                onChange={(e) => setAnswer(i, e.target.value)}
              />
            ) : (
              <div className="options-grid">
                {q.options.map((opt) => {
                  const isSel = a === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`option ${isSel ? "selected" : ""}`}
                      onClick={() => {
                        setAnswer(i, opt);
                        window.setTimeout(() => {
                          setIndex((cur) => (cur === i ? cur + 1 : cur));
                        }, 320);
                      }}
                    >
                      <div className="option-marker" />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="form-footer">
          <div className="footer-left">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleBack}
              style={{ visibility: i === 0 ? "hidden" : "visible" }}
            >
              ← Back
            </button>
          </div>
          <div className="footer-right">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Continue
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderContact() {
    return (
      <>
        <div className="form-body">
          <div className="form-card">
            <div className="section-label">One last thing</div>
            <h2 className="question">Where should we send your report?</h2>
            <p className="helper">
              We'll review your answers and send a personalised written report
              within 48 hours, plus an offer for a 20-minute call.
            </p>
            <div className="contact-grid">
              <div className="input-group">
                <label>
                  Your name <span className="contact-required">*</span>
                </label>
                <input
                  ref={(el) => {
                    inputRef.current = el;
                  }}
                  type="text"
                  className="input-text"
                  placeholder="Full name"
                  value={contact.name}
                  required
                  onChange={(e) =>
                    setContact((c) => ({ ...c, name: e.target.value }))
                  }
                />
              </div>
              <div className="input-group">
                <label>Business name</label>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Business or brand"
                  value={contact.business}
                  onChange={(e) =>
                    setContact((c) => ({ ...c, business: e.target.value }))
                  }
                />
              </div>
              <div className="input-group">
                <label>
                  Email <span className="contact-required">*</span>
                </label>
                <input
                  type="email"
                  className="input-text"
                  placeholder="you@example.com"
                  value={contact.email}
                  required
                  onChange={(e) =>
                    setContact((c) => ({ ...c, email: e.target.value }))
                  }
                />
              </div>
              <div className="input-group">
                <label>
                  WhatsApp number{" "}
                  <span className="contact-required">*</span>
                </label>
                <input
                  type="tel"
                  className="input-text"
                  placeholder="+234 ..."
                  value={contact.phone}
                  required
                  onChange={(e) =>
                    setContact((c) => ({ ...c, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            {contactError ? (
              <div className="contact-error">{contactError}</div>
            ) : null}
            <label className="consent-row">
              <input
                type="checkbox"
                checked={contact.consent}
                onChange={(e) =>
                  setContact((c) => ({ ...c, consent: e.target.checked }))
                }
              />
              <span>
                I agree that Hamzury may contact me about this submission. My
                information will be kept private and not shared with third
                parties, in line with the Nigeria Data Protection Regulation
                (NDPR).
              </span>
            </label>
          </div>
        </div>
        <div className="form-footer">
          <div className="footer-left">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>
          <div className="footer-right">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!contact.consent || submitMutation.isPending}
            >
              {submitMutation.isPending ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderOutro() {
    return (
      <div className="form-body">
        <div className="outro-card">
          <div className="outro-checkmark">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12L10 17L19 7"
                stroke="#FBF7EE"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="intro-eyebrow">Submitted</div>
          <h1 className="intro-title">
            We've <em>got it</em>.
          </h1>
          <p className="intro-body">
            {submittedRef ? (
              <>
                Reference{" "}
                <span className="outro-ref">{submittedRef}</span>. We'll send
                you a written report within 48 hours and offer a 20-minute
                call to walk through it.
              </>
            ) : (
              <>
                Your responses are in. We'll send you a written report within
                48 hours and offer a 20-minute call to walk through it.
              </>
            )}
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Next step</div>
              <div className="v">Written report within 48 hours</div>
            </div>
            {submittedRef ? (
              <div className="intro-meta-item">
                <div className="k">Your reference</div>
                <div className="v">{submittedRef}</div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRestart}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const showProgress = !isIntro && !isOutro;
  const stepNumber = isContact ? CONTACT_STEP + 1 : index + 1;
  const progressPct = showProgress
    ? Math.round((stepNumber / STEP_COUNT) * 100)
    : 0;

  return (
    <div className="diagnostic-form">
      <div className="form-stage">
        <div className="form-header">
          <div className="brand">
            <div className="brand-dot">B</div>
            <span>Bizdoc · Hamzury</span>
          </div>
          {showProgress ? (
            <div className="progress-wrap">
              <span>
                {stepNumber} of {STEP_COUNT}
              </span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {isIntro
          ? renderIntro()
          : isOutro
            ? renderOutro()
            : isContact
              ? renderContact()
              : currentQ
                ? renderQuestion(currentQ, index)
                : null}
      </div>
    </div>
  );
}
