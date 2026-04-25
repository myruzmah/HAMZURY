import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import PendingReportsBanner from "@/components/PendingReportsBanner";
import {
  LayoutDashboard, Folder, Briefcase, Award, Calendar as CalendarIcon,
  FileText, LogOut, ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle,
  Menu, X, Shield, Send, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY BIZDOC OPS PORTAL — Yusuf + Abdullahi (compliance staff).
 * Daily operations for tax + compliance delivery.
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
  | "dashboard" | "clients" | "tasks" | "filings"
  | "licences" | "calendar" | "reports";

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
function daysFromNow(d: string | null | undefined | Date): number | null {
  if (!d) return null;
  try {
    const t = new Date(d).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.round((t - now) / (1000 * 60 * 60 * 24));
  } catch { return null; }
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

/* ═══════════════════════════════════════════════════════════════════════ */
export default function BizdocOpsPortal() {
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
    { key: "dashboard", icon: LayoutDashboard, label: "Overview" },
    { key: "clients",   icon: Folder,          label: "Active Clients" },
    { key: "tasks",     icon: Briefcase,       label: "My Tasks" },
    { key: "filings",   icon: FileText,        label: "Pending Filings" },
    { key: "licences",  icon: Award,           label: "Industry Licences" },
    { key: "calendar",  icon: CalendarIcon,    label: "Compliance Calendar" },
    { key: "reports",   icon: Send,            label: "Reports" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: BG, position: "relative" }}>
      <PendingReportsBanner />
      <PageMeta title="Bizdoc Ops — HAMZURY" description="Bizdoc operations — clients, filings, industry licences, compliance calendar." />

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
            <div style={{ fontSize: 15, color: WHITE, fontWeight: 600, letterSpacing: -0.1 }}>Bizdoc Ops</div>
            <div style={{ fontSize: 10, color: `${GOLD}99`, marginTop: 4 }}>Tax · Compliance · Licences</div>
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
                {user.name} · Bizdoc
              </p>
            </div>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 12, fontSize: 10,
            backgroundColor: `${GREEN}15`, color: GREEN, fontWeight: 600,
            letterSpacing: "0.04em", flexShrink: 0, whiteSpace: "nowrap",
          }}>
            <Shield size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> COMPLIANCE
          </span>
        </header>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{
            padding: isMobile ? "16px 14px 60px" : "24px 28px 60px",
            maxWidth: 1200, margin: "0 auto",
          }}>
            {active === "dashboard" && <OverviewSection onGoto={setActive} />}
            {active === "clients"   && <ClientsSection />}
            {active === "tasks"     && <TasksSection />}
            {active === "filings"   && <FilingsSection />}
            {active === "licences"  && <LicencesSection />}
            {active === "calendar"  && <CompCalendarSection />}
            {active === "reports"   && <ReportsSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function OverviewSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const tasks = ((tasksQ.data || []) as any[]);

  const active = tasks.filter(t => t.status === "In Progress" || t.status === "Waiting on Client").length;
  const notStarted = tasks.filter(t => t.status === "Not Started").length;
  const completed = tasks.filter(t => t.status === "Completed").length;

  // Pending filings = tasks due within 7 days and not completed
  const pendingFilings = tasks.filter(t => {
    if (t.status === "Completed") return false;
    const days = daysFromNow(t.deadline || t.expectedDelivery);
    return days !== null && days <= 7;
  }).length;

  // Overdue = deadline in past and not completed
  const overdue = tasks.filter(t => {
    if (t.status === "Completed") return false;
    const days = daysFromNow(t.deadline || t.expectedDelivery);
    return days !== null && days < 0;
  }).length;

  // Unique active clients
  const clientSet = new Set(tasks.filter(t => t.status !== "Completed").map(t => t.clientName));

  const kpis = [
    { label: "Active Clients",   value: clientSet.size, icon: Folder,      color: GREEN,  section: "clients" as Section },
    { label: "In Progress",      value: active,         icon: Briefcase,   color: BLUE,   section: "tasks" as Section },
    { label: "Not Started",      value: notStarted,     icon: Clock,       color: GOLD,   section: "tasks" as Section },
    { label: "Due in 7 Days",    value: pendingFilings, icon: FileText,    color: ORANGE, section: "filings" as Section },
    { label: "Overdue",          value: overdue,        icon: AlertCircle, color: RED,    section: "filings" as Section },
    { label: "Completed",        value: completed,      icon: CheckCircle2, color: "#22C55E", section: "tasks" as Section },
  ];

  const priority = tasks
    .filter(t => t.status !== "Completed" && (t.deadline || t.expectedDelivery))
    .sort((a, b) => {
      const da = new Date(a.deadline || a.expectedDelivery).getTime();
      const db = new Date(b.deadline || b.expectedDelivery).getTime();
      return da - db;
    })
    .slice(0, 6);

  return (
    <div>
      <SectionTitle sub="Every compliance file. Sorted by what's due next.">
        Bizdoc Overview
      </SectionTitle>

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

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <AlertCircle size={14} style={{ color: ORANGE }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Top Priority — Soonest Deadline
          </p>
        </div>
        {priority.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No pressing deadlines" hint="Tasks with deadlines will surface here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {priority.map((t: any) => {
              const days = daysFromNow(t.deadline || t.expectedDelivery);
              const tone: "red" | "orange" | "blue" =
                days !== null && days < 0 ? "red" : days !== null && days <= 3 ? "orange" : "blue";
              const label = days === null ? "—" : days < 0 ? `${-days}d OVERDUE` : days === 0 ? "TODAY" : `${days}d left`;
              return (
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
                  <StatusPill label={label} tone={tone} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function ClientsSection() {
  const isMobile = useIsMobile();
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const [search, setSearch] = useState("");
  const [openRef, setOpenRef] = useState<string | null>(null);

  const all = ((tasksQ.data || []) as any[]);
  const filtered = all.filter(t =>
    !search ||
    t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    t.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    t.ref?.toLowerCase().includes(search.toLowerCase()) ||
    t.service?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    "Not Started": "muted", "In Progress": "blue", "Waiting on Client": "orange",
    "Submitted": "gold", "Completed": "green",
  };

  return (
    <div>
      <SectionTitle sub="Every client Bizdoc is working with. Click to see filings + history.">
        Active Clients
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <input type="search" placeholder="Search client name, business, ref, service…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
            backgroundColor: WHITE, outline: "none",
          }} />
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Folder} title="No clients match" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 60).map(t => (
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
                }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                      {t.clientName || "—"}
                    </p>
                    <StatusPill label={t.status || "—"} tone={STATUS_TONE[t.status] || "muted"} />
                  </div>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                    {t.service} · {t.businessName || "Individual"}
                  </p>
                  <p style={{ fontSize: 10, color: MUTED, marginTop: 2, fontFamily: "monospace" }}>
                    {t.ref} · Due {fmtDate(t.deadline || t.expectedDelivery)}
                  </p>
                </div>
                <ChevronRight size={14}
                  style={{
                    color: MUTED, flexShrink: 0,
                    transform: openRef === t.ref ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }} />
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>Phone</p>
          <p style={{ fontSize: 12, color: DARK }}>{task.phone || "—"}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>Dept</p>
          <p style={{ fontSize: 12, color: DARK }}>{task.department}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>Invoiced</p>
          <p style={{ fontSize: 12, color: DARK }}>{inv?.total ? `₦${Number(inv.total).toLocaleString()}` : "—"}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>Balance</p>
          <p style={{ fontSize: 12, color: RED }}>{inv?.balance ? `₦${Number(inv.balance).toLocaleString()}` : "—"}</p>
        </div>
      </div>

      {checklist.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>
            Compliance Checklist — {checklist.filter((c: any) => c.done).length}/{checklist.length}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {checklist.slice(0, 10).map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                {c.done
                  ? <CheckCircle2 size={11} style={{ color: "#22C55E", flexShrink: 0 }} />
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
                <span style={{ flexShrink: 0 }}>{fmtDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function TasksSection() {
  const utils = trpc.useUtils();
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const [filter, setFilter] = useState<string>("active");

  const all = ((tasksQ.data || []) as any[]);
  const filtered = filter === "all" ? all
    : filter === "active" ? all.filter(t => t.status !== "Completed")
    : all.filter(t => t.status === filter);

  const STATUS_TONE: Record<string, "green" | "gold" | "red" | "blue" | "muted" | "orange"> = {
    "Not Started": "muted", "In Progress": "blue", "Waiting on Client": "orange",
    "Submitted": "gold", "Completed": "green",
  };

  const updateMut = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.tasks.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <SectionTitle sub="Every compliance task assigned to Bizdoc — inline status moves.">
        My Tasks
      </SectionTitle>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["active", "all", "Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "5px 10px", borderRadius: 8,
                backgroundColor: filter === f ? GREEN : "transparent",
                color: filter === f ? WHITE : MUTED,
                border: `1px solid ${filter === f ? GREEN : `${DARK}15`}`,
                fontSize: 10, fontWeight: 600, cursor: "pointer",
              }}>{f}</button>
          ))}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No tasks match" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.slice(0, 80).map((t: any) => (
            <Card key={t.id} style={{ padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{t.service}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {t.clientName} · <span style={{ fontFamily: "monospace" }}>{t.ref}</span>
                  </p>
                  {(t.deadline || t.expectedDelivery) && (
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>
                      Deadline: {fmtDate(t.deadline || t.expectedDelivery)}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0, alignItems: "center" }}>
                  <StatusPill label={t.status} tone={STATUS_TONE[t.status] || "muted"} />
                  <select
                    value={t.status}
                    onChange={e => updateMut.mutate({ id: t.id, status: e.target.value as any })}
                    disabled={updateMut.isPending}
                    style={{
                      padding: "5px 8px", borderRadius: 8, border: `1px solid ${DARK}15`,
                      fontSize: 10, color: DARK, backgroundColor: WHITE, cursor: "pointer",
                    }}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Waiting on Client</option>
                    <option>Submitted</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function FilingsSection() {
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const all = ((tasksQ.data || []) as any[]);

  const overdue = all.filter(t => {
    if (t.status === "Completed") return false;
    const days = daysFromNow(t.deadline || t.expectedDelivery);
    return days !== null && days < 0;
  }).sort((a, b) => {
    const da = new Date(a.deadline || a.expectedDelivery).getTime();
    const db = new Date(b.deadline || b.expectedDelivery).getTime();
    return da - db;
  });

  const thisWeek = all.filter(t => {
    if (t.status === "Completed") return false;
    const days = daysFromNow(t.deadline || t.expectedDelivery);
    return days !== null && days >= 0 && days <= 7;
  }).sort((a, b) => {
    const da = new Date(a.deadline || a.expectedDelivery).getTime();
    const db = new Date(b.deadline || b.expectedDelivery).getTime();
    return da - db;
  });

  const thisMonth = all.filter(t => {
    if (t.status === "Completed") return false;
    const days = daysFromNow(t.deadline || t.expectedDelivery);
    return days !== null && days > 7 && days <= 30;
  }).sort((a, b) => {
    const da = new Date(a.deadline || a.expectedDelivery).getTime();
    const db = new Date(b.deadline || b.expectedDelivery).getTime();
    return da - db;
  });

  const renderRow = (t: any, tone: "red" | "orange" | "blue") => {
    const days = daysFromNow(t.deadline || t.expectedDelivery);
    const label = days === null ? "—" : days < 0 ? `${-days}d OVERDUE` : days === 0 ? "TODAY" : `${days}d`;
    return (
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
        <StatusPill label={label} tone={tone} />
      </div>
    );
  };

  return (
    <div>
      <SectionTitle sub="Compliance filings grouped by urgency.">Pending Filings</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        <MiniStat label="Overdue"    value={overdue.length}   color={RED} />
        <MiniStat label="This Week"  value={thisWeek.length}  color={ORANGE} />
        <MiniStat label="This Month" value={thisMonth.length} color={BLUE} />
      </div>

      {overdue.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: RED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            🔴 Overdue — Act Today
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {overdue.map(t => renderRow(t, "red"))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          This Week
        </p>
        {thisWeek.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Nothing due this week" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {thisWeek.map(t => renderRow(t, "orange"))}
          </div>
        )}
      </Card>

      <Card>
        <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Next 30 Days
        </p>
        {thisMonth.length === 0 ? (
          <EmptyState icon={Clock} title="Nothing queued for next 30 days" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {thisMonth.map(t => renderRow(t, "blue"))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function LicencesSection() {
  // Filter tasks that match industry-licence services
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const all = ((tasksQ.data || []) as any[]);

  const LICENCE_KEYWORDS = ["NAFDAC", "SON", "SCUML", "PENCOM", "NSITF", "ITF", "BPP", "Licence", "License", "Permit"];
  const licences = all.filter(t =>
    LICENCE_KEYWORDS.some(k => (t.service || "").toLowerCase().includes(k.toLowerCase()))
  );

  const byType: Record<string, any[]> = {};
  for (const t of licences) {
    const key = LICENCE_KEYWORDS.find(k => (t.service || "").toLowerCase().includes(k.toLowerCase())) || "Other";
    (byType[key] = byType[key] || []).push(t);
  }

  return (
    <div>
      <SectionTitle sub="Industry licences grouped by issuing body. Track renewals here.">
        Industry Licences
      </SectionTitle>

      {licences.length === 0 ? (
        <Card><EmptyState icon={Award} title="No licence work on the board" hint="NAFDAC, SON, SCUML, PENCOM, ITF, NSITF, BPP — anything with those keywords lands here." /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(byType).map(([type, items]) => (
            <Card key={type}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: GOLD,
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
              }}>{type} · {items.length}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map((t: any) => (
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
                    <StatusPill label={t.status} tone={t.status === "Completed" ? "green" : "blue"} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function CompCalendarSection() {
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const all = ((tasksQ.data || []) as any[]).filter(t =>
    t.status !== "Completed" && (t.deadline || t.expectedDelivery)
  );

  // Group by month
  const byMonth: Record<string, any[]> = {};
  for (const t of all) {
    try {
      const d = new Date(t.deadline || t.expectedDelivery);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      (byMonth[key] = byMonth[key] || []).push(t);
    } catch {}
  }

  const sortedMonths = Object.keys(byMonth).sort();

  return (
    <div>
      <SectionTitle sub="Every deadline on the board, grouped by month.">
        Compliance Calendar
      </SectionTitle>

      {sortedMonths.length === 0 ? (
        <Card><EmptyState icon={CalendarIcon} title="No deadlines on the board" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedMonths.map(key => {
            const [y, m] = key.split("-");
            const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
            const items = byMonth[key].sort((a: any, b: any) => {
              const da = new Date(a.deadline || a.expectedDelivery).getTime();
              const db = new Date(b.deadline || b.expectedDelivery).getTime();
              return da - db;
            });
            return (
              <Card key={key}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: GREEN,
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
                }}>{label} · {items.length} item{items.length === 1 ? "" : "s"}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.map((t: any) => {
                    const days = daysFromNow(t.deadline || t.expectedDelivery);
                    const tone: "red" | "orange" | "blue" =
                      days !== null && days < 0 ? "red" : days !== null && days <= 7 ? "orange" : "blue";
                    return (
                      <div key={t.id} style={{
                        padding: "10px 12px", backgroundColor: BG, borderRadius: 10, border: `1px solid ${DARK}06`,
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{t.service}</p>
                          <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                            {t.clientName} · {fmtDate(t.deadline || t.expectedDelivery)}
                          </p>
                        </div>
                        <StatusPill label={t.status} tone={tone} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const tasksQ = trpc.tasks.list.useQuery({ department: "bizdoc" }, { retry: false });
  const all = ((tasksQ.data || []) as any[]);

  const report = useMemo(() => {
    const active = all.filter(t => t.status !== "Completed");
    const overdue = active.filter(t => {
      const days = daysFromNow(t.deadline || t.expectedDelivery);
      return days !== null && days < 0;
    });
    const week = active.filter(t => {
      const days = daysFromNow(t.deadline || t.expectedDelivery);
      return days !== null && days >= 0 && days <= 7;
    });
    const completedThisMonth = all.filter(t => {
      if (t.status !== "Completed") return false;
      if (!t.completedAt) return false;
      const d = new Date(t.completedAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const uniqueClients = new Set(active.map(t => t.clientName));

    return `HAMZURY · Bizdoc Weekly Report
${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}

ACTIVE LOAD
 · Active clients:     ${uniqueClients.size}
 · Open tasks:         ${active.length}
 · Completed (month):  ${completedThisMonth.length}

URGENCY
 · Overdue:            ${overdue.length}
 · Due this week:      ${week.length}

TOP 5 OVERDUE
${overdue.slice(0, 5).map(t => ` · ${t.clientName} — ${t.service} — due ${fmtDate(t.deadline || t.expectedDelivery)}`).join("\n") || " · (none)"}

TOP 5 THIS WEEK
${week.slice(0, 5).map(t => ` · ${t.clientName} — ${t.service} — due ${fmtDate(t.deadline || t.expectedDelivery)}`).join("\n") || " · (none)"}

Built to Last.`;
  }, [all]);

  const copy = () => {
    navigator.clipboard.writeText(report).then(
      () => toast.success("Report copied to clipboard"),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  return (
    <div>
      <SectionTitle sub="Ready-to-paste weekly snapshot for CEO/Founder.">Reports</SectionTitle>

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
