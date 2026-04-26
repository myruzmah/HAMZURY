/**
 * Cross-company router — analyzes Clarity Session answers and detects
 * which Hamzury divisions (Bizdoc / Scalar / Medialy / HUB) the visitor
 * is a fit for.
 *
 * The 14 Clarity Session questions live in `client/src/lib/diagnostic-forms.ts`
 * under `FORMS.clarity.questions`. This matcher reads the answers (keyed by
 * question index, since the client form sends `answers` as
 * `Record<string, AnswerValue>` where the key is the question index as a
 * string).
 *
 * Matching rules per `MASTER-CHAT-FLOW.md` "SITE 1 — HAMZURY.COM":
 *
 *   | If diagnostic shows                                      | Lead for                       |
 *   |----------------------------------------------------------|--------------------------------|
 *   | Filed taxes >1y ago / no CAC / no TCC / FIRS letter       | Bizdoc — Compliance Mgmt       |
 *   | Website broken/missing / losing leads / no system         | Scalar — Website / CRM         |
 *   | Manual repetitive tasks / wants AI                        | Scalar — Automation / AI       |
 *   | No content presence / haven't posted / no plan            | Medialy — Social Media Mgmt    |
 *   | Skill gap / team needs training                           | HUB — relevant program         |
 *
 * Question index → meaning (from FORMS.clarity.questions, 0-based):
 *   0  textarea  — feeling in 12 months
 *   1  textarea  — what to take off your plate
 *   2  textarea  — Sunday-night business worry
 *   3  single    — CAC registration             ← Bizdoc signal
 *   4  single    — last tax filing              ← Bizdoc signal
 *   5  scale     — audit readiness 1-5          ← Bizdoc signal
 *   6  single    — where leads live             ← Scalar (CRM) signal
 *   7  textarea  — most repetitive task         ← Scalar (AI) signal
 *   8  single    — online impression            ← Scalar (Website) signal
 *   9  multi     — presence pains               ← Medialy / Scalar signal
 *   10 textarea  — costly skill gap             ← HUB signal
 *   11 single    — how team grows skills        ← HUB signal
 *   12 textarea  — thriving version
 *   13 textarea  — top 90-day change
 *   14 contact   — name/email/phone (handled separately by client form)
 */

export type Company = "bizdoc" | "scalar" | "medialy" | "hub";

export interface MatchedCompany {
  company: Company;
  primaryService: string;
  reason: string;
}

type AnswerValue = string | number | string[];
type Answers = Record<string, AnswerValue>;

// ─── helpers ─────────────────────────────────────────────────────────────────

function asString(v: AnswerValue | undefined): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" | ");
  return String(v);
}

function asArray(v: AnswerValue | undefined): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v;
  return [String(v)];
}

function asNumber(v: AnswerValue | undefined): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function includesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

// ─── matcher ─────────────────────────────────────────────────────────────────

/**
 * Analyze Clarity Session answers and return the list of divisions the
 * visitor matches. Returns `[]` when no signal is strong enough to warrant
 * cross-routing — in that case the standard single-lead email goes out.
 *
 * The `answers` map is keyed by question index as a string ("0", "1", ...)
 * to match the existing diagnostic form payload shape.
 */
export function analyzeClarityAnswers(answers: Answers): MatchedCompany[] {
  const matches: MatchedCompany[] = [];

  // ─ Bizdoc: compliance signals ──────────────────────────────────────────────
  const cacAnswer = asString(answers["3"]);   // CAC registration
  const taxAnswer = asString(answers["4"]);   // last tax filing
  const auditScale = asNumber(answers["5"]);  // audit readiness 1-5

  const bizdocReasons: string[] = [];
  if (
    cacAnswer &&
    includesAny(cacAnswer, [
      "Started but not finished",
      "No, not yet",
      "I'm not sure",
    ])
  ) {
    bizdocReasons.push("CAC registration incomplete or unclear");
  }
  if (
    taxAnswer &&
    includesAny(taxAnswer, [
      "1–2 years ago",
      "1-2 years ago",
      "More than 2 years ago",
      "I've never filed",
      "I'm not sure",
    ])
  ) {
    bizdocReasons.push("Filed taxes >1 year ago / never filed");
  }
  if (auditScale != null && auditScale <= 2) {
    bizdocReasons.push(`Audit readiness low (${auditScale}/5)`);
  }
  if (bizdocReasons.length > 0) {
    matches.push({
      company: "bizdoc",
      primaryService: "Compliance Management",
      reason: bizdocReasons.join("; "),
    });
  }

  // ─ Scalar Website / CRM: lead-tracking and online presence ────────────────
  const crmAnswer = asString(answers["6"]);      // where leads live
  const onlineAnswer = asString(answers["8"]);   // online impression
  const presencePains = asArray(answers["9"]);   // multi: presence pains

  const websiteReasons: string[] = [];
  if (
    crmAnswer &&
    includesAny(crmAnswer, [
      "Spreadsheets",
      "WhatsApp and my memory",
      "All over the place",
      "We don't really track this",
    ])
  ) {
    websiteReasons.push("No proper CRM — leads scattered");
  }
  if (
    onlineAnswer &&
    includesAny(onlineAnswer, [
      "Unsure what we actually do",
      "Honestly, I don't want to check",
      "Nothing — we're barely online",
      "Nothing - we're barely online",
    ])
  ) {
    websiteReasons.push("Weak or missing online presence");
  }
  if (websiteReasons.length > 0) {
    matches.push({
      company: "scalar",
      primaryService: "Website / CRM",
      reason: websiteReasons.join("; "),
    });
  }

  // ─ Scalar Automation / AI: manual repetitive work ─────────────────────────
  const repetitiveTask = asString(answers["7"]); // textarea: repetitive task
  const automationReasons: string[] = [];
  // If they wrote anything substantive (>20 chars) about a repetitive task,
  // that's a clear automation signal.
  if (repetitiveTask.trim().length > 20) {
    automationReasons.push("Has a recurring manual task ripe for automation");
  }
  // Wishing someone would handle media is also a "wants help / wants AI" signal,
  // but that's more Medialy. We keep automation strictly on Q7.
  if (automationReasons.length > 0) {
    matches.push({
      company: "scalar",
      primaryService: "Automation / AI",
      reason: automationReasons.join("; "),
    });
  }

  // ─ Medialy: presence / content ────────────────────────────────────────────
  const mediaReasons: string[] = [];
  const mediaPainNeedles = [
    "I post but nothing grows",
    "We have no consistent content",
    "Our brand looks inconsistent",
    "I wish someone would just handle media for us",
  ];
  const matchedMediaPains = presencePains.filter((p) =>
    mediaPainNeedles.some((n) => p.toLowerCase().includes(n.toLowerCase())),
  );
  if (matchedMediaPains.length > 0) {
    mediaReasons.push(
      `Content/presence pain: ${matchedMediaPains.join(", ")}`,
    );
  }
  if (
    onlineAnswer &&
    includesAny(onlineAnswer, [
      "Nothing — we're barely online",
      "Nothing - we're barely online",
    ])
  ) {
    mediaReasons.push("Barely online — no content presence");
  }
  if (mediaReasons.length > 0) {
    matches.push({
      company: "medialy",
      primaryService: "Social Media Management",
      reason: mediaReasons.join("; "),
    });
  }

  // ─ HUB: skill gap / team training ─────────────────────────────────────────
  const skillGap = asString(answers["10"]);    // textarea: costly skill gap
  const teamGrowth = asString(answers["11"]);  // single: how team grows skills

  const hubReasons: string[] = [];
  if (skillGap.trim().length > 10) {
    hubReasons.push("Named a costly skill gap on the team");
  }
  if (
    teamGrowth &&
    includesAny(teamGrowth, [
      "Self-directed — they figure it out",
      "Self-directed - they figure it out",
      "Honestly, they don't",
      "I've never thought about this",
    ])
  ) {
    hubReasons.push("No structured team learning in place");
  }
  if (hubReasons.length > 0) {
    matches.push({
      company: "hub",
      primaryService: "Team Training Program",
      reason: hubReasons.join("; "),
    });
  }

  return matches;
}

// ─── display helpers (used by email template) ────────────────────────────────

export const COMPANY_LABELS: Record<Company, string> = {
  bizdoc: "Bizdoc",
  scalar: "Scalar",
  medialy: "Medialy",
  hub: "HUB",
};
