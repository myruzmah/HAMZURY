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

type Section =
  | "dashboard" | "departments" | "targets" | "staff" | "finance" | "calendar"
  | "clients" | "weekly" | "vault" | "content" | "inbox"
  | "approvals"
  // 2026-04 — restored sections (MySQL via tRPC `ceoOps.*`).
  | "equipment" | "software" | "brandingQa" | "documents"
  | "divisionUpdates" | "canvaTemplates" | "weeklyMeetings";

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

  const NAV: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "dashboard",       icon: LayoutDashboard, label: "Command Center" },
    { key: "clients",         icon: Folder,          label: "Active Clients" },
    { key: "departments",     icon: Building2,       label: "Departments" },
    { key: "targets",         icon: TargetIcon,      label: "Targets & Alerts" },
    { key: "weekly",          icon: CheckCheck,      label: "Weekly Targets" },
    { key: "staff",           icon: Users,           label: "Staff Oversight" },
    { key: "finance",         icon: DollarSign,      label: "Finance" },
    { key: "content",         icon: Megaphone,       label: "Content Ops" },
    { key: "vault",           icon: Key,             label: "Credentials Vault" },
    { key: "approvals",       icon: ShieldCheck,     label: "Approvals" },
    // ── Restored sections (cut at 136da29, brought back 2026-04) ─────────────
    { key: "equipment",       icon: Monitor,         label: "Equipment Tracker" },
    { key: "software",        icon: Cpu,             label: "Software Vault" },
    { key: "brandingQa",      icon: Palette,         label: "Branding QA" },
    { key: "documents",       icon: FileBox,         label: "Documents Vault" },
    { key: "divisionUpdates", icon: MessageSquare,   label: "Division Updates" },
    { key: "canvaTemplates",  icon: ImageIcon,       label: "Canva Templates" },
    { key: "weeklyMeetings",  icon: CalendarCheck,   label: "Weekly Meetings" },
    // ────────────────────────────────────────────────────────────────────────
    { key: "calendar",        icon: CalendarIcon,    label: "Calendar & Audit" },
    { key: "inbox",           icon: Inbox,           label: "Notifications" },
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
            {active === "dashboard"       && <CommandCenter onGoto={setActive} />}
            {active === "clients"         && <ClientsSection />}
            {active === "departments"     && <DepartmentsSection />}
            {active === "targets"         && <TargetsSection />}
            {active === "weekly"          && <WeeklyTargetsSection />}
            {active === "staff"           && <StaffSection />}
            {active === "finance"         && <FinanceSection />}
            {active === "content"         && <ContentOpsSection />}
            {active === "vault"           && <CredentialsVaultSection />}
            {active === "approvals"       && <ApprovalTiersSection />}
            {active === "equipment"       && <EquipmentSection />}
            {active === "software"        && <SoftwareSection />}
            {active === "brandingQa"      && <BrandingQaSection />}
            {active === "documents"       && <DocumentsSection />}
            {active === "divisionUpdates" && <DivisionUpdatesSection />}
            {active === "canvaTemplates"  && <CanvaTemplatesSection />}
            {active === "weeklyMeetings"  && <WeeklyMeetingsSection />}
            {active === "calendar"        && <CalendarAuditSection />}
            {active === "inbox"           && <NotificationsSection />}
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

  const kpis = [
    { label: "Active Staff",     value: stats?.totalStaff ?? "—",                 icon: UserCheck,     color: GREEN,     section: "staff" as Section },
    { label: "Total Leads",      value: stats?.totalLeads ?? "—",                 icon: TrendingUp,    color: BLUE,      section: "departments" as Section },
    { label: "Tasks Total",      value: stats?.totalTasks ?? "—",                 icon: Briefcase,     color: GOLD,      section: "departments" as Section },
    { label: "Completion %",     value: `${completionRate}%`,                     icon: CheckCircle2,  color: "#22C55E", section: "departments" as Section },
    { label: "Revenue (Paid)",   value: fmtNaira(revStats?.totalRevenue),         icon: DollarSign,    color: GREEN,     section: "finance" as Section },
    { label: "Revenue Pending",  value: fmtNaira(revStats?.pendingRevenue),       icon: Wallet,        color: ORANGE,    section: "finance" as Section },
    { label: "AI Fund Balance",  value: fmtNaira(aiFund?.balance),                icon: Activity,      color: PURPLE,    section: "finance" as Section },
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

/* ═══════════════════════════════════════════════════════════════════════
 * 2. DEPARTMENTS — 3-card health view
 * ═══════════════════════════════════════════════════════════════════════ */
function DepartmentsSection() {
  const isMobile = useIsMobile();
  const deptQuery = trpc.institutional.deptStats.useQuery(undefined, { retry: false });
  const staffQuery = trpc.staff.listInternal.useQuery(undefined, { retry: false });

  const rows = deptQuery.data || [];
  const staff = staffQuery.data || [];

  const DEPTS: { key: string; label: string; color: string; lead?: string }[] = [
    { key: "bizdoc",    label: "Bizdoc Consult",      color: "#1B4D3E", lead: "Abdullahi Musa" },
    { key: "scalar",    label: "Scalar",              color: "#D4A017", lead: "Dajot" },
    { key: "medialy",   label: "Medialy",             color: "#1D4ED8", lead: "Hikma" },
    { key: "hub",       label: "HUB",                 color: "#1E3A5F", lead: "Idris" },
  ];

  return (
    <div>
      <SectionTitle sub="Department health at a glance. Tap a card to see the full roster.">
        Department Oversight
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        {DEPTS.map(d => {
          const s = rows.find(r => r.dept === d.key);
          const completion = s?.completionRate ?? 0;
          const tone: "green" | "gold" | "red" = completion >= 70 ? "green" : completion >= 40 ? "gold" : "red";
          return (
            <Card key={d.key} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", backgroundColor: `${d.color}10`, borderBottom: `1px solid ${DARK}06` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{d.label}</p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Lead: {d.lead}</p>
                  </div>
                  <StatusPill
                    label={tone === "green" ? "Healthy" : tone === "gold" ? "Watch" : "Attention"}
                    tone={tone}
                  />
                </div>
              </div>
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Metric label="Tasks Total"   value={s?.totalTasks ?? 0} />
                <Metric label="Completed"     value={s?.completedTasks ?? 0} />
                <Metric label="Leads"         value={s?.totalLeads ?? 0} />
                <Metric label="Completion %"  value={`${completion}%`} />
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ height: 6, backgroundColor: `${DARK}08`, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${completion}%`, backgroundColor: d.color, transition: "width 0.3s" }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <SectionTitle sub="All internal staff across HAMZURY — last login, role, department.">
          Staff Roster
        </SectionTitle>
        {staff.length === 0 ? (
          <EmptyState icon={Users} title="Loading staff roster…" />
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {staff.map((s: any) => (
              <div key={s.staffId} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{s.name}</p>
                  <StatusPill label={s.status} tone={s.status === "Active" ? "green" : "muted"} />
                </div>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 4, fontFamily: "monospace" }}>
                  {s.role} · {s.dept}
                </p>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                  Last login: {s.lastLogin || "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <th style={{ padding: "8px 10px" }}>Name</th>
                  <th style={{ padding: "8px 10px" }}>Role</th>
                  <th style={{ padding: "8px 10px" }}>Dept</th>
                  <th style={{ padding: "8px 10px" }}>Last Login</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s: any) => (
                  <tr key={s.staffId} style={{ borderTop: `1px solid ${DARK}06` }}>
                    <td style={{ padding: "10px 10px", fontWeight: 500, color: DARK }}>{s.name}</td>
                    <td style={{ padding: "10px 10px", color: MUTED, fontFamily: "monospace", fontSize: 11 }}>{s.role}</td>
                    <td style={{ padding: "10px 10px", color: MUTED }}>{s.dept}</td>
                    <td style={{ padding: "10px 10px", color: MUTED }}>{s.lastLogin || "—"}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <StatusPill label={s.status} tone={s.status === "Active" ? "green" : "muted"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

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

/* ═══════════════════════════════════════════════════════════════════════
 * 4. STAFF OVERSIGHT — Roster, discipline, leave
 * ═══════════════════════════════════════════════════════════════════════ */
function StaffSection() {
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const staffQuery = trpc.staff.listInternal.useQuery(undefined, { retry: false });
  const disciplineQuery = trpc.discipline.list.useQuery({}, { retry: false });
  const leaveQuery = trpc.leave.list.useQuery({}, { retry: false });

  const [disciplining, setDisciplining] = useState<{ email: string; name: string } | null>(null);
  const [search, setSearch] = useState("");

  const staff = (staffQuery.data || []) as any[];
  const filtered = staff.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const openDiscipline = (disciplineQuery.data || []).filter((d: any) => d.status !== "resolved");
  const pendingLeave = (leaveQuery.data || []).filter((l: any) => l.status === "pending");

  const resolveMut = trpc.discipline.resolve.useMutation({
    onSuccess: () => { toast.success("Resolved"); utils.discipline.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const leaveReviewMut = trpc.leave.review.useMutation({
    onSuccess: () => { toast.success("Leave reviewed"); utils.leave.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Roster, discipline log, leave requests. Executive oversight — not personal dashboards.">
        Staff Oversight
      </SectionTitle>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Total Staff"       value={staff.length} color={GREEN} />
        <MiniStat label="Active"            value={staff.filter(s => s.status === "Active").length} color="#22C55E" />
        <MiniStat label="Open Discipline"   value={openDiscipline.length} color={RED} />
        <MiniStat label="Pending Leave"     value={pendingLeave.length} color={ORANGE} />
      </div>

      {/* Pending leave */}
      {pendingLeave.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Leave Requests Awaiting You
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingLeave.map((l: any) => (
              <div key={l.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {l.staffName} <span style={{ color: MUTED, fontWeight: 400 }}>· {l.staffEmail}</span>
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {fmtDate(l.startDate)} → {fmtDate(l.endDate)} · {l.reason || "(no reason given)"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => leaveReviewMut.mutate({ id: l.id, status: "approved" })}
                    disabled={leaveReviewMut.isPending}
                    style={{
                      padding: "5px 10px", borderRadius: 8, backgroundColor: "#22C55E15", color: "#22C55E",
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}
                  >Approve</button>
                  <button
                    onClick={() => leaveReviewMut.mutate({ id: l.id, status: "rejected" })}
                    disabled={leaveReviewMut.isPending}
                    style={{
                      padding: "5px 10px", borderRadius: 8, backgroundColor: `${RED}10`, color: RED,
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}
                  >Reject</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Discipline records */}
      {openDiscipline.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Open Discipline Records
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {openDiscipline.map((d: any) => (
              <div key={d.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{d.staffName}</p>
                    <StatusPill label={d.type} tone={d.type === "suspension" ? "red" : "orange"} />
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{d.reason}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    By {d.issuedBy} · {fmtDate(d.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const note = prompt(`Resolution note for ${d.staffName}?`);
                    if (!note) return;
                    resolveMut.mutate({ id: d.id, resolvedNotes: note });
                  }}
                  disabled={resolveMut.isPending}
                  style={{
                    padding: "5px 10px", borderRadius: 8, backgroundColor: `${GREEN}15`, color: GREEN,
                    border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                  }}
                >Resolve</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Staff roster + inline discipline action */}
      <Card>
        <div style={{
          display: "flex", alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between", marginBottom: 12, gap: 10,
          flexDirection: isMobile ? "column" : "row",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Staff Roster
          </p>
          <input
            type="search"
            placeholder="Search name, email, role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(), width: isMobile ? "100%" : 220 }}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No matching staff" />
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((s: any) => (
              <div key={s.staffId} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{s.name}</p>
                    <p style={{
                      fontSize: 10, color: MUTED, marginTop: 2,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{s.email}</p>
                  </div>
                  <button
                    onClick={() => setDisciplining({ email: s.email, name: s.name })}
                    style={{
                      padding: "4px 10px", borderRadius: 8, backgroundColor: `${ORANGE}12`, color: ORANGE,
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                    }}
                  >Issue</button>
                </div>
                <div style={{
                  display: "flex", gap: 10, marginTop: 6, fontSize: 10, color: MUTED, flexWrap: "wrap",
                }}>
                  <span style={{ fontFamily: "monospace" }}>{s.role}</span>
                  <span>·</span>
                  <span>{s.dept}</span>
                  <span>·</span>
                  <span>Last: {s.lastLogin || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <th style={{ padding: "8px 10px" }}>Name</th>
                  <th style={{ padding: "8px 10px" }}>Role</th>
                  <th style={{ padding: "8px 10px" }}>Dept</th>
                  <th style={{ padding: "8px 10px" }}>Last Login</th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any) => (
                  <tr key={s.staffId} style={{ borderTop: `1px solid ${DARK}06` }}>
                    <td style={{ padding: "10px 10px", fontWeight: 500, color: DARK }}>
                      {s.name}
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.email}</div>
                    </td>
                    <td style={{ padding: "10px 10px", color: MUTED, fontFamily: "monospace", fontSize: 11 }}>{s.role}</td>
                    <td style={{ padding: "10px 10px", color: MUTED }}>{s.dept}</td>
                    <td style={{ padding: "10px 10px", color: MUTED }}>{s.lastLogin || "—"}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <button
                        onClick={() => setDisciplining({ email: s.email, name: s.name })}
                        style={{
                          padding: "4px 10px", borderRadius: 8, backgroundColor: `${ORANGE}12`, color: ORANGE,
                          border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        Issue
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {disciplining && (
        <IssueDisciplineModal
          staff={disciplining}
          onClose={() => setDisciplining(null)}
          onIssued={() => {
            setDisciplining(null);
            utils.discipline.list.invalidate();
          }}
        />
      )}
    </div>
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

function IssueDisciplineModal({
  staff, onClose, onIssued,
}: { staff: { email: string; name: string }; onClose: () => void; onIssued: () => void }) {
  const { user } = useAuth();
  const [type, setType] = useState<"query" | "suspension">("query");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("");

  const issueMut = trpc.discipline.issue.useMutation({
    onSuccess: () => { toast.success("Discipline record issued."); onIssued(); },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { toast.error("Reason is required."); return; }
    issueMut.mutate({
      staffEmail: staff.email, staffName: staff.name, type, reason,
      description: description || undefined,
      suspensionDays: type === "suspension" && days ? parseInt(days) : undefined,
      issuedBy: user?.name || user?.email || "CEO",
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
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK }}>Issue Discipline Record</h3>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>For {staff.name} ({staff.email})</p>
        </div>

        <Field label="Type">
          <select value={type} onChange={e => setType(e.target.value as any)} style={inputStyle()}>
            <option value="query">Query (formal warning)</option>
            <option value="suspension">Suspension</option>
          </select>
        </Field>

        <Field label="Reason (short)">
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} style={inputStyle()}
            placeholder="e.g. Repeated late submissions" />
        </Field>

        <Field label="Description (optional)">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        {type === "suspension" && (
          <Field label="Suspension days">
            <input type="number" min={1} value={days} onChange={e => setDays(e.target.value)} style={inputStyle()} />
          </Field>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
              border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={issueMut.isPending}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: RED, color: WHITE,
              border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {issueMut.isPending ? "Issuing…" : "Issue Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 5. FINANCE — Allocations, AI fund, league table, commissions
 * ═══════════════════════════════════════════════════════════════════════ */
function FinanceSection() {
  const isMobile = useIsMobile();
  const revQuery = trpc.commissions.revenueStats.useQuery(undefined, { retry: false });
  const commissionsQuery = trpc.commissions.list.useQuery(undefined, { retry: false });
  const allocationsQuery = trpc.finance.allocations.useQuery(undefined, { retry: false });
  const aiFundQuery = trpc.finance.aiFund.useQuery(undefined, { retry: false });
  const leagueQuery = trpc.finance.leagueTable.useQuery({}, { retry: false });

  const rev = revQuery.data;
  const allocations = (allocationsQuery.data || []) as any[];
  const aiFund = aiFundQuery.data;
  const league = (leagueQuery.data || []) as any[];
  const commissions = (commissionsQuery.data || []) as any[];

  const commissionPending = commissions.filter(c => c.status === "pending");
  const commissionApproved = commissions.filter(c => c.status === "approved");

  return (
    <div>
      <SectionTitle sub="Revenue allocation (50/30/20), AI fund balance, staff league table.">
        Finance Oversight
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Revenue (Paid)"    value={fmtNaira(rev?.totalRevenue)} color={GREEN} />
        <MiniStat label="Pending Revenue"   value={fmtNaira(rev?.pendingRevenue)} color={ORANGE} />
        <MiniStat label="AI Fund Balance"   value={fmtNaira(aiFund?.balance)} color={PURPLE} />
        <MiniStat label="Commissions Pending" value={commissionPending.length} color={ORANGE} />
        <MiniStat label="Commissions Approved" value={commissionApproved.length} color={GOLD} />
      </div>

      {/* Revenue chart */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Monthly Revenue
        </p>
        <div style={{ width: "100%", height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={rev?.monthlyRevenue || []} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${DARK}0A`} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} />
              <RTooltip formatter={(v: any) => fmtNaira(v)} />
              <Bar dataKey="revenue" fill={GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent allocations */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Recent Allocations
        </p>
        {allocations.length === 0 ? (
          <EmptyState icon={DollarSign} title="No allocations yet" hint="Every confirmed payment splits 50/30/20 and lands here." />
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {allocations.slice(0, 12).map((a: any) => (
              <div key={a.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{a.clientName || "—"}</p>
                    <p style={{
                      fontSize: 10, color: MUTED, marginTop: 2, fontFamily: "monospace",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{a.transactionRef}</p>
                  </div>
                  <StatusPill label={a.status} tone={a.status === "paid" ? "green" : a.status === "approved" ? "gold" : "muted"} />
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 10, color: MUTED, flexWrap: "wrap" }}>
                  <span><span style={{ color: DARK, fontWeight: 600 }}>{fmtNaira(a.totalAmount)}</span> total</span>
                  <span>{fmtNaira(a.staffPoolAmount)} pool</span>
                  <span>{fmtNaira(a.aiFundAmount)} AI</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <th style={{ padding: "8px 10px" }}>Ref</th>
                  <th style={{ padding: "8px 10px" }}>Client</th>
                  <th style={{ padding: "8px 10px" }}>Total</th>
                  <th style={{ padding: "8px 10px" }}>Staff Pool</th>
                  <th style={{ padding: "8px 10px" }}>AI Fund</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.slice(0, 12).map((a: any) => (
                  <tr key={a.id} style={{ borderTop: `1px solid ${DARK}06` }}>
                    <td style={{ padding: "10px 10px", fontFamily: "monospace", fontSize: 10 }}>{a.transactionRef}</td>
                    <td style={{ padding: "10px 10px" }}>{a.clientName || "—"}</td>
                    <td style={{ padding: "10px 10px" }}>{fmtNaira(a.totalAmount)}</td>
                    <td style={{ padding: "10px 10px" }}>{fmtNaira(a.staffPoolAmount)}</td>
                    <td style={{ padding: "10px 10px" }}>{fmtNaira(a.aiFundAmount)}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <StatusPill label={a.status} tone={a.status === "paid" ? "green" : a.status === "approved" ? "gold" : "muted"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI fund log */}
      {aiFund?.log && aiFund.log.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            AI Fund Log
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {aiFund.log.slice(0, 10).map((l: any) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "6px 0", borderBottom: `1px solid ${DARK}06` }}>
                <span style={{ color: DARK }}>{l.description}</span>
                <span style={{ color: PURPLE, fontWeight: 600 }}>{fmtNaira(l.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* League table */}
      {league.length > 0 && (
        <Card>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Staff League Table — Current Quarter
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {league.slice(0, 10).map((p: any, i: number) => (
              <div key={p.staffId || i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 10px", backgroundColor: i < 3 ? `${GOLD}08` : BG, borderRadius: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: i < 3 ? GOLD : MUTED, width: 18 }}>
                    #{i + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: DARK }}>{p.name || p.staffId}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
                  {fmtNaira(p.totalEarnings || p.total || 0)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

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

/* ═══════════════════════════════════════════════════════════════════════
 * 7. ACTIVE CLIENTS — Deep-dive by task/client
 * ═══════════════════════════════════════════════════════════════════════ */
function ClientsSection() {
  const isMobile = useIsMobile();
  const tasksQuery = trpc.tasks.list.useQuery(undefined, { retry: false });
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const all = (tasksQuery.data || []) as any[];
  const filtered = all.filter(t =>
    !search ||
    t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    t.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    t.ref?.toLowerCase().includes(search.toLowerCase()) ||
    t.service?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    "Not Started": "muted",
    "In Progress": "blue",
    "Waiting on Client": "orange",
    "Submitted": "gold",
    "Completed": "green",
  };

  return (
    <div>
      <SectionTitle sub="Every active engagement. Click a row to see tasks, invoices, and activity.">
        Active Clients
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between", flexWrap: "wrap",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {filtered.length} Client{filtered.length === 1 ? "" : "s"}
          </p>
          <input
            type="search"
            placeholder="Search name, business, ref, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(), width: isMobile ? "100%" : 280 }}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Folder} title="No active clients match." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(t => (
            <div key={t.ref} style={{
              backgroundColor: WHITE, borderRadius: 12, border: `1px solid ${DARK}08`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
            }}>
              <button
                onClick={() => setOpenRef(openRef === t.ref ? null : t.ref)}
                style={{
                  width: "100%", padding: "12px 14px", background: "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                      {t.clientName || "—"}
                    </p>
                    <StatusPill label={t.status || "—"} tone={STATUS_TONE[t.status] || "muted"} />
                  </div>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 4, fontFamily: "monospace" }}>
                    {t.ref} · {t.businessName || t.service}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  style={{
                    color: MUTED, flexShrink: 0,
                    transform: openRef === t.ref ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {openRef === t.ref && <ClientDeepDive ref_={t.ref} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientDeepDive({ ref_ }: { ref_: string }) {
  const q = trpc.tracking.fullLookup.useQuery({ ref: ref_ }, { retry: false });
  const d = q.data;

  if (q.isLoading) {
    return (
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${DARK}06` }}>
        <Loader2 size={14} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }
  if (!d || !("task" in d) || !d.task) {
    return (
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${DARK}06`, fontSize: 11, color: MUTED }}>
        Details unavailable.
      </div>
    );
  }

  const task: any = d.task;
  const checklist: any[] = (d as any).checklist || [];
  const activity: any[] = (d as any).activity || [];
  const inv: any = (d as any).invoiceSummary;

  return (
    <div style={{ padding: "14px 16px", borderTop: `1px solid ${DARK}06`, backgroundColor: BG }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 }}>
        <Metric label="Service"   value={task.service || "—"} />
        <Metric label="Dept"      value={task.department || "—"} />
        <Metric label="Deadline"  value={task.expectedDelivery || fmtDate(task.deadline)} />
        <Metric label="Invoiced"  value={fmtNaira(inv?.total)} />
        <Metric label="Paid"      value={fmtNaira(inv?.paid)} />
        <Metric label="Balance"   value={fmtNaira(inv?.balance)} />
      </div>

      {checklist.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>
            Checklist — {checklist.filter((c: any) => c.done).length}/{checklist.length}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {checklist.slice(0, 8).map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                {c.done
                  ? <CheckCircle2 size={11} style={{ color: GREEN, flexShrink: 0 }} />
                  : <Clock size={11} style={{ color: MUTED, flexShrink: 0 }} />}
                <span style={{ color: c.done ? MUTED : DARK, textDecoration: c.done ? "line-through" : "none" }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activity.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>
            Recent Activity
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {activity.slice(0, 5).map((a: any) => (
              <div key={a.id} style={{ fontSize: 11, color: MUTED, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ color: DARK }}>{a.details || a.action}</span>
                <span style={{ flexShrink: 0 }}>{fmtDateTime(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 8. WEEKLY TARGETS REVIEW
 * ═══════════════════════════════════════════════════════════════════════ */
function WeeklyTargetsSection() {
  const utils = trpc.useUtils();
  const listQuery = trpc.weeklyTargets.list.useQuery(undefined, { retry: false });
  const [creating, setCreating] = useState(false);

  const rows = ((listQuery.data || []) as any[]);
  const submitted = rows.filter(r => r.status === "submitted");
  const issued    = rows.filter(r => r.status === "issued");
  const approved  = rows.filter(r => r.status === "approved");

  const reviewMut = trpc.weeklyTargets.review.useMutation({
    onSuccess: () => { toast.success("Target reviewed"); utils.weeklyTargets.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    issued: "muted", submitted: "blue", approved: "green", revision_requested: "orange",
  };
  const OUTCOME_TONE: Record<string, "green" | "gold" | "red"> = { hit: "green", partial: "gold", missed: "red" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Issue weekly commitments, review submissions, mark outcomes.">
          Weekly Targets
        </SectionTitle>
        <button
          onClick={() => setCreating(true)}
          style={{
            padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
            border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={14} /> Issue Target
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Awaiting Review" value={submitted.length} color={BLUE} />
        <MiniStat label="Issued"          value={issued.length}    color={MUTED} />
        <MiniStat label="Approved"        value={approved.length}  color={GREEN} />
        <MiniStat label="Total"           value={rows.length}      color={GOLD} />
      </div>

      {submitted.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Awaiting Your Review
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {submitted.map((t: any) => (
              <div key={t.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {t.department?.toUpperCase()} · {t.targetType}
                    </p>
                    <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}>{t.description}</p>
                    {t.submissionNote && (
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 6, fontStyle: "italic",
                        padding: "6px 8px", backgroundColor: WHITE, borderRadius: 6 }}>
                        <strong>Submitted:</strong> {t.submissionNote}
                      </p>
                    )}
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>
                      Week of {fmtDate(t.weekOf)} · Deadline {t.deadline}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => reviewMut.mutate({ id: t.id, status: "approved", outcome: "hit" })}
                    disabled={reviewMut.isPending}
                    style={{ padding: "5px 10px", borderRadius: 8, backgroundColor: "#22C55E15", color: "#22C55E",
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >Hit ✓</button>
                  <button
                    onClick={() => reviewMut.mutate({ id: t.id, status: "approved", outcome: "partial" })}
                    disabled={reviewMut.isPending}
                    style={{ padding: "5px 10px", borderRadius: 8, backgroundColor: `${GOLD}15`, color: GOLD,
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >Partial</button>
                  <button
                    onClick={() => reviewMut.mutate({ id: t.id, status: "approved", outcome: "missed" })}
                    disabled={reviewMut.isPending}
                    style={{ padding: "5px 10px", borderRadius: 8, backgroundColor: `${RED}10`, color: RED,
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >Missed</button>
                  <button
                    onClick={() => {
                      const note = prompt("What revision is required?");
                      if (!note) return;
                      reviewMut.mutate({ id: t.id, status: "revision_requested", reviewNote: note });
                    }}
                    disabled={reviewMut.isPending}
                    style={{ padding: "5px 10px", borderRadius: 8, backgroundColor: `${ORANGE}15`, color: ORANGE,
                      border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                  >Request Revision</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          All Targets — {rows.length}
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={CheckCheck} title="No weekly targets yet" hint="Click ‘Issue Target’ to set the first one." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 40).map((t: any) => (
              <div key={t.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                padding: "8px 10px", backgroundColor: BG, borderRadius: 8, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: DARK }}>
                    {t.department?.toUpperCase()} · {t.targetType}
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {fmtDate(t.weekOf)} · {t.description?.slice(0, 60)}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <StatusPill label={t.status} tone={STATUS_TONE[t.status] || "muted"} />
                  {t.outcome && <StatusPill label={t.outcome} tone={OUTCOME_TONE[t.outcome] || "muted"} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {creating && (
        <IssueWeeklyTargetModal
          onClose={() => setCreating(false)}
          onIssued={() => { setCreating(false); utils.weeklyTargets.list.invalidate(); }}
        />
      )}
    </div>
  );
}

function IssueWeeklyTargetModal({ onClose, onIssued }: { onClose: () => void; onIssued: () => void }) {
  const [department, setDepartment] = useState("bizdoc");
  const [targetType, setTargetType] = useState("Sales");
  const [description, setDescription] = useState("");
  const [weekOf, setWeekOf] = useState(todayISO());
  const [deadline, setDeadline] = useState("Friday 2pm");

  const createMut = trpc.weeklyTargets.create.useMutation({
    onSuccess: () => { toast.success("Weekly target issued"); onIssued(); },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { toast.error("Description required"); return; }
    createMut.mutate({ department, targetType, description, weekOf, deadline });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      overflowY: "auto",
    }}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} style={{
        backgroundColor: WHITE, borderRadius: 16, padding: 24, width: "100%", maxWidth: 440,
        maxHeight: "calc(100vh - 32px)", overflowY: "auto",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 12,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK }}>Issue Weekly Target</h3>

        <Field label="Department">
          <select value={department} onChange={e => setDepartment(e.target.value)} style={inputStyle()}>
            <option value="bizdoc">BizDoc</option>
            <option value="systemise">Systemise</option>
            <option value="skills">Skills</option>
            <option value="media">Media</option>
            <option value="bizdev">BizDev</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Target type">
            <input value={targetType} onChange={e => setTargetType(e.target.value)} style={inputStyle()} />
          </Field>
          <Field label="Week of">
            <input type="date" value={weekOf} onChange={e => setWeekOf(e.target.value)} style={inputStyle()} />
          </Field>
        </div>

        <Field label="What must be achieved">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        <Field label="Deadline">
          <input value={deadline} onChange={e => setDeadline(e.target.value)} style={inputStyle()} />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
              border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={createMut.isPending}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
              border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {createMut.isPending ? "Issuing…" : "Issue"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 9. CREDENTIALS VAULT — All stored logins, reveal one at a time (audit-logged)
 * ═══════════════════════════════════════════════════════════════════════ */
function CredentialsVaultSection() {
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const listQuery = trpc.credentials.listAll.useQuery(undefined, { retry: false });
  const [revealed, setRevealed] = useState<Record<number, { username: string; password: string; loginUrl?: string | null } | null>>({});
  const [search, setSearch] = useState("");

  const rows = (listQuery.data || []) as any[];
  const filtered = rows.filter(r =>
    !search ||
    r.platform?.toLowerCase().includes(search.toLowerCase()) ||
    r.username?.toLowerCase().includes(search.toLowerCase()) ||
    r.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const revealMut = trpc.credentials.reveal.useMutation({
    onSuccess: (data, vars) => { setRevealed(r => ({ ...r, [vars.credentialId]: data })); },
    onError: (e) => toast.error(e.message || "Reveal failed"),
  });
  const deleteMut = trpc.credentials.delete.useMutation({
    onSuccess: () => { toast.success("Credential deleted"); utils.credentials.listAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const toggle = (id: number) => {
    if (revealed[id]) {
      setRevealed(r => ({ ...r, [id]: null }));
    } else {
      revealMut.mutate({ credentialId: id });
    }
  };

  return (
    <div>
      <SectionTitle sub="AES-256-encrypted vault for 3rd-party logins. Every reveal is audit-logged.">
        Credentials Vault
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between", flexWrap: "wrap",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {filtered.length} Credential{filtered.length === 1 ? "" : "s"}
          </p>
          <input
            type="search"
            placeholder="Search platform, username, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(), width: isMobile ? "100%" : 280 }}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Key} title="Vault empty." hint="Credentials added from client pages appear here." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((c: any) => {
            const r = revealed[c.id];
            return (
              <Card key={c.id} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{c.platform}</p>
                      {c.taskId && <StatusPill label={`Task #${c.taskId}`} tone="muted" />}
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2, fontFamily: "monospace" }}>{c.username}</p>
                    {c.loginUrl && (
                      <a href={c.loginUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, color: BLUE, marginTop: 4, display: "inline-block",
                          wordBreak: "break-all" }}>
                        {c.loginUrl}
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => toggle(c.id)}
                      disabled={revealMut.isPending}
                      style={{
                        padding: "5px 10px", borderRadius: 8, backgroundColor: r ? `${GOLD}20` : `${GREEN}15`,
                        color: r ? GOLD : GREEN, border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      {r ? <><EyeOff size={11} /> Hide</> : <><Eye size={11} /> Reveal</>}
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`Delete credential for ${c.platform}?`)) return;
                        deleteMut.mutate({ credentialId: c.id });
                      }}
                      disabled={deleteMut.isPending}
                      style={{
                        padding: "5px 10px", borderRadius: 8, backgroundColor: `${RED}10`, color: RED,
                        border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}
                    ><Trash2 size={11} /></button>
                  </div>
                </div>

                {r && (
                  <div style={{
                    marginTop: 10, padding: "10px 12px", backgroundColor: `${GOLD}08`,
                    borderRadius: 8, border: `1px dashed ${GOLD}40`,
                  }}>
                    <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>
                      Decrypted — audit-logged
                    </p>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: DARK, wordBreak: "break-all" }}>
                      <div><strong>user:</strong> {r.username}</div>
                      <div style={{ marginTop: 4 }}><strong>pass:</strong> {r.password}</div>
                    </div>
                  </div>
                )}

                {c.notes && (
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 8, fontStyle: "italic" }}>{c.notes}</p>
                )}
                <p style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>
                  Added by {c.addedBy} · {fmtDate(c.createdAt)}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 10. CONTENT OPS — Social posts pipeline by status
 * ═══════════════════════════════════════════════════════════════════════ */
function ContentOpsSection() {
  const listQuery = trpc.content.list.useQuery({ limit: 100 }, { retry: false });
  const rows = (listQuery.data || []) as any[];

  const byStatus = {
    draft:     rows.filter(r => r.status === "draft"),
    scheduled: rows.filter(r => r.status === "scheduled"),
    posted:    rows.filter(r => r.status === "posted"),
    failed:    rows.filter(r => r.status === "failed"),
  };

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    draft: "muted", scheduled: "blue", posted: "green", failed: "red",
  };

  const PLATFORM_COLOR: Record<string, string> = {
    instagram: "#E1306C", tiktok: "#000000", twitter: "#1DA1F2", linkedin: "#0A66C2",
  };

  return (
    <div>
      <SectionTitle sub="Content pipeline across all departments. Draft → Scheduled → Posted.">
        Content Ops
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Drafts"     value={byStatus.draft.length}     color={MUTED} />
        <MiniStat label="Scheduled"  value={byStatus.scheduled.length} color={BLUE} />
        <MiniStat label="Posted"     value={byStatus.posted.length}    color={GREEN} />
        <MiniStat label="Failed"     value={byStatus.failed.length}    color={RED} />
      </div>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Recent Posts — {rows.length}
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={Megaphone} title="No content yet" hint="Draft posts appear here as the media team creates them." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.slice(0, 30).map((p: any) => (
              <div key={p.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700,
                      backgroundColor: `${PLATFORM_COLOR[p.platform] || MUTED}15`,
                      color: PLATFORM_COLOR[p.platform] || MUTED,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>{p.platform}</span>
                    <StatusPill label={p.status} tone={STATUS_TONE[p.status] || "muted"} />
                    <span style={{ fontSize: 10, color: MUTED }}>{p.department}</span>
                  </div>
                  <span style={{ fontSize: 10, color: MUTED }}>
                    {p.scheduledFor ? fmtDateTime(p.scheduledFor) : fmtDateTime(p.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: DARK, marginTop: 6, lineHeight: 1.5, wordBreak: "break-word" }}>
                  {p.caption?.slice(0, 220)}{p.caption?.length > 220 ? "…" : ""}
                </p>
                {p.hashtags && (
                  <p style={{ fontSize: 10, color: GOLD, marginTop: 4, fontFamily: "monospace" }}>{p.hashtags}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 11. NOTIFICATIONS INBOX
 * ═══════════════════════════════════════════════════════════════════════ */
function NotificationsSection() {
  const utils = trpc.useUtils();
  const listQuery = trpc.notifications.list.useQuery(undefined, { retry: false });
  const unreadQuery = trpc.notifications.unreadCount.useQuery(undefined, { retry: false });

  const rows = (listQuery.data || []) as any[];
  const unread = (unreadQuery.data as any) ?? 0;
  const unreadCount = typeof unread === "number" ? unread : (Array.isArray(unread) ? unread.length : 0);

  const markReadMut = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });
  const markAllMut = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked read");
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const PRIORITY_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted"> = {
    low: "muted", normal: "blue", high: "gold", urgent: "red",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub={`${unreadCount} unread · ${rows.length} total`}>
          Notifications
        </SectionTitle>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            style={{
              padding: "8px 14px", borderRadius: 10, backgroundColor: `${GOLD}15`, color: GOLD,
              border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={Bell} title="Inbox zero" hint="High-priority system alerts appear here." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((n: any) => {
            const isRead = !!n.readAt;
            return (
              <div key={n.id} style={{
                padding: "12px 14px", borderRadius: 10,
                backgroundColor: isRead ? WHITE : `${GOLD}06`,
                border: `1px solid ${isRead ? `${DARK}08` : `${GOLD}30`}`,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0,
                  backgroundColor: isRead ? "transparent" : GOLD,
                }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 12, fontWeight: isRead ? 500 : 700, color: DARK }}>{n.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {n.priority && n.priority !== "normal" && (
                        <StatusPill label={n.priority} tone={PRIORITY_TONE[n.priority] || "muted"} />
                      )}
                      <span style={{ fontSize: 10, color: MUTED }}>{fmtDateTime(n.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.5, wordBreak: "break-word" }}>
                    {n.message}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {n.link && (
                      <a href={n.link} style={{
                        fontSize: 10, color: GOLD, textDecoration: "none", fontWeight: 600,
                      }}>Open →</a>
                    )}
                    {!isRead && (
                      <button
                        onClick={() => markReadMut.mutate({ id: n.id })}
                        disabled={markReadMut.isPending}
                        style={{
                          background: "none", border: "none", color: MUTED, fontSize: 10,
                          cursor: "pointer", padding: 0,
                        }}
                      >Mark read</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* 2026-04 founder decision: localStorage-backed sections (Branding QA,
   Equipment Tracker, Software Vault, Division Updates, Approvals,
   Weekly Meetings) removed for launch. Re-add when migrated to MySQL. */

const ceoInputStyle: React.CSSProperties = {
  padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`,
  fontSize: 13, backgroundColor: WHITE, width: "100%",
};
function CeoInput({ value, onChange, type = "text" }: { value: any; onChange: (v: any) => void; type?: string }) {
  return <input type={type} value={value ?? ""} onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)} style={ceoInputStyle} />;
}

function ApprovalTiersSection() {
  const [amount, setAmount] = useState<number>(0);
  const approver =
    amount < 50_000 ? { tier: "Division Lead", color: GREEN, note: "Any division lead can approve." } :
    amount <= 500_000 ? { tier: "CEO", color: GOLD, note: "CEO approval required." } :
    { tier: "Founder", color: "#8B4513", note: "Founder sign-off required (>₦500k)." };

  return (
    <div>
      <SectionTitle sub="Purchase approval tiers. Escalation SLAs for severity.">Approvals & Thresholds</SectionTitle>
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Purchase approval calculator
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <CeoInput value={amount} onChange={v => setAmount(Number(v))} type="number" />
          <div style={{
            padding: "12px 20px", borderRadius: 12, backgroundColor: `${approver.color}15`,
            color: approver.color, fontWeight: 700, fontSize: 14,
          }}>
            → {approver.tier} approves
          </div>
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>{approver.note}</p>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Purchase approval tiers
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { tier: "< ₦50,000",      who: "Division Lead", color: GREEN },
            { tier: "₦50k – ₦500k",   who: "CEO",           color: GOLD },
            { tier: "> ₦500,000",     who: "Founder",       color: "#8B4513" },
          ].map(t => (
            <div key={t.tier} style={{ padding: 14, borderRadius: 10, backgroundColor: `${t.color}10`, border: `1px solid ${t.color}30` }}>
              <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.tier}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: t.color, marginTop: 4 }}>{t.who}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Escalation severity (SLA to understand: 4 hours)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { s: "Emergency", color: "#EF4444", sla: "Respond in 15min" },
            { s: "Urgent",    color: "#F59E0B", sla: "Respond in 1h" },
            { s: "Important", color: GOLD,      sla: "Respond in 4h" },
            { s: "Normal",    color: GREEN,     sla: "Respond same day" },
          ].map(t => (
            <div key={t.s} style={{ padding: 14, borderRadius: 10, border: `1px solid ${t.color}30`, borderLeft: `3px solid ${t.color}` }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.s}</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{t.sla}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

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

/* ─── Division Updates ────────────────────────────────────────────────── */
function DivisionUpdatesSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.divisionUpdates.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    weekOf: todayISO(),
    division: "Other" as const,
    submittedBy: "",
    pulseScore: 0,
    wins: "",
    blockers: "",
    nextWeekFocus: "",
    status: "Submitted" as const,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.divisionUpdates.create.useMutation({
    onSuccess: () => {
      toast.success("Update submitted");
      utils.ceoOps.divisionUpdates.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.divisionUpdates.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.divisionUpdates.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.divisionUpdates.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.divisionUpdates.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Weekly roll-up reports from each division head. Wins, blockers, next-week focus.">
        Division Updates
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Submitted" value={rows.filter(r => r.status === "Submitted").length} color={BLUE} />
        <MiniStat label="Reviewed" value={rows.filter(r => r.status === "Reviewed").length} color={GOLD} />
        <MiniStat label="Acted On" value={rows.filter(r => r.status === "Acted On").length} color={GREEN} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Division Update</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Week Of"><TextInput type="date" value={form.weekOf} onChange={e => setForm({ ...form, weekOf: e.target.value })} /></FormField>
              <FormField label="Division">
                <SelectInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value as any })}>
                  {["Bizdoc", "Scalar", "Medialy", "HUB", "Podcast", "Video", "BizDev", "CSO", "Skills", "Finance", "HR", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Submitted By"><TextInput value={form.submittedBy} onChange={e => setForm({ ...form, submittedBy: e.target.value })} placeholder="Division lead name" /></FormField>
              <FormField label="Pulse Score (1-10)"><TextInput type="number" min={0} max={10} value={form.pulseScore || ""} onChange={e => setForm({ ...form, pulseScore: Number(e.target.value) })} /></FormField>
              <FormField label="Status">
                <SelectInput value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                  {["Submitted", "Reviewed", "Acted On", "Archived"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Wins (one per line)"><TextArea value={form.wins} onChange={e => setForm({ ...form, wins: e.target.value })} placeholder="Closed 2 deals&#10;Hired new editor&#10;Brand QA: 100% pass" /></FormField>
              <FormField label="Blockers (one per line)"><TextArea value={form.blockers} onChange={e => setForm({ ...form, blockers: e.target.value })} placeholder="Need budget approval&#10;Software licence expired" /></FormField>
              <FormField label="Next Week Focus"><TextArea value={form.nextWeekFocus} onChange={e => setForm({ ...form, nextWeekFocus: e.target.value })} /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.weekOf) { toast.error("Week is required"); return; }
                createMut.mutate({
                  weekOf: form.weekOf,
                  division: form.division,
                  submittedBy: form.submittedBy || null,
                  pulseScore: form.pulseScore || null,
                  wins: splitLines(form.wins),
                  blockers: splitLines(form.blockers),
                  nextWeekFocus: form.nextWeekFocus || null,
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
          <EmptyState icon={MessageSquare} title="No division updates yet" hint="Each division lead submits a weekly roll-up here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => (
              <div key={r.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.division} · Week of {fmtDate(r.weekOf)}</p>
                      <StatusPill label={r.status} tone={r.status === "Acted On" ? "green" : r.status === "Reviewed" ? "gold" : r.status === "Submitted" ? "blue" : "muted"} />
                      {typeof r.pulseScore === "number" && r.pulseScore > 0 && (
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                          backgroundColor: r.pulseScore >= 8 ? `${GREEN}15` : r.pulseScore >= 5 ? `${GOLD}20` : `${RED}15`,
                          color: r.pulseScore >= 8 ? GREEN : r.pulseScore >= 5 ? GOLD : RED,
                        }}>Pulse {r.pulseScore}/10</span>
                      )}
                    </div>
                    {r.submittedBy && <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Submitted by: {r.submittedBy}</p>}
                    {Array.isArray(r.wins) && r.wins.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong style={{ color: GREEN }}>Wins:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.wins.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(r.blockers) && r.blockers.length > 0 && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>
                        <strong style={{ color: RED }}>Blockers:</strong>
                        <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, lineHeight: 1.6 }}>
                          {r.blockers.map((g: string, i: number) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    )}
                    {r.nextWeekFocus && <p style={{ fontSize: 11, color: DARK, marginTop: 6 }}><strong>Next week:</strong> {r.nextWeekFocus}</p>}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.status} onChange={e => updateMut.mutate({ id: r.id, status: e.target.value as any })}>
                      {["Submitted", "Reviewed", "Acted On", "Archived"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton onClick={() => { if (confirm("Remove this update?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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

/* ─── Canva Templates ─────────────────────────────────────────────────── */
function CanvaTemplatesSection() {
  const utils = trpc.useUtils();
  const q = trpc.ceoOps.canvaTemplates.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    name: "",
    category: "Other" as const,
    division: "",
    canvaUrl: "",
    thumbnailUrl: "",
    tags: "",
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  const createMut = trpc.ceoOps.canvaTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template added");
      utils.ceoOps.canvaTemplates.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.ceoOps.canvaTemplates.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.ceoOps.canvaTemplates.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.ceoOps.canvaTemplates.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.ceoOps.canvaTemplates.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Central library of approved Canva templates. Bump usage on copy.">
        Canva Templates
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Social" value={rows.filter(r => r.category === "Social Post" || r.category === "Carousel" || r.category === "Story").length} color={BLUE} />
        <MiniStat label="Decks" value={rows.filter(r => r.category === "Pitch Deck" || r.category === "Proposal").length} color={GREEN} />
        <MiniStat label="Print" value={rows.filter(r => r.category === "Flyer" || r.category === "Brochure").length} color={GOLD} />
        <MiniStat label="Total" value={rows.length} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>New Canva Template</p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Add"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Name"><TextInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hamzury Carousel v3" /></FormField>
              <FormField label="Category">
                <SelectInput value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}>
                  {["Social Post", "Carousel", "Story", "Flyer", "Brochure", "Pitch Deck", "Proposal", "Cover", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </FormField>
              <FormField label="Division"><TextInput value={form.division} onChange={e => setForm({ ...form, division: e.target.value })} placeholder="e.g. Medialy" /></FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Canva URL"><TextInput value={form.canvaUrl} onChange={e => setForm({ ...form, canvaUrl: e.target.value })} placeholder="https://canva.com/design/…" /></FormField>
              <FormField label="Thumbnail URL"><TextInput value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="Optional preview image" /></FormField>
              <FormField label="Tags (one per line)"><TextArea value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="brand&#10;launch&#10;quote" /></FormField>
              <FormField label="Notes"><TextArea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!form.name.trim()) { toast.error("Name is required"); return; }
                createMut.mutate({
                  name: form.name,
                  category: form.category,
                  division: form.division || null,
                  canvaUrl: form.canvaUrl || null,
                  thumbnailUrl: form.thumbnailUrl || null,
                  tags: splitLines(form.tags),
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
          <EmptyState icon={ImageIcon} title="No Canva templates yet" hint="Build the design library — every team uses these." />
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
                      {r.division && <StatusPill label={r.division} tone="gold" />}
                      {typeof r.usageCount === "number" && r.usageCount > 0 && (
                        <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>used {r.usageCount}×</span>
                      )}
                    </div>
                    {r.canvaUrl && (
                      <p style={{ fontSize: 11, marginTop: 4 }}>
                        <a href={r.canvaUrl} target="_blank" rel="noopener noreferrer" style={{ color: BLUE, textDecoration: "underline" }}>Open in Canva ↗</a>
                      </p>
                    )}
                    {Array.isArray(r.tags) && r.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {r.tags.map((tag: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, backgroundColor: WHITE, color: GOLD, fontWeight: 600 }}>{tag}</span>
                        ))}
                      </div>
                    )}
                    {r.lastUsedAt && <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>Last used {fmtDate(r.lastUsedAt)}</p>}
                    {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{r.notes}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
                    <SelectInput value={r.category} onChange={e => updateMut.mutate({ id: r.id, category: e.target.value as any })}>
                      {["Social Post", "Carousel", "Story", "Flyer", "Brochure", "Pitch Deck", "Proposal", "Cover", "Other"].map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectInput>
                    <GhostButton
                      onClick={() => {
                        if (!r.canvaUrl) { toast.error("No Canva URL to copy"); return; }
                        navigator.clipboard.writeText(r.canvaUrl).then(
                          () => {
                            toast.success("Copied — usage count bumped");
                            updateMut.mutate({
                              id: r.id,
                              usageCount: (r.usageCount || 0) + 1,
                              lastUsedAt: new Date().toISOString().slice(0, 10),
                            });
                          },
                          () => toast.error("Couldn't copy"),
                        );
                      }}
                      color={GREEN}
                    >Copy URL</GhostButton>
                    <GhostButton onClick={() => { if (confirm("Remove this template?")) removeMut.mutate({ id: r.id }); }} color={RED}>
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
