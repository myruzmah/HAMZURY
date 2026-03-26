import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
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
  Eye, EyeOff, Plus, Trash2,
} from "lucide-react";

// ─── Brand ──────────────────────────────────────────────────────────────────
const CHOCO = "#2C1A0E";
const GOLD  = "#C9A97E";
const MILK  = "#FBF8EE";

type Section = "overview" | "command" | "analytics" | "commissions" | "staff" | "calendar" | "assign" | "files" | "vault";

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
  { dept: "Skills", completed: 18, active: 12, color: "#C9A97E" },
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
  { name: "Idris Ibrahim", title: "Chief Executive Officer", dept: "CEO", color: "#0A1F1C" },
  { name: "CSO Lead", title: "Chief Strategy Officer", dept: "CSO", color: "#0A1F1C" },
  { name: "Finance Lead", title: "Finance Manager", dept: "Finance", color: "#7B4F00" },
  { name: "Ibrahim (HR)", title: "HR Manager", dept: "Federal", color: "#2D5A27" },
  { name: "Emeka Okafor", title: "BizDoc Lead", dept: "BizDoc", color: "#1B4D3E" },
  { name: "Ngozi Chukwu", title: "Skills Administrator", dept: "Skills", color: "#8B6914" },
  { name: "Kemi Adeyemi", title: "BizDev Lead", dept: "BizDev", color: "#34A853" },
  { name: "Abiodun Salami", title: "Systemise Lead", dept: "Systemise", color: "#0A1F1C" },
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
          <div key={label} className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: `${CHOCO}08` }}>
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
            <div key={d.dept} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${CHOCO}08` }}>
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
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${CHOCO}08` }}>
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
          <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${CHOCO}08` }}>
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
        color: ["#1B4D3E", "#4285F4", "#C9A97E", "#34A853"][i % 4],
      }))
    : MOCK_DEPT_PERFORMANCE;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: CHOCO }}>Company Analytics</h2>
        <p className="text-xs opacity-30" style={{ color: CHOCO }}>{revenueStats ? "Live data from database" : "Seed data — connect DB for live figures"}</p>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${CHOCO}08` }}>
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
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${CHOCO}08` }}>
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

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${CHOCO}08` }}>
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
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${CHOCO}08` }}>
          <DollarSign size={36} className="mx-auto mb-3 opacity-20" style={{ color: CHOCO }} />
          <p className="text-sm opacity-40" style={{ color: CHOCO }}>No commissions on record</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${CHOCO}08` }}>
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
                            onClick={() => toast.success(`Commission approved for ${c.staffName || c.staff?.name}`)}
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
        <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: `${CHOCO}08` }}>
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
            className="bg-white rounded-2xl border p-5 space-y-3"
            style={{ borderColor: `${CHOCO}08` }}
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
      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: `${CHOCO}08` }}>
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
          <div key={i} className="bg-white rounded-2xl border p-4 flex items-center gap-4" style={{ borderColor: `${CHOCO}08` }}>
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

  const handleSubmit = () => {
    if (!title || !dept || !assignee || !priority) { toast.error("Please fill all required fields"); return; }
    toast.success(`Task assigned to ${assignee}`);
    setTitle(""); setDept(""); setAssignee(""); setPriority(""); setDueDate(""); setDesc("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
      {/* Form */}
      <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: `${CHOCO}08` }}>
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
            <div key={t.id} className="bg-white rounded-2xl border p-4" style={{ borderColor: `${CHOCO}08` }}>
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
const VAULT_KEY = "hamzury-founder-vault";

type VaultAccount = { id: string; site: string; username: string; password: string };
type VaultDoc = { id: string; label: string; status: "have" | "missing"; notes: string };
type VaultGoal = { id: string; text: string; done: boolean };

const DEFAULT_ACCOUNTS: VaultAccount[] = [
  { id: "a1", site: "CAC Portal",         username: "hamzury@admin",      password: "cac@secure2026" },
  { id: "a2", site: "FIRS TaxPro",        username: "tax@hamzury.com",    password: "firs@taxpr0" },
  { id: "a3", site: "Google Workspace",   username: "admin@hamzury.com",  password: "gws@hamzury2026" },
];

const DEFAULT_DOCS: VaultDoc[] = [
  { id: "d1", label: "CAC Certificate (BN/RC)",        status: "have",    notes: "" },
  { id: "d2", label: "TIN Certificate",                status: "have",    notes: "" },
  { id: "d3", label: "SCUML Registration",             status: "missing", notes: "" },
  { id: "d4", label: "Company Seal",                   status: "have",    notes: "" },
  { id: "d5", label: "Board Resolution (current year)",status: "missing", notes: "" },
  { id: "d6", label: "Trademark Certificate",          status: "missing", notes: "" },
  { id: "d7", label: "CERPAC (foreign partner)",       status: "missing", notes: "" },
  { id: "d8", label: "Business Insurance",             status: "missing", notes: "" },
];

const DEFAULT_GOALS: VaultGoal[] = [
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

function loadVault() {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return { accounts: DEFAULT_ACCOUNTS, docs: DEFAULT_DOCS, goals: DEFAULT_GOALS };
    return JSON.parse(raw);
  } catch {
    return { accounts: DEFAULT_ACCOUNTS, docs: DEFAULT_DOCS, goals: DEFAULT_GOALS };
  }
}

function saveVault(data: { accounts: VaultAccount[]; docs: VaultDoc[]; goals: VaultGoal[] }) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(data));
}

function VaultSection() {
  const [vaultTab, setVaultTab] = useState<"accounts" | "documents" | "growth">("accounts");

  const initial = loadVault();
  const [accounts, setAccounts] = useState<VaultAccount[]>(initial.accounts ?? DEFAULT_ACCOUNTS);
  const [docs,     setDocs]     = useState<VaultDoc[]>(initial.docs ?? DEFAULT_DOCS);
  const [goals,    setGoals]    = useState<VaultGoal[]>(initial.goals ?? DEFAULT_GOALS);

  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newSite, setNewSite]     = useState("");
  const [newUser, setNewUser]     = useState("");
  const [newPass, setNewPass]     = useState("");
  const [newGoal, setNewGoal]     = useState("");

  const persist = (a: VaultAccount[], d: VaultDoc[], g: VaultGoal[]) => {
    setAccounts(a); setDocs(d); setGoals(g);
    saveVault({ accounts: a, docs: d, goals: g });
  };

  const addAccount = () => {
    if (!newSite || !newUser || !newPass) { toast.error("Fill all fields"); return; }
    const updated = [...accounts, { id: `a${Date.now()}`, site: newSite, username: newUser, password: newPass }];
    persist(updated, docs, goals);
    setNewSite(""); setNewUser(""); setNewPass(""); setShowAddAccount(false);
    toast.success("Account saved to vault");
  };

  const deleteAccount = (id: string) => {
    persist(accounts.filter(a => a.id !== id), docs, goals);
    toast("Account removed");
  };

  const toggleDoc = (id: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, status: d.status === "have" ? "missing" as const : "have" as const } : d);
    persist(accounts, updated, goals);
  };

  const updateDocNote = (id: string, notes: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, notes } : d);
    persist(accounts, updated, goals);
  };

  const toggleGoal = (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    persist(accounts, docs, updated);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const updated = [...goals, { id: `g${Date.now()}`, text: newGoal.trim(), done: false }];
    persist(accounts, docs, updated);
    setNewGoal("");
  };

  const deleteGoal = (id: string) => {
    persist(accounts, docs, goals.filter(g => g.id !== id));
  };

  const VAULT_TABS = [
    { key: "accounts"  as const, label: "Accounts" },
    { key: "documents" as const, label: "Documents" },
    { key: "growth"    as const, label: "Growth" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}18` }}>
          <Lock size={16} style={{ color: GOLD }} />
        </div>
        <div>
          <h2 className="text-base font-medium" style={{ color: CHOCO }}>Personal Vault</h2>
          <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>Data stored locally on this device only</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: `${CHOCO}08` }}>
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

      {/* ── Accounts Tab ── */}
      {vaultTab === "accounts" && (
        <div className="space-y-3">
          {accounts.map(acc => {
            const revealed = revealedIds.includes(acc.id);
            return (
              <div key={acc.id} className="bg-white rounded-2xl border p-4 flex items-center gap-4" style={{ borderColor: `${CHOCO}08` }}>
                <div className="flex-1 min-w-0 grid grid-cols-3 gap-3 items-center">
                  <p className="text-sm font-medium truncate" style={{ color: CHOCO }}>{acc.site}</p>
                  <p className="text-sm opacity-60 truncate" style={{ color: CHOCO }}>{acc.username}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono opacity-50 truncate" style={{ color: CHOCO }}>
                      {revealed ? acc.password : "••••••••"}
                    </p>
                    <button
                      onClick={() => setRevealedIds(p => revealed ? p.filter(x => x !== acc.id) : [...p, acc.id])}
                      className="shrink-0 opacity-30 hover:opacity-70 transition-opacity"
                    >
                      {revealed ? <EyeOff size={14} style={{ color: CHOCO }} /> : <Eye size={14} style={{ color: CHOCO }} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => deleteAccount(acc.id)}
                  className="shrink-0 opacity-20 hover:opacity-60 transition-opacity"
                >
                  <Trash2 size={14} style={{ color: "#EF4444" }} />
                </button>
              </div>
            );
          })}

          {showAddAccount ? (
            <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: `${GOLD}25` }}>
              <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: CHOCO }}>New Account</p>
              <Input placeholder="Site / App name *" value={newSite} onChange={e => setNewSite(e.target.value)} className="border-gray-200 bg-gray-50" />
              <Input placeholder="Username / Email *" value={newUser} onChange={e => setNewUser(e.target.value)} className="border-gray-200 bg-gray-50" />
              <Input placeholder="Password *" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="border-gray-200 bg-gray-50" />
              <div className="flex gap-2">
                <Button size="sm" onClick={addAccount} style={{ backgroundColor: CHOCO, color: GOLD }}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddAccount(false); setNewSite(""); setNewUser(""); setNewPass(""); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddAccount(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm transition-all hover:opacity-70"
              style={{ borderColor: `${CHOCO}15`, color: `${CHOCO}40` }}
            >
              <Plus size={14} />
              Add Account
            </button>
          )}
        </div>
      )}

      {/* ── Documents Tab ── */}
      {vaultTab === "documents" && (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border p-4 space-y-2" style={{ borderColor: `${CHOCO}08` }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDoc(doc.id)}
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: doc.status === "have" ? "#22C55E" : `${CHOCO}25`,
                    backgroundColor: doc.status === "have" ? "#22C55E" : "transparent",
                  }}
                >
                  {doc.status === "have" && <CheckCircle2 size={10} color="white" />}
                </button>
                <p className="flex-1 text-sm font-normal" style={{ color: CHOCO }}>{doc.label}</p>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: doc.status === "have" ? "#DCFCE7" : "#FEF3C7",
                    color:           doc.status === "have" ? "#166534" : "#92400E",
                  }}
                >
                  {doc.status === "have" ? "Have it" : "Missing"}
                </span>
              </div>
              <Input
                placeholder="Notes (optional)"
                value={doc.notes}
                onChange={e => updateDocNote(doc.id, e.target.value)}
                className="border-gray-100 bg-gray-50 text-xs h-8"
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Growth Tab ── */}
      {vaultTab === "growth" && (
        <div className="space-y-6">
          {/* Quote */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
            <p className="text-sm italic leading-relaxed mb-3" style={{ color: CHOCO }}>
              "The system is the business. Build it so it runs without you."
            </p>
            <p className="text-xs font-medium opacity-50" style={{ color: CHOCO }}>— Muhammad Hamzury</p>
          </div>

          {/* Weekly Goals */}
          <div>
            <p className="text-xs uppercase tracking-wider opacity-40 font-normal mb-3" style={{ color: CHOCO }}>Weekly Goals</p>
            <div className="space-y-2">
              {goals.map(g => (
                <div key={g.id} className="bg-white rounded-2xl border p-3 flex items-center gap-3" style={{ borderColor: `${CHOCO}08` }}>
                  <button
                    onClick={() => toggleGoal(g.id)}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: g.done ? GOLD : `${CHOCO}25`,
                      backgroundColor: g.done ? GOLD : "transparent",
                    }}
                  >
                    {g.done && <CheckCircle2 size={10} color="white" />}
                  </button>
                  <p
                    className="flex-1 text-sm"
                    style={{ color: CHOCO, opacity: g.done ? 0.35 : 0.8, textDecoration: g.done ? "line-through" : "none" }}
                  >
                    {g.text}
                  </p>
                  <button onClick={() => deleteGoal(g.id)} className="opacity-20 hover:opacity-50 transition-opacity shrink-0">
                    <Trash2 size={13} style={{ color: "#EF4444" }} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Add a goal for this week..."
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addGoal()}
                className="border-gray-200 bg-gray-50 text-sm"
              />
              <Button size="sm" onClick={addGoal} style={{ backgroundColor: CHOCO, color: GOLD }}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div>
            <p className="text-xs uppercase tracking-wider opacity-40 font-normal mb-3" style={{ color: CHOCO }}>5-Day Schedule</p>
            <div className="grid grid-cols-5 gap-2">
              {SCHEDULE_DAYS.map(({ day, blocks }) => (
                <div key={day} className="bg-white rounded-2xl border p-3 space-y-2" style={{ borderColor: `${CHOCO}08` }}>
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
      )}
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
          <div key={title} className="bg-white rounded-2xl border p-5 flex flex-col gap-3" style={{ borderColor: `${CHOCO}08` }}>
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
