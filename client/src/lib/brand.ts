/**
 * HAMZURY Brand Design Tokens
 * Each department has its own Primary Accent Color.
 * All other values are shared across the institution.
 */

export const BRAND = {
  // Shared across all departments
  bg: "#FAFAF8",         // Milk white
  text: "#1D1D1F",       // Dark text
  gold: "#C9A97E",       // HAMZURY Gold (5% accent max)
  white: "#FFFFFF",

  // Department-specific primary colors
  federal: "#86868B",    // Apple grey — Home, CSO, Finance, HR, Media, general
  bizdoc: "#1B4D3E",     // Leaf green — BizDoc
  systemise: "#0A1F1C",  // Dark teal — Systemise
  skills: "#1B2A4A",     // Dark navy blue — Skills
  founder: "#2C1A0E",    // Chocolate — Founder
  ridi: "#C9A97E",       // Gold — RIDI
  metfix: "#1D1D1F",     // Dark — MetFix
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
};
