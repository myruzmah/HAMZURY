/**
 * RequirementForm — generic post-payment requirement intake form.
 *
 * Mirrors the shape of `pages/DiagnosticForm.tsx`. Renders any service in
 * `lib/requirement-forms.ts` by id. Adding a new service is two lines of
 * code: extend FORMS, add a route in App.tsx.
 *
 * Flow:
 *   1. Read `?ref=HMZ-YY/M-XXXX` from the URL.
 *   2. Call `requirements.verifyRef` — until it resolves valid, show the
 *      verify card. If invalid, show a friendly "link expired" message.
 *   3. Render the intro card.
 *   4. Walk through each step (one at a time). Files upload immediately
 *      via `requirements.uploadFile`; we keep the storage keys.
 *   5. Final review step adds the NDPR consent checkbox; submit calls
 *      `requirements.submit` and shows the outro.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  FORMS,
  type RequirementField,
  type RequirementForm as RequirementFormType,
  type RequirementFormId,
  type FileField,
} from "@/lib/requirement-forms";
import "@/styles/requirement.css";

// ─── Types ────────────────────────────────────────────────────────────────

interface Props {
  serviceId: RequirementFormId;
}

type AnswerValue = string | number | string[];
type AnswerMap = Record<string, AnswerValue>;

interface UploadedFile {
  /** Storage key returned by the server. */
  key: string;
  /** Original (sanitised) filename for display. */
  name: string;
  /** Size in bytes for the chip label. */
  sizeBytes: number;
}

interface PendingFile {
  /** Local-only id so we can correlate uploading rows with results. */
  localId: string;
  name: string;
  sizeBytes: number;
  /** UI status for the chip. */
  status: "uploading" | "error";
  error?: string;
}

type FilesMap = Record<string, UploadedFile[]>;
type PendingMap = Record<string, PendingFile[]>;

// ─── Constants ────────────────────────────────────────────────────────────

const MAX_BYTES = 10 * 1024 * 1024;

const REF_RE = /^HMZ-\d{2}\/\d{1,2}-\d{4}$/;

// Single-character glyphs we want to render verbatim in JSX. Defining them
// once here keeps the JSX clean and avoids editor copy-paste hazards.
const RIGHT_ARROW = "\u2192"; // →
const LEFT_ARROW = "\u2190"; // ←
const TIMES = "\u00d7"; // ×
const MIDDOT = "\u00b7"; // ·
const ELLIPSIS = "\u2026"; // …

// ─── Helpers ──────────────────────────────────────────────────────────────

function readRefFromUrl(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return (params.get("ref") || "").trim();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file."));
        return;
      }
      // Strip the `data:<mime>;base64,` prefix.
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read error."));
    reader.readAsDataURL(file);
  });
}

function isFieldFilled(
  field: RequirementField,
  answers: AnswerMap,
  files: FilesMap,
): boolean {
  if (field.type === "file") {
    return (files[field.id] ?? []).length > 0;
  }
  const v = answers[field.id];
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (typeof v === "number") return Number.isFinite(v);
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

// ─── Component ────────────────────────────────────────────────────────────

export default function RequirementForm({ serviceId }: Props) {
  const [, navigate] = useLocation();
  const form = FORMS[serviceId];

  // ─── State ────────────────────────────────────────────────────────────────
  const refValue = useMemo(() => readRefFromUrl(), []);
  const [stepIndex, setStepIndex] = useState<number>(-1); // -1 intro · steps.length = outro
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [files, setFiles] = useState<FilesMap>({});
  const [pending, setPending] = useState<PendingMap>({});
  const [draggingFid, setDraggingFid] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string>("");

  // Refs map: file input DOM nodes by field id (used to clear selection).
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ─── tRPC ─────────────────────────────────────────────────────────────────
  const verify = trpc.requirements.verifyRef.useQuery(
    { ref: refValue },
    {
      enabled: REF_RE.test(refValue),
      retry: false,
      refetchOnWindowFocus: false,
    },
  );
  const uploadMutation = trpc.requirements.uploadFile.useMutation();
  const submitMutation = trpc.requirements.submit.useMutation();

  // ─── Document title ───────────────────────────────────────────────────────
  useEffect(() => {
    if (form) document.title = `${form.name} ${MIDDOT} Hamzury`;
  }, [form]);

  // ─── Early returns ────────────────────────────────────────────────────────
  if (!form) {
    return (
      <div className="requirement-form">
        <div className="form-stage">
          <div className="form-body">
            <div className="verify-card">
              <h2>This form isn{"\u2019"}t live yet.</h2>
              <p>
                We{"\u2019"}re still preparing the requirement form for this
                service. Reach out to your CSO and they{"\u2019"}ll send you the
                next step.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!refValue || !REF_RE.test(refValue)) {
    return (
      <div className="requirement-form">
        <div className="form-stage">
          <Header form={form} />
          <div className="form-body">
            <div className="verify-card">
              <h2>This link is missing your reference.</h2>
              <p>
                Each requirement link is unique to your project. Please use the
                link your CSO sent you (it ends with{" "}
                <code>?ref=HMZ-...</code>), or message us on WhatsApp and
                we{"\u2019"}ll resend it.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verify.isLoading) {
    return (
      <div className="requirement-form">
        <div className="form-stage">
          <Header form={form} />
          <div className="form-body">
            <div className="verify-card">
              <div className="verify-spinner" />
              <h2>Confirming your reference{ELLIPSIS}</h2>
              <p>One moment while we look up your project.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verify.isError || !verify.data?.valid) {
    return (
      <div className="requirement-form">
        <div className="form-stage">
          <Header form={form} />
          <div className="form-body">
            <div className="verify-card">
              <h2>We couldn{"\u2019"}t verify this reference.</h2>
              <p>
                The link may have expired, or the reference number is wrong.
                Please check the link your CSO sent you, or reach out on
                WhatsApp and we{"\u2019"}ll send a fresh one.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lead = verify.data.lead;

  // ─── Stage helpers ────────────────────────────────────────────────────────
  const totalSteps = form.steps.length;
  const isIntro = stepIndex === -1;
  const isOutro = stepIndex >= totalSteps;
  const currentStep = !isIntro && !isOutro ? form.steps[stepIndex] : null;

  function setAnswer(fid: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [fid]: value }));
  }

  function clearAnswer(fid: string) {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[fid];
      return next;
    });
  }

  // ─── File handling ────────────────────────────────────────────────────────

  async function uploadOne(fid: string, file: File, multiple: boolean) {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name} is over 10 MB and was skipped.`);
      return;
    }

    const localId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setPending((prev) => ({
      ...prev,
      [fid]: [
        ...(prev[fid] ?? []),
        {
          localId,
          name: file.name,
          sizeBytes: file.size,
          status: "uploading",
        },
      ],
    }));

    try {
      const fileData = await fileToBase64(file);
      const res = await uploadMutation.mutateAsync({
        ref: refValue,
        serviceId,
        fieldId: fid,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        fileData,
      });

      setPending((prev) => ({
        ...prev,
        [fid]: (prev[fid] ?? []).filter((p) => p.localId !== localId),
      }));

      setFiles((prev) => {
        const existing = prev[fid] ?? [];
        const next: UploadedFile = {
          key: res.key,
          name: res.fileName,
          sizeBytes: res.sizeBytes,
        };
        return {
          ...prev,
          [fid]: multiple ? [...existing, next] : [next],
        };
      });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Upload failed.";
      toast.error(msg);
      setPending((prev) => ({
        ...prev,
        [fid]: (prev[fid] ?? []).map((p) =>
          p.localId === localId ? { ...p, status: "error", error: msg } : p,
        ),
      }));
    }
  }

  async function handleFileList(field: FileField, list: FileList | null) {
    if (!list || list.length === 0) return;
    const arr = Array.from(list);
    const multiple = !!field.multiple;

    if (!multiple) {
      // Single-file fields replace whatever was there.
      await uploadOne(field.id, arr[0], false);
      return;
    }

    // Multiple — apply maxFiles cap if set.
    const existingCount = (files[field.id] ?? []).length;
    const cap = field.maxFiles ?? Infinity;
    const room = Math.max(0, cap - existingCount);
    const accepted = arr.slice(0, room);
    if (accepted.length < arr.length) {
      toast.warning(
        `Only ${cap} file${cap === 1 ? "" : "s"} allowed for this field.`,
      );
    }
    // Run uploads in parallel, but await all so the chips reflect final state.
    await Promise.all(accepted.map((f) => uploadOne(field.id, f, true)));
  }

  function removeFile(fid: string, key: string) {
    setFiles((prev) => {
      const list = (prev[fid] ?? []).filter((f) => f.key !== key);
      const next = { ...prev };
      if (list.length > 0) next[fid] = list;
      else delete next[fid];
      return next;
    });
  }

  function dismissPending(fid: string, localId: string) {
    setPending((prev) => ({
      ...prev,
      [fid]: (prev[fid] ?? []).filter((p) => p.localId !== localId),
    }));
  }

  // ─── Step navigation ──────────────────────────────────────────────────────

  function validateCurrentStep(): string | null {
    if (!currentStep) return null;
    for (const f of currentStep.fields) {
      if (!f.required) continue;
      if (!isFieldFilled(f, answers, files)) {
        return `\u201c${f.label}\u201d is required.`;
      }
    }
    // Block "Continue" while uploads are mid-flight on this step.
    for (const f of currentStep.fields) {
      if (f.type !== "file") continue;
      const stillUploading = (pending[f.id] ?? []).some(
        (p) => p.status === "uploading",
      );
      if (stillUploading) {
        return "Please wait for uploads to finish.";
      }
    }
    return null;
  }

  function handleStart() {
    setErrorText("");
    setStepIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setErrorText("");
    setStepIndex((i) => Math.max(-1, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleContinue() {
    const err = validateCurrentStep();
    if (err) {
      setErrorText(err);
      return;
    }
    setErrorText("");
    setStepIndex((i) => Math.min(totalSteps, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    if (!consent) {
      setErrorText("Please confirm before submitting.");
      return;
    }
    if (!form) return;
    // Re-validate every step's required fields one last time.
    for (const step of form.steps) {
      for (const f of step.fields) {
        if (!f.required) continue;
        if (!isFieldFilled(f, answers, files)) {
          setErrorText(
            `\u201c${f.label}\u201d in \u201c${step.title}\u201d is required.`,
          );
          return;
        }
      }
    }

    const uploadKeys: Record<string, string[]> = {};
    Object.entries(files).forEach(([fid, arr]) => {
      uploadKeys[fid] = arr.map((f) => f.key);
    });

    try {
      const result = await submitMutation.mutateAsync({
        ref: refValue,
        serviceId,
        answers,
        uploadKeys,
        ndprConsent: true,
      });
      setSubmittedRef(result.ref);
      setStepIndex(totalSteps); // → outro
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Submission failed. Please try again.";
      toast.error(msg);
      setErrorText(msg);
    }
  }

  // ─── Renderers ────────────────────────────────────────────────────────────

  function renderField(field: RequirementField) {
    if (field.type === "file") {
      return renderFileField(field);
    }
    if (field.type === "textarea") {
      return (
        <div className="field" key={field.id}>
          <label className="field-label" htmlFor={`f-${field.id}`}>
            {field.label}
            {field.required ? <span className="field-required">*</span> : null}
          </label>
          <textarea
            id={`f-${field.id}`}
            className="textarea"
            placeholder={field.placeholder ?? ""}
            value={
              typeof answers[field.id] === "string"
                ? (answers[field.id] as string)
                : ""
            }
            onChange={(e) => setAnswer(field.id, e.target.value)}
          />
          {field.hint ? <div className="field-hint">{field.hint}</div> : null}
        </div>
      );
    }
    if (field.type === "select") {
      return (
        <div className="field" key={field.id}>
          <label className="field-label" htmlFor={`f-${field.id}`}>
            {field.label}
            {field.required ? <span className="field-required">*</span> : null}
          </label>
          <select
            id={`f-${field.id}`}
            className="select"
            value={
              typeof answers[field.id] === "string"
                ? (answers[field.id] as string)
                : ""
            }
            onChange={(e) => {
              if (e.target.value) setAnswer(field.id, e.target.value);
              else clearAnswer(field.id);
            }}
          >
            <option value="">Select one{ELLIPSIS}</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {field.hint ? <div className="field-hint">{field.hint}</div> : null}
        </div>
      );
    }

    // text · email · tel · number
    return (
      <div className="field" key={field.id}>
        <label className="field-label" htmlFor={`f-${field.id}`}>
          {field.label}
          {field.required ? <span className="field-required">*</span> : null}
        </label>
        <input
          id={`f-${field.id}`}
          className="input"
          type={field.type}
          placeholder={field.placeholder ?? ""}
          value={
            answers[field.id] === undefined || answers[field.id] === null
              ? ""
              : String(answers[field.id])
          }
          onChange={(e) => {
            const raw = e.target.value;
            if (field.type === "number") {
              if (raw === "") {
                clearAnswer(field.id);
                return;
              }
              const n = Number(raw);
              if (Number.isFinite(n)) setAnswer(field.id, n);
            } else {
              setAnswer(field.id, raw);
            }
          }}
        />
        {field.hint ? <div className="field-hint">{field.hint}</div> : null}
      </div>
    );
  }

  function renderFileField(field: FileField) {
    const uploaded = files[field.id] ?? [];
    const inFlight = pending[field.id] ?? [];
    const isDragging = draggingFid === field.id;
    const acceptHelp = field.accept
      ? `Accepted: ${field.accept.replace(/\./g, "").replace(/,/g, ", ")}`
      : "Any file";

    return (
      <div className="field" key={field.id}>
        <label className="field-label">
          {field.label}
          {field.required ? <span className="field-required">*</span> : null}
        </label>

        <label
          className={`upload-zone${isDragging ? " dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDraggingFid(field.id);
          }}
          onDragLeave={() => {
            if (draggingFid === field.id) setDraggingFid(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDraggingFid(null);
            void handleFileList(field, e.dataTransfer.files);
          }}
        >
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
              <path d="M12 16V4m-5 5l5-5 5 5m-12 7v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
            </svg>
          </div>
          <div className="upload-primary">
            Drop file{field.multiple ? "s" : ""} here or <u>browse</u>
          </div>
          <div className="upload-secondary">
            {acceptHelp} {MIDDOT} max 10MB{field.multiple ? " each" : ""}
          </div>
          <input
            ref={(el) => {
              fileInputRefs.current[field.id] = el;
            }}
            type="file"
            accept={field.accept}
            multiple={!!field.multiple}
            onChange={(e) => {
              void handleFileList(field, e.target.files);
              // Clear the value so re-selecting the same file fires onChange again.
              e.target.value = "";
            }}
          />
        </label>

        {(uploaded.length > 0 || inFlight.length > 0) && (
          <div className="file-list">
            {uploaded.map((f) => (
              <div className="file-row" key={f.key}>
                <div className="file-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
                    <path d="M14 3v5h5M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5z" />
                  </svg>
                </div>
                <div className="file-meta">
                  <div className="file-name">{f.name}</div>
                  <div className="file-status">
                    {formatBytes(f.sizeBytes)} {MIDDOT} uploaded
                  </div>
                </div>
                <button
                  type="button"
                  className="file-remove"
                  onClick={() => removeFile(field.id, f.key)}
                  title="Remove"
                  aria-label={`Remove ${f.name}`}
                >
                  {TIMES}
                </button>
              </div>
            ))}
            {inFlight.map((p) => (
              <div
                className={`file-row ${p.status === "error" ? "error" : "uploading"}`}
                key={p.localId}
              >
                <div className="file-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
                    <path d="M14 3v5h5M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5z" />
                  </svg>
                </div>
                <div className="file-meta">
                  <div className="file-name">{p.name}</div>
                  <div className="file-status">
                    {p.status === "uploading"
                      ? `${formatBytes(p.sizeBytes)} ${MIDDOT} uploading${ELLIPSIS}`
                      : `${p.error ?? "Upload failed"} \u2014 click ${TIMES} to dismiss`}
                  </div>
                </div>
                <button
                  type="button"
                  className="file-remove"
                  onClick={() => dismissPending(field.id, p.localId)}
                  title="Dismiss"
                  aria-label={`Dismiss ${p.name}`}
                >
                  {TIMES}
                </button>
              </div>
            ))}
          </div>
        )}

        {field.hint ? <div className="field-hint">{field.hint}</div> : null}
      </div>
    );
  }

  function renderIntro() {
    if (!form) return null;
    const firstName = lead?.name ? lead.name.split(" ")[0] : "";
    return (
      <div className="form-body">
        <div className="intro-card">
          <div className="intro-eyebrow">Service requirements</div>
          <h1
            className="intro-title"
            dangerouslySetInnerHTML={{ __html: form.intro.title }}
          />
          <p className="intro-body">
            {firstName ? (
              <>
                Hi <strong>{firstName}</strong> {"\u2014"} {form.intro.body}
              </>
            ) : (
              form.intro.body
            )}
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Duration</div>
              <div className="v">{form.intro.duration}</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Steps</div>
              <div className="v">{form.steps.length}</div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Privacy</div>
              <div className="v">NDPR-protected</div>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={handleStart}>
            Begin {RIGHT_ARROW}
          </button>
        </div>
      </div>
    );
  }

  function renderStep() {
    if (!currentStep || !form) return null;
    const isLast = stepIndex === totalSteps - 1;
    const dots = form.steps.map((_, i) => {
      const cls = i < stepIndex ? "done" : i === stepIndex ? "active" : "";
      return <div key={i} className={`progress-dot ${cls}`} />;
    });

    return (
      <>
        <div className="form-body">
          <div className="form-card">
            <div className="progress-meta">
              <span>
                Step {stepIndex + 1} of {totalSteps}
              </span>
              <span>{form.name}</span>
            </div>
            <div className="progress-dots">{dots}</div>

            <div className="step-eyebrow">{form.name}</div>
            <h2 className="step-title">{currentStep.title}</h2>
            {currentStep.subtitle ? (
              <p className="step-subtitle">{currentStep.subtitle}</p>
            ) : null}

            {currentStep.fields.map((f) => renderField(f))}

            {isLast ? (
              <div className="consent-card">
                <label className="consent-row">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    I confirm the information provided is accurate and agree to
                    Hamzury storing these details and documents to deliver this
                    service. My data is kept private under the Nigeria Data
                    Protection Regulation (NDPR).
                  </span>
                </label>
              </div>
            ) : null}

            {errorText ? <div className="form-error">{errorText}</div> : null}
          </div>
        </div>

        <div className="form-footer">
          <button type="button" className="btn btn-ghost" onClick={handleBack}>
            {stepIndex === 0
              ? `${LEFT_ARROW} Back to intro`
              : `${LEFT_ARROW} Previous`}
          </button>
          {isLast ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!consent || submitMutation.isPending}
            >
              {submitMutation.isPending
                ? `Submitting${ELLIPSIS}`
                : `Submit requirements ${RIGHT_ARROW}`}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleContinue}
            >
              Continue {RIGHT_ARROW}
            </button>
          )}
        </div>
      </>
    );
  }

  function renderOutro() {
    if (!form) return null;
    return (
      <div className="form-body">
        <div className="outro-card">
          <div className="outro-mark">
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
            We{"\u2019"}ve <em>got</em> what we need.
          </h1>
          <p className="intro-body">
            Your {form.name} requirements are in. A specialist is reviewing now
            and will reach out on WhatsApp within 4 working hours with a
            confirmed timeline and next steps.
          </p>
          <div className="intro-meta">
            <div className="intro-meta-item">
              <div className="k">Reference</div>
              <div className="v">
                <span className="outro-ref">{submittedRef || refValue}</span>
              </div>
            </div>
            <div className="intro-meta-item">
              <div className="k">Next step</div>
              <div className="v">A specialist reaches out</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="requirement-form">
      <div className="form-stage">
        <Header form={form} refValue={refValue} />
        {isIntro ? renderIntro() : isOutro ? renderOutro() : renderStep()}
      </div>
    </div>
  );
}

// ─── Header (shared across all states) ────────────────────────────────────

function Header({
  form,
  refValue,
}: {
  form: RequirementFormType;
  refValue?: string;
}) {
  return (
    <div className="form-header">
      <div className="brand">
        <div className="brand-dot">H</div>
        <span>Hamzury</span>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {refValue ? <span className="ref-pill">{refValue}</span> : null}
      </div>
      <span className="sr-only" style={{ position: "absolute", left: -9999 }}>
        {form.name}
      </span>
    </div>
  );
}
