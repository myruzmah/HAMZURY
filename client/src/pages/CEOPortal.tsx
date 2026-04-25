import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, Building2, Target as TargetIcon,
  DollarSign, Calendar as CalendarIcon, LogOut, ArrowLeft, Loader2,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, AlertCircle,
  Menu, X, Plus, Shield, Wallet, Briefcase, FileText, UserCheck,
  Settings as SettingsIcon, RefreshCw, Activity, Trash2, Send,
  Bell, Key, Eye, EyeOff, Megaphone, Inbox, CheckCheck, ChevronRight,
  Folder, ShieldCheck,
  Monitor, Cpu, Palette, FileBox, MessageSquare, Image as ImageIcon, CalendarCheck,
  StickyNote, Pin,
} from "lucide-react";

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY CEO PORTAL — Executive Control Center
 * Private, role-gated (founder, ceo). Oversight across departments.
 * Visual parity with CSOPortal: cream background, dark-green sidebar,
 * gold accents, same typography and component patterns.
 * ══════════════════════════════════════════════════════════════════════ */

/* Brand palette (mirrors CSOPortal) */
const BG = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";
const GREEN = "#1B4D3E";
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";

// 2026-04-25 — Section list aligned to Phase 2 CEO Strategic Command Center spec
// (9 tabs: Overview, Equipment, Software, Targets, Meetings, Branding QA,
// Documents Vault, Calendar, Notes). All 9 are now wired (Notes added
// 2026-04-25 — see NotesSection at the bottom of the file). Non-spec
// sections cut: departments, staff, finance, clients, weekly, vault,
// content, inbox, approvals, divisionUpdates, canvaTemplates. Data
// tables + tRPC routers retained for other portals; only the UI surfaces
// were removed.
type Section =
  | "dashboard" | "targets" | "calendar"
  | "equipment" | "software" | "brandingQa" | "documents"
  | "weeklyMeetings" | "notes";

/* Utilities */
function fmtNaira(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (isNaN(n)) return "—";
  return `₦${n.toLocaleString("en-NG")}`;
}
function fmtDate(d: string | null | undefined | Date): string {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return String(d); }
}
function fmtDateTime(d: string | null | undefined | Date): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-NG", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return String(d); }
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function monthEndISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

/** Shared hook so every section reacts to viewport width. */
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

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════ */
export default function CEOPortal() {
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

  // 2026-04-25 — NAV is now all 9 tabs in Phase 2 CEO spec.
  // Spec: Overview, Equipment, Software, Targets, Meetings, Branding QA,
  // Documents Vault, Calendar, Notes.
  const NAV: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "dashboard",       icon: LayoutDashboard, label: "Overview" },
    { key: "targets",         icon: TargetIcon,      label: "Targets & Alerts" },
    { key: "weeklyMeetings",  icon: CalendarCheck,   label: "Weekly Meetings" },
    { key: "brandingQa",      icon: Palette,         label: "Branding QA" },
    { key: "equipment",       icon: Monitor,         label: "Equipment Tracker" },
    { key: "software",        icon: Cpu,             label: "Software Vault" },
    { key: "documents",       icon: FileBox,         label: "Documents Vault" },
    { key: "calendar",        icon: CalendarIcon,    label: "Calendar & Audit" },
    { key: "notes",           icon: StickyNote,      label: "Notes" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PageMeta title="CEO Portal — HAMZURY" description="HAMZURY Executive Control Center — institutional oversight for the CEO." />

      {isMobile && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 40 }}
        />
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
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>CEO Portal</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>Executive Control</div>
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              style={{
                width: 30, height: 30, borderRadius: 8,
                backgroundColor: `${GOLD}15`, color: GOLD, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(({ key, icon: Icon, label }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActive(key);
                  if (isMobile) setMobileNavOpen(false);
                }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", marginBottom: 2, borderRadius: 10,
                  backgroundColor: isActive ? `${GOLD}20` : "transparent",
                  color: isActive ? GOLD : `${GOLD}70`,
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  transition: "all 0.15s",
                }}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 10px", borderTop: `1px solid ${GOLD}15` }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 10, color: `${GOLD}60`, fontSize: 12, textDecoration: "none",
            marginBottom: 2,
          }}>
            <ArrowLeft size={13} /> Back to HAMZURY
          </Link>
          <button
            onClick={logout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 10,
              color: `${GOLD}60`, backgroundColor: "transparent", border: "none",
              fontSize: 12, cursor: "pointer", textAlign: "left",
            }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{
        flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
        width: isMobile ? "100%" : "auto",
      }}>
        <header style={{
          padding: isMobile ? "12px 16px" : "14px 28px",
          backgroundColor: WHITE, borderBottom: `1px solid ${DARK}08`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
            {isMobile && (
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: `${GREEN}08`, color: GREEN,
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Menu size={18} />
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {NAV.find(n => n.key === active)?.label}
              </p>
              <p style={{
                fontSize: 13, color: DARK, fontWeight: 500, marginTop: 2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {user.name} · Chief Executive
              </p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${GREEN}10`, color: GREEN, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
            EXECUTIVE
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {/* 2026-04-25 — Dispatcher covers all 9 Phase 2 CEO tabs. */}
            {active === "dashboard"       && <CommandCenter onGoto={setActive} />}
            {active === "targets"         && <TargetsSection />}
            {active === "weeklyMeetings"  && <WeeklyMeetingsSection />}
            {active === "brandingQa"      && <BrandingQaSection />}
            {active === "equipment"       && <EquipmentSection />}
            {active === "software"        && <SoftwareSection />}
            {active === "documents"       && <DocumentsSection />}
            {active === "calendar"        && <CalendarAuditSection />}
            {active === "notes"           && <NotesSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 1. COMMAND CENTER — KPIs + Revenue + Escalations
 * ═══════════════════════════════════════════════════════════════════════ */
function CommandCenter({ onGoto }: { onGoto: (s: Section) => void }) {
  const statsQuery = trpc.institutional.stats.useQuery(undefined, { retry: false });
  const deptQuery = trpc.institutional.deptStats.useQuery(undefined, { retry: false });
  const revStatsQuery = trpc.commissions.revenueStats.useQuery(undefined, { retry: false });
  const escalationsQuery = trpc.institutional.escalations.useQuery(undefined, { retry: false });
  const aiFundQuery = trpc.finance.aiFund.useQuery(undefined, { retry: false });

  const stats = statsQuery.data;
  const deptStats = deptQuery.data || [];
  const revStats = revStatsQuery.data;
  const escalations = escalationsQuery.data || [];
  const aiFund = aiFundQuery.data;

  const totalCompleted = deptStats.reduce((s, d) => s + (d.completedTasks || 0), 0);
  const totalTasks = deptStats.reduce((s, d) => s + (d.totalTasks || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // 2026-04-25 — KPIs all link to "targets" since staff/departments/finance
  // were cut (those KPIs surface here read-only; deep dives live in HR/Finance portals).
  const kpis = [
    { label: "Active Staff",     value: stats?.totalStaff ?? "—",                 icon: UserCheck,     color: GREEN,     section: "targets" as Section },
    { label: "Total Leads",      value: stats?.totalLeads ?? "—",                 icon: TrendingUp,    color: BLUE,      section: "targets" as Section },
    { label: "Tasks Total",      value: stats?.totalTasks ?? "—",                 icon: Briefcase,     color: GOLD,      section: "targets" as Section },
    { label: "Completion %",     value: `${completionRate}%`,                     icon: CheckCircle2,  color: "#22C55E", section: "targets" as Section },
    { label: "Revenue (Paid)",   value: fmtNaira(revStats?.totalRevenue),         icon: DollarSign,    color: GREEN,     section: "targets" as Section },
    { label: "Revenue Pending",  value: fmtNaira(revStats?.pendingRevenue),       icon: Wallet,        color: ORANGE,    section: "targets" as Section },
    { label: "AI Fund Balance",  value: fmtNaira(aiFund?.balance),                icon: Activity,      color: PURPLE,    section: "targets" as Section },
    { label: "Escalations",      value: escalations.length,                       icon: AlertTriangle, color: RED,       section: "targets" as Section },
  ];

  return (
    <div>
      <SectionTitle sub="One-screen view of HAMZURY. Live data — no mock numbers.">
        Command Center
      </SectionTitle>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={() => onGoto(k.section)}
            style={{
              backgroundColor: WHITE, borderRadius: 14, padding: "14px 12px",
              border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              textAlign: "left", cursor: "pointer", transition: "transform 0.1s",
              minWidth: 0, overflow: "hidden",
            }}
          >
            <k.icon size={14} style={{ color: k.color, marginBottom: 8 }} />
            <p style={{
              fontSize: typeof k.value === "string" ? 14 : 20, fontWeight: 700, color: DARK, lineHeight: 1.15,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{k.value}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.label}</p>
          </button>
        ))}
      </div>

      {/* Revenue curve */}
      <div style={{ marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={14} style={{ color: GREEN }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Revenue Curve — Last 6 Months
              </p>
            </div>
            <span style={{ fontSize: 10, color: MUTED }}>
              {revStats ? `Paid ${fmtNaira(revStats.totalRevenue)}` : "—"}
            </span>
          </div>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={revStats?.monthlyRevenue || []} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${DARK}0A`} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} />
                <RTooltip formatter={(v: any) => fmtNaira(v)} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {(revStats?.monthlyRevenue || []).map((_: any, i: number) => (
                    <Cell key={i} fill={i === (revStats?.monthlyRevenue?.length || 0) - 1 ? GOLD : GREEN} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Escalation ticker */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={14} style={{ color: RED }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Escalations Needing Attention
            </p>
          </div>
          <button
            onClick={() => onGoto("targets")}
            style={{ background: "none", border: "none", color: GOLD, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
          >View all →</button>
        </div>
        {escalations.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing on fire" hint="No high-value blockers, unassigned leads, or pending payouts." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {escalations.slice(0, 6).map((e: any, i: number) => (
              <div key={`${e.ref}-${i}`} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "10px 12px", backgroundColor: `${BG}`, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <EscalationIcon type={e.type} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {e.label}
                    </p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {e.ref} · {e.status}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN, whiteSpace: "nowrap" }}>
                  {e.value ? fmtNaira(e.value) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function EscalationIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    high_value_task:   { icon: AlertTriangle, color: RED },
    unassigned_lead:   { icon: AlertCircle,   color: ORANGE },
    pending_payout:    { icon: Wallet,        color: GOLD },
  };
  const m = map[type] || { icon: AlertCircle, color: MUTED };
  const I = m.icon;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      backgroundColor: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <I size={14} style={{ color: m.color }} />
    </div>
  );
}

/* ── CUT 2026-04-25 — Departments removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p style={{ fontSize: 18, fontWeight: 700, color: DARK, lineHeight: 1.15 }}>{value}</p>
      <p style={{ fontSize: 10, color: MUTED, marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3. TARGETS & ALERTS — Create targets, view escalations
 * ═══════════════════════════════════════════════════════════════════════ */
function TargetsSection() {
  const utils = trpc.useUtils();
  const listQuery = trpc.targets.listAll.useQuery(undefined, { retry: false });
  const escQuery = trpc.institutional.escalations.useQuery(undefined, { retry: false });
  const [creating, setCreating] = useState(false);

  const targets = (listQuery.data || []) as any[];
  const today = todayISO();
  const activeTargets = targets.filter(t => t.status === "active" && t.periodEnd >= today);
  const completedTargets = targets.filter(t => t.status === "completed");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Set targets for each role. CSO, BizDev, Finance, and HR see theirs in their own portal.">
          Targets & Escalations
        </SectionTitle>
        <button
          onClick={() => setCreating(true)}
          style={{
            padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
            border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={14} /> New Target
        </button>
      </div>

      {/* Escalation center */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <AlertTriangle size={14} style={{ color: RED }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Escalation Center
          </p>
        </div>
        {(escQuery.data || []).length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All clear" hint="No high-value tasks blocked, no unassigned leads, no pending payouts." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(escQuery.data || []).map((e: any, i: number) => (
              <div key={`${e.ref}-${i}`} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <EscalationIcon type={e.type} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{e.label}</p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{e.type.replace(/_/g, " ")} · {e.ref}</p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>{e.value ? fmtNaira(e.value) : e.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active targets */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Active Targets — {activeTargets.length}
          </p>
        </div>
        {activeTargets.length === 0 ? (
          <EmptyState icon={TargetIcon} title="No active targets" hint="Click ‘New Target’ to set the first one." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeTargets.map(t => (
              <TargetRow key={t.id} target={t} onChanged={() => { utils.targets.listAll.invalidate(); }} />
            ))}
          </div>
        )}
      </Card>

      {/* Completed / cancelled */}
      {completedTargets.length > 0 && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Completed — {completedTargets.length}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {completedTargets.slice(0, 10).map(t => (
              <div key={t.id} style={{ fontSize: 11, color: MUTED, display: "flex", justifyContent: "space-between" }}>
                <span>{t.assignedTo} · {t.metric} — {t.targetValue}</span>
                <span>{fmtDate(t.periodEnd)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {creating && (
        <CreateTargetModal
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); utils.targets.listAll.invalidate(); }}
        />
      )}
    </div>
  );
}

function TargetRow({ target, onChanged }: { target: any; onChanged: () => void }) {
  const cancelMut = trpc.targets.cancel.useMutation({
    onSuccess: () => { toast.success("Target cancelled"); onChanged(); },
    onError: (e) => toast.error(e.message),
  });
  const onCancel = () => {
    if (!confirm(`Cancel this target for ${target.assignedTo}?`)) return;
    cancelMut.mutate({ id: target.id });
  };
  return (
    <div style={{
      padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
          {target.assignedTo.toUpperCase()} · {target.metric.replace(/_/g, " ")}
        </p>
        <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
          Target {target.targetValue} · {target.period} · {fmtDate(target.periodStart)} → {fmtDate(target.periodEnd)}
        </p>
        {target.notes && (
          <p style={{ fontSize: 10, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{target.notes}</p>
        )}
      </div>
      <button
        onClick={onCancel}
        disabled={cancelMut.isPending}
        style={{
          padding: "5px 10px", borderRadius: 8, backgroundColor: `${RED}10`, color: RED,
          border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <Trash2 size={11} /> Cancel
      </button>
    </div>
  );
}

function CreateTargetModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [assignedTo, setAssignedTo] = useState("cso");
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [metric, setMetric] = useState<"leads_qualified" | "proposals_sent" | "clients_onboarded" | "revenue_closed" | "custom">("leads_qualified");
  const [targetValue, setTargetValue] = useState("");
  const [notes, setNotes] = useState("");

  const [periodStart, setPeriodStart] = useState(todayISO());
  const [periodEnd, setPeriodEnd] = useState(monthEndISO());

  const createMut = trpc.targets.create.useMutation({
    onSuccess: () => { toast.success("Target created and notification sent."); onCreated(); },
    onError: (e) => toast.error(e.message || "Could not create target."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(targetValue);
    if (!n || n <= 0) { toast.error("Enter a positive target value."); return; }
    createMut.mutate({
      assignedTo, period, periodStart, periodEnd, metric,
      targetValue: n, notes: notes || undefined,
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        overflowY: "auto",
      }}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "100%", maxWidth: 480,
          maxHeight: "calc(100vh - 32px)", overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 4 }}>New Target</h3>

        <Field label="Assign to role">
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} style={inputStyle()}>
            <option value="cso">CSO</option>
            <option value="bizdev">BizDev</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="skills_staff">Skills</option>
            <option value="systemise_head">Systemise</option>
          </select>
        </Field>

        <Field label="Metric">
          <select value={metric} onChange={e => setMetric(e.target.value as any)} style={inputStyle()}>
            <option value="leads_qualified">Leads qualified</option>
            <option value="proposals_sent">Proposals sent</option>
            <option value="clients_onboarded">Clients onboarded</option>
            <option value="revenue_closed">Revenue closed (₦)</option>
            <option value="custom">Custom</option>
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Period">
            <select value={period} onChange={e => setPeriod(e.target.value as any)} style={inputStyle()}>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </Field>
          <Field label="Target value">
            <input
              type="number" min={0} step={1}
              value={targetValue} onChange={e => setTargetValue(e.target.value)}
              placeholder="e.g. 20"
              style={inputStyle()}
            />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Start">
            <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)} style={inputStyle()} />
          </Field>
          <Field label="End">
            <input type="date" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} style={inputStyle()} />
          </Field>
        </div>

        <Field label="Notes (optional)">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={2} style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
              border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={createMut.isPending}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
              border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6 }}>
            {createMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            Create Target
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`,
    fontSize: 12, color: DARK, backgroundColor: WHITE, outline: "none",
    fontFamily: "inherit",
  };
}

/* ── CUT 2026-04-25 — Staff Oversight (header + StaffSection) removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

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

/* ── CUT 2026-04-25 — IssueDisciplineModal removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ── CUT 2026-04-25 — Finance removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ═══════════════════════════════════════════════════════════════════════
 * 6. CALENDAR & AUDIT
 * ═══════════════════════════════════════════════════════════════════════ */
function CalendarAuditSection() {
  const isMobile = useIsMobile();
  const [creating, setCreating] = useState(false);
  const utils = trpc.useUtils();

  const rangeFrom = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  }, []);
  const rangeTo = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 2, 0, 23, 59, 59).toISOString();
  }, []);

  const calQuery = trpc.calendar.list.useQuery({ from: rangeFrom, to: rangeTo }, { retry: false });
  const auditQuery = trpc.institutional.auditLog.useQuery(undefined, { retry: false });

  const events = (calQuery.data || []) as any[];
  const audit = (auditQuery.data || []) as any[];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Institution-wide events and audit trail.">
          Calendar & Audit
        </SectionTitle>
        <button
          onClick={() => setCreating(true)}
          style={{
            padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
            border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={14} /> New Event
        </button>
      </div>

      {/* Upcoming events */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Upcoming — Next 60 Days
        </p>
        {events.length === 0 ? (
          <EmptyState icon={CalendarIcon} title="No scheduled events" hint="Add meetings, deadlines, renewals from here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {events.slice(0, 20).map((ev: any) => (
              <div key={ev.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", backgroundColor: BG, borderRadius: 8, gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <EventTypeDot type={ev.eventType} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{ev.title}</p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {fmtDateTime(ev.startAt)} · {ev.ownerName || "—"}
                    </p>
                  </div>
                </div>
                <StatusPill label={ev.eventType} tone="muted" />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Audit log */}
      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Audit Trail — Last {audit.length} Entries
        </p>
        {audit.length === 0 ? (
          <EmptyState icon={Activity} title="No audit entries yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 4, maxHeight: 420, overflowY: "auto" }}>
            {audit.slice(0, 60).map((a: any) => (
              isMobile ? (
                <div key={a.id} style={{
                  padding: "8px 10px", fontSize: 11, borderBottom: `1px solid ${DARK}06`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Clock size={11} style={{ color: MUTED, flexShrink: 0 }} />
                    <span style={{ color: DARK, fontWeight: 600 }}>{a.userName || "—"}</span>
                    <span style={{ color: GOLD, fontFamily: "monospace", fontSize: 10 }}>{a.action}</span>
                    <span style={{ color: MUTED, fontSize: 10, marginLeft: "auto" }}>{fmtDateTime(a.createdAt)}</span>
                  </div>
                  <p style={{
                    color: MUTED, marginTop: 4, fontSize: 10, lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}>{a.details}</p>
                </div>
              ) : (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 8px", fontSize: 11, borderBottom: `1px solid ${DARK}06`,
                }}>
                  <Clock size={11} style={{ color: MUTED, flexShrink: 0 }} />
                  <span style={{ color: DARK, fontWeight: 500, whiteSpace: "nowrap" }}>{a.userName || "—"}</span>
                  <span style={{ color: GOLD, fontFamily: "monospace", fontSize: 10, whiteSpace: "nowrap" }}>{a.action}</span>
                  <span style={{ color: MUTED, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.details}
                  </span>
                  <span style={{ color: MUTED, fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {fmtDateTime(a.createdAt)}
                  </span>
                </div>
              )
            ))}
          </div>
        )}
      </Card>

      {creating && (
        <CreateEventModal
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); utils.calendar.list.invalidate(); }}
        />
      )}
    </div>
  );
}

function EventTypeDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    meeting:   BLUE,
    follow_up: ORANGE,
    deadline:  RED,
    renewal:   GOLD,
    internal:  GREEN,
    other:     MUTED,
  };
  const c = colors[type] || MUTED;
  return <span style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c, flexShrink: 0 }} />;
}

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState(() => {
    const d = new Date(); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [eventType, setEventType] = useState<"meeting" | "deadline" | "renewal" | "internal" | "follow_up" | "other">("meeting");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const createMut = trpc.calendar.create.useMutation({
    onSuccess: () => { toast.success("Event added"); onCreated(); },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title required"); return; }
    createMut.mutate({
      title, startAt: new Date(startAt).toISOString(),
      eventType, visibility: "team",
      location: location || undefined,
      description: description || undefined,
      allDay: false,
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        overflowY: "auto",
      }}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "100%", maxWidth: 440,
          maxHeight: "calc(100vh - 32px)", overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 12,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK }}>New Calendar Event</h3>

        <Field label="Title">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle()} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Start">
            <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} style={inputStyle()} />
          </Field>
          <Field label="Type">
            <select value={eventType} onChange={e => setEventType(e.target.value as any)} style={inputStyle()}>
              <option value="meeting">Meeting</option>
              <option value="follow_up">Follow-up</option>
              <option value="deadline">Deadline</option>
              <option value="renewal">Renewal</option>
              <option value="internal">Internal</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>

        <Field label="Location (optional)">
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle()}
            placeholder="Zoom / HQ / Studio" />
        </Field>

        <Field label="Description (optional)">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
              border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={createMut.isPending}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
              border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {createMut.isPending ? "Saving…" : "Add Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── CUT 2026-04-25 — Active Clients + ClientDeepDive removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ── CUT 2026-04-25 — Weekly Targets + IssueWeeklyTargetModal removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ── CUT 2026-04-25 — Credentials Vault removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ── CUT 2026-04-25 — Content Ops removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ── CUT 2026-04-25 — Notifications removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* 2026-04 founder decision: localStorage-backed sections (Branding QA,
   Equipment Tracker, Software Vault, Division Updates, Approvals,
   Weekly Meetings) removed for launch. Re-add when migrated to MySQL. */

/* ── CUT 2026-04-25 — Approval Tiers + CeoInput removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ═══════════════════════════════════════════════════════════════════════
 * RESTORED SECTIONS — MySQL via tRPC `ceoOps.*` (server/ceoOps/router.ts).
 * The 7 sections that were cut at commit 136da29 are brought back here.
 * Patterns mirror BizDevPortal.tsx (multi-section CRUD, ids are int
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

/* ─── Equipment Tracker ───────────────────────────────────────────────── */
function EquipmentSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.equipment.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    name: "", category: "Other" as const,
    serial: "", assignedTo: "", location: "",
    purchaseDate: "", purchaseCost: "",
    condition: "Good" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.equipment.create.useMutation({
    onSuccess: () => {
      toast.success("Equipment added");
      utils.ceoOps.equipment.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.equipment.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.equipment.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.equipment.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.equipment.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Office equipment inventory — laptops, phones, peripherals. Track who has what.">
        Equipment Tracker
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="In Use" value={rows.filter(r => r.condition !== "Retired").length} color={GREEN} />
        <MiniStat label="Repair" value={rows.filter(r => r.condition === "Repair").length} color={ORANGE} />
        <MiniStat label="Retired" value={rows.filter(r => r.condition === "Retired").length} color={MUTED} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Equipment</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Name"><TextInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. MacBook Pro 14" /></FormField>
              <FormField label="Category">
                <SelectInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}>
                  {["Laptop", "Desktop", "Phone", "Tablet", "Camera", "Audio", "Peripheral", "Furniture", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Serial / Asset Tag"><TextInput value={form.serial} onChange={e => setForm({ ...form, serial: e.target.value })} /></FormField>
              <FormField label="Assigned To"><TextInput value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} placeholder="Staff name" /></FormField>
              <FormField label="Location"><TextInput value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="HQ / Remote" /></FormField>
              <FormField label="Purchase Date"><TextInput type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></FormField>
              <FormField label="Purchase Cost"><TextInput value={form.purchaseCost} onChange={e => setForm({ ...form, purchaseCost: e.target.value })} placeholder="e.g. ₦950k" /></FormField>
              <FormField label="Condition">
                <SelectInput value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as any })}>
                  {["New", "Good", "Fair", "Poor", "Repair", "Retired"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ marginBottom: 10 }}>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.name.trim()) { toast.error("Name is required"); return; }
                createMut.mutate({
                  name: form.name,
                  category: form.category,
                  serial: form.serial || null,
                  assignedTo: form.assignedTo || null,
                  location: form.location || null,
                  purchaseDate: form.purchaseDate || null,
                  purchaseCost: form.purchaseCost || null,
                  condition: form.condition,
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
          <EmptyState icon={Monitor} title="No equipment logged" hint="Track every laptop, phone, and peripheral here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.name}</p>
                      <StatusPill label={r.category} tone="muted" />
                      <StatusPill label={r.condition} tone={r.condition === "New" || r.condition === "Good" ? "green" : r.condition === "Repair" ? "orange" : r.condition === "Retired" ? "muted" : "gold"} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.assignedTo && <>Assigned: {r.assignedTo}</>}
                      {r.location && <> · {r.location}</>}
                      {r.serial && <> · S/N {r.serial}</>}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {r.purchaseDate && <>Purchased: {fmtDate(r.purchaseDate)}</>}
                      {r.purchaseCost && <> · {r.purchaseCost}</>}
                    </p>
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.condition} onChange={e => updateMut.mutate({ id: r.id, condition: e.target.value as any })}>
                      {["New", "Good", "Fair", "Poor", "Repair", "Retired"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this equipment?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ─── Software Vault ──────────────────────────────────────────────────── */
function SoftwareSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.software.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    name: "", vendor: "", category: "",
    licenseKey: "",
    seats: 0, seatsUsed: 0,
    monthlyCost: "", renewalDate: "",
    status: "Active" as const,
    primaryUser: "",
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.software.create.useMutation({
    onSuccess: () => {
      toast.success("Software added");
      utils.ceoOps.software.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.software.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.software.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.software.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.software.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="License keys, subscriptions, seats, renewals. Review annually — still needed?">
        Software Vault
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Active" value={rows.filter(r => r.status === "Active").length} color={GREEN} />
        <MiniStat label="Trial" value={rows.filter(r => r.status === "Trial").length} color={GOLD} />
        <MiniStat label="Expired" value={rows.filter(r => r.status === "Expired").length} color={RED} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Software</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Name"><TextInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Notion" /></FormField>
              <FormField label="Vendor"><TextInput value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} /></FormField>
              <FormField label="Category"><TextInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Productivity" /></FormField>
              <FormField label="Seats"><TextInput type="number" value={form.seats || ""} onChange={e => setForm({ ...form, seats: Number(e.target.value) })} /></FormField>
              <FormField label="Seats Used"><TextInput type="number" value={form.seatsUsed || ""} onChange={e => setForm({ ...form, seatsUsed: Number(e.target.value) })} /></FormField>
              <FormField label="Monthly Cost"><TextInput value={form.monthlyCost} onChange={e => setForm({ ...form, monthlyCost: e.target.value })} placeholder="e.g. ₦15k" /></FormField>
              <FormField label="Renewal Date"><TextInput type="date" value={form.renewalDate} onChange={e => setForm({ ...form, renewalDate: e.target.value })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Active", "Trial", "Expired", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Primary User"><TextInput value={form.primaryUser} onChange={e => setForm({ ...form, primaryUser: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="License Key / Account"><TextInput value={form.licenseKey} onChange={e => setForm({ ...form, licenseKey: e.target.value })} placeholder="abcd-efgh-…" /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.name.trim()) { toast.error("Name is required"); return; }
                createMut.mutate({
                  name: form.name,
                  vendor: form.vendor || null,
                  category: form.category || null,
                  licenseKey: form.licenseKey || null,
                  seats: form.seats || null,
                  seatsUsed: form.seatsUsed || null,
                  monthlyCost: form.monthlyCost || null,
                  renewalDate: form.renewalDate || null,
                  status: form.status,
                  primaryUser: form.primaryUser || null,
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
          <EmptyState icon={Cpu} title="No software tracked" hint="Add subscriptions, license keys, and renewals." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.name}</p>
                      <StatusPill label={r.status} tone={r.status === "Active" ? "green" : r.status === "Trial" ? "gold" : r.status === "Expired" ? "red" : "muted"} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.vendor && <>Vendor: {r.vendor}</>}
                      {r.category && <> · {r.category}</>}
                      {r.monthlyCost && <> · {r.monthlyCost}/mo</>}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {(r.seats !== null || r.seatsUsed !== null) && (
                        <>Seats: {r.seatsUsed || 0} / {r.seats || 0}</>
                      )}
                      {r.renewalDate && <> · Renews {fmtDate(r.renewalDate)}</>}
                      {r.primaryUser && <> · {r.primaryUser}</>}
                    </p>
                    {r.licenseKey && <p style={{ fontSize: 10, color: MUTED, marginTop: 4, fontFamily: "monospace" }}>Key: {r.licenseKey}</p>}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Active", "Trial", "Expired", "Cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this software?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ─── Branding QA ─────────────────────────────────────────────────────── */
function BrandingQaSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.brandingQa.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    reviewDate: todayISO(),
    division: "Other" as const,
    contentType: "", contentRef: "",
    checklist: "",
    passRate: 0,
    outcome: "Pending" as const,
    reviewer: "", notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.brandingQa.create.useMutation({
    onSuccess: () => {
      toast.success("QA review logged");
      utils.ceoOps.brandingQa.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.brandingQa.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.brandingQa.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.brandingQa.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.brandingQa.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Weekly brand-compliance reviews per division. Run every Thursday 10–11 AM.">
        Branding QA
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Approved" value={rows.filter(r => r.outcome === "Approved").length} color={GREEN} />
        <MiniStat label="Needs Revision" value={rows.filter(r => r.outcome === "Needs Revision").length} color={GOLD} />
        <MiniStat label="Rejected" value={rows.filter(r => r.outcome === "Rejected").length} color={RED} />
        <MiniStat label="Pending" value={rows.filter(r => r.outcome === "Pending").length} color={MUTED} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New QA Review</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Review Date"><TextInput type="date" value={form.reviewDate} onChange={e => setForm({ ...form, reviewDate: e.target.value })} /></FormField>
              <FormField label="Division">
                <SelectInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value as any })}>
                  {["Bizdoc", "Scalar", "Medialy", "HUB", "Podcast", "Video", "BizDev", "CSO", "Skills", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Content Type"><TextInput value={form.contentType} onChange={e => setForm({ ...form, contentType: e.target.value })} placeholder="Social post / Proposal / Deck" /></FormField>
              <FormField label="Content Reference"><TextInput value={form.contentRef} onChange={e => setForm({ ...form, contentRef: e.target.value })} placeholder="URL or filename" /></FormField>
              <FormField label="Pass Rate %"><TextInput type="number" min={0} max={100} value={form.passRate || ""} onChange={e => setForm({ ...form, passRate: Number(e.target.value) })} /></FormField>
              <FormField label="Outcome">
                <SelectInput value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value as any })}>
                  {["Approved", "Needs Revision", "Rejected", "Pending"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Reviewer"><TextInput value={form.reviewer} onChange={e => setForm({ ...form, reviewer: e.target.value })} /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Checklist Issues (one per line)"><TextArea value={form.checklist} onChange={e => setForm({ ...form, checklist: e.target.value })} placeholder="Wrong background colour&#10;Logo too close to edge&#10;Tone too aggressive" /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.reviewDate) { toast.error("Review date is required"); return; }
                createMut.mutate({
                  reviewDate: form.reviewDate,
                  division: form.division,
                  contentType: form.contentType || null,
                  contentRef: form.contentRef || null,
                  checklist: splitLines(form.checklist),
                  passRate: form.passRate || null,
                  outcome: form.outcome,
                  reviewer: form.reviewer || null,
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
          <EmptyState icon={Palette} title="No QA reviews yet" hint="Run weekly brand reviews and log outcomes here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.division} · {fmtDate(r.reviewDate)}</p>
                      <StatusPill label={r.outcome} tone={r.outcome === "Approved" ? "green" : r.outcome === "Rejected" ? "red" : r.outcome === "Needs Revision" ? "gold" : "muted"} />
                      {typeof r.passRate === "number" && r.passRate > 0 && (
                        <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>{r.passRate}% pass</span>
                      )}
                    </div>
                    {(r.contentType || r.contentRef) && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                        {r.contentType && <>{r.contentType}</>}
                        {r.contentRef && <> · {r.contentRef}</>}
                      </p>
                    )}
                    {Array.isArray(r.checklist) && r.checklist.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong>Issues:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.checklist.map((c: string, i: number) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.reviewer && <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Reviewer: {r.reviewer}</p>}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.outcome} onChange={e => updateMut.mutate({ id: r.id, outcome: e.target.value as any })}>
                      {["Approved", "Needs Revision", "Rejected", "Pending"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
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

/* ─── Documents Vault ─────────────────────────────────────────────────── */
function DocumentsSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.documents.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    title: "",
    category: "Other" as const,
    storageLocation: "",
    ownerName: "",
    expiryDate: "",
    tags: "",
    status: "Active" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.documents.create.useMutation({
    onSuccess: () => {
      toast.success("Document logged");
      utils.ceoOps.documents.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.documents.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.documents.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.documents.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.documents.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Important company documents — contracts, certificates, IDs, internal docs.">
        Documents Vault
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Active" value={rows.filter(r => r.status === "Active").length} color={GREEN} />
        <MiniStat label="Pending" value={rows.filter(r => r.status === "Pending").length} color={GOLD} />
        <MiniStat label="Expired" value={rows.filter(r => r.status === "Expired").length} color={RED} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Document</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Title"><TextInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. CAC Certificate" /></FormField>
              <FormField label="Category">
                <SelectInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}>
                  {["Legal", "Financial", "Operational", "Strategic", "HR", "Client", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Owner"><TextInput value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} placeholder="Custodian / dept" /></FormField>
              <FormField label="Expiry Date"><TextInput type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Active", "Pending", "Expired", "Archived"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Storage Location"><TextInput value={form.storageLocation} onChange={e => setForm({ ...form, storageLocation: e.target.value })} placeholder="Drive URL / cabinet ref / vault path" /></FormField>
              <FormField label="Tags (one per line)"><TextArea value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="cac&#10;compliance&#10;2026" /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.title.trim()) { toast.error("Title is required"); return; }
                createMut.mutate({
                  title: form.title,
                  category: form.category,
                  storageLocation: form.storageLocation || null,
                  ownerName: form.ownerName || null,
                  expiryDate: form.expiryDate || null,
                  tags: splitLines(form.tags),
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
          <EmptyState icon={FileBox} title="No documents logged" hint="Track every contract, certificate, and ID here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.title}</p>
                      <StatusPill label={r.category} tone="muted" />
                      <StatusPill label={r.status} tone={r.status === "Active" ? "green" : r.status === "Pending" ? "gold" : r.status === "Expired" ? "red" : "muted"} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {r.ownerName && <>Owner: {r.ownerName}</>}
                      {r.expiryDate && <> · Expires {fmtDate(r.expiryDate)}</>}
                    </p>
                    {r.storageLocation && <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>📁 {r.storageLocation}</p>}
                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {r.tags.map((tag: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: GOLD, fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Active", "Pending", "Expired", "Archived"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this document?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ── CUT 2026-04-25 — Division Updates removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ── CUT 2026-04-25 — Canva Templates removed (not in Phase 2 spec for CEO Strategic Command Center). ── */

/* ─── Weekly Meetings ─────────────────────────────────────────────────── */
function WeeklyMeetingsSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.weeklyMeetings.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    meetingDate: todayISO(),
    meetingType: "Monday Kickoff" as const,
    attendees: "",
    agenda: "",
    decisions: "",
    actionItems: "",
    durationMinutes: 30,
    facilitator: "",
    status: "Planned" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.weeklyMeetings.create.useMutation({
    onSuccess: () => {
      toast.success("Meeting logged");
      utils.ceoOps.weeklyMeetings.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.weeklyMeetings.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.weeklyMeetings.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.weeklyMeetings.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.weeklyMeetings.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Monday kickoff / Wed midweek / Fri wrap. Agenda, attendance, decisions, actions.">
        Weekly Meetings
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Held" value={rows.filter(r => r.status === "Held").length} color={GREEN} />
        <MiniStat label="Planned" value={rows.filter(r => r.status === "Planned").length} color={GOLD} />
        <MiniStat label="Cancelled" value={rows.filter(r => r.status === "Cancelled").length} color={RED} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Meeting</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Meeting Date"><TextInput type="date" value={form.meetingDate} onChange={e => setForm({ ...form, meetingDate: e.target.value })} /></FormField>
              <FormField label="Type">
                <SelectInput value={form.meetingType} onChange={e => setForm({ ...form, meetingType: e.target.value as any })}>
                  {["Monday Kickoff", "Wednesday Midweek", "Friday Wrap", "Branding QA", "Ad-hoc", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Facilitator"><TextInput value={form.facilitator} onChange={e => setForm({ ...form, facilitator: e.target.value })} /></FormField>
              <FormField label="Duration (min)"><TextInput type="number" value={form.durationMinutes || ""} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Planned", "Held", "Cancelled", "Postponed"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Attendees (one per line)"><TextArea value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} placeholder="Muhammad Hamzury&#10;Isa Ibrahim&#10;…" /></FormField>
              <FormField label="Agenda (one per line)"><TextArea value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} placeholder="Opening&#10;Division briefs&#10;Priorities" /></FormField>
              <FormField label="Decisions (one per line)"><TextArea value={form.decisions} onChange={e => setForm({ ...form, decisions: e.target.value })} placeholder="Approved budget for new hire" /></FormField>
              <FormField label="Action Items (one per line)"><TextArea value={form.actionItems} onChange={e => setForm({ ...form, actionItems: e.target.value })} placeholder="Isa: send proposal by Wed&#10;Hauwa: post recap" /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.meetingDate) { toast.error("Meeting date is required"); return; }
                createMut.mutate({
                  meetingDate: form.meetingDate,
                  meetingType: form.meetingType,
                  attendees: splitLines(form.attendees),
                  agenda: splitLines(form.agenda),
                  decisions: splitLines(form.decisions),
                  actionItems: splitLines(form.actionItems),
                  durationMinutes: form.durationMinutes || null,
                  facilitator: form.facilitator || null,
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
          <EmptyState icon={CalendarCheck} title="No meetings logged" hint="Track every Monday/Wed/Fri sync. Discipline > intensity." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.meetingType} · {fmtDate(r.meetingDate)}</p>
                      <StatusPill label={r.status} tone={r.status === "Held" ? "green" : r.status === "Planned" ? "gold" : r.status === "Cancelled" ? "red" : "muted"} />
                      {r.durationMinutes && <span style={{ fontSize: 10, color: MUTED }}>{r.durationMinutes}min</span>}
                    </div>
                    {r.facilitator && <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Facilitator: {r.facilitator}</p>}
                    {Array.isArray(r.attendees) && r.attendees.length > 0 && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                        Attendees: {r.attendees.join(", ")}
                      </p>
                    )}
                    {Array.isArray(r.agenda) && r.agenda.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong>Agenda:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.agenda.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(r.decisions) && r.decisions.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong style={{ color: GREEN }}>Decisions:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.decisions.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(r.actionItems) && r.actionItems.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong style={{ color: GOLD }}>Action items:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.actionItems.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Planned", "Held", "Cancelled", "Postponed"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this meeting?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ─── Notes (Phase 2 CEO tab 9) ───────────────────────────────────────────
 * Strategic decisions, observations, ideas, and a parking lot for
 * non-urgent thinking. MySQL via tRPC `ceoOps.notes.*`. */
function NotesSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.notes.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    title: "",
    body: "",
    category: "other" as const,
    pinned: false,
    tags: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.notes.create.useMutation({
    onSuccess: () => {
      toast.success("Note saved");
      utils.ceoOps.notes.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.notes.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.notes.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.notes.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.notes.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const categoryTone = (c: string): "green" | "gold" | "red" | "blue" | "muted" | "orange" => {
    switch (c) {
      case "strategy":    return "green";
      case "observation": return "blue";
      case "idea":        return "gold";
      case "decision":    return "orange";
      case "parking":     return "muted";
      default:            return "muted";
    }
  };

  return (
    <div>
      <SectionTitle sub="Strategic decisions, observations, ideas, and the parking lot for non-urgent thinking.">
        Notes
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Pinned" value={rows.filter(r => r.pinned).length} color={GOLD} />
        <MiniStat label="Strategy" value={rows.filter(r => r.category === "strategy").length} color={GREEN} />
        <MiniStat label="Decisions" value={rows.filter(r => r.category === "decision").length} color={ORANGE} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Note</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Title"><TextInput value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Pivot Bizdoc pricing" /></FormField>
              <FormField label="Category">
                <SelectInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}>
                  {["strategy", "observation", "idea", "decision", "parking", "other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Body">
                <TextArea
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="What's the thought? Capture the why, not just the what."
                  style={{ minHeight: 120 }}
                />
              </FormField>
              <FormField label="Tags (one per line)">
                <TextArea value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="pricing&#10;q3&#10;cso" />
              </FormField>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: DARK, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm({ ...form, pinned: e.target.checked })}
                />
                <Pin size={12} style={{ color: GOLD }} /> Pin this note to the top
              </label>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.title.trim()) { toast.error("Title is required"); return; }
                if (!form.body.trim())  { toast.error("Body is required");  return; }
                createMut.mutate({
                  title: form.title,
                  body: form.body,
                  category: form.category,
                  pinned: form.pinned,
                  tags: splitLines(form.tags),
                });
              }}
              disabled={createMut.isPending}
            >Save</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={StickyNote} title="No notes captured yet" hint="Use this for strategic thoughts, decisions, and the parking lot." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10,
                border: `1px solid ${r.pinned ? GOLD + "40" : DARK + "06"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      {r.pinned && <Pin size={12} style={{ color: GOLD }} />}
                      <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{r.title}</p>
                      <StatusPill label={r.category} tone={categoryTone(r.category)} />
                    </div>
                    <p style={{ fontSize: 12, color: DARK, marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                      {r.body}
                    </p>
                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                        {r.tags.map((tag: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: GOLD, fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>
                      {fmtDateTime(r.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.category} onChange={e => updateMut.mutate({ id: r.id, category: e.target.value as any })}>
                      {["strategy", "observation", "idea", "decision", "parking", "other"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => updateMut.mutate({ id: r.id, pinned: !r.pinned })} color={r.pinned ? GOLD : MUTED}>
                      <Pin size={10} /> {r.pinned ? "Unpin" : "Pin"}
                    </GhostButton>
                    <GhostButton onClick={() => { if (confirm("Remove this note?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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
