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
import PendingReportsBanner from "@/components/PendingReportsBanner";
import {
  LayoutDashboard, Users, UserCheck, Trophy, Share2, Award, CalendarDays,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle,
  Menu, X, Shield, Send, GraduationCap, Plus, Trash2, Eye,
  BadgeCheck, GraduationCap as AlumniIcon, BookOpen, Briefcase, Wrench, Edit3, Save,
} from "lucide-react";
import { toast } from "sonner";
import { readAll, insert, update, remove, type OpsItem } from "@/lib/opsStore";

const HUB_PORTAL = "hub";

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
  | "certification" | "alumni" | "lms" | "interns" | "metfix";

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
    { key: "dashboard",   icon: LayoutDashboard, label: "Overview" },
    { key: "enrollments", icon: Users,           label: "Enrollments" },
    { key: "cohorts",     icon: GraduationCap,   label: "Active Cohorts" },
    { key: "attendance",  icon: UserCheck,       label: "Attendance" },
    { key: "competition", icon: Trophy,          label: "Team Competition" },
    { key: "social",      icon: Share2,          label: "Social Verification" },
    { key: "lms",         icon: BookOpen,        label: "LMS & Assignments" },
    { key: "certification", icon: BadgeCheck,    label: "Certification" },
    { key: "alumni",      icon: AlumniIcon,      label: "Alumni" },
    { key: "interns",     icon: Briefcase,       label: "Intern Coordination" },
    { key: "metfix",      icon: Wrench,          label: "MetFix" },
    { key: "calendar",    icon: CalendarDays,    label: "Operations Calendar" },
    { key: "reports",     icon: Award,           label: "Reports" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PendingReportsBanner />
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
            {active === "dashboard"   && <OverviewSection onGoto={setActive} />}
            {active === "enrollments" && <EnrollmentsSection />}
            {active === "cohorts"     && <CohortsSection />}
            {active === "attendance"  && <AttendanceSection />}
            {active === "competition" && <CompetitionSection />}
            {active === "social"      && <SocialSection />}
            {active === "lms"           && <LmsSection />}
            {active === "certification" && <CertificationSection />}
            {active === "alumni"        && <AlumniSection />}
            {active === "interns"       && <InternCoordSection />}
            {active === "metfix"        && <MetFixSection />}
            {active === "calendar"    && <OpsCalendarSection />}
            {active === "reports"     && <ReportsSection />}
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
 * NEW HUB TABS — Certification / Alumni / LMS / Interns / MetFix
 * localStorage v1 (opsStore), no backend.
 * ═══════════════════════════════════════════════════════════════════════ */

type CertRow = OpsItem & {
  studentName: string;
  programme: string;
  cohort: string;
  lmsComplete: boolean;
  assignmentsSubmitted: boolean;
  externalCertUrl?: string;  // Google/Coursera link
  socialVerified: boolean;
  attendance: number;        // %
  finalProjectDone: boolean;
  certificateIssued: boolean;
  issueDate?: string;
};

type AlumniRow = OpsItem & {
  name: string;
  programme: string;
  cohort: string;
  graduationDate: string;
  employmentStatus: "Employed" | "Self-Employed" | "Unplaced" | "Further Study";
  currentRole?: string;
  testimonial?: string;
  discountCode?: string;
  lastCheckIn?: string;
};

type LmsRow = OpsItem & {
  studentName: string;
  programme: string;
  cohort: string;
  module: string;
  moduleCompletion: number;  // 0-100
  assignment: string;
  assignmentGrade?: number;  // 0-100
  assignmentSubmitted: boolean;
};

type InternDutyRow = OpsItem & {
  internName: string;         // Isa or Musa
  internId: string;           // HMZ-I-001 / HMZ-I-002
  attendanceOwned: boolean;
  lmsGradingOwned: boolean;
  hrHandoffLogged: boolean;
  notes?: string;
};

type MetFixRow = OpsItem & {
  item: string;
  kind: "Hardware" | "Service";
  price: number;
  monthlySales: number;
  revenueToHub: number;
};

function TinyInput({ value, onChange, placeholder, type = "text", rows }: {
  value: any; onChange: (v: any) => void; placeholder?: string;
  type?: "text" | "number" | "date" | "url" | "textarea"; rows?: number;
}) {
  if (type === "textarea") return (
    <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows ?? 2}
      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, width: "100%", resize: "vertical" }} />
  );
  return (
    <input type={type} value={value ?? ""} onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)} placeholder={placeholder}
      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, width: "100%" }} />
  );
}
function TinySelect({ value, onChange, options }: { value: any; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value ?? ""} onChange={e => onChange(e.target.value)}
      style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, width: "100%", backgroundColor: WHITE }}>
      <option value="">—</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ─── 1. Certification ─── */
function CertificationSection() {
  const [rows, setRows] = useState<CertRow[]>([]);
  const [editing, setEditing] = useState<Partial<CertRow> | null>(null);
  const refresh = () => setRows(readAll<CertRow>(HUB_PORTAL, "certifications"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.studentName) { toast.error("Student name required"); return; }
    if (editing.id) update<CertRow>(HUB_PORTAL, "certifications", editing.id, editing);
    else insert<CertRow>(HUB_PORTAL, "certifications", {
      studentName: editing.studentName!, programme: editing.programme || "",
      cohort: editing.cohort || "", lmsComplete: !!editing.lmsComplete,
      assignmentsSubmitted: !!editing.assignmentsSubmitted,
      externalCertUrl: editing.externalCertUrl || "",
      socialVerified: !!editing.socialVerified,
      attendance: editing.attendance ?? 0,
      finalProjectDone: !!editing.finalProjectDone,
      certificateIssued: !!editing.certificateIssued,
      issueDate: editing.issueDate,
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  const issue = (r: CertRow) => {
    const eligible = r.lmsComplete && r.assignmentsSubmitted && r.socialVerified && r.attendance >= 80 && r.finalProjectDone;
    if (!eligible) { toast.error("Student does not meet all cert requirements"); return; }
    update<CertRow>(HUB_PORTAL, "certifications", r.id, { certificateIssued: true, issueDate: new Date().toISOString().slice(0, 10) });
    refresh(); toast.success(`HAMZURY certificate issued to ${r.studentName}`);
  };

  return (
    <div>
      <SectionTitle sub="Per-student cert checklist. Must pass 6 gates before HAMZURY certificate issues.">Certification</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.filter(r => r.certificateIssued).length} issued · {rows.length} total</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add Student
          </button>
        </div>
        {rows.length === 0 ? <EmptyState icon={BadgeCheck} title="No certification candidates yet." /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map(r => {
              const gates = [
                { k: "LMS 100%", v: r.lmsComplete },
                { k: "Assignments", v: r.assignmentsSubmitted },
                { k: "External cert", v: !!r.externalCertUrl },
                { k: "Social", v: r.socialVerified },
                { k: `Attendance ${r.attendance}%`, v: r.attendance >= 80 },
                { k: "Final project", v: r.finalProjectDone },
              ];
              const passed = gates.filter(g => g.v).length;
              return (
                <div key={r.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${DARK}08` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{r.studentName}</p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{r.programme} · {r.cohort}</p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!r.certificateIssued && <button onClick={() => issue(r)} style={{ padding: "6px 12px", borderRadius: 999, border: "none", backgroundColor: GREEN_OK, color: WHITE, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Issue Cert</button>}
                      {r.certificateIssued && <span style={{ padding: "6px 12px", borderRadius: 999, backgroundColor: `${GREEN_OK}15`, color: GREEN_OK, fontSize: 11, fontWeight: 700 }}>✓ Issued {r.issueDate}</span>}
                      <button onClick={() => setEditing(r)} style={{ border: "none", background: "transparent", color: BLUE, cursor: "pointer" }}><Edit3 size={13} /></button>
                      <button onClick={() => { remove(HUB_PORTAL, "certifications", r.id); refresh(); }} style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 6 }}>
                    {gates.map(g => (
                      <div key={g.k} style={{ padding: "6px 10px", borderRadius: 8, backgroundColor: g.v ? `${GREEN_OK}12` : `${DARK}06`, display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={12} color={g.v ? GREEN_OK : MUTED} />
                        <span style={{ fontSize: 11, color: DARK }}>{g.k}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 8 }}>{passed}/6 gates passed</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} Certification Track</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Student Name</span><TinyInput value={editing.studentName} onChange={v => setEditing({ ...editing, studentName: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Programme</span><TinyInput value={editing.programme} onChange={v => setEditing({ ...editing, programme: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cohort</span><TinyInput value={editing.cohort} onChange={v => setEditing({ ...editing, cohort: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Attendance %</span><TinyInput value={editing.attendance} onChange={v => setEditing({ ...editing, attendance: v })} type="number" /></label>
              <label style={{ gridColumn: "1/-1" }}><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>External Cert URL (Google/Coursera)</span><TinyInput value={editing.externalCertUrl} onChange={v => setEditing({ ...editing, externalCertUrl: v })} type="url" placeholder="https://..." /></label>
              {[
                { k: "lmsComplete", l: "LMS 100% complete" },
                { k: "assignmentsSubmitted", l: "All assignments submitted" },
                { k: "socialVerified", l: "Social posting verified" },
                { k: "finalProjectDone", l: "Final project done" },
              ].map(g => (
                <label key={g.k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={!!(editing as any)[g.k]} onChange={e => setEditing({ ...editing, [g.k]: e.target.checked })} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: DARK }}>{g.l}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 2. Alumni ─── */
function AlumniSection() {
  const [rows, setRows] = useState<AlumniRow[]>([]);
  const [editing, setEditing] = useState<Partial<AlumniRow> | null>(null);
  const refresh = () => setRows(readAll<AlumniRow>(HUB_PORTAL, "alumni"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.name) { toast.error("Name required"); return; }
    if (editing.id) update<AlumniRow>(HUB_PORTAL, "alumni", editing.id, editing);
    else insert<AlumniRow>(HUB_PORTAL, "alumni", {
      name: editing.name!, programme: editing.programme || "",
      cohort: editing.cohort || "", graduationDate: editing.graduationDate || "",
      employmentStatus: (editing.employmentStatus as any) || "Unplaced",
      currentRole: editing.currentRole, testimonial: editing.testimonial,
      discountCode: editing.discountCode || `ALUM20-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      lastCheckIn: editing.lastCheckIn,
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  const logCheckIn = (id: string) => {
    update<AlumniRow>(HUB_PORTAL, "alumni", id, { lastCheckIn: new Date().toISOString().slice(0, 10) });
    refresh(); toast.success("Check-in logged");
  };

  const employed = rows.filter(r => r.employmentStatus === "Employed" || r.employmentStatus === "Self-Employed").length;

  return (
    <div>
      <SectionTitle sub="3-month check-ins. Employment tracking. Testimonials. 20% alumni discount.">Alumni</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          <div style={{ padding: 14, borderRadius: 10, backgroundColor: `${GREEN_OK}10` }}><p style={{ fontSize: 20, fontWeight: 700, color: GREEN_OK }}>{rows.length}</p><p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>Alumni</p></div>
          <div style={{ padding: 14, borderRadius: 10, backgroundColor: `${BLUE}10` }}><p style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>{employed}</p><p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>Employed</p></div>
          <div style={{ padding: 14, borderRadius: 10, backgroundColor: `${GOLD}10` }}><p style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>{rows.filter(r => r.testimonial).length}</p><p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>Testimonials</p></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} alumni tracked</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add Alumnus
          </button>
        </div>
        {rows.length === 0 ? <EmptyState icon={AlumniIcon} title="No alumni yet" hint="First cohort completes soon." /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map(r => (
              <div key={r.id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${DARK}08`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{r.programme} · {r.cohort} · Graduated {r.graduationDate}</p>
                  {r.currentRole && <p style={{ fontSize: 12, color: DARK, marginTop: 4 }}>💼 {r.currentRole}</p>}
                  {r.testimonial && <p style={{ fontSize: 12, color: DARK, fontStyle: "italic", marginTop: 4, lineHeight: 1.5 }}>"{r.testimonial}"</p>}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, backgroundColor: r.employmentStatus === "Employed" || r.employmentStatus === "Self-Employed" ? `${GREEN_OK}15` : `${ORANGE}15`, color: r.employmentStatus === "Employed" || r.employmentStatus === "Self-Employed" ? GREEN_OK : ORANGE }}>{r.employmentStatus}</span>
                    {r.discountCode && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, backgroundColor: `${GOLD}15`, color: GOLD, fontFamily: "monospace" }}>{r.discountCode}</span>}
                    {r.lastCheckIn && <span style={{ fontSize: 10, color: MUTED }}>Last check-in: {r.lastCheckIn}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <button onClick={() => logCheckIn(r.id)} style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${BLUE}30`, backgroundColor: WHITE, color: BLUE, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Log check-in</button>
                  <button onClick={() => setEditing(r)} style={{ border: "none", background: "transparent", color: BLUE, cursor: "pointer" }}><Edit3 size={13} /></button>
                  <button onClick={() => { remove(HUB_PORTAL, "alumni", r.id); refresh(); }} style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} Alumnus</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Name</span><TinyInput value={editing.name} onChange={v => setEditing({ ...editing, name: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Programme</span><TinyInput value={editing.programme} onChange={v => setEditing({ ...editing, programme: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cohort</span><TinyInput value={editing.cohort} onChange={v => setEditing({ ...editing, cohort: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Graduation</span><TinyInput value={editing.graduationDate} onChange={v => setEditing({ ...editing, graduationDate: v })} type="date" /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Employment</span><TinySelect value={editing.employmentStatus} onChange={v => setEditing({ ...editing, employmentStatus: v as any })} options={["Employed", "Self-Employed", "Unplaced", "Further Study"]} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Current Role</span><TinyInput value={editing.currentRole} onChange={v => setEditing({ ...editing, currentRole: v })} /></label>
              <label style={{ gridColumn: "1/-1" }}><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Testimonial</span><TinyInput value={editing.testimonial} onChange={v => setEditing({ ...editing, testimonial: v })} type="textarea" /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Discount Code</span><TinyInput value={editing.discountCode} onChange={v => setEditing({ ...editing, discountCode: v })} /></label>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 3. LMS & Assignments ─── */
function LmsSection() {
  const [rows, setRows] = useState<LmsRow[]>([]);
  const [editing, setEditing] = useState<Partial<LmsRow> | null>(null);
  const refresh = () => setRows(readAll<LmsRow>(HUB_PORTAL, "lmsProgress"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.studentName) { toast.error("Student required"); return; }
    if (editing.id) update<LmsRow>(HUB_PORTAL, "lmsProgress", editing.id, editing);
    else insert<LmsRow>(HUB_PORTAL, "lmsProgress", {
      studentName: editing.studentName!, programme: editing.programme || "",
      cohort: editing.cohort || "", module: editing.module || "",
      moduleCompletion: editing.moduleCompletion ?? 0,
      assignment: editing.assignment || "",
      assignmentGrade: editing.assignmentGrade,
      assignmentSubmitted: !!editing.assignmentSubmitted,
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  return (
    <div>
      <SectionTitle sub="Module completion + assignment grading. Required to gate certification.">LMS & Assignments</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} progress records</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Log Progress
          </button>
        </div>
        {rows.length === 0 ? <EmptyState icon={BookOpen} title="No LMS data yet" /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ backgroundColor: `${GOLD}08` }}>
                {["Student", "Programme", "Module", "Completion", "Assignment", "Grade", "Submitted", ""].map(c => <th key={c} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: DARK }}>{c}</th>)}
              </tr></thead>
              <tbody>{rows.map(r => (
                <tr key={r.id} style={{ borderTop: `1px solid ${DARK}06` }}>
                  <td style={{ padding: "10px 12px", color: DARK }}>{r.studentName}</td>
                  <td style={{ padding: "10px 12px", color: DARK }}>{r.programme}</td>
                  <td style={{ padding: "10px 12px", color: DARK }}>{r.module}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, maxWidth: 80, height: 6, backgroundColor: `${DARK}10`, borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${r.moduleCompletion}%`, height: "100%", backgroundColor: r.moduleCompletion >= 100 ? GREEN_OK : NAVY, borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: DARK, minWidth: 40 }}>{r.moduleCompletion}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", color: DARK }}>{r.assignment}</td>
                  <td style={{ padding: "10px 12px", color: DARK }}>{r.assignmentGrade != null ? `${r.assignmentGrade}/100` : "—"}</td>
                  <td style={{ padding: "10px 12px" }}>{r.assignmentSubmitted ? <CheckCircle2 size={14} color={GREEN_OK} /> : <Clock size={14} color={MUTED} />}</td>
                  <td style={{ padding: "6px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => setEditing(r)} style={{ border: "none", background: "transparent", color: BLUE, cursor: "pointer", marginRight: 6 }}><Edit3 size={13} /></button>
                    <button onClick={() => { remove(HUB_PORTAL, "lmsProgress", r.id); refresh(); }} style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(560px, 100%)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Log"} LMS Progress</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Student</span><TinyInput value={editing.studentName} onChange={v => setEditing({ ...editing, studentName: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Programme</span><TinyInput value={editing.programme} onChange={v => setEditing({ ...editing, programme: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Cohort</span><TinyInput value={editing.cohort} onChange={v => setEditing({ ...editing, cohort: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Module</span><TinyInput value={editing.module} onChange={v => setEditing({ ...editing, module: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Completion %</span><TinyInput value={editing.moduleCompletion} onChange={v => setEditing({ ...editing, moduleCompletion: v })} type="number" /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Assignment</span><TinyInput value={editing.assignment} onChange={v => setEditing({ ...editing, assignment: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Grade (0-100)</span><TinyInput value={editing.assignmentGrade} onChange={v => setEditing({ ...editing, assignmentGrade: v })} type="number" /></label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "end" }}>
                <input type="checkbox" checked={!!editing.assignmentSubmitted} onChange={e => setEditing({ ...editing, assignmentSubmitted: e.target.checked })} style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: DARK }}>Submitted</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 4. Intern Coordination (Isa + Musa duties) ─── */
function InternCoordSection() {
  const [rows, setRows] = useState<InternDutyRow[]>([]);
  const refresh = () => setRows(readAll<InternDutyRow>(HUB_PORTAL, "internDuties"));
  useEffect(() => { refresh(); }, []);

  const seed = () => {
    if (rows.length > 0) return;
    insert<InternDutyRow>(HUB_PORTAL, "internDuties", { internName: "Isa", internId: "HMZ-I-001", attendanceOwned: false, lmsGradingOwned: false, hrHandoffLogged: false });
    insert<InternDutyRow>(HUB_PORTAL, "internDuties", { internName: "Musa", internId: "HMZ-I-002", attendanceOwned: false, lmsGradingOwned: false, hrHandoffLogged: false });
    refresh();
  };
  useEffect(() => { if (rows.length === 0) seed(); /* eslint-disable-next-line */ }, [rows.length]);

  const toggle = (id: string, field: keyof InternDutyRow) => {
    const row = rows.find(r => r.id === id); if (!row) return;
    update<InternDutyRow>(HUB_PORTAL, "internDuties", id, { [field]: !(row as any)[field] } as any);
    refresh();
  };

  return (
    <div>
      <SectionTitle sub="Isa (HMZ-I-001) + Musa (HMZ-I-002) duty tracker. HR handoffs to Khadija.">Intern Coordination</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        {rows.length === 0 ? <EmptyState icon={Briefcase} title="Seeding interns..." /> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {rows.map(r => (
              <div key={r.id} style={{ padding: 16, borderRadius: 12, border: `1px solid ${DARK}08` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{r.internName}</p>
                    <p style={{ fontSize: 11, color: MUTED, fontFamily: "monospace", marginTop: 2 }}>{r.internId}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { k: "attendanceOwned", l: "Attendance Tracking Owner" },
                    { k: "lmsGradingOwned", l: "LMS Grading Owner" },
                    { k: "hrHandoffLogged", l: "HR Handoff Logged (→ Khadija)" },
                  ].map(g => (
                    <label key={g.k} onClick={() => toggle(r.id, g.k as any)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, backgroundColor: (r as any)[g.k] ? `${GREEN_OK}10` : `${DARK}04`, cursor: "pointer" }}>
                      <CheckCircle2 size={14} color={(r as any)[g.k] ? GREEN_OK : MUTED} />
                      <span style={{ fontSize: 12, color: DARK }}>{g.l}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─── 5. MetFix (hardware + service sales feeding HUB P&L) ─── */
function MetFixSection() {
  const [rows, setRows] = useState<MetFixRow[]>([]);
  const [editing, setEditing] = useState<Partial<MetFixRow> | null>(null);
  const refresh = () => setRows(readAll<MetFixRow>(HUB_PORTAL, "metfix"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.item) { toast.error("Item required"); return; }
    if (editing.id) update<MetFixRow>(HUB_PORTAL, "metfix", editing.id, editing);
    else insert<MetFixRow>(HUB_PORTAL, "metfix", {
      item: editing.item!, kind: (editing.kind as any) || "Hardware",
      price: editing.price ?? 0, monthlySales: editing.monthlySales ?? 0,
      revenueToHub: editing.revenueToHub ?? 0,
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  const totalRevenue = rows.reduce((a, r) => a + (r.revenueToHub || 0), 0);

  return (
    <div>
      <SectionTitle sub="Abdulmalik + Abubakar. Hardware catalog + service menu. Sales feed HUB P&L.">MetFix</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          <div style={{ padding: 14, borderRadius: 10, backgroundColor: `${NAVY}10` }}><p style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>{rows.length}</p><p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>Items</p></div>
          <div style={{ padding: 14, borderRadius: 10, backgroundColor: `${GREEN_OK}10` }}><p style={{ fontSize: 20, fontWeight: 700, color: GREEN_OK }}>₦{totalRevenue.toLocaleString()}</p><p style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>Revenue to HUB</p></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>Catalog + service menu</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add Item
          </button>
        </div>
        {rows.length === 0 ? <EmptyState icon={Wrench} title="No MetFix items yet" /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ backgroundColor: `${GOLD}08` }}>
              {["Item", "Kind", "Price", "Monthly Sales", "Revenue to HUB", ""].map(c => <th key={c} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: DARK }}>{c}</th>)}
            </tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.id} style={{ borderTop: `1px solid ${DARK}06` }}>
                <td style={{ padding: "10px 12px", color: DARK, fontWeight: 600 }}>{r.item}</td>
                <td style={{ padding: "10px 12px" }}><span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, backgroundColor: r.kind === "Hardware" ? `${BLUE}15` : `${PURPLE}15`, color: r.kind === "Hardware" ? BLUE : PURPLE }}>{r.kind}</span></td>
                <td style={{ padding: "10px 12px", color: DARK }}>₦{(r.price || 0).toLocaleString()}</td>
                <td style={{ padding: "10px 12px", color: DARK }}>{r.monthlySales}</td>
                <td style={{ padding: "10px 12px", color: GREEN_OK, fontWeight: 600 }}>₦{(r.revenueToHub || 0).toLocaleString()}</td>
                <td style={{ padding: "6px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <button onClick={() => setEditing(r)} style={{ border: "none", background: "transparent", color: BLUE, cursor: "pointer", marginRight: 6 }}><Edit3 size={13} /></button>
                  <button onClick={() => { remove(HUB_PORTAL, "metfix", r.id); refresh(); }} style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(480px, 100%)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} MetFix Item</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ gridColumn: "1/-1" }}><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Item</span><TinyInput value={editing.item} onChange={v => setEditing({ ...editing, item: v })} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Kind</span><TinySelect value={editing.kind} onChange={v => setEditing({ ...editing, kind: v as any })} options={["Hardware", "Service"]} /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Price ₦</span><TinyInput value={editing.price} onChange={v => setEditing({ ...editing, price: v })} type="number" /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Monthly Sales</span><TinyInput value={editing.monthlySales} onChange={v => setEditing({ ...editing, monthlySales: v })} type="number" /></label>
              <label><span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Revenue to HUB ₦</span><TinyInput value={editing.revenueToHub} onChange={v => setEditing({ ...editing, revenueToHub: v })} type="number" /></label>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: NAVY, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
