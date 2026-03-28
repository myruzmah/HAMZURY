import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2, LogOut, ChevronDown, ChevronUp,
  ClipboardList, CheckCircle2, BarChart3,
  Play, Send, RotateCcw, Flag,
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const GREEN = "#1B4D3E";
const GREEN_LIGHT = "rgba(27,77,62,0.08)";
const MILK = "#FAFAF8";
const WHITE = "#FFFFFF";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Not Started":       { bg: "rgba(107,114,128,0.08)", text: "#6B7280" },
  "In Progress":       { bg: "rgba(59,130,246,0.10)",  text: "#3B82F6" },
  "Waiting on Client": { bg: "rgba(234,179,8,0.12)",   text: "#B45309" },
  "Submitted":         { bg: "rgba(139,92,246,0.10)",  text: "#7C3AED" },
  "Completed":         { bg: "rgba(34,197,94,0.10)",   text: "#16A34A" },
};

type Tab = "queue" | "review" | "stats";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "queue",  label: "Task Queue",  icon: <ClipboardList size={16} /> },
  { id: "review", label: "QA Review",   icon: <CheckCircle2 size={16} /> },
  { id: "stats",  label: "Stats",       icon: <BarChart3 size={16} /> },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [reworkNotes, setReworkNotes] = useState<Record<number, string>>({});

  // ─── Queries ──────────────────────────────────────────────────────────────
  const tasksQuery = trpc.tasks.byDepartment.useQuery(
    { department: "bizdoc" },
    { refetchInterval: 15000 },
  );
  const pendingQuery = trpc.tasks.pending.useQuery(undefined, { refetchInterval: 15000 });
  const checklistQueries = (trpc.tasks as any).checklist?.useQuery as any; // checklist per task loaded inline

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: MILK }}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite", color: GREEN }} />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: MILK }}>
      <PageMeta title="BizDoc Operations" description="BizDoc department lead dashboard" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: GREEN, color: WHITE,
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>BizDoc Operations</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>Dept Lead</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <NotificationBell />
          <button
            onClick={() => logout()}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6,
              padding: "6px 12px", color: WHITE, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontSize: 13,
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", gap: 0, borderBottom: "1px solid #E5E7EB",
        background: WHITE, padding: "0 24px",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 20px", border: "none", background: "none",
              cursor: "pointer", fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? GREEN : "#6B7280",
              borderBottom: activeTab === tab.id ? `2px solid ${GREEN}` : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab.icon} {tab.label}
            {tab.id === "review" && submittedTasks.length > 0 && (
              <span style={{
                marginLeft: 4, background: GREEN, color: WHITE,
                borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 600,
              }}>
                {submittedTasks.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {activeTab === "queue" && (
          <TaskQueueTab
            tasks={allTasks}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onStartTask={(id: number) => updateStatus.mutate({ id, status: "In Progress" })}
            onSubmitTask={(id: number) => submitTask.mutate({ id })}
            isUpdating={updateStatus.isPending || submitTask.isPending}
          />
        )}
        {activeTab === "review" && (
          <QAReviewTab
            tasks={submittedTasks}
            reworkNotes={reworkNotes}
            setReworkNotes={setReworkNotes}
            onApprove={(id: number) => approveMutation.mutate({ id })}
            onRework={(id: number) => reworkMutation.mutate({ id, reason: reworkNotes[id] || "" })}
            isUpdating={approveMutation.isPending || reworkMutation.isPending}
          />
        )}
        {activeTab === "stats" && (
          <StatsTab
            total={activeTasks.length}
            completedThisMonth={completedThisMonth.length}
            avgDays={avgDays}
            breakdown={statusBreakdown}
          />
        )}
      </main>
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
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
