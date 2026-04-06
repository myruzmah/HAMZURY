import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { StaffUser } from "@/lib/types";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import DeptChatPanel from "@/components/DeptChatPanel";
import AgentSuggestionCard from "@/components/AgentSuggestionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import {
  Loader2, LogOut, Briefcase, CalendarDays, Users, BarChart3,
  Clock, CheckCircle2, AlertCircle, Send, ArrowRight, ArrowLeft,
  LayoutDashboard, Target,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ─── Palette ──────────────────────────────────────────────────────────────────
const TEAL = "#2563EB";
const GOLD = "#B48C4C";
const MILK = "#FFFAF6";
const WHITE = "#FFFFFF";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "overview" | "projects" | "appointments" | "applications";

const KANBAN_COLUMNS = [
  "Not Started",
  "In Progress",
  "Waiting on Client",
  "Submitted",
  "Completed",
] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Not Started":       { bg: "rgba(107,114,128,0.08)", text: "#6B7280", border: "#D1D5DB" },
  "In Progress":       { bg: "rgba(59,130,246,0.10)",  text: "#3B82F6", border: "#93C5FD" },
  "Waiting on Client": { bg: "rgba(234,179,8,0.12)",   text: "#B45309", border: "#FCD34D" },
  "Submitted":         { bg: "rgba(139,92,246,0.10)",  text: "#7C3AED", border: "#C4B5FD" },
  "Completed":         { bg: "rgba(34,197,94,0.10)",   text: "#16A34A", border: "#86EFAC" },
};

function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// ─── Sidebar items ────────────────────────────────────────────────────────────
const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
  { key: "overview",      icon: LayoutDashboard, label: "Overview" },
  { key: "projects",      icon: Briefcase,       label: "Projects" },
  { key: "appointments",  icon: CalendarDays,    label: "Appointments" },
  { key: "applications",  icon: Users,           label: "Applications" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SystemiseLeadDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const staffUser = user as StaffUser;
  const [activeSection, setActiveSection] = useState<Section>("overview");

  // Data queries
  const tasksQuery = trpc.tasks.byDepartment.useQuery(
    { department: "systemise" },
    { refetchInterval: 20000 },
  );
  const appointmentsQuery = trpc.systemise.appointments.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const joinAppsQuery = trpc.systemise.joinApplications.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const weeklyTargetsQuery = trpc.weeklyTargets.byDepartment.useQuery(
    { department: "systemise" },
    { refetchInterval: 60000 },
  );

  // Agent suggestions
  const suggestionsQuery = trpc.agents.suggestions.useQuery({ department: "systemise" });
  const reviewMutation = trpc.agents.reviewSuggestion.useMutation({
    onSuccess: () => suggestionsQuery.refetch(),
  });

  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      tasksQuery.refetch();
    },
    onError: () => toast.error("Failed to update status"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const tasks = tasksQuery.data || [];
  const appointments = appointmentsQuery.data || [];
  const joinApps = joinAppsQuery.data || [];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="Systemise Operations | HAMZURY" description="Systemise department lead dashboard" />

      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: TEAL }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${GOLD}20` }}>
          <Briefcase size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: GOLD }}>Systemise Ops</span>
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
            onClick={() => logout()}
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
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${TEAL}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: TEAL }}>
              {sidebarItems.find(s => s.key === activeSection)?.label || "Overview"}
            </h1>
            <p className="text-xs opacity-40" style={{ color: TEAL }}>
              {staffUser.name || staffUser.displayName || "Lead"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {/* Agent Suggestions — shown on all sections */}
            <AgentSuggestionCard
              suggestions={suggestionsQuery.data || []}
              onAccept={(id) => reviewMutation.mutate({ id, action: "accepted" })}
              onReject={(id) => reviewMutation.mutate({ id, action: "rejected" })}
              isLoading={suggestionsQuery.isLoading}
            />

            {activeSection === "overview" && (
              <OverviewSection
                tasks={tasks}
                appointments={appointments}
                weeklyTargetsQuery={weeklyTargetsQuery}
              />
            )}
            {activeSection === "projects" && (
              <ProjectsBoard tasks={tasks} onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status: status as any })} />
            )}
            {activeSection === "appointments" && <AppointmentsTable appointments={appointments} />}
            {activeSection === "applications" && <ApplicationsTable applications={joinApps} />}
          </div>
        </ScrollArea>
      </div>

      <DeptChatPanel department="systemise" staffId={staffUser.staffRef || ""} staffName={staffUser.name || "Staff"} />
    </div>
  );
}

// ─── Overview Section (Stats + Weekly Targets) ───────────────────────────────
function OverviewSection({ tasks, appointments, weeklyTargetsQuery }: { tasks: any[]; appointments: any[]; weeklyTargetsQuery: any }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const active = tasks.filter((t: any) => t.status && t.status !== "Completed").length;
  const completedThisMonth = tasks.filter((t: any) => {
    if (t.status !== "Completed" || !t.completedAt) return false;
    return new Date(t.completedAt) >= monthStart;
  }).length;

  const revenueThisMonth = tasks
    .filter((t: any) => t.status === "Completed" && t.completedAt && new Date(t.completedAt) >= monthStart)
    .reduce((sum: number, t: any) => sum + (Number(t.quotedPrice) || 0), 0);

  const subscriptionClients = tasks.filter((t: any) =>
    (t.serviceType || t.service || "").toLowerCase().includes("subscription") ||
    (t.serviceType || t.service || "").toLowerCase().includes("monthly"),
  ).length;

  const upcomingAppointments = appointments.filter((a: any) => a.status === "pending" || a.status === "confirmed").length;

  const cards = [
    { label: "Active Projects", value: active, icon: <Briefcase size={20} />, color: "#3B82F6" },
    { label: "Completed This Month", value: completedThisMonth, icon: <CheckCircle2 size={20} />, color: "#16A34A" },
    { label: "Revenue This Month", value: `₦${revenueThisMonth.toLocaleString()}`, icon: <BarChart3 size={20} />, color: GOLD },
    { label: "Subscription Clients", value: subscriptionClients, icon: <Users size={20} />, color: "#7C3AED" },
    { label: "Upcoming Appointments", value: upcomingAppointments, icon: <CalendarDays size={20} />, color: TEAL },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ backgroundColor: WHITE, borderRadius: 12, border: "1px solid #E5E7EB", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${card.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                {card.icon}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1A1A", marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly Targets */}
      <div style={{ backgroundColor: WHITE, borderRadius: 12, border: "1px solid #E5E7EB", padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: TEAL, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={18} /> My Weekly Targets
        </h2>
        {weeklyTargetsQuery.isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9CA3AF", fontSize: 13 }}>
            <Loader2 className="animate-spin" size={16} /> Loading targets...
          </div>
        ) : !weeklyTargetsQuery.data?.length ? (
          <p style={{ color: "#9CA3AF", fontSize: 13 }}>No targets set for this week.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weeklyTargetsQuery.data.map((target: any) => (
              <div key={target.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, border: "1px solid #F3F4F6", backgroundColor: "#FAFAFA" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A" }}>{target.title || target.description}</div>
                  {target.metric && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{target.metric}</div>}
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                  backgroundColor: target.status === "completed" ? "rgba(34,197,94,0.10)" : target.status === "in_progress" ? "rgba(59,130,246,0.10)" : "rgba(234,179,8,0.12)",
                  color: target.status === "completed" ? "#16A34A" : target.status === "in_progress" ? "#3B82F6" : "#B45309",
                }}>
                  {target.status === "completed" ? "Done" : target.status === "in_progress" ? "In Progress" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Projects Kanban Board ────────────────────────────────────────────────────
function ProjectsBoard({ tasks, onStatusChange }: { tasks: any[]; onStatusChange: (id: number, status: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${KANBAN_COLUMNS.length}, 1fr)`, gap: 16, overflowX: "auto", minWidth: 900 }}>
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t: any) => (t.status || "Not Started") === col);
        const sc = STATUS_COLORS[col] || STATUS_COLORS["Not Started"];
        return (
          <div key={col} style={{ minWidth: 200 }}>
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ backgroundColor: sc.bg, color: sc.text, padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                {col}
              </span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{colTasks.length}</span>
            </div>
            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {colTasks.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "#9CA3AF", fontSize: 13, border: "1px dashed #D1D5DB", borderRadius: 8 }}>
                  No tasks
                </div>
              )}
              {colTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, onStatusChange }: { task: any; onStatusChange: (id: number, status: string) => void }) {
  const days = daysSince(task.createdAt);
  const sc = STATUS_COLORS[task.status] || STATUS_COLORS["Not Started"];

  return (
    <div style={{
      backgroundColor: WHITE, border: `1px solid ${sc.border}`, borderRadius: 10,
      padding: 14, cursor: "default", transition: "box-shadow 0.15s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 6, lineHeight: 1.3 }}>
        {task.clientName || task.businessName || "Unnamed"}
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
        {task.serviceType || task.service || "—"}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: GOLD, fontWeight: 600, fontFamily: "monospace" }}>
          {task.ref || task.referenceCode || "—"}
        </span>
        <span style={{ fontSize: 11, color: days > 7 ? "#EF4444" : "#9CA3AF", display: "flex", alignItems: "center", gap: 3 }}>
          <Clock size={11} /> {days}d
        </span>
      </div>
      {/* Status dropdown */}
      <select
        value={task.status || "Not Started"}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        style={{
          width: "100%", fontSize: 12, padding: "5px 8px", borderRadius: 6,
          border: "1px solid #E5E7EB", backgroundColor: "#F9FAFB", color: "#374151",
          cursor: "pointer", outline: "none",
        }}
      >
        {KANBAN_COLUMNS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Appointments Table ───────────────────────────────────────────────────────
function AppointmentsTable({ appointments }: { appointments: any[] }) {
  const sorted = useMemo(
    () => [...appointments].sort((a, b) => new Date(b.preferredDate || b.createdAt).getTime() - new Date(a.preferredDate || a.createdAt).getTime()),
    [appointments],
  );

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      pending:   { bg: "rgba(234,179,8,0.12)", text: "#B45309" },
      confirmed: { bg: "rgba(59,130,246,0.10)", text: "#3B82F6" },
      completed: { bg: "rgba(34,197,94,0.10)", text: "#16A34A" },
      cancelled: { bg: "rgba(239,68,68,0.10)", text: "#EF4444" },
    };
    const s = map[status] || map.pending;
    return (
      <span style={{ backgroundColor: s.bg, color: s.text, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: TEAL, margin: 0 }}>Upcoming Appointments</h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Clarity Desk sessions</p>
      </div>
      {sorted.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No appointments yet</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                {["Client", "Date", "Time", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((a: any, i: number) => (
                <tr key={a.id || i} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: "#1A1A1A" }}>{a.clientName || "—"}</td>
                  <td style={{ padding: "10px 16px", color: "#6B7280" }}>{a.preferredDate || "—"}</td>
                  <td style={{ padding: "10px 16px", color: "#6B7280" }}>{a.preferredTime || "—"}</td>
                  <td style={{ padding: "10px 16px" }}>{statusBadge(a.status || "pending")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Applications Table ───────────────────────────────────────────────────────
function ApplicationsTable({ applications }: { applications: any[] }) {
  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      new:      { bg: "rgba(59,130,246,0.10)", text: "#3B82F6" },
      reviewed: { bg: "rgba(234,179,8,0.12)", text: "#B45309" },
      accepted: { bg: "rgba(34,197,94,0.10)", text: "#16A34A" },
      rejected: { bg: "rgba(239,68,68,0.10)", text: "#EF4444" },
    };
    const s = map[status] || map.new;
    return (
      <span style={{ backgroundColor: s.bg, color: s.text, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: WHITE, borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: TEAL, margin: 0 }}>Join Us Applications</h2>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>People who applied to join the Systemise team</p>
      </div>
      {applications.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No applications yet</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                {["Name", "Phone", "Role Interest", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((a: any, i: number) => (
                <tr key={a.id || i} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: "#1A1A1A" }}>{a.fullName || "—"}</td>
                  <td style={{ padding: "10px 16px", color: "#6B7280" }}>{a.phone || "—"}</td>
                  <td style={{ padding: "10px 16px", color: "#6B7280" }}>{a.roleInterest || "—"}</td>
                  <td style={{ padding: "10px 16px" }}>{statusBadge(a.status || "new")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
