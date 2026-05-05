/**
 * HAMZURY Brand Design Tokens v2
 * Milk is the atmosphere. Dark is the structure. Gold is the prestige.
 * Each department gets one core family color for identity.
 */

export const BRAND = {
  // Shared atmosphere
  bg: "#FFFAF6",         // Milk base — main page background
  card: "#FFFFFF",       // Card/surface background
  hover: "#FDF8F4",      // Subtle hover state
  text: "#1A1A1A",       // Primary text (dark structure)
  muted: "#666666",      // Secondary text
  gold: "#B48C4C",       // Premium accent (3-5% max)
  goldHover: "#C9A961",  // Gold hover state
  white: "#FFFFFF",
  border: "#E5E5E5",     // Subtle dividers

  // Department-specific primary colors
  federal: "#1B4D3E",    // Deep green — HAMZURY master brand
  bizdoc: "#1B4D3E",     // Leaf green — BizDoc (NO CHANGE)
  systemise: "#2563EB",  // Authority blue — Systemise (softer)
  systemiseSoft: "#8BC3F6",
  skills: "#1E3A5F",     // Deep navy — Skills
  skillsSoft: "#E8F1F7",
  founder: "#2C1A0E",    // Chocolate — Founder
  ridi: "#B48C4C",       // Gold — RIDI
  metfix: "#1A1A1A",     // Dark — MetFix
} as const;

export type DepartmentKey = "federal" | "bizdoc" | "systemise" | "skills" | "founder" | "ridi" | "metfix";

export const DEPT_COLORS: Record<DepartmentKey, string> = {
  federal: BRAND.federal,
  bizdoc: BRAND.bizdoc,
  systemise: BRAND.systemise,
  skills: BRAND.skills,
  founder: BRAND.founder,
  ridi: BRAND.ridi,
  metfix: BRAND.metfix,
};

export const DEPT_LABELS: Record<DepartmentKey, string> = {
  federal: "HAMZURY",
  bizdoc: "BizDoc Consult",
  systemise: "Systemise",
  skills: "HAMZURY Skills",
  ridi: "RIDI",
  founder: "Founder",
  metfix: "MetFix",
};
