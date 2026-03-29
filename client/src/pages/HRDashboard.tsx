import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { FINANCE_SUMMARY, formatNaira } from "@/lib/dashboardStore";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutDashboard, Users, CalendarCheck, ClipboardCheck,
  UserPlus, GraduationCap, DollarSign, BarChart2,
  UserCog, LogOut, ArrowLeft, Loader2, TrendingUp,
  CheckCircle2, Clock, Briefcase, AlertTriangle,
  ChevronRight, Search, Download, FileText, Monitor, Send, Plus,
  ShieldCheck, BookOpen, Plane, Gavel, X, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Brand (HR = general → Apple grey) ───────────────────────────────────────
const GREEN = "#86868B";   // Apple grey — general departments
const GOLD  = "#C9A97E";
const MILK  = "#FAFAF8";   // Milk white

type Section = "overview" | "staff" | "attendance" | "performance" | "hiring" | "itstudents" | "training" | "leaves" | "discipline" | "commissions" | "policy" | "reports";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STAFF = [
  { id: "STF-001", name: "Idris Ibrahim",    role: "CEO",           dept: "CEO",       status: "Active",   hireDate: "2024-01-15" },
  { id: "STF-002", name: "Amena Sule",       role: "CSO Lead",      dept: "CSO",       status: "Active",   hireDate: "2024-03-01" },
  { id: "STF-003", name: "Emeka Okafor",     role: "BizDoc Lead",   dept: "BizDoc",    status: "Active",   hireDate: "2024-06-10" },
  { id: "STF-004", name: "Yusuf Danlami",    role: "Developer",     dept: "Systemise", status: "On Leave", hireDate: "2024-08-20" },
  { id: "STF-005", name: "Ngozi Chukwu",     role: "Skills Admin",  dept: "Skills",    status: "Active",   hireDate: "2024-09-05" },
  { id: "STF-006", name: "Kemi Adeyemi",     role: "BizDev Lead",   dept: "BizDev",    status: "Active",   hireDate: "2024-11-12" },
  { id: "STF-007", name: "Fatima Al-Hassan", role: "Finance Lead",  dept: "Finance",   status: "Active",   hireDate: "2025-01-08" },
  { id: "STF-008", name: "Aliyu Musa",       role: "RIDI Coord.",   dept: "RIDI",      status: "Active",   hireDate: "2025-03-20" },
];

const MOCK_ATTENDANCE = [
  { name: "Amena Sule",       dept: "CSO",       checkIn: "08:58", checkOut: null,    status: "Present"  },
  { name: "Yusuf Danlami",    dept: "Systemise", checkIn: "09:15", checkOut: null,    status: "Late"     },
  { name: "Fatima Al-Hassan", dept: "Finance",   checkIn: null,    checkOut: null,    status: "On Leave" },
  { name: "Emeka Okafor",     dept: "BizDoc",    checkIn: "08:45", checkOut: "17:00", status: "Present"  },
  { name: "Ngozi Chukwu",     dept: "Skills",    checkIn: "09:05", checkOut: null,    status: "Present"  },
];

const MOCK_LEAVE = [
  { id: "LVE-001", staff: "Yusuf Danlami",    type: "Annual",        start: "2026-04-01", end: "2026-04-05", status: "Pending"  },
  { id: "LVE-002", staff: "Fatima Al-Hassan", type: "Sick",          start: "2026-03-28", end: "2026-03-28", status: "Approved" },
  { id: "LVE-003", staff: "Aliyu Musa",       type: "Compassionate", start: "2026-04-10", end: "2026-04-11", status: "Pending"  },
];

const CYCLES = [
  { cycle: "Q1 2026", period: "Jan – Mar", status: "Completed", total: 24, completed: 24, pending: 0  },
  { cycle: "Q2 2026", period: "Apr – Jun", status: "Active",    total: 24, completed: 8,  pending: 16 },
  { cycle: "Q3 2026", period: "Jul – Sep", status: "Upcoming",  total: 24, completed: 0,  pending: 24 },
];

const MOCK_JOBS = [
  { id: "JOB-001", title: "CSO Assistant",     dept: "CSO",       status: "Open",    apps: 12, posted: "2026-03-15" },
  { id: "JOB-002", title: "Frontend Developer", dept: "Systemise", status: "Open",    apps: 8,  posted: "2026-03-20" },
  { id: "JOB-003", title: "BizDoc Consultant",  dept: "BizDoc",    status: "On Hold", apps: 3,  posted: "2026-03-10" },
];

const MOCK_APPS = [
  { id: "APP-001", job: "CSO Assistant",      candidate: "John Adewale", status: "Interviewed", score: "4/5", date: "2026-03-25" },
  { id: "APP-002", job: "CSO Assistant",      candidate: "Jane Obi",     status: "Offer Sent",  score: "5/5", date: null         },
  { id: "APP-003", job: "Frontend Developer", candidate: "Tunde Salami", status: "Shortlisted", score: null,  date: "2026-03-28" },
  { id: "APP-004", job: "BizDoc Consultant",  candidate: "Chioma Eze",   status: "Received",    score: null,  date: null         },
];

const MOCK_SESSIONS = [
  { id: "TRN-001", title: "Onboarding Program",     type: "Internal", date: "2026-04-01", participants: 5, status: "Scheduled" },
  { id: "TRN-002", title: "Leadership Development",  type: "External", date: "2026-04-15", participants: 3, status: "Completed" },
  { id: "TRN-003", title: "Compliance Training",     type: "Internal", date: "2026-04-22", participants: 8, status: "Scheduled" },
];

const MOCK_PLANS = [
  { staff: "Amena Sule",    goal: "CSO Lead Certification", targetDate: "2026-12-31", progress: 60, support: "Mentorship"     },
  { staff: "Yusuf Danlami", goal: "Senior Developer Track",  targetDate: "2026-09-30", progress: 40, support: "Training Budget" },
];

const DEPT_DIST = [
  { dept: "BizDoc",    count: 0, color: "#1B4D3E" },
  { dept: "Systemise", count: 0, color: "#0A1F1C" },
  { dept: "CSO",       count: 0, color: "#0A1F1C" },
  { dept: "Skills",    count: 0, color: "#8B6914" },
  { dept: "BizDev",    count: 0, color: "#34A853" },
  { dept: "RIDI",      count: 0, color: "#C9A97E" },
  { dept: "Finance",   count: 0, color: "#7B4F00" },
  { dept: "HR",        count: 0, color: "#2D5A27" },
];

const RECENT_ACTIVITY = [
  "New staff onboarded — Amena Sule (CSO)",
  "Leave approved — Yusuf Danlami (Systemise)",
  "Performance review completed — Q1 2026",
  "Interview scheduled — Frontend Developer role",
  "Training session logged — Leadership Development",
];

const REPORTS_LIST = [
  { title: "Headcount Report",           period: "Monthly",   format: "PDF/CSV" },
  { title: "Attendance Summary",         period: "Monthly",   format: "PDF/CSV" },
  { title: "Performance Review Summary", period: "Quarterly", format: "PDF/CSV" },
  { title: "Hiring Pipeline Report",     period: "Monthly",   format: "PDF/CSV" },
  { title: "Training Completion Report", period: "Quarterly", format: "PDF/CSV" },
  { title: "Turnover Analysis",          period: "Quarterly", format: "PDF/CSV" },
];

const KPIS = [
  { label: "Time to Hire",         target: "<30 days",  value: 75 },
  { label: "Training Completion",  target: "90%+",      value: 90 },
  { label: "Review Completion",    target: "100%",      value: 100 },
  { label: "Leave Utilization",    target: "60–80%",    value: 65 },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HRDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const statsQuery       = trpc.institutional.stats.useQuery(undefined, { refetchInterval: 30000 });
  const activityQuery    = trpc.activity.recent.useQuery({ limit: 10 });
  const staffQuery       = trpc.staff.listInternal.useQuery(undefined, { refetchInterval: 60000 });
  const joinAppsQuery    = trpc.systemise.joinApplications.useQuery(undefined, { refetchInterval: 30000 });
  const today            = new Date().toISOString().split("T")[0];
  const attendanceQuery  = trpc.attendance.byDate.useQuery({ date: today }, { refetchInterval: 30000 });
  const leaveQuery       = trpc.leave.list.useQuery({});
  const disciplineQuery  = trpc.discipline.list.useQuery({});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const stats           = statsQuery.data;
  const activity        = activityQuery.data || [];
  const realStaff       = staffQuery.data || [];
  const joinApps        = joinAppsQuery.data || [];
  const todayAttendance = attendanceQuery.data || [];
  const leaveRequests   = leaveQuery.data || [];
  const disciplineLogs  = disciplineQuery.data || [];

  // Use real staff from DB — no mock fallback
  const staffList = realStaff;

  // Build today's attendance from real data only
  const attendanceList = todayAttendance.map((a: any) => ({
    name: a.userName || `User #${a.userId}`,
    dept: a.department || "—",
    checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : null,
    checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : null,
    status: a.status || "Present",
  }));

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview",     icon: LayoutDashboard, label: "Overview"        },
    { key: "staff",        icon: Users,           label: "Staff Directory" },
    { key: "attendance",   icon: CalendarCheck,   label: "Attendance"      },
    { key: "performance",  icon: ClipboardCheck,  label: "Performance"     },
    { key: "hiring",       icon: UserPlus,        label: "Hiring Pipeline" },
    { key: "itstudents",   icon: Monitor,         label: "IT Students"     },
    { key: "training",     icon: GraduationCap,   label: "Training Log"    },
    { key: "leaves",       icon: Plane,           label: "Leave Requests"  },
    { key: "discipline",   icon: Gavel,           label: "Discipline Log"  },
    { key: "policy",       icon: BookOpen,        label: "HR Policy"       },
    { key: "commissions",  icon: DollarSign,      label: "Commissions"     },
    { key: "reports",      icon: BarChart2,       label: "Reports"         },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="HR Dashboard — HAMZURY" description="Human resources and staff management for HAMZURY." />
      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: GREEN }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${GOLD}20` }}>
          <UserCog size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: GOLD }}>HR Dashboard</span>
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
            <h1 className="text-base font-medium" style={{ color: GREEN }}>
              {sidebarItems.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs opacity-40" style={{ color: GREEN }}>{user.name || "HR Lead"}</p>
          </div>
          <div className="flex items-center gap-3">
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {activeSection === "overview"    && <OverviewSection stats={stats} activity={activity} staffList={staffList} />}
            {activeSection === "staff"       && <StaffSection staffList={staffList} />}
            {activeSection === "attendance"  && <AttendanceSection attendanceList={attendanceList} />}
            {activeSection === "performance" && <PerformanceSection />}
            {activeSection === "hiring"      && <HiringSection joinApps={joinApps} />}
            {activeSection === "itstudents"  && <ITStudentsSection />}
            {activeSection === "training"    && <TrainingSection />}
            {activeSection === "leaves"      && <LeaveSection leaveRequests={leaveRequests} refetch={leaveQuery.refetch} />}
            {activeSection === "discipline"  && <DisciplineSection disciplineLogs={disciplineLogs} staffList={staffList} refetch={disciplineQuery.refetch} />}
            {activeSection === "policy"      && <HRPolicySection />}
            {activeSection === "commissions" && <CommissionsSection staffList={staffList} />}
            {activeSection === "reports"     && <ReportsSection />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({ stats, activity, staffList }: { stats: any; activity: any[]; staffList: typeof MOCK_STAFF }) {
  const totalStaff = stats?.totalStaff ?? 0;
  const STAT_CARDS = [
    { label: "Total Staff",       value: totalStaff,  icon: Users,         color: GREEN   },
    { label: "Present Today",     value: stats?.presentToday ?? 0, icon: CheckCircle2,  color: "#22C55E" },
    { label: "On Leave",          value: stats?.onLeave ?? 0,      icon: Clock,         color: "#EAB308" },
    { label: "Open Positions",    value: 0,           icon: Briefcase,     color: "#3B82F6"            },
    { label: "Reviews Due",       value: 0,           icon: AlertTriangle, color: "#EF4444"            },
    { label: "Commission Earned", value: "₦0",        icon: DollarSign,    color: GOLD, isText: true   },
  ];

  const maxCount = Math.max(...DEPT_DIST.map(d => d.count));

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

      {/* Department distribution */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Department Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEPT_DIST.map(d => (
            <div key={d.dept} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${GREEN}08` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <p className="text-sm font-medium" style={{ color: GREEN }}>{d.dept}</p>
              </div>
              <p className="text-2xl font-normal mb-0.5" style={{ color: GREEN }}>{d.count}</p>
              <p className="text-xs opacity-40" style={{ color: GREEN }}>staff members</p>
              <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(d.count / maxCount) * 100}%`, backgroundColor: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
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

// ─── Staff Section ────────────────────────────────────────────────────────────
function StaffSection({ staffList }: { staffList: typeof MOCK_STAFF }) {
  const [search, setSearch] = useState("");

  const filtered = staffList.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === "Active")   return { bg: "#22C55E15", text: "#22C55E" };
    if (status === "On Leave") return { bg: "#EAB30815", text: "#EAB308" };
    return { bg: "#EF444415", text: "#EF4444" };
  };

  const deptColor = (dept: string) => {
    const map: Record<string, string> = {
      CEO: "#0A1F1C", CSO: "#0A1F1C", BizDoc: "#1B4D3E", Systemise: "#0A1F1C",
      Skills: "#8B6914", BizDev: "#34A853", Finance: "#7B4F00", RIDI: "#C9A97E", HR: "#2D5A27",
    };
    return map[dept] ?? GREEN;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: GREEN }} />
          <Input
            placeholder="Search by name, ID or department…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-gray-200 bg-gray-50"
          />
        </div>
        <p className="text-xs opacity-40" style={{ color: GREEN }}>{filtered.length} staff</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${GREEN}08` }}>
        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-[100px_1fr_160px_120px_120px_100px] gap-4 px-5 py-3 border-b" style={{ borderColor: `${GREEN}06`, backgroundColor: `${GREEN}04` }}>
          {["ID", "Name / Role", "Department", "Hire Date", "Status", ""].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>{h}</p>
          ))}
        </div>

        {filtered.map((s, i) => {
          const sc = statusColor(s.status);
          const dc = deptColor(s.dept);
          return (
            <div
              key={s.id}
              className="grid grid-cols-1 md:grid-cols-[100px_1fr_160px_120px_120px_100px] gap-4 px-5 py-4 border-b last:border-0 items-center"
              style={{ borderColor: `${GREEN}06`, backgroundColor: i % 2 === 0 ? "white" : `${GREEN}02` }}
            >
              <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${GREEN}08`, color: GREEN }}>{s.id}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: GREEN }}>{s.name}</p>
                <p className="text-xs opacity-50" style={{ color: GREEN }}>{s.role}</p>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal w-fit" style={{ backgroundColor: `${dc}15`, color: dc }}>{s.dept}</span>
              <p className="text-xs opacity-60" style={{ color: GREEN }}>{s.hireDate}</p>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal w-fit" style={{ backgroundColor: sc.bg, color: sc.text }}>{s.status}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 w-fit"
                style={{ color: GREEN }}
                onClick={() => toast(`Viewing profile: ${s.name}`)}
              >
                View <ChevronRight size={12} className="ml-1" />
              </Button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm opacity-40" style={{ color: GREEN }}>No staff matched your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attendance Section ───────────────────────────────────────────────────────
type AttendanceRow = { name: string; dept: string; checkIn: string | null; checkOut: string | null; status: string };
function AttendanceSection({ attendanceList }: { attendanceList: AttendanceRow[] }) {
  const [tab, setTab] = useState<"today" | "leave">("today");

  const attendanceStatusColor = (status: string) => {
    if (status === "Present")  return { bg: "#22C55E15", text: "#22C55E" };
    if (status === "Late")     return { bg: "#EAB30815", text: "#EAB308" };
    if (status === "On Leave") return { bg: "#3B82F615", text: "#3B82F6" };
    return { bg: "#EF444415", text: "#EF4444" };
  };

  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-xs opacity-40" style={{ color: GREEN }}>{today}</p>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: `${GREEN}15` }}>
          {(["today", "leave"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-xs font-normal transition-all"
              style={{
                backgroundColor: tab === t ? GREEN : "white",
                color: tab === t ? GOLD : GREEN,
              }}
            >
              {t === "today" ? "Today" : "Leave Requests"}
            </button>
          ))}
        </div>
      </div>

      {tab === "today" && (
        <div className="space-y-3">
          {attendanceList.map((a, i) => {
            const sc = attendanceStatusColor(a.status);
            return (
              <div key={i} className="bg-white rounded-2xl border p-4 flex items-center gap-4" style={{ borderColor: `${GREEN}08` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${GREEN}08` }}>
                  <CalendarCheck size={16} style={{ color: GREEN }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: GREEN }}>{a.name}</p>
                  <p className="text-xs opacity-50" style={{ color: GREEN }}>{a.dept}</p>
                </div>
                <div className="text-right text-xs opacity-50 hidden sm:block" style={{ color: GREEN }}>
                  {a.checkIn ? `In: ${a.checkIn}` : "—"}{a.checkOut ? ` · Out: ${a.checkOut}` : ""}
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab === "leave" && (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${GREEN}08` }}>
          <p className="text-sm opacity-30" style={{ color: GREEN }}>No leave requests yet.</p>
        </div>
      )}
    </div>
  );
}

// ─── Performance Section ──────────────────────────────────────────────────────
const PERF_SOP = {
  "Pre-Task": [
    "Review period confirmed",
    "Self-assessment form sent to staff member",
    "Department Lead assessment form sent",
  ],
  "During Task": [
    "Self-assessment received",
    "Lead assessment received",
    "Review meeting held",
    "Scores recorded",
  ],
  "Post-Task": [
    "Review summary document prepared",
    "Action plan agreed",
    "Record updated in system",
  ],
};

function PerformanceSection() {
  const totalItems = Object.values(PERF_SOP).flat().length;
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.values(PERF_SOP).flat().map(item => [item, false]))
  );

  const toggle = (item: string) => setChecked(p => ({ ...p, [item]: !p[item] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  const cycleStatusColor = (status: string) => {
    if (status === "Completed") return { bg: "#22C55E15", text: "#22C55E" };
    if (status === "Active")    return { bg: "#3B82F615", text: "#3B82F6" };
    return { bg: "#6B728015", text: "#6B7280" };
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Review Cycles */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Review Cycles</h2>
        <div className="space-y-3">
          {CYCLES.map(c => {
            const sc = cycleStatusColor(c.status);
            const pct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
            return (
              <div key={c.cycle} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${GREEN}08` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: GREEN }}>{c.cycle}</p>
                      <p className="text-xs opacity-40" style={{ color: GREEN }}>{c.period}</p>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal" style={{ backgroundColor: sc.bg, color: sc.text }}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs opacity-50" style={{ color: GREEN }}>{c.completed}/{c.total} completed</p>
                    <Button
                      size="sm"
                      variant={c.status === "Completed" ? "outline" : "default"}
                      className="text-xs h-8"
                      style={c.status === "Completed"
                        ? { borderColor: `${GREEN}20`, color: GREEN }
                        : { backgroundColor: GREEN, color: GOLD }}
                      onClick={() => toast(`${c.cycle} review ${c.status === "Upcoming" ? "started" : "opened"}`)}
                    >
                      {c.status === "Upcoming" ? "Start Review" : "View"}
                    </Button>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#22C55E" : GREEN }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SOP Checklist */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>SOP Checklist</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${GREEN}10`, color: GREEN }}>{doneCount}/{totalItems} done</span>
        </div>
        <div className="space-y-6">
          {Object.entries(PERF_SOP).map(([phase, items]) => (
            <div key={phase}>
              <p className="text-xs font-medium uppercase tracking-wider mb-3 opacity-60" style={{ color: GREEN }}>{phase}</p>
              <div className="space-y-2">
                {items.map(item => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: checked[item] ? GREEN : `${GREEN}30`, backgroundColor: checked[item] ? GREEN : "transparent" }}
                      onClick={() => toggle(item)}
                    >
                      {checked[item] && <CheckCircle2 size={10} style={{ color: GOLD }} />}
                    </div>
                    <span
                      className="text-sm font-normal transition-all"
                      style={{ color: GREEN, opacity: checked[item] ? 0.4 : 0.8, textDecoration: checked[item] ? "line-through" : "none" }}
                      onClick={() => toggle(item)}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Hiring Section ───────────────────────────────────────────────────────────
const HIRING_SOP = {
  "Pre-Interview": [
    "Job description approved",
    "Role posted on approved channels",
    "Applications acknowledged within 48 hrs",
  ],
  "Interview Process": [
    "Initial screening completed",
    "Technical / skill assessment done",
    "Panel interview held",
    "Reference checks completed",
  ],
  "Offer & Onboarding": [
    "Offer letter prepared and sent",
    "Acceptance received",
    "Onboarding schedule confirmed",
    "System access & equipment ready",
  ],
};

function HiringSection({ joinApps }: { joinApps: any[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.values(HIRING_SOP).flat().map(item => [item, false]))
  );
  const totalItems = Object.values(HIRING_SOP).flat().length;
  const doneCount = Object.values(checked).filter(Boolean).length;
  const toggle = (item: string) => setChecked(p => ({ ...p, [item]: !p[item] }));

  const jobStatusColor = (status: string) => {
    if (status === "Open")    return { bg: "#22C55E15", text: "#22C55E" };
    if (status === "On Hold") return { bg: "#EAB30815", text: "#EAB308" };
    return { bg: "#6B728015", text: "#6B7280" };
  };

  const appStatusColor = (status: string) => {
    if (status === "Received")    return { bg: "#6B728015", text: "#6B7280" };
    if (status === "Shortlisted") return { bg: "#3B82F615", text: "#3B82F6" };
    if (status === "Interviewed") return { bg: "#8B5CF615", text: "#8B5CF6" };
    if (status === "Offer Sent")  return { bg: `${GOLD}20`, text: GOLD };
    if (status === "Hired")       return { bg: "#22C55E15", text: "#22C55E" };
    return { bg: "#EF444415", text: "#EF4444" };
  };

  return (
    <div className="space-y-8">
      {/* Job Postings */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Job Postings</h2>
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${GREEN}08` }}>
          <p className="text-sm opacity-30" style={{ color: GREEN }}>No job postings yet.</p>
        </div>
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>
          Join Applications {joinApps.length > 0 && <span className="normal-case px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>{joinApps.length} received</span>}
        </h2>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${GREEN}08` }}>
          {joinApps.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm opacity-40" style={{ color: GREEN }}>No join applications yet. They appear here when candidates apply via the website.</p>
            </div>
          ) : joinApps.map((a: any, i: number) => {
            const statusMap: Record<string, { bg: string; text: string }> = {
              new:       { bg: "#6B728015", text: "#6B7280" },
              reviewed:  { bg: "#3B82F615", text: "#3B82F6" },
              interview: { bg: "#8B5CF615", text: "#8B5CF6" },
              accepted:  { bg: "#22C55E15", text: "#22C55E" },
              rejected:  { bg: "#EF444415", text: "#EF4444" },
            };
            const sc = statusMap[a.status] || statusMap.new;
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
                style={{ borderColor: `${GREEN}06`, backgroundColor: i % 2 === 0 ? "white" : `${GREEN}02` }}
              >
                <span className="text-[10px] font-mono opacity-40 shrink-0" style={{ color: GREEN }}>#{a.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: GREEN }}>{a.fullName}</p>
                  <p className="text-xs opacity-50 truncate" style={{ color: GREEN }}>{a.roleInterest || "Open Application"}</p>
                </div>
                {a.phone && <span className="text-xs opacity-40 shrink-0 hidden sm:block" style={{ color: GREEN }}>{a.phone}</span>}
                <span className="text-xs opacity-30 shrink-0 hidden md:block" style={{ color: GREEN }}>{new Date(a.createdAt).toLocaleDateString("en-NG")}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal shrink-0 capitalize" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SOP Checklist */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>SOP Hiring Checklist</h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${GREEN}10`, color: GREEN }}>{doneCount}/{totalItems} done</span>
        </div>
        <div className="space-y-6">
          {Object.entries(HIRING_SOP).map(([phase, items]) => (
            <div key={phase}>
              <p className="text-xs font-medium uppercase tracking-wider mb-3 opacity-60" style={{ color: GREEN }}>{phase}</p>
              <div className="space-y-2">
                {items.map(item => (
                  <label key={item} className="flex items-center gap-3 cursor-pointer">
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: checked[item] ? GREEN : `${GREEN}30`, backgroundColor: checked[item] ? GREEN : "transparent" }}
                      onClick={() => toggle(item)}
                    >
                      {checked[item] && <CheckCircle2 size={10} style={{ color: GOLD }} />}
                    </div>
                    <span
                      className="text-sm font-normal transition-all"
                      style={{ color: GREEN, opacity: checked[item] ? 0.4 : 0.8, textDecoration: checked[item] ? "line-through" : "none" }}
                      onClick={() => toggle(item)}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Training Section ─────────────────────────────────────────────────────────
function TrainingSection() {
  const sessionStatusColor = (status: string) => {
    if (status === "Completed")  return { bg: "#22C55E15", text: "#22C55E" };
    if (status === "Cancelled")  return { bg: "#EF444415", text: "#EF4444" };
    return { bg: "#3B82F615", text: "#3B82F6" };
  };

  return (
    <div className="space-y-8">
      {/* Training Sessions */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Training Sessions</h2>
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${GREEN}08` }}>
          <p className="text-sm opacity-30" style={{ color: GREEN }}>No training sessions logged yet.</p>
        </div>
        <Button
          className="mt-4"
          style={{ backgroundColor: GREEN, color: GOLD }}
          onClick={() => toast("Training session creation coming soon")}
        >
          + Log Session
        </Button>
      </div>

      {/* Development Plans */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Development Plans</h2>
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${GREEN}08` }}>
          <p className="text-sm opacity-30" style={{ color: GREEN }}>No development plans yet.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Leave Section ────────────────────────────────────────────────────────────
function LeaveSection({ leaveRequests, refetch }: { leaveRequests: any[]; refetch: () => void }) {
  const reviewMutation = trpc.leave.review.useMutation({ onSuccess: () => { refetch(); toast.success("Leave request updated"); } });
  const [form, setForm] = useState({ staffEmail: "", staffName: "", startDate: "", endDate: "", reason: "", replacementName: "" });
  const [showForm, setShowForm] = useState(false);
  const submitMutation = trpc.leave.submit.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ staffEmail: "", staffName: "", startDate: "", endDate: "", reason: "", replacementName: "" }); toast.success("Leave request submitted"); } });

  const statusStyle = (s: string) => {
    if (s === "approved") return { bg: "#22C55E15", text: "#22C55E" };
    if (s === "rejected") return { bg: "#EF444415", text: "#EF4444" };
    return { bg: `${GOLD}20`, text: GOLD };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Leave Requests</h2>
          <p className="text-xs opacity-40 mt-0.5" style={{ color: GREEN }}>3 days per quarter · Replacement required before approval</p>
        </div>
        <Button size="sm" style={{ backgroundColor: GREEN, color: GOLD }} onClick={() => setShowForm(!showForm)}>
          <Plus size={13} className="mr-1" /> New Request
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: `${GREEN}10` }}>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Staff Email *" value={form.staffEmail} onChange={e => setForm(p => ({ ...p, staffEmail: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
            <input placeholder="Staff Name *" value={form.staffName} onChange={e => setForm(p => ({ ...p, staffName: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
            <div className="space-y-1">
              <label className="text-[10px] opacity-40" style={{ color: GREEN }}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] opacity-40" style={{ color: GREEN }}>End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
            </div>
            <input placeholder="Replacement Name *" value={form.replacementName} onChange={e => setForm(p => ({ ...p, replacementName: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
            <input placeholder="Reason" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" style={{ backgroundColor: GREEN, color: GOLD }} disabled={submitMutation.isPending}
              onClick={() => {
                if (!form.staffEmail || !form.staffName || !form.startDate || !form.endDate) { toast.error("Fill all required fields"); return; }
                submitMutation.mutate(form);
              }}>
              {submitMutation.isPending ? <Loader2 size={13} className="animate-spin mr-1" /> : null} Submit
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${GREEN}08` }}>
        <div className="hidden md:grid grid-cols-[1fr_1fr_120px_120px_100px_80px] gap-3 px-5 py-3 border-b" style={{ borderColor: `${GREEN}06`, backgroundColor: `${GREEN}04` }}>
          {["Staff", "Dates", "Replacement", "Reason", "Status", ""].map(h => (
            <p key={h} className="text-[10px] uppercase tracking-wider opacity-40 font-normal" style={{ color: GREEN }}>{h}</p>
          ))}
        </div>
        {leaveRequests.length === 0 && (
          <div className="py-12 text-center"><p className="text-sm opacity-40" style={{ color: GREEN }}>No leave requests yet.</p></div>
        )}
        {leaveRequests.map((lr: any, i: number) => {
          const sc = statusStyle(lr.status);
          return (
            <div key={lr.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_120px_100px_80px] gap-3 px-5 py-4 border-b last:border-0 items-center"
              style={{ borderColor: `${GREEN}06`, backgroundColor: i % 2 === 0 ? "white" : `${GREEN}02` }}>
              <div>
                <p className="text-sm font-medium" style={{ color: GREEN }}>{lr.staffName}</p>
                <p className="text-xs opacity-40" style={{ color: GREEN }}>{lr.staffEmail}</p>
              </div>
              <p className="text-xs opacity-60" style={{ color: GREEN }}>{lr.startDate} → {lr.endDate}</p>
              <p className="text-xs opacity-60" style={{ color: GREEN }}>{lr.replacementName || "—"}</p>
              <p className="text-xs opacity-60" style={{ color: GREEN }}>{lr.reason || "—"}</p>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-normal w-fit" style={{ backgroundColor: sc.bg, color: sc.text }}>{lr.status}</span>
              {lr.status === "pending" && (
                <div className="flex gap-1">
                  <button className="text-[11px] px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: "#22C55E15", color: "#22C55E" }}
                    onClick={() => reviewMutation.mutate({ id: lr.id, status: "approved" })}>✓</button>
                  <button className="text-[11px] px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: "#EF444415", color: "#EF4444" }}
                    onClick={() => reviewMutation.mutate({ id: lr.id, status: "rejected" })}>✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Discipline Section ────────────────────────────────────────────────────────
function DisciplineSection({ disciplineLogs, staffList, refetch }: { disciplineLogs: any[]; staffList: any[]; refetch: () => void }) {
  const issueMutation = trpc.discipline.issue.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm({ staffEmail: "", staffName: "", type: "query" as const, reason: "", description: "", suspensionDays: "", issuedBy: "" }); toast.success("Discipline record issued"); } });
  const resolveMutation = trpc.discipline.resolve.useMutation({ onSuccess: () => { refetch(); toast.success("Record resolved"); } });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staffEmail: "", staffName: "", type: "query" as "query" | "suspension", reason: "", description: "", suspensionDays: "", issuedBy: "" });

  const typeStyle = (t: string) => t === "query" ? { bg: `${GOLD}20`, text: GOLD } : { bg: "#EF444415", text: "#EF4444" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold" style={{ color: GREEN }}>Discipline Log</h2>
          <p className="text-xs opacity-40 mt-0.5" style={{ color: GREEN }}>All issues are formally documented — Level 1: Query · Level 2: Suspension</p>
        </div>
        <Button size="sm" style={{ backgroundColor: GREEN, color: GOLD }} onClick={() => setShowForm(!showForm)}>
          <Gavel size={13} className="mr-1" /> Issue Record
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: `${GREEN}10` }}>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.staffEmail} onChange={e => {
              const staff = staffList.find(s => s.email === e.target.value);
              setForm(p => ({ ...p, staffEmail: e.target.value, staffName: staff?.name || "" }));
            }} className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: `${GREEN}20` }}>
              <option value="">Select Staff *</option>
              {staffList.map((s: any) => <option key={s.email} value={s.email}>{s.name}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as "query" | "suspension" }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: `${GREEN}20` }}>
              <option value="query">Query (Level 1)</option>
              <option value="suspension">Suspension (Level 2)</option>
            </select>
            <input placeholder="Reason / Offence *" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none col-span-2" style={{ borderColor: `${GREEN}20` }} />
            <textarea placeholder="Full description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none resize-none col-span-2" style={{ borderColor: `${GREEN}20` }} />
            {form.type === "suspension" && (
              <input type="number" placeholder="Suspension days" value={form.suspensionDays} onChange={e => setForm(p => ({ ...p, suspensionDays: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
            )}
            <input placeholder="Issued By *" value={form.issuedBy} onChange={e => setForm(p => ({ ...p, issuedBy: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${GREEN}20` }} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" style={{ backgroundColor: GREEN, color: GOLD }} disabled={issueMutation.isPending}
              onClick={() => {
                if (!form.staffEmail || !form.reason || !form.issuedBy) { toast.error("Fill all required fields"); return; }
                issueMutation.mutate({ ...form, suspensionDays: form.suspensionDays ? parseInt(form.suspensionDays) : undefined });
              }}>
              {issueMutation.isPending ? <Loader2 size={13} className="animate-spin mr-1" /> : null} Issue
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${GREEN}08` }}>
        {disciplineLogs.length === 0 && (
          <div className="py-12 text-center"><p className="text-sm opacity-40" style={{ color: GREEN }}>No discipline records. Keep it that way.</p></div>
        )}
        {disciplineLogs.map((d: any, i: number) => {
          const tc = typeStyle(d.type);
          return (
            <div key={d.id} className="flex items-start gap-4 px-5 py-4 border-b last:border-0"
              style={{ borderColor: `${GREEN}06`, backgroundColor: i % 2 === 0 ? "white" : `${GREEN}02` }}>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium shrink-0 mt-0.5" style={{ backgroundColor: tc.bg, color: tc.text }}>
                {d.type === "query" ? "Query" : "Suspension"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: GREEN }}>{d.staffName}</p>
                <p className="text-xs opacity-60 mt-0.5" style={{ color: GREEN }}>{d.reason}</p>
                {d.description && <p className="text-xs opacity-40 mt-0.5" style={{ color: GREEN }}>{d.description}</p>}
                <p className="text-[10px] opacity-30 mt-1" style={{ color: GREEN }}>Issued by {d.issuedBy} · {new Date(d.createdAt).toLocaleDateString("en-NG")}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: d.status === "resolved" ? "#22C55E15" : "#EF444415", color: d.status === "resolved" ? "#22C55E" : "#EF4444" }}>
                  {d.status}
                </span>
                {d.status === "issued" && (
                  <button className="text-[10px] opacity-50 hover:opacity-80 px-2 py-0.5 rounded" style={{ color: GREEN }}
                    onClick={() => resolveMutation.mutate({ id: d.id, resolvedNotes: "Resolved by HR" })}>
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Commissions Section ──────────────────────────────────────────────────────
const HR_COMM_HISTORY = [
  { id: "COM-HR-001", period: "Jan 2026", amount: "₦20,000", status: "Paid"    },
  { id: "COM-HR-002", period: "Feb 2026", amount: "₦20,000", status: "Paid"    },
  { id: "COM-HR-003", period: "Mar 2026", amount: "₦20,000", status: "Pending" },
];

function CommissionsSection({ staffList }: { staffList: any[] }) {
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);
  // Flag staff who are past their 2-month commission window (hire date > 2 months ago) — exclude founder/ceo
  const now = new Date();
  const THRESHOLD_DATE = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
  const nonLeadership = staffList.filter((s: any) => !["founder", "ceo"].includes(s.role));
  // Staff hired before the threshold date are past their 2-month window — HR must verify manually
  const atRiskStaff = nonLeadership.filter((s: any) => {
    if (!s.hireDate || s.hireDate === "—") return false;
    return new Date(s.hireDate) < THRESHOLD_DATE;
  });

  // HR commission = 2% of company net profit (sourced from shared store)
  const hrCommission = Math.round(FINANCE_SUMMARY.profit * 0.02);

  const SUMMARY = [
    { label: "Company Net Profit",   value: formatNaira(FINANCE_SUMMARY.profit), color: GREEN   },
    { label: "HR Commission (2%)",   value: formatNaira(hrCommission),            color: GOLD    },
    { label: "Paid",                 value: formatNaira(hrCommission - 20000),    color: "#22C55E" },
    { label: "Next Payout",          value: "25th April",                         color: "#EAB308" },
  ];

  const handleWithdraw = () => {
    const num = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!amount || isNaN(num) || num < 20000) {
      toast.error("Minimum withdrawal amount is ₦20,000");
      return;
    }
    setSubmitted(true);
    toast.success("Withdrawal request submitted");
  };

  return (
    <div className="space-y-8 max-w-3xl">

      {/* 2-month commission alert */}
      {atRiskStaff.length > 0 && (
        <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: "#EF444420", backgroundColor: "#EF444408" }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} color="#EF4444" />
            <p className="text-sm font-medium" style={{ color: "#EF4444" }}>Commission Alert — {atRiskStaff.length} staff below ₦30,000 in 2-month window</p>
          </div>
          <p className="text-xs opacity-60" style={{ color: "#EF4444" }}>Policy: Staff must reach ₦30k/month commission within 2 months or face substitution.</p>
          <div className="space-y-1.5">
            {atRiskStaff.map((s: any) => (
              <div key={s.email} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white">
                <div>
                  <p className="text-sm" style={{ color: GREEN }}>{s.name}</p>
                  <p className="text-xs opacity-40" style={{ color: GREEN }}>{s.dept} · hired {s.hireDate}</p>
                </div>
                <span className="text-xs font-medium" style={{ color: "#EF4444" }}>Verify ₦30k/mo target</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SUMMARY.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: `${GREEN}08` }}>
            <p className="text-xl font-medium mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: GREEN }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formula box */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Commission Breakdown</h2>
        <div className="rounded-xl p-4 font-mono text-xs space-y-1" style={{ backgroundColor: `${GREEN}06`, color: GREEN }}>
          <p className="opacity-70">Company Net Profit: {formatNaira(FINANCE_SUMMARY.profit)}</p>
          <p className="opacity-70">Commission Pool (10% of profit): {formatNaira(FINANCE_SUMMARY.commissionPool)}</p>
          <p className="opacity-70">├─ Tier 2 Support roles share (8%/10%):</p>
          <p className="opacity-70">│  ├─ CEO (4% of profit): {formatNaira(Math.round(FINANCE_SUMMARY.profit * 0.04))}</p>
          <p className="opacity-70">│  ├─ Finance (2% of profit): {formatNaira(Math.round(FINANCE_SUMMARY.profit * 0.02))}</p>
          <p className="font-semibold opacity-100">│  └─ HR (2% of profit): {formatNaira(Math.round(FINANCE_SUMMARY.profit * 0.02))} ← HR Share</p>
          <p className="opacity-70 mt-2">Your Share: {formatNaira(Math.round(FINANCE_SUMMARY.profit * 0.02))} (2% of net profit)</p>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Commission History</h2>
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${GREEN}08` }}>
          {HR_COMM_HISTORY.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
              style={{ borderColor: `${GREEN}06`, backgroundColor: i % 2 === 0 ? "white" : `${GREEN}02` }}
            >
              <span className="text-[10px] font-mono opacity-40 shrink-0" style={{ color: GREEN }}>{c.id}</span>
              <p className="flex-1 text-sm" style={{ color: GREEN }}>{c.period}</p>
              <p className="text-sm font-medium" style={{ color: GREEN }}>{c.amount}</p>
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-full font-normal shrink-0"
                style={{
                  backgroundColor: c.status === "Paid" ? "#22C55E15" : `${GOLD}20`,
                  color: c.status === "Paid" ? "#22C55E" : GOLD,
                }}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawal request */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${GREEN}08` }}>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Request Withdrawal</h2>
        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <CheckCircle2 size={36} style={{ color: "#22C55E" }} />
            <p className="text-sm font-medium" style={{ color: GREEN }}>Withdrawal request submitted</p>
            <p className="text-xs opacity-50" style={{ color: GREEN }}>Finance will process within 2–3 business days</p>
            <Button variant="outline" size="sm" className="mt-2" style={{ borderColor: `${GREEN}20`, color: GREEN }} onClick={() => { setSubmitted(false); setAmount(""); }}>
              New Request
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs opacity-50" style={{ color: GREEN }}>Minimum withdrawal: ₦20,000</p>
            <Input
              type="number"
              placeholder="Amount (₦)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="border-gray-200 bg-gray-50 max-w-xs"
            />
            <Button style={{ backgroundColor: GREEN, color: GOLD }} onClick={handleWithdraw}>
              Submit Withdrawal Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IT Students Section ──────────────────────────────────────────────────────
const IT_WORKFLOW_STEPS = [
  { step: "1", title: "HR Receives Application", detail: "Student applies through website or is referred. HR reviews and approves intake." },
  { step: "2", title: "Training Begins", detail: "Student placed under HR supervision for orientation, basic training, and assessment." },
  { step: "3", title: "Department Assignment", detail: "Based on skills & assessment: assigned to Systemise (tech/ops), Skills (training & cohort), or BizDoc (compliance & admin)." },
  { step: "4", title: "Onboarding to Department", detail: "Department head receives the student. HR transfers record to their dashboard." },
  { step: "5", title: "Stipend / Scholarship Review", detail: "After 4 weeks: HR + CEO review performance for stipend eligibility." },
];

const DEPT_OPTIONS = [
  { value: "systemise", label: "Systemise — Tech & Operations" },
  { value: "skills",    label: "Hamzury Skills — Training & Cohort" },
  { value: "bizdoc",    label: "BizDoc — Compliance & Admin" },
  { value: "media",     label: "Media — Content & Brand" },
];

function ITStudentsSection() {
  const TEAL  = "#86868B";
  const GOLD  = "#C9A97E";
  const DARK  = "#1D1D1F";
  const [form, setForm] = useState({ name: "", phone: "", email: "", skill: "", school: "", startDate: new Date().toISOString().split("T")[0], notes: "" });
  const [assigned, setAssigned] = useState<{ name: string; dept: string; date: string }[]>([]);
  const [newAssign, setNewAssign] = useState({ name: "", dept: "systemise", date: new Date().toISOString().split("T")[0] });
  const [showForm, setShowForm] = useState(false);

  function handleIntake(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    toast.success(`IT Student intake recorded: ${form.name}`);
    setForm({ name: "", phone: "", email: "", skill: "", school: "", startDate: new Date().toISOString().split("T")[0], notes: "" });
    setShowForm(false);
  }

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!newAssign.name) return;
    setAssigned(prev => [{ ...newAssign }, ...prev]);
    toast.success(`${newAssign.name} assigned to ${newAssign.dept}`);
    setNewAssign({ name: "", dept: "systemise", date: new Date().toISOString().split("T")[0] });
  }

  return (
    <div className="space-y-8">
      {/* Workflow */}
      <div>
        <h2 className="text-[18px] font-semibold mb-1" style={{ color: TEAL }}>IT Student Programme</h2>
        <p className="text-[12px] opacity-50 mb-4" style={{ color: TEAL }}>New IT students are managed under HR, trained, then assigned to a department.</p>
        <div className="space-y-2">
          {IT_WORKFLOW_STEPS.map(s => (
            <div key={s.step} className="flex gap-4 bg-white rounded-2xl border p-4" style={{ borderColor: `${TEAL}10` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>{s.step}</div>
              <div>
                <p className="text-[13px] font-medium" style={{ color: TEAL }}>{s.title}</p>
                <p className="text-[11px] opacity-50 mt-0.5" style={{ color: TEAL }}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intake Form */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-semibold" style={{ color: TEAL }}>Record New IT Student</p>
          <button onClick={() => setShowForm(!showForm)}
            className="text-[12px] px-4 py-1.5 rounded-xl font-medium"
            style={{ backgroundColor: TEAL, color: GOLD }}>
            <Plus size={13} className="inline mr-1" />{showForm ? "Cancel" : "New Intake"}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleIntake} className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: `${TEAL}10` }}>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Full Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="Phone *" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="Primary Skill (e.g. Web Dev, Design)" value={form.skill} onChange={e => setForm(p => ({ ...p, skill: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="School / Background" value={form.school} onChange={e => setForm(p => ({ ...p, school: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
            </div>
            <textarea placeholder="Notes (referral source, observed skills, initial assessment…)" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: `${TEAL}20` }} />
            <button type="submit" className="px-5 py-2 rounded-xl text-[13px] font-medium"
              style={{ backgroundColor: TEAL, color: GOLD }}>
              Record Intake
            </button>
          </form>
        )}
      </div>

      {/* Department Assignment */}
      <div>
        <p className="text-[13px] font-semibold mb-3" style={{ color: TEAL }}>Assign to Department</p>
        <form onSubmit={handleAssign} className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: `${TEAL}10` }}>
          <p className="text-[11px] opacity-50" style={{ color: TEAL }}>Use this to record that a student has completed HR training and is moving to a department.</p>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Student Name" value={newAssign.name} onChange={e => setNewAssign(p => ({ ...p, name: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
            <select value={newAssign.dept} onChange={e => setNewAssign(p => ({ ...p, dept: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: `${TEAL}20` }}>
              {DEPT_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <input type="date" value={newAssign.date} onChange={e => setNewAssign(p => ({ ...p, date: e.target.value }))}
              className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
          </div>
          <button type="submit" className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium"
            style={{ backgroundColor: TEAL, color: GOLD }}>
            <Send size={13} /> Record Assignment
          </button>
        </form>
        {assigned.length > 0 && (
          <div className="mt-3 space-y-2">
            {assigned.map((a, i) => (
              <div key={i} className="bg-white rounded-xl border px-4 py-3 flex items-center justify-between" style={{ borderColor: `${TEAL}10` }}>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: TEAL }}>{a.name}</p>
                  <p className="text-[11px] opacity-40" style={{ color: TEAL }}>{DEPT_OPTIONS.find(d => d.value === a.dept)?.label}</p>
                </div>
                <p className="text-[11px] opacity-30" style={{ color: TEAL }}>{a.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Known IT Students */}
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}10` }}>
        <p className="text-[13px] font-semibold mb-3" style={{ color: TEAL }}>Known IT Students</p>
        <div className="space-y-2">
          {[
            { name: "Abdulwafeed Tanko", skill: "IT / Tech", status: "Active Staff", dept: "Tech/Systemise", date: "2026" },
          ].map(s => (
            <div key={s.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: `${TEAL}06` }}>
              <div>
                <p className="text-[13px] font-medium" style={{ color: TEAL }}>{s.name}</p>
                <p className="text-[11px] opacity-40" style={{ color: TEAL }}>{s.skill} · {s.dept}</p>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">{s.status}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] opacity-30 mt-3" style={{ color: TEAL }}>Add more students using the intake form above.</p>
      </div>
    </div>
  );
}

// ─── HR Policy Section ────────────────────────────────────────────────────────
const POLICY_ITEMS = [
  {
    icon: "💰", title: "Salary & Commission",
    rules: [
      "Flat base salary: ₦20,000/month for ALL staff",
      "Commission paid per completed task (set by Finance & CEO per service)",
      "When monthly commission hits ₦30,000 → base salary STOPS. Commission only.",
      "Staff have 2 months to reach ₦30,000/month commission. If not reached → substitution.",
      "Everyone is a marketer. Leads, referrals, conversions count toward KPI.",
    ]
  },
  {
    icon: "⏰", title: "Working Hours",
    rules: [
      "Official hours: 8:30 AM – 3:00 PM, Monday – Friday",
      "Punctuality is a KPI metric — tracked and reported at Hub Meeting",
      "Any absence or late arrival must be notified by 8:30 AM",
    ]
  },
  {
    icon: "📅", title: "Leave Policy",
    rules: [
      "Entitlement: 3 working days per quarter (not cumulative — use it or lose it)",
      "Replacement cover must be confirmed and briefed BEFORE leave is approved",
      "Leave without replacement = disciplinary action",
      "Emergency leave considered case-by-case by CEO",
    ]
  },
  {
    icon: "⚖️", title: "Discipline",
    rules: [
      "Level 1: Query — written, signed by staff, filed in HR record",
      "Level 2: Suspension — duration set by CEO",
      "No informal warnings — every issue is documented formally",
      "3 queries in one quarter → automatic review for substitution",
    ]
  },
  {
    icon: "📱", title: "Content Engagement",
    rules: [
      "All staff MUST engage with HAMZURY content weekly (like, comment, share, save)",
      "Content engagement is a KPI metric — checked at every Hub Meeting",
      "Staff who consistently skip engagement will receive a query",
      "Each department has its own content calendar — staff must follow it",
    ]
  },
  {
    icon: "🔐", title: "Security & Credentials",
    rules: [
      "CEO holds master record of all software login details",
      "Client personal credentials (tax dashboard, CAC portal, govt portals) → ONLY with Dept Lead or CEO",
      "No other staff may hold, screenshot, or share client login credentials",
      "Staff credentials are issued by CEO — not self-managed",
      "Weekly device roll call: staff report which company devices they hold",
    ]
  },
  {
    icon: "🏆", title: "Recognition & Awards",
    rules: [
      "Staff of the Week: Best sale of the week — announced at Hub Meeting",
      "Best Staff Award: Monthly — chosen by KPI performance. Real recognition.",
      "Student milestone celebrations: every quarter, internally — Skills & NITDA cohorts",
      "Department milestones celebrated in department meeting",
    ]
  },
  {
    icon: "📋", title: "Hub Meeting (Weekly)",
    rules: [
      "Every week — full staff. This is non-negotiable.",
      "Opens with 10 minutes of silence. No gadgets. Full presence.",
      "Research presentation: one staff presents a topic. If adopted → they become Project Lead.",
      "To-do lists reviewed: last week, this week, next week preview.",
      "Bi-weekly: 30-minute training on sales or software (every other meeting).",
    ]
  },
];

const HR_DEVICE_STAFF = [
  "Idris Ibrahim", "Abdullahi Musa", "Yusuf Haruna", "Khadija Saad", "Farida Munir",
  "Tabitha John", "Maryam Ashir", "Abubakar Sadiq", "Sulaiman Hikma", "Salis",
  "Abdulmalik Musa", "Dajot", "Lalo", "Rabilu Musa", "Habeeba", "Pius Emmanuel", "Abdulwafeed Tanko",
];

function HRPolicySection() {
  const TEAL = "#86868B";
  const GOLD = "#C9A97E";
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rollCallDate, setRollCallDate] = useState(new Date().toISOString().split("T")[0]);
  const [rollCall, setRollCall] = useState<Record<string, { device: string; health: string }>>({});

  function updateRollCall(name: string, field: "device" | "health", val: string) {
    setRollCall(p => ({ ...p, [name]: { ...p[name], device: p[name]?.device || "", health: p[name]?.health || "", [field]: val } }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[18px] font-semibold" style={{ color: TEAL }}>HR Policy & Operations</h2>
        <p className="text-[12px] opacity-50 mt-0.5" style={{ color: TEAL }}>HAMZURY internal rules — all staff are bound by these policies from Day 1</p>
      </div>

      {/* Policy Cards */}
      <div className="space-y-2">
        {POLICY_ITEMS.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${TEAL}10` }}>
            <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
              <span className="text-[20px] shrink-0">{item.icon}</span>
              <p className="flex-1 text-[14px] font-medium" style={{ color: TEAL }}>{item.title}</p>
              <span className="text-[10px] opacity-30 mr-2" style={{ color: TEAL }}>{item.rules.length} rules</span>
              {expanded === i
                ? <ChevronRight size={14} className="opacity-30 rotate-90 transition-transform" />
                : <ChevronRight size={14} className="opacity-30 transition-transform" />}
            </button>
            {expanded === i && (
              <div className="px-5 pb-4 pt-0 space-y-1.5 border-t" style={{ borderColor: `${TEAL}06` }}>
                {item.rules.map((rule, j) => (
                  <div key={j} className="flex gap-2 text-[12px]">
                    <span className="opacity-30 shrink-0 mt-0.5" style={{ color: TEAL }}>•</span>
                    <span className="opacity-60" style={{ color: TEAL }}>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Device & Health Roll Call */}
      <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: `${TEAL}10` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold" style={{ color: TEAL }}>Weekly Device & Health Roll Call</p>
            <p className="text-[11px] opacity-40 mt-0.5" style={{ color: TEAL }}>CEO records which devices each staff holds + health status</p>
          </div>
          <input type="date" value={rollCallDate} onChange={e => setRollCallDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border text-[12px] outline-none"
            style={{ borderColor: `${TEAL}20` }} />
        </div>
        <div className="space-y-2">
          {HR_DEVICE_STAFF.map(name => (
            <div key={name} className="grid grid-cols-3 gap-2 items-center">
              <p className="text-[12px] font-medium" style={{ color: TEAL }}>{name}</p>
              <input
                placeholder="Devices held (phone, laptop…)"
                value={rollCall[name]?.device || ""}
                onChange={e => updateRollCall(name, "device", e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] outline-none"
                style={{ borderColor: `${TEAL}15` }} />
              <select
                value={rollCall[name]?.health || ""}
                onChange={e => updateRollCall(name, "health", e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] outline-none bg-white"
                style={{ borderColor: `${TEAL}15`, color: TEAL }}>
                <option value="">Health status…</option>
                <option value="Fit">Fit ✓</option>
                <option value="Unwell — needs cover">Unwell — needs cover</option>
                <option value="On leave">On approved leave</option>
                <option value="Absent (no notice)">Absent (no notice)</option>
              </select>
            </div>
          ))}
        </div>
        <button onClick={() => toast.success("Roll call saved")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium"
          style={{ backgroundColor: TEAL, color: GOLD }}>
          <ShieldCheck size={14} />Save Roll Call for {rollCallDate}
        </button>
      </div>
    </div>
  );
}

// ─── Reports Section ──────────────────────────────────────────────────────────
function ReportsSection() {
  return (
    <div className="space-y-8">
      {/* Reports list */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS_LIST.map(r => (
            <div key={r.title} className="bg-white rounded-2xl border p-5 flex flex-col gap-3" style={{ borderColor: `${GREEN}08` }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${GOLD}15` }}>
                  <FileText size={16} style={{ color: GOLD }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: GREEN }}>{r.title}</p>
                  <p className="text-xs opacity-40 mt-0.5" style={{ color: GREEN }}>{r.period} · {r.format}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                  style={{ borderColor: `${GREEN}15`, color: GREEN }}
                  onClick={() => toast(`Generating ${r.title} (CSV) — coming soon`)}
                >
                  <Download size={12} /> CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5"
                  style={{ borderColor: `${GREEN}15`, color: GREEN }}
                  onClick={() => toast(`Generating ${r.title} (PDF) — coming soon`)}
                >
                  <Download size={12} /> PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-4 opacity-40 font-normal" style={{ color: GREEN }}>HR KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map(k => (
            <div key={k.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${GREEN}08` }}>
              <p className="text-sm font-medium mb-1" style={{ color: GREEN }}>{k.label}</p>
              <p className="text-xs opacity-40 mb-3" style={{ color: GREEN }}>Target: {k.target}</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${k.value}%`, backgroundColor: k.value >= 90 ? "#22C55E" : k.value >= 70 ? GOLD : "#EF4444" }}
                  />
                </div>
                <p className="text-sm font-medium shrink-0" style={{ color: GREEN }}>{k.value}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
