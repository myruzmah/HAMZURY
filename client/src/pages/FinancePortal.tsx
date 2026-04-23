import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import {
  LayoutDashboard, Receipt, DollarSign, PiggyBank, Award, TrendingUp,
  LogOut, ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle,
  Menu, X, Shield, Send, Wallet, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, Cell,
} from "recharts";
import { toast } from "sonner";

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
  | "commissions" | "aifund" | "reports";

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
    { key: "allocations", icon: PiggyBank,       label: "Allocations (50/30/20)" },
    { key: "commissions", icon: Award,           label: "Commissions" },
    { key: "aifund",      icon: Activity,        label: "AI Fund" },
    { key: "reports",     icon: TrendingUp,      label: "Reports" },
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
            {active === "allocations" && <AllocationsSection />}
            {active === "commissions" && <CommissionsSection />}
            {active === "aifund"      && <AIFundSection />}
            {active === "reports"     && <ReportsSection />}
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
      <SectionTitle sub="Every confirmed payment splits 50% institution · 30% staff pool · 20% affiliate pool. Institution then splits 25% ops / 10% growth / 9% AI / 6% reserve.">
        Revenue Allocations
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
 * 5. COMMISSIONS
 * ═══════════════════════════════════════════════════════════════════════ */
function CommissionsSection() {
  const utils = trpc.useUtils();
  const listQ = trpc.commissions.list.useQuery(undefined, { retry: false });
  const rows = ((listQ.data || []) as any[]);

  const pending = rows.filter(c => c.status === "pending");
  const approved = rows.filter(c => c.status === "approved");
  const paid = rows.filter(c => c.status === "paid");

  const approveMut = trpc.commissions.updateStatus.useMutation({
    onSuccess: () => { toast.success("Commission approved"); utils.commissions.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Commissions from confirmed payments — CSO 18%, affiliates by tier, staff pool splits.">
        Commissions
      </SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Pending"  value={pending.length}  color={GOLD} />
        <MiniStat label="Approved" value={approved.length} color={BLUE} />
        <MiniStat label="Paid"     value={paid.length}     color={GREEN} />
        <MiniStat label="Total"    value={rows.length}     color={MUTED} />
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={Award} title="No commissions yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.slice(0, 60).map((c: any) => (
              <div key={c.id} style={{
                padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                    {c.clientName || "—"} <span style={{ color: MUTED, fontWeight: 400 }}>· {c.service || c.taskRef}</span>
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                    Quoted {fmtNaira(c.quotedPrice)} · Commission {fmtNaira(c.commissionAmount)} · {fmtDate(c.createdAt)}
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
              </div>
            ))}
          </div>
        )}
      </Card>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
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
 * 7. REPORTS (summary — copy-paste into WhatsApp/email)
 * ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const rev = trpc.commissions.revenueStats.useQuery(undefined, { retry: false });
  const allocations = trpc.finance.allocations.useQuery(undefined, { retry: false });
  const aiFund = trpc.finance.aiFund.useQuery(undefined, { retry: false });

  const r = rev.data;
  const allocs = ((allocations.data || []) as any[]);
  const thisMonth = useMemo(() => {
    const now = new Date();
    return allocs.filter(a => {
      if (!a.createdAt) return false;
      const d = new Date(a.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [allocs]);

  const monthRev = thisMonth.reduce((s, a) => s + parseFloat(a.totalAmount || 0), 0);
  const monthStaff = thisMonth.reduce((s, a) => s + parseFloat(a.humanStaffAmount || 0), 0);
  const monthAi = thisMonth.reduce((s, a) => s + parseFloat(a.aiFundAmount || 0), 0);
  const monthAff = thisMonth.reduce((s, a) => s + parseFloat(a.affiliatePoolAmount || 0), 0);

  const reportText = `HAMZURY · Finance Summary
${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}

REVENUE
 · Total (paid):     ${fmtNaira(r?.totalRevenue)}
 · Pending:          ${fmtNaira(r?.pendingRevenue)}
 · This month:       ${fmtNaira(monthRev)}

ALLOCATIONS (this month)
 · Staff pool:       ${fmtNaira(monthStaff)}
 · AI fund:          ${fmtNaira(monthAi)}
 · Affiliate pool:   ${fmtNaira(monthAff)}

AI FUND BALANCE
 · Current:          ${fmtNaira(aiFund.data?.balance)}

Built to Last.`;

  const copy = () => {
    navigator.clipboard.writeText(reportText).then(
      () => toast.success("Report copied to clipboard"),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  return (
    <div>
      <SectionTitle sub="Ready-to-paste finance summary. Send to CEO via WhatsApp or email.">
        Reports
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Current Summary
        </p>
        <pre style={{
          fontFamily: "ui-monospace, 'SF Mono', monospace",
          fontSize: 11,
          color: DARK,
          backgroundColor: BG,
          padding: "14px 16px",
          borderRadius: 10,
          border: `1px solid ${DARK}06`,
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          margin: 0,
        }}>{reportText}</pre>
        <button onClick={copy}
          style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 10,
            backgroundColor: GREEN, color: WHITE,
            border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
          <Send size={12} /> Copy Report
        </button>
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          This Month · Payment List ({thisMonth.length})
        </p>
        {thisMonth.length === 0 ? (
          <EmptyState icon={Wallet} title="No payments this month yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {thisMonth.map((a: any) => (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", backgroundColor: BG, borderRadius: 8, gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: DARK }}>{a.clientName || "—"}</p>
                  <p style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>{a.transactionRef}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>{fmtNaira(a.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
