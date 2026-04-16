import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Users, Handshake, Megaphone, Gift, Award,
  Calendar as CalendarIcon, LogOut, ArrowLeft, Loader2,
  TrendingUp, AlertCircle, Menu, X, Plus, Shield, Briefcase,
  Target as TargetIcon, CheckCircle2, Clock, Trash2, Send,
  Folder, ChevronRight, ExternalLink, DollarSign,
} from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY BIZDEV PORTAL — Growth Engine Control
 * Private, role-gated (founder, ceo, bizdev, bizdev_staff).
 * Visual parity with CEOPortal + CSOPortal.
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
const PURPLE = "#8B5CF6";

type Section =
  | "dashboard" | "affiliates" | "leads" | "partnerships"
  | "campaigns" | "grants" | "sponsorships" | "tasks"
  | "calendar" | "backoffice";

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
    green:  { bg: "#22C55E15", fg: "#22C55E" },
    gold:   { bg: `${GOLD}20`,  fg: GOLD },
    red:    { bg: `${RED}15`,   fg: RED },
    blue:   { bg: `${BLUE}15`,  fg: BLUE },
    muted:  { bg: "#9CA3AF25",  fg: MUTED },
    orange: { bg: `${ORANGE}15`, fg: ORANGE },
    purple: { bg: `${PURPLE}15`, fg: PURPLE },
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

function ComingSoonCard({ title, description, backend }: { title: string; description: string; backend: string }) {
  return (
    <div>
      <SectionTitle sub={description}>{title}</SectionTitle>
      <Card>
        <div style={{ textAlign: "center", padding: "48px 16px" }}>
          <Clock size={36} style={{ color: GOLD, opacity: 0.5, marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: DARK, fontWeight: 600, marginBottom: 8 }}>Coming in Phase B</p>
          <p style={{ fontSize: 12, color: MUTED, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            {backend}
          </p>
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN
 * ═══════════════════════════════════════════════════════════════════════ */
export default function BizDevPortal() {
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
    { key: "dashboard",    icon: LayoutDashboard, label: "Growth Dashboard" },
    { key: "leads",        icon: TrendingUp,      label: "Leads & Sources" },
    { key: "affiliates",   icon: Award,           label: "Affiliates" },
    { key: "partnerships", icon: Handshake,       label: "Partnerships" },
    { key: "campaigns",    icon: Megaphone,       label: "Campaigns" },
    { key: "grants",       icon: Gift,            label: "Grants" },
    { key: "sponsorships", icon: DollarSign,      label: "Sponsorships" },
    { key: "tasks",        icon: Briefcase,       label: "My Tasks" },
    { key: "calendar",     icon: CalendarIcon,    label: "Outreach Calendar" },
    { key: "backoffice",   icon: Folder,          label: "Back Office" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PageMeta title="BizDev Portal — HAMZURY" description="HAMZURY Business Development — growth, partnerships, and affiliate operations." />

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
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>BizDev Portal</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>Growth Engine</div>
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
            ><X size={16} /></button>
          )}
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(({ key, icon: Icon, label }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => { setActive(key); if (isMobile) setMobileNavOpen(false); }}
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
            borderRadius: 10, color: `${GOLD}60`, fontSize: 12, textDecoration: "none", marginBottom: 2,
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
          ><LogOut size={13} /> Sign Out</button>
        </div>
      </aside>

      <main style={{
        flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
        width: isMobile ? "100%" : "auto",
      }}>
        <header style={{
          padding: isMobile ? "12px 16px" : "14px 28px",
          backgroundColor: WHITE, borderBottom: `1px solid ${DARK}08`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
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
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              ><Menu size={18} /></button>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {NAV.find(n => n.key === active)?.label}
              </p>
              <p style={{
                fontSize: 13, color: DARK, fontWeight: 500, marginTop: 2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{user.name} · Business Development</p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${GOLD}15`, color: GOLD, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
            GROWTH
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {active === "dashboard"    && <DashboardSection onGoto={setActive} />}
            {active === "leads"        && <LeadsSection />}
            {active === "affiliates"   && <AffiliatesSection />}
            {active === "partnerships" && <PartnershipsSection />}
            {active === "tasks"        && <TasksSection />}
            {active === "calendar"     && <CalendarSection />}
            {active === "campaigns"    && <ComingSoonCard
              title="Campaigns"
              description="Campaign register, objectives, CTA, budget, leads generated."
              backend="Requires a new 'campaigns' table: objective, owner, target audience, CTA, budget, status, leads_generated. Once added you'll see campaigns listed here and tied to leads via campaignId." />}
            {active === "grants"       && <ComingSoonCard
              title="Grants"
              description="Grant opportunity register, deadlines, application stages."
              backend="Requires a new 'grants' table: opportunity, provider, deadline, application_stage, documents, submission_status, reporting_obligations." />}
            {active === "sponsorships" && <ComingSoonCard
              title="Sponsorships"
              description="Sponsor target list, deck status, expected value, follow-ups."
              backend="Requires a new 'sponsorships' table: target, stage, deck_sent, follow_up_date, expected_value, status, closed_lost_reason." />}
            {active === "backoffice"   && <ComingSoonCard
              title="Back Office"
              description="Templates, scripts, campaign briefs, outreach standards."
              backend="Can reuse the existing 'documents' table or a new 'bizdevTemplates' table. Will hold reusable outreach messages, pitch brief templates, and campaign playbooks." />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 1. DASHBOARD — Growth KPIs + priorities
 * ═══════════════════════════════════════════════════════════════════════ */
function DashboardSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const leadsQuery = trpc.leads.list.useQuery(undefined, { retry: false });
  const affQuery = trpc.affiliate.listAll.useQuery(undefined, { retry: false });
  const partQuery = trpc.partnerships.list.useQuery(undefined, { retry: false });
  const tasksQuery = trpc.tasks.myTasks.useQuery(undefined, { retry: false });

  const leads = (leadsQuery.data || []) as any[];
  const affiliates = (affQuery.data || []) as any[];
  const partnerships = (partQuery.data || []) as any[];
  const tasks = (tasksQuery.data || []) as any[];

  const newLeads = leads.filter(l => l.status === "new").length;
  const qualified = leads.filter(l => l.status === "contacted" || l.status === "converted").length;
  const converted = leads.filter(l => l.status === "converted").length;
  const conversionRate = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  const activeAffiliates = affiliates.filter(a => a.status === "active").length;
  const activePartnerships = partnerships.filter(p => p.stage === "active" || p.stage === "negotiating").length;

  const overdueTasks = tasks.filter(t => {
    if (t.status === "Completed") return false;
    if (!t.deadline) return false;
    try { return new Date(t.deadline) < new Date(); } catch { return false; }
  }).length;

  const kpis = [
    { label: "New Leads",         value: newLeads,            icon: TrendingUp,  color: BLUE,   section: "leads" as Section },
    { label: "Qualified",         value: qualified,           icon: CheckCircle2, color: GREEN,  section: "leads" as Section },
    { label: "Conversion %",      value: `${conversionRate}%`, icon: Award,       color: GOLD,   section: "leads" as Section },
    { label: "Active Affiliates", value: activeAffiliates,    icon: Award,       color: PURPLE, section: "affiliates" as Section },
    { label: "Partnerships",      value: activePartnerships,  icon: Handshake,   color: ORANGE, section: "partnerships" as Section },
    { label: "Overdue Tasks",     value: overdueTasks,        icon: AlertCircle, color: RED,    section: "tasks" as Section },
  ];

  return (
    <div>
      <SectionTitle sub="Growth at a glance — leads, affiliates, partnerships, and overdue items.">
        Growth Dashboard
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={() => onGoto(k.section)}
            style={{
              backgroundColor: WHITE, borderRadius: 14, padding: "14px 12px",
              border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              textAlign: "left", cursor: "pointer", minWidth: 0, overflow: "hidden",
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

      {/* Today's priorities = new unassigned leads + overdue tasks */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <AlertCircle size={14} style={{ color: ORANGE }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Today's Priorities
          </p>
        </div>

        {leads.filter(l => l.status === "new").length === 0 && overdueTasks === 0 ? (
          <EmptyState icon={CheckCircle2} title="Inbox zero" hint="No new leads to triage and no overdue tasks." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leads.filter(l => l.status === "new").slice(0, 5).map((l: any) => (
              <div key={l.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {l.name || l.contactName || "Unknown"}
                    <span style={{ color: MUTED, fontWeight: 400 }}> · {l.businessName || "—"}</span>
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {l.source || "direct"} · {fmtDate(l.createdAt)}
                  </p>
                </div>
                <StatusPill label="new lead" tone="blue" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2. LEADS & SOURCES
 * ═══════════════════════════════════════════════════════════════════════ */
function LeadsSection() {
  const isMobile = useIsMobile();
  const listQuery = trpc.leads.list.useQuery(undefined, { retry: false });
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const all = (listQuery.data || []) as any[];
  const statusFiltered = filter === "all" ? all : all.filter(l => l.status === filter);
  const filtered = statusFiltered.filter(l =>
    !search ||
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  const counts = {
    new:       all.filter(l => l.status === "new").length,
    contacted: all.filter(l => l.status === "contacted").length,
    converted: all.filter(l => l.status === "converted").length,
    archived:  all.filter(l => l.status === "archived").length,
  };

  /* Source attribution map */
  const sources = all.reduce<Record<string, number>>((acc, l) => {
    const key = l.referralSourceType || l.source || "direct";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted"> = {
    new: "blue", contacted: "gold", converted: "green", archived: "muted",
  };

  return (
    <div>
      <SectionTitle sub="All leads with source attribution — see which channel converts best.">
        Leads & Sources
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="New"        value={counts.new}       color={BLUE} />
        <MiniStat label="Contacted"  value={counts.contacted} color={GOLD} />
        <MiniStat label="Converted"  value={counts.converted} color={GREEN} />
        <MiniStat label="Archived"   value={counts.archived}  color={MUTED} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Source Attribution
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(sources).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
            <div key={src} style={{
              padding: "6px 12px", borderRadius: 20, backgroundColor: BG,
              border: `1px solid ${DARK}08`, fontSize: 11, color: DARK,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ color: MUTED }}>{src}</span>
              <span style={{ fontWeight: 700, color: GOLD }}>{count}</span>
            </div>
          ))}
          {Object.keys(sources).length === 0 && <span style={{ fontSize: 11, color: MUTED }}>No source data yet.</span>}
        </div>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["all", "new", "contacted", "converted", "archived"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 10px", borderRadius: 8,
                  backgroundColor: filter === f ? GREEN : "transparent",
                  color: filter === f ? WHITE : MUTED,
                  border: `1px solid ${filter === f ? GREEN : `${DARK}15`}`,
                  fontSize: 10, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.04em",
                }}
              >{f}</button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search name, business…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(), width: isMobile ? "100%" : 220 }}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={TrendingUp} title="No leads match." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 60).map(l => (
            <Card key={l.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                    {l.name || l.contactName || "Unknown"}
                  </p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{l.businessName || "—"}</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", fontSize: 10, color: MUTED }}>
                    {l.email && <span>{l.email}</span>}
                    {l.phone && <span>{l.phone}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
                  <StatusPill label={l.status} tone={STATUS_TONE[l.status] || "muted"} />
                  {(l.referralSourceType || l.source) && (
                    <span style={{
                      padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                      backgroundColor: `${GOLD}20`, color: GOLD, textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>{l.referralSourceType || l.source}</span>
                  )}
                </div>
              </div>
              {(l.notes || l.referrerName) && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${DARK}06`, fontSize: 11, color: MUTED }}>
                  {l.referrerName && <p>Referred by <strong style={{ color: DARK }}>{l.referrerName}</strong></p>}
                  {l.notes && <p style={{ marginTop: 4, fontStyle: "italic" }}>{l.notes.slice(0, 140)}</p>}
                </div>
              )}
              <p style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>
                {fmtDate(l.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3. AFFILIATES
 * ═══════════════════════════════════════════════════════════════════════ */
function AffiliatesSection() {
  const isMobile = useIsMobile();
  const listQuery = trpc.affiliate.listAll.useQuery(undefined, { retry: false });
  const [search, setSearch] = useState("");

  const all = (listQuery.data || []) as any[];
  const filtered = all.filter(a =>
    !search ||
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.referralCode?.toLowerCase().includes(search.toLowerCase())
  );

  const active = all.filter(a => a.status === "active").length;
  const pending = all.filter(a => a.status === "pending").length;
  const suspended = all.filter(a => a.status === "suspended").length;

  const TIER_TONE: Record<string, "green" | "gold" | "muted" | "purple"> = {
    platinum: "purple", gold: "gold", silver: "muted", bronze: "green",
  };
  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "muted"> = {
    active: "green", pending: "gold", suspended: "red", archived: "muted",
  };

  // Top 10 by lifetime earnings (assuming totalEarnings field)
  const top = [...all]
    .filter(a => a.status === "active")
    .sort((a, b) => parseFloat(b.totalEarnings || 0) - parseFloat(a.totalEarnings || 0))
    .slice(0, 10);

  return (
    <div>
      <SectionTitle sub="Affiliate register, tier watch, top referrer leaderboard.">
        Affiliates
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Active"    value={active}    color={GREEN} />
        <MiniStat label="Pending"   value={pending}   color={GOLD} />
        <MiniStat label="Suspended" value={suspended} color={RED} />
        <MiniStat label="Total"     value={all.length} color={MUTED} />
      </div>

      {top.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Top 10 Referrers — Lifetime Earnings
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {top.map((a, i) => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 10px", borderRadius: 8,
                backgroundColor: i < 3 ? `${GOLD}08` : BG,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: i < 3 ? GOLD : MUTED, width: 20 }}>
                    #{i + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: DARK }}>{a.name}</p>
                    <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{a.referralCode}</p>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>
                  {fmtNaira(a.totalEarnings || 0)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Register — {filtered.length}
          </p>
          <input
            type="search"
            placeholder="Search name, email, code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(), width: isMobile ? "100%" : 240 }}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Award} title="No affiliates match." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 60).map((a: any) => (
            <Card key={a.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.name}</p>
                    <StatusPill label={a.status} tone={STATUS_TONE[a.status] || "muted"} />
                    {a.tier && <StatusPill label={a.tier} tone={TIER_TONE[a.tier] || "muted"} />}
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2, fontFamily: "monospace" }}>
                    {a.referralCode}
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap", fontSize: 10, color: MUTED }}>
                    <span>{a.email}</span>
                    {a.phone && <span>{a.phone}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>
                    {fmtNaira(a.totalEarnings || 0)}
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {a.totalReferrals || 0} referrals
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 4. PARTNERSHIPS
 * ═══════════════════════════════════════════════════════════════════════ */
function PartnershipsSection() {
  const utils = trpc.useUtils();
  const listQuery = trpc.partnerships.list.useQuery(undefined, { retry: false });
  const [creating, setCreating] = useState(false);

  const all = (listQuery.data || []) as any[];

  const STAGE_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    prospecting: "muted", negotiating: "blue", active: "green",
    paused: "orange", ended: "red",
  };

  const byStage = {
    prospecting: all.filter(p => p.stage === "prospecting").length,
    negotiating: all.filter(p => p.stage === "negotiating").length,
    active: all.filter(p => p.stage === "active").length,
    paused: all.filter(p => p.stage === "paused").length,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Target partner list, stage, contact, next meeting, MOU status.">
          Partnerships
        </SectionTitle>
        <button
          onClick={() => setCreating(true)}
          style={{
            padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
            border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={14} /> New Partnership
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Prospecting"  value={byStage.prospecting} color={MUTED} />
        <MiniStat label="Negotiating"  value={byStage.negotiating} color={BLUE} />
        <MiniStat label="Active"       value={byStage.active}      color={GREEN} />
        <MiniStat label="Paused"       value={byStage.paused}      color={ORANGE} />
      </div>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          All Partnerships — {all.length}
        </p>
        {all.length === 0 ? (
          <EmptyState icon={Handshake} title="No partnerships yet" hint="Click ‘New Partnership’ to add the first one." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {all.map((p: any) => (
              <div key={p.id} style={{
                padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{p.name}</p>
                      {p.stage && <StatusPill label={p.stage} tone={STAGE_TONE[p.stage] || "muted"} />}
                      {p.type && <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em" }}>{p.type}</span>}
                    </div>
                    {p.contact && <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Contact: {p.contact}</p>}
                    {p.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 4, fontStyle: "italic" }}>{p.notes.slice(0, 160)}</p>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {p.referrals !== undefined && (
                      <p style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>
                        {p.referrals} refs
                      </p>
                    )}
                    {p.updatedAt && (
                      <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{fmtDate(p.updatedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {creating && (
        <NewPartnershipModal
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); utils.partnerships.list.invalidate(); }}
        />
      )}
    </div>
  );
}

function NewPartnershipModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("referral");
  const [contact, setContact] = useState("");
  const [stage, setStage] = useState<"prospecting" | "negotiating" | "active" | "paused" | "ended">("prospecting");
  const [notes, setNotes] = useState("");

  const createMut = trpc.partnerships.create.useMutation({
    onSuccess: () => { toast.success("Partnership added"); onCreated(); },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name required"); return; }
    createMut.mutate({ name, type, contact: contact || undefined, stage, notes: notes || undefined } as any);
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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK }}>New Partnership</h3>

        <Field label="Partner name">
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle()} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Type">
            <select value={type} onChange={e => setType(e.target.value)} style={inputStyle()}>
              <option value="referral">Referral</option>
              <option value="technology">Technology</option>
              <option value="distribution">Distribution</option>
              <option value="media">Media</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Stage">
            <select value={stage} onChange={e => setStage(e.target.value as any)} style={inputStyle()}>
              <option value="prospecting">Prospecting</option>
              <option value="negotiating">Negotiating</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </Field>
        </div>

        <Field label="Contact person (optional)">
          <input value={contact} onChange={e => setContact(e.target.value)} style={inputStyle()}
            placeholder="Name + email/phone" />
        </Field>

        <Field label="Notes (optional)">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
              border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={createMut.isPending}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: GREEN, color: WHITE,
              border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {createMut.isPending ? "Saving…" : "Add Partnership"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 5. TASKS (BizDev dept filtered)
 * ═══════════════════════════════════════════════════════════════════════ */
function TasksSection() {
  const myTasksQuery = trpc.tasks.myTasks.useQuery(undefined, { retry: false });
  const rows = (myTasksQuery.data || []) as any[];

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    "Not Started": "muted", "In Progress": "blue", "Waiting on Client": "orange",
    "Submitted": "gold", "Completed": "green",
  };

  const buckets = {
    active:    rows.filter(r => r.status === "In Progress" || r.status === "Waiting on Client"),
    pending:   rows.filter(r => r.status === "Not Started"),
    done:      rows.filter(r => r.status === "Completed"),
  };

  return (
    <div>
      <SectionTitle sub="Tasks in your department — focus on what's blocking growth.">
        My Tasks
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Active"      value={buckets.active.length}  color={BLUE} />
        <MiniStat label="Not Started" value={buckets.pending.length} color={MUTED} />
        <MiniStat label="Completed"   value={buckets.done.length}    color={GREEN} />
      </div>

      {rows.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No tasks assigned" hint="Your BizDev tasks will appear here." /></Card>
      ) : (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 50).map((t: any) => (
              <div key={t.id} style={{
                padding: "10px 12px", borderRadius: 10, backgroundColor: BG,
                display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {t.service || t.clientName}
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2, fontFamily: "monospace" }}>
                    {t.ref} · {t.clientName}
                  </p>
                  {t.deadline && (
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      Due {fmtDate(t.deadline)}
                    </p>
                  )}
                </div>
                <StatusPill label={t.status} tone={STATUS_TONE[t.status] || "muted"} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 6. CALENDAR — Outreach rhythm
 * ═══════════════════════════════════════════════════════════════════════ */
function CalendarSection() {
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
  const events = (calQuery.data || []) as any[];

  const TYPE_COLOR: Record<string, string> = {
    meeting: BLUE, follow_up: ORANGE, deadline: RED, renewal: GOLD, internal: GREEN, other: MUTED,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle sub="Daily outreach plan, campaign dates, grant deadlines, follow-ups.">
          Outreach Calendar
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

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Upcoming — Next 60 Days
        </p>
        {events.length === 0 ? (
          <EmptyState icon={CalendarIcon} title="No scheduled events" hint="Add meetings, follow-ups, deadlines from here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {events.slice(0, 30).map((ev: any) => (
              <div key={ev.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", backgroundColor: BG, borderRadius: 8, gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 4, flexShrink: 0,
                    backgroundColor: TYPE_COLOR[ev.eventType] || MUTED,
                  }} />
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

      {creating && (
        <NewEventModal
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); utils.calendar.list.invalidate(); }}
        />
      )}
    </div>
  );
}

function NewEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState(() => {
    const d = new Date(); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [eventType, setEventType] = useState<"meeting" | "follow_up" | "deadline" | "renewal" | "internal" | "other">("meeting");
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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK }}>New Outreach Event</h3>

        <Field label="Title">
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle()} />
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
          <input value={location} onChange={e => setLocation(e.target.value)} style={inputStyle()} />
        </Field>

        <Field label="Description (optional)">
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            style={{ ...inputStyle(), resize: "vertical" }} />
        </Field>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 14px", borderRadius: 10, backgroundColor: "transparent", color: MUTED,
              border: `1px solid ${DARK}15`, fontSize: 12, cursor: "pointer" }}>Cancel</button>
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
