import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
import { FINANCE_SUMMARY, SHARED_TASKS, formatNaira } from "@/lib/dashboardStore";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import {
  Crown, LogOut, ArrowLeft, LayoutDashboard, Zap, BarChart2,
  CalendarDays, ClipboardCheck, FolderOpen, AlertTriangle,
  TrendingUp, Users, CheckCircle2, Clock, FileText, BookOpen,
  GraduationCap, Shield, Lock, Calculator, Loader2,
} from "lucide-react";

// ─── Brand ──────────────────────────────────────────────────────────────────
const GREEN = "#0A1F1C";
const GOLD = "#C9A97E";
const MILK = "#FBF8EE";

type Section = "overview" | "command" | "analytics" | "calendar" | "assign" | "files";

// ─── Mock Seed Data (replace with real data at launch) ──────────────────────
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

const MOCK_DEPT_LEADS = [
  { name: "Emeka Okafor", dept: "bizdoc", label: "BizDoc" },
  { name: "Abiodun Salami", dept: "systemise", label: "Systemise" },
  { name: "Ngozi Chukwu", dept: "skills", label: "Skills" },
  { name: "Kemi Adeyemi", dept: "bizdev", label: "BizDev" },
  { name: "Aisha Okonkwo", dept: "cso", label: "CSO" },
  { name: "Fatima Ibrahim", dept: "finance", label: "Finance" },
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
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CEODashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [resolvedRefs, setResolvedRefs] = useState<string[]>([]);

  const statsQuery = trpc.institutional.stats.useQuery(undefined, { refetchInterval: 30000 });
  const activityQuery = trpc.activity.recent.useQuery({ limit: 10 });
  const commissionsQuery = trpc.commissions.list.useQuery();
  const leadsQuery = trpc.leads.list.useQuery();
  const revenueStatsQuery = trpc.commissions.revenueStats.useQuery(undefined, { refetchInterval: 60000 });
  const escalationsQuery = trpc.institutional.escalations.useQuery(undefined, { refetchInterval: 30000 });
  const deptStatsQuery = trpc.institutional.deptStats.useQuery(undefined, { refetchInterval: 60000 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const stats = statsQuery.data;
  const activity = activityQuery.data || [];
  const commissions = commissionsQuery.data || [];
  const leads = leadsQuery.data || [];
  const pendingComms = commissions.filter(c => c.status === "pending").length;
  const revenueStats = revenueStatsQuery.data;
  const escalations = escalationsQuery.data || [];
  const deptStats = deptStatsQuery.data || [];

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview", icon: LayoutDashboard, label: "Overview" },
    { key: "command", icon: Zap, label: "Command Center" },
    { key: "analytics", icon: BarChart2, label: "Analytics" },
    { key: "calendar", icon: CalendarDays, label: "Calendar" },
    { key: "assign", icon: ClipboardCheck, label: "Assign Tasks" },
    { key: "files", icon: FolderOpen, label: "Files & Resources" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="CEO Dashboard — HAMZURY" description="CEO command centre for HAMZURY Innovation Hub." />
      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: GREEN }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${GOLD}20` }}>
          <Crown size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: GOLD }}>CEO Dashboard</span>
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
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${GREEN}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: GREEN }}>{
              sidebarItems.find(s => s.key === activeSection)?.label
            }</h1>
            <p className="text-xs opacity-40" style={{ color: GREEN }}>{user.name || "Idris Ibrahim"}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/hub/cso" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${GREEN}20`, color: GREEN }}>CSO Hub</Link>
            <Link href="/hub/finance" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${GREEN}20`, color: GREEN }}>Finance</Link>
            <Link href="/hub/bizdev" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${GREEN}20`, color: GREEN }}>BizDev</Link>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {activeSection === "overview" && (
              <OverviewSection stats={stats} leads={leads} commissions={commissions} activity={activity} />
            )}
            {activeSection === "command" && (
              <CommandSection escalations={escalations} resolvedRefs={resolvedRefs} setResolvedRefs={setResolvedRefs} pendingComms={pendingComms} onSwitchToAssign={() => setActiveSection("assign")} />
            )}
            {activeSection === "analytics" && <AnalyticsSection revenueStats={revenueStats} deptStats={deptStats} leads={leads} />}
            {activeSection === "calendar" && <CalendarSection />}
            {activeSection === "assign" && <AssignSection />}
            {activeSection === "files" && <FilesSection />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────
function OverviewSection({ stats, leads, commissions, activity }: { stats: any; leads: any[]; commissions: any[]; activity: any[] }) {
  const fmtNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const totalRevenue = stats?.totalRevenue ?? 4850000;
  const activeLeads = leads.length || 23;
  const staffCount = stats?.totalStaff ?? 18;
  const activeTasks = (stats?.totalTasks ?? 46) - (stats?.completedTasks ?? 34);
  const completedThis = stats?.completedTasks ?? 34;
  const pendingComms = commissions.filter(c => c.status === "pending").length || 3;

  const STAT_CARDS = [
    { label: "Total Revenue", value: fmtNaira(totalRevenue), icon: BarChart2, color: GOLD, isText: true },
    { label: "Active Leads", value: activeLeads, icon: TrendingUp, color: "#3B82F6" },
    { label: "Total Staff", value: staffCount, icon: Users, color: "#8B5CF6" },
    { label: "Tasks In Progress", value: activeTasks, icon: Clock, color: "#EAB308" },
    { label: "Completed (Month)", value: completedThis, icon: CheckCircle2, color: "#22C55E" },
    { label: "Pending Approvals", value: pendingComms, icon: AlertTriangle, color: "#EF4444" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, isText }) => (
          <div key={label} className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: `${GREEN}08` }}>
            <Icon size={16} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-medium leading-none mb-1" style={{ color: isText ? color : color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: GREEN }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Financial Overview — sourced from shared store */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: `${GREEN}06`, border: `1px solid ${GREEN}12` }}>
        <p className="text-xs uppercase tracking-widest mb-3 opacity-40 font-normal" style={{ color: GREEN }}>Financial Overview — March 2026</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Revenue",         value: formatNaira(FINANCE_SUMMARY.totalRevenue) },
            { label: "Operational Cost",value: formatNaira(FINANCE_SUMMARY.operationalCost) },
            { label: "Net Profit",      value: formatNaira(FINANCE_SUMMARY.profit) },
            { label: "Commission Pool", value: formatNaira(FINANCE_SUMMARY.commissionPool) },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3 text-center" style={{ border: `1px solid ${GREEN}08` }}>
              <p className="text-lg font-medium" style={{ color: GOLD }}>{item.value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5 opacity-40" style={{ color: GREEN }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Department summary — real data */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Department Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { dept: "bizdoc", label: "BizDoc", color: "#1B4D3E" },
            { dept: "systemise", label: "Systemise", color: "#4285F4" },
            { dept: "skills", label: "Skills", color: "#C9A97E" },
          ].map(({ dept, label, color }) => {
            const d = (stats as any)?.deptStats?.find((x: any) => x.dept === dept) ||
              { completedTasks: 0, totalTasks: 0, completionRate: 0, totalLeads: 0 };
            return (
              <div key={dept} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${GREEN}08` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <p className="text-sm font-medium" style={{ color: GREEN }}>{label}</p>
                </div>
                <p className="text-2xl font-normal mb-0.5" style={{ color: GREEN }}>{d.completedTasks ?? 0}</p>
                <p className="text-xs opacity-40" style={{ color: GREEN }}>completed · {(d.totalTasks ?? 0) - (d.completedTasks ?? 0)} active</p>
                <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.completionRate ?? 0}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Recent Activity</h2>
        {activity.length === 0 ? (
          <div className="space-y-3">
            {["BizDev handed off new lead — Chukwuemeka Foods Ltd", "Finance approved commission — ₦45,000", "Skills enrolled 3 new students — Business Essentials Cohort 3", "BizDoc completed CAC registration — NorthStar Trading Co", "Systemise delivered Clarity Audit — Kemi Properties"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: `${GREEN}06` }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />
                <p className="text-sm font-normal opacity-70" style={{ color: GREEN }}>{item}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activity.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: `${GREEN}06` }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: GOLD }} />
                <p className="text-sm opacity-70" style={{ color: GREEN }}>{a.action?.replace(/_/g, " ")}</p>
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
type Escalation = { type: string; ref: string; label: string; value: string | null; status: string };

function CommandSection({ escalations, resolvedRefs, setResolvedRefs, pendingComms, onSwitchToAssign }: {
  escalations: Escalation[];
  resolvedRefs: string[];
  setResolvedRefs: React.Dispatch<React.SetStateAction<string[]>>;
  pendingComms: number;
  onSwitchToAssign: () => void;
}) {
  const active = escalations.filter(e => !resolvedRefs.includes(e.ref));
  const typeColors: Record<string, string> = {
    high_value_task: "#EF4444",
    unassigned_lead: GOLD,
    pending_payout: "#8B5CF6",
  };
  const typeLabels: Record<string, string> = {
    high_value_task: "High-Value Task",
    unassigned_lead: "Unassigned Lead",
    pending_payout: "Pending Payout",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: GREEN }}>Command Center</h2>
        <p className="text-xs opacity-30" style={{ color: GREEN }}>Items requiring CEO attention — live from database</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button size="sm" style={{ backgroundColor: GREEN, color: GOLD }} onClick={onSwitchToAssign}>
          + Assign Task to Dept Lead
        </Button>
        <Link href="/hub/finance">
          <Button size="sm" variant="outline" style={{ borderColor: `${GREEN}20`, color: GREEN }}>
            Commission Queue ({pendingComms})
          </Button>
        </Link>
        <Link href="/hub/cso">
          <Button size="sm" variant="outline" style={{ borderColor: `${GREEN}20`, color: GREEN }}>
            Lead Pipeline
          </Button>
        </Link>
        <Link href="/hub/hr">
          <Button size="sm" variant="outline" style={{ borderColor: `${GREEN}20`, color: GREEN }}>
            HR & Attendance
          </Button>
        </Link>
      </div>

      {/* Real Escalations */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>
          Escalations ({active.length})
        </p>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${GREEN}08` }}>
            <CheckCircle2 size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#22C55E" }} />
            <p className="text-sm opacity-40" style={{ color: GREEN }}>No pending escalations</p>
          </div>
        ) : active.map((e, i) => {
          const color = typeColors[e.type] || GOLD;
          return (
            <div key={`${e.ref}-${i}`} className="bg-white rounded-2xl border p-5 flex items-start gap-4" style={{ borderColor: e.type === "high_value_task" ? "#EF444430" : `${GREEN}08` }}>
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-normal" style={{ backgroundColor: `${color}15`, color }}>
                    {typeLabels[e.type] || e.type}
                  </span>
                  <span className="text-[10px] opacity-30 font-mono" style={{ color: GREEN }}>{e.ref}</span>
                </div>
                <p className="text-sm font-normal" style={{ color: GREEN }}>{e.label}</p>
                {e.value && <p className="text-xs font-medium mt-0.5" style={{ color: GOLD }}>₦{parseFloat(e.value).toLocaleString("en-NG")}</p>}
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
          );
        })}
      </div>
    </div>
  );
}

// ─── Analytics Section ───────────────────────────────────────────────────────
function AnalyticsSection({ revenueStats, deptStats, leads }: { revenueStats: any; deptStats: any[]; leads: any[] }) {
  const fmtNaira = (v: number) => v >= 1000000 ? `₦${(v / 1000000).toFixed(1)}M` : `₦${(v / 1000).toFixed(0)}K`;

  const revenueData = revenueStats?.monthlyRevenue || MOCK_REVENUE;
  const hasDeptStats = deptStats && deptStats.length > 0;

  // Lead source breakdown from real leads
  const sourceMap: Record<string, number> = {};
  leads.forEach(l => { const src = l.source || "Direct"; sourceMap[src] = (sourceMap[src] || 0) + 1; });
  const leadSources = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));
  const displaySources = leadSources.length > 0 ? leadSources : MOCK_LEAD_SOURCES;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: GREEN }}>Company Analytics</h2>
        <p className="text-xs opacity-30" style={{ color: GREEN }}>
          {revenueStats ? "Live data from database" : "Loading…"}
        </p>
      </div>

      {/* Revenue summary cards */}
      {revenueStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Paid Revenue", value: fmtNaira(revenueStats.totalRevenue), color: "#22C55E" },
            { label: "Pending Revenue", value: fmtNaira(revenueStats.pendingRevenue), color: GOLD },
            { label: "Commissions Paid", value: revenueStats.paidCount, color: GREEN },
            { label: "Pending Approvals", value: revenueStats.pendingCount, color: "#EF4444" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: `${GREEN}08` }}>
              <p className="text-xl font-medium" style={{ color }}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1 opacity-40" style={{ color: GREEN }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
        <p className="text-sm font-normal mb-6 opacity-60" style={{ color: GREEN }}>Monthly Revenue — Last 6 Months</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} barSize={28}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: GREEN, opacity: 0.4 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtNaira} tick={{ fontSize: 11, fill: GREEN, opacity: 0.4 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [`₦${v.toLocaleString("en-NG")}`, "Revenue"]}
              contentStyle={{ borderRadius: 10, border: `1px solid ${GREEN}10`, fontSize: 12 }}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {revenueData.map((_: any, i: number) => (
                <Cell key={i} fill={i === revenueData.length - 1 ? GOLD : `${GREEN}25`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lead sources + Department performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
          <p className="text-sm font-normal mb-5 opacity-60" style={{ color: GREEN }}>Lead Sources {leadSources.length === 0 ? "(No leads yet)" : ""}</p>
          <div className="space-y-4">
            {displaySources.map(({ source, count }: any) => {
              const max = Math.max(...displaySources.map((l: any) => l.count));
              return (
                <div key={source} className="flex items-center gap-3">
                  <p className="text-sm w-20 shrink-0 font-normal opacity-60" style={{ color: GREEN }}>{source}</p>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / max) * 100}%`, backgroundColor: GOLD }} />
                  </div>
                  <p className="text-sm font-medium w-6 text-right" style={{ color: GREEN }}>{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
          <p className="text-sm font-normal mb-5 opacity-60" style={{ color: GREEN }}>Department Task Performance</p>
          <div className="space-y-4">
            {(hasDeptStats ? deptStats : [
              { dept: "bizdoc", completedTasks: 0, totalTasks: 0, completionRate: 0 },
              { dept: "systemise", completedTasks: 0, totalTasks: 0, completionRate: 0 },
              { dept: "skills", completedTasks: 0, totalTasks: 0, completionRate: 0 },
            ]).map((d: any) => {
              const colors: Record<string, string> = { bizdoc: "#1B4D3E", systemise: "#4285F4", skills: "#C9A97E" };
              const color = colors[d.dept] || GOLD;
              const label = d.dept.charAt(0).toUpperCase() + d.dept.slice(1);
              return (
                <div key={d.dept} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <p className="text-sm w-24 shrink-0 font-normal opacity-70" style={{ color: GREEN }}>{label}</p>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.completionRate || 0}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-xs font-medium w-10 text-right opacity-50" style={{ color: GREEN }}>{d.completionRate || 0}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Section ────────────────────────────────────────────────────────
function CalendarSection() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = ["23", "24", "25", "26", "27", "28", "29"];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: GREEN }}>Company Calendar</h2>
        <p className="text-xs opacity-30" style={{ color: GREEN }}>Only the Founder creates company-wide events — these appear in all department calendars.</p>
      </div>

      {/* Week strip */}
      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: `${GREEN}08` }}>
        <div className="flex justify-between mb-4 gap-1">
          {days.map((d, i) => {
            const hasEvent = MOCK_EVENTS.some(e => e.day === d);
            return (
              <div key={d} className="flex-1 flex flex-col items-center py-2 rounded-xl" style={{ backgroundColor: hasEvent ? `${GOLD}12` : "transparent" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: GREEN, opacity: 0.4 }}>{d}</p>
                <p className="text-base font-normal" style={{ color: hasEvent ? GOLD : GREEN, opacity: hasEvent ? 1 : 0.5 }}>{dates[i]}</p>
                {hasEvent && <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: GOLD }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>This Week's Events</p>
        {MOCK_EVENTS.map((e, i) => (
          <div key={i} className="bg-white rounded-2xl border p-4 flex items-center gap-4" style={{ borderColor: `${GREEN}08` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}15` }}>
              <CalendarDays size={16} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal" style={{ color: GREEN }}>{e.title}</p>
              <p className="text-xs opacity-40 mt-0.5" style={{ color: GREEN }}>{e.day} {e.date} Mar · {e.time}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        style={{ backgroundColor: GREEN, color: GOLD }}
        onClick={() => toast("Calendar event creation coming soon")}
      >
        + Add Event
      </Button>
    </div>
  );
}

// ─── Assign Tasks Section ────────────────────────────────────────────────────
function AssignSection() {
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [desc, setDesc] = useState("");

  const DEPT_LEADS: Record<string, { name: string; dept: string }[]> = {
    bizdoc: [{ name: "Emeka Okafor", dept: "bizdoc" }],
    systemise: [{ name: "Abiodun Salami", dept: "systemise" }],
    skills: [{ name: "Ngozi Chukwu", dept: "skills" }],
    bizdev: [{ name: "Kemi Adeyemi", dept: "bizdev" }],
    cso: [{ name: "Aisha Okonkwo", dept: "cso" }],
    finance: [{ name: "Fatima Ibrahim", dept: "finance" }],
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
    { value: "bizdoc", label: "BizDoc" },
    { value: "systemise", label: "Systemise" },
    { value: "skills", label: "Skills" },
    { value: "bizdev", label: "BizDev" },
    { value: "cso", label: "CSO" },
    { value: "finance", label: "Finance" },
  ];

  const handleSubmit = () => {
    if (!title || !dept || !assignee || !priority) { toast.error("Please fill all required fields"); return; }
    toast.success(`Task assigned to ${assignee}`);
    setTitle(""); setDept(""); setAssignee(""); setPriority(""); setDueDate(""); setDesc("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
      {/* Form */}
      <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: `${GREEN}08` }}>
        <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal mb-2" style={{ color: GREEN }}>Assign Task</h2>
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
        <Button className="w-full" style={{ backgroundColor: GREEN, color: GOLD }} onClick={handleSubmit}>
          Assign Task
        </Button>
      </div>

      {/* Recently assigned */}
      <div>
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal mb-4" style={{ color: GREEN }}>Recently Assigned</p>
        <div className="space-y-3">
          {RECENT_ASSIGNED.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border p-4" style={{ borderColor: `${GREEN}08` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono opacity-30 mr-1" style={{ color: GREEN }}>{t.id}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>{t.dept}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: t.priority === "High" || t.priority === "Urgent" ? "#EF444415" : "#6B728015", color: t.priority === "High" || t.priority === "Urgent" ? "#EF4444" : "#6B7280" }}>{t.priority}</span>
              </div>
              <p className="text-sm font-normal" style={{ color: GREEN }}>{t.title}</p>
              <p className="text-xs opacity-40 mt-1" style={{ color: GREEN }}>{t.assignee} · Due {t.due}</p>
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
      <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>Files & Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FILES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl border p-5 flex flex-col gap-3" style={{ borderColor: `${GREEN}08` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${GOLD}15` }}>
              <Icon size={16} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal mb-1" style={{ color: GREEN }}>{title}</p>
              <p className="text-xs opacity-40 leading-relaxed" style={{ color: GREEN }}>{desc}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ borderColor: `${GREEN}15`, color: GREEN }}
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
