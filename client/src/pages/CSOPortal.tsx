import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, FileCheck, UserPlus,
  Calendar, LogOut, ArrowLeft, Loader2, AlertTriangle,
  CheckCircle2, Clock, Target, FileText, Building2,
  Shield, Eye, ExternalLink, TrendingUp, AlertCircle,
  Menu, X, Plus, Settings as SettingsIcon, ChevronLeft, ChevronRight,
  Trash2, Lock, Briefcase, BookOpen, UserCheck,
  DollarSign,
  Inbox, BarChart3, MessageCircle, Phone, Bell, ArrowRightCircle,
} from "lucide-react";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, BarChart, Bar,
} from "recharts";
import { toast } from "sonner";
import { SERVICE_LIST, servicesByDept } from "@shared/services";
import { FORMS as DIAGNOSTIC_FORMS, type DiagnosticFormId } from "@/lib/diagnostic-forms";
import { FORMS as REQUIREMENT_FORMS, type RequirementFormId } from "@/lib/requirement-forms";
import { deriveCsoStats } from "@/lib/cso-stats";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY CSO PORTAL — Client Services Office
 * Private, role-gated (founder, cso). Single gateway to clients.
 * Built against the CSO source-of-truth in /Users/MAC/Documents/HAMZURY/03-CSO.
 * ══════════════════════════════════════════════════════════════════════ */

/* Brand — 2026-04-30 Apple-clean rebrand of CSO portal.
 * Public site uses Milk #FFFBEB + Inter + restraint.
 * Staff CSO now matches that aesthetic: white surfaces, hairline borders,
 * a single navy/gold accent, generous whitespace. GREEN kept as a deep
 * accent for active states + key actions only — never as full-area fills. */
const BG = "#FFFBEB";              // Milk — Brand Bible canonical bg
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#6B7280";           // Slate-500 — softer than 666
const GOLD = "#B48C4C";
const GREEN = "#1B4D3E";           // legacy heritage green (deep accent)
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";
/* Apple-style additions */
const HAIRLINE = "#E7E5E4";        // bone — every divider/border
const SURFACE = "#FFFFFF";          // pure white card surface
const SURFACE_RAISED = "#FAFAF9";   // off-white for hover/raise
const SIDEBAR_BG = "#FFFFFF";       // sidebar = white, not dark green
const NAV_HOVER = "#F5F5F4";        // subtle hover
const ACTIVE_PILL = "#FFF8E7";      // milk-yellow tint for current tab
const INK = "#1A1A1A";              // primary text
const INK_MUTED = "#6B7280";        // secondary text

// 2026-04-30 — Section list aligned to Phase 4 CSO Sales Dashboard
// blueprint (6 tabs: Overview, Lead Pipeline, Closed Deals, Commission
// Tracker, Lead Sources, Calendar) plus founder spec for Inbox-as-
// workspace: every lead from every channel + Command Center push lands
// in CSO inbox, with manual-add for walk-ins/phone/referrals. CSO assigns
// to division here. Active Clients = post-handoff workspace. Forms &
// Templates promoted from back_office to top-level per blueprint.
type Section =
  | "overview"
  | "inbox"
  | "pipeline"
  | "active_clients"
  | "revenue"
  | "calendar"
  | "templates"
  | "settings";

/* Internal qualification panel shown inside pipeline column detail */
type PipelineView = "kanban" | "qualification";

/* Shared dept leads — used by AssignTaskModal + dashboard surfaces */
const DEPT_LEADS: Record<string, { name: string; dept: string }[]> = {
  bizdoc:    [{ name: "Abdullahi Musa", dept: "bizdoc" }],
  systemise: [{ name: "Dajot", dept: "systemise" }, { name: "Lalo", dept: "systemise" }],
  skills:    [{ name: "Abdulmalik Musa", dept: "skills" }],
  medialy:   [],
  podcast:   [],
  video:     [],
  faceless:  [],
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

function SectionTitle({ children, sub, help }: { children: React.ReactNode; sub?: string; help?: string }) {
  // 2026-04-30 — small inline ? popover replaces the deleted Playbook tab.
  // Click ? toggles a one-paragraph explanation under the heading.
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, letterSpacing: -0.2 }}>{children}</h2>
        {help && (
          <button
            type="button"
            aria-label="What does this section do?"
            onClick={() => setOpen(o => !o)}
            style={{
              width: 22, height: 22, borderRadius: 999,
              border: `1px solid ${MUTED}30`, backgroundColor: open ? `${MUTED}12` : "transparent",
              color: MUTED, fontSize: 11, fontWeight: 700, cursor: "pointer", lineHeight: 1,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >?</button>
        )}
      </div>
      {sub && <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{sub}</p>}
      {help && open && (
        <div style={{
          marginTop: 8, padding: "10px 12px", borderRadius: 9,
          backgroundColor: `${MUTED}08`, border: `1px solid ${MUTED}20`,
          fontSize: 12, color: DARK, lineHeight: 1.6,
        }}>
          {help}
          {" "}
          <a
            href="https://github.com/hamzury/hamzury/blob/main/docs/CSO_PLAYBOOK.md"
            target="_blank" rel="noopener noreferrer"
            style={{ color: GOLD, fontWeight: 600, textDecoration: "none" }}
          >Full playbook →</a>
        </div>
      )}
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
  const [active, setActive] = useState<Section>("overview");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [pipelineView, setPipelineView] = useState<PipelineView>("kanban");
  const isCsoStaff = (user as any)?.hamzuryRole === "cso_staff";

  // 2026-05 — listen for the "go to Active Clients" event the Pipeline emits
  // after a Won transition. Lets the post-Won toast click-through work
  // without prop-drilling setActive into PipelineSection.
  useEffect(() => {
    const handler = () => setActive("active_clients");
    window.addEventListener("hamzury:cso-go-active-clients", handler);
    return () => window.removeEventListener("hamzury:cso-go-active-clients", handler);
  }, []);

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

  // 2026-04-25 — NAV reduced to Phase 4 CSO 6-tab spec.
  // Lead Sources + Calendar live as sub-tabs inside Back Office.
  const NAV: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview",       icon: LayoutDashboard, label: "Overview" },
    { key: "inbox",          icon: Inbox,           label: "Inbox" },
    { key: "pipeline",       icon: Target,          label: "Pipeline" },
    { key: "active_clients", icon: Building2,       label: "Active Clients" },
    { key: "revenue",        icon: DollarSign,      label: "Deals & Revenue" },
    { key: "calendar",       icon: Calendar,        label: "Calendar" },
    { key: "templates",      icon: FileText,        label: "Forms & Templates" },
    { key: "settings",       icon: SettingsIcon,    label: "Settings" },
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

      {/* ── Sidebar (Apple-clean rebrand 2026-04-30) ── */}
      <aside style={{
        width: 232, backgroundColor: SIDEBAR_BG, display: "flex", flexDirection: "column",
        borderRight: `1px solid ${HAIRLINE}`,
        ...(isMobile ? {
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          transform: mobileNavOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          boxShadow: mobileNavOpen ? "4px 0 24px rgba(0,0,0,0.08)" : "none",
        } : {}),
      }}>
        <div style={{
          padding: "22px 20px 18px", borderBottom: `1px solid ${HAIRLINE}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: "0.16em", fontWeight: 600, marginBottom: 4 }}>HAMZURY</div>
            <div style={{ fontSize: 17, color: INK, fontWeight: 600, letterSpacing: -0.3 }}>CSO</div>
            <div style={{ fontSize: 10, color: INK_MUTED, marginTop: 4 }}>Client Services Office</div>
          </div>
          {isMobile && (
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close menu"
              style={{
                width: 30, height: 30, borderRadius: 8,
                backgroundColor: NAV_HOVER, color: INK_MUTED, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
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
                  width: "100%", display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 12px", marginBottom: 2, borderRadius: 9,
                  backgroundColor: isActive ? ACTIVE_PILL : "transparent",
                  color: isActive ? GREEN : INK_MUTED,
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontSize: 13, fontWeight: isActive ? 600 : 500,
                  transition: "background-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = NAV_HOVER; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Icon size={15} strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: "12px 12px 16px", borderTop: `1px solid ${HAIRLINE}` }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: 9, color: INK_MUTED, fontSize: 12, textDecoration: "none",
            marginBottom: 2, fontWeight: 500,
          }}>
            <ArrowLeft size={13} strokeWidth={1.75} /> Back to HAMZURY
          </Link>
          <button
            onClick={logout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 9,
              color: INK_MUTED, backgroundColor: "transparent", border: "none",
              fontSize: 12, cursor: "pointer", textAlign: "left", fontWeight: 500,
            }}
          >
            <LogOut size={13} strokeWidth={1.75} /> Sign out
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
            {/* 2026-04-30 — Phase 4 CSO blueprint + Founder Inbox-as-workspace spec. */}
            {active === "overview"       && <HomeSection onGoto={setActive} />}
            {active === "inbox"          && (
              <InboxSection
                onQualify={(id) => { setActive("pipeline"); setSelectedLeadId(id); setPipelineView("qualification"); }}
                onGoto={setActive}
              />
            )}
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
            {active === "revenue"        && <RevenueCommissionsSection />}
            {active === "calendar"       && <CalendarSection />}
            {active === "templates"      && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <ClientFormsHub />
                <RequirementFormsHub />
                <RhythmSection />
              </div>
            )}
            {active === "settings"       && <SettingsSection currentUser={user} />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── CUT 2026-04-25 — Flow System section + types + data tables (not in CSO 6-tab spec) removed (Phase 4 CSO Sales Dashboard 6-tab spec: Overview, Lead Pipeline, Closed Deals, Commission Tracker, Lead Sources, Calendar). ── */

/* ═══════════════════════════════════════════════════════════════════════
 * 1. HOME / COMMAND CENTER
 * ═══════════════════════════════════════════════════════════════════════ */
function HomeSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const leadsQuery = trpc.leads.list.useQuery();
  const clientsQuery = trpc.clientTruth.list.useQuery();
  const tasksQuery = trpc.tasks.list.useQuery();
  const subsQuery = trpc.subscriptions.list.useQuery();
  const targetsQuery = trpc.targets.listForRole.useQuery(
    { role: "cso", period: "current" },
    { retry: false },
  );
  const activeTargets = ((targetsQuery.data || []) as any[]).slice(0, 3);

  const leads = (Array.isArray(leadsQuery.data) ? leadsQuery.data : []) as any[];
  const clients = (clientsQuery.data || []) as any[];
  const allTasks = (tasksQuery.data || []) as any[];
  const allSubs = (subsQuery.data || []) as any[];

  // 2026-05-02 (Phase 3.1) — moved aggregate derivation into the shared helper
  // `lib/cso-stats.ts` so the same numbers can't drift across the portal.
  const stats = useMemo(
    () => deriveCsoStats({ leads, clients, tasks: allTasks, subscriptions: allSubs }),
    [leads, clients, allTasks, allSubs],
  );
  const { newLeads, activeClients, totalContractValue, urgent, renewalsThisWeek } = stats;

  // 2026-05-02 — Phase 1.3 cleanup: removed proposals, commissions, revenueStats,
  // leadTrend, channelMix, unassignedLeads, unverifiedClients, totalPaid, totalBalance.
  // Charts + Commission Grid + Channel Mix are gone — Pipeline / Active Clients /
  // Revenue tabs each hold their own live numbers; Overview stays the single calm header.

  // 2026-04-30 (Phase 1.3) — slimmed to 3 KPIs. Detailed numbers live in Deals & Revenue.
  // 2026-05-02 (Phase 4.2) — Renewals tile only appears when there's something due
  // in the next 7 days, so the Overview stays calm when there's nothing to chase.
  const kpis = [
    { label: "New leads (this week)", value: newLeads,      icon: TrendingUp,   color: BLUE,      section: "inbox" as Section },
    { label: "Active clients",        value: activeClients, icon: CheckCircle2, color: "#22C55E", section: "active_clients" as Section },
    { label: "Revenue (this month)",  value: fmtNaira(totalContractValue), icon: DollarSign, color: GREEN, section: "revenue" as Section },
    ...(renewalsThisWeek > 0 ? [
      { label: "Renewals this week",  value: renewalsThisWeek, icon: Clock,    color: GOLD,      section: "active_clients" as Section },
    ] : []),
  ];

  return (
    <div>
      <SectionTitle sub="Your view as the single client gateway. Live data — no mock numbers.">
        Command Center
      </SectionTitle>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
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

      {/* 2026-05-02 — Phase 1.3 cleanup: removed Lead Curve LineChart + Revenue Curve BarChart
          (visual noise — Pipeline + Active Clients answer the same questions live).
          Removed Commission Grid 3-card row (Finance owns commission view; CSO sees money in
          Revenue tab). Removed Channel Mix card (already covered by source chips on each lead). */}

      {/* Manual controls — do it by hand when needed */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <UserCheck size={14} style={{ color: GREEN }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Manual Controls — Do It By Hand
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {/* 2026-04-25 — Flow System / Assign Task / Log Subscription manual controls
              removed alongside their section cuts (off-spec for Phase 4 CSO 6-tab dashboard). */}
          {[
            { label: "Add Client",           hint: "Walk-in, phone, referral",    section: "active_clients" as Section, icon: UserPlus },
            { label: "Open Pipeline",        hint: "Move lead by hand",           section: "pipeline" as Section,       icon: Target },
            { label: "Inbox",                hint: "Triage new leads",            section: "inbox" as Section,          icon: Eye },
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
            onClick={() => onGoto("revenue")}
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
          <EmptyState icon={Target} title="No targets set for this period" hint="CEO assigns targets from the CEO Dashboard." />
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
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
 * 1.5 INBOX — cross-division lead feed + Command Center push + manual add
 * Founder spec 2026-04-30: every lead from every channel lands here.
 * Forms (Bizdoc/Scalar/Medialy/Hub assessments + diagnostics + contact),
 * BizDev handoffs, CEO Command Center pushes, and manual entries (walk-in,
 * phone, referral, in-person). CSO triages here → assigns to division.
 * ═══════════════════════════════════════════════════════════════════════ */
const DIV_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  bizdoc:    { bg: "#1B4D3E15", text: "#1B4D3E", label: "Bizdoc" },
  systemise: { bg: "#D4A01715", text: "#A07A0E", label: "Scalar" },
  scalar:    { bg: "#D4A01715", text: "#A07A0E", label: "Scalar" },
  medialy:   { bg: "#1D4ED815", text: "#1D4ED8", label: "Medialy" },
  skills:    { bg: "#1E3A5F15", text: "#1E3A5F", label: "Hub" },
  hub:       { bg: "#1E3A5F15", text: "#1E3A5F", label: "Hub" },
  podcast:   { bg: "#7C3AED15", text: "#7C3AED", label: "Podcast" },
  video:     { bg: "#DB277715", text: "#DB2777", label: "Video" },
  faceless:  { bg: "#0891B215", text: "#0891B2", label: "Faceless" },
  cso:       { bg: `${GOLD}15`,  text: GOLD,     label: "Direct" },
  unassigned:{ bg: `${ORANGE}15`,text: ORANGE,   label: "Unassigned" },
};

/** 2026-04-30 — short variant for source chip on lead cards
 *  (replaces the deleted Lead Sources tab). */
function friendlySourceShort(source: string | null | undefined): string {
  if (!source) return "Direct";
  const s = source.toLowerCase();
  if (s.startsWith("assessment_hub")) return "Hub form";
  if (s.startsWith("assessment_")) return "Assessment";
  if (s === "partner_hub" || s === "partner") return "Partner form";
  if (s === "feedback_hub" || s === "feedback") return "Feedback";
  if (s.startsWith("chat")) return "Chat";
  if (s === "cso_manual" || s === "cso") return "CSO entry";
  if (s.startsWith("diagnostic")) return "Diagnostic";
  if (s === "bizdev") return "BizDev";
  if (s === "referral") return "Referral";
  if (s === "walk_in") return "Walk-in";
  if (s === "phone_call") return "Phone";
  if (s === "whatsapp") return "WhatsApp";
  return "Direct";
}

/** Map technical source codes to human-readable labels for the inbox / cards. */
function friendlySource(source: string | null | undefined): string {
  if (!source) return "Direct";
  const s = source.toLowerCase();
  const MAP: Record<string, string> = {
    chat_bizdoc:        "Bizdoc chat",
    chat_scalar:        "Scalar chat",
    chat_medialy:       "Medialy chat",
    chat_hamzury:       "Hamzury chat",
    chat_callback:      "Chat — callback",
    chat_freetext:      "Chat — free text",
    assessment_bizdoc:  "Bizdoc assessment",
    assessment_scalar:  "Scalar assessment",
    assessment_medialy: "Medialy assessment",
    assessment_hub:     "Hub enrolment",
    partner_hub:        "Hub — Partnership inquiry",
    feedback_hub:       "Hub — Feedback / Complaint",
    diagnostic_clarity: "Clarity Session",
    diagnostic_business:"Business diagnostic",
    diagnostic_software:"Software diagnostic",
    diagnostic_media:   "Media diagnostic",
    diagnostic_skills:  "Skills diagnostic",
    diagnostic_bizdoc:  "Bizdoc diagnostic",
    diagnostic_scalar:  "Scalar audit",
    diagnostic_medialy: "Medialy diagnostic",
    diagnostic_hub:     "Hub diagnostic",
    diagnostic_clarity_routed: "Clarity → routed",
    cso:                "Walk-in (CSO)",
    cso_manual:         "Walk-in (CSO)",
    bizdev:             "BizDev hand-off",
    referral:           "Referral",
    walk_in:            "Walk-in",
    phone_call:         "Phone call",
    whatsapp:           "WhatsApp",
    instagram_dm:       "Instagram DM",
    email:              "Email",
    event:              "Event",
    direct:             "Direct",
  };
  return MAP[s] || source;
}

function DivisionBadge({ dept }: { dept: string | null | undefined }) {
  const key = (dept || "unassigned").toLowerCase();
  const b = DIV_BADGE[key] || DIV_BADGE.unassigned;
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      backgroundColor: b.bg, color: b.text, letterSpacing: "0.04em",
    }}>{b.label}</span>
  );
}

function InboxSection({
  onQualify,
  onGoto,
}: {
  onQualify: (id: number) => void;
  onGoto: (s: Section) => void;
}) {
  const [filter, setFilter] = useState<"all" | "unassigned" | "new" | "command_center">("all");
  const [showManualAdd, setShowManualAdd] = useState(false);

  const utils = trpc.useUtils();
  const leadsQuery = trpc.leads.list.useQuery({ excludeConverted: true });
  const notificationsQuery = trpc.notifications.list.useQuery(undefined, { retry: false });
  const leads = (Array.isArray(leadsQuery.data) ? leadsQuery.data : []) as any[];
  const notifications = (Array.isArray(notificationsQuery.data) ? notificationsQuery.data : []) as any[];

  // 2026-04-30 — search across name / business / phone / ref / service
  const [search, setSearch] = useState("");

  // Command Center pushes = notifications targeted at CSO from CEO/system
  const ccPushes = notifications.filter((n: any) =>
    !n.read && (n.type === "assignment" || n.type === "escalation" || n.type === "command_center")
  );

  const filteredLeads = useMemo(() => {
    let list = [...leads];
    if (filter === "unassigned") list = list.filter(l => !l.assignedDepartment);
    if (filter === "new") list = list.filter(l => l.status === "new");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(l =>
        (l.name || "").toLowerCase().includes(q) ||
        (l.businessName || "").toLowerCase().includes(q) ||
        (l.phone || "").toLowerCase().includes(q) ||
        (l.ref || "").toLowerCase().includes(q) ||
        (l.service || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [leads, filter, search]);

  const newCount = leads.filter(l => l.status === "new").length;
  const unassignedCount = leads.filter(l => !l.assignedDepartment).length;

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 12, marginBottom: 16, flexWrap: "wrap",
      }}>
        <SectionTitle
          sub="Every lead from every channel lands here. Triage, assign, or escalate."
          help="Every new lead from every channel arrives here. Assign or qualify them. Snoozed leads come back automatically."
        >
          Inbox
        </SectionTitle>
        <button
          onClick={() => setShowManualAdd(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 16px", borderRadius: 10, border: "none",
            backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <Plus size={14} /> Manual Add
        </button>
      </div>

      {/* ─── Search ─── */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search by name, business, phone, ref, or service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            border: `1px solid ${HAIRLINE}`, fontSize: 13, color: INK,
            backgroundColor: WHITE, fontFamily: "inherit",
          }}
        />
      </div>

      {/* ─── Counters / filter pills ─── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { k: "all" as const,             label: "All",            count: leads.length,  color: DARK },
          { k: "new" as const,             label: "New",            count: newCount,      color: BLUE },
          { k: "unassigned" as const,      label: "Unassigned",     count: unassignedCount, color: ORANGE },
          { k: "command_center" as const,  label: "Command Center", count: ccPushes.length, color: GREEN },
        ].map(b => (
          <button
            key={b.k}
            onClick={() => setFilter(b.k)}
            style={{
              padding: "8px 14px", borderRadius: 10, border: "none",
              backgroundColor: filter === b.k ? GREEN : `${DARK}06`,
              color: filter === b.k ? GOLD : DARK,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            {b.label}
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 999,
              backgroundColor: filter === b.k ? `${GOLD}25` : b.color + "15",
              color: filter === b.k ? GOLD : b.color,
            }}>{b.count}</span>
          </button>
        ))}
      </div>

      {/* ─── Command Center push panel (CEO → CSO) ─── */}
      {filter === "command_center" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Bell size={14} style={{ color: GREEN }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              From Command Center ({ccPushes.length})
            </p>
          </div>
          {ccPushes.length === 0 ? (
            <EmptyState icon={Bell} title="Nothing pushed from Command Center" hint="When the CEO pushes a follow-up or escalation to you, it lands here." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ccPushes.map((n: any) => (
                <div key={n.id} style={{
                  padding: "12px 14px", borderRadius: 10,
                  border: `1px solid ${GREEN}20`, backgroundColor: `${GREEN}05`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{n.title}</p>
                    <span style={{ fontSize: 10, color: MUTED }}>{fmtDate(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ─── Lead feed ─── */}
      {filter !== "command_center" && (
        <Card>
          {leadsQuery.isLoading ? (
            <EmptyState icon={Loader2} title="Loading inbox..." />
          ) : filteredLeads.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title={filter === "unassigned" ? "Nothing unassigned" : filter === "new" ? "No new leads" : "Inbox empty"}
              hint="When a lead submits any form, comes in via WhatsApp, or you add one manually, it shows here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredLeads.map((l: any) => (
                <div key={l.id} style={{
                  padding: "12px 14px", borderRadius: 10,
                  border: `1px solid ${DARK}08`, backgroundColor: WHITE,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 12, flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{l.name || "—"}</p>
                      <DivisionBadge dept={l.assignedDepartment} />
                      <Pill status={l.status || "new"} />
                      {/* 2026-04-30 — source chip (replaces deleted Lead Sources tab) */}
                      <span title={`Source: ${friendlySource(l.source)}`} style={{
                        padding: "2px 7px", borderRadius: 999, fontSize: 9, fontWeight: 600,
                        backgroundColor: `${MUTED}10`, color: MUTED, letterSpacing: "0.04em",
                      }}>from: {friendlySourceShort(l.source)}</span>
                      {/* 2026-05-02 (Phase 2.3) — Returning-client pill on inbox too. */}
                      {l.linkedClientId && (
                        <span
                          title="This phone matches an existing client — upsell or new service"
                          style={{
                            padding: "2px 7px", borderRadius: 999, fontSize: 9, fontWeight: 700,
                            backgroundColor: `${GREEN}15`, color: GREEN, letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >↩ Returning</span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                      {l.businessName ? `${l.businessName} · ` : ""}
                      {l.service || "—"}
                      {l.phone ? ` · ${l.phone}` : ""}
                    </p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      Ref {l.ref} · {fmtDate(l.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => onQualify(l.id)}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      backgroundColor: GOLD, color: WHITE, fontSize: 11, fontWeight: 700,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    Qualify <ArrowRightCircle size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {showManualAdd && (
        <ManualLeadModal
          onClose={() => setShowManualAdd(false)}
          onCreated={() => { setShowManualAdd(false); utils.leads.list.invalidate(); }}
        />
      )}
    </div>
  );
}

/* ─── Manual lead entry — for walk-ins, phone calls, referrals, etc. ───
   Per CSO Flow Diagram, Stage 3 splits into Path A (Direct) vs Path B
   (Diagnosis form). When CSO picks Path A here, we ask the qualifying
   questions inline (from First_Contact_Script.txt) so the delivery team
   has full context on handoff — no second discovery call needed. */
function ManualLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<"path" | "intake" | "questions">("path");
  const [path, setPath] = useState<"A" | "B">("A");

  // Intake fields
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [department, setDepartment] = useState<string>("bizdoc");
  const [source, setSource] = useState<string>("walk_in");

  // Path A qualification (CSO Flow Diagram + First_Contact_Script.txt + CLIENT_INTAKE_FORM.txt)
  const [challenge, setChallenge] = useState("");           // Q1
  const [usedBefore, setUsedBefore] = useState<"yes" | "no" | "">("");  // Q2
  const [previousExperience, setPreviousExperience] = useState("");
  const [timeline, setTimeline] = useState<string>("");     // Q3
  const [budget, setBudget] = useState<string>("");         // Q4
  const [decisionMaker, setDecisionMaker] = useState<"yes" | "no" | "">("");  // BANT — Authority
  const [extraNotes, setExtraNotes] = useState("");

  const create = trpc.leads.createManual.useMutation({
    onSuccess: () => { toast.success("Lead added to inbox"); onCreated(); },
    onError: (e) => toast.error(e.message),
  });

  const buildContextPayload = () => {
    if (path === "B") {
      return extraNotes.trim() || undefined;
    }
    // Path A — pack the answers as structured notes the division can read
    const lines: string[] = [
      "[ROUTE A — DIRECT CLOSE — CSO QUALIFIED]",
      "",
      `Q1. Challenge / problem to solve:`,
      `→ ${challenge || "—"}`,
      "",
      `Q2. Used similar services before? ${usedBefore || "—"}`,
      ...(usedBefore === "yes" ? [`→ ${previousExperience || "—"}`] : []),
      "",
      `Q3. Timeline: ${timeline || "—"}`,
      `Q4. Budget range: ${budget || "—"}`,
      `Q5. Decision maker / authority: ${decisionMaker || "—"}`,
      `Source: ${source}`,
    ];
    if (extraNotes.trim()) {
      lines.push("", "Additional notes:", extraNotes.trim());
    }
    return lines.join("\n");
  };

  const submit = () => {
    if (!name.trim() || !service.trim()) {
      toast.error("Name and service are required");
      return;
    }
    create.mutate({
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      service: service.trim(),
      department,
      notes: buildContextPayload(),
    });
  };

  /* ─── Step 1: Path picker ─── */
  if (step === "path") {
    return (
      <ModalShell title="Add Lead Manually" onClose={onClose} width={540}>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>
          From the CSO Flow Diagram. Pick the path that matches the lead's needs.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => { setPath("A"); setStep("intake"); }}
            style={{
              textAlign: "left", padding: "16px 18px", borderRadius: 12,
              border: `1px solid ${DARK}10`, backgroundColor: WHITE, cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Route A — Direct close</p>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
              Clear, simple need. They know what they want. CSO asks the qualifying
              questions now so the division can start delivery without a second call.
            </p>
          </button>
          <button
            type="button"
            onClick={() => { setPath("B"); setStep("intake"); }}
            style={{
              textAlign: "left", padding: "16px 18px", borderRadius: 12,
              border: `1px solid ${DARK}10`, backgroundColor: WHITE, cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 4,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Route B — Send diagnosis form</p>
            <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
              Complex need. CSO captures contact only and shares the right
              assessment / diagnostic link so the lead self-qualifies in detail.
            </p>
          </button>
        </div>
      </ModalShell>
    );
  }

  /* ─── Step 2: Intake (always shown) ─── */
  if (step === "intake") {
    return (
      <ModalShell title={`Route ${path} · Contact info`} onClose={onClose} width={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            type="button"
            onClick={() => setStep("path")}
            style={{
              alignSelf: "flex-start", padding: "4px 0", border: "none",
              background: "transparent", color: GREEN, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}
          >‹ Change route</button>
          <Field label="Name *" value={name} onChange={setName} />
          <Field label="Business name" value={businessName} onChange={setBusinessName} />
          <Field label="Phone" value={phone} onChange={setPhone} />
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Service of interest *" value={service} onChange={setService} />
          <div>
            <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Division
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              style={{
                width: "100%", marginTop: 4, padding: "10px 12px",
                borderRadius: 8, border: `1px solid ${DARK}15`,
                fontSize: 13, color: DARK, backgroundColor: WHITE,
              }}
            >
              <option value="bizdoc">Bizdoc — Tax & Compliance</option>
              <option value="systemise">Scalar — Web & Automation</option>
              <option value="medialy">Medialy — Social Media</option>
              <option value="skills">Hub — Tech Training</option>
              <option value="podcast">Podcast Unit</option>
              <option value="video">Video Unit</option>
              <option value="faceless">Faceless Content</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              How did they reach you?
            </label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              style={{
                width: "100%", marginTop: 4, padding: "10px 12px",
                borderRadius: 8, border: `1px solid ${DARK}15`,
                fontSize: 13, color: DARK, backgroundColor: WHITE,
              }}
            >
              <option value="walk_in">Walk-in</option>
              <option value="phone_call">Phone call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="referral">Referral</option>
              <option value="event">Event / in-person</option>
              <option value="instagram_dm">Instagram DM</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: "10px 16px", borderRadius: 8, border: `1px solid ${DARK}15`,
              backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button
              type="button"
              onClick={() => path === "A" ? setStep("questions") : submit()}
              disabled={create.isPending}
              style={{
                padding: "10px 18px", borderRadius: 8, border: "none",
                backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 700,
                cursor: create.isPending ? "wait" : "pointer", opacity: create.isPending ? 0.7 : 1,
              }}
            >{path === "A" ? "Continue → Qualifying questions" : create.isPending ? "Adding..." : "Add to Inbox"}</button>
          </div>
        </div>
      </ModalShell>
    );
  }

  /* ─── Step 3: Path A qualification questions ─── */
  return (
    <ModalShell title="Route A · Qualification questions" onClose={onClose} width={560}>
      <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.6, marginBottom: 14 }}>
        Ask each question. The answers are saved to the lead record so the
        delivery team has everything they need on handoff.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: DARK, fontWeight: 700 }}>1. What specific challenge are you trying to solve?</label>
          <textarea
            value={challenge}
            onChange={e => setChallenge(e.target.value)}
            rows={2}
            style={{
              width: "100%", marginTop: 6, padding: "10px 12px",
              borderRadius: 8, border: `1px solid ${DARK}15`, resize: "vertical",
              fontSize: 13, color: DARK, backgroundColor: WHITE, fontFamily: "inherit",
            }}
            placeholder="What outcome are they after?"
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: DARK, fontWeight: 700 }}>2. Have they used similar services before?</label>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {(["yes", "no"] as const).map(v => (
              <button key={v} type="button" onClick={() => setUsedBefore(v)} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: `1px solid ${usedBefore === v ? GREEN : DARK + "15"}`,
                backgroundColor: usedBefore === v ? GREEN : WHITE,
                color: usedBefore === v ? GOLD : DARK,
                cursor: "pointer", textTransform: "capitalize",
              }}>{v}</button>
            ))}
          </div>
          {usedBefore === "yes" && (
            <textarea
              value={previousExperience}
              onChange={e => setPreviousExperience(e.target.value)}
              rows={2}
              placeholder="What was the experience? Any pain points?"
              style={{
                width: "100%", marginTop: 8, padding: "10px 12px",
                borderRadius: 8, border: `1px solid ${DARK}15`, resize: "vertical",
                fontSize: 13, color: DARK, backgroundColor: WHITE, fontFamily: "inherit",
              }}
            />
          )}
        </div>

        <div>
          <label style={{ fontSize: 12, color: DARK, fontWeight: 700 }}>3. Ideal timeline to start?</label>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {["Immediately", "Within 1 month", "1–3 months", "3+ months"].map(v => (
              <button key={v} type="button" onClick={() => setTimeline(v)} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: `1px solid ${timeline === v ? GREEN : DARK + "15"}`,
                backgroundColor: timeline === v ? GREEN : WHITE,
                color: timeline === v ? GOLD : DARK, cursor: "pointer",
              }}>{v}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: DARK, fontWeight: 700 }}>4. Budget range?</label>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            {["Under ₦100k", "₦100k–500k", "₦500k–1M", "Over ₦1M", "Not sure yet"].map(v => (
              <button key={v} type="button" onClick={() => setBudget(v)} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: `1px solid ${budget === v ? GREEN : DARK + "15"}`,
                backgroundColor: budget === v ? GREEN : WHITE,
                color: budget === v ? GOLD : DARK, cursor: "pointer",
              }}>{v}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: DARK, fontWeight: 700 }}>5. Are they the decision-maker?</label>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {(["yes", "no"] as const).map(v => (
              <button key={v} type="button" onClick={() => setDecisionMaker(v)} style={{
                padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: `1px solid ${decisionMaker === v ? GREEN : DARK + "15"}`,
                backgroundColor: decisionMaker === v ? GREEN : WHITE,
                color: decisionMaker === v ? GOLD : DARK, cursor: "pointer", textTransform: "capitalize",
              }}>{v}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Anything else for the delivery team
          </label>
          <textarea
            value={extraNotes}
            onChange={e => setExtraNotes(e.target.value)}
            rows={2}
            placeholder="Special requirements, urgency, references they mentioned, etc."
            style={{
              width: "100%", marginTop: 4, padding: "10px 12px",
              borderRadius: 8, border: `1px solid ${DARK}15`, resize: "vertical",
              fontSize: 13, color: DARK, backgroundColor: WHITE, fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 4 }}>
          <button type="button" onClick={() => setStep("intake")} style={{
            padding: "10px 16px", borderRadius: 8, border: `1px solid ${DARK}15`,
            backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>‹ Back</button>
          <button
            type="button"
            onClick={submit}
            disabled={create.isPending}
            style={{
              padding: "10px 22px", borderRadius: 8, border: "none",
              backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 700,
              cursor: create.isPending ? "wait" : "pointer", opacity: create.isPending ? 0.7 : 1,
            }}
          >{create.isPending ? "Adding..." : "Add qualified lead"}</button>
        </div>
      </div>
    </ModalShell>
  );
}

// 2026-04-30 — removed: LeadsSection (replaced by inbox/pipeline pattern)
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 14 }}>
        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Lead Record</p>
          <InfoRow label="Reference" value={<span style={{ fontFamily: "monospace", color: GOLD }}>{lead.ref}</span>} />
          <InfoRow label="Contact" value={`${lead.name}${lead.phone ? ` · ${lead.phone}` : ""}${lead.email ? ` · ${lead.email}` : ""}`} />
          <InfoRow label="Stated Request" value={lead.service} />
          <LeadAnswersView lead={lead} />
          <InfoRow label="Source" value={lead.source || "direct"} />
          {lead.referrerName && <InfoRow label="Referred By" value={`${lead.referrerName} (${lead.referralSourceType || "affiliate"})`} />}
          <InfoRow label="Age" value={`${ageDays} day${ageDays === 1 ? "" : "s"} old`} />
        </Card>

        <QualificationCaptureCard lead={lead} onSaved={() => leadsQuery.refetch()} />
      </div>
    </div>
  );
}

/* ─── Qualification capture form ─────────────────────────────────────────
 * Replaces the old "Phase 1 note" placeholder with a real BANT capture
 * form. CSO inputs go straight into leads.update + leads.updateScore via
 * trpc, with verbose console logging so any failure is visible.
 */
function QualificationCaptureCard({ lead, onSaved }: { lead: any; onSaved: () => void }) {
  const utils = trpc.useUtils();
  const [score, setScore] = useState<number>(lead.leadScore ?? 5);
  const [decisionMaker, setDecisionMaker] = useState<"yes" | "no" | "unknown">("unknown");
  const [engagement, setEngagement] = useState<"project" | "subscription" | "project_then_sub" | "unsure">("project");
  const [department, setDepartment] = useState<string>(lead.assignedDepartment || "");
  const [decision, setDecision] = useState<"qualify" | "disqualify" | "pause" | "">("");
  const [notes, setNotes] = useState("");

  const updateLead = trpc.leads.update.useMutation({
    onMutate: (vars) => { console.log("[CSO] qualify.update →", vars); },
    onError: (e, vars) => { console.error("[CSO] qualify.update FAILED", vars, e); },
  });
  const updateScore = trpc.leads.updateScore.useMutation({
    onMutate: (vars) => { console.log("[CSO] qualify.score →", vars); },
    onError: (e, vars) => { console.error("[CSO] qualify.score FAILED", vars, e); },
  });
  const updateStage = trpc.leads.updateStage.useMutation({
    onMutate: (vars) => { console.log("[CSO] qualify.stage →", vars); },
    onError: (e, vars) => { console.error("[CSO] qualify.stage FAILED", vars, e); },
  });

  const isPending = updateLead.isPending || updateScore.isPending || updateStage.isPending;

  const decisionToStage: Record<string, "qualified" | "lost" | "paused"> = {
    qualify: "qualified", disqualify: "lost", pause: "paused",
  };

  const submit = async () => {
    if (!decision) {
      // P1 fix — surface why Save is disabled and scroll to the Decision row.
      toast.error("Pick Qualify, Pause, or Disqualify first — then Save.");
      const el = document.getElementById("qualify-decision-row");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      // Pack discovery notes + structured answers into the context field so
      // division ops sees them on handoff.
      const composedNotes = [
        `[CSO QUALIFICATION — ${new Date().toISOString().slice(0, 10)}]`,
        `Decision: ${decision.toUpperCase()}`,
        `Decision-maker: ${decisionMaker}`,
        `Engagement: ${engagement}`,
        `Department: ${department || "—"}`,
        `Score: ${score}/10`,
        notes ? `\nDiscovery notes:\n${notes}` : "",
        lead.context ? `\n──── Prior context ────\n${lead.context}` : "",
      ].filter(Boolean).join("\n");

      await updateLead.mutateAsync({
        id: lead.id,
        context: composedNotes,
        ...(department ? { assignedDepartment: department } : {}),
      });
      await updateScore.mutateAsync({ leadId: lead.id, score });
      await updateStage.mutateAsync({ leadId: lead.id, stage: decisionToStage[decision] });

      toast.success(`Qualification saved · ${decision} · score ${score}/10`, { duration: 2800 });
      utils.leads.list.invalidate();
      onSaved();
    } catch (err: any) {
      console.error("[CSO] qualify FAILED", err);
      toast.error(err?.message || "Couldn't save. Check Console for details.");
    }
  };

  const PILL_GROUP = (label: string, options: { v: string; label: string }[], value: string, onChange: (v: any) => void) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(o => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            style={{
              padding: "7px 12px", borderRadius: 8,
              border: `1px solid ${value === o.v ? GREEN : HAIRLINE}`,
              backgroundColor: value === o.v ? GREEN : WHITE,
              color: value === o.v ? GOLD : INK,
              fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}
          >{o.label}</button>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
        Qualification capture
      </p>

      {/* Score slider */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
          Lead score (BANT-weighted, 0–10)
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="range"
            min={0}
            max={10}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            style={{ flex: 1, accentColor: GREEN }}
          />
          <div style={{ minWidth: 56, textAlign: "right" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: GREEN }}>{score}</span>
            <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}> / 10</span>
          </div>
        </div>
        <p style={{ fontSize: 10, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>
          0–3 cold · 4–6 warm · 7–10 hot. Hot = ready to close this week.
        </p>
      </div>

      {PILL_GROUP("Decision-maker?", [
        { v: "yes", label: "Yes" },
        { v: "no", label: "No" },
        { v: "unknown", label: "Unknown" },
      ], decisionMaker, setDecisionMaker)}

      {PILL_GROUP("Engagement type", [
        { v: "project", label: "Project" },
        { v: "subscription", label: "Subscription" },
        { v: "project_then_sub", label: "Project → Sub" },
        { v: "unsure", label: "Unsure" },
      ], engagement, setEngagement)}

      {PILL_GROUP("Department", [
        { v: "bizdoc", label: "Bizdoc" },
        { v: "systemise", label: "Scalar" },
        { v: "medialy", label: "Medialy" },
        { v: "skills", label: "Hub" },
        { v: "podcast", label: "Podcast" },
        { v: "video", label: "Video" },
        { v: "faceless", label: "Faceless" },
        { v: "", label: "Multi / unclear" },
      ], department, setDepartment)}

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
          Discovery notes (saved on the lead's context for handoff)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Situation · Objectives · Constraints · Urgency · Anything division ops needs to know"
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${HAIRLINE}`, resize: "vertical",
            fontSize: 12, color: INK, backgroundColor: WHITE, fontFamily: "inherit",
          }}
        />
      </div>

      {/* Decision pills */}
      <div id="qualify-decision-row" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>
          Decision
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={() => setDecision("qualify")}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${decision === "qualify" ? GREEN : HAIRLINE}`,
              backgroundColor: decision === "qualify" ? GREEN : WHITE,
              color: decision === "qualify" ? GOLD : GREEN,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >✓ Qualify</button>
          <button
            type="button"
            onClick={() => setDecision("pause")}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${decision === "pause" ? GOLD : HAIRLINE}`,
              backgroundColor: decision === "pause" ? GOLD : WHITE,
              color: decision === "pause" ? WHITE : GOLD,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >⏸ Pause / Nurture</button>
          <button
            type="button"
            onClick={() => setDecision("disqualify")}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 8,
              border: `1px solid ${decision === "disqualify" ? RED : HAIRLINE}`,
              backgroundColor: decision === "disqualify" ? RED : WHITE,
              color: decision === "disqualify" ? WHITE : RED,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >✕ Disqualify</button>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!decision || isPending}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 10, border: "none",
          backgroundColor: decision && !isPending ? GREEN : `${INK_MUTED}30`,
          color: decision && !isPending ? GOLD : INK_MUTED,
          fontSize: 13, fontWeight: 700,
          cursor: decision && !isPending ? "pointer" : "not-allowed",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Saving qualification…" :
         decision === "qualify"    ? "Save & move to Qualified" :
         decision === "pause"      ? "Save & move to Nurture" :
         decision === "disqualify" ? "Save & mark Lost" :
         "Pick a decision to enable Save"}
      </button>
    </Card>
  );
}

// 2026-04-30 — QualStep removed: the read-only walkthrough was replaced
// by QualificationCaptureCard (live BANT form). Removed to kill confusion.

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: `1px solid ${DARK}05` }}>
      <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 100 }}>{label}</span>
      <span style={{ fontSize: 12, color: DARK, flex: 1, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────
 * LeadAnswersView — pretty Q&A renderer for the CSO Portal lead detail.
 * Replaces the legacy `<InfoRow label="Context" value={lead.context} />`
 * which dumped raw JSON. Handles:
 *   1. Empty/null context  → dash
 *   2. Non-JSON text       → plain styled card "Context (raw)"
 *   3. Diagnostic submission JSON  ({ formId, answers, submittedAt })
 *   4. Requirement submission JSON ({ serviceId, answers, uploadKeys, submittedAt })
 *   5. Merged JSON containing BOTH formId and serviceId
 *   6. Unknown JSON shape  → pretty-printed <pre>
 * ─────────────────────────────────────────────────────────────────────── */
function LeadAnswersView({ lead }: { lead: any }) {
  const raw: string | null | undefined = lead?.context;

  if (!raw || (typeof raw === "string" && raw.trim() === "")) {
    return <InfoRow label="Context" value="—" />;
  }

  // Try JSON.parse — fall back to plain-text card on failure.
  let parsed: any = null;
  let isJson = false;
  try {
    parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") isJson = true;
  } catch {
    isJson = false;
  }

  if (!isJson) {
    return (
      <div style={{ paddingTop: 8 }}>
        <p style={{
          fontSize: 10, color: MUTED, textTransform: "uppercase",
          letterSpacing: "0.04em", marginBottom: 6,
        }}>
          Context (raw)
        </p>
        <div style={{
          fontSize: 12, color: DARK, lineHeight: 1.6,
          backgroundColor: `${DARK}04`, border: `1px solid ${DARK}08`,
          borderRadius: 8, padding: "10px 12px", whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {raw}
        </div>
      </div>
    );
  }

  const formId = parsed.formId as string | undefined;
  const serviceId = parsed.serviceId as string | undefined;
  const uploadKeys = parsed.uploadKeys as Record<string, string[]> | undefined;
  const submittedAt = parsed.submittedAt as string | undefined;

  const diagnosticForm =
    formId && (DIAGNOSTIC_FORMS as any)[formId as DiagnosticFormId]
      ? (DIAGNOSTIC_FORMS as any)[formId as DiagnosticFormId]
      : null;
  const requirementForm =
    serviceId && (REQUIREMENT_FORMS as any)[serviceId as RequirementFormId]
      ? (REQUIREMENT_FORMS as any)[serviceId as RequirementFormId]
      : null;

  const hasUploads =
    uploadKeys &&
    typeof uploadKeys === "object" &&
    Object.keys(uploadKeys).length > 0;

  const recognised = Boolean(diagnosticForm || requirementForm || hasUploads);

  if (!recognised) {
    // Valid JSON but neither formId nor serviceId — pretty-print fallback.
    return (
      <div style={{ paddingTop: 8 }}>
        <p style={{
          fontSize: 10, color: MUTED, textTransform: "uppercase",
          letterSpacing: "0.04em", marginBottom: 6,
        }}>
          Context (JSON)
        </p>
        <pre style={{
          fontSize: 11, color: DARK, lineHeight: 1.5,
          backgroundColor: `${DARK}04`, border: `1px solid ${DARK}08`,
          borderRadius: 8, padding: "10px 12px", margin: 0,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          whiteSpace: "pre-wrap", wordBreak: "break-word", overflowX: "auto",
        }}>
{JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", gap: 14 }}>
      {diagnosticForm && (
        <DiagnosticAnswersBlock
          form={diagnosticForm}
          answers={parsed.answers}
          submittedAt={submittedAt}
        />
      )}
      {requirementForm && (
        <RequirementAnswersBlock
          form={requirementForm}
          answers={parsed.answers}
          // If both diagnostic + requirement, prefer not duplicating the timestamp.
          submittedAt={diagnosticForm ? undefined : submittedAt}
        />
      )}
      {hasUploads && <UploadedFilesBlock uploadKeys={uploadKeys!} />}
    </div>
  );
}

function LeadAnswersSectionHeader({
  icon, title, submittedAt, subtitle,
}: { icon: string; title: string; submittedAt?: string; subtitle?: string }) {
  let when: string | null = null;
  if (submittedAt) {
    const d = new Date(submittedAt);
    if (!isNaN(d.getTime())) when = d.toLocaleString();
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: -0.1 }}>
          <span style={{ marginRight: 6 }}>{icon}</span>{title}
        </p>
        {when && (
          <span style={{ fontSize: 10, color: MUTED }}>· submitted {when}</span>
        )}
      </div>
      {subtitle && (
        <p style={{ fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function QAItem({
  questionHtml, children,
}: { questionHtml: string; children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 8, borderBottom: `1px solid ${DARK}05` }}>
      <p
        style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginBottom: 4 }}
        dangerouslySetInnerHTML={{ __html: questionHtml }}
      />
      <div style={{ fontSize: 12, color: DARK, lineHeight: 1.6, wordBreak: "break-word" }}>
        {children}
      </div>
    </div>
  );
}

function AnswerScalar({ value }: { value: any }) {
  if (value === undefined || value === null || value === "") {
    return <span style={{ color: MUTED, fontStyle: "italic" }}>—</span>;
  }
  return <span>{String(value)}</span>;
}

function AnswerList({ values }: { values: any[] }) {
  if (values.length === 0) {
    return <span style={{ color: MUTED, fontStyle: "italic" }}>—</span>;
  }
  return (
    <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>
      {values.map((v, i) => (
        <li key={i} style={{ fontSize: 12, color: DARK, lineHeight: 1.6 }}>
          {String(v)}
        </li>
      ))}
    </ul>
  );
}

function DiagnosticAnswersBlock({
  form, answers, submittedAt,
}: { form: any; answers: Record<string, any> | undefined; submittedAt?: string }) {
  const questions: any[] = Array.isArray(form?.questions) ? form.questions : [];
  const a: Record<string, any> = answers && typeof answers === "object" ? answers : {};

  const rows = questions.map((q, i) => {
    const value = a[String(i)];
    const isEmpty =
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    return { q, i, value, isEmpty };
  }).filter((r) => !r.isEmpty);

  return (
    <div>
      <LeadAnswersSectionHeader
        icon="📋"
        title={`Diagnostic — ${form?.title || "Form"}`}
        submittedAt={submittedAt}
        subtitle={form?.subtitle}
      />
      {rows.length === 0 ? (
        <p style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>No answers recorded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(({ q, i, value }) => {
            const questionHtml = q?.question || `Question ${i + 1}`;
            let body: React.ReactNode;
            if (Array.isArray(value)) {
              // Multi-select → bullet list. Map numeric option indexes to text if possible.
              const labels = value.map((v) => {
                if (typeof v === "number" && Array.isArray(q?.options) && q.options[v] !== undefined) {
                  return q.options[v];
                }
                return v;
              });
              body = <AnswerList values={labels} />;
            } else if (q?.type === "scale") {
              const max = typeof q.max === "number" ? q.max : 5;
              body = <span><strong>{String(value)}</strong> / {max}</span>;
            } else if (q?.type === "single" && typeof value === "number" && Array.isArray(q.options) && q.options[value] !== undefined) {
              body = <AnswerScalar value={q.options[value]} />;
            } else if (q?.type === "contact" && value && typeof value === "object") {
              body = (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {Object.entries(value).map(([k, v]) => (
                    <div key={k} style={{ fontSize: 12, color: DARK }}>
                      <span style={{ color: MUTED, fontSize: 11 }}>{k}: </span>{String(v)}
                    </div>
                  ))}
                </div>
              );
            } else {
              body = <AnswerScalar value={value} />;
            }
            return <QAItem key={i} questionHtml={questionHtml}>{body}</QAItem>;
          })}
        </div>
      )}
    </div>
  );
}

function RequirementAnswersBlock({
  form, answers, submittedAt,
}: { form: any; answers: Record<string, any> | undefined; submittedAt?: string }) {
  const steps: any[] = Array.isArray(form?.steps) ? form.steps : [];
  const a: Record<string, any> = answers && typeof answers === "object" ? answers : {};

  // Flatten step.fields, gather answered ones.
  const rows: { field: any; value: any; stepTitle: string }[] = [];
  for (const step of steps) {
    const fields: any[] = Array.isArray(step?.fields) ? step.fields : [];
    for (const f of fields) {
      if (!f || !f.id || f.type === "file") continue; // file uploads handled separately
      const v = a[f.id];
      const empty = v === undefined || v === null || v === "" ||
        (Array.isArray(v) && v.length === 0);
      if (empty) continue;
      rows.push({ field: f, value: v, stepTitle: step?.title || "" });
    }
  }

  return (
    <div>
      <LeadAnswersSectionHeader
        icon="✅"
        title={`Requirements — ${form?.name || "Service"}`}
        submittedAt={submittedAt}
        subtitle={form?.intro?.body}
      />
      {rows.length === 0 ? (
        <p style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>No answers recorded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(({ field, value }, i) => {
            const label = field?.label || field?.id || `Field ${i + 1}`;
            const body = Array.isArray(value)
              ? <AnswerList values={value} />
              : <AnswerScalar value={value} />;
            return <QAItem key={`${field.id}-${i}`} questionHtml={escapeHtml(label)}>{body}</QAItem>;
          })}
        </div>
      )}
    </div>
  );
}

function UploadedFilesBlock({ uploadKeys }: { uploadKeys: Record<string, string[]> }) {
  const entries = Object.entries(uploadKeys).filter(
    ([, arr]) => Array.isArray(arr) && arr.length > 0,
  );
  if (entries.length === 0) return null;

  return (
    <div>
      <LeadAnswersSectionHeader icon="📎" title="Files uploaded" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(([fieldId, keys]) => (
          <div key={fieldId}>
            <p style={{
              fontSize: 11, color: MUTED, marginBottom: 4,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}>
              {fieldId}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {keys.map((key, i) => {
                const filename = filenameFromKey(key);
                return (
                  <span
                    key={`${key}-${i}`}
                    title={key}
                    style={{
                      fontSize: 11, color: DARK,
                      backgroundColor: `${GOLD}10`,
                      border: `1px solid ${GOLD}30`,
                      borderRadius: 999, padding: "3px 10px",
                      lineHeight: 1.4, wordBreak: "break-all",
                    }}
                  >
                    {filename}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function filenameFromKey(key: string): string {
  // Storage key shape: requirements/<ref>/<service>/<fieldId>/<nanoid>-<filename>
  // Take the last path segment, then everything after the LAST hyphen.
  const lastSlash = key.lastIndexOf("/");
  const tail = lastSlash >= 0 ? key.slice(lastSlash + 1) : key;
  const lastDash = tail.lastIndexOf("-");
  if (lastDash < 0) return tail || key;
  const name = tail.slice(lastDash + 1);
  return name || tail;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 2026-04-30 — removed: ProposalsSection (replaced by inbox/pipeline pattern)
// 2026-04-30 — removed: OnboardingSection (replaced by inbox/pipeline pattern)
/* ═══════════════════════════════════════════════════════════════════════
 * 6. ACTIVE CLIENTS
 * ═══════════════════════════════════════════════════════════════════════ */
function ClientsSection() {
  // 2026-05 — default to "converted" so newly-Won clients land in the
  // first thing the CSO sees. Reduces "where did my Won lead go?" friction.
  const [statusFilter, setStatusFilter] = useState<string>("converted");
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailClient, setDetailClient] = useState<any | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ clientId?: number; leadId?: number } | null>(null);
  const [notifyCeoOpen, setNotifyCeoOpen] = useState<{ clientId?: number; subject?: string } | null>(null);
  const [outreachClient, setOutreachClient] = useState<any | null>(null);
  const [upsellTarget, setUpsellTarget] = useState<any | null>(null);
  // 2026-05-02 (Phase 2.5) — multi-service add-on
  const [addServiceTarget, setAddServiceTarget] = useState<any | null>(null);
  // 2026-05-02 (Phase 4.3) — Active Clients search box
  const [searchQuery, setSearchQuery] = useState("");
  // 2026-05-02 (Phase 5.1) — flat by-service view toggle
  const [viewMode, setViewMode] = useState<"by_client" | "by_service">("by_client");
  // Feature 2 — single round-trip: clients + aggregated payment summary.
  const clientsQuery = trpc.clientTruth.listWithPaymentSummary.useQuery();
  const clients = (clientsQuery.data || []) as any[];
  // Feature 4 — Upsell Queue
  const upsellQuery = trpc.clientTruth.listUpsellQueue.useQuery();
  const upsellList = (upsellQuery.data || []) as any[];
  // Tasks for search-by-service (2026-05-02 Phase 4.3) — searches the
  // serviceLabel/service of any task linked to the client too.
  const allTasksQuery = trpc.tasks.list.useQuery();
  const allTasksData = (allTasksQuery.data || []) as any[];

  const baseList =
    statusFilter === "upsell"
      ? upsellList
      : statusFilter === "all"
        ? clients
        : clients.filter((c: any) => c.status === statusFilter);

  // 2026-05-02 (Phase 4.3) — apply search across name/business/phone/ref +
  // any matching task service label. Empty query = no filter.
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((c: any) => {
      const haystack = [
        c.name, c.businessName, c.phone, c.email, c.ref, c.department, c.csoOwner,
      ].filter(Boolean).join(" ").toLowerCase();
      if (haystack.includes(q)) return true;
      // Also search this client's tasks for service-label matches
      const matchedTask = allTasksData.find((t: any) =>
        ((c.phone && t.phone === c.phone) || (c.name && t.clientName === c.name))
        && [t.serviceLabel, t.service].filter(Boolean).join(" ").toLowerCase().includes(q)
      );
      return Boolean(matchedTask);
    });
  }, [baseList, searchQuery, allTasksData]);

  // 2026-04-30 (Phase 1.4) — single calm line replaces the DeliveredPerMonth panel
  const inDeliveryThisMonth = clients.filter((c: any) => c.status === "active" || c.status === "converted").length;

  // 2026-05-02 (Phase 5.1) — flat by-service list. Joins every active task to
  // its parent client (matched by phone or name), filters by search if any.
  const flatServices = useMemo(() => {
    if (viewMode !== "by_service") return [];
    const q = searchQuery.trim().toLowerCase();
    const TERMINAL = new Set(["Cancelled", "Archived"]);
    const rows: Array<{ task: any; client: any | null }> = [];
    for (const t of allTasksData) {
      if (TERMINAL.has(t.status)) continue;
      // Find the parent client by phone first, then name.
      const client = clients.find((c: any) =>
        (c.phone && c.phone === t.phone) ||
        (c.name && c.name === t.clientName)
      ) || null;
      // Status tab still applies in by_service mode — restrict to clients in
      // the current bucket. Tasks without a matching client only show in "all".
      if (statusFilter !== "all" && statusFilter !== "upsell") {
        if (!client || client.status !== statusFilter) continue;
      }
      // Search across task fields + client identifying fields.
      if (q) {
        const haystack = [
          t.serviceLabel, t.service, t.department, t.assignedTo,
          client?.name, client?.businessName, client?.phone, client?.ref,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) continue;
      }
      rows.push({ task: t, client });
    }
    // Sort by department then by createdAt desc — keeps Bizdoc rows together.
    rows.sort((a, b) => {
      const da = String(a.task.department || "").localeCompare(String(b.task.department || ""));
      if (da !== 0) return da;
      return new Date(b.task.createdAt || 0).getTime() - new Date(a.task.createdAt || 0).getTime();
    });
    return rows;
  }, [viewMode, allTasksData, clients, statusFilter, searchQuery]);

  return (
    <div>
      <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>
        You have <strong style={{ color: DARK }}>{inDeliveryThisMonth}</strong> client{inDeliveryThisMonth === 1 ? "" : "s"} in delivery this month.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <SectionTitle
          sub="Post-handoff workspace. Pipeline = acquisition; here is delivery, payment, and risk for paid clients only."
          help="Post-Won clients live here. Track payments, send updates, line them up for upsell."
        >
          Active clients
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

      {/* 2026-05 — relabelled tabs in plain English. The DB enum stays
          (active/converted/unverified/dormant) — only the user-facing label
          changes so the CSO knows exactly which bucket means what:
            converted → "Just Won (post-handoff, before delivery)"
            active    → "In Delivery"
            unverified→ "Pending Payment"
            dormant   → "Inactive 60d+"
          Order is also rearranged so the journey reads left→right:
            Just Won → In Delivery → Pending Payment → Inactive → Upsell. */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {([
          { key: "converted",  label: "Just Won",        countOf: "converted" },
          { key: "active",     label: "In Delivery",     countOf: "active" },
          { key: "unverified", label: "Pending Payment", countOf: "unverified" },
          { key: "dormant",    label: "Inactive 60d+",   countOf: "dormant" },
          { key: "upsell",     label: "Upsell Queue",    countOf: "upsell" },
          { key: "all",        label: "All",             countOf: "all" },
        ] as const).map(t => {
          const count = t.countOf === "upsell"
            ? upsellList.length
            : t.countOf === "all"
              ? clients.length
              : clients.filter((c: any) => c.status === t.countOf).length;
          const isSelected = statusFilter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              style={{
                padding: "6px 12px", borderRadius: 10, border: `1px solid ${DARK}10`,
                fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
                backgroundColor: isSelected ? GREEN : WHITE,
                color: isSelected ? GOLD : MUTED,
              }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 2026-05-02 (Phase 4.3) — search across name / business / phone / ref / service.
          Empty input = no filter so the status tabs still own the default view.
          2026-05-02 (Phase 5.1) — view-mode toggle alongside the search box. */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewMode === "by_service" ? "Search services by label, division, client name…" : "Search clients by name, business, phone, ref, or service…"}
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              borderRadius: 10, border: `1px solid ${DARK}12`,
              fontSize: 12, color: DARK, backgroundColor: WHITE,
            }}
          />
          <Eye size={12} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MUTED }} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              title="Clear search"
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                border: "none", background: "none", cursor: "pointer",
                fontSize: 12, color: MUTED, padding: 4,
              }}
            >×</button>
          )}
        </div>
        {/* 2026-05-02 (Phase 5.1) — By client (default) / By service (flat) toggle */}
        <div style={{ display: "flex", borderRadius: 10, border: `1px solid ${DARK}10`, overflow: "hidden", flexShrink: 0 }}>
          {([
            { key: "by_client",  label: "By client" },
            { key: "by_service", label: "By service" },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setViewMode(t.key)}
              style={{
                padding: "6px 12px", border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.02em",
                backgroundColor: viewMode === t.key ? GREEN : WHITE,
                color: viewMode === t.key ? GOLD : MUTED,
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>
      {searchQuery && viewMode === "by_client" && (
        <p style={{ fontSize: 10, color: MUTED, marginTop: -8, marginBottom: 12 }}>
          Showing <strong>{filtered.length}</strong> of <strong>{baseList.length}</strong> in this tab.
        </p>
      )}

      {clientsQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading clients..." /></Card>
      ) : viewMode === "by_client" && filtered.length === 0 ? (
        <Card><EmptyState icon={Building2} title={(() => {
          const labels: Record<string, string> = {
            converted: "No just-won clients yet — drag a lead to Won in Pipeline to see it here.",
            active:    "No clients in delivery yet.",
            unverified:"No pending-payment clients.",
            dormant:   "No inactive clients.",
            upsell:    "Upsell queue is empty.",
            all:       "No clients yet.",
          };
          return labels[statusFilter] || "No clients";
        })()} /></Card>
      ) : statusFilter === "upsell" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c: any) => (
            <UpsellRow
              key={c.id}
              client={c}
              onSetPlan={() => setUpsellTarget(c)}
              onNotify={() => setOutreachClient(c)}
            />
          ))}
        </div>
      ) : viewMode === "by_service" ? (
        /* 2026-05-02 (Phase 5.1) — Flat by-service view. Every active task
           across every client, one row per service. Useful for ops/CEO who
           want "every Bizdoc job in flight" at a glance, not per-client. */
        <Card>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Active services ({flatServices.length})
          </p>
          {flatServices.length === 0 ? (
            <EmptyState icon={Building2} title="No services match." hint="Adjust the status tab or search." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {flatServices.map(({ task, client }) => {
                const tv = parseFloat(String(task.contractValue || task.quotedPrice || "0")) || 0;
                const label = task.serviceLabel || task.service || "—";
                const dept = (task.department || "—").toLowerCase();
                const deptLeads = DEPT_LEADS[dept] || [];
                const ownerName = (task.assignedTo as string) || (deptLeads[0]?.name) || null;
                return (
                  <button
                    key={task.id}
                    onClick={() => client && setDetailClient(client)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                      padding: "10px 12px", borderRadius: 10, border: `1px solid ${HAIRLINE}`,
                      backgroundColor: WHITE, cursor: client ? "pointer" : "default",
                      textAlign: "left", width: "100%",
                    }}
                  >
                    <DivisionBadge dept={dept} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {label}
                      </p>
                      <p style={{ fontSize: 11, color: MUTED, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {client ? (client.businessName || client.name) : (task.businessName || task.clientName || "—")}
                        {ownerName ? ` · ${ownerName}` : ""}
                        {client?.ref ? ` · ${client.ref}` : task.ref ? ` · ${task.ref}` : ""}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: GREEN, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {tv > 0 ? fmtNaira(tv) : "—"}
                    </span>
                    <Pill status={task.status || "Not Started"} />
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c: any) => (
            <ClientCard
              key={c.id}
              client={c}
              onOpen={() => setDetailClient(c)}
              onAssignTask={() => setAssignTarget({ clientId: c.id })}
              onNotifyCeo={() => setNotifyCeoOpen({ clientId: c.id, subject: `Client: ${c.businessName || c.name}` })}
              onNotifyClient={() => setOutreachClient(c)}
              onAddService={() => setAddServiceTarget(c)}
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

      {outreachClient && (
        <NotifyClientModal
          client={outreachClient}
          onClose={() => setOutreachClient(null)}
        />
      )}

      {upsellTarget && (
        <SetUpsellPlanModal
          client={upsellTarget}
          onClose={() => setUpsellTarget(null)}
          onSaved={() => {
            setUpsellTarget(null);
            upsellQuery.refetch();
          }}
        />
      )}

      {/* 2026-05-02 (Phase 2.5) — Add another service to a Won client */}
      {addServiceTarget && (
        <AddServiceModal
          client={addServiceTarget}
          onClose={() => setAddServiceTarget(null)}
          onCreated={() => {
            setAddServiceTarget(null);
            clientsQuery.refetch();
          }}
        />
      )}
    </div>
  );
}

/* ─── Feature 3 — Notify-client modal ────────────────────────────────────
 * STAFF-ONLY surface (CSO portal) — wa.me deep links are intentional here.
 * They were removed from PUBLIC pages but staff use them every day to send
 * progress updates. */
function NotifyClientModal({ client, onClose }: { client: any; onClose: () => void }) {
  // Prefer the human service label (set by CSO at qualification — e.g. "Bizdoc
  // Compliant Package") over the bare dept code (e.g. "bizdoc"). Walk: service
  // → department label → generic.
  const DEPT_LABEL: Record<string, string> = {
    bizdoc: "your Bizdoc compliance work",
    scalar: "your Scalar build",
    systemise: "your Scalar build",
    medialy: "your Medialy content",
    skills: "your HUB programme",
    hub: "your HUB programme",
    podcast: "your podcast",
    video: "your video work",
    faceless: "your faceless channel",
  };
  const service = client.service?.trim()
    || DEPT_LABEL[(client.department || "").toLowerCase()]
    || "your project";
  const name = client.name || "there";
  const ref = client.ref || "";
  const defaultMsg = `Hi ${name}, quick update on ${service}: [edit me]. Track progress at https://hamzury.com/client/dashboard?ref=${ref}`;
  const [msg, setMsg] = useState(defaultMsg);
  const log = trpc.clientTruth.logOutreach.useMutation();

  // Phone normalization: strip leading 0, strip non-digits, prepend 234.
  const phone = (client.phone || "").replace(/\D/g, "");
  const waPhone = phone.startsWith("234") ? phone : phone.replace(/^0/, "");
  const waUrl = waPhone ? `https://wa.me/234${waPhone}?text=${encodeURIComponent(msg)}` : null;

  const sendWhatsApp = () => {
    if (!waUrl) {
      toast.error("No phone number on file for this client.");
      return;
    }
    log.mutate({ clientId: client.id, channel: "whatsapp", message: msg }, {
      onSuccess: () => toast.success("WhatsApp opened — outreach logged."),
      onError: () => toast.error("Logged failed but link opened."),
    });
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const copyManual = async () => {
    try {
      await navigator.clipboard.writeText(`${msg}\n\n— Send via your preferred channel (email / SMS / WhatsApp).`);
      log.mutate({ clientId: client.id, channel: "manual", message: msg }, {
        onSuccess: () => toast.success("Copied — outreach logged."),
      });
    } catch {
      toast.error("Copy failed.");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: WHITE, borderRadius: 12, padding: 22, maxWidth: 520, width: "100%",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: DARK, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Send update — {client.businessName || client.name}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>
          Phone on file: <span style={{ fontFamily: "monospace", color: DARK }}>{client.phone || "— none —"}</span>
        </p>
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value)}
          rows={5}
          style={{
            width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${DARK}15`,
            fontSize: 12, color: DARK, fontFamily: "inherit", resize: "vertical", marginBottom: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={copyManual} style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${DARK}15`,
            backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            Copy + manual
          </button>
          <button onClick={sendWhatsApp} disabled={!waUrl} style={{
            padding: "8px 14px", borderRadius: 8, border: "none",
            backgroundColor: waUrl ? GREEN : `${MUTED}40`,
            color: GOLD, fontSize: 12, fontWeight: 600, cursor: waUrl ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <MessageCircle size={12} /> Send WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature 4 — Set Upsell Plan modal ──────────────────────────────── */
function SetUpsellPlanModal({ client, onClose, onSaved }: { client: any; onClose: () => void; onSaved: () => void }) {
  const todayPlus = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  };
  const initialDate = client.nextActionDate
    ? new Date(client.nextActionDate).toISOString().slice(0, 10)
    : todayPlus(14);
  const [date, setDate] = useState<string>(initialDate);
  const [note, setNote] = useState<string>(client.upsellNote || "");
  const setPlan = trpc.clientTruth.setUpsellPlan.useMutation();

  const save = () => {
    setPlan.mutate(
      { clientId: client.id, nextActionDate: date ? new Date(date).toISOString() : undefined, upsellNote: note },
      {
        onSuccess: () => { toast.success("Upsell plan saved."); onSaved(); },
        onError: e => toast.error(e.message || "Save failed."),
      },
    );
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: WHITE, borderRadius: 12, padding: 22, maxWidth: 480, width: "100%",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: DARK, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Set next action — {client.businessName || client.name}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={16} /></button>
        </div>
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Next action date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            width: "100%", padding: 9, borderRadius: 8, border: `1px solid ${DARK}15`,
            fontSize: 12, color: DARK, marginBottom: 12,
          }}
        />
        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Upsell note / pitch</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          placeholder="e.g. Renew brand audit · Upsell Scalar SOP package · ₦250k target"
          style={{
            width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${DARK}15`,
            fontSize: 12, color: DARK, fontFamily: "inherit", resize: "vertical", marginBottom: 14,
          }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "8px 14px", borderRadius: 8, border: `1px solid ${DARK}15`,
            backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={save} disabled={setPlan.isPending} style={{
            padding: "8px 14px", borderRadius: 8, border: "none",
            backgroundColor: GREEN, color: GOLD, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{setPlan.isPending ? "Saving…" : "Save plan"}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature 4 — Upsell queue row ──────────────────────────────────── */
function UpsellRow({ client: c, onSetPlan, onNotify }: { client: any; onSetPlan: () => void; onNotify: () => void }) {
  const tasksQuery = trpc.tasks.list.useQuery();
  const clientTasks = ((tasksQuery.data || []) as any[]).filter((t: any) =>
    (c.phone && t.phone === c.phone) || (c.name && t.clientName === c.name)
  );
  // Service history = unique services across linked tasks
  const services = Array.from(new Set(clientTasks.map((t: any) => t.service).filter(Boolean))).slice(0, 3);
  // Last invoice (paid) date proxy: most recent task updatedAt for now —
  // staff care about "when did we last bill them"; full invoice history is one
  // click away in the detail slide-over.
  const lastInvoiceTs = clientTasks
    .map((t: any) => t.updatedAt || t.createdAt)
    .filter(Boolean)
    .map((s: any) => new Date(s).getTime())
    .sort((a: number, b: number) => b - a)[0];
  const daysSince = lastInvoiceTs ? Math.floor((Date.now() - lastInvoiceTs) / (24 * 60 * 60 * 1000)) : null;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{c.businessName || c.name}</p>
            <Pill status={c.status} />
            {c.nextActionDate && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                backgroundColor: `${GOLD}18`, color: "#8B6914",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                Next {fmtDate(c.nextActionDate)}
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, fontFamily: "monospace", color: GOLD, marginBottom: 8 }}>{c.ref}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 8 }}>
            <MetaCell label="Services" value={services.length ? services.join(" · ") : "—"} />
            <MetaCell label="Last invoice" value={lastInvoiceTs ? fmtDate(new Date(lastInvoiceTs).toISOString()) : "—"} />
            <MetaCell label="Days since" value={daysSince !== null ? `${daysSince}d` : "—"} warn={daysSince !== null && daysSince > 60} />
          </div>
          {c.upsellNote && (
            <div style={{ marginTop: 6, padding: "8px 12px", borderRadius: 8, backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#8B6914", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Upsell note</p>
              <p style={{ fontSize: 11, color: DARK, whiteSpace: "pre-wrap" }}>{c.upsellNote}</p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <button onClick={onSetPlan} style={{
            fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
            border: "none", backgroundColor: GREEN, color: GOLD, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Calendar size={12} /> Set next action
          </button>
          <button onClick={onNotify} style={{
            fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
            border: `1px solid ${GREEN}40`, backgroundColor: `${GREEN}08`, color: GREEN, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <MessageCircle size={12} /> Send update
          </button>
        </div>
      </div>
    </Card>
  );
}

/* 2026-05-02 — Phase 1.4 cleanup: deleted `DeliveredPerMonth` panel.
   The Active Clients header now shows a single calm line:
   "You have N client(s) in delivery this month." Stats lived in 3 places —
   collapsed to one. If a richer view is needed later, build it as a separate
   /reports route, not as ambient noise on every page load. */

/* ─── Feature 2 — Payment chip ──────────────────────────────────────── */
function PaymentChip({ summary }: { summary: { totalContract: number; totalPaid: number; totalBalance: number } | null | undefined }) {
  if (!summary) return null; // No invoice — hide
  const { totalContract, totalPaid, totalBalance } = summary;
  if (totalContract === 0 && totalPaid === 0) return null;
  let bg = `${ORANGE}18`, color = ORANGE, label = "No payment yet";
  if (totalPaid > 0 && totalBalance === 0) {
    bg = "#16A34A18"; color = "#15803D"; label = "Paid in full";
  } else if (totalPaid > 0 && totalPaid < totalContract) {
    const pct = Math.round((totalPaid / totalContract) * 100);
    bg = `${GOLD}18`; color = "#8B6914"; label = `Paid ${pct}% · ${fmtNaira(totalBalance)} due`;
  } else if (totalPaid === 0) {
    bg = `${ORANGE}18`; color = ORANGE; label = "No payment yet";
  }
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
      backgroundColor: bg, color,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {label}
    </span>
  );
}

function ClientCard({
  client: c,
  onOpen,
  onAssignTask,
  onNotifyCeo,
  onNotifyClient,
  onAddService,
}: {
  client: any;
  onOpen?: () => void;
  onAssignTask?: () => void;
  onNotifyCeo?: () => void;
  onNotifyClient?: () => void;
  onAddService?: () => void;
}) {
  // 2026-05-02 (Phase 2.4) — clientTasks now drives the always-visible per-service
  // breakdown. The old showHandoff toggle is gone; details live in-card.
  const tasksQuery = trpc.tasks.list.useQuery();
  const clientTasks = ((tasksQuery.data || []) as any[]).filter((t: any) =>
    (c.phone && t.phone === c.phone) || (c.name && t.clientName === c.name)
  );
  // 2026-05-02 (Phase 4.4) — invoices linked to this client's tasks. Built by
  // taskId so each per-service row can show its own payment status (paid /
  // partial / sent / overdue) instead of one rollup chip.
  const invoicesQuery = trpc.invoices.list.useQuery();
  const invoiceByTaskId = useMemo(() => {
    const map = new Map<number, any>();
    for (const inv of ((invoicesQuery.data || []) as any[])) {
      if (inv.taskId) map.set(inv.taskId, inv);
    }
    return map;
  }, [invoicesQuery.data]);

  // 2026-05-02 (Phase 3.3) — Subscription / renewal awareness.
  // Pulls active subscriptions linked to this client, picks the soonest next-bill
  // date, and renders a calm "Renews <date>" pill in the header. Walking calendar:
  // each subscription bills on `billingDay` of every month; "next" is the next
  // occurrence of that day from today.
  const subsQuery = trpc.subscriptions.list.useQuery();
  const clientSubs = ((subsQuery.data || []) as any[]).filter((s: any) =>
    s.status === "active" && (
      (c.phone && s.phone === c.phone) || (c.name && s.clientName === c.name)
    )
  );
  const nextRenewal = useMemo(() => {
    if (clientSubs.length === 0) return null;
    const now = new Date();
    let soonest: Date | null = null;
    for (const s of clientSubs) {
      const day = Math.max(1, Math.min(28, parseInt(s.billingDay || "1", 10) || 1));
      // Next occurrence: this month if day is in the future, else next month.
      let next = new Date(now.getFullYear(), now.getMonth(), day);
      if (next.getTime() <= now.getTime()) {
        next = new Date(now.getFullYear(), now.getMonth() + 1, day);
      }
      if (!soonest || next < soonest) soonest = next;
    }
    return soonest;
  }, [clientSubs]);
  const renewalDaysLeft = nextRenewal
    ? Math.max(0, Math.floor((nextRenewal.getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{c.businessName || c.name}</p>
            <Pill status={c.status} />
            <PaymentChip summary={c.paymentSummary} />
            {/* 2026-05-02 (Phase 3.3) — Subscription renewal pill.
                Tone shifts: green if 7+ days away, gold if 3-7 days, orange if ≤3 days. */}
            {nextRenewal && (
              <span
                title={`Next billing day: ${nextRenewal.toDateString()}`}
                style={{
                  fontSize: 9, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 10,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  backgroundColor:
                    renewalDaysLeft! <= 3 ? `${ORANGE}18`
                    : renewalDaysLeft! <= 7 ? `${GOLD}18`
                    : `${GREEN}15`,
                  color:
                    renewalDaysLeft! <= 3 ? ORANGE
                    : renewalDaysLeft! <= 7 ? "#8B6914"
                    : GREEN,
                }}
              >
                Renews{" "}
                {renewalDaysLeft === 0 ? "today"
                  : renewalDaysLeft === 1 ? "tomorrow"
                  : `in ${renewalDaysLeft}d`}
              </span>
            )}
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

          {/* 2026-05-02 (Phase 2.4) — Per-service breakdown.
              A client running 2+ services (e.g. Bizdoc CAC + Medialy package A)
              gets one row per service-task with its own contract value + status.
              The aggregate "Contract" metacell is the sum of all task contractValues,
              falling back to the legacy client.contractValue if no tasks loaded yet. */}
          {clientTasks.length > 0 ? (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                Services ({clientTasks.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {clientTasks.map((t: any) => {
                  const tv = parseFloat(String(t.contractValue || t.quotedPrice || "0")) || 0;
                  const label = t.serviceLabel || t.service || "—";
                  const dept = (t.department || "—").toLowerCase();
                  // 2026-05-02 (Phase 4.1) — per-task owner. Pick from DEPT_LEADS as
                  // a default when no explicit assignee was set on the task. Keeps a
                  // multi-service client showing distinct owners per service.
                  const deptLeads = DEPT_LEADS[dept] || [];
                  const ownerName = (t.assignedTo as string)
                    || (deptLeads[0]?.name)
                    || null;
                  // 2026-05-02 (Phase 4.4) — per-task invoice. Schema already supports
                  // invoices.taskId; we now surface the per-service payment status here.
                  const inv = invoiceByTaskId.get(t.id);
                  return (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                      padding: "6px 10px", borderRadius: 8,
                      backgroundColor: `${HAIRLINE}40`, border: `1px solid ${HAIRLINE}`,
                    }}>
                      <DivisionBadge dept={dept} />
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {label}
                        </span>
                        <span style={{ fontSize: 10, color: MUTED, display: "flex", gap: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ownerName && <span>{ownerName}</span>}
                          {inv && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, color:
                                inv.status === "paid" ? GREEN
                                : inv.status === "partial" ? "#8B6914"
                                : inv.status === "overdue" ? RED
                                : MUTED,
                              padding: "1px 6px", borderRadius: 999,
                              backgroundColor:
                                inv.status === "paid" ? `${GREEN}15`
                                : inv.status === "partial" ? `${GOLD}18`
                                : inv.status === "overdue" ? `${RED}15`
                                : `${MUTED}10`,
                              textTransform: "uppercase", letterSpacing: "0.04em",
                            }}>
                              Inv {inv.status}
                            </span>
                          )}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: GREEN, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        {tv > 0 ? fmtNaira(tv) : "—"}
                      </span>
                      <Pill status={t.status || "Not Started"} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 10 }}>
              <MetaCell label="Department" value={c.department || "—"} />
              <MetaCell label="Contract" value={fmtNaira(c.contractValue)} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
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

      {/* Action strip — services are now visible above, so the toggle is gone.
          2026-05-02 (Phase 2.4) collapsed the showHandoff dropdown into the
          per-service breakdown rendered with the rest of the card. */}
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px solid ${DARK}06`,
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, flexWrap: "wrap",
      }}>
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
          {/* 2026-05-02 (Phase 2.5) — "+ Add service" for multi-service clients */}
          {onAddService && (
            <button
              onClick={onAddService}
              style={{
                fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                border: `1px solid ${GREEN}40`, color: GREEN, backgroundColor: `${GREEN}10`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Plus size={10} /> Add service
            </button>
          )}
          {onNotifyClient && (
            <button
              onClick={onNotifyClient}
              style={{
                fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                border: `1px solid ${GREEN}30`, color: GREEN, backgroundColor: `${GREEN}06`,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <MessageCircle size={10} /> Send update
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

// 2026-04-30 — removed: RenewalsSection (replaced by inbox/pipeline pattern)
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

// 2026-04-30 — TargetsSection + TargetRow removed: targets UI moved to CEO Dashboard.

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
  // 2026-04-30 — distinct accent per rhythm type so the Mon view (5 events
  // stacked) stays readable. Outreach = deep green (the heart of the day),
  // Planning = blue, Dashboard = warm grey (admin), Commission = gold.
  outreach: "#1B4D3E",
  planning: "#3B82F6",
  dashboard: "#9CA3AF",
  rhythm: "#B48C4C",       // legacy fallback
  commission: "#B48C4C",   // gold for celebration day
};

/* 2026-04-30 — Built-in CSO weekly rhythm from
   original files/PHASE4_CSO_BIZDEV/CSO/CALENDAR/CSO_Calendar.ics. These
   show every week without needing manual entry. Custom events from
   trpc.calendar.list overlay on top. */
type RhythmEvent = {
  title: string;
  description: string;
  type: string;
  weekday?: number;        // 0=Sun .. 6=Sat (undefined for monthly)
  monthDay?: number;       // 1=1st of month
  startHHMM: string;       // "09:00"
  endHHMM: string;
};
const CSO_RHYTHM: RhythmEvent[] = [
  { title: "Outreach Block",          description: "Calls · LinkedIn · Email follow-ups · 10–15 connects target", type: "outreach",   weekday: 1, startHHMM: "09:00", endHHMM: "11:00" },
  { title: "Outreach Block",          description: "Calls · LinkedIn · Email follow-ups · 10–15 connects target", type: "outreach",   weekday: 2, startHHMM: "09:00", endHHMM: "11:00" },
  { title: "Outreach Block",          description: "Calls · LinkedIn · Email follow-ups · 10–15 connects target", type: "outreach",   weekday: 3, startHHMM: "09:00", endHHMM: "11:00" },
  { title: "Outreach Block",          description: "Calls · LinkedIn · Email follow-ups · 10–15 connects target", type: "outreach",   weekday: 4, startHHMM: "09:00", endHHMM: "11:00" },
  { title: "Outreach Block",          description: "Calls · LinkedIn · Email follow-ups · 10–15 connects target", type: "outreach",   weekday: 5, startHHMM: "09:00", endHHMM: "11:00" },
  { title: "Week Planning",           description: "Plan week's sales targets — deals, calls, proposals.",        type: "planning",   weekday: 1, startHHMM: "08:30", endHHMM: "09:00" },
  { title: "Pipeline Review with CEO",description: "Status updates · Deals moving forward · Support needed.",     type: "meeting",    weekday: 3, startHHMM: "10:00", endHHMM: "11:00" },
  { title: "Dashboard Update",        description: "End of day — log activities, update pipeline, plan tomorrow.",type: "dashboard",  weekday: 1, startHHMM: "15:00", endHHMM: "15:30" },
  { title: "Dashboard Update",        description: "End of day — log activities, update pipeline, plan tomorrow.",type: "dashboard",  weekday: 2, startHHMM: "15:00", endHHMM: "15:30" },
  { title: "Dashboard Update",        description: "End of day — log activities, update pipeline, plan tomorrow.",type: "dashboard",  weekday: 3, startHHMM: "15:00", endHHMM: "15:30" },
  { title: "Dashboard Update",        description: "End of day — log activities, update pipeline, plan tomorrow.",type: "dashboard",  weekday: 4, startHHMM: "15:00", endHHMM: "15:30" },
  { title: "Dashboard Update",        description: "End of day — log activities, update pipeline, plan tomorrow.",type: "dashboard",  weekday: 5, startHHMM: "15:00", endHHMM: "15:30" },
  { title: "Commission Day",          description: "Finance pays commission · Review tracker · Celebrate wins.",  type: "commission", monthDay: 1, startHHMM: "10:00", endHHMM: "10:30" },
];

function expandRhythm(monthCursor: Date): any[] {
  const out: any[] = [];
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    for (const r of CSO_RHYTHM) {
      const matchWeek = r.weekday !== undefined && date.getDay() === r.weekday;
      const matchMonth = r.monthDay !== undefined && date.getDate() === r.monthDay;
      if (!matchWeek && !matchMonth) continue;
      const [sh, sm] = r.startHHMM.split(":").map(Number);
      const [eh, em] = r.endHHMM.split(":").map(Number);
      const start = new Date(year, month, d, sh, sm);
      const end = new Date(year, month, d, eh, em);
      out.push({
        id: `rhythm-${r.title.replace(/\s+/g, "-")}-${date.toISOString().slice(0, 10)}`,
        title: r.title,
        description: r.description,
        eventType: r.type,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        isRhythm: true,
      });
    }
  }
  return out;
}

/* 2026-05-02 (Phase 5.3 audit) — Calendar earns its slot.
   Two non-overlapping uses: (a) user-created events via trpc.calendar (meetings,
   follow-ups, deadlines) and (b) the built-in CSO rhythm overlay (Mon 8:30
   week-planning, etc) generated from the playbook. Both stay live so the tab
   isn't just decoration. No structural changes — kept for review only. */
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
  // Built-in CSO rhythm (always visible) + user-added events
  const rhythmEvents = useMemo(() => expandRhythm(cursor), [cursor]);
  const customEvents = (eventsQuery.data || []) as any[];
  const events = [...rhythmEvents, ...customEvents];

  const byDate: Record<string, any[]> = {};
  events.forEach(e => {
    const key = new Date(e.startAt).toISOString().slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(e);
  });

  // Build month grid
  // Week starts Monday: shift Sunday (0) to the end so 0=Mon, 6=Sun.
  const firstWeekday = (new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay() + 6) % 7;
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
      <SectionTitle sub="Shared calendar — meetings, follow-ups, deadlines and renewals across CSO operations. Tap a date to see what's on that day.">
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
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
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

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  const isMobile = typeof window !== "undefined" && window.innerWidth < 900;
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
    medialyOwner: "",
    podcastOwner: "",
    videoOwner: "",
    facelessOwner: "",
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
    if (form.bizdocOwner)   deptOwners.bizdoc    = form.bizdocOwner;
    if (form.systemiseOwner) deptOwners.systemise = form.systemiseOwner;
    if (form.skillsOwner)   deptOwners.skills    = form.skillsOwner;
    if (form.medialyOwner)  deptOwners.medialy   = form.medialyOwner;
    if (form.podcastOwner)  deptOwners.podcast   = form.podcastOwner;
    if (form.videoOwner)    deptOwners.video     = form.videoOwner;
    if (form.facelessOwner) deptOwners.faceless  = form.facelessOwner;
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <Field label="Business name *" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} />
        <Field label="Contact name *" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
        <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <Field label="Contract value (NGN) *" value={form.value} onChange={(v) => setForm({ ...form, value: v })} />
        <Field label="Start date" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
      </div>
      <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 12, marginBottom: 4 }}>Department owners (leave blank to skip)</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <SelectField
          label="Bizdoc owner"
          value={form.bizdocOwner}
          onChange={(v) => setForm({ ...form, bizdocOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.bizdoc || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Scalar owner"
          value={form.systemiseOwner}
          onChange={(v) => setForm({ ...form, systemiseOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.systemise || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Medialy owner"
          value={form.medialyOwner}
          onChange={(v) => setForm({ ...form, medialyOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.medialy || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Hub owner"
          value={form.skillsOwner}
          onChange={(v) => setForm({ ...form, skillsOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.skills || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Podcast owner"
          value={form.podcastOwner}
          onChange={(v) => setForm({ ...form, podcastOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.podcast || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Video owner"
          value={form.videoOwner}
          onChange={(v) => setForm({ ...form, videoOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.video || []).map(l => ({ value: l.name, label: l.name }))]}
        />
        <SelectField
          label="Faceless owner"
          value={form.facelessOwner}
          onChange={(v) => setForm({ ...form, facelessOwner: v })}
          options={[{ value: "", label: "— none —" }, ...(DEPT_LEADS.faceless || []).map(l => ({ value: l.name, label: l.name }))]}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
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

/* ─── Phase 2.5 (2026-05-02) — Add another service to an existing Won client.
   Modal opens from ClientCard → "+ Add service". Skips the lead pipeline since
   the client is already qualified and paid before. Creates a task + commission row
   in one shot via csoActions.addServiceToClient. */
function AddServiceModal({ client, onClose, onCreated }: { client: any; onClose: () => void; onCreated: () => void }) {
  const [serviceLabel, setServiceLabel] = useState("");
  const [department, setDepartment] = useState<"bizdoc" | "systemise" | "scalar" | "medialy" | "skills" | "hub" | "podcast" | "video" | "faceless">("bizdoc");
  const [contractValue, setContractValue] = useState<string>("");
  const [notes, setNotes] = useState("");

  const add = trpc.csoActions.addServiceToClient.useMutation({
    onSuccess: (r) => {
      toast.success(`Added — task ${r.ref} created`);
      onCreated();
    },
    onError: (e) => toast.error(e.message || "Couldn't add service."),
  });

  const submit = () => {
    if (!serviceLabel.trim()) { toast.error("Service label is required."); return; }
    const cv = parseFloat(contractValue.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(cv) || cv < 0) { toast.error("Contract value must be a positive number."); return; }
    add.mutate({
      clientId: client.id,
      service: serviceLabel.trim(),
      serviceLabel: serviceLabel.trim(),
      department,
      contractValue: cv,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <ModalShell title={`Add service · ${client.businessName || client.name}`} onClose={onClose}>
      <p style={{ fontSize: 11, color: INK_MUTED, marginBottom: 12, lineHeight: 1.5 }}>
        Adds a new service to this Won client. A task is created on the same client record (no
        duplicate row), a pending commission is queued for Finance, and the receiving division gets
        a notification.
      </p>
      <Field label="Service *" value={serviceLabel} onChange={setServiceLabel} placeholder="e.g. Bizdoc CAC, Medialy package A" />
      <SelectField
        label="Division *"
        value={department}
        onChange={(v) => setDepartment(v as any)}
        options={[
          { value: "bizdoc",   label: "Bizdoc" },
          { value: "scalar",   label: "Scalar" },
          { value: "medialy",  label: "Medialy" },
          { value: "hub",      label: "Hub" },
          { value: "podcast",  label: "Podcast" },
          { value: "video",    label: "Video" },
          { value: "faceless", label: "Faceless" },
        ]}
      />
      <Field label="Contract value (₦) *" type="number" value={contractValue} onChange={setContractValue} placeholder="e.g. 250000" />
      <Field label="Notes" value={notes} onChange={setNotes} placeholder="Anything the division needs to know" />
      <button
        onClick={submit}
        disabled={add.isPending}
        style={{
          marginTop: 8, padding: "10px 16px", borderRadius: 10, border: "none",
          backgroundColor: GREEN, color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer",
          width: "100%", opacity: add.isPending ? 0.6 : 1,
        }}
      >
        {add.isPending ? "Adding…" : "Add service"}
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
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
  // 2026-05-02 (Phase 3.2) — recent activity feed for this client.
  const activityQuery = trpc.clientTruth.recentActivity.useQuery({ clientId: client.id, limit: 12 });
  const activity = (activityQuery.data || []) as any[];

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
            {/* 2026-04-30 — "Publish update" Phase 2 placeholder removed.
                Will return when client-dashboard publishing is wired. */}
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

          {/* 2026-05-02 (Phase 3.2) — Recent activity feed */}
          <Card style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Recent activity
            </p>
            {activityQuery.isLoading ? (
              <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic" }}>Loading…</p>
            ) : activity.length === 0 ? (
              <p style={{ fontSize: 11, color: MUTED }}>No activity yet — once stage changes, payments, or status updates happen they'll show up here.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activity.map((a: any) => {
                  // Friendly action labels — keep the audit log human even when
                  // the underlying enum is a snake_case slug.
                  const ACTION_LABEL: Record<string, string> = {
                    lead_stage_updated: "Stage updated",
                    lead_assigned: "Lead assigned",
                    lead_snoozed: "Snoozed",
                    lead_unsnoozed: "Resumed",
                    task_created: "Task created",
                    price_set: "Price set",
                    handoff_failed: "Handoff failed",
                    details_updated: "Task details updated",
                  };
                  const label = ACTION_LABEL[a.action] || (a.action || "").replace(/_/g, " ");
                  return (
                    <div key={a.id} style={{ fontSize: 11, padding: "6px 8px", borderRadius: 6, backgroundColor: `${DARK}03` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, color: DARK, textTransform: "capitalize" }}>{label}</span>
                        <span style={{ color: MUTED, fontSize: 10 }}>{fmtDate(a.createdAt)}</span>
                      </div>
                      {a.details && (
                        <p style={{ color: MUTED, lineHeight: 1.5 }}>{a.details}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
/* 2026-04-30 — Pipeline rebuilt to match the 11-stage CSO Flow Diagram.
 * The 8 backend statuses map onto the diagram's stages — each carries:
 *   owner: who runs the stage (Lead Handler / Closer / Coordinator)
 *   sla:   the time limit from the diagram
 *   path:  "shared" (both paths use it), "A" (Direct), "B" (Diagnosis)
 *   blurb: one line describing what happens in this stage */
const PIPELINE_STAGES: {
  key: string; label: string; color: string;
  owner: string; sla: string; path: "shared" | "A" | "B" | "end";
  blurb: string;
}[] = [
  { key: "new",           label: "New",           color: BLUE,       owner: "Lead Handler", sla: "Add to sheet within 30 min", path: "shared", blurb: "Lead just arrived. Send M1 (Welcome + 3 Qs) within 2 hrs." },
  { key: "qualified",     label: "Qualified",     color: "#6366F1",  owner: "Lead Handler", sla: "BANT done within 24h",       path: "shared", blurb: "Answers received. Pick Path A (direct close) or Path B (diagnosis form)." },
  { key: "proposal_sent", label: "Proposal sent", color: GOLD,       owner: "Coordinator",  sla: "PDF within 24h of form",     path: "B",      blurb: "Path B — diagnosis form returned, custom PDF + M4 sent." },
  { key: "negotiation",   label: "Closer call",   color: "#8B5CF6",  owner: "Closer",       sla: "Within 24h of stage entry",  path: "shared", blurb: "Closer is on the call — discussing solution, handling objections, asking for the close." },
  { key: "onboarding",    label: "Onboarding",    color: ORANGE,     owner: "Coordinator",  sla: "Invoice within 1 hr of yes", path: "shared", blurb: "Verbal yes. Send invoice + agreement, await payment." },
  { key: "won",           label: "Won",           color: "#22C55E",  owner: "Coordinator",  sla: "Hand off to division same day", path: "end", blurb: "Paid. Hand off to the division ops team and start delivery." },
  { key: "paused",        label: "Nurture",       color: GOLD,       owner: "Closer",       sla: "Follow up in 3–7 days",      path: "end",    blurb: "Maybe / not now. Schedule a follow-up reminder; don't lose them." },
  { key: "lost",          label: "Lost",          color: RED,        owner: "Lead Handler", sla: "—",                          path: "end",    blurb: "Said no. Log reason; archive." },
];

/* 2026-04-30 v2 — Pipeline rebuilt for less friction:
 *   · Default view shows ONLY active flow stages (5 columns, not 8).
 *   · End states (Won, Nurture, Lost) are collapsed into one toggle counter
 *     at the top — click to reveal those columns when needed.
 *   · One card-action menu (⋯) replaces the bristle of buttons. Cleaner and
 *     keeps Won/Nurture/Lost/Back/Delete reliably callable.
 *   · No more "Open" button — clicking the card opens it.
 *   · No always-visible trash icon.
 *   · Pending-state UI on the menu items so it's obvious when a mutation
 *     is in flight (the user said Won/Nurture aren't working — usually
 *     this is a feedback issue, not a wire issue).
 */
function PipelineSection({ onQualify }: { onQualify: (id: number) => void }) {
  const groupedQuery = trpc.leads.list.useQuery({ groupByStage: true } as any);
  const utils = trpc.useUtils();

  // Mutations — verbose logging so any failure is visible in DevTools.
  const updateStage = trpc.leads.updateStage.useMutation({
    onMutate: (vars) => { console.log("[CSO] updateStage →", vars); },
    onSuccess: (data, vars) => {
      console.log("[CSO] updateStage ok ←", vars, data);
      utils.leads.list.invalidate();
      utils.clientTruth?.listWithPaymentSummary?.invalidate?.();
      // 2026-05 — Won is a special case: tell the CSO where the lead just
      // went, with a click-through to Active Clients so they don't think
      // the action did nothing. For other stages, plain toast is fine.
      if (vars.stage === "won") {
        toast.success(
          (t) => (
            <span>
              ✅ Won — handed off to Active Clients.{" "}
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("hamzury:cso-go-active-clients"));
                  toast.dismiss(t);
                }}
                style={{ color: "#15803D", fontWeight: 700, textDecoration: "underline", cursor: "pointer", background: "none", border: "none", padding: 0 }}
              >
                Open →
              </button>
            </span>
          ),
          { duration: 6000 },
        );
      } else {
        toast.success(`Stage → ${vars.stage.replace("_", " ")}`, { duration: 2200 });
      }
    },
    onError: (e, vars) => {
      console.error("[CSO] updateStage FAILED", vars, e);
      toast.error(e.message || "Couldn't update stage. Check Console for details.");
    },
  });
  const assignDivision = trpc.leads.assign.useMutation({
    onMutate: (vars) => { console.log("[CSO] assignDivision →", vars); },
    onSuccess: (data, vars) => {
      console.log("[CSO] assignDivision ok ←", vars, data);
      toast.success(`Assigned to ${vars.department}. Division ops can now see the task.`, { duration: 2800 });
      utils.leads.list.invalidate();
      utils.tasks?.list?.invalidate?.();
    },
    onError: (e, vars) => {
      console.error("[CSO] assignDivision FAILED", vars, e);
      toast.error(e.message || "Couldn't assign. Check Console for details.");
    },
  });
  const setTaskPrice = trpc.tasks.setPrice.useMutation({
    onSuccess: () => { toast.success("Quoted price set."); utils.leads.list.invalidate(); },
    onError: (e) => toast.error(e.message || "Couldn't set price."),
  });
  const deleteLead = trpc.leads.delete.useMutation({
    onSuccess: () => { toast.success("Lead deleted"); utils.leads.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const grouped = (groupedQuery.data || {}) as Record<string, any[]>;
  const allLeads = useMemo(() => Object.values(grouped).flat() as any[], [grouped]);
  const activeCount = allLeads.filter(l => !["won", "lost", "paused", "converted", "archived"].includes(l.status)).length;
  const wonThisMonth = (grouped.won || []).filter((l: any) => {
    const d = l.updatedAt ? new Date(l.updatedAt) : null;
    if (!d) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const endStateTotal = (grouped.won?.length || 0) + (grouped.paused?.length || 0) + (grouped.lost?.length || 0);

  const [showEndStates, setShowEndStates] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  // 2026-05-02 (Phase 5.2) — bulk-move multi-select. Holds lead IDs ticked
  // by the operator. Action bar at the bottom of the section reads this set
  // and fires a stage-change for each one in sequence.
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toggleSelected = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  // 2026-04-30 v3 — Connected, path-aware Advance/Move-back across every stage.
  //
  //   FLOW_ORDER     = the 5 stages that show by default (visible without
  //                    "Show end states"). Used for column visibility only.
  //   ADVANCE_PATH_A = direct close: New → Qualified → Closer call →
  //                    Onboarding → Won  (skips proposal_sent)
  //   ADVANCE_PATH_B = with diagnosis form: New → Qualified → Proposal sent →
  //                    Closer call → Onboarding → Won
  //
  // We pick Path A by default. At the Qualified stage the menu offers BOTH
  // a direct "Advance to Closer call" AND a "Send proposal first (Path B)"
  // action so the user sees their choice. At every OTHER stage there's one
  // canonical next stage so Advance always works the same way.
  const FLOW_ORDER = ["new", "qualified", "proposal_sent", "negotiation", "onboarding"] as const;
  const ADVANCE_PATH_A = ["new", "qualified", "negotiation", "onboarding", "won"] as const;
  const ADVANCE_PATH_B = ["new", "qualified", "proposal_sent", "negotiation", "onboarding", "won"] as const;
  const visibleStages = showEndStates
    ? PIPELINE_STAGES
    : PIPELINE_STAGES.filter(s => FLOW_ORDER.includes(s.key as any));

  const ageDays = (l: any): number => {
    const ts = l.updatedAt ? new Date(l.updatedAt).getTime() : (l.createdAt ? new Date(l.createdAt).getTime() : Date.now());
    return Math.max(0, Math.floor((Date.now() - ts) / 86_400_000));
  };

  /** Returns the next stage on Path A (direct close) for the given current stage. */
  const nextStagePathA = (current: string): string | null => {
    const order = ADVANCE_PATH_A as readonly string[];
    const i = order.indexOf(current);
    if (i === -1 || i === order.length - 1) return null;
    return order[i + 1];
  };

  /** Returns the next stage on Path B (diagnosis form). */
  const nextStagePathB = (current: string): string | null => {
    const order = ADVANCE_PATH_B as readonly string[];
    const i = order.indexOf(current);
    if (i === -1 || i === order.length - 1) return null;
    return order[i + 1];
  };

  /** Returns the previous stage on whichever path the lead is on. */
  const prevStage = (current: string): string | null => {
    // Try Path B first (longer); fall back to A.
    const orderB = ADVANCE_PATH_B as readonly string[];
    const orderA = ADVANCE_PATH_A as readonly string[];
    const order = orderB.includes(current) ? orderB : orderA;
    const i = order.indexOf(current);
    if (i <= 0) return null;
    return order[i - 1];
  };

  /** Look up the friendly label for a stage key. */
  const labelFor = (key: string): string => {
    return PIPELINE_STAGES.find(s => s.key === key)?.label || key;
  };

  const handleAdvance = (lead: any, currentStage: string) => {
    // Default to Path A (direct close — most common). Path B is selected
    // explicitly via "Send proposal first" at the Qualified stage.
    const next = nextStagePathA(currentStage);
    if (!next) return;
    updateStage.mutate({ leadId: lead.id, stage: next as any });
    setOpenMenuId(null);
  };
  const handleRetreat = (lead: any, currentStage: string) => {
    const prev = prevStage(currentStage);
    if (!prev) return;
    updateStage.mutate({ leadId: lead.id, stage: prev as any });
    setOpenMenuId(null);
  };
  /** Path B branch — explicitly send to proposal_sent stage. */
  const handleSendProposal = (lead: any) => {
    updateStage.mutate({ leadId: lead.id, stage: "proposal_sent" as any });
    setOpenMenuId(null);
  };
  const markStage = (lead: any, stage: string) => {
    updateStage.mutate({ leadId: lead.id, stage: stage as any });
    setOpenMenuId(null);
  };
  const handleQualify = (lead: any) => {
    setOpenMenuId(null);
    onQualify(lead.id);
  };
  const handleSetPrice = (lead: any) => {
    setOpenMenuId(null);
    // Pull existing price from lead.quotedPrice (denormalised on the lead row)
    // or fall back to "" so the prompt is empty for fresh entries.
    const existing = lead.quotedPrice ? String(lead.quotedPrice) : "";
    const raw = window.prompt(
      `Set quoted price for ${lead.name || lead.ref} (Naira, no commas):`,
      existing,
    );
    if (raw === null) return;                       // cancelled
    const cleaned = raw.replace(/[^\d.]/g, "");
    const n = parseFloat(cleaned);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a positive number — e.g. 150000");
      return;
    }
    // tasks.setPrice expects the linked task id, not the lead id.
    const taskId = lead.taskId || lead.linkedTaskId;
    if (!taskId) {
      toast.error("This lead has no linked task yet — assign it to a division first.");
      return;
    }
    setTaskPrice.mutate({ id: taskId, quotedPrice: String(n) });
  };
  const handleOpenAssign = (lead: any) => {
    setOpenMenuId(null);
    setAssignTarget(lead);
  };
  const handleDelete = (lead: any) => {
    if (deleteLead.isPending) return;
    if (!window.confirm(`Delete lead ${lead.ref || "#" + lead.id} — ${lead.name || lead.businessName || ""}? This cannot be undone.`)) return;
    deleteLead.mutate({ id: lead.id });
    setOpenMenuId(null);
  };

  // Close any open card-menu when clicking outside
  useEffect(() => {
    if (openMenuId === null) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 12, marginBottom: 14, flexWrap: "wrap",
      }}>
        <SectionTitle
          sub="Five flow stages on by default. Use the ⋯ menu on any card for Won, Nurture, Lost, or step back."
          help="Drag your active deals through stages: New → Qualified → Closer call → Onboarding → Won. Use ⋯ menu for shortcuts."
        >
          Pipeline
        </SectionTitle>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "8px 14px", borderRadius: 10, backgroundColor: WHITE,
            border: `1px solid ${HAIRLINE}`, fontSize: 11, color: INK,
          }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: INK_MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>Active</p>
            <p style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{activeCount}</p>
          </div>
          {/* 2026-05 — make "Won this month" a click-through to Active Clients
              so the CSO doesn't think their won leads vanished. */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("hamzury:cso-go-active-clients"))}
            style={{
              padding: "8px 14px", borderRadius: 10, backgroundColor: WHITE,
              border: `1px solid ${HAIRLINE}`, fontSize: 11, color: INK, cursor: "pointer",
              textAlign: "left",
            }}
            title="Open Active Clients to see them"
          >
            <p style={{ fontSize: 9, fontWeight: 700, color: INK_MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>Won this month →</p>
            <p style={{ fontSize: 16, fontWeight: 700, marginTop: 2, color: GREEN }}>{wonThisMonth}</p>
          </button>
          <button
            onClick={() => setShowEndStates(s => !s)}
            style={{
              padding: "8px 14px", borderRadius: 10,
              backgroundColor: showEndStates ? GREEN : WHITE,
              color: showEndStates ? GOLD : INK,
              border: `1px solid ${showEndStates ? GREEN : HAIRLINE}`,
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {showEndStates ? "Hide" : "Show"} end states ({endStateTotal})
          </button>
        </div>
      </div>

      {groupedQuery.isLoading ? (
        <Card><EmptyState icon={Loader2} title="Loading pipeline..." /></Card>
      ) : (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
          {visibleStages.map(stage => {
            const items = (grouped[stage.key] || []) as any[];
            const orderIdx = FLOW_ORDER.indexOf(stage.key as any);
            const isFlow = orderIdx !== -1;
            return (
              <div key={stage.key} style={{
                minWidth: 280, maxWidth: 300, flex: "0 0 auto",
                backgroundColor: `${stage.color}06`, borderRadius: 12,
                border: `1px solid ${stage.color}20`, padding: 12,
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {/* Stage header */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: stage.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {stage.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                      backgroundColor: WHITE, color: stage.color, border: `1px solid ${stage.color}30`,
                    }}>{items.length}</span>
                  </div>
                  <p style={{ fontSize: 10, color: INK_MUTED, marginTop: 4, lineHeight: 1.45 }}>
                    {stage.blurb}
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 999,
                      backgroundColor: `${stage.color}15`, color: stage.color, fontWeight: 700,
                    }}>{stage.owner}</span>
                    <span style={{
                      fontSize: 9, padding: "2px 6px", borderRadius: 999,
                      backgroundColor: `${INK_MUTED}15`, color: INK_MUTED, fontWeight: 600,
                    }}>{stage.sla}</span>
                  </div>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
                  {items.length === 0 ? (
                    <p style={{ fontSize: 10, color: `${INK_MUTED}80`, textAlign: "center", padding: "16px 0" }}>—</p>
                  ) : items.map((lead: any) => {
                    const age = ageDays(lead);
                    const stale = age >= 3 && stage.path !== "end";
                    const menuOpen = openMenuId === lead.id;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => onQualify(lead.id)}
                        style={{
                          backgroundColor: WHITE, borderRadius: 10, padding: "11px 12px",
                          border: `1px solid ${stale ? RED + "40" : DARK + "08"}`,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          display: "flex", flexDirection: "column", gap: 6,
                          cursor: "pointer", position: "relative",
                        }}
                      >
                        {/* Header row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
                            {/* 2026-05-02 (Phase 5.2) — multi-select checkbox.
                                Stop propagation so clicking the box doesn't open the lead. */}
                            <input
                              type="checkbox"
                              checked={selectedIds.has(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); toggleSelected(lead.id); }}
                              title="Select for bulk action"
                              style={{ flexShrink: 0, cursor: "pointer", accentColor: GREEN as any }}
                            />
                            <p style={{ fontSize: 13, fontWeight: 700, color: INK, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {lead.name || lead.businessName || "Unnamed"}
                            </p>
                            {/* 2026-05-02 (Phase 2.3) — Returning client pill. Lead.linkedClientId
                                is set on submit when phone matches an existing clientTruth row,
                                so CSO knows this is an upsell, not a fresh deal. */}
                            {lead.linkedClientId && (
                              <span
                                title="This phone matches an existing client — upsell or new service"
                                style={{
                                  fontSize: 9, fontWeight: 700, color: GREEN,
                                  padding: "1px 6px", borderRadius: 999,
                                  backgroundColor: `${GREEN}15`,
                                  letterSpacing: "0.04em", textTransform: "uppercase",
                                  whiteSpace: "nowrap", flexShrink: 0,
                                }}
                              >
                                ↩ Returning
                              </span>
                            )}
                          </div>
                          {/* Single ⋯ menu button */}
                          <button
                            title="More actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(menuOpen ? null : lead.id);
                            }}
                            style={{
                              width: 26, height: 26, borderRadius: 6,
                              border: "none", backgroundColor: menuOpen ? `${stage.color}15` : "transparent",
                              color: INK_MUTED, cursor: "pointer", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 700, fontSize: 16, lineHeight: 1,
                            }}
                          >⋯</button>
                        </div>

                        {/* Service line */}
                        {lead.service && (
                          <p style={{ fontSize: 11, color: INK_MUTED, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lead.service}
                          </p>
                        )}

                        {/* Source + age in one compact row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {(lead.referralCode || lead.source) && (
                              <SourceBadge code={lead.referralCode} source={lead.source} referrerName={lead.referrerName} />
                            )}
                          </div>
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: stale ? RED : INK_MUTED,
                            padding: "1px 6px", borderRadius: 999,
                            backgroundColor: stale ? `${RED}15` : "transparent",
                            whiteSpace: "nowrap", flexShrink: 0,
                          }}>
                            {age === 0 ? "today" : `${age}d`}
                          </span>
                        </div>

                        {/* Action menu — appears below card when ⋯ is clicked */}
                        {menuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              position: "absolute", top: "100%", right: 0, marginTop: 4,
                              minWidth: 180, zIndex: 20,
                              backgroundColor: WHITE, borderRadius: 10,
                              border: `1px solid ${HAIRLINE}`,
                              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                              padding: 4,
                              display: "flex", flexDirection: "column", gap: 1,
                            }}
                          >
                            <MenuItem
                              icon={<Eye size={13} />}
                              label="Open & qualify (BANT)"
                              color={GREEN}
                              onClick={() => handleQualify(lead)}
                            />
                            <MenuItem
                              icon={<ArrowRightCircle size={13} />}
                              label="Assign to division…"
                              color={BLUE}
                              disabled={assignDivision.isPending}
                              onClick={() => handleOpenAssign(lead)}
                            />
                            <div style={{ height: 1, backgroundColor: HAIRLINE, margin: "3px 6px" }} />
                            {/* 2026-04-30 — Connected Advance/Move-back across every stage.
                                Each item shows where it's going. Path B branch appears
                                only at Qualified — otherwise Advance follows Path A
                                (direct close, the common case). */}
                            {(() => {
                              const nextA = nextStagePathA(stage.key);
                              return nextA ? (
                                <MenuItem
                                  icon={<ChevronRight size={13} />}
                                  label={`Advance → ${labelFor(nextA)}`}
                                  color={stage.color}
                                  disabled={updateStage.isPending}
                                  onClick={() => handleAdvance(lead, stage.key)}
                                />
                              ) : null;
                            })()}
                            {stage.key === "qualified" && (
                              <MenuItem
                                icon={<FileText size={13} />}
                                label="Send proposal first (Path B)"
                                color={GOLD}
                                disabled={updateStage.isPending}
                                onClick={() => handleSendProposal(lead)}
                              />
                            )}
                            {(() => {
                              const prev = prevStage(stage.key);
                              return prev ? (
                                <MenuItem
                                  icon={<ChevronLeft size={13} />}
                                  label={`Move back → ${labelFor(prev)}`}
                                  color={INK_MUTED}
                                  disabled={updateStage.isPending}
                                  onClick={() => handleRetreat(lead, stage.key)}
                                />
                              ) : null;
                            })()}
                            <div style={{ height: 1, backgroundColor: HAIRLINE, margin: "3px 6px" }} />
                            <MenuItem
                              icon={<DollarSign size={13} />}
                              label={lead.quotedPrice ? `Update price (₦${parseFloat(lead.quotedPrice).toLocaleString("en-NG")})` : "Set quoted price"}
                              color={GOLD}
                              disabled={setTaskPrice.isPending}
                              onClick={() => handleSetPrice(lead)}
                            />
                            <MenuItem
                              icon={<CheckCircle2 size={13} />}
                              label="Mark Won"
                              color={GREEN}
                              disabled={updateStage.isPending || stage.key === "won"}
                              onClick={() => markStage(lead, "won")}
                            />
                            <MenuItem
                              icon={<Clock size={13} />}
                              label="Move to Nurture"
                              color={GOLD}
                              disabled={updateStage.isPending || stage.key === "paused"}
                              onClick={() => markStage(lead, "paused")}
                            />
                            <MenuItem
                              icon={<X size={13} />}
                              label="Mark Lost"
                              color={RED}
                              disabled={updateStage.isPending || stage.key === "lost"}
                              onClick={() => markStage(lead, "lost")}
                            />
                            <div style={{ height: 1, backgroundColor: HAIRLINE, margin: "3px 6px" }} />
                            <MenuItem
                              icon={<Trash2 size={13} />}
                              label="Delete"
                              color={RED}
                              disabled={deleteLead.isPending}
                              onClick={() => handleDelete(lead)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign-to-division modal — opens when CSO picks "Assign to division…" */}
      {assignTarget && (
        <AssignDivisionModal
          lead={assignTarget}
          isPending={assignDivision.isPending}
          onClose={() => setAssignTarget(null)}
          onAssign={(department, alsoAdvance) => {
            assignDivision.mutate(
              { leadId: assignTarget.id, department },
              {
                onSuccess: () => {
                  setAssignTarget(null);
                  // If CSO ticked "also move to Closer call" advance the stage too
                  if (alsoAdvance && assignTarget.status !== "negotiation") {
                    updateStage.mutate({ leadId: assignTarget.id, stage: "negotiation" });
                  }
                },
              },
            );
          }}
        />
      )}

      {/* 2026-05-02 (Phase 5.2) — Bulk action bar. Sticky at the bottom of the
          viewport while leads are selected. End-of-day clean-up: tick a few
          stale leads, hit "Mark Lost", done. Confirms before firing. */}
      {selectedIds.size > 0 && (
        <div style={{
          position: "fixed", left: "50%", bottom: 16, transform: "translateX(-50%)",
          zIndex: 50, padding: "10px 16px", borderRadius: 12,
          backgroundColor: INK, color: WHITE,
          boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          fontSize: 12, fontWeight: 600,
        }}>
          <span style={{ color: GOLD }}>{selectedIds.size} selected</span>
          <span style={{ width: 1, height: 16, backgroundColor: `${WHITE}20` }} />
          {([
            { label: "Mark Won",     stage: "won" as const,    color: "#22C55E" },
            { label: "Mark Nurture", stage: "paused" as const, color: GOLD },
            { label: "Mark Lost",    stage: "lost" as const,   color: "#9CA3AF" },
          ]).map(action => (
            <button
              key={action.stage}
              disabled={updateStage.isPending}
              onClick={async () => {
                const ids = Array.from(selectedIds);
                if (!window.confirm(`Mark ${ids.length} lead${ids.length === 1 ? "" : "s"} as ${action.label.replace("Mark ", "")}?`)) return;
                // Fire sequentially so one failure doesn't blow up the rest;
                // success toast appears per lead but that's acceptable for a
                // batch op (the user just asked for it).
                for (const id of ids) {
                  try { await updateStage.mutateAsync({ leadId: id, stage: action.stage }); }
                  catch (err) { console.error("[bulk] failed for", id, err); }
                }
                clearSelection();
              }}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                backgroundColor: action.color, color: action.stage === "lost" ? INK : GOLD,
                fontSize: 11, fontWeight: 700, opacity: updateStage.isPending ? 0.6 : 1,
              }}
            >{action.label}</button>
          ))}
          <span style={{ width: 1, height: 16, backgroundColor: `${WHITE}20` }} />
          <button
            onClick={clearSelection}
            style={{ padding: "6px 8px", borderRadius: 6, border: "none", backgroundColor: "transparent", color: WHITE, cursor: "pointer", fontSize: 11 }}
          >Clear</button>
        </div>
      )}
    </div>
  );
}

/* ─── Assign-to-division modal ─────────────────────────────────────────
 * Shown from the pipeline card ⋯ menu. CSO picks the division (Bizdoc /
 * Scalar / Medialy / Hub / Podcast / Video / Faceless), the lead's
 * assignedDepartment is set, the linked task moves to that department,
 * and an audit log + notification fire on the server side. */
function AssignDivisionModal({
  lead, isPending, onClose, onAssign,
}: {
  lead: any;
  isPending: boolean;
  onClose: () => void;
  onAssign: (department: string, alsoAdvance: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [alsoAdvance, setAlsoAdvance] = useState(true);

  const DIVISIONS = [
    { key: "bizdoc",    label: "Bizdoc",   sub: "Tax · Compliance · CAC · Licences",        accent: "#1B4D3E" },
    { key: "systemise", label: "Scalar",   sub: "Web · App · CRM · Automation · AI",        accent: "#A07A0E" },
    { key: "medialy",   label: "Medialy",  sub: "Brand · Social · Content · Reels",         accent: "#1D4ED8" },
    { key: "skills",    label: "Hub",      sub: "Tech training · Cohort · Certification",   accent: "#1E3A5F" },
    { key: "podcast",   label: "Podcast",  sub: "Episode planning · Recording · Editing",   accent: "#7C3AED" },
    { key: "video",     label: "Video",    sub: "Video projects · Editing · Color grading", accent: "#DB2777" },
    { key: "faceless",  label: "Faceless", sub: "AI content · Bulk video · Distribution",   accent: "#0891B2" },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: WHITE, borderRadius: 16, padding: 22,
          maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              Assign to division
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: INK, letterSpacing: -0.3 }}>
              {lead.name || lead.businessName || "Unnamed lead"}
            </h3>
            <p style={{ fontSize: 11, color: INK_MUTED, marginTop: 4 }}>
              {lead.service || "—"} · {lead.ref || `#${lead.id}`}
            </p>
            {lead.assignedDepartment && (
              <p style={{ fontSize: 10, color: INK_MUTED, marginTop: 4, fontStyle: "italic" }}>
                Currently assigned: {lead.assignedDepartment}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            width: 30, height: 30, borderRadius: 8,
            backgroundColor: NAV_HOVER, color: INK_MUTED, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={16} strokeWidth={1.75} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 14 }}>
          {DIVISIONS.map(d => {
            const selected = picked === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setPicked(d.key)}
                style={{
                  textAlign: "left", padding: 14, borderRadius: 12,
                  border: `${selected ? 2 : 1}px solid ${selected ? d.accent : HAIRLINE}`,
                  backgroundColor: selected ? `${d.accent}08` : WHITE,
                  cursor: "pointer", display: "flex", flexDirection: "column", gap: 4,
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: selected ? d.accent : INK }}>{d.label}</p>
                <p style={{ fontSize: 11, color: INK_MUTED, lineHeight: 1.4 }}>{d.sub}</p>
              </button>
            );
          })}
        </div>

        <label style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
          borderRadius: 10, border: `1px solid ${HAIRLINE}`, backgroundColor: WHITE,
          fontSize: 12, color: INK, cursor: "pointer", marginBottom: 14,
        }}>
          <input
            type="checkbox"
            checked={alsoAdvance}
            onChange={(e) => setAlsoAdvance(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: GREEN }}
          />
          <span>
            Also move pipeline stage to <strong>Closer call</strong>
            <span style={{ color: INK_MUTED }}> · use this when the close is imminent and you want the division to start preparing</span>
          </span>
        </label>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "10px 16px", borderRadius: 8, border: `1px solid ${HAIRLINE}`,
            backgroundColor: WHITE, color: INK, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
          <button
            onClick={() => picked && onAssign(picked, alsoAdvance)}
            disabled={!picked || isPending}
            style={{
              padding: "10px 22px", borderRadius: 8, border: "none",
              backgroundColor: picked ? GREEN : `${INK_MUTED}30`,
              color: picked ? GOLD : INK_MUTED,
              fontSize: 12, fontWeight: 700,
              cursor: picked && !isPending ? "pointer" : "not-allowed",
              opacity: isPending ? 0.7 : 1,
            }}
          >{isPending ? "Assigning…" : picked ? `Assign to ${DIVISIONS.find(d => d.key === picked)?.label}` : "Pick a division"}</button>
        </div>
      </div>
    </div>
  );
}

/** Single menu item used by the pipeline card ⋯ menu. */
function MenuItem({ icon, label, color, onClick, disabled }: {
  icon: React.ReactNode; label: string; color: string;
  onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 10px", borderRadius: 7,
        border: "none", backgroundColor: "transparent",
        color: disabled ? `${color}55` : color,
        fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = `${color}10`; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ── CUT 2026-04-25 — Subscriptions section (not in CSO 6-tab spec) removed (Phase 4 CSO Sales Dashboard 6-tab spec: Overview, Lead Pipeline, Closed Deals, Commission Tracker, Lead Sources, Calendar). ── */

/* ── CUT 2026-04-25 — Tasks section (not in CSO 6-tab spec) removed (Phase 4 CSO Sales Dashboard 6-tab spec: Overview, Lead Pipeline, Closed Deals, Commission Tracker, Lead Sources, Calendar). ── */

// 2026-04-30 — removed: _RemovedBackOffice (replaced by inbox/pipeline pattern)
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

/* 2026-04-26 founder decision: Audit Log view removed (not in spec). */


/* ═══════════════════════════════════════════════════════════════════════
 * CLIENT FORMS HUB — CSO copy-and-share links for WhatsApp
 * ═══════════════════════════════════════════════════════════════════════ */
function ClientFormsHub() {
  const FORMS = [
    {
      key: "bizdoc",
      division: "Bizdoc",
      category: "Tax & Compliance",
      accent: "#1B4D3E",
      path: "/bizdoc/assessment",
      whenToShare: "Client mentions tax, CAC, FIRS, compliance, TCC, SCUML, or penalties.",
      messageTemplate:
        "Hi {name}, good to hear from you. Before our Bizdoc team calls you, please complete this short assessment (3 min) — it helps us prescribe the right package: {link}",
    },
    {
      key: "scalar",
      division: "Scalar",
      category: "Web & Automation",
      accent: "#D4A017",
      path: "/scalar/assessment",
      whenToShare: "Client mentions website, CRM, automation, dashboards, AI chatbots, or WhatsApp systems.",
      messageTemplate:
        "Hi {name}, thanks for reaching out. So we can scope a proper plan, please fill this 4-min assessment — our Scalar team will review before we call you: {link}",
    },
    {
      key: "medialy",
      division: "Medialy",
      category: "Social Media",
      accent: "#1D4ED8",
      path: "/medialy/assessment",
      whenToShare: "Client mentions social media, content, Instagram, TikTok, reels, or paid ads.",
      messageTemplate:
        "Hi {name}, thanks for reaching out to Medialy. Quick 3-min assessment so we can design the right content plan for you: {link}",
    },
    {
      key: "hub",
      division: "HUB",
      category: "Tech Training",
      accent: "#1E3A5F",
      path: "/hub/enroll",
      whenToShare: "Client / student asks about courses, cohort dates, certifications, or team training.",
      messageTemplate:
        "Hi {name}, welcome to HAMZURY HUB. Please complete this 3-min enrolment — we'll match you to the right programme and cohort: {link}",
    },
  ] as const;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://hamzury.com";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied`),
      () => toast.error("Couldn't copy — select and copy manually"),
    );
  };

  return (
    <Card>
      <SectionTitle sub="Copy a link, paste into WhatsApp. Client fills → it lands back in CSO Pipeline as a new lead.">
        Client Forms
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {FORMS.map(f => {
          const fullLink = `${origin}${f.path}`;
          return (
            <div
              key={f.key}
              style={{
                backgroundColor: WHITE,
                borderRadius: 14,
                padding: 16,
                border: `1px solid ${DARK}08`,
                borderLeft: `3px solid ${f.accent}`,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div>
                <p style={{
                  fontSize: 10,
                  color: f.accent,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}>
                  {f.category}
                </p>
                <p style={{ fontSize: 16, fontWeight: 700, color: DARK, letterSpacing: -0.2 }}>
                  {f.division}
                </p>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                  <strong style={{ color: DARK }}>Share when:</strong> {f.whenToShare}
                </p>
              </div>

              <div style={{
                backgroundColor: `${DARK}05`,
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 11,
                fontFamily: "monospace",
                color: DARK,
                wordBreak: "break-all",
              }}>
                {fullLink}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => copy(fullLink, `${f.division} link`)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    backgroundColor: f.accent,
                    color: WHITE,
                    border: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    flex: 1,
                    minWidth: 100,
                  }}
                >
                  Copy Link
                </button>
                <button
                  onClick={() => copy(f.messageTemplate.replace("{link}", fullLink), `${f.division} message template`)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    backgroundColor: `${f.accent}12`,
                    color: f.accent,
                    border: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    flex: 1,
                    minWidth: 120,
                  }}
                >
                  Copy WhatsApp Msg
                </button>
                <a
                  href={fullLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    backgroundColor: "transparent",
                    color: MUTED,
                    border: `1px solid ${DARK}15`,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Preview →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{
        fontSize: 11,
        color: MUTED,
        marginTop: 16,
        lineHeight: 1.6,
        padding: "10px 12px",
        backgroundColor: `${GOLD}08`,
        borderRadius: 8,
        borderLeft: `3px solid ${GOLD}`,
      }}>
        <strong style={{ color: DARK }}>Tip:</strong> Swap {"{name}"} in the WhatsApp message template for the
        actual client name before sending. When the client submits, the lead appears in the
        Pipeline with source <code style={{ fontFamily: "monospace", color: GOLD }}>assessment_bizdoc</code> /{" "}
        <code style={{ fontFamily: "monospace", color: GOLD }}>assessment_scalar</code> etc. so you know where it came from.
      </p>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * REQUIREMENT FORMS HUB — the 24 post-payment intake forms.
 * 2026-04-30. CSO sends these AFTER payment is confirmed so the division
 * delivery team gets every detail they need to start work (CAC IDs, brand
 * assets, content briefs, etc.). Routes are wired in App.tsx and the
 * forms themselves live in client/src/lib/requirement-forms.ts.
 *
 * The link supports a ?ref= query so the form is pre-tied to the lead.
 * ═══════════════════════════════════════════════════════════════════════ */
function RequirementFormsHub() {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://hamzury.com";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied`),
      () => toast.error("Couldn't copy — select and copy manually"),
    );
  };

  type ReqForm = { id: RequirementFormId; name: string; division: "Bizdoc" | "Scalar" | "Medialy" | "Hub"; accent: string };

  const FORMS: ReqForm[] = [
    // Bizdoc (6)
    { id: "cac",              name: "CAC Business Registration", division: "Bizdoc",  accent: "#1B4D3E" },
    { id: "tin",              name: "Tax (TIN + FIRS)",          division: "Bizdoc",  accent: "#1B4D3E" },
    { id: "licences",         name: "Sector Licences",           division: "Bizdoc",  accent: "#1B4D3E" },
    { id: "plan",             name: "Business Plan",             division: "Bizdoc",  accent: "#1B4D3E" },
    { id: "trademark",        name: "Trademark Registration",    division: "Bizdoc",  accent: "#1B4D3E" },
    { id: "compliance",       name: "Ongoing Compliance",        division: "Bizdoc",  accent: "#1B4D3E" },
    // Scalar (6)
    { id: "website",          name: "Website / Web App",         division: "Scalar",  accent: "#D4A017" },
    { id: "crm",              name: "CRM Setup",                 division: "Scalar",  accent: "#D4A017" },
    { id: "ai_integration",   name: "AI Integration",            division: "Scalar",  accent: "#D4A017" },
    { id: "automation",       name: "Workflow Automation",       division: "Scalar",  accent: "#D4A017" },
    { id: "ecommerce",        name: "E-commerce",                division: "Scalar",  accent: "#D4A017" },
    { id: "software_mgmt",    name: "Software Management",       division: "Scalar",  accent: "#D4A017" },
    // Medialy (6)
    { id: "brand",            name: "Brand Identity",            division: "Medialy", accent: "#1D4ED8" },
    { id: "social",           name: "Social Media Management",   division: "Medialy", accent: "#1D4ED8" },
    { id: "podcast",          name: "Podcast Production",        division: "Medialy", accent: "#1D4ED8" },
    { id: "content_strategy", name: "Content Strategy",          division: "Medialy", accent: "#1D4ED8" },
    { id: "video",            name: "Video Production",          division: "Medialy", accent: "#1D4ED8" },
    { id: "media_mgmt",       name: "Media Management",          division: "Medialy", accent: "#1D4ED8" },
    // Hub (6)
    { id: "tech_training",    name: "Tech Skills Training",      division: "Hub",     accent: "#1E3A5F" },
    { id: "ai_business",      name: "AI for Business",           division: "Hub",     accent: "#1E3A5F" },
    { id: "entrepreneurship", name: "Entrepreneurship",          division: "Hub",     accent: "#1E3A5F" },
    { id: "team_training",    name: "Team Training",             division: "Hub",     accent: "#1E3A5F" },
    { id: "certification",    name: "Certification Programs",    division: "Hub",     accent: "#1E3A5F" },
    { id: "skills_mgmt",      name: "Skills Management",         division: "Hub",     accent: "#1E3A5F" },
  ];

  // Group by division for cleaner display
  const byDivision = FORMS.reduce((acc, f) => {
    (acc[f.division] ||= []).push(f);
    return acc;
  }, {} as Record<string, ReqForm[]>);

  const divisionOrder: Array<keyof typeof byDivision> = ["Bizdoc", "Scalar", "Medialy", "Hub"];

  const buildMessage = (f: ReqForm, link: string) =>
    `Hi {name}, payment received — thank you. Please complete this short ${f.division} requirements form so our delivery team has everything to start work right away (~5 mins): ${link}\n\nYour reference: {HMZ-REF}`;

  return (
    <Card>
      <SectionTitle sub="Send AFTER payment is confirmed. Each form collects the details the division team needs to start delivery — IDs for CAC, brand assets for Medialy, content briefs for Hub, etc.">
        Requirement Forms (post-payment)
      </SectionTitle>

      {divisionOrder.map(division => {
        const list = byDivision[division] || [];
        if (list.length === 0) return null;
        const accent = list[0].accent;
        return (
          <div key={division} style={{ marginBottom: 18 }}>
            <p style={{
              fontSize: 11, color: accent, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: 10, paddingBottom: 6,
              borderBottom: `1px solid ${accent}25`,
            }}>{division} ({list.length})</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              {list.map(f => {
                const link = `${origin}/requirements/${f.id}`;
                return (
                  <div key={f.id} style={{
                    padding: 12, borderRadius: 10,
                    backgroundColor: WHITE,
                    border: `1px solid ${DARK}08`, borderLeft: `3px solid ${accent}`,
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{f.name}</p>
                    <p style={{
                      fontSize: 10, fontFamily: "monospace", color: MUTED,
                      backgroundColor: `${DARK}05`, padding: "4px 6px", borderRadius: 5,
                      wordBreak: "break-all",
                    }}>/requirements/{f.id}</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                      <button
                        onClick={() => copy(link, `${f.name} link`)}
                        style={{
                          flex: 1, padding: "6px 10px", borderRadius: 6, border: "none",
                          backgroundColor: accent, color: WHITE, fontSize: 10, fontWeight: 700, cursor: "pointer",
                          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}
                      >Copy link</button>
                      <button
                        onClick={() => copy(buildMessage(f, link), `${f.name} message`)}
                        style={{
                          flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${HAIRLINE}`,
                          backgroundColor: WHITE, color: INK, fontSize: 10, fontWeight: 700, cursor: "pointer",
                        }}
                      >WhatsApp</button>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview"
                        style={{
                          width: 28, height: 26, borderRadius: 6,
                          border: `1px solid ${HAIRLINE}`, backgroundColor: WHITE, color: INK_MUTED,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          textDecoration: "none",
                        }}
                      ><ExternalLink size={11} /></a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p style={{
        fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.6,
        padding: "10px 12px", backgroundColor: `${GOLD}08`, borderRadius: 8, borderLeft: `3px solid ${GOLD}`,
      }}>
        <strong style={{ color: DARK }}>Workflow:</strong> Client pays → CSO sends the relevant requirement form
        link with the lead's <code style={{ fontFamily: "monospace", color: GOLD }}>?ref=HMZ-XX/X-XXXX</code> appended →
        client fills it → answers + uploads attach to the task → division ops sees everything before starting work.
      </p>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * REVENUE & COMMISSIONS — new tab, pulls from tRPC commissions + leads
 * 1) Closed Deals ledger (every won deal, row-by-row with 18% split)
 * 2) Monthly Earnings rollup (commission earned/paid/pending)
 * 3) Targets vs Actuals card
 * ═══════════════════════════════════════════════════════════════════════ */
function RevenueCommissionsSection() {
  const commissionsQuery = trpc.commissions.list.useQuery(undefined, { retry: false });
  const clientsQuery = trpc.clientTruth.list.useQuery();
  const leadsQuery = trpc.leads.list.useQuery();
  const commissions: any[] = Array.isArray(commissionsQuery.data) ? commissionsQuery.data : [];
  const clients: any[] = Array.isArray(clientsQuery.data) ? clientsQuery.data : [];
  const leads: any[] = Array.isArray(leadsQuery.data) ? leadsQuery.data : [];

  /* Closed deals: every commission row is a closed deal — the row carries
     the service, client, quotedPrice, commission, paymentStatus. */
  const closedDeals = useMemo(() => commissions.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ), [commissions]);

  /* Monthly earnings rollup */
  const byMonth = useMemo(() => {
    const map: Record<string, {
      month: string; deals: number; revenue: number;
      earned: number; paid: number; pending: number;
    }> = {};
    commissions.forEach(c => {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { month: key, deals: 0, revenue: 0, earned: 0, paid: 0, pending: 0 };
      const row = map[key];
      row.deals += 1;
      const quoted = parseFloat(c.quotedPrice || "0");
      const commission = quoted * 0.18; // CSO 18%
      row.revenue += quoted;
      row.earned += commission;
      if (c.status === "paid") row.paid += commission;
      else row.pending += commission;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [commissions]);

  const totalEarned = byMonth.reduce((a, m) => a + m.earned, 0);
  const totalPaid = byMonth.reduce((a, m) => a + m.paid, 0);
  const totalPending = byMonth.reduce((a, m) => a + m.pending, 0);
  const totalDeals = closedDeals.length;
  const totalRevenue = closedDeals.reduce((a, c) => a + parseFloat(c.quotedPrice || "0"), 0);

  /* Targets vs actuals (thisMonth) */
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = byMonth.find(m => m.month === thisMonthKey) || { deals: 0, revenue: 0, earned: 0, paid: 0, pending: 0 };
  const thisMonthLeads = leads.filter((l: any) => {
    const d = new Date(l.createdAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;
  const thisMonthQualified = leads.filter((l: any) => {
    const d = new Date(l.createdAt);
    const qualified = l.status === "qualified" || l.status === "converted" || (l.bantScore && l.bantScore >= 2);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && qualified;
  }).length;
  const conversionRate = thisMonthLeads > 0 ? Math.round((thisMonth.deals / thisMonthLeads) * 100) : 0;

  type Target = { label: string; target: string; actual: number | string; targetNum: number; unit: string };
  const targets: Target[] = [
    { label: "Leads",            target: "20+",   actual: thisMonthLeads,      targetNum: 20,        unit: "" },
    { label: "Qualified",        target: "15+",   actual: thisMonthQualified,  targetNum: 15,        unit: "" },
    { label: "Closed deals",     target: "5+",    actual: thisMonth.deals,     targetNum: 5,         unit: "" },
    { label: "Revenue brought",  target: "₦2M+",  actual: thisMonth.revenue,   targetNum: 2_000_000, unit: "₦" },
    { label: "Conversion",       target: "25%+",  actual: `${conversionRate}%`, targetNum: 25,       unit: "%" },
  ];

  const csoTone = (actual: number | string, targetNum: number) => {
    const n = typeof actual === "string" ? parseFloat(actual) : actual;
    if (isNaN(n)) return "#9CA3AF";
    if (n >= targetNum) return "#22C55E";
    if (n >= targetNum * 0.7) return GOLD;
    return "#EF4444";
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: DARK, letterSpacing: -0.2, margin: 0 }}>Revenue & Commissions</h2>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Closed deals ledger + monthly earnings + live vs targets.</p>
      </div>

      {/* Targets vs Actuals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {targets.map(t => {
          const color = csoTone(t.actual as any, t.targetNum);
          const display = typeof t.actual === "number" && t.unit === "₦" ? fmtNaira(t.actual) : String(t.actual);
          return (
            <div key={t.label} style={{ padding: 14, borderRadius: 12, backgroundColor: WHITE, border: `1px solid ${DARK}08`, borderLeft: `3px solid ${color}` }}>
              <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color, marginTop: 6 }}>{display}</p>
              <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>Target: {t.target}</p>
            </div>
          );
        })}
      </div>

      {/* Rollup KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        <Card><p style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Closed deals</p><p style={{ fontSize: 22, fontWeight: 700, color: DARK, marginTop: 4 }}>{totalDeals}</p></Card>
        <Card><p style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Revenue brought</p><p style={{ fontSize: 22, fontWeight: 700, color: GOLD, marginTop: 4 }}>{fmtNaira(totalRevenue)}</p></Card>
        <Card><p style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Commission earned</p><p style={{ fontSize: 22, fontWeight: 700, color: GREEN, marginTop: 4 }}>{fmtNaira(totalEarned)}</p></Card>
        <Card><p style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Paid</p><p style={{ fontSize: 22, fontWeight: 700, color: "#22C55E", marginTop: 4 }}>{fmtNaira(totalPaid)}</p></Card>
        <Card><p style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Pending</p><p style={{ fontSize: 22, fontWeight: 700, color: "#F59E0B", marginTop: 4 }}>{fmtNaira(totalPending)}</p></Card>
      </div>

      {/* Monthly Earnings chart */}
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>Monthly Earnings — 12 Month View</p>
        {byMonth.length === 0 ? <EmptyState icon={DollarSign} title="No commission data yet" /> : (
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${DARK}10`} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} />
                <RTooltip formatter={(v: any) => fmtNaira(v)} />
                <Bar dataKey="earned" fill={GREEN} name="Earned" />
                <Bar dataKey="paid"   fill="#22C55E" name="Paid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Monthly table */}
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>Monthly Earnings — Breakdown</p>
        {byMonth.length === 0 ? <EmptyState icon={DollarSign} title="No data yet" /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ backgroundColor: `${GOLD}08` }}>{["Month", "Deals", "Revenue", "Commission Earned", "Paid", "Pending"].map(c => <th key={c} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: DARK }}>{c}</th>)}</tr></thead>
              <tbody>{byMonth.slice().reverse().map(m => (
                <tr key={m.month} style={{ borderTop: `1px solid ${DARK}06` }}>
                  <td style={{ padding: "10px 12px", color: DARK, fontWeight: 600 }}>{m.month}</td>
                  <td style={{ padding: "10px 12px", color: DARK }}>{m.deals}</td>
                  <td style={{ padding: "10px 12px", color: DARK, fontWeight: 600 }}>{fmtNaira(m.revenue)}</td>
                  <td style={{ padding: "10px 12px", color: GREEN, fontWeight: 600 }}>{fmtNaira(m.earned)}</td>
                  <td style={{ padding: "10px 12px", color: "#22C55E" }}>{fmtNaira(m.paid)}</td>
                  <td style={{ padding: "10px 12px", color: "#F59E0B" }}>{fmtNaira(m.pending)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Closed Deals Ledger */}
      <Card>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 4 }}>Closed Deals Ledger</p>
        <p style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Every won deal, with 18% CSO commission calculated live.</p>
        {closedDeals.length === 0 ? <EmptyState icon={CheckCircle2} title="No closed deals yet" hint="Wins will appear here automatically." /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ backgroundColor: `${GOLD}08` }}>{["Date", "Client", "Service", "Revenue", "CSO 18%", "Status"].map(c => <th key={c} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: DARK }}>{c}</th>)}</tr></thead>
              <tbody>{closedDeals.map((c: any) => {
                const quoted = parseFloat(c.quotedPrice || "0");
                const commission = quoted * 0.18;
                const client = clients.find((cl: any) => cl.id === c.clientId);
                return (
                  <tr key={c.id} style={{ borderTop: `1px solid ${DARK}06` }}>
                    <td style={{ padding: "10px 12px", color: MUTED, fontSize: 11 }}>{fmtDate(c.createdAt)}</td>
                    <td style={{ padding: "10px 12px", color: DARK, fontWeight: 600 }}>{client?.businessName || c.clientName || `Client #${c.clientId}`}</td>
                    <td style={{ padding: "10px 12px", color: DARK }}>{c.service || "—"}</td>
                    <td style={{ padding: "10px 12px", color: DARK, fontWeight: 600 }}>{fmtNaira(quoted)}</td>
                    <td style={{ padding: "10px 12px", color: GREEN, fontWeight: 700 }}>{fmtNaira(commission)}</td>
                    <td style={{ padding: "10px 12px" }}><Pill status={c.status === "paid" ? "active" : c.status === "approved" ? "accepted" : "new"} /></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

