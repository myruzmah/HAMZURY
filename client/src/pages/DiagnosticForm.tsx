/**
 * DiagnosticForm — generic diagnostic-form component used for every form
 * in `client/src/lib/diagnostic-forms.ts`. Renders ANY form by id, so
 * adding a new diagnostic in the future is just (a) extend the data file
 * and (b) add a one-line route to App.tsx.
 *
 * Visual fidelity matches `hamzury-forms.html` — see
 * `client/src/styles/diagnostic.css` for the CSS port.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FORMS,
  type DiagnosticFormId,
  type DiagnosticForm,
  type DiagnosticQuestion,
} from "@/lib/diagnostic-forms";
import "@/styles/diagnostic.css";

// ─── Local types ─────────────────────────────────────────────────────────────

interface ContactState {
  name: string;
  business: string;
  email: string;
  phone: string;
  consent: boolean;
}

type AnswerValue = string | number | number[];
type AnswerMap = Record<string, AnswerValue>;
type SkipMap = Record<string, true>;

interface Props {
  /** Optional explicit form id. If omitted, the form is detected from the URL path. */
  formId?: DiagnosticFormId;
}

// ─── URL → form id detection ─────────────────────────────────────────────────

function detectFormIdFromPath(path: string): DiagnosticFormId | null {
  const p = path.toLowerCase();
  if (p.includes("clarity")) return "clarity";
  if (p.includes("business")) return "business";
  if (p.includes("software")) return "software";
  if (p.includes("media")) return "media";
  if (p.includes("skills")) return "skills";
  return null;
}

// ─── Validation (mirror of server-side regex) ────────────────────────────────

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

export default function DiagnosticForm({ formId }: Props) {
  const [location] = useLocation();

  // Resolve form id (explicit prop > URL detection > "clarity").
  const resolvedFormId: DiagnosticFormId = useMemo(() => {
    if (formId && FORMS[formId]) return formId;
    const fromPath = detectFormIdFromPath(location);
    if (fromPath && FORMS[fromPath]) return fromPath;
    return "clarity";
  }, [formId, location]);

  const form = FORMS[resolvedFormId];

  // -1 = intro, length = outro
  const [index, setIndex] = useState<number>(-1);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [skipped, setSkipped] = useState<SkipMap>({});
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

  const submitMutation = trpc.diagnostics.submit.useMutation();

  // Update document title when form changes.
  useEffect(() => {
    if (form) document.title = `${form.title} · Hamzury`;
  }, [form]);

  // Auto-focus the relevant input when the question changes.
  useEffect(() => {
    if (index < 0 || !form) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [index, form]);

  // Keyboard shortcuts — Enter advances on text input, Ctrl+Enter on textarea.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (e.key === "Enter" && tag === "INPUT") {
        const inp = target as HTMLInputElement;
        if (inp.type !== "email" && inp.type !== "tel") {
          e.preventDefault();
          handleNext();
        }
      }
      if (e.key === "Enter" && e.ctrlKey && tag === "TEXTAREA") {
        e.preventDefault();
        handleNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, answers, contact, form]);

  if (!form) {
    return (
      <div className="diagnostic-form">
        <div className="form-stage">
          <div className="form-body">
            <div className="form-card">
              <div className="section-label">Form unavailable</div>
              <h2 className="question">This diagnostic isn't ready yet.</h2>
              <p className="helper">
                Please check back soon — or use the contact page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const total = form.questions.length;
  const isIntro = index === -1;
  const isOutro = index >= total;
  const currentQ: DiagnosticQuestion | undefined = !isIntro && !isOutro
    ? form.questions[index]
    : undefined;

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function key(i: number): string {
    return String(i);
  }

  function getCurrentAnswer(): AnswerValue | undefined {
    return answers[key(index)];
  }

  function setAnswer(i: number, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [key(i)]: value }));
    setSkipped((prev) => {
      const next = { ...prev };
      delete next[key(i)];
      return next;
    });
  }

  function clearAnswer(i: number) {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[key(i)];
      return next;
    });
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  function handleStart() {
    setIndex(0);
  }

  function handleBack() {
    if (index > 0) {
      setContactError("");
      setIndex(index - 1);
    }
  }

  function handleSkip() {
    if (!currentQ) return;
    setSkipped((prev) => ({ ...prev, [key(index)]: true }));
    clearAnswer(index);
    setIndex(index + 1);
  }

  async function handleNext() {
    if (!currentQ || !form) return;

    if (currentQ.type === "contact") {
      // Validate contact step + submit.
      const trimmedName = contact.name.trim();
      const trimmedEmail = contact.email.trim();
      const trimmedPhone = contact.phone.trim();
      const trimmedBusiness = contact.business.trim();

      if (!trimmedName) {
        setContactError("Please enter your name.");
        return;
      }
      if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
        setContactError("Please enter a valid email address.");
        return;
      }
      if (!trimmedPhone || !isPhoneOk(trimmedPhone)) {
        setContactError(
          "Please enter a valid WhatsApp number (at least 10 digits)."
        );
        return;
      }
      if (!contact.consent) {
        setContactError("Please confirm you agree to be contacted.");
        return;
      }
      setContactError("");

      // Build the answers payload — keys are stringified question indexes.
      // Single-choice answers are stored as the option label (string).
      // Multi-choice answers are stored as an array of option labels.
      // Scale answers are stored as a number.
      // Textarea answers are stored as the trimmed string.
      const payload: Record<string, string | number | string[]> = {};
      form.questions.forEach((q, i) => {
        if (q.type === "contact") return;
        const a = answers[key(i)];
        if (a === undefined || a === null) return;
        if (q.type === "single" && typeof a === "number") {
          payload[key(i)] = q.options[a];
        } else if (q.type === "multi" && Array.isArray(a)) {
          payload[key(i)] = a.map((idx) => q.options[idx]);
        } else if (q.type === "scale" && typeof a === "number") {
          payload[key(i)] = a;
        } else if (
          (q.type === "textarea" || q.type === "text") &&
          typeof a === "string"
        ) {
          payload[key(i)] = a;
        }
      });

      try {
        const result = await submitMutation.mutateAsync({
          formId: resolvedFormId,
          answers: payload,
          contact: {
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            businessName: trimmedBusiness || undefined,
          },
          ndprConsent: true,
        });
        setSubmittedRef(result.ref);
        setIndex(total); // → outro
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Something went wrong. Please try again.";
        toast.error(msg);
        // Stay on contact step.
      }
      return;
    }

    setIndex(index + 1);
  }

  function handleRestart() {
    setAnswers({});
    setSkipped({});
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

  // ─── Renderers ────────────────────────────────────────────────────────────

  function renderIntro(f: DiagnosticForm) {
    return (
      <div className="form-body">
        <div className="intro-card">
          <div className="intro-eyebrow">{f.intro.eyebrow}</div>
          <h1
            className="intro-title"
            dangerouslySetInnerHTML={{ __html: f.intro.title }}
          />
          <p className="intro-body">{f.intro.body}</p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Duration</div>
              <div className="v">{f.intro.duration}</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Questions</div>
              <div className="v">{f.intro.questions}</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Privacy</div>
              <div className="v">{f.intro.privacy}</div>
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

  function renderQuestion(q: DiagnosticQuestion, i: number) {
    const isLast = i === total - 1;
    const isContact = q.type === "contact";
    const isSkipped = skipped[key(i)];

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

            {renderInput(q, i)}

            {isSkipped ? (
              <div className="skipped-note">
                skipped — you can still answer
              </div>
            ) : null}
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
            {!isContact && q.optional ? (
              <button
                type="button"
                className="btn btn-skip"
                onClick={handleSkip}
              >
                Skip
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={
                isContact
                  ? !contact.consent || submitMutation.isPending
                  : false
              }
            >
              {isContact
                ? submitMutation.isPending
                  ? "Submitting…"
                  : "Submit"
                : isLast
                  ? "Submit"
                  : "Continue"}
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderInput(q: DiagnosticQuestion, i: number) {
    const a = answers[key(i)];

    if (q.type === "textarea") {
      return (
        <textarea
          ref={(el) => {
            inputRef.current = el;
          }}
          className="input-textarea"
          placeholder={q.placeholder ?? ""}
          value={typeof a === "string" ? a : ""}
          onChange={(e) => setAnswer(i, e.target.value)}
        />
      );
    }

    if (q.type === "text") {
      return (
        <input
          ref={(el) => {
            inputRef.current = el;
          }}
          type="text"
          className="input-text"
          placeholder={q.placeholder ?? ""}
          value={typeof a === "string" ? a : ""}
          onChange={(e) => setAnswer(i, e.target.value)}
        />
      );
    }

    if (q.type === "single") {
      const selected = typeof a === "number" ? a : -1;
      return (
        <div className="options-grid">
          {q.options.map((opt, idx) => {
            const isSel = selected === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`option ${isSel ? "selected" : ""}`}
                onClick={() => {
                  setAnswer(i, idx);
                  // Auto-advance after small beat (matches source).
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
      );
    }

    if (q.type === "multi") {
      const selected = Array.isArray(a) ? (a as number[]) : [];
      return (
        <div className="options-grid">
          {q.options.map((opt, idx) => {
            const isSel = selected.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                className={`option multi ${isSel ? "selected" : ""}`}
                onClick={() => {
                  const next = isSel
                    ? selected.filter((n) => n !== idx)
                    : [...selected, idx];
                  setAnswer(i, next);
                }}
              >
                <div className="option-marker" />
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (q.type === "scale") {
      const selected = typeof a === "number" ? a : -1;
      const buttons: number[] = [];
      for (let n = q.min; n <= q.max; n++) buttons.push(n);
      return (
        <>
          <div className="scale-row">
            {buttons.map((n) => (
              <button
                key={n}
                type="button"
                className={`scale-btn ${selected === n ? "selected" : ""}`}
                onClick={() => {
                  setAnswer(i, n);
                  window.setTimeout(() => {
                    setIndex((cur) => (cur === i ? cur + 1 : cur));
                  }, 320);
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="scale-labels">
            <span>{q.minLabel}</span>
            <span>{q.maxLabel}</span>
          </div>
        </>
      );
    }

    // contact
    if (q.type === "contact") {
      return (
        <>
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
              I agree that Hamzury may contact me about this submission.
              My information will be kept private and not shared with
              third parties, in line with the Nigeria Data Protection
              Regulation (NDPR).
            </span>
          </label>
        </>
      );
    }

    return null;
  }

  function renderOutro() {
    const ref = submittedRef || "";
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
            {ref ? (
              <>
                Reference{" "}
                <span className="outro-ref">{ref}</span>. We'll reach out
                within 24 hours with a personalised breakdown of your
                responses.
              </>
            ) : (
              <>
                Your responses are in. We'll reach out within 24 hours
                with a personalised breakdown.
              </>
            )}
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Next step</div>
              <div className="v">We reach out within 24 hours</div>
            </div>
            {ref ? (
              <div className="intro-meta-item">
                <div className="k">Your reference</div>
                <div className="v">{ref}</div>
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
  const progressPct = showProgress
    ? Math.round(((index + 1) / total) * 100)
    : 0;

  return (
    <div className="diagnostic-form">
      <div className="form-stage">
        <div className="form-header">
          <div className="brand">
            <div className="brand-dot">H</div>
            <span>Hamzury</span>
          </div>
          {showProgress ? (
            <div className="progress-wrap">
              <span>
                {index + 1} of {total}
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
          ? renderIntro(form)
          : isOutro
            ? renderOutro()
            : currentQ
              ? renderQuestion(currentQ, index)
              : null}
      </div>
    </div>
  );
}
