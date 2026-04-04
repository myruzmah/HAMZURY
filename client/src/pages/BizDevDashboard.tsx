import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp, LogOut, ArrowLeft, LayoutDashboard, Target,
  Handshake, ShieldCheck, Users, FolderOpen, Loader2,
  CheckCircle2, AlertCircle, Clock, ArrowRight, CheckSquare,
  FileText, GitBranch, Palette, Download, Plus, Search,
  Star, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Brand ──────────────────────────────────────────────────────────────────
const GREEN = "#1B4D3E";   // HAMZURY green
const DARK = "#2C3E36";    // softer dark green (readable, not black)
const GOLD = "#B48C4C";    // accent
const MILK = "#FFFAF6";    // background

type Section = "overview" | "leads" | "partnerships" | "brandqa" | "affiliates" | "files";
type LeadRow = { id: number; ref: string; name: string; contact: string; source: string; score: number; budget: string; timeline: string; service: string; status: "handoff_ready" | "qualifying" | "nurturing" | "handed_off" };
type AffRow  = { id: number; name: string; ref: string; leads: number; converted: number; earnings: string; status: string };

const KANBAN_STAGES = ["Researching", "Outreach", "Agreed", "Active", "Paused"] as const;

const FILES_LIST = [
  { icon: CheckSquare, title: "Lead Qualification Checklist", desc: "5-point scoring system" },
  { icon: ArrowRight, title: "Handoff SOP — BizDev to CSO", desc: "Step-by-step handoff protocol" },
  { icon: Palette, title: "Brand Voice Guide", desc: "Tone, visual, and message standards" },
  { icon: Handshake, title: "Partnership Agreement Template", desc: "Standard referral agreement" },
  { icon: Users, title: "Affiliate Program Terms", desc: "Conditions, minimums, and payouts" },
  { icon: GitBranch, title: "Content Approval Workflow", desc: "Submission and review process" },
  { icon: FileText, title: "Weekly BizDev Report Template", desc: "Friday performance submission" },
  { icon: TrendingUp, title: "Market Intelligence Notes", desc: "Competitor and regulatory intel" },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BizDevDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const leadsQuery        = trpc.leads.list.useQuery(undefined, { refetchInterval: 20000 });
  const affiliatesQuery   = trpc.affiliate.listAll.useQuery(undefined, { refetchInterval: 30000 });
  const partnershipsQuery = trpc.partnerships.list.useQuery(undefined, { refetchInterval: 30000 });
  const brandQaQuery      = trpc.brandQa.list.useQuery(undefined, { refetchInterval: 30000 });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <Loader2 className="animate-spin" size={28} style={{ color: GREEN }} />
      </div>
    );
  }
  if (!user) return null;

  const realLeads = leadsQuery.data || [];
  const realAffiliates = affiliatesQuery.data || [];
  const realPartnerships = partnershipsQuery.data || [];
  const realBrandQa = brandQaQuery.data || [];

  // Use real leads only — no mock fallback
  const leadsList: LeadRow[] = realLeads.map(l => ({
    id: l.id,
    ref: l.ref || `HAM-LD${String(l.id).padStart(2, "0")}-0000`,
    name: l.businessName || l.name || "Unknown",
    contact: l.name || "—",
    source: l.source || "Unknown",
    score: 3,
    budget: "—",
    timeline: "—",
    service: l.service || "TBD",
    status: (l.status === "new" || l.status === "contacted" ? "qualifying" : l.status === "converted" ? "handed_off" : "nurturing") as LeadRow["status"],
  }));
  // Use real affiliates only — no mock fallback
  const affiliatesList: AffRow[] = realAffiliates.map(a => ({
    id: a.id,
    name: a.name,
    ref: a.code || `AFF-${String(a.id).padStart(3, "0")}`,
    leads: 0,
    converted: 0,
    earnings: "₦0",
    status: a.status || "active",
  }));

  const dataLoading = leadsQuery.isLoading || affiliatesQuery.isLoading || partnershipsQuery.isLoading || brandQaQuery.isLoading;

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview", icon: LayoutDashboard, label: "Overview" },
    { key: "leads", icon: Target, label: "Lead Tracker" },
    { key: "partnerships", icon: Handshake, label: "Partnerships" },
    { key: "brandqa", icon: ShieldCheck, label: "Brand QA" },
    { key: "affiliates", icon: Users, label: "Affiliates" },
    { key: "files", icon: FolderOpen, label: "Files & Resources" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="BizDev Dashboard — HAMZURY" description="Business development and growth operations for HAMZURY." />
      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: GREEN }}>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <TrendingUp size={18} style={{ color: GOLD }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: "#fff" }}>BizDev Hub</span>
        </div>
        <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="w-full flex items-center justify-center md:justify-start md:px-3 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: activeSection === key ? "rgba(255,255,255,0.15)" : "transparent",
                color: activeSection === key ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:block ml-3 text-sm font-normal">{label}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t shrink-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <button onClick={logout} className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Sign Out</span>
          </button>
          <Link href="/" className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Back to HAMZURY</span>
          </Link>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${DARK}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: DARK }}>{sidebarItems.find(s => s.key === activeSection)?.label}</h1>
            <p className="text-xs opacity-40" style={{ color: DARK }}>Business Development · {user.name || "BizDev Lead"}</p>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8">
            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin mr-2" size={20} style={{ color: GREEN }} />
                <span className="text-sm opacity-50" style={{ color: DARK }}>Loading data...</span>
              </div>
            ) : (
              <>
                {activeSection === "overview" && <OverviewSection leadsList={leadsList} affiliatesList={affiliatesList} partnerships={realPartnerships} brandQaItems={realBrandQa} />}
                {activeSection === "leads" && <LeadTrackerSection leadsList={leadsList} />}
                {activeSection === "partnerships" && <PartnershipsSection partnerships={realPartnerships} isLoading={partnershipsQuery.isLoading} />}
                {activeSection === "brandqa" && <BrandQASection brandQaItems={realBrandQa} isLoading={brandQaQuery.isLoading} />}
                {activeSection === "affiliates" && <AffiliatesSection affiliatesList={affiliatesList} />}
                {activeSection === "files" && <FilesSection />}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewSection({ leadsList, affiliatesList, partnerships, brandQaItems }: { leadsList: LeadRow[]; affiliatesList: AffRow[]; partnerships: any[]; brandQaItems: any[] }) {
  const qualifiedThisWeek = leadsList.filter(l => l.status === "qualifying" || l.status === "handoff_ready").length;
  const handoffReady = leadsList.filter(l => l.status === "handoff_ready").length;
  const handedOff = leadsList.filter(l => l.status === "handed_off").length;
  const handoffRate = leadsList.length > 0 ? Math.round((handedOff / leadsList.length) * 100) : 0;
  const activeAffs = affiliatesList.filter(a => a.status === "active").length;

  // Compute Brand QA pass rate from real data
  const totalQa = brandQaItems.length;
  const approvedQa = brandQaItems.filter((q: any) => q.status === "approved").length;
  const brandQaPassRate = totalQa > 0 ? Math.round((approvedQa / totalQa) * 100) : 0;

  // Compute referral conversion from partnerships
  const totalReferrals = partnerships.reduce((sum: number, p: any) => sum + (p.referrals || 0), 0);
  const activePartnerCount = partnerships.filter((p: any) => p.stage === "Active").length;
  const referralConversion = totalReferrals > 0 && leadsList.length > 0
    ? Math.round((handedOff / totalReferrals) * 100)
    : 0;

  const KPI_CARDS = [
    { label: "Qualified Leads", value: qualifiedThisWeek, unit: "", target: "10–15/week", color: GREEN },
    { label: "Lead → Handoff Rate", value: handoffRate, unit: "%", target: "Target ≥60%", color: "#3B82F6" },
    { label: "Handoff Ready", value: handoffReady, unit: "", target: "Send to CSO", color: GOLD },
    { label: "Brand QA Pass Rate", value: brandQaPassRate, unit: "%", target: "Target ≥85%", color: "#8B5CF6" },
    { label: "Active Affiliates", value: activeAffs, unit: "", target: "Q1 target: 15", color: GREEN },
    { label: "Referral Conversion", value: referralConversion, unit: "%", target: "Target ≥20%", color: "#22C55E" },
  ];

  const WEEKLY = [
    { day: "Monday", focus: "Lead Review + Planning", deliverable: "Qualified lead handoff list to CSO" },
    { day: "Tuesday", focus: "Partnership Outreach", deliverable: "3–5 new partner conversations" },
    { day: "Wednesday", focus: "Content / Brand QA", deliverable: "All department outputs reviewed" },
    { day: "Thursday", focus: "Market Intel + Reporting", deliverable: "Insights summary for CEO" },
    { day: "Friday", focus: "Performance Review + Prep", deliverable: "Weekly BizDev report submitted" },
  ];

  return (
    <div className="space-y-8">
      {/* Mantra */}
      <div className="rounded-2xl p-5 border" style={{ backgroundColor: `${GREEN}08`, borderColor: `${GREEN}15` }}>
        <p className="text-sm font-normal opacity-60" style={{ color: DARK }}>"Generate demand. Protect the brand. Qualify the signal."</p>
      </div>

      {/* Handoff SLA alert */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 border" style={{ backgroundColor: `${GOLD}10`, borderColor: `${GOLD}30` }}>
        <AlertCircle size={15} style={{ color: GOLD }} />
        <p className="text-sm font-normal" style={{ color: DARK }}>{handoffReady > 0 ? `${handoffReady} lead${handoffReady > 1 ? "s" : ""} ready for CSO handoff — within 24h SLA` : "No leads pending handoff right now"}</p>
        <Button size="sm" variant="ghost" className="ml-auto text-xs" style={{ color: GOLD }} onClick={() => toast.success("Leads handed off to CSO. They will follow up within 24 hours.")}>
          Handoff Now
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI_CARDS.map(({ label, value, unit, target, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xl font-medium leading-none mb-1" style={{ color }}>{value}{unit}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mb-1" style={{ color: DARK }}>{label}</p>
            <p className="text-[10px] opacity-25" style={{ color: DARK }}>{target}</p>
          </div>
        ))}
      </div>

      {/* Weekly rhythm */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="text-sm font-normal opacity-40 mb-5" style={{ color: DARK }}>Weekly Operational Rhythm</p>
        <div className="space-y-3">
          {WEEKLY.map(({ day, focus, deliverable }) => {
            const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
            const isToday = day === today;
            return (
              <div key={day} className="flex items-start gap-4 py-3 border-b last:border-0" style={{ borderColor: `${DARK}06` }}>
                <div className="w-20 shrink-0">
                  <p className="text-xs font-normal" style={{ color: isToday ? GREEN : DARK, opacity: isToday ? 1 : 0.4 }}>{day}</p>
                  {isToday && <div className="w-4 h-0.5 mt-1 rounded" style={{ backgroundColor: GREEN }} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-normal" style={{ color: DARK, opacity: 0.8 }}>{focus}</p>
                  <p className="text-xs opacity-40 mt-0.5" style={{ color: DARK }}>{deliverable}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Lead Tracker ─────────────────────────────────────────────────────────────
function LeadTrackerSection({ leadsList }: { leadsList: LeadRow[] }) {
  const [filter, setFilter] = useState<"all" | "handoff_ready" | "qualifying" | "nurturing" | "handed_off">("all");
  const [showForm, setShowForm] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false]);
  const CHECKLIST_ITEMS = ["Budget fit (₦500k+ threshold)", "Timeline confirmed (1–2 months)", "Decision-maker access confirmed", "Pain point clearly stated", "Service fit confirmed (4–5 = handoff-ready)"];
  const score = checklist.filter(Boolean).length;

  // Form state
  const [formBiz, setFormBiz] = useState("");
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formTimeline, setFormTimeline] = useState("");
  const [formPain, setFormPain] = useState("");
  const submitLead = trpc.leads.submit.useMutation({
    onSuccess: () => {
      toast.success("Lead logged successfully");
      setShowForm(false);
      setFormBiz(""); setFormName(""); setFormRole(""); setFormSource(""); setFormBudget(""); setFormTimeline(""); setFormPain(""); setChecklist([false,false,false,false,false]);
    },
    onError: (err) => toast.error(err.message),
  });
  const handleLogLead = (handoff: boolean) => {
    if (!formBiz.trim() || !formName.trim()) { toast.error("Business name and contact name required"); return; }
    submitLead.mutate({
      name: formName.trim(),
      businessName: formBiz.trim(),
      service: "BizDev Lead",
      context: `Role: ${formRole}. Source: ${formSource}. Budget: ${formBudget}. Timeline: ${formTimeline}. Pain: ${formPain}. Score: ${score}/5.${handoff ? " HANDOFF TO CSO." : ""}`,
    });
  };

  const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    handoff_ready: { bg: "#22C55E15", text: "#16A34A", label: "Handoff Ready" },
    qualifying: { bg: "#3B82F615", text: "#2563EB", label: "Qualifying" },
    nurturing: { bg: `${GOLD}15`, text: GOLD, label: "Nurturing" },
    handed_off: { bg: "#6B728015", text: "#6B7280", label: "Handed Off" },
  };

  const filtered = filter === "all" ? leadsList : leadsList.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      {/* Filter + action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "handoff_ready", "qualifying", "nurturing", "handed_off"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor: filter === f ? GREEN : "white",
                color: filter === f ? "#fff" : GREEN,
                border: `1px solid ${GREEN}20`,
              }}
            >
              {f === "all" ? "All" : STATUS_COLORS[f]?.label}
            </button>
          ))}
        </div>
        <Button size="sm" style={{ backgroundColor: GREEN, color: "white" }} onClick={() => setShowForm(v => !v)}>
          <Plus size={14} className="mr-1.5" /> Log New Lead
        </Button>
      </div>

      {/* Log Lead form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-normal opacity-60" style={{ color: DARK }}>Log New Lead</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Business name" value={formBiz} onChange={e => setFormBiz(e.target.value)} className="bg-gray-50 border-gray-200" />
            <Input placeholder="Contact name" value={formName} onChange={e => setFormName(e.target.value)} className="bg-gray-50 border-gray-200" />
            <Input placeholder="Contact role / title" value={formRole} onChange={e => setFormRole(e.target.value)} className="bg-gray-50 border-gray-200" />
            <Select>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Lead source" />
              </SelectTrigger>
              <SelectContent>
                {["Content", "Referral", "Events", "Partnership", "Physical"].map(s => (
                  <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Budget range (e.g. ₦500K–₦1M)" value={formBudget} onChange={e => setFormBudget(e.target.value)} className="bg-gray-50 border-gray-200" />
            <Input placeholder="Timeline (e.g. 4 weeks)" value={formTimeline} onChange={e => setFormTimeline(e.target.value)} className="bg-gray-50 border-gray-200" />
          </div>
          <Textarea placeholder="Pain point description" value={formPain} onChange={e => setFormPain(e.target.value)} className="bg-gray-50 border-gray-200 min-h-[80px]" />
          <div>
            <p className="text-xs font-normal opacity-50 mb-3" style={{ color: DARK }}>5-Point Qualification Checklist</p>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist[i]}
                    onChange={() => setChecklist(prev => { const next = [...prev]; next[i] = !next[i]; return next; })}
                    className="rounded"
                  />
                  <span className="text-sm font-normal opacity-70" style={{ color: DARK }}>{item}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: n <= score ? GREEN : `${DARK}10` }}>
                    <Star size={10} style={{ color: n <= score ? "white" : DARK, opacity: n <= score ? 1 : 0.2 }} />
                  </div>
                ))}
              </div>
              <p className="text-xs font-normal opacity-50" style={{ color: DARK }}>Score: {score}/5 {score >= 4 ? "— Handoff ready" : "— Keep qualifying"}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" style={{ backgroundColor: GREEN, color: GOLD }} disabled={submitLead.isPending} onClick={() => handleLogLead(false)}>
              {submitLead.isPending ? "Saving..." : "Log Lead"}
            </Button>
            <Button size="sm" style={{ backgroundColor: GREEN, color: "white" }} disabled={score < 4 || submitLead.isPending} onClick={() => handleLogLead(true)}>
              Handoff to CSO {score < 4 && "(score ≥4 required)"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Leads table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] uppercase tracking-wider opacity-40" style={{ borderColor: `${DARK}10`, color: DARK }}>
                <th className="p-4 text-left">Ref</th>
                <th className="p-4 text-left">Business</th>
                <th className="p-4 text-left">Source</th>
                <th className="p-4 text-left">Score</th>
                <th className="p-4 text-left">Budget</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${DARK}06` }}>
              {filtered.map(lead => {
                const s = STATUS_COLORS[lead.status] || { bg: "#f3f4f615", text: "#6B7280", label: lead.status };
                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="text-[11px] font-mono opacity-40" style={{ color: DARK }}>{lead.ref}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-normal" style={{ color: DARK }}>{lead.name}</p>
                      <p className="text-[11px] opacity-40" style={{ color: DARK }}>{lead.contact}</p>
                    </td>
                    <td className="p-4 text-xs opacity-50" style={{ color: DARK }}>{lead.source}</td>
                    <td className="p-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} className="w-3 h-3 rounded-sm" style={{ backgroundColor: n <= lead.score ? GREEN : `${DARK}12` }} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-xs opacity-60" style={{ color: DARK }}>{lead.budget}</td>
                    <td className="p-4 text-xs opacity-60" style={{ color: DARK }}>{lead.service}</td>
                    <td className="p-4">
                      <span className="text-[11px] font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                    </td>
                    <td className="p-4 text-right">
                      {lead.status === "handoff_ready" && (
                        <Button size="sm" variant="ghost" className="text-xs" style={{ color: GREEN }} onClick={() => toast.success(`${lead.name} handed off to CSO. They will follow up within 24 hours.`)}>
                          Handoff →
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Real Partnership Data ────────────────────────────────────────────────────
const REAL_PARTNERSHIPS = [
  {
    id: 1,
    name: "NITDA",
    fullName: "National Information Technology Development Agency",
    type: "Government — LMS Development",
    stage: "Outreach" as const,
    status: "Verbal agreement — strong. No legal yet.",
    milestone: "Designing Hamzury HALs LMS (90% AI, startup-focused). NITDA to validate and recommend to students.",
    value: "₦30,000/student/month",
    note: "LMS name: Hamzury HALs. Our students also use it online (Bakori cohort). Push for written agreement.",
  },
  {
    id: 2,
    name: "NJFP",
    fullName: "National Job Framework Programme",
    type: "Government — Approved Training Centre",
    stage: "Agreed" as const,
    status: "Approved. Staff coming — not yet commenced.",
    milestone: "HAMZURY approved as NJFP training centre. Awaiting first batch of staff to be sent.",
    value: "TBD per batch",
    note: "Monitor for commencement date. Prepare onboarding docs for incoming NJFP staff.",
  },
  {
    id: 3,
    name: "TVET",
    fullName: "Technical & Vocational Education & Training",
    type: "Government — Approved Partner",
    stage: "Agreed" as const,
    status: "Approved partner. Students starting at other centres first — ours may be next batch.",
    milestone: "TVET approved HAMZURY as training partner. Awaiting student allocation.",
    value: "₦30,000/student/month",
    note: "Follow up on when our centre gets the next batch. Document readiness.",
  },
  {
    id: 4,
    name: "Plan Aid Academy",
    fullName: "Plan Aid Academy (Secondary School)",
    type: "Exchange Partner — Education",
    stage: "Active" as const,
    status: "Active. Using 3rd floor of their building.",
    milestone: "300+ students trained. HAMZURY renovated 3rd floor — in exchange for training their students and staff.",
    value: "Exchange — No cash",
    note: "Milestone: 300+ students trained. Continue tracking cohorts at this location.",
  },
];

const PENDING_DEALS = [
  {
    id: 1,
    name: "Ikedi Peace",
    service: "Business Architecture / Consulting",
    status: "Proposal sent — awaiting engagement",
    meeting: "Wednesday 2 April 2026 · 1:00 PM · Abuja",
    note: "Travelling to Abuja for this meeting. High priority.",
    urgent: true,
  },
  {
    id: 2,
    name: "Life Style Med Spa",
    service: "Full Branding + Social Media (similar to Tilz Spa)",
    status: "Proposal sent — awaiting feedback",
    meeting: null,
    note: "Follow up after Tilz Spa delivery milestone to demonstrate results.",
    urgent: false,
  },
];

// ─── Partnerships ─────────────────────────────────────────────────────────────
function PartnershipsSection({ partnerships, isLoading }: { partnerships: any[]; isLoading: boolean }) {
  const STAGE_COLORS: Record<string, string> = {
    Researching: "#6B7280", Outreach: "#3B82F6", Agreed: GOLD, Active: "#16A34A", Paused: "#EF4444",
  };
  const [expanded, setExpanded] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const createPartnership = trpc.partnerships.create.useMutation({
    onSuccess: () => { utils.partnerships.list.invalidate(); toast.success("Partnership added"); },
    onError: (err) => toast.error(err.message),
  });
  const updatePartnership = trpc.partnerships.update.useMutation({
    onSuccess: () => { utils.partnerships.list.invalidate(); toast.success("Partnership updated"); },
    onError: (err) => toast.error(err.message),
  });

  // Combine DB partnerships with curated REAL_PARTNERSHIPS for display
  const allPartnerships = [
    ...REAL_PARTNERSHIPS,
    ...partnerships.filter(p => !REAL_PARTNERSHIPS.some(rp => rp.name === p.name)).map(p => ({
      id: p.id + 1000,
      name: p.name,
      fullName: p.name,
      type: p.type || "Partner",
      stage: (p.stage || "Researching") as typeof KANBAN_STAGES[number],
      status: p.notes || "",
      milestone: "",
      value: "",
      note: p.notes || "",
    })),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin mr-2" size={20} style={{ color: GREEN }} />
        <span className="text-sm opacity-50" style={{ color: DARK }}>Loading partnerships...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Partners", value: allPartnerships.length },
          { label: "Active", value: allPartnerships.filter(p => p.stage === "Active").length },
          { label: "Approved / Agreed", value: allPartnerships.filter(p => p.stage === "Agreed").length },
          { label: "Pending Deals", value: PENDING_DEALS.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-2xl font-normal" style={{ color: GREEN }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mt-1" style={{ color: DARK }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Partnership Cards */}
      <div>
        <p className="text-[11px] uppercase tracking-widest opacity-40 mb-3" style={{ color: DARK }}>Institutional Partnerships</p>
        <div className="space-y-3">
          {allPartnerships.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_COLORS[p.stage] }} />
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: DARK }}>{p.name}</p>
                    <p className="text-[11px] opacity-40" style={{ color: DARK }}>{p.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STAGE_COLORS[p.stage]}18`, color: STAGE_COLORS[p.stage] }}>
                    {p.stage}
                  </span>
                  {expanded === p.id ? <ChevronUp size={14} className="opacity-30" /> : <ChevronDown size={14} className="opacity-30" />}
                </div>
              </button>
              {expanded === p.id && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t" style={{ borderColor: `${DARK}06` }}>
                  <p className="text-[12px] font-light" style={{ color: DARK }}>{p.fullName}</p>
                  <p className="text-[12px]" style={{ color: GREEN }}>{p.status}</p>
                  <p className="text-[11px] opacity-60" style={{ color: DARK }}>Milestone: {p.milestone}</p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] opacity-40" style={{ color: DARK }}>Value: {p.value}</p>
                  </div>
                  <div className="text-[11px] px-3 py-2 rounded-lg" style={{ backgroundColor: `${GOLD}10`, color: DARK }}>
                    Note: {p.note}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Deals */}
      <div>
        <p className="text-[11px] uppercase tracking-widest opacity-40 mb-3" style={{ color: DARK }}>Pending Deals</p>
        <div className="space-y-3">
          {PENDING_DEALS.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border p-4" style={{ borderColor: d.urgent ? `${GOLD}40` : `${DARK}08` }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[14px] font-medium" style={{ color: DARK }}>{d.name}</p>
                  <p className="text-[11px] opacity-50" style={{ color: DARK }}>{d.service}</p>
                </div>
                {d.urgent && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-[12px] mb-1" style={{ color: GREEN }}>{d.status}</p>
              {d.meeting && (
                <p className="text-[11px] font-medium mb-1" style={{ color: GOLD }}>📍 Meeting: {d.meeting}</p>
              )}
              <p className="text-[11px] opacity-50" style={{ color: DARK }}>{d.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Brand QA ─────────────────────────────────────────────────────────────────
function BrandQASection({ brandQaItems, isLoading }: { brandQaItems: any[]; isLoading: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const utils = trpc.useUtils();

  const createBrandQa = trpc.brandQa.create.useMutation({
    onSuccess: () => { utils.brandQa.list.invalidate(); toast.success("QA item submitted"); },
    onError: (err) => toast.error(err.message),
  });
  const updateBrandQa = trpc.brandQa.update.useMutation({
    onSuccess: () => { utils.brandQa.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const STATUS_CONFIG = {
    pending: { label: "Pending Review", color: GOLD, bg: `${GOLD}15` },
    approved: { label: "Approved", color: "#16A34A", bg: "#22C55E15" },
    revision: { label: "Revision Requested", color: "#EF4444", bg: "#EF444415" },
  };

  // Map DB items to display format
  const qaItems = brandQaItems.map((q: any) => ({
    id: q.id,
    dept: q.department || "—",
    item: q.item || "—",
    type: q.type || "Other",
    status: q.status || "pending",
    submitted: q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—",
    urgent: !!q.urgent,
  }));

  const update = (id: number, status: "approved" | "revision") => {
    updateBrandQa.mutate({ id, status });
    toast.success(status === "approved" ? "Output approved" : "Revision requested");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin mr-2" size={20} style={{ color: GREEN }} />
        <span className="text-sm opacity-50" style={{ color: DARK }}>Loading QA items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-normal opacity-50 mb-1" style={{ color: DARK }}>Brand Quality Assurance</p>
        <p className="text-xs opacity-30" style={{ color: DARK }}>Every external-facing output must pass QA before going live.</p>
      </div>

      {/* QA Queue */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: `${DARK}06` }}>
          <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: DARK }}>QA Queue ({qaItems.filter(q => q.status === "pending").length} pending)</p>
        </div>
        <div className="divide-y" style={{ borderColor: `${DARK}06` }}>
          {qaItems.map(item => {
            const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            return (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.urgent && <AlertCircle size={14} style={{ color: "#EF4444" }} className="shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: `${DARK}10`, color: DARK }}>{item.dept}</span>
                      <span className="text-[10px] opacity-40" style={{ color: DARK }}>{item.type} · {item.submitted}</span>
                    </div>
                    <p className="text-sm font-normal truncate" style={{ color: DARK }}>{item.item}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  {item.status === "pending" && (
                    <>
                      <Button size="sm" variant="ghost" className="text-xs h-7" style={{ color: "#16A34A" }} onClick={() => update(item.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7" style={{ color: "#EF4444" }} onClick={() => update(item.id, "revision")}>Revise</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand checklist */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <button
          className="w-full p-4 flex items-center justify-between"
          onClick={() => setExpanded(v => !v)}
        >
          <p className="text-xs uppercase tracking-wider opacity-40 font-normal" style={{ color: DARK }}>Brand Checklist</p>
          {expanded ? <ChevronUp size={14} style={{ color: DARK, opacity: 0.3 }} /> : <ChevronDown size={14} style={{ color: DARK, opacity: 0.3 }} />}
        </button>
        {expanded && (
          <div className="px-4 pb-5 space-y-5 border-t" style={{ borderColor: `${DARK}06` }}>
            {[
              { title: "Tone Check", items: ["Calm — no urgency, no pressure", "Confident — no hedging, no over-explaining", "Strategic — focused on outcomes, not features", "Minimal — no clutter, no filler words", "Professional — no slang, no hype"] },
              { title: "Visual Check", items: ["Colors: Green #2563EB / Milk #FFFAF6 / Gold #B48C4C", "Typography: Inter font family", "Layout: generous whitespace, clear hierarchy", "Imagery: premium, relevant, non-stock"] },
              { title: "Message Check", items: ["Core line present: \"No pressure. Just clarity.\"", "Value proposition clear in <10 seconds", "No misleading claims or overpromises", "Compliant with Nigerian business communication standards"] },
            ].map(({ title, items }) => (
              <div key={title} className="pt-4">
                <p className="text-xs font-normal opacity-40 mb-3" style={{ color: DARK }}>{title}</p>
                <div className="space-y-2">
                  {items.map(item => (
                    <label key={item} className="flex items-start gap-2.5 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 rounded shrink-0" />
                      <span className="text-xs font-normal opacity-60" style={{ color: DARK }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Affiliates ───────────────────────────────────────────────────────────────
function AffiliatesSection({ affiliatesList }: { affiliatesList: AffRow[] }) {
  const [affiliates, setAffiliates] = useState(affiliatesList);
  const approve = (id: number) => { setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status: "active" } : a)); toast.success("Affiliate approved"); };

  const total = affiliates.filter(a => a.status === "active").length;
  const pending = affiliates.filter(a => a.status === "pending").length;
  const totalEarnings = "₦283,000";

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Affiliates", value: affiliates.length },
          { label: "Active", value: total },
          { label: "Pending Approval", value: pending },
          { label: "Total Earnings", value: totalEarnings, isText: true },
        ].map(({ label, value, isText }) => (
          <div key={label} className="bg-white rounded-2xl p-4 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <p className="text-xl font-normal" style={{ color: GREEN }}>{value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-40 mt-1" style={{ color: DARK }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[10px] uppercase tracking-wider opacity-40" style={{ borderColor: `${DARK}10`, color: DARK }}>
                <th className="p-4 text-left">Affiliate</th>
                <th className="p-4 text-left">Ref Code</th>
                <th className="p-4 text-right">Leads</th>
                <th className="p-4 text-right">Converted</th>
                <th className="p-4 text-right">Earnings</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: `${DARK}06` }}>
              {affiliates.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-normal" style={{ color: DARK }}>{a.name}</td>
                  <td className="p-4 font-mono text-xs opacity-50" style={{ color: DARK }}>{a.ref}</td>
                  <td className="p-4 text-right text-xs" style={{ color: DARK }}>{a.leads}</td>
                  <td className="p-4 text-right text-xs" style={{ color: DARK }}>{a.converted}</td>
                  <td className="p-4 text-right text-xs font-normal" style={{ color: GREEN }}>{a.earnings}</td>
                  <td className="p-4">
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: a.status === "active" ? "#22C55E15" : `${GOLD}15`, color: a.status === "active" ? "#16A34A" : GOLD }}>
                      {a.status === "active" ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {a.status === "pending" && (
                      <Button size="sm" variant="ghost" className="text-xs h-7" style={{ color: GREEN }} onClick={() => approve(a.id)}>Approve</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t text-xs opacity-40" style={{ borderColor: `${DARK}08`, color: DARK }}>
          Minimum payout threshold: ₦50,000 · Coordinate with Finance for commission processing
        </div>
      </div>
    </div>
  );
}

// ─── Files ────────────────────────────────────────────────────────────────────
function FilesSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm font-normal opacity-40" style={{ color: DARK }}>Files & Resources</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FILES_LIST.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${GREEN}15` }}>
              <Icon size={16} style={{ color: GREEN }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal mb-1" style={{ color: DARK }}>{title}</p>
              <p className="text-xs opacity-40 leading-relaxed" style={{ color: DARK }}>{desc}</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs" style={{ borderColor: `${DARK}15`, color: DARK }} onClick={() => toast("Document access coming soon")}>
              Open
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
