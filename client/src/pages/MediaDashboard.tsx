import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Home, LogOut, LayoutDashboard, Calendar, Video, Mic,
  Image, Bot, Upload, CheckCircle2, Clock, Edit3,
  TrendingUp, Play, Film, Folder, Plus, Trash2,
  Eye, Share2, Star, Target, Users, Zap, BookOpen,
  ArrowRight, ChevronDown, ChevronUp, Download,
  Briefcase, Send, AlertTriangle, ChevronRight, Loader2,
  ChevronLeft, X, Sparkles,
} from "lucide-react";

// ─── Colors (Media = general → Apple grey) ───────────────────────────────────
const TEAL  = "#86868B";   // Apple grey — general departments
const GOLD  = "#C9A97E";
const MILK  = "#FAFAF8";
const WHITE = "#FFFFFF";
const DARK  = "#1D1D1F";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "clients" | "inbox" | "overview" | "calendar" | "aitwin" | "podcast" | "vault" | "social";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "clients",   label: "Social Clients",  icon: <Users size={16} /> },
  { id: "inbox",     label: "Client Work",     icon: <Briefcase size={16} /> },
  { id: "overview",  label: "Overview",        icon: <LayoutDashboard size={16} /> },
  { id: "calendar",  label: "Content Calendar", icon: <Calendar size={16} /> },
  { id: "aitwin",    label: "AI Twin",          icon: <Bot size={16} /> },
  { id: "podcast",   label: "Podcast",          icon: <Mic size={16} /> },
  { id: "vault",     label: "Asset Vault",      icon: <Folder size={16} /> },
  { id: "social",    label: "Social Reports",   icon: <TrendingUp size={16} /> },
];

const TASK_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Not Started":       { bg: "#6B728014", text: "#6B7280" },
  "In Progress":       { bg: "#3B82F614", text: "#3B82F6" },
  "Waiting on Client": { bg: "#EAB30814", text: "#B45309" },
  "Submitted":         { bg: "#8B5CF614", text: "#7C3AED" },
  "Completed":         { bg: "#22C55E14", text: "#16A34A" },
};

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_CONTENT: {
  id: number; title: string; platform: string; type: string;
  status: string; date: string; assignee: string; views?: number;
}[] = [
  { id: 1,  title: "5 CAC Mistakes Nigerian Businesses Make", platform: "YouTube",   type: "Video",   status: "Published",    date: "Mar 18", assignee: "Salis",    views: 3240 },
  { id: 2,  title: "How to Register Your Business (Step-by-Step)", platform: "TikTok", type: "Short",  status: "Published",    date: "Mar 19", assignee: "Hikma",    views: 12800 },
  { id: 3,  title: "The Faceless Content Formula",             platform: "LinkedIn",  type: "Article", status: "Draft",        date: "Mar 22", assignee: "Khadija" },
  { id: 4,  title: "HAMZURY Skills Cohort Highlight Reel",     platform: "YouTube",   type: "Video",   status: "Editing",      date: "Mar 24", assignee: "Salis" },
  { id: 5,  title: "What Is a Business Permit? Quick Answer",  platform: "TikTok",   type: "Short",   status: "Scripting",    date: "Mar 25", assignee: "Maryam" },
  { id: 6,  title: "Ep.14 — Building Systems While Broke",     platform: "Podcast",  type: "Episode", status: "Recording",    date: "Mar 26", assignee: "Faree" },
  { id: 7,  title: "AI Tools Every Nigerian Entrepreneur Needs", platform: "Instagram", type: "Reel",  status: "Scheduled",    date: "Mar 27", assignee: "Lalo" },
  { id: 8,  title: "Foreign Business Registration in Nigeria",  platform: "LinkedIn",  type: "Article", status: "Pending Approval", date: "Mar 28", assignee: "Abdullahi" },
  { id: 9,  title: "RIDI Programme 2026 — Application Open",   platform: "All",      type: "Campaign", status: "Planning",    date: "Apr 1",  assignee: "Khadija" },
  { id: 10, title: "Client Success Story — Tilz Spar",         platform: "YouTube",   type: "Video",   status: "Draft",        date: "Apr 3",  assignee: "Salis" },
];

const PODCAST_EPISODES: {
  ep: number; title: string; guest?: string; date: string;
  duration?: string; status: string; plays?: number;
}[] = [
  { ep: 14, title: "Building Systems While Broke",         guest: "Idris Ibrahim (CEO)", date: "Mar 26", duration: "42 min", status: "Recording" },
  { ep: 13, title: "The RIDI Model — Rural Talent Goes Global", guest: "Abdulmalik",    date: "Mar 12", duration: "38 min", status: "Published", plays: 1240 },
  { ep: 12, title: "Why Every Nigerian Business Needs a Trademark", date: "Feb 27",     duration: "31 min", status: "Published", plays: 890 },
  { ep: 11, title: "From Freelancer to Registered Brand",   guest: "Tabitha",          date: "Feb 13", duration: "45 min", status: "Published", plays: 2100 },
  { ep: 10, title: "AI Content Creation for African Brands", guest: "Khadija",         date: "Jan 30", duration: "36 min", status: "Published", plays: 3400 },
];

const AI_TWIN_TASKS: {
  id: number; title: string; platform: string; topic: string;
  status: string; output?: string; createdAt: string;
}[] = [
  { id: 1, title: "Daily LinkedIn tip — Tax compliance", platform: "LinkedIn", topic: "Compliance", status: "Generated", createdAt: "Today 8:00 AM",
    output: "Did you know? Nigerian businesses with annual turnover above ₦25M must file VAT returns monthly. Missing even one filing triggers a ₦10,000 penalty plus 10% of tax due. Stay compliant — let your books run your business, not your anxiety." },
  { id: 2, title: "TikTok hook — CAC registration benefits", platform: "TikTok", topic: "Registration", status: "Generated", createdAt: "Today 9:30 AM",
    output: "The #1 reason Nigerian businesses stay broke? They're not registered. Here's what a CAC certificate actually unlocks for you — watch till the end..." },
  { id: 3, title: "Instagram carousel — RIDI eligibility", platform: "Instagram", topic: "RIDI", status: "Pending Review", createdAt: "Today 10:15 AM" },
  { id: 4, title: "YouTube description — Episode 14", platform: "YouTube", topic: "Podcast", status: "Pending Review", createdAt: "Today 11:00 AM" },
  { id: 5, title: "Email nurture — Systemise intro", platform: "Email", topic: "Systemise", status: "Draft", createdAt: "Yesterday 3:00 PM" },
];

const ASSETS = [
  { id: 1, name: "HAMZURY Brand Kit 2026", type: "zip", size: "12.4 MB", date: "Mar 1" },
  { id: 2, name: "Podcast Intro/Outro Jingle", type: "audio", size: "3.2 MB", date: "Feb 15" },
  { id: 3, name: "YouTube Thumbnail Templates", type: "figma", size: "—", date: "Feb 10" },
  { id: 4, name: "Reel B-Roll Library Q1 2026", type: "video", size: "4.7 GB", date: "Mar 20" },
  { id: 5, name: "Canva Social Templates", type: "figma", size: "—", date: "Jan 30" },
  { id: 6, name: "Client Testimonial Clips", type: "video", size: "890 MB", date: "Mar 15" },
  { id: 7, name: "RIDI Programme Promo Kit", type: "zip", size: "8.1 MB", date: "Mar 5" },
];

const SOCIAL_STATS = [
  { platform: "Instagram",  handle: "@hamzury.co",     followers: "4,210",  growth: "+8.3%", posts: 42, reach: "18,400",  color: "#E1306C" },
  { platform: "TikTok",     handle: "@hamzury",         followers: "12,840", growth: "+22.1%", posts: 58, reach: "94,200", color: "#010101" },
  { platform: "LinkedIn",   handle: "HAMZURY",          followers: "1,680",  growth: "+5.6%", posts: 18, reach: "6,800",   color: "#0A66C2" },
  { platform: "YouTube",    handle: "HAMZURY Official", followers: "2,340",  growth: "+11.4%", posts: 14, reach: "31,000", color: "#FF0000" },
  { platform: "Podcast",    handle: "The HAMZURY Show", followers: "840",    growth: "+4.2%", posts: 13, reach: "8,700",   color: GOLD },
];

// ─── Status color helper ───────────────────────────────────────────────────
function statusColor(status: string) {
  if (status === "Published" || status === "Generated") return "#16A34A";
  if (status === "Recording" || status === "Editing" || status === "Scripting") return "#3B82F6";
  if (status === "Scheduled") return "#7C3AED";
  if (status === "Pending Approval" || status === "Pending Review") return "#CA8A04";
  if (status === "Draft" || status === "Planning") return "#6B7280";
  return "#9CA3AF";
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function MediaDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [activeSection, setActiveSection] = useState<Section>("clients");
  const [expandedAI, setExpandedAI] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPlatform, setNewTaskPlatform] = useState("LinkedIn");

  // ── Client work (CSO-assigned tasks) ──
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [taskNotes, setTaskNotes]           = useState<Record<number, string>>({});
  const [submittingId, setSubmittingId]     = useState<number | null>(null);
  const [inboxFilter, setInboxFilter]       = useState<string>("all");

  const clientTasksQuery = trpc.tasks.list.useQuery({ department: "media" }, { refetchInterval: 15000 });
  const subsQuery        = trpc.subscriptions.list.useQuery(undefined, { refetchInterval: 30000 });
  const utils            = trpc.useUtils();
  const submitMut = trpc.tasks.submit.useMutation({
    onSuccess: () => { toast.success("Submitted to CSO for review"); utils.tasks.list.invalidate(); },
    onError:   () => toast.error("Failed to submit"),
  });
  const statusMut = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => utils.tasks.list.invalidate(),
    onError:   () => toast.error("Failed to update"),
  });

  const clientTasks = clientTasksQuery.data || [];
  const filteredClientTasks = useMemo(() =>
    inboxFilter === "all" ? clientTasks : clientTasks.filter((t: any) => t.status === inboxFilter),
  [clientTasks, inboxFilter]);

  const submittedCount = clientTasks.filter((t: any) => t.status === "Submitted").length;

  function handleTaskSubmit(id: number) {
    setSubmittingId(id);
    submitMut.mutate({ id, notes: taskNotes[id] }, { onSettled: () => setSubmittingId(null) });
  }
  const [calendarFilter, setCalendarFilter] = useState("All");

  // ── Content Calendar state ──
  const [calWeekOffset, setCalWeekOffset] = useState(0);
  const [calDeptFilter, setCalDeptFilter] = useState("all");
  const [calStatusFilter, setCalStatusFilter] = useState("all");
  const [calSelectedDay, setCalSelectedDay] = useState<string | null>(null);
  const [calShowCreate, setCalShowCreate] = useState(false);
  const [calNewCaption, setCalNewCaption] = useState("");
  const [calNewPlatform, setCalNewPlatform] = useState<"instagram" | "tiktok" | "twitter" | "linkedin">("instagram");
  const [calNewDept, setCalNewDept] = useState<"general" | "bizdoc" | "systemise" | "skills">("general");
  const [calNewType, setCalNewType] = useState<"educational" | "success_story" | "service_spotlight" | "behind_scenes" | "quote" | "carousel">("educational");
  const [calNewHashtags, setCalNewHashtags] = useState("");
  const [calNewTime, setCalNewTime] = useState("09:00");
  const [calGenerateTopic, setCalGenerateTopic] = useState("");
  const [calGenerateDept, setCalGenerateDept] = useState<"general" | "bizdoc" | "systemise" | "skills">("general");
  const [calGeneratePlatform, setCalGeneratePlatform] = useState<"instagram" | "tiktok" | "twitter" | "linkedin">("instagram");

  // Week date range helpers
  const getWeekRange = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };
  const { start: weekStart, end: weekEnd } = getWeekRange(calWeekOffset);

  const calendarQuery = trpc.content.calendar.useQuery(
    { startDate: weekStart.toISOString(), endDate: weekEnd.toISOString() },
    { refetchInterval: 15000 }
  );

  const contentCreateMut = trpc.content.create.useMutation({
    onSuccess: () => {
      toast.success("Content post created");
      calendarQuery.refetch();
      setCalShowCreate(false);
      setCalNewCaption("");
      setCalNewHashtags("");
    },
    onError: () => toast.error("Failed to create post"),
  });

  const contentGenerateMut = trpc.content.generate.useMutation({
    onSuccess: () => {
      toast.success("AI content generated as draft");
      calendarQuery.refetch();
      setCalGenerateTopic("");
    },
    onError: () => toast.error("Failed to generate AI content"),
  });

  const contentSeedMut = trpc.content.seed.useMutation({
    onSuccess: (data) => {
      if (data.skipped) toast.info("Content already seeded");
      else toast.success(`Seeded ${data.inserted} content posts`);
      calendarQuery.refetch();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: MILK }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!user) return null;

  // ─── Overview Section ─────────────────────────────────────────────────
  function renderOverview() {
    const published = MOCK_CONTENT.filter(c => c.status === "Published").length;
    const inProg    = MOCK_CONTENT.filter(c => ["Editing","Recording","Scripting"].includes(c.status)).length;
    const pending   = MOCK_CONTENT.filter(c => ["Draft","Planning","Pending Approval"].includes(c.status)).length;
    const totalViews = MOCK_CONTENT.reduce((s, c) => s + (c.views || 0), 0);

    return (
      <div className="space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Published This Month", value: String(published), icon: <CheckCircle2 size={18} />, color: "#16A34A" },
            { label: "In Production",        value: String(inProg),    icon: <Film size={18} />,         color: "#3B82F6" },
            { label: "Pending / Draft",      value: String(pending),   icon: <Edit3 size={18} />,        color: "#CA8A04" },
            { label: "Total Views (month)",  value: totalViews.toLocaleString(), icon: <Eye size={18} />, color: GOLD },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-5 space-y-2"
              style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
              <div className="flex items-center gap-2">
                <span style={{ color: card.color }}>{card.icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>{card.label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: DARK }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Recent content */}
        <div>
          <p className="text-sm font-bold mb-4" style={{ color: DARK }}>Recent Content</p>
          <div className="space-y-2">
            {MOCK_CONTENT.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${GOLD}18` }}>
                  {item.type === "Video" || item.type === "Short" || item.type === "Reel"
                    ? <Video size={14} style={{ color: GOLD }} />
                    : item.type === "Episode"
                      ? <Mic size={14} style={{ color: GOLD }} />
                      : <Edit3 size={14} style={{ color: GOLD }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: DARK }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{item.platform} · {item.assignee} · {item.date}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: `${statusColor(item.status)}18`, color: statusColor(item.status) }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform quick stats */}
        <div>
          <p className="text-sm font-bold mb-4" style={{ color: DARK }}>Platform Snapshot</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SOCIAL_STATS.slice(0, 3).map(s => (
              <div key={s.platform} className="rounded-2xl p-4 space-y-1"
                style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs font-bold" style={{ color: DARK }}>{s.platform}</span>
                  <span className="ml-auto text-[11px] font-bold" style={{ color: "#16A34A" }}>{s.growth}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: DARK }}>{s.followers}</p>
                <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{s.reach} reach · {s.posts} posts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Content Calendar Section ─────────────────────────────────────────
  function renderCalendar() {
    const DEPT_COLORS: Record<string, string> = { general: "#0A1F1C", bizdoc: "#1B4D3E", systemise: "#1E3A5F", skills: "#C9A97E" };
    const PLATFORM_ICONS: Record<string, string> = { instagram: "IG", tiktok: "TT", twitter: "X", linkedin: "LI" };
    const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
      draft: { bg: "#6B728014", text: "#6B7280" },
      scheduled: { bg: "#7C3AED14", text: "#7C3AED" },
      posted: { bg: "#22C55E14", text: "#16A34A" },
      failed: { bg: "#EF444414", text: "#EF4444" },
    };

    const calPosts: any[] = calendarQuery.data || [];

    // Build days of the week
    const days: { date: Date; label: string; dayNum: number; key: string; isToday: boolean }[] = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const today = new Date();
      const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      days.push({
        date: d,
        label: dayNames[i],
        dayNum: d.getDate(),
        key: d.toISOString().slice(0, 10),
        isToday,
      });
    }

    // Filter posts
    let filtered = calPosts;
    if (calDeptFilter !== "all") filtered = filtered.filter((p: any) => p.department === calDeptFilter);
    if (calStatusFilter !== "all") filtered = filtered.filter((p: any) => p.status === calStatusFilter);

    // Group by day key
    const grouped: Record<string, any[]> = {};
    for (const day of days) grouped[day.key] = [];
    for (const post of filtered) {
      if (!post.scheduledFor) continue;
      const key = new Date(post.scheduledFor).toISOString().slice(0, 10);
      if (grouped[key]) grouped[key].push(post);
    }

    const monthLabel = weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const weekLabel = `${weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${weekEnd.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

    // Day detail view
    const selectedPosts = calSelectedDay ? (grouped[calSelectedDay] || []) : [];
    const selectedLabel = calSelectedDay
      ? new Date(calSelectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : "";

    return (
      <div className="space-y-5">
        {/* Week nav + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setCalWeekOffset(o => o - 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ border: "1px solid #E8E3DC", color: DARK }}>
              <ChevronLeft size={16} />
            </button>
            <div className="text-center min-w-40">
              <p className="text-sm font-bold" style={{ color: DARK }}>{monthLabel}</p>
              <p className="text-[11px]" style={{ color: "#9CA3AF" }}>{weekLabel}</p>
            </div>
            <button onClick={() => setCalWeekOffset(o => o + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ border: "1px solid #E8E3DC", color: DARK }}>
              <ChevronRight size={16} />
            </button>
            {calWeekOffset !== 0 && (
              <button onClick={() => setCalWeekOffset(0)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${TEAL}10`, color: TEAL }}>
                Today
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Department filter */}
            {["all", "general", "bizdoc", "systemise", "skills"].map(d => (
              <button key={d} onClick={() => setCalDeptFilter(d)}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-all"
                style={{
                  background: calDeptFilter === d ? TEAL : WHITE,
                  color: calDeptFilter === d ? WHITE : "#6B7280",
                  border: "1px solid #E8E3DC",
                }}>
                {d === "all" ? "All Depts" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "draft", "scheduled", "posted", "failed"].map(s => (
            <button key={s} onClick={() => setCalStatusFilter(s)}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full transition-all"
              style={{
                background: calStatusFilter === s ? TEAL : WHITE,
                color: calStatusFilter === s ? WHITE : "#6B7280",
                border: "1px solid #E8E3DC",
              }}>
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={() => setCalShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
              style={{ background: TEAL, color: WHITE }}>
              <Plus size={12} /> New Post
            </button>
            <button onClick={() => contentSeedMut.mutate()}
              disabled={contentSeedMut.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
              style={{ background: `${GOLD}20`, color: "#7B4F00", border: `1px solid ${GOLD}40` }}>
              {contentSeedMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Seed Sample Data
            </button>
          </div>
        </div>

        {/* Loading state */}
        {calendarQuery.isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" size={24} style={{ color: GOLD }} />
          </div>
        )}

        {/* Weekly grid */}
        {!calendarQuery.isLoading && (
          <div className="grid grid-cols-7 gap-1.5">
            {days.map(day => {
              const posts = grouped[day.key] || [];
              const isSelected = calSelectedDay === day.key;
              return (
                <button key={day.key}
                  onClick={() => setCalSelectedDay(isSelected ? null : day.key)}
                  className="rounded-xl p-2 text-left transition-all min-h-[120px] flex flex-col"
                  style={{
                    background: isSelected ? `${TEAL}08` : WHITE,
                    border: isSelected ? `2px solid ${TEAL}` : day.isToday ? `2px solid ${GOLD}` : "1px solid #E8E3DC",
                  }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>{day.label}</span>
                    <span className={`text-sm font-bold ${day.isToday ? "w-6 h-6 rounded-full flex items-center justify-center" : ""}`}
                      style={{
                        color: day.isToday ? WHITE : DARK,
                        background: day.isToday ? GOLD : "transparent",
                      }}>
                      {day.dayNum}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {posts.slice(0, 3).map((post: any) => {
                      const time = post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "";
                      return (
                        <div key={post.id} className="rounded-md px-1.5 py-1 flex items-center gap-1"
                          style={{ background: `${DEPT_COLORS[post.department] || TEAL}12` }}>
                          <span className="text-[9px] font-bold px-1 rounded" style={{ background: `${DEPT_COLORS[post.department] || TEAL}25`, color: DEPT_COLORS[post.department] || TEAL }}>
                            {PLATFORM_ICONS[post.platform] || "?"}
                          </span>
                          <span className="text-[9px] truncate flex-1" style={{ color: DARK }}>{time}</span>
                        </div>
                      );
                    })}
                    {posts.length > 3 && (
                      <p className="text-[9px] font-semibold text-center" style={{ color: "#9CA3AF" }}>+{posts.length - 3} more</p>
                    )}
                    {posts.length === 0 && (
                      <p className="text-[9px] text-center mt-4 opacity-30" style={{ color: DARK }}>—</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Day detail panel */}
        {calSelectedDay && (
          <div className="rounded-2xl p-5 space-y-4" style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: DARK }}>{selectedLabel}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: `${TEAL}10`, color: TEAL }}>
                  {selectedPosts.length} post{selectedPosts.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => setCalSelectedDay(null)} className="p-1 rounded-lg" style={{ color: "#9CA3AF" }}>
                  <X size={14} />
                </button>
              </div>
            </div>
            {selectedPosts.length === 0 ? (
              <p className="text-xs text-center py-6 opacity-40" style={{ color: DARK }}>No posts scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedPosts.map((post: any) => {
                  const sc = STATUS_COLORS[post.status] || STATUS_COLORS.draft;
                  const time = post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "No time";
                  return (
                    <div key={post.id} className="rounded-xl p-4" style={{ border: "1px solid #E8E3DC" }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold"
                          style={{ background: `${DEPT_COLORS[post.department] || TEAL}15`, color: DEPT_COLORS[post.department] || TEAL }}>
                          {PLATFORM_ICONS[post.platform]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium leading-snug" style={{ color: DARK }}>
                            {post.caption?.slice(0, 120)}{post.caption?.length > 120 ? "..." : ""}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: `${DEPT_COLORS[post.department] || TEAL}12`, color: DEPT_COLORS[post.department] || TEAL }}>
                              {post.department}
                            </span>
                            <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{post.platform}</span>
                            <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{post.contentType?.replace("_", " ")}</span>
                            <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{time}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                              {post.status}
                            </span>
                          </div>
                          {post.hashtags && (
                            <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: GOLD }}>{post.hashtags}</p>
                          )}
                          {post.createdBy && (
                            <p className="text-[10px] mt-1" style={{ color: "#9CA3AF" }}>
                              By: {post.createdBy === "ai_muse" ? "AI Muse" : post.createdBy}
                            </p>
                          )}
                          {post.engagement && (
                            <div className="flex gap-3 mt-2">
                              {post.engagement.likes != null && <span className="text-[10px]" style={{ color: "#9CA3AF" }}>Likes: {post.engagement.likes}</span>}
                              {post.engagement.comments != null && <span className="text-[10px]" style={{ color: "#9CA3AF" }}>Comments: {post.engagement.comments}</span>}
                              {post.engagement.shares != null && <span className="text-[10px]" style={{ color: "#9CA3AF" }}>Shares: {post.engagement.shares}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Generate section */}
        <div className="rounded-2xl p-5" style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: GOLD }} />
            <p className="text-sm font-bold" style={{ color: DARK }}>Generate AI Content</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input placeholder="Topic (optional)..." value={calGenerateTopic} onChange={e => setCalGenerateTopic(e.target.value)}
              className="flex-1 min-w-40 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }} />
            <select value={calGenerateDept} onChange={e => setCalGenerateDept(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}>
              <option value="general">General</option>
              <option value="bizdoc">BizDoc</option>
              <option value="systemise">Systemise</option>
              <option value="skills">Skills</option>
            </select>
            <select value={calGeneratePlatform} onChange={e => setCalGeneratePlatform(e.target.value as any)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <button
              onClick={() => contentGenerateMut.mutate({
                department: calGenerateDept,
                platform: calGeneratePlatform,
                topic: calGenerateTopic || undefined,
              })}
              disabled={contentGenerateMut.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: TEAL, color: WHITE }}>
              {contentGenerateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate
            </button>
          </div>
        </div>

        {/* Create post modal / inline */}
        {calShowCreate && (
          <div className="rounded-2xl p-5 space-y-4" style={{ background: WHITE, border: `2px solid ${TEAL}` }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: DARK }}>Create Content Post</p>
              <button onClick={() => setCalShowCreate(false)} className="p-1 rounded-lg" style={{ color: "#9CA3AF" }}>
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={calNewDept} onChange={e => setCalNewDept(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}>
                <option value="general">General</option>
                <option value="bizdoc">BizDoc</option>
                <option value="systemise">Systemise</option>
                <option value="skills">Skills</option>
              </select>
              <select value={calNewPlatform} onChange={e => setCalNewPlatform(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
              <select value={calNewType} onChange={e => setCalNewType(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}>
                <option value="educational">Educational</option>
                <option value="success_story">Success Story</option>
                <option value="service_spotlight">Service Spotlight</option>
                <option value="behind_scenes">Behind Scenes</option>
                <option value="quote">Quote</option>
                <option value="carousel">Carousel</option>
              </select>
              <input type="time" value={calNewTime} onChange={e => setCalNewTime(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none" style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }} />
            </div>
            <textarea rows={3} placeholder="Caption..." value={calNewCaption} onChange={e => setCalNewCaption(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }} />
            <input placeholder="Hashtags (e.g. #HAMZURY #Business)" value={calNewHashtags} onChange={e => setCalNewHashtags(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }} />
            <button
              onClick={() => {
                if (!calNewCaption.trim()) { toast.error("Caption is required"); return; }
                const schedDate = calSelectedDay || new Date().toISOString().slice(0, 10);
                contentCreateMut.mutate({
                  department: calNewDept,
                  platform: calNewPlatform,
                  contentType: calNewType,
                  caption: calNewCaption,
                  hashtags: calNewHashtags || undefined,
                  scheduledFor: `${schedDate}T${calNewTime}:00`,
                  status: "scheduled",
                });
              }}
              disabled={contentCreateMut.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: TEAL, color: WHITE }}>
              {contentCreateMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
              Schedule Post
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── AI Twin Section ──────────────────────────────────────────────────
  function renderAITwin() {
    return (
      <div className="space-y-6">
        {/* Info card */}
        <div className="rounded-2xl p-5" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}30` }}>
          <div className="flex items-start gap-3">
            <Bot size={20} style={{ color: GOLD }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold" style={{ color: TEAL }}>HAMZURY AI Content Twin</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6B7280" }}>
                The AI twin generates on-brand content drafts for all platforms using HAMZURY's voice, values, and services. Review, edit, and publish from here.
              </p>
            </div>
          </div>
        </div>

        {/* Quick generate */}
        <div className="rounded-2xl p-5" style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
          <p className="text-sm font-bold mb-4" style={{ color: DARK }}>Generate New Content</p>
          <div className="flex gap-3 flex-wrap">
            <input
              placeholder="Content topic or title…"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}
            />
            <select
              value={newTaskPlatform}
              onChange={e => setNewTaskPlatform(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1.5px solid #E8E3DC", background: MILK, color: DARK }}>
              {["LinkedIn","TikTok","Instagram","YouTube","Email","Podcast"].map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!newTaskTitle.trim()) return;
                toast.success(`AI generating content for "${newTaskTitle}" on ${newTaskPlatform}…`);
                setNewTaskTitle("");
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: TEAL, color: WHITE }}>
              <Zap size={14} className="inline mr-1.5" />Generate
            </button>
          </div>
        </div>

        {/* Tasks list */}
        <div className="space-y-3">
          {AI_TWIN_TASKS.map(task => (
            <div key={task.id} className="rounded-2xl overflow-hidden"
              style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpandedAI(expandedAI === task.id ? null : task.id)}>
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ background: `${TEAL}10` }}>
                  <Bot size={14} style={{ color: TEAL }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: DARK }}>{task.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    {task.platform} · {task.createdAt}
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 mr-2"
                  style={{ background: `${statusColor(task.status)}18`, color: statusColor(task.status) }}>
                  {task.status}
                </span>
                {expandedAI === task.id ? <ChevronUp size={16} style={{ color: "#9CA3AF" }} /> : <ChevronDown size={16} style={{ color: "#9CA3AF" }} />}
              </button>
              {expandedAI === task.id && task.output && (
                <div className="px-4 pb-4 pt-0">
                  <div className="rounded-xl p-4" style={{ background: MILK }}>
                    <p className="text-xs leading-relaxed" style={{ color: DARK }}>{task.output}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { navigator.clipboard.writeText(task.output || ""); toast.success("Copied!"); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: `${TEAL}10`, color: TEAL }}>
                      <Download size={12} /> Copy
                    </button>
                    <button
                      onClick={() => toast.success("Marked as approved")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#F0FDF4", color: "#16A34A" }}>
                      <CheckCircle2 size={12} /> Approve
                    </button>
                    <button
                      onClick={() => toast.info("Opening editor…")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: `${GOLD}12`, color: "#7B4F00" }}>
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Podcast Section ───────────────────────────────────────────────────
  function renderPodcast() {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-5" style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${GOLD}18` }}>
              <Mic size={18} style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: DARK }}>The HAMZURY Show</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Weekly · Business, systems & African entrepreneurship</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Episodes", value: "14" },
              { label: "Total Plays",    value: "7,630" },
              { label: "Avg Duration",  value: "38 min" },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: MILK }}>
                <p className="text-xl font-bold" style={{ color: DARK }}>{stat.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {PODCAST_EPISODES.map(ep => (
            <div key={ep.ep} className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: ep.status === "Published" ? `${GOLD}18` : `${TEAL}08` }}>
                <span className="text-xs font-bold" style={{ color: ep.status === "Published" ? GOLD : TEAL }}>
                  #{ep.ep}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: DARK }}>{ep.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {ep.guest ? `Guest: ${ep.guest} · ` : ""}{ep.date}{ep.duration ? ` · ${ep.duration}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {ep.plays && (
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>
                    <Play size={11} className="inline mr-1" />{ep.plays.toLocaleString()}
                  </span>
                )}
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${statusColor(ep.status)}18`, color: statusColor(ep.status) }}>
                  {ep.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => toast.success("Coming soon: Log new episode")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: TEAL, color: WHITE }}>
          <Plus size={15} /> Log New Episode
        </button>
      </div>
    );
  }

  // ─── Asset Vault Section ──────────────────────────────────────────────
  function renderVault() {
    const typeIcon = (type: string) => {
      if (type === "video") return <Video size={14} style={{ color: "#3B82F6" }} />;
      if (type === "audio") return <Mic size={14} style={{ color: "#7C3AED" }} />;
      if (type === "zip")   return <Folder size={14} style={{ color: GOLD }} />;
      return <Image size={14} style={{ color: "#16A34A" }} />;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold" style={{ color: DARK }}>Brand & Media Assets</p>
          <button
            onClick={() => toast.success("Coming soon: Upload asset")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: TEAL, color: WHITE }}>
            <Upload size={12} /> Upload
          </button>
        </div>
        <div className="space-y-2">
          {ASSETS.map(asset => (
            <div key={asset.id} className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: MILK }}>
                {typeIcon(asset.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: DARK }}>{asset.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {asset.type.toUpperCase()} · {asset.size} · Added {asset.date}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toast.success(`Opening ${asset.name}…`)}
                  className="p-1.5 rounded-lg transition"
                  style={{ background: `${TEAL}08`, color: TEAL }}>
                  <Eye size={13} />
                </button>
                <button
                  onClick={() => toast.success(`Downloading ${asset.name}…`)}
                  className="p-1.5 rounded-lg transition"
                  style={{ background: `${GOLD}10`, color: "#7B4F00" }}>
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Social Reports Section ───────────────────────────────────────────
  function renderSocial() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_STATS.map(s => (
            <div key={s.platform} className="rounded-2xl p-5"
              style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}18` }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: DARK }}>{s.platform}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{s.handle}</p>
                </div>
                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  {s.growth}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Followers", value: s.followers },
                  { label: "Posts",     value: String(s.posts) },
                  { label: "Reach",     value: s.reach },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-2.5 text-center" style={{ background: MILK }}>
                    <p className="text-base font-bold" style={{ color: DARK }}>{stat.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-5" style={{ background: WHITE, border: "1px solid #E8E3DC" }}>
          <p className="text-sm font-bold mb-3" style={{ color: DARK }}>Content Goals — Q2 2026</p>
          {[
            { label: "YouTube Subscribers",      current: 2340,  target: 5000,  unit: "" },
            { label: "TikTok Followers",          current: 12840, target: 25000, unit: "" },
            { label: "Monthly Reach (all platforms)", current: 158100, target: 250000, unit: "" },
            { label: "Podcast Episodes",          current: 14,    target: 26,    unit: " eps" },
          ].map(goal => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.label} className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: DARK }}>{goal.label}</span>
                  <span style={{ color: "#9CA3AF" }}>
                    {goal.current.toLocaleString()}{goal.unit} / {goal.target.toLocaleString()}{goal.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EDE8" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct >= 80 ? "#16A34A" : pct >= 50 ? GOLD : "#3B82F6" }} />
                </div>
                <p className="text-[10px] mt-1 text-right" style={{ color: "#9CA3AF" }}>{pct}% of target</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderInbox() {
    const MEDIA = "#7C3AED";
    return (
      <div className="space-y-4">
        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {["all", "Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"].map(s => (
            <button key={s} onClick={() => setInboxFilter(s)}
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor: inboxFilter === s ? TEAL : "transparent",
                color: inboxFilter === s ? GOLD : TEAL,
                border: `1px solid ${TEAL}20`,
              }}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {clientTasksQuery.isLoading ? (
          <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${TEAL}10` }}>
            <Loader2 className="animate-spin mx-auto" size={24} style={{ color: GOLD }} />
          </div>
        ) : filteredClientTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border p-14 text-center" style={{ borderColor: `${TEAL}10` }}>
            <Briefcase size={40} className="mx-auto mb-4 opacity-20" style={{ color: TEAL }} />
            <p className="text-[14px] opacity-40" style={{ color: TEAL }}>
              {inboxFilter === "all"
                ? "No client tasks yet — CSO will assign media work here"
                : `No ${inboxFilter} tasks`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClientTasks.map((t: any) => {
              const sc = TASK_STATUS_COLORS[t.status] || TASK_STATUS_COLORS["Not Started"];
              const isOverdue = t.deadline && new Date(t.deadline) < new Date() && t.status !== "Completed";
              const isOpen = expandedTaskId === t.id;
              const notes = taskNotes[t.id] ?? t.notes ?? "";
              return (
                <div key={t.id} className="bg-white rounded-2xl border"
                  style={{ borderColor: t.isRework ? "#F59E0B40" : `${TEAL}10` }}>
                  {t.isRework && (
                    <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold"
                      style={{ backgroundColor: "#F59E0B18", color: "#B45309" }}>
                      <AlertTriangle size={13} /> Needs Rework — CSO sent this back. Update and resubmit.
                    </div>
                  )}
                  {t.kpiApproved && (
                    <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold"
                      style={{ backgroundColor: "#22C55E18", color: "#16A34A" }}>
                      <Star size={13} /> CSO Approved — Smooth Task ✓
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono font-bold opacity-40" style={{ color: TEAL }}>{t.ref}</span>
                          {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#EF444418", color: "#EF4444" }}>Overdue</span>}
                        </div>
                        <p className="text-[15px] font-semibold" style={{ color: TEAL }}>{t.clientName}</p>
                        <p className="text-[12px] opacity-50 mt-0.5">{t.service}{t.businessName ? ` · ${t.businessName}` : ""}</p>
                        {t.deadline && (
                          <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: isOverdue ? "#EF4444" : "#64748B" }}>
                            <Clock size={10} /> Due {t.deadline}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: sc.bg, color: sc.text }}>{t.status}</span>
                        <button onClick={() => setExpandedTaskId(isOpen ? null : t.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70"
                          style={{ backgroundColor: `${TEAL}10`, color: TEAL }}>
                          <ChevronRight size={14} className={`transition-transform ${isOpen ? "rotate-90" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t space-y-4" style={{ borderColor: `${TEAL}08` }}>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider opacity-40 mb-2" style={{ color: DARK }}>Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {(["Not Started", "In Progress", "Waiting on Client"] as const).map(s => (
                              <button key={s} onClick={() => statusMut.mutate({ id: t.id, status: s as any })}
                                className="text-[11px] font-semibold px-3 py-1.5 rounded-full hover:opacity-80"
                                style={{
                                  backgroundColor: t.status === s ? TASK_STATUS_COLORS[s].bg : `${TEAL}06`,
                                  color: t.status === s ? TASK_STATUS_COLORS[s].text : TEAL,
                                  border: `1px solid ${t.status === s ? TASK_STATUS_COLORS[s].text + "40" : TEAL + "12"}`,
                                }}>{s}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider opacity-40 mb-2" style={{ color: DARK }}>Work Notes / Deliverable</p>
                          <textarea rows={4}
                            value={notes}
                            onChange={e => setTaskNotes(p => ({ ...p, [t.id]: e.target.value }))}
                            placeholder="Describe the work done — content links, Canva files, scripts, published post URLs…"
                            className="w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none resize-none"
                            style={{ borderColor: `${TEAL}18`, color: TEAL, backgroundColor: "#FAFAF8" }} />
                        </div>
                        {t.status !== "Completed" && !t.kpiApproved && (
                          <button onClick={() => handleTaskSubmit(t.id)} disabled={submittingId === t.id}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: MEDIA, color: "#fff" }}>
                            {submittingId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Submit to CSO for Review
                          </button>
                        )}
                        {t.status === "Submitted" && !t.kpiApproved && (
                          <p className="text-center text-[12px] opacity-40" style={{ color: DARK }}>Submitted — waiting for CSO review…</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderClients() {
    const allSubs = subsQuery.data ?? [];
    const mediaSubs = allSubs.filter(s => s.department === "media" && s.status === "active");

    const PLATFORM_ICONS: Record<string, string> = {
      instagram: "📸", tiktok: "🎵", linkedin: "💼", facebook: "📘",
      x: "𝕏", youtube: "▶️", podcast: "🎙️",
    };

    function getPlatformTags(service: string): string[] {
      const s = service.toLowerCase();
      const tags: string[] = [];
      if (s.includes("fb") || s.includes("facebook")) tags.push("Facebook");
      if (s.includes("ig") || s.includes("instagram")) tags.push("Instagram");
      if (s.includes("tiktok")) tags.push("TikTok");
      if (s.includes("linkedin")) tags.push("LinkedIn");
      if (s.includes("x,") || s.includes(", x") || s.includes("twitter")) tags.push("X");
      if (s.includes("youtube")) tags.push("YouTube");
      if (s.includes("podcast")) tags.push("Podcast");
      if (tags.length === 0 && s.includes("social")) tags.push("All Platforms");
      return tags;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: TEAL }}>Social Media Clients</h2>
            <p className="text-[12px] opacity-50 mt-0.5" style={{ color: TEAL }}>{mediaSubs.length} active clients managed by Media team</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Clients", value: mediaSubs.length },
            { label: "Monthly Value", value: `₦${mediaSubs.reduce((sum, s) => sum + Number(s.monthlyFee), 0).toLocaleString()}` },
            { label: "Platforms Managed", value: "5+" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border p-4 text-center" style={{ borderColor: `${TEAL}10` }}>
              <p className="text-[18px] font-light" style={{ color: TEAL }}>{value}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-40 mt-1" style={{ color: TEAL }}>{label}</p>
            </div>
          ))}
        </div>

        {subsQuery.isLoading ? (
          <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: `${TEAL}10` }}>
            <Loader2 className="animate-spin mx-auto" size={24} style={{ color: GOLD }} />
          </div>
        ) : mediaSubs.length === 0 ? (
          <div className="bg-white rounded-2xl border p-14 text-center" style={{ borderColor: `${TEAL}10` }}>
            <Users size={40} className="mx-auto mb-4 opacity-20" style={{ color: TEAL }} />
            <p className="text-[14px] opacity-40" style={{ color: TEAL }}>No social media clients yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mediaSubs.map(sub => {
              const tags = getPlatformTags(sub.service);
              const fee = Number(sub.monthlyFee);
              return (
                <div key={sub.id} className="bg-white rounded-2xl border p-5" style={{ borderColor: `${TEAL}10` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[15px] font-semibold" style={{ color: TEAL }}>{sub.clientName}</p>
                      {sub.businessName && sub.businessName !== sub.clientName && (
                        <p className="text-[11px] opacity-40 mt-0.5" style={{ color: TEAL }}>{sub.businessName}</p>
                      )}
                      <p className="text-[12px] opacity-60 mt-1" style={{ color: TEAL }}>{sub.service}</p>
                    </div>
                    <div className="text-right">
                      {fee > 0 ? (
                        <p className="text-[14px] font-light" style={{ color: GOLD }}>₦{fee.toLocaleString()}/mo</p>
                      ) : (
                        <p className="text-[11px] opacity-30" style={{ color: TEAL }}>Internal</p>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                    </div>
                  </div>

                  {/* Platform tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${TEAL}12`, color: TEAL }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Staff notes */}
                  {sub.notesForStaff && (
                    <div className="text-[11px] px-3 py-2 rounded-xl" style={{ backgroundColor: `${GOLD}10`, color: TEAL }}>
                      {sub.notesForStaff}
                    </div>
                  )}

                  <p className="text-[10px] opacity-30 mt-2" style={{ color: TEAL }}>Started {sub.startDate}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Scope Reference */}
        <div className="rounded-2xl border p-5" style={{ borderColor: `${TEAL}10`, backgroundColor: `${TEAL}04` }}>
          <p className="text-[12px] font-semibold mb-3" style={{ color: TEAL }}>Standard Scope Reference</p>
          <div className="space-y-1.5">
            {[
              ["Full Package (Skills/Systemise)", "2 Reels/week · 8 Carousels/month · 5 Flyers/month · Daily Stories · 5 Platforms"],
              ["LinkedIn + Instagram", "1 post/day · Stories · Community engagement · Monthly report"],
              ["Personal Brand (Hamzury)", "TikTok + Instagram · Mix of educational + behind-the-scenes"],
              ["Tilz Spa", "Instagram-first · Luxury aesthetic · Booking CTAs · Growth Partner tier"],
            ].map(([client, scope]) => (
              <div key={client} className="flex gap-3 text-[11px]">
                <span className="font-medium shrink-0" style={{ color: TEAL }}>{client}:</span>
                <span className="opacity-50" style={{ color: TEAL }}>{scope}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "clients":  return renderClients();
      case "inbox":    return renderInbox();
      case "overview": return renderOverview();
      case "calendar": return renderCalendar();
      case "aitwin":   return renderAITwin();
      case "podcast":  return renderPodcast();
      case "vault":    return renderVault();
      case "social":   return renderSocial();
    }
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MILK }}>
      <PageMeta title="Media Dashboard — HAMZURY" description="Content, AI twin and media management for HAMZURY." />

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <div
        className="w-16 md:w-60 flex flex-col h-full shrink-0"
        style={{ backgroundColor: TEAL }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b shrink-0"
          style={{ borderColor: `${GOLD}15` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: GOLD }}>
            <Video size={16} style={{ color: TEAL }} />
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase leading-none"
              style={{ color: `${GOLD}80` }}>Media Hub</p>
            <p className="text-[13px] font-semibold leading-tight mt-0.5 truncate"
              style={{ color: MILK }}>Content & Creative</p>
          </div>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          <div className="flex flex-col gap-0.5 px-2">
            {SECTIONS.map(s => {
              const isActive = activeSection === s.id;
              const badge = s.id === "inbox" && submittedCount > 0 ? submittedCount : null;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all"
                  style={{
                    backgroundColor: isActive ? `${GOLD}18` : "transparent",
                    color: isActive ? GOLD : `${MILK}70`,
                  }}>
                  <span className="shrink-0">{s.icon}</span>
                  <span className="hidden md:block text-[13px] font-medium truncate flex-1">{s.label}</span>
                  {badge && <span className="hidden md:flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: "#8B5CF6", color: "#fff" }}>{badge}</span>}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-2 pb-4 pt-2 border-t shrink-0 space-y-1"
          style={{ borderColor: `${GOLD}12` }}>
          <Link href="/">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all"
              style={{ color: `${MILK}50` }}>
              <Home size={16} className="shrink-0" />
              <span className="hidden md:block text-[13px]">Home</span>
            </button>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all"
            style={{ color: `${MILK}50` }}>
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block text-[13px]">Sign out</span>
          </button>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b flex items-center justify-between"
          style={{ background: WHITE, borderColor: "#E8E3DC" }}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: GOLD }}>Media Hub</p>
            <h1 className="text-xl font-bold" style={{ color: TEAL }}>
              {currentSection?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold" style={{ color: DARK }}>{user.name}</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>Media / Creative</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ background: `${GOLD}20`, color: GOLD }}>
              {(user.name || "M").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-5xl">
            {renderSection()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
