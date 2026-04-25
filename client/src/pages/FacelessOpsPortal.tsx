import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import OpsShell, { OpsCard, OpsKpi, OpsHeader } from "@/components/ops/OpsShell";
import PhaseTracker, {
  KanbanLane,
  PhaseCard,
  type Phase,
} from "@/components/ops/PhaseTracker";
import AssetChecklist, { type AssetItem } from "@/components/ops/AssetChecklist";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Mic,
  Video,
  Users,
  Share2,
  Sparkles,
  DollarSign,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Film,
  Youtube,
  Hash,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════
 * FACELESS CONTENT OPS PORTAL — Maryam Lalo (Lead) + Habeeba (Production).
 *
 * High-volume AI-assisted content production: YouTube faceless channels,
 * social media packages (20-30 posts/mo), bulk video packages (10/20/50).
 * Eight tabs:
 *   1. Content Calendar          — 30/60/90-day pipeline per client/channel
 *   2. Script Library            — hook/body/CTA + AI prompt + approval
 *   3. Voiceover Queue           — script → tool/voice → audio path
 *   4. Video Production Tracker  — manual vs AI path, stock sources, export
 *   5. Channel / Client Register — YT channels, social packs, bulk packs
 *   6. Distribution              — per-platform publish state + tags + thumb
 *   7. Templates                 — 10 ready-to-use scripts (static const)
 *   8. AI Tools Cost Tracker     — ElevenLabs, Murf, Pictory, ChatGPT…
 *
 * Storage: tRPC `faceless.*` (MySQL via Drizzle).
 * Auth:    founder | ceo | faceless_lead | faceless_staff.
 * Brand:   teal #0F766E sidebar + accent · milk #FFFAF6 background.
 *
 * NOTE: ids are now `number` end-to-end. The legacy localStorage shape used
 * string ids; this file flips everything to int. The `assetSources` field
 * on production and `tags` on distribution are parsed/stringified server-side
 * so the client always sees a real string[]. Templates collection remains a
 * hardcoded TS const (product copy, not user data).
 * ══════════════════════════════════════════════════════════════════════════ */

const TEAL = "#0F766E";
const MILK = "#FFFAF6";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const WHITE = "#FFFFFF";
const GOLD = "#B48C4C";
const RED = "#EF4444";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";

const ALLOWED_ROLES = ["founder", "ceo", "faceless_lead", "faceless_staff"];

type Section =
  | "dashboard"
  | "calendar"
  | "scripts"
  | "voiceovers"
  | "production"
  | "channels"
  | "distribution"
  | "templates"
  | "tools";

/* ══════════════════════════════════════════════════════════════════════════
 *  DOMAIN TYPES (returned by tRPC — `id` is number; FK refs are number|null)
 * ══════════════════════════════════════════════════════════════════════════ */

type ContentItem = {
  id: number;
  topic: string;
  niche?: string | null;
  client: string;
  channel: string;
  format?: string | null;
  publishDate?: string | null;
  status: "Idea" | "Scripting" | "Voiceover" | "Editing" | "Scheduled" | "Published";
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ScriptItem = {
  id: number;
  title: string;
  contentId?: number | null;
  hook: string;
  body?: string | null;
  cta?: string | null;
  aiPrompt?: string | null;
  wordCount?: number | null;
  approval: "Draft" | "In Review" | "Approved" | "Revise";
  reviewer?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type VoiceoverItem = {
  id: number;
  scriptTitle: string;
  scriptId?: number | null;
  tool: "ElevenLabs" | "Murf" | "Play.ht" | "Speechify" | "Other";
  voice: string;
  speed?: string | null;
  audioPath?: string | null;
  status: "Queued" | "Generating" | "Needs QC" | "Approved" | "Rejected";
  note?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ProductionItem = {
  id: number;
  videoTitle: string;
  contentId?: number | null;
  path: "Manual" | "AI-Assisted";
  /** Already-parsed array (server stringifies to text on storage). */
  assetSources: string[];
  assetsReady: boolean;
  voFileReady: boolean;
  editStatus: "Not Started" | "Rough Cut" | "Polishing" | "QC" | "Exported";
  exportPath?: string | null;
  duration?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ChannelItem = {
  id: number;
  kind: "YouTube Channel" | "Social Package" | "Bulk Package";
  name: string;
  client: string;
  niche?: string | null;
  tier?: string | null;
  priceNGN?: number | null;
  monthlyQuota?: number | null;
  delivered?: number | null;
  status: "Onboarding" | "Active" | "Paused" | "Completed";
  startedAt?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type DistributionItem = {
  id: number;
  videoTitle: string;
  platform: "YouTube" | "YouTube Shorts" | "TikTok" | "Instagram Reels" | "Instagram" | "Facebook";
  thumbnailUrl?: string | null;
  /** Already-parsed array (server stringifies to text on storage). */
  tags: string[];
  scheduleAt?: string | null;
  publishedAt?: string | null;
  status: "Scheduled" | "Published" | "Draft" | "Failed";
  channelName?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ToolItem = {
  id: number;
  name: string;
  category: "Voice" | "Script" | "Video" | "Image" | "Stock" | "Music" | "Editing" | "Captions" | "Scheduler";
  monthlyNGN: number;
  seats?: number | null;
  renewsOn?: string | null;
  note?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

/* ══════════════════════════════════════════════════════════════════════════
 *  STATIC: 10 script templates (from Faceless_Content_Templates.txt)
 *  Kept as a TS const — product copy, not user data, never persisted.
 * ══════════════════════════════════════════════════════════════════════════ */

type Template = {
  id: string;
  name: string;
  duration: string;
  format: string;
  hook: string;
  structure: string;
  visuals: string;
  voicePrompt: string;
};

const TEMPLATES: Template[] = [
  {
    id: "tpl-10-tips",
    name: "\"10 Tips\" List Video",
    duration: "5-8 min",
    format: "Vertical or Horizontal",
    hook: "Here are 10 [tips/ways/secrets] to [achieve goal] that actually work.",
    structure:
      "Hook → Tips #1-10 (30-40s each, stock footage + text overlay + progress bar) → Wrap-up + CTA (\"Which tip will you try first?\")",
    visuals: "Stock footage per tip, Tip #N overlay, progress bar 1/10 → 10/10",
    voicePrompt: "Engaging, friendly tone. Pause briefly between tips.",
  },
  {
    id: "tpl-tutorial",
    name: "Quick Tutorial",
    duration: "2-3 min",
    format: "Vertical (TikTok/Reels)",
    hook: "Here's how to [do something] in under 3 minutes.",
    structure:
      "Hook → Step 1 → Step 2 → Step 3 → Result + \"Save this for later\" CTA",
    visuals: "Screen recording if digital tutorial, else stock + text overlays. Zoom/arrow highlights.",
    voicePrompt: "Clear, instructional tone. Moderate pace for easy following.",
  },
  {
    id: "tpl-story-lesson",
    name: "Story + Lesson",
    duration: "3-5 min",
    format: "Horizontal (YouTube)",
    hook: "This [experience] completely changed how I think about [topic].",
    structure: "Hook → Setup → Story → Lesson → CTA",
    visuals: "Relevant stock footage, change scenes every 5-8 seconds, flowing transitions.",
    voicePrompt: "Storytelling tone. Build emotion. Pause for dramatic effect.",
  },
  {
    id: "tpl-comparison",
    name: "Comparison Video",
    duration: "5-7 min",
    format: "Horizontal",
    hook: "[Option A] vs [Option B]: Which is actually better? Let's find out.",
    structure:
      "Hook → Option A pros/cons → Option B pros/cons → Situational comparison → Verdict + CTA",
    visuals: "Split screen, checkmarks for pros, X for cons, side-by-side graphics.",
    voicePrompt: "Balanced, analytical tone. Don't be too promotional for either option.",
  },
  {
    id: "tpl-myth",
    name: "Myth-Busting",
    duration: "4-6 min",
    format: "Horizontal",
    hook: "You've been told [myth] your whole life. It's completely wrong. Here's why.",
    structure: "Hook → The Myth → The Truth (evidence) → Why it matters → CTA",
    visuals: "MYTH vs TRUTH text, data/stats graphics, supporting stock footage.",
    voicePrompt: "Confident, authoritative. Sound like you know what you're talking about.",
  },
  {
    id: "tpl-beginner",
    name: "Beginner's Guide",
    duration: "8-12 min",
    format: "Horizontal (YouTube)",
    hook: "Complete beginner's guide to [topic]. Everything you need to know in 10 minutes.",
    structure:
      "Hook → What is it? → The Essentials (4 sections) → Next steps → Resources + CTA",
    visuals: "Simple concept graphics, text overlays for key terms, step-by-step visuals.",
    voicePrompt: "Patient, teaching tone. Explain like talking to someone who knows nothing about this.",
  },
  {
    id: "tpl-before-after",
    name: "Before & After",
    duration: "3-5 min",
    format: "Vertical or Horizontal",
    hook: "I tried [thing] for [time period]. Here's what happened.",
    structure: "Hook → Before → The Journey (Day 1-7, Week 2-3, Final) → After + Results → Takeaways + CTA",
    visuals: "Before/after graphics, timeline showing progress, results visualisation.",
    voicePrompt: "Personal, honest. Share the journey authentically.",
  },
  {
    id: "tpl-mistakes",
    name: "Common Mistakes",
    duration: "5-7 min",
    format: "Horizontal",
    hook: "You're making these 5 mistakes with [topic]. Here's how to fix them.",
    structure: "Hook → Mistakes #1-5 (1 min each: wrong / why / fix) → Bonus tip → CTA",
    visuals: "Red X for mistakes, green checkmark for solutions, side-by-side wrong vs right.",
    voicePrompt: "Helpful, not judgmental tone. We're all learning together.",
  },
  {
    id: "tpl-top5",
    name: "Top 5 Ranking",
    duration: "6-8 min",
    format: "Horizontal",
    hook: "I ranked the top 5 [items] for [purpose]. Number 1 might surprise you.",
    structure: "Hook → #5, #4, #3, #2, #1 (pros/cons, ascending) → Why this order → CTA",
    visuals: "Numbered list countdown, trophy/medal graphics, product/item visuals.",
    voicePrompt: "Opinionated but fair. Build excitement for the top pick.",
  },
  {
    id: "tpl-explainer",
    name: "Explainer",
    duration: "5-10 min",
    format: "Horizontal (YouTube)",
    hook: "[Complex topic] explained in simple terms. Let's break it down.",
    structure:
      "Hook → Why it matters → The Explanation (basics / how it works / examples) → Key takeaways → Further learning + CTA",
    visuals: "Simple animations, diagrams and flowcharts, real-world example footage.",
    voicePrompt: "Clear, educational. Make complex simple without being condescending.",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
 *  LOCAL HELPERS
 * ══════════════════════════════════════════════════════════════════════════ */

function fmtNaira(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return `₦${Math.round(n).toLocaleString()}`;
}
function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return d;
  }
}
function daysBetween(iso: string | null | undefined): number | null {
  if (!iso) return null;
  try {
    const t = new Date(iso).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  } catch {
    return null;
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontSize: 10,
        color: MUTED,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        fontWeight: 600,
        display: "block",
        marginBottom: 4,
      }}
    >
      {children}
    </label>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 9,
        border: `1px solid ${DARK}15`,
        fontSize: 13,
        color: DARK,
        background: WHITE,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 9,
        border: `1px solid ${DARK}15`,
        fontSize: 13,
        color: DARK,
        background: WHITE,
        outline: "none",
        ...props.style,
      }}
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 9,
        border: `1px solid ${DARK}15`,
        fontSize: 13,
        color: DARK,
        background: WHITE,
        outline: "none",
        minHeight: 60,
        resize: "vertical",
        fontFamily: "inherit",
        ...props.style,
      }}
    />
  );
}

function Btn({
  children,
  onClick,
  tone = "primary",
  small,
  type,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "danger";
  small?: boolean;
  type?: "button" | "submit";
  title?: string;
  disabled?: boolean;
}) {
  const map = {
    primary: { bg: TEAL, fg: WHITE, bd: TEAL },
    ghost: { bg: "transparent", fg: TEAL, bd: `${TEAL}40` },
    danger: { bg: "transparent", fg: RED, bd: `${RED}40` },
  }[tone];
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        padding: small ? "6px 10px" : "9px 14px",
        borderRadius: 9,
        backgroundColor: map.bg,
        color: map.fg,
        border: `1px solid ${map.bd}`,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Pill({
  label,
  tone,
}: {
  label: string;
  tone: "teal" | "gold" | "green" | "red" | "blue" | "orange" | "purple" | "muted";
}) {
  const map = {
    teal: { bg: `${TEAL}18`, fg: TEAL },
    gold: { bg: `${GOLD}20`, fg: GOLD },
    green: { bg: `${GREEN}20`, fg: GREEN },
    red: { bg: `${RED}15`, fg: RED },
    blue: { bg: `${BLUE}15`, fg: BLUE },
    orange: { bg: `${ORANGE}15`, fg: ORANGE },
    purple: { bg: `${PURPLE}18`, fg: PURPLE },
    muted: { bg: "#9CA3AF20", fg: MUTED },
  }[tone];
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        backgroundColor: map.bg,
        color: map.fg,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function EmptyHint({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <Icon size={28} style={{ color: TEAL, opacity: 0.35, marginBottom: 10 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{title}</div>
      {hint && (
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  MAIN
 * ══════════════════════════════════════════════════════════════════════════ */

export default function FacelessOpsPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("dashboard");

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: MILK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: TEAL }} />
      </div>
    );
  }
  if (!user) return null;

  // Role gate — founder / ceo / faceless_lead / faceless_staff only
  const role = (user as any).hamzuryRole as string | undefined;
  const allowed = role && ALLOWED_ROLES.includes(role);
  if (!allowed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: MILK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: WHITE,
            padding: 24,
            borderRadius: 16,
            border: `1px solid ${DARK}10`,
            textAlign: "center",
          }}
        >
          <Film size={28} style={{ color: TEAL, marginBottom: 10 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: DARK }}>
            Faceless Ops is role-gated
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
            This portal is only open to the Faceless Content unit (Maryam · Habeeba)
            and leadership. Ping the CEO if you need access.
          </div>
        </div>
      </div>
    );
  }

  const NAV = [
    { key: "dashboard", label: "Overview", icon: LayoutDashboard },
    { key: "calendar", label: "Content Calendar", icon: CalendarDays },
    { key: "scripts", label: "Script Library", icon: FileText },
    { key: "voiceovers", label: "Voiceover Queue", icon: Mic },
    { key: "production", label: "Video Production", icon: Video },
    { key: "channels", label: "Channels & Clients", icon: Users },
    { key: "distribution", label: "Distribution", icon: Share2 },
    { key: "templates", label: "Templates", icon: Sparkles },
    { key: "tools", label: "AI Tools & Cost", icon: DollarSign },
  ];

  return (
    <OpsShell
      title="Faceless Ops"
      subtitle="Scalable AI-powered content — without showing faces."
      brand={{ name: "Faceless", accent: TEAL, bg: TEAL }}
      nav={NAV}
      active={active}
      onChange={k => setActive(k as Section)}
      logoSmall="HAMZURY"
      logoLarge="Faceless Ops"
      userName={(user as any).name}
      roleLabel="FACELESS"
      onLogout={logout}
      pageTitle="Faceless Ops — HAMZURY"
    >
      {active === "dashboard" && <DashboardSection onGoto={setActive} />}
      {active === "calendar" && <CalendarSection />}
      {active === "scripts" && <ScriptsSection />}
      {active === "voiceovers" && <VoiceoversSection />}
      {active === "production" && <ProductionSection />}
      {active === "channels" && <ChannelsSection />}
      {active === "distribution" && <DistributionSection />}
      {active === "templates" && <TemplatesSection />}
      {active === "tools" && <ToolsSection />}
    </OpsShell>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  1 · OVERVIEW
 * ══════════════════════════════════════════════════════════════════════════ */

function DashboardSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const contentQ = trpc.faceless.content.list.useQuery();
  const scriptsQ = trpc.faceless.scripts.list.useQuery();
  const vosQ = trpc.faceless.voiceovers.list.useQuery();
  const prodsQ = trpc.faceless.production.list.useQuery();
  const channelsQ = trpc.faceless.channels.list.useQuery();
  const distQ = trpc.faceless.distribution.list.useQuery();
  const toolsQ = trpc.faceless.tools.list.useQuery();

  const content = (contentQ.data ?? []) as ContentItem[];
  const scripts = (scriptsQ.data ?? []) as ScriptItem[];
  const vos = (vosQ.data ?? []) as VoiceoverItem[];
  const prods = (prodsQ.data ?? []) as ProductionItem[];
  const channels = (channelsQ.data ?? []) as ChannelItem[];
  const dist = (distQ.data ?? []) as DistributionItem[];
  const tools = (toolsQ.data ?? []) as ToolItem[];

  const ideas = content.filter(c => c.status === "Idea").length;
  const scripting = content.filter(c => c.status === "Scripting").length;
  const voicingCt = content.filter(c => c.status === "Voiceover").length;
  const editing = content.filter(c => c.status === "Editing").length;
  const scheduled = content.filter(c => c.status === "Scheduled").length;
  const published = content.filter(c => c.status === "Published").length;
  const activeChannels = channels.filter(c => c.status === "Active").length;
  const approved = scripts.filter(s => s.approval === "Approved").length;
  const voQC = vos.filter(v => v.status === "Needs QC" || v.status === "Queued").length;
  const inEdit = prods.filter(p => p.editStatus !== "Exported" && p.editStatus !== "Not Started").length;
  const publishedThisMonth = dist.filter(d => {
    if (d.status !== "Published" || !d.publishedAt) return false;
    const dt = new Date(d.publishedAt);
    const now = new Date();
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  }).length;
  const monthlyCost = tools.reduce((s, t) => s + (t.monthlyNGN || 0), 0);

  // Pipeline phase ordering
  const PHASES: Phase[] = [
    { id: "Idea", label: "Idea" },
    { id: "Scripting", label: "Scripting" },
    { id: "Voiceover", label: "Voiceover" },
    { id: "Editing", label: "Editing" },
    { id: "Scheduled", label: "Scheduled" },
    { id: "Published", label: "Published" },
  ];
  const counts: Record<string, number> = {
    Idea: ideas, Scripting: scripting, Voiceover: voicingCt,
    Editing: editing, Scheduled: scheduled, Published: published,
  };

  // Next 14 days
  const upcoming = content
    .filter(c => c.status !== "Published")
    .map(c => ({ c, days: daysBetween(c.publishDate) }))
    .filter(x => x.days !== null && (x.days as number) >= 0 && (x.days as number) <= 14)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 6);

  return (
    <div>
      <OpsHeader
        title="Faceless Overview"
        sub="Scripts in. Voiceovers rendered. Videos out. Every lane at a glance."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <OpsKpi label="Active Channels" value={activeChannels} accent={TEAL} />
        <OpsKpi label="Scripts Approved" value={approved} accent={GOLD} />
        <OpsKpi label="VO Queue" value={voQC} accent={ORANGE} />
        <OpsKpi label="In Editing" value={inEdit} accent={BLUE} />
        <OpsKpi label="Published (mo)" value={publishedThisMonth} accent={GREEN} />
        <OpsKpi
          label="AI Tools / Month"
          value={fmtNaira(monthlyCost)}
          accent={PURPLE}
          sub={`${tools.length} subs`}
        />
      </div>

      <OpsCard style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          Content Pipeline · {content.length} items
        </div>
        <PhaseTracker
          phases={PHASES}
          currentPhaseId={
            PHASES.slice()
              .reverse()
              .find(p => (counts[p.id] || 0) > 0)?.id
          }
          counts={counts}
          accent={TEAL}
          onSelect={() => onGoto("calendar")}
        />
      </OpsCard>

      <OpsCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Upcoming publish dates (next 14 days)
          </div>
          <Btn tone="ghost" small onClick={() => onGoto("calendar")}>
            Open calendar
          </Btn>
        </div>
        {upcoming.length === 0 ? (
          <EmptyHint icon={CalendarDays} title="Nothing queued for next 14 days" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {upcoming.map(({ c, days }) => {
              const tone: "red" | "orange" | "blue" | "teal" =
                (days ?? 99) < 0 ? "red" : (days ?? 99) <= 3 ? "orange" : (days ?? 99) <= 7 ? "teal" : "blue";
              const label =
                days === 0 ? "TODAY" : (days as number) < 0 ? `${-(days as number)}d overdue` : `${days}d`;
              return (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 12px",
                    background: MILK,
                    borderRadius: 10,
                    border: `1px solid ${DARK}06`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {c.topic}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {c.client} · {c.channel} · {c.format || "—"} · due {fmtDate(c.publishDate)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Pill label={c.status} tone="teal" />
                    <Pill label={label} tone={tone} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </OpsCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  2 · CONTENT CALENDAR (30/60/90-day pipeline)
 * ══════════════════════════════════════════════════════════════════════════ */

function CalendarSection() {
  const utils = trpc.useUtils();
  const itemsQ = trpc.faceless.content.list.useQuery();
  const items = (itemsQ.data ?? []) as ContentItem[];

  const updateMut = trpc.faceless.content.update.useMutation({
    onSuccess: () => { utils.faceless.content.list.invalidate(); },
    onError: e => toast.error(e.message || "Update failed"),
  });
  const removeMut = trpc.faceless.content.remove.useMutation({
    onSuccess: () => {
      utils.faceless.content.list.invalidate();
      toast.success("Content removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [horizon, setHorizon] = useState<"30" | "60" | "90" | "all">("30");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);

  const clients = Array.from(new Set(items.map(i => i.client))).sort();

  const filtered = items.filter(i => {
    if (clientFilter && i.client !== clientFilter) return false;
    if (horizon === "all") return true;
    const d = daysBetween(i.publishDate);
    if (d === null) return false;
    return d >= -7 && d <= Number(horizon);
  });

  // Group by week bucket for readability
  const grouped: Record<string, ContentItem[]> = {};
  for (const it of filtered) {
    const d = daysBetween(it.publishDate);
    let key: string;
    if (d === null) key = "Undated";
    else if (d < 0) key = "Overdue";
    else if (d <= 7) key = "This week";
    else if (d <= 30) key = "This month";
    else if (d <= 60) key = "In 30-60 days";
    else key = "In 60-90 days";
    (grouped[key] ||= []).push(it);
  }

  const order = ["Overdue", "This week", "This month", "In 30-60 days", "In 60-90 days", "Undated"];

  const STATUS_TONE: Record<ContentItem["status"], "muted" | "gold" | "orange" | "blue" | "teal" | "green"> = {
    Idea: "muted",
    Scripting: "gold",
    Voiceover: "orange",
    Editing: "blue",
    Scheduled: "teal",
    Published: "green",
  };

  return (
    <div>
      <OpsHeader
        title="Content Calendar"
        sub="30 / 60 / 90-day pipeline — topic, niche, channel, publish date, status."
        action={
          <Btn onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={14} /> Add content
          </Btn>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {(["30", "60", "90", "all"] as const).map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                backgroundColor: horizon === h ? TEAL : "transparent",
                color: horizon === h ? WHITE : MUTED,
                border: `1px solid ${horizon === h ? TEAL : `${DARK}15`}`,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {h === "all" ? "All" : `Next ${h} days`}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <Select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            style={{ width: "auto", minWidth: 160 }}
          >
            <option value="">All clients</option>
            {clients.map(c => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
      </OpsCard>

      {showForm && (
        <ContentForm
          item={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {order.map(bucket => {
        const list = grouped[bucket];
        if (!list || list.length === 0) return null;
        return (
          <OpsCard key={bucket} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: bucket === "Overdue" ? RED : TEAL,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              {bucket} · {list.length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {list.map(it => {
                const per = PhasePctForStatus(it.status);
                return (
                  <div
                    key={it.id}
                    style={{
                      padding: "10px 12px",
                      background: MILK,
                      borderRadius: 10,
                      border: `1px solid ${DARK}06`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: DARK,
                        }}
                      >
                        {it.topic}
                      </div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        {it.client} · {it.channel} · {it.format || "—"} · {it.niche || "—"}
                      </div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        Publish {fmtDate(it.publishDate)} · {per}% through
                      </div>
                    </div>
                    <Pill label={it.status} tone={STATUS_TONE[it.status]} />
                    <Select
                      value={it.status}
                      onChange={e => {
                        updateMut.mutate({
                          id: it.id,
                          status: e.target.value as ContentItem["status"],
                        });
                      }}
                      style={{ width: "auto", minWidth: 120 }}
                    >
                      <option>Idea</option>
                      <option>Scripting</option>
                      <option>Voiceover</option>
                      <option>Editing</option>
                      <option>Scheduled</option>
                      <option>Published</option>
                    </Select>
                    <Btn
                      tone="ghost"
                      small
                      onClick={() => { setEditing(it); setShowForm(true); }}
                      title="Edit"
                    >
                      <Edit2 size={12} /> Edit
                    </Btn>
                    <Btn
                      tone="danger"
                      small
                      onClick={() => {
                        if (confirm(`Delete "${it.topic}"?`)) {
                          removeMut.mutate({ id: it.id });
                        }
                      }}
                    >
                      <Trash2 size={12} />
                    </Btn>
                  </div>
                );
              })}
            </div>
          </OpsCard>
        );
      })}

      {filtered.length === 0 && (
        <OpsCard>
          <EmptyHint
            icon={CalendarDays}
            title="No content in this horizon"
            hint="Click Add content to start filling the pipeline."
          />
        </OpsCard>
      )}

      <OpsCard style={{ marginTop: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Per-item flow
        </div>
        {filtered.slice(0, 3).map(it => (
          <div key={it.id} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: DARK, marginBottom: 6 }}>
              {it.topic}
            </div>
            <PhaseTracker
              phases={[
                { id: "Idea", label: "Idea" },
                { id: "Scripting", label: "Script" },
                { id: "Voiceover", label: "Voice" },
                { id: "Editing", label: "Edit" },
                { id: "Scheduled", label: "Schedule" },
                { id: "Published", label: "Publish" },
              ]}
              currentPhaseId={it.status}
              accent={TEAL}
              compact
            />
          </div>
        ))}
      </OpsCard>
    </div>
  );
}

function PhasePctForStatus(s: ContentItem["status"]): number {
  return (
    { Idea: 5, Scripting: 20, Voiceover: 45, Editing: 70, Scheduled: 90, Published: 100 }[s] ?? 0
  );
}

function ContentForm({
  item,
  onSaved,
  onCancel,
}: {
  item: ContentItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.content.create.useMutation({
    onSuccess: () => {
      utils.faceless.content.list.invalidate();
      toast.success("Content added");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.content.update.useMutation({
    onSuccess: () => {
      utils.faceless.content.list.invalidate();
      toast.success("Content updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [topic, setTopic] = useState(item?.topic ?? "");
  const [niche, setNiche] = useState(item?.niche ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  const [channel, setChannel] = useState(item?.channel ?? "");
  const [format, setFormat] = useState(item?.format ?? "");
  const [publishDate, setPublishDate] = useState(item?.publishDate ?? "");
  const [status, setStatus] = useState<ContentItem["status"]>(item?.status ?? "Idea");
  const [notes, setNotes] = useState(item?.notes ?? "");

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit content item" : "New content item"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        <div>
          <FieldLabel>Topic *</FieldLabel>
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. 10 Side Hustles for Students" />
        </div>
        <div>
          <FieldLabel>Niche</FieldLabel>
          <Input value={niche ?? ""} onChange={e => setNiche(e.target.value)} placeholder="Finance / Tech / Grooming…" />
        </div>
        <div>
          <FieldLabel>Client *</FieldLabel>
          <Input value={client} onChange={e => setClient(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Channel *</FieldLabel>
          <Input value={channel} onChange={e => setChannel(e.target.value)} placeholder="YouTube / TikTok handle…" />
        </div>
        <div>
          <FieldLabel>Format</FieldLabel>
          <Input value={format ?? ""} onChange={e => setFormat(e.target.value)} placeholder="Long / Short / Reel (duration)" />
        </div>
        <div>
          <FieldLabel>Publish date</FieldLabel>
          <Input type="date" value={publishDate ?? ""} onChange={e => setPublishDate(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <Select value={status} onChange={e => setStatus(e.target.value as ContentItem["status"])}>
            <option>Idea</option>
            <option>Scripting</option>
            <option>Voiceover</option>
            <option>Editing</option>
            <option>Scheduled</option>
            <option>Published</option>
          </Select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Notes</FieldLabel>
          <Textarea value={notes ?? ""} onChange={e => setNotes(e.target.value)} placeholder="Template used, B-roll ideas, hooks to try…" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!topic.trim() || !client.trim() || !channel.trim()) {
              toast.error("Topic, Client and Channel are required.");
              return;
            }
            const payload = {
              topic,
              niche: niche || null,
              client,
              channel,
              format: format || null,
              publishDate: publishDate || null,
              status,
              notes: notes || null,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  3 · SCRIPT LIBRARY
 * ══════════════════════════════════════════════════════════════════════════ */

function ScriptsSection() {
  const utils = trpc.useUtils();
  const scriptsQ = trpc.faceless.scripts.list.useQuery();
  const scripts = (scriptsQ.data ?? []) as ScriptItem[];

  const updateMut = trpc.faceless.scripts.update.useMutation({
    onSuccess: () => { utils.faceless.scripts.list.invalidate(); },
    onError: e => toast.error(e.message || "Update failed"),
  });
  const removeMut = trpc.faceless.scripts.remove.useMutation({
    onSuccess: () => {
      utils.faceless.scripts.list.invalidate();
      toast.success("Script removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [filter, setFilter] = useState<"all" | ScriptItem["approval"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScriptItem | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [useTemplate, setUseTemplate] = useState<string>("");

  const filtered = filter === "all" ? scripts : scripts.filter(s => s.approval === filter);

  const TONE: Record<ScriptItem["approval"], "muted" | "orange" | "green" | "red"> = {
    Draft: "muted",
    "In Review": "orange",
    Approved: "green",
    Revise: "red",
  };

  const prefill = useTemplate ? TEMPLATES.find(t => t.id === useTemplate) : null;

  return (
    <div>
      <OpsHeader
        title="Script Library"
        sub="Hook → Body → CTA with the AI prompt used. Select a template to prefill."
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Select
              value={useTemplate}
              onChange={e => setUseTemplate(e.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="">Start from scratch</option>
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>
                  Use · {t.name}
                </option>
              ))}
            </Select>
            <Btn
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              <Plus size={14} /> New script
            </Btn>
          </div>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "Draft", "In Review", "Approved", "Revise"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                backgroundColor: filter === f ? TEAL : "transparent",
                color: filter === f ? WHITE : MUTED,
                border: `1px solid ${filter === f ? TEAL : `${DARK}15`}`,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </OpsCard>

      {showForm && (
        <ScriptForm
          item={editing}
          prefill={prefill}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            setUseTemplate("");
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
            setUseTemplate("");
          }}
        />
      )}

      {filtered.length === 0 ? (
        <OpsCard>
          <EmptyHint
            icon={FileText}
            title="No scripts yet"
            hint="Write one from scratch, or use one of the 10 templates."
          />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(s => (
            <OpsCard key={s.id} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                    {s.wordCount ? `${s.wordCount} words · ` : ""}
                    Reviewer: {s.reviewer || "—"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <Pill label={s.approval} tone={TONE[s.approval]} />
                  <Select
                    value={s.approval}
                    onChange={e => {
                      updateMut.mutate({
                        id: s.id,
                        approval: e.target.value as ScriptItem["approval"],
                      });
                    }}
                    style={{ width: "auto" }}
                  >
                    <option>Draft</option>
                    <option>In Review</option>
                    <option>Approved</option>
                    <option>Revise</option>
                  </Select>
                  <Btn
                    tone="ghost"
                    small
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  >
                    {expanded === s.id ? "Hide" : "Open"}
                  </Btn>
                  <Btn
                    tone="ghost"
                    small
                    onClick={() => {
                      setEditing(s);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 size={12} />
                  </Btn>
                  <Btn
                    tone="danger"
                    small
                    onClick={() => {
                      if (confirm(`Delete script "${s.title}"?`)) {
                        removeMut.mutate({ id: s.id });
                      }
                    }}
                  >
                    <Trash2 size={12} />
                  </Btn>
                </div>
              </div>

              {expanded === s.id && (
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                  <Block label="HOOK" body={s.hook} accent={TEAL} />
                  <Block label="BODY" body={s.body || ""} accent={GOLD} />
                  <Block label="CTA" body={s.cta || ""} accent={PURPLE} />
                  <Block label="AI PROMPT USED" body={s.aiPrompt || ""} accent={BLUE} mono />
                </div>
              )}
            </OpsCard>
          ))}
        </div>
      )}
    </div>
  );
}

function Block({
  label,
  body,
  accent,
  mono,
}: {
  label: string;
  body: string;
  accent: string;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        background: MILK,
        border: `1px solid ${DARK}08`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: accent,
          letterSpacing: "0.1em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: DARK,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          fontFamily: mono ? "ui-monospace, 'SF Mono', monospace" : "inherit",
        }}
      >
        {body || "—"}
      </div>
    </div>
  );
}

function ScriptForm({
  item,
  prefill,
  onSaved,
  onCancel,
}: {
  item: ScriptItem | null;
  prefill?: Template | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.scripts.create.useMutation({
    onSuccess: () => {
      utils.faceless.scripts.list.invalidate();
      toast.success("Script added");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.scripts.update.useMutation({
    onSuccess: () => {
      utils.faceless.scripts.list.invalidate();
      toast.success("Script updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [title, setTitle] = useState(item?.title ?? (prefill ? `[${prefill.name}] — ` : ""));
  const [hook, setHook] = useState(item?.hook ?? prefill?.hook ?? "");
  const [body, setBody] = useState(item?.body ?? prefill?.structure ?? "");
  const [cta, setCta] = useState(item?.cta ?? "");
  const [aiPrompt, setAiPrompt] = useState(
    item?.aiPrompt ?? (prefill ? `Voice: ${prefill.voicePrompt}\nFormat: ${prefill.format} (${prefill.duration}).` : "")
  );
  const [wordCount, setWordCount] = useState<string>(item?.wordCount ? String(item.wordCount) : "");
  const [approval, setApproval] = useState<ScriptItem["approval"]>(item?.approval ?? "Draft");
  const [reviewer, setReviewer] = useState(item?.reviewer ?? "");

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit script" : prefill ? `New script from "${prefill.name}"` : "New script"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Title *</FieldLabel>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Hook (first 3-5s) *</FieldLabel>
          <Textarea value={hook} onChange={e => setHook(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Body / Structure</FieldLabel>
          <Textarea
            value={body ?? ""}
            onChange={e => setBody(e.target.value)}
            style={{ minHeight: 120 }}
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Call-to-action</FieldLabel>
          <Textarea value={cta ?? ""} onChange={e => setCta(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>AI Prompt used</FieldLabel>
          <Textarea
            value={aiPrompt ?? ""}
            onChange={e => setAiPrompt(e.target.value)}
            style={{ fontFamily: "ui-monospace, 'SF Mono', monospace", fontSize: 12 }}
          />
        </div>
        <div>
          <FieldLabel>Word count</FieldLabel>
          <Input
            type="number"
            value={wordCount}
            onChange={e => setWordCount(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Approval</FieldLabel>
          <Select
            value={approval}
            onChange={e => setApproval(e.target.value as ScriptItem["approval"])}
          >
            <option>Draft</option>
            <option>In Review</option>
            <option>Approved</option>
            <option>Revise</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Reviewer</FieldLabel>
          <Input value={reviewer ?? ""} onChange={e => setReviewer(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!title.trim() || !hook.trim()) {
              toast.error("Title and Hook are required.");
              return;
            }
            const payload = {
              title,
              hook,
              body: body || null,
              cta: cta || null,
              aiPrompt: aiPrompt || null,
              wordCount: wordCount ? Number(wordCount) : null,
              approval,
              reviewer: reviewer || null,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  4 · VOICEOVER QUEUE
 * ══════════════════════════════════════════════════════════════════════════ */

function VoiceoversSection() {
  const utils = trpc.useUtils();
  const itemsQ = trpc.faceless.voiceovers.list.useQuery();
  const scriptsQ = trpc.faceless.scripts.list.useQuery();
  const items = (itemsQ.data ?? []) as VoiceoverItem[];
  const scripts = (scriptsQ.data ?? []) as ScriptItem[];

  const updateMut = trpc.faceless.voiceovers.update.useMutation({
    onSuccess: () => { utils.faceless.voiceovers.list.invalidate(); },
    onError: e => toast.error(e.message || "Update failed"),
  });
  const removeMut = trpc.faceless.voiceovers.remove.useMutation({
    onSuccess: () => {
      utils.faceless.voiceovers.list.invalidate();
      toast.success("Voiceover removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VoiceoverItem | null>(null);

  const PHASES: Phase[] = [
    { id: "Queued", label: "Queued" },
    { id: "Generating", label: "Generating" },
    { id: "Needs QC", label: "Needs QC" },
    { id: "Approved", label: "Approved" },
  ];
  const counts: Record<string, number> = {
    Queued: items.filter(i => i.status === "Queued").length,
    Generating: items.filter(i => i.status === "Generating").length,
    "Needs QC": items.filter(i => i.status === "Needs QC").length,
    Approved: items.filter(i => i.status === "Approved").length,
  };

  return (
    <div>
      <OpsHeader
        title="Voiceover Queue"
        sub="Every script → tool used (ElevenLabs / Murf / Play.ht) → voice → audio file."
        action={
          <Btn onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={14} /> Queue VO
          </Btn>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <PhaseTracker phases={PHASES} counts={counts} accent={TEAL} />
      </OpsCard>

      {showForm && (
        <VoiceoverForm
          item={editing}
          scripts={scripts}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {PHASES.map(ph => {
          const lane = items.filter(i => i.status === ph.id);
          return (
            <OpsCard key={ph.id}>
              <KanbanLane
                items={lane}
                title={ph.label}
                accent={TEAL}
                emptyHint="Drop a VO here."
                renderItem={(v: VoiceoverItem) => (
                  <PhaseCard
                    title={v.scriptTitle}
                    accent={TEAL}
                    meta={`${v.tool} · ${v.voice}${v.speed ? ` · ${v.speed}` : ""}`}
                  >
                    {v.audioPath && (
                      <div
                        style={{
                          fontSize: 11,
                          color: TEAL,
                          marginBottom: 6,
                          fontFamily: "ui-monospace, monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {v.audioPath}
                      </div>
                    )}
                    {v.note && (
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>
                        {v.note}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Select
                        value={v.status}
                        onChange={e => {
                          updateMut.mutate({
                            id: v.id,
                            status: e.target.value as VoiceoverItem["status"],
                          });
                        }}
                        style={{ width: "auto", fontSize: 11, padding: "4px 6px" }}
                      >
                        <option>Queued</option>
                        <option>Generating</option>
                        <option>Needs QC</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                      </Select>
                      <Btn
                        tone="ghost"
                        small
                        onClick={() => { setEditing(v); setShowForm(true); }}
                      >
                        <Edit2 size={11} />
                      </Btn>
                      <Btn
                        tone="danger"
                        small
                        onClick={() => {
                          if (confirm("Remove VO?")) {
                            removeMut.mutate({ id: v.id });
                          }
                        }}
                      >
                        <Trash2 size={11} />
                      </Btn>
                    </div>
                  </PhaseCard>
                )}
              />
            </OpsCard>
          );
        })}
      </div>
    </div>
  );
}

function VoiceoverForm({
  item,
  scripts,
  onSaved,
  onCancel,
}: {
  item: VoiceoverItem | null;
  scripts: ScriptItem[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.voiceovers.create.useMutation({
    onSuccess: () => {
      utils.faceless.voiceovers.list.invalidate();
      toast.success("Voiceover queued");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.voiceovers.update.useMutation({
    onSuccess: () => {
      utils.faceless.voiceovers.list.invalidate();
      toast.success("Voiceover updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [scriptId, setScriptId] = useState<number | null>(item?.scriptId ?? null);
  const [scriptTitle, setScriptTitle] = useState(item?.scriptTitle ?? "");
  const [tool, setTool] = useState<VoiceoverItem["tool"]>(item?.tool ?? "ElevenLabs");
  const [voice, setVoice] = useState(item?.voice ?? "");
  const [speed, setSpeed] = useState(item?.speed ?? "1.0x");
  const [audioPath, setAudioPath] = useState(item?.audioPath ?? "");
  const [status, setStatus] = useState<VoiceoverItem["status"]>(item?.status ?? "Queued");
  const [note, setNote] = useState(item?.note ?? "");

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit voiceover" : "Queue new voiceover"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Link to approved script</FieldLabel>
          <Select
            value={scriptId ? String(scriptId) : ""}
            onChange={e => {
              const v = e.target.value;
              if (!v) {
                setScriptId(null);
                return;
              }
              const id = Number(v);
              const sel = scripts.find(s => s.id === id);
              setScriptId(id);
              if (sel) setScriptTitle(sel.title);
            }}
          >
            <option value="">— Or type a title below —</option>
            {scripts.map(s => (
              <option key={s.id} value={String(s.id)}>
                {s.title} ({s.approval})
              </option>
            ))}
          </Select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Script title *</FieldLabel>
          <Input
            value={scriptTitle}
            onChange={e => setScriptTitle(e.target.value)}
            placeholder="Visible title (if not linked above)"
          />
        </div>
        <div>
          <FieldLabel>Tool</FieldLabel>
          <Select value={tool} onChange={e => setTool(e.target.value as VoiceoverItem["tool"])}>
            <option>ElevenLabs</option>
            <option>Murf</option>
            <option>Play.ht</option>
            <option>Speechify</option>
            <option>Other</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Voice *</FieldLabel>
          <Input
            value={voice}
            onChange={e => setVoice(e.target.value)}
            placeholder="e.g. Rachel · Adam · Habeeba clone"
          />
        </div>
        <div>
          <FieldLabel>Speed / Pitch</FieldLabel>
          <Input
            value={speed ?? ""}
            onChange={e => setSpeed(e.target.value)}
            placeholder="1.0x / 1.1x / pitch+2"
          />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={status}
            onChange={e => setStatus(e.target.value as VoiceoverItem["status"])}
          >
            <option>Queued</option>
            <option>Generating</option>
            <option>Needs QC</option>
            <option>Approved</option>
            <option>Rejected</option>
          </Select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Audio file path / link</FieldLabel>
          <Input
            value={audioPath ?? ""}
            onChange={e => setAudioPath(e.target.value)}
            placeholder="drive://… or https://…"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Note</FieldLabel>
          <Textarea value={note ?? ""} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!scriptTitle.trim() || !voice.trim()) {
              toast.error("Script title and Voice are required.");
              return;
            }
            const payload = {
              scriptTitle,
              scriptId: scriptId ?? null,
              tool,
              voice,
              speed: speed || null,
              audioPath: audioPath || null,
              status,
              note: note || null,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  5 · VIDEO PRODUCTION TRACKER
 * ══════════════════════════════════════════════════════════════════════════ */

const STOCK_SOURCES = [
  "Pexels",
  "Pixabay",
  "Coverr",
  "Videvo",
  "Storyblocks",
  "Artgrid",
  "Epidemic Sound",
  "Artlist",
  "MidJourney",
  "DALL-E",
  "Runway ML",
  "Pictory",
];

function ProductionSection() {
  const utils = trpc.useUtils();
  const itemsQ = trpc.faceless.production.list.useQuery();
  const items = (itemsQ.data ?? []) as ProductionItem[];

  const updateMut = trpc.faceless.production.update.useMutation({
    onSuccess: () => { utils.faceless.production.list.invalidate(); },
    onError: e => toast.error(e.message || "Update failed"),
  });
  const removeMut = trpc.faceless.production.remove.useMutation({
    onSuccess: () => {
      utils.faceless.production.list.invalidate();
      toast.success("Video removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductionItem | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const STATUS_TONE: Record<ProductionItem["editStatus"], "muted" | "orange" | "blue" | "gold" | "green"> = {
    "Not Started": "muted",
    "Rough Cut": "orange",
    Polishing: "blue",
    QC: "gold",
    Exported: "green",
  };

  return (
    <div>
      <OpsHeader
        title="Video Production Tracker"
        sub="Per-video: manual vs AI-assisted, asset sources, export status + checklist."
        action={
          <Btn onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={14} /> New video
          </Btn>
        }
      />

      {showForm && (
        <ProductionForm
          item={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {items.length === 0 ? (
        <OpsCard>
          <EmptyHint
            icon={Video}
            title="No videos in production"
            hint="Add the first one — track manual vs AI-assisted, asset sources, export."
          />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(p => (
            <OpsCard key={p.id} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                    {p.videoTitle}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                    {p.path}
                    {p.duration ? ` · ${p.duration}` : ""}
                    {p.assetSources.length > 0 ? ` · ${p.assetSources.join(", ")}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <Pill
                    label={p.path === "AI-Assisted" ? "AI" : "Manual"}
                    tone={p.path === "AI-Assisted" ? "purple" : "gold"}
                  />
                  <Pill label={p.editStatus} tone={STATUS_TONE[p.editStatus]} />
                  <Select
                    value={p.editStatus}
                    onChange={e => {
                      updateMut.mutate({
                        id: p.id,
                        editStatus: e.target.value as ProductionItem["editStatus"],
                      });
                    }}
                    style={{ width: "auto" }}
                  >
                    <option>Not Started</option>
                    <option>Rough Cut</option>
                    <option>Polishing</option>
                    <option>QC</option>
                    <option>Exported</option>
                  </Select>
                  <Btn
                    tone="ghost"
                    small
                    onClick={() => setOpenId(openId === p.id ? null : p.id)}
                  >
                    {openId === p.id ? "Hide" : "Assets"}
                  </Btn>
                  <Btn
                    tone="ghost"
                    small
                    onClick={() => {
                      setEditing(p);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 size={12} />
                  </Btn>
                  <Btn
                    tone="danger"
                    small
                    onClick={() => {
                      if (confirm(`Delete "${p.videoTitle}"?`)) {
                        removeMut.mutate({ id: p.id });
                      }
                    }}
                  >
                    <Trash2 size={12} />
                  </Btn>
                </div>
              </div>

              {openId === p.id && (
                <div style={{ marginTop: 12 }}>
                  <AssetChecklist
                    accent={TEAL}
                    title="Per-video asset checklist"
                    hint="Tick items as they arrive / are produced."
                    grouped
                    onToggle={id => {
                      const flags = perVideoFlags(p.id);
                      const next = { ...flags, [id]: !flags[id] };
                      persistPerVideoFlags(p.id, next);
                      // Force re-render of checklist via list invalidation.
                      utils.faceless.production.list.invalidate();
                    }}
                    items={perVideoChecklistFor(p)}
                  />
                  {p.exportPath && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: MILK,
                        borderRadius: 9,
                        fontSize: 11,
                        color: MUTED,
                        fontFamily: "ui-monospace, monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      Export: {p.exportPath}
                    </div>
                  )}
                </div>
              )}
            </OpsCard>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Per-video checklist persists a simple flag map under the item id.
 * This is a UX-only ephemeral toggle (which boxes the operator has ticked
 * locally) — kept in localStorage to avoid bloating the DB schema with
 * per-flag rows. The DB tracks the structured `assetsReady` / `voFileReady`
 * booleans; this map is just the granular checklist behind the Assets toggle.
 */
function perVideoFlags(id: number): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`hamzury.v1.faceless.prod-flags.${id}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function persistPerVideoFlags(id: number, flags: Record<string, boolean>) {
  try {
    localStorage.setItem(`hamzury.v1.faceless.prod-flags.${id}`, JSON.stringify(flags));
  } catch {
    /* noop */
  }
}

function perVideoChecklistFor(p: ProductionItem): AssetItem[] {
  const flags = perVideoFlags(p.id);
  const base: Omit<AssetItem, "done">[] = [
    { id: "script", label: "Approved script ready", group: "Copy", owner: "Maryam" },
    { id: "vo", label: "Voiceover file (MP3/WAV)", group: "Audio", owner: "Habeeba" },
    { id: "music", label: "Background music selected (low vol)", group: "Audio" },
    { id: "stock", label: "Stock footage / B-roll pulled", group: "Footage" },
    { id: "overlays", label: "Text overlays + key-point graphics", group: "Graphics" },
    { id: "intro", label: "Hamzury intro/outro added", group: "Graphics" },
    { id: "captions", label: "Captions generated + corrected", group: "Post" },
    { id: "qc", label: "Full-watch quality check (mobile view)", group: "Post", owner: "Maryam" },
    { id: "export", label: "Exported MP4 (1080p) to drive", group: "Delivery", owner: "Habeeba" },
  ];
  if (p.path === "AI-Assisted") {
    base.splice(3, 0, {
      id: "ai-video",
      label: "AI video generated (Pictory / Lumen5 / Runway)",
      group: "Footage",
    });
  }
  return base.map(b => ({ ...b, done: !!flags[b.id] }));
}

function ProductionForm({
  item,
  onSaved,
  onCancel,
}: {
  item: ProductionItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.production.create.useMutation({
    onSuccess: () => {
      utils.faceless.production.list.invalidate();
      toast.success("Video added");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.production.update.useMutation({
    onSuccess: () => {
      utils.faceless.production.list.invalidate();
      toast.success("Video updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [videoTitle, setVideoTitle] = useState(item?.videoTitle ?? "");
  const [path, setPath] = useState<ProductionItem["path"]>(item?.path ?? "Manual");
  const [sources, setSources] = useState<string[]>(item?.assetSources ?? []);
  const [editStatus, setEditStatus] = useState<ProductionItem["editStatus"]>(
    item?.editStatus ?? "Not Started"
  );
  const [exportPath, setExportPath] = useState(item?.exportPath ?? "");
  const [duration, setDuration] = useState(item?.duration ?? "");
  const [assetsReady, setAssetsReady] = useState(item?.assetsReady ?? false);
  const [voFileReady, setVoFileReady] = useState(item?.voFileReady ?? false);

  const busy = createMut.isPending || updateMut.isPending;

  const toggleSource = (s: string) =>
    setSources(v => (v.includes(s) ? v.filter(x => x !== s) : [...v, s]));

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit video" : "New video production"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Video title *</FieldLabel>
          <Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Production path</FieldLabel>
          <Select value={path} onChange={e => setPath(e.target.value as ProductionItem["path"])}>
            <option>Manual</option>
            <option>AI-Assisted</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Duration</FieldLabel>
          <Input value={duration ?? ""} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45s / 6:30" />
        </div>
        <div>
          <FieldLabel>Edit status</FieldLabel>
          <Select
            value={editStatus}
            onChange={e => setEditStatus(e.target.value as ProductionItem["editStatus"])}
          >
            <option>Not Started</option>
            <option>Rough Cut</option>
            <option>Polishing</option>
            <option>QC</option>
            <option>Exported</option>
          </Select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Asset sources</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STOCK_SOURCES.map(s => {
              const on = sources.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSource(s)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: on ? TEAL : "transparent",
                    color: on ? WHITE : MUTED,
                    border: `1px solid ${on ? TEAL : `${DARK}15`}`,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <FieldLabel>Assets ready?</FieldLabel>
          <Select
            value={assetsReady ? "yes" : "no"}
            onChange={e => setAssetsReady(e.target.value === "yes")}
          >
            <option value="no">Not yet</option>
            <option value="yes">All in</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Voiceover file ready?</FieldLabel>
          <Select
            value={voFileReady ? "yes" : "no"}
            onChange={e => setVoFileReady(e.target.value === "yes")}
          >
            <option value="no">Not yet</option>
            <option value="yes">Ready</option>
          </Select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Export path / link</FieldLabel>
          <Input value={exportPath ?? ""} onChange={e => setExportPath(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!videoTitle.trim()) {
              toast.error("Video title is required.");
              return;
            }
            const payload = {
              videoTitle,
              path,
              assetSources: sources,
              editStatus,
              exportPath: exportPath || null,
              duration: duration || null,
              assetsReady,
              voFileReady,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  6 · CHANNELS & CLIENTS REGISTER
 * ══════════════════════════════════════════════════════════════════════════ */

function ChannelsSection() {
  const utils = trpc.useUtils();
  const itemsQ = trpc.faceless.channels.list.useQuery();
  const items = (itemsQ.data ?? []) as ChannelItem[];

  const updateMut = trpc.faceless.channels.update.useMutation({
    onSuccess: () => { utils.faceless.channels.list.invalidate(); },
    onError: e => toast.error(e.message || "Update failed"),
  });
  const removeMut = trpc.faceless.channels.remove.useMutation({
    onSuccess: () => {
      utils.faceless.channels.list.invalidate();
      toast.success("Engagement removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [kindFilter, setKindFilter] = useState<"all" | ChannelItem["kind"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ChannelItem | null>(null);

  const filtered = kindFilter === "all" ? items : items.filter(i => i.kind === kindFilter);
  const totalMRR = items
    .filter(i => i.status === "Active" && i.kind === "Social Package")
    .reduce((s, i) => s + (i.priceNGN || 0), 0);
  const active = items.filter(i => i.status === "Active").length;

  const STATUS_TONE: Record<ChannelItem["status"], "orange" | "green" | "muted" | "blue"> = {
    Onboarding: "orange",
    Active: "green",
    Paused: "muted",
    Completed: "blue",
  };

  return (
    <div>
      <OpsHeader
        title="Channels & Client Register"
        sub="YouTube faceless channels · monthly social packages · bulk video packages."
        action={
          <Btn onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={14} /> New engagement
          </Btn>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <OpsKpi label="Active engagements" value={active} accent={TEAL} />
        <OpsKpi
          label="YT channels"
          value={items.filter(i => i.kind === "YouTube Channel").length}
          accent={RED}
        />
        <OpsKpi
          label="Social packages"
          value={items.filter(i => i.kind === "Social Package").length}
          accent={PURPLE}
        />
        <OpsKpi
          label="Bulk packages"
          value={items.filter(i => i.kind === "Bulk Package").length}
          accent={GOLD}
        />
        <OpsKpi label="Recurring MRR" value={fmtNaira(totalMRR)} accent={GREEN} />
      </div>

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "YouTube Channel", "Social Package", "Bulk Package"] as const).map(k => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              style={{
                padding: "5px 10px",
                borderRadius: 8,
                backgroundColor: kindFilter === k ? TEAL : "transparent",
                color: kindFilter === k ? WHITE : MUTED,
                border: `1px solid ${kindFilter === k ? TEAL : `${DARK}15`}`,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {k === "all" ? "All" : k}
            </button>
          ))}
        </div>
      </OpsCard>

      {showForm && (
        <ChannelForm
          item={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {filtered.length === 0 ? (
        <OpsCard>
          <EmptyHint icon={Users} title="No engagements on this filter" />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(c => {
            const pct = c.monthlyQuota ? Math.min(100, Math.round(((c.delivered || 0) / c.monthlyQuota) * 100)) : null;
            return (
              <OpsCard key={c.id} style={{ padding: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                      {c.client} · {c.kind}
                      {c.niche ? ` · ${c.niche}` : ""}
                      {c.tier ? ` · ${c.tier}` : ""}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {c.priceNGN ? `${fmtNaira(c.priceNGN)} · ` : ""}Since {fmtDate(c.startedAt)}
                    </div>
                    {pct !== null && (
                      <div style={{ marginTop: 8 }}>
                        <div
                          style={{
                            fontSize: 10,
                            color: MUTED,
                            marginBottom: 4,
                          }}
                        >
                          Delivered {c.delivered ?? 0} / {c.monthlyQuota} · {pct}%
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 999,
                            background: `${DARK}10`,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: TEAL,
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <Pill label={c.status} tone={STATUS_TONE[c.status]} />
                    <Select
                      value={c.status}
                      onChange={e => {
                        updateMut.mutate({
                          id: c.id,
                          status: e.target.value as ChannelItem["status"],
                        });
                      }}
                      style={{ width: "auto" }}
                    >
                      <option>Onboarding</option>
                      <option>Active</option>
                      <option>Paused</option>
                      <option>Completed</option>
                    </Select>
                    <Btn
                      tone="ghost"
                      small
                      onClick={() => { setEditing(c); setShowForm(true); }}
                    >
                      <Edit2 size={12} />
                    </Btn>
                    <Btn
                      tone="danger"
                      small
                      onClick={() => {
                        if (confirm(`Remove "${c.name}"?`)) {
                          removeMut.mutate({ id: c.id });
                        }
                      }}
                    >
                      <Trash2 size={12} />
                    </Btn>
                  </div>
                </div>
              </OpsCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChannelForm({
  item,
  onSaved,
  onCancel,
}: {
  item: ChannelItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.channels.create.useMutation({
    onSuccess: () => {
      utils.faceless.channels.list.invalidate();
      toast.success("Engagement added");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.channels.update.useMutation({
    onSuccess: () => {
      utils.faceless.channels.list.invalidate();
      toast.success("Engagement updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [kind, setKind] = useState<ChannelItem["kind"]>(item?.kind ?? "Social Package");
  const [name, setName] = useState(item?.name ?? "");
  const [client, setClient] = useState(item?.client ?? "");
  const [niche, setNiche] = useState(item?.niche ?? "");
  const [tier, setTier] = useState(item?.tier ?? "");
  const [priceNGN, setPriceNGN] = useState<string>(item?.priceNGN ? String(item.priceNGN) : "");
  const [monthlyQuota, setMonthlyQuota] = useState<string>(
    item?.monthlyQuota ? String(item.monthlyQuota) : ""
  );
  const [delivered, setDelivered] = useState<string>(
    item?.delivered ? String(item.delivered) : ""
  );
  const [status, setStatus] = useState<ChannelItem["status"]>(item?.status ?? "Onboarding");
  const [startedAt, setStartedAt] = useState(item?.startedAt ?? "");

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit engagement" : "New engagement"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        <div>
          <FieldLabel>Type</FieldLabel>
          <Select value={kind} onChange={e => setKind(e.target.value as ChannelItem["kind"])}>
            <option>YouTube Channel</option>
            <option>Social Package</option>
            <option>Bulk Package</option>
          </Select>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <FieldLabel>Engagement name *</FieldLabel>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Client *</FieldLabel>
          <Input value={client} onChange={e => setClient(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Niche</FieldLabel>
          <Input value={niche ?? ""} onChange={e => setNiche(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Tier / Scope</FieldLabel>
          <Input
            value={tier ?? ""}
            onChange={e => setTier(e.target.value)}
            placeholder="e.g. 30 posts/mo · 20 videos bulk"
          />
        </div>
        <div>
          <FieldLabel>Price (NGN)</FieldLabel>
          <Input type="number" value={priceNGN} onChange={e => setPriceNGN(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Monthly quota</FieldLabel>
          <Input
            type="number"
            value={monthlyQuota}
            onChange={e => setMonthlyQuota(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Delivered</FieldLabel>
          <Input
            type="number"
            value={delivered}
            onChange={e => setDelivered(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={status}
            onChange={e => setStatus(e.target.value as ChannelItem["status"])}
          >
            <option>Onboarding</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Completed</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Started on</FieldLabel>
          <Input type="date" value={startedAt ?? ""} onChange={e => setStartedAt(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!name.trim() || !client.trim()) {
              toast.error("Name and Client are required.");
              return;
            }
            const payload = {
              kind,
              name,
              client,
              niche: niche || null,
              tier: tier || null,
              priceNGN: priceNGN ? Number(priceNGN) : null,
              monthlyQuota: monthlyQuota ? Number(monthlyQuota) : null,
              delivered: delivered ? Number(delivered) : null,
              status,
              startedAt: startedAt || null,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  7 · DISTRIBUTION
 * ══════════════════════════════════════════════════════════════════════════ */

function DistributionSection() {
  const utils = trpc.useUtils();
  const itemsQ = trpc.faceless.distribution.list.useQuery();
  const items = (itemsQ.data ?? []) as DistributionItem[];

  const updateMut = trpc.faceless.distribution.update.useMutation({
    onSuccess: () => { utils.faceless.distribution.list.invalidate(); },
    onError: e => toast.error(e.message || "Update failed"),
  });
  const removeMut = trpc.faceless.distribution.remove.useMutation({
    onSuccess: () => {
      utils.faceless.distribution.list.invalidate();
      toast.success("Distribution removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [platformFilter, setPlatformFilter] = useState<"all" | DistributionItem["platform"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DistributionItem | null>(null);

  const filtered = platformFilter === "all" ? items : items.filter(i => i.platform === platformFilter);

  const STATUS_TONE: Record<DistributionItem["status"], "teal" | "green" | "muted" | "red"> = {
    Scheduled: "teal",
    Published: "green",
    Draft: "muted",
    Failed: "red",
  };

  const platformIcon: Record<DistributionItem["platform"], React.ElementType> = {
    YouTube: Youtube,
    "YouTube Shorts": Youtube,
    TikTok: Hash,
    "Instagram Reels": ImageIcon,
    Instagram: ImageIcon,
    Facebook: Share2,
  };

  return (
    <div>
      <OpsHeader
        title="Distribution"
        sub="Per-platform publish state — thumbnail, tags, schedule."
        action={
          <Btn onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={14} /> New post
          </Btn>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["all", "YouTube", "YouTube Shorts", "TikTok", "Instagram Reels", "Instagram", "Facebook"] as const).map(
            p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                style={{
                  padding: "5px 10px",
                  borderRadius: 8,
                  backgroundColor: platformFilter === p ? TEAL : "transparent",
                  color: platformFilter === p ? WHITE : MUTED,
                  border: `1px solid ${platformFilter === p ? TEAL : `${DARK}15`}`,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p === "all" ? "All" : p}
              </button>
            )
          )}
        </div>
      </OpsCard>

      {showForm && (
        <DistributionForm
          item={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {filtered.length === 0 ? (
        <OpsCard>
          <EmptyHint
            icon={Share2}
            title="Nothing in distribution"
            hint="Add the first scheduled / published item."
          />
        </OpsCard>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 10,
          }}
        >
          {filtered.map(d => {
            const Ico = platformIcon[d.platform] ?? Share2;
            return (
              <OpsCard key={d.id} style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  {d.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={d.thumbnailUrl}
                      alt=""
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 8,
                        objectFit: "cover",
                        background: `${DARK}08`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 8,
                        background: `${TEAL}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Ico size={28} color={TEAL} />
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Ico size={12} color={MUTED} />
                      <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>
                        {d.platform}
                      </span>
                      <Pill label={d.status} tone={STATUS_TONE[d.status]} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>
                      {d.videoTitle}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {d.channelName || "—"} ·{" "}
                      {d.status === "Published"
                        ? `Published ${fmtDate(d.publishedAt)}`
                        : d.status === "Scheduled"
                        ? `Scheduled ${fmtDate(d.scheduleAt)}`
                        : "—"}
                    </div>
                    {d.tags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {d.tags.slice(0, 5).map(t => (
                          <span
                            key={t}
                            style={{
                              fontSize: 9,
                              color: TEAL,
                              background: `${TEAL}12`,
                              padding: "2px 6px",
                              borderRadius: 999,
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                        {d.tags.length > 5 && (
                          <span style={{ fontSize: 9, color: MUTED }}>
                            +{d.tags.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <Select
                    value={d.status}
                    onChange={e => {
                      const next: { status: DistributionItem["status"]; publishedAt?: string } = {
                        status: e.target.value as DistributionItem["status"],
                      };
                      if (e.target.value === "Published" && !d.publishedAt) {
                        next.publishedAt = new Date().toISOString();
                      }
                      updateMut.mutate({ id: d.id, ...next });
                    }}
                    style={{ width: "auto", fontSize: 11 }}
                  >
                    <option>Draft</option>
                    <option>Scheduled</option>
                    <option>Published</option>
                    <option>Failed</option>
                  </Select>
                  <Btn
                    tone="ghost"
                    small
                    onClick={() => { setEditing(d); setShowForm(true); }}
                  >
                    <Edit2 size={11} /> Edit
                  </Btn>
                  <Btn
                    tone="danger"
                    small
                    onClick={() => {
                      if (confirm(`Remove "${d.videoTitle}" from ${d.platform}?`)) {
                        removeMut.mutate({ id: d.id });
                      }
                    }}
                  >
                    <Trash2 size={11} />
                  </Btn>
                </div>
              </OpsCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DistributionForm({
  item,
  onSaved,
  onCancel,
}: {
  item: DistributionItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.distribution.create.useMutation({
    onSuccess: () => {
      utils.faceless.distribution.list.invalidate();
      toast.success("Distribution added");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.distribution.update.useMutation({
    onSuccess: () => {
      utils.faceless.distribution.list.invalidate();
      toast.success("Distribution updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [videoTitle, setVideoTitle] = useState(item?.videoTitle ?? "");
  const [platform, setPlatform] = useState<DistributionItem["platform"]>(
    item?.platform ?? "YouTube"
  );
  const [channelName, setChannelName] = useState(item?.channelName ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item?.thumbnailUrl ?? "");
  const [tagInput, setTagInput] = useState((item?.tags ?? []).join(", "));
  const [scheduleAt, setScheduleAt] = useState(item?.scheduleAt ?? "");
  const [publishedAt, setPublishedAt] = useState(item?.publishedAt ?? "");
  const [status, setStatus] = useState<DistributionItem["status"]>(item?.status ?? "Draft");

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit distribution" : "Schedule / publish"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Video title *</FieldLabel>
          <Input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Platform</FieldLabel>
          <Select
            value={platform}
            onChange={e => setPlatform(e.target.value as DistributionItem["platform"])}
          >
            <option>YouTube</option>
            <option>YouTube Shorts</option>
            <option>TikTok</option>
            <option>Instagram Reels</option>
            <option>Instagram</option>
            <option>Facebook</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Channel / Handle</FieldLabel>
          <Input value={channelName ?? ""} onChange={e => setChannelName(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Thumbnail URL</FieldLabel>
          <Input value={thumbnailUrl ?? ""} onChange={e => setThumbnailUrl(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Tags (comma separated)</FieldLabel>
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="business, nigeria, entrepreneur"
          />
        </div>
        <div>
          <FieldLabel>Schedule at</FieldLabel>
          <Input
            type="datetime-local"
            value={scheduleAt ?? ""}
            onChange={e => setScheduleAt(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Published at</FieldLabel>
          <Input
            type="datetime-local"
            value={publishedAt ?? ""}
            onChange={e => setPublishedAt(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={status}
            onChange={e => setStatus(e.target.value as DistributionItem["status"])}
          >
            <option>Draft</option>
            <option>Scheduled</option>
            <option>Published</option>
            <option>Failed</option>
          </Select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!videoTitle.trim()) {
              toast.error("Video title is required.");
              return;
            }
            const tags = tagInput
              .split(",")
              .map(t => t.trim())
              .filter(Boolean);
            const payload = {
              videoTitle,
              platform,
              channelName: channelName || null,
              thumbnailUrl: thumbnailUrl || null,
              tags,
              scheduleAt: scheduleAt || null,
              publishedAt: publishedAt || null,
              status,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  8 · TEMPLATES (the 10 ready-to-use, hardcoded)
 * ══════════════════════════════════════════════════════════════════════════ */

function TemplatesSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = selected ? TEMPLATES.find(t => t.id === selected) : null;

  return (
    <div>
      <OpsHeader
        title="Templates"
        sub="10 ready-to-use script templates. Preview below, then start a script from Script Library → Use…"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id === selected ? null : t.id)}
            style={{
              textAlign: "left",
              background: WHITE,
              border: `1px solid ${selected === t.id ? TEAL : `${DARK}10`}`,
              borderLeft: `4px solid ${TEAL}`,
              borderRadius: 12,
              padding: 14,
              cursor: "pointer",
              boxShadow: selected === t.id ? `0 0 0 3px ${TEAL}20` : "none",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: TEAL,
                fontWeight: 700,
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              {t.duration} · {t.format}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 6 }}>
              {t.name}
            </div>
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.4 }}>
              {t.hook}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <OpsCard>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: TEAL,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  marginBottom: 2,
                }}
              >
                TEMPLATE PREVIEW
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>
                {active.name}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                {active.duration} · {active.format}
              </div>
            </div>
            <Btn tone="ghost" onClick={() => setSelected(null)}>
              <X size={14} /> Close
            </Btn>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <Block label="HOOK" body={active.hook} accent={TEAL} />
            <Block label="STRUCTURE" body={active.structure} accent={GOLD} />
            <Block label="VISUALS" body={active.visuals} accent={BLUE} />
            <Block label="AI VOICE PROMPT" body={active.voicePrompt} accent={PURPLE} mono />
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "12px 14px",
              background: MILK,
              borderRadius: 10,
              fontSize: 11,
              color: MUTED,
            }}
          >
            To start a script from this template → go to <b>Script Library</b>, pick
            "Use · {active.name}" from the dropdown, and click <b>New script</b>.
            Title, hook, structure and AI voice prompt pre-fill automatically.
          </div>
        </OpsCard>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  9 · AI TOOLS COST TRACKER
 * ══════════════════════════════════════════════════════════════════════════ */

function ToolsSection() {
  const utils = trpc.useUtils();
  const toolsQ = trpc.faceless.tools.list.useQuery();
  const tools = (toolsQ.data ?? []) as ToolItem[];

  const removeMut = trpc.faceless.tools.remove.useMutation({
    onSuccess: () => {
      utils.faceless.tools.list.invalidate();
      toast.success("Tool removed");
    },
    onError: e => toast.error(e.message || "Delete failed"),
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ToolItem | null>(null);

  const total = tools.reduce((s, t) => s + (t.monthlyNGN || 0), 0);

  const byCat: Record<string, ToolItem[]> = {};
  for (const t of tools) {
    (byCat[t.category] ||= []).push(t);
  }

  const CAT_ACCENT: Record<ToolItem["category"], string> = {
    Voice: TEAL,
    Script: GOLD,
    Video: PURPLE,
    Image: BLUE,
    Stock: ORANGE,
    Music: GREEN,
    Editing: RED,
    Captions: MUTED,
    Scheduler: BLUE,
  };

  return (
    <div>
      <OpsHeader
        title="AI Tools Cost Tracker"
        sub="Every paid tool the unit uses — monthly spend, category, renewals."
        action={
          <Btn onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={14} /> Add tool
          </Btn>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${TEAL}15, ${TEAL}05)`,
            border: `1px solid ${TEAL}30`,
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: TEAL,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Total monthly spend
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK, marginTop: 4 }}>
            {fmtNaira(total)}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
            Across {tools.length} subscription{tools.length === 1 ? "" : "s"}
          </div>
        </div>
        <OpsKpi
          label="Voice stack"
          value={fmtNaira(
            (byCat.Voice || []).reduce((s, t) => s + t.monthlyNGN, 0)
          )}
          accent={TEAL}
          sub={`${(byCat.Voice || []).length} tools`}
        />
        <OpsKpi
          label="Video + AI"
          value={fmtNaira(
            [...(byCat.Video || []), ...(byCat.Editing || [])].reduce(
              (s, t) => s + t.monthlyNGN,
              0
            )
          )}
          accent={PURPLE}
        />
        <OpsKpi
          label="Stock + music"
          value={fmtNaira(
            [...(byCat.Stock || []), ...(byCat.Music || [])].reduce(
              (s, t) => s + t.monthlyNGN,
              0
            )
          )}
          accent={ORANGE}
        />
      </div>

      {showForm && (
        <ToolForm
          item={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {Object.entries(byCat).map(([cat, list]) => {
        const subtotal = list.reduce((s, t) => s + t.monthlyNGN, 0);
        const accent = CAT_ACCENT[cat as ToolItem["category"]] || TEAL;
        return (
          <OpsCard key={cat} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {cat} · {list.length}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>
                {fmtNaira(subtotal)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {list.map(t => (
                <div
                  key={t.id}
                  style={{
                    padding: "10px 12px",
                    background: MILK,
                    borderRadius: 9,
                    border: `1px solid ${DARK}06`,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {t.name}
                    </div>
                    {t.note && (
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        {t.note}
                      </div>
                    )}
                    {t.renewsOn && (
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        Renews {fmtDate(t.renewsOn)}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>
                    {fmtNaira(t.monthlyNGN)}
                  </div>
                  <Btn
                    tone="ghost"
                    small
                    onClick={() => { setEditing(t); setShowForm(true); }}
                  >
                    <Edit2 size={11} />
                  </Btn>
                  <Btn
                    tone="danger"
                    small
                    onClick={() => {
                      if (confirm(`Remove "${t.name}"?`)) {
                        removeMut.mutate({ id: t.id });
                      }
                    }}
                  >
                    <Trash2 size={11} />
                  </Btn>
                </div>
              ))}
            </div>
          </OpsCard>
        );
      })}

      {tools.length === 0 && (
        <OpsCard>
          <EmptyHint icon={DollarSign} title="No tools tracked yet" />
        </OpsCard>
      )}
    </div>
  );
}

function ToolForm({
  item,
  onSaved,
  onCancel,
}: {
  item: ToolItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.faceless.tools.create.useMutation({
    onSuccess: () => {
      utils.faceless.tools.list.invalidate();
      toast.success("Tool added");
      onSaved();
    },
    onError: e => toast.error(e.message || "Save failed"),
  });
  const updateMut = trpc.faceless.tools.update.useMutation({
    onSuccess: () => {
      utils.faceless.tools.list.invalidate();
      toast.success("Tool updated");
      onSaved();
    },
    onError: e => toast.error(e.message || "Update failed"),
  });

  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<ToolItem["category"]>(
    item?.category ?? "Voice"
  );
  const [monthlyNGN, setMonthlyNGN] = useState<string>(
    item?.monthlyNGN ? String(item.monthlyNGN) : ""
  );
  const [seats, setSeats] = useState<string>(item?.seats ? String(item.seats) : "");
  const [renewsOn, setRenewsOn] = useState(item?.renewsOn ?? "");
  const [note, setNote] = useState(item?.note ?? "");

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <OpsCard style={{ marginBottom: 12, borderLeft: `3px solid ${TEAL}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {item ? "Edit tool" : "New tool / subscription"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <FieldLabel>Name *</FieldLabel>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Category</FieldLabel>
          <Select
            value={category}
            onChange={e => setCategory(e.target.value as ToolItem["category"])}
          >
            <option>Voice</option>
            <option>Script</option>
            <option>Video</option>
            <option>Image</option>
            <option>Stock</option>
            <option>Music</option>
            <option>Editing</option>
            <option>Captions</option>
            <option>Scheduler</option>
          </Select>
        </div>
        <div>
          <FieldLabel>Monthly (NGN) *</FieldLabel>
          <Input
            type="number"
            value={monthlyNGN}
            onChange={e => setMonthlyNGN(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Seats</FieldLabel>
          <Input type="number" value={seats} onChange={e => setSeats(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Renews on</FieldLabel>
          <Input type="date" value={renewsOn ?? ""} onChange={e => setRenewsOn(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel>Note</FieldLabel>
          <Input value={note ?? ""} onChange={e => setNote(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn
          disabled={busy}
          onClick={() => {
            if (!name.trim() || !monthlyNGN) {
              toast.error("Name and monthly cost are required.");
              return;
            }
            const payload = {
              name,
              category,
              monthlyNGN: Number(monthlyNGN),
              seats: seats ? Number(seats) : null,
              renewsOn: renewsOn || null,
              note: note || null,
            };
            if (item) updateMut.mutate({ id: item.id, ...payload });
            else createMut.mutate(payload);
          }}
        >
          <Check size={14} /> Save
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          <X size={14} /> Cancel
        </Btn>
      </div>
    </OpsCard>
  );
}

