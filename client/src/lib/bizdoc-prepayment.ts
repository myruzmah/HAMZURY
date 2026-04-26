/* ══════════════════════════════════════════════════════════════════════════
   BIZDOC — Pre-payment Questionnaire (Phase 3, v16)
   --------------------------------------------------------------------------
   Static reference data + pure helpers for the 3-question pre-payment
   questionnaire described in MASTER-CHAT-FLOW.md → "PRE-PAYMENT
   QUESTIONNAIRE (Bizdoc only)" + "EDUCATIONAL TOOLTIPS" + "SHARE CAPITAL
   LOOKUP TABLE".

   The questionnaire fires:
   • after the document checklist for any GROUP 4 specialized business, and
   • directly (no checklist) for the GROUP 1 "CAC Business Registration" leaf.

   Q1 — foreigner directors (only when path involves NEW CAC registration)
   Q2 — entity type (Ltd / BN / PLC / Trustee)
   Q3 — share capital (only when entity is Ltd or PLC). Greys out options
        below the legal floor for the chosen business; force-locks ₦100M
        when foreigner = Yes.

   After Q3 (or after Q2 for BN / Trustee), `calculateBizdocPrice` produces
   a placeholder quote. The Bizdoc team will refine the pricing model with
   real data.

   Nothing in this file calls React or touches the DOM. Everything is plain
   data + pure functions so the chat panel can render the flow inline.
   ══════════════════════════════════════════════════════════════════════════ */

export type EntityType = "ltd" | "bn" | "plc" | "trustee";

/* ── Tooltip text (verbatim from MASTER-CHAT-FLOW.md) ──────────────────── */

export const TOOLTIP_FOREIGNER = `Good question. Here's what changes:

NIGERIAN-OWNED:
• Minimum share capital: ₦1,000,000 (most businesses)
• Standard CAC fees apply
• No special permits needed
• Faster registration timeline

IF ANY DIRECTOR IS FOREIGN:
• Minimum share capital: ₦100,000,000 (CAC requirement)
• Business Permit needed from Ministry of Interior
• CERPAC (residence permit) for the foreigner
• Higher stamp duty due to higher capital
• Longer timeline (additional immigration steps)

Reason: Nigerian law requires higher capital commitment from foreign-invested businesses.`;

export const TOOLTIP_ENTITY = `Both let you operate legally — but they're very different.

BUSINESS NAME (BN):
• Cheapest to register (~₦18,000 government fees)
• Fast (1-2 weeks)
• You and the business are legally the same person
• Personal assets at risk if business is sued
• Cannot raise outside investment
• Best for: small traders, freelancers, simple shops

LIMITED LIABILITY COMPANY (Ltd):
• Higher cost (~₦45,000+ government fees + stamp duty)
• Slower (3-5 weeks)
• Business is a separate legal entity from you
• Your personal assets are protected
• Can raise investment, take loans, sign big contracts
• More credible to bigger clients
• Best for: anyone serious about scale

If you're unsure, most growing businesses choose Ltd. The extra cost pays for itself the first time someone sues you and your house is safe.`;

export const TOOLTIP_SHARE_CAPITAL = `Share capital is the value of ownership your company issues at registration. It does NOT have to be money in the bank — it's the LEGAL ceiling of your company's value.

WHY IT MATTERS:
• CAC stamp duty = 0.75% of share capital
  (so ₦1M capital = ₦7,500 stamp duty)
• Some industries have legal minimums you cannot go below
• Banks and investors look at this number
• Higher capital = higher credibility for big contracts

COMMON BENCHMARKS:
• ₦1,000,000 — standard for most Nigerian Ltds
• ₦10,000,000 — recommended for bidding on contracts
• ₦100,000,000 — REQUIRED if any foreign director
• Industry-specific minimums (insurance, mining, fintech, etc.)

IF YOU'RE UNSURE:
₦1M is fine to start. You can increase later (CAC capital increase filing — Bizdoc handles this for ₦35k).`;

/* ── Share capital options shown to the visitor ────────────────────────── */

export type ShareCapitalOption = {
  value: number;
  label: string;
};

export const SHARE_CAPITAL_OPTIONS: ShareCapitalOption[] = [
  { value: 1_000_000,   label: "₦1,000,000 — minimum for most Nigerian-owned Ltd" },
  { value: 10_000_000,  label: "₦10,000,000 — recommended for contracts and credibility" },
  { value: 100_000_000, label: "₦100,000,000 — REQUIRED if any foreigner is on board" },
];

/** Helper for the "Higher — I have a specialized industry requirement"
 *  catch-all option. Returned as a sentinel so the UI can prompt the
 *  visitor to type a custom value (Phase 3 stub: hand-off to CSO). */
export const SHARE_CAPITAL_HIGHER_SENTINEL = -1;

/* ── Share-capital lookup table (verbatim from spec) ───────────────────── */

/** Returns the legal minimum share capital for a chosen specialized
 *  business + foreigner combination. When no business is chosen (plain
 *  CAC), only the foreigner rule applies. When two minimums apply, the
 *  HIGHER is used (per spec). */
export function effectiveShareCapitalFloor(input: {
  businessMin?: number;     // SpecializedBusiness.minShareCapital, if any
  hasForeigner: boolean;
}): number {
  const NIGERIAN_DEFAULT = 1_000_000;
  const FOREIGNER_FLOOR  = 100_000_000;
  const a = input.businessMin ?? NIGERIAN_DEFAULT;
  const b = input.hasForeigner ? FOREIGNER_FLOOR : NIGERIAN_DEFAULT;
  return Math.max(a, b);
}

/* ── Placeholder price calculator ──────────────────────────────────────── */

export type PriceInput = {
  /** Specialized business id (undefined for the standalone CAC leaf). */
  businessId?: string;
  entity: EntityType;
  hasForeigner: boolean;
  /** Share capital in Naira; used for stamp duty when entity is Ltd/PLC. */
  shareCapital: number;
  /** Number of unticked items from the document checklist. */
  missingChecklistCount: number;
};

export type PriceQuote = {
  total: number;
  timelineWeeks: string;
  breakdown: string[];
};

// TODO: Bizdoc team to refine pricing model with real data
export function calculateBizdocPrice(input: PriceInput): PriceQuote {
  const lines: string[] = [];
  let total = 0;
  let timeline = "3-5 weeks";

  // ── Base service fee + per-item add-on ────────────────────────────────
  switch (input.entity) {
    case "bn": {
      const base = 25_000;
      const perItem = 5_000 * input.missingChecklistCount;
      total += base + perItem;
      lines.push(`Business Name registration base: ₦${base.toLocaleString()}`);
      if (input.missingChecklistCount > 0) {
        lines.push(`Outstanding items (${input.missingChecklistCount}) × ₦5,000: ₦${perItem.toLocaleString()}`);
      }
      timeline = "1-2 weeks";
      break;
    }
    case "trustee": {
      const base = 150_000;
      const perItem = 10_000 * input.missingChecklistCount;
      total += base + perItem;
      lines.push(`Incorporated Trustee registration base: ₦${base.toLocaleString()}`);
      if (input.missingChecklistCount > 0) {
        lines.push(`Outstanding items (${input.missingChecklistCount}) × ₦10,000: ₦${perItem.toLocaleString()}`);
      }
      timeline = "8-12 weeks";
      break;
    }
    case "plc": {
      const base = 200_000;
      const perItem = 10_000 * input.missingChecklistCount;
      const stamp = Math.round(input.shareCapital * 0.0075);
      total += base + perItem + stamp;
      lines.push(`Public Limited Company registration base: ₦${base.toLocaleString()}`);
      if (input.missingChecklistCount > 0) {
        lines.push(`Outstanding items (${input.missingChecklistCount}) × ₦10,000: ₦${perItem.toLocaleString()}`);
      }
      lines.push(`CAC stamp duty (0.75% of ₦${input.shareCapital.toLocaleString()}): ₦${stamp.toLocaleString()}`);
      timeline = "8-12 weeks";
      break;
    }
    case "ltd":
    default: {
      const base = 80_000;
      const perItem = 8_000 * input.missingChecklistCount;
      const stamp = Math.round(input.shareCapital * 0.0075);
      total += base + perItem + stamp;
      lines.push(`Limited Liability Company registration base: ₦${base.toLocaleString()}`);
      if (input.missingChecklistCount > 0) {
        lines.push(`Outstanding items (${input.missingChecklistCount}) × ₦8,000: ₦${perItem.toLocaleString()}`);
      }
      lines.push(`CAC stamp duty (0.75% of ₦${input.shareCapital.toLocaleString()}): ₦${stamp.toLocaleString()}`);
      timeline = input.hasForeigner ? "10-14 weeks" : "3-5 weeks";
      break;
    }
  }

  // ── Foreigner surcharge (CERPAC + business permit) ────────────────────
  if (input.hasForeigner) {
    total += 300_000;
    lines.push(`CERPAC + business permit (foreign director): ₦300,000`);
    if (input.entity !== "ltd") {
      // Foreigner-Ltd already pushed timeline; PLC stays as-is, BN/Trustee
      // are unusual paths but flagged for CSO follow-up.
    }
  }

  // ── Specialized business surcharge ────────────────────────────────────
  if (input.businessId && input.businessId !== "other_specialized") {
    total += 100_000;
    lines.push(`Specialized regulatory work surcharge: ₦100,000`);
  }

  return { total, timelineWeeks: timeline, breakdown: lines };
}

/* ── Pretty Naira formatter ────────────────────────────────────────────── */

export function formatNaira(n: number): string {
  return `₦${n.toLocaleString()}`;
}
