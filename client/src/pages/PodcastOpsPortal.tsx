import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard, Mic, Users, Library, CalendarDays,
  BarChart3, Headphones, Wallet, Loader2, Plus, Trash2,
  ExternalLink, Clock, CheckCircle2, AlertCircle, Send,
  Music2, FileAudio, Radio, ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import OpsShell, { OpsCard, OpsKpi, OpsHeader } from "@/components/ops/OpsShell";
import PhaseTracker, { KanbanLane, PhaseCard } from "@/components/ops/PhaseTracker";
import AssetChecklist, { type AssetItem } from "@/components/ops/AssetChecklist";
import { trpc } from "@/lib/trpc";
import PendingReportsBanner from "@/components/PendingReportsBanner";

/* ══════════════════════════════════════════════════════════════════════════
 * HAMZURY PODCAST OPS PORTAL
 * Maryam Lalo (Host / Lead) + Habeeba (Producer)
 *
 * Seven tabs:
 *  1. Episode Pipeline      — Kanban across Topic → Research → Script →
 *                              Booked → Recorded → Editing (4 sub-phases)
 *                              → Published. Day counter per episode.
 *  2. Guest Coordination    — Guest intake mirroring Guest_Coordination_Form
 *  3. Show / Client Library — Corporate podcast clients + season price tier
 *  4. Publishing Calendar   — Release dates + platform verification
 *  5. Analytics             — Downloads first 7 days + growth
 *  6. Equipment & Assets    — Mic/interface inventory, raw+mastered paths
 *  7. Pricing & Invoicing   — 4 service tiers + CSO lead handoff
 *
 * Storage:  tRPC `podcastOps.*` (MySQL via Drizzle).
 * Auth:    soft role gate (founder | ceo | podcast_lead | podcast_staff).
 * Brand:   accent #9333EA (purple), milk #FFFAF6.
 *
 * NOTE: ids are now `number` end-to-end. The legacy localStorage shape used
 * string ids; this file flips everything to int. The `assets` field on
 * episodes is parsed/stringified server-side so the client always sees a
 * real AssetItem[].
 * ════════════════════════════════════════════════════════════════════════ */

/* Brand */
const PURPLE   = "#9333EA";
const BG       = "#FFFAF6";
const WHITE    = "#FFFFFF";
const DARK     = "#1A1A1A";
const MUTED    = "#666666";
const GOLD     = "#B48C4C";
const GREEN    = "#22C55E";
const RED      = "#EF4444";
const BLUE     = "#3B82F6";
const AMBER    = "#F59E0B";

const ALLOWED_ROLES = ["founder", "ceo", "podcast_lead", "podcast_staff"];

type Section =
  | "overview"
  | "pipeline"
  | "guests"
  | "shows"
  | "publishing"
  | "analytics"
  | "equipment"
  | "pricing";

/* ─── Episode phases (Kanban) ──────────────────────────────────────────── */
const EPISODE_PHASES = [
  { id: "topic",     label: "Topic Selection" },
  { id: "research",  label: "Research" },
  { id: "script",    label: "Script" },
  { id: "booked",    label: "Guest Booked" },
  { id: "recorded",  label: "Recorded" },
  { id: "assembly",  label: "Edit · Assembly" },
  { id: "cleaning",  label: "Edit · Cleaning" },
  { id: "mixing",    label: "Edit · Mixing" },
  { id: "qc",        label: "Edit · QC" },
  { id: "published", label: "Published" },
] as const;

type PhaseId = (typeof EPISODE_PHASES)[number]["id"];

/* ─── DB row types (returned by tRPC) ──────────────────────────────────── */
type EpisodeRec = {
  id: number;
  epNumber: string;
  title: string;
  topic?: string | null;
  showId?: number | null;
  guestName?: string | null;
  guestId?: number | null;
  host: "Maryam" | "Habeeba" | "Co-host";
  phase: PhaseId;
  recordingDate?: string | null;
  publishDate?: string | null;
  durationTarget?: string | null;
  notes?: string | null;
  /** Already-parsed array (server stringifies to text on storage). */
  assets?: AssetItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

type GuestRec = {
  id: number;
  fullName: string;
  preferredName?: string | null;
  title?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  headshotUrl?: string | null;
  expertise?: string | null;
  talkingPoints?: string | null;
  avoidTopics?: string | null;
  availability?: string | null;
  timezone?: string | null;
  recordingPreference?: "Remote" | "In-Person";
  micSetup?: string | null;
  briefSent?: boolean;
  techCheckDone?: boolean;
  formReceived?: boolean;
  episodeTitle?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ShowRec = {
  id: number;
  clientName: string;
  showName: string;
  tier: "10ep" | "15ep" | "20ep" | "interview" | "edit-only" | "corporate";
  episodesTotal: number;
  episodesDelivered: number;
  priceNGN: number;
  startDate?: string | null;
  releaseCadence?: "Weekly" | "Biweekly" | "Monthly" | "Ad-hoc";
  contact?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type PubRec = {
  id: number;
  episodeId?: number | null;
  epLabel: string;
  showId?: number | null;
  scheduledDate: string;
  apple?: boolean;
  spotify?: boolean;
  google?: boolean;
  amazon?: boolean;
  audiogramReady?: boolean;
  quoteCardsReady?: boolean;
  socialPostScheduled?: boolean;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type EquipmentRec = {
  id: number;
  name: string;
  category: "Microphone" | "Interface" | "Headphones" | "Software" | "Other";
  brand?: string | null;
  assignedTo?: string | null;
  condition?: "Good" | "Needs Repair" | "Retired";
  location?: string | null;
  serial?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type AnalyticsRec = {
  id: number;
  episodeId?: number | null;
  epLabel: string;
  publishedOn: string;
  downloads7d: number;
  downloads30d?: number | null;
  topPlatform?: string | null;
  completionPct?: number | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return String(d); }
}
function daysSince(d: string | Date | null | undefined | number): number | null {
  if (!d) return null;
  try {
    const t = typeof d === "number" ? d : new Date(d).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - t) / (1000 * 60 * 60 * 24)));
  } catch { return null; }
}
function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  try {
    const t = new Date(d).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.round((t - today) / (1000 * 60 * 60 * 24));
  } catch { return null; }
}
function ngn(n: number | undefined | null): string {
  const v = typeof n === "number" ? n : 0;
  return `₦${v.toLocaleString("en-NG")}`;
}
function rawNameConvention(ep: Pick<EpisodeRec, "epNumber" | "topic" | "recordingDate">) {
  const topic = (ep.topic || "Episode").replace(/[^A-Za-z0-9]+/g, "");
  const date  = ep.recordingDate
    ? new Date(ep.recordingDate).toISOString().slice(0, 10)
    : "YYYY-MM-DD";
  return `${ep.epNumber || "EpNum"}_${topic}_${date}_RAW`;
}

/* Default asset checklist for a new episode */
function defaultEpisodeAssets(): AssetItem[] {
  return [
    { id: "raw",    label: "Raw audio captured",        group: "Recording",  done: false, owner: "Habeeba" },
    { id: "guest",  label: "Guest headshot received",   group: "Guest",      done: false, owner: "Maryam" },
    { id: "art",    label: "Episode artwork designed",  group: "Design",     done: false, owner: "Maryam" },
    { id: "intro",  label: "Show intro bumper slotted", group: "Audio",      done: false, owner: "Habeeba" },
    { id: "outro",  label: "Outro + CTA slotted",       group: "Audio",      done: false, owner: "Habeeba" },
    { id: "notes",  label: "Show notes written",        group: "Publishing", done: false, owner: "Maryam" },
    { id: "audio",  label: "Audiogram clip exported",   group: "Promo",      done: false, owner: "Maryam" },
  ];
}

/* ══════════════════════════════════════════════════════════════════════════
 * PAGE
 * ════════════════════════════════════════════════════════════════════════ */
export default function PodcastOpsPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("overview");

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: PURPLE }} />
      </div>
    );
  }
  if (!user) return null;

  const role = (user as any)?.hamzuryRole as string | undefined;
  const roleAllowed = role ? ALLOWED_ROLES.includes(role) : true; // soft gate

  const nav = [
    { key: "overview",   label: "Overview",          icon: LayoutDashboard },
    { key: "pipeline",   label: "Episode Pipeline",  icon: Mic },
    { key: "guests",     label: "Guest Coordination", icon: Users },
    { key: "shows",      label: "Show Library",      icon: Library },
    { key: "publishing", label: "Publishing Calendar", icon: CalendarDays },
    { key: "analytics",  label: "Analytics",         icon: BarChart3 },
    { key: "equipment",  label: "Equipment & Assets", icon: Headphones },
    { key: "pricing",    label: "Pricing & Invoicing", icon: Wallet },
  ];

  return (
    <>
    <PendingReportsBanner />
    <OpsShell
      title="Podcast Ops"
      subtitle="HAMZURY Podcast Unit — production, guests, publishing"
      brand={{ name: "Podcast", accent: GOLD, bg: PURPLE }}
      nav={nav}
      active={active}
      onChange={k => setActive(k as Section)}
      logoSmall="HAMZURY"
      logoLarge="Podcast Ops"
      userName={user.name ?? undefined}
      roleLabel="PODCAST UNIT"
      onLogout={logout}
      pageTitle="Podcast Ops — HAMZURY"
    >
      {!roleAllowed && (
        <div
          style={{
            backgroundColor: `${AMBER}12`,
            border: `1px solid ${AMBER}40`,
            color: "#8A5200",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 12,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={14} />
          Your current role ({role || "unknown"}) is not the Podcast Unit.
          You can browse but will not be able to edit production data once
          backend role enforcement lands.
        </div>
      )}
      {active === "overview"   && <OverviewSection onGoto={setActive} />}
      {active === "pipeline"   && <PipelineSection />}
      {active === "guests"     && <GuestsSection />}
      {active === "shows"      && <ShowsSection />}
      {active === "publishing" && <PublishingSection />}
      {active === "analytics"  && <AnalyticsSection />}
      {active === "equipment"  && <EquipmentSection />}
      {active === "pricing"    && <PricingSection />}
    </OpsShell>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 0) OVERVIEW
 * ════════════════════════════════════════════════════════════════════════ */
function OverviewSection({ onGoto }: { onGoto: (s: Section) => void }) {
  const episodesQ   = trpc.podcastOps.episodes.list.useQuery();
  const guestsQ     = trpc.podcastOps.guests.list.useQuery();
  const showsQ      = trpc.podcastOps.shows.list.useQuery();
  const publishingQ = trpc.podcastOps.publishing.list.useQuery();
  const analyticsQ  = trpc.podcastOps.analytics.list.useQuery();

  const episodes   = (episodesQ.data ?? []) as EpisodeRec[];
  const guests     = (guestsQ.data ?? []) as GuestRec[];
  const shows      = (showsQ.data ?? []) as ShowRec[];
  const publishing = (publishingQ.data ?? []) as PubRec[];
  const analytics  = (analyticsQ.data ?? []) as AnalyticsRec[];

  const inFlight = episodes.filter(e => e.phase !== "published").length;
  const publishedThisMonth = episodes.filter(e => {
    if (e.phase !== "published" || !e.publishDate) return false;
    const d = new Date(e.publishDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const upcomingReleases = publishing
    .filter(p => {
      const du = daysUntil(p.scheduledDate);
      return du !== null && du >= 0 && du <= 14;
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const avgDownloads7d = analytics.length
    ? Math.round(
        analytics.reduce((s, a) => s + (a.downloads7d || 0), 0) / analytics.length,
      )
    : 0;

  const pendingGuestTasks = guests.filter(
    g => !g.briefSent || !g.techCheckDone,
  ).length;

  const unitRevenue = shows.reduce((s, x) => s + (x.priceNGN || 0), 0);

  return (
    <div>
      <OpsHeader
        title="Podcast Unit Overview"
        sub="Maryam Lalo (Host) · Habeeba (Producer) · Built to Last"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <OpsKpi label="Episodes in flight" value={inFlight} sub={`${episodes.length} total`} accent={PURPLE} />
        <OpsKpi label="Published this month" value={publishedThisMonth} sub="Goal: 4/mo" accent={GREEN} />
        <OpsKpi label="Active shows" value={shows.length} sub={ngn(unitRevenue)} accent={GOLD} />
        <OpsKpi label="Avg 7-day downloads" value={avgDownloads7d} accent={BLUE} />
        <OpsKpi label="Guests needing follow-up" value={pendingGuestTasks} accent={AMBER} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        <OpsCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
              Upcoming releases (14 days)
            </div>
            <button
              onClick={() => onGoto("publishing")}
              style={{
                fontSize: 11, color: PURPLE, background: "none",
                border: "none", cursor: "pointer", fontWeight: 600,
              }}
            >
              Open calendar →
            </button>
          </div>
          {upcomingReleases.length === 0 ? (
            <div style={{ fontSize: 12, color: MUTED, padding: "10px 0" }}>
              Nothing scheduled in the next two weeks.
            </div>
          ) : (
            upcomingReleases.slice(0, 5).map(p => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${DARK}08`,
                  fontSize: 12,
                }}
              >
                <span style={{ color: DARK, fontWeight: 500 }}>{p.epLabel}</span>
                <span style={{ color: MUTED }}>{fmtDate(p.scheduledDate)}</span>
              </div>
            ))
          )}
        </OpsCard>

        <OpsCard>
          <div style={{ fontWeight: 700, color: DARK, fontSize: 14, marginBottom: 10 }}>
            Pipeline snapshot
          </div>
          <PhaseTracker
            phases={EPISODE_PHASES.map(p => ({ id: p.id, label: p.label }))}
            currentPhaseId={"assembly"}
            accent={PURPLE}
            compact
          />
          <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>
            Day-level counters live on each episode card in the Pipeline tab.
          </div>
          <button
            onClick={() => onGoto("pipeline")}
            style={{
              marginTop: 10, fontSize: 11, color: PURPLE,
              background: "none", border: "none", cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Open pipeline →
          </button>
        </OpsCard>

        <OpsCard>
          <div style={{ fontWeight: 700, color: DARK, fontSize: 14, marginBottom: 10 }}>
            Quick actions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QuickBtn label="+ New episode"    onClick={() => onGoto("pipeline")}   />
            <QuickBtn label="+ New guest"      onClick={() => onGoto("guests")}     />
            <QuickBtn label="+ New show"       onClick={() => onGoto("shows")}      />
            <QuickBtn label="Log 7-day downloads" onClick={() => onGoto("analytics")} />
            <QuickBtn label="Review pricing tiers" onClick={() => onGoto("pricing")}  />
          </div>
        </OpsCard>
      </div>
    </div>
  );
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: `1px solid ${PURPLE}30`,
        backgroundColor: `${PURPLE}08`,
        color: PURPLE,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1) EPISODE PIPELINE
 * ════════════════════════════════════════════════════════════════════════ */
function PipelineSection() {
  const utils = trpc.useUtils();
  const episodesQ = trpc.podcastOps.episodes.list.useQuery();
  const showsQ    = trpc.podcastOps.shows.list.useQuery();
  const guestsQ   = trpc.podcastOps.guests.list.useQuery();
  const episodes = (episodesQ.data ?? []) as EpisodeRec[];
  const shows    = (showsQ.data ?? []) as ShowRec[];
  const guests   = (guestsQ.data ?? []) as GuestRec[];

  const updateEpMut = trpc.podcastOps.episodes.update.useMutation({
    onSuccess: () => utils.podcastOps.episodes.list.invalidate(),
  });
  const removeEpMut = trpc.podcastOps.episodes.remove.useMutation({
    onSuccess: () => {
      utils.podcastOps.episodes.list.invalidate();
      toast.success("Episode deleted");
    },
  });

  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [focusPhase, setFocusPhase] = useState<PhaseId | null>(null);

  const byPhase = useMemo(() => {
    const map: Record<string, EpisodeRec[]> = {};
    EPISODE_PHASES.forEach(p => { map[p.id] = []; });
    episodes.forEach(e => {
      (map[e.phase] ||= []).push(e);
    });
    return map;
  }, [episodes]);

  const counts = Object.fromEntries(
    EPISODE_PHASES.map(p => [p.id, byPhase[p.id]?.length || 0]),
  ) as Record<string, number>;

  const advance = (ep: EpisodeRec, dir: 1 | -1) => {
    const idx = EPISODE_PHASES.findIndex(p => p.id === ep.phase);
    const next = Math.min(
      EPISODE_PHASES.length - 1,
      Math.max(0, idx + dir),
    );
    updateEpMut.mutate({ id: ep.id, phase: EPISODE_PHASES[next].id });
  };

  const del = (id: number) => {
    if (!confirm("Delete this episode?")) return;
    removeEpMut.mutate({ id });
  };

  const toggleAsset = (ep: EpisodeRec, assetId: string) => {
    const current = ep.assets && ep.assets.length ? ep.assets : defaultEpisodeAssets();
    const next = current.map(a =>
      a.id === assetId ? { ...a, done: !a.done } : a,
    );
    updateEpMut.mutate({ id: ep.id, assets: next });
  };

  const lanesToShow = focusPhase
    ? EPISODE_PHASES.filter(p => p.id === focusPhase)
    : EPISODE_PHASES;

  return (
    <div>
      <OpsHeader
        title="Episode Pipeline"
        sub="Topic → Research → Script → Guest → Record → Edit (4 sub-phases) → Publish"
        action={
          <button
            onClick={() => setShowNew(true)}
            style={{
              backgroundColor: PURPLE, color: WHITE,
              border: "none", borderRadius: 10,
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Plus size={14} /> New episode
          </button>
        }
      />

      <OpsCard style={{ marginBottom: 16 }}>
        <PhaseTracker
          phases={EPISODE_PHASES.map(p => ({ id: p.id, label: p.label }))}
          currentPhaseId={focusPhase ?? undefined}
          selectedId={focusPhase}
          onSelect={(id: string) =>
            setFocusPhase(focusPhase === id ? null : (id as PhaseId))
          }
          counts={counts}
          accent={PURPLE}
          label="Click a stage to filter lanes"
        />
      </OpsCard>

      {showNew && (
        <NewEpisodeForm
          shows={shows}
          guests={guests}
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
          gap: 14,
        }}
      >
        {lanesToShow.map(p => (
          <KanbanLane
            key={p.id}
            title={p.label}
            count={counts[p.id]}
            accent={PURPLE}
            items={byPhase[p.id] || []}
            renderItem={(ep: EpisodeRec) => {
              const show = shows.find(s => s.id === ep.showId);
              const days = daysSince(ep.createdAt);
              const isExpanded = expandedId === ep.id;
              return (
                <div style={{ marginBottom: 8 }}>
                  <PhaseCard
                    title={`${ep.epNumber} · ${ep.title}`}
                    meta={[
                      show?.showName,
                      ep.guestName ? `w/ ${ep.guestName}` : null,
                      typeof days === "number" ? `${days}d in flight` : null,
                    ].filter(Boolean).join(" · ")}
                    accent={PURPLE}
                    onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                  >
                    <div style={{ fontSize: 11, color: MUTED }}>
                      Host: {ep.host}
                      {ep.recordingDate && ` · Rec ${fmtDate(ep.recordingDate)}`}
                    </div>
                  </PhaseCard>
                  {isExpanded && (
                    <div
                      style={{
                        padding: 10,
                        backgroundColor: `${PURPLE}05`,
                        borderLeft: `3px solid ${PURPLE}`,
                        borderRadius: "0 10px 10px 0",
                        marginTop: 4,
                      }}
                    >
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>
                        Raw file name: <code style={{ color: DARK }}>
                          {rawNameConvention(ep)}
                        </code>
                      </div>
                      {ep.notes && (
                        <div style={{ fontSize: 11, color: DARK, marginBottom: 8 }}>
                          Notes: {ep.notes}
                        </div>
                      )}
                      <AssetChecklist
                        items={(ep.assets && ep.assets.length) ? ep.assets : defaultEpisodeAssets()}
                        onToggle={id => toggleAsset(ep, id)}
                        accent={PURPLE}
                        grouped
                        title="Episode assets"
                        hint="Tap items as they land."
                      />
                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        <button
                          onClick={e => { e.stopPropagation(); advance(ep, -1); }}
                          disabled={ep.phase === EPISODE_PHASES[0].id}
                          style={ghostBtn}
                        >
                          ← Back
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); advance(ep, 1); }}
                          disabled={ep.phase === EPISODE_PHASES[EPISODE_PHASES.length - 1].id}
                          style={{
                            ...ghostBtn,
                            backgroundColor: PURPLE,
                            color: WHITE,
                            borderColor: PURPLE,
                          }}
                        >
                          Advance →
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); del(ep.id); }}
                          style={{ ...ghostBtn, color: RED, borderColor: `${RED}40` }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}

type NewEpisodeFormState = {
  epNumber?: string;
  title?: string;
  topic?: string;
  showId?: number;
  guestId?: number;
  host?: EpisodeRec["host"];
  phase?: PhaseId;
  recordingDate?: string;
  publishDate?: string;
  durationTarget?: string;
  notes?: string;
};

function NewEpisodeForm({
  shows,
  guests,
  onClose,
  onSaved,
}: {
  shows: ShowRec[];
  guests: GuestRec[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<NewEpisodeFormState>({
    epNumber: "",
    title: "",
    topic: "",
    host: "Maryam",
    phase: "topic",
    recordingDate: "",
    publishDate: "",
    durationTarget: "45 min",
    notes: "",
  });

  const createMut = trpc.podcastOps.episodes.create.useMutation({
    onSuccess: () => {
      utils.podcastOps.episodes.list.invalidate();
      toast.success("Episode saved");
      onSaved();
    },
  });

  const save = () => {
    if (!form.epNumber || !form.title) {
      toast.error("Episode number and title are required.");
      return;
    }
    const guest = guests.find(g => g.id === form.guestId);
    createMut.mutate({
      epNumber: form.epNumber,
      title: form.title,
      topic: form.topic || undefined,
      showId: form.showId,
      guestId: form.guestId,
      guestName: guest?.preferredName || guest?.fullName || undefined,
      host: form.host || "Maryam",
      phase: form.phase || "topic",
      recordingDate: form.recordingDate || undefined,
      publishDate: form.publishDate || undefined,
      durationTarget: form.durationTarget || undefined,
      notes: form.notes || undefined,
      assets: defaultEpisodeAssets(),
    });
  };

  return (
    <OpsCard style={{ marginBottom: 16, borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
        New episode
      </div>
      <div style={formGrid}>
        <Input label="Episode #" value={form.epNumber}
          onChange={v => setForm({ ...form, epNumber: v })} placeholder="EP-012" />
        <Input label="Title" value={form.title}
          onChange={v => setForm({ ...form, title: v })} placeholder="Scaling with AI" />
        <Input label="Topic" value={form.topic}
          onChange={v => setForm({ ...form, topic: v })} placeholder="AI in Nigerian SMEs" />
        <Select label="Host" value={form.host} onChange={v => setForm({ ...form, host: v as any })}
          options={[
            { value: "Maryam", label: "Maryam (Host)" },
            { value: "Habeeba", label: "Habeeba (Producer)" },
            { value: "Co-host", label: "Co-hosted" },
          ]}
        />
        <Select
          label="Show / Client"
          value={form.showId != null ? String(form.showId) : ""}
          onChange={v => setForm({ ...form, showId: v ? Number(v) : undefined })}
          options={[
            { value: "", label: "— Internal HAMZURY —" },
            ...shows.map(s => ({ value: String(s.id), label: `${s.showName} · ${s.clientName}` })),
          ]}
        />
        <Select
          label="Guest"
          value={form.guestId != null ? String(form.guestId) : ""}
          onChange={v => setForm({ ...form, guestId: v ? Number(v) : undefined })}
          options={[
            { value: "", label: "— No guest / Solo —" },
            ...guests.map(g => ({
              value: String(g.id),
              label: `${g.preferredName || g.fullName}${g.company ? " · " + g.company : ""}`,
            })),
          ]}
        />
        <Input type="date" label="Recording date" value={form.recordingDate}
          onChange={v => setForm({ ...form, recordingDate: v })} />
        <Input type="date" label="Publish date" value={form.publishDate}
          onChange={v => setForm({ ...form, publishDate: v })} />
        <Input label="Duration target" value={form.durationTarget}
          onChange={v => setForm({ ...form, durationTarget: v })} placeholder="45 min" />
        <Select
          label="Starting phase"
          value={form.phase}
          onChange={v => setForm({ ...form, phase: v as PhaseId })}
          options={EPISODE_PHASES.map(p => ({ value: p.id, label: p.label }))}
        />
        <Textarea label="Notes" value={form.notes}
          onChange={v => setForm({ ...form, notes: v })}
          placeholder="Key angles, sponsor reads, watch-outs…" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={save} style={primaryBtn}>Save episode</button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2) GUEST COORDINATION
 * ════════════════════════════════════════════════════════════════════════ */
function GuestsSection() {
  const utils = trpc.useUtils();
  const guestsQ = trpc.podcastOps.guests.list.useQuery();
  const guests = (guestsQ.data ?? []) as GuestRec[];

  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const updateMut = trpc.podcastOps.guests.update.useMutation({
    onSuccess: () => utils.podcastOps.guests.list.invalidate(),
  });
  const removeMut = trpc.podcastOps.guests.remove.useMutation({
    onSuccess: () => {
      utils.podcastOps.guests.list.invalidate();
      toast.success("Guest removed");
    },
  });

  const del = (id: number) => {
    if (!confirm("Remove this guest?")) return;
    removeMut.mutate({ id });
  };

  const toggle = (g: GuestRec, field: "briefSent" | "techCheckDone" | "formReceived") => {
    updateMut.mutate({ id: g.id, [field]: !g[field] } as any);
  };

  const pendingCount = guests.filter(g => !g.briefSent || !g.techCheckDone).length;

  return (
    <div>
      <OpsHeader
        title="Guest Coordination"
        sub={`${guests.length} guests in roster · ${pendingCount} pending prep`}
        action={
          <button onClick={() => setShowNew(true)} style={primaryBtn}>
            <Plus size={14} /> New guest
          </button>
        }
      />

      {showNew && (
        <GuestForm
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}

      {editingId != null && (
        <GuestForm
          initial={guests.find(g => g.id === editingId)}
          onClose={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      )}

      {guests.length === 0 && !showNew && (
        <OpsCard>
          <EmptyState
            icon={Users}
            title="No guests booked yet"
            hint="Add confirmed guests with their bio, availability, and tech setup."
          />
        </OpsCard>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 12,
        }}
      >
        {guests.map(g => (
          <OpsCard key={g.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 42, height: 42, borderRadius: 999,
                  backgroundColor: `${PURPLE}15`, color: PURPLE,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}
              >
                {(g.preferredName || g.fullName).slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
                  {g.preferredName || g.fullName}
                </div>
                <div style={{ fontSize: 11, color: MUTED }}>
                  {[g.title, g.company].filter(Boolean).join(" · ")}
                </div>
                {g.email && (
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {g.email}
                  </div>
                )}
              </div>
            </div>
            {g.bio && (
              <p
                style={{
                  fontSize: 12, color: DARK, marginTop: 10,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {g.bio}
              </p>
            )}
            {g.talkingPoints && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  fontSize: 10, color: MUTED, letterSpacing: "0.06em",
                  textTransform: "uppercase", marginBottom: 2,
                }}>
                  Talking points
                </div>
                <div style={{ fontSize: 11, color: DARK }}>{g.talkingPoints}</div>
              </div>
            )}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10,
            }}>
              <TogglePill
                on={!!g.formReceived} label="Form received"
                onClick={() => toggle(g, "formReceived")}
              />
              <TogglePill
                on={!!g.briefSent} label="Brief sent"
                onClick={() => toggle(g, "briefSent")}
              />
              <TogglePill
                on={!!g.techCheckDone} label="Tech check"
                onClick={() => toggle(g, "techCheckDone")}
              />
            </div>
            {(g.availability || g.recordingPreference) && (
              <div style={{
                fontSize: 11, color: MUTED, marginTop: 8,
                paddingTop: 8, borderTop: `1px solid ${DARK}08`,
              }}>
                {g.availability && <div>📅 {g.availability}</div>}
                {g.recordingPreference && <div>🎙️ {g.recordingPreference}</div>}
                {g.micSetup && <div>🔌 {g.micSetup}</div>}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <button onClick={() => setEditingId(g.id)} style={ghostBtn}>Edit</button>
              <button
                onClick={() => del(g.id)}
                style={{ ...ghostBtn, color: RED, borderColor: `${RED}40` }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </OpsCard>
        ))}
      </div>
    </div>
  );
}

type GuestFormState = Partial<Omit<GuestRec, "id" | "createdAt" | "updatedAt">>;

function GuestForm({
  initial,
  onClose,
  onSaved,
}: {
  initial?: GuestRec;
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<GuestFormState>(
    initial
      ? {
          fullName: initial.fullName,
          preferredName: initial.preferredName,
          title: initial.title,
          company: initial.company,
          email: initial.email,
          phone: initial.phone,
          bio: initial.bio,
          headshotUrl: initial.headshotUrl,
          expertise: initial.expertise,
          talkingPoints: initial.talkingPoints,
          avoidTopics: initial.avoidTopics,
          availability: initial.availability,
          timezone: initial.timezone,
          recordingPreference: initial.recordingPreference,
          micSetup: initial.micSetup,
          briefSent: initial.briefSent,
          techCheckDone: initial.techCheckDone,
          formReceived: initial.formReceived,
        }
      : {
          fullName: "",
          preferredName: "",
          title: "",
          company: "",
          email: "",
          phone: "",
          bio: "",
          headshotUrl: "",
          expertise: "",
          talkingPoints: "",
          avoidTopics: "",
          availability: "",
          timezone: "WAT",
          recordingPreference: "Remote",
          micSetup: "",
          briefSent: false,
          techCheckDone: false,
          formReceived: false,
        },
  );

  const createMut = trpc.podcastOps.guests.create.useMutation({
    onSuccess: () => {
      utils.podcastOps.guests.list.invalidate();
      toast.success("Guest added");
      onSaved();
    },
  });
  const updateMut = trpc.podcastOps.guests.update.useMutation({
    onSuccess: () => {
      utils.podcastOps.guests.list.invalidate();
      toast.success("Guest saved");
      onSaved();
    },
  });

  const save = () => {
    if (!form.fullName) {
      toast.error("Full name is required.");
      return;
    }
    if (initial) {
      updateMut.mutate({ id: initial.id, ...form } as any);
    } else {
      createMut.mutate(form as any);
    }
  };

  return (
    <OpsCard style={{ marginBottom: 16, borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {initial ? "Edit guest" : "New guest"}
      </div>
      <div style={formGrid}>
        <Input label="Full name" value={form.fullName}
          onChange={v => setForm({ ...form, fullName: v })} />
        <Input label="Preferred name (for intro)" value={form.preferredName}
          onChange={v => setForm({ ...form, preferredName: v })} />
        <Input label="Title / Position" value={form.title}
          onChange={v => setForm({ ...form, title: v })} />
        <Input label="Company" value={form.company}
          onChange={v => setForm({ ...form, company: v })} />
        <Input type="email" label="Email" value={form.email}
          onChange={v => setForm({ ...form, email: v })} />
        <Input label="Phone" value={form.phone}
          onChange={v => setForm({ ...form, phone: v })} />
        <Input label="Headshot URL" value={form.headshotUrl}
          onChange={v => setForm({ ...form, headshotUrl: v })}
          placeholder="Google Drive share link" />
        <Input label="Time zone" value={form.timezone}
          onChange={v => setForm({ ...form, timezone: v })} placeholder="WAT" />
        <Textarea label="Bio (50-100 words)" value={form.bio}
          onChange={v => setForm({ ...form, bio: v })} />
        <Textarea label="Areas of expertise" value={form.expertise}
          onChange={v => setForm({ ...form, expertise: v })} />
        <Textarea label="Talking points (what to cover)"
          value={form.talkingPoints}
          onChange={v => setForm({ ...form, talkingPoints: v })} />
        <Textarea label="Topics to avoid" value={form.avoidTopics}
          onChange={v => setForm({ ...form, avoidTopics: v })} />
        <Input label="Availability window" value={form.availability}
          onChange={v => setForm({ ...form, availability: v })}
          placeholder="Weekdays 2-6pm WAT" />
        <Select label="Recording preference" value={form.recordingPreference}
          onChange={v => setForm({ ...form, recordingPreference: v as any })}
          options={[
            { value: "Remote", label: "Remote (Zoom / Riverside)" },
            { value: "In-Person", label: "In-person (Port Harcourt)" },
          ]}
        />
        <Input label="Mic / equipment setup" value={form.micSetup}
          onChange={v => setForm({ ...form, micSetup: v })}
          placeholder="Shure MV7, USB headset, phone mic…" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={save} style={primaryBtn}>
          {initial ? "Save changes" : "Add guest"}
        </button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3) SHOW / CLIENT LIBRARY
 * ════════════════════════════════════════════════════════════════════════ */
const TIER_PRICES: Record<ShowRec["tier"], { label: string; ngn: number; eps: number }> = {
  "10ep":       { label: "Full production · 10 eps", ngn: 500_000,   eps: 10 },
  "15ep":       { label: "Full production · 15 eps", ngn: 750_000,   eps: 15 },
  "20ep":       { label: "Full production · 20 eps", ngn: 1_000_000, eps: 20 },
  interview:    { label: "Interview series (per ep)", ngn: 75_000,    eps: 1  },
  corporate:    { label: "Corporate project",         ngn: 500_000,   eps: 0  },
  "edit-only":  { label: "Editing only (per ep)",     ngn: 30_000,    eps: 1  },
};

function ShowsSection() {
  const utils = trpc.useUtils();
  const showsQ = trpc.podcastOps.shows.list.useQuery();
  const shows = (showsQ.data ?? []) as ShowRec[];

  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const removeMut = trpc.podcastOps.shows.remove.useMutation({
    onSuccess: () => {
      utils.podcastOps.shows.list.invalidate();
      toast.success("Show removed");
    },
  });

  const del = (id: number) => {
    if (!confirm("Remove this show?")) return;
    removeMut.mutate({ id });
  };

  const totalRevenue = shows.reduce((s, x) => s + (x.priceNGN || 0), 0);

  return (
    <div>
      <OpsHeader
        title="Show / Client Library"
        sub={`${shows.length} active shows · ${ngn(totalRevenue)} committed`}
        action={
          <button onClick={() => setShowNew(true)} style={primaryBtn}>
            <Plus size={14} /> New show
          </button>
        }
      />

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 8 }}>
          Corporate podcast price tiers
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
        }}>
          {Object.entries(TIER_PRICES).map(([key, tier]) => (
            <div key={key} style={{
              padding: 12, borderRadius: 10,
              border: `1px solid ${PURPLE}20`,
              backgroundColor: `${PURPLE}05`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: DARK }}>
                {tier.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: PURPLE, marginTop: 4 }}>
                {ngn(tier.ngn)}
              </div>
            </div>
          ))}
        </div>
      </OpsCard>

      {showNew && (
        <ShowForm
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}
      {editingId != null && (
        <ShowForm
          initial={shows.find(s => s.id === editingId)}
          onClose={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      )}

      {shows.length === 0 && !showNew && (
        <OpsCard>
          <EmptyState
            icon={Library}
            title="No shows yet"
            hint="Add corporate clients with their show name, tier, and season targets."
          />
        </OpsCard>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {shows.map(s => {
          const pct = s.episodesTotal
            ? Math.round(((s.episodesDelivered || 0) / s.episodesTotal) * 100)
            : 0;
          const tier = TIER_PRICES[s.tier];
          return (
            <OpsCard key={s.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
                    {s.showName}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    Client: {s.clientName}
                  </div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: PURPLE,
                  backgroundColor: `${PURPLE}15`, padding: "3px 8px",
                  borderRadius: 999, height: "fit-content",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {tier?.label.split(" · ")[0] || s.tier}
                </div>
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: DARK, marginTop: 10,
              }}>
                {ngn(s.priceNGN)}
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>
                {s.episodesDelivered || 0} / {s.episodesTotal} episodes delivered
              </div>
              <div style={{
                height: 6, borderRadius: 999, backgroundColor: `${PURPLE}15`,
                marginTop: 6, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${pct}%`, backgroundColor: PURPLE,
                }} />
              </div>
              {s.releaseCadence && (
                <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>
                  Cadence: {s.releaseCadence}
                  {s.startDate && ` · started ${fmtDate(s.startDate)}`}
                </div>
              )}
              {s.contact && (
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                  Contact: {s.contact}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => setEditingId(s.id)} style={ghostBtn}>Edit</button>
                <button onClick={() => del(s.id)}
                  style={{ ...ghostBtn, color: RED, borderColor: `${RED}40` }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </OpsCard>
          );
        })}
      </div>
    </div>
  );
}

type ShowFormState = Partial<Omit<ShowRec, "id" | "createdAt" | "updatedAt">>;

function ShowForm({
  initial, onClose, onSaved,
}: {
  initial?: ShowRec;
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<ShowFormState>(
    initial
      ? {
          clientName: initial.clientName,
          showName: initial.showName,
          tier: initial.tier,
          episodesTotal: initial.episodesTotal,
          episodesDelivered: initial.episodesDelivered,
          priceNGN: initial.priceNGN,
          startDate: initial.startDate,
          releaseCadence: initial.releaseCadence,
          contact: initial.contact,
          notes: initial.notes,
        }
      : {
          clientName: "",
          showName: "",
          tier: "10ep",
          episodesTotal: TIER_PRICES["10ep"].eps,
          episodesDelivered: 0,
          priceNGN: TIER_PRICES["10ep"].ngn,
          startDate: "",
          releaseCadence: "Weekly",
          contact: "",
          notes: "",
        },
  );

  const createMut = trpc.podcastOps.shows.create.useMutation({
    onSuccess: () => {
      utils.podcastOps.shows.list.invalidate();
      toast.success("Show added");
      onSaved();
    },
  });
  const updateMut = trpc.podcastOps.shows.update.useMutation({
    onSuccess: () => {
      utils.podcastOps.shows.list.invalidate();
      toast.success("Show saved");
      onSaved();
    },
  });

  const setTier = (tier: ShowRec["tier"]) => {
    const preset = TIER_PRICES[tier];
    setForm(f => ({
      ...f, tier,
      episodesTotal: preset.eps || f.episodesTotal || 1,
      priceNGN: preset.ngn,
    }));
  };

  const save = () => {
    if (!form.showName || !form.clientName) {
      toast.error("Show name and client name are required.");
      return;
    }
    if (initial) {
      updateMut.mutate({ id: initial.id, ...form } as any);
    } else {
      createMut.mutate(form as any);
    }
  };

  return (
    <OpsCard style={{ marginBottom: 16, borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
        {initial ? "Edit show" : "New show"}
      </div>
      <div style={formGrid}>
        <Input label="Client name" value={form.clientName}
          onChange={v => setForm({ ...form, clientName: v })} />
        <Input label="Show / podcast name" value={form.showName}
          onChange={v => setForm({ ...form, showName: v })} />
        <Select
          label="Tier"
          value={form.tier}
          onChange={v => setTier(v as ShowRec["tier"])}
          options={Object.entries(TIER_PRICES).map(([key, t]) => ({
            value: key, label: `${t.label} — ${ngn(t.ngn)}`,
          }))}
        />
        <Input type="number" label="Episodes total" value={String(form.episodesTotal || 0)}
          onChange={v => setForm({ ...form, episodesTotal: parseInt(v) || 0 })} />
        <Input type="number" label="Episodes delivered"
          value={String(form.episodesDelivered || 0)}
          onChange={v => setForm({ ...form, episodesDelivered: parseInt(v) || 0 })} />
        <Input type="number" label="Price (₦)" value={String(form.priceNGN || 0)}
          onChange={v => setForm({ ...form, priceNGN: parseInt(v) || 0 })} />
        <Input type="date" label="Start date" value={form.startDate}
          onChange={v => setForm({ ...form, startDate: v })} />
        <Select
          label="Release cadence"
          value={form.releaseCadence}
          onChange={v => setForm({ ...form, releaseCadence: v as any })}
          options={[
            { value: "Weekly", label: "Weekly" },
            { value: "Biweekly", label: "Biweekly" },
            { value: "Monthly", label: "Monthly" },
            { value: "Ad-hoc", label: "Ad-hoc" },
          ]}
        />
        <Input label="Client contact" value={form.contact}
          onChange={v => setForm({ ...form, contact: v })}
          placeholder="Name · email · phone" />
        <Textarea label="Notes" value={form.notes}
          onChange={v => setForm({ ...form, notes: v })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={save} style={primaryBtn}>
          {initial ? "Save changes" : "Add show"}
        </button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4) PUBLISHING CALENDAR
 * ════════════════════════════════════════════════════════════════════════ */
function PublishingSection() {
  const utils = trpc.useUtils();
  const publishingQ = trpc.podcastOps.publishing.list.useQuery();
  const episodesQ   = trpc.podcastOps.episodes.list.useQuery();
  const showsQ      = trpc.podcastOps.shows.list.useQuery();
  const publishing = (publishingQ.data ?? []) as PubRec[];
  const episodes   = (episodesQ.data ?? []) as EpisodeRec[];
  const shows      = (showsQ.data ?? []) as ShowRec[];

  const [showNew, setShowNew] = useState(false);

  const updateMut = trpc.podcastOps.publishing.update.useMutation({
    onSuccess: () => utils.podcastOps.publishing.list.invalidate(),
  });
  const removeMut = trpc.podcastOps.publishing.remove.useMutation({
    onSuccess: () => {
      utils.podcastOps.publishing.list.invalidate();
      toast.success("Removed from calendar");
    },
  });

  const togglePlatform = (
    p: PubRec,
    field: "apple" | "spotify" | "google" | "amazon"
      | "audiogramReady" | "quoteCardsReady" | "socialPostScheduled",
  ) => {
    updateMut.mutate({ id: p.id, [field]: !p[field] } as any);
  };

  const del = (id: number) => {
    if (!confirm("Remove from calendar?")) return;
    removeMut.mutate({ id });
  };

  const sorted = [...publishing].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  );

  const upcoming = sorted.filter(p => {
    const du = daysUntil(p.scheduledDate);
    return du !== null && du >= 0;
  });
  const past = sorted.filter(p => {
    const du = daysUntil(p.scheduledDate);
    return du === null || du < 0;
  }).reverse();

  return (
    <div>
      <OpsHeader
        title="Publishing Calendar"
        sub="Release dates · platform verification · social promo checklist"
        action={
          <button onClick={() => setShowNew(true)} style={primaryBtn}>
            <Plus size={14} /> Schedule episode
          </button>
        }
      />

      {showNew && (
        <PublishingForm
          episodes={episodes}
          shows={shows}
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}

      <div style={{ marginBottom: 20 }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: DARK,
          marginBottom: 10, letterSpacing: -0.1,
        }}>
          Upcoming ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <OpsCard>
            <EmptyState icon={CalendarDays} title="No episodes scheduled"
              hint="Add release dates once an episode clears QC." />
          </OpsCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map(p => (
              <PubRow key={p.id} pub={p} onToggle={togglePlatform} onDelete={del} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: DARK,
            marginBottom: 10, letterSpacing: -0.1,
          }}>
            Published ({past.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {past.slice(0, 10).map(p => (
              <PubRow key={p.id} pub={p} onToggle={togglePlatform} onDelete={del} past />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PubRow({
  pub, onToggle, onDelete, past,
}: {
  pub: PubRec;
  onToggle: (p: PubRec, field: any) => void;
  onDelete: (id: number) => void;
  past?: boolean;
}) {
  const du = daysUntil(pub.scheduledDate);
  const platformCount = [pub.apple, pub.spotify, pub.google, pub.amazon].filter(Boolean).length;
  return (
    <OpsCard style={{ opacity: past ? 0.9 : 1 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        gap: 10, alignItems: "flex-start", flexWrap: "wrap",
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
            {pub.epLabel}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {fmtDate(pub.scheduledDate)}
            {du !== null && du >= 0 && ` · in ${du}d`}
            {du !== null && du < 0 && ` · ${Math.abs(du)}d ago`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: platformCount === 4 ? GREEN : AMBER,
            backgroundColor: platformCount === 4 ? `${GREEN}15` : `${AMBER}15`,
            padding: "3px 8px", borderRadius: 999,
          }}>
            {platformCount}/4 platforms
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <TogglePill on={!!pub.apple}   label="Apple"   onClick={() => onToggle(pub, "apple")}   />
        <TogglePill on={!!pub.spotify} label="Spotify" onClick={() => onToggle(pub, "spotify")} />
        <TogglePill on={!!pub.google}  label="Google"  onClick={() => onToggle(pub, "google")}  />
        <TogglePill on={!!pub.amazon}  label="Amazon"  onClick={() => onToggle(pub, "amazon")}  />
      </div>

      <div style={{
        marginTop: 10, paddingTop: 10,
        borderTop: `1px solid ${DARK}08`,
        display: "flex", flexWrap: "wrap", gap: 6,
      }}>
        <TogglePill on={!!pub.audiogramReady} label="Audiogram"
          onClick={() => onToggle(pub, "audiogramReady")} />
        <TogglePill on={!!pub.quoteCardsReady} label="Quote cards"
          onClick={() => onToggle(pub, "quoteCardsReady")} />
        <TogglePill on={!!pub.socialPostScheduled} label="Social post queued"
          onClick={() => onToggle(pub, "socialPostScheduled")} />
        <button onClick={() => onDelete(pub.id)}
          style={{ ...ghostBtn, marginLeft: "auto",
            color: RED, borderColor: `${RED}40` }}>
          <Trash2 size={11} />
        </button>
      </div>
    </OpsCard>
  );
}

type PubFormState = {
  episodeId?: number;
  epLabel?: string;
  showId?: number;
  scheduledDate?: string;
  apple?: boolean;
  spotify?: boolean;
  google?: boolean;
  amazon?: boolean;
  notes?: string;
};

function PublishingForm({
  episodes, shows, onClose, onSaved,
}: {
  episodes: EpisodeRec[];
  shows: ShowRec[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<PubFormState>({
    epLabel: "",
    scheduledDate: "",
    apple: false, spotify: false, google: false, amazon: false,
  });

  const createMut = trpc.podcastOps.publishing.create.useMutation({
    onSuccess: () => {
      utils.podcastOps.publishing.list.invalidate();
      toast.success("Episode scheduled");
      onSaved();
    },
  });

  const linkToEpisode = (id: number) => {
    const ep = episodes.find(e => e.id === id);
    if (!ep) return;
    setForm(f => ({
      ...f,
      episodeId: id,
      epLabel: `${ep.epNumber} · ${ep.title}`,
      showId: ep.showId ?? undefined,
      scheduledDate: ep.publishDate || f.scheduledDate,
    }));
  };

  const save = () => {
    if (!form.epLabel || !form.scheduledDate) {
      toast.error("Episode label and date are required.");
      return;
    }
    createMut.mutate({
      episodeId: form.episodeId,
      epLabel: form.epLabel,
      showId: form.showId,
      scheduledDate: form.scheduledDate,
      apple: !!form.apple,
      spotify: !!form.spotify,
      google: !!form.google,
      amazon: !!form.amazon,
      notes: form.notes,
    });
  };

  return (
    <OpsCard style={{ marginBottom: 16, borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
        Schedule an episode
      </div>
      <div style={formGrid}>
        <Select
          label="Link episode (optional)"
          value={form.episodeId != null ? String(form.episodeId) : ""}
          onChange={v => v ? linkToEpisode(Number(v)) : setForm({ ...form, episodeId: undefined })}
          options={[
            { value: "", label: "— Freeform (not linked) —" },
            ...episodes.map(e => ({ value: String(e.id), label: `${e.epNumber} · ${e.title}` })),
          ]}
        />
        <Input label="Episode label" value={form.epLabel}
          onChange={v => setForm({ ...form, epLabel: v })}
          placeholder="EP-012 · Fintech in Kano" />
        <Select
          label="Show (optional)"
          value={form.showId != null ? String(form.showId) : ""}
          onChange={v => setForm({ ...form, showId: v ? Number(v) : undefined })}
          options={[
            { value: "", label: "— None —" },
            ...shows.map(s => ({ value: String(s.id), label: s.showName })),
          ]}
        />
        <Input type="date" label="Release date" value={form.scheduledDate}
          onChange={v => setForm({ ...form, scheduledDate: v })} />
        <Textarea label="Notes" value={form.notes}
          onChange={v => setForm({ ...form, notes: v })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={save} style={primaryBtn}>Schedule</button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 5) ANALYTICS
 * ════════════════════════════════════════════════════════════════════════ */
function AnalyticsSection() {
  const utils = trpc.useUtils();
  const analyticsQ = trpc.podcastOps.analytics.list.useQuery();
  const episodesQ  = trpc.podcastOps.episodes.list.useQuery();
  const analytics = (analyticsQ.data ?? []) as AnalyticsRec[];
  const episodes  = (episodesQ.data ?? []) as EpisodeRec[];

  const [showNew, setShowNew] = useState(false);

  const removeMut = trpc.podcastOps.analytics.remove.useMutation({
    onSuccess: () => {
      utils.podcastOps.analytics.list.invalidate();
      toast.success("Analytics row deleted");
    },
  });

  const del = (id: number) => {
    if (!confirm("Delete this analytics row?")) return;
    removeMut.mutate({ id });
  };

  const totalDownloads = analytics.reduce((s, a) => s + (a.downloads7d || 0), 0);
  const avgDownloads   = analytics.length
    ? Math.round(totalDownloads / analytics.length) : 0;
  const bestEp         = analytics.slice().sort((a, b) => b.downloads7d - a.downloads7d)[0];

  // Growth MoM (7d buckets by month)
  const monthlyAgg: Record<string, number> = {};
  analytics.forEach(a => {
    if (!a.publishedOn) return;
    const d = new Date(a.publishedOn);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyAgg[key] = (monthlyAgg[key] || 0) + (a.downloads7d || 0);
  });
  const monthKeys = Object.keys(monthlyAgg).sort();
  const thisMonth = monthKeys[monthKeys.length - 1];
  const lastMonth = monthKeys[monthKeys.length - 2];
  const mom = thisMonth && lastMonth
    ? Math.round(((monthlyAgg[thisMonth] - monthlyAgg[lastMonth]) / monthlyAgg[lastMonth]) * 100)
    : null;

  return (
    <div>
      <OpsHeader
        title="Analytics"
        sub="Per-episode 7-day downloads · growth · client reporting"
        action={
          <button onClick={() => setShowNew(true)} style={primaryBtn}>
            <Plus size={14} /> Log downloads
          </button>
        }
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12, marginBottom: 16,
      }}>
        <OpsKpi label="Episodes tracked" value={analytics.length} accent={PURPLE} />
        <OpsKpi label="Total 7-day downloads" value={totalDownloads.toLocaleString()} accent={BLUE} />
        <OpsKpi label="Average per episode" value={avgDownloads.toLocaleString()} accent={GOLD} />
        <OpsKpi
          label="Top performer"
          value={bestEp ? bestEp.downloads7d.toLocaleString() : "—"}
          sub={bestEp?.epLabel}
          accent={GREEN}
        />
        {mom !== null && (
          <OpsKpi
            label="MoM growth"
            value={`${mom >= 0 ? "+" : ""}${mom}%`}
            accent={mom >= 0 ? GREEN : RED}
          />
        )}
      </div>

      {showNew && (
        <AnalyticsForm
          episodes={episodes}
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}

      {analytics.length === 0 && !showNew && (
        <OpsCard>
          <EmptyState
            icon={BarChart3}
            title="No analytics logged yet"
            hint="Log the first 7-day download count after each episode goes live."
          />
        </OpsCard>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {analytics
          .slice()
          .sort((a, b) =>
            new Date(b.publishedOn).getTime() - new Date(a.publishedOn).getTime(),
          )
          .map(a => (
            <OpsCard key={a.id}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                gap: 10, alignItems: "flex-start", flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
                    {a.epLabel}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    Published {fmtDate(a.publishedOn)}
                    {a.topPlatform && ` · top on ${a.topPlatform}`}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: PURPLE }}>
                    {a.downloads7d.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: MUTED }}>7-day downloads</div>
                </div>
              </div>
              {typeof a.completionPct === "number" && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: MUTED }}>
                    Avg completion: {a.completionPct}%
                  </div>
                  <div style={{
                    height: 4, borderRadius: 999,
                    backgroundColor: `${PURPLE}15`,
                    marginTop: 3, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", width: `${Math.min(100, a.completionPct)}%`,
                      backgroundColor: PURPLE,
                    }} />
                  </div>
                </div>
              )}
              {a.notes && (
                <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>
                  {a.notes}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => del(a.id)}
                  style={{ ...ghostBtn, color: RED, borderColor: `${RED}40` }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </OpsCard>
          ))}
      </div>
    </div>
  );
}

type AnalyticsFormState = {
  episodeId?: number;
  epLabel?: string;
  publishedOn?: string;
  downloads7d?: number;
  downloads30d?: number;
  topPlatform?: string;
  completionPct?: number;
  notes?: string;
};

function AnalyticsForm({
  episodes, onClose, onSaved,
}: {
  episodes: EpisodeRec[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<AnalyticsFormState>({
    epLabel: "",
    publishedOn: "",
    downloads7d: 0,
    downloads30d: 0,
    topPlatform: "Spotify",
    completionPct: 0,
  });

  const createMut = trpc.podcastOps.analytics.create.useMutation({
    onSuccess: () => {
      utils.podcastOps.analytics.list.invalidate();
      toast.success("Analytics logged");
      onSaved();
    },
  });

  const linkEp = (id: number) => {
    const ep = episodes.find(e => e.id === id);
    if (!ep) return;
    setForm(f => ({
      ...f,
      episodeId: id,
      epLabel: `${ep.epNumber} · ${ep.title}`,
      publishedOn: ep.publishDate || f.publishedOn,
    }));
  };

  const save = () => {
    if (!form.epLabel || !form.publishedOn) {
      toast.error("Episode label and publish date are required.");
      return;
    }
    createMut.mutate({
      episodeId: form.episodeId,
      epLabel: form.epLabel,
      publishedOn: form.publishedOn,
      downloads7d: form.downloads7d ?? 0,
      downloads30d: form.downloads30d ?? undefined,
      topPlatform: form.topPlatform,
      completionPct: form.completionPct ?? undefined,
      notes: form.notes,
    });
  };

  return (
    <OpsCard style={{ marginBottom: 16, borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
        Log episode analytics
      </div>
      <div style={formGrid}>
        <Select
          label="Link episode (optional)"
          value={form.episodeId != null ? String(form.episodeId) : ""}
          onChange={v => v ? linkEp(Number(v)) : setForm({ ...form, episodeId: undefined })}
          options={[
            { value: "", label: "— Freeform —" },
            ...episodes.map(e => ({ value: String(e.id), label: `${e.epNumber} · ${e.title}` })),
          ]}
        />
        <Input label="Episode label" value={form.epLabel}
          onChange={v => setForm({ ...form, epLabel: v })} />
        <Input type="date" label="Published on" value={form.publishedOn}
          onChange={v => setForm({ ...form, publishedOn: v })} />
        <Input type="number" label="7-day downloads"
          value={String(form.downloads7d || 0)}
          onChange={v => setForm({ ...form, downloads7d: parseInt(v) || 0 })} />
        <Input type="number" label="30-day downloads"
          value={String(form.downloads30d || 0)}
          onChange={v => setForm({ ...form, downloads30d: parseInt(v) || 0 })} />
        <Select
          label="Top platform"
          value={form.topPlatform}
          onChange={v => setForm({ ...form, topPlatform: v })}
          options={[
            { value: "Spotify", label: "Spotify" },
            { value: "Apple", label: "Apple Podcasts" },
            { value: "Google", label: "Google Podcasts" },
            { value: "Amazon", label: "Amazon Music" },
            { value: "Other", label: "Other" },
          ]}
        />
        <Input type="number" label="Avg completion %"
          value={String(form.completionPct || 0)}
          onChange={v => setForm({ ...form, completionPct: parseInt(v) || 0 })} />
        <Textarea label="Client-facing notes" value={form.notes}
          onChange={v => setForm({ ...form, notes: v })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={save} style={primaryBtn}>Log analytics</button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 6) EQUIPMENT & ASSETS
 * ════════════════════════════════════════════════════════════════════════ */
function EquipmentSection() {
  const utils = trpc.useUtils();
  const equipmentQ = trpc.podcastOps.equipment.list.useQuery();
  const equipment = (equipmentQ.data ?? []) as EquipmentRec[];

  const [showNew, setShowNew] = useState(false);

  const removeMut = trpc.podcastOps.equipment.remove.useMutation({
    onSuccess: () => {
      utils.podcastOps.equipment.list.invalidate();
      toast.success("Item removed");
    },
  });

  const del = (id: number) => {
    if (!confirm("Remove from inventory?")) return;
    removeMut.mutate({ id });
  };

  const byCategory = useMemo(() => {
    const map: Record<string, EquipmentRec[]> = {};
    equipment.forEach(e => {
      (map[e.category] ||= []).push(e);
    });
    return map;
  }, [equipment]);

  const needsRepair = equipment.filter(e => e.condition === "Needs Repair").length;

  return (
    <div>
      <OpsHeader
        title="Equipment & Assets"
        sub={`${equipment.length} items tracked · ${needsRepair} needing repair`}
        action={
          <button onClick={() => setShowNew(true)} style={primaryBtn}>
            <Plus size={14} /> Add item
          </button>
        }
      />

      <OpsCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 10 }}>
          <FileAudio size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
          File naming convention (all raw audio)
        </div>
        <code style={{
          display: "block",
          fontSize: 12, color: PURPLE,
          backgroundColor: `${PURPLE}10`,
          padding: "10px 12px",
          borderRadius: 8,
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
        }}>
          [EpNum]_[Topic]_[Date]_RAW
        </code>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
          Example: <code style={{ color: DARK }}>EP-012_FintechKano_2026-04-22_RAW.wav</code>
        </div>
        <div style={{
          marginTop: 12, padding: 12,
          borderRadius: 10, backgroundColor: `${GREEN}08`,
          border: `1px solid ${GREEN}25`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 4 }}>
            Audio target specs
          </div>
          <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.6 }}>
            Capture: 48 kHz · 24-bit WAV · peaks -12 to -6 dB<br />
            Master: -16 LUFS integrated · true peak -1 dB · MP3 128/192 kbps + WAV archive
          </div>
        </div>
      </OpsCard>

      {showNew && (
        <EquipmentForm
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}

      {equipment.length === 0 && !showNew && (
        <OpsCard>
          <EmptyState
            icon={Headphones}
            title="No equipment yet"
            hint="Log mics, interfaces, headphones, and software licences."
          />
        </OpsCard>
      )}

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <h3 style={{
            fontSize: 12, fontWeight: 700, color: MUTED,
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {cat} · {items.length}
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 10,
          }}>
            {items.map(e => (
              <OpsCard key={e.id}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  gap: 8, alignItems: "flex-start",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: DARK, fontSize: 13 }}>
                      {e.name}
                    </div>
                    {e.brand && (
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {e.brand}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: e.condition === "Good" ? GREEN :
                           e.condition === "Needs Repair" ? AMBER : MUTED,
                    backgroundColor: e.condition === "Good" ? `${GREEN}15` :
                                     e.condition === "Needs Repair" ? `${AMBER}15` : `${MUTED}15`,
                    padding: "2px 6px", borderRadius: 999,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                    {e.condition || "Unknown"}
                  </span>
                </div>
                {e.assignedTo && (
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
                    👤 {e.assignedTo}
                  </div>
                )}
                {e.location && (
                  <div style={{ fontSize: 11, color: MUTED }}>
                    📍 {e.location}
                  </div>
                )}
                {e.serial && (
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
                    SN: {e.serial}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => del(e.id)}
                    style={{ ...ghostBtn, color: RED, borderColor: `${RED}40` }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </OpsCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type EquipmentFormState = Partial<Omit<EquipmentRec, "id" | "createdAt" | "updatedAt">>;

function EquipmentForm({
  onClose, onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<EquipmentFormState>({
    name: "",
    category: "Microphone",
    brand: "",
    assignedTo: "",
    condition: "Good",
    location: "",
    serial: "",
  });

  const createMut = trpc.podcastOps.equipment.create.useMutation({
    onSuccess: () => {
      utils.podcastOps.equipment.list.invalidate();
      toast.success("Equipment item saved");
      onSaved();
    },
  });

  const save = () => {
    if (!form.name) {
      toast.error("Item name is required.");
      return;
    }
    createMut.mutate(form as any);
  };

  return (
    <OpsCard style={{ marginBottom: 16, borderLeft: `4px solid ${PURPLE}` }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 12 }}>
        New equipment item
      </div>
      <div style={formGrid}>
        <Input label="Name" value={form.name}
          onChange={v => setForm({ ...form, name: v })} />
        <Select label="Category" value={form.category}
          onChange={v => setForm({ ...form, category: v as EquipmentRec["category"] })}
          options={[
            { value: "Microphone", label: "Microphone" },
            { value: "Interface", label: "Audio Interface" },
            { value: "Headphones", label: "Headphones" },
            { value: "Software", label: "Software / Licence" },
            { value: "Other", label: "Other" },
          ]}
        />
        <Input label="Brand / Model" value={form.brand}
          onChange={v => setForm({ ...form, brand: v })}
          placeholder="Shure SM7B" />
        <Input label="Assigned to" value={form.assignedTo}
          onChange={v => setForm({ ...form, assignedTo: v })}
          placeholder="Maryam · Habeeba · Studio" />
        <Select label="Condition" value={form.condition}
          onChange={v => setForm({ ...form, condition: v as any })}
          options={[
            { value: "Good", label: "Good" },
            { value: "Needs Repair", label: "Needs Repair" },
            { value: "Retired", label: "Retired" },
          ]}
        />
        <Input label="Location" value={form.location}
          onChange={v => setForm({ ...form, location: v })}
          placeholder="Studio · Locker · Cloud" />
        <Input label="Serial / Licence key" value={form.serial}
          onChange={v => setForm({ ...form, serial: v })} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={save} style={primaryBtn}>Save item</button>
        <button onClick={onClose} style={ghostBtn}>Cancel</button>
      </div>
    </OpsCard>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * 7) PRICING & INVOICING
 * ════════════════════════════════════════════════════════════════════════ */
const SERVICE_TIERS = [
  {
    key: "full",
    title: "Full Podcast Production",
    blurb: "Concept, guest booking, recording, editing, publishing, distribution.",
    priceRange: "₦500k – ₦1M / season (10–20 episodes)",
    icon: Radio,
    bullets: [
      "Weekly/biweekly cadence",
      "Up to 20 episodes per season",
      "Audiogram + social promo pack",
      "Monthly client analytics report",
    ],
  },
  {
    key: "interview",
    title: "Interview Series",
    blurb: "Client provides guests — we record, edit and publish.",
    priceRange: "₦50k – ₦100k / episode",
    icon: Users,
    bullets: [
      "Remote or in-person",
      "Single-episode turnaround: 4 days",
      "Riverside.fm / Zoom high-quality capture",
    ],
  },
  {
    key: "corporate",
    title: "Corporate Podcasts",
    blurb: "Internal comms, leadership messages, culture content.",
    priceRange: "₦300k – ₦1M / project",
    icon: Mic,
    bullets: [
      "Scripted or conversational",
      "Private RSS for staff-only feeds",
      "Optional transcripts + ID3 tagging",
    ],
  },
  {
    key: "edit-only",
    title: "Editing Only",
    blurb: "Client sends raw audio — we clean, mix, master, and export.",
    priceRange: "₦20k – ₦40k / episode",
    icon: Music2,
    bullets: [
      "4-day turnaround",
      "-16 LUFS / -1 dBTP mastering",
      "MP3 + WAV delivery with ID3 tags",
    ],
  },
] as const;

function PricingSection() {
  const showsQ = trpc.podcastOps.shows.list.useQuery();
  const shows = (showsQ.data ?? []) as ShowRec[];

  const committed = shows.reduce((s, x) => s + (x.priceNGN || 0), 0);
  const delivered = shows.reduce(
    (s, x) => s + (x.priceNGN || 0) *
      ((x.episodesDelivered || 0) / Math.max(1, x.episodesTotal || 1)),
    0,
  );

  return (
    <div>
      <OpsHeader
        title="Pricing & Invoicing"
        sub="Service tiers, live contract value, CSO handoff"
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12, marginBottom: 16,
      }}>
        <OpsKpi label="Contracts committed" value={ngn(committed)} accent={PURPLE} />
        <OpsKpi label="Delivered (pro-rata)" value={ngn(Math.round(delivered))} accent={GREEN} />
        <OpsKpi
          label="Outstanding"
          value={ngn(Math.round(committed - delivered))}
          accent={AMBER}
        />
        <OpsKpi label="Active shows" value={shows.length} accent={GOLD} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 14, marginBottom: 20,
      }}>
        {SERVICE_TIERS.map(t => {
          const Icon = t.icon;
          return (
            <OpsCard key={t.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: `${PURPLE}15`, color: PURPLE,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: 11, color: PURPLE, fontWeight: 600, marginTop: 2 }}>
                    {t.priceRange}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                {t.blurb}
              </p>
              <ul style={{
                listStyle: "none", padding: 0, margin: "10px 0 0",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                {t.bullets.map((b, i) => (
                  <li key={i} style={{
                    fontSize: 11, color: DARK,
                    display: "flex", alignItems: "flex-start", gap: 6,
                  }}>
                    <CheckCircle2 size={11} color={PURPLE} style={{ marginTop: 2, flexShrink: 0 }} />
                    {b}
                  </li>
                ))}
              </ul>
            </OpsCard>
          );
        })}
      </div>

      <OpsCard>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Send size={18} color={PURPLE} />
          <div>
            <div style={{ fontWeight: 700, color: DARK, fontSize: 14 }}>
              Lead handoff → CSO
            </div>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
              New podcast enquiries from the public site flow through the CSO
              pipeline. Maryam tags them for the Podcast Unit and we pick up
              after proposal signing. Open the CSO portal to view warm leads
              awaiting pricing/quotes.
            </p>
            <a
              href="/cso"
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 12, color: PURPLE, fontWeight: 600,
                marginTop: 8, textDecoration: "none",
              }}
            >
              Open CSO Portal <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </OpsCard>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * Reusable form primitives (kept local to this file)
 * ════════════════════════════════════════════════════════════════════════ */
const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const primaryBtn: React.CSSProperties = {
  backgroundColor: PURPLE,
  color: WHITE,
  border: "none",
  borderRadius: 10,
  padding: "8px 14px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const ghostBtn: React.CSSProperties = {
  backgroundColor: WHITE,
  color: DARK,
  border: `1px solid ${DARK}20`,
  borderRadius: 10,
  padding: "7px 12px",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
};

function Input({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: MUTED,
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: `1px solid ${DARK}15`,
          fontSize: 13,
          color: DARK,
          backgroundColor: WHITE,
          outline: "none",
        }}
      />
    </label>
  );
}

function Textarea({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{
      gridColumn: "1 / -1",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: MUTED,
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        rows={3}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: `1px solid ${DARK}15`,
          fontSize: 13,
          color: DARK,
          backgroundColor: WHITE,
          outline: "none",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
    </label>
  );
}

function Select<T extends string>({
  label, value, onChange, options,
}: {
  label: string;
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: MUTED,
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <select
        value={value ?? ("" as any)}
        onChange={e => onChange(e.target.value as T)}
        style={{
          padding: "8px 10px",
          borderRadius: 8,
          border: `1px solid ${DARK}15`,
          fontSize: 13,
          color: DARK,
          backgroundColor: WHITE,
          outline: "none",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function TogglePill({
  on, label, onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        backgroundColor: on ? `${PURPLE}15` : "transparent",
        color: on ? PURPLE : MUTED,
        border: `1px solid ${on ? PURPLE + "40" : DARK + "15"}`,
        cursor: "pointer",
      }}
    >
      {on ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      {label}
    </button>
  );
}

function EmptyState({
  icon: Icon, title, hint,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <Icon size={28} style={{ color: PURPLE, opacity: 0.4, marginBottom: 12 }} />
      <p style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{title}</p>
      {hint && <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
// Kept imported for future iconography use — silence unused warnings.
const _iconPool = { ClipboardList };
