import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";
import {
  LogOut, CheckSquare, Calendar, Clock, User, Briefcase,
  Send, AlertTriangle, Star, Shield, Mic, Code, Layers,
} from "lucide-react";

const TEAL  = "#2D2D2D";   // Apple grey — general
const GOLD  = "#B48C4C";
const CREAM = "#FFFAF6";   // Milk white
const DARK  = "#1A1A1A";
const WHITE = "#FFFFFF";

const ROLE_LABELS: Record<string, { label: string; dept: string; color: string }> = {
  bizdev_staff:     { label: "Business Development",      dept: "BizDev",     color: "#1B4D3E" },
  compliance_staff: { label: "Compliance Officer",        dept: "Compliance", color: "#2D4A7A" },
  security_staff:   { label: "Security & Operations",     dept: "Operations", color: "#4A2D2D" },
  media:            { label: "Media & Branding",          dept: "Media",      color: "#7C3AED" },
  department_staff: { label: "Staff",                     dept: "HAMZURY",    color: TEAL      },
};

const STATUS_COLORS: Record<string, string> = {
  "Not Started":       "#94A3B8",
  "In Progress":       "#3B82F6",
  "Waiting on Client": "#F59E0B",
  "Submitted":         "#8B5CF6",
  "Completed":         "#22C55E",
};

/* ─── Calendar Component ─────────────────────────────────────────────────── */
function CalendarView({ tasks }: { tasks: Array<{ deadline?: string | null; clientName: string; service: string; status: string }> }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tasksByDay: Record<number, typeof tasks> = {};
  tasks.forEach(t => {
    if (!t.deadline) return;
    const d = new Date(t.deadline);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      tasksByDay[day] = tasksByDay[day] || [];
      tasksByDay[day].push(t);
    }
  });

  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayDay = today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold" style={{ color: TEAL }}>{monthName}</span>
        <div className="flex gap-2">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="text-xs px-2 py-1 rounded-lg border transition-all hover:opacity-70"
            style={{ borderColor: `${TEAL}20`, color: TEAL }}>‹</button>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="text-xs px-2 py-1 rounded-lg border transition-all hover:opacity-70"
            style={{ borderColor: `${TEAL}20`, color: TEAL }}>›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: DARK }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dayTasks = tasksByDay[day] || [];
          const isToday = day === todayDay;
          return (
            <div key={i}
              className="relative flex flex-col items-center justify-start pt-1 pb-1 rounded-lg min-h-[36px] cursor-default transition-colors"
              style={{ backgroundColor: isToday ? `${GOLD}20` : dayTasks.length ? `${TEAL}06` : "transparent" }}
              title={dayTasks.map(t => `${t.clientName} – ${t.service}`).join("\n")}
            >
              <span className="text-[11px] font-medium" style={{ color: isToday ? TEAL : DARK, opacity: isToday ? 1 : 0.7 }}>{day}</span>
              {dayTasks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                  {dayTasks.slice(0, 2).map((t, j) => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[t.status] || GOLD }} />
                  ))}
                  {dayTasks.length > 2 && <span className="text-[8px]" style={{ color: TEAL }}>+{dayTasks.length - 2}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-[10px] opacity-50" style={{ color: DARK }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Role-specific quick panels ────────────────────────────────────────── */
function CompliancePanel() {
  const items = [
    { label: "CAC Filings", desc: "Business name & company registrations", color: "#2D4A7A" },
    { label: "Tax Compliance", desc: "TIN, FIRS, state board returns", color: "#2D4A7A" },
    { label: "Client Profiles", desc: "KYC documentation & updates", color: "#2D4A7A" },
    { label: "CERPAC / Permits", desc: "Foreign nationals & work permits", color: "#2D4A7A" },
    { label: "SCUML Registration", desc: "AML/CFT compliance filings", color: "#2D4A7A" },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} style={{ color: "#2D4A7A" }} />
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>Compliance Quick Access</h3>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `${item.color}08` }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: TEAL }}>{item.label}</p>
              <p className="text-[11px] opacity-50 mt-0.5" style={{ color: DARK }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityPanel() {
  const checks = [
    "Daily site security walkthrough",
    "Access log review",
    "Equipment inventory check",
    "Incident report (if any)",
    "Lock-up & alarm confirmation",
  ];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={16} style={{ color: "#4A2D2D" }} />
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>Daily Security Checklist</h3>
      </div>
      <div className="space-y-2">
        {checks.map(c => (
          <label key={c} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group" style={{ backgroundColor: `#4A2D2D08` }}>
            <input type="checkbox" className="rounded" />
            <span className="text-xs" style={{ color: DARK }}>{c}</span>
          </label>
        ))}
      </div>
      <p className="text-[10px] opacity-30 mt-3" style={{ color: DARK }}>Checks reset daily. Incidents → raise a task.</p>
    </div>
  );
}

function BizDevStaffPanel() {
  const links = [
    { label: "Lead Sources", desc: "Track referral channels & lead quality", icon: Layers },
    { label: "Podcast Log", desc: "Record episodes, guests & publish schedule", icon: Mic },
    { label: "Outreach Tracker", desc: "Prospects contacted, follow-ups due", icon: Send },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={16} style={{ color: "#1B4D3E" }} />
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>BizDev Quick Access</h3>
      </div>
      <div className="space-y-2">
        {links.map(({ label, desc, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `#1B4D3E08` }}>
            <Icon size={14} style={{ color: "#1B4D3E" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold" style={{ color: TEAL }}>{label}</p>
              <p className="text-[11px] opacity-50 mt-0.5" style={{ color: DARK }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaStaffPanel() {
  const items = [
    { label: "Content Calendar", desc: "Scheduled posts, reels & campaigns", icon: Calendar },
    { label: "Asset Vault", desc: "Brand assets, templates & media files", icon: Layers },
    { label: "Podcast / Video Log", desc: "Recording & post-production tracker", icon: Mic },
    { label: "Social Reports", desc: "Engagement metrics & growth tracking", icon: Code },
  ];
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-4">
        <Mic size={16} style={{ color: "#7C3AED" }} />
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>Media Quick Access</h3>
      </div>
      <div className="space-y-2">
        {items.map(({ label, desc, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `#7C3AED08` }}>
            <Icon size={14} style={{ color: "#7C3AED" }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold" style={{ color: TEAL }}>{label}</p>
              <p className="text-[11px] opacity-50 mt-0.5" style={{ color: DARK }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Task card with submit action ──────────────────────────────────────── */
function TaskCard({ task, onSubmit }: {
  task: { id: number; clientName: string; service: string; status: string; deadline?: string | null; ref?: string | null; notes?: string | null; isRework?: boolean | null; kpiApproved?: boolean | null };
  onSubmit: (id: number) => void;
}) {
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();
  const isRework  = task.isRework;
  const isApproved = task.kpiApproved;
  const canSubmit = task.status === "In Progress" || task.status === "Not Started";

  return (
    <div className="bg-white rounded-2xl border p-4"
      style={{ borderColor: isRework ? `#F59E0B40` : isApproved ? `#22C55E30` : `${TEAL}10` }}>
      {/* Rework / Approved banners */}
      {isRework && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold px-2 py-1 rounded-lg w-fit"
          style={{ backgroundColor: `#F59E0B18`, color: "#F59E0B" }}>
          <AlertTriangle size={11} />
          Needs Rework — please review and resubmit
        </div>
      )}
      {isApproved && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold px-2 py-1 rounded-lg w-fit"
          style={{ backgroundColor: `#22C55E18`, color: "#22C55E" }}>
          <Star size={11} />
          Smooth Task — approved by manager
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: TEAL }}>{task.clientName}</p>
          <p className="text-xs opacity-50 mt-0.5 truncate" style={{ color: DARK }}>{task.service}</p>
          {task.deadline && (
            <p className="text-[11px] mt-1 flex items-center gap-1" style={{
              color: isOverdue ? "#EF4444" : "#64748B"
            }}>
              <Clock size={10} />
              {new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              {isOverdue ? " · Overdue" : ""}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
          style={{ backgroundColor: `${STATUS_COLORS[task.status] ?? GOLD}18`, color: STATUS_COLORS[task.status] ?? GOLD }}>
          {task.status}
        </span>
      </div>

      {task.ref && (
        <p className="text-[10px] mt-2 opacity-30 font-mono" style={{ color: DARK }}>{task.ref}</p>
      )}

      {canSubmit && (
        <button
          onClick={() => onSubmit(task.id)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: `${TEAL}10`, color: TEAL }}>
          <Send size={12} />
          Mark Complete &amp; Submit for Review
        </button>
      )}

      {task.status === "Submitted" && !isApproved && (
        <p className="mt-2 text-[11px] text-center opacity-40" style={{ color: DARK }}>
          Waiting for manager approval…
        </p>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function StaffWorkspace() {
  const { user, logout } = useAuth();
  const utils = trpc.useUtils();
  const tasksQuery = trpc.tasks.myTasks.useQuery(undefined, { refetchInterval: 30000 });
  const kpiQuery   = trpc.tasks.myKPI.useQuery(undefined,   { refetchInterval: 30000 });
  const submitMut  = trpc.tasks.submit.useMutation({
    onSuccess: () => { utils.tasks.myTasks.invalidate(); utils.tasks.myKPI.invalidate(); },
  });

  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const clockInMut = trpc.attendance.checkIn.useMutation({
    onSuccess: () => { setClockedIn(true); toast.success("Clocked in"); },
    onError: (err) => toast.error(err.message),
  });
  const clockOutMut = trpc.attendance.checkOut.useMutation({
    onSuccess: () => { setClockedIn(false); toast.success("Clocked out"); },
    onError: (err) => toast.error(err.message),
  });

  const tasks   = tasksQuery.data ?? [];
  const kpi     = kpiQuery.data ?? { smooth: 0, total: 0, rework: 0, completed: 0 };
  const role    = (user?.hamzuryRole as string) ?? "department_staff";
  const meta    = ROLE_LABELS[role] ?? ROLE_LABELS.department_staff;
  const active  = tasks.filter(t => t.status !== "Completed");
  const done    = tasks.filter(t => t.status === "Completed");
  const overdue = active.filter(t => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < new Date();
  });
  const reworkTasks = tasks.filter(t => t.isRework);

  function handleSubmit(id: number) {
    setSubmittingId(id);
    submitMut.mutate({ id }, { onSettled: () => setSubmittingId(null) });
  }

  function renderRolePanel() {
    switch (role) {
      case "compliance_staff": return <CompliancePanel />;
      case "security_staff":   return <SecurityPanel />;
      case "bizdev_staff":     return <BizDevStaffPanel />;
      case "media":            return <MediaStaffPanel />;
      default:                 return null;
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title={`${meta.label} — HAMZURY`}
        description={`${user?.name ?? "Staff"} personal workspace — HAMZURY`}
        canonical="https://hamzury.com/hub/workspace"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b bg-white"
        style={{ borderColor: `${TEAL}10` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
            {(user?.name ?? "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold leading-none" style={{ color: TEAL }}>{user?.name ?? "Staff"}</p>
            <p className="text-[11px] opacity-40 mt-0.5" style={{ color: DARK }}>{meta.label} · {meta.dept}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* KPI badge */}
          {kpi.smooth > 0 && (
            <div className="hidden md:flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: `#22C55E18`, color: "#22C55E" }}>
              <Star size={12} />
              {kpi.smooth} Smooth
            </div>
          )}
          {reworkTasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: `#F59E0B18`, color: "#F59E0B" }}>
              <AlertTriangle size={12} />
              {reworkTasks.length} Rework
            </div>
          )}
          <button
            onClick={() => clockedIn ? clockOutMut.mutate() : clockInMut.mutate()}
            disabled={clockInMut.isPending || clockOutMut.isPending}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
            style={{ backgroundColor: clockedIn ? "#22C55E18" : `${TEAL}10`, color: clockedIn ? "#22C55E" : TEAL }}
          >
            <Clock size={12} />
            {clockedIn ? "Clock Out" : "Clock In"}
          </button>
          <span className="hidden md:block text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: `${meta.color}12`, color: meta.color }}>
            {meta.dept}
          </span>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: TEAL }}>
            <LogOut size={14} />
            <span className="hidden md:block">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Briefcase, label: "Active Tasks",  value: active.length,  color: "#3B82F6" },
            { icon: Clock,     label: "Overdue",       value: overdue.length, color: "#EF4444" },
            { icon: CheckSquare,label: "Completed",    value: done.length,    color: "#22C55E" },
            { icon: Star,      label: "Smooth Tasks",  value: kpi.smooth,     color: "#F59E0B" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color }} />
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>{label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: TEAL }}>{value}</p>
            </div>
          ))}
        </div>

        {/* KPI progress bar */}
        {kpi.total > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star size={15} style={{ color: "#F59E0B" }} />
                <span className="text-sm font-semibold" style={{ color: TEAL }}>KPI Score</span>
              </div>
              <span className="text-sm font-bold" style={{ color: TEAL }}>
                {kpi.smooth} / {kpi.total} smooth tasks
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ backgroundColor: `${TEAL}10` }}>
              <div className="h-2 rounded-full transition-all"
                style={{ width: `${kpi.total ? Math.round((kpi.smooth / kpi.total) * 100) : 0}%`, backgroundColor: "#F59E0B" }} />
            </div>
            <div className="mt-2 flex gap-4 text-[11px] opacity-50" style={{ color: DARK }}>
              <span>{kpi.smooth} approved</span>
              {kpi.rework > 0 && <span className="text-amber-500">{kpi.rework} rework</span>}
              <span>{kpi.total - kpi.smooth - kpi.rework} pending</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Task list */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>
              My Tasks ({active.length})
            </h2>
            {tasksQuery.isLoading ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <p className="text-sm opacity-40" style={{ color: DARK }}>Loading tasks...</p>
              </div>
            ) : active.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <CheckSquare size={28} className="mx-auto mb-2 opacity-20" style={{ color: TEAL }} />
                <p className="text-sm opacity-40" style={{ color: DARK }}>No active tasks assigned to you</p>
              </div>
            ) : (
              <div className="space-y-2">
                {active.map(t => (
                  <div key={t.id} style={{ opacity: submittingId === t.id ? 0.5 : 1 }}>
                    <TaskCard task={t} onSubmit={handleSubmit} />
                  </div>
                ))}
              </div>
            )}

            {done.length > 0 && (
              <details className="group">
                <summary className="text-xs font-bold uppercase tracking-wider opacity-40 cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: DARK }}>
                  Completed ({done.length})
                </summary>
                <div className="mt-2 space-y-2">
                  {done.slice(0, 5).map(t => (
                    <div key={t.id} className="bg-white rounded-2xl p-3 opacity-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium truncate" style={{ color: TEAL }}>{t.clientName} — {t.service}</p>
                        {t.kpiApproved && <Star size={12} style={{ color: "#F59E0B" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Right column: Calendar + Role panel */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>
              My Calendar
            </h2>
            <CalendarView tasks={tasks} />

            {/* Role card */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-3">
                <User size={16} style={{ color: meta.color }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>My Role</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: TEAL }}>{meta.label}</p>
              <p className="text-xs opacity-40 mt-0.5" style={{ color: DARK }}>{meta.dept} Department</p>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: `${TEAL}08` }}>
                <p className="text-xs opacity-40" style={{ color: DARK }}>
                  Tasks assigned to you by your department lead appear here. Submit completed tasks for manager review to earn smooth task credit.
                </p>
              </div>
            </div>

            {/* Role-specific quick panel */}
            {renderRolePanel()}
          </div>
        </div>
      </main>
    </div>
  );
}
