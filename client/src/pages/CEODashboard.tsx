import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { Link } from "wouter";
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
  Coffee, Mic, Star, ChevronDown, ChevronUp, Plus, Trash2, Send, Target,
} from "lucide-react";
import DeptChatPanel from "@/components/DeptChatPanel";
import AgentSuggestionCard from "@/components/AgentSuggestionCard";

// ─── Brand (CEO = general → Apple grey) ──────────────────────────────────────
const GREEN = "#1B4D3E";   // HAMZURY green
const GOLD = "#B48C4C";
const MILK = "#FFFAF6";    // Milk white

type Section = "overview" | "hubmeeting" | "command" | "analytics" | "calendar" | "assign" | "files" | "targets";

// NOTE: MOCK_REVENUE and MOCK_LEAD_SOURCES were removed — analytics now uses real tRPC data.


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
  const leads = (Array.isArray(leadsQuery.data) ? leadsQuery.data : []) as any[];
  const pendingComms = commissions.filter(c => c.status === "pending").length;
  const revenueStats = revenueStatsQuery.data;
  const escalations = escalationsQuery.data || [];
  const deptStats = deptStatsQuery.data || [];

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview",   icon: LayoutDashboard, label: "Overview" },
    { key: "hubmeeting", icon: Coffee,          label: "Hub Meeting" },
    { key: "targets",   icon: Target,          label: "Weekly Targets" },
    { key: "command",    icon: Zap,             label: "Command Center" },
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
            {activeSection === "hubmeeting" && <HubMeetingSection />}
            {activeSection === "targets" && (
              <div className="space-y-10">
                <Phase2TargetsPanel />
                <div className="border-t pt-8" style={{ borderColor: `${GREEN}10` }}>
                  <WeeklyTargetsSection />
                </div>
              </div>
            )}
            {activeSection === "calendar" && <CalendarSection />}
            {activeSection === "assign" && <AssignSection />}
            {activeSection === "files" && <FilesSection />}
          </div>
        </ScrollArea>
      </div>
      <DeptChatPanel department="ceo" staffId={user.openId || ""} staffName={user.name || "CEO"} />
    </div>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────
function OverviewSection({ stats, leads, commissions, activity }: { stats: any; leads: any[]; commissions: any[]; activity: any[] }) {
  const fmtNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const activeLeads = leads.length;
  const staffCount = stats?.totalStaff ?? 0;
  const activeTasks = (stats?.totalTasks ?? 0) - (stats?.completedTasks ?? 0);
  const completedThis = stats?.completedTasks ?? 0;
  const pendingComms = commissions.filter(c => c.status === "pending").length;

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
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Icon size={16} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-medium leading-none mb-1" style={{ color: isText ? color : color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: GREEN }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Financial Overview — real data from tRPC (pending Finance integration) */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: `${GREEN}06`, border: `1px solid ${GREEN}12` }}>
        <p className="text-xs uppercase tracking-widest mb-3 opacity-40 font-normal" style={{ color: GREEN }}>Financial Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Revenue",         value: "₦0" },
            { label: "Operational Cost",value: "₦0" },
            { label: "Net Profit",      value: "₦0" },
            { label: "Commission Pool", value: "₦0" },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl p-3 text-center" style={{ border: `1px solid ${GREEN}08` }}>
              <p className="text-lg font-medium" style={{ color: GOLD }}>{item.value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5 opacity-40" style={{ color: GREEN }}>{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-2 opacity-30 text-center" style={{ color: GREEN }}>Finance data will populate from verified records</p>
      </div>

      {/* Department summary — real data */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Department Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { dept: "bizdoc", label: "BizDoc", color: "#1B4D3E" },
            { dept: "systemise", label: "Systemise", color: "#4285F4" },
            { dept: "skills", label: "Skills", color: "#B48C4C" },
          ].map(({ dept, label, color }) => {
            const d = (stats as any)?.deptStats?.find((x: any) => x.dept === dept) ||
              { completedTasks: 0, totalTasks: 0, completionRate: 0, totalLeads: 0 };
            return (
              <div key={dept} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm opacity-30 py-4 text-center" style={{ color: GREEN }}>No recent activity yet.</p>
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
        <Button size="sm" variant="outline" style={{ borderColor: `${GREEN}20`, color: GREEN }}>
          Commission Queue ({pendingComms})
        </Button>
        <Button size="sm" variant="outline" style={{ borderColor: `${GREEN}20`, color: GREEN }}>
          Lead Pipeline
        </Button>
        <Button size="sm" variant="outline" style={{ borderColor: `${GREEN}20`, color: GREEN }}>
          HR & Attendance
        </Button>
      </div>

      {/* Real Escalations */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>
          Escalations ({active.length})
        </p>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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

  const revenueData = revenueStats?.monthlyRevenue || [];
  const hasDeptStats = deptStats && deptStats.length > 0;

  // Lead source breakdown from real leads
  const sourceMap: Record<string, number> = {};
  leads.forEach(l => { const src = l.source || "Direct"; sourceMap[src] = (sourceMap[src] || 0) + 1; });
  const displaySources = Object.entries(sourceMap).map(([source, count]) => ({ source, count }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: GREEN }}>Company Analytics</h2>
        <p className="text-xs opacity-30" style={{ color: GREEN }}>
          {revenueStats ? "Live data from database" : "No revenue data yet"}
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
            <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-xl font-medium" style={{ color }}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1 opacity-40" style={{ color: GREEN }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-sm font-normal mb-6 opacity-60" style={{ color: GREEN }}>Monthly Revenue — Last 6 Months</p>
        {revenueData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center">
            <p className="text-sm opacity-25" style={{ color: GREEN }}>No revenue data yet.</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Lead sources + Department performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-normal mb-5 opacity-60" style={{ color: GREEN }}>Lead Sources</p>
          {displaySources.length === 0 ? (
            <p className="text-sm opacity-25 py-4 text-center" style={{ color: GREEN }}>No lead data yet.</p>
          ) : (
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
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-normal mb-5 opacity-60" style={{ color: GREEN }}>Department Task Performance</p>
          <div className="space-y-4">
            {(hasDeptStats ? deptStats : [
              { dept: "bizdoc", completedTasks: 0, totalTasks: 0, completionRate: 0 },
              { dept: "systemise", completedTasks: 0, totalTasks: 0, completionRate: 0 },
              { dept: "skills", completedTasks: 0, totalTasks: 0, completionRate: 0 },
            ]).map((d: any) => {
              const colors: Record<string, string> = { bizdoc: "#1B4D3E", systemise: "#4285F4", skills: "#B48C4C" };
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
  const tasksQuery = trpc.tasks.list.useQuery(undefined, { refetchInterval: 30000 });

  const upcomingTasks = (tasksQuery.data || [])
    .filter(t => t.deadline && t.status !== "Completed")
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""))
    .slice(0, 5);

  // Determine which days of the current week have deadlines
  const today = new Date();
  const currentDay = today.getDay(); // 0=Sun,1=Mon,...
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const weekDates = days.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d.toISOString().slice(0, 10);
  });

  const daysWithDeadlines = new Set(
    (tasksQuery.data || [])
      .filter(t => t.deadline && t.status !== "Completed")
      .map(t => t.deadline)
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: GREEN }}>Company Calendar</h2>
        <p className="text-xs opacity-30" style={{ color: GREEN }}>Upcoming task deadlines from all departments.</p>
      </div>

      {/* Week strip */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between mb-4 gap-1">
          {days.map((d, i) => {
            const dateStr = weekDates[i];
            const hasDeadline = daysWithDeadlines.has(dateStr);
            const dateNum = new Date(dateStr).getDate().toString();
            return (
              <div key={d} className="flex-1 flex flex-col items-center py-2 rounded-xl" style={{ backgroundColor: hasDeadline ? `${GOLD}12` : "transparent" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: GREEN, opacity: 0.4 }}>{d}</p>
                <p className="text-base font-normal" style={{ color: hasDeadline ? GOLD : GREEN, opacity: hasDeadline ? 1 : 0.5 }}>{dateNum}</p>
                {hasDeadline && <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: GOLD }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming deadlines */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>Upcoming Deadlines</p>
        {upcomingTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-sm opacity-40" style={{ color: GREEN }}>No upcoming deadlines</p>
          </div>
        ) : upcomingTasks.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${GOLD}15` }}>
              <CalendarDays size={16} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal" style={{ color: GREEN }}>{t.clientName} — {t.service}</p>
              <p className="text-xs opacity-40 mt-0.5" style={{ color: GREEN }}>
                Due: {t.deadline} · {t.status}
              </p>
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
    bizdoc: [{ name: "Abdullahi Musa", dept: "bizdoc" }],
    systemise: [{ name: "Dajot", dept: "systemise" }, { name: "Lalo", dept: "systemise" }],
    skills: [{ name: "Abdulmalik Musa", dept: "skills" }],
    bizdev: [{ name: "Khadija Saad", dept: "bizdev" }, { name: "Farida Munir", dept: "bizdev" }],
    cso: [{ name: "Maryam Ashir Lalo", dept: "cso" }],
    finance: [{ name: "Abubakar Sadiq", dept: "finance" }],
    media: [{ name: "Sulaiman Hikma", dept: "media" }],
  };

  // Real task assignments — populated from tRPC tasks when available
  const RECENT_ASSIGNED: { title: string; assignee: string; dept: string; priority: string; due: string; id: string }[] = [];

  const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
  const DEPTS = [
    { value: "bizdoc", label: "BizDoc" },
    { value: "systemise", label: "Systemise" },
    { value: "skills", label: "Skills" },
    { value: "bizdev", label: "BizDev" },
    { value: "cso", label: "CSO" },
    { value: "finance", label: "Finance" },
    { value: "media", label: "Media" },
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
            <div key={t.id} className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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

// ─── Hub Meeting Section ──────────────────────────────────────────────────────
const STANDING_AGENDA = [
  { time: "0:00–10:00",  icon: "🤫", title: "Solitude",              detail: "10 minutes of silence. All gadgets down. No phones, no laptops. Mental reset before business." },
  { time: "10:00–20:00", icon: "📋", title: "Last Week Review",       detail: "Go through last week's to-do list. What was done? What wasn't? Why? No blame — solutions only." },
  { time: "20:00–35:00", icon: "✅", title: "This Week's To-Do List", detail: "Set and confirm every department's deliverables for the week. Clear ownership, clear deadline." },
  { time: "35:00–45:00", icon: "🔭", title: "Next Week Preview",      detail: "Brief preview of what's coming next week so departments can prepare in advance." },
  { time: "45:00–55:00", icon: "🎙️", title: "Research Presentation",  detail: "Assigned staff presents their weekly topic: what it is, how it benefits HAMZURY, time/cost savings, implementation plan + budget. If adopted → presenter becomes project lead." },
  { time: "55:00–60:00", icon: "📣", title: "Dept Updates + Closes",  detail: "Each dept head: 1-minute update. Staff of the Week announced. Content engagement check. Any queries/discipline if needed." },
];

const RESEARCH_STAFF = [
  "Idris Ibrahim (CEO)", "Abdullahi Musa (BizDoc)", "Yusuf Haruna (Compliance)",
  "Khadija Saad (BizDev)", "Farida Munir (BizDev)", "Maryam Ashir Lalo (CSO)",
  "Abubakar Sadiq (Finance)", "Sulaiman Hikma (Media)",
  "Abdulmalik Musa (Skills)", "Dajot (Tech)", "Lalo (Design)", "Rabilu Musa (Security)",
  "Habeeba", "Pius Emmanuel",
];

function HubMeetingSection() {
  const today = new Date();
  // Get this week's Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekOf = monday.toISOString().split("T")[0];
  const weekLabel = monday.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  const [thisWeekTodos, setThisWeekTodos] = useState<string[]>([""]);
  const [nextWeekTodos, setNextWeekTodos] = useState<string[]>([""]);
  const [researchTopic, setResearchTopic] = useState("");
  const [researchStaff, setResearchStaff] = useState(RESEARCH_STAFF[0]);
  const [researchFormat, setResearchFormat] = useState("Video + Presentation");
  const [staffOfWeek, setStaffOfWeek] = useState("");
  const [staffOfWeekAchievement, setStaffOfWeekAchievement] = useState("");
  const [biWeeklyTopic, setBiWeeklyTopic] = useState("");
  const [biWeeklyCategory, setBiWeeklyCategory] = useState("Sales Techniques");
  const [trainer, setTrainer] = useState("CEO (Idris Ibrahim)");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [savedThisWeek, setSavedThisWeek] = useState(false);

  const suggestionsQuery = trpc.agents.suggestions.useQuery({ department: "ceo" });
  const reviewSuggestion = trpc.agents.reviewSuggestion.useMutation({ onSuccess: () => suggestionsQuery.refetch(), onError: (err: any) => { toast.error(err.message || "Something went wrong"); } });

  const weekQuery = trpc.hubMeeting.get.useQuery({ weekOf }, { onSuccess: (data) => {
    if (!data) return;
    if (data.todoList) { try { setThisWeekTodos(JSON.parse(data.todoList)); } catch {} }
    if (data.nextWeekTodos) { try { setNextWeekTodos(JSON.parse(data.nextWeekTodos)); } catch {} }
    if (data.researchTopic) setResearchTopic(data.researchTopic);
    if (data.researchAssignedTo) setResearchStaff(data.researchAssignedTo);
    if (data.researchFormat) setResearchFormat(data.researchFormat);
    if (data.staffOfWeek) setStaffOfWeek(data.staffOfWeek);
    if (data.staffOfWeekAchievement) setStaffOfWeekAchievement(data.staffOfWeekAchievement);
    if (data.trainingTopic) setBiWeeklyTopic(data.trainingTopic);
    if (data.trainingCategory) setBiWeeklyCategory(data.trainingCategory);
    if (data.trainer) setTrainer(data.trainer);
  }});
  const historyQuery = trpc.hubMeeting.history.useQuery({ limit: 8 });
  const saveMutation = trpc.hubMeeting.save.useMutation({
    onSuccess: () => { setSavedThisWeek(true); toast.success("Meeting plan saved to database"); },
    onError: () => toast.error("Failed to save — check connection"),
  });

  function addTodo(which: "this" | "next") {
    if (which === "this") setThisWeekTodos(p => [...p, ""]);
    else setNextWeekTodos(p => [...p, ""]);
  }
  function updateTodo(which: "this" | "next", i: number, val: string) {
    if (which === "this") setThisWeekTodos(p => p.map((t, idx) => idx === i ? val : t));
    else setNextWeekTodos(p => p.map((t, idx) => idx === i ? val : t));
  }
  function removeTodo(which: "this" | "next", i: number) {
    if (which === "this") setThisWeekTodos(p => p.filter((_, idx) => idx !== i));
    else setNextWeekTodos(p => p.filter((_, idx) => idx !== i));
  }
  function handleSave() {
    saveMutation.mutate({
      weekOf,
      researchTopic,
      researchAssignedTo: researchStaff,
      researchFormat,
      staffOfWeek,
      staffOfWeekAchievement,
      trainingTopic: biWeeklyTopic,
      trainingCategory: biWeeklyCategory,
      trainer,
      todoList: JSON.stringify(thisWeekTodos.filter(t => t.trim())),
      nextWeekTodos: JSON.stringify(nextWeekTodos.filter(t => t.trim())),
    });
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Weekly Hub Meeting</h2>
        <p className="text-[12px] opacity-50 mt-0.5" style={{ color: GREEN }}>Week of {weekLabel} · Standing agenda — every week, same structure</p>
      </div>

      {/* AI Agent Suggestions */}
      <AgentSuggestionCard
        suggestions={suggestionsQuery.data || []}
        onAccept={(id) => reviewSuggestion.mutate({ id, action: "accept" })}
        onReject={(id) => reviewSuggestion.mutate({ id, action: "reject" })}
        isLoading={suggestionsQuery.isLoading}
      />

      {/* Standing Agenda */}
      <div>
        <p className="text-[11px] uppercase tracking-widest opacity-40 mb-3" style={{ color: GREEN }}>Standing Agenda (60 minutes)</p>
        <div className="space-y-2">
          {STANDING_AGENDA.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                <span className="text-[18px] shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: GREEN }}>{item.title}</p>
                  <p className="text-[10px] opacity-40 font-mono" style={{ color: GREEN }}>{item.time}</p>
                </div>
                {expanded === i ? <ChevronUp size={14} className="opacity-30 shrink-0" /> : <ChevronDown size={14} className="opacity-30 shrink-0" />}
              </button>
              {expanded === i && (
                <div className="px-4 pb-4 pt-0 text-[12px] opacity-60 border-t" style={{ borderColor: `${GREEN}06`, color: GREEN }}>
                  {item.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Research Topic This Week */}
      <div className="bg-white rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-1">
          <Mic size={15} style={{ color: GOLD }} />
          <p className="text-[13px] font-semibold" style={{ color: GREEN }}>This Week's Research Assignment</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Topic</label>
            <input value={researchTopic} onChange={e => setResearchTopic(e.target.value)}
              placeholder="e.g. Notion AI for project management, Canva AI features, WhatsApp Business API…"
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: `${GREEN}20` }} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Assigned To</label>
            <select value={researchStaff} onChange={e => setResearchStaff(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none bg-white"
              style={{ borderColor: `${GREEN}20` }}>
              {RESEARCH_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Format</label>
            <select value={researchFormat} onChange={e => setResearchFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none bg-white"
              style={{ borderColor: `${GREEN}20` }}>
              <option>Video + Presentation</option>
              <option>Live Demo</option>
              <option>Slide Deck</option>
              <option>Discussion-led</option>
            </select>
          </div>
        </div>
        <div className="text-[11px] px-3 py-2 rounded-xl" style={{ backgroundColor: `${GOLD}12`, color: GREEN }}>
          If adopted: <strong>{researchStaff.split(" (")[0]}</strong> becomes Project Lead — presents implementation plan + budget at next week's meeting.
        </div>
      </div>

      {/* Bi-weekly Training */}
      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={15} style={{ color: GOLD }} />
          <p className="text-[13px] font-semibold" style={{ color: GREEN }}>Bi-Weekly Training (30 min — every 2 weeks)</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Training Topic</label>
            <input value={biWeeklyTopic} onChange={e => setBiWeeklyTopic(e.target.value)}
              placeholder="e.g. Cold outreach script, Using tRPC dashboard, LinkedIn prospecting…"
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: `${GREEN}20` }} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Category</label>
            <select value={biWeeklyCategory} onChange={e => setBiWeeklyCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none bg-white"
              style={{ borderColor: `${GREEN}20` }}>
              <option>Sales Techniques</option>
              <option>Software / Tool Training</option>
              <option>Client Management</option>
              <option>Brand Ambassador</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Trainer</label>
            <select value={trainer} onChange={e => setTrainer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none bg-white"
              style={{ borderColor: `${GREEN}20` }}>
              {["CEO (Idris Ibrahim)", "Muhammad Hamzury (Founder)", ...RESEARCH_STAFF.slice(0, 5)].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff of the Week */}
      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2 mb-1">
          <Star size={15} style={{ color: GOLD }} />
          <p className="text-[13px] font-semibold" style={{ color: GREEN }}>Staff of the Week — Best Sale</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Staff Member</label>
            <select value={staffOfWeek} onChange={e => setStaffOfWeek(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none bg-white"
              style={{ borderColor: `${GREEN}20` }}>
              <option value="">— Select —</option>
              {RESEARCH_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider opacity-40 block mb-1" style={{ color: GREEN }}>Sale / Achievement</label>
            <input value={staffOfWeekAchievement} onChange={e => setStaffOfWeekAchievement(e.target.value)}
              placeholder="e.g. Closed Tilz Spa ₦500k, 3 new leads converted…"
              className="w-full px-3 py-2 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: `${GREEN}20` }} />
          </div>
        </div>
        {staffOfWeek && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: `${GOLD}12` }}>
            <Star size={16} style={{ color: GOLD }} />
            <p className="text-[13px] font-semibold" style={{ color: GREEN }}>🏆 Staff of the Week: {staffOfWeek.split(" (")[0]}</p>
          </div>
        )}
      </div>

      {/* This Week's To-Do List */}
      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold" style={{ color: GREEN }}>✅ This Week's To-Do List</p>
          <button onClick={() => addTodo("this")} className="text-[11px] px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: `${GREEN}12`, color: GREEN }}>
            <Plus size={11} className="inline mr-1" />Add
          </button>
        </div>
        <div className="space-y-2">
          {thisWeekTodos.map((todo, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-[11px] opacity-30 font-mono w-5 text-right shrink-0" style={{ color: GREEN }}>{i + 1}.</span>
              <input value={todo} onChange={e => updateTodo("this", i, e.target.value)}
                placeholder={`To-do item ${i + 1}…`}
                className="flex-1 px-3 py-2 rounded-xl border text-[13px] outline-none"
                style={{ borderColor: `${GREEN}15` }} />
              {thisWeekTodos.length > 1 && (
                <button onClick={() => removeTodo("this", i)} className="opacity-30 hover:opacity-60">
                  <Trash2 size={13} style={{ color: GREEN }} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Week's To-Do List */}
      <div className="bg-white rounded-2xl p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold" style={{ color: GREEN }}>🔭 Next Week Preview</p>
          <button onClick={() => addTodo("next")} className="text-[11px] px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: `${GREEN}12`, color: GREEN }}>
            <Plus size={11} className="inline mr-1" />Add
          </button>
        </div>
        <div className="space-y-2">
          {nextWeekTodos.map((todo, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-[11px] opacity-30 font-mono w-5 text-right shrink-0" style={{ color: GREEN }}>{i + 1}.</span>
              <input value={todo} onChange={e => updateTodo("next", i, e.target.value)}
                placeholder={`Next week item ${i + 1}…`}
                className="flex-1 px-3 py-2 rounded-xl border text-[13px] outline-none"
                style={{ borderColor: `${GREEN}15` }} />
              {nextWeekTodos.length > 1 && (
                <button onClick={() => removeTodo("next", i)} className="opacity-30 hover:opacity-60">
                  <Trash2 size={13} style={{ color: GREEN }} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ backgroundColor: GREEN, color: GOLD }}>
            {saveMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Save This Week's Plan
          </button>
          {savedThisWeek && <span className="text-xs text-green-600">✓ Saved to database</span>}
        </div>
      </div>

      {/* Policy Reminders */}
      <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: `${GREEN}08`, backgroundColor: `${GREEN}04` }}>
        <p className="text-[12px] font-semibold" style={{ color: GREEN }}>Standing Reminders (check at every meeting)</p>
        <div className="space-y-1.5">
          {[
            "📱 Content engagement check — did all staff like/comment on this week's posts?",
            "🔐 Security check — any credentials shared outside of dept lead / CEO?",
            "📋 Device roll call — all devices accounted for? Any issues?",
            "⏰ Attendance — working hours 8:30am–3:00pm being respected?",
            "📅 Leave requests — any upcoming leave? Replacement confirmed?",
            "💰 Commission check — any staff approaching ₦30k threshold or 2-month deadline?",
          ].map((r, i) => (
            <div key={i} className="flex gap-2 text-[12px]">
              <span className="shrink-0">{r.split(" ")[0]}</span>
              <span className="opacity-50" style={{ color: GREEN }}>{r.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting History */}
      <div>
        <button className="flex items-center gap-2 text-[12px] mb-3 opacity-60" style={{ color: GREEN }}
          onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          Meeting History (last 8 weeks)
        </button>
        {showHistory && (
          <div className="space-y-2">
            {(historyQuery.data || []).map((rec: any) => (
              <div key={rec.id} className="bg-white rounded-2xl px-5 py-4 space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold" style={{ color: GREEN }}>Week of {rec.weekOf}</p>
                  {rec.staffOfWeek && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>
                      🏆 {rec.staffOfWeek.split(" (")[0]}
                    </span>
                  )}
                </div>
                {rec.researchTopic && <p className="text-[11px] opacity-50" style={{ color: GREEN }}>Research: {rec.researchTopic} ({rec.researchAssignedTo})</p>}
                {rec.trainingTopic && <p className="text-[11px] opacity-50" style={{ color: GREEN }}>Training: {rec.trainingTopic}</p>}
                {rec.todoList && (() => { try { const todos = JSON.parse(rec.todoList); return <p className="text-[10px] opacity-30" style={{ color: GREEN }}>{todos.filter(Boolean).length} to-dos recorded</p>; } catch { return null; } })()}
              </div>
            ))}
            {(historyQuery.data || []).length === 0 && (
              <p className="text-[12px] opacity-30 text-center py-4" style={{ color: GREEN }}>No history yet — save your first meeting plan above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Weekly Targets Section ──────────────────────────────────────────────────
const TARGET_TYPES = [
  { value: "client", label: "Client Delivery" },
  { value: "task", label: "Internal Task" },
  { value: "learning", label: "Learning" },
  { value: "content", label: "Content" },
  { value: "custom", label: "Custom" },
];

const TARGET_DEPTS = [
  { value: "bizdoc", label: "BizDoc" },
  { value: "systemise", label: "Systemise" },
  { value: "skills", label: "Skills" },
  { value: "media", label: "Media" },
  { value: "bizdev", label: "BizDev" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  issued: { bg: "#EAB30815", text: "#EAB308" },
  in_progress: { bg: "#3B82F615", text: "#3B82F6" },
  submitted: { bg: "#22C55E15", text: "#22C55E" },
  approved: { bg: `${GOLD}20`, text: GOLD },
  revision_requested: { bg: "#EF444415", text: "#EF4444" },
};

const OUTCOME_COLORS: Record<string, string> = {
  hit: "#22C55E",
  partial: "#EAB308",
  missed: "#EF4444",
};

function WeeklyTargetsSection() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekOf = monday.toISOString().split("T")[0];
  const weekLabel = monday.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

  const [newDept, setNewDept] = useState("");
  const [newType, setNewType] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("Friday 2pm");

  const targetsQuery = trpc.weeklyTargets.list.useQuery({ weekOf }, { refetchInterval: 15000 });
  const statusQuery = trpc.weeklyTargets.submissionStatus.useQuery({ weekOf }, { refetchInterval: 15000 });

  const createMut = trpc.weeklyTargets.create.useMutation({
    onSuccess: () => {
      toast.success("Target issued");
      setNewDept(""); setNewType(""); setNewDesc(""); setNewDeadline("Friday 2pm");
      targetsQuery.refetch();
      statusQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const reviewMut = trpc.weeklyTargets.review.useMutation({
    onSuccess: () => { toast.success("Target reviewed"); targetsQuery.refetch(); statusQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const targets = targetsQuery.data || [];
  const submissionStatus = statusQuery.data || [];

  // Group targets by department
  const grouped: Record<string, typeof targets> = {};
  targets.forEach(t => {
    if (!grouped[t.department]) grouped[t.department] = [];
    grouped[t.department].push(t);
  });

  const handleCreate = () => {
    if (!newDept || !newType || !newDesc.trim()) {
      toast.error("Please fill department, type, and description");
      return;
    }
    createMut.mutate({ weekOf, department: newDept, targetType: newType, description: newDesc.trim(), deadline: newDeadline });
  };

  const handleReview = (id: number, status: "approved" | "revision_requested", outcome?: "hit" | "missed" | "partial") => {
    reviewMut.mutate({ id, status, outcome });
  };

  const deptLabel = (d: string) => TARGET_DEPTS.find(x => x.value === d)?.label || d.charAt(0).toUpperCase() + d.slice(1);
  const typeLabel = (t: string) => TARGET_TYPES.find(x => x.value === t)?.label || t;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Weekly Targets</h2>
        <p className="text-[12px] opacity-50 mt-0.5" style={{ color: GREEN }}>
          Week of {weekLabel} -- Issue targets Monday, staff submit by Friday, review next Monday
        </p>
      </div>

      {/* Submission Status Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] uppercase tracking-widest opacity-40 mb-3" style={{ color: GREEN }}>Submission Status</p>
        <div className="flex flex-wrap gap-3">
          {submissionStatus.map((s: any) => {
            const allSubmitted = s.total > 0 && s.pending === 0;
            return (
              <div key={s.department} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{
                backgroundColor: s.total === 0 ? `${GREEN}06` : allSubmitted ? "#22C55E10" : "#EF444410",
                border: `1px solid ${s.total === 0 ? `${GREEN}08` : allSubmitted ? "#22C55E20" : "#EF444420"}`,
              }}>
                <div className="w-2 h-2 rounded-full" style={{
                  backgroundColor: s.total === 0 ? `${GREEN}30` : allSubmitted ? "#22C55E" : "#EF4444",
                }} />
                <span className="text-[12px] font-medium" style={{ color: GREEN }}>{deptLabel(s.department)}</span>
                <span className="text-[10px] opacity-40" style={{ color: GREEN }}>
                  {s.total === 0 ? "No targets" : `${s.submitted}/${s.total}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue New Target */}
      <div className="bg-white rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[13px] font-semibold" style={{ color: GREEN }}>Issue New Target</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={newDept} onValueChange={setNewDept}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue placeholder="Department *" />
            </SelectTrigger>
            <SelectContent>
              {TARGET_DEPTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue placeholder="Target type *" />
            </SelectTrigger>
            <SelectContent>
              {TARGET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            placeholder="Deadline (e.g. Friday 2pm)"
            value={newDeadline}
            onChange={e => setNewDeadline(e.target.value)}
            className="border-gray-200 bg-gray-50"
          />
        </div>
        <Textarea
          placeholder="Describe the target *"
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          className="border-gray-200 bg-gray-50 min-h-[80px]"
        />
        <Button
          onClick={handleCreate}
          disabled={createMut.isPending}
          style={{ backgroundColor: GREEN, color: GOLD }}
        >
          {createMut.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Target size={14} className="mr-2" />}
          Issue Target
        </Button>
      </div>

      {/* Targets Grouped by Department */}
      <div className="space-y-6">
        <p className="text-[11px] uppercase tracking-widest opacity-40" style={{ color: GREEN }}>
          Current Week Targets ({targets.length})
        </p>

        {targets.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Target size={36} className="mx-auto mb-3 opacity-15" style={{ color: GREEN }} />
            <p className="text-sm opacity-40" style={{ color: GREEN }}>No targets issued this week yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dept, deptTargets]) => (
            <div key={dept}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GOLD }} />
                <p className="text-sm font-medium" style={{ color: GREEN }}>{deptLabel(dept)}</p>
                <span className="text-[10px] opacity-30" style={{ color: GREEN }}>({deptTargets.length} targets)</span>
              </div>
              <div className="space-y-3">
                {deptTargets.map((t: any) => {
                  const sc = STATUS_COLORS[t.status] || STATUS_COLORS.issued;
                  return (
                    <div key={t.id} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ border: `1px solid ${GREEN}08` }}>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Type badge */}
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-normal" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>
                          {typeLabel(t.targetType)}
                        </span>
                        {/* Status badge */}
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-normal" style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {t.status.replace(/_/g, " ")}
                        </span>
                        {/* Outcome badge */}
                        {t.outcome && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-normal" style={{ backgroundColor: `${OUTCOME_COLORS[t.outcome]}15`, color: OUTCOME_COLORS[t.outcome] }}>
                            {t.outcome}
                          </span>
                        )}
                        {/* Deadline */}
                        <span className="text-[10px] opacity-30 ml-auto" style={{ color: GREEN }}>
                          Due: {t.deadline}
                        </span>
                      </div>
                      <p className="text-sm font-normal mb-1" style={{ color: GREEN }}>{t.description}</p>

                      {/* Submission note */}
                      {t.submissionNote && (
                        <div className="mt-3 px-3 py-2 rounded-xl text-[12px]" style={{ backgroundColor: `${GREEN}04`, color: GREEN }}>
                          <span className="font-medium">Submission:</span> {t.submissionNote}
                        </div>
                      )}

                      {/* Review note */}
                      {t.reviewNote && (
                        <div className="mt-2 px-3 py-2 rounded-xl text-[12px]" style={{ backgroundColor: `${GOLD}10`, color: GREEN }}>
                          <span className="font-medium">CEO Review:</span> {t.reviewNote}
                        </div>
                      )}

                      {/* Review actions — only for submitted targets */}
                      {t.status === "submitted" && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="text-xs"
                            style={{ backgroundColor: "#22C55E", color: "white" }}
                            disabled={reviewMut.isPending}
                            onClick={() => handleReview(t.id, "approved", "hit")}
                          >
                            <CheckCircle2 size={12} className="mr-1" /> Approve (Hit)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: `${GOLD}40`, color: GOLD }}
                            disabled={reviewMut.isPending}
                            onClick={() => handleReview(t.id, "approved", "partial")}
                          >
                            Approve (Partial)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: "#EF444440", color: "#EF4444" }}
                            disabled={reviewMut.isPending}
                            onClick={() => handleReview(t.id, "revision_requested")}
                          >
                            Request Revision
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
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
          <div key={title} className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
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

// ─── Phase 2 Targets (CSO/BizDev/Finance/Media etc.) ─────────────────────────
const PHASE2_ASSIGNEE_ROLES = [
  { value: "cso", label: "CSO" },
  { value: "bizdev", label: "BizDev" },
  { value: "bizdoc", label: "BizDoc" },
  { value: "systemise", label: "Systemise" },
  { value: "skills", label: "Skills" },
  { value: "finance", label: "Finance" },
  { value: "media", label: "Media" },
];

const PHASE2_METRICS = [
  { value: "leads_qualified", label: "Leads Qualified" },
  { value: "proposals_sent", label: "Proposals Sent" },
  { value: "clients_onboarded", label: "Clients Onboarded" },
  { value: "revenue_closed", label: "Revenue Closed (₦)" },
  { value: "custom", label: "Custom" },
];

const PHASE2_PERIODS = [
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

function computePeriodRange(period: "month" | "quarter" | "year") {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let start: Date, end: Date;
  if (period === "month") {
    start = new Date(y, m, 1);
    end = new Date(y, m + 1, 0);
  } else if (period === "quarter") {
    const qStart = Math.floor(m / 3) * 3;
    start = new Date(y, qStart, 1);
    end = new Date(y, qStart + 3, 0);
  } else {
    start = new Date(y, 0, 1);
    end = new Date(y, 11, 31);
  }
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: end.toISOString().slice(0, 10),
  };
}

function Phase2TargetsPanel() {
  const [assignedTo, setAssignedTo] = useState("cso");
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [metric, setMetric] = useState<"leads_qualified" | "proposals_sent" | "clients_onboarded" | "revenue_closed" | "custom">("clients_onboarded");
  const [targetValue, setTargetValue] = useState("");
  const [notes, setNotes] = useState("");
  const [viewRole, setViewRole] = useState("cso");

  const listQuery = trpc.targets.listForRole.useQuery(
    { role: viewRole, period: "current" },
    { refetchInterval: 20000 }
  );

  const createMut = trpc.targets.create.useMutation({
    onSuccess: () => {
      toast.success("Target assigned");
      setTargetValue("");
      setNotes("");
      listQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMut = trpc.targets.cancel.useMutation({
    onSuccess: () => { toast.success("Target cancelled"); listQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    const n = Number(targetValue);
    if (!targetValue || Number.isNaN(n) || n < 0) {
      toast.error("Enter a valid target value");
      return;
    }
    const { periodStart, periodEnd } = computePeriodRange(period);
    createMut.mutate({
      assignedTo,
      period,
      periodStart,
      periodEnd,
      metric,
      targetValue: n,
      notes: notes.trim() || undefined,
    });
  };

  const list = listQuery.data || [];

  const metricLabel = (m: string) => PHASE2_METRICS.find(x => x.value === m)?.label || m;
  const roleLabel = (r: string) => PHASE2_ASSIGNEE_ROLES.find(x => x.value === r)?.label || r;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>
          Set Target (Phase 2)
        </h2>
        <p className="text-xs opacity-40 mt-1" style={{ color: GREEN }}>
          Assign role-level KPI targets with automatic progress tracking.
        </p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-1" style={{ color: GREEN }}>Assign To</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASE2_ASSIGNEE_ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-1" style={{ color: GREEN }}>Metric</label>
            <Select value={metric} onValueChange={(v) => setMetric(v as typeof metric)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASE2_METRICS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-1" style={{ color: GREEN }}>Period</label>
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PHASE2_PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-1" style={{ color: GREEN }}>Target Value</label>
            <Input
              type="number"
              min={0}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={metric === "revenue_closed" ? "e.g. 5000000" : "e.g. 10"}
              className="text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest opacity-40 block mb-1" style={{ color: GREEN }}>Notes (optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context, stretch rationale, or guidance…"
            className="text-sm min-h-[60px]"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={createMut.isPending}
          style={{ backgroundColor: GREEN, color: GOLD }}
        >
          {createMut.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Target size={14} className="mr-2" />}
          Assign Target
        </Button>
      </div>

      {/* Current targets list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] uppercase tracking-widest opacity-40" style={{ color: GREEN }}>
            Current Targets — {roleLabel(viewRole)}
          </p>
          <Select value={viewRole} onValueChange={setViewRole}>
            <SelectTrigger className="text-xs w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PHASE2_ASSIGNEE_ROLES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Target size={36} className="mx-auto mb-3 opacity-15" style={{ color: GREEN }} />
            <p className="text-sm opacity-40" style={{ color: GREEN }}>No active targets for this role</p>
          </div>
        ) : (
          list.map((t: any) => {
            const target = Number(t.targetValue) || 0;
            const actual = Number(t.actualValue) || 0;
            const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
            const barColor = pct >= 100 ? "#22C55E" : pct >= 60 ? GOLD : pct >= 30 ? "#EAB308" : "#EF4444";
            return (
              <div key={t.id} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ border: `1px solid ${GREEN}08` }}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>
                        {metricLabel(t.metric)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GREEN}10`, color: GREEN }}>
                        {t.period}
                      </span>
                      <span className="text-[10px] opacity-40" style={{ color: GREEN }}>
                        {t.periodStart} → {t.periodEnd}
                      </span>
                    </div>
                    {t.notes && (
                      <p className="text-xs opacity-60 mt-1" style={{ color: GREEN }}>{t.notes}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: "#EF444440", color: "#EF4444" }}
                    onClick={() => {
                      if (confirm("Cancel this target?")) cancelMut.mutate({ id: t.id });
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: GREEN }}>
                  <span>
                    {t.metric === "revenue_closed"
                      ? `₦${actual.toLocaleString("en-NG")} / ₦${target.toLocaleString("en-NG")}`
                      : `${actual.toLocaleString("en-NG")} / ${target.toLocaleString("en-NG")}`}
                  </span>
                  <span className="font-medium" style={{ color: barColor }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${GREEN}10` }}>
                  <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
