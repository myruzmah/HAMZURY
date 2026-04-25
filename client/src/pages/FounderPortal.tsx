import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";
import OpsShell, { OpsCard, OpsKpi, OpsHeader } from "@/components/ops/OpsShell";
import PhaseTracker from "@/components/ops/PhaseTracker";
import AssetChecklist, { type AssetItem } from "@/components/ops/AssetChecklist";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, Flame, Calendar as CalendarIcon, PenSquare,
  BookOpen, Target, Lock, Loader2,
  CheckCircle2, Plus, Trash2, Eye, EyeOff,
  TrendingDown, Coins, Heart,
  Dumbbell, Save, Copy,
} from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY FOUNDER PORTAL — Muhammad Hamzury only.
 * Life & Legacy System: debt, routine, content, learning, vision, vault.
 * Backed by tRPC `founder.*` router (MySQL via Drizzle).
 * Source: FOUNDER_Life_Legacy_System.xlsx (7 tabs).
 * ══════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────── BRAND ─────────────────────────── */
const BG = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#6B6B6B";
const BROWN = "#8B4513";          // Founder accent
const BROWN_SOFT = "#B97A4A";
const GOLD = "#B48C4C";
const GREEN = "#1B4D3E";
const SUCCESS = "#22C55E";
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";

const FOUNDER_SHARE = 0.072;         // 7.2%
const TARGET_FREEDOM = "2027-12-31";
const START_DATE = "2026-05-01";

/* ─────────────────────────── TYPES ─────────────────────────── */
type Section =
  | "dashboard"
  | "debt"
  | "schedule"
  | "content"
  | "learning"
  | "vision"
  | "vault";

/** DB rows. Server returns these shapes via tRPC. Nullable fields stay null on read. */
type DebtPayment = {
  id: number;
  date: string;
  amount: number;
  source: string;
  notes?: string | null;
};

type ScheduleCheck = {
  id: number;
  /** ISO week key eg 2026-W17 */
  week: string;
  /** slot id: "Monday|6:30 AM|Gym" */
  slot: string;
  done: boolean;
};

type ContentRow = {
  id: number;
  date: string;
  platform: string;
  contentType: string;
  theme?: string | null;
  mentor?: string | null;
  posted: string;
  engagement?: string | null;
  saved: boolean;
  notes?: string | null;
};

type LearningApplied = "Not Yet" | "In Progress" | "Yes";

type LearningRow = {
  id: number;
  date: string;
  source: string;
  mentor?: string | null;
  lesson: string;
  screenshot: boolean;
  whyWorth?: string | null;
  howApply?: string | null;
  applied: LearningApplied;
};

type MilestoneStatus = "Not Started" | "Planning" | "In Progress" | "Done";

type Milestone = {
  id: number;
  label: string;
  target?: string | null;
  status: MilestoneStatus;
};

type VaultKind = "account" | "doc";

type VaultRow = {
  id: number;
  kind: VaultKind;
  service: string;
  username?: string | null;
  secret?: string | null;
  securityQ?: string | null;
  recovery?: string | null;
  storageLocation?: string | null;
  notes?: string | null;
};

/* Week/Day meta (from Excel "Weekly Schedule" tab) */
type Slot = {
  day: string;
  time: string;
  activity: string;
  location: string;
  duration: string;
  notes?: string;
};

/* ─────────────────────────── SEED DATA ─────────────────────────── */
const SCHEDULE: Slot[] = [
  // Monday
  { day: "Monday", time: "5:30 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min", notes: "Start day with Allah" },
  { day: "Monday", time: "6:30 AM", activity: "Gym", location: "Gym/Home", duration: "1 hour", notes: "Physical strength" },
  { day: "Monday", time: "8:30 AM", activity: "Strategic Partnership Outreach", location: "Office", duration: "2 hours", notes: "Build relationships" },
  { day: "Monday", time: "11:00 AM", activity: "CEO Weekly Meeting", location: "Office", duration: "2 hours", notes: "Observe, don't operate" },
  { day: "Monday", time: "2:00 PM", activity: "Reading (Mentors)", location: "Quiet space", duration: "1 hour", notes: "Bezos, Jim Rohn, Hormozi, Sinek" },
  { day: "Monday", time: "4:00 PM", activity: "Studio Session (Content)", location: "Studio", duration: "2 hours", notes: "Create for Hamzury" },
  { day: "Monday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
  // Tuesday
  { day: "Tuesday", time: "5:30 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min" },
  { day: "Tuesday", time: "6:30 AM", activity: "Gym", location: "Gym/Home", duration: "1 hour" },
  { day: "Tuesday", time: "9:00 AM", activity: "Online Learning", location: "Office", duration: "2 hours", notes: "Favorite creators, screenshots" },
  { day: "Tuesday", time: "11:00 AM", activity: "Nature Time", location: "Park/Outdoors", duration: "1 hour", notes: "Clarity, connection" },
  { day: "Tuesday", time: "2:00 PM", activity: "Reading (Books)", location: "Quiet space", duration: "1.5 hours", notes: "Deep learning" },
  { day: "Tuesday", time: "4:00 PM", activity: "Studio Session (Content)", location: "Studio", duration: "2 hours" },
  { day: "Tuesday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
  // Wednesday
  { day: "Wednesday", time: "5:30 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min" },
  { day: "Wednesday", time: "6:30 AM", activity: "Gym", location: "Gym/Home", duration: "1 hour" },
  { day: "Wednesday", time: "9:00 AM", activity: "Public Speaking Session", location: "Learning center", duration: "2 hours", notes: "Learn, practice, grow" },
  { day: "Wednesday", time: "12:00 PM", activity: "Strategic Partnerships", location: "Meetings", duration: "2 hours" },
  { day: "Wednesday", time: "3:00 PM", activity: "Family Visit", location: "Family home", duration: "2 hours", notes: "Obligations, love" },
  { day: "Wednesday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
  // Thursday
  { day: "Thursday", time: "5:30 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min" },
  { day: "Thursday", time: "6:30 AM", activity: "Gym", location: "Gym/Home", duration: "1 hour" },
  { day: "Thursday", time: "9:00 AM", activity: "Silent Solitude", location: "Private space", duration: "2 hours", notes: "Deep thinking, vision, strategy" },
  { day: "Thursday", time: "11:30 AM", activity: "Reading & Screenshots", location: "Office", duration: "2 hours", notes: "Save worthy content" },
  { day: "Thursday", time: "2:00 PM", activity: "Online Learning", location: "Office", duration: "1.5 hours" },
  { day: "Thursday", time: "4:00 PM", activity: "Studio Session (Content)", location: "Studio", duration: "2 hours" },
  { day: "Thursday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
  // Friday
  { day: "Friday", time: "5:30 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min" },
  { day: "Friday", time: "6:30 AM", activity: "Gym", location: "Gym/Home", duration: "1 hour" },
  { day: "Friday", time: "9:00 AM", activity: "Strategic Partnerships", location: "Meetings", duration: "2 hours" },
  { day: "Friday", time: "12:00 PM", activity: "Jumah Prayer", location: "Mosque", duration: "1.5 hours", notes: "Community, spirituality" },
  { day: "Friday", time: "3:00 PM", activity: "Reading (Mentors)", location: "Quiet space", duration: "1.5 hours" },
  { day: "Friday", time: "5:00 PM", activity: "Nature Time", location: "Outdoors", duration: "1 hour", notes: "Reflection" },
  { day: "Friday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
  // Saturday
  { day: "Saturday", time: "6:00 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min" },
  { day: "Saturday", time: "7:00 AM", activity: "Gym", location: "Gym/Home", duration: "1 hour" },
  { day: "Saturday", time: "10:00 AM", activity: "Family Time", location: "Home/Family", duration: "3 hours", notes: "Quality time" },
  { day: "Saturday", time: "2:00 PM", activity: "Reading", location: "Home", duration: "2 hours" },
  { day: "Saturday", time: "5:00 PM", activity: "Studio Session (Batch Content)", location: "Studio", duration: "2 hours", notes: "Week ahead content" },
  { day: "Saturday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
  // Sunday
  { day: "Sunday", time: "6:00 AM", activity: "Prayer (Fajr)", location: "Home", duration: "30 min" },
  { day: "Sunday", time: "8:00 AM", activity: "Family Time", location: "Home", duration: "3 hours", notes: "Rest + family" },
  { day: "Sunday", time: "1:00 PM", activity: "Weekly Review", location: "Quiet space", duration: "1 hour", notes: "Plan the week" },
  { day: "Sunday", time: "3:00 PM", activity: "Reading / Reflection", location: "Home", duration: "2 hours" },
  { day: "Sunday", time: "7:00 PM", activity: "Prayer (Maghrib)", location: "Mosque/Home", duration: "30 min" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_MILESTONES: Array<{ label: string; target: string; status: MilestoneStatus }> = [
  { label: "First ₦1M month", target: "2026-06-30", status: "In Progress" },
  { label: "Debt 50% paid", target: "2026-09-30", status: "Not Started" },
  { label: "100K followers", target: "2026-12-31", status: "In Progress" },
  { label: "DEBT FREEDOM", target: "2027-12-31", status: "In Progress" },
  { label: "First employee millionaire", target: "2027-06-30", status: "Not Started" },
  { label: "International expansion", target: "2028-06-30", status: "Planning" },
];

const DEFAULT_VAULT: Array<{
  kind: VaultKind;
  service: string;
  username?: string;
  secret?: string;
  securityQ?: string;
  recovery?: string;
  storageLocation?: string;
  notes?: string;
}> = [
  { kind: "account", service: "Instagram @hamzury", username: "muhammad@hamzury.com", secret: "", securityQ: "", recovery: "recovery@hamzury.com", notes: "Main Hamzury account" },
  { kind: "account", service: "TikTok @hamzury", username: "muhammad@hamzury.com", secret: "", notes: "Content platform" },
  { kind: "account", service: "Bank Account - GTBank", username: "Muhammad Hamzury", secret: "", notes: "Business account" },
  { kind: "doc", service: "Personal ID/Passport", storageLocation: "Google Drive: Personal/ID/", notes: "Scanned copies" },
  { kind: "doc", service: "Debt Documents", storageLocation: "Google Drive: Personal/Debt/", notes: "All loan agreements" },
  { kind: "doc", service: "Property Documents", storageLocation: "Google Drive: Personal/Property/", notes: "If any" },
  { kind: "doc", service: "Family Documents", storageLocation: "Google Drive: Personal/Family/", notes: "Important family docs" },
];

const MENTORS = [
  { name: "Jeff Bezos", theme: "Customer obsession, long-term thinking, compound growth", group: "Business" },
  { name: "Jim Rohn", theme: "Personal philosophy, seasons of life, value", group: "Business" },
  { name: "Alex Hormozi", theme: "$100M offers, value creation, systems", group: "Business" },
  { name: "Simon Sinek", theme: "Start with WHY, inspire action, leadership", group: "Business" },
  { name: "Mamdani", theme: "African perspective, systems thinking", group: "Political / Thought" },
  { name: "Mayor", theme: "Leadership, governance, community", group: "Political / Thought" },
];

/* ─────────────────────────── UTILS ─────────────────────────── */
function fmtNaira(v: number | null | undefined): string {
  if (v === null || v === undefined || isNaN(v as number)) return "₦0";
  return `₦${Number(v).toLocaleString("en-NG")}`;
}
function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  } catch { return String(d); }
}
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}
function isoWeek(d = new Date()): string {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((dt.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
function slotKey(s: Slot): string {
  return `${s.day}|${s.time}|${s.activity}`;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function mask(s: string | undefined | null): string {
  if (!s) return "—";
  if (s.length <= 2) return "••";
  return s[0] + "•".repeat(clamp(s.length - 2, 2, 10)) + s[s.length - 1];
}
function withinLastDays(iso: string, n: number): boolean {
  try {
    const d = new Date(iso).getTime();
    const now = Date.now();
    return now - d <= n * 86400 * 1000 && now - d >= -86400 * 1000;
  } catch { return false; }
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function FounderPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("dashboard");
  const utils = trpc.useUtils();

  const role = (user as any)?.hamzuryRole;
  const isFounder = role === "founder";

  /* Role gate — founder only. Redirect everyone else to home. */
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!isFounder) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [user, loading, isFounder]);

  /* Seed default milestones + vault on first mount (idempotent — only seeds when DB empty). */
  const milestonesQuery = trpc.founder.milestones.list.useQuery(undefined, { enabled: isFounder });
  const vaultQuery = trpc.founder.vault.list.useQuery(undefined, { enabled: isFounder });

  const seedMilestone = trpc.founder.milestones.create.useMutation({
    onSuccess: () => utils.founder.milestones.list.invalidate(),
  });
  const seedVault = trpc.founder.vault.create.useMutation({
    onSuccess: () => utils.founder.vault.list.invalidate(),
  });

  useEffect(() => {
    if (!isFounder) return;
    if (milestonesQuery.isSuccess && (milestonesQuery.data?.length ?? 0) === 0) {
      DEFAULT_MILESTONES.forEach(m => seedMilestone.mutate(m));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFounder, milestonesQuery.isSuccess]);

  useEffect(() => {
    if (!isFounder) return;
    if (vaultQuery.isSuccess && (vaultQuery.data?.length ?? 0) === 0) {
      DEFAULT_VAULT.forEach(v => seedVault.mutate(v));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFounder, vaultQuery.isSuccess]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: BROWN }} />
      </div>
    );
  }
  if (!user) return null;
  if (!isFounder) return null;

  const NAV = [
    { key: "dashboard", label: "Life Dashboard", icon: LayoutDashboard },
    { key: "debt",      label: "Debt Tracker",   icon: TrendingDown },
    { key: "schedule",  label: "Weekly Schedule", icon: CalendarIcon },
    { key: "content",   label: "Content Tracker", icon: PenSquare },
    { key: "learning",  label: "Learning",        icon: BookOpen },
    { key: "vision",    label: "Vision & Legacy", icon: Target },
    { key: "vault",     label: "Password Vault",  icon: Lock },
  ];

  return (
    <>
      <PageMeta
        title="Founder Portal — HAMZURY"
        description="Private founder-only Life & Legacy system for Muhammad Hamzury."
      />
      <OpsShell
        title="Founder"
        subtitle="Life & Legacy System"
        brand={{ name: "Founder", accent: GOLD, bg: BROWN }}
        nav={NAV}
        active={active}
        onChange={(k) => setActive(k as Section)}
        logoSmall="HAMZURY"
        logoLarge="Founder"
        userName={(user as any).name || (user as any).displayName || "Muhammad"}
        roleLabel="FOUNDER ONLY"
        onLogout={logout}
        pageTitle="Founder Portal — HAMZURY"
      >
        {active === "dashboard" && <DashboardSection onGoto={setActive} />}
        {active === "debt"      && <DebtSection />}
        {active === "schedule"  && <ScheduleSection />}
        {active === "content"   && <ContentSection />}
        {active === "learning"  && <LearningSection />}
        {active === "vision"    && <VisionSection />}
        {active === "vault"     && <VaultSection />}
      </OpsShell>
    </>
  );
}

/* ═════════════════════════ DASHBOARD ═════════════════════════ */
function DashboardSection({ onGoto }: { onGoto: (s: Section) => void }) {
  /* Local UI numbers persist in localStorage (still UI prefs, not synced data). */
  const [totalDebtStr, setTotalDebtStr] = useLocalString("founder.totalDebt", "0");
  const [monthRevenueStr, setMonthRevenueStr] = useLocalString("founder.monthlyRevenue", "0");
  const [staffCountStr, setStaffCountStr] = useLocalString("founder.staffCount", "18");
  const [millionairesStr, setMillionairesStr] = useLocalString("founder.millionaires", "0");

  const totalDebt = Number(totalDebtStr) || 0;
  const revenue = Number(monthRevenueStr) || 0;
  const staff = Number(staffCountStr) || 0;
  const millionaires = Number(millionairesStr) || 0;

  const debtQuery = trpc.founder.debt.list.useQuery();
  const week = isoWeek();
  const scheduleQuery = trpc.founder.schedule.list.useQuery({ week });
  const contentQuery = trpc.founder.content.list.useQuery();
  const learningQuery = trpc.founder.learning.list.useQuery();

  const payments: DebtPayment[] = (debtQuery.data ?? []) as DebtPayment[];
  const weekChecks: ScheduleCheck[] = ((scheduleQuery.data ?? []) as ScheduleCheck[]).filter(c => c.week === week && c.done);
  const contentRows: ContentRow[] = (contentQuery.data ?? []) as ContentRow[];
  const learningRows: LearningRow[] = (learningQuery.data ?? []) as LearningRow[];

  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remaining = Math.max(totalDebt - totalPaid, 0);
  const pctFree = totalDebt > 0 ? clamp(Math.round((totalPaid / totalDebt) * 100), 0, 100) : 0;
  const monthsToFreedom = Math.max(monthsBetween(new Date(), new Date(TARGET_FREEDOM)), 0);

  const founderShareMonthly = Math.round(revenue * FOUNDER_SHARE);

  const thisWeekContent = contentRows.filter(c => withinLastDays(c.date, 7));
  const thisWeekLearning = learningRows.filter(l => withinLastDays(l.date, 7));
  const thisWeekPayments = payments.filter(p => withinLastDays(p.date, 7));

  const countBy = (match: (a: string) => boolean) =>
    weekChecks.filter(c => {
      const parts = c.slot.split("|");
      const activity = parts[2] || "";
      return match(activity);
    }).length;
  const gymWeek = countBy(a => a.toLowerCase().includes("gym"));
  const familyWeek = countBy(a => a.toLowerCase().includes("family"));
  const readingWeek = countBy(a => a.toLowerCase().includes("reading") || a.toLowerCase().includes("book"));
  const studioWeek = countBy(a => a.toLowerCase().includes("studio"));
  const screenshotWeek = learningRows.filter(l => withinLastDays(l.date, 7) && l.screenshot).length;

  return (
    <div>
      <OpsHeader
        title="Life Dashboard"
        sub={`From Debt to Empire — starting ${fmtDate(START_DATE)}. "This business is my integrity."`}
      />

      {/* KPI row 1 — Debt freedom / revenue share */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsKpi label="Total Debt" value={fmtNaira(totalDebt)} accent={BROWN} sub="Update below" />
        <OpsKpi label="Paid to Date" value={fmtNaira(totalPaid)} accent={SUCCESS} />
        <OpsKpi label="Remaining" value={fmtNaira(remaining)} accent={RED} />
        <OpsKpi label="Freedom %" value={`${pctFree}%`} accent={BROWN} sub={`${monthsToFreedom} mo to target`} />
      </div>

      {/* Progress bar */}
      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DARK, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Freedom Progress
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>Target {fmtDate(TARGET_FREEDOM)}</div>
        </div>
        <ProgressBar pct={pctFree} color={BROWN} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: MUTED }}>
          <span>{fmtNaira(totalPaid)} paid</span>
          <span>{fmtNaira(remaining)} to go</span>
        </div>
      </OpsCard>

      {/* Inputs for totals */}
      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Monthly Numbers
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <NumField label="Total Debt (₦)" value={totalDebtStr} onChange={setTotalDebtStr} />
          <NumField label="Monthly Revenue (₦)" value={monthRevenueStr} onChange={setMonthRevenueStr} />
          <NumField label="Staff Count" value={staffCountStr} onChange={setStaffCountStr} />
          <NumField label="Millionaires Made" value={millionairesStr} onChange={setMillionairesStr} />
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", backgroundColor: `${BROWN}10`, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontSize: 11, color: MUTED }}>Your 7.2% share this month</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: BROWN }}>{fmtNaira(founderShareMonthly)}</div>
        </div>
      </OpsCard>

      {/* Row 2 — Legacy counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsKpi label="Hamzury Staff" value={staff} accent={GREEN} sub="Team growing" />
        <OpsKpi label="Millionaires Made" value={millionaires} accent={GOLD} sub="Your legacy" />
        <OpsKpi label="Content This Week" value={thisWeekContent.length} accent={BLUE} />
        <OpsKpi label="Lessons Saved" value={screenshotWeek} accent={BROWN} />
      </div>

      {/* Week status card */}
      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          This Week Status · {week}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <StatusTile icon={Dumbbell} label="Gym Sessions" value={gymWeek} color={BROWN} />
          <StatusTile icon={PenSquare} label="Content Created" value={thisWeekContent.length} color={BLUE} />
          <StatusTile icon={BookOpen}  label="Reading Blocks" value={readingWeek} color={GOLD} />
          <StatusTile icon={Heart}     label="Family Visits" value={familyWeek} color={RED} />
          <StatusTile icon={Coins}     label="Debt Payments" value={thisWeekPayments.length} color={SUCCESS} />
          <StatusTile icon={Save}      label="Screenshots Saved" value={screenshotWeek} color={BROWN_SOFT} />
          <StatusTile icon={Flame}     label="Studio Sessions" value={studioWeek} color={ORANGE} />
          <StatusTile icon={BookOpen}  label="Learning Rows" value={thisWeekLearning.length} color={GREEN} />
        </div>
      </OpsCard>

      {/* Quick jump tiles */}
      <OpsCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Jump In
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
          {[
            { k: "debt" as Section,     icon: TrendingDown, label: "Log Debt Payment" },
            { k: "schedule" as Section, icon: CalendarIcon, label: "Check Today's Routine" },
            { k: "content" as Section,  icon: PenSquare,    label: "Log Content" },
            { k: "learning" as Section, icon: BookOpen,     label: "Capture Lesson" },
            { k: "vision" as Section,   icon: Target,       label: "Review Milestones" },
            { k: "vault" as Section,    icon: Lock,         label: "Open Vault" },
          ].map(t => (
            <button key={t.k} onClick={() => onGoto(t.k)}
              style={{
                padding: "12px 14px", borderRadius: 10, backgroundColor: BG,
                border: `1px solid ${DARK}0A`, cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 10,
              }}>
              <t.icon size={16} style={{ color: BROWN, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{t.label}</span>
            </button>
          ))}
        </div>
      </OpsCard>
    </div>
  );
}

/* ═════════════════════════ DEBT TRACKER ═════════════════════════ */
function DebtSection() {
  const utils = trpc.useUtils();
  const debtQuery = trpc.founder.debt.list.useQuery();
  const payments: DebtPayment[] = useMemo(
    () => ((debtQuery.data ?? []) as DebtPayment[])
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [debtQuery.data],
  );

  const createMut = trpc.founder.debt.create.useMutation({
    onSuccess: () => {
      utils.founder.debt.list.invalidate();
      toast.success("Payment logged. Freedom closer.");
    },
  });
  const removeMut = trpc.founder.debt.remove.useMutation({
    onSuccess: () => utils.founder.debt.list.invalidate(),
  });

  const [totalDebtStr, setTotalDebtStr] = useLocalString("founder.totalDebt", "0");
  const totalDebt = Number(totalDebtStr) || 0;
  const paid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const remaining = Math.max(totalDebt - paid, 0);
  const pct = totalDebt > 0 ? Math.round((paid / totalDebt) * 100) : 0;
  const months = Math.max(monthsBetween(new Date(), new Date(TARGET_FREEDOM)), 0);

  const [form, setForm] = useState({
    date: todayISO(),
    amount: "",
    source: "Hamzury Revenue (Founder 7.2%)",
    notes: "",
  });

  const addPayment = () => {
    const amt = Number(form.amount);
    if (!form.date || !amt || amt <= 0) {
      toast.error("Enter a valid date + amount.");
      return;
    }
    createMut.mutate({
      date: form.date,
      amount: amt,
      source: form.source || "—",
      notes: form.notes || undefined,
    });
    setForm({ date: todayISO(), amount: "", source: form.source, notes: "" });
  };

  const del = (id: number) => {
    if (!confirm("Delete this payment?")) return;
    removeMut.mutate({ id });
  };

  return (
    <div>
      <OpsHeader
        title="Debt Tracker"
        sub={`"This business is my integrity — this is my way OUT." Target freedom: ${fmtDate(TARGET_FREEDOM)}`}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsKpi label="Total Debt" value={fmtNaira(totalDebt)} accent={BROWN} />
        <OpsKpi label="Paid to Date" value={fmtNaira(paid)} accent={SUCCESS} />
        <OpsKpi label="Remaining" value={fmtNaira(remaining)} accent={RED} />
        <OpsKpi label="% Free" value={`${pct}%`} sub={`${months} months left`} accent={BROWN} />
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Freedom Progress
        </div>
        <ProgressBar pct={pct} color={BROWN} />
      </OpsCard>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Set Total Debt
        </div>
        <NumField label="Total debt (₦)" value={totalDebtStr} onChange={setTotalDebtStr} />
      </OpsCard>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Log New Payment
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <Field label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Amount (₦)">
            <input type="number" min="0" step="1000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} placeholder="500000" />
          </Field>
          <Field label="Source">
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputStyle}>
              <option>Hamzury Revenue (Founder 7.2%)</option>
              <option>Hamzury Revenue</option>
              <option>Personal Savings</option>
              <option>Side Income</option>
              <option>Gift / Other</option>
            </select>
          </Field>
          <Field label="Notes">
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} placeholder="Optional" />
          </Field>
        </div>
        <button onClick={addPayment}
          style={{
            marginTop: 12, padding: "9px 16px", backgroundColor: BROWN, color: WHITE,
            border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={13} /> Add Payment
        </button>
      </OpsCard>

      <OpsCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Payment History · {payments.length}
        </div>
        {payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 12px", fontSize: 12, color: MUTED }}>
            <Coins size={22} style={{ color: BROWN, opacity: 0.4, marginBottom: 8 }} />
            <div>{debtQuery.isLoading ? "Loading…" : "No payments yet. Log your first one."}</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Source</th>
                  <th style={thStyle}>Notes</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const runningPaid = payments.slice(i).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                  const remAfter = Math.max(totalDebt - runningPaid, 0);
                  return (
                    <tr key={p.id} style={{ borderTop: `1px solid ${DARK}08` }}>
                      <td style={tdStyle}>{fmtDate(p.date)}</td>
                      <td style={{ ...tdStyle, color: SUCCESS, fontWeight: 600 }}>{fmtNaira(Number(p.amount))}</td>
                      <td style={tdStyle}>{p.source}</td>
                      <td style={tdStyle}>
                        <div>{p.notes || "—"}</div>
                        <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                          Remaining after: {fmtNaira(remAfter)}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button onClick={() => del(p.id)}
                          style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}
                          title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </OpsCard>
    </div>
  );
}

/* ═════════════════════════ WEEKLY SCHEDULE ═════════════════════════ */
function ScheduleSection() {
  const utils = trpc.useUtils();
  const [week, setWeek] = useState<string>(isoWeek());
  const scheduleQuery = trpc.founder.schedule.list.useQuery({ week });
  const checks: ScheduleCheck[] = ((scheduleQuery.data ?? []) as ScheduleCheck[]).filter(c => c.week === week);

  const toggleMut = trpc.founder.schedule.toggle.useMutation({
    onSuccess: () => utils.founder.schedule.list.invalidate(),
  });

  const doneKeys = new Set(checks.filter(c => c.done).map(c => c.slot));
  const total = SCHEDULE.length;
  const done = doneKeys.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = (s: Slot) => {
    const key = slotKey(s);
    const existing = checks.find(c => c.slot === key);
    const nextDone = existing ? !existing.done : true;
    toggleMut.mutate({ week, slot: key, done: nextDone });
  };

  /* Phases by day for progress visual. */
  const dayPhases = DAYS.map(d => ({ id: d, label: d.slice(0, 3) }));
  const dayCounts: Record<string, number> = {};
  for (const d of DAYS) {
    const dayCount = SCHEDULE.filter(s => s.day === d).length;
    const doneCount = checks.filter(c => c.done && c.slot.startsWith(`${d}|`)).length;
    dayCounts[d] = doneCount;
    void dayCount;
  }
  /* Which day is "current" — today if in range, else last fully-done, else first. */
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const currentDay = DAYS.includes(todayName) ? todayName : DAYS[0];

  return (
    <div>
      <OpsHeader
        title="Weekly Schedule"
        sub="Fajr · Gym · Partnerships · CEO · Reading · Studio · Maghrib. Tick what you do."
        action={
          <input type="week"
            value={week.replace("-W", "-W")}
            onChange={e => setWeek(e.target.value)}
            style={{ ...inputStyle, maxWidth: 180 }}
          />
        }
      />

      <OpsCard style={{ marginBottom: 16 }}>
        <PhaseTracker
          phases={dayPhases}
          currentPhaseId={currentDay}
          counts={dayCounts}
          accent={BROWN}
          label={`Week ${week} · ${done}/${total} slots (${pct}%)`}
        />
      </OpsCard>

      {DAYS.map(day => {
        const slots = SCHEDULE.filter(s => s.day === day);
        const doneToday = slots.filter(s => doneKeys.has(slotKey(s))).length;
        const dayPct = slots.length > 0 ? Math.round((doneToday / slots.length) * 100) : 0;
        const isToday = day === todayName;
        return (
          <OpsCard key={day} style={{ marginBottom: 12, borderLeft: isToday ? `3px solid ${BROWN}` : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                  {day} {isToday && <span style={{ fontSize: 10, color: BROWN, marginLeft: 8 }}>TODAY</span>}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{doneToday}/{slots.length} complete · {dayPct}%</div>
              </div>
              <div style={{ width: 100 }}>
                <ProgressBar pct={dayPct} color={BROWN} thin />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {slots.map(s => {
                const checked = doneKeys.has(slotKey(s));
                return (
                  <button key={slotKey(s)} onClick={() => toggle(s)}
                    style={{
                      textAlign: "left", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "8px 10px", borderRadius: 8,
                      backgroundColor: checked ? `${SUCCESS}10` : BG,
                      transition: "background 0.15s",
                    }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      flexShrink: 0, marginTop: 1,
                      backgroundColor: checked ? SUCCESS : "transparent",
                      border: checked ? `1.5px solid ${SUCCESS}` : `1.5px solid #D1D5DB`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && <CheckCircle2 size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: checked ? MUTED : DARK, textDecoration: checked ? "line-through" : "none" }}>
                          {s.time} · {s.activity}
                        </span>
                        <span style={{ fontSize: 10, color: BROWN, backgroundColor: `${BROWN}12`, padding: "1px 7px", borderRadius: 999 }}>
                          {s.duration}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {s.location}{s.notes ? ` · ${s.notes}` : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </OpsCard>
        );
      })}
    </div>
  );
}

/* ═════════════════════════ CONTENT TRACKER ═════════════════════════ */
function ContentSection() {
  const utils = trpc.useUtils();
  const contentQuery = trpc.founder.content.list.useQuery();
  const all: ContentRow[] = useMemo(
    () => ((contentQuery.data ?? []) as ContentRow[])
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [contentQuery.data],
  );

  const createMut = trpc.founder.content.create.useMutation({
    onSuccess: () => {
      utils.founder.content.list.invalidate();
      toast.success("Content row logged.");
    },
  });
  const updateMut = trpc.founder.content.update.useMutation({
    onSuccess: () => utils.founder.content.list.invalidate(),
  });
  const removeMut = trpc.founder.content.remove.useMutation({
    onSuccess: () => utils.founder.content.list.invalidate(),
  });

  const [form, setForm] = useState({
    date: todayISO(),
    platform: "Instagram",
    contentType: "Reel",
    theme: "",
    mentor: "",
    posted: "Scheduled",
    engagement: "",
    saved: false,
    notes: "",
  });

  const add = () => {
    if (!form.theme) {
      toast.error("Add a theme/topic.");
      return;
    }
    createMut.mutate({
      date: form.date,
      platform: form.platform,
      contentType: form.contentType,
      theme: form.theme,
      mentor: form.mentor || undefined,
      posted: form.posted,
      engagement: form.engagement || undefined,
      saved: form.saved,
      notes: form.notes || undefined,
    });
    setForm({ ...form, theme: "", mentor: "", engagement: "", saved: false, notes: "" });
  };

  const del = (id: number) => {
    if (!confirm("Delete this row?")) return;
    removeMut.mutate({ id });
  };
  const toggleSaved = (id: number, v: boolean) => {
    updateMut.mutate({ id, saved: v });
  };

  const posted = all.filter(r => r.posted === "Yes").length;
  const scheduled = all.filter(r => r.posted === "Scheduled").length;
  const saved = all.filter(r => r.saved).length;

  return (
    <div>
      <OpsHeader title="Content Tracker" sub="Every post, every platform. Who inspired it, what landed." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsKpi label="Total Rows" value={all.length} accent={BROWN} />
        <OpsKpi label="Posted" value={posted} accent={SUCCESS} />
        <OpsKpi label="Scheduled" value={scheduled} accent={BLUE} />
        <OpsKpi label="Saved" value={saved} accent={GOLD} />
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Log Content
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          <Field label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Platform">
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} style={inputStyle}>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Facebook</option>
              <option>YouTube</option>
              <option>LinkedIn</option>
              <option>X (Twitter)</option>
              <option>Threads</option>
            </select>
          </Field>
          <Field label="Type">
            <select value={form.contentType} onChange={e => setForm({ ...form, contentType: e.target.value })} style={inputStyle}>
              <option>Reel</option>
              <option>Video</option>
              <option>Post</option>
              <option>Carousel</option>
              <option>Story</option>
              <option>Live</option>
              <option>Long-form</option>
            </select>
          </Field>
          <Field label="Theme / Topic">
            <input type="text" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} style={inputStyle} placeholder="From debt to building empire…" />
          </Field>
          <Field label="Mentor Tagged">
            <select value={form.mentor} onChange={e => setForm({ ...form, mentor: e.target.value })} style={inputStyle}>
              <option value="">—</option>
              {MENTORS.map(m => <option key={m.name}>{m.name}</option>)}
            </select>
          </Field>
          <Field label="Posted?">
            <select value={form.posted} onChange={e => setForm({ ...form, posted: e.target.value })} style={inputStyle}>
              <option>Scheduled</option>
              <option>Yes</option>
              <option>Drafted</option>
              <option>Idea</option>
            </select>
          </Field>
          <Field label="Engagement">
            <input type="text" value={form.engagement} onChange={e => setForm({ ...form, engagement: e.target.value })} style={inputStyle} placeholder="2.5K likes" />
          </Field>
          <Field label="Saved by audience?">
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `1px solid ${DARK}15`, borderRadius: 10 }}>
              <input type="checkbox" checked={form.saved} onChange={e => setForm({ ...form, saved: e.target.checked })} />
              <span style={{ fontSize: 12, color: DARK }}>Yes, saved</span>
            </label>
          </Field>
          <Field label="Notes">
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} placeholder="What landed / what didn't" />
          </Field>
        </div>
        <button onClick={add}
          style={{
            marginTop: 12, padding: "9px 16px", backgroundColor: BROWN, color: WHITE,
            border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={13} /> Add Row
        </button>
      </OpsCard>

      <OpsCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          History · {all.length}
        </div>
        {all.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 12px", fontSize: 12, color: MUTED }}>
            <PenSquare size={22} style={{ color: BROWN, opacity: 0.4, marginBottom: 8 }} />
            <div>{contentQuery.isLoading ? "Loading…" : "Nothing logged yet."}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {all.map(row => (
              <div key={row.id}
                style={{ padding: "10px 12px", backgroundColor: BG, border: `1px solid ${DARK}06`, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{row.theme || "—"}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                      {fmtDate(row.date)} · {row.platform} · {row.contentType}
                      {row.mentor ? ` · ${row.mentor}` : ""}
                    </div>
                    {(row.engagement || row.notes) && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 4 }}>
                        {row.engagement && <span style={{ color: GREEN, fontWeight: 600 }}>{row.engagement}</span>}
                        {row.engagement && row.notes && <span> · </span>}
                        {row.notes && <span style={{ color: MUTED }}>{row.notes}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Pill label={row.posted} tone={row.posted === "Yes" ? "green" : row.posted === "Scheduled" ? "blue" : "muted"} />
                    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <input type="checkbox" checked={row.saved} onChange={e => toggleSaved(row.id, e.target.checked)} />
                      <span style={{ fontSize: 10, color: MUTED }}>Saved</span>
                    </label>
                    <button onClick={() => del(row.id)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}
                      title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </OpsCard>
    </div>
  );
}

/* ═════════════════════════ LEARNING TRACKER ═════════════════════════ */
function LearningSection() {
  const utils = trpc.useUtils();
  const learningQuery = trpc.founder.learning.list.useQuery();
  const all: LearningRow[] = useMemo(
    () => ((learningQuery.data ?? []) as LearningRow[])
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [learningQuery.data],
  );

  const createMut = trpc.founder.learning.create.useMutation({
    onSuccess: () => {
      utils.founder.learning.list.invalidate();
      toast.success("Lesson captured.");
    },
  });
  const updateMut = trpc.founder.learning.update.useMutation({
    onSuccess: () => utils.founder.learning.list.invalidate(),
  });
  const removeMut = trpc.founder.learning.remove.useMutation({
    onSuccess: () => utils.founder.learning.list.invalidate(),
  });

  const [form, setForm] = useState({
    date: todayISO(),
    source: "",
    mentor: "",
    lesson: "",
    screenshot: false,
    whyWorth: "",
    howApply: "",
    applied: "Not Yet" as LearningApplied,
  });

  const add = () => {
    if (!form.lesson) {
      toast.error("Capture the lesson.");
      return;
    }
    createMut.mutate({
      date: form.date,
      source: form.source || "—",
      mentor: form.mentor || undefined,
      lesson: form.lesson,
      screenshot: form.screenshot,
      whyWorth: form.whyWorth || undefined,
      howApply: form.howApply || undefined,
      applied: form.applied,
    });
    setForm({ ...form, source: "", lesson: "", whyWorth: "", howApply: "", screenshot: false });
  };

  const cycleApplied = (id: number, current: LearningApplied) => {
    const next: LearningApplied =
      current === "Not Yet" ? "In Progress" : current === "In Progress" ? "Yes" : "Not Yet";
    updateMut.mutate({ id, applied: next });
  };

  const del = (id: number) => {
    if (!confirm("Delete this lesson?")) return;
    removeMut.mutate({ id });
  };

  const saved = all.filter(r => r.screenshot).length;
  const applied = all.filter(r => r.applied === "Yes").length;
  const inprog = all.filter(r => r.applied === "In Progress").length;

  return (
    <div>
      <OpsHeader title="Learning Tracker" sub="Mentors, lessons, screenshots, application. Wisdom, compounded." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsKpi label="Lessons" value={all.length} accent={BROWN} />
        <OpsKpi label="Screenshots Saved" value={saved} accent={GOLD} />
        <OpsKpi label="Applied" value={applied} accent={SUCCESS} />
        <OpsKpi label="In Progress" value={inprog} accent={BLUE} />
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          My Mentors
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {MENTORS.map(m => (
            <div key={m.name} style={{
              padding: "10px 12px", backgroundColor: BG, border: `1px solid ${DARK}08`,
              borderRadius: 10, borderLeft: `3px solid ${BROWN}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>{m.name}</div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{m.group}</div>
              <div style={{ fontSize: 11, color: DARK, marginTop: 6 }}>{m.theme}</div>
            </div>
          ))}
        </div>
      </OpsCard>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Capture Lesson
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <Field label="Date">
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Source">
            <input type="text" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={inputStyle} placeholder="Book / YouTube / Podcast" />
          </Field>
          <Field label="Mentor / Creator">
            <select value={form.mentor} onChange={e => setForm({ ...form, mentor: e.target.value })} style={inputStyle}>
              <option value="">—</option>
              {MENTORS.map(m => <option key={m.name}>{m.name}</option>)}
              <option>Other</option>
            </select>
          </Field>
          <Field label="Applied?">
            <select value={form.applied} onChange={e => setForm({ ...form, applied: e.target.value as LearningApplied })} style={inputStyle}>
              <option>Not Yet</option>
              <option>In Progress</option>
              <option>Yes</option>
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <Field label="Key Lesson">
            <input type="text" value={form.lesson} onChange={e => setForm({ ...form, lesson: e.target.value })} style={inputStyle} placeholder="One-sentence takeaway" />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
          <Field label="Why worth my energy">
            <input type="text" value={form.whyWorth} onChange={e => setForm({ ...form, whyWorth: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="How I'll apply">
            <input type="text" value={form.howApply} onChange={e => setForm({ ...form, howApply: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Screenshot saved?">
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `1px solid ${DARK}15`, borderRadius: 10 }}>
              <input type="checkbox" checked={form.screenshot} onChange={e => setForm({ ...form, screenshot: e.target.checked })} />
              <span style={{ fontSize: 12, color: DARK }}>Yes</span>
            </label>
          </Field>
        </div>
        <button onClick={add}
          style={{
            marginTop: 12, padding: "9px 16px", backgroundColor: BROWN, color: WHITE,
            border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={13} /> Capture
        </button>
      </OpsCard>

      <OpsCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Library · {all.length}
        </div>
        {all.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 12px", fontSize: 12, color: MUTED }}>
            <BookOpen size={22} style={{ color: BROWN, opacity: 0.4, marginBottom: 8 }} />
            <div>{learningQuery.isLoading ? "Loading…" : "Nothing captured yet."}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {all.map(row => (
              <div key={row.id}
                style={{ padding: "10px 12px", backgroundColor: BG, border: `1px solid ${DARK}06`, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{row.lesson}</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                      {fmtDate(row.date)} · {row.source} · {row.mentor || "—"}
                    </div>
                    {row.whyWorth && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 4 }}>
                        <span style={{ color: MUTED }}>Why:</span> {row.whyWorth}
                      </div>
                    )}
                    {row.howApply && (
                      <div style={{ fontSize: 11, color: DARK, marginTop: 2 }}>
                        <span style={{ color: MUTED }}>Apply:</span> {row.howApply}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {row.screenshot && <Pill label="📸 Saved" tone="gold" />}
                    <button onClick={() => cycleApplied(row.id, row.applied)}
                      style={{
                        padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                        cursor: "pointer", border: "none",
                        backgroundColor: row.applied === "Yes" ? `${SUCCESS}15` : row.applied === "In Progress" ? `${BLUE}15` : "#9CA3AF25",
                        color: row.applied === "Yes" ? SUCCESS : row.applied === "In Progress" ? BLUE : MUTED,
                      }}
                      title="Click to cycle status">
                      {row.applied}
                    </button>
                    <button onClick={() => del(row.id)}
                      style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}
                      title="Delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </OpsCard>
    </div>
  );
}

/* ═════════════════════════ VISION & LEGACY ═════════════════════════ */
function VisionSection() {
  const utils = trpc.useUtils();
  const milestonesQuery = trpc.founder.milestones.list.useQuery();
  const milestones: Milestone[] = useMemo(
    () => ((milestonesQuery.data ?? []) as Milestone[])
      .slice()
      .sort((a, b) => {
        const ta = a.target ? new Date(a.target).getTime() : Infinity;
        const tb = b.target ? new Date(b.target).getTime() : Infinity;
        return ta - tb;
      }),
    [milestonesQuery.data],
  );

  const createMut = trpc.founder.milestones.create.useMutation({
    onSuccess: () => {
      utils.founder.milestones.list.invalidate();
      toast.success("Milestone added.");
    },
  });
  const updateMut = trpc.founder.milestones.update.useMutation({
    onSuccess: () => utils.founder.milestones.list.invalidate(),
  });
  const removeMut = trpc.founder.milestones.remove.useMutation({
    onSuccess: () => utils.founder.milestones.list.invalidate(),
  });

  const [form, setForm] = useState({ label: "", target: todayISO(), status: "Not Started" as MilestoneStatus });

  const addMilestone = () => {
    if (!form.label) {
      toast.error("Name the milestone.");
      return;
    }
    createMut.mutate({ label: form.label, target: form.target, status: form.status });
    setForm({ label: "", target: todayISO(), status: "Not Started" });
  };
  const updStatus = (id: number, status: MilestoneStatus) => {
    updateMut.mutate({ id, status });
  };
  const del = (id: number) => {
    if (!confirm("Delete this milestone?")) return;
    removeMut.mutate({ id });
  };

  /* Convert milestones → AssetChecklist items for the shared primitive. */
  const checklist: AssetItem[] = milestones.map(m => ({
    id: String(m.id),
    label: `${m.label} — target ${fmtDate(m.target)}`,
    group: groupForMilestone(m.target),
    done: m.status === "Done",
    note: m.status,
  }));

  const done = milestones.filter(m => m.status === "Done").length;
  const inprog = milestones.filter(m => m.status === "In Progress").length;
  const planned = milestones.filter(m => m.status === "Planning" || m.status === "Not Started").length;

  return (
    <div>
      <OpsHeader title="Vision & Legacy" sub="Debt → Freedom → Empire → Generational Wealth." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsKpi label="Milestones" value={milestones.length} accent={BROWN} />
        <OpsKpi label="Done" value={done} accent={SUCCESS} />
        <OpsKpi label="In Progress" value={inprog} accent={BLUE} />
        <OpsKpi label="Planned" value={planned} accent={MUTED} />
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Where I Am Today
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: DARK, fontSize: 12, lineHeight: 1.8 }}>
          <li>In debt — but building my way out with integrity.</li>
          <li>Built complete Hamzury ecosystem (9 divisions).</li>
          <li>Systems in place, ready to scale.</li>
          <li>Starting disciplined daily routine.</li>
          <li>Growing personal brand (Instagram, TikTok, Facebook).</li>
        </ul>
      </OpsCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 16 }}>
        <OpsCard>
          <div style={{ fontSize: 12, fontWeight: 700, color: BROWN, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            2027 Goals (18 months)
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: DARK, fontSize: 12, lineHeight: 1.8 }}>
            <li>DEBT FREEDOM ✓</li>
            <li>Hamzury generating ₦10M+/month</li>
            <li>Invited as coach/mentor to conferences</li>
            <li>100K+ followers across platforms</li>
            <li>Made 5+ people millionaires through Hamzury</li>
            <li>All systems automated, can be away 3 weeks</li>
          </ul>
        </OpsCard>
        <OpsCard>
          <div style={{ fontSize: 12, fontWeight: 700, color: BROWN, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            5-Year Vision (2031)
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: DARK, fontSize: 12, lineHeight: 1.8 }}>
            <li>Hamzury operating globally (Nigeria, Ghana, Kenya, SA)</li>
            <li>Muhammad Hamzury = recognised business thought leader</li>
            <li>Made 50+ millionaires</li>
            <li>Multiple revenue streams beyond Hamzury</li>
            <li>Family financially secure for life</li>
            <li>Giving back to community (mosque, education)</li>
          </ul>
        </OpsCard>
        <OpsCard>
          <div style={{ fontSize: 12, fontWeight: 700, color: BROWN, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Generational Legacy
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: DARK, fontSize: 12, lineHeight: 1.8 }}>
            <li>Systems that outlast me</li>
            <li>Wealth for my children's children</li>
            <li>Philosophy documented (The Hamzury Way)</li>
            <li>Made hundreds of people millionaires</li>
            <li>Changed how business is done in Africa</li>
            <li>Proof: integrity + systems + faith = success</li>
          </ul>
        </OpsCard>
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Add Milestone
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <Field label="Label">
            <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={inputStyle} placeholder="First ₦1M month" />
          </Field>
          <Field label="Target date">
            <input type="date" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} style={inputStyle} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as MilestoneStatus })} style={inputStyle}>
              <option>Not Started</option>
              <option>Planning</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </Field>
        </div>
        <button onClick={addMilestone}
          style={{
            marginTop: 12, padding: "9px 16px", backgroundColor: BROWN, color: WHITE,
            border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={13} /> Add
        </button>
      </OpsCard>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Milestones Tracker
        </div>
        <AssetChecklist items={checklist} grouped accent={BROWN} />
      </OpsCard>

      <OpsCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Status Controls
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {milestones.map(m => (
            <div key={m.id} style={{
              padding: "10px 12px", backgroundColor: BG, border: `1px solid ${DARK}06`,
              borderRadius: 10, display: "flex", justifyContent: "space-between",
              alignItems: "center", gap: 10, flexWrap: "wrap",
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{m.label}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Target {fmtDate(m.target)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <select value={m.status} onChange={e => updStatus(m.id, e.target.value as MilestoneStatus)}
                  style={{ padding: "5px 8px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 11, color: DARK, backgroundColor: WHITE, cursor: "pointer" }}>
                  <option>Not Started</option>
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
                <button onClick={() => del(m.id)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}
                  title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </OpsCard>
    </div>
  );
}

function groupForMilestone(target: string | null | undefined): string {
  if (!target) return "Other";
  try {
    const y = new Date(target).getFullYear();
    if (y <= 2026) return "2026";
    if (y === 2027) return "2027";
    if (y <= 2031) return "2028-2031";
    return "Generational";
  } catch { return "Other"; }
}

/* ═════════════════════════ VAULT ═════════════════════════ */
function VaultSection() {
  const utils = trpc.useUtils();
  const vaultQuery = trpc.founder.vault.list.useQuery();
  const all: VaultRow[] = useMemo(
    () => ((vaultQuery.data ?? []) as VaultRow[])
      .slice()
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "account" ? -1 : 1)),
    [vaultQuery.data],
  );

  const createMut = trpc.founder.vault.create.useMutation({
    onSuccess: () => {
      utils.founder.vault.list.invalidate();
      toast.success("Saved to vault.");
    },
  });
  const removeMut = trpc.founder.vault.remove.useMutation({
    onSuccess: () => utils.founder.vault.list.invalidate(),
  });

  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({
    kind: "account" as VaultKind,
    service: "",
    username: "",
    secret: "",
    securityQ: "",
    recovery: "",
    storageLocation: "",
    notes: "",
  });

  const add = () => {
    if (!form.service) {
      toast.error("Service / account is required.");
      return;
    }
    createMut.mutate({
      kind: form.kind,
      service: form.service,
      username: form.username || undefined,
      secret: form.secret || undefined,
      securityQ: form.securityQ || undefined,
      recovery: form.recovery || undefined,
      storageLocation: form.storageLocation || undefined,
      notes: form.notes || undefined,
    });
    setForm({ kind: form.kind, service: "", username: "", secret: "", securityQ: "", recovery: "", storageLocation: "", notes: "" });
  };

  const del = (id: number) => {
    if (!confirm("Remove from vault?")) return;
    removeMut.mutate({ id });
    setRevealed(prev => {
      const next = new Set(prev); next.delete(id); return next;
    });
  };

  const toggleReveal = (id: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyText = (t: string | undefined | null) => {
    if (!t) return;
    navigator.clipboard.writeText(t).then(
      () => toast.success("Copied"),
      () => toast.error("Copy failed"),
    );
  };

  const accounts = all.filter(v => v.kind === "account");
  const docs = all.filter(v => v.kind === "doc");

  return (
    <div>
      <OpsHeader
        title="Password Vault"
        sub="⚠ Private — founder only. Passwords masked until revealed. Encrypted at rest on the server."
      />

      <OpsCard style={{
        marginBottom: 16, backgroundColor: `${ORANGE}10`,
        borderLeft: `3px solid ${ORANGE}`,
      }}>
        <div style={{ fontSize: 12, color: DARK, lineHeight: 1.6 }}>
          <strong>Security note:</strong> entries are encrypted server-side (AES-256-GCM) and only
          decrypted for the founder. Treat this like a quick-access card — move critical credentials
          to a real password manager (1Password, Bitwarden) when possible.
        </div>
      </OpsCard>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Add Entry
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <Field label="Kind">
            <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value as VaultKind })} style={inputStyle}>
              <option value="account">Account / Password</option>
              <option value="doc">Document Location</option>
            </select>
          </Field>
          <Field label="Service / Account">
            <input type="text" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={inputStyle} placeholder={form.kind === "account" ? "Instagram @hamzury" : "Debt Documents"} />
          </Field>
          {form.kind === "account" ? (
            <>
              <Field label="Username / Email">
                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Password / PIN">
                <input type="password" value={form.secret} onChange={e => setForm({ ...form, secret: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Security Q / Answer">
                <input type="text" value={form.securityQ} onChange={e => setForm({ ...form, securityQ: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Recovery Email">
                <input type="email" value={form.recovery} onChange={e => setForm({ ...form, recovery: e.target.value })} style={inputStyle} />
              </Field>
            </>
          ) : (
            <Field label="Storage Location">
              <input type="text" value={form.storageLocation} onChange={e => setForm({ ...form, storageLocation: e.target.value })} style={inputStyle} placeholder="Google Drive: Personal/Debt/" />
            </Field>
          )}
          <Field label="Notes">
            <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inputStyle} />
          </Field>
        </div>
        <button onClick={add}
          style={{
            marginTop: 12, padding: "9px 16px", backgroundColor: BROWN, color: WHITE,
            border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
          <Plus size={13} /> Save
        </button>
      </OpsCard>

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Accounts · {accounts.length}
        </div>
        {accounts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 12px", fontSize: 12, color: MUTED }}>
            {vaultQuery.isLoading ? "Loading…" : "No accounts yet."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {accounts.map(v => (
              <VaultCard key={v.id} row={v}
                revealed={revealed.has(v.id)}
                onToggle={() => toggleReveal(v.id)}
                onCopy={copyText}
                onDelete={() => del(v.id)} />
            ))}
          </div>
        )}
      </OpsCard>

      <OpsCard>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Document Locations · {docs.length}
        </div>
        {docs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 12px", fontSize: 12, color: MUTED }}>
            {vaultQuery.isLoading ? "Loading…" : "No document rows yet."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map(v => (
              <div key={v.id} style={{
                padding: "10px 12px", backgroundColor: BG, border: `1px solid ${DARK}06`,
                borderRadius: 10, display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{v.service}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                    {v.storageLocation || "—"}
                    {v.notes ? ` · ${v.notes}` : ""}
                  </div>
                </div>
                <button onClick={() => del(v.id)}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}
                  title="Delete"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </OpsCard>
    </div>
  );
}

function VaultCard({
  row, revealed, onToggle, onCopy, onDelete,
}: {
  row: VaultRow;
  revealed: boolean;
  onToggle: () => void;
  onCopy: (s: string | undefined | null) => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      padding: "12px 14px", backgroundColor: BG, border: `1px solid ${DARK}06`,
      borderRadius: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{row.service}</div>
          {row.notes && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{row.notes}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={onToggle}
            style={{
              padding: "5px 10px", borderRadius: 8, border: `1px solid ${BROWN}30`,
              background: WHITE, color: BROWN, cursor: "pointer",
              fontSize: 10, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
            }}>
            {revealed ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Reveal</>}
          </button>
          <button onClick={onDelete}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: RED }}
            title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
        {row.username && (
          <VaultField label="Username / Email" value={row.username} revealed onCopy={() => onCopy(row.username)} />
        )}
        {row.secret && (
          <VaultField label="Password / PIN" value={revealed ? row.secret : mask(row.secret)} revealed={revealed}
            onCopy={() => onCopy(row.secret)} />
        )}
        {row.securityQ && (
          <VaultField label="Security Q" value={revealed ? row.securityQ : mask(row.securityQ)} revealed={revealed}
            onCopy={() => onCopy(row.securityQ)} />
        )}
        {row.recovery && (
          <VaultField label="Recovery" value={row.recovery} revealed onCopy={() => onCopy(row.recovery)} />
        )}
      </div>
    </div>
  );
}

function VaultField({ label, value, revealed, onCopy }:
  { label: string; value: string; revealed: boolean; onCopy: () => void }
) {
  return (
    <div>
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>
        {label}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 10px", backgroundColor: WHITE,
        border: `1px solid ${DARK}10`, borderRadius: 8,
      }}>
        <span style={{
          fontSize: 12, color: DARK, flex: 1, minWidth: 0, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: revealed ? "inherit" : "monospace",
        }}>
          {value}
        </span>
        <button onClick={onCopy}
          style={{ border: "none", background: "transparent", cursor: "pointer", color: BROWN }}
          title="Copy">
          <Copy size={12} />
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════ SHARED UI BITS ═════════════════════════ */
function useLocalString(key: string, initial: string): [string, (v: string) => void] {
  const [val, setVal] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ?? initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, val); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, fontWeight: 600 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <input type="number" min="0" step="1" value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
    </Field>
  );
}

function ProgressBar({ pct, color, thin }: { pct: number; color: string; thin?: boolean }) {
  const h = thin ? 6 : 10;
  return (
    <div style={{
      width: "100%", height: h, backgroundColor: "#E5E7EB",
      borderRadius: h, overflow: "hidden",
    }}>
      <div style={{
        width: `${clamp(pct, 0, 100)}%`, height: "100%",
        backgroundColor: color, transition: "width 0.4s ease",
      }} />
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: "12px 12px", backgroundColor: BG, border: `1px solid ${DARK}08`,
      borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, backgroundColor: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: DARK, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, color: MUTED, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      </div>
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone: "green" | "gold" | "red" | "blue" | "muted" | "orange" }) {
  const map = {
    green:  { bg: `${SUCCESS}15`, fg: SUCCESS },
    gold:   { bg: `${GOLD}20`,    fg: GOLD },
    red:    { bg: `${RED}15`,     fg: RED },
    blue:   { bg: `${BLUE}15`,    fg: BLUE },
    muted:  { bg: "#9CA3AF25",    fg: MUTED },
    orange: { bg: `${ORANGE}15`,  fg: ORANGE },
  }[tone];
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 12, fontSize: 10, fontWeight: 600,
      backgroundColor: map.bg, color: map.fg, textTransform: "uppercase",
      letterSpacing: "0.04em",
    }}>{label}</span>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  border: `1px solid ${DARK}15`,
  fontSize: 12,
  color: DARK,
  backgroundColor: WHITE,
  outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "8px 8px",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 8px",
  verticalAlign: "top",
  color: DARK,
};
