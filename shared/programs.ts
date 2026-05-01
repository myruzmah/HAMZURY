/**
 * HAMZURY HUB — Programs catalog (single source of truth).
 * 2026-04-30. Imported by HubPage.tsx (public) and HubAdminPortal.tsx (staff)
 * so any course/program edit lands in both surfaces with no drift.
 *
 * Source-of-truth: original files/PHASE7_HUB/PROGRAMS/8_Programs_Complete_Syllabus.txt
 * + original files/PHASE7_HUB/OPERATIONS_GUIDE/HUB_Complete_Operations_Guide.txt
 *
 * RULE: this is THE list. Do not duplicate it elsewhere. Renaming a
 * program here renames it everywhere. Deleting a program here removes
 * it from public + admin in one stroke.
 */

export type HubProgramKey =
  | "business-builders"
  | "digital-dominance"
  | "code-craft"
  | "compliance-mastery"
  | "money-mastery"
  | "basic-kids"
  | "metfix"
  | "online-academy";

export type HubSchedule = "mon-wed-8-2" | "thu-sat-8-2" | "self-paced" | "metfix-mixed";

export type HubProgram = {
  key: HubProgramKey;
  name: string;
  weeks: number; // 0 = self-paced / flexible
  /** Display price in NGN. For programs with split pricing use priceNote instead. */
  price: number;
  /** Optional human-readable price spread (e.g. MetFix has physical + online). */
  priceNote?: string;
  schedule: HubSchedule;
  scheduleLabel: string; // human-readable
  certificate: string; // external certificate name
  ageRange?: string;
  /** What the student walks away with — mirrors landing-page bullets. */
  whatYouGet: string[];
  /** One-line pitch used by CSO + chat + share links. */
  pitch: string;
  /** Whether this program is currently open for enrollment. */
  status: "active" | "upcoming" | "paused";
  /** Anchor color for badges. Hub Orange overall but kids program uses softer warm. */
  accent: string;
};

export const HUB_PROGRAMS: HubProgram[] = [
  {
    key: "business-builders",
    name: "Business Builders Academy",
    weeks: 3,
    price: 150_000,
    schedule: "mon-wed-8-2",
    scheduleLabel: "Mon–Wed · 8:00am–2:00pm",
    certificate: "Google Business Certificate",
    ageRange: "Adult",
    whatYouGet: [
      "Business plan template + market analysis",
      "Pitch deck with practice rounds",
      "Founder mentorship (Idris + Dajot)",
      "Google Business Certificate",
      "Hamzury HUB Certificate of completion",
    ],
    pitch: "Three weeks. Build a real business plan, pitch it, leave with a working playbook.",
    status: "active",
    accent: "#F59E0B",
  },
  {
    key: "digital-dominance",
    name: "Digital Dominance",
    weeks: 4,
    price: 80_000,
    schedule: "mon-wed-8-2",
    scheduleLabel: "Mon–Wed · 8:00am–2:00pm",
    certificate: "Google Digital Marketing Certificate",
    ageRange: "Adult",
    whatYouGet: [
      "Social media strategy (IG, TikTok, LinkedIn)",
      "Content creation with AI tools",
      "Paid ads fundamentals",
      "Google Digital Marketing Certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Four weeks. Run social media that actually brings clients.",
    status: "active",
    accent: "#F59E0B",
  },
  {
    key: "code-craft",
    name: "Code Craft Bootcamp",
    weeks: 12,
    price: 300_000,
    schedule: "mon-wed-8-2",
    scheduleLabel: "Mon–Wed · 8:00am–2:00pm",
    certificate: "Coursera Programming Certificate",
    ageRange: "16+",
    whatYouGet: [
      "Python + JavaScript fundamentals",
      "Web development (HTML, CSS, React)",
      "Real client project (mentor-supervised)",
      "Coursera Programming Certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Twelve weeks. Code your way into a real job.",
    status: "active",
    accent: "#F59E0B",
  },
  {
    key: "compliance-mastery",
    name: "Compliance Mastery",
    weeks: 6,
    price: 120_000,
    schedule: "mon-wed-8-2",
    scheduleLabel: "Mon–Wed · 8:00am–2:00pm",
    certificate: "Professional Compliance Certificate",
    ageRange: "Adult",
    whatYouGet: [
      "Tax compliance (VAT, PAYE, CIT)",
      "CAC + sector licences walkthrough",
      "Filing calendar setup",
      "Professional Compliance Certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Six weeks. Learn compliance from the people who do it daily.",
    status: "active",
    accent: "#F59E0B",
  },
  {
    key: "money-mastery",
    name: "Money Mastery",
    weeks: 4,
    price: 90_000,
    schedule: "mon-wed-8-2",
    scheduleLabel: "Mon–Wed · 8:00am–2:00pm",
    certificate: "Financial Literacy Certificate",
    ageRange: "Adult",
    whatYouGet: [
      "Personal finance fundamentals",
      "Investing basics (Naira + USD)",
      "Wealth building roadmap",
      "Financial Literacy Certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Four weeks. Money stops being scary.",
    status: "active",
    accent: "#F59E0B",
  },
  {
    key: "basic-kids",
    name: "Basic Computer Skills — Kids",
    weeks: 2,
    price: 25_000,
    schedule: "thu-sat-8-2",
    scheduleLabel: "Thu–Sat · 8:00am–2:00pm",
    certificate: "Computer Literacy Certificate",
    ageRange: "8–15",
    whatYouGet: [
      "Computer fundamentals (Windows, macOS)",
      "Typing, MS Office, Internet safely",
      "Creative project (presentation or simple website)",
      "Computer Literacy Certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Two weeks. Kids leave knowing how to actually use a computer.",
    status: "active",
    accent: "#FB923C",
  },
  {
    key: "metfix",
    name: "MetFix Hardware & Robotics",
    weeks: 8,
    price: 180_000,
    priceNote: "₦180,000 physical · ₦80,000 online",
    schedule: "metfix-mixed",
    scheduleLabel: "Mon–Wed (physical) or self-paced (online)",
    certificate: "Hardware Engineering Certificate",
    ageRange: "16+",
    whatYouGet: [
      "Hardware repair (laptop, screen, battery)",
      "Robotics fundamentals (Arduino, Raspberry Pi)",
      "Hands-on with MetFix lab equipment",
      "Hardware Engineering Certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Eight weeks. Build, fix, and program real machines.",
    status: "active",
    accent: "#F59E0B",
  },
  {
    key: "online-academy",
    name: "Online Academy (self-paced)",
    weeks: 0,
    price: 25_000,
    priceNote: "₦10,000 – ₦50,000 per course",
    schedule: "self-paced",
    scheduleLabel: "Self-paced · LMS only",
    certificate: "Course-specific certificates",
    ageRange: "Any",
    whatYouGet: [
      "Self-paced micro-courses",
      "AI-guided learning path",
      "Mentor email support",
      "Course-specific certificate",
      "Hamzury HUB Certificate",
    ],
    pitch: "Learn at your own pace. Any topic, any time.",
    status: "active",
    accent: "#F59E0B",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
 * 4-team competition (Phase 7 Team Competition Rules)
 * ───────────────────────────────────────────────────────────────────────── */
export const HUB_TEAMS = [
  { key: "ai",       name: "AI Team",       focus: "Artificial intelligence projects", color: "#7C3AED" },
  { key: "cyber",    name: "Cyber Team",    focus: "Cybersecurity challenges",         color: "#DC2626" },
  { key: "quantum",  name: "Quantum Team",  focus: "Quantum computing concepts",       color: "#2563EB" },
  { key: "robotics", name: "Robotics Team", focus: "Hardware & robotics",              color: "#059669" },
] as const;

export const HUB_TEAM_POINTS = {
  first: 100,
  second: 75,
  third: 50,
  participation: 25,
} as const;

/* ─────────────────────────────────────────────────────────────────────────
 * Legacy program-name compatibility (so historical applications still
 * resolve to the right canonical program).
 * ───────────────────────────────────────────────────────────────────────── */
export const HUB_LEGACY_NAME_MAP: Record<string, HubProgramKey> = {
  "Basic Computer Skills":           "basic-kids",
  "Basic Computer Skills - Kids":    "basic-kids",
  "Kids Coding Programme":           "basic-kids",
  "Website Development":             "code-craft",
  "Data Analysis":                   "online-academy",
  "AI & Business Automation":        "digital-dominance",
  "Cybersecurity Fundamentals":      "online-academy",
  "Robotics & Creative Tech":        "metfix",
  "AI Lead Generation":              "digital-dominance",
  "Faceless Content Creation":       "digital-dominance",
  "Executive Strategy Circle":       "business-builders",
  "Staff Digital Skills Training":   "online-academy",
  "IT Internship":                   "code-craft",
  "Business Operations Internship":  "business-builders",
  "Clarity Session (Free)":          "online-academy",
  "Tech Skills Training":            "code-craft",
  "AI for Business":                 "digital-dominance",
  "Entrepreneurship Program":        "business-builders",
  "Team Training Workshop":          "online-academy",
  "Certification Programs":          "online-academy",
  "Skills Management":               "online-academy",
};

export function resolveHubProgram(raw: string | null | undefined): HubProgram | null {
  if (!raw) return null;
  const exact = HUB_PROGRAMS.find(p => p.name === raw);
  if (exact) return exact;
  const legacyKey = HUB_LEGACY_NAME_MAP[raw];
  if (legacyKey) return HUB_PROGRAMS.find(p => p.key === legacyKey) || null;
  return null;
}

export function formatProgramPrice(p: HubProgram): string {
  if (p.priceNote) return p.priceNote;
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(p.price);
}
