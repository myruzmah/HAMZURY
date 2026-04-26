/**
 * Google Apps Script webhook integration.
 *
 * The Apps Script web app receives all chat-side leads in addition to
 * our internal tRPC backend (dual-write). When the Hamzury Operations
 * Master workspace is fully built out, this becomes the primary
 * destination and the tRPC mirror can eventually be retired.
 *
 * TODO: Set the real WEBHOOK_URL after deploying HAMZURY-BACKEND.gs as
 * a Google Apps Script Web App (Anyone with link can access). Until
 * then, posts to the placeholder URL are short-circuited to a
 * console.log so dev / preview can see what would have been sent —
 * they never block the user flow.
 *
 * The four payload shapes (`formType` discriminator) match the four
 * tabs created by HAMZURY-BACKEND.gs:
 *   - diagnostic     → "Diagnostics" tab          (chat + form diagnostics)
 *   - requirement    → "Requirements" tab         (post-payment intake)
 *   - crossCompany   → "Cross-Company Leads" tab  (multi-company match)
 *   - leadCapture    → "Diagnostics" tab          (generic chat lead)
 *
 * Wire-up notes:
 *   - Apps Script Web Apps don't return CORS headers by default, so
 *     this helper uses `mode: "no-cors"`. That means we cannot read
 *     the response — we treat every send as fire-and-forget.
 *   - All errors are caught and logged with `console.warn` so a
 *     network failure or bad URL never breaks the chat / form flow.
 */

// TODO: Replace with deployed Apps Script Web App URL.
// Format will look like:
//   https://script.google.com/macros/s/AKfycbx.../exec
// Deployed 2026-04-26 — "Hamzury Backend v1", Web app, "Anyone" access.
// Lands writes in the "Hamzury Submissions" Google Sheet.
const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzofHoaqXV4EVQxscffo7GjlHcqJfHP_58JU_R-5URoe_AeIAPx33xUn-lPuGm1yWtW/exec";

export type AppsScriptPayload =
  | {
      formType: "diagnostic";
      site: "hamzury" | "bizdoc" | "scalar" | "medialy";
      data: Record<string, unknown>;
    }
  | {
      formType: "requirement";
      site: string;
      data: Record<string, unknown>;
    }
  | {
      formType: "crossCompany";
      data: {
        primaryRef: string;
        matches: unknown[];
        visitor: unknown;
      };
    }
  | {
      formType: "leadCapture";
      site: string;
      data: {
        source: string;
        details: string;
        phone?: string;
        ref?: string;
      };
    };

/**
 * Posts the payload to the Apps Script web app. Fire-and-forget —
 * silently swallows errors so user flow never blocks on this.
 *
 * Returns a Promise<void> so callers MAY await if they want to fence
 * a follow-up render — but the recommended pattern is to call without
 * awaiting and let it run in the background.
 */
export async function postToAppsScript(
  payload: AppsScriptPayload,
): Promise<void> {
  try {
    if (WEBHOOK_URL.includes("PLACEHOLDER_ID")) {
      // No real URL yet — log so dev can see what would have been sent.
      // eslint-disable-next-line no-console
      console.log(
        "[apps-script] (placeholder URL — would POST):",
        payload,
      );
      return;
    }
    // Convert our 4 internal payload shapes to the 2 the Apps Script
    // expects (diagnostic / requirement). The script's handleDiagnostic
    // pulls contact info from `answers.contact.{name,business,email,
    // phone,consent}` — so we re-shape here.
    const wireBody = toWireBody(payload);
    // Apps Script web apps don't return CORS preflight headers and a
    // Content-Type of `application/json` triggers a preflight that fails.
    // Sending as `text/plain;charset=utf-8` avoids the preflight; the
    // server still parses the body as JSON via JSON.parse(e.postData.contents).
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(wireBody),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[apps-script] post failed (non-blocking):", e);
  }
}

/**
 * Reshape our 4 internal payload shapes into what HAMZURY-BACKEND.gs
 * expects on the wire. The script only knows two `formType`s:
 *   - "diagnostic"   → handleDiagnostic
 *   - "requirement"  → handleRequirement
 * Everything else has to be folded into one of those two.
 */
function toWireBody(payload: AppsScriptPayload): Record<string, unknown> {
  const sourceTag =
    "site" in payload && payload.site
      ? `chat_${payload.site}`
      : "chat";
  const data = (payload as { data?: Record<string, unknown> }).data || {};

  // Pull a generic phone from the captured data wherever it sits
  const phone = pickString(data, ["phone", "contactPhone"]) || "";
  const name = pickString(data, ["name", "contactName"]) || "";
  const email = pickString(data, ["email", "contactEmail"]) || "";
  const business =
    pickString(data, ["business", "businessName", "company"]) || "";

  if (payload.formType === "requirement") {
    return {
      formType: "requirement",
      form: `requirement-${(payload as { site?: string }).site || "general"}`,
      formTitle: "Requirement intake",
      ref: pickString(data, ["ref"]) || undefined,
      answers: {
        contact: { name, business, email, phone, consent: true },
        ...data,
      },
      meta: { source: sourceTag },
    };
  }

  if (payload.formType === "crossCompany") {
    const cc = (payload as {
      data: { primaryRef: string; matches: unknown[]; visitor: unknown };
    }).data;
    const visitor = (cc.visitor || {}) as Record<string, unknown>;
    return {
      formType: "diagnostic",
      form: "clarity-multi",
      formTitle: "Clarity Session — multi-company match",
      ref: cc.primaryRef,
      answers: {
        contact: {
          name: pickString(visitor, ["name"]) || "",
          business: pickString(visitor, ["business", "businessName"]) || "",
          email: pickString(visitor, ["email"]) || "",
          phone: pickString(visitor, ["phone"]) || "",
          consent: true,
        },
        matches: cc.matches,
      },
      meta: { source: "clarity_cross_company" },
    };
  }

  // diagnostic | leadCapture both fold into "diagnostic"
  const isLeadCapture = payload.formType === "leadCapture";
  const lc = isLeadCapture
    ? (data as { source?: string; details?: string })
    : null;
  return {
    formType: "diagnostic",
    form: lc ? `lead-${lc.source || "chat"}` : "chat-diagnostic",
    formTitle: lc
      ? `Chat lead — ${lc.source || "chat"}`
      : "Chat diagnostic",
    answers: {
      contact: { name, business, email, phone, consent: true },
      ...(lc ? { details: lc.details, source: lc.source } : data),
    },
    meta: { source: sourceTag },
  };
}

function pickString(
  obj: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}
