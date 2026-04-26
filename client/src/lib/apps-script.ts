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
const WEBHOOK_URL =
  "https://script.google.com/macros/s/PLACEHOLDER_ID/exec";

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
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script doesn't return CORS headers by default
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[apps-script] post failed (non-blocking):", e);
  }
}
