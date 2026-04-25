import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import PendingReportsBanner from "@/components/PendingReportsBanner";
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, AlertCircle, ClipboardList,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock,
  Menu, X, Shield, Send, UserCheck, UserX,
  GraduationCap, Briefcase, UserPlus, BookOpen, Star, LogOut as ExitIcon,
  Plus, Trash2, Save, Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { readAll, insert, update, remove, type OpsItem } from "@/lib/opsStore";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY HR PORTAL — Khadija (HR Manager) + senior staff
 * ══════════════════════════════════════════════════════════════════════ */

const BG = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";
const GREEN = "#1B4D3E";
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";

type Section =
  | "dashboard"
  | "roster"
  | "leave"
  | "discipline"
  | "attendance"
  | "reports"
  | "interns"
  | "recruitment"
  | "onboarding"
  | "internCoord"
  | "performance"
  | "exits";

/* ══════════════════════════════════════════════════════════════════════
 * LocalStorage collection types (opsStore)
 * ══════════════════════════════════════════════════════════════════════ */
type InternRow = OpsItem & {
  internId: string;           // HMZ-I-XXX
  name: string;
  hubProgram: string;
  cohort: string;
  startDate: string;
  endDate: string;
  stipend: number;            // NGN
  placementStatus: "In Training" | "Ready" | "Placed" | "Converted";
  targetDivision: string;
  performanceRating: number;  // 1..5
};

type RequisitionRow = OpsItem & {
  reqId: string;              // REQ-S-XXX or REQ-I-XXX
  type: "Staff" | "Intern";
  position: string;
  division: string;
  postedDate: string;
  applications: number;
  interviewed: number;
  offersMade: number;
  status: "Recruiting" | "Screening" | "Offer Extended" | "Filled" | "Cancelled";
  targetStartDate: string;
};

type OnboardingRow = OpsItem & {
  staffId: string;
  staffName?: string;
  orientationDone: boolean;
  documentationComplete: boolean;
  assignedBuddy: string;
  week1CheckIn: boolean;
  month1CheckIn: boolean;
  month3CheckIn: boolean;
  notes?: string;
};

type InternCoordRow = OpsItem & {
  internId: string;
  instructor: string;
  learningProgress: number;   // 0..100
  technicalSkills: number;    // 1..5
  softSkills: number;         // 1..5
  attendance: number;         // 0..100
  placementReady: boolean;
  recommendedDivision: string;
};

type PerformanceRow = OpsItem & {
  staffId: string;
  staffName?: string;
  reviewPeriod: string;       // e.g. "Q1 2026"
  goalsSet: string;
  goalsAchieved: string;
  rating: number;             // 1..5
  strengths: string;
  improvements: string;
  nextReviewDate: string;
};

type ExitRow = OpsItem & {
  staffId: string;
  staffName?: string;
  exitDate: string;
  exitType: "Resignation" | "Program Complete" | "Conversion" | "Termination";
  noticePeriod: string;
  exitInterviewDone: boolean;
  finalPayStatus: "Pending" | "Paid";
  notes?: string;
};

type StaffExtras = {
  emergencyContact?: string;
  emergencyPhone?: string;
  performanceRating?: number;
};

const HR_PORTAL = "hr";
const STAFF_EXTRAS_KEY = "hamzury.v1.hr.staffExtras";

function readStaffExtras(): Record<string, StaffExtras> {
  try {
    const raw = localStorage.getItem(STAFF_EXTRAS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch { return {}; }
}
function writeStaffExtras(all: Record<string, StaffExtras>) {
  try { localStorage.setItem(STAFF_EXTRAS_KEY, JSON.stringify(all)); } catch { /* ignore */ }
}
function updateStaffExtras(staffId: string, patch: Partial<StaffExtras>) {
  const all = readStaffExtras();
  all[staffId] = { ...(all[staffId] || {}), ...patch };
  writeStaffExtras(all);
}

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
function StatusPill({ label, tone }: { label: string; tone: "green" | "gold" | "red" | "blue" | "muted" | "orange" }) {
  const map = {
    green:  { bg: "#22C55E15", fg: "#22C55E" },
    gold:   { bg: `${GOLD}20`,  fg: GOLD },
    red:    { bg: `${RED}15`,   fg: RED },
    blue:   { bg: `${BLUE}15`,  fg: BLUE },
    muted:  { bg: "#9CA3AF25",  fg: MUTED },
    orange: { bg: `${ORANGE}15`, fg: ORANGE },
  }[tone];
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
      backgroundColor: map.bg, color: map.fg, textTransform: "uppercase", letterSpacing: "0.04em",
    }}>{label}</span>
  );
}
function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{
      backgroundColor: WHITE, borderRadius: 12, padding: "14px 14px",
      border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      minWidth: 0, overflow: "hidden",
    }}>
      <p style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.15 }}>{value}</p>
      <p style={{ fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function HRPortal() {
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
    { key: "roster",      icon: Users,           label: "Staff Roster" },
    { key: "interns",     icon: GraduationCap,   label: "Intern Database" },
    { key: "recruitment", icon: Briefcase,       label: "Recruitment Pipeline" },
    { key: "onboarding",  icon: UserPlus,        label: "Onboarding Tracker" },
    { key: "internCoord", icon: BookOpen,        label: "Intern-HUB Coordination" },
    { key: "performance", icon: Star,            label: "Performance Tracking" },
    { key: "leave",       icon: CalendarIcon,    label: "Leave Requests" },
    { key: "discipline",  icon: AlertCircle,     label: "Discipline" },
    { key: "attendance",  icon: UserCheck,       label: "Attendance" },
    { key: "exits",       icon: ExitIcon,        label: "Exit Management" },
    { key: "reports",     icon: ClipboardList,   label: "Reports" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PendingReportsBanner />
      <PageMeta title="HR Portal — HAMZURY" description="Human resources — staff roster, leave, discipline, attendance, reports." />

      {isMobile && mobileNavOpen && (
        <div onClick={() => setMobileNavOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      )}

      <aside style={{
        width: 232, backgroundColor: GREEN, display: "flex", flexDirection: "column",
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
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>HR Portal</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>People Operations</div>
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
                  backgroundColor: `${GREEN}08`, color: GREEN,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}><Menu size={18} /></button>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {NAV.find(n => n.key === active)?.label}
              </p>
              <p style={{ fontSize: 13, color: DARK, fontWeight: 500, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name} · HR
              </p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${GOLD}15`, color: GOLD, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> PEOPLE
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {active === "dashboard"   && <OverviewSection onGoto={setActive} />}
            {active === "roster"      && <RosterSection />}
            {active === "interns"     && <InternsSection />}
            {active === "recruitment" && <RecruitmentSection />}
            {active === "onboarding"  && <OnboardingSection />}
            {active === "internCoord" && <InternCoordSection />}
            {active === "performance" && <PerformanceSection />}
            {active === "leave"       && <LeaveSection />}
            {active === "discipline"  && <DisciplineSection />}
            {active === "attendance"  && <AttendanceSection />}
            {active === "exits"       && <ExitsSection />}
            {active === "reports"     && <ReportsSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function OverviewSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const staffQ = trpc.staff.listInternal.useQuery(undefined, { retry: false });
  const leaveQ = trpc.leave.list.useQuery({}, { retry: false });
  const disciplineQ = trpc.discipline.list.useQuery({}, { retry: false });

  const staff = ((staffQ.data || []) as any[]);
  const leaves = ((leaveQ.data || []) as any[]);
  const disciplines = ((disciplineQ.data || []) as any[]);

  const active = staff.filter(s => s.status === "Active").length;
  const pendingLeave = leaves.filter(l => l.status === "pending").length;
  const onLeaveNow = leaves.filter(l => {
    if (l.status !== "approved") return false;
    try {
      const now = new Date();
      return new Date(l.startDate) <= now && new Date(l.endDate) >= now;
    } catch { return false; }
  }).length;
  const openDiscipline = disciplines.filter(d => d.status !== "resolved").length;

  const kpis = [
    { label: "Total Staff",       value: staff.length,      icon: Users,       color: GREEN,  section: "roster" as Section },
    { label: "Active",            value: active,            icon: UserCheck,   color: "#22C55E", section: "roster" as Section },
    { label: "On Leave Now",      value: onLeaveNow,        icon: UserX,       color: BLUE,   section: "leave" as Section },
    { label: "Pending Leave",     value: pendingLeave,      icon: Clock,       color: GOLD,   section: "leave" as Section },
    { label: "Open Discipline",   value: openDiscipline,    icon: AlertCircle, color: RED,    section: "discipline" as Section },
  ];

  return (
    <div>
      <SectionTitle sub="People operations at a glance.">HR Overview</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {kpis.map(k => (
          <button key={k.label} onClick={() => onGoto(k.section)}
            style={{
              backgroundColor: WHITE, borderRadius: 14, padding: "14px 12px",
              border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              textAlign: "left", cursor: "pointer",
            }}>
            <k.icon size={14} style={{ color: k.color, marginBottom: 8 }} />
            <p style={{ fontSize: 20, fontWeight: 700, color: DARK, lineHeight: 1.15 }}>{k.value}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.label}</p>
          </button>
        ))}
      </div>

      {pendingLeave > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Awaiting Your Review
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {leaves.filter(l => l.status === "pending").slice(0, 5).map((l: any) => (
              <div key={l.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{l.staffName}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)} · {l.reason?.slice(0, 60) || "(no reason)"}
                  </p>
                </div>
                <button onClick={() => onGoto("leave")}
                  style={{
                    padding: "5px 10px", borderRadius: 8,
                    backgroundColor: `${GREEN}15`, color: GREEN, border: "none",
                    fontSize: 10, fontWeight: 600, cursor: "pointer",
                  }}>Review</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function RosterSection() {
  const isMobile = useIsMobile();
  const q = trpc.staff.listInternal.useQuery(undefined, { retry: false });
  const [search, setSearch] = useState("");

  const staff = ((q.data || []) as any[]).filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.role?.toLowerCase().includes(search.toLowerCase()) ||
    s.dept?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionTitle sub="Every HAMZURY staff member. Source of truth.">
        Staff Roster
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <input type="search" placeholder="Search name, email, role, department…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
            backgroundColor: WHITE, outline: "none",
          }} />
      </Card>

      {staff.length === 0 ? (
        <Card><EmptyState icon={Users} title="No staff match." /></Card>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {staff.map((s: any) => (
            <Card key={s.staffId} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{s.email}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 10, color: MUTED, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace" }}>{s.role}</span>
                    <span>·</span>
                    <span>{s.dept}</span>
                    <span>·</span>
                    <span>Last login: {s.lastLogin || "—"}</span>
                  </div>
                </div>
                <StatusPill label={s.status} tone={s.status === "Active" ? "green" : "muted"} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <th style={{ padding: "12px 16px" }}>Name</th>
                  <th style={{ padding: "12px 16px" }}>Role</th>
                  <th style={{ padding: "12px 16px" }}>Dept</th>
                  <th style={{ padding: "12px 16px" }}>Last Login</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s: any) => (
                  <tr key={s.staffId} style={{ borderTop: `1px solid ${DARK}06` }}>
                    <td style={{ padding: "10px 16px", fontWeight: 500, color: DARK }}>
                      {s.name}
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.email}</div>
                    </td>
                    <td style={{ padding: "10px 16px", color: MUTED, fontFamily: "monospace", fontSize: 11 }}>{s.role}</td>
                    <td style={{ padding: "10px 16px", color: MUTED }}>{s.dept}</td>
                    <td style={{ padding: "10px 16px", color: MUTED }}>{s.lastLogin || "—"}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <StatusPill label={s.status} tone={s.status === "Active" ? "green" : "muted"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function LeaveSection() {
  const utils = trpc.useUtils();
  const q = trpc.leave.list.useQuery({}, { retry: false });
  const rows = ((q.data || []) as any[]);

  const pending = rows.filter(l => l.status === "pending");
  const approved = rows.filter(l => l.status === "approved");
  const rejected = rows.filter(l => l.status === "rejected");

  const reviewMut = trpc.leave.review.useMutation({
    onSuccess: () => { toast.success("Leave reviewed"); utils.leave.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Approve, reject, and see who is on leave when.">
        Leave Requests
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Pending"  value={pending.length}  color={GOLD} />
        <MiniStat label="Approved" value={approved.length} color={GREEN} />
        <MiniStat label="Rejected" value={rejected.length} color={RED} />
      </div>

      {pending.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Awaiting Review
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.map((l: any) => (
              <div key={l.id} style={{
                padding: "12px 14px", backgroundColor: `${GOLD}08`,
                borderRadius: 10, border: `1px solid ${GOLD}30`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{l.staffName}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{l.staffEmail}</p>
                    <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                      <strong>Dates:</strong> {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                    </p>
                    <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}>
                      <strong>Reason:</strong> {l.reason || "—"}
                    </p>
                    {l.replacementName && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                        Replacement: {l.replacementName}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => reviewMut.mutate({ id: l.id, status: "approved" })}
                      disabled={reviewMut.isPending}
                      style={{
                        padding: "7px 14px", borderRadius: 8,
                        backgroundColor: "#22C55E15", color: "#22C55E",
                        border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>Approve</button>
                    <button
                      onClick={() => reviewMut.mutate({ id: l.id, status: "rejected" })}
                      disabled={reviewMut.isPending}
                      style={{
                        padding: "7px 14px", borderRadius: 8,
                        backgroundColor: `${RED}10`, color: RED,
                        border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          History
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={CalendarIcon} title="No leave history yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 40).map((l: any) => (
              <div key={l.id} style={{
                padding: "8px 10px", backgroundColor: BG, borderRadius: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: DARK }}>{l.staffName}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                  </p>
                </div>
                <StatusPill label={l.status} tone={l.status === "approved" ? "green" : l.status === "rejected" ? "red" : "gold"} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function DisciplineSection() {
  const utils = trpc.useUtils();
  const q = trpc.discipline.list.useQuery({}, { retry: false });
  const rows = ((q.data || []) as any[]);

  const open = rows.filter(d => d.status !== "resolved");
  const resolved = rows.filter(d => d.status === "resolved");

  const resolveMut = trpc.discipline.resolve.useMutation({
    onSuccess: () => { toast.success("Resolved"); utils.discipline.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Queries and suspensions. Every record is audit-logged.">
        Discipline Records
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Open"     value={open.length}     color={RED} />
        <MiniStat label="Resolved" value={resolved.length} color={GREEN} />
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No discipline records — clean house." hint="CEO can issue discipline from the CEO Portal." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.slice(0, 40).map((d: any) => (
              <div key={d.id} style={{
                padding: "12px 14px",
                backgroundColor: d.status === "resolved" ? BG : `${RED}05`,
                borderRadius: 10, border: `1px solid ${d.status === "resolved" ? `${DARK}06` : `${RED}20`}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{d.staffName}</p>
                      <StatusPill label={d.type} tone={d.type === "suspension" ? "red" : "orange"} />
                      <StatusPill label={d.status} tone={d.status === "resolved" ? "green" : "red"} />
                    </div>
                    <p style={{ fontSize: 12, color: DARK, marginTop: 6 }}>{d.reason}</p>
                    {d.description && <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{d.description}</p>}
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>
                      By {d.issuedBy} · {fmtDate(d.createdAt)}
                      {d.resolvedAt && <> · Resolved {fmtDate(d.resolvedAt)}</>}
                    </p>
                    {d.resolvedNotes && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>
                        <strong>Resolution:</strong> {d.resolvedNotes}
                      </p>
                    )}
                  </div>
                  {d.status !== "resolved" && (
                    <button
                      onClick={() => {
                        const note = prompt(`Resolution note for ${d.staffName}?`);
                        if (!note) return;
                        resolveMut.mutate({ id: d.id, resolvedNotes: note });
                      }}
                      disabled={resolveMut.isPending}
                      style={{
                        padding: "7px 12px", borderRadius: 8,
                        backgroundColor: `${GREEN}15`, color: GREEN, border: "none",
                        fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                      }}>Resolve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function AttendanceSection() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const q = trpc.attendance.byDate.useQuery({ date }, { retry: false });
  const rows = ((q.data || []) as any[]);

  return (
    <div>
      <SectionTitle sub="Daily check-ins. Pick a date.">Attendance</SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Date
          </span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{
              padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}15`,
              fontSize: 13, color: DARK, backgroundColor: WHITE, outline: "none",
              maxWidth: 260,
            }} />
        </label>
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={UserCheck} title="No check-ins for this date" hint="Staff check in from their own portal." />
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
                <StatusPill label={r.status} tone={r.status === "present" ? "green" : "muted"} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const staffQ = trpc.staff.listInternal.useQuery(undefined, { retry: false });
  const leaveQ = trpc.leave.list.useQuery({}, { retry: false });
  const disciplineQ = trpc.discipline.list.useQuery({}, { retry: false });

  const staff = ((staffQ.data || []) as any[]);
  const leaves = ((leaveQ.data || []) as any[]);
  const disciplines = ((disciplineQ.data || []) as any[]);

  const active = staff.filter(s => s.status === "Active").length;
  const pendingLeave = leaves.filter(l => l.status === "pending").length;
  const onLeaveNow = leaves.filter(l => {
    if (l.status !== "approved") return false;
    try {
      const now = new Date();
      return new Date(l.startDate) <= now && new Date(l.endDate) >= now;
    } catch { return false; }
  }).length;
  const openDiscipline = disciplines.filter(d => d.status !== "resolved").length;

  // Departments breakdown
  const deptCounts: Record<string, number> = {};
  staff.forEach(s => { const d = s.dept || "—"; deptCounts[d] = (deptCounts[d] || 0) + 1; });

  const report = `HAMZURY · HR Summary
${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}

HEADCOUNT
 · Total staff:        ${staff.length}
 · Active:             ${active}
 · On leave now:       ${onLeaveNow}

BY DEPARTMENT
${Object.entries(deptCounts).map(([d, n]) => ` · ${d.padEnd(18)} ${n}`).join("\n")}

PENDING ACTIONS
 · Leave requests:     ${pendingLeave}
 · Open discipline:    ${openDiscipline}

Built to Last.`;

  const copy = () => {
    navigator.clipboard.writeText(report).then(
      () => toast.success("Report copied to clipboard"),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  return (
    <div>
      <SectionTitle sub="Ready-to-paste summary for weekly CEO check-in.">Reports</SectionTitle>

      <Card>
        <pre style={{
          fontFamily: "ui-monospace, 'SF Mono', monospace",
          fontSize: 11, color: DARK, backgroundColor: BG,
          padding: "14px 16px", borderRadius: 10,
          border: `1px solid ${DARK}06`,
          whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0,
        }}>{report}</pre>
        <button onClick={copy}
          style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 10,
            backgroundColor: GREEN, color: WHITE, border: "none",
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
 * NEW TABS FROM HR_MASTER_DASHBOARD.XLSX (6 sections)
 * Each uses opsStore (localStorage v1) — no tRPC/DB writes.
 * ═══════════════════════════════════════════════════════════════════════ */

function TinyLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{children}</span>;
}

function DataTable({
  columns, rows, empty, onEdit, onDelete,
}: {
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  rows: any[];
  empty: string;
  onEdit?: (row: any) => void;
  onDelete?: (id: string) => void;
}) {
  if (rows.length === 0) return <EmptyState icon={ClipboardList} title={empty} />;
  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${DARK}08` }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ backgroundColor: `${GOLD}08` }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: "10px 12px", textAlign: "left", color: DARK, fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ padding: "10px 12px", width: 80 }}></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderTop: `1px solid ${DARK}06` }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: "10px 12px", color: DARK }}>
                  {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td style={{ padding: "6px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                  {onEdit && (
                    <button onClick={() => onEdit(r)} style={{ border: "none", background: "transparent", color: BLUE, cursor: "pointer", marginRight: 8 }}>
                      <Edit3 size={13} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(r.id)} style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormField({
  label, value, onChange, type = "text", options,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  type?: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  options?: string[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <TinyLabel>{label}</TinyLabel>
      {type === "select" ? (
        <select value={value ?? ""} onChange={e => onChange(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, backgroundColor: WHITE }}>
          <option value="">—</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={2}
          style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, resize: "vertical" }} />
      ) : type === "checkbox" ? (
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ width: 18, height: 18, alignSelf: "flex-start" }} />
      ) : (
        <input type={type} value={value ?? ""} onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13 }} />
      )}
    </label>
  );
}

/* ─── 1. INTERN DATABASE ──────────────────────────────────────────────── */
function InternsSection() {
  const [rows, setRows] = useState<InternRow[]>([]);
  const [editing, setEditing] = useState<Partial<InternRow> | null>(null);

  const refresh = () => setRows(readAll<InternRow>(HR_PORTAL, "interns"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.name) { toast.error("Name required"); return; }
    if (editing.id) {
      update<InternRow>(HR_PORTAL, "interns", editing.id, editing);
    } else {
      insert<InternRow>(HR_PORTAL, "interns", {
        internId: editing.internId || `HMZ-I-${String(rows.length + 1).padStart(3, "0")}`,
        name: editing.name || "",
        hubProgram: editing.hubProgram || "",
        cohort: editing.cohort || "",
        startDate: editing.startDate || "",
        endDate: editing.endDate || "",
        stipend: editing.stipend ?? 0,
        placementStatus: (editing.placementStatus as any) || "In Training",
        targetDivision: editing.targetDivision || "",
        performanceRating: editing.performanceRating ?? 3,
      });
    }
    setEditing(null); refresh(); toast.success("Saved");
  };

  return (
    <div>
      <SectionTitle sub="HMZ-I-XXX intern roster. Track placement readiness and performance.">Intern Database</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} interns tracked</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add Intern
          </button>
        </div>
        <DataTable
          rows={rows}
          empty="No interns yet. Add the first one."
          columns={[
            { key: "internId", label: "ID" }, { key: "name", label: "Name" },
            { key: "hubProgram", label: "Programme" }, { key: "cohort", label: "Cohort" },
            { key: "placementStatus", label: "Status", render: r => <StatusPill label={r.placementStatus} tone={r.placementStatus === "Placed" || r.placementStatus === "Converted" ? "green" : r.placementStatus === "Ready" ? "gold" : "blue"} /> },
            { key: "targetDivision", label: "Target Div" },
            { key: "performanceRating", label: "Rating", render: r => `${r.performanceRating}★` },
          ]}
          onEdit={setEditing}
          onDelete={id => { remove(HR_PORTAL, "interns", id); refresh(); }}
        />
      </Card>
      {editing && <InternEditorModal editing={editing} setEditing={setEditing} save={save} />}
    </div>
  );
}

function InternEditorModal({ editing, setEditing, save }: { editing: Partial<InternRow>; setEditing: (e: Partial<InternRow> | null) => void; save: () => void }) {
  return (
    <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} Intern</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Intern ID" value={editing.internId} onChange={v => setEditing({ ...editing, internId: v })} />
          <FormField label="Name" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
          <FormField label="HUB Programme" value={editing.hubProgram} onChange={v => setEditing({ ...editing, hubProgram: v })} />
          <FormField label="Cohort" value={editing.cohort} onChange={v => setEditing({ ...editing, cohort: v })} />
          <FormField label="Start Date" type="date" value={editing.startDate} onChange={v => setEditing({ ...editing, startDate: v })} />
          <FormField label="End Date" type="date" value={editing.endDate} onChange={v => setEditing({ ...editing, endDate: v })} />
          <FormField label="Stipend ₦" type="number" value={editing.stipend} onChange={v => setEditing({ ...editing, stipend: v })} />
          <FormField label="Placement Status" type="select" value={editing.placementStatus} onChange={v => setEditing({ ...editing, placementStatus: v })} options={["In Training", "Ready", "Placed", "Converted"]} />
          <FormField label="Target Division" type="select" value={editing.targetDivision} onChange={v => setEditing({ ...editing, targetDivision: v })} options={["bizdoc", "scalar", "medialy", "hub"]} />
          <FormField label="Rating (1-5)" type="number" value={editing.performanceRating} onChange={v => setEditing({ ...editing, performanceRating: v })} />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── 2. RECRUITMENT PIPELINE ─────────────────────────────────────────── */
function RecruitmentSection() {
  const [rows, setRows] = useState<RequisitionRow[]>([]);
  const [editing, setEditing] = useState<Partial<RequisitionRow> | null>(null);
  const refresh = () => setRows(readAll<RequisitionRow>(HR_PORTAL, "requisitions"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.position) { toast.error("Position required"); return; }
    if (editing.id) {
      update<RequisitionRow>(HR_PORTAL, "requisitions", editing.id, editing);
    } else {
      const type = editing.type || "Staff";
      const prefix = type === "Intern" ? "REQ-I" : "REQ-S";
      insert<RequisitionRow>(HR_PORTAL, "requisitions", {
        reqId: editing.reqId || `${prefix}-${String(rows.length + 1).padStart(3, "0")}`,
        type, position: editing.position!,
        division: editing.division || "",
        postedDate: editing.postedDate || new Date().toISOString().slice(0, 10),
        applications: editing.applications ?? 0,
        interviewed: editing.interviewed ?? 0,
        offersMade: editing.offersMade ?? 0,
        status: (editing.status as any) || "Recruiting",
        targetStartDate: editing.targetStartDate || "",
      });
    }
    setEditing(null); refresh(); toast.success("Saved");
  };

  return (
    <div>
      <SectionTitle sub="Open reqs: staff (REQ-S-XXX) and interns (REQ-I-XXX).">Recruitment Pipeline</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} open positions</p>
          <button onClick={() => setEditing({ type: "Staff" })} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add Requisition
          </button>
        </div>
        <DataTable
          rows={rows}
          empty="No open requisitions."
          columns={[
            { key: "reqId", label: "Req ID" }, { key: "type", label: "Type" },
            { key: "position", label: "Position" }, { key: "division", label: "Division" },
            { key: "applications", label: "Apps" }, { key: "interviewed", label: "Interviewed" },
            { key: "offersMade", label: "Offers" },
            { key: "status", label: "Status", render: r => <StatusPill label={r.status} tone={r.status === "Filled" ? "green" : r.status === "Cancelled" ? "muted" : "blue"} /> },
          ]}
          onEdit={setEditing}
          onDelete={id => { remove(HR_PORTAL, "requisitions", id); refresh(); }}
        />
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} Requisition</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Req ID" value={editing.reqId} onChange={v => setEditing({ ...editing, reqId: v })} />
              <FormField label="Type" type="select" value={editing.type} onChange={v => setEditing({ ...editing, type: v })} options={["Staff", "Intern"]} />
              <FormField label="Position" value={editing.position} onChange={v => setEditing({ ...editing, position: v })} />
              <FormField label="Division" value={editing.division} onChange={v => setEditing({ ...editing, division: v })} />
              <FormField label="Posted" type="date" value={editing.postedDate} onChange={v => setEditing({ ...editing, postedDate: v })} />
              <FormField label="Target Start" type="date" value={editing.targetStartDate} onChange={v => setEditing({ ...editing, targetStartDate: v })} />
              <FormField label="Applications" type="number" value={editing.applications} onChange={v => setEditing({ ...editing, applications: v })} />
              <FormField label="Interviewed" type="number" value={editing.interviewed} onChange={v => setEditing({ ...editing, interviewed: v })} />
              <FormField label="Offers Made" type="number" value={editing.offersMade} onChange={v => setEditing({ ...editing, offersMade: v })} />
              <FormField label="Status" type="select" value={editing.status} onChange={v => setEditing({ ...editing, status: v })} options={["Recruiting", "Screening", "Offer Extended", "Filled", "Cancelled"]} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 3. ONBOARDING TRACKER ───────────────────────────────────────────── */
function OnboardingSection() {
  const [rows, setRows] = useState<OnboardingRow[]>([]);
  const refresh = () => setRows(readAll<OnboardingRow>(HR_PORTAL, "onboarding"));
  useEffect(() => { refresh(); }, []);

  const addRow = () => {
    const name = prompt("New hire name?"); if (!name) return;
    const staffId = prompt("Staff ID?") || `HMZ-${String(Date.now()).slice(-4)}`;
    insert<OnboardingRow>(HR_PORTAL, "onboarding", {
      staffId, staffName: name, orientationDone: false, documentationComplete: false,
      assignedBuddy: "", week1CheckIn: false, month1CheckIn: false, month3CheckIn: false,
    });
    refresh();
  };
  const toggle = (id: string, field: keyof OnboardingRow) => {
    const row = rows.find(r => r.id === id); if (!row) return;
    update<OnboardingRow>(HR_PORTAL, "onboarding", id, { [field]: !(row as any)[field] } as any);
    refresh();
  };

  return (
    <div>
      <SectionTitle sub="Day 1 → Week 1 → Month 1 → Month 3 probation gates.">Onboarding Tracker</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} new hires in onboarding</p>
          <button onClick={addRow} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add New Hire
          </button>
        </div>
        {rows.length === 0 ? <EmptyState icon={UserPlus} title="No active onboarding" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map(r => (
              <div key={r.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${DARK}08` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.staffName}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{r.staffId} · Buddy: {r.assignedBuddy || "—"}</p>
                  </div>
                  <button onClick={() => { remove(HR_PORTAL, "onboarding", r.id); refresh(); }} style={{ border: "none", background: "transparent", color: RED, cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                  {[
                    { k: "orientationDone",       l: "Orientation" },
                    { k: "documentationComplete", l: "Documents" },
                    { k: "week1CheckIn",          l: "Week 1" },
                    { k: "month1CheckIn",         l: "Month 1" },
                    { k: "month3CheckIn",         l: "Month 3 (probation)" },
                  ].map(g => (
                    <label key={g.k} onClick={() => toggle(r.id, g.k as any)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, backgroundColor: (r as any)[g.k] ? `${GREEN}15` : `${DARK}06`, cursor: "pointer" }}>
                      <CheckCircle2 size={13} color={(r as any)[g.k] ? GREEN : MUTED} />
                      <span style={{ fontSize: 11, color: DARK, fontWeight: 500 }}>{g.l}</span>
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

/* ─── 4. INTERN-HUB COORDINATION ──────────────────────────────────────── */
function InternCoordSection() {
  const [rows, setRows] = useState<InternCoordRow[]>([]);
  const [editing, setEditing] = useState<Partial<InternCoordRow> | null>(null);
  const refresh = () => setRows(readAll<InternCoordRow>(HR_PORTAL, "internCoord"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.internId) { toast.error("Intern ID required"); return; }
    if (editing.id) update<InternCoordRow>(HR_PORTAL, "internCoord", editing.id, editing);
    else insert<InternCoordRow>(HR_PORTAL, "internCoord", {
      internId: editing.internId!, instructor: editing.instructor || "",
      learningProgress: editing.learningProgress ?? 0,
      technicalSkills: editing.technicalSkills ?? 3, softSkills: editing.softSkills ?? 3,
      attendance: editing.attendance ?? 0, placementReady: !!editing.placementReady,
      recommendedDivision: editing.recommendedDivision || "",
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  return (
    <div>
      <SectionTitle sub="Bridges HUB learning progress with HR placement readiness.">Intern-HUB Coordination</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.filter(r => r.placementReady).length} of {rows.length} ready for placement</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add
          </button>
        </div>
        <DataTable
          rows={rows}
          empty="No coordination records yet."
          columns={[
            { key: "internId", label: "Intern" }, { key: "instructor", label: "Instructor" },
            { key: "learningProgress", label: "Progress", render: r => `${r.learningProgress}%` },
            { key: "technicalSkills", label: "Tech", render: r => `${r.technicalSkills}/5` },
            { key: "softSkills", label: "Soft", render: r => `${r.softSkills}/5` },
            { key: "attendance", label: "Attend", render: r => `${r.attendance}%` },
            { key: "placementReady", label: "Ready?", render: r => <StatusPill label={r.placementReady ? "Ready" : "Training"} tone={r.placementReady ? "green" : "blue"} /> },
            { key: "recommendedDivision", label: "Target" },
          ]}
          onEdit={setEditing}
          onDelete={id => { remove(HR_PORTAL, "internCoord", id); refresh(); }}
        />
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} Coordination</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Intern ID" value={editing.internId} onChange={v => setEditing({ ...editing, internId: v })} />
              <FormField label="Instructor" value={editing.instructor} onChange={v => setEditing({ ...editing, instructor: v })} />
              <FormField label="Learning %" type="number" value={editing.learningProgress} onChange={v => setEditing({ ...editing, learningProgress: v })} />
              <FormField label="Attendance %" type="number" value={editing.attendance} onChange={v => setEditing({ ...editing, attendance: v })} />
              <FormField label="Tech (1-5)" type="number" value={editing.technicalSkills} onChange={v => setEditing({ ...editing, technicalSkills: v })} />
              <FormField label="Soft (1-5)" type="number" value={editing.softSkills} onChange={v => setEditing({ ...editing, softSkills: v })} />
              <FormField label="Recommended Div" type="select" value={editing.recommendedDivision} onChange={v => setEditing({ ...editing, recommendedDivision: v })} options={["bizdoc", "scalar", "medialy", "hub"]} />
              <FormField label="Placement Ready" type="checkbox" value={editing.placementReady} onChange={v => setEditing({ ...editing, placementReady: v })} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 5. PERFORMANCE TRACKING ─────────────────────────────────────────── */
function PerformanceSection() {
  const [rows, setRows] = useState<PerformanceRow[]>([]);
  const [editing, setEditing] = useState<Partial<PerformanceRow> | null>(null);
  const refresh = () => setRows(readAll<PerformanceRow>(HR_PORTAL, "performance"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.staffId) { toast.error("Staff ID required"); return; }
    if (editing.id) update<PerformanceRow>(HR_PORTAL, "performance", editing.id, editing);
    else insert<PerformanceRow>(HR_PORTAL, "performance", {
      staffId: editing.staffId!, staffName: editing.staffName || "",
      reviewPeriod: editing.reviewPeriod || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
      goalsSet: editing.goalsSet || "", goalsAchieved: editing.goalsAchieved || "",
      rating: editing.rating ?? 3, strengths: editing.strengths || "",
      improvements: editing.improvements || "", nextReviewDate: editing.nextReviewDate || "",
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  return (
    <div>
      <SectionTitle sub="Quarterly reviews with goals, ratings, and next-review dates.">Performance Tracking</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} reviews recorded</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Add Review
          </button>
        </div>
        <DataTable
          rows={rows}
          empty="No reviews yet."
          columns={[
            { key: "staffId", label: "Staff" }, { key: "staffName", label: "Name" },
            { key: "reviewPeriod", label: "Period" },
            { key: "rating", label: "Rating", render: r => `${r.rating}★` },
            { key: "nextReviewDate", label: "Next Review" },
          ]}
          onEdit={setEditing}
          onDelete={id => { remove(HR_PORTAL, "performance", id); refresh(); }}
        />
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(600px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Add"} Performance Review</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Staff ID" value={editing.staffId} onChange={v => setEditing({ ...editing, staffId: v })} />
              <FormField label="Staff Name" value={editing.staffName} onChange={v => setEditing({ ...editing, staffName: v })} />
              <FormField label="Review Period" value={editing.reviewPeriod} onChange={v => setEditing({ ...editing, reviewPeriod: v })} />
              <FormField label="Rating (1-5)" type="number" value={editing.rating} onChange={v => setEditing({ ...editing, rating: v })} />
              <FormField label="Goals Set" type="textarea" value={editing.goalsSet} onChange={v => setEditing({ ...editing, goalsSet: v })} />
              <FormField label="Goals Achieved" type="textarea" value={editing.goalsAchieved} onChange={v => setEditing({ ...editing, goalsAchieved: v })} />
              <FormField label="Strengths" type="textarea" value={editing.strengths} onChange={v => setEditing({ ...editing, strengths: v })} />
              <FormField label="Improvements" type="textarea" value={editing.improvements} onChange={v => setEditing({ ...editing, improvements: v })} />
              <FormField label="Next Review" type="date" value={editing.nextReviewDate} onChange={v => setEditing({ ...editing, nextReviewDate: v })} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 6. EXIT MANAGEMENT ──────────────────────────────────────────────── */
function ExitsSection() {
  const [rows, setRows] = useState<ExitRow[]>([]);
  const [editing, setEditing] = useState<Partial<ExitRow> | null>(null);
  const refresh = () => setRows(readAll<ExitRow>(HR_PORTAL, "exits"));
  useEffect(() => { refresh(); }, []);

  const save = () => {
    if (!editing?.staffId) { toast.error("Staff ID required"); return; }
    if (editing.id) update<ExitRow>(HR_PORTAL, "exits", editing.id, editing);
    else insert<ExitRow>(HR_PORTAL, "exits", {
      staffId: editing.staffId!, staffName: editing.staffName || "",
      exitDate: editing.exitDate || new Date().toISOString().slice(0, 10),
      exitType: (editing.exitType as any) || "Resignation",
      noticePeriod: editing.noticePeriod || "",
      exitInterviewDone: !!editing.exitInterviewDone,
      finalPayStatus: (editing.finalPayStatus as any) || "Pending",
      notes: editing.notes || "",
    });
    setEditing(null); refresh(); toast.success("Saved");
  };

  return (
    <div>
      <SectionTitle sub="Resignations, conversions, completions, terminations. Final pay + exit interview tracked.">Exit Management</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{rows.length} exit records</p>
          <button onClick={() => setEditing({})} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={12} /> Log Exit
          </button>
        </div>
        <DataTable
          rows={rows}
          empty="No exit records."
          columns={[
            { key: "staffId", label: "Staff" }, { key: "staffName", label: "Name" },
            { key: "exitDate", label: "Exit Date" },
            { key: "exitType", label: "Type", render: r => <StatusPill label={r.exitType} tone={r.exitType === "Conversion" || r.exitType === "Program Complete" ? "green" : r.exitType === "Termination" ? "red" : "gold"} /> },
            { key: "exitInterviewDone", label: "Interview", render: r => r.exitInterviewDone ? "✓" : "—" },
            { key: "finalPayStatus", label: "Final Pay", render: r => <StatusPill label={r.finalPayStatus} tone={r.finalPayStatus === "Paid" ? "green" : "orange"} /> },
          ]}
          onEdit={setEditing}
          onDelete={id => { remove(HR_PORTAL, "exits", id); refresh(); }}
        />
      </Card>
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "Log"} Exit</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Staff ID" value={editing.staffId} onChange={v => setEditing({ ...editing, staffId: v })} />
              <FormField label="Staff Name" value={editing.staffName} onChange={v => setEditing({ ...editing, staffName: v })} />
              <FormField label="Exit Date" type="date" value={editing.exitDate} onChange={v => setEditing({ ...editing, exitDate: v })} />
              <FormField label="Exit Type" type="select" value={editing.exitType} onChange={v => setEditing({ ...editing, exitType: v })} options={["Resignation", "Program Complete", "Conversion", "Termination"]} />
              <FormField label="Notice Period" value={editing.noticePeriod} onChange={v => setEditing({ ...editing, noticePeriod: v })} />
              <FormField label="Interview Done" type="checkbox" value={editing.exitInterviewDone} onChange={v => setEditing({ ...editing, exitInterviewDone: v })} />
              <FormField label="Final Pay" type="select" value={editing.finalPayStatus} onChange={v => setEditing({ ...editing, finalPayStatus: v })} options={["Pending", "Paid"]} />
              <FormField label="Notes" type="textarea" value={editing.notes} onChange={v => setEditing({ ...editing, notes: v })} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 14px", borderRadius: 999, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
