import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard, FileSearch, Clock, CheckCircle2, CheckSquare,
  User, LogOut, Loader2, FileText, Upload, Trash2, MessageSquare,
  Send, Sparkles, Phone, ArrowLeft, AlertCircle, BarChart3,
  ClipboardList, FileUp, Bot,
} from "lucide-react";
import { useState, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

type TaskStatus = "Not Started" | "In Progress" | "Waiting on Client" | "Submitted" | "Completed";

export default function Dashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const tasksQuery = trpc.tasks.list.useQuery(undefined, { refetchInterval: 15000 });
  const statsQuery = trpc.tasks.stats.useQuery();
  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });
  const updateNotesMutation = trpc.tasks.updateNotes.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("Notes saved"); },
    onError: () => toast.error("Failed to save notes"),
  });
  const submitMutation = trpc.tasks.submit.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("Task submitted for review"); },
    onError: () => toast.error("Failed to submit task"),
  });

  const tasks = tasksQuery.data || [];
  const stats = statsQuery.data;
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const isOverdue = (task: any) =>
    task.deadline && new Date(task.deadline) < new Date() && task.status !== "Completed" && task.status !== "Submitted";

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      result = result.filter(t =>
        t.clientName?.toLowerCase().includes(q) ||
        t.ref?.toLowerCase().includes(q) ||
        t.service?.toLowerCase().includes(q) ||
        t.businessName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tasks, taskSearch, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFAF6" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "#B48C4C" }} />
      </div>
    );
  }

  if (!user) return null;

  const handleSelectTask = (id: number) => {
    setSelectedTaskId(id);
    setMobileShowDetail(true);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAFA" }}>
      <PageMeta title="BizDoc Staff Dashboard — HAMZURY" description="Task management dashboard for HAMZURY BizDoc compliance staff." />
      {/* Dashboard Nav */}
      <nav className="fixed top-0 left-0 right-0 px-4 md:px-8 py-3 bg-[#1B4D3E] z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div
            className="text-lg font-extrabold tracking-tight cursor-pointer flex items-center gap-1"
            onClick={() => setLocation("/")}
          >
            <span style={{ color: "#FFFAF6" }}>BizDoc</span>
            <span style={{ color: "#B48C4C", fontWeight: 400 }}>Consult</span>
          </div>
          <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ backgroundColor: "#B48C4C", color: "#1B4D3E" }}>
            Staff Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-[13px] hidden md:block" style={{ color: "#B48C4C" }}>
            {user.name || user.email}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-[13px] font-semibold transition-colors"
            style={{ color: "#FFFAF6" }}
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </nav>

      <div className="pt-[56px] flex-1 flex h-[calc(100vh-56px)] overflow-hidden">
        {/* SIDEBAR - Task Queue */}
        <div className={`${mobileShowDetail ? "hidden md:flex" : "flex"} w-full md:w-[380px] bg-white border-r border-[#1B4D3E]/10 flex-col h-full shrink-0`}>
          {/* Stats Bar */}
          {stats && (
            <div className="p-4 border-b border-[#1B4D3E]/5 grid grid-cols-3 gap-2">
              <StatCard label="Active" value={stats.totalTasks - stats.completed} color="#B48C4C" />
              <StatCard label="Waiting" value={stats.waitingOnClient} color="#EAB308" />
              <StatCard label="Done" value={stats.completed} color="#22C55E" />
            </div>
          )}

          <div className="p-4 border-b border-[#1B4D3E]/5">
            <h2 className="text-base font-bold flex items-center gap-2 mb-3" style={{ color: "#1B4D3E" }}>
              <LayoutDashboard size={18} style={{ color: "#B48C4C" }} />
              Task Queue
            </h2>
            {/* Search */}
            <input
              type="text"
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              placeholder="Search by name, ref, service..."
              className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#1B4D3E]/10 bg-[#FFFAF6] outline-none focus:border-[#B48C4C] transition-colors mb-2"
              style={{ color: "#1A1A1A" }}
            />
            {/* Status filter */}
            <div className="flex flex-wrap gap-1">
              {["all", "Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors"
                  style={{
                    borderColor: statusFilter === s ? "#B48C4C" : "rgba(10,31,28,0.1)",
                    backgroundColor: statusFilter === s ? "#B48C4C20" : "transparent",
                    color: statusFilter === s ? "#B48C4C" : "rgba(44,44,44,0.5)",
                  }}
                >
                  {s === "all" ? "All" : s === "Not Started" ? "New" : s === "In Progress" ? "Active" : s === "Waiting on Client" ? "Waiting" : s}
                </button>
              ))}
            </div>
            <p className="text-[11px] opacity-40 mt-2">{filteredTasks.length} of {tasks.length} tasks</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 flex flex-col gap-2">
              {tasksQuery.isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="animate-spin" size={24} style={{ color: "#B48C4C" }} />
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center p-8 opacity-50 text-sm">
                  <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
                  {tasks.length === 0 ? "No tasks yet. Leads from the chat widget will appear here." : "No tasks match your search."}
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleSelectTask(task.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTaskId === task.id
                        ? "border-[#B48C4C] bg-[#FFFAF6]/50 shadow-sm"
                        : isOverdue(task)
                          ? "border-red-300 bg-red-50/50 hover:border-red-400"
                          : "border-[#1B4D3E]/5 hover:border-[#1B4D3E]/20 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold tracking-wider px-2 py-1 rounded bg-[#1B4D3E]/5" style={{ color: "#1B4D3E" }}>
                        {task.ref}
                      </span>
                      <StatusBadge status={task.status} />
                    </div>
                    <h4 className="font-semibold text-[15px] mb-1" style={{ color: "#1A1A1A" }}>{task.clientName}</h4>
                    <p className="text-[13px] opacity-70 mb-2 flex items-center gap-1">
                      <FileSearch size={14} /> {task.service}
                    </p>
                    {task.businessName && (
                      <p className="text-[12px] opacity-50">{task.businessName}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* MAIN AREA - Task Detail */}
        <div className={`${mobileShowDetail || !selectedTaskId ? "" : "hidden md:flex"} flex-1 flex-col overflow-y-auto ${mobileShowDetail ? "flex" : "hidden md:flex"}`} style={{ backgroundColor: "#FAFAFA" }}>
          {selectedTask ? (
            <TaskDetail
              task={selectedTask}
              onBack={() => setMobileShowDetail(false)}
              onRefresh={() => tasksQuery.refetch()}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col opacity-40">
              <LayoutDashboard size={64} className="mb-4" />
              <p className="text-lg font-medium">Select a task from the queue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Task Detail ─────────────────────────────────────────────────────────────

function TaskDetail({ task, onBack, onRefresh }: { task: any; onBack: () => void; onRefresh: () => void }) {
  const utils = trpc.useUtils();
  const submitMutation = trpc.tasks.submit.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); onRefresh(); toast.success("Task submitted for review"); },
    onError: () => toast.error("Failed to submit task"),
  });
  const updateStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); onRefresh(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const [revealedCred, setRevealedCred] = useState<{ username: string; password: string; loginUrl?: string | null } | null>(null);
  const [showAddCred, setShowAddCred] = useState(false);
  const [newCred, setNewCred] = useState({ platform: "Tax Pro Max", loginUrl: "", username: "", password: "", notes: "" });

  const credsQuery = trpc.credentials.listByTask.useQuery(
    { taskId: task.id },
    { enabled: !!task.id }
  );
  const addCredMutation = trpc.credentials.add.useMutation({
    onSuccess: () => { credsQuery.refetch(); setShowAddCred(false); setNewCred({ platform: "Tax Pro Max", loginUrl: "", username: "", password: "", notes: "" }); toast.success("Credentials saved securely"); },
    onError: () => toast.error("Failed to save credentials"),
  });
  const revealMutation = trpc.credentials.reveal.useMutation({
    onSuccess: (d) => setRevealedCred(d),
    onError: () => toast.error("Failed to reveal — check permissions"),
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-2 text-[13px] font-semibold mb-4"
        style={{ color: "#1B4D3E" }}
      >
        <ArrowLeft size={16} /> Back to Queue
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#1B4D3E" }}>{task.clientName}</h1>
            <StatusBadge status={task.status} />
          </div>
          <div className="text-[14px] opacity-70 flex flex-wrap gap-4" style={{ color: "#1A1A1A" }}>
            <span>Ref: <strong>{task.ref}</strong></span>
            <span>Service: <strong>{task.service}</strong></span>
            {task.phone && <span className="flex items-center gap-1"><Phone size={12} /> {task.phone}</span>}
          </div>
          {/* Status Actions */}
          {task.status !== "Completed" && task.status !== "Submitted" && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(["In Progress", "Waiting on Client"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => updateStatusMutation.mutate({ id: task.id, status: s })}
                  disabled={task.status === s || updateStatusMutation.isPending}
                  className="text-[11px] px-3 py-1.5 rounded-full border transition-all disabled:opacity-40"
                  style={{
                    backgroundColor: task.status === s ? "#1B4D3E" : "transparent",
                    color: task.status === s ? "#B48C4C" : "#1B4D3E",
                    borderColor: "#1B4D3E30",
                  }}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => submitMutation.mutate({ id: task.id })}
                disabled={submitMutation.isPending}
                className="text-[11px] px-3 py-1.5 rounded-full transition-all"
                style={{ backgroundColor: "#1B4D3E", color: "#B48C4C" }}
              >
                {submitMutation.isPending ? "Submitting…" : "Submit for Review →"}
              </button>
            </div>
          )}
        </div>
        <StatusUpdater taskId={task.id} currentStatus={task.status} onRefresh={onRefresh} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="mb-6 bg-white border border-[#1B4D3E]/10">
          <TabsTrigger value="checklist" className="gap-1.5"><CheckSquare size={14} /> SOP Checklist</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5"><FileText size={14} /> Notes</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5"><FileUp size={14} /> Documents</TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-1.5"><MessageSquare size={14} /> WhatsApp</TabsTrigger>
          <TabsTrigger value="clientchat" className="gap-1.5"><MessageSquare size={14} /> Client Chat</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5"><Bot size={14} /> AI Assistant</TabsTrigger>
          <TabsTrigger value="credentials" className="gap-1.5"><FileSearch size={14} /> Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist">
          <ChecklistPanel taskId={task.id} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesPanel taskId={task.id} currentNotes={task.notes || ""} onRefresh={onRefresh} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsPanel taskId={task.id} />
        </TabsContent>
        <TabsContent value="whatsapp">
          <WhatsAppPanel taskId={task.id} phone={task.phone || ""} />
        </TabsContent>
        <TabsContent value="clientchat">
          <ClientChatPanel task={task} />
        </TabsContent>
        <TabsContent value="ai">
          <AIAssistantPanel task={task} />
        </TabsContent>
        <TabsContent value="credentials">
          <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-40" style={{ color: "#1B4D3E" }}>
                Client Credentials
              </p>
              <button
                onClick={() => setShowAddCred(!showAddCred)}
                className="text-[11px] px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: "#1B4D3E10", color: "#1B4D3E" }}
              >
                + Add
              </button>
            </div>

            {showAddCred && (
              <div className="rounded-xl p-4 space-y-2 mb-3 border" style={{ borderColor: "#1B4D3E12", backgroundColor: "#1B4D3E04" }}>
                <input
                  placeholder="Platform (e.g. Tax Pro Max)"
                  value={newCred.platform}
                  onChange={e => setNewCred(p => ({ ...p, platform: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none"
                  style={{ borderColor: "#1B4D3E20" }}
                />
                <input
                  placeholder="Login URL (optional)"
                  value={newCred.loginUrl}
                  onChange={e => setNewCred(p => ({ ...p, loginUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none"
                  style={{ borderColor: "#1B4D3E20" }}
                />
                <input
                  placeholder="Username / Email"
                  value={newCred.username}
                  onChange={e => setNewCred(p => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none"
                  style={{ borderColor: "#1B4D3E20" }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newCred.password}
                  onChange={e => setNewCred(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none"
                  style={{ borderColor: "#1B4D3E20" }}
                />
                <input
                  placeholder="Notes (optional)"
                  value={newCred.notes}
                  onChange={e => setNewCred(p => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none"
                  style={{ borderColor: "#1B4D3E20" }}
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => addCredMutation.mutate({ ...newCred, taskId: task.id })}
                    disabled={!newCred.username || !newCred.password || addCredMutation.isPending}
                    className="text-[12px] px-4 py-2 rounded-lg font-medium disabled:opacity-40"
                    style={{ backgroundColor: "#1B4D3E", color: "#B48C4C" }}
                  >
                    {addCredMutation.isPending ? "Saving…" : "Save Encrypted"}
                  </button>
                  <button onClick={() => setShowAddCred(false)} className="text-[12px] px-3 py-2 rounded-lg opacity-40" style={{ color: "#1B4D3E" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {(credsQuery.data || []).map(cred => (
              <div key={cred.id} className="rounded-xl p-3 mb-2 border" style={{ borderColor: "#1B4D3E10" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold" style={{ color: "#1B4D3E" }}>{cred.platform}</span>
                  {cred.loginUrl && (
                    <a href={cred.loginUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] opacity-50 hover:opacity-80"
                      style={{ color: "#1B4D3E" }}>Open →</a>
                  )}
                </div>
                <p className="text-[12px] font-mono" style={{ color: "#1B4D3E" }}>{cred.username}</p>
                {revealedCred && revealMutation.isSuccess ? (
                  <div className="mt-1 p-2 rounded-lg" style={{ backgroundColor: "#FEF3C7" }}>
                    <p className="text-[11px] font-mono font-bold" style={{ color: "#92400E" }}>{revealedCred.password}</p>
                    <p className="text-[10px] opacity-50 mt-0.5" style={{ color: "#92400E" }}>Hide after use — this is logged</p>
                    <button onClick={() => setRevealedCred(null)} className="text-[10px] mt-1 opacity-50" style={{ color: "#92400E" }}>Hide</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] font-mono opacity-30" style={{ color: "#1B4D3E" }}>{cred.passwordMasked}</span>
                    <button
                      onClick={() => revealMutation.mutate({ credentialId: cred.id })}
                      disabled={revealMutation.isPending}
                      className="text-[10px] px-2 py-0.5 rounded-md opacity-50 hover:opacity-80"
                      style={{ backgroundColor: "#1B4D3E10", color: "#1B4D3E" }}
                    >
                      {revealMutation.isPending ? "…" : "Reveal"}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {credsQuery.data?.length === 0 && !showAddCred && (
              <p className="text-[12px] opacity-30" style={{ color: "#1B4D3E" }}>No credentials stored for this task</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Status Updater ──────────────────────────────────────────────────────────

function StatusUpdater({ taskId, currentStatus, onRefresh }: { taskId: number; currentStatus: TaskStatus; onRefresh: () => void }) {
  const updateStatus = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      onRefresh();
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider font-bold opacity-60 md:text-right" style={{ color: "#1B4D3E" }}>
        Update Status
      </span>
      <Select
        value={currentStatus}
        onValueChange={(val) => updateStatus.mutate({ id: taskId, status: val as TaskStatus })}
        disabled={updateStatus.isPending}
      >
        <SelectTrigger className="w-[200px] bg-white border-[#B48C4C] font-semibold shadow-sm" style={{ color: "#1B4D3E" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Not Started">Not Started</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Waiting on Client">Waiting on Client</SelectItem>
          <SelectItem value="Submitted">Submitted to Registry</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Checklist Panel ─────────────────────────────────────────────────────────

function ChecklistPanel({ taskId }: { taskId: number }) {
  const checklistQuery = trpc.checklist.getByTaskId.useQuery({ taskId });
  const toggleItem = trpc.checklist.toggle.useMutation({
    onSuccess: () => checklistQuery.refetch(),
    onError: () => toast.error("Failed to toggle item"),
  });

  const items = checklistQuery.data || [];
  const preItems = items.filter(i => i.phase === "pre");
  const duringItems = items.filter(i => i.phase === "during");
  const postItems = items.filter(i => i.phase === "post");

  const totalItems = items.length;
  const checkedItems = items.filter(i => i.checked).length;
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  if (checklistQuery.isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" size={24} style={{ color: "#B48C4C" }} /></div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#1B4D3E" }}>
          <CheckSquare size={16} style={{ color: "#B48C4C" }} /> SOP Execution Checklist
        </h3>
        <span className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: progress === 100 ? "#22C55E20" : "#B48C4C20", color: progress === 100 ? "#22C55E" : "#B48C4C" }}>
          {progress}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#1B4D3E]/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? "#22C55E" : "#B48C4C" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChecklistPhase title="Pre-Task" items={preItems} onToggle={(id) => toggleItem.mutate({ itemId: id })} />
        <ChecklistPhase title="Execution" items={duringItems} onToggle={(id) => toggleItem.mutate({ itemId: id })} />
        <ChecklistPhase title="Post-Task" items={postItems} onToggle={(id) => toggleItem.mutate({ itemId: id })} />
      </div>
    </div>
  );
}

function ChecklistPhase({ title, items, onToggle }: { title: string; items: any[]; onToggle: (id: number) => void }) {
  return (
    <div>
      <h4 className="text-[13px] font-bold mb-4 border-b border-[#1B4D3E]/10 pb-2" style={{ color: "#1B4D3E" }}>{title}</h4>
      <div className="flex flex-col gap-3">
        {items.map(item => (
          <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => onToggle(item.id)}
              className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                item.checked ? "bg-[#1B4D3E] border-[#1B4D3E]" : "border-[#1B4D3E]/30 bg-white group-hover:border-[#B48C4C]"
              }`}
            >
              {item.checked && <CheckCircle2 size={14} color="#B48C4C" />}
            </div>
            <span className={`text-[13px] leading-snug transition-all ${item.checked ? "opacity-50 line-through" : ""}`} style={{ color: "#1A1A1A" }}>
              {item.label}
            </span>
          </label>
        ))}
        {items.length === 0 && <p className="text-[13px] opacity-40">No items</p>}
      </div>
    </div>
  );
}

// ─── Notes Panel ─────────────────────────────────────────────────────────────

function NotesPanel({ taskId, currentNotes, onRefresh }: { taskId: number; currentNotes: string; onRefresh: () => void }) {
  const [notes, setNotes] = useState(currentNotes);
  const updateNotes = trpc.tasks.updateNotes.useMutation({
    onSuccess: () => { onRefresh(); toast.success("Notes saved"); },
    onError: () => toast.error("Failed to save notes"),
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#1B4D3E" }}>
        <User size={16} style={{ color: "#B48C4C" }} /> Client Brief & Notes
      </h3>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this task..."
        className="min-h-[200px] bg-[#FFFAF6] border-[#1B4D3E]/10 mb-4"
        style={{ color: "#1A1A1A" }}
      />
      <Button
        onClick={() => updateNotes.mutate({ id: taskId, notes })}
        disabled={updateNotes.isPending || notes === currentNotes}
        style={{ backgroundColor: "#1B4D3E", color: "#B48C4C" }}
      >
        {updateNotes.isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
        Save Notes
      </Button>
    </div>
  );
}

// ─── Documents Panel ─────────────────────────────────────────────────────────

function DocumentsPanel({ taskId }: { taskId: number }) {
  const docsQuery = trpc.documents.getByTaskId.useQuery({ taskId });
  const uploadDoc = trpc.documents.upload.useMutation({
    onSuccess: () => { docsQuery.refetch(); toast.success("Document uploaded"); },
    onError: () => toast.error("Failed to upload document"),
  });
  const deleteDoc = trpc.documents.delete.useMutation({
    onSuccess: () => { docsQuery.refetch(); toast.success("Document deleted"); },
    onError: () => toast.error("Failed to delete document"),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadDoc.mutate({
        taskId,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
        fileSize: file.size,
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [taskId, uploadDoc]);

  const docs = docsQuery.data || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#1B4D3E" }}>
          <FileUp size={16} style={{ color: "#B48C4C" }} /> Documents
        </h3>
        <div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls" />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadDoc.isPending}
            variant="outline"
            className="border-[#B48C4C] hover:bg-[#B48C4C]/10"
            style={{ color: "#1B4D3E" }}
          >
            {uploadDoc.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
            Upload
          </Button>
        </div>
      </div>

      {docsQuery.isLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" size={24} style={{ color: "#B48C4C" }} /></div>
      ) : docs.length === 0 ? (
        <div className="text-center p-8 opacity-40 text-sm">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          No documents uploaded yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-[#1B4D3E]/5 bg-[#FFFAF6]/50">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={18} style={{ color: "#B48C4C" }} className="shrink-0" />
                <div className="min-w-0">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium hover:underline truncate block" style={{ color: "#1B4D3E" }}>
                    {doc.fileName}
                  </a>
                  <p className="text-[11px] opacity-50">
                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""} · {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0">
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete <strong>{doc.fileName}</strong>. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteDoc.mutate({ docId: doc.id, taskId })}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WhatsApp Panel ──────────────────────────────────────────────────────────

function WhatsAppPanel({ taskId, phone }: { taskId: number; phone: string }) {
  const [phoneInput, setPhoneInput] = useState(phone);
  const [customMsg, setCustomMsg] = useState("");
  const sendMsg = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: (data) => {
      window.open(data.whatsappUrl, "_blank");
      toast.success("WhatsApp message prepared");
    },
    onError: () => toast.error("Failed to prepare message"),
  });

  const sendTemplate = (type: "file_created" | "status_update" | "document_pickup") => {
    if (!phoneInput.trim()) { toast.error("Please enter a phone number"); return; }
    sendMsg.mutate({ taskId, phone: phoneInput, messageType: type });
  };

  const sendCustom = () => {
    if (!phoneInput.trim()) { toast.error("Please enter a phone number"); return; }
    if (!customMsg.trim()) { toast.error("Please enter a message"); return; }
    sendMsg.mutate({ taskId, phone: phoneInput, messageType: "custom", customMessage: customMsg });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#1B4D3E" }}>
        <MessageSquare size={16} style={{ color: "#22C55E" }} /> WhatsApp Messaging
      </h3>

      <div className="mb-6">
        <label className="text-[12px] font-semibold uppercase tracking-wider opacity-60 mb-2 block">Client Phone</label>
        <Input
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          placeholder="+234 xxx xxx xxxx"
          className="bg-[#FFFAF6] border-[#1B4D3E]/10"
        />
      </div>

      <div className="mb-6">
        <label className="text-[12px] font-semibold uppercase tracking-wider opacity-60 mb-3 block">Quick Templates</label>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => sendTemplate("file_created")}
            variant="outline"
            className="border-[#22C55E]/30 hover:bg-[#22C55E]/10 text-[13px]"
            disabled={sendMsg.isPending}
          >
            <FileText size={14} className="mr-1.5" /> File Created
          </Button>
          <Button
            onClick={() => sendTemplate("status_update")}
            variant="outline"
            className="border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 text-[13px]"
            disabled={sendMsg.isPending}
          >
            <Clock size={14} className="mr-1.5" /> Status Update
          </Button>
          <Button
            onClick={() => sendTemplate("document_pickup")}
            variant="outline"
            className="border-[#B48C4C]/30 hover:bg-[#B48C4C]/10 text-[13px]"
            disabled={sendMsg.isPending}
          >
            <CheckCircle2 size={14} className="mr-1.5" /> Document Pickup
          </Button>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-semibold uppercase tracking-wider opacity-60 mb-2 block">Custom Message</label>
        <Textarea
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          placeholder="Type a custom message..."
          className="min-h-[100px] bg-[#FFFAF6] border-[#1B4D3E]/10 mb-3"
        />
        <Button
          onClick={sendCustom}
          disabled={sendMsg.isPending || !customMsg.trim()}
          style={{ backgroundColor: "#22C55E", color: "white" }}
        >
          {sendMsg.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Send size={14} className="mr-2" />}
          Send via WhatsApp
        </Button>
      </div>

      <p className="text-[11px] opacity-40 mt-4">
        Messages will open WhatsApp Web with the pre-filled message. You can review before sending.
      </p>
    </div>
  );
}

// ─── Client Chat Panel ───────────────────────────────────────────────────────

function ClientChatPanel({ task }: { task: any }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Check for existing chat on this task
  const chatsQuery = trpc.clientChat.getByTask.useQuery(
    { taskId: task.id },
    { enabled: !!task.id }
  );

  const activeChat = (chatsQuery.data || [])[0] ?? null;

  // Create a new chat thread
  const createChat = trpc.clientChat.create.useMutation({
    onSuccess: () => {
      utils.clientChat.getByTask.invalidate({ taskId: task.id });
      toast.success("Client chat created");
    },
    onError: () => toast.error("Failed to create chat thread"),
  });

  // Send a message
  const sendMessage = trpc.clientChat.sendMessage.useMutation({
    onSuccess: () => {
      utils.clientChat.getByTask.invalidate({ taskId: task.id });
    },
    onError: () => toast.error("Failed to send message"),
  });

  // Local messages for optimistic display while waiting for refetch
  const [pendingMessages, setPendingMessages] = useState<{ role: string; content: string }[]>([]);

  const chatHistory: { role: string; content: string }[] = Array.isArray(activeChat?.chatHistory)
    ? (activeChat.chatHistory as { role: string; content: string }[])
    : [];

  // Combine persisted + pending messages
  const displayMessages = [...chatHistory, ...pendingMessages];

  // Auto-scroll on new messages
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleSend = () => {
    if (!input.trim() || !activeChat || sendMessage.isPending) return;
    const msg = input.trim();
    setInput("");
    setPendingMessages([{ role: "user", content: msg }]);
    sendMessage.mutate(
      { chatId: activeChat.id, message: msg },
      {
        onSuccess: (data) => {
          setPendingMessages([]);
          // refetch will pick up the full history from DB
          setTimeout(scrollToBottom, 100);
        },
        onError: () => {
          setPendingMessages([]);
        },
      }
    );
    setTimeout(scrollToBottom, 50);
  };

  const handleCreate = () => {
    createChat.mutate({
      taskId: task.id,
      clientRef: task.ref || `task-${task.id}`,
      clientName: task.clientName || "Client",
      department: "BizDoc",
    });
  };

  // Loading state
  if (chatsQuery.isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm flex items-center justify-center" style={{ height: "400px" }}>
        <Loader2 className="animate-spin" size={24} style={{ color: "#B48C4C" }} />
      </div>
    );
  }

  // No chat exists yet — show create prompt
  if (!activeChat) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-[#1B4D3E]/10 shadow-sm flex flex-col items-center justify-center gap-4" style={{ height: "400px" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1B4D3E10" }}>
          <MessageSquare size={28} style={{ color: "#1B4D3E" }} />
        </div>
        <div className="text-center max-w-sm">
          <h3 className="text-lg font-bold mb-2" style={{ color: "#1B4D3E" }}>Client Chat Thread</h3>
          <p className="text-[13px] opacity-60 mb-1" style={{ color: "#1A1A1A" }}>
            Start a dedicated AI chat for <strong>{task.clientName}</strong>.
          </p>
          <p className="text-[12px] opacity-40" style={{ color: "#1A1A1A" }}>
            The AI advisor remembers all context about this client across sessions. Use it to brainstorm strategies, draft follow-ups, or get compliance guidance specific to this engagement.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={createChat.isPending}
          className="mt-2"
          style={{ backgroundColor: "#1B4D3E", color: "#B48C4C" }}
        >
          {createChat.isPending ? (
            <Loader2 size={14} className="animate-spin mr-2" />
          ) : (
            <MessageSquare size={14} className="mr-2" />
          )}
          Create Chat Thread
        </Button>
      </div>
    );
  }

  // Chat exists — show the interface
  return (
    <div className="bg-white rounded-2xl border border-[#1B4D3E]/10 shadow-sm flex flex-col" style={{ height: "520px" }}>
      {/* Header */}
      <div className="p-4 border-b border-[#1B4D3E]/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: "#B48C4C" }} />
          <h3 className="text-sm font-bold" style={{ color: "#1B4D3E" }}>
            {task.clientName} — AI Advisor
          </h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: activeChat.status === "active" ? "#22C55E15" : "#EAB30815",
              color: activeChat.status === "active" ? "#22C55E" : "#EAB308",
            }}
          >
            {activeChat.status}
          </span>
        </div>
        <span className="text-[11px] opacity-40" style={{ color: "#1B4D3E" }}>
          {displayMessages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {displayMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
            <Bot size={28} />
            <p className="text-[13px] text-center max-w-xs">
              This is your dedicated AI advisor for {task.clientName}. Ask about strategy, next steps, compliance checks, or draft client communications.
            </p>
          </div>
        ) : (
          displayMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm border border-[#1B4D3E]/5"
                }`}
                style={{
                  backgroundColor: msg.role === "user" ? "#1B4D3E" : "#F5F5F0",
                  color: msg.role === "user" ? "#FFFAF6" : "#1A1A1A",
                }}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {sendMessage.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-[#1B4D3E]/5 px-4 py-3" style={{ backgroundColor: "#F5F5F0" }}>
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" style={{ color: "#B48C4C" }} />
                <span className="text-[12px] opacity-50">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1B4D3E]/5 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about this client, draft a follow-up, check compliance..."
          className="flex-1 bg-[#FFFAF6] border-[#1B4D3E]/10 text-[13px]"
          disabled={sendMessage.isPending || activeChat.status !== "active"}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending || activeChat.status !== "active"}
          style={{ backgroundColor: "#1B4D3E", color: "#B48C4C" }}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

// ─── AI Assistant Panel ──────────────────────────────────────────────────────

function AIAssistantPanel({ task }: { task: any }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    chatMutation.mutate({
      message: msg,
      taskContext: {
        ref: task.ref,
        service: task.service,
        status: task.status,
        clientName: task.clientName,
      },
    });
  };

  const suggestedPrompts = [
    `What documents are needed for ${task.service}?`,
    `What are the next steps for a "${task.status}" task?`,
    "Draft a client update message",
    "What are the CAC requirements?",
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#1B4D3E]/10 shadow-sm flex flex-col" style={{ height: "500px" }}>
      <div className="p-4 border-b border-[#1B4D3E]/5 flex items-center gap-2">
        <Sparkles size={16} style={{ color: "#B48C4C" }} />
        <h3 className="text-sm font-bold" style={{ color: "#1B4D3E" }}>BizDoc AI — Compliance Assistant</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Sparkles size={32} className="opacity-20" />
            <p className="text-sm opacity-50 text-center">Ask about Nigerian compliance regulations, get suggestions, or draft communications.</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(prompt); }}
                  className="text-[12px] px-3 py-1.5 rounded-full border border-[#1B4D3E]/10 hover:border-[#B48C4C] hover:bg-[#FFFAF6] transition-colors"
                  style={{ color: "#1B4D3E" }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] ${
                  msg.role === "user"
                    ? "rounded-tr-sm"
                    : "rounded-tl-sm border border-[#1B4D3E]/5"
                }`}
                style={{
                  backgroundColor: msg.role === "user" ? "#1B4D3E" : "#FFFAF6",
                  color: msg.role === "user" ? "#FFFAF6" : "#1A1A1A",
                }}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm border border-[#1B4D3E]/5 px-4 py-3" style={{ backgroundColor: "#FFFAF6" }}>
              <Loader2 size={16} className="animate-spin" style={{ color: "#B48C4C" }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#1B4D3E]/5 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about compliance, regulations, next steps..."
          className="flex-1 bg-[#FFFAF6] border-[#1B4D3E]/10"
          disabled={chatMutation.isPending}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || chatMutation.isPending}
          style={{ backgroundColor: "#1B4D3E", color: "#B48C4C" }}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  "Not Started":      { bg: "rgba(44,44,44,0.06)",  text: "#6B7280", label: "Not Started" },
  "In Progress":      { bg: "rgba(59,130,246,0.08)", text: "#3B82F6", label: "In Progress" },
  "Waiting on Client":{ bg: "rgba(234,179,8,0.10)",  text: "#B45309", label: "Waiting" },
  "Submitted":        { bg: "rgba(201,169,126,0.15)", text: "#B48C4C", label: "Submitted" },
  "Completed":        { bg: "rgba(34,197,94,0.10)",  text: "#16A34A", label: "Completed" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_COLORS[status] || { bg: "rgba(44,44,44,0.06)", text: "#6B7280", label: status };
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2 rounded-lg" style={{ backgroundColor: `${color}10` }}>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-60">{label}</p>
    </div>
  );
}
