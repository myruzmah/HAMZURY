/**
 * HAMZURY HUB ADMIN PORTAL — Idris + Isa/Musa (interns)
 *
 * Built from PHASE7_HUB/OPERATIONS_GUIDE spec. Tabs prioritised by daily use.
 * localStorage is used for Team Competition scores + Social Media
 * verification (no backend tables for these yet).
 */
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, UserCheck, Trophy, Share2, Award, CalendarDays,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle,
  Menu, X, Shield, Send, GraduationCap, Plus, Trash2, Eye,
  BadgeCheck, BookOpen, Briefcase, Wrench,
} from "lucide-react";
import { toast } from "sonner";

/* Palette — HUB uses aged navy as accent (Brand Bible) */
const BG = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";
const NAVY = "#1E3A5F";       // HUB accent
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";
const GREEN_OK = "#22C55E";

type Section =
  | "dashboard" | "enrollments" | "cohorts" | "attendance"
  | "competition" | "social" | "calendar" | "reports"
  | "certifications" | "alumni" | "lmsProgress" | "internDuties" | "metfix";

function useIsMobile(breakpoint = 900) {
  const [mobile, setMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return mobile;
}

function fmtDate(d: string | null | undefined | Date): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return String(d); }
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: WHITE, borderRadius: 16, padding: 20,
      border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      ...style,
    }}>{children}</div>
  );
}
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, letterSpacing: -0.2 }}>{children}</h2>
      {sub && <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}
function EmptyState({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <Icon size={28} style={{ color: GOLD, opacity: 0.4, marginBottom: 12 }} />
      <p style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{title}</p>
      {hint && <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}
function StatusPill({ label, tone }: { label: string; tone: "green" | "gold" | "red" | "blue" | "muted" | "orange" | "purple" }) {
  const map = {
    green:  { bg: `${GREEN_OK}15`, fg: GREEN_OK },
    gold:   { bg: `${GOLD}20`,     fg: GOLD },
    red:    { bg: `${RED}15`,      fg: RED },
    blue:   { bg: `${BLUE}15`,     fg: BLUE },
    muted:  { bg: "#9CA3AF25",     fg: MUTED },
    orange: { bg: `${ORANGE}15`,   fg: ORANGE },
    purple: { bg: `${PURPLE}15`,   fg: PURPLE },
  }[tone];
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
      backgroundColor: map.bg, color: map.fg, textTransform: "uppercase", letterSpacing: "0.04em",
    }}>{label}</span>
  );
}
function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  const isString = typeof value === "string";
  return (
    <div style={{
      backgroundColor: WHITE, borderRadius: 12, padding: "14px 14px",
      border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      minWidth: 0, overflow: "hidden",
    }}>
      <p style={{
        fontSize: isString ? 15 : 20, fontWeight: 700, color, lineHeight: 1.15,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{value}</p>
      <p style={{ fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}
function inputBox(): React.CSSProperties {
  return {
    padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}15`,
    fontSize: 13, color: DARK, backgroundColor: WHITE, outline: "none",
    fontFamily: "inherit",
  };
}

/**
 * HUB 8 programmes — data-only from PHASE7_HUB/PROGRAMS/8_Programs_Complete_Syllabus.txt
 * Schedule pulled from HUB_Calendar.ics (Mon-Wed main, Thu-Sat kids).
 */
const PROGRAMMES = [
  { key: "business-builders",   name: "Business Builders Academy",    weeks: 3,  price: 150000, schedule: "Mon–Wed · 8am–2pm", cert: "Google Business Certificate" },
  { key: "digital-dominance",   name: "Digital Dominance",            weeks: 4,  price: 80000,  schedule: "Mon–Wed · 8am–2pm", cert: "Google Digital Marketing" },
  { key: "code-craft",          name: "Code Craft Bootcamp",          weeks: 12, price: 300000, schedule: "Mon–Wed · 8am–2pm", cert: "Coursera Programming Certificate" },
  { key: "compliance-mastery",  name: "Compliance Mastery",           weeks: 6,  price: 120000, schedule: "Mon–Wed · 8am–2pm", cert: "Professional Compliance Certificate" },
  { key: "money-mastery",       name: "Money Mastery",                weeks: 4,  price: 90000,  schedule: "Mon–Wed · 8am–2pm", cert: "Financial Literacy Certificate" },
  { key: "basic-kids",          name: "Basic Computer Skills — Kids", weeks: 2,  price: 25000,  schedule: "Thu–Sat · 8am–2pm", cert: "Computer Literacy Certificate" },
  { key: "metfix",              name: "MetFix Hardware & Robotics",   weeks: 8,  price: 180000, schedule: "Mon–Wed · 8am–2pm", cert: "Hardware Engineering Certificate" },
  { key: "online-academy",      name: "Online Academy (self-paced)",  weeks: 0,  price: 25000,  schedule: "Self-paced · LMS only", cert: "Course completion certificates" },
];

/**
 * Maps old DB programme labels → new programme names so legacy applications
 * can still be counted under the right cohort. Unmatched legacy items fall
 * into an "Unmatched Legacy" group shown separately.
 */
const LEGACY_MAP: Record<string, string> = {
  "Basic Computer Skills":           "Basic Computer Skills — Kids",
  "Basic Computer Skills - Kids":    "Basic Computer Skills — Kids",
  "Kids Coding Programme":           "Basic Computer Skills — Kids",
  "Website Development":             "Code Craft Bootcamp",
  "Data Analysis":                   "Online Academy (self-paced)",
  "AI & Business Automation":        "Digital Dominance",
  "Cybersecurity Fundamentals":      "Online Academy (self-paced)",
  "Robotics & Creative Tech":        "MetFix Hardware & Robotics",
  "AI Lead Generation":              "Digital Dominance",
  "Faceless Content Creation":       "Digital Dominance",
  "Executive Strategy Circle":       "Business Builders Academy",
  "Staff Digital Skills Training":   "Online Academy (self-paced)",
  "IT Internship":                   "Code Craft Bootcamp",
  "Business Operations Internship":  "Business Builders Academy",
  "Clarity Session (Free)":          "Online Academy (self-paced)",
};

function resolveProgramme(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const exact = PROGRAMMES.find(p => p.name === raw);
  if (exact) return exact.name;
  return LEGACY_MAP[raw] ?? null;
}

/* ─── Teams from PHASE7_HUB/TEAM_COMPETITION/Team_Competition_Rules.txt ─── */
const TEAMS = [
  { key: "ai",       name: "AI Team",       color: PURPLE },
  { key: "cyber",    name: "Cyber Team",    color: BLUE },
  { key: "quantum",  name: "Quantum Team",  color: GOLD },
  { key: "robotics", name: "Robotics Team", color: ORANGE },
] as const;

/* ─── Judging criteria from Team_Competition_Rules.txt ─── */
const JUDGING_CRITERIA = [
  { label: "Innovation",        weight: 30 },
  { label: "Technical skill",   weight: 30 },
  { label: "Presentation",      weight: 20 },
  { label: "Team collaboration", weight: 20 },
];

/* ─── Monthly cycle from Team_Competition_Rules.txt ─── */
const COMP_CYCLE = [
  { week: "Week 1", label: "Challenge announced (first Monday)" },
  { week: "Weeks 2–3", label: "Teams execute + build" },
  { week: "Week 4", label: "Presentations + judging" },
];

/* ─── Social media posting rules from Student_Content_Posting_Guide.txt ─── */
const SOCIAL_RULES = {
  minPerWeek: 1,
  recommended: "2–3 posts per week",
  platforms: ["Instagram", "LinkedIn", "TikTok"],
  tag: "@HamzuryHUB",
  hashtags: ["#HamzuryHUB", "#TechEducationNG"],
  weeklyThemes: [
    "Week 1 — Introduction & goals",
    "Week 2 — First project",
    "Week 3 — AI tools learned",
    "Week 4 — Team collaboration",
  ],
  consequence: "100% compliance required to earn HUB certificate",
};

/* ─── Certification requirements from HUB_Complete_Operations_Guide.txt ─── */
const CERT_REQUIREMENTS = [
  "All LMS modules completed",
  "All assignments submitted + graded",
  "Programme-specific international certification (Google / Coursera)",
  "100% weekly social media posting verified",
  "Team competition participation",
  "Final project approved",
  "80%+ attendance",
];

/* ─── HUB success targets from Operations Guide ─── */
const SUCCESS_TARGETS = [
  { label: "Enrollments / month",          target: 50  },
  { label: "Programme completion rate",    target: 85  },
  { label: "Certification rate",           target: 90  },
  { label: "Student satisfaction",         target: 95  },
  { label: "Social-media compliance",      target: 100 },
  { label: "Team-competition participation", target: 100 },
  { label: "Alumni employed in 6 months",  target: 70  },
];

/* ═══════════════════════════════════════════════════════════════════════ */
export default function HubAdminPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("dashboard");
  const isMobile = useIsMobile(900);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => { if (!isMobile) setMobileNavOpen(false); }, [isMobile]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const NAV: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "dashboard",      icon: LayoutDashboard, label: "Overview" },
    { key: "enrollments",    icon: Users,           label: "Enrollments" },
    { key: "cohorts",        icon: GraduationCap,   label: "Active Cohorts" },
    { key: "attendance",     icon: UserCheck,       label: "Attendance" },
    { key: "competition",    icon: Trophy,          label: "Team Competition" },
    { key: "social",         icon: Share2,          label: "Social Verification" },
    { key: "certifications", icon: BadgeCheck,      label: "Certification" },
    { key: "alumni",         icon: GraduationCap,   label: "Alumni" },
    { key: "lmsProgress",    icon: BookOpen,        label: "LMS Progress" },
    { key: "internDuties",   icon: Briefcase,       label: "Intern Coord" },
    { key: "metfix",         icon: Wrench,          label: "MetFix" },
    { key: "calendar",       icon: CalendarDays,    label: "Operations Calendar" },
    { key: "reports",        icon: Award,           label: "Reports" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PageMeta title="HUB Admin — HAMZURY" description="HAMZURY HUB admin — enrollments, cohorts, attendance, team competitions, social verification." />

      {isMobile && mobileNavOpen && (
        <div onClick={() => setMobileNavOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      )}

      <aside style={{
        width: 232, backgroundColor: NAVY, display: "flex", flexDirection: "column",
        borderRight: `1px solid ${GOLD}20`,
        ...(isMobile ? {
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          transform: mobileNavOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          boxShadow: mobileNavOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
        } : {}),
      }}>
        <div style={{
          padding: "20px 18px", borderBottom: `1px solid ${GOLD}15`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 2 }}>HAMZURY</div>
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>HUB Admin</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>Cohorts · Teams · Certs</div>
          </div>
          {isMobile && (
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu"
              style={{
                width: 30, height: 30, borderRadius: 8, backgroundColor: `${GOLD}15`, color: GOLD,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}><X size={16} /></button>
          )}
        </div>
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(({ key, icon: Icon, label }) => {
            const isActive = active === key;
            return (
              <button key={key}
                onClick={() => { setActive(key); if (isMobile) setMobileNavOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", marginBottom: 2, borderRadius: 10,
                  backgroundColor: isActive ? `${GOLD}20` : "transparent",
                  color: isActive ? GOLD : `${GOLD}70`,
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                }}>
                <Icon size={15} /> <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${GOLD}15` }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 10, color: `${GOLD}60`, fontSize: 12, textDecoration: "none", marginBottom: 2,
          }}>
            <ArrowLeft size={13} /> Back to HAMZURY
          </Link>
          <button onClick={logout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 10,
              color: `${GOLD}60`, backgroundColor: "transparent", border: "none",
              fontSize: 12, cursor: "pointer", textAlign: "left",
            }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: isMobile ? "100%" : "auto" }}>
        <header style={{
          padding: isMobile ? "12px 16px" : "14px 28px",
          backgroundColor: WHITE, borderBottom: `1px solid ${DARK}08`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
            {isMobile && (
              <button onClick={() => setMobileNavOpen(true)} aria-label="Open menu"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: `${NAVY}08`, color: NAVY,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}><Menu size={18} /></button>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {NAV.find(n => n.key === active)?.label}
              </p>
              <p style={{ fontSize: 13, color: DARK, fontWeight: 500, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name} · HUB
              </p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${NAVY}10`, color: NAVY, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> HUB
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {active === "dashboard"      && <OverviewSection onGoto={setActive} />}
            {active === "enrollments"    && <EnrollmentsSection />}
            {active === "cohorts"        && <CohortsSection />}
            {active === "attendance"     && <AttendanceSection />}
            {active === "competition"    && <CompetitionSection />}
            {active === "social"         && <SocialSection />}
            {active === "certifications" && <CertificationsSection />}
            {active === "alumni"         && <AlumniSection />}
            {active === "lmsProgress"    && <LmsProgressSection />}
            {active === "internDuties"   && <InternDutiesSection />}
            {active === "metfix"         && <MetfixSection />}
            {active === "calendar"       && <OpsCalendarSection />}
            {active === "reports"        && <ReportsSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function OverviewSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const appsQ = trpc.skills.applications.useQuery(undefined, { retry: false });
  const apps = ((appsQ.data || []) as any[]);

  // Only count applications that map to a NEW programme. Legacy ones are
  // counted separately so the dashboard reflects the rebrand, not the history.
  const acceptedApps = apps.filter(a => a.status === "accepted");
  const accepted = acceptedApps.filter(a => resolveProgramme(a.program)).length;
  const legacyAccepted = acceptedApps.length - accepted;
  const pending  = apps.filter(a => a.status === "submitted" || a.status === "under_review").length;
  const waitlisted = apps.filter(a => a.status === "waitlisted").length;

  // Next cohort start — from PHASE7_HUB calendar: 1st of every month
  const today = new Date();
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const daysToNext = Math.ceil((nextMonthStart.getTime() - today.getTime()) / 86400000);

  // Next team comp — first Monday of next month
  const nextFirstMonday = getFirstMonday(nextMonthStart.getFullYear(), nextMonthStart.getMonth());
  const daysToComp = Math.ceil((nextFirstMonday.getTime() - today.getTime()) / 86400000);

  const kpis = [
    { label: "Pending Applications",   value: pending,           icon: Clock,        color: GOLD,     section: "enrollments" as Section },
    { label: "Accepted (New Cohorts)", value: accepted,          icon: CheckCircle2, color: GREEN_OK, section: "cohorts" as Section },
    { label: "Legacy (Pre-Rebrand)",   value: legacyAccepted,    icon: AlertCircle,  color: MUTED,    section: "cohorts" as Section },
    { label: "Waitlisted",             value: waitlisted,        icon: AlertCircle,  color: ORANGE,   section: "enrollments" as Section },
    { label: "Next Cohort In",         value: `${daysToNext}d`,  icon: CalendarDays, color: BLUE,     section: "calendar" as Section },
    { label: "Next Comp Challenge",    value: `${daysToComp}d`,  icon: Trophy,       color: PURPLE,   section: "competition" as Section },
  ];

  return (
    <div>
      <SectionTitle sub="Everything Idris + Isa + Musa need to run HUB today.">
        HUB Overview
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {kpis.map(k => (
          <button key={k.label} onClick={() => onGoto(k.section)}
            style={{
              backgroundColor: WHITE, borderRadius: 14, padding: "14px 12px",
              border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              textAlign: "left", cursor: "pointer",
            }}>
            <k.icon size={14} style={{ color: k.color, marginBottom: 8 }} />
            <p style={{ fontSize: typeof k.value === "string" ? 16 : 20, fontWeight: 700, color: DARK, lineHeight: 1.15 }}>{k.value}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.label}</p>
          </button>
        ))}
      </div>

      {pending > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Applications Awaiting Review
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {apps.filter(a => a.status === "submitted" || a.status === "under_review").slice(0, 6).map((a: any) => (
              <div key={a.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{a.fullName || "—"}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {a.program} · {fmtDate(a.createdAt)}
                  </p>
                </div>
                <StatusPill label={a.status} tone="gold" />
              </div>
            ))}
          </div>
          <button onClick={() => onGoto("enrollments")}
            style={{
              marginTop: 12, padding: "8px 14px", borderRadius: 10,
              backgroundColor: NAVY, color: GOLD, border: "none",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>
            Review all →
          </button>
        </Card>
      )}
    </div>
  );
}

function getFirstMonday(year: number, month: number): Date {
  const d = new Date(year, month, 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════ */
function EnrollmentsSection() {
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const appsQ = trpc.skills.applications.useQuery(undefined, { retry: false });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const all = ((appsQ.data || []) as any[]);
  const filtered = all
    .filter(a => filter === "all" || a.status === filter)
    .filter(a => !search ||
      a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.program?.toLowerCase().includes(search.toLowerCase()) ||
      a.ref?.toLowerCase().includes(search.toLowerCase())
    );

  const updateMut = trpc.skills.updateApplicationStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.skills.applications.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted"> = {
    submitted: "gold", under_review: "blue", accepted: "green",
    waitlisted: "muted", rejected: "red",
  };

  return (
    <div>
      <SectionTitle sub="Every student application. Review, accept, waitlist, or reject.">
        Enrollments
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["all", "submitted", "under_review", "accepted", "waitlisted", "rejected"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "5px 10px", borderRadius: 8,
                  backgroundColor: filter === f ? NAVY : "transparent",
                  color: filter === f ? WHITE : MUTED,
                  border: `1px solid ${filter === f ? NAVY : `${DARK}15`}`,
                  fontSize: 10, fontWeight: 600, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{f.replace("_", " ")}</button>
            ))}
          </div>
          <input type="search" placeholder="Search name, email, programme, ref…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputBox(), width: isMobile ? "100%" : 260 }} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title="No applications match" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 60).map((a: any) => (
            <Card key={a.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.fullName}</p>
                    <StatusPill label={a.status} tone={TONE[a.status] || "muted"} />
                    {a.paymentStatus && <StatusPill label={`payment: ${a.paymentStatus}`} tone={a.paymentStatus === "paid" ? "green" : "muted"} />}
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                    {a.program} · {a.pathway || "—"}
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 10, color: MUTED, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace" }}>{a.ref}</span>
                    {a.email && <span>{a.email}</span>}
                    {a.phone && <span>{a.phone}</span>}
                    <span>{fmtDate(a.createdAt)}</span>
                  </div>
                </div>
                <select
                  value={a.status}
                  onChange={e => updateMut.mutate({ id: a.id, status: e.target.value as any })}
                  disabled={updateMut.isPending}
                  style={{
                    padding: "6px 10px", borderRadius: 8, border: `1px solid ${DARK}15`,
                    fontSize: 11, color: DARK, backgroundColor: WHITE, cursor: "pointer",
                  }}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function CohortsSection() {
  const appsQ = trpc.skills.applications.useQuery(undefined, { retry: false });
  const accepted = ((appsQ.data || []) as any[]).filter(a => a.status === "accepted");

  // Group accepted applications by resolved (new) programme name
  const byProgramme: Record<string, any[]> = {};
  const unmatched: any[] = [];
  for (const a of accepted) {
    const resolved = resolveProgramme(a.program);
    if (resolved) {
      (byProgramme[resolved] = byProgramme[resolved] || []).push(a);
    } else {
      unmatched.push(a);
    }
  }

  // Legacy-name breakdown for the "Unmatched" card
  const legacyByName: Record<string, number> = {};
  for (const a of unmatched) {
    const k = a.program || "(no programme)";
    legacyByName[k] = (legacyByName[k] || 0) + 1;
  }

  return (
    <div>
      <SectionTitle sub="Students grouped by programme. All 8 HUB programmes from PHASE7_HUB/PROGRAMS. Legacy applications from before the rebrand are shown separately at the bottom.">
        Active Cohorts
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PROGRAMMES.map(p => {
          const students = byProgramme[p.name] || [];
          return (
            <Card key={p.key}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                gap: 10, flexWrap: "wrap", marginBottom: students.length ? 12 : 0,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {p.weeks ? `${p.weeks} weeks` : "Self-paced"} · ₦{p.price.toLocaleString("en-NG")} · {p.schedule}
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 4, fontStyle: "italic" }}>
                    {p.cert}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, color: NAVY, lineHeight: 1 }}>{students.length}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>enrolled</p>
                </div>
              </div>

              {students.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 10, borderTop: `1px solid ${DARK}06` }}>
                  {students.slice(0, 10).map((s: any) => (
                    <div key={s.id} style={{
                      fontSize: 11, color: DARK,
                      display: "flex", justifyContent: "space-between", padding: "4px 0",
                    }}>
                      <span>{s.fullName}</span>
                      <span style={{ color: MUTED, fontFamily: "monospace", fontSize: 10 }}>{s.ref}</span>
                    </div>
                  ))}
                  {students.length > 10 && (
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>+ {students.length - 10} more</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {unmatched.length > 0 && (
          <Card style={{ borderStyle: "dashed", borderColor: `${MUTED}40` }}>
            <p style={{
              fontSize: 11, color: MUTED, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10,
            }}>
              Legacy — Pre-Rebrand Applications · {unmatched.length}
            </p>
            <p style={{ fontSize: 11, color: MUTED, marginBottom: 10, lineHeight: 1.6 }}>
              These applications used the old course list (before the 8-programme rebrand). Review them and move into the right new programme.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Object.entries(legacyByName)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <div key={name} style={{
                    fontSize: 11, color: DARK, padding: "4px 0",
                    display: "flex", justifyContent: "space-between",
                  }}>
                    <span>{name}</span>
                    <span style={{ color: MUTED }}>{count}</span>
                  </div>
                ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function AttendanceSection() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const q = trpc.attendance.byDate.useQuery({ date }, { retry: false });
  const rows = ((q.data || []) as any[]);

  // Weekly dates (this Mon–Sat from selected date)
  const weekdays = useMemo(() => {
    const d = new Date(date);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 6 }, (_, i) => {
      const x = new Date(monday);
      x.setDate(monday.getDate() + i);
      return x.toISOString().split("T")[0];
    });
  }, [date]);

  return (
    <div>
      <SectionTitle sub="Daily check-ins. Students check in from their own portal; you see the roster here.">
        Attendance
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 260 }}>
          <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Date
          </span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputBox()} />
        </label>
        <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
          {weekdays.map(d => (
            <button key={d} onClick={() => setDate(d)}
              style={{
                padding: "5px 10px", borderRadius: 8,
                backgroundColor: d === date ? NAVY : "transparent",
                color: d === date ? WHITE : MUTED,
                border: `1px solid ${d === date ? NAVY : `${DARK}15`}`,
                fontSize: 10, fontWeight: 600, cursor: "pointer",
              }}>
              {new Date(d).toLocaleDateString("en-NG", { weekday: "short", day: "numeric" })}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Check-ins for {fmtDate(date)} · {rows.length}
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={UserCheck} title="No check-ins for this date" hint="Students check in from their own portal. Nothing to review yet." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{r.userName || `User #${r.userId}`}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    In: {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—"}
                    {r.checkOut && <> · Out: {new Date(r.checkOut).toLocaleTimeString()}</>}
                  </p>
                </div>
                <StatusPill label={r.status || "present"} tone={r.status === "present" ? "green" : "muted"} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
type CompetitionEntry = {
  id: string;
  month: string; // YYYY-MM
  title: string;
  deadline: string;
  status: "active" | "judged";
  scores: Record<string, number>; // team key -> points
};
const COMP_STORE = "hamzury_hub_competitions_v1";
function loadComps(): CompetitionEntry[] { try { return JSON.parse(localStorage.getItem(COMP_STORE) || "[]"); } catch { return []; } }
function saveComps(c: CompetitionEntry[]) { try { localStorage.setItem(COMP_STORE, JSON.stringify(c)); } catch {} }

function CompetitionSection() {
  const [comps, setComps] = useState<CompetitionEntry[]>(loadComps);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    deadline: "",
  });

  const addComp = () => {
    if (!form.title.trim() || !form.deadline) { toast.error("Title + deadline required"); return; }
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const next: CompetitionEntry[] = [
      { id: Math.random().toString(36).slice(2), month, title: form.title.trim(), deadline: form.deadline, status: "active", scores: {} },
      ...comps,
    ];
    setComps(next); saveComps(next);
    setForm({ title: "", deadline: "" });
    setCreating(false);
    toast.success("Challenge announced");
  };

  const setScore = (compId: string, teamKey: string, pts: number) => {
    const next = comps.map(c => c.id === compId ? { ...c, scores: { ...c.scores, [teamKey]: pts } } : c);
    setComps(next); saveComps(next);
  };

  const markJudged = (id: string) => {
    const next = comps.map(c => c.id === id ? { ...c, status: "judged" as const } : c);
    setComps(next); saveComps(next);
    toast.success("Marked judged");
  };

  const del = (id: string) => {
    if (!confirm("Delete this competition?")) return;
    const next = comps.filter(c => c.id !== id);
    setComps(next); saveComps(next);
  };

  // All-time leaderboard
  const leaderboard = TEAMS.map(t => ({
    ...t,
    total: comps.reduce((s, c) => s + (c.scores[t.key] || 0), 0),
  })).sort((a, b) => b.total - a.total);

  const active = comps.filter(c => c.status === "active");
  const judged = comps.filter(c => c.status === "judged");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Monthly challenges across AI · Cyber · Quantum · Robotics teams. Announce on first Monday of each month.">
          Team Competition
        </SectionTitle>
        <button onClick={() => setCreating(true)}
          style={{
            padding: "8px 14px", borderRadius: 10, backgroundColor: NAVY, color: GOLD,
            border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={14} /> Announce Challenge
        </button>
      </div>

      {/* Rules block — from Team_Competition_Rules.txt */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Competition Rules · Monthly Cycle
        </p>

        <div style={{
          display: "grid", gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 14,
        }}>
          {COMP_CYCLE.map(c => (
            <div key={c.week} style={{
              padding: "10px 12px", backgroundColor: BG, borderRadius: 8, border: `1px solid ${DARK}06`,
            }}>
              <p style={{ fontSize: 10, color: NAVY, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {c.week}
              </p>
              <p style={{ fontSize: 11, color: DARK, marginTop: 4, lineHeight: 1.5 }}>
                {c.label}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
          Judging Criteria
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {JUDGING_CRITERIA.map(j => (
            <span key={j.label} style={{
              padding: "5px 10px", borderRadius: 999, backgroundColor: `${NAVY}08`,
              fontSize: 11, color: DARK,
            }}>
              {j.label} <strong style={{ color: NAVY }}>{j.weight}%</strong>
            </span>
          ))}
        </div>

        <p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
          Prizes
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 11, color: DARK, lineHeight: 1.7 }}>
          <li>· <strong>Monthly</strong> — Team recognition + small prize · Individual certificate of excellence</li>
          <li>· <strong>Annual</strong> — Winning team trophy + grand prize · Top 3 individuals earn course scholarships</li>
        </ul>

        <p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: 14, marginBottom: 8 }}>
          Scoring
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ padding: "5px 10px", borderRadius: 999, backgroundColor: `${GOLD}15`, fontSize: 11, color: GOLD, fontWeight: 600 }}>🥇 1st = 100 pts</span>
          <span style={{ padding: "5px 10px", borderRadius: 999, backgroundColor: `${DARK}08`, fontSize: 11, color: DARK, fontWeight: 600 }}>🥈 2nd = 75 pts</span>
          <span style={{ padding: "5px 10px", borderRadius: 999, backgroundColor: `${ORANGE}15`, fontSize: 11, color: ORANGE, fontWeight: 600 }}>🥉 3rd = 50 pts</span>
          <span style={{ padding: "5px 10px", borderRadius: 999, backgroundColor: `${DARK}05`, fontSize: 11, color: MUTED, fontWeight: 600 }}>Participation = 25 pts</span>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Year Leaderboard
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {leaderboard.map((t, i) => (
            <div key={t.key} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 12px", backgroundColor: i === 0 ? `${GOLD}10` : BG, borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: i === 0 ? GOLD : MUTED, width: 24 }}>
                  #{i + 1}
                </span>
                <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{t.name}</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: i === 0 ? GOLD : DARK }}>{t.total} pts</span>
            </div>
          ))}
        </div>
      </Card>

      {creating && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            New Challenge
          </p>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            <input placeholder="Challenge title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} style={inputBox()} />
            <input type="date" value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })} style={inputBox()} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={addComp}
              style={{
                padding: "8px 14px", borderRadius: 10, backgroundColor: NAVY, color: GOLD,
                border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>Announce</button>
            <button onClick={() => setCreating(false)}
              style={{
                padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
                border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer",
              }}>Cancel</button>
          </div>
        </Card>
      )}

      {active.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Active Challenges
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {active.map(c => (
              <div key={c.id} style={{ padding: "14px 16px", backgroundColor: `${GOLD}06`, borderRadius: 10, border: `1px solid ${GOLD}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{c.title}</p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Deadline: {fmtDate(c.deadline)} · {c.month}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => markJudged(c.id)}
                      style={{
                        padding: "5px 10px", borderRadius: 8,
                        backgroundColor: `${GREEN_OK}15`, color: GREEN_OK, border: "none",
                        fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}>Mark Judged</button>
                    <button onClick={() => del(c.id)}
                      style={{
                        padding: "5px 8px", borderRadius: 8,
                        backgroundColor: `${RED}10`, color: RED, border: "none",
                        fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}><Trash2 size={11} /></button>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                  {TEAMS.map(t => (
                    <div key={t.key} style={{
                      padding: "8px 10px", backgroundColor: WHITE, borderRadius: 8,
                      border: `1px solid ${t.color}20`,
                    }}>
                      <p style={{ fontSize: 10, color: t.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                        {t.name}
                      </p>
                      <select value={c.scores[t.key] || 0}
                        onChange={e => setScore(c.id, t.key, parseInt(e.target.value))}
                        style={{
                          width: "100%", padding: "4px 6px", borderRadius: 6, border: `1px solid ${DARK}10`,
                          fontSize: 12, color: DARK, backgroundColor: WHITE, cursor: "pointer",
                        }}>
                        <option value={0}>— pts</option>
                        <option value={100}>100 (1st)</option>
                        <option value={75}>75 (2nd)</option>
                        <option value={50}>50 (3rd)</option>
                        <option value={25}>25 (participation)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {judged.length > 0 && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Past Challenges ({judged.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {judged.map(c => {
              const winner = Object.entries(c.scores).sort((a, b) => b[1] - a[1])[0];
              const winnerTeam = winner ? TEAMS.find(t => t.key === winner[0]) : null;
              return (
                <div key={c.id} style={{
                  padding: "8px 10px", backgroundColor: BG, borderRadius: 8,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{c.title}</p>
                    <p style={{ fontSize: 10, color: MUTED }}>{c.month} · {fmtDate(c.deadline)}</p>
                  </div>
                  {winnerTeam && (
                    <span style={{
                      padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                      backgroundColor: `${winnerTeam.color}15`, color: winnerTeam.color,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>🏆 {winnerTeam.name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {active.length === 0 && judged.length === 0 && !creating && (
        <Card><EmptyState icon={Trophy} title="No challenges yet" hint="Tap 'Announce Challenge' to start the first one." /></Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
type SocialEntry = {
  id: string;
  studentName: string;
  weekOf: string;
  platform: string;
  postUrl: string;
  verified: boolean;
  verifiedBy?: string;
};
const SOCIAL_STORE = "hamzury_hub_social_v1";
function loadSocial(): SocialEntry[] { try { return JSON.parse(localStorage.getItem(SOCIAL_STORE) || "[]"); } catch { return []; } }
function saveSocial(r: SocialEntry[]) { try { localStorage.setItem(SOCIAL_STORE, JSON.stringify(r)); } catch {} }

function SocialSection() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SocialEntry[]>(loadSocial);
  const [form, setForm] = useState({
    studentName: "", platform: "instagram", postUrl: "",
    weekOf: isoMonday(new Date()),
  });

  const add = () => {
    if (!form.studentName.trim() || !form.postUrl.trim()) { toast.error("Student + URL required"); return; }
    const next: SocialEntry[] = [
      { id: Math.random().toString(36).slice(2), ...form, verified: false },
      ...rows,
    ];
    setRows(next); saveSocial(next);
    setForm({ ...form, studentName: "", postUrl: "" });
    toast.success("Post logged");
  };

  const toggleVerify = (id: string) => {
    const next = rows.map(r => r.id === id
      ? { ...r, verified: !r.verified, verifiedBy: !r.verified ? (user?.name || "Staff") : undefined }
      : r);
    setRows(next); saveSocial(next);
  };

  const del = (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const next = rows.filter(r => r.id !== id);
    setRows(next); saveSocial(next);
  };

  const thisWeek = rows.filter(r => r.weekOf === isoMonday(new Date()));
  const verifiedThisWeek = thisWeek.filter(r => r.verified).length;

  return (
    <div>
      <SectionTitle sub="Students must post weekly. Verification required for certification. Stored in your browser for now.">
        Social Media Verification
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="This week" value={thisWeek.length} color={BLUE} />
        <MiniStat label="Verified this week" value={verifiedThisWeek} color={GREEN_OK} />
        <MiniStat label="Total logged" value={rows.length} color={GOLD} />
      </div>

      {/* Posting rules from Student_Content_Posting_Guide.txt */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Posting Rules
        </p>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          <div style={{ padding: "10px 12px", backgroundColor: BG, borderRadius: 8 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Minimum</p>
            <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>
              {SOCIAL_RULES.minPerWeek} post / week
            </p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Recommended: {SOCIAL_RULES.recommended}</p>
          </div>
          <div style={{ padding: "10px 12px", backgroundColor: BG, borderRadius: 8 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Platforms (pick best)</p>
            <p style={{ fontSize: 11, color: DARK }}>
              {SOCIAL_RULES.platforms.join(" · ")}
            </p>
          </div>
          <div style={{ padding: "10px 12px", backgroundColor: BG, borderRadius: 8 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Required Tag</p>
            <p style={{ fontSize: 12, color: NAVY, fontWeight: 600, fontFamily: "monospace" }}>{SOCIAL_RULES.tag}</p>
          </div>
          <div style={{ padding: "10px 12px", backgroundColor: BG, borderRadius: 8 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>Hashtags</p>
            <p style={{ fontSize: 11, color: NAVY, fontFamily: "monospace" }}>
              {SOCIAL_RULES.hashtags.join(" ")}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginTop: 14, marginBottom: 8 }}>
          Weekly themes (rotating)
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SOCIAL_RULES.weeklyThemes.map(t => (
            <span key={t} style={{
              padding: "5px 10px", borderRadius: 999, backgroundColor: `${NAVY}08`,
              fontSize: 11, color: DARK,
            }}>{t}</span>
          ))}
        </div>

        <p style={{
          marginTop: 14, padding: "8px 10px", fontSize: 11, color: ORANGE,
          backgroundColor: `${ORANGE}08`, borderRadius: 8, borderLeft: `3px solid ${ORANGE}`,
        }}>
          <strong style={{ color: DARK }}>Consequence:</strong> {SOCIAL_RULES.consequence}.
        </p>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Log a Post
        </p>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          <input placeholder="Student name" value={form.studentName}
            onChange={e => setForm({ ...form, studentName: e.target.value })} style={inputBox()} />
          <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={inputBox()}>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter / X</option>
            <option value="youtube">YouTube</option>
          </select>
          <input placeholder="Post URL" value={form.postUrl}
            onChange={e => setForm({ ...form, postUrl: e.target.value })} style={inputBox()} />
          <input type="date" value={form.weekOf}
            onChange={e => setForm({ ...form, weekOf: e.target.value })} style={inputBox()} />
        </div>
        <button onClick={add}
          style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 10,
            backgroundColor: NAVY, color: GOLD, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={12} /> Add
        </button>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Logged Posts ({rows.length})
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={Share2} title="No posts logged yet" hint="As students share weekly content, log the URLs here to verify." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 60).map(r => (
              <div key={r.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {r.studentName} <span style={{ color: MUTED, fontWeight: 400 }}>· {r.platform}</span>
                  </p>
                  <a href={r.postUrl} target="_blank" rel="noreferrer"
                    style={{ fontSize: 10, color: BLUE, display: "inline-block", marginTop: 2, wordBreak: "break-all" }}>
                    {r.postUrl.slice(0, 60)}{r.postUrl.length > 60 ? "…" : ""}
                  </a>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    Week of {fmtDate(r.weekOf)}{r.verifiedBy && ` · verified by ${r.verifiedBy}`}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggleVerify(r.id)}
                    style={{
                      padding: "5px 10px", borderRadius: 8,
                      backgroundColor: r.verified ? `${GREEN_OK}15` : `${DARK}08`,
                      color: r.verified ? GREEN_OK : MUTED,
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                    {r.verified ? <CheckCircle2 size={11} /> : <Eye size={11} />}
                    {r.verified ? "Verified" : "Mark verified"}
                  </button>
                  <button onClick={() => del(r.id)}
                    style={{
                      padding: "5px 8px", borderRadius: 8,
                      backgroundColor: `${RED}10`, color: RED, border: "none",
                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function isoMonday(d: Date): string {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - ((day + 6) % 7));
  return x.toISOString().split("T")[0];
}

/* ═══════════════════════════════════════════════════════════════════════ */
/**
 * Operations Calendar — mirrors PHASE7_HUB/CALENDAR/HUB_Calendar.ics exactly.
 * Only the events in that file are shown:
 *   · Weekly: Main teaching (Mon-Wed 8-10:30am) + Hall gathering (Mon-Wed 11-2)
 *   · Weekly: Kids teaching (Thu-Sat 8-10:30am) + Kids hall (Thu-Sat 11-2)
 *   · Monthly: New cohort resumption (1st of month)
 *   · Monthly: Team competition challenge (first Monday)
 */
function OpsCalendarSection() {
  const today = new Date();
  const startMonth = today.getMonth();
  const startYear = today.getFullYear();

  const months: { label: string; events: { date: string; type: string; title: string; detail: string; color: string }[] }[] = [];
  for (let i = 0; i < 6; i++) {
    const y = startYear + Math.floor((startMonth + i) / 12);
    const m = (startMonth + i) % 12;
    const label = new Date(y, m, 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
    const firstMon = getFirstMonday(y, m);
    // Only the TWO monthly anchors from the ics file
    const events = [
      {
        date: new Date(y, m, 1).toISOString().split("T")[0],
        type: "New Cohort Resumption",
        title: "1st of month — new students start",
        detail: "Orientation + welcome session",
        color: NAVY,
      },
      {
        date: firstMon.toISOString().split("T")[0],
        type: "Team Competition",
        title: "Team Competition Challenge Announced",
        detail: "First Monday — new challenge for all 4 teams",
        color: PURPLE,
      },
    ];
    months.push({ label, events });
  }

  return (
    <div>
      <SectionTitle sub="Exact rhythm from PHASE7_HUB/CALENDAR/HUB_Calendar.ics — weekly teaching + hall gatherings, plus two monthly anchors.">
        Operations Calendar
      </SectionTitle>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: NAVY, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Weekly Cadence
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <WeeklyBlock
            name="Teaching Session (Main Programs)"
            days="Mon – Wed"
            time="8:00 – 10:30 am"
            detail="Business Builders · Digital Dominance · Code Craft · Compliance · Money · MetFix"
          />
          <WeeklyBlock
            name="Hall Gathering (Main)"
            days="Mon – Wed"
            time="11:00 am – 2:00 pm"
            detail="Entrepreneurship · Social media & content · AI prompt training"
          />
          <WeeklyBlock
            name="Basic Computer Skills (Kids Programme)"
            days="Thu – Sat"
            time="8:00 – 10:30 am"
            detail="Ages 8–15 · Computer basics"
          />
          <WeeklyBlock
            name="Hall Gathering (Kids)"
            days="Thu – Sat"
            time="11:00 am – 2:00 pm"
            detail="Age-appropriate entrepreneurship · Creative projects"
          />
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {months.map(m => (
          <Card key={m.label}>
            <p style={{
              fontSize: 11, color: NAVY, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
            }}>
              {m.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {m.events.map((e, i) => (
                <div key={i} style={{
                  padding: "10px 12px", backgroundColor: BG, borderRadius: 10,
                  border: `1px solid ${DARK}06`,
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 4, backgroundColor: e.color,
                    flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{e.title}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{e.detail}</p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {fmtDate(e.date)} · {e.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeeklyBlock({ name, days, time, detail }: { name: string; days: string; time: string; detail: string }) {
  return (
    <div style={{
      padding: "10px 12px", backgroundColor: BG, borderRadius: 10,
      border: `1px solid ${DARK}06`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{name}</p>
        <p style={{ fontSize: 10, color: NAVY, fontWeight: 600, whiteSpace: "nowrap" }}>
          {days} · {time}
        </p>
      </div>
      <p style={{ fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{detail}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const appsQ = trpc.skills.applications.useQuery(undefined, { retry: false });
  const apps = ((appsQ.data || []) as any[]);

  const comps = loadComps();
  const social = loadSocial();

  const enrolled = apps.filter(a => a.status === "accepted").length;
  const pending  = apps.filter(a => a.status === "submitted" || a.status === "under_review").length;
  const byProgramme: Record<string, number> = {};
  for (const a of apps.filter(x => x.status === "accepted")) {
    byProgramme[a.program || "Other"] = (byProgramme[a.program || "Other"] || 0) + 1;
  }

  const leaderboard = TEAMS.map(t => ({
    ...t,
    total: comps.reduce((s, c) => s + (c.scores[t.key] || 0), 0),
  })).sort((a, b) => b.total - a.total);

  const thisWeek = isoMonday(new Date());
  const postsThisWeek = social.filter(r => r.weekOf === thisWeek).length;
  const verifiedThisWeek = social.filter(r => r.weekOf === thisWeek && r.verified).length;

  const report = `HAMZURY HUB · Weekly Report
${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}

ENROLLMENTS
 · Accepted students:   ${enrolled}
 · Pending review:      ${pending}

BY PROGRAMME
${Object.entries(byProgramme).map(([p, n]) => ` · ${p.padEnd(30)} ${n}`).join("\n") || " · (none yet)"}

TEAM COMPETITION (year)
${leaderboard.map((t, i) => ` · #${i + 1} ${t.name.padEnd(18)} ${t.total} pts`).join("\n")}

SOCIAL MEDIA (this week)
 · Posts logged:        ${postsThisWeek}
 · Verified:            ${verifiedThisWeek}

Built to Last.`;

  const copy = () => {
    navigator.clipboard.writeText(report).then(
      () => toast.success("Report copied"),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  return (
    <div>
      <SectionTitle sub="Ready-to-paste weekly snapshot for CEO/Founder.">
        Reports
      </SectionTitle>

      {/* HUB success targets from Operations Guide */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Success Targets
        </p>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {SUCCESS_TARGETS.map(t => (
            <div key={t.label} style={{
              padding: "8px 10px", backgroundColor: BG, borderRadius: 8,
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 11, color: DARK, minWidth: 0, flex: 1 }}>{t.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>
                {t.target}{t.label.includes("month") ? "+" : "%"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Certification requirements from Operations Guide */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Certification Requirements
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {CERT_REQUIREMENTS.map(r => (
            <li key={r} style={{
              fontSize: 12, color: DARK, padding: "6px 10px", backgroundColor: BG, borderRadius: 8,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <CheckCircle2 size={12} style={{ color: NAVY, flexShrink: 0 }} />
              {r}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Weekly Report — Copy & Send
        </p>
        <pre style={{
          fontFamily: "ui-monospace, 'SF Mono', monospace",
          fontSize: 11, color: DARK, backgroundColor: BG,
          padding: "14px 16px", borderRadius: 10,
          border: `1px solid ${DARK}06`,
          whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "auto",
          lineHeight: 1.7, margin: 0,
        }}>{report}</pre>
        <button onClick={copy}
          style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 10,
            backgroundColor: NAVY, color: GOLD, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <Send size={12} /> Copy Report
        </button>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * RESTORED SECTIONS — MySQL via tRPC `hubAdmin.*` (server/hubAdmin/router.ts).
 * The 5 sections that were cut at commit d7e9c60 are brought back here.
 * Patterns mirror CEOPortal.tsx (multi-section CRUD, ids are int
 * end-to-end, toast on success, invalidate on mutate).
 * ═══════════════════════════════════════════════════════════════════════ */

function PrimaryButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "8px 14px", borderRadius: 10,
        backgroundColor: NAVY, color: WHITE, border: "none",
        fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>{children}</button>
  );
}
function GhostButton({ onClick, children, color = MUTED }: { onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button onClick={onClick}
      style={{
        padding: "5px 10px", borderRadius: 8,
        backgroundColor: `${color}10`, color, border: "none",
        fontSize: 10, fontWeight: 600, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 4,
      }}>{children}</button>
  );
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 10, color: MUTED, textTransform: "uppercase",
      letterSpacing: "0.06em", fontWeight: 600,
    }}>{children}</span>
  );
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      style={{
        padding: "9px 11px", borderRadius: 8, border: `1px solid ${DARK}15`,
        fontSize: 12, color: DARK, backgroundColor: WHITE, outline: "none",
        width: "100%",
        ...props.style,
      }} />
  );
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      style={{
        padding: "9px 11px", borderRadius: 8, border: `1px solid ${DARK}15`,
        fontSize: 12, color: DARK, backgroundColor: WHITE, outline: "none",
        width: "100%", minHeight: 60, resize: "vertical", fontFamily: "inherit",
        ...props.style,
      }} />
  );
}
function SelectInput({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select {...props}
      style={{
        padding: "9px 11px", borderRadius: 8, border: `1px solid ${DARK}15`,
        fontSize: 12, color: DARK, backgroundColor: WHITE, outline: "none",
        width: "100%",
        ...props.style,
      }}>{children}</select>
  );
}
function FormGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 10 }}>
      {children}
    </div>
  );
}
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  );
}

const splitLines = (s: string): string[] => s.split("\n").map(x => x.trim()).filter(Boolean);
const todayISO = (): string => new Date().toISOString().slice(0, 10);

/* ─── Certification ───────────────────────────────────────────────────── */
function CertificationsSection() {
  const utils = trpc.useUtils();
  const q = trpc.hubAdmin.certifications.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    studentName: "", studentRef: "",
    programme: PROGRAMMES[0]?.name || "",
    level: "Foundation" as const,
    issuingBody: "", certificateRef: "",
    issueDate: todayISO(),
    expiryDate: "",
    skills: "",
    status: "Issued" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.hubAdmin.certifications.create.useMutation({
    onSuccess: () => {
      toast.success("Certification logged");
      utils.hubAdmin.certifications.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hubAdmin.certifications.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hubAdmin.certifications.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hubAdmin.certifications.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hubAdmin.certifications.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Issued certifications — Google, Coursera, internal HAMZURY certs.">
        Certification
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Issued" value={rows.filter(r => r.status === "Issued").length} color={GREEN_OK} />
        <MiniStat label="Pending" value={rows.filter(r => r.status === "Pending").length} color={GOLD} />
        <MiniStat label="Expired" value={rows.filter(r => r.status === "Expired").length} color={RED} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Certification</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Student Name"><TextInput value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} /></FormField>
              <FormField label="Student Ref"><TextInput value={form.studentRef} onChange={e => setForm({ ...form, studentRef: e.target.value })} placeholder="e.g. HMZ-26/4-1234" /></FormField>
              <FormField label="Programme">
                <SelectInput value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })}>
                  {PROGRAMMES.map(p => <option key={p.key} value={p.name}>{p.name}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Level">
                <SelectInput value={form.level} onChange={e => setForm({ ...form, level: e.target.value as any })}>
                  {["Foundation", "Intermediate", "Advanced", "Mastery", "Internal", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Issuing Body"><TextInput value={form.issuingBody} onChange={e => setForm({ ...form, issuingBody: e.target.value })} placeholder="Google / Coursera / HAMZURY" /></FormField>
              <FormField label="Certificate Ref"><TextInput value={form.certificateRef} onChange={e => setForm({ ...form, certificateRef: e.target.value })} placeholder="Cert ID / URL" /></FormField>
              <FormField label="Issue Date"><TextInput type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></FormField>
              <FormField label="Expiry Date"><TextInput type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Issued", "Pending", "Revoked", "Expired"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Skills validated (one per line)"><TextArea value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder={"SEO\nAnalytics\nAds"} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.studentName.trim()) { toast.error("Student name is required"); return; }
                if (!form.programme.trim()) { toast.error("Programme is required"); return; }
                if (!form.issueDate) { toast.error("Issue date is required"); return; }
                createMut.mutate({
                  studentName: form.studentName,
                  studentRef: form.studentRef || null,
                  programme: form.programme,
                  level: form.level,
                  issuingBody: form.issuingBody || null,
                  certificateRef: form.certificateRef || null,
                  issueDate: form.issueDate,
                  expiryDate: form.expiryDate || null,
                  skills: splitLines(form.skills),
                  status: form.status,
                  notes: form.notes || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={BadgeCheck} title="No certifications logged" hint="Track every issued cert here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.studentName}</p>
                      <StatusPill label={r.level} tone="muted" />
                      <StatusPill label={r.status} tone={r.status === "Issued" ? "green" : r.status === "Pending" ? "gold" : "red"} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.programme}
                      {r.issuingBody && <> · {r.issuingBody}</>}
                      {r.studentRef && <> · {r.studentRef}</>}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      Issued {fmtDate(r.issueDate)}
                      {r.expiryDate && <> · Expires {fmtDate(r.expiryDate)}</>}
                      {r.certificateRef && <> · {r.certificateRef}</>}
                    </p>
                    {Array.isArray(r.skills) && r.skills.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {r.skills.map((s: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: NAVY, fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Issued", "Pending", "Revoked", "Expired"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this certification?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                      <Trash2 size={10} /> Remove
                    </GhostButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── Alumni ──────────────────────────────────────────────────────────── */
function AlumniSection() {
  const utils = trpc.useUtils();
  const q = trpc.hubAdmin.alumni.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    studentName: "", studentRef: "",
    programme: PROGRAMMES[0]?.name || "",
    graduationDate: todayISO(),
    currentEmployer: "", jobTitle: "",
    placementStatus: "Seeking" as const,
    email: "", phone: "",
    skills: "",
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.hubAdmin.alumni.create.useMutation({
    onSuccess: () => {
      toast.success("Alumni added");
      utils.hubAdmin.alumni.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hubAdmin.alumni.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hubAdmin.alumni.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hubAdmin.alumni.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hubAdmin.alumni.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="HAMZURY HUB alumni — placements + ongoing contact.">
        Alumni
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Employed" value={rows.filter(r => r.placementStatus === "Employed").length} color={GREEN_OK} />
        <MiniStat label="Self-Employed" value={rows.filter(r => r.placementStatus === "Self-Employed").length} color={PURPLE} />
        <MiniStat label="Seeking" value={rows.filter(r => r.placementStatus === "Seeking").length} color={ORANGE} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Alumni</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Student Name"><TextInput value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} /></FormField>
              <FormField label="Student Ref"><TextInput value={form.studentRef} onChange={e => setForm({ ...form, studentRef: e.target.value })} /></FormField>
              <FormField label="Programme">
                <SelectInput value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })}>
                  {PROGRAMMES.map(p => <option key={p.key} value={p.name}>{p.name}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Graduation Date"><TextInput type="date" value={form.graduationDate} onChange={e => setForm({ ...form, graduationDate: e.target.value })} /></FormField>
              <FormField label="Placement Status">
                <SelectInput value={form.placementStatus} onChange={e => setForm({ ...form, placementStatus: e.target.value as any })}>
                  {["Employed", "Self-Employed", "Internship", "Further Studies", "Seeking", "Unknown"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Current Employer"><TextInput value={form.currentEmployer} onChange={e => setForm({ ...form, currentEmployer: e.target.value })} /></FormField>
              <FormField label="Job Title"><TextInput value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} /></FormField>
              <FormField label="Email"><TextInput type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
              <FormField label="Phone"><TextInput value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Skills (one per line)"><TextArea value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.studentName.trim()) { toast.error("Student name is required"); return; }
                if (!form.programme.trim()) { toast.error("Programme is required"); return; }
                if (!form.graduationDate) { toast.error("Graduation date is required"); return; }
                createMut.mutate({
                  studentName: form.studentName,
                  studentRef: form.studentRef || null,
                  programme: form.programme,
                  graduationDate: form.graduationDate,
                  currentEmployer: form.currentEmployer || null,
                  jobTitle: form.jobTitle || null,
                  placementStatus: form.placementStatus,
                  email: form.email || null,
                  phone: form.phone || null,
                  skills: splitLines(form.skills),
                  notes: form.notes || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No alumni logged" hint="Track every graduate here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.studentName}</p>
                      <StatusPill
                        label={r.placementStatus}
                        tone={r.placementStatus === "Employed" || r.placementStatus === "Self-Employed" ? "green" :
                              r.placementStatus === "Seeking" ? "orange" :
                              r.placementStatus === "Internship" ? "blue" :
                              r.placementStatus === "Further Studies" ? "purple" : "muted"}
                      />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.programme} · Grad {fmtDate(r.graduationDate)}
                      {r.studentRef && <> · {r.studentRef}</>}
                    </p>
                    {(r.currentEmployer || r.jobTitle) && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {r.jobTitle && <>{r.jobTitle}</>}
                        {r.currentEmployer && <> @ {r.currentEmployer}</>}
                      </p>
                    )}
                    {(r.email || r.phone) && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {r.email}{r.email && r.phone && <> · </>}{r.phone}
                      </p>
                    )}
                    {Array.isArray(r.skills) && r.skills.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {r.skills.map((s: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: NAVY, fontWeight: 600 }}>{s}</span>
                        ))}
                      </div>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.placementStatus} onChange={e => updateMut.mutate({ id: r.id, placementStatus: e.target.value as any })}>
                      {["Employed", "Self-Employed", "Internship", "Further Studies", "Seeking", "Unknown"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this alumni record?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                      <Trash2 size={10} /> Remove
                    </GhostButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── LMS Progress ────────────────────────────────────────────────────── */
function LmsProgressSection() {
  const utils = trpc.useUtils();
  const q = trpc.hubAdmin.lmsProgress.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    studentName: "", studentRef: "",
    programme: PROGRAMMES[0]?.name || "",
    currentModule: "",
    completionPct: 0,
    modulesCompleted: "",
    lastActivity: todayISO(),
    status: "Active" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.hubAdmin.lmsProgress.create.useMutation({
    onSuccess: () => {
      toast.success("Progress logged");
      utils.hubAdmin.lmsProgress.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hubAdmin.lmsProgress.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hubAdmin.lmsProgress.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hubAdmin.lmsProgress.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hubAdmin.lmsProgress.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Track every student's LMS module progress + completion %.">
        LMS Progress
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="On Track" value={rows.filter(r => r.status === "On Track" || r.status === "Active").length} color={GREEN_OK} />
        <MiniStat label="Behind" value={rows.filter(r => r.status === "Behind").length} color={ORANGE} />
        <MiniStat label="Stalled" value={rows.filter(r => r.status === "Stalled" || r.status === "Dropped").length} color={RED} />
        <MiniStat label="Completed" value={rows.filter(r => r.status === "Completed").length} color={NAVY} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Progress Entry</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Student Name"><TextInput value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} /></FormField>
              <FormField label="Student Ref"><TextInput value={form.studentRef} onChange={e => setForm({ ...form, studentRef: e.target.value })} /></FormField>
              <FormField label="Programme">
                <SelectInput value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })}>
                  {PROGRAMMES.map(p => <option key={p.key} value={p.name}>{p.name}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Current Module"><TextInput value={form.currentModule} onChange={e => setForm({ ...form, currentModule: e.target.value })} /></FormField>
              <FormField label="Completion %">
                <TextInput type="number" min={0} max={100} value={form.completionPct}
                  onChange={e => setForm({ ...form, completionPct: Math.max(0, Math.min(100, parseInt(e.target.value || "0", 10) || 0)) })} />
              </FormField>
              <FormField label="Last Activity"><TextInput type="date" value={form.lastActivity} onChange={e => setForm({ ...form, lastActivity: e.target.value })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Active", "On Track", "Behind", "Stalled", "Completed", "Dropped"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Modules Completed (one per line)"><TextArea value={form.modulesCompleted} onChange={e => setForm({ ...form, modulesCompleted: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.studentName.trim()) { toast.error("Student name is required"); return; }
                if (!form.programme.trim()) { toast.error("Programme is required"); return; }
                createMut.mutate({
                  studentName: form.studentName,
                  studentRef: form.studentRef || null,
                  programme: form.programme,
                  currentModule: form.currentModule || null,
                  completionPct: form.completionPct,
                  modulesCompleted: splitLines(form.modulesCompleted),
                  lastActivity: form.lastActivity || null,
                  status: form.status,
                  notes: form.notes || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={BookOpen} title="No LMS progress logged" hint="Log every student's module progress here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.studentName}</p>
                      <StatusPill
                        label={r.status}
                        tone={r.status === "Completed" ? "blue" :
                              r.status === "On Track" || r.status === "Active" ? "green" :
                              r.status === "Behind" ? "orange" :
                              r.status === "Stalled" || r.status === "Dropped" ? "red" : "muted"}
                      />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.programme}
                      {r.currentModule && <> · {r.currentModule}</>}
                      {r.studentRef && <> · {r.studentRef}</>}
                    </p>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>Progress</span>
                        <span style={{ fontSize: 11, color: DARK, fontWeight: 700 }}>{r.completionPct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, backgroundColor: `${DARK}10`, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${Math.max(0, Math.min(100, r.completionPct ?? 0))}%`,
                          backgroundColor: r.status === "Behind" ? ORANGE : r.status === "Stalled" || r.status === "Dropped" ? RED : NAVY,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                    </div>
                    {r.lastActivity && <p style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Last activity {fmtDate(r.lastActivity)}</p>}
                    {Array.isArray(r.modulesCompleted) && r.modulesCompleted.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {r.modulesCompleted.map((m: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: GREEN_OK, fontWeight: 600 }}>{m}</span>
                        ))}
                      </div>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Active", "On Track", "Behind", "Stalled", "Completed", "Dropped"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this progress record?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                      <Trash2 size={10} /> Remove
                    </GhostButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── Intern Coord ────────────────────────────────────────────────────── */
function InternDutiesSection() {
  const utils = trpc.useUtils();
  const q = trpc.hubAdmin.internDuties.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    internName: "",
    dutyTitle: "",
    category: "Other" as const,
    assignedDate: todayISO(),
    dueDate: "",
    checklist: "",
    status: "Assigned" as const,
    assignedBy: "",
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.hubAdmin.internDuties.create.useMutation({
    onSuccess: () => {
      toast.success("Duty assigned");
      utils.hubAdmin.internDuties.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hubAdmin.internDuties.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hubAdmin.internDuties.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hubAdmin.internDuties.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hubAdmin.internDuties.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="HUB intern duty roster — assignments, checklists, status.">
        Intern Coord
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Assigned" value={rows.filter(r => r.status === "Assigned").length} color={GOLD} />
        <MiniStat label="In Progress" value={rows.filter(r => r.status === "In Progress").length} color={BLUE} />
        <MiniStat label="Blocked" value={rows.filter(r => r.status === "Blocked").length} color={RED} />
        <MiniStat label="Done" value={rows.filter(r => r.status === "Done").length} color={GREEN_OK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Duty</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Intern Name"><TextInput value={form.internName} onChange={e => setForm({ ...form, internName: e.target.value })} placeholder="Isa / Musa" /></FormField>
              <FormField label="Duty Title"><TextInput value={form.dutyTitle} onChange={e => setForm({ ...form, dutyTitle: e.target.value })} /></FormField>
              <FormField label="Category">
                <SelectInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}>
                  {["Teaching Support", "Admin", "Facilities", "Social Media", "LMS", "Events", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Assigned Date"><TextInput type="date" value={form.assignedDate} onChange={e => setForm({ ...form, assignedDate: e.target.value })} /></FormField>
              <FormField label="Due Date"><TextInput type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Assigned", "In Progress", "Blocked", "Done", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Assigned By"><TextInput value={form.assignedBy} onChange={e => setForm({ ...form, assignedBy: e.target.value })} placeholder="Idris" /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Checklist (one per line)"><TextArea value={form.checklist} onChange={e => setForm({ ...form, checklist: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.internName.trim()) { toast.error("Intern name is required"); return; }
                if (!form.dutyTitle.trim()) { toast.error("Duty title is required"); return; }
                if (!form.assignedDate) { toast.error("Assigned date is required"); return; }
                createMut.mutate({
                  internName: form.internName,
                  dutyTitle: form.dutyTitle,
                  category: form.category,
                  assignedDate: form.assignedDate,
                  dueDate: form.dueDate || null,
                  checklist: splitLines(form.checklist),
                  status: form.status,
                  assignedBy: form.assignedBy || null,
                  notes: form.notes || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Briefcase} title="No duties assigned" hint="Assign every intern duty here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.dutyTitle}</p>
                      <StatusPill label={r.category} tone="muted" />
                      <StatusPill
                        label={r.status}
                        tone={r.status === "Done" ? "green" :
                              r.status === "In Progress" ? "blue" :
                              r.status === "Blocked" ? "red" :
                              r.status === "Assigned" ? "gold" : "muted"}
                      />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.internName}
                      {r.assignedBy && <> · by {r.assignedBy}</>}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      Assigned {fmtDate(r.assignedDate)}
                      {r.dueDate && <> · Due {fmtDate(r.dueDate)}</>}
                    </p>
                    {Array.isArray(r.checklist) && r.checklist.length > 0 && (
                      <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
                        {r.checklist.map((c: string, i: number) => (
                          <li key={i} style={{
                            fontSize: 11, color: DARK, padding: "4px 8px", backgroundColor: WHITE, borderRadius: 6,
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                            <CheckCircle2 size={10} style={{ color: NAVY, flexShrink: 0 }} />
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Assigned", "In Progress", "Blocked", "Done", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this duty?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                      <Trash2 size={10} /> Remove
                    </GhostButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── MetFix ──────────────────────────────────────────────────────────── */
function MetfixSection() {
  const utils = trpc.useUtils();
  const q = trpc.hubAdmin.metfix.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    itemName: "",
    jobType: "Repair" as const,
    customerName: "", customerPhone: "",
    intakeDate: todayISO(),
    completedDate: "",
    amount: "",
    technician: "",
    parts: "",
    status: "Intake" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.hubAdmin.metfix.create.useMutation({
    onSuccess: () => {
      toast.success("Job logged");
      utils.hubAdmin.metfix.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hubAdmin.metfix.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hubAdmin.metfix.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hubAdmin.metfix.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hubAdmin.metfix.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="MetFix unit — hardware sales, repairs, parts orders.">
        MetFix
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Intake" value={rows.filter(r => r.status === "Intake").length} color={GOLD} />
        <MiniStat label="In Progress" value={rows.filter(r => r.status === "In Progress").length} color={BLUE} />
        <MiniStat label="Awaiting Parts" value={rows.filter(r => r.status === "Awaiting Parts").length} color={ORANGE} />
        <MiniStat label="Delivered" value={rows.filter(r => r.status === "Delivered").length} color={GREEN_OK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New MetFix Job</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Item Name"><TextInput value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} placeholder="e.g. HP Pavilion 15" /></FormField>
              <FormField label="Job Type">
                <SelectInput value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value as any })}>
                  {["Sale", "Repair", "Diagnosis", "Service", "Parts Order", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Customer Name"><TextInput value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} /></FormField>
              <FormField label="Customer Phone"><TextInput value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} /></FormField>
              <FormField label="Intake Date"><TextInput type="date" value={form.intakeDate} onChange={e => setForm({ ...form, intakeDate: e.target.value })} /></FormField>
              <FormField label="Completed Date"><TextInput type="date" value={form.completedDate} onChange={e => setForm({ ...form, completedDate: e.target.value })} /></FormField>
              <FormField label="Amount"><TextInput value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. ₦25,000" /></FormField>
              <FormField label="Technician"><TextInput value={form.technician} onChange={e => setForm({ ...form, technician: e.target.value })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Intake", "In Progress", "Awaiting Parts", "Ready", "Delivered", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Parts (one per line)"><TextArea value={form.parts} onChange={e => setForm({ ...form, parts: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.itemName.trim()) { toast.error("Item name is required"); return; }
                if (!form.intakeDate) { toast.error("Intake date is required"); return; }
                createMut.mutate({
                  itemName: form.itemName,
                  jobType: form.jobType,
                  customerName: form.customerName || null,
                  customerPhone: form.customerPhone || null,
                  intakeDate: form.intakeDate,
                  completedDate: form.completedDate || null,
                  amount: form.amount || null,
                  technician: form.technician || null,
                  parts: splitLines(form.parts),
                  status: form.status,
                  notes: form.notes || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Wrench} title="No MetFix jobs logged" hint="Track every hardware sale, repair, and parts order here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.itemName}</p>
                      <StatusPill label={r.jobType} tone="muted" />
                      <StatusPill
                        label={r.status}
                        tone={r.status === "Delivered" ? "green" :
                              r.status === "Ready" ? "blue" :
                              r.status === "In Progress" ? "purple" :
                              r.status === "Awaiting Parts" ? "orange" :
                              r.status === "Cancelled" ? "red" : "gold"}
                      />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.customerName && <>Customer: {r.customerName}</>}
                      {r.customerPhone && <> · {r.customerPhone}</>}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      Intake {fmtDate(r.intakeDate)}
                      {r.completedDate && <> · Completed {fmtDate(r.completedDate)}</>}
                      {r.amount && <> · {r.amount}</>}
                      {r.technician && <> · Tech: {r.technician}</>}
                    </p>
                    {Array.isArray(r.parts) && r.parts.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {r.parts.map((p: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: NAVY, fontWeight: 600 }}>{p}</span>
                        ))}
                      </div>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Intake", "In Progress", "Awaiting Parts", "Ready", "Delivered", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this MetFix job?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                      <Trash2 size={10} /> Remove
                    </GhostButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

