import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { StaffUser } from "@/lib/types";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import DeptChatPanel from "@/components/DeptChatPanel";
import AgentSuggestionCard from "@/components/AgentSuggestionCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2, LogOut, ArrowLeft, ChevronDown, ChevronUp,
  ClipboardList, CheckCircle2, BarChart3,
  Play, Send, RotateCcw, Flag,
  Users, Eye, EyeOff, Plus, BadgeCheck, TrendingDown,
  LayoutDashboard, Target,
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN = "#1B4D3E";
const GOLD = "#B48C4C";
const GREEN_LIGHT = "rgba(27,77,62,0.08)";
const MILK = "#FFFAF6";
const WHITE = "#FFFFFF";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Not Started":       { bg: "rgba(107,114,128,0.08)", text: "#6B7280" },
  "In Progress":       { bg: "rgba(59,130,246,0.10)",  text: "#3B82F6" },
  "Waiting on Client": { bg: "rgba(234,179,8,0.12)",   text: "#B45309" },
  "Submitted":         { bg: "rgba(139,92,246,0.10)",  text: "#7C3AED" },
  "Completed":         { bg: "rgba(34,197,94,0.10)",   text: "#16A34A" },
};

type Section = "overview" | "queue" | "review" | "stats" | "clients" | "projects";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Not Started"];
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      fontSize: 12, fontWeight: 500, background: c.bg, color: c.text,
    }}>
      {status}
    </span>
  );
}

// ─── Priority Badge (from lead score) ─────────────────────────────────────────
function PriorityBadge({ score }: { score: number | null | undefined }) {
  const s = score ?? 0;
  let label = "Low";
  let color = "#6B7280";
  if (s >= 7) { label = "High"; color = "#DC2626"; }
  else if (s >= 4) { label = "Medium"; color = "#F59E0B"; }
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      fontSize: 11, fontWeight: 600, color, background: `${color}15`,
    }}>
      {label} ({s})
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BizDocLeadDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const staffUser = user as StaffUser;
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reworkNotes, setReworkNotes] = useState<Record<number, string>>({});

  // ─── Queries ──────────────────────────────────────────────────────────────
  const tasksQuery = trpc.tasks.byDepartment.useQuery(
    { department: "bizdoc" },
    { refetchInterval: 15000 },
  );
  const pendingQuery = trpc.tasks.pending.useQuery(undefined, { refetchInterval: 15000 });
  const subsQuery = trpc.subscriptions.list.useQuery(undefined, { refetchInterval: 30000 });
  const weeklyTargetsQuery = trpc.weeklyTargets.byDepartment.useQuery(
    { department: "bizdoc" },
    { refetchInterval: 60000 },
  );

  // ─── Mutations ────────────────────────────────────────────────────────────
  const updateStatus = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); tasksQuery.refetch(); pendingQuery.refetch(); },
    onError: () => toast.error("Failed to update status"),
  });
  const submitTask = trpc.tasks.submit.useMutation({
    onSuccess: () => { toast.success("Task submitted for review"); tasksQuery.refetch(); pendingQuery.refetch(); },
    onError: () => toast.error("Failed to submit task"),
  });
  const approveMutation = trpc.tasks.approve.useMutation({
    onSuccess: () => { toast.success("Task approved & completed"); tasksQuery.refetch(); pendingQuery.refetch(); },
    onError: (e) => toast.error(e.message || "Failed to approve"),
  });
  const reworkMutation = trpc.tasks.flagRework.useMutation({
    onSuccess: () => { toast.success("Task flagged for rework"); tasksQuery.refetch(); pendingQuery.refetch(); },
    onError: () => toast.error("Failed to flag task"),
  });

  // ─── Agent Suggestions ────────────────────────────────────────────────────
  const suggestionsQuery = trpc.agents.suggestions.useQuery({ department: "bizdoc" });
  const reviewMutation = trpc.agents.reviewSuggestion.useMutation({
    onSuccess: () => suggestionsQuery.refetch(),
  });

  // ─── Derived data ─────────────────────────────────────────────────────────
  const allTasks = (tasksQuery.data ?? []) as any[];
  const submittedTasks = allTasks.filter((t: any) => t.status === "Submitted");
  const activeTasks = allTasks.filter((t: any) => t.status !== "Completed");
  const completedThisMonth = allTasks.filter((t: any) => {
    if (t.status !== "Completed" || !t.completedAt) return false;
    const d = new Date(t.completedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Average completion time (days) for completed tasks this month
  const avgDays = (() => {
    const completed = allTasks.filter((t: any) => t.status === "Completed" && t.completedAt && t.createdAt);
    if (completed.length === 0) return "—";
    const total = completed.reduce((sum: number, t: any) => {
      const ms = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
      return sum + ms / (1000 * 60 * 60 * 24);
    }, 0);
    return (total / completed.length).toFixed(1);
  })();

  const statusBreakdown = allTasks.reduce((acc: Record<string, number>, t: any) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  // Rework rate
  const reworkCount = allTasks.filter((t: any) => t.isRework).length;
  const reworkRate = allTasks.length > 0 ? Math.round((reworkCount / allTasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const sidebarItems: { key: Section; icon: React.ElementType; label: string; badge?: number }[] = [
    { key: "overview",  icon: LayoutDashboard, label: "Overview" },
    { key: "queue",     icon: ClipboardList,   label: "Task Queue" },
    { key: "review",    icon: CheckCircle2,    label: "QA Review", badge: submittedTasks.length || undefined },
    { key: "stats",     icon: BarChart3,       label: "Stats" },
    { key: "clients",   icon: Users,           label: "Tax Clients" },
    { key: "projects",  icon: Flag,            label: "Projects" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="BizDoc Operations" description="BizDoc department lead dashboard" />

      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: GREEN }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${GOLD}20` }}>
          <ClipboardList size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: GOLD }}>BizDoc Ops</span>
        </div>
        <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label, badge }) => (
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
              {badge != null && badge > 0 && (
                <span className="hidden md:inline-flex ml-auto items-center justify-center text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px]" style={{ backgroundColor: GOLD, color: WHITE }}>
                  {badge}
                </span>
              )}
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
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${GREEN}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: GREEN }}>{
              sidebarItems.find(s => s.key === activeSection)?.label
            }</h1>
            <p className="text-xs opacity-40" style={{ color: GREEN }}>{staffUser?.name || "BizDoc Lead"} · Dept Lead</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8" style={{ maxWidth: 1100 }}>
            {/* Agent Suggestions — shown on all sections */}
            <AgentSuggestionCard
              suggestions={suggestionsQuery.data || []}
              onAccept={(id) => reviewMutation.mutate({ id, action: "accepted" })}
              onReject={(id) => reviewMutation.mutate({ id, action: "rejected" })}
              isLoading={suggestionsQuery.isLoading}
            />

            {activeSection === "overview" && (
              <OverviewSection
                activeTasks={activeTasks.length}
                completedThisMonth={completedThisMonth.length}
                avgDays={avgDays}
                submittedCount={submittedTasks.length}
                reworkRate={reworkRate}
                weeklyTargetsQuery={weeklyTargetsQuery}
              />
            )}
            {activeSection === "queue" && (
              <TaskQueueTab
                tasks={allTasks}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                onStartTask={(id: number) => updateStatus.mutate({ id, status: "In Progress" })}
                onSubmitTask={(id: number) => submitTask.mutate({ id })}
                isUpdating={updateStatus.isPending || submitTask.isPending}
              />
            )}
            {activeSection === "review" && (
              <QAReviewTab
                tasks={submittedTasks}
                reworkNotes={reworkNotes}
                setReworkNotes={setReworkNotes}
                onApprove={(id: number) => approveMutation.mutate({ id })}
                onRework={(id: number) => reworkMutation.mutate({ id, reason: reworkNotes[id] || "" })}
                isUpdating={approveMutation.isPending || reworkMutation.isPending}
              />
            )}
            {activeSection === "stats" && (
              <StatsTab
                total={activeTasks.length}
                completedThisMonth={completedThisMonth.length}
                avgDays={avgDays}
                breakdown={statusBreakdown}
              />
            )}
            {activeSection === "clients" && (
              <TaxClientsTab subs={subsQuery.data ?? []} />
            )}
            {activeSection === "projects" && (
              <TilzSpaProjectBoard />
            )}
          </div>
        </ScrollArea>
      </div>
      <DeptChatPanel department="bizdoc" staffId={staffUser?.staffRef || ""} staffName={staffUser?.name || "BizDoc Staff"} />
    </div>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────
function OverviewSection({
  activeTasks, completedThisMonth, avgDays, submittedCount, reworkRate, weeklyTargetsQuery,
}: {
  activeTasks: number;
  completedThisMonth: number;
  avgDays: string;
  submittedCount: number;
  reworkRate: number;
  weeklyTargetsQuery: any;
}) {
  const STAT_CARDS = [
    { label: "Active Tasks", value: activeTasks, icon: ClipboardList, color: GREEN },
    { label: "Completed This Month", value: completedThisMonth, icon: CheckCircle2, color: "#16A34A" },
    { label: "Avg Completion (days)", value: avgDays, icon: BarChart3, color: "#3B82F6" },
    { label: "Submitted for QA", value: submittedCount, icon: Send, color: "#7C3AED" },
    { label: "Rework Rate", value: `${reworkRate}%`, icon: RotateCcw, color: "#EF4444" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <Icon size={16} className="mx-auto mb-2" style={{ color }} />
            <p className="text-xl font-medium leading-none mb-1" style={{ color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: GREEN }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Targets */}
      <div style={{
        background: WHITE, borderRadius: 16,
        border: "1px solid #E5E7EB", padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: GREEN, marginBottom: 16 }}>
          <Target size={16} style={{ color: GOLD }} />
          My Weekly Targets
        </div>
        {weeklyTargetsQuery.isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9CA3AF" }}>
            <Loader2 size={16} className="animate-spin" /> Loading targets...
          </div>
        ) : !weeklyTargetsQuery.data?.length ? (
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>No targets set for this week.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeklyTargetsQuery.data.map((target: any) => (
              <div key={target.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 8,
                border: "1px solid #F3F4F6", background: MILK,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: GREEN }}>
                    {target.title || target.description}
                  </div>
                  {target.metric && (
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{target.metric}</div>
                  )}
                </div>
                <span style={{
                  display: "inline-block", padding: "2px 10px", borderRadius: 999,
                  fontSize: 11, fontWeight: 600,
                  background: target.status === "completed" ? "rgba(34,197,94,0.10)"
                    : target.status === "in_progress" ? "rgba(59,130,246,0.10)"
                    : "rgba(234,179,8,0.12)",
                  color: target.status === "completed" ? "#16A34A"
                    : target.status === "in_progress" ? "#3B82F6"
                    : "#B45309",
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

// ─── Task Queue Tab ───────────────────────────────────────────────────────────
function TaskQueueTab({
  tasks, expandedId, setExpandedId, onStartTask, onSubmitTask, isUpdating,
}: {
  tasks: any[];
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  onStartTask: (id: number) => void;
  onSubmitTask: (id: number) => void;
  isUpdating: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = statusFilter === "all" ? tasks : tasks.filter((t) => t.status === statusFilter);

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6B7280" }}>Filter:</span>
        {["all", "Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: "4px 12px", borderRadius: 999, border: "1px solid #E5E7EB",
              background: statusFilter === s ? GREEN : WHITE,
              color: statusFilter === s ? WHITE : "#374151",
              fontSize: 12, cursor: "pointer", fontWeight: statusFilter === s ? 600 : 400,
            }}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: WHITE, borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "100px 1.2fr 1fr 120px 100px 110px 60px",
          padding: "10px 16px", background: "#F9FAFB", fontSize: 12, fontWeight: 600, color: "#6B7280",
          borderBottom: "1px solid #E5E7EB",
        }}>
          <span>Ref #</span>
          <span>Client</span>
          <span>Service</span>
          <span>Status</span>
          <span>Priority</span>
          <span>Created</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            No tasks found
          </div>
        )}

        {filtered.map((task: any) => (
          <div key={task.id}>
            {/* Row */}
            <div
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
              style={{
                display: "grid", gridTemplateColumns: "100px 1.2fr 1fr 120px 100px 110px 60px",
                padding: "12px 16px", alignItems: "center", cursor: "pointer",
                borderBottom: "1px solid #F3F4F6", fontSize: 13,
                background: expandedId === task.id ? GREEN_LIGHT : "transparent",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontFamily: "monospace", fontWeight: 600, color: GREEN }}>{task.ref}</span>
              <span style={{ fontWeight: 500 }}>{task.clientName}</span>
              <span style={{ color: "#6B7280" }}>{task.service}</span>
              <StatusBadge status={task.status} />
              <PriorityBadge score={task.leadScore} />
              <span style={{ color: "#9CA3AF", fontSize: 12 }}>
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "—"}
              </span>
              <span style={{ color: "#9CA3AF" }}>
                {expandedId === task.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>

            {/* Expanded detail */}
            {expandedId === task.id && (
              <div style={{
                padding: "16px 24px", background: "#FAFBFC", borderBottom: "1px solid #E5E7EB",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>Business Name</div>
                    <div style={{ fontSize: 13 }}>{task.businessName || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>Phone</div>
                    <div style={{ fontSize: 13 }}>{task.phone || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>Quoted Price</div>
                    <div style={{ fontSize: 13 }}>{task.quotedPrice ? `₦${Number(task.quotedPrice).toLocaleString()}` : "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>Deadline</div>
                    <div style={{ fontSize: 13 }}>{task.deadline || "—"}</div>
                  </div>
                </div>

                {task.notes && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Notes</div>
                    <div style={{
                      fontSize: 13, background: WHITE, border: "1px solid #E5E7EB",
                      borderRadius: 6, padding: "8px 12px", whiteSpace: "pre-wrap",
                    }}>
                      {task.notes}
                    </div>
                  </div>
                )}

                {task.isRework && task.reworkNote && (
                  <div style={{
                    marginBottom: 16, padding: "8px 12px", borderRadius: 6,
                    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                  }}>
                    <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 600, marginBottom: 2 }}>Rework Required</div>
                    <div style={{ fontSize: 13, color: "#B91C1C" }}>{task.reworkNote}</div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {task.status === "Not Started" && (
                    <button
                      disabled={isUpdating}
                      onClick={() => onStartTask(task.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 16px", borderRadius: 6, border: "none",
                        background: GREEN, color: WHITE, fontSize: 13, fontWeight: 500,
                        cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.6 : 1,
                      }}
                    >
                      <Play size={14} /> Start Task
                    </button>
                  )}
                  {(task.status === "In Progress" || task.status === "Waiting on Client") && (
                    <button
                      disabled={isUpdating}
                      onClick={() => onSubmitTask(task.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 16px", borderRadius: 6, border: "none",
                        background: "#7C3AED", color: WHITE, fontSize: 13, fontWeight: 500,
                        cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.6 : 1,
                      }}
                    >
                      <Send size={14} /> Submit for Review
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
        {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown
      </div>
    </div>
  );
}

// ─── QA Review Tab ────────────────────────────────────────────────────────────
function QAReviewTab({
  tasks, reworkNotes, setReworkNotes, onApprove, onRework, isUpdating,
}: {
  tasks: any[];
  reworkNotes: Record<number, string>;
  setReworkNotes: (v: Record<number, string>) => void;
  onApprove: (id: number) => void;
  onRework: (id: number) => void;
  isUpdating: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: 60, color: "#9CA3AF",
        background: WHITE, borderRadius: 10, border: "1px solid #E5E7EB",
      }}>
        <CheckCircle2 size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
        <div style={{ fontSize: 14 }}>No tasks pending review</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {tasks.map((task: any) => (
        <div key={task.id} style={{
          background: WHITE, borderRadius: 10, border: "1px solid #E5E7EB", padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <span style={{ fontFamily: "monospace", fontWeight: 600, color: GREEN, marginRight: 12 }}>
                {task.ref}
              </span>
              <span style={{ fontWeight: 500 }}>{task.clientName}</span>
              <span style={{ color: "#9CA3AF", marginLeft: 8, fontSize: 13 }}>— {task.service}</span>
            </div>
            <StatusBadge status={task.status} />
          </div>

          {task.notes && (
            <div style={{
              fontSize: 13, background: "#F9FAFB", border: "1px solid #F3F4F6",
              borderRadius: 6, padding: "8px 12px", marginBottom: 12, whiteSpace: "pre-wrap",
            }}>
              {task.notes}
            </div>
          )}

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16,
            fontSize: 13,
          }}>
            <div>
              <span style={{ color: "#9CA3AF", fontSize: 11 }}>Quoted Price</span>
              <div>{task.quotedPrice ? `₦${Number(task.quotedPrice).toLocaleString()}` : "—"}</div>
            </div>
            <div>
              <span style={{ color: "#9CA3AF", fontSize: 11 }}>Business</span>
              <div>{task.businessName || "—"}</div>
            </div>
            <div>
              <span style={{ color: "#9CA3AF", fontSize: 11 }}>Phone</span>
              <div>{task.phone || "—"}</div>
            </div>
          </div>

          {/* Rework note input */}
          <div style={{ marginBottom: 12 }}>
            <textarea
              placeholder="Rework note (required if flagging for rework)..."
              value={reworkNotes[task.id] || ""}
              onChange={(e) => setReworkNotes({ ...reworkNotes, [task.id]: e.target.value })}
              style={{
                width: "100%", minHeight: 56, padding: "8px 12px",
                border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13,
                resize: "vertical", fontFamily: "inherit",
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={isUpdating}
              onClick={() => onApprove(task.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 6, border: "none",
                background: "#16A34A", color: WHITE, fontSize: 13, fontWeight: 500,
                cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.6 : 1,
              }}
            >
              <CheckCircle2 size={14} /> Approve & Complete
            </button>
            <button
              disabled={isUpdating || !(reworkNotes[task.id] || "").trim()}
              onClick={() => onRework(task.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 6, border: "1px solid #E5E7EB",
                background: WHITE, color: "#DC2626", fontSize: 13, fontWeight: 500,
                cursor: (isUpdating || !(reworkNotes[task.id] || "").trim()) ? "not-allowed" : "pointer",
                opacity: (isUpdating || !(reworkNotes[task.id] || "").trim()) ? 0.5 : 1,
              }}
            >
              <Flag size={14} /> Flag for Rework
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab({
  total, completedThisMonth, avgDays, breakdown,
}: {
  total: number;
  completedThisMonth: number;
  avgDays: string;
  breakdown: Record<string, number>;
}) {
  const statCards = [
    { label: "Active Tasks", value: total, color: GREEN },
    { label: "Completed This Month", value: completedThisMonth, color: "#16A34A" },
    { label: "Avg Completion (days)", value: avgDays, color: "#3B82F6" },
  ];

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: WHITE, borderRadius: 10, border: "1px solid #E5E7EB",
            padding: "20px 24px",
          }}>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div style={{
        background: WHITE, borderRadius: 10, border: "1px solid #E5E7EB", padding: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Tasks by Status</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(STATUS_COLORS).map(([status, colors]) => {
            const count = breakdown[status] || 0;
            const totalAll = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
            const pct = Math.round((count / totalAll) * 100);
            return (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 140, fontSize: 13, color: "#374151" }}>{status}</div>
                <div style={{
                  flex: 1, height: 22, background: "#F3F4F6", borderRadius: 6, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, background: colors.text,
                    borderRadius: 6, transition: "width 0.3s",
                    minWidth: count > 0 ? 4 : 0,
                  }} />
                </div>
                <div style={{ width: 50, textAlign: "right", fontSize: 13, fontWeight: 600, color: colors.text }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Tax Clients Tab ──────────────────────────────────────────────────────────
function TaxClientsTab({ subs }: { subs: any[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const fmtNaira = (v: number | string | null | undefined) => {
    if (!v) return "₦0";
    return `₦${Number(v).toLocaleString("en-NG")}`;
  };

  if (subs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
        <Users size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>No tax clients yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: 0 }}>
          Tax Management Clients
        </h2>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{subs.length} active client{subs.length !== 1 ? "s" : ""}</span>
      </div>

      {subs.map(sub => (
        <ClientCard
          key={sub.id}
          sub={sub}
          expanded={expandedId === sub.id}
          onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
          fmtNaira={fmtNaira}
        />
      ))}
    </div>
  );
}

function ClientCard({ sub, expanded, onToggle, fmtNaira }: {
  sub: any; expanded: boolean; onToggle: () => void; fmtNaira: (v: any) => string;
}) {
  const currentYear = new Date().getFullYear().toString();
  const detailQuery = trpc.subscriptions.getById.useQuery(
    { id: sub.id },
    { enabled: expanded, refetchInterval: false },
  );
  const savingsQuery = trpc.taxSavings.getBySubscription.useQuery(
    { subscriptionId: sub.id },
    { enabled: expanded },
  );
  const credsQuery = trpc.credentials.listBySubscription.useQuery(
    { subscriptionId: sub.id },
    { enabled: expanded },
  );
  const portalLogsQuery = trpc.portalLogs.list.useQuery(
    { subscriptionId: sub.id },
    { enabled: expanded },
  );

  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [grossTax, setGrossTax] = useState("");
  const [savedAmt, setSavedAmt] = useState("");
  const [savingsNotes, setSavingsNotes] = useState("");
  const [tccDelivered, setTccDelivered] = useState(false);
  const [showCredForm, setShowCredForm] = useState(false);
  const [credPlatform, setCredPlatform] = useState("Tax Pro Max");
  const [credUrl, setCredUrl] = useState("");
  const [credUser, setCredUser] = useState("");
  const [credPass, setCredPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logPortal, setLogPortal] = useState("FIRS");
  const [logAction, setLogAction] = useState("");
  const [logStatus, setLogStatus] = useState<"logged_in" | "submitted" | "pending" | "approved" | "rejected" | "error">("logged_in");
  const [logNextDate, setLogNextDate] = useState("");
  const [logNotes, setLogNotes] = useState("");

  const addLog = trpc.portalLogs.log.useMutation({
    onSuccess: () => { toast.success("Visit logged"); setShowLogForm(false); setLogAction(""); setLogNotes(""); portalLogsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const recordSavings = trpc.taxSavings.record.useMutation({
    onSuccess: () => {
      toast.success("Tax savings recorded");
      setShowSavingsForm(false);
      savingsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });
  const addCred = trpc.credentials.add.useMutation({
    onSuccess: () => {
      toast.success("Credentials saved");
      setShowCredForm(false);
      setCredPass("");
      credsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const detail = detailQuery.data;
  const savings = savingsQuery.data ?? [];
  const creds = credsQuery.data ?? [];
  const annualPayment = detail?.payments?.[0];
  const hamzuryFee = savedAmt ? Number(savedAmt) * 0.1 : 0;

  const STATUS_COLOR = sub.status === "active"
    ? { bg: "rgba(34,197,94,0.10)", text: "#16A34A" }
    : { bg: "rgba(239,68,68,0.10)", text: "#EF4444" };

  return (
    <div style={{
      background: WHITE, borderRadius: 16,
      border: `1px solid ${expanded ? GREEN : "rgba(27,77,62,0.12)"}`,
      overflow: "hidden", transition: "border 0.2s",
    }}>
      {/* Card header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: GREEN_LIGHT, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users size={18} style={{ color: GREEN }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: GREEN }}>{sub.businessName || sub.clientName}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{sub.email} · {sub.service}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
            background: STATUS_COLOR.bg, color: STATUS_COLOR.text, textTransform: "capitalize",
          }}>
            {sub.status}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>{fmtNaira(sub.monthlyFee)}/yr</span>
          {expanded ? <ChevronUp size={16} style={{ color: GREEN }} /> : <ChevronDown size={16} style={{ color: "#9CA3AF" }} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: `1px solid rgba(27,77,62,0.08)`, padding: "20px" }}>
          {detailQuery.isLoading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Loader2 size={20} className="animate-spin" style={{ color: GREEN }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Annual Payment Status */}
              <section>
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#9CA3AF", marginBottom: 10, fontWeight: 600 }}>Annual Fee</p>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: annualPayment?.status === "paid" ? "rgba(34,197,94,0.07)" : "rgba(234,179,8,0.08)",
                  border: `1px solid ${annualPayment?.status === "paid" ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.3)"}`,
                  borderRadius: 12, padding: "14px 18px",
                }}>
                  <BadgeCheck size={20} style={{ color: annualPayment?.status === "paid" ? "#16A34A" : "#B45309", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: annualPayment?.status === "paid" ? "#16A34A" : "#B45309" }}>
                      {fmtNaira(annualPayment?.amountPaid || annualPayment?.amountDue)} — {annualPayment?.status === "paid" ? "Paid" : "Pending"}
                    </p>
                    {annualPayment?.paidAt && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>
                        Received {new Date(annualPayment.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Started {sub.startDate}</p>
                </div>
              </section>

              {/* Portal Credentials */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Portal Credentials</p>
                  <button
                    onClick={() => setShowCredForm(v => !v)}
                    style={{ fontSize: 12, color: GREEN, background: GREEN_LIGHT, border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
                {showCredForm && (
                  <div style={{ background: GREEN_LIGHT, borderRadius: 12, padding: "14px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      placeholder="Platform (e.g. Tax Pro Max)"
                      value={credPlatform}
                      onChange={e => setCredPlatform(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }}
                    />
                    <input
                      placeholder="Login URL (optional)"
                      value={credUrl}
                      onChange={e => setCredUrl(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }}
                    />
                    <input
                      placeholder="Username / TIN"
                      value={credUser}
                      onChange={e => setCredUser(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }}
                    />
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        value={credPass}
                        onChange={e => setCredPass(e.target.value)}
                        style={{ padding: "8px 40px 8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13, width: "100%", boxSizing: "border-box" }}
                      />
                      <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (!credUser || !credPass) { toast.error("Username and password required"); return; }
                        addCred.mutate({ subscriptionId: sub.id, platform: credPlatform, loginUrl: credUrl || undefined, username: credUser, password: credPass });
                      }}
                      style={{ background: GREEN, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {addCred.isPending ? "Saving..." : "Save Credentials"}
                    </button>
                  </div>
                )}
                {creds.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>No credentials stored yet.</p>
                ) : creds.map((c: any) => (
                  <div key={c.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(27,77,62,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 6,
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: GREEN }}>{c.platform}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>
                        User: <span style={{ fontFamily: "monospace" }}>{c.username}</span>
                        {c.loginUrl && <> · <a href={c.loginUrl} target="_blank" rel="noopener noreferrer" style={{ color: GREEN }}>Open Portal</a></>}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>Added by {c.addedBy?.split("@")[0] || "staff"}</span>
                  </div>
                ))}
              </section>

              {/* Portal Visit Log */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Portal Visit Log</p>
                  <button
                    onClick={() => setShowLogForm(v => !v)}
                    style={{ fontSize: 12, color: GREEN, background: GREEN_LIGHT, border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={12} /> Log Visit
                  </button>
                </div>
                {showLogForm && (
                  <div style={{ background: GREEN_LIGHT, borderRadius: 12, padding: "14px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <select value={logPortal} onChange={e => setLogPortal(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13, background: WHITE }}>
                      {["FIRS", "JTBS", "KIRS", "CAC", "SCUML", "Tax Pro Max", "Other"].map(p => <option key={p}>{p}</option>)}
                    </select>
                    <input placeholder="Action taken (e.g. Filed quarterly return, Updated TIN...)"
                      value={logAction} onChange={e => setLogAction(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }} />
                    <select value={logStatus} onChange={e => setLogStatus(e.target.value as any)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13, background: WHITE }}>
                      <option value="logged_in">Logged In</option>
                      <option value="submitted">Submitted</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="error">Error</option>
                    </select>
                    <input type="date" placeholder="Next action date" value={logNextDate} onChange={e => setLogNextDate(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }} />
                    <input placeholder="Notes (optional)" value={logNotes} onChange={e => setLogNotes(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }} />
                    <button
                      onClick={() => addLog.mutate({ subscriptionId: sub.id, clientName: sub.businessName || sub.clientName, portalName: logPortal, actionTaken: logAction || undefined, status: logStatus, nextActionDate: logNextDate || undefined, notes: logNotes || undefined })}
                      style={{ background: GREEN, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {addLog.isPending ? "Logging..." : "Log Visit"}
                    </button>
                  </div>
                )}
                {(portalLogsQuery.data ?? []).length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>No portal visits logged yet.</p>
                ) : (portalLogsQuery.data ?? []).slice(0, 6).map((log: any) => (
                  <div key={log.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    background: "rgba(27,77,62,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 6,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: GREEN }}>{log.portalName}</p>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                          background: log.status === "approved" ? "rgba(34,197,94,0.10)" : log.status === "error" || log.status === "rejected" ? "rgba(239,68,68,0.10)" : "rgba(234,179,8,0.10)",
                          color: log.status === "approved" ? "#16A34A" : log.status === "error" || log.status === "rejected" ? "#EF4444" : "#B45309",
                          textTransform: "capitalize",
                        }}>
                          {log.status.replace("_", " ")}
                        </span>
                      </div>
                      {log.actionTaken && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B7280" }}>{log.actionTaken}</p>}
                      {log.nextActionDate && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9CA3AF" }}>Next action: {log.nextActionDate}</p>}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                      {new Date(log.visitedAt || log.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </section>

              {/* Tax Savings & TCC */}
              <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#9CA3AF", margin: 0, fontWeight: 600 }}>
                    Tax Savings — {currentYear}
                  </p>
                  <button
                    onClick={() => setShowSavingsForm(v => !v)}
                    style={{ fontSize: 12, color: GREEN, background: GREEN_LIGHT, border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Plus size={12} /> Record
                  </button>
                </div>

                {showSavingsForm && (
                  <div style={{ background: GREEN_LIGHT, borderRadius: 12, padding: "14px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Gross Tax Liability (what they would have paid without us)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2000000"
                      value={grossTax}
                      onChange={e => setGrossTax(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }}
                    />
                    <label style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Amount Saved for Client</label>
                    <input
                      type="number"
                      placeholder="e.g. 800000"
                      value={savedAmt}
                      onChange={e => setSavedAmt(e.target.value)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13 }}
                    />
                    {savedAmt && (
                      <div style={{ background: "rgba(27,77,62,0.12)", borderRadius: 8, padding: "8px 12px" }}>
                        <p style={{ margin: 0, fontSize: 13, color: GREEN }}>
                          HAMZURY 10% Fee: <strong>{fmtNaira(hamzuryFee)}</strong>
                        </p>
                      </div>
                    )}
                    <textarea
                      placeholder="Notes (optional)"
                      value={savingsNotes}
                      onChange={e => setSavingsNotes(e.target.value)}
                      rows={2}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(27,77,62,0.2)", fontSize: 13, resize: "vertical" }}
                    />
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: GREEN, cursor: "pointer" }}>
                      <input type="checkbox" checked={tccDelivered} onChange={e => setTccDelivered(e.target.checked)} />
                      TCC delivered to client
                    </label>
                    <button
                      onClick={() => {
                        if (!savedAmt) { toast.error("Enter amount saved"); return; }
                        recordSavings.mutate({
                          subscriptionId: sub.id,
                          year: currentYear,
                          grossTaxLiability: grossTax ? Number(grossTax) : undefined,
                          savedAmount: Number(savedAmt),
                          tccDelivered,
                          notes: savingsNotes || undefined,
                        });
                      }}
                      style={{ background: GREEN, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {recordSavings.isPending ? "Saving..." : "Save Record"}
                    </button>
                  </div>
                )}

                {savings.length === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(27,77,62,0.04)", borderRadius: 10 }}>
                    <TrendingDown size={16} style={{ color: "#9CA3AF" }} />
                    <p style={{ margin: 0, fontSize: 13, color: "#9CA3AF" }}>No tax savings recorded yet for {currentYear}.</p>
                  </div>
                ) : savings.map((s: any) => (
                  <div key={s.id} style={{
                    background: "rgba(27,77,62,0.05)", borderRadius: 12, padding: "14px 16px", marginBottom: 8,
                    border: "1px solid rgba(27,77,62,0.1)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: GREEN }}>{s.year} Tax Summary</p>
                        {s.grossTaxLiability && (
                          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>Gross liability: {fmtNaira(s.grossTaxLiability)}</p>
                        )}
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>Amount saved: <strong style={{ color: "#16A34A" }}>{fmtNaira(s.savedAmount)}</strong></p>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>HAMZURY fee (10%): <strong style={{ color: GREEN }}>{fmtNaira(s.hamzuryFee)}</strong></p>
                        {s.notes && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9CA3AF", fontStyle: "italic" }}>{s.notes}</p>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                          background: s.tccDelivered ? "rgba(34,197,94,0.10)" : "rgba(234,179,8,0.10)",
                          color: s.tccDelivered ? "#16A34A" : "#B45309",
                        }}>
                          {s.tccDelivered ? "TCC Delivered" : "TCC Pending"}
                        </span>
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9CA3AF" }}>by {s.recordedBy?.split("@")[0] || "staff"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tilz Spa 8-Week Project Board ────────────────────────────────────────────
const TILZ_WEEKS = [
  { week: 1, label: "Brand Foundation", tasks: ["Brand brief finalized", "Logo + color palette delivered", "Brand guide document created", "Social media handles secured"], startDate: "2026-03-18" },
  { week: 2, label: "Website Architecture", tasks: ["Sitemap approved", "Wireframes reviewed", "Domain + hosting configured", "CMS setup started"], startDate: "2026-03-25" },
  { week: 3, label: "Website Build", tasks: ["Homepage built", "Services page built", "About + Contact pages built", "Mobile responsive"], startDate: "2026-04-01" },
  { week: 4, label: "CRM + Ops Systems", tasks: ["CRM platform set up (client tracking)", "Booking/appointment system configured", "Staff workflow documented", "Intake forms built"], startDate: "2026-04-08" },
  { week: 5, label: "Social Media Setup", tasks: ["IG + TikTok + FB profiles completed", "Content calendar created (first 30 days)", "Bio + links + highlights set up", "First 3 posts designed"], startDate: "2026-04-15" },
  { week: 6, label: "Content + SEO", tasks: ["Website copy finalized", "SEO titles + descriptions written", "Google Business profile set up", "Photo guidelines given to client"], startDate: "2026-04-22" },
  { week: 7, label: "Pre-Launch Review", tasks: ["Full website QA + testing", "CRM test with dummy data", "All links and forms tested", "Client walkthrough / training"], startDate: "2026-04-29" },
  { week: 8, label: "Launch", tasks: ["Website goes live", "Social media launch posts go out", "Announcement sent to client's network", "Balance ₦700k due + invoice sent"], startDate: "2026-05-06" },
];

function TilzSpaProjectBoard() {
  const today = new Date();
  const projectStart = new Date("2026-03-18");
  const daysSinceStart = Math.floor((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.min(Math.max(Math.ceil(daysSinceStart / 7), 1), 8);

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("tilz-spa-tasks") || "{}"); } catch { return {}; }
  });

  function toggleTask(key: string) {
    setCompletedTasks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("tilz-spa-tasks", JSON.stringify(next));
      return next;
    });
  }

  const totalTasks = TILZ_WEEKS.reduce((s, w) => s + w.tasks.length, 0);
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ background: WHITE, borderRadius: 16, border: `1px solid rgba(27,77,62,0.10)`, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: GREEN }}>Tilz Spa by Tilda — 8-Week Project Board</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9CA3AF" }}>Full Business Architecture · ₦1,200,000 · Started March 18, 2026</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: GREEN }}>{progressPct}%</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>Complete</p>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 16, height: 6, borderRadius: 99, background: "rgba(27,77,62,0.1)" }}>
          <div style={{ height: "100%", borderRadius: 99, background: GREEN, width: `${progressPct}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#9CA3AF" }}>
          <span>Week 1 · Mar 18</span>
          <span style={{ fontWeight: 600, color: doneTasks === totalTasks ? "#16A34A" : GREEN }}>Week {currentWeek} now</span>
          <span>Week 8 · May 6 · Balance ₦700k due</span>
        </div>
      </div>

      {/* Week cards */}
      {TILZ_WEEKS.map(w => {
        const weekDone = w.tasks.filter((_, i) => completedTasks[`${w.week}-${i}`]).length;
        const isCurrentWeek = w.week === currentWeek;
        const isPast = w.week < currentWeek;
        return (
          <div key={w.week} style={{
            background: WHITE, borderRadius: 14,
            border: `1.5px solid ${isCurrentWeek ? GREEN : isPast ? "rgba(34,197,94,0.20)" : "rgba(27,77,62,0.08)"}`,
            padding: "18px 20px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: isCurrentWeek ? GREEN : isPast ? "rgba(34,197,94,0.12)" : GREEN_LIGHT,
                  color: isCurrentWeek ? WHITE : isPast ? "#16A34A" : GREEN,
                }}>W{w.week}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: GREEN }}>{w.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>Starts {w.startDate}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: weekDone === w.tasks.length ? "#16A34A" : "#9CA3AF" }}>
                  {weekDone}/{w.tasks.length}
                </span>
                {isCurrentWeek && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${GREEN}20`, color: GREEN }}>ACTIVE</span>}
                {isPast && weekDone === w.tasks.length && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(34,197,94,0.12)", color: "#16A34A" }}>DONE</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {w.tasks.map((task, i) => {
                const key = `${w.week}-${i}`;
                const done = !!completedTasks[key];
                return (
                  <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={done} onChange={() => toggleTask(key)}
                      style={{ width: 15, height: 15, accentColor: GREEN, cursor: "pointer" }} />
                    <span style={{ fontSize: 13, color: done ? "#9CA3AF" : GREEN, textDecoration: done ? "line-through" : "none" }}>{task}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Payment tracker */}
      <div style={{ background: WHITE, borderRadius: 14, border: "1px solid rgba(27,77,62,0.08)", padding: "18px 20px" }}>
        <p style={{ margin: "0 0 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#9CA3AF", fontWeight: 600 }}>Payment Status</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Deposit", amount: "₦500,000", status: "Paid", date: "March 18, 2026" },
            { label: "Balance", amount: "₦700,000", status: "Due at Week 6", date: "~May 2026" },
          ].map(p => (
            <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: GREEN_LIGHT }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: GREEN }}>{p.label}: {p.amount}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{p.date}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                background: p.status === "Paid" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)",
                color: p.status === "Paid" ? "#16A34A" : "#B45309",
              }}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
