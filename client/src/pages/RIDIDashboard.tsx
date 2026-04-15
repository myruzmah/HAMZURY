import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { StaffUser } from "@/lib/types";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import DeptChatPanel from "@/components/DeptChatPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Home, LogOut, LayoutDashboard, Users, FileText, Globe, GitMerge,
  CheckCircle2, Clock, XCircle, AlertTriangle, Search, ChevronDown,
  Loader2,
} from "lucide-react";

// ─── Brand (RIDI = gold primary) ─────────────────────────────────────────────
const ORANGE = "#E86A2E";
const GOLD   = "#B48C4C";   // RIDI primary
const TEAL   = "#1B4D3E";   // HAMZURY green
const MILK   = "#FFFAF6";

type Section = "overview" | "applications" | "funding" | "communities" | "cohort";

// ─── Status mapping: DB uses lowercase, UI uses title-case ──────────────────
type DisplayStatus = "Submitted" | "Pending" | "Approved" | "Rejected";

function mapAppStatus(dbStatus: string): DisplayStatus {
  switch (dbStatus) {
    case "submitted":    return "Submitted";
    case "under_review": return "Pending";
    case "accepted":     return "Approved";
    case "rejected":     return "Rejected";
    case "waitlisted":   return "Pending";
    default:             return "Pending";
  }
}

function mapCommunityStatus(dbStatus: string): string {
  if (dbStatus === "active") return "Active";
  if (dbStatus === "inactive") return "Inactive";
  return dbStatus.charAt(0).toUpperCase() + dbStatus.slice(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function TaskBadge({ status }: { status: DisplayStatus }) {
  const map: Record<string, { bg: string; color: string }> = {
    Submitted: { bg: "#DBEAFE", color: "#1E40AF" },
    Pending:   { bg: "#FEF3C7", color: "#92400E" },
    Approved:  { bg: "#DCFCE7", color: "#166534" },
    Rejected:  { bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = map[status] ?? map.Pending;
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="animate-spin" size={24} style={{ color: ORANGE }} />
      <span className="ml-2 text-sm opacity-40" style={{ color: TEAL }}>Loading...</span>
    </div>
  );
}

// Mock cohort students removed — will be populated from tRPC skills data when available
const MOCK_COHORT_STUDENTS: { id: string; name: string; program: string; mergeRIDI: boolean }[] = [];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RIDIDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const staffUser = user as StaffUser;
  const [activeSection, setActiveSection] = useState<Section>("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: ORANGE }} />
      </div>
    );
  }
  if (!user) return null;

  const weeklyTargetsQuery = trpc.weeklyTargets.byDepartment.useQuery(
    { department: "ridi" },
    { refetchInterval: 60000 },
  );

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview",      icon: LayoutDashboard, label: "Overview" },
    { key: "applications",  icon: Users,           label: "Applications" },
    { key: "funding",       icon: FileText,        label: "Funding Tasks" },
    { key: "communities",   icon: Globe,           label: "Communities" },
    { key: "cohort",        icon: GitMerge,        label: "Cohort Merge" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="RIDI Dashboard — HAMZURY" description="RIDI programme admin dashboard." />

      {/* ── Sidebar ── */}
      <div className="w-16 md:w-64 flex flex-col h-full shrink-0" style={{ backgroundColor: TEAL }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${ORANGE}25` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ORANGE}25` }}>
            <Globe size={14} style={{ color: ORANGE }} />
          </div>
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: ORANGE }}>RIDI Admin</span>
        </div>

        <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="w-full flex items-center justify-center md:justify-start md:px-3 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: activeSection === key ? `${ORANGE}18` : "transparent",
                color: activeSection === key ? ORANGE : `${ORANGE}50`,
              }}
            >
              <Icon size={17} className="shrink-0" />
              <span className="hidden md:block ml-3 text-sm font-normal">{label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t shrink-0" style={{ borderColor: `${ORANGE}15` }}>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: `${ORANGE}45` }}
          >
            <LogOut size={15} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Sign Out</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl text-sm transition-all mt-1"
            style={{ color: `${ORANGE}45` }}
          >
            <Home size={15} className="shrink-0" />
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
              {sidebarItems.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs opacity-40" style={{ color: TEAL }}>
              {user.name || "RIDI Admin"} · RIDI Programme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link href="/ridi" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${TEAL}20`, color: TEAL }}>RIDI Portal</Link>
            <Link href="/skills/admin" className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: `${TEAL}20`, color: TEAL }}>Skills Admin</Link>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {activeSection === "overview"     && <OverviewPanel />}
            {activeSection === "applications" && <ApplicationsPanel />}
            {activeSection === "funding"      && <FundingTasksPanel />}
            {activeSection === "communities"  && <CommunitiesPanel />}
            {activeSection === "cohort"       && <CohortMergePanel />}

            {/* ── My Weekly Targets ── */}
            <div className="mt-6 bg-white rounded-xl border p-6" style={{ borderColor: `${TEAL}15` }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: TEAL }}>My Weekly Targets</h2>
              {weeklyTargetsQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm opacity-40" style={{ color: TEAL }}>
                  <Loader2 className="animate-spin" size={16} /> Loading targets...
                </div>
              ) : !weeklyTargetsQuery.data?.length ? (
                <p className="text-sm text-gray-400">No targets set for this week.</p>
              ) : (
                <div className="space-y-2">
                  {weeklyTargetsQuery.data.map((target: any) => (
                    <div key={target.id} className="flex items-center justify-between px-4 py-3 rounded-lg border" style={{ borderColor: `${TEAL}10`, backgroundColor: `${MILK}` }}>
                      <div>
                        <div className="text-sm font-medium" style={{ color: TEAL }}>{target.title || target.description}</div>
                        {target.metric && <div className="text-xs text-gray-500 mt-0.5">{target.metric}</div>}
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{
                        backgroundColor: target.status === "completed" ? "#DCFCE7" : target.status === "in_progress" ? "#DBEAFE" : "#FEF3C7",
                        color: target.status === "completed" ? "#166534" : target.status === "in_progress" ? "#1E40AF" : "#92400E",
                      }}>
                        {target.status === "completed" ? "Done" : target.status === "in_progress" ? "In Progress" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
      <DeptChatPanel department="ridi" staffId={staffUser.staffRef || staffUser.openId || ""} staffName={staffUser.name || "Staff"} />
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel() {
  const { data: applications, isLoading: appsLoading } = trpc.skills.applications.useQuery();
  const { data: communities, isLoading: commsLoading } = trpc.ridiCommunities.list.useQuery();

  if (appsLoading || commsLoading) return <LoadingSpinner />;

  const applicants = applications ?? [];
  const comms = communities ?? [];

  const totalApplicants   = applicants.length;
  const fundedQuarter     = applicants.filter(a => a.status === "accepted").length;
  const activeCommunities = comms.filter(c => c.status === "active").length;
  const pendingReview     = applicants.filter(a => a.status === "submitted").length;

  const STAT_CARDS = [
    { label: "Total Applicants",          value: totalApplicants,   icon: Users,         color: ORANGE },
    { label: "Funded This Quarter",       value: fundedQuarter,     icon: CheckCircle2,  color: "#22C55E" },
    { label: "Active Communities",        value: activeCommunities, icon: Globe,         color: "#3B82F6" },
    { label: "Applications Pending Review", value: pendingReview,   icon: AlertTriangle, color: "#EAB308" },
  ];

  // Map DB statuses to display statuses for the breakdown chart
  const statusBreakdown: { display: DisplayStatus; dbStatuses: string[] }[] = [
    { display: "Submitted",  dbStatuses: ["submitted"] },
    { display: "Pending",    dbStatuses: ["under_review", "waitlisted"] },
    { display: "Approved",   dbStatuses: ["accepted"] },
    { display: "Rejected",   dbStatuses: ["rejected"] },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>RIDI Programme Overview</h2>
        <p className="text-xs opacity-30" style={{ color: TEAL }}>Q1 2026 — Real-time applicant and community status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border p-5 text-center" style={{ borderColor: `${TEAL}08` }}>
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-medium leading-none mb-1" style={{ color }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40" style={{ color: TEAL }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick state summary */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${TEAL}08` }}>
        <p className="text-sm font-normal mb-5 opacity-60" style={{ color: TEAL }}>Application Status Breakdown</p>
        <div className="space-y-4">
          {statusBreakdown.map(({ display, dbStatuses }) => {
            const count = applicants.filter(a => dbStatuses.includes(a.status)).length;
            const pct   = totalApplicants > 0 ? Math.round((count / totalApplicants) * 100) : 0;
            const colorMap: Record<string, string> = { Submitted: "#3B82F6", Pending: "#EAB308", Approved: "#22C55E", Rejected: "#EF4444" };
            return (
              <div key={display} className="flex items-center gap-3">
                <p className="text-sm w-24 shrink-0 font-normal opacity-60" style={{ color: TEAL }}>{display}</p>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colorMap[display] }} />
                </div>
                <p className="text-sm font-medium w-6 text-right" style={{ color: TEAL }}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community reach */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: `${TEAL}08` }}>
        <p className="text-sm font-normal mb-4 opacity-60" style={{ color: TEAL }}>Community Reach — Top 5 by Members</p>
        <div className="space-y-3">
          {comms.filter(c => c.status === "active").sort((a, b) => b.members - a.members).slice(0, 5).map(c => {
            const max = Math.max(60, ...comms.map(x => x.members));
            return (
              <div key={c.id} className="flex items-center gap-3">
                <p className="text-sm w-44 shrink-0 font-normal opacity-70 truncate" style={{ color: TEAL }}>{c.name}</p>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.members / max) * 100}%`, backgroundColor: ORANGE }} />
                </div>
                <p className="text-xs font-medium w-8 text-right opacity-50" style={{ color: TEAL }}>{c.members}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Applications Panel ───────────────────────────────────────────────────────
function ApplicationsPanel() {
  const { data: applications, isLoading } = trpc.skills.applications.useQuery();
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | DisplayStatus>("All");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) return <LoadingSpinner />;

  const applicants = applications ?? [];

  const filtered = applicants.filter(a => {
    const displayStatus = mapAppStatus(a.status);
    const matchSearch = !search || (a.fullName ?? "").toLowerCase().includes(search.toLowerCase()) || (a.program ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || displayStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Applications</h2>
        <p className="text-xs opacity-30" style={{ color: TEAL }}>{applicants.length} total applicants</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: TEAL }} />
          <Input
            placeholder="Search name or program..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 border-gray-200 bg-white text-sm w-52"
          />
        </div>
        <div className="flex gap-1">
          {(["All", "Submitted", "Pending", "Approved", "Rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-normal transition-all"
              style={{
                backgroundColor: statusFilter === s ? TEAL : "white",
                color: statusFilter === s ? "white" : `${TEAL}60`,
                border: `1px solid ${TEAL}15`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${TEAL}08` }}>
        {/* Header */}
        <div
          className="grid gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-wider opacity-40 font-normal"
          style={{ borderColor: `${TEAL}08`, color: TEAL, gridTemplateColumns: "1fr 1fr 1fr 1fr 80px 100px" }}
        >
          <span>Name</span>
          <span>Email</span>
          <span>Program</span>
          <span>Phone</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm opacity-30" style={{ color: TEAL }}>No applicants match your filters</p>
          </div>
        ) : filtered.map(a => {
          const displayStatus = mapAppStatus(a.status);
          return (
            <div key={a.id}>
              <div
                className="grid gap-4 px-5 py-4 border-b last:border-0 items-center"
                style={{ borderColor: `${TEAL}06`, gridTemplateColumns: "1fr 1fr 1fr 1fr 80px 100px" }}
              >
                <div>
                  <p className="text-sm font-normal" style={{ color: TEAL }}>{a.fullName}</p>
                  <p className="text-[10px] font-mono opacity-30 mt-0.5" style={{ color: TEAL }}>{a.ref}</p>
                </div>
                <p className="text-xs opacity-60 truncate" style={{ color: TEAL }}>{a.email ?? "—"}</p>
                <p className="text-xs opacity-70 truncate" style={{ color: TEAL }}>{a.program}</p>
                <p className="text-xs opacity-60" style={{ color: TEAL }}>{a.phone ?? "—"}</p>
                <TaskBadge status={displayStatus} />
                <div className="flex items-center gap-1.5 justify-end flex-wrap">
                  {a.businessDescription && (
                    <button
                      onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                      className="text-[10px] px-2 py-1 rounded-lg border transition-all"
                      style={{ borderColor: `${TEAL}20`, color: TEAL }}
                    >
                      Details <ChevronDown size={9} className="inline ml-0.5" style={{ transform: expandedId === a.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                    </button>
                  )}
                  {displayStatus !== "Approved" && displayStatus !== "Rejected" && (
                    <button
                      onClick={() => toast.success(`${a.fullName} approved`)}
                      className="text-[10px] px-2 py-1 rounded-lg transition-all"
                      style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
                    >
                      Approve
                    </button>
                  )}
                  {displayStatus !== "Rejected" && displayStatus !== "Approved" && (
                    <button
                      onClick={() => toast.error(`${a.fullName} rejected`)}
                      className="text-[10px] px-2 py-1 rounded-lg transition-all"
                      style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
              {expandedId === a.id && a.businessDescription && (
                <div className="px-5 py-4 border-b" style={{ borderColor: `${TEAL}06`, backgroundColor: `${TEAL}03` }}>
                  <p className="text-[10px] uppercase tracking-wider opacity-30 mb-2" style={{ color: TEAL }}>Business Description</p>
                  <p className="text-sm leading-relaxed opacity-70" style={{ color: TEAL }}>{a.businessDescription}</p>
                  {a.biggestChallenge && (
                    <>
                      <p className="text-[10px] uppercase tracking-wider opacity-30 mb-2 mt-3" style={{ color: TEAL }}>Biggest Challenge</p>
                      <p className="text-sm leading-relaxed opacity-70" style={{ color: TEAL }}>{a.biggestChallenge}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Funding Tasks Panel ──────────────────────────────────────────────────────
function FundingTasksPanel() {
  const { data: applications, isLoading } = trpc.skills.applications.useQuery();
  const [scores, setScores] = useState<Record<number, string>>({});

  if (isLoading) return <LoadingSpinner />;

  const applicants = applications ?? [];
  // Show applicants that have a business description (analogous to task responses)
  const submitted = applicants.filter(a => a.businessDescription);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Funding Tasks</h2>
        <p className="text-xs opacity-30" style={{ color: TEAL }}>Review submitted business descriptions and assign scores</p>
      </div>

      {submitted.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm opacity-30" style={{ color: TEAL }}>No submissions with business descriptions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {submitted.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: `${TEAL}08` }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: TEAL }}>{a.fullName}</p>
                  <p className="text-xs opacity-40 mt-0.5" style={{ color: TEAL }}>{a.program}</p>
                </div>
                <TaskBadge status={mapAppStatus(a.status)} />
              </div>

              {/* Response text */}
              <div className="rounded-xl p-4" style={{ backgroundColor: `${TEAL}04` }}>
                <p className="text-xs leading-relaxed opacity-70 line-clamp-4" style={{ color: TEAL }}>
                  {a.businessDescription}
                </p>
              </div>

              {/* Score + Notify */}
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={10}
                  placeholder="Score 0–10"
                  value={scores[a.id] ?? ""}
                  onChange={e => setScores(p => ({ ...p, [a.id]: e.target.value }))}
                  className="border-gray-200 bg-gray-50 text-sm w-28"
                />
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  style={{ backgroundColor: ORANGE, color: "white" }}
                  onClick={() => {
                    const s = scores[a.id];
                    if (s) toast.success(`Score ${s}/10 saved. Notification sent to ${a.fullName}.`);
                    else toast(`Notification sent to ${a.fullName}`);
                  }}
                >
                  Notify Applicant
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Communities Panel ────────────────────────────────────────────────────────
function CommunitiesPanel() {
  const { data: communities, isLoading, refetch } = trpc.ridiCommunities.list.useQuery();
  const createMutation = trpc.ridiCommunities.create.useMutation({
    onSuccess: () => { refetch(); toast.success("Community created"); },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.ridiCommunities.update.useMutation({
    onSuccess: () => { refetch(); toast.success("Community updated"); },
    onError: (err) => toast.error(err.message),
  });

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newComm, setNewComm] = useState({ name: "", state: "", coordinator: "", members: 0 });

  if (isLoading) return <LoadingSpinner />;

  const comms = communities ?? [];

  const filtered = comms.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!newComm.name || !newComm.state) {
      toast.error("Name and state are required");
      return;
    }
    createMutation.mutate({ name: newComm.name, state: newComm.state, coordinator: newComm.coordinator || undefined, members: newComm.members || 0, status: "active" });
    setNewComm({ name: "", state: "", coordinator: "", members: 0 });
    setShowCreate(false);
  };

  const toggleStatus = (c: typeof comms[0]) => {
    const nextStatus = c.status === "active" ? "inactive" : "active";
    updateMutation.mutate({ id: c.id, status: nextStatus as any });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Communities</h2>
          <p className="text-xs opacity-30" style={{ color: TEAL }}>{comms.length} registered communities across Nigeria</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: TEAL }} />
            <Input
              placeholder="Search name or state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 border-gray-200 bg-white text-sm w-52"
            />
          </div>
          <Button
            size="sm"
            className="text-xs"
            style={{ backgroundColor: ORANGE, color: "white" }}
            onClick={() => setShowCreate(!showCreate)}
          >
            {showCreate ? "Cancel" : "+ Add"}
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: `${TEAL}08` }}>
          <p className="text-sm font-normal opacity-60" style={{ color: TEAL }}>New Community</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input placeholder="Community Name" value={newComm.name} onChange={e => setNewComm(p => ({ ...p, name: e.target.value }))} className="border-gray-200 text-sm" />
            <Input placeholder="State" value={newComm.state} onChange={e => setNewComm(p => ({ ...p, state: e.target.value }))} className="border-gray-200 text-sm" />
            <Input placeholder="Coordinator" value={newComm.coordinator} onChange={e => setNewComm(p => ({ ...p, coordinator: e.target.value }))} className="border-gray-200 text-sm" />
            <Input type="number" placeholder="Members" value={newComm.members || ""} onChange={e => setNewComm(p => ({ ...p, members: parseInt(e.target.value) || 0 }))} className="border-gray-200 text-sm" />
          </div>
          <Button size="sm" style={{ backgroundColor: TEAL, color: "white" }} onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="animate-spin mr-1" size={12} /> : null}
            Create Community
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${TEAL}08` }}>
        <div
          className="grid gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-wider opacity-40 font-normal"
          style={{ borderColor: `${TEAL}08`, color: TEAL, gridTemplateColumns: "1fr 80px 1fr 80px 80px 60px" }}
        >
          <span>Community Name</span>
          <span>State</span>
          <span>Coordinator</span>
          <span className="text-center">Members</span>
          <span className="text-center">Status</span>
          <span className="text-center">Toggle</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm opacity-30" style={{ color: TEAL }}>No communities match your search</p>
          </div>
        ) : filtered.map((c, i) => {
          const displayStatus = mapCommunityStatus(c.status);
          return (
            <div
              key={c.id}
              className="grid gap-4 px-5 py-4 border-b last:border-0 items-center"
              style={{ borderColor: `${TEAL}06`, gridTemplateColumns: "1fr 80px 1fr 80px 80px 60px", backgroundColor: i % 2 === 0 ? "white" : `${TEAL}02` }}
            >
              <p className="text-sm font-normal" style={{ color: TEAL }}>{c.name}</p>
              <p className="text-xs opacity-60" style={{ color: TEAL }}>{c.state}</p>
              <p className="text-xs opacity-70" style={{ color: TEAL }}>{c.coordinator ?? "—"}</p>
              <p className="text-sm font-medium text-center" style={{ color: TEAL }}>{c.members}</p>
              <div className="flex justify-center">
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: displayStatus === "Active" ? "#DCFCE7" : "#F3F4F6",
                    color: displayStatus === "Active" ? "#166534" : "#6B7280",
                  }}
                >
                  {displayStatus}
                </span>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => toggleStatus(c)}
                  className="text-[10px] px-2 py-1 rounded-lg border transition-all hover:opacity-80"
                  style={{ borderColor: `${TEAL}20`, color: TEAL }}
                  disabled={updateMutation.isPending}
                >
                  {c.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs opacity-30 text-right" style={{ color: TEAL }}>
        Showing {filtered.length} of {comms.length} communities
      </p>
    </div>
  );
}

// ─── Cohort Merge Panel ────────────────────────────────────────────────────────
function CohortMergePanel() {
  const [mergeFlags, setMergeFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_COHORT_STUDENTS.map(s => [s.id, s.mergeRIDI]))
  );

  const toggle = (id: string) => {
    const next = !mergeFlags[id];
    setMergeFlags(p => ({ ...p, [id]: next }));
    const student = MOCK_COHORT_STUDENTS.find(s => s.id === id)!;
    toast(next ? `${student.name} merged with RIDI` : `${student.name} removed from RIDI merge`);
  };

  const mergedCount = Object.values(mergeFlags).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Cohort Merge</h2>
        <p className="text-xs opacity-30" style={{ color: TEAL }}>
          Toggle RIDI flag per student — {mergedCount} of {MOCK_COHORT_STUDENTS.length} currently merged
        </p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${TEAL}08` }}>
        <div
          className="grid gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-wider opacity-40 font-normal"
          style={{ borderColor: `${TEAL}08`, color: TEAL, gridTemplateColumns: "1fr 1fr 80px 120px" }}
        >
          <span>Student</span>
          <span>Program</span>
          <span className="text-center">ID</span>
          <span className="text-center">Merge with RIDI</span>
        </div>

        {MOCK_COHORT_STUDENTS.map((s, i) => (
          <div
            key={s.id}
            className="grid gap-4 px-5 py-4 border-b last:border-0 items-center"
            style={{ borderColor: `${TEAL}06`, gridTemplateColumns: "1fr 1fr 80px 120px", backgroundColor: i % 2 === 0 ? "white" : `${TEAL}02` }}
          >
            <p className="text-sm font-normal" style={{ color: TEAL }}>{s.name}</p>
            <p className="text-xs opacity-60" style={{ color: TEAL }}>{s.program}</p>
            <p className="text-[10px] font-mono opacity-30 text-center" style={{ color: TEAL }}>{s.id}</p>
            <div className="flex justify-center">
              <button
                onClick={() => toggle(s.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-normal transition-all"
                style={{
                  backgroundColor: mergeFlags[s.id] ? `${ORANGE}15` : `${TEAL}08`,
                  color: mergeFlags[s.id] ? ORANGE : `${TEAL}50`,
                  border: `1px solid ${mergeFlags[s.id] ? ORANGE + "30" : TEAL + "10"}`,
                }}
              >
                {mergeFlags[s.id] ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {mergeFlags[s.id] ? "Merged" : "Not Merged"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}08` }}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: TEAL }}>
              {mergedCount} student{mergedCount !== 1 ? "s" : ""} flagged for RIDI merge
            </p>
            <p className="text-xs opacity-40 mt-0.5" style={{ color: TEAL }}>
              Merged students receive RIDI community mentorship and accountability check-ins in addition to standard cohort access.
            </p>
          </div>
          <Button
            size="sm"
            style={{ backgroundColor: ORANGE, color: "white" }}
            onClick={() => toast.success(`Merge flags saved for ${mergedCount} students`)}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
