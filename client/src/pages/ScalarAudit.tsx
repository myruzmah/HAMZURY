/**
 * ScalarAudit — 10-question per-site Software Audit for the Scalar division.
 * SEPARATE flow from the existing 14-q Hamzury Clarity Session.
 *
 * Visual style ported from `diagnostic.css` (Fraunces serif + cream paper)
 * to keep parity with the Clarity Session.
 *
 * On submit:
 *   - Calls `trpc.diagnostics.submitScalarAudit`
 *   - Server creates ONE row in `leads` with source = "diagnostic_scalar"
 *   - Email alert sent to CSO
 *   - User sees the reference number + 48h written audit promise
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import "@/styles/diagnostic.css";

// ─── Question schema ─────────────────────────────────────────────────────────

type Question =
  | {
      type: "single";
      section: string;
      question: string;
      helper?: string;
      options: string[];
    }
  | {
      type: "multi";
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
    section: "Website",
    question: "What's your current website situation?",
    options: [
      "No website",
      "Have one but outdated",
      "Have one and works",
      "Have one and want to scale",
    ],
  },
  {
    type: "single",
    section: "Customer data",
    question: "Do you have a CRM or customer database?",
    helper:
      "Where customer info, leads, and conversations actually live today.",
    options: [
      "No",
      "Spreadsheet only",
      "CRM but underused",
      "Yes — using it well",
    ],
  },
  {
    type: "single",
    section: "Manual work",
    question: "How many manual repetitive tasks per day?",
    helper: "Sending the same email, updating the same sheet, etc.",
    options: ["None", "1–3", "4–10", "More than 10"],
  },
  {
    type: "single",
    section: "Payments",
    question: "Do you sell or accept payments online?",
    options: ["No", "Yes — basic", "Yes — full e-commerce"],
  },
  {
    type: "textarea",
    section: "Bottleneck",
    question:
      "What's your <em>biggest software bottleneck</em> right now?",
    helper: "The system or workflow that slows everything else down.",
    placeholder:
      "e.g. invoicing is manual, no central CRM, can't track orders…",
  },
  {
    type: "single",
    section: "AI",
    question: "Tried any AI tools?",
    options: [
      "None",
      "Tried but didn't stick",
      "Using ChatGPT casually",
      "Using AI in production",
    ],
  },
  {
    type: "single",
    section: "Spend",
    question: "Monthly software / SaaS spend?",
    options: [
      "Under ₦50k",
      "₦50k – ₦200k",
      "₦200k – ₦1M",
      "Over ₦1M",
    ],
  },
  {
    type: "single",
    section: "Priority",
    question: "Top priority for the next 90 days?",
    options: [
      "New website",
      "Automating workflows",
      "Custom system",
      "AI integration",
      "Other",
    ],
  },
  {
    type: "single",
    section: "Team",
    question: "Team size?",
    options: ["Just me", "2–5", "6–20", "20+"],
  },
  {
    type: "textarea",
    section: "Anything else",
    question: "Anything else we should know?",
    helper: "Optional — context that doesn't fit anywhere above.",
    placeholder: "Optional — leave blank if nothing comes to mind.",
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

type AnswerValue = string | string[];
type AnswerMap = Record<number, AnswerValue>;

const TOTAL = QUESTIONS.length;
const CONTACT_STEP = TOTAL;
const STEP_COUNT = TOTAL + 1;

export default function ScalarAudit() {
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

  const submitMutation = trpc.diagnostics.submitScalarAudit.useMutation();

  useEffect(() => {
    document.title = "Scalar Software Audit · Hamzury";
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

  function setAnswer(i: number, value: AnswerValue) {
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
          <div className="intro-eyebrow">Scalar software audit</div>
          <h1 className="intro-title">
            Let's audit your <em>systems</em>.
          </h1>
          <p className="intro-body">
            A focused 10-question audit of your website, CRM, automations,
            payments, AI use, and software spend. We review your answers and
            send you a written audit within 48 hours, plus the option of a
            20-minute call.
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Duration</div>
              <div className="v">~4 minutes</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Questions</div>
              <div className="v">10 questions</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Privacy</div>
              <div className="v">Private · Scalar-only</div>
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
            ) : q.type === "single" ? (
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
            ) : (
              // multi
              <div className="options-grid">
                {q.options.map((opt) => {
                  const selected = Array.isArray(a) ? a : [];
                  const isSel = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`option multi ${isSel ? "selected" : ""}`}
                      onClick={() => {
                        const next = isSel
                          ? selected.filter((o) => o !== opt)
                          : [...selected, opt];
                        setAnswer(i, next);
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
            <h2 className="question">Where should we send your audit?</h2>
            <p className="helper">
              We'll review your answers and send a personalised written audit
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
                you a written audit within 48 hours and offer a 20-minute call
                to walk through it.
              </>
            ) : (
              <>
                Your responses are in. We'll send you a written audit within
                48 hours and offer a 20-minute call to walk through it.
              </>
            )}
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Next step</div>
              <div className="v">Written audit within 48 hours</div>
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
            <div className="brand-dot">S</div>
            <span>Scalar · Hamzury</span>
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
