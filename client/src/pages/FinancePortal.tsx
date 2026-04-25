import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Receipt, DollarSign, PiggyBank, Award, TrendingUp,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle,
  Menu, X, Shield, Send, Wallet, Activity, Landmark, FileText, CreditCard,
  Plus, Trash2, Calendar as CalendarIcon, Copy, Archive,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, Cell,
} from "recharts";
import { toast } from "sonner";

/* 2026-04 founder decision: 1 section (monthly report archive) was on
   localStorage and removed for launch. Restored 2026-04 — now backed by
   MySQL via tRPC `financeOps.monthlyReports.*`
   (server/financeOps/router.ts). */

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY FINANCE PORTAL — Abubakar + senior staff.
 * Mirrors CEO/CSO portal design. Staff surface (green/gold legacy).
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
  | "dashboard" | "invoices" | "payments" | "allocations"
  | "commissions" | "aifund" | "reports" | "reportArchive"
  | "bankrecon" | "taxfilings" | "expenses"
  | "calendar";

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

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN
 * ═══════════════════════════════════════════════════════════════════════ */
export default function FinancePortal() {
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
    { key: "invoices",    icon: Receipt,         label: "Invoices" },
    { key: "payments",    icon: DollarSign,      label: "Payments In" },
    { key: "expenses",    icon: CreditCard,      label: "Expenses" },
    { key: "bankrecon",   icon: Landmark,        label: "Bank Reconciliation" },
    { key: "commissions", icon: Award,           label: "Commissions (40/60)" },
    { key: "allocations", icon: PiggyBank,       label: "Allocations (50/30/20)" },
    { key: "taxfilings",  icon: FileText,        label: "Tax Filings" },
    { key: "aifund",      icon: Activity,        label: "AI Fund" },
    { key: "reports",     icon: TrendingUp,      label: "Monthly Report" },
    { key: "reportArchive", icon: Archive,       label: "Report Archive" },
    { key: "calendar",    icon: CalendarIcon,    label: "Finance Calendar" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PageMeta title="Finance Portal — HAMZURY" description="Finance operations — invoices, payments, 50/30/20 allocations, commissions, AI fund." />

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
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>Finance Portal</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>Money In · Money Out</div>
          </div>
          {isMobile && (
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu"
              style={{
                width: 30, height: 30, borderRadius: 8,
                backgroundColor: `${GOLD}15`, color: GOLD, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><X size={16} /></button>
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
                {user.name} · Finance
              </p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${GREEN}10`, color: GREEN, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> FINANCE
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {active === "dashboard"   && <OverviewSection onGoto={setActive} />}
            {active === "invoices"    && <InvoicesSection />}
            {active === "payments"    && <PaymentsSection />}
            {active === "expenses"    && <ExpensesSection />}
            {active === "bankrecon"   && <BankReconSection />}
            {active === "commissions" && <CommissionsSection />}
            {active === "allocations" && <AllocationsSection />}
            {active === "taxfilings"  && <TaxFilingsSection />}
            {active === "aifund"      && <AIFundSection />}
            {active === "reports"     && <ReportsSection />}
            {active === "reportArchive" && <ReportArchiveSection />}
            {active === "calendar"        && <FinanceCalendarSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 1. OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════ */
function OverviewSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const rev = trpc.commissions.revenueStats.useQuery(undefined, { retry: false });
  const aiFund = trpc.finance.aiFund.useQuery(undefined, { retry: false });
  const allocations = trpc.finance.allocations.useQuery(undefined, { retry: false });
  const invoicesQ = trpc.invoices.list.useQuery(undefined, { retry: false });

  const r = rev.data;
  const invoices = (invoicesQ.data || []) as any[];
  const paid = invoices.filter(i => i.status === "paid").length;
  const pending = invoices.filter(i => i.status === "sent" || i.status === "draft").length;
  const overdue = invoices.filter(i => {
    if (i.status === "paid") return false;
    if (!i.dueDate) return false;
    try { return new Date(i.dueDate) < new Date(); } catch { return false; }
  }).length;

  /* ─── Finance success metrics per Ops Guide ────────────────
     · Payment collection rate >90% (paid / total billable)
     · Overdue invoices <10% of total
     · Tax filings 100% on time (proxy: no overdue bizdoc filings)
   ───────────────────────────────────────────────────────────*/
  const totalBillable = invoices.filter(i => i.status !== "cancelled").length;
  const collectionRate = totalBillable > 0 ? Math.round((paid / totalBillable) * 100) : 0;
  const overduePct = totalBillable > 0 ? Math.round((overdue / totalBillable) * 100) : 0;
  const collectionOk = collectionRate >= 90;
  const overdueOk = overduePct <= 10;

  const kpis = [
    { label: "Revenue (Paid)",  value: fmtNaira(r?.totalRevenue),    icon: DollarSign, color: GREEN,  section: "payments" as Section },
    { label: "Pending Revenue", value: fmtNaira(r?.pendingRevenue),  icon: Clock,      color: ORANGE, section: "invoices" as Section },
    { label: "AI Fund Balance", value: fmtNaira(aiFund.data?.balance), icon: Activity, color: PURPLE, section: "aifund" as Section },
    { label: "Invoices Paid",   value: paid,                         icon: CheckCircle2, color: GREEN, section: "invoices" as Section },
    { label: "Invoices Pending",value: pending,                      icon: Receipt,    color: GOLD,   section: "invoices" as Section },
    { label: "Overdue",         value: overdue,                      icon: AlertCircle, color: RED,   section: "invoices" as Section },
  ];

  return (
    <div>
      <SectionTitle sub="Money in, money out. Live data — no mock numbers.">
        Finance Overview
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 20 }}>
        {kpis.map(k => (
          <button key={k.label} onClick={() => onGoto(k.section)}
            style={{
              backgroundColor: WHITE, borderRadius: 14, padding: "14px 12px",
              border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              textAlign: "left", cursor: "pointer", minWidth: 0, overflow: "hidden",
            }}>
            <k.icon size={14} style={{ color: k.color, marginBottom: 8 }} />
            <p style={{
              fontSize: typeof k.value === "string" ? 14 : 20, fontWeight: 700, color: DARK, lineHeight: 1.15,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{k.value}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{k.label}</p>
          </button>
        ))}
      </div>

      {/* Success metrics per Finance Ops Guide */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Success Metrics
        </p>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
          <MetricBar
            label="Payment Collection Rate"
            target="≥ 90%"
            value={collectionRate}
            ok={collectionOk}
            display={`${collectionRate}%`}
          />
          <MetricBar
            label="Overdue Invoices"
            target="≤ 10%"
            value={overduePct}
            ok={overdueOk}
            display={`${overduePct}%`}
            inverse
          />
          <MetricBar
            label="Monthly Report Status"
            target="5th of month"
            value={new Date().getDate() <= 5 ? 100 : 50}
            ok={new Date().getDate() <= 5}
            display={new Date().getDate() <= 5 ? "On time" : "Due"}
          />
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Revenue — Last 6 Months
        </p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={r?.monthlyRevenue || []} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${DARK}0A`} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} />
              <YAxis tick={{ fontSize: 10, fill: MUTED }} />
              <RTooltip formatter={(v: any) => fmtNaira(v)} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {(r?.monthlyRevenue || []).map((_: any, i: number) => (
                  <Cell key={i} fill={i === (r?.monthlyRevenue?.length || 0) - 1 ? GOLD : GREEN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Recent Allocations
        </p>
        {(allocations.data || []).length === 0 ? (
          <EmptyState icon={PiggyBank} title="No allocations yet" hint="Every confirmed payment splits 50/30/20 and lands here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {((allocations.data || []) as any[]).slice(0, 8).map((a: any) => (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", backgroundColor: BG, borderRadius: 8, flexWrap: "wrap", gap: 8,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{a.clientName || "—"}</p>
                  <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{a.transactionRef}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>{fmtNaira(a.totalAmount)}</span>
                <StatusPill label={a.status} tone={a.status === "paid" ? "green" : a.status === "approved" ? "gold" : "muted"} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2. INVOICES
 * ═══════════════════════════════════════════════════════════════════════ */
function InvoicesSection() {
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const listQ = trpc.invoices.list.useQuery(undefined, { retry: false });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const all = (listQ.data || []) as any[];
  const filtered = all
    .filter(i => filter === "all" || i.status === filter)
    .filter(i =>
      !search ||
      i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName?.toLowerCase().includes(search.toLowerCase())
    );

  const markPaidMut = trpc.invoices.markPaid.useMutation({
    onSuccess: () => { toast.success("Invoice marked paid"); utils.invoices.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  /** Ready-to-send receipt text per Finance Ops Guide. */
  const copyReceipt = (i: any) => {
    const text = `HAMZURY · Receipt for ${i.invoiceNumber}
Built to Last.

Received from: ${i.clientName}
Amount:        ${fmtNaira(i.total)}
Invoice ref:   ${i.invoiceNumber}
Paid on:       ${fmtDate(i.paidAt)}

Thank you for your payment. This receipt confirms
settlement of the invoice referenced above.

HAMZURY Business Institute
Ajami Plaza, Garki, Abuja
finance@hamzury.com`;
    navigator.clipboard.writeText(text).then(
      () => toast.success(`Receipt for ${i.invoiceNumber} copied`),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  const TONE: Record<string, "green" | "gold" | "red" | "muted"> = {
    paid: "green", sent: "gold", draft: "muted", cancelled: "red",
  };

  return (
    <div>
      <SectionTitle sub="Every invoice. Mark paid to trigger the 50/30/20 allocation.">
        Invoices
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <div style={{
          display: "flex", gap: 10,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["all", "draft", "sent", "paid", "cancelled"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: "5px 10px", borderRadius: 8,
                  backgroundColor: filter === f ? GREEN : "transparent",
                  color: filter === f ? WHITE : MUTED,
                  border: `1px solid ${filter === f ? GREEN : `${DARK}15`}`,
                  fontSize: 10, fontWeight: 600, cursor: "pointer",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>{f}</button>
            ))}
          </div>
          <input type="search" placeholder="Search invoice # or client…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`,
              fontSize: 12, color: DARK, backgroundColor: WHITE, outline: "none",
              width: isMobile ? "100%" : 240,
            }} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Receipt} title="No invoices match" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 80).map((i: any) => (
            <Card key={i.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK, fontFamily: "monospace" }}>{i.invoiceNumber}</p>
                    <StatusPill label={i.status} tone={TONE[i.status] || "muted"} />
                  </div>
                  <p style={{ fontSize: 12, color: DARK, marginTop: 4 }}>{i.clientName}</p>
                  <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: MUTED, flexWrap: "wrap" }}>
                    <span>Created: {fmtDate(i.createdAt)}</span>
                    {i.dueDate && <span>Due: {fmtDate(i.dueDate)}</span>}
                    {i.paidAt && <span>Paid: {fmtDate(i.paidAt)}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{fmtNaira(i.total)}</p>
                  {i.status !== "paid" && i.status !== "cancelled" && (
                    <button
                      onClick={() => {
                        if (!confirm(`Mark ${i.invoiceNumber} as paid?`)) return;
                        markPaidMut.mutate({ id: i.id });
                      }}
                      disabled={markPaidMut.isPending}
                      style={{
                        marginTop: 6, padding: "5px 12px", borderRadius: 8,
                        backgroundColor: `${GREEN}15`, color: GREEN,
                        border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}>
                      Mark Paid
                    </button>
                  )}
                  {i.status === "paid" && (
                    <button
                      onClick={() => copyReceipt(i)}
                      style={{
                        marginTop: 6, padding: "5px 12px", borderRadius: 8,
                        backgroundColor: `${GOLD}15`, color: GOLD,
                        border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}>
                      <Send size={11} /> Receipt
                    </button>
                  )}
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
 * 3. PAYMENTS IN
 * ═══════════════════════════════════════════════════════════════════════ */
function PaymentsSection() {
  const listQ = trpc.invoices.list.useQuery(undefined, { retry: false });
  const paid = ((listQ.data || []) as any[]).filter(i => i.status === "paid");

  const total = paid.reduce((s, i) => s + parseFloat(i.total || 0), 0);
  const thisMonth = paid.filter(i => {
    if (!i.paidAt) return false;
    const d = new Date(i.paidAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTotal = thisMonth.reduce((s, i) => s + parseFloat(i.total || 0), 0);

  return (
    <div>
      <SectionTitle sub="Every confirmed payment, newest first.">
        Payments In
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Total Collected"   value={fmtNaira(total)}      color={GREEN} />
        <MiniStat label="This Month"        value={fmtNaira(monthTotal)} color={GOLD} />
        <MiniStat label="Payment Count"     value={paid.length}          color={BLUE} />
      </div>

      <Card>
        {paid.length === 0 ? (
          <EmptyState icon={DollarSign} title="No payments yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {paid.slice(0, 80).map((i: any) => (
              <div key={i.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{i.clientName}</p>
                  <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", marginTop: 2 }}>
                    {i.invoiceNumber} · {fmtDate(i.paidAt)}
                  </p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{fmtNaira(i.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 4. ALLOCATIONS (50/30/20)
 * ═══════════════════════════════════════════════════════════════════════ */
function AllocationsSection() {
  const isMobile = useIsMobile();
  const listQ = trpc.finance.allocations.useQuery(undefined, { retry: false });
  const rows = ((listQ.data || []) as any[]);

  const totalRev = rows.reduce((s, a) => s + parseFloat(a.totalAmount || 0), 0);
  const totalStaff = rows.reduce((s, a) => s + parseFloat(a.humanStaffAmount || 0), 0);
  const totalAi = rows.reduce((s, a) => s + parseFloat(a.aiFundAmount || 0), 0);
  const totalAffPool = rows.reduce((s, a) => s + parseFloat(a.affiliatePoolAmount || 0), 0);

  return (
    <div>
      <SectionTitle sub="Institutional money split (legacy backend model). Used for bookkeeping across company functions. The division + CSO payout lives in the 'Commissions (40/60)' tab — that's what staff actually get paid.">
        Revenue Allocations · 50/30/20
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Total Allocated"  value={fmtNaira(totalRev)}     color={GREEN} />
        <MiniStat label="Staff (Human)"    value={fmtNaira(totalStaff)}   color={GOLD} />
        <MiniStat label="AI Fund"          value={fmtNaira(totalAi)}      color={PURPLE} />
        <MiniStat label="Affiliate Pool"   value={fmtNaira(totalAffPool)} color={BLUE} />
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={PiggyBank} title="No allocations yet" hint="Payments flow here after they're confirmed." />
        ) : isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.slice(0, 40).map((a: any) => (
              <div key={a.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{a.clientName || "—"}</p>
                    <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace", marginTop: 2 }}>{a.transactionRef}</p>
                  </div>
                  <StatusPill label={a.status} tone={a.status === "paid" ? "green" : a.status === "approved" ? "gold" : "muted"} />
                </div>
                <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, color: MUTED }}>
                  <span>Total: <strong style={{ color: DARK }}>{fmtNaira(a.totalAmount)}</strong></span>
                  <span>Staff: <strong style={{ color: GOLD }}>{fmtNaira(a.humanStaffAmount)}</strong></span>
                  <span>AI: <strong style={{ color: PURPLE }}>{fmtNaira(a.aiFundAmount)}</strong></span>
                  <span>Affiliate: <strong style={{ color: BLUE }}>{fmtNaira(a.affiliatePoolAmount)}</strong></span>
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
                  <th style={{ padding: "8px 10px" }}>Staff</th>
                  <th style={{ padding: "8px 10px" }}>AI Fund</th>
                  <th style={{ padding: "8px 10px" }}>Affiliate</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 40).map((a: any) => (
                  <tr key={a.id} style={{ borderTop: `1px solid ${DARK}06` }}>
                    <td style={{ padding: "10px 10px", fontFamily: "monospace", fontSize: 10 }}>{a.transactionRef}</td>
                    <td style={{ padding: "10px 10px" }}>{a.clientName || "—"}</td>
                    <td style={{ padding: "10px 10px", fontWeight: 700 }}>{fmtNaira(a.totalAmount)}</td>
                    <td style={{ padding: "10px 10px", color: GOLD }}>{fmtNaira(a.humanStaffAmount)}</td>
                    <td style={{ padding: "10px 10px", color: PURPLE }}>{fmtNaira(a.aiFundAmount)}</td>
                    <td style={{ padding: "10px 10px", color: BLUE }}>{fmtNaira(a.affiliatePoolAmount)}</td>
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
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 5. COMMISSIONS — 40/60 + CSO 18% model (per Finance Operations Guide)
 * ═══════════════════════════════════════════════════════════════════════ */
function CommissionsSection() {
  const utils = trpc.useUtils();
  const listQ = trpc.commissions.list.useQuery(undefined, { retry: false });
  const rows = ((listQ.data || []) as any[]);

  const pending = rows.filter(c => c.status === "pending");
  const approved = rows.filter(c => c.status === "approved");
  const paid = rows.filter(c => c.status === "paid");

  const approveMut = trpc.commissions.updateStatus.useMutation({
    onSuccess: () => { toast.success("Commission status updated"); utils.commissions.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  // ── Live calculator (40/60 + CSO 18%) ───────────────────────────────────
  const [calcAmount, setCalcAmount] = useState<string>("");
  const [calcCso, setCalcCso] = useState<boolean>(false);
  const amount = parseFloat(calcAmount) || 0;
  const divisionShare = amount * 0.40;
  const sharedPool = amount * 0.60;
  const csoCut = calcCso ? amount * 0.18 : 0;
  const divisionNet = divisionShare - csoCut;

  return (
    <div>
      <SectionTitle sub="HAMZURY model: 40% division · 60% shared pool. If CSO brought the client, CSO earns 18% of the total (deducted from the division's 40%).">
        Commissions
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Pending"  value={pending.length}  color={GOLD} />
        <MiniStat label="Approved" value={approved.length} color={BLUE} />
        <MiniStat label="Paid"     value={paid.length}     color={GREEN} />
        <MiniStat label="Total"    value={rows.length}     color={MUTED} />
      </div>

      {/* Live calculator */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Commission Calculator
        </p>
        <div style={{
          display: "grid", gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Revenue Amount (₦)
            </span>
            <input
              type="number"
              value={calcAmount}
              onChange={e => setCalcAmount(e.target.value)}
              placeholder="e.g. 500000"
              style={{
                padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}15`,
                fontSize: 14, color: DARK, backgroundColor: WHITE, outline: "none",
                fontFamily: "monospace",
              }}
            />
          </label>
          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 12px", borderRadius: 10, backgroundColor: BG,
            cursor: "pointer", border: `1px solid ${DARK}08`,
          }}>
            <input
              type="checkbox"
              checked={calcCso}
              onChange={e => setCalcCso(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: GREEN }}
            />
            <span style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>
              CSO brought this client (18% to CSO)
            </span>
          </label>
        </div>

        {amount > 0 && (
          <div style={{
            marginTop: 14, padding: "14px 16px", backgroundColor: `${GREEN}06`,
            borderRadius: 12, border: `1px solid ${GREEN}20`,
          }}>
            <div style={{
              display: "grid", gap: 8,
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            }}>
              <Breakdown label="Total revenue"     value={fmtNaira(amount)}        color={DARK} />
              <Breakdown label="Shared pool (60%)" value={fmtNaira(sharedPool)}    color={GOLD} />
              <Breakdown label="Division (40%)"    value={fmtNaira(divisionShare)} color={BLUE} />
              {calcCso && (
                <>
                  <Breakdown label="CSO cut (18%)"    value={fmtNaira(csoCut)}      color={PURPLE} />
                  <Breakdown label="Division net"     value={fmtNaira(divisionNet)} color={GREEN} />
                </>
              )}
            </div>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 10, lineHeight: 1.6 }}>
              Example from ops guide: Medialy earns ₦500,000. Division gets ₦200,000 (40%).
              If CSO brought the client: CSO earns ₦90,000 (18% of ₦500,000), deducted from
              division's 40% → Medialy nets ₦110,000.
            </p>
          </div>
        )}
      </Card>

      {/* Records list */}
      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Commission Records
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={Award} title="No commissions yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 60).map((c: any) => {
              const quoted = parseFloat(c.quotedPrice || 0);
              return (
                <div key={c.id} style={{
                  padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {c.clientName || "—"} <span style={{ color: MUTED, fontWeight: 400 }}>· {c.service || c.taskRef}</span>
                    </p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      Quoted {fmtNaira(quoted)} · Division 40% = {fmtNaira(quoted * 0.4)} · CSO 18% = {fmtNaira(quoted * 0.18)} · {fmtDate(c.createdAt)}
                    </p>
                  </div>
                  <StatusPill label={c.status} tone={c.status === "paid" ? "green" : c.status === "approved" ? "blue" : "gold"} />
                  {c.status === "pending" && (
                    <button
                      onClick={() => approveMut.mutate({ id: c.id, status: "approved" })}
                      disabled={approveMut.isPending}
                      style={{
                        padding: "5px 10px", borderRadius: 8,
                        backgroundColor: `${GREEN}15`, color: GREEN, border: "none",
                        fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}>
                      Approve
                    </button>
                  )}
                  {c.status === "approved" && (
                    <button
                      onClick={() => approveMut.mutate({ id: c.id, status: "paid" })}
                      disabled={approveMut.isPending}
                      style={{
                        padding: "5px 10px", borderRadius: 8,
                        backgroundColor: `${BLUE}15`, color: BLUE, border: "none",
                        fontSize: 10, fontWeight: 600, cursor: "pointer",
                      }}>
                      Mark Paid
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Breakdown({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color, fontFamily: "ui-monospace, monospace" }}>
        {value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 6. AI FUND
 * ═══════════════════════════════════════════════════════════════════════ */
function AIFundSection() {
  const q = trpc.finance.aiFund.useQuery(undefined, { retry: false });
  const data = q.data;

  return (
    <div>
      <SectionTitle sub="AI Fund accumulates 9% of every payment (+ up to 30% of the staff pool when AI did >50% of the work).">
        AI Fund
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Current Balance" value={fmtNaira(data?.balance)}   color={PURPLE} />
        <MiniStat label="Entries"         value={data?.log?.length ?? 0}    color={GOLD} />
      </div>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Fund Log — Recent
        </p>
        {!data?.log || data.log.length === 0 ? (
          <EmptyState icon={Activity} title="No fund entries yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.log.slice(0, 40).map((l: any) => (
              <div key={l.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", backgroundColor: BG, borderRadius: 8, gap: 10,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 11, color: DARK }}>{l.description}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{fmtDate(l.createdAt)}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: PURPLE }}>{fmtNaira(l.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 7. REPORTS — Monthly Financial Report (per Finance Operations Guide)
 *    Sections: Revenue · Expenses · P&L · Cash Flow · Outstanding
 * ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const invoicesQ = trpc.invoices.list.useQuery(undefined, { retry: false });
  const commissionsQ = trpc.commissions.list.useQuery(undefined, { retry: false });

  const invoices = ((invoicesQ.data || []) as any[]);
  const commissions = ((commissionsQ.data || []) as any[]);

  // Expenses input — manual (no expenses backend yet)
  const [expFixed,     setExpFixed]     = useState<string>("");
  const [expVariable,  setExpVariable]  = useState<string>("");
  const [openingBal,   setOpeningBal]   = useState<string>("");

  // Month scope
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  const paidThisMonth = invoices.filter(i => {
    if (i.status !== "paid") return false;
    if (!i.paidAt) return false;
    const d = new Date(i.paidAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const unpaid = invoices.filter(i => i.status === "sent" || i.status === "draft");
  const overdue = unpaid.filter(i => {
    if (!i.dueDate) return false;
    try { return new Date(i.dueDate) < new Date(); } catch { return false; }
  });

  // Revenue by division (from task.department on invoice's linked task — best-effort)
  const byDept: Record<string, number> = {};
  for (const i of paidThisMonth) {
    const d = (i.department || "general").toLowerCase();
    byDept[d] = (byDept[d] || 0) + parseFloat(i.total || 0);
  }

  const totalRevenue     = paidThisMonth.reduce((s, i) => s + parseFloat(i.total || 0), 0);
  const commissionsPaid  = commissions
    .filter(c => {
      if (c.status !== "paid") return false;
      if (!c.paidAt) return false;
      const d = new Date(c.paidAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, c) => s + parseFloat(c.commissionAmount || 0), 0);

  const fixedCosts    = parseFloat(expFixed) || 0;
  const variableCosts = parseFloat(expVariable) || 0;
  const totalExpenses = fixedCosts + variableCosts + commissionsPaid;
  const netProfit     = totalRevenue - totalExpenses;

  const opening = parseFloat(openingBal) || 0;
  const closing = opening + totalRevenue - totalExpenses;

  const outstandingTotal = unpaid.reduce((s, i) => s + parseFloat(i.total || 0), 0);
  const overdueTotal     = overdue.reduce((s, i) => s + parseFloat(i.total || 0), 0);

  const report = `HAMZURY · Monthly Financial Report
${monthLabel}

1. REVENUE SUMMARY
────────────────────────────────────────
 · Total revenue (paid):   ${fmtNaira(totalRevenue)}
 · Invoice count:          ${paidThisMonth.length}
${Object.entries(byDept).map(([d, v]) => ` ·   ${d.padEnd(20)} ${fmtNaira(v)}`).join("\n")}

2. EXPENSE SUMMARY
────────────────────────────────────────
 · Fixed costs:            ${fmtNaira(fixedCosts)}
 · Variable costs:         ${fmtNaira(variableCosts)}
 · Commissions paid out:   ${fmtNaira(commissionsPaid)}
 · TOTAL EXPENSES:         ${fmtNaira(totalExpenses)}

3. PROFIT / LOSS
────────────────────────────────────────
 · Revenue:                ${fmtNaira(totalRevenue)}
 · Expenses:               ${fmtNaira(totalExpenses)}
 · NET:                    ${fmtNaira(netProfit)}  ${netProfit >= 0 ? "✓" : "⚠"}

4. CASH FLOW
────────────────────────────────────────
 · Opening balance:        ${fmtNaira(opening)}
 · Inflows (paid):         ${fmtNaira(totalRevenue)}
 · Outflows (expenses):    ${fmtNaira(totalExpenses)}
 · CLOSING BALANCE:        ${fmtNaira(closing)}

5. OUTSTANDING INVOICES
────────────────────────────────────────
 · Unpaid count:           ${unpaid.length}
 · Unpaid total:           ${fmtNaira(outstandingTotal)}
 · Overdue count:          ${overdue.length}
 · Overdue total:          ${fmtNaira(overdueTotal)}

Built to Last.
Distribution: CEO (full), Founder (summary), Division leads (their lines).`;

  const copy = () => {
    navigator.clipboard.writeText(report).then(
      () => toast.success("Monthly report copied"),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  return (
    <div>
      <SectionTitle sub={`Monthly Financial Report — ${monthLabel}. Ready to paste to CEO/Founder.`}>
        Reports
      </SectionTitle>

      {/* Expenses + opening balance inputs (manual, no backend yet) */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Expenses & Cash (enter for this month)
        </p>
        <p style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>
          Revenue + commissions are pulled from the system automatically. Expenses + opening bank balance are entered here for now — we'll add an Expenses table in the next build.
        </p>
        <div style={{
          display: "grid", gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        }}>
          <FinInput label="Fixed costs (rent, utilities, salaries) ₦"
            value={expFixed} onChange={setExpFixed} />
          <FinInput label="Variable costs (software, etc.) ₦"
            value={expVariable} onChange={setExpVariable} />
          <FinInput label="Opening bank balance ₦"
            value={openingBal} onChange={setOpeningBal} />
        </div>
      </Card>

      {/* Snapshot KPIs */}
      <div style={{
        display: "grid", gap: 10, marginBottom: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      }}>
        <MiniStat label="Revenue"      value={fmtNaira(totalRevenue)}   color={GREEN} />
        <MiniStat label="Expenses"     value={fmtNaira(totalExpenses)}  color={ORANGE} />
        <MiniStat label="Net P/L"      value={fmtNaira(netProfit)}      color={netProfit >= 0 ? GREEN : RED} />
        <MiniStat label="Closing cash" value={fmtNaira(closing)}        color={BLUE} />
        <MiniStat label="Overdue"      value={fmtNaira(overdueTotal)}   color={RED} />
      </div>

      {/* Full report text */}
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Full Report — Copy & Send
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
            backgroundColor: GREEN, color: WHITE, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <Send size={12} /> Copy Monthly Report
        </button>
      </Card>

      {/* Outstanding invoices detail */}
      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Outstanding Invoices — Needs Follow-up
        </p>
        {unpaid.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All invoices settled — clean books." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {unpaid.slice(0, 30).map((i: any) => {
              const isOverdue = i.dueDate && new Date(i.dueDate) < new Date();
              return (
                <div key={i.id} style={{
                  padding: "10px 12px",
                  backgroundColor: isOverdue ? `${RED}06` : BG,
                  borderRadius: 10,
                  border: `1px solid ${isOverdue ? `${RED}20` : `${DARK}06`}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK, fontFamily: "monospace" }}>{i.invoiceNumber}</p>
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {i.clientName} · Due {fmtDate(i.dueDate)}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? RED : GOLD }}>
                    {fmtNaira(i.total)}
                  </span>
                  <StatusPill label={isOverdue ? "overdue" : i.status} tone={isOverdue ? "red" : "gold"} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function FinInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0"
        style={{
          padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}15`,
          fontSize: 13, color: DARK, backgroundColor: WHITE, outline: "none",
          fontFamily: "monospace",
        }}
      />
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * MetricBar — progress pill used on Overview "Success Metrics" card
 * ═══════════════════════════════════════════════════════════════════════ */
function MetricBar({
  label, target, value, ok, display, inverse,
}: {
  label: string;
  target: string;
  value: number;   // 0-100
  ok: boolean;
  display: string;
  inverse?: boolean;
}) {
  const fill = Math.min(100, Math.max(0, value));
  const color = ok ? "#22C55E" : inverse ? RED : ORANGE;
  return (
    <div style={{
      padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 6 }}>
        <p style={{
          fontSize: 11, color: DARK, fontWeight: 600, lineHeight: 1.3,
          minWidth: 0, flex: 1,
        }}>
          {label}
        </p>
        <p style={{ fontSize: 9, color: MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>
          target {target}
        </p>
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color, marginBottom: 8 }}>{display}</p>
      <div style={{
        height: 5, backgroundColor: `${DARK}08`, borderRadius: 999, overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${inverse ? Math.max(6, 100 - fill) : fill}%`,
          backgroundColor: color,
          transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 8. EXPENSES (localStorage v1 until backend table is added)
 * ═══════════════════════════════════════════════════════════════════════ */
type ExpenseRow = {
  id: string;
  date: string;
  category: "fixed" | "variable";
  vendor: string;
  description: string;
  amount: number;
};
const EXPENSES_STORE_KEY = "hamzury_finance_expenses_v1";

function loadExpenses(): ExpenseRow[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
function saveExpenses(rows: ExpenseRow[]) {
  try { localStorage.setItem(EXPENSES_STORE_KEY, JSON.stringify(rows)); } catch {}
}

function ExpensesSection() {
  const isMobile = useIsMobile();
  const [rows, setRows] = useState<ExpenseRow[]>(loadExpenses);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "fixed" as "fixed" | "variable",
    vendor: "",
    description: "",
    amount: "",
  });

  const add = () => {
    const amt = parseFloat(form.amount);
    if (!form.vendor.trim() || !form.description.trim() || !amt || amt <= 0) {
      toast.error("Fill vendor, description + positive amount"); return;
    }
    const next: ExpenseRow[] = [
      { id: Math.random().toString(36).slice(2), ...form, amount: amt },
      ...rows,
    ];
    setRows(next); saveExpenses(next);
    setForm({ ...form, vendor: "", description: "", amount: "" });
    toast.success("Expense recorded");
  };

  const del = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const next = rows.filter(r => r.id !== id);
    setRows(next); saveExpenses(next);
  };

  // This-month totals
  const now = new Date();
  const thisMonth = rows.filter(r => {
    try {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } catch { return false; }
  });
  const fixed    = thisMonth.filter(r => r.category === "fixed").reduce((s, r) => s + r.amount, 0);
  const variable = thisMonth.filter(r => r.category === "variable").reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <SectionTitle sub="Fixed + variable costs. Stored in your browser for now — moves to a DB table when backend lands.">
        Expenses
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Fixed (month)"    value={fmtNaira(fixed)}      color={ORANGE} />
        <MiniStat label="Variable (month)" value={fmtNaira(variable)}   color={RED} />
        <MiniStat label="Total (month)"    value={fmtNaira(fixed + variable)} color={GOLD} />
        <MiniStat label="Entries"          value={rows.length}          color={BLUE} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Record Expense
        </p>
        <div style={{
          display: "grid", gap: 10,
          gridTemplateColumns: isMobile ? "1fr" : "120px 120px 1fr 1fr 140px auto",
          alignItems: "end",
        }}>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={inputBox()} />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as any })}
            style={inputBox()}>
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
          </select>
          <input placeholder="Vendor (e.g. AfeesHost)" value={form.vendor}
            onChange={e => setForm({ ...form, vendor: e.target.value })} style={inputBox()} />
          <input placeholder="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} style={inputBox()} />
          <input type="number" placeholder="Amount ₦" value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            style={{ ...inputBox(), fontFamily: "monospace" }} />
          <button onClick={add} style={{
            padding: "10px 14px", borderRadius: 10,
            backgroundColor: GREEN, color: WHITE, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          }}>
            <Plus size={12} /> Add
          </button>
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Recorded Expenses ({rows.length})
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="No expenses recorded" hint="Add your first above." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 80).map(r => (
              <div key={r.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {r.vendor} <span style={{ color: MUTED, fontWeight: 400 }}>· {r.description}</span>
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {fmtDate(r.date)} · {r.category}
                  </p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.category === "fixed" ? ORANGE : RED }}>
                  {fmtNaira(r.amount)}
                </span>
                <button onClick={() => del(r.id)} style={{
                  padding: "5px 8px", borderRadius: 8,
                  backgroundColor: `${RED}10`, color: RED, border: "none",
                  fontSize: 10, fontWeight: 600, cursor: "pointer",
                }}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 9. BANK RECONCILIATION (daily, localStorage v1)
 * ═══════════════════════════════════════════════════════════════════════ */
type BankDay = {
  id: string;
  date: string;
  opening: number;
  inflows: number;
  outflows: number;
  notes: string;
};
const BANKRECON_STORE_KEY = "hamzury_finance_bankrecon_v1";
function loadBankDays(): BankDay[] { try { return JSON.parse(localStorage.getItem(BANKRECON_STORE_KEY) || "[]"); } catch { return []; } }
function saveBankDays(rows: BankDay[]) { try { localStorage.setItem(BANKRECON_STORE_KEY, JSON.stringify(rows)); } catch {} }

function BankReconSection() {
  const isMobile = useIsMobile();
  const [rows, setRows] = useState<BankDay[]>(loadBankDays);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    opening: "",
    inflows: "",
    outflows: "",
    notes: "",
  });

  const add = () => {
    const op = parseFloat(form.opening) || 0;
    const inflow = parseFloat(form.inflows) || 0;
    const outflow = parseFloat(form.outflows) || 0;
    const next: BankDay[] = [
      { id: Math.random().toString(36).slice(2), date: form.date, opening: op, inflows: inflow, outflows: outflow, notes: form.notes.trim() },
      ...rows,
    ].sort((a, b) => b.date.localeCompare(a.date));
    setRows(next); saveBankDays(next);
    setForm({ date: new Date().toISOString().split("T")[0], opening: "", inflows: "", outflows: "", notes: "" });
    toast.success("Bank day recorded");
  };

  const del = (id: string) => {
    if (!confirm("Delete this reconciliation entry?")) return;
    const next = rows.filter(r => r.id !== id);
    setRows(next); saveBankDays(next);
  };

  const latest = rows[0];
  const latestClosing = latest ? latest.opening + latest.inflows - latest.outflows : 0;

  return (
    <div>
      <SectionTitle sub="Daily opening · inflows · outflows · closing. Stored in your browser for now — migrates to a DB table next pass.">
        Bank Reconciliation
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Latest closing"
          value={fmtNaira(latestClosing)}
          color={latestClosing >= 0 ? GREEN : RED} />
        <MiniStat label="Days reconciled" value={rows.length} color={BLUE} />
        <MiniStat label="Last reconciled"
          value={latest ? fmtDate(latest.date) : "—"} color={GOLD} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Record Day
        </p>
        <div style={{
          display: "grid", gap: 10,
          gridTemplateColumns: isMobile ? "1fr" : "140px 140px 140px 140px 1fr auto",
          alignItems: "end",
        }}>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={inputBox()} />
          <input type="number" placeholder="Opening ₦" value={form.opening}
            onChange={e => setForm({ ...form, opening: e.target.value })}
            style={{ ...inputBox(), fontFamily: "monospace" }} />
          <input type="number" placeholder="Inflows ₦" value={form.inflows}
            onChange={e => setForm({ ...form, inflows: e.target.value })}
            style={{ ...inputBox(), fontFamily: "monospace" }} />
          <input type="number" placeholder="Outflows ₦" value={form.outflows}
            onChange={e => setForm({ ...form, outflows: e.target.value })}
            style={{ ...inputBox(), fontFamily: "monospace" }} />
          <input placeholder="Notes (optional)" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} style={inputBox()} />
          <button onClick={add} style={{
            padding: "10px 14px", borderRadius: 10,
            backgroundColor: GREEN, color: WHITE, border: "none",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          }}>
            <Plus size={12} /> Add
          </button>
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          History
        </p>
        {rows.length === 0 ? (
          <EmptyState icon={Landmark} title="No reconciliations yet" hint="Add today's bank numbers above." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 40).map(r => {
              const closing = r.opening + r.inflows - r.outflows;
              return (
                <div key={r.id} style={{
                  padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{fmtDate(r.date)}</p>
                      {r.notes && <p style={{ fontSize: 11, color: MUTED, marginTop: 2, fontStyle: "italic" }}>{r.notes}</p>}
                    </div>
                    <button onClick={() => del(r.id)} style={{
                      padding: "5px 8px", borderRadius: 8,
                      backgroundColor: `${RED}10`, color: RED, border: "none",
                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                    }}><Trash2 size={11} /></button>
                  </div>
                  <div style={{
                    marginTop: 8, display: "grid", gap: 6,
                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                    fontSize: 11,
                  }}>
                    <span style={{ color: MUTED }}>Opening: <strong style={{ color: DARK }}>{fmtNaira(r.opening)}</strong></span>
                    <span style={{ color: MUTED }}>Inflows: <strong style={{ color: GREEN }}>{fmtNaira(r.inflows)}</strong></span>
                    <span style={{ color: MUTED }}>Outflows: <strong style={{ color: RED }}>{fmtNaira(r.outflows)}</strong></span>
                    <span style={{ color: MUTED }}>Closing: <strong style={{ color: closing >= 0 ? GREEN : RED }}>{fmtNaira(closing)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 10. TAX FILINGS — queue of tax work for Bizdoc clients
 * ═══════════════════════════════════════════════════════════════════════ */
function TaxFilingsSection() {
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const all = ((tasksQ.data || []) as any[]);

  const TAX_KEYWORDS = ["VAT", "PAYE", "WHT", "Tax Clearance", "TCC", "CIT", "Annual Return", "Annual Filing", "Tax Management"];
  const filings = all.filter(t =>
    TAX_KEYWORDS.some(k => (t.service || "").toLowerCase().includes(k.toLowerCase()))
  );

  // Group by status
  const active   = filings.filter(t => t.status !== "Completed");
  const overdue  = active.filter(t => {
    if (!t.deadline && !t.expectedDelivery) return false;
    try { return new Date(t.deadline || t.expectedDelivery) < new Date(); } catch { return false; }
  });
  const upcoming = active.filter(t => {
    if (!t.deadline && !t.expectedDelivery) return false;
    try {
      const d = new Date(t.deadline || t.expectedDelivery);
      const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 30;
    } catch { return false; }
  });
  const done = filings.filter(t => t.status === "Completed").length;

  return (
    <div>
      <SectionTitle sub="Tax filings Finance handles for Bizdoc clients. VAT, PAYE, WHT, TCC, annual returns. Renewals tracked here.">
        Tax Filings
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Active"    value={active.length}   color={BLUE} />
        <MiniStat label="Overdue"   value={overdue.length}  color={RED} />
        <MiniStat label="Next 30d"  value={upcoming.length} color={ORANGE} />
        <MiniStat label="Completed" value={done}            color={GREEN} />
      </div>

      {overdue.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: RED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            🔴 Overdue — File Today
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {overdue.map((t: any) => (
              <div key={t.id} style={{
                padding: "10px 12px", backgroundColor: `${RED}06`, borderRadius: 10, border: `1px solid ${RED}20`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{t.service}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {t.clientName} · Due {fmtDate(t.deadline || t.expectedDelivery)}
                  </p>
                </div>
                <span style={{ fontSize: 10, color: RED, fontWeight: 700 }}>OVERDUE</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Next 30 Days
        </p>
        {upcoming.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No filings due in the next 30 days" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {upcoming.map((t: any) => (
              <div key={t.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{t.service}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {t.clientName} · Due {fmtDate(t.deadline || t.expectedDelivery)}
                  </p>
                </div>
                <StatusPill label={t.status} tone="blue" />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          All Active Tax Work ({active.length})
        </p>
        {active.length === 0 ? (
          <EmptyState icon={FileText} title="No active tax work" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {active.map((t: any) => (
              <div key={t.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{t.service}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    {t.clientName} · <span style={{ fontFamily: "monospace" }}>{t.ref}</span>
                  </p>
                </div>
                <StatusPill label={t.status} tone="muted" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function inputBox(): React.CSSProperties {
  return {
    padding: "10px 12px", borderRadius: 10, border: `1px solid ${DARK}15`,
    fontSize: 13, color: DARK, backgroundColor: WHITE, outline: "none",
    fontFamily: "inherit",
  };
}

/* Finance Calendar — recurring events per ops guide */
const FINANCE_EVENTS: { time: string; event: string; cadence: string; color: string }[] = [
  { time: "09:00 Daily",       event: "Bank balance check",          cadence: "Every day",              color: "#3B82F6" },
  { time: "10:00 Daily",       event: "Chase overdue invoices",      cadence: "Every day",              color: "#F59E0B" },
  { time: "1st of month",      event: "Process commission payouts",  cadence: "Monthly — 1st",          color: "#22C55E" },
  { time: "5th of month",      event: "Distribute monthly report",   cadence: "Monthly — 5th",          color: GOLD },
  { time: "10th of month",     event: "VAT filing due (previous month)", cadence: "Monthly — 10th",      color: "#EF4444" },
  { time: "15th of month",     event: "PAYE filing due",             cadence: "Monthly — 15th",         color: "#EF4444" },
  { time: "Every Friday 4pm",  event: "Bank reconciliation",         cadence: "Weekly — Friday",        color: GREEN },
  { time: "End of Q1/Q2/Q3/Q4", event: "Quarterly VAT review",       cadence: "Quarterly",              color: "#F59E0B" },
  { time: "End of financial year", event: "TCC renewal + annual returns", cadence: "Yearly",            color: "#EF4444" },
];

function FinanceCalendarSection() {
  const copyAll = () => {
    const text = FINANCE_EVENTS.map(e => `${e.time} — ${e.event} (${e.cadence})`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Calendar copied to clipboard");
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, letterSpacing: -0.2 }}>Finance Calendar</h2>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Recurring finance events — print and post on wall.</p>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>Daily / Weekly / Monthly / Quarterly events</p>
          <button onClick={copyAll} style={{ padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`, backgroundColor: WHITE, color: DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Copy size={12} /> Copy All
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FINANCE_EVENTS.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1px solid ${DARK}08`, borderLeft: `3px solid ${e.color}` }}>
              <div style={{ minWidth: 140, fontSize: 11, fontWeight: 700, color: e.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>{e.time}</div>
              <div style={{ flex: 1, fontSize: 13, color: DARK }}>{e.event}</div>
              <div style={{ fontSize: 10, color: MUTED, padding: "3px 8px", borderRadius: 999, backgroundColor: `${DARK}06` }}>{e.cadence}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Tax renewal auto-calc (reference)
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { tax: "VAT",               renewal: "Monthly (+3 months quarterly review)" },
            { tax: "PAYE",              renewal: "Monthly (+1 month)" },
            { tax: "WHT",               renewal: "Monthly (+1 month)" },
            { tax: "Annual Returns",    renewal: "Yearly (+1 year)" },
            { tax: "TCC",               renewal: "Yearly (+1 year — 30d reminder)" },
          ].map(t => (
            <div key={t.tax} style={{ padding: 12, borderRadius: 10, backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{t.tax}</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{t.renewal}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Expense approval thresholds
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {[
            { range: "< ₦50,000",       approver: "Division Lead", color: GREEN },
            { range: "₦50k – ₦500k",    approver: "CEO",           color: GOLD },
            { range: "> ₦500,000",      approver: "Founder",       color: "#8B4513" },
          ].map(t => (
            <div key={t.range} style={{ padding: 12, borderRadius: 10, backgroundColor: `${t.color}10` }}>
              <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.range}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: t.color, marginTop: 4 }}>{t.approver}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 12 }}>
          Commission state machine: <b>Draft → CEO Approved → Paid</b>. Implemented on the Commissions tab via the existing <code>commissions.updateStatus</code> mutation.
        </p>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * RESTORED SECTION — MySQL via tRPC `financeOps.monthlyReports.*`
 * (server/financeOps/router.ts). The 1 section that was cut for launch
 * is brought back here. Pattern mirrors HubAdminPortal.tsx restoration:
 * inline form helpers, ids are int end-to-end, toast on success,
 * invalidate on mutate.
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

/** Current month as "YYYY-MM". */
function thisMonthYM(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
/** Format "YYYY-MM" as "April 2026". */
function fmtMonthYM(ym: string | null | undefined): string {
  if (!ym) return "—";
  const m = /^(\d{4})-(\d{2})$/.exec(ym);
  if (!m) return ym;
  const year = parseInt(m[1], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  if (Number.isNaN(year) || monthIdx < 0 || monthIdx > 11) return ym;
  const d = new Date(year, monthIdx, 1);
  return d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
}

function ReportArchiveSection() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const q = trpc.financeOps.monthlyReports.list.useQuery(undefined, { retry: false });
  const rows = ((q.data || []) as any[]);

  const [showForm, setShowForm] = useState(false);
  const initForm = {
    month: thisMonthYM(),
    revenue: "",
    expenses: "",
    profit: "",
    profitTouched: false,
    notes: "",
  };
  const [form, setForm] = useState(initForm);

  // Auto-derive profit unless the user has explicitly edited it.
  const autoProfit = useMemo(() => {
    const r = parseFloat(form.revenue);
    const e = parseFloat(form.expenses);
    if (isNaN(r) && isNaN(e)) return "";
    return ((isNaN(r) ? 0 : r) - (isNaN(e) ? 0 : e)).toString();
  }, [form.revenue, form.expenses]);
  const profitValue = form.profitTouched ? form.profit : autoProfit;

  const createMut = trpc.financeOps.monthlyReports.create.useMutation({
    onSuccess: () => {
      toast.success("Monthly report archived");
      utils.financeOps.monthlyReports.list.invalidate();
      setShowForm(false);
      setForm(initForm);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.financeOps.monthlyReports.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.financeOps.monthlyReports.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const removeMut = trpc.financeOps.monthlyReports.remove.useMutation({
    onSuccess: () => { toast.success("Removed"); utils.financeOps.monthlyReports.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    month: string; revenue: string; expenses: string; profit: string; notes: string;
  }>({ month: "", revenue: "", expenses: "", profit: "", notes: "" });

  const openEdit = (r: any) => {
    setEditingId(r.id);
    setEditDraft({
      month: r.month || "",
      revenue: r.revenue ?? "",
      expenses: r.expenses ?? "",
      profit: r.profit ?? "",
      notes: r.notes ?? "",
    });
  };
  const cancelEdit = () => { setEditingId(null); };
  const saveEdit = () => {
    if (editingId == null) return;
    if (!/^\d{4}-\d{2}$/.test(editDraft.month)) {
      toast.error("Month must be YYYY-MM");
      return;
    }
    updateMut.mutate({
      id: editingId,
      month: editDraft.month,
      revenue: editDraft.revenue || null,
      expenses: editDraft.expenses || null,
      profit: editDraft.profit || null,
      notes: editDraft.notes || null,
    });
    setEditingId(null);
  };

  return (
    <div>
      <SectionTitle sub="Archive each month's P&L summary for the audit trail. View past months any time.">
        Monthly Report Archive
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
        <MiniStat label="Months Archived" value={rows.length} color={GREEN} />
        <MiniStat
          label="Latest Revenue"
          value={fmtNaira(rows[0]?.revenue)}
          color={GOLD}
        />
        <MiniStat
          label="Latest Profit"
          value={fmtNaira(rows[0]?.profit)}
          color={
            rows[0]?.profit !== null && rows[0]?.profit !== undefined && parseFloat(rows[0].profit) >= 0
              ? GREEN : RED
          }
        />
        <MiniStat label="Latest Month" value={fmtMonthYM(rows[0]?.month)} color={DARK} />
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 12 : 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Archive a Month
          </p>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? "Cancel" : "Archive Report"}
          </PrimaryButton>
        </div>
        {showForm && (
          <>
            <FormGrid>
              <FormField label="Month (YYYY-MM)">
                <TextInput
                  type="month"
                  value={form.month}
                  onChange={e => setForm({ ...form, month: e.target.value })}
                />
              </FormField>
              <FormField label="Revenue (₦)">
                <TextInput
                  type="number" step="0.01" min="0"
                  value={form.revenue}
                  onChange={e => setForm({ ...form, revenue: e.target.value })}
                  placeholder="0.00"
                />
              </FormField>
              <FormField label="Expenses (₦)">
                <TextInput
                  type="number" step="0.01" min="0"
                  value={form.expenses}
                  onChange={e => setForm({ ...form, expenses: e.target.value })}
                  placeholder="0.00"
                />
              </FormField>
              <FormField label="Profit (₦) — auto from rev − exp">
                <TextInput
                  type="number" step="0.01"
                  value={profitValue}
                  onChange={e => setForm({ ...form, profit: e.target.value, profitTouched: true })}
                  placeholder="0.00"
                />
              </FormField>
            </FormGrid>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              <FormField label="Notes (commentary, anomalies, context)">
                <TextArea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Big retainer paid this month, one-off equipment expense, etc."
                />
              </FormField>
            </div>
            <PrimaryButton
              onClick={() => {
                if (!/^\d{4}-\d{2}$/.test(form.month)) { toast.error("Month must be YYYY-MM"); return; }
                createMut.mutate({
                  month: form.month,
                  revenue: form.revenue || null,
                  expenses: form.expenses || null,
                  profit: profitValue || null,
                  notes: form.notes || null,
                  archivedBy: user?.name || user?.email || null,
                });
              }}
              disabled={createMut.isPending}
            >Archive Report</PrimaryButton>
          </>
        )}
      </Card>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Archive} title="No reports archived" hint="Archive each month's summary so the audit trail is complete." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((r: any) => {
              const isEditing = editingId === r.id;
              const profitNum = r.profit !== null && r.profit !== undefined ? parseFloat(r.profit) : NaN;
              const profitOk = !isNaN(profitNum) && profitNum >= 0;
              return (
                <div key={r.id} style={{
                  padding: "12px 14px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                }}>
                  {!isEditing ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{fmtMonthYM(r.month)}</p>
                          <StatusPill
                            label={!isNaN(profitNum) ? (profitOk ? "Profit" : "Loss") : "—"}
                            tone={!isNaN(profitNum) ? (profitOk ? "green" : "red") : "muted"}
                          />
                        </div>
                        <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: MUTED }}>
                            Revenue: <b style={{ color: DARK }}>{fmtNaira(r.revenue)}</b>
                          </span>
                          <span style={{ fontSize: 11, color: MUTED }}>
                            Expenses: <b style={{ color: DARK }}>{fmtNaira(r.expenses)}</b>
                          </span>
                          <span style={{ fontSize: 11, color: MUTED }}>
                            Profit: <b style={{ color: profitOk ? GREEN : RED }}>{fmtNaira(r.profit)}</b>
                          </span>
                        </div>
                        {r.notes && (
                          <p style={{ fontSize: 11, color: MUTED, marginTop: 6, fontStyle: "italic" }}>{r.notes}</p>
                        )}
                        <p style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>
                          {r.archivedBy ? <>Archived by {r.archivedBy} · </> : null}
                          {fmtDate(r.createdAt)}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 100 }}>
                        <GhostButton onClick={() => openEdit(r)} color={GREEN}>
                          Edit
                        </GhostButton>
                        <GhostButton onClick={() => { if (confirm(`Remove archive for ${fmtMonthYM(r.month)}?`)) removeMut.mutate({ id: r.id }); }} color={RED}>
                          <Trash2 size={10} /> Remove
                        </GhostButton>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FormGrid>
                        <FormField label="Month (YYYY-MM)">
                          <TextInput type="month" value={editDraft.month}
                            onChange={e => setEditDraft({ ...editDraft, month: e.target.value })} />
                        </FormField>
                        <FormField label="Revenue (₦)">
                          <TextInput type="number" step="0.01" value={editDraft.revenue}
                            onChange={e => setEditDraft({ ...editDraft, revenue: e.target.value })} />
                        </FormField>
                        <FormField label="Expenses (₦)">
                          <TextInput type="number" step="0.01" value={editDraft.expenses}
                            onChange={e => setEditDraft({ ...editDraft, expenses: e.target.value })} />
                        </FormField>
                        <FormField label="Profit (₦)">
                          <TextInput type="number" step="0.01" value={editDraft.profit}
                            onChange={e => setEditDraft({ ...editDraft, profit: e.target.value })} />
                        </FormField>
                      </FormGrid>
                      <div style={{ marginBottom: 10 }}>
                        <FormField label="Notes">
                          <TextArea value={editDraft.notes}
                            onChange={e => setEditDraft({ ...editDraft, notes: e.target.value })} />
                        </FormField>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <PrimaryButton onClick={saveEdit} disabled={updateMut.isPending}>Save</PrimaryButton>
                        <GhostButton onClick={cancelEdit} color={MUTED}>Cancel</GhostButton>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
