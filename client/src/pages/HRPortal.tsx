import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, AlertCircle, ClipboardList,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock,
  Menu, X, Shield, Send, UserCheck, UserX,
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

type Section = "dashboard" | "roster" | "leave" | "discipline" | "attendance" | "reports";

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
    { key: "dashboard",  icon: LayoutDashboard, label: "Overview" },
    { key: "roster",     icon: Users,           label: "Staff Roster" },
    { key: "leave",      icon: CalendarIcon,    label: "Leave Requests" },
    { key: "discipline", icon: AlertCircle,     label: "Discipline" },
    { key: "attendance", icon: UserCheck,       label: "Attendance" },
    { key: "reports",    icon: ClipboardList,   label: "Reports" },
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
            {active === "dashboard"  && <OverviewSection onGoto={setActive} />}
            {active === "roster"     && <RosterSection />}
            {active === "leave"      && <LeaveSection />}
            {active === "discipline" && <DisciplineSection />}
            {active === "attendance" && <AttendanceSection />}
            {active === "reports"    && <ReportsSection />}
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
