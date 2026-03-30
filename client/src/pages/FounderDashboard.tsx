import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import { FINANCE_SUMMARY, SHARED_TASKS, formatNaira } from "@/lib/dashboardStore";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Gem, LogOut, ArrowLeft, LayoutDashboard, Zap, BarChart2,
  DollarSign, Users, CalendarDays, ClipboardCheck, FolderOpen,
  AlertTriangle, TrendingUp, CheckCircle2, Clock, FileText,
  BookOpen, GraduationCap, Shield, Lock, Calculator, Loader2, Target,
  Eye, EyeOff, Plus, Trash2, Bot, Play, Pause, RotateCcw,
  Copy, Phone, Building2, Pencil, ChevronDown, ChevronRight,
} from "lucide-react";

// ─── Brand ──────────────────────────────────────────────────────────────────
const CHOCO = "#2C1A0E";
const GOLD  = "#B48C4C";
const MILK  = "#FFFAF6";   // Milk white

type Section = "overview" | "command" | "analytics" | "commissions" | "staff" | "calendar" | "assign" | "files" | "vault" | "aiops";

// ─── Mock Seed Data ──────────────────────────────────────────────────────────
const MOCK_REVENUE = [
  { month: "Oct", revenue: 2400000 },
  { month: "Nov", revenue: 3100000 },
  { month: "Dec", revenue: 2800000 },
  { month: "Jan", revenue: 3750000 },
  { month: "Feb", revenue: 4200000 },
  { month: "Mar", revenue: 4850000 },
];

const MOCK_LEAD_SOURCES = [
  { source: "Content", count: 18 },
  { source: "Referrals", count: 12 },
  { source: "Partners", count: 9 },
  { source: "Events", count: 7 },
];

const MOCK_DEPT_PERFORMANCE = [
  { dept: "BizDoc", completed: 24, active: 8, color: "#1B4D3E" },
  { dept: "Systemise", completed: 11, active: 5, color: "#4285F4" },
  { dept: "Skills", completed: 18, active: 12, color: "#B48C4C" },
  { dept: "BizDev", completed: 7, active: 3, color: "#34A853" },
];

const MOCK_ESCALATIONS = [
  { id: 1, type: "High-value Lead", title: "Lagos conglomerate — ₦4.2M project scope", from: "BizDev", urgency: "high", time: "2h ago" },
  { id: 2, type: "Commission Approval", title: "3 commissions pending approval — ₦280,000 total", from: "Finance", urgency: "medium", time: "4h ago" },
  { id: 3, type: "Brand Conflict", title: "External agency proposal does not meet brand guidelines", from: "BizDev", urgency: "medium", time: "1d ago" },
];

const MOCK_EVENTS = [
  { day: "Mon", date: "23", title: "Weekly Strategy Sync — All Dept Leads", time: "9:00 AM" },
  { day: "Wed", date: "25", title: "BizDoc Client Review — Q1 Compliance Batch", time: "2:00 PM" },
  { day: "Fri", date: "27", title: "HAMZURY Monthly All-Hands", time: "4:00 PM" },
];

const STAFF = [
  { name: "Idris Ibrahim", title: "Chief Executive Officer", dept: "CEO", color: "#2563EB" },
  { name: "CSO Lead", title: "Chief Strategy Officer", dept: "CSO", color: "#2563EB" },
  { name: "Finance Lead", title: "Finance Manager", dept: "Finance", color: "#7B4F00" },
  { name: "Ibrahim (HR)", title: "HR Manager", dept: "Federal", color: "#2D5A27" },
  { name: "Emeka Okafor", title: "BizDoc Lead", dept: "BizDoc", color: "#1B4D3E" },
  { name: "Ngozi Chukwu", title: "Skills Administrator", dept: "Skills", color: "#8B6914" },
  { name: "Kemi Adeyemi", title: "BizDev Lead", dept: "BizDev", color: "#34A853" },
  { name: "Abiodun Salami", title: "Systemise Lead", dept: "Systemise", color: "#2563EB" },
];

const FILES = [
  { icon: FileText, title: "Brand Voice Guide", desc: "Tone, messaging, and positioning standards" },
  { icon: BookOpen, title: "Operations Manual", desc: "HAMZURY institutional SOP" },
  { icon: Calculator, title: "Commission Structure", desc: "40/60 split and tier breakdown" },
  { icon: Users, title: "Staff Directory", desc: "All team members and roles" },
  { icon: Shield, title: "BizDoc Compliance Checklist", desc: "CAC, FIRS, and regulatory requirements" },
  { icon: GraduationCap, title: "Skills Curriculum Master", desc: "All programs, modules, and cohorts" },
  { icon: TrendingUp, title: "BizDev Lead Qualification SOP", desc: "5-point checklist and handoff protocol" },
  { icon: Lock, title: "NDPR Privacy Compliance Guide", desc: "Data protection requirements for Nigeria" },
  { icon: DollarSign, title: "Founder Commission Override", desc: "Commission approval and adjustment authority" },
  { icon: Target, title: "Strategic Goals 2026", desc: "Company OKRs and founder-level targets" },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FounderDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [resolvedRefs, setResolvedRefs] = useState<string[]>([]);

  const statsQuery       = trpc.institutional.stats.useQuery(undefined, { refetchInterval: 30000 });
  const activityQuery    = trpc.activity.recent.useQuery({ limit: 10 });
  const commissionsQuery = trpc.commissions.list.useQuery();
  const leadsQuery       = trpc.leads.list.useQuery();
  const escalationsQuery = trpc.institutional.escalations.useQuery(undefined, { refetchInterval: 30000 });
  const deptStatsQuery   = trpc.institutional.deptStats.useQuery(undefined, { refetchInterval: 30000 });
  const revenueStatsQuery = trpc.commissions.revenueStats.useQuery(undefined, { refetchInterval: 60000 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const stats        = statsQuery.data;
  const activity     = activityQuery.data || [];
  const commissions  = commissionsQuery.data || [];
  const leads        = leadsQuery.data || [];
  const pendingComms = commissions.filter((c: any) => c.status === "pending").length;
  const rawEscalations  = escalationsQuery.data;
  const realDeptStats   = deptStatsQuery.data || [];

  type EscalationItem = { ref: string; type: string; title: string; from: string; urgency: "high" | "medium"; time: string };
  const escalations: EscalationItem[] = rawEscalations && rawEscalations.length > 0
    ? rawEscalations.map(e => ({
        ref: e.ref || `ESC-${Math.random()}`,
        type: e.type === "high_value_task" ? "High-value Task" : e.type === "unassigned_lead" ? "Unassigned Lead" : "Pending Payout",
        title: e.label + (e.value ? ` — ₦${Number(e.value).toLocaleString()}` : ""),
        from: e.type === "high_value_task" ? "Tasks" : e.type === "unassigned_lead" ? "CSO" : "Finance",
        urgency: e.type === "high_value_task" ? "high" : "medium",
        time: "Live",
      }))
    : MOCK_ESCALATIONS.map(e => ({ ref: String(e.id), type: e.type, title: e.title, from: e.from, urgency: e.urgency as "high" | "medium", time: e.time }));

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview",     icon: LayoutDashboard, label: "Overview" },
    { key: "command",      icon: Zap,             label: "Command Center" },
    { key: "analytics",    icon: BarChart2,        label: "Analytics" },
    { key: "commissions",  icon: DollarSign,       label: "Commissions" },
    { key: "staff",        icon: Users,            label: "Staff Directory" },
    { key: "calendar",     icon: CalendarDays,     label: "Calendar" },
    { key: "assign",       icon: ClipboardCheck,   label: "Assign Tasks" },
    { key: "files",        icon: FolderOpen,       label: "Files & Resources" },
    { key: "vault",        icon: Lock,             label: "My Vault" },
    { key: "aiops",        icon: Bot,              label: "AI Operations" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="Founder Dashboard — HAMZURY" description="Founder-level oversight and command centre for HAMZURY." />
      {/* ── Sidebar ── */}
      <div className="w-16 md:w-64 flex flex-col h-full shrink-0" style={{ backgroundColor: CHOCO }}>
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${GOLD}20` }}>
          <Gem size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: GOLD }}>Founder Office</span>
        </div>

        <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="w-full flex items-center justify-center md:justify-start md:px-3 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: activeSection === key ? `${GOLD}18` : "transparent",
                color: activeSection === key ? GOLD : `${GOLD}60`,
              }}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:block ml-3 text-sm font-normal">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t shrink-0" style={{ borderColor: `${GOLD}15` }}>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm"
            style={{ color: `${GOLD}50` }}
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Sign Out</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm mt-1"
            style={{ color: `${GOLD}50` }}
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Back to HAMZURY</span>
          </Link>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${CHOCO}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: CHOCO }}>
              {sidebarItems.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs opacity-40" style={{ color: CHOCO }}>
              {user.name || "Muhammad Hamzury"} · Founder, HAMZURY Innovation Hub
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <NotificationBell />
            <Link href="/hub/ceo" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>CEO Hub</Link>
            <Link href="/hub/cso" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>CSO</Link>
            <Link href="/hub/finance" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>Finance</Link>
            <Link href="/hub/federal" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>Federal</Link>
            <Link href="/hub/bizdev" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>BizDev</Link>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {activeSection === "overview" && (
              <OverviewSection stats={stats} leads={leads} commissions={commissions} activity={activity} />
            )}
            {activeSection === "command" && (
              <CommandSection
                escalations={escalations}
                resolvedRefs={resolvedRefs}
                setResolvedRefs={setResolvedRefs}
                pendingComms={pendingComms}
                onSwitchToAssign={() => setActiveSection("assign")}
              />
            )}
            {activeSection === "analytics" && <AnalyticsSection revenueStats={revenueStatsQuery.data} deptStats={realDeptStats} leads={leads} />}
            {activeSection === "commissions" && <CommissionsSection commissions={commissions} />}
            {activeSection === "staff" && <StaffSection />}
            {activeSection === "calendar" && <CalendarSection />}
            {activeSection === "assign" && <AssignSection />}
            {activeSection === "files" && <FilesSection />}
            {activeSection === "vault" && <VaultSection />}
            {activeSection === "aiops" && <AIOperationsSection />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────
function OverviewSection({ stats, leads, commissions, activity }: {
  stats: any;
  leads: any[];
  commissions: any[];
  activity: any[];
}) {
  const fmtNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const totalRevenue = stats?.totalRevenue ?? 4850000;
  const activeLeads  = leads.length || 23;
  const staffCount   = stats?.totalStaff ?? 18;
  const activeTasks  = (stats?.totalTasks ?? 46) - (stats?.completedTasks ?? 34);
  const completedThis = stats?.completedTasks ?? 34;
  const pendingComms  = commissions.filter((c: any) => c.status === "pending").length || 3;

  const STAT_CARDS = [
    { label: "Total Revenue",      value: fmtNaira(totalRevenue), icon: BarChart2,    color: GOLD,       isText: true },
    { label: "Active Leads",       value: activeLeads,            icon: TrendingUp,   color: "#3B82F6" },
    { label: "Total Staff",        value: staffCount,             icon: Users,        color: "#8B5CF6" },
    { label: "Tasks In Progress",  value: activeTasks,            icon: Clock,        color: "#EAB308" },
    { label: "Completed (Month)",  value: completedThis,          icon: CheckCircle2, color: "#22C55E" },
    { label: "Pending Approvals",  value: pendingComms,           icon: AlertTriangle,color: "#EF4444" },
  ];

  return (
    <div className="space-y-8">
      {/* Finance Snapshot — sourced from shared store */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "rgba(201,169,126,0.08)", border: "1px solid rgba(201,169,126,0.2)" }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: GOLD }}>Finance Snapshot — March 2026</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Revenue",         value: formatNaira(FINANCE_SUMMARY.totalRevenue) },
            { label: "Costs",           value: formatNaira(FINANCE_SUMMARY.operationalCost) },
            { label: "Net Profit",      value: formatNaira(FINANCE_SUMMARY.profit) },
            { label: "Commission Pool", value: formatNaira(FINANCE_SUMMARY.commissionPool) },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-lg font-bold" style={{ color: GOLD }}>{item.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(44,26,14,0.5)" }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, isText }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Icon size={16} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-medium leading-none mb-1" style={{ color: isText ? color : color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: CHOCO }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Department summary */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: CHOCO }}>Department Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_DEPT_PERFORMANCE.map(d => (
            <div key={d.dept} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <p className="text-sm font-medium" style={{ color: CHOCO }}>{d.dept}</p>
              </div>
              <p className="text-2xl font-normal mb-0.5" style={{ color: CHOCO }}>{d.completed}</p>
              <p className="text-xs opacity-40" style={{ color: CHOCO }}>completed · {d.active} active</p>
              <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(d.completed / (d.completed + d.active)) * 100}%`, backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: CHOCO }}>Recent Activity</h2>
        {activity.length === 0 ? (
          <div className="space-y-3">
            {[
              "BizDev handed off new lead — Chukwuemeka Foods Ltd",
              "Finance approved commission — ₦45,000",
              "Skills enrolled 3 new students — Business Essentials Cohort 3",
              "BizDoc completed CAC registration — NorthStar Trading Co",
              "Systemise delivered Clarity Audit — Kemi Properties",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: `${CHOCO}06` }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />
                <p className="text-sm font-normal opacity-70" style={{ color: CHOCO }}>{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activity.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: `${CHOCO}06` }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />
                <p className="text-sm opacity-70" style={{ color: CHOCO }}>{a.action?.replace(/_/g, " ")}</p>
                <span className="ml-auto text-xs opacity-30">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Command Center ──────────────────────────────────────────────────────────
type EscItem = { ref: string; type: string; title: string; from: string; urgency: "high" | "medium"; time: string };
function CommandSection({ escalations, resolvedRefs, setResolvedRefs, pendingComms, onSwitchToAssign }: {
  escalations: EscItem[];
  resolvedRefs: string[];
  setResolvedRefs: React.Dispatch<React.SetStateAction<string[]>>;
  pendingComms: number;
  onSwitchToAssign: () => void;
}) {
  const active = escalations.filter(e => !resolvedRefs.includes(e.ref));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: CHOCO }}>Command Center</h2>
        <p className="text-xs opacity-30" style={{ color: CHOCO }}>Items requiring Founder attention</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button size="sm" style={{ backgroundColor: CHOCO, color: GOLD }} onClick={onSwitchToAssign}>
          + Assign Task to Dept Lead
        </Button>
        <Link href="/hub/finance">
          <Button size="sm" variant="outline" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>
            View Commission Queue ({pendingComms})
          </Button>
        </Link>
        <Link href="/hub/cso">
          <Button size="sm" variant="outline" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>
            View Lead Pipeline
          </Button>
        </Link>
        <Link href="/hub/ceo">
          <Button size="sm" variant="outline" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>
            CEO Hub
          </Button>
        </Link>
        <Link href="/hub/federal">
          <Button size="sm" variant="outline" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>
            Federal Hub
          </Button>
        </Link>
        <Link href="/hub/bizdev">
          <Button size="sm" variant="outline" style={{ borderColor: `${CHOCO}20`, color: CHOCO }}>
            BizDev Hub
          </Button>
        </Link>
      </div>

      {/* Escalations */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: CHOCO }}>
          Escalations ({active.length})
        </p>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CheckCircle2 size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#22C55E" }} />
            <p className="text-sm opacity-40" style={{ color: CHOCO }}>No pending escalations</p>
          </div>
        ) : active.map(e => (
          <div
            key={e.ref}
            className="bg-white rounded-2xl border p-5 flex items-start gap-4"
            style={{ borderColor: e.urgency === "high" ? "#EF444430" : `${CHOCO}08` }}
          >
            <div
              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: e.urgency === "high" ? "#EF4444" : GOLD }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-normal"
                  style={{ backgroundColor: e.urgency === "high" ? "#EF444415" : `${GOLD}15`, color: e.urgency === "high" ? "#EF4444" : GOLD }}
                >
                  {e.type}
                </span>
                <span className="text-[10px] opacity-30" style={{ color: CHOCO }}>from {e.from} · {e.time}</span>
              </div>
              <p className="text-sm font-normal" style={{ color: CHOCO }}>{e.title}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs shrink-0"
              style={{ color: "#22C55E" }}
              onClick={() => { setResolvedRefs(p => [...p, e.ref]); toast.success("Marked as resolved"); }}
            >
              Resolve
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics Section ───────────────────────────────────────────────────────
function AnalyticsSection({ revenueStats, deptStats, leads }: {
  revenueStats?: { monthlyRevenue?: { month: string; revenue: number }[] } | null;
  deptStats?: { dept: string; completedTasks: number; totalTasks: number }[];
  leads?: any[];
}) {
  const fmtNaira = (v: number) => `₦${(v / 1000000).toFixed(1)}M`;

  const revenueData = revenueStats?.monthlyRevenue?.length
    ? revenueStats.monthlyRevenue
    : MOCK_REVENUE;

  const deptPerfData = deptStats && deptStats.length > 0
    ? deptStats.map((d, i) => ({
        dept: d.dept,
        completed: d.completedTasks,
        active: Math.max(0, d.totalTasks - d.completedTasks),
        color: ["#1B4D3E", "#4285F4", "#B48C4C", "#34A853"][i % 4],
      }))
    : MOCK_DEPT_PERFORMANCE;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: CHOCO }}>Company Analytics</h2>
        <p className="text-xs opacity-30" style={{ color: CHOCO }}>{revenueStats ? "Live data from database" : "Seed data — connect DB for live figures"}</p>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-sm font-normal mb-6 opacity-60" style={{ color: CHOCO }}>Monthly Revenue — Last 6 Months</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} barSize={28}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHOCO, opacity: 0.4 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtNaira} tick={{ fontSize: 11, fill: CHOCO, opacity: 0.4 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [`₦${v.toLocaleString("en-NG")}`, "Revenue"]}
              contentStyle={{ borderRadius: 10, border: `1px solid ${CHOCO}10`, fontSize: 12 }}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {revenueData.map((_: any, i: number) => (
                <Cell key={i} fill={i === revenueData.length - 1 ? GOLD : `${CHOCO}25`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lead sources + Department performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-normal mb-5 opacity-60" style={{ color: CHOCO }}>Lead Sources — This Month</p>
          <div className="space-y-4">
            {MOCK_LEAD_SOURCES.map(({ source, count }) => {
              const max = Math.max(...MOCK_LEAD_SOURCES.map(l => l.count));
              return (
                <div key={source} className="flex items-center gap-3">
                  <p className="text-sm w-20 shrink-0 font-normal opacity-60" style={{ color: CHOCO }}>{source}</p>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: GOLD }} />
                  </div>
                  <p className="text-sm font-medium w-6 text-right" style={{ color: CHOCO }}>{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-normal mb-5 opacity-60" style={{ color: CHOCO }}>Department Task Performance</p>
          <div className="space-y-4">
            {deptPerfData.map(({ dept, completed, active, color }) => {
              const total = completed + active;
              const rate  = Math.round((completed / total) * 100);
              return (
                <div key={dept} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <p className="text-sm w-20 shrink-0 font-normal opacity-70" style={{ color: CHOCO }}>{dept}</p>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-xs font-medium w-10 text-right opacity-50" style={{ color: CHOCO }}>{rate}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Commissions Section (Founder Only) ──────────────────────────────────────
function CommissionsSection({ commissions }: { commissions: any[] }) {
  const approveCommission = trpc.commissions.updateStatus.useMutation({
    onSuccess: () => toast.success("Commission approved"),
    onError: (err: any) => toast.error(err.message),
  });
  const pending = commissions.filter((c: any) => c.status === "pending");

  const statusBadge = (status: string) => {
    if (status === "pending")  return { bg: "#FEF3C7", color: "#92400E", label: "Pending" };
    if (status === "approved") return { bg: "#DCFCE7", color: "#166534", label: "Approved" };
    if (status === "paid")     return { bg: "#DBEAFE", color: "#1E40AF", label: "Paid" };
    return { bg: "#F3F4F6", color: "#374151", label: status };
  };

  const displayList = commissions.length > 0 ? commissions : [
    { id: 1, staffName: "Emeka Okafor", department: "BizDoc", amount: 45000, status: "pending", createdAt: new Date().toISOString() },
    { id: 2, staffName: "Kemi Adeyemi", department: "BizDev", amount: 120000, status: "pending", createdAt: new Date().toISOString() },
    { id: 3, staffName: "Ngozi Chukwu", department: "Skills", amount: 115000, status: "approved", createdAt: new Date().toISOString() },
    { id: 4, staffName: "Abiodun Salami", department: "Systemise", amount: 60000, status: "paid", createdAt: new Date().toISOString() },
  ];

  const pendingCount = displayList.filter((c: any) => c.status === "pending").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: CHOCO }}>Commissions</h2>
        <p className="text-xs opacity-30" style={{ color: CHOCO }}>
          {pendingCount} pending approval — Founder authority only
        </p>
      </div>

      {displayList.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <DollarSign size={36} className="mx-auto mb-3 opacity-20" style={{ color: CHOCO }} />
          <p className="text-sm opacity-40" style={{ color: CHOCO }}>No commissions on record</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-wider opacity-40 font-normal" style={{ borderColor: `${CHOCO}08`, color: CHOCO }}>
            <span>Staff Name</span>
            <span>Department</span>
            <span>Amount</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          {displayList.map((c: any, i: number) => {
            const badge = statusBadge(c.status);
            return (
              <div
                key={c.id ?? i}
                className="grid grid-cols-5 gap-4 px-5 py-4 border-b last:border-0 items-center"
                style={{ borderColor: `${CHOCO}06` }}
              >
                <p className="text-sm font-normal" style={{ color: CHOCO }}>{c.staffName || c.staff?.name || "—"}</p>
                <p className="text-sm opacity-60" style={{ color: CHOCO }}>{c.department || c.dept || "—"}</p>
                <p className="text-sm font-medium" style={{ color: CHOCO }}>₦{Number(c.amount || 0).toLocaleString("en-NG")}</p>
                <span
                  className="inline-block text-[10px] font-medium px-2 py-1 rounded-full w-fit"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
                <div className="flex justify-end">
                  {c.status === "pending" ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="text-xs"
                          style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
                        >
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Commission</AlertDialogTitle>
                          <AlertDialogDescription>
                            Approve ₦{Number(c.amount || 0).toLocaleString("en-NG")} commission for {c.staffName || c.staff?.name}?
                            This action confirms Founder-level authorisation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => approveCommission.mutate({ id: c.id, status: "approved" })}
                          >
                            Yes, Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-xs opacity-30" style={{ color: CHOCO }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingCount === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <CheckCircle2 size={28} className="mx-auto mb-2 opacity-20" style={{ color: "#22C55E" }} />
          <p className="text-sm opacity-40" style={{ color: CHOCO }}>All commissions have been processed</p>
        </div>
      )}
    </div>
  );
}

// ─── Staff Directory Section ──────────────────────────────────────────────────
function StaffSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: CHOCO }}>Staff Directory</h2>
        <p className="text-xs opacity-30" style={{ color: CHOCO }}>All HAMZURY team members</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAFF.map(member => (
          <div
            key={member.name}
            className="bg-white rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: member.color }}
              >
                {member.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: CHOCO }}>{member.name}</p>
                <p className="text-xs opacity-50 truncate" style={{ color: CHOCO }}>{member.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }} />
              <span
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-normal"
                style={{ backgroundColor: `${member.color}15`, color: member.color }}
              >
                {member.dept}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar Section ────────────────────────────────────────────────────────
function CalendarSection() {
  const days  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = ["23", "24", "25", "26", "27", "28", "29"];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: CHOCO }}>Company Calendar</h2>
        <p className="text-xs opacity-30" style={{ color: CHOCO }}>
          Only the Founder creates company-wide events — these appear in all department calendars.
        </p>
      </div>

      {/* Week strip */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between mb-4 gap-1">
          {days.map((d, i) => {
            const hasEvent = MOCK_EVENTS.some(e => e.day === d);
            return (
              <div
                key={d}
                className="flex-1 flex flex-col items-center py-2 rounded-xl"
                style={{ backgroundColor: hasEvent ? `${GOLD}12` : "transparent" }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: CHOCO, opacity: 0.4 }}>{d}</p>
                <p className="text-base font-normal" style={{ color: hasEvent ? GOLD : CHOCO, opacity: hasEvent ? 1 : 0.5 }}>{dates[i]}</p>
                {hasEvent && <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: GOLD }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: CHOCO }}>This Week's Events</p>
        {MOCK_EVENTS.map((e, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}15` }}>
              <CalendarDays size={16} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal" style={{ color: CHOCO }}>{e.title}</p>
              <p className="text-xs opacity-40 mt-0.5" style={{ color: CHOCO }}>{e.day} {e.date} Mar · {e.time}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        style={{ backgroundColor: CHOCO, color: GOLD }}
        onClick={() => toast("Calendar event creation coming soon")}
      >
        + Add Event
      </Button>
    </div>
  );
}

// ─── Assign Tasks Section ────────────────────────────────────────────────────
function AssignSection() {
  const [title,    setTitle]    = useState("");
  const [dept,     setDept]     = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate,  setDueDate]  = useState("");
  const [desc,     setDesc]     = useState("");

  const DEPT_LEADS: Record<string, { name: string; dept: string }[]> = {
    bizdoc:    [{ name: "Emeka Okafor",   dept: "bizdoc" }],
    systemise: [{ name: "Abiodun Salami", dept: "systemise" }],
    skills:    [{ name: "Ngozi Chukwu",  dept: "skills" }],
    bizdev:    [{ name: "Kemi Adeyemi",  dept: "bizdev" }],
    cso:       [{ name: "Aisha Okonkwo", dept: "cso" }],
    finance:   [{ name: "Fatima Ibrahim",dept: "finance" }],
  };

  const RECENT_ASSIGNED = SHARED_TASKS.map(t => ({
    title:    t.title,
    assignee: t.assignedTo,
    dept:     t.assignedDept.charAt(0).toUpperCase() + t.assignedDept.slice(1),
    priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
    due:      t.dueDate,
    id:       t.id,
  }));

  const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
  const DEPTS = [
    { value: "bizdoc",    label: "BizDoc" },
    { value: "systemise", label: "Systemise" },
    { value: "skills",    label: "Skills" },
    { value: "bizdev",    label: "BizDev" },
    { value: "cso",       label: "CSO" },
    { value: "finance",   label: "Finance" },
  ];

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: (task) => {
      toast.success(`Task ${task.ref} assigned to ${assignee}`);
      setTitle(""); setDept(""); setAssignee(""); setPriority(""); setDueDate(""); setDesc("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!title || !dept || !assignee || !priority) { toast.error("Please fill all required fields"); return; }
    createTask.mutate({
      clientName: assignee,
      service: title,
      department: dept,
      priority,
      deadline: dueDate || undefined,
      expectedDelivery: dueDate || undefined,
      notes: desc || undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
      {/* Form */}
      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal mb-2" style={{ color: CHOCO }}>Assign Task</h2>
        <Input
          placeholder="Task title *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border-gray-200 bg-gray-50"
        />
        <Select value={dept} onValueChange={v => { setDept(v); setAssignee(""); }}>
          <SelectTrigger className="border-gray-200 bg-gray-50">
            <SelectValue placeholder="Select department *" />
          </SelectTrigger>
          <SelectContent>
            {DEPTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assignee} onValueChange={setAssignee} disabled={!dept}>
          <SelectTrigger className="border-gray-200 bg-gray-50">
            <SelectValue placeholder="Assign to *" />
          </SelectTrigger>
          <SelectContent>
            {(DEPT_LEADS[dept] || []).map(l => (
              <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="border-gray-200 bg-gray-50">
            <SelectValue placeholder="Priority *" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="border-gray-200 bg-gray-50"
        />
        <Textarea
          placeholder="Task description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="border-gray-200 bg-gray-50 min-h-[90px]"
        />
        <Button className="w-full" style={{ backgroundColor: CHOCO, color: GOLD }} onClick={handleSubmit}>
          Assign Task
        </Button>
      </div>

      {/* Recently assigned */}
      <div>
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal mb-4" style={{ color: CHOCO }}>Recently Assigned</p>
        <div className="space-y-3">
          {RECENT_ASSIGNED.map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono opacity-30 mr-1" style={{ color: CHOCO }}>{t.id}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>{t.dept}</span>
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: t.priority === "High" || t.priority === "Urgent" ? "#EF444415" : "#6B728015",
                    color: t.priority === "High" || t.priority === "Urgent" ? "#EF4444" : "#6B7280",
                  }}
                >
                  {t.priority}
                </span>
              </div>
              <p className="text-sm font-normal" style={{ color: CHOCO }}>{t.title}</p>
              <p className="text-xs opacity-40 mt-1" style={{ color: CHOCO }}>{t.assignee} · Due {t.due}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Vault Section ───────────────────────────────────────────────────────────
const VAULT_KEY_V2 = "hamzury-founder-vault-v2";

// types
type PasswordCategory = "bank" | "social" | "domain" | "tools" | "client";
type PasswordEntry = { id: string; category: PasswordCategory; label: string; fields: Record<string, string> };
type DocStatus = "have" | "missing" | "expired";
type DocCategory = "registration" | "tax" | "legal" | "finance" | "staff";
type VaultDocumentV2 = { id: string; category: DocCategory; label: string; status: DocStatus; expiryDate: string; notes: string };
type AccessRow = { id: string; staffName: string; dashboard: boolean; bank: boolean; social: boolean; clientData: boolean };
type EmergencyContact = { id: string; role: string; name: string; phone: string; email: string };
type VaultGoal = { id: string; text: string; done: boolean };

const CATEGORY_LABELS: Record<PasswordCategory, string> = {
  bank: "Bank Accounts", social: "Social Media", domain: "Domain & Hosting", tools: "Tools & Services", client: "Client Portals",
};

const CATEGORY_FIELDS: Record<PasswordCategory, { key: string; label: string; secret?: boolean }[]> = {
  bank: [
    { key: "bankName", label: "Bank Name" }, { key: "accountName", label: "Account Name" },
    { key: "accountNumber", label: "Account Number" }, { key: "loginUrl", label: "Login URL" },
    { key: "username", label: "Username" }, { key: "password", label: "Password", secret: true },
  ],
  social: [
    { key: "platform", label: "Platform" }, { key: "department", label: "Department" },
    { key: "handle", label: "Handle" }, { key: "email", label: "Email" },
    { key: "password", label: "Password", secret: true },
  ],
  domain: [
    { key: "provider", label: "Provider" }, { key: "domain", label: "Domain" },
    { key: "loginUrl", label: "Login URL" }, { key: "username", label: "Username" },
    { key: "password", label: "Password", secret: true },
  ],
  tools: [
    { key: "service", label: "Service Name" }, { key: "loginUrl", label: "Login URL" },
    { key: "username", label: "Username" }, { key: "password", label: "Password", secret: true },
  ],
  client: [
    { key: "clientName", label: "Client Name" }, { key: "portal", label: "Portal URL" },
    { key: "username", label: "Username" }, { key: "password", label: "Password", secret: true },
  ],
};

const DEFAULT_PASSWORDS: PasswordEntry[] = [
  { id: "p1", category: "bank", label: "HAMZURY Business Account", fields: { bankName: "First Bank", accountName: "HAMZURY Innovation Hub", accountNumber: "3087XXXXXX", loginUrl: "https://firstbanknigeria.com", username: "hamzury_biz", password: "change_me_2026" } },
  { id: "p2", category: "social", label: "Instagram — BizDoc", fields: { platform: "Instagram", department: "BizDoc", handle: "@bizdoc", email: "social@hamzury.com", password: "change_me_2026" } },
  { id: "p3", category: "social", label: "Instagram — Systemise", fields: { platform: "Instagram", department: "Systemise", handle: "@systemise", email: "social@hamzury.com", password: "change_me_2026" } },
  { id: "p4", category: "social", label: "Instagram — Skills", fields: { platform: "Instagram", department: "Skills", handle: "@hamzuryskills", email: "social@hamzury.com", password: "change_me_2026" } },
  { id: "p5", category: "domain", label: "hamzury.com", fields: { provider: "Namecheap", domain: "hamzury.com", loginUrl: "https://namecheap.com", username: "hamzury", password: "change_me_2026" } },
  { id: "p6", category: "tools", label: "Google Workspace", fields: { service: "Google Workspace", loginUrl: "https://admin.google.com", username: "admin@hamzury.com", password: "change_me_2026" } },
  { id: "p7", category: "tools", label: "CAC Portal", fields: { service: "CAC Portal", loginUrl: "https://pre.cac.gov.ng", username: "hamzury@admin", password: "change_me_2026" } },
];

const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  registration: "Company Registration", tax: "Tax", legal: "Legal", finance: "Finance", staff: "Staff",
};

const DEFAULT_DOCUMENTS: VaultDocumentV2[] = [
  { id: "d1", category: "registration", label: "CAC Certificate", status: "have", expiryDate: "", notes: "" },
  { id: "d2", category: "registration", label: "Memorandum of Association", status: "have", expiryDate: "", notes: "" },
  { id: "d3", category: "registration", label: "Articles of Association", status: "missing", expiryDate: "", notes: "" },
  { id: "d4", category: "registration", label: "BPP Certificate", status: "missing", expiryDate: "", notes: "" },
  { id: "d5", category: "tax", label: "TIN Certificate", status: "have", expiryDate: "", notes: "" },
  { id: "d6", category: "tax", label: "VAT Registration", status: "missing", expiryDate: "", notes: "" },
  { id: "d7", category: "tax", label: "Tax Clearance Certificate", status: "missing", expiryDate: "2026-12-31", notes: "Renew annually" },
  { id: "d8", category: "legal", label: "Office Lease Agreement", status: "have", expiryDate: "2027-03-01", notes: "" },
  { id: "d9", category: "legal", label: "Business Insurance", status: "missing", expiryDate: "", notes: "" },
  { id: "d10", category: "legal", label: "NDA Template", status: "have", expiryDate: "", notes: "" },
  { id: "d11", category: "finance", label: "Company Bank Statement", status: "have", expiryDate: "", notes: "Request monthly" },
  { id: "d12", category: "finance", label: "Audit Report", status: "missing", expiryDate: "", notes: "Due end of fiscal year" },
  { id: "d13", category: "staff", label: "Employment Contracts", status: "have", expiryDate: "", notes: "" },
  { id: "d14", category: "staff", label: "Volunteer Agreements", status: "missing", expiryDate: "", notes: "" },
];

const DEFAULT_ACCESS: AccessRow[] = [
  { id: "ac1", staffName: "Idris Ibrahim (CEO)", dashboard: true, bank: false, social: false, clientData: true },
  { id: "ac2", staffName: "Abdullahi Musa (BizDoc)", dashboard: true, bank: false, social: false, clientData: true },
  { id: "ac3", staffName: "Tabitha (CSO)", dashboard: true, bank: false, social: false, clientData: true },
  { id: "ac4", staffName: "Abubakar (Finance)", dashboard: true, bank: true, social: false, clientData: false },
  { id: "ac5", staffName: "Khadija (BizDev/HR)", dashboard: true, bank: false, social: true, clientData: false },
  { id: "ac6", staffName: "Hikma (Media)", dashboard: true, bank: false, social: true, clientData: false },
  { id: "ac7", staffName: "Abdulmalik (Skills)", dashboard: true, bank: false, social: false, clientData: false },
  { id: "ac8", staffName: "Rabilu (Security)", dashboard: false, bank: false, social: false, clientData: false },
];

const DEFAULT_EMERGENCY: EmergencyContact[] = [
  { id: "em1", role: "Lawyer", name: "", phone: "", email: "" },
  { id: "em2", role: "Accountant", name: "", phone: "", email: "" },
  { id: "em3", role: "Bank Manager", name: "", phone: "", email: "" },
  { id: "em4", role: "Landlord", name: "", phone: "", email: "" },
  { id: "em5", role: "ICE (Personal Emergency)", name: "", phone: "", email: "" },
];

const DEFAULT_GOALS_V2: VaultGoal[] = [
  { id: "g1", text: "Review weekly metrics from all departments", done: false },
  { id: "g2", text: "Complete one deep-work session on brand strategy", done: false },
  { id: "g3", text: "Check in with CEO on operational blockers", done: false },
];

const SCHEDULE_DAYS = [
  { day: "Mon", blocks: [{ time: "8–10:30", label: "Learning Hall" }, { time: "11–1:30", label: "Content Creation" }, { time: "2–4", label: "Strategy Work" }] },
  { day: "Tue", blocks: [{ time: "8–10:30", label: "Learning Hall" }, { time: "11–1:30", label: "Content Creation" }, { time: "2–4", label: "Strategy Work" }] },
  { day: "Wed", blocks: [{ time: "8–10:30", label: "Learning Hall" }, { time: "11–1:30", label: "Content Creation" }, { time: "2–4", label: "Strategy Work" }] },
  { day: "Thu", blocks: [{ time: "8–10:30", label: "Learning Hall" }, { time: "11–1:30", label: "Content Creation" }, { time: "2–4", label: "Strategy Work" }] },
  { day: "Fri", blocks: [{ time: "8–10:30", label: "Learning Hall" }, { time: "11–1:30", label: "Content Creation" }, { time: "2–4", label: "Strategy Work" }] },
];

type VaultData = { passwords: PasswordEntry[]; documents: VaultDocumentV2[]; access: AccessRow[]; emergency: EmergencyContact[]; goals: VaultGoal[] };

function loadVault(): VaultData {
  try {
    const raw = localStorage.getItem(VAULT_KEY_V2);
    if (!raw) return { passwords: DEFAULT_PASSWORDS, documents: DEFAULT_DOCUMENTS, access: DEFAULT_ACCESS, emergency: DEFAULT_EMERGENCY, goals: DEFAULT_GOALS_V2 };
    const p = JSON.parse(raw);
    return {
      passwords: p.passwords ?? DEFAULT_PASSWORDS,
      documents: p.documents ?? DEFAULT_DOCUMENTS,
      access: p.access ?? DEFAULT_ACCESS,
      emergency: p.emergency ?? DEFAULT_EMERGENCY,
      goals: p.goals ?? DEFAULT_GOALS_V2,
    };
  } catch {
    return { passwords: DEFAULT_PASSWORDS, documents: DEFAULT_DOCUMENTS, access: DEFAULT_ACCESS, emergency: DEFAULT_EMERGENCY, goals: DEFAULT_GOALS_V2 };
  }
}

function saveVault(data: VaultData) {
  localStorage.setItem(VAULT_KEY_V2, JSON.stringify(data));
}

function VaultSection() {
  type VaultTab = "passwords" | "documents" | "access" | "emergency" | "growth";
  const [vaultTab, setVaultTab] = useState<VaultTab>("passwords");

  const initial = loadVault();
  const [passwords, setPasswords] = useState<PasswordEntry[]>(initial.passwords);
  const [documents, setDocuments] = useState<VaultDocumentV2[]>(initial.documents);
  const [accessRows, setAccessRows] = useState<AccessRow[]>(initial.access);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(initial.emergency);
  const [goals, setGoals] = useState<VaultGoal[]>(initial.goals);

  const persist = (p: PasswordEntry[], d: VaultDocumentV2[], a: AccessRow[], e: EmergencyContact[], g: VaultGoal[]) => {
    setPasswords(p); setDocuments(d); setAccessRows(a); setEmergencyContacts(e); setGoals(g);
    saveVault({ passwords: p, documents: d, access: a, emergency: e, goals: g });
  };

  const VAULT_TABS: { key: VaultTab; label: string }[] = [
    { key: "passwords",  label: "Passwords" },
    { key: "documents",  label: "Documents" },
    { key: "access",     label: "Access Control" },
    { key: "emergency",  label: "Emergency" },
    { key: "growth",     label: "Growth" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}18` }}>
          <Lock size={16} style={{ color: GOLD }} />
        </div>
        <div>
          <h2 className="text-base font-medium" style={{ color: CHOCO }}>Personal Vault</h2>
          <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>Data stored locally on this device only &mdash; 5 sections</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit flex-wrap" style={{ backgroundColor: `${CHOCO}08` }}>
        {VAULT_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setVaultTab(t.key)}
            className="px-4 py-1.5 rounded-lg text-sm font-normal transition-all"
            style={{
              backgroundColor: vaultTab === t.key ? CHOCO : "transparent",
              color: vaultTab === t.key ? GOLD : `${CHOCO}60`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vaultTab === "passwords" && (
        <PasswordsTab passwords={passwords} onChange={p => persist(p, documents, accessRows, emergencyContacts, goals)} />
      )}
      {vaultTab === "documents" && (
        <DocumentsTab documents={documents} onChange={d => persist(passwords, d, accessRows, emergencyContacts, goals)} />
      )}
      {vaultTab === "access" && (
        <AccessTab access={accessRows} onChange={a => persist(passwords, documents, a, emergencyContacts, goals)} />
      )}
      {vaultTab === "emergency" && (
        <EmergencyTab contacts={emergencyContacts} onChange={e => persist(passwords, documents, accessRows, e, goals)} />
      )}
      {vaultTab === "growth" && (
        <GrowthTab goals={goals} onChange={g => persist(passwords, documents, accessRows, emergencyContacts, g)} />
      )}
    </div>
  );
}

// ─── Passwords & Logins Tab ──────────────────────────────────────────────────
function PasswordsTab({ passwords, onChange }: { passwords: PasswordEntry[]; onChange: (p: PasswordEntry[]) => void }) {
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [expandedCats, setExpandedCats] = useState<PasswordCategory[]>(["bank"]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [addingCat, setAddingCat] = useState<PasswordCategory | null>(null);
  const [newFields, setNewFields] = useState<Record<string, string>>({});
  const [newLabel, setNewLabel] = useState("");

  const toggleCat = (cat: PasswordCategory) =>
    setExpandedCats(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`)).catch(() => toast.error("Copy failed"));
  };

  const startEdit = (entry: PasswordEntry) => {
    setEditingId(entry.id);
    setEditFields({ ...entry.fields, __label: entry.label });
  };

  const saveEdit = (id: string) => {
    const { __label, ...fields } = editFields;
    onChange(passwords.map(p => p.id === id ? { ...p, label: __label || p.label, fields } : p));
    setEditingId(null);
    toast.success("Entry updated");
  };

  const deleteEntry = (id: string) => {
    onChange(passwords.filter(p => p.id !== id));
    toast("Entry removed");
  };

  const startAdd = (cat: PasswordCategory) => {
    setAddingCat(cat);
    setNewLabel("");
    const init: Record<string, string> = {};
    CATEGORY_FIELDS[cat].forEach(f => { init[f.key] = ""; });
    setNewFields(init);
  };

  const saveNew = () => {
    if (!addingCat || !newLabel.trim()) { toast.error("Label is required"); return; }
    onChange([...passwords, { id: `p${Date.now()}`, category: addingCat, label: newLabel.trim(), fields: { ...newFields } }]);
    setAddingCat(null);
    toast.success("Entry added to vault");
  };

  const categories: PasswordCategory[] = ["bank", "social", "domain", "tools", "client"];

  return (
    <div className="space-y-4">
      {categories.map(cat => {
        const entries = passwords.filter(p => p.category === cat);
        const expanded = expandedCats.includes(cat);
        return (
          <div key={cat} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <button onClick={() => toggleCat(cat)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
              {expanded ? <ChevronDown size={14} style={{ color: CHOCO, opacity: 0.4 }} /> : <ChevronRight size={14} style={{ color: CHOCO, opacity: 0.4 }} />}
              <p className="text-sm font-medium flex-1" style={{ color: CHOCO }}>{CATEGORY_LABELS[cat]}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>{entries.length}</span>
            </button>

            {expanded && (
              <div className="border-t px-4 pb-4 space-y-3" style={{ borderColor: `${CHOCO}06` }}>
                {entries.map(entry => {
                  const isEditing = editingId === entry.id;
                  const revealed = revealedIds.includes(entry.id);
                  const fieldDefs = CATEGORY_FIELDS[cat];

                  if (isEditing) {
                    return (
                      <div key={entry.id} className="rounded-xl border p-4 space-y-2 mt-3" style={{ borderColor: `${GOLD}30` }}>
                        <Input placeholder="Label *" value={editFields.__label || ""} onChange={e => setEditFields(p => ({ ...p, __label: e.target.value }))} className="border-gray-200 bg-gray-50 text-sm" />
                        {fieldDefs.map(f => (
                          <Input key={f.key} placeholder={f.label} value={editFields[f.key] || ""} onChange={e => setEditFields(p => ({ ...p, [f.key]: e.target.value }))} className="border-gray-200 bg-gray-50 text-sm" />
                        ))}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => saveEdit(entry.id)} style={{ backgroundColor: CHOCO, color: GOLD }}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={entry.id} className="rounded-xl border p-4 mt-3 space-y-2" style={{ borderColor: `${CHOCO}06` }}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: CHOCO }}>{entry.label}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEdit(entry)} className="p-1.5 rounded-lg opacity-30 hover:opacity-70 transition-opacity">
                            <Pencil size={13} style={{ color: CHOCO }} />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1.5 rounded-lg opacity-20 hover:opacity-60 transition-opacity">
                                <Trash2 size={13} style={{ color: "#EF4444" }} />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                                <AlertDialogDescription>Remove &ldquo;{entry.label}&rdquo; from the vault? This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteEntry(entry.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        {fieldDefs.map(f => {
                          const val = entry.fields[f.key] || "";
                          if (!val) return null;
                          const isSecret = f.secret;
                          return (
                            <div key={f.key} className="flex items-center gap-2 py-1">
                              <span className="text-[10px] uppercase tracking-wider opacity-40 w-20 shrink-0" style={{ color: CHOCO }}>{f.label}</span>
                              <span className="text-sm font-mono opacity-60 truncate flex-1" style={{ color: CHOCO }}>
                                {isSecret && !revealed ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : val}
                              </span>
                              {isSecret && (
                                <button onClick={() => setRevealedIds(p => revealed ? p.filter(x => x !== entry.id) : [...p, entry.id])} className="shrink-0 opacity-30 hover:opacity-70 transition-opacity">
                                  {revealed ? <EyeOff size={13} style={{ color: CHOCO }} /> : <Eye size={13} style={{ color: CHOCO }} />}
                                </button>
                              )}
                              <button onClick={() => copyToClipboard(val, f.label)} className="shrink-0 opacity-20 hover:opacity-60 transition-opacity">
                                <Copy size={13} style={{ color: CHOCO }} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {addingCat === cat ? (
                  <div className="rounded-xl border p-4 space-y-2 mt-3" style={{ borderColor: `${GOLD}30` }}>
                    <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: CHOCO }}>New {CATEGORY_LABELS[cat]} Entry</p>
                    <Input placeholder="Label (e.g. account name) *" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="border-gray-200 bg-gray-50 text-sm" />
                    {CATEGORY_FIELDS[cat].map(f => (
                      <Input key={f.key} placeholder={f.label} type={f.secret ? "password" : "text"} value={newFields[f.key] || ""} onChange={e => setNewFields(p => ({ ...p, [f.key]: e.target.value }))} className="border-gray-200 bg-gray-50 text-sm" />
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={saveNew} style={{ backgroundColor: CHOCO, color: GOLD }}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setAddingCat(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startAdd(cat)} className="w-full flex items-center justify-center gap-2 py-2.5 mt-3 rounded-xl border-2 border-dashed text-xs transition-all hover:opacity-70" style={{ borderColor: `${CHOCO}12`, color: `${CHOCO}40` }}>
                    <Plus size={13} /> Add {CATEGORY_LABELS[cat]} Entry
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Critical Documents Tab ──────────────────────────────────────────────────
function DocumentsTab({ documents, onChange }: { documents: VaultDocumentV2[]; onChange: (d: VaultDocumentV2[]) => void }) {
  const [expandedCats, setExpandedCats] = useState<DocCategory[]>(["registration"]);

  const toggleCat = (cat: DocCategory) =>
    setExpandedCats(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]);

  const updateDoc = (id: string, patch: Partial<VaultDocumentV2>) => {
    onChange(documents.map(d => d.id === id ? { ...d, ...patch } : d));
  };

  const statusBadge = (status: DocStatus) => {
    if (status === "have")    return { bg: "#DCFCE7", color: "#166534", label: "Have it" };
    if (status === "expired") return { bg: "#FEE2E2", color: "#991B1B", label: "Expired" };
    return { bg: "#FEF3C7", color: "#92400E", label: "Missing" };
  };

  const categories: DocCategory[] = ["registration", "tax", "legal", "finance", "staff"];
  const totalHave = documents.filter(d => d.status === "have").length;
  const totalMissing = documents.filter(d => d.status === "missing").length;
  const totalExpired = documents.filter(d => d.status === "expired").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#22C55E" }} />
          <span className="text-xs" style={{ color: CHOCO, opacity: 0.6 }}>{totalHave} have</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EAB308" }} />
          <span className="text-xs" style={{ color: CHOCO, opacity: 0.6 }}>{totalMissing} missing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#EF4444" }} />
          <span className="text-xs" style={{ color: CHOCO, opacity: 0.6 }}>{totalExpired} expired</span>
        </div>
      </div>

      {categories.map(cat => {
        const items = documents.filter(d => d.category === cat);
        const expanded = expandedCats.includes(cat);
        return (
          <div key={cat} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <button onClick={() => toggleCat(cat)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
              {expanded ? <ChevronDown size={14} style={{ color: CHOCO, opacity: 0.4 }} /> : <ChevronRight size={14} style={{ color: CHOCO, opacity: 0.4 }} />}
              <p className="text-sm font-medium flex-1" style={{ color: CHOCO }}>{DOC_CATEGORY_LABELS[cat]}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>
                {items.filter(i => i.status === "have").length}/{items.length}
              </span>
            </button>

            {expanded && (
              <div className="border-t px-4 pb-4 space-y-2" style={{ borderColor: `${CHOCO}06` }}>
                {items.map(doc => {
                  const badge = statusBadge(doc.status);
                  return (
                    <div key={doc.id} className="rounded-xl border p-3 mt-2 space-y-2" style={{ borderColor: `${CHOCO}06` }}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const next: DocStatus = doc.status === "have" ? "missing" : doc.status === "missing" ? "expired" : "have";
                            updateDoc(doc.id, { status: next });
                          }}
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: doc.status === "have" ? "#22C55E" : doc.status === "expired" ? "#EF4444" : `${CHOCO}25`,
                            backgroundColor: doc.status === "have" ? "#22C55E" : doc.status === "expired" ? "#EF4444" : "transparent",
                          }}
                        >
                          {doc.status === "have" && <CheckCircle2 size={10} color="white" />}
                          {doc.status === "expired" && <AlertTriangle size={10} color="white" />}
                        </button>
                        <p className="flex-1 text-sm font-normal" style={{ color: CHOCO }}>{doc.label}</p>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input type="date" value={doc.expiryDate} onChange={e => updateDoc(doc.id, { expiryDate: e.target.value })} className="border-gray-100 bg-gray-50 text-xs h-8 w-40" />
                        <Input placeholder="Notes" value={doc.notes} onChange={e => updateDoc(doc.id, { notes: e.target.value })} className="border-gray-100 bg-gray-50 text-xs h-8 flex-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Access Control Tab ──────────────────────────────────────────────────────
function AccessTab({ access, onChange }: { access: AccessRow[]; onChange: (a: AccessRow[]) => void }) {
  const toggleField = (id: string, field: "dashboard" | "bank" | "social" | "clientData") => {
    onChange(access.map(a => a.id === id ? { ...a, [field]: !a[field] } : a));
  };

  const ToggleSwitch = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-9 h-5 rounded-full flex items-center transition-all px-0.5" style={{ backgroundColor: on ? "#22C55E" : `${CHOCO}15` }}>
      <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ transform: on ? "translateX(16px)" : "translateX(0)" }} />
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ backgroundColor: `${GOLD}08`, border: `1px solid ${GOLD}20` }}>
        <p className="text-xs leading-relaxed" style={{ color: CHOCO, opacity: 0.6 }}>
          This is a visual reference for the Founder only. It tracks who should have access to what. Toggles are not enforced by the system.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-5 py-3 border-b text-[10px] uppercase tracking-wider opacity-40 font-normal" style={{ borderColor: `${CHOCO}08`, color: CHOCO }}>
          <span>Staff Name</span>
          <span className="text-center">Dashboard</span>
          <span className="text-center">Bank Access</span>
          <span className="text-center">Social Media</span>
          <span className="text-center">Client Data</span>
        </div>

        {access.map(row => (
          <div key={row.id} className="grid grid-cols-5 gap-2 px-5 py-3 border-b last:border-0 items-center" style={{ borderColor: `${CHOCO}06` }}>
            <p className="text-sm font-normal truncate" style={{ color: CHOCO }}>{row.staffName}</p>
            <div className="flex justify-center"><ToggleSwitch on={row.dashboard} onToggle={() => toggleField(row.id, "dashboard")} /></div>
            <div className="flex justify-center"><ToggleSwitch on={row.bank} onToggle={() => toggleField(row.id, "bank")} /></div>
            <div className="flex justify-center"><ToggleSwitch on={row.social} onToggle={() => toggleField(row.id, "social")} /></div>
            <div className="flex justify-center"><ToggleSwitch on={row.clientData} onToggle={() => toggleField(row.id, "clientData")} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Emergency Contacts Tab ──────────────────────────────────────────────────
function EmergencyTab({ contacts, onChange }: { contacts: EmergencyContact[]; onChange: (c: EmergencyContact[]) => void }) {
  const updateContact = (id: string, patch: Partial<EmergencyContact>) => {
    onChange(contacts.map(c => c.id === id ? { ...c, ...patch } : c));
  };

  const roleIcon = (role: string) => {
    if (role.includes("Lawyer"))     return Shield;
    if (role.includes("Accountant")) return Calculator;
    if (role.includes("Bank"))       return Building2;
    if (role.includes("Landlord"))   return Building2;
    return Phone;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
        <p className="text-xs leading-relaxed" style={{ color: "#991B1B" }}>
          Keep these contacts up to date. In an emergency, you need immediate access to your lawyer, accountant, bank manager, and personal contacts.
        </p>
      </div>

      {contacts.map(c => {
        const Icon = roleIcon(c.role);
        return (
          <div key={c.id} className="bg-white rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}15` }}>
                <Icon size={14} style={{ color: GOLD }} />
              </div>
              <p className="text-sm font-medium" style={{ color: CHOCO }}>{c.role}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input placeholder="Full name" value={c.name} onChange={e => updateContact(c.id, { name: e.target.value })} className="border-gray-100 bg-gray-50 text-sm" />
              <Input placeholder="Phone number" value={c.phone} onChange={e => updateContact(c.id, { phone: e.target.value })} className="border-gray-100 bg-gray-50 text-sm" />
              <Input placeholder="Email" value={c.email} onChange={e => updateContact(c.id, { email: e.target.value })} className="border-gray-100 bg-gray-50 text-sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Growth Tab ──────────────────────────────────────────────────────────────
function GrowthTab({ goals, onChange }: { goals: VaultGoal[]; onChange: (g: VaultGoal[]) => void }) {
  const [newGoal, setNewGoal] = useState("");

  const toggleGoal = (id: string) => onChange(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  const addGoal = () => {
    if (!newGoal.trim()) return;
    onChange([...goals, { id: `g${Date.now()}`, text: newGoal.trim(), done: false }]);
    setNewGoal("");
  };
  const deleteGoal = (id: string) => onChange(goals.filter(g => g.id !== id));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
        <p className="text-sm italic leading-relaxed mb-3" style={{ color: CHOCO }}>
          &ldquo;The system is the business. Build it so it runs without you.&rdquo;
        </p>
        <p className="text-xs font-medium opacity-50" style={{ color: CHOCO }}>-- Muhammad Hamzury</p>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal mb-3" style={{ color: CHOCO }}>Weekly Goals</p>
        <div className="space-y-2">
          {goals.map(g => (
            <div key={g.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <button onClick={() => toggleGoal(g.id)} className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all" style={{ borderColor: g.done ? GOLD : `${CHOCO}25`, backgroundColor: g.done ? GOLD : "transparent" }}>
                {g.done && <CheckCircle2 size={10} color="white" />}
              </button>
              <p className="flex-1 text-sm" style={{ color: CHOCO, opacity: g.done ? 0.35 : 0.8, textDecoration: g.done ? "line-through" : "none" }}>{g.text}</p>
              <button onClick={() => deleteGoal(g.id)} className="opacity-20 hover:opacity-50 transition-opacity shrink-0">
                <Trash2 size={13} style={{ color: "#EF4444" }} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input placeholder="Add a goal for this week..." value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoal()} className="border-gray-200 bg-gray-50 text-sm" />
          <Button size="sm" onClick={addGoal} style={{ backgroundColor: CHOCO, color: GOLD }}>
            <Plus size={14} />
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal mb-3" style={{ color: CHOCO }}>5-Day Schedule</p>
        <div className="grid grid-cols-5 gap-2">
          {SCHEDULE_DAYS.map(({ day, blocks }) => (
            <div key={day} className="bg-white rounded-2xl p-3 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-medium text-center uppercase tracking-wider" style={{ color: GOLD }}>{day}</p>
              {blocks.map(b => (
                <div key={b.label} className="rounded-xl p-2 text-center" style={{ backgroundColor: `${CHOCO}06` }}>
                  <p className="text-[10px] font-medium leading-snug" style={{ color: CHOCO }}>{b.label}</p>
                  <p className="text-[9px] opacity-40 mt-0.5" style={{ color: CHOCO }}>{b.time}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Files & Resources Section ───────────────────────────────────────────────
function FilesSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal" style={{ color: CHOCO }}>Files & Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FILES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${GOLD}15` }}>
              <Icon size={16} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal mb-1" style={{ color: CHOCO }}>{title}</p>
              <p className="text-xs opacity-40 leading-relaxed" style={{ color: CHOCO }}>{desc}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ borderColor: `${CHOCO}15`, color: CHOCO }}
              onClick={() => toast("Document access coming soon")}
            >
              Open
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Operations Section ──────────────────────────────────────────────────
const AI_AGENTS_DEF = [
  { id: "evelyn", name: "Evelyn", emoji: "\uD83D\uDC69\u200D\uD83D\uDCBC", dept: "CSO / Client Relations" },
  { id: "amara",  name: "Amara",  emoji: "\uD83D\uDCCB", dept: "BizDoc / Compliance" },
  { id: "nova",   name: "Nova",   emoji: "\uD83D\uDDA5\uFE0F", dept: "Systemise / Tech Ops" },
  { id: "zara",   name: "Zara",   emoji: "\uD83C\uDF93", dept: "Skills / Education" },
  { id: "kash",   name: "Kash",   emoji: "\uD83D\uDCB0", dept: "Finance / Revenue" },
  { id: "muse",   name: "Muse",   emoji: "\uD83D\uDCF1", dept: "Media / Content" },
];

type AgentStatus = "online" | "paused" | "error";

interface AgentData {
  id: string;
  name: string;
  emoji: string;
  dept: string;
  status: AgentStatus;
  tasksToday: number;
  successRate: number;
  lastAction: string;
  lastActionTime: string;
  enabled: boolean;
}

function AIOperationsSection() {
  const DARK = "#1A1A1A";

  const agentStatusQuery = trpc.agents.status.useQuery(undefined, {
    refetchInterval: 30000,
    retry: false,
  });
  const agentLogsQuery = trpc.agents.logs.useQuery(undefined, {
    refetchInterval: 30000,
    retry: false,
  });

  const toggleMutation = trpc.agents.toggle.useMutation({
    onSuccess: () => { agentStatusQuery.refetch(); },
    onError: () => toast.error("Failed to toggle agent"),
  });
  const runMutation = trpc.agents.run.useMutation({
    onSuccess: () => {
      toast.success("Agent run triggered");
      agentStatusQuery.refetch();
    },
    onError: () => toast.error("Failed to run agent"),
  });

  // Build agent data — merge API response with static definitions
  const rawAgents: any[] = agentStatusQuery.data || [];
  const agents: AgentData[] = AI_AGENTS_DEF.map(def => {
    const remote = rawAgents.find((a: any) => a.id === def.id);
    return {
      ...def,
      status: (remote?.status as AgentStatus) || "paused",
      tasksToday: remote?.tasksToday ?? 0,
      successRate: remote?.successRate ?? 0,
      lastAction: remote?.lastAction || "Awaiting first run",
      lastActionTime: remote?.lastActionTime || "",
      enabled: remote?.enabled ?? false,
    };
  });

  const rawLogs: any[] = agentLogsQuery.data || [];

  const statusDot = (s: AgentStatus) =>
    s === "online" ? "#22C55E" : s === "paused" ? "#EAB308" : "#EF4444";

  const statusLabel = (s: AgentStatus) =>
    s === "online" ? "Online" : s === "paused" ? "Paused" : "Error";

  const resultColor = (r: string) => {
    const l = r?.toLowerCase() || "";
    if (l.includes("success") || l === "ok") return "#22C55E";
    if (l.includes("error") || l.includes("fail")) return "#EF4444";
    if (l.includes("warn")) return "#EAB308";
    return `${DARK}70`;
  };

  const handleRunAll = async () => {
    for (const agent of agents) {
      try { await runMutation.mutateAsync({ agentId: agent.id }); } catch {}
    }
    toast.success("All agents triggered");
  };
  const handlePauseAll = async () => {
    for (const agent of agents) {
      if (agent.enabled) {
        try { await toggleMutation.mutateAsync({ agentId: agent.id, enabled: false }); } catch {}
      }
    }
    toast.success("All agents paused");
  };
  const handleResumeAll = async () => {
    for (const agent of agents) {
      if (!agent.enabled) {
        try { await toggleMutation.mutateAsync({ agentId: agent.id, enabled: true }); } catch {}
      }
    }
    toast.success("All agents resumed");
  };

  return (
    <div className="space-y-8">
      {/* Header + Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal" style={{ color: DARK }}>AI Operations</h2>
          <p className="text-xs opacity-30 mt-0.5" style={{ color: DARK }}>Command center for all HAMZURY AI agents</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            style={{ backgroundColor: DARK, color: GOLD }}
            onClick={handleRunAll}
            disabled={runMutation.isPending}
          >
            <Play size={12} className="mr-1.5" /> Run All Agents
          </Button>
          <Button
            size="sm"
            variant="outline"
            style={{ borderColor: `${DARK}20`, color: DARK }}
            onClick={handlePauseAll}
            disabled={toggleMutation.isPending}
          >
            <Pause size={12} className="mr-1.5" /> Pause All
          </Button>
          <Button
            size="sm"
            variant="outline"
            style={{ borderColor: `${DARK}20`, color: DARK }}
            onClick={handleResumeAll}
            disabled={toggleMutation.isPending}
          >
            <RotateCcw size={12} className="mr-1.5" /> Resume All
          </Button>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <div
            key={agent.id}
            className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            {/* Agent header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: DARK }}>{agent.name}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: DARK }}>{agent.dept}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusDot(agent.status) }} />
                <span className="text-[10px] font-medium" style={{ color: statusDot(agent.status) }}>{statusLabel(agent.status)}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: `${DARK}04` }}>
                <p className="text-lg font-medium leading-none" style={{ color: DARK }}>{agent.tasksToday}</p>
                <p className="text-[9px] uppercase tracking-wider opacity-40 mt-1" style={{ color: DARK }}>Tasks Today</p>
              </div>
              <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: `${DARK}04` }}>
                <p className="text-lg font-medium leading-none" style={{ color: agent.successRate >= 90 ? "#22C55E" : agent.successRate >= 70 ? "#EAB308" : "#EF4444" }}>
                  {agent.successRate}%
                </p>
                <p className="text-[9px] uppercase tracking-wider opacity-40 mt-1" style={{ color: DARK }}>Success Rate</p>
              </div>
            </div>

            {/* Last action */}
            <div className="rounded-xl p-2.5" style={{ backgroundColor: `${DARK}04` }}>
              <p className="text-xs opacity-60 leading-snug" style={{ color: DARK }}>{agent.lastAction}</p>
              {agent.lastActionTime && (
                <p className="text-[9px] opacity-30 mt-1" style={{ color: DARK }}>{agent.lastActionTime}</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: `${DARK}06` }}>
              {/* Toggle switch */}
              <button
                onClick={() => toggleMutation.mutate({ agentId: agent.id, enabled: !agent.enabled })}
                disabled={toggleMutation.isPending}
                className="flex items-center gap-2 text-xs"
                style={{ color: agent.enabled ? "#22C55E" : `${DARK}40` }}
              >
                <div
                  className="w-8 h-[18px] rounded-full relative transition-all cursor-pointer"
                  style={{ backgroundColor: agent.enabled ? "#22C55E" : `${DARK}18` }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all"
                    style={{ left: agent.enabled ? "16px" : "2px" }}
                  />
                </div>
                <span>{agent.enabled ? "Enabled" : "Disabled"}</span>
              </button>

              <Button
                size="sm"
                className="text-[10px] h-7 px-3"
                style={{ backgroundColor: GOLD, color: DARK }}
                onClick={() => runMutation.mutate({ agentId: agent.id })}
                disabled={runMutation.isPending}
              >
                <Play size={10} className="mr-1" /> Run Now
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Agent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-sm uppercase tracking-wider opacity-40 font-normal mb-4" style={{ color: DARK }}>Recent Agent Activity</h3>

        {rawLogs.length === 0 ? (
          <p className="text-xs opacity-30 text-center py-8" style={{ color: DARK }}>
            No agent activity recorded yet. Trigger an agent run to start logging.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid ${DARK}08` }}>
                  {["Time", "Agent", "Action", "Result", "Duration"].map(h => (
                    <th key={h} className="text-[10px] uppercase tracking-wider font-normal opacity-40 pb-3 pr-4" style={{ color: DARK }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawLogs.slice(0, 50).map((log: any, i: number) => (
                  <tr key={log.id || i} style={{ borderBottom: `1px solid ${DARK}04` }}>
                    <td className="py-2.5 pr-4 text-xs opacity-50" style={{ color: DARK }}>{log.time || "\u2014"}</td>
                    <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: DARK }}>{log.agent || "\u2014"}</td>
                    <td className="py-2.5 pr-4 text-xs opacity-70" style={{ color: DARK }}>{log.action || "\u2014"}</td>
                    <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: resultColor(log.result) }}>{log.result || "\u2014"}</td>
                    <td className="py-2.5 text-xs opacity-50" style={{ color: DARK }}>{log.duration || "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
