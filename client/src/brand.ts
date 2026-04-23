/**
 * HAMZURY BRAND BIBLE — v1.0 · April 2026 · "Built to Last"
 *
 * Source of truth: PHASE1_FOUNDER/BRAND_BIBLE/HAMZURY_BRAND_BIBLE.txt
 *
 * CORE RULES (non-negotiable):
 *  - MILK (#FFFBEB) everywhere — like Apple uses white, we use milk
 *  - ONE font: Inter (Regular 400, Medium 500, SemiBold 600, Bold 700)
 *  - 8px grid system — all spacing in multiples of 8
 *  - Minimum margin: 32px
 *  - Each division has ONE accent colour (see below)
 *  - Outro: "Hamzury. Built to Last."
 *
 * STAFF portals (CEO, CSO, BizDev) stay in legacy green/gold so the two
 * surfaces remain visually distinct. Public rebrand applies only to marketing.
 */

/* ═══════════════════════════════════════════════════════════════════════
 * PUBLIC — home, /bizdoc, /scalar, /medialy, /hub, /about, /contact
 * ═══════════════════════════════════════════════════════════════════════ */
export const PUBLIC = {
  /** THE background colour. Milk. Use everywhere. */
  milk:     "#FFFBEB",
  /** Same as milk — alias for readability. */
  cream:    "#FFFBEB",
  /** Pure white — cards on milk */
  white:    "#FFFFFF",
  /** Near-black — body text */
  dark:     "#1A1A1A",
  /** Muted — captions, meta */
  muted:    "#6B7280",
  /** Hairline borders */
  hairline: "#E7E5E4",

  /** HAMZURY umbrella / institution navy — default CTA colour */
  navy:     "#1E3A8A",
  /** Founder personal brand — brown */
  brown:    "#8B4513",

  /** Per-division accent colours (from Brand Bible v1.0) */
  division: {
    bizdoc:  "#22C55E", // Green
    scalar:  "#0F172A", // Deep Navy
    medialy: "#3498DB", // Blue
    hub:     "#F59E0B", // Orange
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * STAFF — internal portals (unchanged legacy)
 * ═══════════════════════════════════════════════════════════════════════ */
export const STAFF = {
  bg:     "#FFFAF6",
  white:  "#FFFFFF",
  dark:   "#1A1A1A",
  muted:  "#666666",
  gold:   "#B48C4C",
  green:  "#1B4D3E",
  red:    "#EF4444",
  orange: "#F59E0B",
  blue:   "#3B82F6",
  purple: "#8B5CF6",
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * TYPE — Inter only. No other fonts.
 * ═══════════════════════════════════════════════════════════════════════ */
export const TYPE = {
  display: `Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif`,
  body:    `Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif`,
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * 8PX GRID — all spacing in multiples of 8
 * ═══════════════════════════════════════════════════════════════════════ */
export const SPACE = {
  xs:  8,
  sm:  16,
  md:  24,
  lg:  32,  // minimum margin per Brand Bible
  xl:  48,
  xxl: 64,
  huge: 96,
} as const;

export const RADIUS = {
  sm:   8,
  md:  16,
  lg:  24,
  xl:  32,
  pill: 999,
} as const;

export const SHADOW = {
  card:   "0 1px 3px rgba(0,0,0,0.04)",
  raised: "0 8px 32px rgba(0,0,0,0.06)",
  modal:  "0 20px 60px rgba(0,0,0,0.15)",
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * BRAND CONSTANTS — division metadata
 * ═══════════════════════════════════════════════════════════════════════ */
export type DivisionKey = "bizdoc" | "scalar" | "medialy" | "hub";

export const DIVISIONS: readonly {
  key: DivisionKey;
  name: string;
  category: string;
  tagline: string;
  path: string;
  accent: string;
  email: string;
  whatsapp: string;
}[] = [
  {
    key:      "bizdoc",
    name:     "Bizdoc",
    category: "Tax & Compliance",
    tagline:  "We handle FIRS so you can handle business.",
    path:     "/bizdoc",
    accent:   PUBLIC.division.bizdoc,
    email:    "bizdoc@hamzury.com",
    whatsapp: "08067149356",
  },
  {
    key:      "scalar",
    name:     "Scalar",
    category: "Web & Automation",
    tagline:  "Websites that work. Systems that scale.",
    path:     "/scalar",
    accent:   PUBLIC.division.scalar,
    email:    "scalar@hamzury.com",
    whatsapp: "09130700056",
  },
  {
    key:      "medialy",
    name:     "Medialy",
    category: "Social Media",
    tagline:  "Social media that actually brings clients.",
    path:     "/medialy",
    accent:   PUBLIC.division.medialy,
    email:    "medialy@hamzury.com",
    whatsapp: "09130700056",
  },
  {
    key:      "hub",
    name:     "HUB",
    category: "Tech Training",
    tagline:  "Tech skills that get you paid.",
    path:     "/hub",
    accent:   PUBLIC.division.hub,
    email:    "hub@hamzury.com",
    whatsapp: "09130700056",
  },
] as const;

export const BRAND_TAGLINE = "Built to Last.";
export const BRAND_OUTRO   = "Hamzury. Built to Last.";

export const CONTACT = {
  general:      "muhammad@hamzury.com",
  founderPhone: "09130700056",
  address:      "Hamzury Business Institute, Ajami Plaza, Garki, Abuja",
  hours: {
    weekdays: "Mon – Fri · 9:00 AM – 6:00 PM",
    saturday: "Sat · 10:00 AM – 2:00 PM",
    timezone: "WAT",
  },
} as const;

/** Fetch a division record by key. */
export function getDivision(key: DivisionKey) {
  return DIVISIONS.find(d => d.key === key)!;
}
