import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, LogOut, ArrowLeft, Users, FileSearch,
  CheckCircle2, Clock, AlertCircle, Send, Activity,
  Briefcase, Building2, GraduationCap, MessageSquare,
  TrendingUp, CalendarCheck, DollarSign, Wallet, UserPlus,
  Zap, ExternalLink, FileText, FolderOpen, Link2, Plus,
  Bell, CalendarDays, ChevronRight, LayoutDashboard, Target,
  Phone, RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";

// ─── Palette (CSO = general/federal → Apple grey) ────────────────────────────
const TEAL  = "#2D2D2D";   // Apple grey — general departments
const GOLD  = "#B48C4C";
const MILK  = "#FFFAF6";   // Milk white
const WHITE = "#FFFFFF";
const DARK  = "#1A1A1A";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section =
  | "overview"
  | "discovery"
  | "assign"
  | "review"
  | "pipeline"
  | "tasks"
  | "activity"
  | "attendance"
  | "commissions"
  | "helpers"
  | "quickaccess"
  | "updates"
  | "calendar"
  | "subscriptions";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "overview",    label: "Overview",       icon: <LayoutDashboard size={16} /> },
  { id: "discovery",   label: "Discovery",      icon: <Target size={16} /> },
  { id: "assign",      label: "Assign Leads",   icon: <Send size={16} /> },
  { id: "review",      label: "Pending Review", icon: <CheckCircle2 size={16} /> },
  { id: "pipeline",    label: "Lead Pipeline",  icon: <FileSearch size={16} /> },
  { id: "tasks",       label: "All Tasks",      icon: <Briefcase size={16} /> },
  { id: "activity",    label: "Activity",       icon: <Activity size={16} /> },
  { id: "attendance",  label: "Attendance",     icon: <CalendarCheck size={16} /> },
  { id: "commissions", label: "Commissions",    icon: <Wallet size={16} /> },
  { id: "helpers",     label: "Helpers",        icon: <UserPlus size={16} /> },
  { id: "quickaccess", label: "Quick Access",   icon: <Zap size={16} /> },
  { id: "updates",     label: "Dept Updates",   icon: <Bell size={16} /> },
  { id: "calendar",    label: "Calendar",       icon: <CalendarDays size={16} /> },
  { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw size={16} /> },
];

const DEPARTMENTS = [
  { value: "bizdoc",    label: "BizDoc — Compliance",    color: BRAND.bizdoc },
  { value: "systemise", label: "Systemise — Tech/Ops",   color: BRAND.systemise },
  { value: "media",     label: "Media — Content/Brand",  color: "#7C3AED" },
  { value: "skills",    label: "Skills — Talent",        color: BRAND.skills },
];

const SERVICE_OPTIONS = [
  { value: "CAC Registration", dept: "bizdoc" },
  { value: "Tax Compliance", dept: "bizdoc" },
  { value: "Sector Licence", dept: "bizdoc" },
  { value: "Legal Documents", dept: "bizdoc" },
  { value: "Foreign Business", dept: "bizdoc" },
  { value: "Brand Identity", dept: "systemise" },
  { value: "Website", dept: "systemise" },
  { value: "Social Media", dept: "systemise" },
  { value: "CRM", dept: "systemise" },
  { value: "AI Agent", dept: "systemise" },
  { value: "Training", dept: "skills" },
  { value: "Full Business Setup", dept: "bizdoc" },
  { value: "Other", dept: "bizdoc" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Not Started":      { bg: "rgba(107,114,128,0.08)", text: "#6B7280" },
  "In Progress":      { bg: "rgba(59,130,246,0.10)",  text: "#3B82F6" },
  "Waiting on Client":{ bg: "rgba(234,179,8,0.12)",   text: "#B45309" },
  "Submitted":        { bg: "rgba(139,92,246,0.10)",  text: "#7C3AED" },
  "Completed":        { bg: "rgba(34,197,94,0.10)",   text: "#16A34A" },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CSODashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [selectedDept, setSelectedDept]   = useState<Record<number, string>>({});
  const [taskDeptFilter, setTaskDeptFilter] = useState<string>("all");

  const leadsQuery      = trpc.leads.list.useQuery(undefined,  { refetchInterval: 20000 });
  const unassignedQuery = trpc.leads.unassigned.useQuery(undefined, { refetchInterval: 10000 });
  const statsQuery      = trpc.tasks.stats.useQuery({ refetchInterval: 30000 } as any);
  const activityQuery   = trpc.activity.recent.useQuery({ limit: 40 });
  const tasksQuery      = trpc.tasks.list.useQuery(undefined,  { refetchInterval: 20000 });
  const attendanceQuery = trpc.attendance.byDate.useQuery(
    { date: new Date().toISOString().split("T")[0] },
    { refetchInterval: 30000 },
  );
  const staffQuery        = trpc.staff.list.useQuery(undefined, { refetchInterval: 60000 });
  const appointmentsQuery = trpc.systemise.appointments.useQuery(undefined, { refetchInterval: 30000 });

  const assignMutation = trpc.leads.assign.useMutation({
    onSuccess: () => {
      toast.success("Lead assigned successfully");
      unassignedQuery.refetch();
      leadsQuery.refetch();
    },
    onError: () => toast.error("Failed to assign lead"),
  });

  // Manual lead creation
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", businessName: "", phone: "", email: "", service: "", department: "bizdoc", notes: "", totalAmount: "", depositPaid: "" });
  const createLeadMutation = trpc.leads.createManual.useMutation({
    onSuccess: (result) => {
      toast.success(`Lead created — Ref: ${result.ref}`);
      setShowCreateLead(false);
      setNewLead({ name: "", businessName: "", phone: "", email: "", service: "", department: "bizdoc", notes: "", totalAmount: "", depositPaid: "" });
      unassignedQuery.refetch();
      leadsQuery.refetch();
    },
    onError: () => toast.error("Failed to create lead"),
  });

  const pendingQuery = trpc.tasks.pending.useQuery(undefined, { refetchInterval: 15000 });
  const approveMutation = trpc.tasks.approve.useMutation({
    onSuccess: () => { toast.success("Task approved — counted as smooth task"); pendingQuery.refetch(); tasksQuery.refetch(); },
    onError: () => toast.error("Failed to approve task"),
  });
  const reworkMutation = trpc.tasks.flagRework.useMutation({
    onSuccess: () => { toast.success("Task sent back for rework"); pendingQuery.refetch(); },
    onError: () => toast.error("Failed to flag task"),
  });
  const [reworkNotes, setReworkNotes] = useState<Record<number, string>>({});

  // Quick entry form
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntry, setQuickEntry] = useState({ name: "", phone: "", service: "", department: "bizdoc", notes: "" });
  const quickEntryMutation = trpc.leads.createManual.useMutation({
    onSuccess: (result) => {
      toast.success(`Client created — Ref: ${result.ref}`);
      setShowQuickEntry(false);
      setQuickEntry({ name: "", phone: "", service: "", department: "bizdoc", notes: "" });
      leadsQuery.refetch();
      unassignedQuery.refetch();
    },
    onError: () => toast.error("Failed to create client"),
  });

  const utils = trpc.useUtils();
  const subsQuery = trpc.subscriptions.list.useQuery(undefined, { refetchInterval: 30000 });
  const createSubMutation = trpc.subscriptions.create.useMutation({
    onSuccess: () => { utils.subscriptions.list.invalidate(); toast.success("Subscription created"); setShowNewSub(false); },
    onError: () => toast.error("Failed to create subscription"),
  });
  const createMonthlyTaskMutation = trpc.subscriptions.createMonthlyTask.useMutation({
    onSuccess: (d) => { utils.subscriptions.list.invalidate(); toast.success(`Monthly task created — ref: ${d.ref}`); },
    onError: (e) => toast.error(e.message),
  });
  const [showNewSub, setShowNewSub] = useState(false);
  const [newSub, setNewSub] = useState({ clientName: "", businessName: "", phone: "", service: "Tax Pro Max Monthly", department: "bizdoc", monthlyFee: 15000, startDate: new Date().toISOString().slice(0, 10) });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={32} style={{ color: GOLD }} />
      </div>
    );
  }
  if (!user) return null;

  const stats         = statsQuery.data;
  const unassigned    = unassignedQuery.data || [];
  const allLeads      = leadsQuery.data || [];
  const recentActivity = activityQuery.data || [];
  const allTasks      = tasksQuery.data || [];
  const attendance    = attendanceQuery.data || [];
  const pendingTasks  = pendingQuery.data || [];

  const filteredTasks = taskDeptFilter === "all"
    ? allTasks
    : allTasks.filter((t: any) => t.department === taskDeptFilter);

  const newPayments = allLeads.filter((l: any) => l.source === "chat_payment" && l.status === "new");

  // Overdue follow-up leads (created 3+ days ago, still in new/contacted status)
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const overdueLeads = allLeads.filter((l: any) => {
    if (!l.createdAt) return false;
    const created = new Date(l.createdAt).getTime();
    return created < threeDaysAgo && (l.status === "new" || l.status === "contacted");
  });

  const handleAssign = (leadId: number) => {
    const dept = selectedDept[leadId];
    if (!dept) { toast.error("Please select a department"); return; }
    assignMutation.mutate({ leadId, department: dept });
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection);
  const staffList = staffQuery.data || [];
  const realAppointments = appointmentsQuery.data || [];
  const unreadUpdates = MOCK_UPDATES.filter(u => !u.acknowledged).length;

  function renderSubscriptions() {
    const subs = subsQuery.data || [];
    const currentMonth = new Date().toISOString().slice(0, 7);
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: TEAL }}>Subscription Clients</h2>
            <p className="text-[12px] opacity-50 mt-0.5" style={{ color: TEAL }}>{subs.filter(s => s.status === "active").length} active · Monthly recurring services</p>
          </div>
          <button
            onClick={() => setShowNewSub(!showNewSub)}
            className="text-[12px] px-4 py-2 rounded-xl font-medium"
            style={{ backgroundColor: TEAL, color: GOLD }}
          >
            + New Subscription
          </button>
        </div>

        {showNewSub && (
          <div className="rounded-2xl p-5 border space-y-3" style={{ borderColor: `${TEAL}15`, backgroundColor: `${TEAL}04` }}>
            <p className="text-[13px] font-semibold mb-2" style={{ color: TEAL }}>New Subscription</p>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Client Name *" value={newSub.clientName} onChange={e => setNewSub(p => ({ ...p, clientName: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="Business Name" value={newSub.businessName} onChange={e => setNewSub(p => ({ ...p, businessName: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="Phone" value={newSub.phone} onChange={e => setNewSub(p => ({ ...p, phone: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input placeholder="Service" value={newSub.service} onChange={e => setNewSub(p => ({ ...p, service: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input type="number" placeholder="Monthly Fee (₦)" value={newSub.monthlyFee} onChange={e => setNewSub(p => ({ ...p, monthlyFee: Number(e.target.value) }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
              <input type="date" value={newSub.startDate} onChange={e => setNewSub(p => ({ ...p, startDate: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => createSubMutation.mutate(newSub)}
                disabled={!newSub.clientName || createSubMutation.isPending}
                className="px-5 py-2 rounded-xl text-[13px] font-medium disabled:opacity-40"
                style={{ backgroundColor: TEAL, color: GOLD }}
              >
                {createSubMutation.isPending ? "Creating…" : "Create Subscription"}
              </button>
              <button onClick={() => setShowNewSub(false)} className="px-4 py-2 rounded-xl text-[13px] opacity-50" style={{ color: TEAL }}>Cancel</button>
            </div>
          </div>
        )}

        {subs.length === 0 ? (
          <div className="text-center py-12 opacity-40 text-[13px]" style={{ color: TEAL }}>
            No subscriptions yet — create one above
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map(sub => (
              <div key={sub.id} className="rounded-2xl p-5 border" style={{ borderColor: `${TEAL}12`, backgroundColor: WHITE }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-medium" style={{ color: TEAL }}>{sub.clientName}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${sub.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-[12px] opacity-50 mt-0.5" style={{ color: TEAL }}>{sub.businessName} · {sub.service}</p>
                  </div>
                  <span className="text-[14px] font-light" style={{ color: GOLD }}>₦{Number(sub.monthlyFee).toLocaleString()}/mo</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => createMonthlyTaskMutation.mutate({ subscriptionId: sub.id, month: currentMonth })}
                    disabled={createMonthlyTaskMutation.isPending}
                    className="text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all"
                    style={{ backgroundColor: `${TEAL}10`, color: TEAL }}
                  >
                    + Create {currentMonth} Task
                  </button>
                  <span className="text-[11px] opacity-30" style={{ color: TEAL }}>Started {sub.startDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="CSO Dashboard — HAMZURY" description="Client success operations dashboard for HAMZURY." />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className="w-16 md:w-60 flex flex-col h-full shrink-0 transition-all duration-200"
        style={{ backgroundColor: TEAL }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b shrink-0" style={{ borderColor: `${GOLD}15` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD }}>
            <FileSearch size={16} style={{ color: TEAL }} />
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase leading-none" style={{ color: `${GOLD}80` }}>
              CSO Hub
            </p>
            <p className="text-[13px] font-semibold leading-tight mt-0.5 truncate" style={{ color: MILK }}>
              Strategy Office
            </p>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <div className="flex flex-col gap-0.5 px-2">
            {SECTIONS.map(s => {
              const isActive = activeSection === s.id;
              const hasBadge = s.id === "assign" && unassigned.length > 0;
              const hasReviewBadge = s.id === "review" && pendingTasks.length > 0;
              const hasUpdBadge = s.id === "updates" && unreadUpdates > 0;
              const hasPaymentBadge = s.id === "pipeline" && newPayments.length > 0;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all"
                  style={{
                    backgroundColor: isActive ? `${GOLD}18` : "transparent",
                    color: isActive ? GOLD : `${MILK}70`,
                  }}
                >
                  <span className="shrink-0">{s.icon}</span>
                  <span className="hidden md:block text-[13px] font-medium truncate flex-1">{s.label}</span>
                  {(hasBadge || hasUpdBadge || hasReviewBadge) && (
                    <span
                      className="hidden md:flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: hasReviewBadge ? "#F59E0B" : "#EF4444", color: WHITE }}
                    >
                      {hasBadge ? unassigned.length : hasReviewBadge ? pendingTasks.length : unreadUpdates}
                    </span>
                  )}
                  {hasPaymentBadge && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse hidden md:inline-flex"
                      style={{ backgroundColor: "#B48C4C", color: "#2563EB" }}>
                      {newPayments.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-2 pb-4 pt-2 border-t shrink-0 space-y-1" style={{ borderColor: `${GOLD}12` }}>
          <Link href="/">
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all"
              style={{ color: `${MILK}50` }}
            >
              <ArrowLeft size={16} className="shrink-0" />
              <span className="hidden md:block text-[12px]">Back to HAMZURY</span>
            </button>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all hover:opacity-80"
            style={{ color: `${MILK}50` }}
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block text-[12px]">Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── Main Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3.5 border-b shrink-0"
          style={{ backgroundColor: WHITE, borderColor: `${TEAL}10` }}
        >
          <div>
            <h1 className="text-[15px] font-semibold" style={{ color: TEAL }}>
              {currentSection?.label}
            </h1>
            <p className="text-[11px] opacity-40" style={{ color: DARK }}>
              CSO Hub · Strategy & Operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickEntry(!showQuickEntry)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                backgroundColor: showQuickEntry ? `${TEAL}12` : TEAL,
                color: showQuickEntry ? TEAL : WHITE,
                border: showQuickEntry ? `1px solid ${TEAL}30` : "1px solid transparent",
              }}
            >
              <UserPlus size={13} />
              <span className="hidden sm:inline">{showQuickEntry ? "Close" : "New Client"}</span>
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px]"
              style={{ backgroundColor: `${TEAL}10`, color: TEAL }}
            >
              {(user.name || "C").charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-[12px] font-semibold leading-none" style={{ color: TEAL }}>
                {user.name || "CSO"}
              </p>
              <p className="text-[10px] opacity-40 mt-0.5" style={{ color: DARK }}>
                Chief Strategy Officer
              </p>
            </div>
          </div>
        </div>

        {/* Quick Entry Form */}
        {showQuickEntry && (
          <div className="px-6 py-3 border-b shrink-0" style={{ backgroundColor: `${TEAL}04`, borderColor: `${TEAL}10` }}>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: `${TEAL}60` }}>Name *</label>
                  <input
                    placeholder="Client name"
                    value={quickEntry.name}
                    onChange={e => setQuickEntry(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                    style={{ borderColor: `${TEAL}20` }}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: `${TEAL}60` }}>Phone *</label>
                  <input
                    placeholder="080..."
                    value={quickEntry.phone}
                    onChange={e => setQuickEntry(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                    style={{ borderColor: `${TEAL}20` }}
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: `${TEAL}60` }}>Service *</label>
                  <select
                    value={quickEntry.service}
                    onChange={e => {
                      const svc = e.target.value;
                      const match = SERVICE_OPTIONS.find(s => s.value === svc);
                      setQuickEntry(p => ({ ...p, service: svc, department: match?.dept || p.department }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none bg-white"
                    style={{ borderColor: `${TEAL}20` }}
                  >
                    <option value="">Select service...</option>
                    {SERVICE_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.value}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[110px]">
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: `${TEAL}60` }}>Dept</label>
                  <select
                    value={quickEntry.department}
                    onChange={e => setQuickEntry(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none bg-white"
                    style={{ borderColor: `${TEAL}20` }}
                  >
                    <option value="bizdoc">BizDoc</option>
                    <option value="systemise">Systemise</option>
                    <option value="skills">Skills</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: `${TEAL}60` }}>Notes</label>
                  <input
                    placeholder="Optional notes"
                    value={quickEntry.notes}
                    onChange={e => setQuickEntry(p => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                    style={{ borderColor: `${TEAL}20` }}
                  />
                </div>
                <button
                  onClick={() => {
                    if (!quickEntry.name || !quickEntry.phone || !quickEntry.service) {
                      toast.error("Name, Phone, and Service are required");
                      return;
                    }
                    quickEntryMutation.mutate({
                      name: quickEntry.name,
                      phone: quickEntry.phone,
                      service: quickEntry.service,
                      department: quickEntry.department,
                      notes: quickEntry.notes || undefined,
                    });
                  }}
                  disabled={quickEntryMutation.isPending}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold shrink-0 transition-opacity"
                  style={{ backgroundColor: TEAL, color: GOLD, opacity: quickEntryMutation.isPending ? 0.6 : 1 }}
                >
                  {quickEntryMutation.isPending ? "Saving..." : "Add Client"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-7xl mx-auto">

            {/* Overdue follow-up alert */}
            {overdueLeads.length > 0 && (
              <div className="mb-4 p-3 rounded-xl flex items-center gap-3 text-[13px]" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                <span className="font-semibold">{overdueLeads.length} lead{overdueLeads.length > 1 ? "s" : ""} need follow-up</span>
                <span className="opacity-60">— not contacted in 3+ days</span>
                <div className="flex-1" />
                <span className="text-[11px] opacity-50">{overdueLeads.map((l: any) => l.name).join(", ")}</span>
              </div>
            )}

            {/* ── Overview ── */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                {/* Create Lead Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCreateLead(!showCreateLead)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                    style={{ backgroundColor: showCreateLead ? `${TEAL}15` : TEAL, color: showCreateLead ? DARK : WHITE }}
                  >
                    <Plus size={14} /> {showCreateLead ? "Cancel" : "Create Lead"}
                  </button>
                </div>

                {/* Create Lead Form */}
                {showCreateLead && (
                  <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: `${TEAL}20`, backgroundColor: WHITE }}>
                    <p className="text-[13px] font-semibold" style={{ color: DARK }}>New Lead (CSO Manual Entry)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input placeholder="Client Name *" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                      <input placeholder="Business Name" value={newLead.businessName} onChange={e => setNewLead(p => ({ ...p, businessName: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                      <input placeholder="Phone" value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                      <input placeholder="Email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                      <input placeholder="Service Needed *" value={newLead.service} onChange={e => setNewLead(p => ({ ...p, service: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                      <select value={newLead.department} onChange={e => setNewLead(p => ({ ...p, department: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none bg-white" style={{ borderColor: `${TEAL}20` }}>
                        <option value="bizdoc">BizDoc</option>
                        <option value="systemise">Systemise</option>
                        <option value="skills">Skills</option>
                        <option value="media">Media</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input placeholder="Total Amount (₦)" value={newLead.totalAmount} onChange={e => setNewLead(p => ({ ...p, totalAmount: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                      <input placeholder="Deposit Paid (₦)" value={newLead.depositPaid} onChange={e => setNewLead(p => ({ ...p, depositPaid: e.target.value }))}
                        className="px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: `${TEAL}20` }} />
                    </div>
                    <textarea placeholder="Notes / Context" value={newLead.notes} onChange={e => setNewLead(p => ({ ...p, notes: e.target.value }))}
                      rows={2} className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none resize-none" style={{ borderColor: `${TEAL}20` }} />
                    <button
                      onClick={() => {
                        if (newLead.name && newLead.service) {
                          const fullNotes = [
                            newLead.totalAmount ? `Total: ₦${newLead.totalAmount}` : "",
                            newLead.depositPaid ? `Deposit: ₦${newLead.depositPaid}` : "",
                            newLead.notes
                          ].filter(Boolean).join(". ");
                          createLeadMutation.mutate({ ...newLead, notes: fullNotes, quotedPrice: newLead.totalAmount || undefined });
                        } else toast.error("Name and Service are required");
                      }}
                      disabled={createLeadMutation.isPending}
                      className="px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity"
                      style={{ backgroundColor: TEAL, color: WHITE, opacity: createLeadMutation.isPending ? 0.6 : 1 }}
                    >
                      {createLeadMutation.isPending ? "Creating..." : "Create Lead & Assign"}
                    </button>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard label="Total Leads"  value={allLeads.length}                                color={GOLD}     icon={<Users size={16} />} />
                  <StatCard label="Unassigned"   value={unassigned.length}                             color="#EF4444"  icon={<AlertCircle size={16} />} urgent={unassigned.length > 0} />
                  <StatCard label="Active Tasks" value={(stats?.totalTasks ?? 0) - (stats?.completed ?? 0)} color="#3B82F6" icon={<TrendingUp size={16} />} />
                  <StatCard label="In Progress"  value={stats?.inProgress ?? 0}                        color="#8B5CF6"  icon={<Clock size={16} />} />
                  <StatCard label="Waiting"      value={stats?.waitingOnClient ?? 0}                   color="#EAB308"  icon={<AlertCircle size={16} />} />
                  <StatCard label="Completed"    value={stats?.completed ?? 0}                         color="#22C55E"  icon={<CheckCircle2 size={16} />} />
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Assign New Lead",   section: "assign" as Section,      icon: <Send size={18} />,          badge: unassigned.length > 0 ? unassigned.length : null },
                    { label: "Pending Review",    section: "review" as Section,      icon: <CheckCircle2 size={18} />,  badge: pendingTasks.length > 0 ? pendingTasks.length : null },
                    { label: "Lead Pipeline",     section: "pipeline" as Section,    icon: <FileSearch size={18} />,    badge: null },
                    { label: "Dept Updates",      section: "updates" as Section,     icon: <Bell size={18} />,          badge: unreadUpdates > 0 ? unreadUpdates : null },
                  ].map(item => (
                    <button
                      key={item.section}
                      onClick={() => setActiveSection(item.section)}
                      className="relative p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] hover:shadow-sm"
                      style={{ backgroundColor: WHITE, borderColor: `${TEAL}10` }}
                    >
                      {item.badge !== null && (
                        <span
                          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: "#EF4444", color: WHITE }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${TEAL}08` }}>
                        <span style={{ color: TEAL }}>{item.icon}</span>
                      </div>
                      <p className="text-[13px] font-semibold" style={{ color: TEAL }}>{item.label}</p>
                    </button>
                  ))}
                </div>

                {/* Recent activity preview */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: TEAL }}>
                      <Activity size={14} style={{ color: GOLD }} /> Recent Activity
                    </h3>
                    <button
                      onClick={() => setActiveSection("activity")}
                      className="text-[11px] font-bold uppercase tracking-wider opacity-40 hover:opacity-100"
                      style={{ color: TEAL }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).length === 0 ? (
                      <p className="text-[13px] opacity-30 text-center py-4" style={{ color: TEAL }}>No recent activity</p>
                    ) : recentActivity.slice(0, 5).map((a: any) => (
                      <div key={a.id} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${TEAL}08` }}>
                          <Activity size={12} style={{ color: GOLD }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: TEAL }}>{a.action.replace(/_/g, " ")}</p>
                          <p className="text-[11px] opacity-30 mt-0.5">{new Date(a.createdAt).toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Discovery ── */}
            {activeSection === "discovery" && <DiscoveryView />}

            {/* ── Assign Leads ── */}
            {activeSection === "assign" && (
              <AssignmentPanel
                leads={unassigned}
                totalLeads={allLeads.length}
                selectedDept={selectedDept}
                setSelectedDept={setSelectedDept}
                handleAssign={handleAssign}
                isPending={assignMutation.isPending}
              />
            )}

            {/* ── Pending Review ── */}
            {activeSection === "review" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} style={{ color: "#F59E0B" }} />
                  <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>
                    Department Submissions — {pendingTasks.length} awaiting your review
                  </h2>
                </div>
                {pendingQuery.isLoading ? (
                  <div className="bg-white rounded-2xl p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <Loader2 className="animate-spin mx-auto" size={24} style={{ color: GOLD }} />
                  </div>
                ) : pendingTasks.length === 0 ? (
                  <div className="bg-white rounded-2xl p-14 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: "#22C55E", opacity: 0.3 }} />
                    <p className="text-[15px] font-medium opacity-50" style={{ color: TEAL }}>No pending reviews</p>
                    <p className="text-[12px] opacity-30 mt-2">Submitted department work will appear here for your approval.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.map((task: any) => {
                      const dept = DEPARTMENTS.find(d => d.value === task.department);
                      return (
                        <div key={task.id} className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded opacity-50" style={{ backgroundColor: `${TEAL}08`, color: TEAL }}>{task.ref}</span>
                                {dept && (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${dept.color}18`, color: dept.color }}>
                                    {dept.label.split(" — ")[0]}
                                  </span>
                                )}
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#8B5CF618", color: "#7C3AED" }}>Submitted</span>
                              </div>
                              <p className="text-[15px] font-semibold" style={{ color: TEAL }}>{task.clientName}</p>
                              <p className="text-[12px] opacity-50 mt-0.5">{task.service}{task.businessName ? ` · ${task.businessName}` : ""}</p>
                              {task.notes && (
                                <p className="text-[12px] mt-2 p-3 rounded-xl opacity-60 line-clamp-3" style={{ backgroundColor: `${TEAL}05`, color: DARK }}>
                                  {task.notes}
                                </p>
                              )}
                              {task.deadline && (
                                <p className="text-[11px] mt-2 opacity-40" style={{ color: DARK }}>
                                  Deadline: {task.deadline}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 shrink-0 md:w-52">
                              <button
                                onClick={() => approveMutation.mutate({ id: task.id })}
                                disabled={approveMutation.isPending}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: "#22C55E", color: WHITE }}
                              >
                                <CheckCircle2 size={14} />
                                Approve &amp; Deliver
                              </button>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Rework reason…"
                                  value={reworkNotes[task.id] || ""}
                                  onChange={e => setReworkNotes(p => ({ ...p, [task.id]: e.target.value }))}
                                  className="flex-1 min-w-0 px-3 py-2 text-[12px] rounded-xl border outline-none"
                                  style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
                                />
                                <button
                                  onClick={() => reworkMutation.mutate({ id: task.id, reason: reworkNotes[task.id] })}
                                  disabled={reworkMutation.isPending}
                                  className="px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
                                  style={{ backgroundColor: "#F59E0B18", color: "#B45309", border: "1px solid #F59E0B30" }}
                                >
                                  Rework
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Lead Pipeline ── */}
            {activeSection === "pipeline" && (
              <div className="space-y-4">
                {newPayments.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl border-l-4" style={{ backgroundColor: "#B48C4C15", borderColor: "#B48C4C" }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#2563EB" }}>
                      🔔 {newPayments.length} New Payment{newPayments.length > 1 ? "s" : ""} — Action Required
                    </p>
                    {newPayments.map((lead: any) => (
                      <div key={lead.id} className="text-xs py-1.5 border-b last:border-0" style={{ borderColor: "#B48C4C30", color: "#2C2C2C" }}>
                        <span className="font-semibold">{lead.name}</span>
                        <span className="opacity-60 ml-2">{lead.phone}</span>
                        <span className="ml-2 font-mono opacity-70">{lead.ref}</span>
                      </div>
                    ))}
                  </div>
                )}
                <LeadPipeline leads={allLeads} />
              </div>
            )}

            {/* ── All Tasks ── */}
            {activeSection === "tasks" && (
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: `${TEAL}08` }}>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: TEAL }}>
                    <Briefcase size={15} style={{ color: GOLD }} /> Task Queue — All Departments
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {["all", "bizdoc", "systemise", "media", "skills"].map(d => (
                      <button
                        key={d}
                        onClick={() => setTaskDeptFilter(d)}
                        className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
                        style={{
                          backgroundColor: taskDeptFilter === d ? TEAL : "transparent",
                          color: taskDeptFilter === d ? GOLD : TEAL,
                          border: `1px solid ${TEAL}20`,
                        }}
                      >
                        {d === "all" ? "All" : d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
                  {filteredTasks.length === 0 ? (
                    <p className="text-center text-[13px] opacity-40 p-10" style={{ color: TEAL }}>No tasks found</p>
                  ) : filteredTasks.map((task: any) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Activity ── */}
            {activeSection === "activity" && (
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="p-4 border-b" style={{ borderColor: `${TEAL}08` }}>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: TEAL }}>
                    <Activity size={15} style={{ color: GOLD }} /> Recent Activity
                  </h3>
                </div>
                <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
                  {recentActivity.length === 0 ? (
                    <p className="text-center text-[13px] opacity-40 p-10" style={{ color: TEAL }}>No recent activity</p>
                  ) : recentActivity.map((a: any) => (
                    <div key={a.id} className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${TEAL}08` }}>
                        <Activity size={13} style={{ color: GOLD }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium" style={{ color: TEAL }}>{a.action.replace(/_/g, " ")}</p>
                        {a.details && <p className="text-[12px] opacity-50 mt-0.5 truncate">{a.details}</p>}
                        <p className="text-[11px] opacity-30 mt-1">{new Date(a.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Attendance ── */}
            {activeSection === "attendance" && (
              <AttendanceView attendance={attendance} isLoading={attendanceQuery.isLoading} />
            )}

            {/* ── Commissions ── */}
            {activeSection === "commissions" && <CommissionsView />}

            {/* ── Helpers ── */}
            {activeSection === "helpers" && <HelpersView staffList={staffList} />}

            {/* ── Quick Access ── */}
            {activeSection === "quickaccess" && <QuickAccessView />}

            {/* ── Dept Updates ── */}
            {activeSection === "updates" && <DeptUpdatesView />}

            {/* ── Calendar ── */}
            {activeSection === "calendar" && <CalendarView realAppointments={realAppointments} />}

            {/* ── Subscriptions ── */}
            {activeSection === "subscriptions" && renderSubscriptions()}

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon, urgent }: {
  label: string; value: number; color: string; icon: React.ReactNode; urgent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4 text-center transition-transform hover:-translate-y-0.5"
      style={{
        backgroundColor: WHITE,
        borderColor: urgent ? `${color}40` : `${TEAL}08`,
        boxShadow: urgent ? `0 0 0 1px ${color}20` : undefined,
      }}
    >
      <div className="flex justify-center mb-1.5" style={{ color }}>{icon}</div>
      <p className="text-[22px] font-bold leading-none" style={{ color }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-semibold opacity-40 mt-1" style={{ color: TEAL }}>{label}</p>
    </div>
  );
}

// ─── LEAD SCORE BADGE ─────────────────────────────────────────────────────────
function calcLeadScore(lead: any): number {
  let score = 0;
  if (lead.phone)  score += 2;
  if (lead.email)  score += 2;
  if (lead.service && lead.service.trim()) score += 2;
  if ((lead.source || "").toLowerCase().includes("referral")) score += 2;
  const rawValue = parseFloat(String(lead.value || "0").replace(/[^0-9.]/g, ""));
  if (rawValue > 200000) score += 2;
  return Math.min(score, 10);
}

function LeadScore({ lead }: { lead: any }) {
  const score = calcLeadScore(lead);
  const color =
    score >= 8 ? "#16A34A" :
    score >= 5 ? "#B45309" :
                 "#EF4444";
  const bg =
    score >= 8 ? "#22C55E18" :
    score >= 5 ? "#EAB30818" :
                 "#EF444418";
  return (
    <span
      title={`Lead score: ${score}/10`}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black shrink-0"
      style={{ backgroundColor: bg, color }}
    >
      {score}
    </span>
  );
}

// ─── TASK ROW ─────────────────────────────────────────────────────────────────
function TaskRow({ task }: { task: any }) {
  const [callNote, setCallNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const sc = STATUS_COLORS[task.status] || { bg: "#f3f4f6", text: "#6b7280" };
  const dept = DEPARTMENTS.find(d => d.value === task.department);
  return (
    <div className="px-4 py-3 flex flex-col gap-2 hover:bg-gray-50/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold tracking-wider font-mono opacity-40" style={{ color: TEAL }}>{task.ref}</span>
            {dept && (
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${dept.color}12`, color: dept.color }}>
                {dept.value}
              </span>
            )}
          </div>
          <p className="text-[14px] font-semibold truncate" style={{ color: TEAL }}>{task.clientName}</p>
          <p className="text-[12px] opacity-50 truncate">{task.service}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {task.deadline && (
            <span className="text-[11px] opacity-40 hidden sm:block">{task.deadline}</span>
          )}
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>
            {task.status}
          </span>
          <button
            onClick={() => setShowNote(v => !v)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: `${TEAL}10`, color: TEAL }}
            title="Log a call"
          >
            <Phone size={12} />
          </button>
        </div>
      </div>
      {showNote && (
        <div className="flex gap-2 items-center pl-1">
          <input
            type="text"
            placeholder="Log a call note…"
            value={callNote}
            onChange={e => setCallNote(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border text-[12px] outline-none"
            style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
          />
          <button
            onClick={() => {
              if (!callNote.trim()) { toast.error("Enter a note first"); return; }
              toast.success("Call logged");
              setCallNote("");
              setShowNote(false);
            }}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: TEAL, color: GOLD }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

// ─── LEAD PIPELINE ────────────────────────────────────────────────────────────
function LeadPipeline({ leads }: { leads: any[] }) {
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [quickDept, setQuickDept] = useState<Record<number, string>>({});

  const utils = trpc.useUtils();
  const quickAssign = trpc.leads.assign.useMutation({
    onSuccess: () => {
      toast.success("Lead assigned to department");
      setExpandedLead(null);
      utils.leads.list.invalidate();
      utils.leads.unassigned.invalidate();
    },
    onError: () => toast.error("Failed to assign lead"),
  });

  const groups = {
    new:       leads.filter(l => l.status === "new"),
    contacted: leads.filter(l => l.status === "contacted"),
    converted: leads.filter(l => l.status === "converted"),
    archived:  leads.filter(l => l.status === "archived"),
  };
  const dotColors: Record<string, string> = { new: "#3B82F6", contacted: "#EAB308", converted: "#22C55E", archived: "#9CA3AF" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Object.entries(groups).map(([status, items]) => (
        <div key={status} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: `${TEAL}06` }}>
            <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>
              {status} <span className="opacity-40">({items.length})</span>
            </h3>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColors[status] }} />
          </div>
          <ScrollArea className="max-h-[480px]">
            <div className="p-3 flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="text-center text-[12px] opacity-30 p-4" style={{ color: TEAL }}>Empty</p>
              ) : items.map((lead: any) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-xl border transition-all cursor-pointer"
                  style={{ borderColor: expandedLead === lead.id ? `${GOLD}40` : `${TEAL}08`, backgroundColor: expandedLead === lead.id ? `${GOLD}06` : `${TEAL}04` }}
                  onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold tracking-wider font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${TEAL}08`, color: TEAL }}>{lead.ref}</span>
                    <div className="flex items-center gap-1.5">
                      {lead.assignedDepartment && (
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>
                          {lead.assignedDepartment}
                        </span>
                      )}
                      <LeadScore lead={lead} />
                    </div>
                  </div>
                  <p className="font-semibold text-[13px]" style={{ color: TEAL }}>{lead.name}</p>
                  <p className="text-[11px] opacity-50 mt-0.5">{lead.service}</p>
                  {lead.phone && <p className="text-[10px] opacity-30 mt-1">{lead.phone}</p>}

                  {/* Inline quick-assign when expanded and unassigned */}
                  {expandedLead === lead.id && !lead.assignedDepartment && (
                    <div
                      className="mt-3 pt-3 flex items-center gap-2"
                      style={{ borderTop: `1px solid ${TEAL}10` }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Select
                        value={quickDept[lead.id] || ""}
                        onValueChange={v => setQuickDept(prev => ({ ...prev, [lead.id]: v }))}
                      >
                        <SelectTrigger className="h-8 text-[11px] flex-1" style={{ borderColor: `${TEAL}20` }}>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(d => (
                            <SelectItem key={d.value} value={d.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                {d.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        className="h-8 shrink-0 rounded-lg text-[11px]"
                        style={{ backgroundColor: TEAL, color: GOLD }}
                        disabled={quickAssign.isPending || !quickDept[lead.id]}
                        onClick={() => {
                          if (quickDept[lead.id]) {
                            quickAssign.mutate({ leadId: lead.id, department: quickDept[lead.id] });
                          }
                        }}
                      >
                        {quickAssign.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        <span className="ml-1">Assign</span>
                      </Button>
                    </div>
                  )}

                  {/* Show assigned dept info when expanded */}
                  {expandedLead === lead.id && lead.assignedDepartment && (
                    <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${TEAL}10` }}>
                      <CheckCircle2 size={12} style={{ color: "#22C55E" }} />
                      <span className="text-[11px] font-medium" style={{ color: TEAL }}>
                        Assigned to <span className="font-bold uppercase">{lead.assignedDepartment}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}

// ─── ASSIGNMENT PANEL ─────────────────────────────────────────────────────────
function AssignmentPanel({ leads, selectedDept, setSelectedDept, handleAssign, isPending }: {
  leads: any[];
  totalLeads?: number;
  selectedDept: Record<number, string>;
  setSelectedDept: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  handleAssign: (id: number) => void;
  isPending: boolean;
}) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-14 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: "#22C55E", opacity: 0.3 }} />
        <p className="text-[15px] font-medium opacity-50" style={{ color: TEAL }}>All caught up</p>
        <p className="text-[12px] opacity-30 mt-2">New leads from the intake desk will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: `${TEAL}08` }}>
        <AlertCircle size={15} style={{ color: "#EF4444" }} />
        <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>
          Unassigned Leads — {leads.length} require action
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
        {leads.map((lead: any) => (
          <div key={lead.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50/40 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-wider font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${TEAL}08`, color: TEAL }}>{lead.ref}</span>
                <span className="text-[11px] opacity-30">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="font-semibold text-[15px]" style={{ color: TEAL }}>{lead.name}</p>
              <p className="text-[12px] opacity-50 mt-0.5">{lead.service}{lead.businessName ? ` · ${lead.businessName}` : ""}</p>
              {lead.context && <p className="text-[12px] opacity-30 mt-1 line-clamp-1">{lead.context}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={selectedDept[lead.id] || ""}
                onValueChange={v => setSelectedDept(prev => ({ ...prev, [lead.id]: v }))}
              >
                <SelectTrigger className="w-[190px] text-[13px]" style={{ borderColor: `${TEAL}20` }}>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d.value} value={d.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => handleAssign(lead.id)}
                disabled={isPending || !selectedDept[lead.id]}
                size="sm"
                className="shrink-0 rounded-lg"
                style={{ backgroundColor: TEAL, color: GOLD }}
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span className="ml-1.5">Assign</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMMISSIONS VIEW ─────────────────────────────────────────────────────────
function CommissionsView() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState<"idle" | "submitted">("idle");

  const SUMMARY = [
    { label: "Total Earned (MTD)", value: "₦170,000",   color: GOLD,      icon: <TrendingUp size={16} /> },
    { label: "Pending Payout",     value: "₦50,000",    color: "#EAB308",  icon: <Clock size={16} /> },
    { label: "Paid This Month",    value: "₦120,000",   color: "#22C55E",  icon: <CheckCircle2 size={16} /> },
    { label: "Next Payout Date",   value: "25th April", color: "#3B82F6",  icon: <CalendarCheck size={16} /> },
  ];

  const HISTORY = [
    { ref: "COM-001", date: "2026-03-01", amount: "₦45,000", dept: "BizDoc",    status: "Paid" },
    { ref: "COM-002", date: "2026-03-08", amount: "₦35,000", dept: "Systemise", status: "Paid" },
    { ref: "COM-003", date: "2026-03-15", amount: "₦40,000", dept: "Skills",    status: "Paid" },
    { ref: "COM-004", date: "2026-03-22", amount: "₦50,000", dept: "BizDoc",    status: "Pending" },
  ];

  const statusColor = (s: string) =>
    s === "Paid"       ? { bg: "#22C55E15", text: "#16A34A" } :
    s === "Processing" ? { bg: "#3B82F615", text: "#3B82F6" } :
                         { bg: "#EAB30815", text: "#B45309" };

  function handleWithdraw() {
    const amt = parseFloat(withdrawAmount.replace(/[^0-9.]/g, ""));
    if (!withdrawAmount || isNaN(amt)) { toast.error("Enter a valid amount"); return; }
    if (amt < 20000) { toast.error("Minimum withdrawal is ₦20,000"); return; }
    setWithdrawStatus("submitted");
    toast.success("Withdrawal request submitted — processing within 24h (working days)");
    setWithdrawAmount("");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SUMMARY.map(({ label, value, color, icon }) => (
          <div key={label} className="rounded-2xl p-5 flex flex-col gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ backgroundColor: WHITE }}>
            <div style={{ color }}>{icon}</div>
            <p className="text-xl font-semibold leading-none" style={{ color }}>{value}</p>
            <p className="text-[11px] uppercase tracking-wider opacity-40" style={{ color: TEAL }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* History */}
        <div className="md:col-span-2 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ backgroundColor: WHITE }}>
          <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: `${TEAL}08` }}>
            <DollarSign size={15} style={{ color: GOLD }} />
            <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Commission History</h3>
          </div>
          <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
            {HISTORY.map(row => {
              const sc = statusColor(row.status);
              return (
                <div key={row.ref} className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono font-bold opacity-40" style={{ color: TEAL }}>{row.ref}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}18`, color: GOLD }}>{row.dept}</span>
                    </div>
                    <p className="text-[13px] font-semibold" style={{ color: TEAL }}>{row.amount}</p>
                    <p className="text-[11px] opacity-30 mt-0.5">{row.date}</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: sc.bg, color: sc.text }}>{row.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdrawal */}
        <div className="rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ backgroundColor: WHITE }}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={15} style={{ color: GOLD }} />
            <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Request Withdrawal</h3>
          </div>
          <div className="space-y-2 text-[12px] opacity-50" style={{ color: TEAL }}>
            <p>• Minimum: <strong>₦20,000</strong></p>
            <p>• Account: Locked to KYC-verified account</p>
            <p>• Processing: 24h (working days)</p>
          </div>
          {withdrawStatus === "submitted" ? (
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: "#22C55E10" }}>
              <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: "#16A34A" }} />
              <p className="text-[13px] font-semibold" style={{ color: "#16A34A" }}>Request Submitted</p>
              <p className="text-[11px] opacity-60 mt-1">Status: Submitted → Processing → Completed</p>
              <button onClick={() => setWithdrawStatus("idle")} className="mt-3 text-[11px] underline opacity-40" style={{ color: TEAL }}>New request</button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider opacity-40 block mb-1.5" style={{ color: TEAL }}>Amount (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-[14px] outline-none"
                  style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
                />
              </div>
              <Button className="w-full" style={{ backgroundColor: TEAL, color: GOLD }} onClick={handleWithdraw}>
                Submit Request
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS VIEW ─────────────────────────────────────────────────────────────
const MOCK_HELPERS = [
  { id: 1, name: "Aminu Sule",    email: "aminu@helper.com",   phone: "0801 234 5678", status: "Active",   leads: 5, lastActive: "2h ago" },
  { id: 2, name: "Blessing Obi",  email: "blessing@helper.com", phone: "0802 345 6789", status: "Active",   leads: 3, lastActive: "5h ago" },
  { id: 3, name: "Yusuf Danlami", email: "yusuf@helper.com",   phone: "0803 456 7890", status: "Inactive", leads: 0, lastActive: "3d ago" },
];

function HelpersView({ staffList }: { staffList: any[] }) {
  const [showAssign, setShowAssign]     = useState(false);
  const [selectedHelper, setSelectedHelper] = useState("");
  const [leadRef, setLeadRef]           = useState("");
  const [deadline, setDeadline]         = useState("");

  function handleAssignToHelper() {
    if (!selectedHelper || !leadRef) { toast.error("Select a helper and enter a lead reference"); return; }
    toast.success(`Lead ${leadRef} assigned to ${selectedHelper}`);
    setShowAssign(false); setLeadRef(""); setDeadline(""); setSelectedHelper("");
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: `${TEAL}08` }}>
          <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: TEAL }}>
            <Users size={15} style={{ color: GOLD }} /> Helper Directory
          </h3>
          <button
            onClick={() => setShowAssign(v => !v)}
            className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: TEAL, color: GOLD }}
          >
            <Plus size={12} /> Assign Lead to Helper
          </button>
        </div>

        {showAssign && (
          <div className="p-4 border-b grid grid-cols-1 md:grid-cols-4 gap-3 items-end" style={{ borderColor: `${TEAL}08`, backgroundColor: `${TEAL}03` }}>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 block mb-1" style={{ color: TEAL }}>Helper</label>
              <select
                value={selectedHelper}
                onChange={e => setSelectedHelper(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                style={{ borderColor: `${TEAL}18`, color: TEAL }}
              >
                <option value="">Select helper…</option>
                {(staffList.length > 0 ? staffList.map(s => ({ ...s, status: "Active", leads: 0, lastActive: "—" })) : MOCK_HELPERS).filter(h => h.status === "Active").map(h => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 block mb-1" style={{ color: TEAL }}>Lead Reference</label>
              <input
                type="text"
                placeholder="e.g. HMZ-26/3-1234"
                value={leadRef}
                onChange={e => setLeadRef(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                style={{ borderColor: `${TEAL}18`, color: TEAL }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-40 block mb-1" style={{ color: TEAL }}>Follow-up Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                style={{ borderColor: `${TEAL}18`, color: TEAL }}
              />
            </div>
            <Button style={{ backgroundColor: TEAL, color: GOLD }} onClick={handleAssignToHelper}>Assign</Button>
          </div>
        )}

        <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
          {(staffList.length > 0 ? staffList.map(s => ({ id: s.id, name: s.name || s.email, email: s.email, phone: s.phone || "—", status: "Active", leads: 0, lastActive: "—" })) : MOCK_HELPERS).map(h => (
            <div key={h.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 hover:bg-gray-50/40 transition-colors">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0" style={{ backgroundColor: `${TEAL}10`, color: TEAL }}>
                {h.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: TEAL }}>{h.name}</p>
                <p className="text-[12px] opacity-40">{h.email} · {h.phone}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <span className="text-[11px] opacity-40" style={{ color: TEAL }}>{h.leads} leads · {h.lastActive}</span>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: h.status === "Active" ? "#22C55E15" : "#EF444415",
                    color: h.status === "Active" ? "#16A34A" : "#EF4444",
                  }}
                >
                  {h.status}
                </span>
                <button className="text-[11px] px-2.5 py-1 rounded-lg border" style={{ borderColor: `${TEAL}20`, color: TEAL }}
                  onClick={() => toast(`Viewing activity for ${h.name}`)}>View Activity</button>
                <button className="text-[11px] px-2.5 py-1 rounded-lg border" style={{ borderColor: `${TEAL}20`, color: TEAL }}
                  onClick={() => toast(`Edit access for ${h.name}`)}>Edit Access</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-[13px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: TEAL }}>
          <AlertCircle size={14} style={{ color: GOLD }} /> Helper Access Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { allowed: false, text: "Cannot view commission data" },
            { allowed: false, text: "Cannot assign leads to departments" },
            { allowed: false, text: "Cannot access CSO settings" },
            { allowed: false, text: "Cannot delete records" },
            { allowed: true,  text: "Can view only their assigned leads" },
            { allowed: true,  text: "Can update status of assigned leads" },
            { allowed: true,  text: "All actions are logged for CSO review" },
          ].map((rule, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[13px]" style={{ color: TEAL }}>
              <span className={rule.allowed ? "text-green-500" : "text-red-400"}>{rule.allowed ? "✓" : "✗"}</span>
              <span className="opacity-60">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── QUICK ACCESS VIEW ────────────────────────────────────────────────────────
const QUICK_ACCESS_ITEMS = [
  {
    category: "Documents",
    icon: <FileText size={15} />,
    color: "#3B82F6",
    items: [
      { label: "BizDoc SOP PDF" },
      { label: "Systemise Service Catalog" },
      { label: "Skills Program Brochure" },
      { label: "Commission Formula Guide" },
      { label: "Lead Qualification Checklist" },
    ],
  },
  {
    category: "Spreadsheets",
    icon: <Activity size={15} />,
    color: "#22C55E",
    items: [
      { label: "Leads_Master" },
      { label: "Assignments" },
      { label: "KPI_Dashboard" },
      { label: "Attendance_Log" },
    ],
  },
  {
    category: "Folders",
    icon: <FolderOpen size={15} />,
    color: "#F59E0B",
    items: [
      { label: "Client Documents" },
      { label: "Templates" },
      { label: "Proposals" },
    ],
  },
  {
    category: "Tools",
    icon: <Zap size={15} />,
    color: "#8B5CF6",
    items: [
      { label: "Calendar Link" },
      { label: "Email Template Library" },
      { label: "Proposal Generator" },
      { label: "Reference Number Lookup" },
    ],
  },
];

function QuickAccessView() {
  const [customLinks, setCustomLinks] = useState<{ label: string; href: string }[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newHref,  setNewHref]  = useState("");

  function addCustomLink() {
    if (!newLabel || !newHref) { toast.error("Enter both a label and a URL"); return; }
    setCustomLinks(prev => [...prev, { label: newLabel, href: newHref }]);
    setNewLabel(""); setNewHref("");
    toast.success("Shortcut added");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACCESS_ITEMS.map(cat => (
          <div key={cat.category} className="rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ backgroundColor: WHITE }}>
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: `${TEAL}06` }}>
              <span style={{ color: cat.color }}>{cat.icon}</span>
              <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>{cat.category}</h3>
            </div>
            <div className="p-3 flex flex-col gap-1">
              {cat.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => toast(`Opening: ${item.label}`)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all hover:opacity-80 group text-left w-full"
                  style={{ color: TEAL }}
                >
                  <span className="opacity-70 group-hover:opacity-100">{item.label}</span>
                  <ExternalLink size={11} className="opacity-20 group-hover:opacity-50 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: `${TEAL}08` }}>
          <Link2 size={14} style={{ color: GOLD }} />
          <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Custom Shortcuts</h3>
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Label"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}15`, color: TEAL }}
            />
            <input
              type="url"
              placeholder="https://…"
              value={newHref}
              onChange={e => setNewHref(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}15`, color: TEAL }}
            />
            <Button style={{ backgroundColor: TEAL, color: GOLD }} onClick={addCustomLink}>
              <Plus size={14} />
            </Button>
          </div>
          {customLinks.length === 0 ? (
            <p className="text-[13px] opacity-30 text-center py-4" style={{ color: TEAL }}>No custom shortcuts yet. Add one above.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium border transition-all hover:opacity-80"
                  style={{ borderColor: `${TEAL}15`, color: TEAL }}
                >
                  <Link2 size={10} style={{ color: GOLD }} />
                  {l.label}
                  <ExternalLink size={10} className="opacity-30" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ATTENDANCE VIEW ──────────────────────────────────────────────────────────
function AttendanceView({ attendance, isLoading }: { attendance: any[]; isLoading: boolean }) {
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: `${TEAL}08` }}>
        <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: TEAL }}>
          <CalendarCheck size={15} style={{ color: GOLD }} /> Today's Attendance
        </h3>
        <span className="text-[11px] opacity-40" style={{ color: TEAL }}>{today}</span>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 size={20} className="animate-spin" style={{ color: GOLD }} />
        </div>
      ) : attendance.length === 0 ? (
        <div className="text-center p-14">
          <CalendarCheck size={36} className="mx-auto mb-4 opacity-20" style={{ color: TEAL }} />
          <p className="text-[14px] opacity-40" style={{ color: TEAL }}>No attendance records for today yet.</p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
          {attendance.map((record: any) => {
            const checkedIn  = !!record.checkIn;
            const checkedOut = !!record.checkOut;
            const hoursWorked = checkedIn && checkedOut
              ? ((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / 3600000).toFixed(1)
              : null;
            return (
              <div key={record.id} className="px-4 py-3 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0" style={{ backgroundColor: `${TEAL}10`, color: TEAL }}>
                  {(record.userName || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate" style={{ color: TEAL }}>{record.userName || "Staff Member"}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {checkedIn  && <span className="text-[11px] text-green-600 font-medium">In: {new Date(record.checkIn).toLocaleTimeString("en-NG",  { hour: "2-digit", minute: "2-digit" })}</span>}
                    {checkedOut && <span className="text-[11px] text-blue-600  font-medium">Out: {new Date(record.checkOut).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</span>}
                    {hoursWorked && <span className="text-[11px] opacity-40">{hoursWorked}h</span>}
                  </div>
                </div>
                <div
                  className="text-[10px] font-bold uppercase px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: checkedOut ? "#22C55E15" : checkedIn ? "#3B82F615" : "#EF444415",
                    color: checkedOut ? "#16A34A" : checkedIn ? "#3B82F6" : "#EF4444",
                  }}
                >
                  {checkedOut ? "Done" : checkedIn ? "Present" : "Absent"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DEPT UPDATES VIEW ────────────────────────────────────────────────────────
const MOCK_UPDATES = [
  { id: 1, dept: "BizDoc",    assignmentId: "ASG-001", time: "10 min ago",
    message: "Work started on CAC registration — NorthStar Trading Co.",
    statusChange: "In Progress", nextStep: "Awaiting certified copy from client", acknowledged: false },
  { id: 2, dept: "Systemise", assignmentId: "ASG-002", time: "1h ago",
    message: "Waiting for brand assets from client before continuing website build.",
    statusChange: null, nextStep: "Client to upload logo files", acknowledged: false },
  { id: 3, dept: "Skills",    assignmentId: "ASG-003", time: "3h ago",
    message: "Ready for CSO review — Business Essentials Cohort 3 enrollment confirmed.",
    statusChange: "Review", nextStep: "CSO to notify client of start date", acknowledged: true },
  { id: 4, dept: "BizDoc",    assignmentId: "ASG-004", time: "Yesterday",
    message: "Submitted to CAC — awaiting external approval.",
    statusChange: null, nextStep: "Awaiting external approval (3–5 business days)", acknowledged: true },
];

const DEPT_COLORS: Record<string, string> = { BizDoc: "#1B4D3E", Systemise: "#2563EB", Skills: "#8B6914" };

function DeptUpdatesView() {
  const [updates, setUpdates] = useState(MOCK_UPDATES);
  const [filter, setFilter]   = useState<"all" | "unread">("all");

  const visible    = filter === "unread" ? updates.filter(u => !u.acknowledged) : updates;
  const unreadCount = updates.filter(u => !u.acknowledged).length;

  function acknowledge(id: number) {
    setUpdates(prev => prev.map(u => u.id === id ? { ...u, acknowledged: true } : u));
    toast.success("Update acknowledged");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: TEAL }}>
            <Bell size={14} style={{ color: GOLD }} /> Department Updates
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EF444415", color: "#EF4444" }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "unread"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all"
              style={{
                backgroundColor: filter === f ? TEAL : "transparent",
                color: filter === f ? GOLD : TEAL,
                borderColor: `${TEAL}20`,
              }}>
              {f === "all" ? "All" : "Unread"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <CheckCircle2 size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#22C55E" }} />
            <p className="text-[14px] opacity-40" style={{ color: TEAL }}>All updates acknowledged</p>
          </div>
        ) : visible.map(u => (
          <div
            key={u.id}
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: u.acknowledged ? `${TEAL}08` : `${GOLD}30` }}
          >
            <div className="px-4 py-2.5 flex items-center justify-between border-b" style={{ borderColor: `${TEAL}06` }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DEPT_COLORS[u.dept] ?? GOLD }} />
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: DEPT_COLORS[u.dept] ?? GOLD }}>{u.dept}</span>
                <span className="text-[10px] font-mono opacity-30" style={{ color: TEAL }}>{u.assignmentId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-30" style={{ color: TEAL }}>{u.time}</span>
                {!u.acknowledged && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-[13px] font-medium mb-2" style={{ color: TEAL }}>{u.message}</p>
              {u.statusChange && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full mr-2" style={{ backgroundColor: "#3B82F615", color: "#3B82F6" }}>
                  Status → {u.statusChange}
                </span>
              )}
              <p className="text-[12px] opacity-40 mt-2 flex items-center gap-1" style={{ color: TEAL }}>
                <ChevronRight size={12} /> Next: {u.nextStep}
              </p>
            </div>
            {!u.acknowledged && (
              <div className="px-4 py-2.5 border-t flex gap-2" style={{ borderColor: `${TEAL}06` }}>
                <button onClick={() => acknowledge(u.id)}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: TEAL, color: GOLD }}>Acknowledge</button>
                <button onClick={() => toast("Requesting more info from department")}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: `${TEAL}20`, color: TEAL }}>Request More Info</button>
                <button onClick={() => toast("Flagged for CEO review")}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-lg border"
                  style={{ borderColor: "#EF444430", color: "#EF4444" }}>Escalate</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────
const APPOINTMENT_TYPES = [
  { value: "discovery",  label: "Discovery Call",   color: "#3B82F6" },
  { value: "follow_up",  label: "Follow-up Call",   color: "#22C55E" },
  { value: "review",     label: "Dept Review",      color: "#EAB308" },
  { value: "payment",    label: "Payment Reminder", color: "#F97316" },
  { value: "delivery",   label: "Delivery Call",    color: "#B48C4C" },
  { value: "retention",  label: "Retention Check",  color: "#8B5CF6" },
];

const MOCK_APPOINTMENTS = [
  { id: 1, client: "Kemi Adeyemi Properties", ref: "HMZ-26/3-1234", type: "discovery", date: "2026-03-23", time: "10:00 AM", duration: 30, notes: "Interested in CAC + trademark",      status: "confirmed" },
  { id: 2, client: "NorthStar Trading Co",    ref: "HMZ-26/3-5678", type: "follow_up", date: "2026-03-23", time: "2:00 PM",  duration: 20, notes: "Check on document upload",          status: "pending" },
  { id: 3, client: "Abuja Digital Ventures",  ref: "HMZ-26/2-9012", type: "delivery",  date: "2026-03-25", time: "11:00 AM", duration: 45, notes: "Final handover — Systemise website", status: "confirmed" },
  { id: 4, client: "Lagos Fashion House",     ref: "HMZ-26/3-3456", type: "retention", date: "2026-03-27", time: "3:00 PM",  duration: 15, notes: "30-day retention check",             status: "confirmed" },
];

const STATUS_C: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "#22C55E15", text: "#16A34A" },
  pending:   { bg: "#EAB30815", text: "#B45309" },
  completed: { bg: "#3B82F615", text: "#3B82F6" },
  cancelled: { bg: "#EF444415", text: "#EF4444" },
};

function CalendarView({ realAppointments }: { realAppointments: any[] }) {
  const [typeFilter, setTypeFilter] = useState("all");

  const apptData = realAppointments.length > 0
    ? realAppointments.map((a: any) => ({
        id: a.id,
        client: a.clientName,
        ref: a.ref || `APT-${a.id}`,
        type: "consultation",
        date: a.preferredDate || "",
        time: a.preferredTime || "",
        duration: 60,
        notes: a.notes || "",
        dept: "Systemise",
        status: a.status || "pending",
      }))
    : MOCK_APPOINTMENTS;
  const visible = typeFilter === "all" ? apptData : apptData.filter((a: any) => a.type === typeFilter);
  const today   = apptData.filter((a: any) => a.date === new Date().toISOString().split("T")[0]);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-40" style={{ color: TEAL }}>Filter:</span>
        <button onClick={() => setTypeFilter("all")}
          className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: typeFilter === "all" ? TEAL : "transparent", color: typeFilter === "all" ? GOLD : TEAL, borderColor: `${TEAL}20` }}>
          All
        </button>
        {APPOINTMENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setTypeFilter(t.value)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: typeFilter === t.value ? t.color : "transparent", color: typeFilter === t.value ? WHITE : TEAL, borderColor: `${TEAL}15` }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Today strip */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3 opacity-40" style={{ color: TEAL }}>
          Today — {today.length} appointment{today.length !== 1 ? "s" : ""}
        </p>
        {today.length === 0 ? (
          <p className="text-[13px] opacity-30 text-center py-4" style={{ color: TEAL }}>No appointments today</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {today.map(a => {
              const apptType = APPOINTMENT_TYPES.find(t => t.value === a.type);
              return (
                <div key={a.id} className="shrink-0 px-4 py-3 rounded-xl border min-w-[180px]" style={{ borderColor: `${apptType?.color ?? GOLD}30`, backgroundColor: `${apptType?.color ?? GOLD}08` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: apptType?.color ?? GOLD }}>{apptType?.label}</p>
                  <p className="text-[13px] font-semibold leading-tight" style={{ color: TEAL }}>{a.client}</p>
                  <p className="text-[11px] opacity-50 mt-1" style={{ color: TEAL }}>{a.time} · {a.duration}m</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All appointments */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: `${TEAL}08` }}>
          <CalendarDays size={14} style={{ color: GOLD }} />
          <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Upcoming Appointments</h3>
        </div>
        <div className="divide-y" style={{ borderColor: `${TEAL}06` }}>
          {visible.length === 0 ? (
            <p className="text-center text-[13px] opacity-30 p-10" style={{ color: TEAL }}>No appointments found</p>
          ) : visible.map(a => {
            const apptType = APPOINTMENT_TYPES.find(t => t.value === a.type);
            const sc = STATUS_C[a.status] ?? STATUS_C.pending;
            return (
              <div key={a.id} className="px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 hover:bg-gray-50/40 transition-colors">
                <div className="w-3 h-3 rounded-full shrink-0 hidden md:block mt-1" style={{ backgroundColor: apptType?.color ?? GOLD }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${apptType?.color ?? GOLD}15`, color: apptType?.color ?? GOLD }}>
                      {apptType?.label}
                    </span>
                    <span className="text-[10px] font-mono opacity-30" style={{ color: TEAL }}>{a.ref}</span>
                  </div>
                  <p className="text-[14px] font-semibold" style={{ color: TEAL }}>{a.client}</p>
                  {a.notes && <p className="text-[12px] opacity-40 mt-0.5 truncate">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="text-right">
                    <p className="text-[12px] font-medium" style={{ color: TEAL }}>{a.date}</p>
                    <p className="text-[11px] opacity-40" style={{ color: TEAL }}>{a.time} · {a.duration}m</p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>{a.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DISCOVERY VIEW ───────────────────────────────────────────────────────────
type StepStatus = "pending" | "done" | "skipped";

interface DiscoveryStep {
  id: number;
  title: string;
  hint: string;
  status: StepStatus;
  notes: string;
}

const INITIAL_STEPS: DiscoveryStep[] = [
  {
    id: 1,
    title: "Identify the Business",
    hint: "Capture the business name, structure, registration status, and industry.",
    status: "pending",
    notes: "",
  },
  {
    id: 2,
    title: "Understand the Need",
    hint: "What problem brought them here today? Select the closest match.",
    status: "pending",
    notes: "",
  },
  {
    id: 3,
    title: "Qualify the Budget",
    hint: "Get a rough idea of their investment range — no pressure, just a bracket.",
    status: "pending",
    notes: "",
  },
  {
    id: 4,
    title: "Map to Services",
    hint: "Which HAMZURY departments can help this client? Tick all that apply.",
    status: "pending",
    notes: "",
  },
  {
    id: 5,
    title: "Timeline & Urgency",
    hint: "When do they need this done? Is there a hard deadline?",
    status: "pending",
    notes: "",
  },
  {
    id: 6,
    title: "Next Action",
    hint: "What's the agreed next step before this call ends?",
    status: "pending",
    notes: "",
  },
];

function DiscoveryView() {
  const [steps, setSteps] = useState<DiscoveryStep[]>(INITIAL_STEPS);

  // Per-step field state
  const [bizName,      setBizName]      = useState("");
  const [bizType,      setBizType]      = useState("");
  const [bizRegState,  setBizRegState]  = useState("");
  const [bizIndustry,  setBizIndustry]  = useState("");

  const [needType,     setNeedType]     = useState("");

  const [budget,       setBudget]       = useState("");

  const [deptMap,      setDeptMap]      = useState<Record<string, boolean>>({
    bizdoc: false, systemise: false, skills: false, ridi: false,
  });

  const [timeline,     setTimeline]     = useState("");
  const [deadline,     setDeadline]     = useState("");

  const [nextAction,   setNextAction]   = useState("");

  const completedCount = steps.filter(s => s.status === "done" || s.status === "skipped").length;
  const progressPct    = Math.round((completedCount / steps.length) * 100);

  function markStep(id: number, status: StepStatus) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  function updateNotes(id: number, value: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, notes: value } : s));
  }

  function handleSave() {
    toast.success("Discovery saved");
  }

  const stepStatusIcon = (status: StepStatus) => {
    if (status === "done")    return <CheckCircle2 size={16} style={{ color: "#16A34A" }} />;
    if (status === "skipped") return <AlertCircle  size={16} style={{ color: "#9CA3AF" }} />;
    return null;
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${GOLD}18` }}>
            <Target size={18} style={{ color: GOLD }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: TEAL }}>Discovery Checklist</h2>
            <p className="text-[11px] opacity-40 mt-0.5" style={{ color: TEAL }}>
              6-step guided flow — complete each step during your client conversation
            </p>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-[22px] font-black leading-none" style={{ color: GOLD }}>{completedCount}<span className="text-[13px] font-semibold opacity-50">/6</span></p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: TEAL }}>steps done</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${TEAL}10` }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? "#16A34A" : GOLD }}
          />
        </div>
        <p className="text-[11px] opacity-30 mt-1.5 text-right" style={{ color: TEAL }}>{progressPct}% complete</p>
      </div>

      {/* Step 1 — Identify the Business */}
      <DiscoveryCard step={steps[0]} onMark={markStep} onNotes={updateNotes} stepStatusIcon={stepStatusIcon}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Business Name</label>
            <input
              type="text"
              placeholder="e.g. NorthStar Trading Co"
              value={bizName}
              onChange={e => setBizName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Business Type</label>
            <select
              value={bizType}
              onChange={e => setBizType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
            >
              <option value="">Select…</option>
              <option value="sole_prop">Sole Proprietorship</option>
              <option value="ltd">Limited (Ltd)</option>
              <option value="foreign">Foreign Company</option>
              <option value="ngo">NGO / Foundation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Registration Status</label>
            <select
              value={bizRegState}
              onChange={e => setBizRegState(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
            >
              <option value="">Select…</option>
              <option value="registered">Registered</option>
              <option value="not_registered">Not Yet Registered</option>
              <option value="in_progress">Registration In Progress</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Industry</label>
            <input
              type="text"
              placeholder="e.g. Fashion, Tech, Trading…"
              value={bizIndustry}
              onChange={e => setBizIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
            />
          </div>
        </div>
      </DiscoveryCard>

      {/* Step 2 — Understand the Need */}
      <DiscoveryCard step={steps[1]} onMark={markStep} onNotes={updateNotes} stepStatusIcon={stepStatusIcon}>
        <div className="mt-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>What problem brought them here?</label>
          <select
            value={needType}
            onChange={e => setNeedType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
            style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
          >
            <option value="">Select…</option>
            <option value="registration">Business Registration</option>
            <option value="compliance">Compliance / Legal</option>
            <option value="tax">Tax / FIRS</option>
            <option value="brand">Brand Identity</option>
            <option value="system">Systems / Operations</option>
            <option value="skills">Skills / Training</option>
            <option value="ridi">RIDI / Community Impact</option>
            <option value="other">Other</option>
          </select>
        </div>
      </DiscoveryCard>

      {/* Step 3 — Qualify the Budget */}
      <DiscoveryCard step={steps[2]} onMark={markStep} onNotes={updateNotes} stepStatusIcon={stepStatusIcon}>
        <div className="mt-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Rough investment range</label>
          <select
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
            style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
          >
            <option value="">Select…</option>
            <option value="under50k">Under ₦50,000</option>
            <option value="50to150k">₦50,000 – ₦150,000</option>
            <option value="150to500k">₦150,000 – ₦500,000</option>
            <option value="above500k">Above ₦500,000</option>
          </select>
        </div>
      </DiscoveryCard>

      {/* Step 4 — Map to Services */}
      <DiscoveryCard step={steps[3]} onMark={markStep} onNotes={updateNotes} stepStatusIcon={stepStatusIcon}>
        <div className="flex flex-wrap gap-3 mt-3">
          {(["bizdoc", "systemise", "skills", "ridi"] as const).map(dept => {
            const labels: Record<string, string> = {
              bizdoc: "BizDoc", systemise: "Systemise", skills: "Skills", ridi: "RIDI",
            };
            const colors: Record<string, string> = {
              bizdoc: "#1B4D3E", systemise: "#2563EB", skills: "#8B6914", ridi: GOLD,
            };
            const checked = deptMap[dept];
            return (
              <button
                key={dept}
                onClick={() => setDeptMap(prev => ({ ...prev, [dept]: !prev[dept] }))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-semibold transition-all"
                style={{
                  backgroundColor: checked ? `${colors[dept]}15` : WHITE,
                  borderColor: checked ? colors[dept] : `${TEAL}15`,
                  color: checked ? colors[dept] : `${TEAL}80`,
                }}
              >
                {checked && <CheckCircle2 size={13} />}
                {labels[dept]}
              </button>
            );
          })}
        </div>
      </DiscoveryCard>

      {/* Step 5 — Timeline & Urgency */}
      <DiscoveryCard step={steps[4]} onMark={markStep} onNotes={updateNotes} stepStatusIcon={stepStatusIcon}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>When do they need it?</label>
            <select
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
            >
              <option value="">Select…</option>
              <option value="asap">ASAP</option>
              <option value="this_month">This Month</option>
              <option value="no_rush">No Rush</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Hard Deadline (if any)</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
              style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
            />
          </div>
        </div>
      </DiscoveryCard>

      {/* Step 6 — Next Action */}
      <DiscoveryCard step={steps[5]} onMark={markStep} onNotes={updateNotes} stepStatusIcon={stepStatusIcon}>
        <div className="mt-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider opacity-40 mb-1" style={{ color: TEAL }}>Agreed next step</label>
          <select
            value={nextAction}
            onChange={e => setNextAction(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
            style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: MILK }}
          >
            <option value="">Select…</option>
            <option value="send_proposal">Send Proposal</option>
            <option value="schedule_call">Schedule Follow-up Call</option>
            <option value="share_pricing">Share Pricing</option>
            <option value="refer_dept">Refer to Department</option>
            <option value="do_nothing">Do Nothing (Not Qualified)</option>
          </select>
        </div>
      </DiscoveryCard>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
          className="px-8 py-2.5 rounded-xl font-bold text-[13px]"
          style={{ backgroundColor: TEAL, color: GOLD }}
        >
          Save Discovery Report
        </Button>
      </div>
    </div>
  );
}

// ─── DISCOVERY CARD (reusable step wrapper) ────────────────────────────────────
function DiscoveryCard({
  step,
  onMark,
  onNotes,
  stepStatusIcon,
  children,
}: {
  step: DiscoveryStep;
  onMark: (id: number, status: StepStatus) => void;
  onNotes: (id: number, value: string) => void;
  stepStatusIcon: (status: StepStatus) => React.ReactNode;
  children?: React.ReactNode;
}) {
  const isDone    = step.status === "done";
  const isSkipped = step.status === "skipped";

  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-all"
      style={{
        borderColor: isDone ? "#22C55E30" : isSkipped ? `${TEAL}08` : `${TEAL}10`,
        opacity: isSkipped ? 0.6 : 1,
      }}
    >
      {/* Step header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: isDone ? "#22C55E15" : `${TEAL}06` }}
      >
        {/* Step number */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black shrink-0"
          style={{
            backgroundColor: isDone ? "#22C55E15" : `${GOLD}18`,
            color: isDone ? "#16A34A" : GOLD,
          }}
        >
          {isDone ? <CheckCircle2 size={14} /> : step.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold" style={{ color: TEAL }}>{step.title}</p>
          <p className="text-[11px] opacity-40 mt-0.5" style={{ color: TEAL }}>{step.hint}</p>
        </div>
        {stepStatusIcon(step.status) && (
          <div className="shrink-0">{stepStatusIcon(step.status)}</div>
        )}
      </div>

      {/* Step body */}
      <div className="px-5 py-4">
        {children}

        {/* Notes field */}
        <div className="mt-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider opacity-30 mb-1" style={{ color: TEAL }}>
            Notes (optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add any notes for this step…"
            value={step.notes}
            onChange={e => onNotes(step.id, e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none resize-none"
            style={{ borderColor: `${TEAL}15`, color: TEAL, backgroundColor: MILK }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onMark(step.id, step.status === "done" ? "pending" : "done")}
            className="flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: isDone ? "#22C55E15" : TEAL,
              color: isDone ? "#16A34A" : GOLD,
              border: isDone ? "1px solid #22C55E30" : "none",
            }}
          >
            <CheckCircle2 size={13} />
            {isDone ? "Marked Done" : "Mark Done"}
          </button>
          {!isDone && (
            <button
              onClick={() => onMark(step.id, step.status === "skipped" ? "pending" : "skipped")}
              className="flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-lg border transition-all"
              style={{
                borderColor: `${TEAL}15`,
                color: isSkipped ? "#9CA3AF" : `${TEAL}60`,
              }}
            >
              {isSkipped ? "Unskip" : "Skip"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
