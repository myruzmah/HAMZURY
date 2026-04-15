import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, FileCheck, UserPlus, RefreshCw,
  Network, Calendar, LogOut, ArrowLeft, Loader2, AlertTriangle,
  CheckCircle2, Clock, Target, FileText, Send, Building2,
  Shield, Eye, ExternalLink, TrendingUp, AlertCircle,
  Menu, X, Plus, Settings as SettingsIcon, ChevronLeft, ChevronRight,
  MessageSquare, Trash2, Lock, Briefcase, BookOpen, UserCheck,
  DollarSign, Wallet, PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { toast } from "sonner";
import { SERVICE_LIST, servicesByDept } from "@shared/services";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY CSO PORTAL — Client Services Office
 * Private, role-gated (founder, cso). Single gateway to clients.
 * Built against the CSO source-of-truth in /Users/MAC/Documents/HAMZURY/03-CSO.
 * ══════════════════════════════════════════════════════════════════════ */

/* Brand */
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
  | "dashboard" | "pipeline" | "active_clients" | "subscriptions"
  | "tasks" | "back_office";

/* Internal qualification panel shown inside pipeline column detail */
type PipelineView = "kanban" | "qualification";
type BackOfficeTab =
  | "services" | "sources" | "cohorts" | "calendar" | "targets"
  | "templates" | "audit" | "settings";

/* Shared dept leads — used by AssignTaskModal + dashboard surfaces */
const DEPT_LEADS: Record<string, { name: string; dept: string }[]> = {
  bizdoc: [{ name: "Abdullahi Musa", dept: "bizdoc" }],
  systemise: [{ name: "Dajot", dept: "systemise" }, { name: "Lalo", dept: "systemise" }],
  skills: [{ name: "Abdulmalik Musa", dept: "skills" }],
};

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
function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
}

const STATUS_PILL: Record<string, { bg: string; text: string; label: string }> = {
  active:     { bg: `#22C55E15`, text: "#22C55E", label: "Active" },
  converted:  { bg: `${GOLD}20`, text: GOLD, label: "Converted" },
  unverified: { bg: "#9CA3AF25", text: MUTED, label: "Unverified" },
  dormant:    { bg: `${RED}15`,  text: RED, label: "Dormant" },
  new:        { bg: `${BLUE}15`, text: BLUE, label: "New" },
  contacted:  { bg: `${GOLD}20`, text: GOLD, label: "Contacted" },
  archived:   { bg: "#9CA3AF25", text: MUTED, label: "Archived" },
  draft:      { bg: "#9CA3AF25", text: MUTED, label: "Draft" },
  sent:       { bg: `${BLUE}15`, text: BLUE, label: "Sent" },
  accepted:   { bg: `#22C55E15`, text: "#22C55E", label: "Accepted" },
  rejected:   { bg: `${RED}15`,  text: RED, label: "Rejected" },
  expired:    { bg: "#9CA3AF25", text: MUTED, label: "Expired" },
};

function Pill({ status }: { status: string }) {
  const s = STATUS_PILL[status] || { bg: "#9CA3AF25", text: MUTED, label: status };
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
      backgroundColor: s.bg, color: s.text, textTransform: "uppercase", letterSpacing: "0.04em",
    }}>{s.label}</span>
  );
}

/* Referral / content source badge.
 * Colour-coded by source so CSO can see at a glance where a lead came from.
 * Displays as "AFF-014" or "CRT-marfinance" etc. — whatever referralCode is set. */
function SourceBadge({
  code, source, referrerName,
}: { code?: string | null; source?: string | null; referrerName?: string | null }) {
  if (!code && !referrerName) return null;
  const src = (source || "").toLowerCase();
  const palette: Record<string, { bg: string; fg: string }> = {
    affiliate:        { bg: `${GOLD}18`, fg: GOLD },
    content:          { bg: `${BLUE}15`, fg: BLUE },
    creator:          { bg: `${BLUE}15`, fg: BLUE },
    referral:         { bg: `${GREEN}15`, fg: GREEN },
    returning_client: { bg: `${GREEN}15`, fg: GREEN },
    cso:              { bg: `${"#8B5CF6"}15`, fg: "#8B5CF6" },
    bizdev:           { bg: `${"#8B5CF6"}15`, fg: "#8B5CF6" },
    direct:           { bg: `${MUTED}15`, fg: MUTED },
    chat:             { bg: `${ORANGE}15`, fg: ORANGE },
  };
  const p = palette[src] || { bg: `${GOLD}10`, fg: GOLD };
  // Auto-prefix when no prefix supplied by the code itself
  let displayCode = code || "";
  if (displayCode && !/[-/]/.test(displayCode)) {
    const prefix = src === "affiliate" ? "AFF-" :
                   src === "content" || src === "creator" ? "CRT-" :
                   src === "cso" ? "CSO-" :
                   src === "bizdev" ? "BDV-" :
                   "REF-";
    displayCode = `${prefix}${displayCode}`;
  }
  const label = displayCode || (referrerName ? `${src.toUpperCase() || "REF"} · ${referrerName}` : "");
  if (!label) return null;
  return (
    <span
      title={referrerName ? `Referred by ${referrerName}` : undefined}
      style={{
        padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700,
        backgroundColor: p.bg, color: p.fg, letterSpacing: "0.03em",
        fontFamily: "monospace", textTransform: "uppercase", whiteSpace: "nowrap",
      }}
    >{label}</span>
  );
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

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════ */
export default function CSOPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [pipelineView, setPipelineView] = useState<PipelineView>("kanban");
  const isCsoStaff = (user as any)?.hamzuryRole === "cso_staff";

  /* Mobile responsiveness */
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 900 : false
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const NAV: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "dashboard",      icon: LayoutDashboard, label: "Dashboard" },
    { key: "pipeline",       icon: Target,          label: "Pipeline" },
    { key: "active_clients", icon: Building2,       label: "Active Clients" },
    { key: "subscriptions",  icon: RefreshCw,       label: "Subscriptions" },
    { key: "tasks",          icon: FileCheck,       label: "Tasks" },
    { key: "back_office",    icon: SettingsIcon,    label: "Back Office" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PageMeta title="CSO Portal — HAMZURY" description="HAMZURY Client Services Office — the single gateway to all clients." />

      {/* Mobile overlay (closes drawer on tap) */}
      {isMobile && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 40, transition: "opacity 0.2s",
          }}
        />
      )}

      {/* ── Sidebar ── */}
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
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>CSO Portal</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>csoportal.hamzury.com</div>
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
                  if (key !== "pipeline") { setSelectedLeadId(null); setPipelineView("kanban"); }
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

      {/* ── Main ── */}
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
                {user.name} · CSO Lead & Staff
              </p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${GREEN}10`, color: GREEN, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
            ROLE-GATED
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {active === "dashboard"      && <HomeSection onGoto={setActive} />}
            {active === "pipeline" && pipelineView === "kanban" && (
              <PipelineSection
                onQualify={(id) => { setSelectedLeadId(id); setPipelineView("qualification"); }}
              />
            )}
            {active === "pipeline" && pipelineView === "qualification" && (
              <QualificationSection
                selectedId={selectedLeadId}
                onBack={() => { setPipelineView("kanban"); setSelectedLeadId(null); }}
              />
            )}
            {active === "active_clients" && <ClientsSection />}
            {active === "subscriptions"  && <SubscriptionsSection />}
            {active === "tasks"          && <TasksSection isCsoStaff={isCsoStaff} />}
            {active === "back_office"    && <BackOfficeSection currentUser={user} isCsoStaff={isCsoStaff} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 1. HOME / COMMAND CENTER
 * ═══════════════════════════════════════════════════════════════════════ */
function HomeSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const leadsQuery = trpc.leads.list.useQuery();
  const clientsQuery = trpc.clientTruth.list.useQuery();
  const proposalsQuery = trpc.proposals.list.useQuery({ status: undefined });
  const commissionsQuery = trpc.commissions.list.useQuery(undefined, { retry: false });
  const revenueStatsQuery = trpc.commissions.revenueStats.useQuery(undefined, { retry: false });
  const targetsQuery = trpc.targets.listForRole.useQuery(
    { role: "cso", period: "current" },
    { retry: false },
  );
  const activeTargets = ((targetsQuery.data || []) as any[]).slice(0, 3);

  const leads = (Array.isArray(leadsQuery.data) ? leadsQuery.data : []) as any[];
  const clients = clientsQuery.data || [];
  const proposals = proposalsQuery.data || [];
  const commissions = (commissionsQuery.data || []) as any[];
  const revenueStats = revenueStatsQuery.data;

  const newLeads = leads.filter((l: any) => l.status === "new").length;
  const unassignedLeads = leads.filter((l: any) => !l.assignedDepartment).length;
  const activeClients = clients.filter((c: any) => c.status === "active").length;
  const unverifiedClients = clients.filter((c: any) => c.status === "unverified").length;
  const pendingProposals = proposals.filter((p: any) => p.status === "sent").length;
  const draftProposals = proposals.filter((p: any) => p.status === "draft").length;

  // Revenue pipeline (contracts signed minus paid)
  const totalContractValue = clients.reduce((s: number, c: any) => s + (parseFloat(c.contractValue || "0") || 0), 0);
  const totalPaid = clients.reduce((s: number, c: any) => s + (parseFloat(c.amountPaid || "0") || 0), 0);
  const totalBalance = totalContractValue - totalPaid;

  // Commission buckets
  const commissionPending  = commissions.filter((c: any) => c.status === "pending");
  const commissionApproved = commissions.filter((c: any) => c.status === "approved");
  const commissionPaid     = commissions.filter((c: any) => c.status === "paid");
  const sumPool = (list: any[]) => list.reduce((s, c) => s + (parseFloat(c.commissionPool || "0") || 0), 0);

  // Lead trend — last 6 months by createdAt
  const leadTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("en", { month: "short" });
      const count = leads.filter((l: any) => {
        if (!l.createdAt) return false;
        const ld = new Date(l.createdAt);
        return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
      }).length;
      return { month: label, leads: count };
    });
  }, [leads]);

  // Channel mix — how leads arrived
  const channelMix = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const l of leads) {
      const src = (l.source || "direct").toString();
      buckets[src] = (buckets[src] || 0) + 1;
    }
    const order = ["direct", "chat", "affiliate", "content", "referral", "bizdev", "cso"];
    return order
      .map(k => ({ source: k, count: buckets[k] || 0 }))
      .concat(
        Object.keys(buckets).filter(k => !order.includes(k)).map(k => ({ source: k, count: buckets[k] })),
      );
  }, [leads]);

  // Clients with critical or high risk = needs attention today
  const urgent = clients.filter((c: any) => ["critical", "high"].includes(c.riskFlag));

  const kpis = [
    { label: "New Leads",          value: newLeads,          icon: TrendingUp,    color: BLUE,      section: "pipeline" as Section },
    { label: "Unassigned Leads",   value: unassignedLeads,   icon: AlertCircle,   color: ORANGE,    section: "pipeline" as Section },
    { label: "Active Clients",     value: activeClients,     icon: CheckCircle2,  color: "#22C55E", section: "active_clients" as Section },
    { label: "Unverified Clients", value: unverifiedClients, icon: AlertTriangle, color: ORANGE,    section: "active_clients" as Section },
    { label: "Draft Proposals",    value: draftProposals,    icon: FileText,      color: MUTED,     section: "back_office" as Section },
    { label: "Sent / Awaiting",    value: pendingProposals,  icon: Send,          color: GOLD,      section: "back_office" as Section },
    { label: "Contracts (₦)",      value: fmtNaira(totalContractValue), icon: DollarSign,  color: GREEN, section: "active_clients" as Section },
    { label: "Outstanding (₦)",    value: fmtNaira(totalBalance),       icon: Wallet,      color: RED,   section: "active_clients" as Section },
  ];

  return (
    <div>
      <SectionTitle sub="Your view as the single client gateway. Live data — no mock numbers.">
        Command Center
      </SectionTitle>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={() => onGoto(k.section)}
            style={{
              backgroundColor: WHITE, borderRadius: 14, padding: "16px 14px",
              border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              textAlign: "left", cursor: "pointer", transition: "transform 0.1s",
            }}
          >
            <k.icon size={14} style={{ color: k.color, marginBottom: 8 }} />
            <p style={{ fontSize: typeof k.value === "string" ? 15 : 22, fontWeight: 700, color: DARK, lineHeight: 1.15 }}>{k.value}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.label}</p>
          </button>
        ))}
      </div>

      {/* Trend chart — leads per month + revenue per month (recharts) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={14} style={{ color: BLUE }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Lead Curve — Last 6 Months
              </p>
            </div>
            <span style={{ fontSize: 10, color: MUTED }}>Total: {leads.length}</span>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={leadTrend} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${DARK}0A`} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} allowDecimals={false} />
                <RTooltip />
                <Line type="monotone" dataKey="leads" stroke={GREEN} strokeWidth={2} dot={{ r: 3, fill: GOLD }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={14} style={{ color: GREEN }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Revenue Curve — Paid Commissions
              </p>
            </div>
            <span style={{ fontSize: 10, color: MUTED }}>
              {revenueStats ? `Total ${fmtNaira(revenueStats.totalRevenue)}` : "—"}
            </span>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={revenueStats?.monthlyRevenue || []} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${DARK}0A`} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} />
                <RTooltip formatter={(v: any) => fmtNaira(v)} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {(revenueStats?.monthlyRevenue || []).map((_: any, i: number) => (
                    <Cell key={i} fill={i === (revenueStats?.monthlyRevenue?.length || 0) - 1 ? GOLD : GREEN} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Commission Grid — pending / approved / paid */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PieChartIcon size={14} style={{ color: GOLD }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Commission Grid
            </p>
          </div>
          <span style={{ fontSize: 10, color: MUTED }}>
            Finance confirms payouts. CSO views read-only.
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { label: "Pending",  count: commissionPending.length,  total: sumPool(commissionPending),  color: ORANGE },
            { label: "Approved", count: commissionApproved.length, total: sumPool(commissionApproved), color: BLUE   },
            { label: "Paid",     count: commissionPaid.length,     total: sumPool(commissionPaid),     color: GREEN  },
          ].map(box => (
            <div key={box.label} style={{
              padding: "12px 14px", borderRadius: 12,
              backgroundColor: `${box.color}08`, border: `1px solid ${box.color}22`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: box.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {box.label}
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: DARK, marginTop: 4 }}>{box.count}</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Pool: {fmtNaira(box.total)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Channel mix — where leads come from */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Network size={14} style={{ color: BLUE }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Where Leads Come From
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
          {channelMix.map(c => (
            <div key={c.source} style={{
              padding: "10px 12px", borderRadius: 10,
              backgroundColor: `${GOLD}08`, border: `1px solid ${GOLD}20`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {c.source}
              </p>
              <p style={{ fontSize: 18, fontWeight: 700, color: DARK, marginTop: 4 }}>{c.count}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: MUTED, marginTop: 10 }}>
          Tracked via <code style={{ background: `${DARK}08`, padding: "1px 6px", borderRadius: 4 }}>leads.source</code> +
          <code style={{ background: `${DARK}08`, padding: "1px 6px", borderRadius: 4, marginLeft: 4 }}>leads.referralCode</code> —
          every lead stores where it came from so nothing is guessed.
        </p>
      </Card>

      {/* Manual controls — do it by hand when needed */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <UserCheck size={14} style={{ color: GREEN }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Manual Controls — Do It By Hand
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {[
            { label: "Add Client",           hint: "Walk-in, phone, referral",    section: "active_clients" as Section, icon: UserPlus },
            { label: "Open Pipeline",        hint: "Move lead by hand",           section: "pipeline" as Section,       icon: Network },
            { label: "Assign Task",          hint: "Route work to a dept lead",   section: "tasks" as Section,          icon: Send },
            { label: "Log Subscription",     hint: "Monthly retainers",           section: "subscriptions" as Section,  icon: RefreshCw },
            { label: "Source Tracker",       hint: "See affiliate + content refs", section: "back_office" as Section,   icon: Eye },
            { label: "Targets & Calendar",   hint: "Targets from CEO",            section: "back_office" as Section,    icon: Target },
          ].map(b => (
            <button key={b.label} onClick={() => onGoto(b.section)} style={{
              textAlign: "left", padding: "12px 14px", borderRadius: 12,
              backgroundColor: `${GREEN}05`, border: `1px solid ${GREEN}18`, cursor: "pointer",
            }}>
              <b.icon size={14} style={{ color: GREEN, marginBottom: 6 }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{b.label}</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{b.hint}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Targets this month — CEO-assigned KPIs with live progress */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={14} style={{ color: GOLD }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your Targets This Month
            </p>
          </div>
          <button
            onClick={() => onGoto("back_office")}
            style={{
              fontSize: 10, fontWeight: 600, color: GREEN, background: "none",
              border: "none", cursor: "pointer",
            }}
          >
            View all →
          </button>
        </div>
        {targetsQuery.isLoading ? (
          <EmptyState icon={Loader2} title="Loading targets..." />
        ) : activeTargets.length === 0 ? (
          <EmptyState icon={Target} title="No targets set for this period" hint="CEO assigns targets from CEO Dashboard → Set Target (Phase 2)." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeTargets.map((t: any) => {
              const targetVal = parseFloat(t.targetValue || "0");
              const actual = Number(t.actualValue || 0);
              const pct = targetVal > 0 ? Math.min(100, (actual / targetVal) * 100) : 0;
              const label = (t.metric || "custom").replace(/_/g, " ");
              return (
                <div key={t.id} style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: `${GREEN}04`, border: `1px solid ${DARK}08` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK, textTransform: "capitalize" }}>{label}</p>
                    <p style={{ fontSize: 11, color: DARK, fontWeight: 600 }}>
                      {actual} <span style={{ color: MUTED, fontWeight: 400 }}>/ {targetVal}</span>
                    </p>
                  </div>
                  <div style={{ height: 6, backgroundColor: `${DARK}08`, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      backgroundColor: pct >= 100 ? "#22C55E" : pct >= 60 ? GOLD : ORANGE,
                      borderRadius: 3, transition: "width 0.3s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Urgent — risk flagged clients */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <AlertTriangle size={14} style={{ color: RED }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Needs CSO Attention ({urgent.length})
          </p>
        </div>
        {urgent.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing flagged" hint="All active clients are stable right now." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {urgent.map((c: any) => (
              <div key={c.id} style={{
                padding: "10px 12px", borderRadius: 10, backgroundColor: `${RED}06`, border: `1px solid ${RED}20`,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{c.businessName || c.name}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {c.currentBlocker || c.nextAction || "No blocker recorded"}
                  </p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: RED, textTransform: "uppercase",
                  padding: "2px 8px", borderRadius: 10, backgroundColor: `${RED}15`,
                }}>
                  {c.riskFlag}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Today's rhythm reminder */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Clock size={14} style={{ color: GOLD }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            CSO Rhythm — Today's Standing Work
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "Lead acknowledgement", detail: "All new leads acknowledged within 4 business hours." },
            { title: "Daily lead summary", detail: "Send end-of-day summary of new leads to CEO." },
            { title: "Active client updates", detail: "Check update schedule for each active client." },
            { title: "Unverified gaps", detail: "Close info gaps within 14 days or escalate." },
          ].map(t => (
            <div key={t.title} style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: `${GREEN}05`, border: `1px solid ${GREEN}10` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{t.title}</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{t.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2. LEADS REGISTER
 * ═══════════════════════════════════════════════════════════════════════ */
function LeadsSection({ onQualify }: { onQualify: (id: number) => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showConverted, setShowConverted] = useState<boolean>(false);
  const leadsQuery = trpc.leads.list.useQuery({ excludeConverted: !showConverted });
  const leads = (leadsQuery.data || []) as any[];
  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => { toast.success("Lead deleted"); leadsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = statusFilter === "all"
    ? leads
    : leads.filter((l: any) => l.status === statusFilter);

  return (
    <div>
      <SectionTitle sub="Every inbound enquiry — direct, referral, returning, or outreach.">
        Lead Register
      </SectionTitle>

      {/* Show converted toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <label style={{
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          fontSize: 12, color: MUTED,
        }}>
          <input
            type="checkbox"
            checked={showConverted}
            onChange={(e) => setShowConverted(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          Show converted / archived leads
        </label>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {(showConverted ? ["all", "new", "contacted", "converted", "archived"] : ["all", "new", "contacted"]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 12px", borderRadius: 10, border: `1px solid ${DARK}10`,
              fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
              letterSpacing: "0.04em",
              backgroundColor: statusFilter === s ? GREEN : WHITE,
              color: statusFilter === s ? GOLD : MUTED,
            }}
          >
            {s} {s !== "all" && `(${leads.filter((l: any) => l.status === s).length})`}
          </button>
        ))}
      </div>

      {leadsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading leads..." /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title={`No ${statusFilter === "all" ? "" : statusFilter} leads`} hint="New enquiries will appear here as they arrive." /></Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead: any) => {
              const age = lead.createdAt ? Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000) : null;
              return (
                <div key={lead.id} style={{
                  padding: "12px 14px", borderRadius: 10, border: `1px solid ${DARK}08`,
                  backgroundColor: `${DARK}02`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{lead.businessName || lead.name}</p>
                        <Pill status={lead.status} />
                        <SourceBadge code={lead.referralCode} source={lead.source} referrerName={lead.referrerName} />
                      </div>
                      <p style={{ fontSize: 11, fontFamily: "monospace", color: GOLD, marginBottom: 4 }}>{lead.ref}</p>
                      <p style={{ fontSize: 12, color: DARK, fontWeight: 500, marginBottom: 2 }}>{lead.service}</p>
                      <p style={{ fontSize: 11, color: MUTED }}>
                        {lead.source || "direct"} · {lead.name}
                        {lead.phone && ` · ${lead.phone}`}
                        {lead.email && ` · ${lead.email}`}
                      </p>
                      {lead.referrerName && (
                        <p style={{ fontSize: 10, color: GOLD, marginTop: 4 }}>
                          Referred by: {lead.referrerName} ({lead.referralSourceType || "affiliate"})
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      {age !== null && (
                        <p style={{ fontSize: 10, color: age > 2 ? RED : MUTED }}>
                          {age === 0 ? "today" : `${age}d ago`}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => onQualify(lead.id)}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 8,
                            border: `1px solid ${GREEN}40`, color: GREEN, backgroundColor: `${GREEN}06`,
                            cursor: "pointer",
                          }}
                        >
                          Qualify →
                        </button>
                        <button
                          title="Delete lead"
                          onClick={() => {
                            if (deleteLead.isPending) return;
                            if (!window.confirm(`Delete lead ${lead.ref} — ${lead.name}? This cannot be undone.`)) return;
                            deleteLead.mutate({ id: lead.id });
                          }}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: "5px 8px", borderRadius: 8,
                            border: `1px solid ${RED}30`, color: RED, backgroundColor: `${RED}06`,
                            cursor: "pointer", display: "flex", alignItems: "center",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3. QUALIFICATION WORKSPACE
 * ═══════════════════════════════════════════════════════════════════════ */
function QualificationSection({ selectedId, onBack }: { selectedId: number | null; onBack: () => void }) {
  const leadsQuery = trpc.leads.list.useQuery();
  const leads = (leadsQuery.data || []) as any[];
  const lead = selectedId ? leads.find((l: any) => l.id === selectedId) : null;

  if (!selectedId || !lead) {
    return (
      <div>
        <SectionTitle sub="Select a lead from the Lead Register to run qualification.">
          Qualification Workspace
        </SectionTitle>
        <Card>
          <EmptyState icon={FileCheck} title="No lead selected" hint="Go to Lead Register → click Qualify on any lead." />
        </Card>
      </div>
    );
  }

  const ageDays = lead.createdAt ? Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000) : 0;

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          fontSize: 12, color: MUTED, background: "none", border: "none",
          cursor: "pointer", marginBottom: 10, padding: 0,
        }}
      >
        ← Back to Lead Register
      </button>

      <SectionTitle sub={`Per CSO source-of-truth: 5-business-day SLA from routing to qualification decision.`}>
        Qualification — {lead.businessName || lead.name}
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Lead Record</p>
          <InfoRow label="Reference" value={<span style={{ fontFamily: "monospace", color: GOLD }}>{lead.ref}</span>} />
          <InfoRow label="Contact" value={`${lead.name}${lead.phone ? ` · ${lead.phone}` : ""}${lead.email ? ` · ${lead.email}` : ""}`} />
          <InfoRow label="Stated Request" value={lead.service} />
          <InfoRow label="Context" value={lead.context || "—"} />
          <InfoRow label="Source" value={lead.source || "direct"} />
          {lead.referrerName && <InfoRow label="Referred By" value={`${lead.referrerName} (${lead.referralSourceType || "affiliate"})`} />}
          <InfoRow label="Age" value={`${ageDays} day${ageDays === 1 ? "" : "s"} old`} />
        </Card>

        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Qualification Decision</p>
          <div style={{ fontSize: 12, color: DARK, lineHeight: 1.7 }}>
            <QualStep n={1} title="Discovery conversation" detail="Within 3 business days of routing. Document client situation, objectives, constraints, decision-maker, urgency." />
            <QualStep n={2} title="Classify engagement" detail="Project · Subscription · Project-first-then-subscription · Unsure (CSO recommends)" />
            <QualStep n={3} title="Map department" detail="BizDoc · Systemise · Skills · Multi-department (CEO coordinates)" />
            <QualStep n={4} title="Budget + urgency check" detail="Budget below minimum → disqualify. Urgency unrealistic → propose adjusted timeline." />
            <QualStep n={5} title="Feasibility check" detail="Dept lead responds within 48h: Can we deliver? Timeframe? Constraints?" />
            <QualStep n={6} title="Qualify / Disqualify / Pause" detail="Disqualification requires CSO lead review before decline sent." />
          </div>
          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 8, backgroundColor: `${GOLD}08`, border: `1px solid ${GOLD}20` }}>
            <p style={{ fontSize: 11, color: DARK, lineHeight: 1.6 }}>
              <strong>Phase 1 note:</strong> Qualification outcomes are recorded via tRPC <code>leads.updateScore</code> and <code>leads.update</code>. A dedicated qualification write-form will be added in Phase 2.
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Current Lead Score
        </p>
        <div style={{ fontSize: 36, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
          {lead.leadScore ?? 0} <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>/ 10</span>
        </div>
        <p style={{ fontSize: 11, color: MUTED }}>Assessed by: {lead.leadOwner || "Unassigned"}</p>
      </Card>
    </div>
  );
}

function QualStep({ n, title, detail }: { n: number; title: string; detail: string }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
      <span style={{
        width: 20, height: 20, borderRadius: 10, backgroundColor: `${GREEN}10`,
        color: GREEN, fontSize: 11, fontWeight: 700, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{n}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{title}</p>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{detail}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: `1px solid ${DARK}05` }}>
      <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 100 }}>{label}</span>
      <span style={{ fontSize: 12, color: DARK, flex: 1, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 4. PROPOSALS REGISTER
 * ═══════════════════════════════════════════════════════════════════════ */
function ProposalsSection() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const proposalsQuery = trpc.proposals.list.useQuery({ status: undefined });
  const proposals = (proposalsQuery.data || []) as any[];

  const filtered = statusFilter === "all" ? proposals : proposals.filter((p: any) => p.status === statusFilter);

  return (
    <div>
      <SectionTitle sub="No proposal leaves CSO without CEO approval. CEO review SLA: 48 hours.">
        Proposal Register
      </SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "draft", "sent", "accepted", "rejected", "expired"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 12px", borderRadius: 10, border: `1px solid ${DARK}10`,
              fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
              letterSpacing: "0.04em",
              backgroundColor: statusFilter === s ? GREEN : WHITE,
              color: statusFilter === s ? GOLD : MUTED,
            }}
          >
            {s} {s !== "all" && `(${proposals.filter((p: any) => p.status === s).length})`}
          </button>
        ))}
      </div>

      {proposalsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading proposals..." /></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileText}
            title={`No ${statusFilter === "all" ? "" : statusFilter} proposals`}
            hint="Proposals are drafted from qualified leads and sent after CEO approval."
          />
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((p: any) => (
              <div key={p.id} style={{
                padding: "12px 14px", borderRadius: 10, border: `1px solid ${DARK}08`,
                backgroundColor: `${DARK}02`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{p.businessName || p.clientName}</p>
                      <Pill status={p.status} />
                    </div>
                    <p style={{ fontSize: 11, fontFamily: "monospace", color: GOLD }}>{p.proposalNumber}</p>
                    <p style={{ fontSize: 12, color: DARK, marginTop: 4 }}>{fmtNaira(p.totalAmount)}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      Created by {p.createdBy || "—"} · {fmtDate(p.createdAt)}
                      {p.validUntil && ` · Valid until ${fmtDate(p.validUntil)}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 5. ONBOARDING
 * ═══════════════════════════════════════════════════════════════════════ */
function OnboardingSection() {
  const proposalsQuery = trpc.proposals.list.useQuery();
  const clientsQuery = trpc.clientTruth.list.useQuery();
  const accepted = ((proposalsQuery.data || []) as any[]).filter((p: any) => p.status === "accepted");
  const converted = ((clientsQuery.data || []) as any[]).filter((c: any) => c.status === "converted");

  return (
    <div>
      <SectionTitle sub="On proposal acceptance: assign engagement ref, notify Finance, brief CEO, send client onboarding comm.">
        Onboarding Queue
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Accepted Proposals Awaiting Onboarding
          </p>
          {accepted.length === 0 ? (
            <EmptyState icon={UserPlus} title="No accepted proposals in queue" />
          ) : accepted.map((p: any) => (
            <div key={p.id} style={{ padding: "10px 12px", borderRadius: 8, backgroundColor: `${GOLD}08`, marginBottom: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{p.businessName || p.clientName}</p>
              <p style={{ fontSize: 11, color: MUTED }}>{p.proposalNumber} · {fmtNaira(p.totalAmount)}</p>
            </div>
          ))}
        </Card>

        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Converted — Not Yet Active
          </p>
          {converted.length === 0 ? (
            <EmptyState icon={UserPlus} title="No converted clients awaiting activation" />
          ) : converted.map((c: any) => (
            <div key={c.id} style={{ padding: "10px 12px", borderRadius: 8, backgroundColor: `${GOLD}08`, marginBottom: 6 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{c.businessName || c.name}</p>
              <p style={{ fontSize: 11, color: MUTED }}>
                {c.ref} · {c.nextAction || "No next action recorded"}
              </p>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Onboarding Checklist (per Proposal_Process.md step 7)
        </p>
        <ul style={{ fontSize: 12, color: DARK, lineHeight: 1.9, paddingLeft: 18 }}>
          <li>Accepted proposal becomes the engagement agreement</li>
          <li>Both parties confirm in writing (email or signature)</li>
          <li>Assign engagement reference (inherits from lead reference)</li>
          <li>File signed agreement in 10-CLIENTS</li>
          <li>Notify Finance: engagement ref, agreed amount, payment terms, billing schedule</li>
          <li>Hand brief to CEO for department assignment</li>
          <li>Send client onboarding communication (11-TEMPLATES/Client_Onboarding_Template.md)</li>
        </ul>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 6. ACTIVE CLIENTS
 * ═══════════════════════════════════════════════════════════════════════ */
function ClientsSection() {
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailClient, setDetailClient] = useState<any | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ clientId?: number; leadId?: number } | null>(null);
  const [notifyCeoOpen, setNotifyCeoOpen] = useState<{ clientId?: number; subject?: string } | null>(null);
  const clientsQuery = trpc.clientTruth.list.useQuery();
  const clients = (clientsQuery.data || []) as any[];

  const filtered = statusFilter === "all" ? clients : clients.filter((c: any) => c.status === statusFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <SectionTitle sub="Only clients with all minimum required facts confirmed are Active. Any missing fact = Unverified.">
          Client Register
        </SectionTitle>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}
        >
          <Plus size={14} /> Add Client
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "active", "converted", "unverified", "dormant"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "6px 12px", borderRadius: 10, border: `1px solid ${DARK}10`,
              fontSize: 11, fontWeight: 600, cursor: "pointer", textTransform: "uppercase",
              letterSpacing: "0.04em",
              backgroundColor: statusFilter === s ? GREEN : WHITE,
              color: statusFilter === s ? GOLD : MUTED,
            }}
          >
            {s} {s !== "all" && `(${clients.filter((c: any) => c.status === s).length})`}
          </button>
        ))}
      </div>

      {clientsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading clients..." /></Card>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon={Building2} title={`No ${statusFilter === "all" ? "" : statusFilter} clients`} /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c: any) => (
            <ClientCard
              key={c.id}
              client={c}
              onOpen={() => setDetailClient(c)}
              onAssignTask={() => setAssignTarget({ clientId: c.id })}
              onNotifyCeo={() => setNotifyCeoOpen({ clientId: c.id, subject: `Client: ${c.businessName || c.name}` })}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddClientModal
          currentUser={null}
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            clientsQuery.refetch();
          }}
        />
      )}

      {detailClient && (
        <ClientDetailSlideOver
          client={detailClient}
          onClose={() => setDetailClient(null)}
          onAssignTask={() => setAssignTarget({ clientId: detailClient.id })}
          onNotifyCeo={() => setNotifyCeoOpen({ clientId: detailClient.id, subject: `Client: ${detailClient.businessName || detailClient.name}` })}
        />
      )}

      {assignTarget && (
        <AssignTaskModal
          clientId={assignTarget.clientId}
          leadId={assignTarget.leadId}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {notifyCeoOpen && (
        <NotifyCeoModal
          defaultSubject={notifyCeoOpen.subject}
          relatedClientId={notifyCeoOpen.clientId}
          onClose={() => setNotifyCeoOpen(null)}
        />
      )}
    </div>
  );
}

function ClientCard({
  client: c,
  onOpen,
  onAssignTask,
  onNotifyCeo,
}: {
  client: any;
  onOpen?: () => void;
  onAssignTask?: () => void;
  onNotifyCeo?: () => void;
}) {
  const [showHandoff, setShowHandoff] = useState(false);
  const tasksQuery = trpc.tasks.list.useQuery();
  const clientTasks = ((tasksQuery.data || []) as any[]).filter((t: any) =>
    (c.phone && t.phone === c.phone) || (c.name && t.clientName === c.name)
  );

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{c.businessName || c.name}</p>
            <Pill status={c.status} />
            {c.riskFlag && c.riskFlag !== "none" && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: c.riskFlag === "critical" || c.riskFlag === "high" ? RED : ORANGE,
                padding: "2px 7px", borderRadius: 10,
                backgroundColor: c.riskFlag === "critical" || c.riskFlag === "high" ? `${RED}15` : `${ORANGE}15`,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {c.riskFlag}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, fontFamily: "monospace", color: GOLD, marginBottom: 8 }}>{c.ref}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <MetaCell label="Department" value={c.department || "—"} />
            <MetaCell label="Contract" value={fmtNaira(c.contractValue)} />
            <MetaCell label="Balance" value={fmtNaira(c.balance)} warn={c.balance && parseFloat(c.balance) > 0} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <MetaCell label="CSO Owner" value={c.csoOwner || "—"} />
            <MetaCell label="Dept Owner" value={c.departmentOwner || "—"} />
            <MetaCell label="Finance Owner" value={c.financeOwner || "—"} />
          </div>

          {c.missingInfo && (
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, backgroundColor: `${ORANGE}10`, border: `1px solid ${ORANGE}25` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
                Missing Information
              </p>
              <p style={{ fontSize: 11, color: DARK }}>{c.missingInfo}</p>
            </div>
          )}

          {c.nextAction && (
            <div style={{ marginTop: 8, fontSize: 11, color: DARK }}>
              <strong style={{ color: MUTED, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Next:</strong>{" "}
              {c.nextAction}
              {c.dueDate && <span style={{ color: MUTED, marginLeft: 6 }}>· due {fmtDate(c.dueDate)}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Handoff / publish strip */}
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${DARK}06`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap",
      }}>
        <button
          onClick={() => setShowHandoff(v => !v)}
          style={{
            fontSize: 11, fontWeight: 600, color: GREEN, background: "none", border: "none",
            cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Eye size={12} />
          Department Handoff ({clientTasks.length} task{clientTasks.length === 1 ? "" : "s"})
        </button>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {onOpen && (
            <button
              onClick={onOpen}
              style={{
                fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                border: `1px solid ${GREEN}30`, color: GREEN, backgroundColor: `${GREEN}08`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Eye size={10} /> Open
            </button>
          )}
          {onAssignTask && (
            <button
              onClick={onAssignTask}
              style={{
                fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                border: `1px solid ${GOLD}40`, color: GOLD, backgroundColor: `${GOLD}08`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <UserPlus size={10} /> Assign Task
            </button>
          )}
          {onNotifyCeo && (
            <button
              onClick={onNotifyCeo}
              style={{
                fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                border: `1px solid ${RED}30`, color: RED, backgroundColor: `${RED}06`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <AlertCircle size={10} /> Escalate to CEO
            </button>
          )}
        </div>
      </div>

      {showHandoff && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, backgroundColor: `${GREEN}04`, border: `1px solid ${GREEN}10` }}>
          {clientTasks.length === 0 ? (
            <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}>No department tasks linked to this client.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {clientTasks.map((t: any) => (
                <div key={t.id} style={{ fontSize: 11, display: "flex", gap: 10, alignItems: "center", color: DARK }}>
                  <span style={{ fontFamily: "monospace", color: GOLD, fontSize: 10 }}>{t.ref || `#${t.id}`}</span>
                  <span style={{ flex: 1 }}>{t.service}</span>
                  <Pill status={t.status || "new"} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function MetaCell({ label, value, warn }: { label: string; value: string; warn?: any }) {
  return (
    <div>
      <p style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 500, color: warn ? ORANGE : DARK }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 7. RENEWALS
 * ═══════════════════════════════════════════════════════════════════════ */
function RenewalsSection() {
  const subsQuery = trpc.subscriptions.list.useQuery();
  const subs = (subsQuery.data || []) as any[];

  const flagged = subs.map((s: any) => {
    // Renewal flag triggers: 45 / 30 / 14 / 7 days before term end.
    // Subscription table stores `billingDay` (monthly) — approximate next cycle end.
    const days = s.endDate ? daysUntil(s.endDate) : null;
    let stage: string | null = null;
    if (days !== null) {
      if (days <= 0) stage = "term-ended";
      else if (days <= 7) stage = "finalise";
      else if (days <= 14) stage = "decide";
      else if (days <= 30) stage = "engage";
      else if (days <= 45) stage = "flag";
    }
    return { ...s, daysUntil: days, stage };
  }).filter((s: any) => s.stage);

  return (
    <div>
      <SectionTitle sub="45 → 30 → 14 → 7 → 0. No subscription lapses by accident.">
        Renewal Pipeline
      </SectionTitle>

      {subsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading subscriptions..." /></Card>
      ) : flagged.length === 0 ? (
        <Card><EmptyState icon={RefreshCw} title="No renewals in the next 45 days" hint="Subscriptions with end dates will appear here as the renewal window approaches." /></Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {flagged.map((s: any) => (
              <div key={s.id} style={{
                padding: "12px 14px", borderRadius: 10, border: `1px solid ${DARK}08`,
                backgroundColor: `${DARK}02`, display: "flex", gap: 14, alignItems: "center",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                  backgroundColor: s.stage === "term-ended" ? `${RED}15` :
                                   s.stage === "finalise" ? `${RED}10` :
                                   s.stage === "decide" ? `${ORANGE}15` :
                                   `${GOLD}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: s.stage === "term-ended" || s.stage === "finalise" ? RED :
                         s.stage === "decide" ? ORANGE : GOLD,
                  fontWeight: 700, fontSize: 13,
                }}>
                  {s.daysUntil !== null ? `${s.daysUntil}d` : "—"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{s.clientName}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {s.service} · {fmtNaira(s.monthlyFee)}/mo · ends {fmtDate(s.endDate)}
                  </p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  backgroundColor: s.stage === "flag" ? `${GOLD}15` : s.stage === "engage" ? `${BLUE}15` :
                                   s.stage === "decide" ? `${ORANGE}15` : `${RED}15`,
                  color: s.stage === "flag" ? GOLD : s.stage === "engage" ? BLUE :
                         s.stage === "decide" ? ORANGE : RED,
                }}>
                  {s.stage}
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
 * 8. REFERRAL SOURCES
 * ═══════════════════════════════════════════════════════════════════════ */
function ReferralsSection() {
  const leadsQuery = trpc.leads.list.useQuery();
  const leads = (leadsQuery.data || []) as any[];

  const bySource: Record<string, any[]> = {};
  leads.forEach((l: any) => {
    const src = l.source || "direct";
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push(l);
  });

  const byReferrer: Record<string, any[]> = {};
  leads.filter((l: any) => l.referrerName).forEach((l: any) => {
    const r = l.referrerName;
    if (!byReferrer[r]) byReferrer[r] = [];
    byReferrer[r].push(l);
  });

  return (
    <div>
      <SectionTitle sub="Source attribution for every lead — direct, BizDev affiliate, returning client, or CSO outreach.">
        Referral Source Visibility
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            By Source
          </p>
          {Object.keys(bySource).length === 0 ? (
            <EmptyState icon={Network} title="No lead source data yet" />
          ) : Object.entries(bySource).map(([src, ls]) => {
            const max = Math.max(...Object.values(bySource).map(a => a.length));
            return (
              <div key={src} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: DARK, textTransform: "capitalize" }}>{src}</span>
                  <span style={{ fontSize: 11, color: MUTED }}>{ls.length} lead{ls.length === 1 ? "" : "s"}</span>
                </div>
                <div style={{ height: 6, backgroundColor: `${DARK}08`, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(ls.length / max) * 100}%`, height: "100%", backgroundColor: GOLD, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            By Referrer (Affiliate / Returning Client)
          </p>
          {Object.keys(byReferrer).length === 0 ? (
            <EmptyState icon={Network} title="No referred leads yet" hint="Referred leads will show attribution here for commission tracking." />
          ) : Object.entries(byReferrer).map(([r, ls]) => (
            <div key={r} style={{ padding: "8px 12px", borderRadius: 8, backgroundColor: `${DARK}03`, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: DARK }}>{r}</span>
              <span style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>{ls.length}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 9. RHYTHM / CALENDAR
 * ═══════════════════════════════════════════════════════════════════════ */
function RhythmSection() {
  const rhythm = [
    {
      phase: "Lead Intake",
      items: [
        ["Log + assign reference", "Immediately on receipt"],
        ["Acknowledge", "4 business hours"],
        ["Initial assessment", "24 hours"],
        ["CEO daily summary", "End of business day"],
        ["Route or decline", "48 hours"],
      ],
    },
    {
      phase: "Qualification",
      items: [
        ["Discovery conversation", "Within 3 business days"],
        ["Department feasibility response", "48 hours"],
        ["Qualification decision", "Within 5 business days"],
        ["Notify client of outcome", "1 business day after decision"],
      ],
    },
    {
      phase: "Proposal",
      items: [
        ["Proposal drafted", "3 business days from qualification"],
        ["Department confirmation", "48 hours"],
        ["CEO review", "48 hours"],
        ["Sent to client", "Within 7 business days of qualification"],
        ["First follow-up if no response", "7 days after sending"],
        ["Second follow-up", "14 days after sending"],
        ["Mark inactive", "After 14-day follow-up"],
      ],
    },
    {
      phase: "Client Updates",
      items: [
        ["Project <30d", "Weekly"],
        ["Project 30d+", "Fortnightly"],
        ["Subscription", "Monthly"],
        ["Incident (Systemise)", "Per incident until resolved"],
      ],
    },
    {
      phase: "Subscription Renewal",
      items: [
        ["Renewal flag", "45 days before term end"],
        ["Department input", "40 days before term end"],
        ["Internal review", "30 days before term end"],
        ["Client conversation", "30 days before term end"],
        ["Client decision", "14 days before term end"],
        ["Finalisation", "7 days before term end"],
      ],
    },
  ];

  return (
    <div>
      <SectionTitle sub="SLA reference — all times from HAMZURY CSO source-of-truth documents.">
        CSO Rhythm & SLA Calendar
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rhythm.map(r => (
          <Card key={r.phase}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              {r.phase}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {r.items.map(([step, sla]) => (
                <div key={step} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 10px", borderRadius: 6, backgroundColor: `${DARK}02`,
                }}>
                  <span style={{ fontSize: 12, color: DARK }}>{step}</span>
                  <span style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>{sla}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * PHASE 2 — TARGETS SECTION
 * ═══════════════════════════════════════════════════════════════════════ */
function TargetsSection() {
  const targetsQuery = trpc.targets.listForRole.useQuery({ role: "cso", period: "all" });
  const list = (targetsQuery.data || []) as any[];
  const today = new Date().toISOString().slice(0, 10);
  const current = list.filter(t => t.status === "active" && t.periodStart <= today && t.periodEnd >= today);
  const history = list.filter(t => !(t.status === "active" && t.periodStart <= today && t.periodEnd >= today));

  return (
    <div>
      <SectionTitle sub="CEO-assigned targets for the CSO role — live progress against verified activity.">
        Targets
      </SectionTitle>

      {targetsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading targets…" /></Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No targets set yet" hint="CEO can assign targets from CEO Dashboard → Set Target." />
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Current Period
            </p>
            {current.length === 0 ? (
              <EmptyState icon={Target} title="No active targets for this period" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {current.map(t => <TargetRow key={t.id} t={t} />)}
              </div>
            )}
          </Card>

          {history.length > 0 && (
            <Card>
              <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                History
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map(t => <TargetRow key={t.id} t={t} compact />)}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function TargetRow({ t, compact }: { t: any; compact?: boolean }) {
  const target = parseFloat(t.targetValue || "0");
  const actual = Number(t.actualValue || 0);
  const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;
  const label = (t.metric || "custom").replace(/_/g, " ");
  return (
    <div style={{
      padding: compact ? "8px 10px" : "12px 14px", borderRadius: 10,
      backgroundColor: compact ? `${DARK}02` : `${GREEN}04`,
      border: `1px solid ${DARK}08`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: DARK, textTransform: "capitalize" }}>{label}</p>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
            {t.period} · {t.periodStart} → {t.periodEnd} · status: {t.status}
          </p>
        </div>
        <div style={{ fontSize: 12, color: DARK, fontWeight: 600 }}>
          {actual} <span style={{ color: MUTED, fontWeight: 400 }}>/ {target}</span>
        </div>
      </div>
      <div style={{ height: 6, backgroundColor: `${DARK}08`, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          backgroundColor: pct >= 100 ? "#22C55E" : pct >= 60 ? GOLD : ORANGE,
          borderRadius: 3, transition: "width 0.3s",
        }} />
      </div>
      {t.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>{t.notes}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * PHASE 2 — CALENDAR SECTION
 * ═══════════════════════════════════════════════════════════════════════ */
const EVENT_COLORS: Record<string, string> = {
  meeting: "#3B82F6",
  follow_up: "#B48C4C",
  deadline: "#EF4444",
  renewal: "#22C55E",
  internal: "#8B5CF6",
  other: "#9CA3AF",
};

function CalendarSection() {
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1); d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const monthStart = new Date(cursor);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
  const from = monthStart.toISOString();
  const to = monthEnd.toISOString();

  const eventsQuery = trpc.calendar.list.useQuery({ from, to });
  const events = (eventsQuery.data || []) as any[];

  const byDate: Record<string, any[]> = {};
  events.forEach(e => {
    const key = new Date(e.startAt).toISOString().slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(e);
  });

  // Build month grid
  const firstWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay(); // 0=Sun
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: { date: string | null; day: number | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(cursor.getFullYear(), cursor.getMonth(), d).toISOString().slice(0, 10);
    cells.push({ date: dateStr, day: d });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedEvents = selectedDay ? (byDate[selectedDay] || []) : [];

  const monthLabel = cursor.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  return (
    <div>
      <SectionTitle sub="Shared calendar — meetings, follow-ups, deadlines and renewals across CSO operations.">
        Calendar
      </SectionTitle>

      <Card>
        {/* Month nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer", color: GREEN, padding: 6 }}
          >
            <ChevronLeft size={18} />
          </button>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{monthLabel}</p>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer", color: GREEN, padding: 6 }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10, color: MUTED, fontWeight: 600, padding: 4 }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {cells.map((c, i) => {
            if (!c.date) return <div key={i} />;
            const dayEvents = byDate[c.date] || [];
            const isToday = c.date === todayStr;
            const isSelected = c.date === selectedDay;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(c.date)}
                style={{
                  aspectRatio: "1", borderRadius: 8, border: `1px solid ${isSelected ? GOLD : DARK}10`,
                  backgroundColor: isSelected ? `${GOLD}15` : isToday ? `${GREEN}08` : WHITE,
                  padding: 4, cursor: "pointer", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "flex-start", gap: 2,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: isToday ? 700 : 500, color: DARK }}>{c.day}</span>
                {dayEvents.length > 0 && (
                  <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div key={idx} style={{
                        width: 5, height: 5, borderRadius: 3,
                        backgroundColor: EVENT_COLORS[e.eventType] || EVENT_COLORS.other,
                      }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDay && (
        <Card style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {new Date(selectedDay).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                backgroundColor: GREEN, color: GOLD, fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Plus size={12} /> Add Event
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <EmptyState icon={Calendar} title="No events this day" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedEvents.map((e: any) => (
                <div key={e.id} style={{
                  padding: "10px 12px", borderRadius: 8,
                  borderLeft: `3px solid ${EVENT_COLORS[e.eventType] || EVENT_COLORS.other}`,
                  backgroundColor: `${DARK}03`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{e.title}</p>
                    <span style={{ fontSize: 10, color: EVENT_COLORS[e.eventType] || EVENT_COLORS.other, fontWeight: 600, textTransform: "uppercase" }}>
                      {(e.eventType || "other").replace("_", " ")}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {e.allDay ? "All day" : new Date(e.startAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                    {e.location ? ` · ${e.location}` : ""}
                    {e.ownerName ? ` · ${e.ownerName}` : ""}
                  </p>
                  {e.description && <p style={{ fontSize: 11, color: DARK, marginTop: 4 }}>{e.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {showCreate && selectedDay && (
        <AddEventModal
          defaultDate={selectedDay}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); eventsQuery.refetch(); }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * PHASE 2 — SETTINGS SECTION
 * ═══════════════════════════════════════════════════════════════════════ */
function SettingsSection({ currentUser }: { currentUser: any }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => toast.success("Profile updated"),
    onError: (e) => toast.error(e.message),
  });
  const changePw = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Profile and password — changes are audit-logged and take effect immediately.">
        Settings
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Profile</p>
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <button
            onClick={() => {
              const payload: any = {};
              if (name && name !== currentUser?.name) payload.name = name;
              if (email && email !== currentUser?.email) payload.email = email;
              if (phone !== currentUser?.phone) payload.phone = phone;
              if (Object.keys(payload).length === 0) { toast("Nothing to update"); return; }
              updateProfile.mutate(payload);
            }}
            disabled={updateProfile.isPending}
            style={{
              marginTop: 10, padding: "8px 14px", borderRadius: 10, border: "none",
              backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer",
              width: "100%",
            }}
          >
            {updateProfile.isPending ? "Saving…" : "Save profile"}
          </button>
        </Card>

        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Change password</p>
          <Field label="Current password" type="password" value={oldPw} onChange={setOldPw} />
          <Field label="New password (min 8)" type="password" value={newPw} onChange={setNewPw} />
          <Field label="Confirm new password" type="password" value={confirmPw} onChange={setConfirmPw} />
          <button
            onClick={() => {
              if (newPw !== confirmPw) { toast.error("New passwords do not match"); return; }
              if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
              changePw.mutate({ oldPassword: oldPw, newPassword: newPw });
            }}
            disabled={changePw.isPending}
            style={{
              marginTop: 10, padding: "8px 14px", borderRadius: 10, border: "none",
              backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer",
              width: "100%",
            }}
          >
            {changePw.isPending ? "Updating…" : "Update password"}
          </button>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 8 }}>
            <Lock size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            Password change is only available for email-based staff accounts.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DARK}15`,
          fontSize: 13, color: DARK, backgroundColor: `${DARK}02`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * PHASE 2 — MODALS: AddClient, AssignTask, NotifyCeo, AddEvent, ClientDetail
 * ═══════════════════════════════════════════════════════════════════════ */
function ModalShell({ title, onClose, children, width = 560 }: {
  title: string; onClose: () => void; children: React.ReactNode; width?: number;
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center",
        zIndex: 100, padding: isMobile ? 0 : 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: WHITE, borderRadius: isMobile ? 0 : 16,
          width: "100%", maxWidth: isMobile ? "100%" : width,
          maxHeight: isMobile ? "100%" : "90vh",
          overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${DARK}08`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: "sticky", top: 0, backgroundColor: WHITE, zIndex: 1,
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{title}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function AddClientModal({ onClose, onCreated, currentUser: _cu }: { onClose: () => void; onCreated: () => void; currentUser: any }) {
  const [form, setForm] = useState({
    businessName: "", contactName: "", phone: "", email: "",
    engagementType: "project" as "project" | "subscription" | "project_then_sub",
    servicesRaw: "",
    value: "",
    billingCycle: "one_time" as "one_time" | "monthly" | "quarterly" | "annual",
    startDate: new Date().toISOString().slice(0, 10),
    csoOwnerId: "cso",
    bizdocOwner: "",
    systemiseOwner: "",
    skillsOwner: "",
    notes: "",
    source: "cso_manual",
  });

  const create = trpc.csoActions.manualCreateClient.useMutation({
    onSuccess: (r) => {
      toast.success(`Client created · ${r.ref}`);
      onCreated();
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = () => {
    const services = form.servicesRaw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    if (!form.businessName || !form.contactName || !form.phone || services.length === 0 || !form.value) {
      toast.error("Business name, contact, phone, services and value are required");
      return;
    }
    const deptOwners: Record<string, string> = {};
    if (form.bizdocOwner) deptOwners.bizdoc = form.bizdocOwner;
    if (form.systemiseOwner) deptOwners.systemise = form.systemiseOwner;
    if (form.skillsOwner) deptOwners.skills = form.skillsOwner;
    create.mutate({
      businessName: form.businessName,
      contactName: form.contactName,
      phone: form.phone,
      email: form.email || undefined,
      engagementType: form.engagementType,
      services,
      value: parseFloat(form.value),
      billingCycle: form.billingCycle,
      startDate: form.startDate,
      csoOwnerId: form.csoOwnerId,
      departmentOwners: deptOwners,
      notes: form.notes || undefined,
      source: form.source,
    });
  };

  return (
    <ModalShell title="Add Client (CSO Manual)" onClose={onClose} width={640}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Business name *" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} />
        <Field label="Contact name *" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
        <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <SelectField
          label="Engagement type *"
          value={form.engagementType}
          onChange={(v) => setForm({ ...form, engagementType: v as any })}
          options={[
            { value: "project", label: "Project" },
            { value: "subscription", label: "Subscription" },
            { value: "project_then_sub", label: "Project then Subscription" },
          ]}
        />
        <SelectField
          label="Billing cycle"
          value={form.billingCycle}
          onChange={(v) => setForm({ ...form, billingCycle: v as any })}
          options={[
            { value: "one_time", label: "One-time" },
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "annual", label: "Annual" },
          ]}
        />
      </div>
      <Field label="Services (comma-separated) *" value={form.servicesRaw} onChange={(v) => setForm({ ...form, servicesRaw: v })} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Contract value (NGN) *" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />
        <Field label="Start date" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
      </div>
      <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 12, marginBottom: 4 }}>Department owners (leave blank to skip)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <SelectField
          label="BizDoc owner"
          value={form.bizdocOwner}
          onChange={(v) => setForm({ ...form, bizdocOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.bizdoc || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Systemise owner"
          value={form.systemiseOwner}
          onChange={(v) => setForm({ ...form, systemiseOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.systemise || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Skills owner"
          value={form.skillsOwner}
          onChange={(v) => setForm({ ...form, skillsOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.skills || []).map(l => ({ value: l.name, label: l.name }))]}
        />
      </div>
      <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

      <button
        onClick={submit}
        disabled={create.isPending}
        style={{
          marginTop: 14, padding: "10px 16px", borderRadius: 10, border: "none",
          backgroundColor: GREEN, color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer",
          width: "100%",
        }}
      >
        {create.isPending ? "Creating…" : "Create client"}
      </button>
    </ModalShell>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DARK}15`,
          fontSize: 13, color: DARK, backgroundColor: `${DARK}02`,
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function AssignTaskModal({ clientId, leadId, onClose }: { clientId?: number; leadId?: number; onClose: () => void }) {
  const [dept, setDept] = useState<"bizdoc" | "systemise" | "skills">("bizdoc");
  const [assignee, setAssignee] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const assign = trpc.csoActions.assignTaskToDept.useMutation({
    onSuccess: (r) => { toast.success(`Task ${r.ref} assigned`); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  const deptOptions = DEPT_LEADS[dept] || [];

  return (
    <ModalShell title="Assign Task" onClose={onClose}>
      <SelectField
        label="Department *"
        value={dept}
        onChange={(v) => { setDept(v as any); setAssignee(""); }}
        options={[
          { value: "bizdoc", label: "BizDoc" },
          { value: "systemise", label: "Systemise" },
          { value: "skills", label: "Skills" },
        ]}
      />
      <SelectField
        label="Assign to *"
        value={assignee}
        onChange={setAssignee}
        options={[{ value: "", label: "— select —" }, ...deptOptions.map(l => ({ value: l.name, label: l.name }))]}
      />
      <Field label="Task title *" value={title} onChange={setTitle} />
      <Field label="Description" value={desc} onChange={setDesc} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Deadline" type="date" value={deadline} onChange={setDeadline} />
        <SelectField
          label="Priority"
          value={priority}
          onChange={(v) => setPriority(v as any)}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
      </div>
      <button
        onClick={() => {
          if (!assignee || !title) { toast.error("Assignee and title required"); return; }
          assign.mutate({
            clientId, leadId, department: dept, assignedTo: assignee,
            title, description: desc || undefined,
            deadline: deadline || undefined, priority,
          });
        }}
        disabled={assign.isPending}
        style={{
          marginTop: 8, padding: "10px 16px", borderRadius: 10, border: "none",
          backgroundColor: GREEN, color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer",
          width: "100%",
        }}
      >
        {assign.isPending ? "Assigning…" : "Assign task"}
      </button>
    </ModalShell>
  );
}

function NotifyCeoModal({ defaultSubject, relatedClientId, relatedLeadId, relatedProposalId, onClose }: {
  defaultSubject?: string;
  relatedClientId?: number; relatedLeadId?: number; relatedProposalId?: number;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(defaultSubject || "");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "urgent">("info");

  const notify = trpc.csoActions.notifyCeo.useMutation({
    onSuccess: () => { toast.success("CEO notified"); onClose(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <ModalShell title="Notify CEO" onClose={onClose}>
      <Field label="Subject *" value={subject} onChange={setSubject} />
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>Message *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DARK}15`,
            fontSize: 13, color: DARK, backgroundColor: `${DARK}02`, resize: "vertical",
          }}
        />
      </div>
      <SelectField
        label="Severity"
        value={severity}
        onChange={(v) => setSeverity(v as any)}
        options={[
          { value: "info", label: "Info" },
          { value: "warning", label: "Warning" },
          { value: "urgent", label: "Urgent" },
        ]}
      />
      <button
        onClick={() => {
          if (!subject || !message) { toast.error("Subject and message required"); return; }
          notify.mutate({
            subject, message, severity,
            relatedClientId, relatedLeadId, relatedProposalId,
          });
        }}
        disabled={notify.isPending}
        style={{
          marginTop: 8, padding: "10px 16px", borderRadius: 10, border: "none",
          backgroundColor: GREEN, color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer",
          width: "100%",
        }}
      >
        {notify.isPending ? "Sending…" : "Send to CEO"}
      </button>
    </ModalShell>
  );
}

function AddEventModal({ defaultDate, onClose, onCreated }: { defaultDate: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [eventType, setEventType] = useState<string>("meeting");
  const [location, setLocation] = useState("");

  const create = trpc.calendar.create.useMutation({
    onSuccess: () => { toast.success("Event created"); onCreated(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <ModalShell title="Add Event" onClose={onClose}>
      <Field label="Title *" value={title} onChange={setTitle} />
      <Field label="Description" value={desc} onChange={setDesc} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Date *" type="date" value={date} onChange={setDate} />
        <Field label="Time" type="time" value={time} onChange={setTime} />
      </div>
      <SelectField
        label="Event type"
        value={eventType}
        onChange={setEventType}
        options={[
          { value: "meeting", label: "Meeting" },
          { value: "follow_up", label: "Follow-up" },
          { value: "deadline", label: "Deadline" },
          { value: "renewal", label: "Renewal" },
          { value: "internal", label: "Internal" },
          { value: "other", label: "Other" },
        ]}
      />
      <Field label="Location" value={location} onChange={setLocation} />
      <button
        onClick={() => {
          if (!title) { toast.error("Title required"); return; }
          const startAt = new Date(`${date}T${time}:00`).toISOString();
          create.mutate({
            title, description: desc || undefined, startAt,
            allDay: false,
            eventType: eventType as any,
            visibility: "team",
            location: location || undefined,
          });
        }}
        disabled={create.isPending}
        style={{
          marginTop: 8, padding: "10px 16px", borderRadius: 10, border: "none",
          backgroundColor: GREEN, color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer",
          width: "100%",
        }}
      >
        {create.isPending ? "Creating…" : "Create event"}
      </button>
    </ModalShell>
  );
}

function ClientDetailSlideOver({
  client, onClose, onAssignTask, onNotifyCeo,
}: {
  client: any; onClose: () => void; onAssignTask: () => void; onNotifyCeo: () => void;
}) {
  const notesQuery = trpc.clientNotes.list.useQuery({ clientId: client.id });
  const notes = (notesQuery.data || []) as any[];
  const tasksQuery = trpc.tasks.list.useQuery();
  const subsQuery = trpc.subscriptions.list.useQuery();
  const invoicesQuery = trpc.invoices.list.useQuery();

  const clientTasks = ((tasksQuery.data || []) as any[]).filter((t: any) =>
    (client.phone && t.phone === client.phone) || (client.name && t.clientName === client.name)
  );
  const clientSubs = ((subsQuery.data || []) as any[]).filter((s: any) =>
    (client.phone && s.phone === client.phone) || (client.name && s.clientName === client.name)
  );
  const clientInvoices = ((invoicesQuery.data || []) as any[]).filter((i: any) =>
    (client.phone && i.clientPhone === client.phone) || (client.name && i.clientName === client.name)
  );

  const [newNote, setNewNote] = useState("");
  const [noteKind, setNoteKind] = useState<"internal" | "ceo_brief" | "client_update" | "risk_flag">("internal");
  const createNote = trpc.clientNotes.create.useMutation({
    onSuccess: () => { setNewNote(""); notesQuery.refetch(); toast.success("Note added"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 90,
        display: "flex", justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520, backgroundColor: WHITE,
          display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
        }}
      >
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${DARK}08`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10,
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{client.businessName || client.name}</p>
            <p style={{ fontSize: 11, fontFamily: "monospace", color: GOLD }}>{client.ref}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {/* Activate Client Dashboard — prominent gateway to the client's onboarding/dashboard flow.
              Opens in a new tab so CSO keeps context in the portal. */}
          {client.status === "active" && client.ref && (
            <div style={{
              marginBottom: 14, padding: "12px 14px", borderRadius: 10,
              background: `linear-gradient(90deg, ${GREEN}10, ${GOLD}10)`,
              border: `1px solid ${GREEN}25`,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Client Dashboard
              </p>
              <p style={{ fontSize: 11, color: MUTED, marginBottom: 10, lineHeight: 1.4 }}>
                Open {client.businessName || client.name}'s self-service onboarding + dashboard flow.
                This is what the client sees at <code style={{ background: `${DARK}08`, padding: "1px 6px", borderRadius: 4 }}>/start/{client.ref}</code>.
              </p>
              <a
                href={`/start/${encodeURIComponent(client.ref)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 700, padding: "8px 14px", borderRadius: 8,
                  backgroundColor: GREEN, color: GOLD, textDecoration: "none",
                }}
              >
                <ExternalLink size={12} /> Activate Client Dashboard
              </a>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            <button onClick={onAssignTask} style={{
              fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
              border: `1px solid ${GOLD}40`, color: GOLD, backgroundColor: `${GOLD}08`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>
              <UserPlus size={12} /> Assign Task
            </button>
            <button onClick={onNotifyCeo} style={{
              fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
              border: `1px solid ${RED}30`, color: RED, backgroundColor: `${RED}06`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}>
              <AlertCircle size={12} /> Escalate to CEO
            </button>
            <button
              onClick={() => toast("Client-safe update publishing — Phase 2+: will push to client dashboard once dept confirms")}
              style={{
                fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
                border: `1px solid ${GREEN}30`, color: GREEN, backgroundColor: `${GREEN}08`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Send size={12} /> Publish update
            </button>
          </div>

          <Card style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Overview</p>
            <InfoRow label="Status" value={<Pill status={client.status} />} />
            <InfoRow label="Department" value={client.department || "—"} />
            <InfoRow label="Phone" value={client.phone || "—"} />
            <InfoRow label="Email" value={client.email || "—"} />
            <InfoRow label="Contract" value={fmtNaira(client.contractValue)} />
            <InfoRow label="Paid" value={fmtNaira(client.amountPaid)} />
            <InfoRow label="Balance" value={fmtNaira(client.balance)} />
            <InfoRow label="Next action" value={client.nextAction || "—"} />
            <InfoRow label="Due" value={fmtDate(client.dueDate)} />
          </Card>

          {clientSubs.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Subscriptions ({clientSubs.length})</p>
              {clientSubs.map((s: any) => (
                <div key={s.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${DARK}05` }}>
                  <strong>{s.service}</strong> · {fmtNaira(s.monthlyFee)}/mo · {s.status}
                </div>
              ))}
            </Card>
          )}

          <Card style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Tasks ({clientTasks.length})</p>
            {clientTasks.length === 0 ? (
              <p style={{ fontSize: 11, color: MUTED }}>No tasks yet.</p>
            ) : clientTasks.map((t: any) => (
              <div key={t.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${DARK}05`, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{t.service}</span>
                <Pill status={t.status || "new"} />
              </div>
            ))}
          </Card>

          {clientInvoices.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Invoices ({clientInvoices.length})</p>
              {clientInvoices.map((i: any) => (
                <div key={i.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${DARK}05`, display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>{i.invoiceNumber} · {fmtNaira(i.total)}</span>
                  <Pill status={i.status} />
                </div>
              ))}
            </Card>
          )}

          <Card>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Notes ({notes.length})
            </p>
            <div style={{ marginBottom: 10 }}>
              <SelectField
                label="Kind"
                value={noteKind}
                onChange={(v) => setNoteKind(v as any)}
                options={[
                  { value: "internal", label: "Internal" },
                  { value: "ceo_brief", label: "CEO brief" },
                  { value: "client_update", label: "Client update" },
                  { value: "risk_flag", label: "Risk flag" },
                ]}
              />
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add note…"
                rows={3}
                style={{
                  width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DARK}15`,
                  fontSize: 13, color: DARK, backgroundColor: `${DARK}02`, resize: "vertical",
                }}
              />
              <button
                onClick={() => {
                  if (!newNote.trim()) return;
                  createNote.mutate({ clientId: client.id, kind: noteKind, body: newNote.trim() });
                }}
                disabled={createNote.isPending}
                style={{
                  marginTop: 6, padding: "6px 12px", borderRadius: 8, border: "none",
                  backgroundColor: GREEN, color: GOLD, fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}
              >
                {createNote.isPending ? "Saving…" : "Add note"}
              </button>
            </div>
            {notes.length === 0 ? (
              <p style={{ fontSize: 11, color: MUTED }}>No notes yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notes.map((n: any) => (
                  <div key={n.id} style={{ padding: "8px 10px", borderRadius: 8, backgroundColor: `${DARK}03` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase" }}>{(n.kind || "internal").replace("_", " ")}</span>
                      <span style={{ fontSize: 10, color: MUTED }}>{fmtDate(n.createdAt)} · {n.authorName || "Staff"}</span>
                    </div>
                    <p style={{ fontSize: 12, color: DARK, whiteSpace: "pre-wrap" }}>{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * PIPELINE (v1 restructure — 8-column Kanban)
 * ═══════════════════════════════════════════════════════════════════════ */
const PIPELINE_STAGES: { key: string; label: string; color: string }[] = [
  { key: "new",           label: "New",            color: BLUE },
  { key: "qualified",     label: "Qualified",      color: "#6366F1" },
  { key: "proposal_sent", label: "Proposal Sent",  color: GOLD },
  { key: "negotiation",   label: "Negotiation",    color: "#8B5CF6" },
  { key: "onboarding",    label: "Onboarding",     color: ORANGE },
  { key: "won",           label: "Won",            color: "#22C55E" },
  { key: "lost",          label: "Lost",           color: RED },
  { key: "paused",        label: "Paused",         color: MUTED },
];

function PipelineSection({ onQualify }: { onQualify: (id: number) => void }) {
  const groupedQuery = trpc.leads.list.useQuery({ groupByStage: true } as any);
  const utils = trpc.useUtils();
  const updateStage = trpc.leads.updateStage.useMutation({
    onSuccess: () => { toast.success("Stage updated"); utils.leads.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => { toast.success("Lead deleted"); utils.leads.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const grouped = (groupedQuery.data || {}) as Record<string, any[]>;

  const handleMove = (leadId: number, newStage: string) => {
    updateStage.mutate({ leadId, stage: newStage as any });
  };

  const handleDelete = (lead: any) => {
    if (deleteLead.isPending) return;
    if (!window.confirm(`Delete lead ${lead.ref || "#" + lead.id} — ${lead.name || lead.businessName || ""}? This cannot be undone.`)) return;
    deleteLead.mutate({ id: lead.id });
  };

  return (
    <div>
      <SectionTitle sub="Drag leads across stages. Every stage change is audit-logged.">
        Pipeline
      </SectionTitle>

      {groupedQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading pipeline..." /></Card>
      ) : (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
          {PIPELINE_STAGES.map(stage => {
            const items = (grouped[stage.key] || []) as any[];
            return (
              <div key={stage.key} style={{
                minWidth: 240, maxWidth: 260, flex: "0 0 auto",
                backgroundColor: `${stage.color}06`, borderRadius: 12,
                border: `1px solid ${stage.color}20`, padding: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 4px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: stage.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {stage.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
                  {items.length === 0 ? (
                    <p style={{ fontSize: 10, color: `${MUTED}80`, textAlign: "center", padding: "12px 0" }}>Empty</p>
                  ) : items.map((lead: any) => (
                    <div key={lead.id}
                      style={{
                        backgroundColor: WHITE, borderRadius: 10, padding: "10px 12px",
                        border: `1px solid ${DARK}08`, boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                        cursor: "pointer",
                      }}
                      onClick={() => onQualify(lead.id)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: DARK, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {lead.name || lead.businessName || "Unnamed"}
                        </p>
                        <button
                          title="Delete lead"
                          onClick={(e) => { e.stopPropagation(); handleDelete(lead); }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: RED, padding: 2, opacity: 0.7,
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <p style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>
                        {lead.phone || lead.email || "—"}
                      </p>
                      {(lead.referralCode || lead.source) && (
                        <div style={{ marginBottom: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                          <SourceBadge code={lead.referralCode} source={lead.source} referrerName={lead.referrerName} />
                        </div>
                      )}
                      <select
                        value={stage.key}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleMove(lead.id, e.target.value)}
                        style={{
                          width: "100%", padding: "4px 6px", borderRadius: 6,
                          border: `1px solid ${DARK}15`, fontSize: 10, color: DARK,
                          backgroundColor: `${stage.color}08`,
                        }}
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * SUBSCRIPTIONS (v1 restructure — recurring engagements + renewal urgency)
 * ═══════════════════════════════════════════════════════════════════════ */
function SubscriptionsSection() {
  const subsQuery = trpc.subscriptions.list.useQuery();
  const subs = (subsQuery.data || []) as any[];

  const enriched = subs.map((s: any) => {
    const days = s.endDate ? daysUntil(s.endDate) : null;
    let urgency: "safe" | "flag" | "engage" | "decide" | "finalise" | "ended" = "safe";
    if (days !== null) {
      if (days <= 0) urgency = "ended";
      else if (days <= 7) urgency = "finalise";
      else if (days <= 14) urgency = "decide";
      else if (days <= 30) urgency = "engage";
      else if (days <= 45) urgency = "flag";
    }
    return { ...s, daysUntil: days, urgency };
  });

  const urgencyColor: Record<string, string> = {
    safe: "#22C55E", flag: GOLD, engage: BLUE, decide: ORANGE, finalise: RED, ended: RED,
  };

  return (
    <div>
      <SectionTitle sub="Only recurring engagements. Renewal urgency auto-flagged 45/30/14/7 days.">
        Subscriptions
      </SectionTitle>

      {subsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading subscriptions..." /></Card>
      ) : enriched.length === 0 ? (
        <Card><EmptyState icon={RefreshCw} title="No subscriptions yet" hint="Recurring engagements created in Active Clients will appear here." /></Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {enriched.map((s: any) => (
              <div key={s.id} style={{
                padding: "12px 14px", borderRadius: 10, border: `1px solid ${DARK}08`,
                backgroundColor: `${DARK}02`, display: "flex", gap: 14, alignItems: "center",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                  backgroundColor: `${urgencyColor[s.urgency]}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: urgencyColor[s.urgency], fontWeight: 700, fontSize: 12,
                }}>
                  {s.daysUntil !== null ? `${s.daysUntil}d` : "∞"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{s.clientName}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {s.service} · {fmtNaira(s.monthlyFee)}/mo · {s.status}
                  </p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 10,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  backgroundColor: `${urgencyColor[s.urgency]}15`,
                  color: urgencyColor[s.urgency],
                }}>
                  {s.urgency}
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
 * TASKS (v1 restructure — My tasks / Team tasks)
 * ═══════════════════════════════════════════════════════════════════════ */
function TasksSection({ isCsoStaff }: { isCsoStaff: boolean }) {
  const [tab, setTab] = useState<"mine" | "team">("mine");
  const myQuery = trpc.tasks.myTasks.useQuery();
  const teamQuery = trpc.tasks.list.useQuery(undefined, { enabled: !isCsoStaff && tab === "team" });

  const rows = tab === "mine" ? (myQuery.data || []) : (teamQuery.data || []);
  const loading = tab === "mine" ? myQuery.isLoading : teamQuery.isLoading;

  return (
    <div>
      <SectionTitle sub="Your work queue. Team tab is visible to CSO Lead only.">
        Tasks
      </SectionTitle>

      {!isCsoStaff && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[
            { k: "mine" as const, label: "My Tasks" },
            { k: "team" as const, label: "Team Tasks" },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                padding: "7px 14px", borderRadius: 10, border: "none",
                backgroundColor: tab === t.k ? GREEN : `${DARK}06`,
                color: tab === t.k ? GOLD : DARK,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >{t.label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <Card><EmptyState icon={Loader2} title="Loading tasks..." /></Card>
      ) : (rows as any[]).length === 0 ? (
        <Card><EmptyState icon={CheckCircle2} title="No tasks" hint={tab === "mine" ? "You're clear." : "Team is clear."} /></Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(rows as any[]).map((t: any) => (
              <div key={t.id || t.ref} style={{
                padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}08`,
                backgroundColor: `${DARK}02`,
                display: "flex", gap: 12, alignItems: "center",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {t.service || t.title || t.ref}
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {t.ref} · {t.clientName || "—"} · {t.department || "—"}
                  </p>
                </div>
                <Pill status={(t.status || "new").toString().toLowerCase().replace(/\s+/g, "_")} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * BACK OFFICE (v1 restructure — Services Library, Sources, Cohorts, etc.)
 * ═══════════════════════════════════════════════════════════════════════ */
function BackOfficeSection({ currentUser, isCsoStaff }: { currentUser: any; isCsoStaff: boolean }) {
  const [tab, setTab] = useState<BackOfficeTab>("services");

  const TABS: { k: BackOfficeTab; label: string; staffVisible: boolean }[] = [
    { k: "services",  label: "Services Library", staffVisible: true },
    { k: "sources",   label: "Source Tracker",   staffVisible: false },
    { k: "cohorts",   label: "Cohorts",          staffVisible: true },
    { k: "calendar",  label: "Calendar",         staffVisible: true },
    { k: "targets",   label: "Targets",          staffVisible: false },
    { k: "templates", label: "Templates",        staffVisible: true },
    { k: "audit",     label: "Audit Log",        staffVisible: false },
    { k: "settings",  label: "Settings",         staffVisible: true },
  ];

  const visibleTabs = isCsoStaff ? TABS.filter(t => t.staffVisible) : TABS;

  useEffect(() => {
    if (isCsoStaff && !visibleTabs.find(t => t.k === tab)) setTab("services");
  }, [isCsoStaff]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <SectionTitle sub="Everything CSO needs but doesn't act on every day.">
        Back Office
      </SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {visibleTabs.map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            style={{
              padding: "7px 12px", borderRadius: 10, border: "none",
              backgroundColor: tab === t.k ? GREEN : `${DARK}06`,
              color: tab === t.k ? GOLD : DARK,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === "services"  && <ServicesLibrary />}
      {tab === "sources"   && !isCsoStaff && <SourceTracker />}
      {tab === "cohorts"   && <BoCohorts />}
      {tab === "calendar"  && <CalendarSection />}
      {tab === "targets"   && !isCsoStaff && <TargetsSection />}
      {tab === "templates" && <RhythmSection />}
      {tab === "audit"     && !isCsoStaff && <AuditLogView />}
      {tab === "settings"  && <SettingsSection currentUser={currentUser} />}
    </div>
  );
}

/* Services Library (from @shared/services — single source of truth) */
function ServicesLibrary() {
  const byDept = useMemo(() => servicesByDept(), []);
  const DEPT_ORDER: [string, string, React.ElementType][] = [
    ["bizdoc",    "BizDoc Consult", FileCheck],
    ["systemise", "Systemise",      Briefcase],
    ["skills",    "Skills",         BookOpen],
  ];

  return (
    <div>
      <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
        {SERVICE_LIST.length} services across 3 departments. Single source of truth — shared with chat, proposals, and client dashboard.
      </p>
      {DEPT_ORDER.map(([key, label, Icon]) => {
        const list = byDept[key as keyof typeof byDept] || [];
        return (
          <Card key={key} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Icon size={14} style={{ color: GOLD }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label} ({list.length})
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {list.map(s => (
                <div key={s.key} style={{
                  padding: "10px 12px", borderRadius: 10, backgroundColor: `${DARK}02`,
                  border: `1px solid ${DARK}08`,
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{s.name}</p>
                  <p style={{ fontSize: 10, color: GOLD, marginTop: 3, fontWeight: 600 }}>{s.priceNote}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>{s.pitch}</p>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* Source Tracker (Affiliates + Content Creators) */
function SourceTracker() {
  const [sub, setSub] = useState<"affiliates" | "creators">("affiliates");
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          { k: "affiliates" as const, label: "Affiliates" },
          { k: "creators"   as const, label: "Content Creators" },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setSub(t.k)}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "none",
              backgroundColor: sub === t.k ? GOLD : `${DARK}06`,
              color: sub === t.k ? WHITE : DARK,
              fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}
          >{t.label}</button>
        ))}
      </div>
      {sub === "affiliates" ? <ReferralsSection /> : <ContentCreatorsList />}
    </div>
  );
}

function ContentCreatorsList() {
  const query = trpc.contentCreators.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.contentCreators.create.useMutation({
    onSuccess: () => { toast.success("Creator added"); utils.contentCreators.list.invalidate(); setShow(false); },
    onError: (e) => toast.error(e.message),
  });
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", handle: "", code: "", platform: "instagram" as const, commissionRate: 10, notes: "" });
  const rows = (query.data || []) as any[];

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Content Creators ({rows.length})
        </p>
        <button
          onClick={() => setShow(true)}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "none",
            backgroundColor: GREEN, color: GOLD, fontSize: 11, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}
        ><Plus size={12} /> Add</button>
      </div>
      {query.isLoading ? (
        <EmptyState icon={Loader2} title="Loading creators..." />
      ) : rows.length === 0 ? (
        <EmptyState icon={UserCheck} title="No creators yet" hint="Add the first content creator to track attributed leads." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((c: any) => (
            <div key={c.id} style={{
              padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}08`,
              backgroundColor: `${DARK}02`, display: "flex", gap: 12, alignItems: "center",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{c.name}</p>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                  {c.platform} {c.handle ? `· @${c.handle}` : ""} · code {c.code} · {c.commissionRate}%
                </p>
              </div>
              <Pill status={c.status || "active"} />
            </div>
          ))}
        </div>
      )}

      {show && (
        <ModalShell title="Add Content Creator" onClose={() => setShow(false)} width={480}>
          <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Handle" value={form.handle} onChange={(v) => setForm({ ...form, handle: v })} />
          <Field label="Attribution code *" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
          <Field label="Commission rate %" value={String(form.commissionRate)} onChange={(v) => setForm({ ...form, commissionRate: Number(v) || 0 })} />
          <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button
            onClick={() => {
              if (!form.name || !form.code) { toast.error("Name and code required"); return; }
              create.mutate(form);
            }}
            disabled={create.isPending}
            style={{
              marginTop: 10, padding: "10px 14px", borderRadius: 10, border: "none",
              backgroundColor: GREEN, color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer",
              width: "100%",
            }}
          >
            {create.isPending ? "Saving…" : "Create creator"}
          </button>
        </ModalShell>
      )}
    </Card>
  );
}

/* Cohorts read-only for CSO */
function BoCohorts() {
  const query = trpc.cohortsCso.list.useQuery();
  const rows = (query.data || []) as any[];
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <BookOpen size={14} style={{ color: GOLD }} />
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Cohorts ({rows.length})
        </p>
      </div>
      {query.isLoading ? (
        <EmptyState icon={Loader2} title="Loading cohorts..." />
      ) : rows.length === 0 ? (
        <EmptyState icon={BookOpen} title="No cohorts yet" hint="Skills lead creates cohorts. CSO sees them here for client placement." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((c: any) => (
            <div key={c.id} style={{
              padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}08`, backgroundColor: `${DARK}02`,
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{c.name}</p>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                {c.status} · starts {fmtDate(c.startDate)} · {c.enrolled ?? 0}/{c.capacity ?? "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* Audit log view */
function AuditLogView() {
  const query = trpc.auditCso.list.useQuery({ limit: 100 });
  const rows = (query.data || []) as any[];
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Shield size={14} style={{ color: GOLD }} />
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Recent Audit Events
        </p>
      </div>
      {query.isLoading ? (
        <EmptyState icon={Loader2} title="Loading audit log..." />
      ) : rows.length === 0 ? (
        <EmptyState icon={Shield} title="No audit entries yet" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.map((r: any) => (
            <div key={r.id} style={{
              padding: "8px 10px", borderRadius: 8, backgroundColor: `${DARK}03`,
              display: "flex", justifyContent: "space-between", gap: 10,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{r.action}</p>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                  {r.userName} · {r.resource}{r.resourceId ? `#${r.resourceId}` : ""} · {r.details || ""}
                </p>
              </div>
              <span style={{ fontSize: 10, color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(r.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
