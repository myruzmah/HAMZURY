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
  Plus, Trash2, CalendarDays,
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

// 2026-04-25 — Section list aligned to Phase 2 HR Master Dashboard 8-tab
// spec (Overview, Staff, Interns, Attendance, Leave, Performance,
// Recruitment, Calendar). Calendar added 2026-04-25 — see
// CalendarSection at the bottom of the file. Cut: discipline, reports,
// onboarding, internCoord, exits (not in spec — data layer + tRPC
// retained for HR SOPs that can run outside the dashboard UI).
type Section =
  | "dashboard"
  | "roster"
  | "leave"
  | "attendance"
  | "interns"
  | "requisitions"
  | "performance"
  | "calendar";

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

  // 2026-04-25 — NAV is the full Phase 2 HR Master Dashboard 8-tab spec.
  // Spec: Overview, Staff, Interns, Attendance, Leave, Performance,
  // Recruitment, Calendar.
  const NAV: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "dashboard",    icon: LayoutDashboard, label: "Overview" },
    { key: "roster",       icon: Users,           label: "Staff Roster" },
    { key: "interns",      icon: GraduationCap,   label: "Interns" },
    { key: "attendance",   icon: UserCheck,       label: "Attendance" },
    { key: "leave",        icon: CalendarIcon,    label: "Leave Requests" },
    { key: "performance",  icon: Star,            label: "Performance" },
    { key: "requisitions", icon: FilePlus2,       label: "Recruitment" },
    { key: "calendar",     icon: CalendarDays,    label: "Calendar" },
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
            {/* 2026-04-25 — Dispatcher covers all 8 Phase 2 HR tabs. */}
            {active === "dashboard"    && <OverviewSection onGoto={setActive} />}
            {active === "roster"       && <RosterSection />}
            {active === "interns"      && <InternsSection />}
            {active === "attendance"   && <AttendanceSection />}
            {active === "leave"        && <LeaveSection />}
            {active === "performance"  && <PerformanceSection />}
            {active === "requisitions" && <RequisitionsSection />}
            {active === "calendar"     && <CalendarSection />}
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
  // 2026-04-25 — disciplineQ removed alongside Discipline section cut.

  const staff = ((staffQ.data || []) as any[]);
  const leaves = ((leaveQ.data || []) as any[]);

  const active = staff.filter(s => s.status === "Active").length;
  const pendingLeave = leaves.filter(l => l.status === "pending").length;
  const onLeaveNow = leaves.filter(l => {
    if (l.status !== "approved") return false;
    try {
      const now = new Date();
      return new Date(l.startDate) <= now && new Date(l.endDate) >= now;
    } catch { return false; }
  }).length;

  // 2026-04-25 — Open Discipline KPI removed (Discipline section cut: not in HR 8-tab spec).
  const kpis = [
    { label: "Total Staff",       value: staff.length,      icon: Users,       color: GREEN,  section: "roster" as Section },
    { label: "Active",            value: active,            icon: UserCheck,   color: "#22C55E", section: "roster" as Section },
    { label: "On Leave Now",      value: onLeaveNow,        icon: UserX,       color: BLUE,   section: "leave" as Section },
    { label: "Pending Leave",     value: pendingLeave,      icon: Clock,       color: GOLD,   section: "leave" as Section },
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
/* ── CUT 2026-04-25 — Discipline section removed (not in Phase 2 HR Master Dashboard 8-tab spec). ── */

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
/* ── CUT 2026-04-25 — HR Reports section removed (not in Phase 2 HR Master Dashboard 8-tab spec). ── */

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
/* ── CUT 2026-04-25 — Onboarding section (SOP, not in 8-tab HR spec) removed (not in Phase 2 HR Master Dashboard 8-tab spec). ── */

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
/* ── CUT 2026-04-25 — Intern Coord section (duplicate of Interns) removed (not in Phase 2 HR Master Dashboard 8-tab spec). ── */

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
/* ── CUT 2026-04-25 — Exits section removed (not in Phase 2 HR Master Dashboard 8-tab spec). ── */

/* ─── Calendar (Phase 2 HR tab 8) ─────────────────────────────────────────
 * Daily attendance check, daily new-staff check-ins, quarterly
 * performance reviews, monthly attendance report, training, leave.
 * Shapes derived from PHASE2_EXECUTIVE/HR/CALENDAR/HR_Calendar.ics.
 * MySQL via tRPC `hr.calendar.*`. */
function CalendarSection() {
  const utils = trpc.useUtils();
  // Default list view: next 30 days. Server-side filter on startAt.
  const today = new Date();
  const thirtyOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const q = trpc.hr.calendar.list.useQuery(
    { from: today, to: thirtyOut },
    { retry: false },
  );
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    eventType: "other" as const,
    assignee: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.hr.calendar.create.useMutation({
    onSuccess: () => {
      toast.success("Event added");
      utils.hr.calendar.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.hr.calendar.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.hr.calendar.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.hr.calendar.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.hr.calendar.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const fmtTime = (d: string | Date | null | undefined): string => {
    if (!d) return "";
    try { return new Date(d).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
  };

  // Group rows by ISO date (YYYY-MM-DD).
  const groupedByDay = rows.reduce<Record<string, any[]>>((acc, r) => {
    if (!r.startAt) return acc;
    const key = new Date(r.startAt).toISOString().slice(0, 10);
    (acc[key] ||= []).push(r);
    return acc;
  }, {});
  const dayKeys = Object.keys(groupedByDay).sort();

  // "This week" preview: events in the next 7 days.
  const weekOut = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeek = rows.filter(r => {
    if (!r.startAt) return false;
    const t = new Date(r.startAt).getTime();
    return t >= today.getTime() && t <= weekOut.getTime();
  });

  const eventTypeTone = (t: string): "green" | "gold" | "red" | "blue" | "muted" | "orange" => {
    switch (t) {
      case "attendance": return "green";
      case "checkin":    return "blue";
      case "review":     return "gold";
      case "report":     return "orange";
      case "training":   return "blue";
      case "leave":      return "red";
      default:           return "muted";
    }
  };

  return (
    <div>
      <SectionTitle sub="Daily attendance, new-staff check-ins, quarterly reviews, monthly reports, training, leave.">
        HR Calendar
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Next 7 days" value={thisWeek.length} color={GREEN} />
        <MiniStat label="Reviews" value={rows.filter(r => r.eventType === "review").length} color={GOLD} />
        <MiniStat label="Reports" value={rows.filter(r => r.eventType === "report").length} color={ORANGE} />
        <MiniStat label="Total (30d)" value={rows.length} color={DARK} />
      </div>

      {thisWeek.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            This Week
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {thisWeek.slice(0, 8).map((r: any) => (
              <div key={`tw-${r.id}`} style={{
                padding: "8px 12px", backgroundColor: BG, borderRadius: 8,
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{r.title}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {fmtDate(r.startAt)} · {fmtTime(r.startAt)}{r.endAt ? `–${fmtTime(r.endAt)}` : ""}
                    {r.assignee ? ` · ${r.assignee}` : ""}
                  </p>
                </div>
                <StatusPill label={r.eventType} tone={eventTypeTone(r.eventType)} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Event</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Title">
                <TextInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Quarterly Performance Reviews" />
              </FormField>
              <FormField label="Type">
                <Select value={form.eventType} onChange={e => setForm({ ...form, eventType: e.target.value as any })}>
                  {["attendance", "checkin", "review", "report", "training", "leave", "other"].map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormField>
              <FormField label="Start (date + time)">
                <TextInput type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} />
              </FormField>
              <FormField label="End (optional)">
                <TextInput type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} />
              </FormField>
              <FormField label="Assignee">
                <TextInput value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Staff name / division lead" />
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Description">
                <TextArea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What's the event for? Notes or agenda." />
              </FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.title.trim())   { toast.error("Title is required"); return; }
                if (!form.startAt.trim()) { toast.error("Start date/time is required"); return; }
                createMut.mutate({
                  title: form.title,
                  description: form.description || null,
                  startAt: new Date(form.startAt),
                  endAt: form.endAt ? new Date(form.endAt) : null,
                  eventType: form.eventType,
                  assignee: form.assignee || null,
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events in the next 30 days" hint="Add daily attendance, new-staff check-ins, reviews, reports, training, leave." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {dayKeys.map(day => (
              <div key={day}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.08em",
                  marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${GREEN}20`,
                }}>
                  {fmtDate(day)}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {groupedByDay[day].map((r: any) => (
                    <div key={r.id} style={{
                      padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.title}</p>
                            <StatusPill label={r.eventType} tone={eventTypeTone(r.eventType)} />
                          </div>
                          <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                            {fmtTime(r.startAt)}{r.endAt ? `–${fmtTime(r.endAt)}` : ""}
                            {r.assignee ? ` · ${r.assignee}` : ""}
                          </p>
                          {r.description && (
                            <p style={{ fontSize: 11, color: DARK, marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                              {r.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                          <Select value={r.eventType} onChange={e => updateMut.mutate({ id: r.id, eventType: e.target.value as any })}>
                            {["attendance", "checkin", "review", "report", "training", "leave", "other"].map(s => <option key={s} value={s}>{s}</option>)}
                          </Select>
                          <GhostButton onClick={() => { if (confirm("Remove this event?")) removeMut.mutate({ id: r.id }); }} color={RED}>
                            <Trash2 size={10} /> Remove
                          </GhostButton>
                        </div>
                      </div>
                    </div>
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
