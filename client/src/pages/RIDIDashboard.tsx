import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
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
const TEAL   = "#B48C4C";   // Alias — RIDI uses gold as primary
const MILK   = "#FFFAF6";

type Section = "overview" | "applications" | "funding" | "communities" | "cohort";

// ─── Mock Data ───────────────────────────────────────────────────────────────
type Applicant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  community: string;
  state: string;
  taskStatus: "Submitted" | "Pending" | "Approved" | "Rejected";
  score: number | null;
  taskResponse?: string;
};

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: "RD-001",
    name: "Aminat Suleiman",
    email: "aminat.suleiman@email.com",
    phone: "08032001001",
    community: "Wudil Community",
    state: "Kano",
    taskStatus: "Submitted",
    score: 8,
    taskResponse: "To source funding for this initiative, I would approach state government micro-enterprise grants and partner with local cooperatives to pool seed capital. I have identified three NGOs active in our LGA who have funded similar training programs. I will also leverage our community savings union (ajo) to raise matching funds from participants' families.",
  },
  {
    id: "RD-002",
    name: "Bello Ibrahim",
    email: "bello.ibrahim@email.com",
    phone: "08034002002",
    community: "Sokoto Central",
    state: "Sokoto",
    taskStatus: "Pending",
    score: null,
  },
  {
    id: "RD-003",
    name: "Chidinma Okafor",
    email: "chidinma.okafor@email.com",
    phone: "07056003003",
    community: "Awka Youth Hub",
    state: "Anambra",
    taskStatus: "Submitted",
    score: 6,
    taskResponse: "My strategy centres on a three-pronged approach: first, applying for the Anambra State Youth Development Fund which accepts training program co-funding applications quarterly. Second, partnering with two Awka-based credit unions who have previously sponsored skill acquisition events. Third, crowdfunding within the diaspora WhatsApp community for Awka indigenes — this channel has raised over ₦800,000 for similar initiatives in the past year.",
  },
  {
    id: "RD-004",
    name: "Fatima Abdullahi",
    email: "fatima.abdullahi@email.com",
    phone: "08023004004",
    community: "Katsina Rural Dev",
    state: "Katsina",
    taskStatus: "Approved",
    score: 9,
    taskResponse: "I have secured verbal commitment from two sponsors: the Katsina State Rural Enterprise Fund (KREF) and a private donor who runs a tech empowerment foundation. My plan includes: a formal proposal to KREF by end of next week, a corporate sponsorship pitch to two telecoms with active CSR programs in Katsina, and an online fundraising page targeting alumni of our community who are now working professionals. I have mapped out a 6-week fundraising timeline with weekly milestones.",
  },
  {
    id: "RD-005",
    name: "Grace Eze",
    email: "grace.eze@email.com",
    phone: "07038005005",
    community: "Port Harcourt Skills",
    state: "Rivers",
    taskStatus: "Submitted",
    score: 7,
    taskResponse: "Rivers State has a robust CSR environment given the oil sector. My approach is to contact three oil service companies' community relations offices with a joint funding proposal. I will also apply to the Rivers State Sustainable Development Fund and partner with the Youth Empowerment Initiative in Obio-Akpor LGA. Secondary source: the Port Harcourt Rotary Club has a youth skills grant cycle opening in April.",
  },
  {
    id: "RD-006",
    name: "Haruna Musa",
    email: "haruna.musa@email.com",
    phone: "08046006006",
    community: "Gombe Innovation",
    state: "Gombe",
    taskStatus: "Pending",
    score: null,
  },
  {
    id: "RD-007",
    name: "Idayat Lawal",
    email: "idayat.lawal@email.com",
    phone: "08057007007",
    community: "Sagamu Youth Centre",
    state: "Ogun",
    taskStatus: "Submitted",
    score: 8,
    taskResponse: "I have identified Ogun State's FADAMA III+ agricultural and community skills program as a co-funding pathway. Additionally, Dangote Foundation has an active grants program in Ogun which I intend to apply to within the week. I will also organise a community fundraising dinner — Sagamu has a strong returnee professional base who respond well to structured asks. My target is to raise 40% locally and cover the remainder through institutional grants.",
  },
  {
    id: "RD-008",
    name: "Jamilu Usman",
    email: "jamilu.usman@email.com",
    phone: "07069008008",
    community: "Kaduna Tech Hub",
    state: "Kaduna",
    taskStatus: "Approved",
    score: 10,
    taskResponse: "My funding strategy is fully mapped. Kaduna State Investment Promotion Agency (KADIPA) has a youth training co-funding window I have already begun an application for. I have also secured a letter of support from Arewa Development Foundation. Beyond grants, I have designed a community buy-in model: each scholar's family contributes ₦5,000 as a commitment deposit (refundable on completion) — this creates accountability and reduces dropout. With 20 scholars, that covers 25% of program costs. The remaining amount will come from a pitch to two Kaduna-based fintech companies whose founders are alumni of development programs.",
  },
];

const MOCK_COMMUNITIES = [
  { id: 1, name: "Wudil Community Centre",        state: "Kano",    coordinator: "Aminu Wudil",    members: 42, status: "Active" },
  { id: 2, name: "Sokoto Youth Skills Hub",        state: "Sokoto",  coordinator: "Binta Sokoto",   members: 28, status: "Active" },
  { id: 3, name: "Awka Innovation Space",          state: "Anambra", coordinator: "Chike Awka",     members: 35, status: "Active" },
  { id: 4, name: "Katsina Rural Dev Initiative",   state: "Katsina", coordinator: "Halima Katsina", members: 31, status: "Active" },
  { id: 5, name: "Port Harcourt Skills Centre",    state: "Rivers",  coordinator: "Grace Eze",      members: 50, status: "Active" },
  { id: 6, name: "Gombe Innovation Hub",           state: "Gombe",   coordinator: "Haruna Gombe",   members: 19, status: "Inactive" },
  { id: 7, name: "Sagamu Youth Centre",            state: "Ogun",    coordinator: "Idayat Lawal",   members: 38, status: "Active" },
  { id: 8, name: "Kaduna Tech Hub",                state: "Kaduna",  coordinator: "Jamilu Usman",   members: 55, status: "Active" },
  { id: 9, name: "Makurdi Skills Alliance",        state: "Benue",   coordinator: "Tersoo Makurdi", members: 22, status: "Active" },
  { id: 10, name: "Maiduguri Community Trainers",  state: "Borno",   coordinator: "Falmata Maiduguri", members: 17, status: "Inactive" },
  { id: 11, name: "Owerri Youth Dev Centre",       state: "Imo",     coordinator: "Chioma Owerri",  members: 41, status: "Active" },
  { id: 12, name: "Ibadan Innovation Collective",  state: "Oyo",     coordinator: "Adeyinka Ibadan",members: 47, status: "Active" },
  { id: 13, name: "Enugu Skills Initiative",       state: "Enugu",   coordinator: "Obinna Enugu",   members: 33, status: "Active" },
  { id: 14, name: "Ilorin Digital Hub",            state: "Kwara",   coordinator: "Maryam Ilorin",  members: 29, status: "Active" },
  { id: 15, name: "Calabar Community Impact",      state: "Cross River", coordinator: "Efiom Calabar", members: 24, status: "Inactive" },
];

const MOCK_COHORT_STUDENTS = [
  { id: "SKS-001", name: "Adaeze Nwosu",       program: "Business Essentials",   mergeRIDI: true },
  { id: "SKS-002", name: "Biodun Adesanya",     program: "Digital Marketing",     mergeRIDI: false },
  { id: "SKS-003", name: "Chiamaka Obi",        program: "Business Essentials",   mergeRIDI: true },
  { id: "SKS-004", name: "Damilola Fashola",    program: "Web Development",       mergeRIDI: false },
  { id: "SKS-005", name: "Emeka Okafor",        program: "Business Essentials",   mergeRIDI: true },
  { id: "SKS-006", name: "Femi Adeleke",        program: "Digital Marketing",     mergeRIDI: false },
  { id: "SKS-007", name: "Giwa Hassan",         program: "Web Development",       mergeRIDI: false },
  { id: "SKS-008", name: "Hauwa Abdulkadir",    program: "Business Essentials",   mergeRIDI: true },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function TaskBadge({ status }: { status: Applicant["taskStatus"] }) {
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RIDIDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: ORANGE }} />
      </div>
    );
  }
  if (!user) return null;

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
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────
function OverviewPanel() {
  const totalApplicants   = MOCK_APPLICANTS.length;
  const fundedQuarter     = MOCK_APPLICANTS.filter(a => a.taskStatus === "Approved").length;
  const activeCommunities = MOCK_COMMUNITIES.filter(c => c.status === "Active").length;
  const pendingReview     = MOCK_APPLICANTS.filter(a => a.taskStatus === "Submitted").length;

  const STAT_CARDS = [
    { label: "Total Applicants",          value: totalApplicants,   icon: Users,         color: ORANGE },
    { label: "Funded This Quarter",       value: fundedQuarter,     icon: CheckCircle2,  color: "#22C55E" },
    { label: "Active Communities",        value: activeCommunities, icon: Globe,         color: "#3B82F6" },
    { label: "Applications Pending Review", value: pendingReview,   icon: AlertTriangle, color: "#EAB308" },
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
          {(["Submitted", "Pending", "Approved", "Rejected"] as const).map(status => {
            const count = MOCK_APPLICANTS.filter(a => a.taskStatus === status).length;
            const pct   = Math.round((count / MOCK_APPLICANTS.length) * 100);
            const colorMap = { Submitted: "#3B82F6", Pending: "#EAB308", Approved: "#22C55E", Rejected: "#EF4444" };
            return (
              <div key={status} className="flex items-center gap-3">
                <p className="text-sm w-24 shrink-0 font-normal opacity-60" style={{ color: TEAL }}>{status}</p>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colorMap[status] }} />
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
          {MOCK_COMMUNITIES.filter(c => c.status === "Active").sort((a, b) => b.members - a.members).slice(0, 5).map(c => {
            const max = 60;
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
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Applicant["taskStatus"]>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_APPLICANTS.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.state.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || a.taskStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Applications</h2>
        <p className="text-xs opacity-30" style={{ color: TEAL }}>{MOCK_APPLICANTS.length} total applicants — Q1 2026</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: TEAL }} />
          <Input
            placeholder="Search name or state..."
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
          style={{ borderColor: `${TEAL}08`, color: TEAL, gridTemplateColumns: "1fr 1fr 1fr 1fr 80px 80px 100px" }}
        >
          <span>Name</span>
          <span>Email</span>
          <span>Community / State</span>
          <span>Phone</span>
          <span>Task</span>
          <span>Score</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm opacity-30" style={{ color: TEAL }}>No applicants match your filters</p>
          </div>
        ) : filtered.map(a => (
          <div key={a.id}>
            <div
              className="grid gap-4 px-5 py-4 border-b last:border-0 items-center"
              style={{ borderColor: `${TEAL}06`, gridTemplateColumns: "1fr 1fr 1fr 1fr 80px 80px 100px" }}
            >
              <div>
                <p className="text-sm font-normal" style={{ color: TEAL }}>{a.name}</p>
                <p className="text-[10px] font-mono opacity-30 mt-0.5" style={{ color: TEAL }}>{a.id}</p>
              </div>
              <p className="text-xs opacity-60 truncate" style={{ color: TEAL }}>{a.email}</p>
              <p className="text-xs opacity-70 truncate" style={{ color: TEAL }}>{a.community}, {a.state}</p>
              <p className="text-xs opacity-60" style={{ color: TEAL }}>{a.phone}</p>
              <TaskBadge status={a.taskStatus} />
              <p className="text-sm font-medium text-center" style={{ color: a.score !== null ? TEAL : "#9CA3AF" }}>
                {a.score !== null ? a.score + "/10" : "—"}
              </p>
              <div className="flex items-center gap-1.5 justify-end flex-wrap">
                {a.taskResponse && (
                  <button
                    onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                    className="text-[10px] px-2 py-1 rounded-lg border transition-all"
                    style={{ borderColor: `${TEAL}20`, color: TEAL }}
                  >
                    Task <ChevronDown size={9} className="inline ml-0.5" style={{ transform: expandedId === a.id ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                  </button>
                )}
                {a.taskStatus !== "Approved" && a.taskStatus !== "Rejected" && (
                  <button
                    onClick={() => toast.success(`${a.name} approved`)}
                    className="text-[10px] px-2 py-1 rounded-lg transition-all"
                    style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
                  >
                    Approve
                  </button>
                )}
                {a.taskStatus !== "Rejected" && a.taskStatus !== "Approved" && (
                  <button
                    onClick={() => toast.error(`${a.name} rejected`)}
                    className="text-[10px] px-2 py-1 rounded-lg transition-all"
                    style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
            {expandedId === a.id && a.taskResponse && (
              <div className="px-5 py-4 border-b" style={{ borderColor: `${TEAL}06`, backgroundColor: `${TEAL}03` }}>
                <p className="text-[10px] uppercase tracking-wider opacity-30 mb-2" style={{ color: TEAL }}>Funding Task Response</p>
                <p className="text-sm leading-relaxed opacity-70" style={{ color: TEAL }}>{a.taskResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Funding Tasks Panel ──────────────────────────────────────────────────────
function FundingTasksPanel() {
  const [scores, setScores] = useState<Record<string, string>>({});
  const submitted = MOCK_APPLICANTS.filter(a => a.taskResponse);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Funding Tasks</h2>
        <p className="text-xs opacity-30" style={{ color: TEAL }}>Review submitted "how to source funding" responses and assign scores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {submitted.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: `${TEAL}08` }}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium" style={{ color: TEAL }}>{a.name}</p>
                <p className="text-xs opacity-40 mt-0.5" style={{ color: TEAL }}>{a.community}, {a.state}</p>
              </div>
              <TaskBadge status={a.taskStatus} />
            </div>

            {/* Response text */}
            <div className="rounded-xl p-4" style={{ backgroundColor: `${TEAL}04` }}>
              <p className="text-xs leading-relaxed opacity-70 line-clamp-4" style={{ color: TEAL }}>
                {a.taskResponse}
              </p>
            </div>

            {/* Score + Notify */}
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={10}
                placeholder={a.score !== null ? String(a.score) : "Score 0–10"}
                value={scores[a.id] ?? (a.score !== null ? String(a.score) : "")}
                onChange={e => setScores(p => ({ ...p, [a.id]: e.target.value }))}
                className="border-gray-200 bg-gray-50 text-sm w-28"
              />
              <Button
                size="sm"
                className="flex-1 text-xs"
                style={{ backgroundColor: ORANGE, color: "white" }}
                onClick={() => {
                  const s = scores[a.id];
                  if (s) toast.success(`Score ${s}/10 saved. Notification sent to ${a.name}.`);
                  else toast(`Notification sent to ${a.name}`);
                }}
              >
                Notify Applicant
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Communities Panel ────────────────────────────────────────────────────────
function CommunitiesPanel() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_COMMUNITIES.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm uppercase tracking-wider mb-1 opacity-40 font-normal" style={{ color: TEAL }}>Communities</h2>
          <p className="text-xs opacity-30" style={{ color: TEAL }}>{MOCK_COMMUNITIES.length} registered communities across Nigeria</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: TEAL }} />
          <Input
            placeholder="Search name or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 border-gray-200 bg-white text-sm w-52"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: `${TEAL}08` }}>
        <div
          className="grid gap-4 px-5 py-3 border-b text-[10px] uppercase tracking-wider opacity-40 font-normal"
          style={{ borderColor: `${TEAL}08`, color: TEAL, gridTemplateColumns: "1fr 80px 1fr 80px 80px" }}
        >
          <span>Community Name</span>
          <span>State</span>
          <span>Coordinator</span>
          <span className="text-center">Members</span>
          <span className="text-center">Status</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm opacity-30" style={{ color: TEAL }}>No communities match your search</p>
          </div>
        ) : filtered.map((c, i) => (
          <div
            key={c.id}
            className="grid gap-4 px-5 py-4 border-b last:border-0 items-center"
            style={{ borderColor: `${TEAL}06`, gridTemplateColumns: "1fr 80px 1fr 80px 80px", backgroundColor: i % 2 === 0 ? "white" : `${TEAL}02` }}
          >
            <p className="text-sm font-normal" style={{ color: TEAL }}>{c.name}</p>
            <p className="text-xs opacity-60" style={{ color: TEAL }}>{c.state}</p>
            <p className="text-xs opacity-70" style={{ color: TEAL }}>{c.coordinator}</p>
            <p className="text-sm font-medium text-center" style={{ color: TEAL }}>{c.members}</p>
            <div className="flex justify-center">
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: c.status === "Active" ? "#DCFCE7" : "#F3F4F6",
                  color: c.status === "Active" ? "#166534" : "#6B7280",
                }}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs opacity-30 text-right" style={{ color: TEAL }}>
        Showing {filtered.length} of {MOCK_COMMUNITIES.length} communities
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
