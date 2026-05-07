/**
 * HAMZURY HUB — operational schedule (single source of truth).
 * 2026-05-07 — quarterly cohort plan covering Sale → Orientation →
 * Cohorts running → Graduation, plus the always-on intake (internships +
 * online academy) which is NOT bound by quarters.
 *
 * Constraints captured (founder, 2026-05-07):
 *  · 3 physical halls available.
 *  · Mon–Wed 8am–2pm  → ADVANCED programmes (academic / business cohorts)
 *  · Thu–Sat 8am–2pm  → BASICS (kids) + HARDWARE/ROBOTICS (MetFix)
 *  · Each programme runs 1 cohort per quarter (one start, one graduation).
 *  · Whole quarter wraps inside its quarter — physical only.
 *  · Internships (HUB placement + SIWES) + Online Academy = always-on,
 *    NEVER quarter-gated.
 *
 * Edit dates here → /hub Quarterly Schedule + admin Schedule view both
 * pick them up. No drift.
 */
export type HubCohortBlock = {
  /** Stable key — matches OFFER_CATEGORIES item.name slug */
  key: string;
  /** Display name as shown on /hub "What we offer" */
  name: string;
  /** Which of the 3 halls this cohort runs in */
  hall: "Hall 1" | "Hall 2" | "Hall 3";
  /** Day pattern */
  pattern: "Mon–Wed 8am–2pm" | "Thu–Sat 8am–2pm";
  /** ISO YYYY-MM-DD */
  startDate: string;
  endDate: string;
  weeks: number;
  priceNaira: number;
  /** "Advanced adults" or "Basics & kids" or "Hardware & robotics" */
  track: "advanced" | "basics" | "hardware";
};

export type HubQuarterPlan = {
  /** "2026-Q2-launch" */
  id: string;
  /** "Cohort A — Q2 2026 Launch" */
  label: string;
  /** Optional subtitle / context for this quarter */
  subtitle?: string;
  /** Sale window — when forms are open + adverts run */
  saleStart: string;
  saleEnd: string;
  /** Orientation day — Mon, all cohorts that quarter kick off */
  orientation: string;
  /** Group graduation day — Fri, certificate ceremony, end of quarter */
  graduation: string;
  /** Per-programme cohort blocks scheduled this quarter */
  cohorts: HubCohortBlock[];
};

/**
 * 2026 LAUNCH SCHEDULE.
 * Cohort A is the "set up + launch" cohort starting from advert push today.
 * Cohort B follows after a 2-week break for grading + photography + planning.
 * Cohort C is a short year-end run for short programmes only.
 * 2027 transitions to a clean 4-quarter rhythm (defined further below).
 */
export const HUB_LAUNCH_SCHEDULE: HubQuarterPlan[] = [
  {
    id: "2026-A",
    label: "Cohort A — Q2 2026 Launch",
    subtitle: "First HUB cycle. Advert push starts today; orientation in 2.5 weeks.",
    saleStart:   "2026-05-07",
    saleEnd:     "2026-05-22",
    orientation: "2026-05-25",
    graduation:  "2026-08-14",
    cohorts: [
      // Mon–Wed Advanced — 3 halls, 6 programmes packed across 12 weeks
      { key: "code-craft",         name: "Code Craft Bootcamp",       hall: "Hall 1", pattern: "Mon–Wed 8am–2pm", startDate: "2026-05-25", endDate: "2026-07-17", weeks: 8, priceNaira: 300_000, track: "advanced" },
      { key: "business-builders",  name: "Business Builders Academy", hall: "Hall 1", pattern: "Mon–Wed 8am–2pm", startDate: "2026-07-20", endDate: "2026-08-07", weeks: 3, priceNaira: 150_000, track: "advanced" },
      { key: "compliance-mastery", name: "Compliance Mastery",        hall: "Hall 2", pattern: "Mon–Wed 8am–2pm", startDate: "2026-05-25", endDate: "2026-07-03", weeks: 6, priceNaira: 120_000, track: "advanced" },
      { key: "digital-dominance",  name: "Digital Dominance",         hall: "Hall 2", pattern: "Mon–Wed 8am–2pm", startDate: "2026-07-06", endDate: "2026-08-01", weeks: 4, priceNaira: 80_000,  track: "advanced" },
      { key: "data-analytics",     name: "Data Analytics",            hall: "Hall 3", pattern: "Mon–Wed 8am–2pm", startDate: "2026-05-25", endDate: "2026-07-03", weeks: 6, priceNaira: 130_000, track: "advanced" },
      // Cybersecurity launches Cohort B once curriculum + instructor confirmed.
      // For now Hall 3 second-half is open for a repeat run of Data Analytics.

      // Thu–Sat Basics & Hardware — 3 halls, parallel kids + MetFix
      { key: "metfix",             name: "MetFix Hardware & Robotics", hall: "Hall 1", pattern: "Thu–Sat 8am–2pm", startDate: "2026-05-28", endDate: "2026-07-18", weeks: 8, priceNaira: 180_000, track: "hardware" },
      { key: "kids-tech",          name: "Beginner Tech Skills — Kids", hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-05-28", endDate: "2026-06-06", weeks: 2, priceNaira: 25_000,  track: "basics" },
      { key: "kids-robotics",      name: "Kids Robotics & Build Club",  hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-06-11", endDate: "2026-07-04", weeks: 4, priceNaira: 60_000,  track: "basics" },
      { key: "kids-coding",        name: "Kids Coding with AI",         hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-07-09", endDate: "2026-07-25", weeks: 3, priceNaira: 45_000,  track: "basics" },
      // Hall 3 Thu–Sat: parallel kids cohorts (same lineup, doubles capacity)
      // or kept open for community workshops / internship onboarding.
    ],
  },
  {
    id: "2026-B",
    label: "Cohort B — Q3 2026",
    subtitle: "Standard rhythm begins. Sale window opens after Cohort A graduation.",
    saleStart:   "2026-08-25",
    saleEnd:     "2026-09-04",
    orientation: "2026-09-07",
    graduation:  "2026-11-27",
    cohorts: [
      { key: "code-craft",         name: "Code Craft Bootcamp",       hall: "Hall 1", pattern: "Mon–Wed 8am–2pm", startDate: "2026-09-07", endDate: "2026-10-30", weeks: 8, priceNaira: 300_000, track: "advanced" },
      { key: "business-builders",  name: "Business Builders Academy", hall: "Hall 1", pattern: "Mon–Wed 8am–2pm", startDate: "2026-11-02", endDate: "2026-11-20", weeks: 3, priceNaira: 150_000, track: "advanced" },
      { key: "compliance-mastery", name: "Compliance Mastery",        hall: "Hall 2", pattern: "Mon–Wed 8am–2pm", startDate: "2026-09-07", endDate: "2026-10-16", weeks: 6, priceNaira: 120_000, track: "advanced" },
      { key: "digital-dominance",  name: "Digital Dominance",         hall: "Hall 2", pattern: "Mon–Wed 8am–2pm", startDate: "2026-10-19", endDate: "2026-11-13", weeks: 4, priceNaira: 80_000,  track: "advanced" },
      { key: "data-analytics",     name: "Data Analytics",            hall: "Hall 3", pattern: "Mon–Wed 8am–2pm", startDate: "2026-09-07", endDate: "2026-10-16", weeks: 6, priceNaira: 130_000, track: "advanced" },
      { key: "cybersecurity",      name: "Cybersecurity & Networking", hall: "Hall 3", pattern: "Mon–Wed 8am–2pm", startDate: "2026-10-19", endDate: "2026-11-27", weeks: 6, priceNaira: 130_000, track: "advanced" },
      { key: "metfix",             name: "MetFix Hardware & Robotics", hall: "Hall 1", pattern: "Thu–Sat 8am–2pm", startDate: "2026-09-10", endDate: "2026-10-31", weeks: 8, priceNaira: 180_000, track: "hardware" },
      { key: "kids-tech",          name: "Beginner Tech Skills — Kids", hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-09-10", endDate: "2026-09-19", weeks: 2, priceNaira: 25_000,  track: "basics" },
      { key: "kids-robotics",      name: "Kids Robotics & Build Club",  hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-09-24", endDate: "2026-10-17", weeks: 4, priceNaira: 60_000,  track: "basics" },
      { key: "kids-coding",        name: "Kids Coding with AI",         hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-10-22", endDate: "2026-11-07", weeks: 3, priceNaira: 45_000,  track: "basics" },
    ],
  },
  {
    id: "2026-C",
    label: "Cohort C — Q4 2026 (Short Run)",
    subtitle: "Year-end short cohort — only programmes that fit before Dec 18.",
    saleStart:   "2026-11-30",
    saleEnd:     "2026-12-04",
    orientation: "2026-12-07",
    graduation:  "2026-12-18",
    cohorts: [
      { key: "business-builders",  name: "Business Builders Academy",   hall: "Hall 1", pattern: "Mon–Wed 8am–2pm", startDate: "2026-12-07", endDate: "2026-12-23", weeks: 3, priceNaira: 150_000, track: "advanced" },
      { key: "kids-tech",          name: "Beginner Tech Skills — Kids", hall: "Hall 2", pattern: "Thu–Sat 8am–2pm", startDate: "2026-12-10", endDate: "2026-12-19", weeks: 2, priceNaira: 25_000,  track: "basics" },
    ],
  },

  /* 2027 quarterly rhythm — 4 standard cohorts. Edit dates as needed. */
  { id: "2027-Q1", label: "Q1 2027",  subtitle: "Standard 12-week rhythm.", saleStart: "2027-01-04", saleEnd: "2027-01-15", orientation: "2027-01-18", graduation: "2027-04-16", cohorts: [] },
  { id: "2027-Q2", label: "Q2 2027",                                    saleStart: "2027-04-26", saleEnd: "2027-05-07", orientation: "2027-05-10", graduation: "2027-08-06", cohorts: [] },
  { id: "2027-Q3", label: "Q3 2027",                                    saleStart: "2027-08-16", saleEnd: "2027-08-27", orientation: "2027-08-30", graduation: "2027-11-26", cohorts: [] },
  { id: "2027-Q4", label: "Q4 2027",                                    saleStart: "2027-11-29", saleEnd: "2027-12-10", orientation: "2027-12-13", graduation: "2028-01-15", cohorts: [] },
];

/**
 * Always-on programmes — never quarter-gated. Apply / enrol any day.
 * These mirror the Internships + Online Academy categories in
 * client/src/lib/offer-categories.ts.
 */
export const HUB_ALWAYS_ON = {
  internships: [
    { name: "HUB Internship (placement-track)", duration: "1–12 months", priceNaira: 50_000, note: "Apply anytime · monthly intake first Monday" },
    { name: "Higher-Institution Internship (SIWES / IT)", duration: "1–12 months", priceNaira: 45_000, note: "Apply anytime · school's own start date applies" },
  ],
  online: [
    { name: "AI for Operations & Admin",       duration: "2 weeks self-paced", priceNaira: 20_000 },
    { name: "AI for Sales & Customer Growth",  duration: "3 weeks self-paced", priceNaira: 25_000 },
    { name: "AI for Finance & Bookkeeping",    duration: "3 weeks self-paced", priceNaira: 25_000 },
    { name: "AI for Marketing & Content",      duration: "4 weeks self-paced", priceNaira: 35_000 },
    { name: "AI for HR & People Ops",          duration: "3 weeks self-paced", priceNaira: 25_000 },
    { name: "AI for Product & Strategy",       duration: "4 weeks self-paced", priceNaira: 35_000 },
    { name: "AI Tools Mastery (foundation)",   duration: "2 weeks self-paced", priceNaira: 15_000 },
    { name: "Anthropic Claude — Solve & Automate",  duration: "2 weeks self-paced", priceNaira: 18_000 },
    { name: "Google Gemini — Solve & Automate",     duration: "2 weeks self-paced", priceNaira: 18_000 },
    { name: "OpenAI ChatGPT — Solve & Automate",    duration: "2 weeks self-paced", priceNaira: 18_000 },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
 * Helpers — what's the current phase right now?
 * ─────────────────────────────────────────────────────────────────────── */

export type CurrentPhase =
  | { kind: "sale";        quarter: HubQuarterPlan; daysToOrientation: number }
  | { kind: "running";     quarter: HubQuarterPlan; daysToGraduation: number }
  | { kind: "graduation";  quarter: HubQuarterPlan }
  | { kind: "between";     nextQuarter: HubQuarterPlan; daysToSale: number }
  | { kind: "ended" };

export function getCurrentPhase(today: Date = new Date()): CurrentPhase {
  const todayISO = today.toISOString().slice(0, 10);
  const cmp = (a: string, b: string) => a.localeCompare(b);

  for (const q of HUB_LAUNCH_SCHEDULE) {
    if (cmp(todayISO, q.saleStart) >= 0 && cmp(todayISO, q.saleEnd) <= 0) {
      return { kind: "sale", quarter: q, daysToOrientation: daysBetween(todayISO, q.orientation) };
    }
    if (cmp(todayISO, q.orientation) >= 0 && cmp(todayISO, q.graduation) < 0) {
      return { kind: "running", quarter: q, daysToGraduation: daysBetween(todayISO, q.graduation) };
    }
    if (todayISO === q.graduation) {
      return { kind: "graduation", quarter: q };
    }
  }
  // Find the next sale window
  const next = HUB_LAUNCH_SCHEDULE.find(q => cmp(todayISO, q.saleStart) < 0);
  if (next) return { kind: "between", nextQuarter: next, daysToSale: daysBetween(todayISO, next.saleStart) };
  return { kind: "ended" };
}

function daysBetween(fromISO: string, toISO: string): number {
  const ms = new Date(toISO).getTime() - new Date(fromISO).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

/** Pretty-format an ISO date as e.g. "Mon May 25, 2026" */
export function fmtScheduleDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
