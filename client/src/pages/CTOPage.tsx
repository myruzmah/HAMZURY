/**
 * Systemise / CTO Work Dashboard
 * Route: /systemise/cto
 * Access: systemise_head (Hikma), tech_lead (Maryam Ashir / Lalo), founder
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  LogOut, Loader2, LayoutDashboard, Briefcase, Clock,
  CheckSquare, Activity, Send, AlertTriangle, Star,
  ChevronRight, FileText, Settings, Monitor,
  Code, Database, Globe, Layers, Zap,
} from "lucide-react";

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const SYS   = "#1E3A5F";
const MILK  = "#FAFAF8";
const WHITE = "#FFFFFF";
const DARK  = "#1A1A1A";

type Section = "overview" | "tasks" | "activity" | "tools";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",    icon: <LayoutDashboard size={16} /> },
  { id: "tasks",     label: "Client Work", icon: <Briefcase size={16} /> },
  { id: "activity",  label: "Activity",    icon: <Activity size={16} /> },
  { id: "tools",     label: "Tech Tools",  icon: <Settings size={16} /> },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Not Started":       { bg: "#6B728014", text: "#6B7280" },
  "In Progress":       { bg: "#3B82F614", text: "#3B82F6" },
  "Waiting on Client": { bg: "#EAB30814", text: "#B45309" },
  "Submitted":         { bg: "#8B5CF614", text: "#7C3AED" },
  "Completed":         { bg: "#22C55E14", text: "#16A34A" },
};

const TECH_TOOLS = [
  { label: "Systems Architecture",    desc: "Infrastructure maps, ERDs, system design docs",        icon: <Database size={16} />, color: SYS },
  { label: "Client CRM / Automation", desc: "Workflows, automations, client-facing tools",          icon: <Zap size={16} />,      color: "#7C3AED" },
  { label: "Websites & Portals",      desc: "Website builds, portal management, deployments",       icon: <Globe size={16} />,    color: "#0EA5E9" },
  { label: "Internal Software",       desc: "HAMZURY platform features, dashboards, integrations",  icon: <Code size={16} />,     color: TEAL },
  { label: "Digital Infrastructure",  desc: "Hosting, DNS, email systems, cloud services",          icon: <Monitor size={16} />,  color: "#10B981" },
  { label: "Project Tracker",         desc: "Active client projects, milestones, delivery dates",   icon: <Layers size={16} />,   color: "#F59E0B" },
];

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}10` }}>
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-50" style={{ color: DARK }}>{label}</span>
      </div>
      <p className="text-3xl font-bold" style={{ color: TEAL }}>{value}</p>
    </div>
  );
}

function TaskCard({ task, onSubmit, onUpdateStatus, isSubmitting }: {
  task: any; onSubmit: (id: number, notes: string) => void;
  onUpdateStatus: (id: number, status: string) => void; isSubmitting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes]       = useState(task.notes || "");
  const sc = STATUS_COLORS[task.status] || STATUS_COLORS["Not Started"];
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== "Completed";

  return (
    <div className="bg-white rounded-2xl border" style={{ borderColor: task.isRework ? "#F59E0B40" : `${TEAL}10` }}>
      {task.isRework && (
        <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold"
          style={{ backgroundColor: "#F59E0B18", color: "#B45309" }}>
          <AlertTriangle size={13} /> Needs Rework — CSO sent this back. Update notes and resubmit.
        </div>
      )}
      {task.kpiApproved && (
        <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold"
          style={{ backgroundColor: "#22C55E18", color: "#16A34A" }}>
          <Star size={13} /> CSO Approved — Smooth Task ✓
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono font-bold opacity-40" style={{ color: TEAL }}>{task.ref}</span>
              {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444418", color: "#EF4444" }}>Overdue</span>}
            </div>
            <p className="text-[15px] font-semibold" style={{ color: TEAL }}>{task.clientName}</p>
            <p className="text-[12px] opacity-50 mt-0.5">{task.service}{task.businessName ? ` · ${task.businessName}` : ""}</p>
            {task.deadline && (
              <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: isOverdue ? "#EF4444" : "#64748B" }}>
                <Clock size={10} /> Due {task.deadline}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>{task.status}</span>
            <button onClick={() => setExpanded(v => !v)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70"
              style={{ backgroundColor: `${TEAL}10`, color: TEAL }}>
              <ChevronRight size={14} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: `${TEAL}08` }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-40 mb-2" style={{ color: DARK }}>Update Status</p>
              <div className="flex flex-wrap gap-2">
                {(["Not Started", "In Progress", "Waiting on Client"] as const).map(s => (
                  <button key={s} onClick={() => onUpdateStatus(task.id, s)}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{
                      backgroundColor: task.status === s ? STATUS_COLORS[s].bg : `${TEAL}06`,
                      color: task.status === s ? STATUS_COLORS[s].text : TEAL,
                      border: `1px solid ${task.status === s ? STATUS_COLORS[s].text + "40" : TEAL + "12"}`,
                    }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-40 mb-2" style={{ color: DARK }}>Work Notes / Deliverable</p>
              <textarea rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="What was done, links to deliverables, deployed URLs, Drive docs, CRM config…"
                className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none resize-none"
                style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }} />
            </div>
            {task.status !== "Completed" && !task.kpiApproved && (
              <button onClick={() => onSubmit(task.id, notes)} disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: SYS, color: WHITE }}>
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit to CSO for Review
              </button>
            )}
            {task.status === "Submitted" && !task.kpiApproved && (
              <p className="text-center text-[12px] opacity-40" style={{ color: DARK }}>Submitted — waiting for CSO review…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CTOPage() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [statusFilter, setStatusFilter]   = useState<string>("all");
  const [submittingId, setSubmittingId]   = useState<number | null>(null);

  const tasksQuery    = trpc.tasks.list.useQuery({ department: "systemise" }, { refetchInterval: 15000 });
  const activityQuery = trpc.activity.recent.useQuery({ limit: 30 });
  const utils         = trpc.useUtils();

  const submitMut = trpc.tasks.submit.useMutation({
    onSuccess: () => { toast.success("Submitted to CSO for review"); utils.tasks.list.invalidate(); },
    onError:   () => toast.error("Failed to submit"),
  });
  const statusMut = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError:   () => toast.error("Failed to update status"),
  });

  const tasks    = tasksQuery.data || [];
  const activity = activityQuery.data || [];
  const filtered = useMemo(() =>
    statusFilter === "all" ? tasks : tasks.filter((t: any) => t.status === statusFilter),
  [tasks, statusFilter]);

  const active    = tasks.filter((t: any) => t.status !== "Completed");
  const done      = tasks.filter((t: any) => t.status === "Completed");
  const overdue   = active.filter((t: any) => t.deadline && new Date(t.deadline) < new Date());
  const submitted = tasks.filter((t: any) => t.status === "Submitted");

  function handleSubmit(id: number, notes: string) {
    setSubmittingId(id);
    submitMut.mutate({ id, notes }, { onSettled: () => setSubmittingId(null) });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
      <Loader2 className="animate-spin" size={32} style={{ color: GOLD }} />
    </div>
  );
  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="Systemise Dashboard — HAMZURY" description="Client tech projects." />

      {/* Sidebar */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: TEAL }}>
        <div className="flex items-center gap-3 px-4 py-5 border-b shrink-0" style={{ borderColor: `${GOLD}15` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${SYS}80` }}>
            <Monitor size={16} style={{ color: WHITE }} />
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: `${GOLD}80` }}>Systemise</p>
            <p className="text-[13px] font-semibold mt-0.5 truncate" style={{ color: MILK }}>{user.name?.split(" ")[0] ?? "Tech"}</p>
          </div>
        </div>
        <ScrollArea className="flex-1 py-3">
          <div className="flex flex-col gap-0.5 px-2">
            {SECTIONS.map(s => {
              const isActive = activeSection === s.id;
              const badge = s.id === "tasks" && submitted.length > 0 ? submitted.length : null;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all"
                  style={{ backgroundColor: isActive ? `${GOLD}18` : "transparent", color: isActive ? GOLD : `${MILK}70` }}>
                  <span className="shrink-0">{s.icon}</span>
                  <span className="hidden md:block text-[13px] font-medium truncate flex-1">{s.label}</span>
                  {badge && <span className="hidden md:flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: "#8B5CF6", color: WHITE }}>{badge}</span>}
                </button>
              );
            })}
          </div>
        </ScrollArea>
        <div className="px-2 pb-4 pt-2 border-t shrink-0" style={{ borderColor: `${GOLD}12` }}>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:opacity-80"
            style={{ color: `${MILK}50` }}>
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block text-[12px]">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b shrink-0"
          style={{ backgroundColor: WHITE, borderColor: `${TEAL}10` }}>
          <div>
            <h1 className="text-[15px] font-semibold" style={{ color: TEAL }}>{SECTIONS.find(s => s.id === activeSection)?.label}</h1>
            <p className="text-[11px] opacity-40" style={{ color: DARK }}>Systemise · Client Tech Projects</p>
          </div>
          {submitted.length > 0 && (
            <span className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: "#8B5CF618", color: "#7C3AED" }}>
              {submitted.length} awaiting CSO review
            </span>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-5xl mx-auto space-y-6">

            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Active"    value={active.length}    color="#3B82F6" icon={<Briefcase size={16} />} />
                  <StatCard label="Overdue"   value={overdue.length}   color="#EF4444" icon={<Clock size={16} />} />
                  <StatCard label="Submitted" value={submitted.length} color="#8B5CF6" icon={<Send size={16} />} />
                  <StatCard label="Done"      value={done.length}      color="#22C55E" icon={<CheckSquare size={16} />} />
                </div>
                <div className="bg-white rounded-2xl border" style={{ borderColor: `${TEAL}10` }}>
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: `${TEAL}08` }}>
                    <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Recent Client Work</h3>
                    <button onClick={() => setActiveSection("tasks")} className="text-[11px] font-bold uppercase tracking-wider opacity-40 hover:opacity-100" style={{ color: TEAL }}>View All</button>
                  </div>
                  <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
                    {tasks.length === 0
                      ? <p className="text-center text-[13px] opacity-30 p-8" style={{ color: TEAL }}>No tasks yet — CSO will assign client work here</p>
                      : tasks.slice(0, 5).map((t: any) => {
                        const sc = STATUS_COLORS[t.status] || STATUS_COLORS["Not Started"];
                        return (
                          <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold truncate" style={{ color: TEAL }}>{t.clientName}</p>
                              <p className="text-[11px] opacity-50 truncate">{t.service}</p>
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: sc.bg, color: sc.text }}>{t.status}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}10` }}>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider mb-4" style={{ color: TEAL }}>How It Works</h3>
                  {[
                    { n: "1", t: "CSO assigns client brief", d: "Task appears in Client Work tab with full brief" },
                    { n: "2", t: "You work on it",           d: "Update status, add work notes, link deliverables" },
                    { n: "3", t: "Submit for CSO review",    d: "Click Submit — CSO approves or sends back for rework" },
                    { n: "4", t: "CSO delivers to client",   d: "Approved → CSO closes the loop with the client" },
                  ].map(({ n, t, d }) => (
                    <div key={n} className="flex gap-3 mb-4 last:mb-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                        style={{ backgroundColor: `${SYS}20`, color: SYS }}>{n}</div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: TEAL }}>{t}</p>
                        <p className="text-[12px] opacity-50 mt-0.5" style={{ color: DARK }}>{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "tasks" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {["all", "Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
                      style={{ backgroundColor: statusFilter === s ? TEAL : "transparent", color: statusFilter === s ? GOLD : TEAL, border: `1px solid ${TEAL}20` }}>
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>
                {tasksQuery.isLoading ? (
                  <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${TEAL}10` }}>
                    <Loader2 className="animate-spin mx-auto" size={24} style={{ color: GOLD }} />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl border p-14 text-center" style={{ borderColor: `${TEAL}10` }}>
                    <Briefcase size={40} className="mx-auto mb-4 opacity-20" style={{ color: TEAL }} />
                    <p className="text-[14px] opacity-40" style={{ color: TEAL }}>
                      {statusFilter === "all" ? "No client tasks yet — CSO will assign work here" : `No ${statusFilter} tasks`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((t: any) => (
                      <TaskCard key={t.id} task={t} onSubmit={handleSubmit}
                        onUpdateStatus={(id, status) => statusMut.mutate({ id, status: status as any })}
                        isSubmitting={submittingId === t.id} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "activity" && (
              <div className="bg-white rounded-2xl border" style={{ borderColor: `${TEAL}10` }}>
                <div className="p-4 border-b" style={{ borderColor: `${TEAL}08` }}>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Activity Log</h3>
                </div>
                <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
                  {activity.length === 0
                    ? <p className="text-center text-[13px] opacity-30 p-10" style={{ color: TEAL }}>No activity yet</p>
                    : activity.map((a: any) => (
                      <div key={a.id} className="px-4 py-3 flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${TEAL}08` }}>
                          <Activity size={12} style={{ color: GOLD }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: TEAL }}>{a.action.replace(/_/g, " ")}</p>
                          {a.details && <p className="text-[12px] opacity-50 mt-0.5">{a.details}</p>}
                          <p className="text-[11px] opacity-30 mt-1">
                            {new Date(a.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeSection === "tools" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {TECH_TOOLS.map(tool => (
                    <div key={tool.label} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}10` }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${tool.color}12`, color: tool.color }}>{tool.icon}</div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: TEAL }}>{tool.label}</p>
                          <p className="text-[12px] opacity-50 mt-0.5" style={{ color: DARK }}>{tool.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}10` }}>
                  <p className="text-[13px] font-semibold mb-3 flex items-center gap-2" style={{ color: TEAL }}>
                    <FileText size={14} style={{ color: GOLD }} /> Deliverable Format
                  </p>
                  <ul className="space-y-2 text-[12px] opacity-60" style={{ color: DARK }}>
                    <li>• Document all deliverables in task work notes before submitting to CSO</li>
                    <li>• Include live URLs, Google Drive links, or platform access instructions</li>
                    <li>• Websites: domain, hosting provider, login details, handover guide</li>
                    <li>• Automations: tool used, workflow ID, trigger conditions, test confirmation</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
