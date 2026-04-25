import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, AlertCircle, ClipboardList,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock,
  Menu, X, Shield, Send, UserCheck, UserX,
  GraduationCap, FilePlus2, Sparkles, Workflow, Star, DoorOpen,
  Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";

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
  | "requisitions"
  | "onboarding"
  | "internCoord"
  | "performance"
  | "exits";

/* 2026-04 — restored. The 6 ops sections are now MySQL-backed via tRPC
   `hr.*` (see server/hr/router.ts). int autoincrement ids end-to-end. */

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
    { key: "dashboard",    icon: LayoutDashboard, label: "Overview" },
    { key: "roster",       icon: Users,           label: "Staff Roster" },
    { key: "requisitions", icon: FilePlus2,       label: "Requisitions" },
    { key: "onboarding",   icon: Sparkles,        label: "Onboarding" },
    { key: "interns",      icon: GraduationCap,   label: "Interns" },
    { key: "internCoord",  icon: Workflow,        label: "Intern Coord" },
    { key: "performance",  icon: Star,            label: "Performance" },
    { key: "leave",        icon: CalendarIcon,    label: "Leave Requests" },
    { key: "discipline",   icon: AlertCircle,     label: "Discipline" },
    { key: "attendance",   icon: UserCheck,       label: "Attendance" },
    { key: "exits",        icon: DoorOpen,        label: "Exits" },
    { key: "reports",      icon: ClipboardList,   label: "Reports" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
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
            {active === "dashboard"    && <OverviewSection onGoto={setActive} />}
            {active === "roster"       && <RosterSection />}
            {active === "requisitions" && <RequisitionsSection />}
            {active === "onboarding"   && <OnboardingSection />}
            {active === "interns"      && <InternsSection />}
            {active === "internCoord"  && <InternCoordSection />}
            {active === "performance"  && <PerformanceSection />}
            {active === "leave"        && <LeaveSection />}
            {active === "discipline"   && <DisciplineSection />}
            {active === "attendance"   && <AttendanceSection />}
            {active === "exits"        && <ExitsSection />}
            {active === "reports"      && <ReportsSection />}
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
 * Restored sections — MySQL via tRPC `hr.*` (server/hr/router.ts).
 * Patterns mirror MedialyOpsPortal.tsx (multi-section CRUD, ids are int
 * end-to-end, toast on success, invalidate on mutate).
 * ═══════════════════════════════════════════════════════════════════════ */

function PrimaryButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "8px 14px", borderRadius: 10,
        backgroundColor: GREEN, color: WHITE, border: "none",
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
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
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

/* ─── Requisitions ────────────────────────────────────────────────────── */
function RequisitionsSection() {
  const utils = trpc.useUtils();
  const q = trpc.hr.requisitions.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    role: "", division: "", requesterLead: "",
    responsibilities: "", requirements: "",
    salaryRange: "", timeline: "",
    status: "Requested" as const,
    notes: "",
  });

  const createMut = trpc.hr.requisitions.create.useMutation({
    onSuccess: () => {
      toast.success("Requisition added");
      utils.hr.requisitions.list.invalidate();
      setShowForm(false);
      setForm({ role: "", division: "", requesterLead: "", responsibilities: "", requirements: "", salaryRange: "", timeline: "", status: "Requested" as const, notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.requisitions.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.requisitions.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.requisitions.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.requisitions.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const open = rows.filter(r => !["Hired", "Closed"].includes(r.status));
  const closed = rows.filter(r => ["Hired", "Closed"].includes(r.status));

  return (
    <div>
      <SectionTitle sub="Recruitment pipeline. Lead requests → CEO approves → HR runs the loop.">
        Requisitions
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Open"   value={open.length}   color={GOLD} />
        <MiniStat label="Closed" value={closed.length} color={GREEN} />
        <MiniStat label="Total"  value={rows.length}   color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Requisition</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Role"><TextInput value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Backend Engineer" /></FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} placeholder="e.g. Scalar" /></FormField>
              <FormField label="Requester Lead"><TextInput value={form.requesterLead} onChange={e => setForm({ ...form, requesterLead: e.target.value })} placeholder="e.g. Tech Lead" /></FormField>
              <FormField label="Salary Range"><TextInput value={form.salaryRange} onChange={e => setForm({ ...form, salaryRange: e.target.value })} placeholder="e.g. ₦150k–₦220k" /></FormField>
              <FormField label="Timeline"><TextInput value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} placeholder="e.g. 2–4 weeks" /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Responsibilities"><TextArea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} /></FormField>
              <FormField label="Requirements"><TextArea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.role.trim() || !form.division.trim() || !form.requesterLead.trim()) {
                  toast.error("Role, Division, and Requester Lead are required");
                  return;
                }
                createMut.mutate({ ...form });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Pipeline ({rows.length})
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={FilePlus2} title="No requisitions yet" hint="Add the first one above." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.role}</p>
                      <StatusPill label={r.status} tone={r.status === "Hired" ? "green" : r.status === "Closed" ? "muted" : "gold"} />
                      {r.ceoApproved && <StatusPill label="CEO ✓" tone="green" />}
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.division} · Requested by {r.requesterLead}
                      {r.salaryRange ? <> · {r.salaryRange}</> : null}
                      {r.timeline ? <> · {r.timeline}</> : null}
                    </p>
                    {r.responsibilities && <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}><strong>Resp:</strong> {r.responsibilities}</p>}
                    {r.requirements && <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}><strong>Req:</strong> {r.requirements}</p>}
                    {typeof r.shortlistCount === "number" && r.shortlistCount > 0 && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Shortlist: {r.shortlistCount}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <Select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Requested", "CEO Approved", "Posted", "Screening", "Interviewing", "Offer", "Hired", "Closed"].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <GhostButton onClick={() => updateMut.mutate({ id: r.id, ceoApproved: !r.ceoApproved })} color={r.ceoApproved ? GREEN : GOLD}>
                        {r.ceoApproved ? "Unapprove" : "CEO ✓"}
                      </GhostButton>
                      <GhostButton onClick={() => { if (confirm("Remove this requisition?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                        <Trash2 size={10} />
                      </GhostButton>
                    </div>
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

/* ─── Onboarding ──────────────────────────────────────────────────────── */
function OnboardingSection() {
  const utils = trpc.useUtils();
  const q = trpc.hr.onboarding.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffName: "", staffId: "", division: "",
    hireDate: new Date().toISOString().slice(0, 10),
    day1: "", week1: "", month1: "", month3: "",
    notes: "",
  });

  const createMut = trpc.hr.onboarding.create.useMutation({
    onSuccess: () => {
      toast.success("Onboarding plan created");
      utils.hr.onboarding.list.invalidate();
      setShowForm(false);
      setForm({ staffName: "", staffId: "", division: "", hireDate: new Date().toISOString().slice(0, 10), day1: "", week1: "", month1: "", month3: "", notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.onboarding.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.onboarding.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.onboarding.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.onboarding.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const splitLines = (s: string): string[] => s.split("\n").map(x => x.trim()).filter(Boolean);

  return (
    <div>
      <SectionTitle sub="Day 1 / Week 1 / Month 1 / Month 3 checklists per new hire.">
        Onboarding
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Active" value={rows.filter(r => !["Confirmed", "Parted Ways"].includes(r.status)).length} color={BLUE} />
        <MiniStat label="Confirmed" value={rows.filter(r => r.status === "Confirmed").length} color={GREEN} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Onboarding Plan</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Staff Name"><TextInput value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })} /></FormField>
              <FormField label="Staff ID"><TextInput value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} placeholder="e.g. HMZ-S-019" /></FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} /></FormField>
              <FormField label="Hire Date"><TextInput type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Day 1 Tasks (one per line)"><TextArea value={form.day1} onChange={e => setForm({ ...form, day1: e.target.value })} placeholder="Office tour&#10;Sign contract&#10;Set up email" /></FormField>
              <FormField label="Week 1 Tasks (one per line)"><TextArea value={form.week1} onChange={e => setForm({ ...form, week1: e.target.value })} /></FormField>
              <FormField label="Month 1 Tasks (one per line)"><TextArea value={form.month1} onChange={e => setForm({ ...form, month1: e.target.value })} /></FormField>
              <FormField label="Month 3 Tasks (one per line)"><TextArea value={form.month3} onChange={e => setForm({ ...form, month3: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.staffName.trim() || !form.hireDate) {
                  toast.error("Staff Name and Hire Date are required");
                  return;
                }
                createMut.mutate({
                  staffName: form.staffName,
                  staffId: form.staffId || null,
                  division: form.division || null,
                  hireDate: form.hireDate,
                  day1Tasks: splitLines(form.day1),
                  week1Tasks: splitLines(form.week1),
                  month1Tasks: splitLines(form.month1),
                  month3Tasks: splitLines(form.month3),
                  notes: form.notes || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.length === 0 ? (
          <Card><EmptyState icon={Sparkles} title="No onboarding plans yet" /></Card>
        ) : rows.map((r: any) => (
          <Card key={r.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{r.staffName}</p>
                  {r.staffId && <span style={{ fontSize: 10, fontFamily: "monospace", color: MUTED }}>{r.staffId}</span>}
                  <StatusPill label={r.status} tone={r.status === "Confirmed" ? "green" : r.status === "Parted Ways" ? "red" : "blue"} />
                </div>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{r.division || "—"} · Hired {fmtDate(r.hireDate)}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 180 }}>
                <Select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                  {["Day 1", "Week 1", "Month 1", "Probation", "Confirmed", "Parted Ways"].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
                <GhostButton onClick={() => { if (confirm("Remove this plan?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                  <Trash2 size={10} /> Remove
                </GhostButton>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {[
                { key: "day1", label: "Day 1", tasks: r.day1Tasks as string[], done: r.day1Done, donePatch: { id: r.id, day1Done: !r.day1Done } },
                { key: "week1", label: "Week 1", tasks: r.week1Tasks as string[], done: r.week1Done, donePatch: { id: r.id, week1Done: !r.week1Done } },
                { key: "month1", label: "Month 1", tasks: r.month1Tasks as string[], done: r.month1Done, donePatch: { id: r.id, month1Done: !r.month1Done } },
                { key: "month3", label: "Month 3", tasks: r.month3Tasks as string[], done: r.month3Done, donePatch: { id: r.id, month3Done: !r.month3Done } },
              ].map(p => (
                <div key={p.key} style={{
                  padding: 10, backgroundColor: BG, borderRadius: 8, border: `1px solid ${DARK}06`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.label}</p>
                    <button
                      onClick={() => updateMut.mutate(p.donePatch as any)}
                      style={{
                        padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                        fontSize: 10, fontWeight: 600,
                        backgroundColor: p.done ? `${GREEN}15` : `${MUTED}15`,
                        color: p.done ? GREEN : MUTED,
                      }}>{p.done ? "Done" : "Mark"}</button>
                  </div>
                  {p.tasks.length === 0 ? (
                    <p style={{ fontSize: 10, color: MUTED, fontStyle: "italic" }}>No tasks</p>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: DARK, lineHeight: 1.6 }}>
                      {p.tasks.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {r.notes && (
              <p style={{ fontSize: 11, color: MUTED, marginTop: 10, fontStyle: "italic" }}>
                Notes: {r.notes}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Interns ─────────────────────────────────────────────────────────── */
function InternsSection() {
  const utils = trpc.useUtils();
  const q = trpc.hr.interns.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    internId: "", name: "", division: "",
    hubCommitment: false, hubHoursPerWeek: 0, divisionHoursPerWeek: 0,
    startDate: "", durationMonths: 0,
    status: "Active" as const,
    performanceNotes: "",
  });

  const createMut = trpc.hr.interns.create.useMutation({
    onSuccess: () => {
      toast.success("Intern added");
      utils.hr.interns.list.invalidate();
      setShowForm(false);
      setForm({ internId: "", name: "", division: "", hubCommitment: false, hubHoursPerWeek: 0, divisionHoursPerWeek: 0, startDate: "", durationMonths: 0, status: "Active" as const, performanceNotes: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.interns.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.interns.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.interns.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.interns.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="HMZ-I-XXX. Dual-role: Division + HUB.">
        Interns
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Active" value={rows.filter(r => r.status === "Active").length} color={BLUE} />
        <MiniStat label="Converting" value={rows.filter(r => r.status === "Converting").length} color={GOLD} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Intern</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Intern ID"><TextInput value={form.internId} onChange={e => setForm({ ...form, internId: e.target.value })} placeholder="HMZ-I-003" /></FormField>
              <FormField label="Name"><TextInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} placeholder="e.g. Medialy" /></FormField>
              <FormField label="Start Date"><TextInput type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></FormField>
              <FormField label="Duration (months)"><TextInput type="number" value={form.durationMonths || ""} onChange={e => setForm({ ...form, durationMonths: Number(e.target.value) })} /></FormField>
              <FormField label="Division hrs/week"><TextInput type="number" value={form.divisionHoursPerWeek || ""} onChange={e => setForm({ ...form, divisionHoursPerWeek: Number(e.target.value) })} /></FormField>
              <FormField label="HUB hrs/week"><TextInput type="number" value={form.hubHoursPerWeek || ""} onChange={e => setForm({ ...form, hubHoursPerWeek: Number(e.target.value) })} /></FormField>
              <FormField label="HUB commitment?">
                <Select value={form.hubCommitment ? "yes" : "no"} onChange={e => setForm({ ...form, hubCommitment: e.target.value === "yes" })}>
                  <option value="no">No</option><option value="yes">Yes</option>
                </Select>
              </FormField>
            </FormGrid>
            <div style={{ marginBottom: 10 }}>
              <FormField label="Performance Notes"><TextArea value={form.performanceNotes} onChange={e => setForm({ ...form, performanceNotes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.internId.trim() || !form.name.trim() || !form.division.trim()) {
                  toast.error("Intern ID, Name, and Division are required");
                  return;
                }
                createMut.mutate({ ...form });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No interns logged yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.name}</p>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: MUTED }}>{r.internId}</span>
                    <StatusPill label={r.status} tone={r.status === "Active" ? "blue" : r.status === "Exited" ? "muted" : "gold"} />
                    {r.hubCommitment && <StatusPill label="HUB" tone="orange" />}
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                    {r.division}
                    {r.startDate && <> · Started {fmtDate(r.startDate)}</>}
                    {r.durationMonths ? <> · {r.durationMonths}mo</> : null}
                    {(r.divisionHoursPerWeek || r.hubHoursPerWeek) && (
                      <> · {r.divisionHoursPerWeek || 0}h division / {r.hubHoursPerWeek || 0}h HUB</>
                    )}
                  </p>
                  {r.performanceNotes && <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}>{r.performanceNotes}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                  <Select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                    {["Selecting", "Onboarding", "Active", "Converting", "Exited"].map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <GhostButton onClick={() => { if (confirm("Remove this intern?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                    <Trash2 size={10} /> Remove
                  </GhostButton>
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
function InternCoordSection() {
  const utils = trpc.useUtils();
  const q = trpc.hr.internCoord.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    internId: "", internName: "", division: "",
    divisionLead: "", hubManager: "",
    divisionHoursPerWeek: 0, hubHoursPerWeek: 0,
    lastReviewAt: "",
    divisionFeedback: "", hubFeedback: "",
    status: "Active" as const,
    conversionDecision: "", notes: "",
  });

  const createMut = trpc.hr.internCoord.create.useMutation({
    onSuccess: () => {
      toast.success("Coordination added");
      utils.hr.internCoord.list.invalidate();
      setShowForm(false);
      setForm({ internId: "", internName: "", division: "", divisionLead: "", hubManager: "", divisionHoursPerWeek: 0, hubHoursPerWeek: 0, lastReviewAt: "", divisionFeedback: "", hubFeedback: "", status: "Active" as const, conversionDecision: "", notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.internCoord.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.internCoord.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.internCoord.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.internCoord.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="HUB ↔ Division dual-coordination. Both leads feed back to HR.">
        Intern Coord
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Coordination Entry</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Intern ID"><TextInput value={form.internId} onChange={e => setForm({ ...form, internId: e.target.value })} placeholder="HMZ-I-001" /></FormField>
              <FormField label="Intern Name"><TextInput value={form.internName} onChange={e => setForm({ ...form, internName: e.target.value })} /></FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} /></FormField>
              <FormField label="Division Lead"><TextInput value={form.divisionLead} onChange={e => setForm({ ...form, divisionLead: e.target.value })} /></FormField>
              <FormField label="HUB Manager"><TextInput value={form.hubManager} onChange={e => setForm({ ...form, hubManager: e.target.value })} /></FormField>
              <FormField label="Division hrs/week"><TextInput type="number" value={form.divisionHoursPerWeek || ""} onChange={e => setForm({ ...form, divisionHoursPerWeek: Number(e.target.value) })} /></FormField>
              <FormField label="HUB hrs/week"><TextInput type="number" value={form.hubHoursPerWeek || ""} onChange={e => setForm({ ...form, hubHoursPerWeek: Number(e.target.value) })} /></FormField>
              <FormField label="Last Review Date"><TextInput type="date" value={form.lastReviewAt} onChange={e => setForm({ ...form, lastReviewAt: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Division Feedback"><TextArea value={form.divisionFeedback} onChange={e => setForm({ ...form, divisionFeedback: e.target.value })} /></FormField>
              <FormField label="HUB Feedback"><TextArea value={form.hubFeedback} onChange={e => setForm({ ...form, hubFeedback: e.target.value })} /></FormField>
              <FormField label="Conversion Decision"><TextInput value={form.conversionDecision} onChange={e => setForm({ ...form, conversionDecision: e.target.value })} placeholder="Convert / Extend / End" /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.internId.trim() || !form.internName.trim() || !form.division.trim()) {
                  toast.error("Intern ID, Name, and Division are required");
                  return;
                }
                createMut.mutate({ ...form });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Workflow} title="No coordination entries yet" hint="Track HUB + Division feedback per intern." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.internName}</p>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: MUTED }}>{r.internId}</span>
                      <StatusPill label={r.status} tone={r.status === "Active" ? "blue" : r.status === "Converting" ? "gold" : r.status === "Ended" ? "muted" : "green"} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.division}
                      {r.divisionLead && <> · Lead: {r.divisionLead}</>}
                      {r.hubManager && <> · HUB: {r.hubManager}</>}
                    </p>
                    {(r.divisionHoursPerWeek || r.hubHoursPerWeek) && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {r.divisionHoursPerWeek || 0}h division / {r.hubHoursPerWeek || 0}h HUB
                        {r.lastReviewAt && <> · Last review {fmtDate(r.lastReviewAt)}</>}
                      </p>
                    )}
                    {r.divisionFeedback && <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}><strong>Division:</strong> {r.divisionFeedback}</p>}
                    {r.hubFeedback && <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}><strong>HUB:</strong> {r.hubFeedback}</p>}
                    {r.conversionDecision && <p style={{ fontSize: 11, color: GOLD, marginTop: 4, fontWeight: 600 }}>Decision: {r.conversionDecision}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <Select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Onboarding", "Active", "Review", "Converting", "Ended"].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <GhostButton onClick={() => { if (confirm("Remove this entry?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ─── Performance ─────────────────────────────────────────────────────── */
function PerformanceSection() {
  const utils = trpc.useUtils();
  const q = trpc.hr.performance.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffName: "", staffId: "", division: "",
    reviewerLead: "", quarter: "",
    achievements: "", challenges: "", growth: "",
    goalsMet: "", nextGoals: "", supportNeeded: "",
    rating: 0,
    status: "Scheduled" as const,
    reviewedAt: "",
  });

  const createMut = trpc.hr.performance.create.useMutation({
    onSuccess: () => {
      toast.success("Performance review created");
      utils.hr.performance.list.invalidate();
      setShowForm(false);
      setForm({ staffName: "", staffId: "", division: "", reviewerLead: "", quarter: "", achievements: "", challenges: "", growth: "", goalsMet: "", nextGoals: "", supportNeeded: "", rating: 0, status: "Scheduled" as const, reviewedAt: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.performance.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.performance.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.performance.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.performance.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const splitLines = (s: string): string[] => s.split("\n").map(x => x.trim()).filter(Boolean);

  return (
    <div>
      <SectionTitle sub="Quarterly reviews. Lead leads, HR documents, both sign.">
        Performance
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Scheduled" value={rows.filter(r => r.status === "Scheduled").length} color={GOLD} />
        <MiniStat label="Completed" value={rows.filter(r => r.status === "Completed").length} color={GREEN} />
        <MiniStat label="Improvement" value={rows.filter(r => r.status === "Improvement Plan").length} color={ORANGE} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Review</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Staff Name"><TextInput value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })} /></FormField>
              <FormField label="Staff ID"><TextInput value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} placeholder="HMZ-S-001" /></FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} /></FormField>
              <FormField label="Reviewer / Lead"><TextInput value={form.reviewerLead} onChange={e => setForm({ ...form, reviewerLead: e.target.value })} /></FormField>
              <FormField label="Quarter"><TextInput value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} placeholder="2026 Q2" /></FormField>
              <FormField label="Goals Met"><TextInput value={form.goalsMet} onChange={e => setForm({ ...form, goalsMet: e.target.value })} placeholder="3 of 4" /></FormField>
              <FormField label="Rating (1–5)"><TextInput type="number" min={1} max={5} value={form.rating || ""} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} /></FormField>
              <FormField label="Reviewed At"><TextInput type="date" value={form.reviewedAt} onChange={e => setForm({ ...form, reviewedAt: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Achievements"><TextArea value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} /></FormField>
              <FormField label="Challenges"><TextArea value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} /></FormField>
              <FormField label="Growth"><TextArea value={form.growth} onChange={e => setForm({ ...form, growth: e.target.value })} /></FormField>
              <FormField label="Next Goals (one per line)"><TextArea value={form.nextGoals} onChange={e => setForm({ ...form, nextGoals: e.target.value })} /></FormField>
              <FormField label="Support Needed"><TextArea value={form.supportNeeded} onChange={e => setForm({ ...form, supportNeeded: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.staffName.trim() || !form.reviewerLead.trim() || !form.quarter.trim()) {
                  toast.error("Staff Name, Reviewer, and Quarter are required");
                  return;
                }
                createMut.mutate({
                  staffName: form.staffName,
                  staffId: form.staffId || null,
                  division: form.division || null,
                  reviewerLead: form.reviewerLead,
                  quarter: form.quarter,
                  achievements: form.achievements || null,
                  challenges: form.challenges || null,
                  growth: form.growth || null,
                  goalsMet: form.goalsMet || null,
                  nextGoals: splitLines(form.nextGoals),
                  supportNeeded: form.supportNeeded || null,
                  rating: form.rating || null,
                  status: form.status,
                  reviewedAt: form.reviewedAt || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Star} title="No reviews recorded yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.staffName}</p>
                      {r.staffId && <span style={{ fontSize: 10, fontFamily: "monospace", color: MUTED }}>{r.staffId}</span>}
                      <StatusPill label={r.quarter} tone="muted" />
                      <StatusPill label={r.status} tone={r.status === "Completed" ? "green" : r.status === "Improvement Plan" ? "orange" : r.status === "Escalated" ? "red" : "gold"} />
                      {typeof r.rating === "number" && r.rating > 0 && <StatusPill label={`★ ${r.rating}`} tone="gold" />}
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.division || "—"} · Reviewer: {r.reviewerLead}
                      {r.reviewedAt && <> · {fmtDate(r.reviewedAt)}</>}
                    </p>
                    {r.achievements && <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}><strong>Achievements:</strong> {r.achievements}</p>}
                    {r.challenges && <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}><strong>Challenges:</strong> {r.challenges}</p>}
                    {r.growth && <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}><strong>Growth:</strong> {r.growth}</p>}
                    {r.goalsMet && <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Goals met: {r.goalsMet}</p>}
                    {Array.isArray(r.nextGoals) && r.nextGoals.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong>Next goals:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.nextGoals.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.supportNeeded && <p style={{ fontSize: 11, color: MUTED, marginTop: 6, fontStyle: "italic" }}>Support: {r.supportNeeded}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <Select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Scheduled", "In Progress", "Completed", "Improvement Plan", "Escalated"].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <GhostButton onClick={() => { if (confirm("Remove this review?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ─── Exits ───────────────────────────────────────────────────────────── */
function ExitsSection() {
  const utils = trpc.useUtils();
  const q = trpc.hr.exits.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    staffName: "", staffId: "", division: "",
    exitType: "Resignation" as const,
    noticeDate: "", lastDay: "",
    reason: "", handover: "", feedback: "",
    status: "Notified" as const,
    notes: "",
  });

  const createMut = trpc.hr.exits.create.useMutation({
    onSuccess: () => {
      toast.success("Exit logged");
      utils.hr.exits.list.invalidate();
      setShowForm(false);
      setForm({ staffName: "", staffId: "", division: "", exitType: "Resignation" as const, noticeDate: "", lastDay: "", reason: "", handover: "", feedback: "", status: "Notified" as const, notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.exits.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.exits.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.exits.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.exits.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const splitLines = (s: string): string[] => s.split("\n").map(x => x.trim()).filter(Boolean);

  return (
    <div>
      <SectionTitle sub="Offboarding workflow — handover, equipment, access, final pay, exit interview.">
        Exits
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="In Progress" value={rows.filter(r => !["Departed", "Post-Exit"].includes(r.status)).length} color={GOLD} />
        <MiniStat label="Departed" value={rows.filter(r => ["Departed", "Post-Exit"].includes(r.status)).length} color={MUTED} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Exit Record</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Staff Name"><TextInput value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })} /></FormField>
              <FormField label="Staff ID"><TextInput value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} placeholder="HMZ-S-XXX" /></FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} /></FormField>
              <FormField label="Exit Type">
                <Select value={form.exitType} onChange={e => setForm({ ...form, exitType: e.target.value as any })}>
                  {["Resignation", "Termination", "End of Contract", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormField>
              <FormField label="Notice Date"><TextInput type="date" value={form.noticeDate} onChange={e => setForm({ ...form, noticeDate: e.target.value })} /></FormField>
              <FormField label="Last Day"><TextInput type="date" value={form.lastDay} onChange={e => setForm({ ...form, lastDay: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Reason"><TextArea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></FormField>
              <FormField label="Handover Items (one per line)"><TextArea value={form.handover} onChange={e => setForm({ ...form, handover: e.target.value })} /></FormField>
              <FormField label="Feedback (exit interview)"><TextArea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.staffName.trim()) {
                  toast.error("Staff Name is required");
                  return;
                }
                createMut.mutate({
                  staffName: form.staffName,
                  staffId: form.staffId || null,
                  division: form.division || null,
                  exitType: form.exitType,
                  noticeDate: form.noticeDate || null,
                  lastDay: form.lastDay || null,
                  reason: form.reason || null,
                  handoverItems: splitLines(form.handover),
                  feedback: form.feedback || null,
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
          <EmptyState icon={DoorOpen} title="No exits logged" hint="Hopefully this stays empty." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.staffName}</p>
                      {r.staffId && <span style={{ fontSize: 10, fontFamily: "monospace", color: MUTED }}>{r.staffId}</span>}
                      <StatusPill label={r.exitType} tone={r.exitType === "Termination" ? "red" : "muted"} />
                      <StatusPill label={r.status} tone={r.status === "Departed" ? "green" : r.status === "Post-Exit" ? "muted" : "gold"} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.division || "—"}
                      {r.noticeDate && <> · Notice {fmtDate(r.noticeDate)}</>}
                      {r.lastDay && <> · Last day {fmtDate(r.lastDay)}</>}
                    </p>
                    {r.reason && <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}><strong>Reason:</strong> {r.reason}</p>}
                    {Array.isArray(r.handoverItems) && r.handoverItems.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 4 }}>
                        <strong>Handover:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.handoverItems.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.feedback && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>Feedback: {r.feedback}</p>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {[
                        { key: "equipmentReturned", label: "Equipment" },
                        { key: "accessRevoked", label: "Access" },
                        { key: "finalPayProcessed", label: "Final Pay" },
                        { key: "exitInterviewDone", label: "Interview" },
                      ].map(b => (
                        <button key={b.key}
                          onClick={() => updateMut.mutate({ id: r.id, [b.key]: !r[b.key] } as any)}
                          style={{
                            padding: "3px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                            fontSize: 10, fontWeight: 600,
                            backgroundColor: r[b.key] ? `${GREEN}15` : `${MUTED}15`,
                            color: r[b.key] ? GREEN : MUTED,
                          }}>
                          {r[b.key] ? "✓" : "○"} {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <Select value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Notified", "Transition", "Final Week", "Departed", "Post-Exit"].map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <GhostButton onClick={() => { if (confirm("Remove this exit record?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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
