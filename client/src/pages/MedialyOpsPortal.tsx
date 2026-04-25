import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { StaffUser } from "@/lib/types";
import {
  LayoutDashboard, Users, Calendar as CalendarIcon, CheckSquare,
  ListTodo, BarChart3, MessageSquare, FileText, Loader2,
  Plus, Trash2, Copy, CheckCircle2, Clock, AlertCircle, X,
  Instagram, Video as VideoIcon, Link2, Edit3, Send,
} from "lucide-react";
import { toast } from "sonner";
import OpsShell, { OpsCard, OpsKpi, OpsHeader } from "@/components/ops/OpsShell";
import PhaseTracker from "@/components/ops/PhaseTracker";
import AssetChecklist, { type AssetItem } from "@/components/ops/AssetChecklist";
import {
  readAll, insert, update, remove, touch, type OpsItem,
} from "@/lib/opsStore";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY MEDIALY OPS PORTAL — Hikma (lead) + Ahmad (content) + Salis (video).
 *
 * Social-media operations for HAMZURY's retainer clients.
 *
 * Tabs:
 *   1. Overview           — KPIs + weekly rhythm
 *   2. Clients/Workspaces — retainer cards, package tier, posts remaining
 *   3. Content Calendar   — posts by date/platform/status
 *   4. Approvals Queue    — Fri-submit → weekend-approve loop (CRITICAL)
 *   5. Tasks              — TSK-XXX rows for the 3-person team
 *   6. Performance        — weekly + monthly manual metrics
 *   7. Comms Log          — touchpoint history per client
 *   8. Reports            — copy-paste weekly CSO summary
 *
 * Storage: localStorage via opsStore, portal = "medialy"
 * Collections: clients | content | approvals | tasks | performance | comms | reports
 * ══════════════════════════════════════════════════════════════════════ */

/* ─── BRAND ──────────────────────────────────────────────────────────── */
const PORTAL = "medialy";
const BLUE = "#1D4ED8";         // Medialy accent — royal blue
const BLUE_SOFT = "#1D4ED815";
const BG = "#FFFAF6";           // HAMZURY milk
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GREEN = "#22C55E";
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const GOLD = "#B48C4C";

/* Role gate — redirect anyone not medialy/ceo/founder back to home */
const ALLOWED_ROLES = new Set([
  "founder", "ceo", "medialy_lead", "medialy_staff",
]);

/* ─── TYPES ──────────────────────────────────────────────────────────── */
type Section =
  | "overview" | "clients" | "calendar" | "approvals"
  | "tasks" | "performance" | "comms" | "reports";

type PackageTier = "Setup" | "Manage" | "Accelerate" | "Authority";
type Platform = "Instagram" | "TikTok" | "Facebook" | "LinkedIn" | "Twitter" | "YouTube";
type PostType = "Feed" | "Reel" | "Story" | "Carousel" | "Flyer" | "Video";
type ContentStatus = "Draft" | "Review" | "Approved" | "Scheduled" | "Posted";
type PayStatus = "Paid" | "Due" | "Overdue";
type Assignee = "Hikma" | "Ahmad" | "Salis";
type TaskType = "Content Creation" | "Photography" | "Reporting" | "Meeting" | "Editing" | "Admin";
type TaskStatus = "Not Started" | "In Progress" | "Done" | "Blocked";
type CommsType = "WhatsApp" | "Video Call" | "Email" | "Phone" | "In Person";

type ClientRow = OpsItem & {
  name: string;
  brand?: string;
  tier: PackageTier;
  monthlyFee: number;
  platforms: Platform[];
  postsPerMonth: number;
  postsRemaining: number;
  paymentStatus: PayStatus;
  nextPaymentDue?: string;
  satisfaction: number; // 1-5
  startedAt?: string;
  notes?: string;
};

type ContentRow = OpsItem & {
  clientId: string;
  date: string;          // post date
  platform: Platform;
  type: PostType;
  caption: string;
  hashtags: string;
  assetLink?: string;
  status: ContentStatus;
  postTime?: string;
  assignee: Assignee;
  likes?: number;
  comments?: number;
  shares?: number;
  engagementPct?: number;
};

type ApprovalRow = OpsItem & {
  ref: string;                // CNT-XXX
  clientId: string;
  clientName: string;
  weekLabel: string;          // "Week 12"
  itemCount: number;
  previewLink?: string;
  submittedAt?: string;
  feedback?: string;
  revisionCount: number;
  approvedAt?: string;
  status: "Pending" | "Changes Requested" | "Approved" | "Rejected";
};

type TaskRow = OpsItem & {
  ref: string;                // TSK-XXX
  title: string;
  type: TaskType;
  clientId?: string;
  assignee: Assignee;
  dueDate: string;
  status: TaskStatus;
  notes?: string;
};

type PerfRow = OpsItem & {
  clientId: string;
  period: "Week" | "Month";
  label: string;              // e.g. "2026-W17" or "April 2026"
  reach: number;
  engagement: number;
  followerGrowthPct: number;
  bestPost?: string;
  worstPost?: string;
  platformBreakdown?: string;
  bestContentType?: PostType;
};

type CommsRow = OpsItem & {
  clientId: string;
  when: string;
  type: CommsType;
  summary: string;
  followUpOn?: string;
  owner: Assignee;
};

type ReportRow = OpsItem & {
  label: string;
  weekOf: string;
  body: string;
};

/* ─── UTIL ───────────────────────────────────────────────────────────── */

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return String(d); }
}

function fmtMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return "₦" + Math.round(n).toLocaleString();
}

function todayISO(): string {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function weekLabel(d: Date = new Date()): string {
  const year = d.getFullYear();
  const onejan = new Date(year, 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function nextRef(rows: { ref?: string }[], prefix: string): string {
  const nums = rows
    .map(r => {
      const m = (r.ref || "").match(new RegExp(`${prefix}-(\\d+)`));
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(n => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

const TIER_FEES: Record<PackageTier, number> = {
  Setup: 50_000,
  Manage: 150_000,
  Accelerate: 300_000,
  Authority: 500_000,
};

const TIER_POSTS: Record<PackageTier, number> = {
  Setup: 0,
  Manage: 12,
  Accelerate: 20,
  Authority: 30,
};

/* ─── SHARED UI ──────────────────────────────────────────────────────── */

function Pill({ label, tone = "muted" }: { label: string; tone?: "green" | "blue" | "red" | "orange" | "muted" | "gold" }) {
  const MAP = {
    green: { bg: `${GREEN}18`, fg: GREEN },
    blue: { bg: BLUE_SOFT, fg: BLUE },
    red: { bg: `${RED}15`, fg: RED },
    orange: { bg: `${ORANGE}18`, fg: ORANGE },
    muted: { bg: "#9CA3AF25", fg: MUTED },
    gold: { bg: `${GOLD}18`, fg: GOLD },
  }[tone];
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 10, fontSize: 10,
      fontWeight: 700, backgroundColor: MAP.bg, color: MAP.fg,
      textTransform: "uppercase", letterSpacing: "0.04em",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function StatusTone(s: ContentStatus | TaskStatus | ApprovalRow["status"] | PayStatus):
  "green" | "blue" | "red" | "orange" | "muted" | "gold" {
  switch (s) {
    case "Posted":
    case "Done":
    case "Approved":
    case "Paid":
      return "green";
    case "Scheduled":
    case "In Progress":
      return "blue";
    case "Review":
    case "Pending":
    case "Not Started":
    case "Due":
      return "orange";
    case "Changes Requested":
      return "gold";
    case "Rejected":
    case "Blocked":
    case "Overdue":
      return "red";
    case "Draft":
    default:
      return "muted";
  }
}

function EmptyState({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <Icon size={28} style={{ color: BLUE, opacity: 0.35, marginBottom: 12 }} />
      <p style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{title}</p>
      {hint && <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function BlueButton({ children, onClick, icon: Icon, variant = "solid", type = "button" }: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ElementType;
  variant?: "solid" | "ghost";
  type?: "button" | "submit";
}) {
  const solid = variant === "solid";
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "8px 14px", borderRadius: 10,
        fontSize: 12, fontWeight: 600,
        backgroundColor: solid ? BLUE : "transparent",
        color: solid ? WHITE : BLUE,
        border: solid ? "none" : `1px solid ${BLUE}40`,
        cursor: "pointer",
      }}
    >
      {Icon && <Icon size={13} />} {children}
    </button>
  );
}

function TextField({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "time" | "number" | "email" | "url";
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "9px 11px", borderRadius: 8,
          border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
          backgroundColor: WHITE, outline: "none", fontWeight: 400,
          textTransform: "none", letterSpacing: 0,
        }}
      />
    </label>
  );
}

function TextArea({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "9px 11px", borderRadius: 8, resize: "vertical",
          border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
          backgroundColor: WHITE, outline: "none", fontWeight: 400,
          fontFamily: "inherit",
          textTransform: "none", letterSpacing: 0,
        }}
      />
    </label>
  );
}

function Select<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        style={{
          padding: "9px 11px", borderRadius: 8,
          border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
          backgroundColor: WHITE, outline: "none", fontWeight: 400,
          textTransform: "none", letterSpacing: 0,
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Modal({ open, onClose, title, children, width = 520 }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: width, maxHeight: "90vh",
          backgroundColor: WHITE, borderRadius: 16,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${DARK}10`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{title}</p>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, border: "none",
            backgroundColor: `${DARK}08`, color: DARK, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={14} /></button>
        </div>
        <div style={{ padding: 18, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════ */
export default function MedialyOpsPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("overview");

  /* role gate (soft — portal still loads then redirects if unauthorised) */
  useEffect(() => {
    if (loading) return;
    const role = ((user as StaffUser | null)?.hamzuryRole || "").toLowerCase();
    if (!user || !ALLOWED_ROLES.has(role)) {
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
  }, [loading, user]);

  /* bump state to force re-reads from opsStore */
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener("opsStoreChange", handler);
    return () => window.removeEventListener("opsStoreChange", handler);
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: BLUE }} />
      </div>
    );
  }
  if (!user) return null;

  const NAV = [
    { key: "overview", icon: LayoutDashboard, label: "Overview" },
    { key: "clients", icon: Users, label: "Clients" },
    { key: "calendar", icon: CalendarIcon, label: "Content Calendar" },
    { key: "approvals", icon: CheckSquare, label: "Approvals Queue" },
    { key: "tasks", icon: ListTodo, label: "Tasks" },
    { key: "performance", icon: BarChart3, label: "Performance" },
    { key: "comms", icon: MessageSquare, label: "Comms Log" },
    { key: "reports", icon: FileText, label: "Reports" },
  ];

  const staff = user as StaffUser;
  const userName = staff.displayName || staff.name || "Staff";

  return (
    <OpsShell
      title="Medialy"
      subtitle="Social-media operations — Hikma, Ahmad, Salis."
      brand={{ name: "Medialy", accent: "#9BB9FF", bg: BLUE }}
      nav={NAV}
      active={active}
      onChange={(k) => setActive(k as Section)}
      logoSmall="HAMZURY"
      logoLarge="Medialy Ops"
      userName={userName}
      roleLabel="SOCIAL MEDIA"
      onLogout={logout}
      pageTitle="Medialy Ops — HAMZURY"
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unused-expressions */}
      {tick >= 0 && null /* re-render key */}

      {active === "overview" && <OverviewSection onGoto={setActive} />}
      {active === "clients" && <ClientsSection />}
      {active === "calendar" && <CalendarSection />}
      {active === "approvals" && <ApprovalsSection />}
      {active === "tasks" && <TasksSection userName={userName} />}
      {active === "performance" && <PerformanceSection />}
      {active === "comms" && <CommsSection />}
      {active === "reports" && <ReportsSection />}
    </OpsShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 1. OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════ */
function OverviewSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const content = readAll<ContentRow>(PORTAL, "content");
  const approvals = readAll<ApprovalRow>(PORTAL, "approvals");
  const tasks = readAll<TaskRow>(PORTAL, "tasks");
  const perf = readAll<PerfRow>(PORTAL, "performance");

  const activeClients = clients.filter(c => c.paymentStatus !== "Overdue");
  const monthlyRecurring = activeClients
    .filter(c => c.tier !== "Setup")
    .reduce((sum, c) => sum + (c.monthlyFee || 0), 0);

  // Posts completed this week (status Posted and date within last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const postsThisWeek = content.filter(c => {
    if (c.status !== "Posted") return false;
    try {
      return new Date(c.date).getTime() >= weekAgo.getTime();
    } catch { return false; }
  }).length;

  const submitted = approvals.length;
  const approved = approvals.filter(a => a.status === "Approved").length;
  const approvalRate = submitted === 0 ? 0 : Math.round((approved / submitted) * 100);

  const followerAvg = perf.length === 0
    ? 0
    : Math.round(
        perf.reduce((s, p) => s + (Number(p.followerGrowthPct) || 0), 0) / perf.length * 10
      ) / 10;

  // Engagement % = avg of all content engagementPct where > 0
  const engaged = content.filter(c => (c.engagementPct || 0) > 0);
  const engagementAvg = engaged.length === 0
    ? 0
    : Math.round(
        engaged.reduce((s, c) => s + (c.engagementPct || 0), 0) / engaged.length * 10
      ) / 10;

  // On-time delivery = % of posts where status is Posted or Scheduled on/before date
  const due = content.filter(c => c.status !== "Draft" && c.status !== "Review");
  const onTime = due.filter(c => {
    if (!c.date) return true;
    try {
      const d = new Date(c.date).getTime();
      return d >= new Date(c.updatedAt).getTime() || c.status === "Posted";
    } catch { return true; }
  }).length;
  const onTimePct = due.length === 0 ? 100 : Math.round((onTime / due.length) * 100);

  const pendingApprovals = approvals.filter(a => a.status === "Pending" || a.status === "Changes Requested").length;
  const tasksOpen = tasks.filter(t => t.status !== "Done").length;

  const kpis = [
    { label: "Monthly Recurring", value: fmtMoney(monthlyRecurring), sub: `${activeClients.length} retainer${activeClients.length === 1 ? "" : "s"}`, go: "clients" as Section },
    { label: "Posts This Week", value: postsThisWeek, sub: "published", go: "calendar" as Section },
    { label: "Approval Rate", value: approvalRate + "%", sub: `${approved}/${submitted} submitted`, go: "approvals" as Section },
    { label: "Follower Growth", value: followerAvg + "%", sub: "avg (manual)", go: "performance" as Section },
    { label: "Engagement %", value: engagementAvg + "%", sub: `across ${engaged.length} posts`, go: "performance" as Section },
    { label: "On-Time Delivery", value: onTimePct + "%", sub: `${due.length} shipped`, go: "calendar" as Section },
    { label: "Approvals Open", value: pendingApprovals, sub: "awaiting client", go: "approvals" as Section },
    { label: "Tasks Open", value: tasksOpen, sub: "across team", go: "tasks" as Section },
  ];

  const rhythm = [
    { day: "Monday", title: "Plan + Schedule", text: "Hikma plans the week's content; scheduling approved posts from last week." },
    { day: "Tue–Thu", title: "Create", text: "Ahmad makes carousels, flyers, posts, reels, B-rolls. Salis edits videos." },
    { day: "Friday", title: "Submit", text: "Hikma reviews at 10am; sends to client for approval at 2pm." },
    { day: "Weekend", title: "Approve", text: "Client reviews. Feedback by Sunday evening." },
    { day: "Monday", title: "Ship", text: "Approved content goes live. Loop restarts." },
  ];

  return (
    <div>
      <OpsHeader
        title="Medialy Overview"
        sub="Retainers, posts, approvals, growth — all in one glance."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
        {kpis.map(k => (
          <button key={k.label} onClick={() => onGoto(k.go)}
            style={{ textAlign: "left", border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
            <OpsKpi label={k.label} value={k.value} sub={k.sub} accent={BLUE} />
          </button>
        ))}
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <CalendarIcon size={14} style={{ color: BLUE }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Weekly Rhythm
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {rhythm.map((r, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 12,
              backgroundColor: BG, border: `1px solid ${DARK}08`,
            }}>
              <p style={{ fontSize: 10, color: BLUE, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {r.day}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: DARK, marginTop: 2 }}>{r.title}</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </OpsCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        <OpsCard>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
            Team
          </p>
          <TeamRow name="Hikma Suleiman" role="Lead · Strategy · Client" color={BLUE} />
          <TeamRow name="Ahmad" role="Content Creator · Carousels · Reels" color={GOLD} />
          <TeamRow name="Salis" role="Video Unit · Editing · Voicing" color={GREEN} />
        </OpsCard>

        <OpsCard>
          <p style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
            Packages
          </p>
          <TierRow tier="Setup" monthly="₦50k once" />
          <TierRow tier="Manage" monthly="₦150k / month · 12 posts" />
          <TierRow tier="Accelerate" monthly="₦300k / month · 20 posts" />
          <TierRow tier="Authority" monthly="₦500k / month · 30 posts" />
        </OpsCard>
      </div>
    </div>
  );
}

function TeamRow({ name, role, color }: { name: string; role: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 0", borderBottom: `1px solid ${DARK}06`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: `${color}15`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
      }}>{name[0]}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{name}</p>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>{role}</p>
      </div>
    </div>
  );
}

function TierRow({ tier, monthly }: { tier: string; monthly: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 0", borderBottom: `1px solid ${DARK}06`,
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{tier}</p>
      <p style={{ fontSize: 11, color: MUTED }}>{monthly}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2. CLIENTS / WORKSPACES
 * ═══════════════════════════════════════════════════════════════════════ */
function ClientsSection() {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const [addOpen, setAddOpen] = useState(false);
  const [drillId, setDrillId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.brand || "").toLowerCase().includes(q) ||
      c.tier.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const drill = drillId ? clients.find(c => c.id === drillId) : null;

  return (
    <div>
      <OpsHeader
        title="Client Workspaces"
        sub="One card per retainer. Click any card to drill into their workspace."
        action={
          <BlueButton icon={Plus} onClick={() => setAddOpen(true)}>
            Add Client
          </BlueButton>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search by name, brand, or tier…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
            backgroundColor: WHITE, outline: "none",
          }}
        />
      </OpsCard>

      {filtered.length === 0 ? (
        <OpsCard>
          <EmptyState icon={Users} title="No clients yet" hint="Add your first Medialy retainer to get started." />
        </OpsCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map(c => (
            <ClientCard key={c.id} row={c} onOpen={() => setDrillId(c.id)} />
          ))}
        </div>
      )}

      <AddClientModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ClientDrillModal open={!!drill} onClose={() => setDrillId(null)} row={drill} />
    </div>
  );
}

function ClientCard({ row, onOpen }: { row: ClientRow; onOpen: () => void }) {
  const utilisation = row.postsPerMonth === 0
    ? 0
    : Math.max(0, Math.min(100, Math.round(((row.postsPerMonth - row.postsRemaining) / row.postsPerMonth) * 100)));

  return (
    <button
      onClick={onOpen}
      style={{
        textAlign: "left", width: "100%", cursor: "pointer",
        backgroundColor: WHITE, borderRadius: 14, padding: 16,
        border: `1px solid ${DARK}10`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{row.name}</p>
          {row.brand && (
            <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{row.brand}</p>
          )}
        </div>
        <Pill label={row.tier} tone="blue" />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {row.platforms.map(p => (
          <span key={p} style={{
            fontSize: 10, padding: "2px 6px", borderRadius: 6,
            backgroundColor: BG, color: MUTED, fontWeight: 600,
          }}>{p}</span>
        ))}
      </div>

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: BLUE }}>
            {fmtMoney(row.monthlyFee)}
          </p>
          <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
            {row.tier === "Setup" ? "One-off setup" : "per month"}
          </p>
        </div>
        <Pill label={row.paymentStatus} tone={StatusTone(row.paymentStatus)} />
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: MUTED, marginBottom: 4,
        }}>
          <span>Posts used this cycle</span>
          <span>{row.postsPerMonth - row.postsRemaining} / {row.postsPerMonth}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, backgroundColor: `${DARK}08`, overflow: "hidden" }}>
          <div style={{ width: utilisation + "%", height: "100%", backgroundColor: BLUE, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{
            fontSize: 14,
            color: n <= row.satisfaction ? "#FBBF24" : `${DARK}20`,
          }}>★</span>
        ))}
        <span style={{ fontSize: 11, color: MUTED, marginLeft: 6 }}>
          satisfaction
        </span>
      </div>
    </button>
  );
}

function AddClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [tier, setTier] = useState<PackageTier>("Manage");
  const [platformsStr, setPlatformsStr] = useState("Instagram");
  const [paymentStatus, setPaymentStatus] = useState<PayStatus>("Paid");
  const [satisfaction, setSatisfaction] = useState(5);

  function reset() {
    setName(""); setBrand(""); setTier("Manage");
    setPlatformsStr("Instagram"); setPaymentStatus("Paid"); setSatisfaction(5);
  }

  function submit() {
    if (!name.trim()) { toast.error("Client name required"); return; }
    const fee = TIER_FEES[tier];
    const posts = TIER_POSTS[tier];
    const platforms = platformsStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean) as Platform[];

    insert<ClientRow>(PORTAL, "clients", {
      name: name.trim(),
      brand: brand.trim() || undefined,
      tier,
      monthlyFee: fee,
      platforms,
      postsPerMonth: posts,
      postsRemaining: posts,
      paymentStatus,
      satisfaction,
      startedAt: todayISO(),
    });
    toast.success("Client added");
    touch(PORTAL, "clients");
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Retainer Client">
      <div style={{ display: "grid", gap: 12 }}>
        <TextField label="Client Name" value={name} onChange={setName} placeholder="Aisha Yusuf" />
        <TextField label="Brand / Business" value={brand} onChange={setBrand} placeholder="Aisha Fabrics" />
        <Select<PackageTier>
          label="Package Tier"
          value={tier}
          onChange={setTier}
          options={["Setup", "Manage", "Accelerate", "Authority"]}
        />
        <TextField
          label="Platforms (comma-separated)"
          value={platformsStr}
          onChange={setPlatformsStr}
          placeholder="Instagram, TikTok, Facebook"
        />
        <Select<PayStatus>
          label="Payment"
          value={paymentStatus}
          onChange={setPaymentStatus}
          options={["Paid", "Due", "Overdue"]}
        />
        <TextField
          label="Satisfaction (1-5)"
          type="number"
          value={String(satisfaction)}
          onChange={v => setSatisfaction(Math.max(1, Math.min(5, parseInt(v, 10) || 1)))}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <BlueButton variant="ghost" onClick={onClose}>Cancel</BlueButton>
          <BlueButton onClick={submit} icon={Plus}>Add Client</BlueButton>
        </div>
      </div>
    </Modal>
  );
}

function ClientDrillModal({ open, onClose, row }: {
  open: boolean;
  onClose: () => void;
  row: ClientRow | null | undefined;
}) {
  if (!row) return <Modal open={open} onClose={onClose} title="Workspace">—</Modal>;
  const client: ClientRow = row;

  const content = readAll<ContentRow>(PORTAL, "content").filter(c => c.clientId === client.id);
  const approvals = readAll<ApprovalRow>(PORTAL, "approvals").filter(a => a.clientId === client.id);
  const comms = readAll<CommsRow>(PORTAL, "comms").filter(c => c.clientId === client.id);

  function del() {
    if (!window.confirm(`Remove ${client.name}? This will not delete linked content.`)) return;
    remove(PORTAL, "clients", client.id);
    touch(PORTAL, "clients");
    toast.success("Client removed");
    onClose();
  }

  function setPay(s: PayStatus) {
    update<ClientRow>(PORTAL, "clients", client.id, { paymentStatus: s });
    touch(PORTAL, "clients");
  }
  function setRemaining(delta: number) {
    update<ClientRow>(PORTAL, "clients", client.id, {
      postsRemaining: Math.max(0, (client.postsRemaining || 0) + delta),
    });
    touch(PORTAL, "clients");
  }

  return (
    <Modal open={open} onClose={onClose} title={row.name} width={640}>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Pill label={row.tier} tone="blue" />
          <Pill label={row.paymentStatus} tone={StatusTone(row.paymentStatus)} />
          <span style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>
            {fmtMoney(row.monthlyFee)}
          </span>
          {row.brand && <span style={{ fontSize: 12, color: MUTED }}>{row.brand}</span>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <Mini label="Posts / mo" value={row.postsPerMonth} />
          <Mini label="Remaining" value={row.postsRemaining} />
          <Mini label="Platforms" value={row.platforms.length} />
        </div>

        <OpsCard style={{ padding: 14 }}>
          <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Quick Actions
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <BlueButton variant="ghost" onClick={() => setRemaining(-1)}>−1 post</BlueButton>
            <BlueButton variant="ghost" onClick={() => setRemaining(1)}>+1 post</BlueButton>
            <BlueButton variant="ghost" onClick={() => setPay("Paid")}>Mark Paid</BlueButton>
            <BlueButton variant="ghost" onClick={() => setPay("Due")}>Mark Due</BlueButton>
            <BlueButton variant="ghost" onClick={() => setPay("Overdue")}>Mark Overdue</BlueButton>
          </div>
        </OpsCard>

        <OpsCard style={{ padding: 14 }}>
          <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Recent Content ({content.length})
          </p>
          {content.length === 0 ? (
            <p style={{ fontSize: 12, color: MUTED }}>No content yet for this client.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {content.slice(0, 5).map(c => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", backgroundColor: BG, borderRadius: 8, gap: 8,
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {c.platform} · {c.type}
                    </p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{fmtDate(c.date)}</p>
                  </div>
                  <Pill label={c.status} tone={StatusTone(c.status)} />
                </div>
              ))}
            </div>
          )}
        </OpsCard>

        <OpsCard style={{ padding: 14 }}>
          <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Approvals ({approvals.length})
          </p>
          {approvals.length === 0 ? (
            <p style={{ fontSize: 12, color: MUTED }}>No approval submissions yet.</p>
          ) : (
            approvals.slice(0, 3).map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 0", borderBottom: `1px solid ${DARK}08`, gap: 8,
              }}>
                <p style={{ fontSize: 12, color: DARK }}>
                  {a.ref} · {a.weekLabel} · {a.itemCount} items
                </p>
                <Pill label={a.status} tone={StatusTone(a.status)} />
              </div>
            ))
          )}
        </OpsCard>

        <OpsCard style={{ padding: 14 }}>
          <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Comms ({comms.length})
          </p>
          {comms.length === 0 ? (
            <p style={{ fontSize: 12, color: MUTED }}>No touchpoints logged.</p>
          ) : (
            comms.slice(0, 4).map(c => (
              <div key={c.id} style={{
                padding: "6px 0", borderBottom: `1px solid ${DARK}08`,
              }}>
                <p style={{ fontSize: 12, color: DARK, fontWeight: 500 }}>{c.summary}</p>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                  {c.type} · {fmtDate(c.when)} · {c.owner}
                </p>
              </div>
            ))
          )}
        </OpsCard>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <button onClick={del} style={{
            fontSize: 12, color: RED, border: "none", background: "transparent", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600,
          }}><Trash2 size={12} /> Delete Client</button>
          <BlueButton onClick={onClose} variant="ghost">Close</BlueButton>
        </div>
      </div>
    </Modal>
  );
}

function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 10,
      backgroundColor: BG, border: `1px solid ${DARK}06`,
    }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: DARK }}>{value}</p>
      <p style={{ fontSize: 10, color: MUTED, marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3. CONTENT CALENDAR
 * ═══════════════════════════════════════════════════════════════════════ */
function CalendarSection() {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const content = readAll<ContentRow>(PORTAL, "content");
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<"list" | "phase">("list");
  const [filterStatus, setFilterStatus] = useState<"All" | ContentStatus>("All");
  const [filterClient, setFilterClient] = useState<"All" | string>("All");

  const filtered = content.filter(c =>
    (filterStatus === "All" || c.status === filterStatus) &&
    (filterClient === "All" || c.clientId === filterClient)
  );

  const sorted = [...filtered].sort((a, b) => {
    try {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } catch { return 0; }
  });

  const phases = [
    { id: "Draft", label: "Draft" },
    { id: "Review", label: "Review" },
    { id: "Approved", label: "Approved" },
    { id: "Scheduled", label: "Scheduled" },
    { id: "Posted", label: "Posted" },
  ];

  const counts = content.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <OpsHeader
        title="Content Calendar"
        sub="Every post across every client. Drafting → scheduling → posting."
        action={
          <BlueButton icon={Plus} onClick={() => setAddOpen(true)}>
            New Post
          </BlueButton>
        }
      />

      <OpsCard style={{ marginBottom: 14 }}>
        <PhaseTracker
          phases={phases}
          currentPhaseId="Posted"
          counts={counts}
          accent={BLUE}
          label="Content Pipeline"
        />
      </OpsCard>

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <Select
            label="Status"
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as "All" | ContentStatus)}
            options={["All", "Draft", "Review", "Approved", "Scheduled", "Posted"] as const}
          />
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Client
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              style={{
                padding: "9px 11px", borderRadius: 8,
                border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
                backgroundColor: WHITE, outline: "none", fontWeight: 400,
                textTransform: "none", letterSpacing: 0,
              }}
            >
              <option value="All">All clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <BlueButton
              variant={view === "list" ? "solid" : "ghost"}
              onClick={() => setView("list")}
            >List</BlueButton>
            <BlueButton
              variant={view === "phase" ? "solid" : "ghost"}
              onClick={() => setView("phase")}
            >By Phase</BlueButton>
          </div>
        </div>
      </OpsCard>

      {sorted.length === 0 ? (
        <OpsCard><EmptyState icon={CalendarIcon} title="No content yet" hint="Add your first post to start the pipeline." /></OpsCard>
      ) : view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map(c => (
            <ContentRowCard key={c.id} row={c} clients={clients} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {phases.map(p => {
            const items = sorted.filter(c => c.status === p.id);
            return (
              <OpsCard key={p.id} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{p.label}</p>
                  <Pill label={String(items.length)} tone="blue" />
                </div>
                {items.length === 0 ? (
                  <p style={{ fontSize: 11, color: MUTED }}>—</p>
                ) : (
                  items.map(c => (
                    <div key={c.id} style={{
                      padding: "8px 10px", backgroundColor: BG,
                      borderRadius: 8, marginBottom: 6,
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                        {c.platform} · {c.type}
                      </p>
                      <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        {clients.find(cl => cl.id === c.clientId)?.name || "—"} · {fmtDate(c.date)}
                      </p>
                    </div>
                  ))
                )}
              </OpsCard>
            );
          })}
        </div>
      )}

      <AddContentModal open={addOpen} onClose={() => setAddOpen(false)} clients={clients} />
    </div>
  );
}

function ContentRowCard({ row, clients }: { row: ContentRow; clients: ClientRow[] }) {
  const [open, setOpen] = useState(false);
  const clientName = clients.find(c => c.id === row.clientId)?.name || "—";

  function advance() {
    const order: ContentStatus[] = ["Draft", "Review", "Approved", "Scheduled", "Posted"];
    const idx = order.indexOf(row.status);
    const next = order[Math.min(order.length - 1, idx + 1)];
    update<ContentRow>(PORTAL, "content", row.id, { status: next });
    touch(PORTAL, "content");
    toast.success(`Moved to ${next}`);
  }

  function del() {
    if (!window.confirm("Delete this content item?")) return;
    remove(PORTAL, "content", row.id);
    touch(PORTAL, "content");
  }

  const Icon = row.platform === "Instagram" ? Instagram
    : row.platform === "TikTok" || row.type === "Reel" || row.type === "Video" ? VideoIcon
    : CalendarIcon;

  return (
    <div style={{
      backgroundColor: WHITE, borderRadius: 12,
      border: `1px solid ${DARK}08`, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "12px 14px", border: "none",
          background: "transparent", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 12,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: BLUE_SOFT, color: BLUE,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}><Icon size={15} /></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
              {row.platform} · {row.type}
            </p>
            <Pill label={row.status} tone={StatusTone(row.status)} />
          </div>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {clientName} · {fmtDate(row.date)}{row.postTime ? ` · ${row.postTime}` : ""} · {row.assignee}
          </p>
        </div>
      </button>

      {open && (
        <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${DARK}06` }}>
          {row.caption && (
            <p style={{ fontSize: 12, color: DARK, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{row.caption}</p>
          )}
          {row.hashtags && (
            <p style={{ fontSize: 11, color: BLUE, marginTop: 6 }}>{row.hashtags}</p>
          )}
          {row.assetLink && (
            <a href={row.assetLink} target="_blank" rel="noreferrer" style={{
              fontSize: 11, color: BLUE, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
            }}><Link2 size={11} /> Open asset</a>
          )}
          {row.status === "Posted" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
              <Mini label="Likes" value={row.likes ?? 0} />
              <Mini label="Comments" value={row.comments ?? 0} />
              <Mini label="Shares" value={row.shares ?? 0} />
              <Mini label="Engage %" value={(row.engagementPct ?? 0) + "%"} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {row.status !== "Posted" && (
              <BlueButton onClick={advance} icon={CheckCircle2}>Advance</BlueButton>
            )}
            <button onClick={del} style={{
              fontSize: 11, color: RED, border: "none", background: "transparent",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600,
            }}><Trash2 size={11} /> Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddContentModal({ open, onClose, clients }: {
  open: boolean; onClose: () => void; clients: ClientRow[];
}) {
  const [clientId, setClientId] = useState<string>("");
  const [date, setDate] = useState(todayISO());
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [type, setType] = useState<PostType>("Feed");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [assetLink, setAssetLink] = useState("");
  const [status, setStatus] = useState<ContentStatus>("Draft");
  const [postTime, setPostTime] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("Ahmad");

  useEffect(() => {
    if (open && clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [open, clients, clientId]);

  function submit() {
    if (!clientId) { toast.error("Select a client"); return; }
    insert<ContentRow>(PORTAL, "content", {
      clientId, date, platform, type,
      caption: caption.trim(), hashtags: hashtags.trim(),
      assetLink: assetLink.trim() || undefined,
      status, postTime: postTime || undefined,
      assignee,
    });
    toast.success("Content added");
    touch(PORTAL, "content");
    setCaption(""); setHashtags(""); setAssetLink("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Content Item">
      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Add a client first" hint="Content must be linked to a retainer client." />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Client
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{
                padding: "9px 11px", borderRadius: 8,
                border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
                backgroundColor: WHITE, outline: "none", fontWeight: 400,
                textTransform: "none", letterSpacing: 0,
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TextField label="Post Date" type="date" value={date} onChange={setDate} />
            <TextField label="Post Time" type="time" value={postTime} onChange={setPostTime} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Select<Platform>
              label="Platform"
              value={platform}
              onChange={setPlatform}
              options={["Instagram", "TikTok", "Facebook", "LinkedIn", "Twitter", "YouTube"]}
            />
            <Select<PostType>
              label="Type"
              value={type}
              onChange={setType}
              options={["Feed", "Reel", "Story", "Carousel", "Flyer", "Video"]}
            />
          </div>

          <TextArea label="Caption" value={caption} onChange={setCaption} placeholder="Write the full caption here…" rows={4} />
          <TextField label="Hashtags" value={hashtags} onChange={setHashtags} placeholder="#brand #niche" />
          <TextField label="Asset Link (Drive / Canva)" type="url" value={assetLink} onChange={setAssetLink} placeholder="https://…" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Select<ContentStatus>
              label="Status"
              value={status}
              onChange={setStatus}
              options={["Draft", "Review", "Approved", "Scheduled", "Posted"]}
            />
            <Select<Assignee>
              label="Assignee"
              value={assignee}
              onChange={setAssignee}
              options={["Hikma", "Ahmad", "Salis"]}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <BlueButton variant="ghost" onClick={onClose}>Cancel</BlueButton>
            <BlueButton onClick={submit} icon={Plus}>Add Post</BlueButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 4. APPROVALS QUEUE
 * ═══════════════════════════════════════════════════════════════════════ */
function ApprovalsSection() {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const approvals = readAll<ApprovalRow>(PORTAL, "approvals");
  const [addOpen, setAddOpen] = useState(false);

  const pending = approvals.filter(a => a.status === "Pending" || a.status === "Changes Requested");
  const approved = approvals.filter(a => a.status === "Approved");
  const rejected = approvals.filter(a => a.status === "Rejected");

  return (
    <div>
      <OpsHeader
        title="Approvals Queue"
        sub="The Friday-submit → Weekend-approve loop. This is the critical tab."
        action={
          <BlueButton icon={Send} onClick={() => setAddOpen(true)}>
            New Submission
          </BlueButton>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
        <OpsKpi label="Pending" value={pending.length} sub="awaiting client" accent={ORANGE} />
        <OpsKpi label="Approved" value={approved.length} sub="ready to ship" accent={GREEN} />
        <OpsKpi label="Rejected" value={rejected.length} sub="rework needed" accent={RED} />
        <OpsKpi label="Total" value={approvals.length} sub="submissions" accent={BLUE} />
      </div>

      {approvals.length === 0 ? (
        <OpsCard><EmptyState icon={CheckSquare} title="No submissions yet" hint="Package a week of content and send it to a client for approval." /></OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {approvals.map(a => (
            <ApprovalCard key={a.id} row={a} clients={clients} />
          ))}
        </div>
      )}

      <AddApprovalModal open={addOpen} onClose={() => setAddOpen(false)} clients={clients} approvals={approvals} />
    </div>
  );
}

function ApprovalCard({ row, clients }: { row: ApprovalRow; clients: ClientRow[] }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(row.feedback || "");
  const clientName = clients.find(c => c.id === row.clientId)?.name || row.clientName || "—";

  function setStatus(s: ApprovalRow["status"]) {
    update<ApprovalRow>(PORTAL, "approvals", row.id, {
      status: s,
      approvedAt: s === "Approved" ? todayISO() : row.approvedAt,
    });
    touch(PORTAL, "approvals");
    toast.success(`Marked ${s}`);
  }

  function bumpRevisions() {
    update<ApprovalRow>(PORTAL, "approvals", row.id, {
      revisionCount: (row.revisionCount || 0) + 1,
      feedback,
      status: "Changes Requested",
    });
    touch(PORTAL, "approvals");
    toast.success("Revision logged");
  }

  function del() {
    if (!window.confirm(`Delete submission ${row.ref}?`)) return;
    remove(PORTAL, "approvals", row.id);
    touch(PORTAL, "approvals");
  }

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: 12, border: `1px solid ${DARK}08`, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "12px 14px", border: "none",
        background: "transparent", cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: DARK, fontFamily: "monospace" }}>{row.ref}</p>
            <Pill label={row.status} tone={StatusTone(row.status)} />
            {row.revisionCount > 0 && <Pill label={`${row.revisionCount} rev`} tone="gold" />}
          </div>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
            {clientName} · {row.weekLabel} · {row.itemCount} items
          </p>
          {row.submittedAt && (
            <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
              Submitted {fmtDate(row.submittedAt)}
              {row.approvedAt && ` · Approved ${fmtDate(row.approvedAt)}`}
            </p>
          )}
        </div>
        {row.previewLink && (
          <a href={row.previewLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ fontSize: 11, color: BLUE, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Link2 size={11} /> Preview
          </a>
        )}
      </button>

      {open && (
        <div style={{ padding: "10px 14px 14px", borderTop: `1px solid ${DARK}06` }}>
          <TextArea
            label="Client Feedback"
            value={feedback}
            onChange={setFeedback}
            placeholder="Paste client's feedback here…"
            rows={3}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <BlueButton icon={CheckCircle2} onClick={() => setStatus("Approved")}>Mark Approved</BlueButton>
            <BlueButton variant="ghost" icon={Edit3} onClick={bumpRevisions}>+1 Revision</BlueButton>
            <BlueButton variant="ghost" onClick={() => setStatus("Rejected")}>Rejected</BlueButton>
            <BlueButton variant="ghost" onClick={() => setStatus("Pending")}>Re-submit</BlueButton>
            <button onClick={del} style={{
              fontSize: 11, color: RED, border: "none", background: "transparent",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600,
            }}><Trash2 size={11} /> Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddApprovalModal({ open, onClose, clients, approvals }: {
  open: boolean; onClose: () => void;
  clients: ClientRow[]; approvals: ApprovalRow[];
}) {
  const [clientId, setClientId] = useState<string>("");
  const [weekLabelV, setWeekLabelV] = useState(weekLabel());
  const [itemCount, setItemCount] = useState(5);
  const [previewLink, setPreviewLink] = useState("");

  useEffect(() => {
    if (open && clients.length > 0 && !clientId) setClientId(clients[0].id);
  }, [open, clients, clientId]);

  function submit() {
    if (!clientId) { toast.error("Select a client"); return; }
    const client = clients.find(c => c.id === clientId);
    insert<ApprovalRow>(PORTAL, "approvals", {
      ref: nextRef(approvals, "CNT"),
      clientId,
      clientName: client?.name || "—",
      weekLabel: weekLabelV,
      itemCount,
      previewLink: previewLink.trim() || undefined,
      submittedAt: todayISO(),
      revisionCount: 0,
      status: "Pending",
    });
    toast.success("Submission logged");
    touch(PORTAL, "approvals");
    setPreviewLink("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Approval Submission">
      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Add a client first" />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Client
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{
                padding: "9px 11px", borderRadius: 8,
                border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
                backgroundColor: WHITE, outline: "none", fontWeight: 400,
                textTransform: "none", letterSpacing: 0,
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <TextField label="Week Label" value={weekLabelV} onChange={setWeekLabelV} />
          <TextField label="Items Count" type="number" value={String(itemCount)} onChange={v => setItemCount(parseInt(v, 10) || 0)} />
          <TextField label="Preview Link" type="url" value={previewLink} onChange={setPreviewLink} placeholder="Drive / Canva / Drive folder…" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <BlueButton variant="ghost" onClick={onClose}>Cancel</BlueButton>
            <BlueButton onClick={submit} icon={Send}>Submit for Approval</BlueButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 5. TASKS
 * ═══════════════════════════════════════════════════════════════════════ */
function TasksSection({ userName }: { userName: string }) {
  const tasks = readAll<TaskRow>(PORTAL, "tasks");
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const [addOpen, setAddOpen] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);

  const visible = tasks
    .filter(t => !mineOnly || t.assignee.toLowerCase() === userName.toLowerCase().split(" ")[0])
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Asset-style checklist view for quick completion
  const checklistItems: AssetItem[] = visible.map(t => ({
    id: t.id,
    label: `${t.ref} · ${t.title}`,
    group: t.assignee,
    done: t.status === "Done",
    owner: t.assignee,
    note: `${t.type} · Due ${fmtDate(t.dueDate)}`,
  }));

  function toggleDone(id: string) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const nextStatus: TaskStatus = t.status === "Done" ? "In Progress" : "Done";
    update<TaskRow>(PORTAL, "tasks", id, { status: nextStatus });
    touch(PORTAL, "tasks");
  }

  return (
    <div>
      <OpsHeader
        title="Tasks"
        sub="Every TSK-XXX across the team. Check off as you ship."
        action={
          <BlueButton icon={Plus} onClick={() => setAddOpen(true)}>
            New Task
          </BlueButton>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
        <OpsKpi label="Open" value={tasks.filter(t => t.status !== "Done").length} accent={BLUE} />
        <OpsKpi label="Done" value={tasks.filter(t => t.status === "Done").length} accent={GREEN} />
        <OpsKpi label="Blocked" value={tasks.filter(t => t.status === "Blocked").length} accent={RED} />
        <OpsKpi label="Total" value={tasks.length} accent={MUTED} />
      </div>

      <OpsCard style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: DARK, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={e => setMineOnly(e.target.checked)}
          />
          Show only tasks assigned to me
        </label>
      </OpsCard>

      {visible.length === 0 ? (
        <OpsCard><EmptyState icon={ListTodo} title="No tasks" hint="Create a task to start tracking week's work." /></OpsCard>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <AssetChecklist
              items={checklistItems}
              onToggle={toggleDone}
              accent={BLUE}
              grouped
              title="Checklist (grouped by assignee)"
              hint="Click a row to toggle Done / In Progress."
            />
          </div>

          <OpsCard>
            <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
              Detailed List
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: MUTED }}>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Ref</th>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Title</th>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Type</th>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Assignee</th>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Due</th>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Status</th>
                    <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(t => (
                    <TaskRowCard key={t.id} row={t} clients={clients} />
                  ))}
                </tbody>
              </table>
            </div>
          </OpsCard>
        </>
      )}

      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} tasks={tasks} clients={clients} />
    </div>
  );
}

function TaskRowCard({ row, clients }: { row: TaskRow; clients: ClientRow[] }) {
  const clientName = row.clientId ? clients.find(c => c.id === row.clientId)?.name : undefined;

  function cycleStatus() {
    const order: TaskStatus[] = ["Not Started", "In Progress", "Done", "Blocked"];
    const next = order[(order.indexOf(row.status) + 1) % order.length];
    update<TaskRow>(PORTAL, "tasks", row.id, { status: next });
    touch(PORTAL, "tasks");
  }

  function del() {
    if (!window.confirm(`Delete task ${row.ref}?`)) return;
    remove(PORTAL, "tasks", row.id);
    touch(PORTAL, "tasks");
  }

  return (
    <tr style={{ borderTop: `1px solid ${DARK}06` }}>
      <td style={{ padding: "9px 6px", fontFamily: "monospace", color: MUTED }}>{row.ref}</td>
      <td style={{ padding: "9px 6px", color: DARK, fontWeight: 500 }}>
        {row.title}
        {clientName && <span style={{ color: MUTED, fontWeight: 400 }}> · {clientName}</span>}
      </td>
      <td style={{ padding: "9px 6px", color: MUTED }}>{row.type}</td>
      <td style={{ padding: "9px 6px", color: DARK }}>{row.assignee}</td>
      <td style={{ padding: "9px 6px", color: MUTED }}>{fmtDate(row.dueDate)}</td>
      <td style={{ padding: "9px 6px" }}>
        <button onClick={cycleStatus} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
          <Pill label={row.status} tone={StatusTone(row.status)} />
        </button>
      </td>
      <td style={{ padding: "9px 6px", textAlign: "right" }}>
        <button onClick={del} style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}>
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

function AddTaskModal({ open, onClose, tasks, clients }: {
  open: boolean; onClose: () => void;
  tasks: TaskRow[]; clients: ClientRow[];
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("Content Creation");
  const [assignee, setAssignee] = useState<Assignee>("Ahmad");
  const [dueDate, setDueDate] = useState(todayISO());
  const [clientId, setClientId] = useState<string>("");
  const [notes, setNotes] = useState("");

  function submit() {
    if (!title.trim()) { toast.error("Title required"); return; }
    insert<TaskRow>(PORTAL, "tasks", {
      ref: nextRef(tasks, "TSK"),
      title: title.trim(),
      type, assignee, dueDate,
      clientId: clientId || undefined,
      status: "Not Started",
      notes: notes.trim() || undefined,
    });
    toast.success("Task added");
    touch(PORTAL, "tasks");
    setTitle(""); setNotes("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div style={{ display: "grid", gap: 12 }}>
        <TextField label="Title" value={title} onChange={setTitle} placeholder="Shoot product photos for Aisha" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Select<TaskType>
            label="Type"
            value={type}
            onChange={setType}
            options={["Content Creation", "Photography", "Reporting", "Meeting", "Editing", "Admin"]}
          />
          <Select<Assignee>
            label="Assignee"
            value={assignee}
            onChange={setAssignee}
            options={["Hikma", "Ahmad", "Salis"]}
          />
        </div>
        <TextField label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Client (optional)
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            style={{
              padding: "9px 11px", borderRadius: 8,
              border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
              backgroundColor: WHITE, outline: "none", fontWeight: 400,
              textTransform: "none", letterSpacing: 0,
            }}
          >
            <option value="">—</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <TextArea label="Notes" value={notes} onChange={setNotes} rows={2} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <BlueButton variant="ghost" onClick={onClose}>Cancel</BlueButton>
          <BlueButton onClick={submit} icon={Plus}>Add Task</BlueButton>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 6. PERFORMANCE
 * ═══════════════════════════════════════════════════════════════════════ */
function PerformanceSection() {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const rows = readAll<PerfRow>(PORTAL, "performance");
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<"Week" | "Month">("Week");

  const filtered = rows.filter(r => r.period === tab);

  return (
    <div>
      <OpsHeader
        title="Performance"
        sub="Weekly + monthly metrics per client. Manual entry from Meta/TikTok insights."
        action={<BlueButton icon={Plus} onClick={() => setAddOpen(true)}>New Entry</BlueButton>}
      />

      <OpsCard style={{ marginBottom: 12, padding: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <BlueButton variant={tab === "Week" ? "solid" : "ghost"} onClick={() => setTab("Week")}>Weekly</BlueButton>
          <BlueButton variant={tab === "Month" ? "solid" : "ghost"} onClick={() => setTab("Month")}>Monthly</BlueButton>
        </div>
      </OpsCard>

      {filtered.length === 0 ? (
        <OpsCard><EmptyState icon={BarChart3} title="No entries yet" hint={`Add ${tab.toLowerCase()} performance for at least one client.`} /></OpsCard>
      ) : (
        <OpsCard>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: MUTED }}>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Client</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Label</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Reach</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Engagement</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Growth %</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Best Post</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Worst Post</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}>Top Type</th>
                  <th style={{ padding: "8px 6px", fontWeight: 600, fontSize: 11 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <PerfRowCard key={r.id} row={r} clients={clients} />
                ))}
              </tbody>
            </table>
          </div>
        </OpsCard>
      )}

      <AddPerfModal open={addOpen} onClose={() => setAddOpen(false)} clients={clients} period={tab} />
    </div>
  );
}

function PerfRowCard({ row, clients }: { row: PerfRow; clients: ClientRow[] }) {
  const clientName = clients.find(c => c.id === row.clientId)?.name || "—";
  function del() {
    if (!window.confirm("Delete performance entry?")) return;
    remove(PORTAL, "performance", row.id);
    touch(PORTAL, "performance");
  }
  return (
    <tr style={{ borderTop: `1px solid ${DARK}06` }}>
      <td style={{ padding: "9px 6px", color: DARK, fontWeight: 600 }}>{clientName}</td>
      <td style={{ padding: "9px 6px", color: MUTED, fontFamily: "monospace" }}>{row.label}</td>
      <td style={{ padding: "9px 6px", color: DARK }}>{row.reach.toLocaleString()}</td>
      <td style={{ padding: "9px 6px", color: DARK }}>{row.engagement.toLocaleString()}</td>
      <td style={{ padding: "9px 6px", color: row.followerGrowthPct >= 0 ? GREEN : RED }}>
        {row.followerGrowthPct >= 0 ? "+" : ""}{row.followerGrowthPct}%
      </td>
      <td style={{ padding: "9px 6px", color: MUTED, maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.bestPost || "—"}</td>
      <td style={{ padding: "9px 6px", color: MUTED, maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.worstPost || "—"}</td>
      <td style={{ padding: "9px 6px", color: MUTED }}>{row.bestContentType || "—"}</td>
      <td style={{ padding: "9px 6px", textAlign: "right" }}>
        <button onClick={del} style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}>
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

function AddPerfModal({ open, onClose, clients, period }: {
  open: boolean; onClose: () => void;
  clients: ClientRow[]; period: "Week" | "Month";
}) {
  const [clientId, setClientId] = useState<string>("");
  const [label, setLabel] = useState(period === "Week" ? weekLabel() : new Date().toLocaleString("en-NG", { month: "long", year: "numeric" }));
  const [reach, setReach] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [followerGrowthPct, setFollowerGrowthPct] = useState(0);
  const [bestPost, setBestPost] = useState("");
  const [worstPost, setWorstPost] = useState("");
  const [platformBreakdown, setPlatformBreakdown] = useState("");
  const [bestContentType, setBestContentType] = useState<PostType>("Reel");

  useEffect(() => {
    if (open && clients.length > 0 && !clientId) setClientId(clients[0].id);
  }, [open, clients, clientId]);

  function submit() {
    if (!clientId) { toast.error("Select a client"); return; }
    insert<PerfRow>(PORTAL, "performance", {
      clientId, period, label,
      reach, engagement, followerGrowthPct,
      bestPost: bestPost.trim() || undefined,
      worstPost: worstPost.trim() || undefined,
      platformBreakdown: platformBreakdown.trim() || undefined,
      bestContentType,
    });
    toast.success("Performance logged");
    touch(PORTAL, "performance");
    setReach(0); setEngagement(0); setFollowerGrowthPct(0);
    setBestPost(""); setWorstPost(""); setPlatformBreakdown("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`New ${period}ly Entry`}>
      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Add a client first" />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Client
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{
                padding: "9px 11px", borderRadius: 8,
                border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
                backgroundColor: WHITE, outline: "none", fontWeight: 400,
                textTransform: "none", letterSpacing: 0,
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <TextField label="Period Label" value={label} onChange={setLabel} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <TextField label="Reach" type="number" value={String(reach)} onChange={v => setReach(parseInt(v, 10) || 0)} />
            <TextField label="Engagement" type="number" value={String(engagement)} onChange={v => setEngagement(parseInt(v, 10) || 0)} />
            <TextField label="Growth %" type="number" value={String(followerGrowthPct)} onChange={v => setFollowerGrowthPct(parseFloat(v) || 0)} />
          </div>
          <TextField label="Best Post" value={bestPost} onChange={setBestPost} placeholder="Caption snippet / link" />
          <TextField label="Worst Post" value={worstPost} onChange={setWorstPost} placeholder="Caption snippet / link" />
          <TextField label="Platform Breakdown" value={platformBreakdown} onChange={setPlatformBreakdown} placeholder="IG 60% · TikTok 30% · FB 10%" />
          <Select<PostType>
            label="Best Content Type"
            value={bestContentType}
            onChange={setBestContentType}
            options={["Feed", "Reel", "Story", "Carousel", "Flyer", "Video"]}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <BlueButton variant="ghost" onClick={onClose}>Cancel</BlueButton>
            <BlueButton onClick={submit} icon={Plus}>Log Entry</BlueButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 7. COMMS LOG
 * ═══════════════════════════════════════════════════════════════════════ */
function CommsSection() {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const rows = readAll<CommsRow>(PORTAL, "comms");
  const [addOpen, setAddOpen] = useState(false);
  const [filterClient, setFilterClient] = useState<"All" | string>("All");

  const filtered = rows
    .filter(r => filterClient === "All" || r.clientId === filterClient)
    .sort((a, b) => b.when.localeCompare(a.when));

  const followUps = rows.filter(r => r.followUpOn);

  return (
    <div>
      <OpsHeader
        title="Comms Log"
        sub="Every WhatsApp, video call, or email touchpoint — plus follow-ups."
        action={<BlueButton icon={Plus} onClick={() => setAddOpen(true)}>Log Touchpoint</BlueButton>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 12 }}>
        <OpsKpi label="Total Touchpoints" value={rows.length} accent={BLUE} />
        <OpsKpi label="Pending Follow-Ups" value={followUps.length} accent={ORANGE} />
        <OpsKpi
          label="WhatsApp"
          value={rows.filter(r => r.type === "WhatsApp").length}
          accent={GREEN}
        />
        <OpsKpi
          label="Video Calls"
          value={rows.filter(r => r.type === "Video Call").length}
          accent={BLUE}
        />
      </div>

      <OpsCard style={{ marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Filter by Client
          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            style={{
              padding: "9px 11px", borderRadius: 8,
              border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
              backgroundColor: WHITE, outline: "none", fontWeight: 400,
              textTransform: "none", letterSpacing: 0,
            }}
          >
            <option value="All">All clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </OpsCard>

      {filtered.length === 0 ? (
        <OpsCard><EmptyState icon={MessageSquare} title="No comms yet" hint="Log your first touchpoint." /></OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(r => (
            <CommsRowCard key={r.id} row={r} clients={clients} />
          ))}
        </div>
      )}

      <AddCommsModal open={addOpen} onClose={() => setAddOpen(false)} clients={clients} />
    </div>
  );
}

function CommsRowCard({ row, clients }: { row: CommsRow; clients: ClientRow[] }) {
  const clientName = clients.find(c => c.id === row.clientId)?.name || "—";
  function del() {
    if (!window.confirm("Delete log?")) return;
    remove(PORTAL, "comms", row.id);
    touch(PORTAL, "comms");
  }
  return (
    <div style={{
      backgroundColor: WHITE, borderRadius: 12,
      border: `1px solid ${DARK}08`, padding: "12px 14px",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: BLUE_SOFT, color: BLUE,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}><MessageSquare size={15} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{clientName}</p>
          <Pill label={row.type} tone="blue" />
          <span style={{ fontSize: 11, color: MUTED }}>{fmtDate(row.when)} · {row.owner}</span>
        </div>
        <p style={{ fontSize: 12, color: DARK, marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
          {row.summary}
        </p>
        {row.followUpOn && (
          <p style={{ fontSize: 11, color: ORANGE, marginTop: 6, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} /> Follow up on {fmtDate(row.followUpOn)}
          </p>
        )}
      </div>
      <button onClick={del} style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function AddCommsModal({ open, onClose, clients }: {
  open: boolean; onClose: () => void; clients: ClientRow[];
}) {
  const [clientId, setClientId] = useState<string>("");
  const [when, setWhen] = useState(todayISO());
  const [type, setType] = useState<CommsType>("WhatsApp");
  const [summary, setSummary] = useState("");
  const [followUpOn, setFollowUpOn] = useState("");
  const [owner, setOwner] = useState<Assignee>("Hikma");

  useEffect(() => {
    if (open && clients.length > 0 && !clientId) setClientId(clients[0].id);
  }, [open, clients, clientId]);

  function submit() {
    if (!clientId) { toast.error("Select a client"); return; }
    if (!summary.trim()) { toast.error("Summary required"); return; }
    insert<CommsRow>(PORTAL, "comms", {
      clientId, when, type,
      summary: summary.trim(),
      followUpOn: followUpOn || undefined,
      owner,
    });
    toast.success("Logged");
    touch(PORTAL, "comms");
    setSummary(""); setFollowUpOn("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Touchpoint">
      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Add a client first" />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Client
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{
                padding: "9px 11px", borderRadius: 8,
                border: `1px solid ${DARK}15`, fontSize: 13, color: DARK,
                backgroundColor: WHITE, outline: "none", fontWeight: 400,
                textTransform: "none", letterSpacing: 0,
              }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TextField label="When" type="date" value={when} onChange={setWhen} />
            <Select<CommsType>
              label="Type"
              value={type}
              onChange={setType}
              options={["WhatsApp", "Video Call", "Email", "Phone", "In Person"]}
            />
          </div>
          <TextArea label="Summary" value={summary} onChange={setSummary} placeholder="What was discussed, agreed, noted…" rows={4} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <TextField label="Follow-Up On (optional)" type="date" value={followUpOn} onChange={setFollowUpOn} />
            <Select<Assignee>
              label="Owner"
              value={owner}
              onChange={setOwner}
              options={["Hikma", "Ahmad", "Salis"]}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <BlueButton variant="ghost" onClick={onClose}>Cancel</BlueButton>
            <BlueButton onClick={submit} icon={Plus}>Log Touchpoint</BlueButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 8. REPORTS
 * ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const clients = readAll<ClientRow>(PORTAL, "clients");
  const content = readAll<ContentRow>(PORTAL, "content");
  const approvals = readAll<ApprovalRow>(PORTAL, "approvals");
  const tasks = readAll<TaskRow>(PORTAL, "tasks");
  const perf = readAll<PerfRow>(PORTAL, "performance");
  const reports = readAll<ReportRow>(PORTAL, "reports");
  const [label, setLabel] = useState("Weekly CSO Summary");
  const [weekOf, setWeekOf] = useState(todayISO());

  const generated = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const postsShipped = content.filter(c => {
      if (c.status !== "Posted") return false;
      try { return new Date(c.date).getTime() >= weekAgo.getTime(); } catch { return false; }
    });
    const approvedThisWeek = approvals.filter(a =>
      a.status === "Approved" && a.approvedAt &&
      new Date(a.approvedAt).getTime() >= weekAgo.getTime()
    );
    const openTasks = tasks.filter(t => t.status !== "Done");
    const perfAvgGrowth = perf.length === 0 ? 0 :
      perf.reduce((s, p) => s + p.followerGrowthPct, 0) / perf.length;
    const mrr = clients
      .filter(c => c.tier !== "Setup" && c.paymentStatus !== "Overdue")
      .reduce((s, c) => s + c.monthlyFee, 0);

    const lines: string[] = [];
    lines.push(`HAMZURY MEDIALY — ${label}`);
    lines.push(`Week of ${fmtDate(weekOf)}`);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("SNAPSHOT");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push(`• Active retainers: ${clients.filter(c => c.paymentStatus !== "Overdue").length}`);
    lines.push(`• Monthly recurring: ${fmtMoney(mrr)}`);
    lines.push(`• Posts shipped this week: ${postsShipped.length}`);
    lines.push(`• Approvals secured: ${approvedThisWeek.length}`);
    lines.push(`• Open tasks: ${openTasks.length}`);
    lines.push(`• Avg follower growth: ${perfAvgGrowth.toFixed(1)}%`);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("BY CLIENT");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    clients.forEach(c => {
      const ship = content.filter(x => x.clientId === c.id && x.status === "Posted").length;
      const open = content.filter(x => x.clientId === c.id && x.status !== "Posted").length;
      lines.push(`• ${c.name} (${c.tier}) — ${fmtMoney(c.monthlyFee)} · ${ship} posted · ${open} in pipeline · ${c.paymentStatus}`);
    });
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("TEAM ACTIVITY");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    (["Hikma", "Ahmad", "Salis"] as Assignee[]).forEach(who => {
      const taskCount = tasks.filter(t => t.assignee === who && t.status !== "Done").length;
      const contentCount = content.filter(c => c.assignee === who).length;
      lines.push(`• ${who}: ${contentCount} content items, ${taskCount} open tasks`);
    });
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    lines.push("BLOCKERS & ATTENTION");
    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    const blocked = tasks.filter(t => t.status === "Blocked");
    const overduePay = clients.filter(c => c.paymentStatus === "Overdue");
    const rejected = approvals.filter(a => a.status === "Rejected");
    if (blocked.length) lines.push(`• ${blocked.length} blocked task${blocked.length === 1 ? "" : "s"}`);
    if (overduePay.length) lines.push(`• ${overduePay.length} overdue payment${overduePay.length === 1 ? "" : "s"}: ${overduePay.map(c => c.name).join(", ")}`);
    if (rejected.length) lines.push(`• ${rejected.length} rejected submission${rejected.length === 1 ? "" : "s"} — rework needed`);
    if (!blocked.length && !overduePay.length && !rejected.length) lines.push("• None — clean week");
    lines.push("");
    lines.push("— Hikma, Medialy Lead");
    return lines.join("\n");
  }, [clients, content, approvals, tasks, perf, label, weekOf]);

  function copyReport() {
    try {
      navigator.clipboard.writeText(generated);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  }

  function saveReport() {
    insert<ReportRow>(PORTAL, "reports", {
      label, weekOf, body: generated,
    });
    toast.success("Report saved");
    touch(PORTAL, "reports");
  }

  function delReport(id: string) {
    if (!window.confirm("Delete saved report?")) return;
    remove(PORTAL, "reports", id);
    touch(PORTAL, "reports");
  }

  return (
    <div>
      <OpsHeader
        title="Reports"
        sub="Weekly CSO summary. Copy, paste into WhatsApp or email, send."
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <BlueButton variant="ghost" onClick={saveReport}>Save Snapshot</BlueButton>
            <BlueButton onClick={copyReport} icon={Copy}>Copy Report</BlueButton>
          </div>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
          <TextField label="Report Label" value={label} onChange={setLabel} />
          <TextField label="Week Of" type="date" value={weekOf} onChange={setWeekOf} />
        </div>
      </OpsCard>

      <OpsCard>
        <pre style={{
          margin: 0, padding: 14, backgroundColor: BG, borderRadius: 10,
          fontSize: 12, color: DARK, lineHeight: 1.6, fontFamily: "ui-monospace, Menlo, monospace",
          whiteSpace: "pre-wrap", overflowX: "auto",
        }}>{generated}</pre>
      </OpsCard>

      {reports.length > 0 && (
        <OpsCard style={{ marginTop: 14 }}>
          <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
            Saved Snapshots ({reports.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {reports.slice().reverse().map(r => (
              <details key={r.id} style={{
                padding: "8px 12px", backgroundColor: BG, borderRadius: 10,
                border: `1px solid ${DARK}06`,
              }}>
                <summary style={{
                  cursor: "pointer", fontSize: 12, fontWeight: 600, color: DARK,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>{r.label} · {fmtDate(r.weekOf)}</span>
                  <button onClick={(e) => { e.preventDefault(); delReport(r.id); }} style={{
                    border: "none", background: "transparent", cursor: "pointer", color: RED,
                  }}><Trash2 size={12} /></button>
                </summary>
                <pre style={{
                  marginTop: 8, fontSize: 11, color: DARK, whiteSpace: "pre-wrap",
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}>{r.body}</pre>
              </details>
            ))}
          </div>
        </OpsCard>
      )}
    </div>
  );
}
