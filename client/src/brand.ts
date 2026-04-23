/**
 * HAMZURY BRAND TOKENS — 2026 rebrand
 *
 * Apple-minimal aesthetic. "Built to Last".
 *
 * USE CASE SEPARATION:
 * - `PUBLIC` tokens → homepage, division landing pages, marketing pages
 * - `STAFF` tokens → internal portals (CEO, CSO, BizDev). Kept in the legacy
 *   green/gold so the two surfaces are visually distinct and staff know
 *   instantly when they're in the admin side vs the public site.
 */

/* ═══════════════════════════════════════════════════════════════════════
 * PUBLIC — homepage, /bizdoc, /scalar, /medialy, /hub, /about, /contact
 * ═══════════════════════════════════════════════════════════════════════ */
export const PUBLIC = {
  /** Deep navy — primary accent for CTAs, headers, dominant blocks */
  navy:    "#1E3A8A",
  /** Warm brown — secondary accent. Pair with navy sparingly. */
  brown:   "#7C2D12",
  /** Soft cream — default page background */
  cream:   "#F5F5F4",
  /** Pure white — cards, modals */
  white:   "#FFFFFF",
  /** Near-black — body text */
  dark:    "#1A1A1A",
  /** Muted text — captions, meta */
  muted:   "#666666",
  /** Hairline borders */
  hairline:"#E7E5E4",

  /** Divider colors — low-contrast separators */
  divider: "#00000010",

  /** Division accents — very subtle, used only for pills/tags on landing pages */
  division: {
    bizdoc:  "#1E3A8A", // navy
    scalar:  "#7C2D12", // brown
    medialy: "#B45309", // warm amber (complements brown)
    hub:     "#1F2937", // slate
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * STAFF — internal portals (CEO, CSO, BizDev). Unchanged from legacy.
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
 * SHARED — typography, spacing, shadows, motion
 * ═══════════════════════════════════════════════════════════════════════ */
export const TYPE = {
  /** Display — hero headlines. Max 2 fonts per page: this is #1. */
  display: `-apple-system, "SF Pro Display", "Helvetica Neue", Inter, system-ui, sans-serif`,
  /** Body — everything else. Font #2 (or same as display for true minimalism). */
  body:    `-apple-system, "SF Pro Text", "Helvetica Neue", Inter, system-ui, sans-serif`,
} as const;

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  pill: 999,
} as const;

export const SHADOW = {
  card:    "0 1px 3px rgba(0,0,0,0.04)",
  raised:  "0 4px 20px rgba(0,0,0,0.06)",
  modal:   "0 20px 60px rgba(0,0,0,0.15)",
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * BRAND CONSTANTS — division metadata for nav + footer + landing pages
 * ═══════════════════════════════════════════════════════════════════════ */
export const DIVISIONS = [
  {
    key:      "bizdoc",
    name:     "Bizdoc",
    category: "Tax & Compliance",
    tagline:  "We handle FIRS so you can handle business.",
    path:     "/bizdoc",
    email:    "bizdoc@hamzury.com",
    whatsapp: "08067193560",
  },
  {
    key:      "scalar",
    name:     "Scalar",
    category: "Web & Automation",
    tagline:  "Websites that work. Systems that scale.",
    path:     "/scalar",
    email:    "scalar@hamzury.com",
    whatsapp: "09130700056",
  },
  {
    key:      "medialy",
    name:     "Medialy",
    category: "Social Media",
    tagline:  "Social media that actually brings clients.",
    path:     "/medialy",
    email:    "medialy@hamzury.com",
    whatsapp: "09130700056",
  },
  {
    key:      "hub",
    name:     "HUB",
    category: "Tech Training",
    tagline:  "Tech skills that get you paid.",
    path:     "/hub",
    email:    "hub@hamzury.com",
    whatsapp: "09130700056",
  },
] as const;

export const BRAND_TAGLINE = "Built to Last.";

export const CONTACT = {
  general:       "muhammad@hamzury.com",
  founderPhone:  "09130700056",
  address:       "Hamzury Business Institute, Ajami Plaza, Garki, Abuja",
  hours: {
    weekdays: "Mon – Fri · 9:00 AM – 6:00 PM",
    saturday: "Sat · 10:00 AM – 2:00 PM",
    timezone: "WAT",
  },
} as const;
