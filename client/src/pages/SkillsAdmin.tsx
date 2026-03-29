import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  BarChart, BookOpen, Users, UserCheck, ShieldCheck,
  Search, LogOut, ChevronDown, Mail, Phone, Calendar,
  TrendingUp, Award, Globe, Target, Plus, CheckCircle, Clock, XCircle, AlertCircle,
  Download, Filter, Trophy, Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NAVY = "#1E3A5F";  // Skills primary — dark navy blue
const GOLD = "#B48C4C";
const PAGE_SIZE = 20;

type AppStatus = "submitted" | "under_review" | "accepted" | "waitlisted" | "rejected";

// ─── Status badge helper ──────────────────────────────────────────────────────
function AppStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700" },
    under_review: { label: "Under Review", cls: "bg-yellow-100 text-yellow-700" },
    accepted: { label: "Accepted", cls: "bg-green-100 text-green-700" },
    waitlisted: { label: "Waitlisted", cls: "bg-orange-100 text-orange-700" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${s.cls}`}>{s.label}</span>;
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    paid: { label: "Paid", cls: "bg-green-50 text-green-700 border border-green-200" },
    waived: { label: "Waived", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
    refunded: { label: "Refunded", cls: "bg-gray-100 text-gray-600 border border-gray-200" },
  };
  const s = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function SkillsAdmin() {
  const { user, loading } = useAuth();
  const { data: cohorts } = trpc.skills.listCohorts.useQuery();
  const { data: stats } = trpc.skills.adminStats.useQuery();
  const [activeSection, setActiveSection] = useState<"overview" | "cohorts" | "students" | "facilitators" | "milestones" | "competition" | "ridi">("overview");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 animate-pulse" style={{ backgroundColor: GOLD }}>H</div>
          <p className="text-gray-500">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { key: "overview" as const, icon: BarChart, label: "Overview" },
    { key: "cohorts" as const, icon: BookOpen, label: "Cohorts" },
    { key: "students" as const, icon: Users, label: "Students" },
    { key: "facilitators" as const, icon: UserCheck, label: "Facilitators" },
    { key: "milestones" as const, icon: Trophy, label: "Milestones" },
    { key: "competition" as const, icon: Target, label: "Competition" },
    { key: "ridi" as const, icon: ShieldCheck, label: "RIDI Impact", accent: true },
  ];

  const sectionTitles: Record<string, string> = {
    overview: "Executive Overview",
    cohorts: "Cohorts",
    students: "Student Management",
    facilitators: "Facilitator Directory",
    milestones: "Milestone Calendar",
    competition: "Competition Management",
    ridi: "RIDI Impact Dashboard",
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <PageMeta title="Skills Admin — HAMZURY" description="Skills department administration for HAMZURY." />
      {/* Sidebar */}
      <div className="w-20 md:w-64 bg-gray-900 flex flex-col h-full text-gray-300 transition-all shrink-0">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-800 shrink-0">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-white md:mr-3" style={{ backgroundColor: GOLD }}>H</div>
          <span className="font-bold text-white hidden md:block">ADMIN PORTAL</span>
        </div>
        <div className="flex-1 py-6 space-y-2 overflow-y-auto px-3">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center justify-center md:justify-start px-3 py-3 rounded-lg font-medium transition-colors ${
                activeSection === item.key
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800 hover:text-white"
              } ${item.accent ? "text-green-400" : ""}`}
            >
              <item.icon size={20} className="md:mr-3 shrink-0" />
              <span className="hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800">
          <Link href="/skills" className="w-full flex items-center justify-center md:justify-start px-3 py-2 text-gray-400 hover:text-white transition-colors">
            <LogOut size={20} className="md:mr-3 shrink-0" />
            <span className="hidden md:block">Back to Skills</span>
          </Link>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">{sectionTitles[activeSection]}</h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-bold">
              {(user?.name || "A").charAt(0)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {activeSection === "overview" && <OverviewPanel stats={stats} cohorts={cohorts} />}
          {activeSection === "cohorts" && <CohortsPanel cohorts={cohorts} />}
          {activeSection === "students" && <StudentsPanel />}
          {activeSection === "facilitators" && <FacilitatorsPanel cohorts={cohorts} />}
          {activeSection === "milestones" && <MilestonesPanel />}
          {activeSection === "competition" && <CompetitionPanel />}
          {activeSection === "ridi" && <RidiPanel stats={stats} />}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel({ stats, cohorts }: { stats: any; cohorts: any }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Active Cohorts</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats?.activeCohorts ?? 0}</p>
            <p className="text-xs text-green-600 mt-2 font-medium">↑ {stats?.upcomingCohorts ?? 0} launching soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Pending Apps</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats?.pendingApps ?? 0}</p>
            <p className="text-xs text-yellow-600 mt-2 font-medium">Review within 48h</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">RIDI Communities</p>
            <p className="text-3xl font-extrabold" style={{ color: GOLD }}>{stats?.ridiCommunities ?? 28}</p>
            <p className="text-xs text-gray-600 mt-2 font-medium">Impact target: 30</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-gray-900">{stats?.totalStudents ?? 0}</p>
            <p className="text-xs text-green-600 mt-2 font-medium">Across all cohorts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800">Cohort Management</h2>
            <Button size="sm" className="text-white" style={{ backgroundColor: "#333" }} onClick={() => toast("New Cohort creation coming soon")}>
              + New Cohort
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-5">Program / Pathway</div>
                <div className="col-span-3">Status / Dates</div>
                <div className="col-span-2">Seats</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
              <div className="divide-y divide-gray-100">
                {(cohorts ?? []).length === 0 && (
                  <div className="p-8 text-center text-sm text-gray-400">
                    No cohorts yet — create one to start tracking enrollments.
                  </div>
                )}
                {(cohorts ?? []).map((cohort: any) => (
                  <div key={cohort.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-5">
                      <p className="font-bold text-gray-900 text-sm">{cohort.title}</p>
                      <p className="text-xs text-gray-500">{cohort.pathway} • Cohort #{String(cohort.id).padStart(3, "0")}</p>
                    </div>
                    <div className="col-span-3">
                      <Badge variant="secondary" className={`text-[10px] mb-1 ${cohort.status === "enrolling" ? "bg-green-100 text-green-700 hover:bg-green-100" : cohort.status === "in_progress" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}`}>
                        {cohort.status?.replace("_", " ")}
                      </Badge>
                      <p className="text-xs text-gray-600">{cohort.startDate} – {cohort.endDate}</p>
                    </div>
                    <div className="col-span-2">
                      <Progress value={(cohort.enrolledCount / cohort.maxSeats) * 100} className="h-1.5 mb-1" />
                      <p className="text-xs font-bold text-gray-700">{cohort.enrolledCount}/{cohort.maxSeats}</p>
                    </div>
                    <div className="col-span-2 text-right">
                      <Button variant="ghost" size="sm" className="text-xs font-bold" onClick={() => toast("Cohort management coming soon")}>Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              {[
                { num: 1, color: "bg-red-100 text-red-600", title: "Review new applications", desc: `${stats?.pendingApps ?? 0} pending. Approaching deadline.` },
                { num: 2, color: "bg-yellow-100 text-yellow-700", title: "Approve Session Plan", desc: "Facilitator uploaded week 2 slides." },
                { num: 3, color: "bg-gray-100 text-gray-600", title: "Send Deadline Reminders", desc: "Draft broadcast to unconverted leads." },
                { num: 4, color: "bg-gray-100 text-gray-600", title: "Update RIDI Report", desc: "Quarterly impact metrics due Friday." },
              ].map(p => (
                <div key={p.num} className="flex items-start">
                  <div className={`w-6 h-6 rounded ${p.color} flex items-center justify-center text-xs font-bold mr-3 shrink-0 mt-0.5`}>{p.num}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <Button variant="outline" className="w-full text-sm font-bold" onClick={() => toast("Full task view coming soon")}>
                  View All Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// ─── Cohorts Panel ────────────────────────────────────────────────────────────
function CohortsPanel({ cohorts }: { cohorts: any }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">All Cohorts</h2>
        <Button className="text-white" style={{ backgroundColor: GOLD }} onClick={() => toast("New Cohort creation coming soon")}>
          + New Cohort
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(cohorts ?? []).length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={40} className="mb-4 opacity-20" style={{ color: "#6B7280" }} />
            <p className="text-lg font-medium text-gray-700 mb-2">No cohorts yet</p>
            <p className="text-sm text-gray-400 mb-6">Create your first cohort to start enrolling students.</p>
            <Button className="text-white" style={{ backgroundColor: "#6B7280" }} onClick={() => toast("New cohort creation coming soon")}>
              + Create First Cohort
            </Button>
          </div>
        )}
        {(cohorts ?? []).map((c: any) => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className={c.status === "enrolling" ? "bg-green-100 text-green-700 hover:bg-green-100" : c.status === "in_progress" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}>
                  {c.status?.replace("_", " ")}
                </Badge>
                <span className="text-xs text-gray-500">{c.pathway}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{c.startDate} – {c.endDate}</p>
              <div className="flex items-center justify-between">
                <div>
                  <Progress value={(c.enrolledCount / c.maxSeats) * 100} className="w-20 h-1.5 mb-1" />
                  <p className="text-xs text-gray-600">{c.enrolledCount}/{c.maxSeats} seats</p>
                </div>
                {c.earlyBirdPrice && (
                  <p className="text-sm font-bold" style={{ color: GOLD }}>₦{Number(c.earlyBirdPrice).toLocaleString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Students Panel ───────────────────────────────────────────────────────────
function StudentsPanel() {
  const { data: applications, refetch } = trpc.skills.applications.useQuery();
  const updateStatus = trpc.skills.updateApplicationStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Status updated"); },
    onError: () => toast.error("Update failed"),
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "physical" | "online" | "nitda">("all");
  const [page, setPage] = useState(1);

  const apps = (applications ?? []) as any[];

  const filtered = apps.filter(a => {
    const matchSearch = !search || a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.ref?.toLowerCase().includes(search.toLowerCase()) ||
      a.program?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchType = typeFilter === "all" ||
      (typeFilter === "physical" && a.pathway === "physical") ||
      (typeFilter === "online" && a.pathway === "online") ||
      (typeFilter === "nitda" && (a.program?.toLowerCase().includes("nitda") || a.program?.toLowerCase().includes("hals")));
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all: apps.length,
    accepted: apps.filter(a => a.status === "accepted").length,
    submitted: apps.filter(a => a.status === "submitted").length,
    under_review: apps.filter(a => a.status === "under_review").length,
    waitlisted: apps.filter(a => a.status === "waitlisted").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Apps", count: counts.all, color: "text-gray-800" },
          { label: "Enrolled", count: counts.accepted, color: "text-green-600" },
          { label: "Pending", count: counts.submitted, color: "text-blue-600" },
          { label: "Under Review", count: counts.under_review, color: "text-yellow-600" },
          { label: "Waitlisted", count: counts.waitlisted, color: "text-orange-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, ref, program..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-gray-50"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({counts.all})</SelectItem>
                <SelectItem value="submitted">Submitted ({counts.submitted})</SelectItem>
                <SelectItem value="under_review">Under Review ({counts.under_review})</SelectItem>
                <SelectItem value="accepted">Accepted ({counts.accepted})</SelectItem>
                <SelectItem value="waitlisted">Waitlisted ({counts.waitlisted})</SelectItem>
                <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as any); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Student type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="nitda">NITDA / HALs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Name / Contact</div>
            <div className="col-span-2">Program</div>
            <div className="col-span-1">Ref</div>
            <div className="col-span-2">App Status</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {paged.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">{search || statusFilter !== "all" ? "No results match your filters" : "No applications yet"}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paged.map((app: any) => (
                <div key={app.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-gray-50 transition-colors text-sm">
                  <div className="col-span-3">
                    <p className="font-semibold text-gray-900 truncate">{app.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{app.email}</p>
                    {app.phone && <p className="text-xs text-gray-400">{app.phone}</p>}
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-gray-800 text-xs">{app.program}</p>
                    {app.pathway && <p className="text-xs text-gray-500 capitalize">{app.pathway}</p>}
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs font-mono text-gray-600">{app.ref}</p>
                  </div>
                  <div className="col-span-2">
                    <AppStatusBadge status={app.status} />
                  </div>
                  <div className="col-span-2">
                    <PayBadge status={app.paymentStatus} />
                    {app.pricingTier && <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{app.pricingTier.replace("_", " ")}</p>}
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500">{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—"}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <StatusChangeDropdown
                      current={app.status}
                      onSelect={(status) => updateStatus.mutate({ id: app.id, status })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50 text-sm">
              <span className="text-gray-500">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Status change dropdown ───────────────────────────────────────────────────
function StatusChangeDropdown({ current, onSelect }: { current: string; onSelect: (s: AppStatus) => void }) {
  const statuses: AppStatus[] = ["submitted", "under_review", "accepted", "waitlisted", "rejected"];
  const icons: Record<AppStatus, React.ReactNode> = {
    submitted: <Clock size={12} />,
    under_review: <AlertCircle size={12} />,
    accepted: <CheckCircle size={12} />,
    waitlisted: <Calendar size={12} />,
    rejected: <XCircle size={12} />,
  };

  return (
    <Select value={current} onValueChange={(v) => onSelect(v as AppStatus)}>
      <SelectTrigger className="h-7 text-xs border-gray-200 w-auto min-w-[80px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map(s => (
          <SelectItem key={s} value={s} className="text-xs">
            <span className="flex items-center gap-1.5 capitalize">
              {icons[s]} {s.replace("_", " ")}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Facilitators Panel ───────────────────────────────────────────────────────
const SAMPLE_FACILITATORS = [
  { id: 1, name: "Adaeze Okafor", role: "Lead Facilitator", specialty: "Business Strategy & Finance", cohorts: ["Business Essentials Cohort 3", "Revenue Systems Cohort 1"], sessions: 24, rating: 4.9, status: "active", email: "adaeze@hamzury.com" },
  { id: 2, name: "Chukwuemeka Nwosu", role: "Facilitator", specialty: "Digital Marketing & Growth", cohorts: ["Digital Marketing Cohort 2"], sessions: 18, rating: 4.7, status: "active", email: "emeka@hamzury.com" },
  { id: 3, name: "Fatima Al-Hassan", role: "Facilitator", specialty: "Operations & Systems", cohorts: ["Operations Cohort 1"], sessions: 12, rating: 4.8, status: "active", email: "fatima@hamzury.com" },
  { id: 4, name: "Tunde Bankole", role: "Guest Facilitator", specialty: "Legal & Compliance", cohorts: [], sessions: 6, rating: 5.0, status: "pending", email: "tunde@example.com" },
];

function FacilitatorsPanel({ cohorts }: { cohorts: any }) {
  const [search, setSearch] = useState("");
  const facs = SAMPLE_FACILITATORS.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Facilitators", value: SAMPLE_FACILITATORS.length, icon: UserCheck, color: "text-gray-800" },
          { label: "Active", value: SAMPLE_FACILITATORS.filter(f => f.status === "active").length, icon: CheckCircle, color: "text-green-600" },
          { label: "Avg Rating", value: "4.85", icon: Award, color: "text-yellow-600" },
          { label: "Sessions Delivered", value: SAMPLE_FACILITATORS.reduce((s, f) => s + f.sessions, 0), icon: BookOpen, color: "text-blue-600" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon size={20} className={s.color} />
              <div>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search facilitators..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-gray-50" />
        </div>
        <Button className="text-white shrink-0" style={{ backgroundColor: GOLD }} onClick={() => toast("Add Facilitator form coming soon")}>
          <Plus size={16} className="mr-2" /> Add Facilitator
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {facs.map(fac => (
          <Card key={fac.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-sm">
                    {fac.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{fac.name}</p>
                    <p className="text-xs text-gray-500">{fac.role}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${fac.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {fac.status}
                </span>
              </div>

              <p className="text-xs font-medium text-gray-700 mb-3">{fac.specialty}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Award size={12} className="text-yellow-500" /> {fac.rating}/5.0</span>
                <span className="flex items-center gap-1"><BookOpen size={12} /> {fac.sessions} sessions</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {fac.email}</span>
              </div>

              {fac.cohorts.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Assigned Cohorts</p>
                  <div className="flex flex-wrap gap-1">
                    {fac.cohorts.map(c => (
                      <span key={c} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => toast(`Viewing ${fac.name}'s profile`)}>View Profile</Button>
                <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => toast("Cohort assignment coming soon")}>Assign Cohort</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}

// ─── RIDI Impact Panel ────────────────────────────────────────────────────────
const RIDI_COMMUNITIES = [
  { name: "Karu, FCT", region: "North Central", graduates: 42, active: true },
  { name: "Zuba Market, FCT", region: "North Central", graduates: 35, active: true },
  { name: "Nyanya, FCT", region: "North Central", graduates: 28, active: true },
  { name: "Kubwa, Abuja", region: "North Central", graduates: 51, active: true },
  { name: "Mararaba, Nasarawa", region: "North Central", graduates: 19, active: true },
  { name: "Gwagwalada, FCT", region: "North Central", graduates: 23, active: true },
  { name: "Bwari, FCT", region: "North Central", graduates: 17, active: true },
  { name: "Onitsha, Anambra", region: "South East", graduates: 38, active: true },
  { name: "Aba, Abia", region: "South East", graduates: 44, active: true },
  { name: "Enugu City", region: "South East", graduates: 29, active: true },
  { name: "Owerri, Imo", region: "South East", graduates: 31, active: true },
  { name: "Abeokuta, Ogun", region: "South West", graduates: 27, active: true },
  { name: "Ibadan Central", region: "South West", graduates: 48, active: true },
  { name: "Lagos Island", region: "South West", graduates: 53, active: true },
  { name: "Ikeja, Lagos", region: "South West", graduates: 39, active: true },
  { name: "Yaba, Lagos", region: "South West", graduates: 22, active: true },
  { name: "Kano City", region: "North West", graduates: 33, active: true },
  { name: "Kaduna South", region: "North West", graduates: 26, active: true },
  { name: "Zaria, Kaduna", region: "North West", graduates: 18, active: true },
  { name: "Maiduguri, Borno", region: "North East", graduates: 15, active: true },
  { name: "Yola, Adamawa", region: "North East", graduates: 12, active: true },
  { name: "Port Harcourt", region: "South South", graduates: 41, active: true },
  { name: "Warri, Delta", region: "South South", graduates: 24, active: true },
  { name: "Benin City, Edo", region: "South South", graduates: 36, active: true },
  { name: "Calabar, Cross River", region: "South South", graduates: 20, active: true },
  { name: "Uyo, Akwa Ibom", region: "South South", graduates: 16, active: true },
  { name: "Makurdi, Benue", region: "North Central", graduates: 14, active: true },
  { name: "Lokoja, Kogi", region: "North Central", graduates: 11, active: true },
];

const QUARTERLY_REPORTS = [
  { quarter: "Q4 2025", submitted: "2026-01-15", graduates: 143, communities: 24, placements: 89, status: "approved" },
  { quarter: "Q3 2025", submitted: "2025-10-12", graduates: 118, communities: 21, placements: 74, status: "approved" },
  { quarter: "Q2 2025", submitted: "2025-07-10", graduates: 97, communities: 18, placements: 61, status: "approved" },
  { quarter: "Q1 2025", submitted: "2025-04-08", graduates: 87, communities: 15, placements: 55, status: "approved" },
];

function RidiPanel({ stats }: { stats: any }) {
  const [reportSearch, setReportSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "communities" | "reports">("overview");
  const [showReportForm, setShowReportForm] = useState(false);

  const totalGraduates = RIDI_COMMUNITIES.reduce((s, c) => s + c.graduates, 0);
  const regions = Array.from(new Set(RIDI_COMMUNITIES.map(c => c.region)));

  const filteredComs = RIDI_COMMUNITIES.filter(c =>
    (regionFilter === "all" || c.region === regionFilter) &&
    (!reportSearch || c.name.toLowerCase().includes(reportSearch.toLowerCase()) || c.region.toLowerCase().includes(reportSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#FFF9E6] border-yellow-200">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-extrabold" style={{ color: GOLD }}>{RIDI_COMMUNITIES.length}</p>
            <p className="text-sm text-gray-700 mt-1 font-medium">Communities Reached</p>
            <p className="text-xs text-gray-500 mt-1">Target: 30 by end of 2026</p>
            <Progress value={(RIDI_COMMUNITIES.length / 30) * 100} className="h-1.5 mt-3" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-extrabold text-green-600">{totalGraduates}</p>
            <p className="text-sm text-gray-700 mt-1 font-medium">Scholarship Graduates</p>
            <p className="text-xs text-gray-500 mt-1">Full tuition + mentorship</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-extrabold text-blue-600">62%</p>
            <p className="text-sm text-gray-700 mt-1 font-medium">Placement Rate</p>
            <p className="text-xs text-gray-500 mt-1">Into full-time roles</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-extrabold text-purple-600">6</p>
            <p className="text-sm text-gray-700 mt-1 font-medium">Geopolitical Zones</p>
            <p className="text-xs text-gray-500 mt-1">National reach confirmed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["overview", "communities", "reports"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab ? "border-current text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            style={activeTab === tab ? { borderColor: GOLD, color: GOLD } : {}}
          >
            {tab === "overview" ? "Impact Overview" : tab === "communities" ? `Communities (${RIDI_COMMUNITIES.length})` : "Quarterly Reports"}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Regional breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Regional Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {regions.map(region => {
                const regionComs = RIDI_COMMUNITIES.filter(c => c.region === region);
                const regionGrads = regionComs.reduce((s, c) => s + c.graduates, 0);
                return (
                  <div key={region} className="flex items-center gap-4">
                    <p className="text-sm font-medium text-gray-700 w-32 shrink-0">{region}</p>
                    <div className="flex-1">
                      <Progress value={(regionGrads / totalGraduates) * 100} className="h-2" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 w-20 text-right">{regionGrads} grads</p>
                    <p className="text-xs text-gray-500 w-16 text-right">{regionComs.length} coms</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Impact goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">2026 Impact Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { goal: "30 Communities", current: RIDI_COMMUNITIES.length, target: 30, color: "bg-yellow-400" },
                  { goal: "600 Graduates", current: totalGraduates, target: 600, color: "bg-green-500" },
                  { goal: "70% Placement", current: 62, target: 70, color: "bg-blue-500" },
                ].map(g => (
                  <div key={g.goal} className="p-4 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">{g.goal}</p>
                      <p className="text-xs font-bold text-gray-500">{g.current}/{g.target}</p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${g.color}`} style={{ width: `${Math.min(100, (g.current / g.target) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{Math.round((g.current / g.target) * 100)}% complete</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Communities tab */}
      {activeTab === "communities" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search communities..." value={reportSearch} onChange={e => setReportSearch(e.target.value)} className="pl-9 bg-gray-50" />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Community</div>
                <div className="col-span-3">Region</div>
                <div className="col-span-3">Graduates</div>
                <div className="col-span-2">Status</div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                {filteredComs.map(c => (
                  <div key={c.name} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-gray-50 text-sm">
                    <div className="col-span-4 font-medium text-gray-900">{c.name}</div>
                    <div className="col-span-3 text-xs text-gray-500">{c.region}</div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        <Progress value={(c.graduates / 55) * 100} className="h-1.5 w-16" />
                        <span className="text-xs font-bold text-gray-700">{c.graduates}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">Active</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-500">Showing {filteredComs.length} of {RIDI_COMMUNITIES.length} communities</p>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast("Export coming soon")}>
                  <Download size={13} className="mr-1.5" /> Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Quarterly Impact Reports</h3>
            <Button className="text-white text-sm" style={{ backgroundColor: GOLD }} onClick={() => setShowReportForm(!showReportForm)}>
              <Plus size={16} className="mr-2" /> Submit Q1 2026
            </Button>
          </div>

          {showReportForm && (
            <Card className="border-2" style={{ borderColor: GOLD + "40" }}>
              <CardContent className="p-6">
                <h4 className="font-bold text-gray-800 mb-4">Q1 2026 — Impact Report</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">New Graduates</label>
                    <Input type="number" placeholder="0" className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Communities Served</label>
                    <Input type="number" placeholder="0" className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Placements Confirmed</label>
                    <Input type="number" placeholder="0" className="bg-gray-50" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Key Highlights (optional)</label>
                  <textarea className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 resize-none focus:outline-none focus:ring-1" rows={3} placeholder="Notable outcomes, partnerships, or challenges this quarter..." />
                </div>
                <div className="flex gap-3">
                  <Button className="text-white" style={{ backgroundColor: GOLD }} onClick={() => { toast.success("Q1 2026 report submitted"); setShowReportForm(false); }}>
                    Submit Report
                  </Button>
                  <Button variant="outline" onClick={() => setShowReportForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Quarter</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-2">Graduates</div>
                <div className="col-span-2">Communities</div>
                <div className="col-span-2">Placements</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1 text-right">PDF</div>
              </div>
              <div className="divide-y divide-gray-100">
                {QUARTERLY_REPORTS.map(r => (
                  <div key={r.quarter} className="grid grid-cols-12 gap-3 p-4 items-center text-sm hover:bg-gray-50">
                    <div className="col-span-2 font-bold text-gray-900">{r.quarter}</div>
                    <div className="col-span-2 text-xs text-gray-500">{r.submitted}</div>
                    <div className="col-span-2 font-semibold text-green-700">{r.graduates}</div>
                    <div className="col-span-2 font-semibold" style={{ color: GOLD }}>{r.communities}</div>
                    <div className="col-span-2 font-semibold text-blue-700">{r.placements}</div>
                    <div className="col-span-1">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-700">{r.status}</span>
                    </div>
                    <div className="col-span-1 text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast("PDF export coming soon")}>
                        <Download size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Competition Panel ────────────────────────────────────────────────────────
function CompetitionPanel() {
  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`;
  const [quarter, setQuarter] = useState(currentQuarter);
  const [subTab, setSubTab] = useState<"teams" | "sessions" | "awards">("teams");

  // Data queries
  const teamsQuery = trpc.skillsCompetition.teams.useQuery({ quarter });
  const sessionsQuery = trpc.skillsCompetition.sessions.useQuery({ quarter });
  const awardsQuery = trpc.skillsCompetition.awards.useQuery({ quarter });

  // Mutations
  const createTeam = trpc.skillsCompetition.createTeam.useMutation({
    onSuccess: () => { teamsQuery.refetch(); setShowTeamForm(false); toast.success("Team created"); },
    onError: () => toast.error("Failed to create team"),
  });
  const createSession = trpc.skillsCompetition.createSession.useMutation({
    onSuccess: () => { sessionsQuery.refetch(); setShowSessionForm(false); toast.success("Session added"); },
    onError: () => toast.error("Failed to add session"),
  });
  const createAward = trpc.skillsCompetition.createAward.useMutation({
    onSuccess: () => { awardsQuery.refetch(); setShowAwardForm(false); toast.success("Award given"); },
    onError: () => toast.error("Failed to give award"),
  });

  // Form states
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", color: "#1E3A5F" });
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ weekNumber: 1, dayOfWeek: "monday" as "monday" | "tuesday" | "wednesday", title: "", type: "game" as any, sessionDate: "" });
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [awardForm, setAwardForm] = useState({ teamName: "", awardType: "champion" as any, title: "", recipientName: "", awardDate: "" });

  const teams = (teamsQuery.data ?? []) as any[];
  const sessions = (sessionsQuery.data ?? []) as any[];
  const awards = (awardsQuery.data ?? []) as any[];

  const SESSION_TYPE_LABELS: Record<string, string> = {
    game: "Games", tech_talk: "Tech Talk", entrepreneurship: "Entrepreneurship",
    prompt_challenge: "Prompt Challenge", tool_exploration: "Tool Exploration",
    social_media: "Social Media", content_creation: "Content Creation", branding: "Branding",
  };

  const AWARD_TYPE_LABELS: Record<string, string> = {
    champion: "Champion", runner_up: "Runner Up", best_project: "Best Project",
    best_content: "Best Content", most_improved: "Most Improved", special: "Special Award",
  };

  const teamStatusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    eliminated: "bg-red-100 text-red-700",
    champion: "bg-yellow-100 text-yellow-800",
  };

  const sessionStatusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      {/* Quarter selector + sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["teams", "sessions", "awards"] as const).map(t => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === t ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={{ backgroundColor: subTab === t ? NAVY : undefined }}>
              {t === "teams" ? "Leaderboard" : t === "sessions" ? "Sessions" : "Awards"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Quarter:</span>
          <Input value={quarter} onChange={e => setQuarter(e.target.value)} className="w-28 h-8 text-sm" placeholder="Q1-2026" />
        </div>
      </div>

      {/* ── TEAMS LEADERBOARD ── */}
      {subTab === "teams" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Teams Leaderboard</h2>
            <Button className="text-white" style={{ backgroundColor: GOLD }} onClick={() => setShowTeamForm(true)}>
              <Plus size={16} className="mr-2" /> Create Team
            </Button>
          </div>

          {showTeamForm && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-gray-800">Create New Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input placeholder="Team name" value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Color:</span>
                    <input type="color" value={teamForm.color} onChange={e => setTeamForm(p => ({ ...p, color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border" />
                    <span className="text-xs text-gray-400 font-mono">{teamForm.color}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="text-white flex-1" style={{ backgroundColor: NAVY }}
                      disabled={!teamForm.name.trim() || createTeam.isPending}
                      onClick={() => createTeam.mutate({ name: teamForm.name, quarter, color: teamForm.color })}>
                      {createTeam.isPending ? <Loader2 size={14} className="animate-spin" /> : "Create"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowTeamForm(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Team</div>
                <div className="col-span-2 text-center">Points</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-1 text-center">L</div>
                <div className="col-span-1 text-center">Members</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {teams.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Target size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No teams for {quarter}</p>
                  <p className="text-xs mt-1">Create teams to start the competition.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {teams.map((t: any, idx: number) => (
                    <div key={t.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-gray-50 transition-colors text-sm">
                      <div className="col-span-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? "text-white" : "bg-gray-100 text-gray-600"}`}
                          style={{ backgroundColor: idx === 0 ? "#D4A017" : idx === 1 ? "#A0A0A0" : idx === 2 ? "#CD7F32" : undefined }}>
                          {idx + 1}
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color || NAVY }} />
                        <div>
                          <p className="font-bold text-gray-900">{t.name}</p>
                          {t.captainName && <p className="text-xs text-gray-500">Captain: {t.captainName}</p>}
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-lg font-extrabold" style={{ color: NAVY }}>{t.points ?? 0}</span>
                      </div>
                      <div className="col-span-1 text-center text-green-600 font-bold">{t.wins ?? 0}</div>
                      <div className="col-span-1 text-center text-red-500 font-bold">{t.losses ?? 0}</div>
                      <div className="col-span-1 text-center text-gray-600">{t.memberCount ?? 0}</div>
                      <div className="col-span-2 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${teamStatusColors[t.status ?? t.teamStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {(t.status ?? t.teamStatus ?? "active").replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── INTERACTIVE SESSIONS ── */}
      {subTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Interactive Sessions</h2>
              <p className="text-xs text-gray-500 mt-1">Mon: Games, Tech Talk, Entrepreneurship | Tue: Prompt Challenges, Tool Exploration | Wed: Social Media, Content, Branding</p>
            </div>
            <Button className="text-white" style={{ backgroundColor: GOLD }} onClick={() => setShowSessionForm(true)}>
              <Plus size={16} className="mr-2" /> Add Session
            </Button>
          </div>

          {showSessionForm && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-gray-800">Add New Session</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Input placeholder="Session title" value={sessionForm.title} onChange={e => setSessionForm(p => ({ ...p, title: e.target.value }))} />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Week #</label>
                      <Input type="number" min={1} max={12} value={sessionForm.weekNumber} onChange={e => setSessionForm(p => ({ ...p, weekNumber: parseInt(e.target.value) || 1 }))} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Day</label>
                      <Select value={sessionForm.dayOfWeek} onValueChange={v => setSessionForm(p => ({ ...p, dayOfWeek: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Type</label>
                    <Select value={sessionForm.type} onValueChange={v => setSessionForm(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SESSION_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="date" value={sessionForm.sessionDate} onChange={e => setSessionForm(p => ({ ...p, sessionDate: e.target.value }))} />
                  <div className="flex gap-2 items-end">
                    <Button className="text-white flex-1" style={{ backgroundColor: NAVY }}
                      disabled={!sessionForm.title.trim() || createSession.isPending}
                      onClick={() => createSession.mutate({ quarter, ...sessionForm })}>
                      {createSession.isPending ? <Loader2 size={14} className="animate-spin" /> : "Add"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowSessionForm(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1">Week</div>
                <div className="col-span-2">Day</div>
                <div className="col-span-3">Title</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {sessions.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Calendar size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No sessions for {quarter}</p>
                  <p className="text-xs mt-1">Add interactive sessions to schedule the competition week.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sessions.map((s: any) => (
                    <div key={s.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-gray-50 transition-colors text-sm">
                      <div className="col-span-1">
                        <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `${NAVY}10`, color: NAVY }}>W{s.weekNumber}</span>
                      </div>
                      <div className="col-span-2 capitalize text-gray-700 font-medium">{s.dayOfWeek}</div>
                      <div className="col-span-3 font-semibold text-gray-900">{s.title}</div>
                      <div className="col-span-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {SESSION_TYPE_LABELS[s.type ?? s.sessionType] ?? s.type ?? s.sessionType}
                        </span>
                      </div>
                      <div className="col-span-2 text-xs text-gray-500">
                        {s.sessionDate ? new Date(s.sessionDate + "T00:00:00").toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "TBD"}
                        <br /><span className="text-gray-400">{s.timeSlot || "11:00 AM - 1:00 PM"}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${sessionStatusColors[s.status ?? s.sessionStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {(s.status ?? s.sessionStatus ?? "scheduled").replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── AWARDS ── */}
      {subTab === "awards" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Awards</h2>
            <Button className="text-white" style={{ backgroundColor: GOLD }} onClick={() => setShowAwardForm(true)}>
              <Plus size={16} className="mr-2" /> Give Award
            </Button>
          </div>

          {showAwardForm && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-gray-800">Give Award</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Input placeholder="Award title" value={awardForm.title} onChange={e => setAwardForm(p => ({ ...p, title: e.target.value }))} />
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Award Type</label>
                    <Select value={awardForm.awardType} onValueChange={v => setAwardForm(p => ({ ...p, awardType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(AWARD_TYPE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input placeholder="Team name" value={awardForm.teamName} onChange={e => setAwardForm(p => ({ ...p, teamName: e.target.value }))} />
                  <Input placeholder="Recipient name (optional)" value={awardForm.recipientName} onChange={e => setAwardForm(p => ({ ...p, recipientName: e.target.value }))} />
                  <Input type="date" value={awardForm.awardDate} onChange={e => setAwardForm(p => ({ ...p, awardDate: e.target.value }))} />
                  <div className="flex gap-2 items-end">
                    <Button className="text-white flex-1" style={{ backgroundColor: NAVY }}
                      disabled={!awardForm.title.trim() || createAward.isPending}
                      onClick={() => createAward.mutate({ quarter, ...awardForm })}>
                      {createAward.isPending ? <Loader2 size={14} className="animate-spin" /> : "Give Award"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAwardForm(false)}>Cancel</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 p-4 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Type</div>
                <div className="col-span-3">Title</div>
                <div className="col-span-2">Team</div>
                <div className="col-span-2">Recipient</div>
                <div className="col-span-1 text-center">Cert</div>
                <div className="col-span-2 text-right">Date</div>
              </div>
              {awards.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Award size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No awards for {quarter}</p>
                  <p className="text-xs mt-1">Give awards to teams and individuals at the end of the quarter.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {awards.map((a: any) => {
                    const typeIcon: Record<string, string> = {
                      champion: "bg-yellow-100 text-yellow-800",
                      runner_up: "bg-gray-100 text-gray-700",
                      best_project: "bg-blue-100 text-blue-700",
                      best_content: "bg-purple-100 text-purple-700",
                      most_improved: "bg-green-100 text-green-700",
                      special: "bg-pink-100 text-pink-700",
                    };
                    return (
                      <div key={a.id} className="grid grid-cols-12 gap-3 p-4 items-center hover:bg-gray-50 transition-colors text-sm">
                        <div className="col-span-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${typeIcon[a.awardType] ?? "bg-gray-100 text-gray-600"}`}>
                            <Trophy size={11} /> {AWARD_TYPE_LABELS[a.awardType] ?? a.awardType}
                          </span>
                        </div>
                        <div className="col-span-3 font-semibold text-gray-900">{a.title}</div>
                        <div className="col-span-2 text-gray-700">{a.teamName || "—"}</div>
                        <div className="col-span-2 text-gray-700">{a.recipientName || "—"}</div>
                        <div className="col-span-1 text-center">
                          {a.certificationIssued ? (
                            <CheckCircle size={16} className="text-green-600 mx-auto" />
                          ) : (
                            <XCircle size={16} className="text-gray-300 mx-auto" />
                          )}
                        </div>
                        <div className="col-span-2 text-right text-xs text-gray-500">
                          {a.awardDate ? new Date(a.awardDate + "T00:00:00").toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Milestones Panel ─────────────────────────────────────────────────────────
function MilestonesPanel() {
  const [typeFilter, setTypeFilter] = useState<"physical" | "online" | "nitda">("physical");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cohortName: "", title: "", description: "", milestoneDate: "", type: "assignment" as const, studentType: "physical" as "physical" | "online" | "nitda" });

  const milestonesQuery = trpc.milestones.list.useQuery({ studentType: typeFilter });
  const createMilestone = trpc.milestones.create.useMutation({
    onSuccess: () => { milestonesQuery.refetch(); setShowForm(false); toast.success("Milestone added"); setForm({ cohortName: "", title: "", description: "", milestoneDate: "", type: "assignment", studentType: "physical" }); },
    onError: () => toast.error("Failed to add milestone"),
  });
  const celebrateMutation = trpc.milestones.celebrate.useMutation({
    onSuccess: () => { milestonesQuery.refetch(); toast.success("Milestone marked as celebrated 🎉"); },
  });

  const milestones = milestonesQuery.data ?? [];
  const milestoneTypeColors: Record<string, string> = {
    assignment: "#3B82F6", quiz: "#8B5CF6", presentation: "#F59E0B",
    celebration: "#EC4899", graduation: GOLD, event: "#10B981",
  };

  return (
    <div className="space-y-6">
      {/* Type tabs */}
      <div className="flex gap-2">
        {(["physical", "online", "nitda"] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === t ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            style={{ backgroundColor: typeFilter === t ? NAVY: undefined }}>
            {t === "nitda" ? "NITDA / HALs" : t.charAt(0).toUpperCase() + t.slice(1)} Students
          </button>
        ))}
      </div>

      {/* Add Milestone */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold" style={{ color: NAVY}}>{milestones.length} milestones</h3>
          <p className="text-xs text-gray-500">Quarterly celebrations · Training checkpoints · Graduation</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: NAVY, color: GOLD }}>
          <Plus size={13} className="mr-1" /> Add Milestone
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Cohort Name (optional)" value={form.cohortName} onChange={e => setForm(p => ({ ...p, cohortName: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" />
              <input placeholder="Milestone Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" />
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
                className="px-3 py-2 rounded-lg border text-[13px] bg-white outline-none">
                {["assignment", "quiz", "presentation", "celebration", "graduation", "event"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <select value={form.studentType} onChange={e => setForm(p => ({ ...p, studentType: e.target.value as any }))}
                className="px-3 py-2 rounded-lg border text-[13px] bg-white outline-none">
                <option value="physical">Physical</option>
                <option value="online">Online</option>
                <option value="nitda">NITDA / HALs</option>
              </select>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block">Milestone Date</label>
                <input type="date" value={form.milestoneDate} onChange={e => setForm(p => ({ ...p, milestoneDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none" />
              </div>
              <input placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="px-3 py-2 rounded-lg border text-[13px] outline-none" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" style={{ backgroundColor: NAVY, color: GOLD }} disabled={createMilestone.isPending}
                onClick={() => {
                  if (!form.title || !form.milestoneDate) { toast.error("Title and date required"); return; }
                  createMilestone.mutate({ cohortName: form.cohortName || undefined, title: form.title, description: form.description || undefined, milestoneDate: form.milestoneDate, type: form.type, studentType: form.studentType });
                }}>
                {createMilestone.isPending ? <Loader2 size={13} className="animate-spin mr-1" /> : null}Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestone list */}
      {milestonesQuery.isLoading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Trophy size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No milestones for {typeFilter} students yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m: any) => (
            <Card key={m.id} className={m.celebrated ? "opacity-60" : ""}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${milestoneTypeColors[m.type] || GOLD}20` }}>
                    <span className="text-[10px] font-bold" style={{ color: milestoneTypeColors[m.type] || GOLD }}>
                      {m.type?.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: NAVY}}>{m.title}</p>
                    {m.cohortName && <p className="text-xs text-gray-500">{m.cohortName}</p>}
                    {m.description && <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{m.milestoneDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.celebrated ? (
                    <span className="text-xs text-green-600 font-medium">🎉 Celebrated</span>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => celebrateMutation.mutate({ id: m.id })}>
                      🎉 Mark Celebrated
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
