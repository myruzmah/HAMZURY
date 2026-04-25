import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import OpsShell, {
  OpsCard,
  OpsKpi,
  OpsHeader,
} from "@/components/ops/OpsShell";
import PhaseTracker, {
  KanbanLane,
  PhaseCard,
  type Phase,
} from "@/components/ops/PhaseTracker";
import AssetChecklist, {
  type AssetItem,
} from "@/components/ops/AssetChecklist";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Folder,
  Calendar as CalendarIcon,
  Cpu,
  FileBarChart,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Globe,
  Smartphone,
  Zap,
  MessageSquare,
  FileText,
  Info,
  ListChecks,
  Bug,
  FolderOpen,
  StickyNote,
  Send,
  Copy,
  Calendar,
  UserCircle,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY SCALAR OPS PORTAL — Dajot + Felix (web & automation team).
 * Daily operations for website, mobile app, and automation delivery.
 * Backed by tRPC `scalar.*` router (MySQL via Drizzle).
 * ══════════════════════════════════════════════════════════════════════ */

// ─── Brand tokens ───────────────────────────────────────────────────────
const ACCENT = "#D4A017";      // Scalar golden yellow
const SIDEBAR_BG = "#D4A017";  // Sidebar background
const SIDEBAR_FG = "#1A1A1A";  // Text on sidebar (dark charcoal because yellow is light)
const BG = "#FFFAF6";          // Milk atmosphere
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GREEN = "#22C55E";
const RED = "#EF4444";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";
const PURPLE = "#8B5CF6";

// Allowed roles for this portal
const ALLOWED_ROLES = new Set([
  "founder",
  "ceo",
  "scalar_lead",
  "scalar_staff",
]);

// ─── Types (DB row shapes returned by tRPC) ─────────────────────────────
type Section =
  | "overview"
  | "projects"
  | "workspace"
  | "calendar"
  | "standards"
  | "reports";

type ServiceType = "Website" | "App" | "Automation";

type ProjectStatus =
  | "Queued"
  | "In Progress"
  | "On Hold"
  | "Completed"
  | "Cancelled";

type Project = {
  id: number;
  ref: string;                 // HMZ-P-XXX (server-generated)
  clientName: string;
  clientContact?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  service: ServiceType;
  status: ProjectStatus;
  week?: number | null;
  phaseId?: string | null;
  lead: "Dajot" | "Felix" | "";
  startDate?: string | null;
  targetDelivery?: string | null;
  actualDelivery?: string | null;
  projectValue?: number | null;
  scope?: string | null;
  goals?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Deliverable = {
  id: number;
  projectId: number;
  label: string;
  description?: string | null;
  dueDate?: string | null;
  done: boolean;
  deliveredAt?: string | null;
  clientApproved: boolean;
  groupName?: string | null;
  owner?: string | null;
  path?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Blocker = {
  id: number;
  projectId: number;
  issue: string;
  impact?: string | null;
  status: "Open" | "Resolved";
  resolution?: string | null;
  resolvedAt?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Comm = {
  id: number;
  projectId: number;
  date: string;
  commType: string;
  summary: string;
  actionItems?: string | null;
  followUpDate?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type Note = {
  id: number;
  projectId: number;
  date: string;
  body: string;
  decidedBy?: string | null;
  impact?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type QaCheck = {
  id: number;
  projectId: number;
  feature: string;
  testCase: string;
  expected?: string | null;
  actual?: string | null;
  status: "Not Tested" | "Pass" | "Fail" | "Fixed";
  bug?: string | null;
  fixedAt?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// ─── Helpers ────────────────────────────────────────────────────────────
function fmtDate(d: string | null | undefined | Date): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
}
function daysFromNow(d: string | null | undefined | Date): number | null {
  if (!d) return null;
  try {
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) return null;
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.round((t - now) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const dow = x.getDay();
  const diff = (dow + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// ─── Service-specific phase lists (baked in) ────────────────────────────
const WEBSITE_PHASES: Phase[] = [
  { id: "discovery", label: "Discovery", hint: "Wk 1" },
  { id: "design", label: "Design", hint: "Wk 2-3" },
  { id: "build", label: "Build", hint: "Wk 4-5" },
  { id: "content", label: "Content", hint: "Wk 6" },
  { id: "qa", label: "QA", hint: "Wk 6" },
  { id: "launch", label: "Launch", hint: "Wk 7" },
  { id: "handover", label: "Handover", hint: "Wk 7" },
];

const APP_PHASES: Phase[] = [
  { id: "discovery", label: "Discovery", hint: "2 wk" },
  { id: "ux", label: "UX", hint: "1 wk" },
  { id: "ui", label: "UI", hint: "2 wk" },
  { id: "sprint1", label: "Build S1", hint: "2 wk" },
  { id: "sprint2", label: "Build S2", hint: "2 wk" },
  { id: "sprint3", label: "Build S3", hint: "2 wk" },
  { id: "testing", label: "Testing", hint: "2 wk" },
  { id: "beta", label: "Beta", hint: "1 wk" },
  { id: "launch", label: "Launch", hint: "1 wk" },
];

const AUTOMATION_PHASES: Phase[] = [
  { id: "discovery", label: "Discovery", hint: "1 wk" },
  { id: "mapping", label: "Mapping", hint: "1 wk" },
  { id: "build", label: "Build", hint: "2-4 wk" },
  { id: "test", label: "Test", hint: "1 wk" },
  { id: "deploy", label: "Deploy", hint: "1 wk" },
  { id: "train", label: "Train", hint: "0.5 wk" },
  { id: "handover", label: "Handover", hint: "0.5 wk" },
];

function phasesForService(s: ServiceType): Phase[] {
  if (s === "Website") return WEBSITE_PHASES;
  if (s === "App") return APP_PHASES;
  return AUTOMATION_PHASES;
}

// ─── Tiny shared primitives for this portal ─────────────────────────────
function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "gold" | "green" | "red" | "blue" | "muted" | "orange" | "purple";
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    gold: { bg: `${ACCENT}20`, fg: "#8A6A10" },
    green: { bg: `${GREEN}18`, fg: "#16A34A" },
    red: { bg: `${RED}15`, fg: RED },
    blue: { bg: `${BLUE}15`, fg: BLUE },
    muted: { bg: "#9CA3AF25", fg: MUTED },
    orange: { bg: `${ORANGE}15`, fg: ORANGE },
    purple: { bg: `${PURPLE}15`, fg: PURPLE },
  };
  const t = map[tone];
  return (
    <span
      style={{
        padding: "3px 9px",
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 600,
        backgroundColor: t.bg,
        color: t.fg,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function serviceIcon(s: ServiceType) {
  if (s === "Website") return Globe;
  if (s === "App") return Smartphone;
  return Zap;
}
function serviceTone(s: ServiceType): "blue" | "purple" | "gold" {
  if (s === "Website") return "blue";
  if (s === "App") return "purple";
  return "gold";
}
function statusTone(s: ProjectStatus): "muted" | "blue" | "orange" | "green" | "red" {
  if (s === "Queued") return "muted";
  if (s === "In Progress") return "blue";
  if (s === "On Hold") return "orange";
  if (s === "Completed") return "green";
  return "red";
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ElementType;
  title: string;
  hint?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px" }}>
      <Icon size={26} style={{ color: ACCENT, opacity: 0.5, marginBottom: 10 }} />
      <p style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{title}</p>
      {hint && <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function InlineButton({
  children,
  onClick,
  tone = "primary",
  icon: Icon,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "primary" | "ghost" | "danger";
  icon?: React.ElementType;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const palette =
    tone === "primary"
      ? { bg: ACCENT, fg: "#1A1A1A", border: ACCENT }
      : tone === "danger"
      ? { bg: "transparent", fg: RED, border: `${RED}40` }
      : { bg: "transparent", fg: DARK, border: `${DARK}20` };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "7px 12px",
        borderRadius: 10,
        backgroundColor: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {Icon && <Icon size={13} />} {children}
    </button>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${DARK}15`,
        fontSize: 12,
        color: DARK,
        backgroundColor: WHITE,
        outline: "none",
      }}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: `1px solid ${DARK}15`,
        fontSize: 12,
        color: DARK,
        backgroundColor: WHITE,
        outline: "none",
        fontFamily: "inherit",
        resize: "vertical",
      }}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <div
        style={{
          fontSize: 10,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * ROOT PORTAL COMPONENT
 * ═══════════════════════════════════════════════════════════════════════ */
export default function ScalarOpsPortal() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("overview");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Role gate — redirect to "/" if role isn't allowed
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const role = (user as any)?.hamzuryRole || "";
    if (!ALLOWED_ROLES.has(role)) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [user, loading]);

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
        <Loader2 size={28} className="animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }
  if (!user) return null;

  const role = (user as any)?.hamzuryRole || "";
  if (!ALLOWED_ROLES.has(role)) {
    return null; // redirect already fired
  }

  const NAV = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "projects", label: "Projects", icon: Folder },
    { key: "workspace", label: "Workspace", icon: FolderOpen },
    { key: "calendar", label: "Calendar", icon: CalendarIcon },
    { key: "standards", label: "Tech Standards", icon: Cpu },
    { key: "reports", label: "Reports", icon: FileBarChart },
  ];

  const openWorkspace = (projectId: number) => {
    setSelectedProjectId(projectId);
    setActive("workspace");
  };

  return (
    <OpsShell
      title="Scalar Ops"
      subtitle="Websites · Apps · Automation — Dajot + Felix"
      brand={{ name: "Scalar", accent: SIDEBAR_FG, bg: SIDEBAR_BG }}
      nav={NAV}
      active={active}
      onChange={k => setActive(k as Section)}
      logoSmall="HAMZURY"
      logoLarge="Scalar Ops"
      userName={user.name || undefined}
      roleLabel="SCALAR"
      onLogout={logout}
      pageTitle="Scalar Ops — HAMZURY"
    >
      {active === "overview" && (
        <OverviewSection onOpenProject={openWorkspace} onGoto={setActive} />
      )}
      {active === "projects" && (
        <ProjectsSection onOpenProject={openWorkspace} />
      )}
      {active === "workspace" && (
        <WorkspaceSection
          projectId={selectedProjectId}
          onBack={() => setActive("projects")}
          onSelect={setSelectedProjectId}
        />
      )}
      {active === "calendar" && <CalendarSection />}
      {active === "standards" && <StandardsSection />}
      {active === "reports" && <ReportsSection />}
    </OpsShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 1 · OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════ */
function OverviewSection({
  onOpenProject,
  onGoto,
}: {
  onOpenProject: (id: number) => void;
  onGoto: (s: Section) => void;
}) {
  const projectsQuery = trpc.scalar.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as Project[];

  const byService = (s: ServiceType) => projects.filter(p => p.service === s);
  const active = (p: Project) => p.status === "In Progress";
  const queued = (p: Project) => p.status === "Queued";
  const completedThisMonth = (p: Project) => {
    if (p.status !== "Completed" || !p.actualDelivery) return false;
    const d = new Date(p.actualDelivery);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const website = byService("Website");
  const app = byService("App");
  const auto = byService("Automation");

  const totalActive = projects.filter(active).length;
  const totalQueued = projects.filter(queued).length;
  const totalCompletedMonth = projects.filter(completedThisMonth).length;

  const upcoming = projects
    .filter(p => p.status !== "Completed" && p.status !== "Cancelled" && p.targetDelivery)
    .sort((a, b) => {
      const da = new Date(a.targetDelivery!).getTime();
      const db = new Date(b.targetDelivery!).getTime();
      return da - db;
    })
    .slice(0, 6);

  const dajotLoad = projects.filter(p => p.lead === "Dajot" && active(p)).length;
  const felixLoad = projects.filter(p => p.lead === "Felix" && active(p)).length;

  return (
    <div>
      <OpsHeader
        title="Scalar Overview"
        sub="Every project Dajot + Felix are shipping. Active · Queued · Completed by service."
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <OpsKpi label="Active projects" value={totalActive} accent={ACCENT} />
        <OpsKpi label="In queue" value={totalQueued} accent={ORANGE} />
        <OpsKpi
          label="Shipped this month"
          value={totalCompletedMonth}
          accent={GREEN}
        />
        <OpsKpi label="Dajot load" value={dajotLoad} sub="active projects" />
        <OpsKpi label="Felix load" value={felixLoad} sub="active projects" />
      </div>

      {/* Split by service type */}
      <OpsHeader title="By service type" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <ServiceTile
          service="Website"
          projects={website}
          onOpen={onOpenProject}
        />
        <ServiceTile service="App" projects={app} onOpen={onOpenProject} />
        <ServiceTile
          service="Automation"
          projects={auto}
          onOpen={onOpenProject}
        />
      </div>

      {/* Lead roster */}
      <OpsHeader title="Lead roster" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <LeadCard
          name="Dajot"
          role="Lead Developer"
          primary="Websites · Automation"
          activeLoad={dajotLoad}
        />
        <LeadCard
          name="Felix"
          role="Developer"
          primary="Apps · E-commerce"
          activeLoad={felixLoad}
        />
      </div>

      {/* Upcoming deadlines */}
      <OpsCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={14} style={{ color: ORANGE }} />
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: DARK,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Upcoming deadlines
            </p>
          </div>
          <button
            onClick={() => onGoto("calendar")}
            style={{
              fontSize: 11,
              color: ACCENT,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            See calendar →
          </button>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No pressing deadlines" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {upcoming.map(p => {
              const days = daysFromNow(p.targetDelivery);
              const tone: "red" | "orange" | "blue" =
                days !== null && days < 0
                  ? "red"
                  : days !== null && days <= 7
                  ? "orange"
                  : "blue";
              const label =
                days === null
                  ? "—"
                  : days < 0
                  ? `${-days}d OVERDUE`
                  : days === 0
                  ? "TODAY"
                  : `${days}d left`;
              return (
                <button
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: BG,
                    borderRadius: 10,
                    border: `1px solid ${DARK}08`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {p.clientName}{" "}
                      <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                        · {p.ref}
                      </span>
                    </p>
                    <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                      {p.service} · {p.lead || "Unassigned"} · Due{" "}
                      {fmtDate(p.targetDelivery)}
                    </p>
                  </div>
                  <StatusPill label={label} tone={tone} />
                </button>
              );
            })}
          </div>
        )}
      </OpsCard>
    </div>
  );
}

function ServiceTile({
  service,
  projects,
  onOpen,
}: {
  service: ServiceType;
  projects: Project[];
  onOpen: (id: number) => void;
}) {
  const Icon = serviceIcon(service);
  const activeCount = projects.filter(p => p.status === "In Progress").length;
  const queuedCount = projects.filter(p => p.status === "Queued").length;
  const doneCount = projects.filter(p => {
    if (p.status !== "Completed" || !p.actualDelivery) return false;
    const d = new Date(p.actualDelivery);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const topActive = projects
    .filter(p => p.status === "In Progress")
    .slice(0, 3);

  return (
    <OpsCard>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: `${ACCENT}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={15} style={{ color: "#8A6A10" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{service}</p>
          <p style={{ fontSize: 10, color: MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {service === "Website"
              ? "7 weeks"
              : service === "App"
              ? "12-16 weeks"
              : "4-8 weeks"}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
        <MiniKpi label="Active" value={activeCount} color={BLUE} />
        <MiniKpi label="Queue" value={queuedCount} color={ORANGE} />
        <MiniKpi label="Shipped (mo)" value={doneCount} color={GREEN} />
      </div>
      {topActive.length === 0 ? (
        <p style={{ fontSize: 11, color: MUTED }}>No active {service.toLowerCase()} projects.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {topActive.map(p => (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              style={{
                textAlign: "left",
                background: "transparent",
                border: "none",
                padding: "6px 0",
                fontSize: 11,
                color: DARK,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.clientName}
                <span style={{ color: MUTED, marginLeft: 6 }}>
                  · Wk {p.week ?? "—"}
                </span>
              </span>
              <ChevronRight size={12} style={{ color: MUTED }} />
            </button>
          ))}
        </div>
      )}
    </OpsCard>
  );
}

function MiniKpi({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div>
      <p style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      <p
        style={{
          fontSize: 9,
          color: MUTED,
          marginTop: 4,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function LeadCard({
  name,
  role,
  primary,
  activeLoad,
}: {
  name: string;
  role: string;
  primary: string;
  activeLoad: number;
}) {
  return (
    <OpsCard>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: `${ACCENT}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserCircle size={22} style={{ color: "#8A6A10" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{name}</p>
          <p style={{ fontSize: 11, color: MUTED }}>{role}</p>
        </div>
      </div>
      <div
        style={{
          marginTop: 12,
          padding: "8px 10px",
          backgroundColor: BG,
          borderRadius: 10,
          border: `1px solid ${DARK}06`,
        }}
      >
        <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Primary focus
        </p>
        <p style={{ fontSize: 12, color: DARK, marginTop: 3 }}>{primary}</p>
      </div>
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 4px 0",
        }}
      >
        <p style={{ fontSize: 11, color: MUTED }}>Active projects</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>{activeLoad}</p>
      </div>
    </OpsCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2 · PROJECTS LIST
 * ═══════════════════════════════════════════════════════════════════════ */
function ProjectsSection({
  onOpenProject,
}: {
  onOpenProject: (id: number) => void;
}) {
  const projectsQuery = trpc.scalar.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as Project[];
  const [search, setSearch] = useState("");
  const [service, setService] = useState<ServiceType | "all">("all");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);

  const filtered = projects.filter(p => {
    if (service !== "all" && p.service !== service) return false;
    if (status !== "all" && p.status !== status) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.clientName?.toLowerCase().includes(s) ||
      p.ref?.toLowerCase().includes(s) ||
      p.lead?.toLowerCase().includes(s) ||
      p.service?.toLowerCase().includes(s)
    );
  });

  return (
    <div>
      <OpsHeader
        title="All Projects"
        sub="Every HMZ-P-XXX project. Click to open its workspace."
        action={
          <InlineButton
            onClick={() => setShowNew(true)}
            icon={Plus}
            tone="primary"
          >
            New project
          </InlineButton>
        }
      />

      <OpsCard style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="search"
            placeholder="Search client, ref, lead, service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: "1 1 240px",
              padding: "8px 10px",
              borderRadius: 10,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              outline: "none",
              color: DARK,
              backgroundColor: WHITE,
            }}
          />
          <select
            value={service}
            onChange={e => setService(e.target.value as ServiceType | "all")}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              color: DARK,
              backgroundColor: WHITE,
            }}
          >
            <option value="all">All services</option>
            <option value="Website">Website</option>
            <option value="App">App</option>
            <option value="Automation">Automation</option>
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as ProjectStatus | "all")}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              color: DARK,
              backgroundColor: WHITE,
            }}
          >
            <option value="all">All statuses</option>
            <option value="Queued">Queued</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </OpsCard>

      {showNew && (
        <NewProjectForm
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
          }}
        />
      )}

      {filtered.length === 0 ? (
        <OpsCard>
          <EmptyState
            icon={Folder}
            title="No projects match"
            hint="Try clearing filters, or click New project to add one."
          />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(p => (
            <ProjectRow key={p.id} project={p} onOpen={() => onOpenProject(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const Icon = serviceIcon(project.service);
  const days = daysFromNow(project.targetDelivery);
  const statusLabel =
    project.status === "In Progress"
      ? `In Progress · Week ${project.week ?? "—"}`
      : project.status;

  const overdue = days !== null && days < 0 && project.status !== "Completed";

  return (
    <button
      onClick={onOpen}
      style={{
        backgroundColor: WHITE,
        borderRadius: 12,
        border: `1px solid ${overdue ? `${RED}40` : `${DARK}08`}`,
        padding: "12px 14px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${ACCENT}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={16} style={{ color: "#8A6A10" }} />
      </div>
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
            {project.clientName}
          </p>
          <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
            {project.ref}
          </span>
          <StatusPill label={project.service} tone={serviceTone(project.service)} />
          <StatusPill label={statusLabel} tone={statusTone(project.status)} />
        </div>
        <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
          Lead {project.lead || "—"} · Start {fmtDate(project.startDate)} · Target{" "}
          {fmtDate(project.targetDelivery)}
          {days !== null && project.status !== "Completed" && (
            <span style={{ color: overdue ? RED : MUTED, marginLeft: 8, fontWeight: 600 }}>
              ({days < 0 ? `${-days}d overdue` : `${days}d left`})
            </span>
          )}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: MUTED, flexShrink: 0 }} />
    </button>
  );
}

function NewProjectForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.scalar.projects.create.useMutation({
    onSuccess: (res) => {
      utils.scalar.projects.list.invalidate();
      toast.success(`Created ${res.ref}`);
      onCreated();
    },
  });

  type FormState = {
    clientName: string;
    clientContact: string;
    clientEmail: string;
    clientPhone: string;
    service: ServiceType;
    status: ProjectStatus;
    week: string;
    lead: "Dajot" | "Felix" | "";
    startDate: string;
    targetDelivery: string;
    scope: string;
    goals: string;
    projectValue: string;
  };

  const [form, setForm] = useState<FormState>({
    clientName: "",
    clientContact: "",
    clientEmail: "",
    clientPhone: "",
    service: "Website",
    status: "Queued",
    week: "",
    lead: "Dajot",
    startDate: todayISO(),
    targetDelivery: "",
    scope: "",
    goals: "",
    projectValue: "",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.clientName) {
      toast.error("Client name is required");
      return;
    }
    createMut.mutate({
      clientName: form.clientName,
      clientContact: form.clientContact || null,
      clientEmail: form.clientEmail || null,
      clientPhone: form.clientPhone || null,
      service: form.service,
      status: form.status,
      week: form.week === "" ? null : Number(form.week),
      lead: form.lead,
      startDate: form.startDate || null,
      targetDelivery: form.targetDelivery || null,
      scope: form.scope || null,
      goals: form.goals || null,
      projectValue:
        form.projectValue === "" ? null : Number(form.projectValue),
    });
  };

  return (
    <OpsCard style={{ marginBottom: 12, borderColor: `${ACCENT}40` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>New project</p>
        <InlineButton onClick={onClose} tone="ghost">
          Cancel
        </InlineButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <Field label="Client name">
          <TextInput
            value={form.clientName}
            onChange={v => set("clientName", v)}
            placeholder="e.g. TilzSpa"
          />
        </Field>
        <Field label="Service">
          <select
            value={form.service}
            onChange={e => set("service", e.target.value as ServiceType)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              color: DARK,
              backgroundColor: WHITE,
            }}
          >
            <option>Website</option>
            <option>App</option>
            <option>Automation</option>
          </select>
        </Field>
        <Field label="Lead">
          <select
            value={form.lead}
            onChange={e => set("lead", e.target.value as "Dajot" | "Felix" | "")}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              color: DARK,
              backgroundColor: WHITE,
            }}
          >
            <option>Dajot</option>
            <option>Felix</option>
            <option value="">Unassigned</option>
          </select>
        </Field>
        <Field label="Start date">
          <TextInput
            type="date"
            value={form.startDate}
            onChange={v => set("startDate", v)}
          />
        </Field>
        <Field label="Target delivery">
          <TextInput
            type="date"
            value={form.targetDelivery}
            onChange={v => set("targetDelivery", v)}
          />
        </Field>
        <Field label="Client contact">
          <TextInput
            value={form.clientContact}
            onChange={v => set("clientContact", v)}
            placeholder="Name"
          />
        </Field>
        <Field label="Client phone">
          <TextInput
            value={form.clientPhone}
            onChange={v => set("clientPhone", v)}
          />
        </Field>
      </div>

      <Field label="Scope">
        <TextArea
          value={form.scope}
          onChange={v => set("scope", v)}
          placeholder="What are we building?"
        />
      </Field>
      <Field label="Goals">
        <TextArea
          value={form.goals}
          onChange={v => set("goals", v)}
          placeholder="What outcomes does the client want?"
        />
      </Field>

      <div style={{ marginTop: 8 }}>
        <InlineButton
          onClick={submit}
          icon={Plus}
          tone="primary"
          disabled={createMut.isPending}
        >
          Create project
        </InlineButton>
      </div>
    </OpsCard>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3 · PROJECT WORKSPACE (8 sub-tabs)
 * ═══════════════════════════════════════════════════════════════════════ */
type SubTab =
  | "info"
  | "timeline"
  | "deliverables"
  | "comms"
  | "blockers"
  | "qa"
  | "files"
  | "notes";

const SUB_TABS: Array<{ key: SubTab; label: string; icon: React.ElementType }> = [
  { key: "info", label: "Info", icon: Info },
  { key: "timeline", label: "Timeline", icon: ListChecks },
  { key: "deliverables", label: "Deliverables", icon: CheckCircle2 },
  { key: "comms", label: "Comms", icon: MessageSquare },
  { key: "blockers", label: "Blockers", icon: Bug },
  { key: "qa", label: "QA", icon: Bug },
  { key: "files", label: "Files", icon: FolderOpen },
  { key: "notes", label: "Notes", icon: StickyNote },
];

function WorkspaceSection({
  projectId,
  onBack,
  onSelect,
}: {
  projectId: number | null;
  onBack: () => void;
  onSelect: (id: number | null) => void;
}) {
  const projectsQuery = trpc.scalar.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as Project[];
  const [sub, setSub] = useState<SubTab>("info");
  const project = projects.find(p => p.id === projectId) || null;

  if (!project) {
    return (
      <div>
        <OpsHeader title="Project Workspace" sub="Pick a project to open its workspace." />
        {projects.length === 0 ? (
          <OpsCard>
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              hint="Create one from the Projects tab."
            />
          </OpsCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projects.map(p => (
              <ProjectRow key={p.id} project={p} onOpen={() => onSelect(p.id)} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: `1px solid ${DARK}15`,
            borderRadius: 10,
            padding: "6px 10px",
            fontSize: 12,
            color: DARK,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeft size={12} /> Back to projects
        </button>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: DARK }}>
            {project.clientName}
          </p>
          <p style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
            {project.ref} · {project.service} · Lead {project.lead || "—"}
          </p>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          backgroundColor: WHITE,
          borderRadius: 12,
          border: `1px solid ${DARK}08`,
          marginBottom: 14,
          overflowX: "auto",
        }}
      >
        {SUB_TABS.map(t => {
          const isActive = sub === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setSub(t.key)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                backgroundColor: isActive ? ACCENT : "transparent",
                color: isActive ? "#1A1A1A" : MUTED,
                border: "none",
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={12} />
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "info" && <InfoTab project={project} onDeleted={onBack} />}
      {sub === "timeline" && <TimelineTab project={project} />}
      {sub === "deliverables" && <DeliverablesTab project={project} />}
      {sub === "comms" && <CommsTab project={project} />}
      {sub === "blockers" && <BlockersTab project={project} />}
      {sub === "qa" && <QaTab project={project} />}
      {sub === "files" && <FilesTab project={project} />}
      {sub === "notes" && <NotesTab project={project} />}
    </div>
  );
}

// ─── 3a · Info ──────────────────────────────────────────────────────────
function InfoTab({
  project,
  onDeleted,
}: {
  project: Project;
  onDeleted: () => void;
}) {
  const utils = trpc.useUtils();
  const updateMut = trpc.scalar.projects.update.useMutation({
    onSuccess: () => {
      utils.scalar.projects.list.invalidate();
      toast.success("Saved");
    },
  });
  const removeMut = trpc.scalar.projects.remove.useMutation({
    onSuccess: () => {
      utils.scalar.projects.list.invalidate();
      toast.success("Project deleted");
      onDeleted();
    },
  });

  const [form, setForm] = useState<Project>(project);

  useEffect(() => setForm(project), [project.id]);

  const save = () => {
    updateMut.mutate({
      id: project.id,
      ref: form.ref,
      clientName: form.clientName,
      clientContact: form.clientContact ?? null,
      clientEmail: form.clientEmail ?? null,
      clientPhone: form.clientPhone ?? null,
      service: form.service,
      status: form.status,
      week: form.week ?? null,
      lead: form.lead,
      startDate: form.startDate ?? null,
      targetDelivery: form.targetDelivery ?? null,
      actualDelivery: form.actualDelivery ?? null,
      projectValue: form.projectValue ?? null,
      scope: form.scope ?? null,
      goals: form.goals ?? null,
    });
  };

  const del = () => {
    if (!confirm(`Delete ${project.ref}? This removes all linked records.`)) return;
    removeMut.mutate({ id: project.id });
  };

  const set = <K extends keyof Project>(k: K, v: Project[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  return (
    <OpsCard>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        <Field label="Project ID">
          <TextInput value={form.ref || ""} onChange={v => set("ref", v)} />
        </Field>
        <Field label="Client name">
          <TextInput value={form.clientName || ""} onChange={v => set("clientName", v)} />
        </Field>
        <Field label="Client contact">
          <TextInput
            value={form.clientContact || ""}
            onChange={v => set("clientContact", v)}
          />
        </Field>
        <Field label="Client email">
          <TextInput
            value={form.clientEmail || ""}
            onChange={v => set("clientEmail", v)}
          />
        </Field>
        <Field label="Client phone">
          <TextInput
            value={form.clientPhone || ""}
            onChange={v => set("clientPhone", v)}
          />
        </Field>
        <Field label="Service">
          <select
            value={form.service || "Website"}
            onChange={e => set("service", e.target.value as ServiceType)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              backgroundColor: WHITE,
              color: DARK,
            }}
          >
            <option>Website</option>
            <option>App</option>
            <option>Automation</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status || "Queued"}
            onChange={e => set("status", e.target.value as ProjectStatus)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              backgroundColor: WHITE,
              color: DARK,
            }}
          >
            <option>Queued</option>
            <option>In Progress</option>
            <option>On Hold</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </Field>
        <Field label="Week #">
          <TextInput
            type="number"
            value={String(form.week ?? "")}
            onChange={v => set("week", v === "" ? null : Number(v))}
          />
        </Field>
        <Field label="Lead">
          <select
            value={form.lead || ""}
            onChange={e => set("lead", e.target.value as Project["lead"])}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              backgroundColor: WHITE,
              color: DARK,
            }}
          >
            <option value="">Unassigned</option>
            <option>Dajot</option>
            <option>Felix</option>
          </select>
        </Field>
        <Field label="Start date">
          <TextInput
            type="date"
            value={form.startDate || ""}
            onChange={v => set("startDate", v)}
          />
        </Field>
        <Field label="Target delivery">
          <TextInput
            type="date"
            value={form.targetDelivery || ""}
            onChange={v => set("targetDelivery", v)}
          />
        </Field>
        <Field label="Actual delivery">
          <TextInput
            type="date"
            value={form.actualDelivery || ""}
            onChange={v => set("actualDelivery", v)}
          />
        </Field>
      </div>

      <Field label="Scope">
        <TextArea value={form.scope || ""} onChange={v => set("scope", v)} />
      </Field>
      <Field label="Goals">
        <TextArea value={form.goals || ""} onChange={v => set("goals", v)} />
      </Field>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <InlineButton onClick={save} tone="primary" disabled={updateMut.isPending}>
          Save
        </InlineButton>
        <InlineButton onClick={del} tone="danger" icon={Trash2} disabled={removeMut.isPending}>
          Delete project
        </InlineButton>
      </div>
    </OpsCard>
  );
}

// ─── 3b · Timeline ──────────────────────────────────────────────────────
function TimelineTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const updateMut = trpc.scalar.projects.update.useMutation({
    onSuccess: () => utils.scalar.projects.list.invalidate(),
  });

  const phases = phasesForService(project.service);
  const currentPhaseId = project.phaseId || phases[0]?.id;

  const setPhase = (phaseId: string) => {
    updateMut.mutate({ id: project.id, phaseId });
  };

  return (
    <OpsCard>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 2 }}>
          {project.service} timeline
        </p>
        <p style={{ fontSize: 11, color: MUTED }}>
          {project.service === "Website"
            ? "7 weeks — Discovery · Design · Build · Content · QA · Launch · Handover"
            : project.service === "App"
            ? "12-16 weeks — Discovery · UX · UI · 3 build sprints · Testing · Beta · Launch"
            : "4-8 weeks — Discovery · Mapping · Build · Test · Deploy · Train · Handover"}
        </p>
      </div>

      <PhaseTracker
        phases={phases}
        currentPhaseId={currentPhaseId}
        onSelect={setPhase}
        accent={ACCENT}
        label="Project phase"
      />

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {phases.map((p, i) => {
          const idx = phases.findIndex(ph => ph.id === currentPhaseId);
          const done = i < idx;
          const active = i === idx;
          return (
            <PhaseCard
              key={p.id}
              title={p.label}
              meta={p.hint}
              accent={done ? GREEN : active ? ACCENT : MUTED}
              onClick={() => setPhase(p.id)}
            >
              <p style={{ fontSize: 10, color: MUTED }}>
                {done ? "Completed" : active ? "Active now" : "Upcoming"}
              </p>
            </PhaseCard>
          );
        })}
      </div>
    </OpsCard>
  );
}

// ─── 3c · Deliverables ──────────────────────────────────────────────────
function DeliverablesTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const deliverablesQuery = trpc.scalar.deliverables.list.useQuery({
    projectId: project.id,
  });
  const all = (deliverablesQuery.data ?? []) as Deliverable[];
  // Files tab uses groupName === "File" — exclude those here.
  const items = all.filter(d => d.groupName !== "File");
  const [showAdd, setShowAdd] = useState(false);

  const updateMut = trpc.scalar.deliverables.update.useMutation({
    onSuccess: () => utils.scalar.deliverables.list.invalidate(),
  });
  const removeMut = trpc.scalar.deliverables.remove.useMutation({
    onSuccess: () => utils.scalar.deliverables.list.invalidate(),
  });

  const assetItems: AssetItem[] = items.map(d => ({
    id: String(d.id),
    label: d.label,
    group: d.groupName ?? undefined,
    done: d.done,
    owner: d.owner ?? undefined,
    path: d.path ?? undefined,
    note: d.description ?? undefined,
  }));

  const toggle = (idStr: string) => {
    const id = Number(idStr);
    const item = items.find(d => d.id === id);
    if (!item) return;
    updateMut.mutate({
      id,
      done: !item.done,
      deliveredAt: !item.done ? todayISO() : null,
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <InlineButton onClick={() => setShowAdd(s => !s)} icon={Plus} tone="primary">
          {showAdd ? "Close" : "Add deliverable"}
        </InlineButton>
      </div>

      {showAdd && (
        <AddDeliverableForm projectId={project.id} onClose={() => setShowAdd(false)} />
      )}

      {items.length === 0 ? (
        <OpsCard>
          <EmptyState
            icon={CheckCircle2}
            title="No deliverables yet"
            hint="Add the artefacts this client is buying."
          />
        </OpsCard>
      ) : (
        <>
          <AssetChecklist
            items={assetItems}
            onToggle={toggle}
            accent={ACCENT}
            grouped
            title="Project deliverables"
            hint="Tick when handed to client."
          />
          <div style={{ marginTop: 10 }}>
            <InlineDeliverableList
              items={items}
              onRemove={id => removeMut.mutate({ id })}
            />
          </div>
        </>
      )}
    </div>
  );
}

function InlineDeliverableList({
  items,
  onRemove,
}: {
  items: Deliverable[];
  onRemove: (id: number) => void;
}) {
  return (
    <OpsCard>
      <p
        style={{
          fontSize: 10,
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Manage deliverables
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(d => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              borderRadius: 8,
              backgroundColor: BG,
            }}
          >
            <div style={{ fontSize: 12, color: DARK, minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{d.label}</span>
              <span style={{ color: MUTED, marginLeft: 6, fontSize: 10 }}>
                {d.groupName || "Other"} · {d.owner || "—"}
              </span>
            </div>
            <button
              onClick={() => onRemove(d.id)}
              style={{
                background: "transparent",
                border: "none",
                color: RED,
                cursor: "pointer",
                padding: 4,
              }}
              aria-label="Remove"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </OpsCard>
  );
}

function AddDeliverableForm({
  projectId,
  onClose,
}: {
  projectId: number;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const createMut = trpc.scalar.deliverables.create.useMutation({
    onSuccess: () => {
      utils.scalar.deliverables.list.invalidate();
      toast.success("Deliverable added");
      onClose();
    },
  });

  const [label, setLabel] = useState("");
  const [groupName, setGroupName] = useState("");
  const [owner, setOwner] = useState<"Scalar" | "Client">("Scalar");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const save = () => {
    if (!label.trim()) {
      toast.error("Label required");
      return;
    }
    createMut.mutate({
      projectId,
      label: label.trim(),
      groupName: groupName.trim() || null,
      owner,
      description: description.trim() || null,
      dueDate: dueDate || null,
      done: false,
    });
  };

  return (
    <OpsCard style={{ marginBottom: 10, borderColor: `${ACCENT}40` }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        <Field label="Deliverable">
          <TextInput value={label} onChange={setLabel} placeholder="e.g. Staging website" />
        </Field>
        <Field label="Group">
          <TextInput value={groupName} onChange={setGroupName} placeholder="Build / Design / Launch" />
        </Field>
        <Field label="Owner">
          <select
            value={owner}
            onChange={e => setOwner(e.target.value as "Scalar" | "Client")}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${DARK}15`,
              fontSize: 12,
              backgroundColor: WHITE,
              color: DARK,
            }}
          >
            <option>Scalar</option>
            <option>Client</option>
          </select>
        </Field>
        <Field label="Due date">
          <TextInput type="date" value={dueDate} onChange={setDueDate} />
        </Field>
      </div>
      <Field label="Description">
        <TextArea value={description} onChange={setDescription} rows={2} />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <InlineButton onClick={save} tone="primary" icon={Plus} disabled={createMut.isPending}>
          Add
        </InlineButton>
        <InlineButton onClick={onClose} tone="ghost">
          Cancel
        </InlineButton>
      </div>
    </OpsCard>
  );
}

// ─── 3d · Comms ─────────────────────────────────────────────────────────
function CommsTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const commsQuery = trpc.scalar.comms.list.useQuery({ projectId: project.id });
  const items = ((commsQuery.data ?? []) as Comm[])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const createMut = trpc.scalar.comms.create.useMutation({
    onSuccess: () => {
      utils.scalar.comms.list.invalidate();
      toast.success("Comm logged");
    },
  });
  const removeMut = trpc.scalar.comms.remove.useMutation({
    onSuccess: () => utils.scalar.comms.list.invalidate(),
  });

  const [date, setDate] = useState(todayISO());
  const [commType, setCommType] = useState("Call");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const save = () => {
    if (!summary.trim()) {
      toast.error("Summary required");
      return;
    }
    createMut.mutate(
      {
        projectId: project.id,
        date,
        commType,
        summary: summary.trim(),
        actionItems: actionItems.trim() || null,
        followUpDate: followUpDate || null,
      },
      {
        onSuccess: () => {
          setSummary("");
          setActionItems("");
          setFollowUpDate("");
        },
      },
    );
  };

  return (
    <div>
      <OpsCard style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
          Log a comm
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={date} onChange={setDate} />
          </Field>
          <Field label="Type">
            <select
              value={commType}
              onChange={e => setCommType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${DARK}15`,
                fontSize: 12,
                backgroundColor: WHITE,
                color: DARK,
              }}
            >
              <option>Call</option>
              <option>Email</option>
              <option>WhatsApp</option>
              <option>Meeting</option>
              <option>Kickoff Call</option>
              <option>Demo</option>
            </select>
          </Field>
          <Field label="Follow-up date">
            <TextInput type="date" value={followUpDate} onChange={setFollowUpDate} />
          </Field>
        </div>
        <Field label="Summary">
          <TextArea value={summary} onChange={setSummary} rows={2} />
        </Field>
        <Field label="Action items">
          <TextArea value={actionItems} onChange={setActionItems} rows={2} />
        </Field>
        <InlineButton onClick={save} tone="primary" icon={Send} disabled={createMut.isPending}>
          Log comm
        </InlineButton>
      </OpsCard>

      {items.length === 0 ? (
        <OpsCard>
          <EmptyState icon={MessageSquare} title="No comms yet" />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(c => (
            <OpsCard key={c.id} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusPill label={c.commType} tone="gold" />
                  <span style={{ fontSize: 11, color: MUTED }}>{fmtDate(c.date)}</span>
                </div>
                <button
                  onClick={() => removeMut.mutate({ id: c.id })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: RED,
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: DARK, whiteSpace: "pre-wrap" }}>
                {c.summary}
              </p>
              {c.actionItems && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    backgroundColor: BG,
                    borderRadius: 8,
                    fontSize: 11,
                    color: DARK,
                  }}
                >
                  <p
                    style={{
                      fontSize: 9,
                      color: MUTED,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                      marginBottom: 3,
                    }}
                  >
                    Action items
                  </p>
                  {c.actionItems}
                </div>
              )}
              {c.followUpDate && (
                <p style={{ fontSize: 11, color: ACCENT, marginTop: 6, fontWeight: 600 }}>
                  Follow up by {fmtDate(c.followUpDate)}
                </p>
              )}
            </OpsCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 3e · Blockers ──────────────────────────────────────────────────────
function BlockersTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const blockersQuery = trpc.scalar.blockers.list.useQuery({ projectId: project.id });
  const items = ((blockersQuery.data ?? []) as Blocker[])
    .slice()
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "Open" ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const createMut = trpc.scalar.blockers.create.useMutation({
    onSuccess: () => {
      utils.scalar.blockers.list.invalidate();
      toast.success("Blocker logged");
    },
  });
  const updateMut = trpc.scalar.blockers.update.useMutation({
    onSuccess: () => {
      utils.scalar.blockers.list.invalidate();
      toast.success("Resolved");
    },
  });
  const removeMut = trpc.scalar.blockers.remove.useMutation({
    onSuccess: () => utils.scalar.blockers.list.invalidate(),
  });

  const [issue, setIssue] = useState("");
  const [impact, setImpact] = useState("");

  const save = () => {
    if (!issue.trim()) {
      toast.error("Issue required");
      return;
    }
    createMut.mutate(
      {
        projectId: project.id,
        issue: issue.trim(),
        impact: impact.trim() || null,
        status: "Open",
      },
      {
        onSuccess: () => {
          setIssue("");
          setImpact("");
        },
      },
    );
  };

  const resolve = (b: Blocker) => {
    const resolution = prompt("Resolution notes?") || "";
    updateMut.mutate({
      id: b.id,
      status: "Resolved",
      resolution,
      resolvedAt: todayISO(),
    });
  };

  return (
    <div>
      <OpsCard style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
          Log a blocker
        </p>
        <Field label="Issue">
          <TextArea
            value={issue}
            onChange={setIssue}
            placeholder="What's blocking progress?"
            rows={2}
          />
        </Field>
        <Field label="Impact">
          <TextArea
            value={impact}
            onChange={setImpact}
            placeholder="What does this block or delay?"
            rows={2}
          />
        </Field>
        <InlineButton onClick={save} tone="primary" icon={Plus} disabled={createMut.isPending}>
          Log blocker
        </InlineButton>
      </OpsCard>

      {items.length === 0 ? (
        <OpsCard>
          <EmptyState icon={Bug} title="No blockers — ship mode on" />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(b => (
            <OpsCard key={b.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <StatusPill
                      label={b.status}
                      tone={b.status === "Open" ? "red" : "green"}
                    />
                    <span style={{ fontSize: 11, color: MUTED }}>
                      {fmtDate(new Date(b.createdAt).toISOString())}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{b.issue}</p>
                  {b.impact && (
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{b.impact}</p>
                  )}
                  {b.resolution && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        backgroundColor: `${GREEN}12`,
                        borderRadius: 8,
                        fontSize: 11,
                        color: DARK,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 9,
                          color: "#16A34A",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 700,
                          marginBottom: 3,
                        }}
                      >
                        Resolved {fmtDate(b.resolvedAt)}
                      </p>
                      {b.resolution}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {b.status === "Open" && (
                    <InlineButton onClick={() => resolve(b)} tone="primary">
                      Resolve
                    </InlineButton>
                  )}
                  <button
                    onClick={() => removeMut.mutate({ id: b.id })}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: RED,
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </OpsCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 3f · QA ────────────────────────────────────────────────────────────
function QaTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const qaQuery = trpc.scalar.qaChecks.list.useQuery({ projectId: project.id });
  const items = (qaQuery.data ?? []) as QaCheck[];

  const createMut = trpc.scalar.qaChecks.create.useMutation({
    onSuccess: () => {
      utils.scalar.qaChecks.list.invalidate();
      toast.success("QA check added");
    },
  });
  const updateMut = trpc.scalar.qaChecks.update.useMutation({
    onSuccess: () => utils.scalar.qaChecks.list.invalidate(),
  });
  const removeMut = trpc.scalar.qaChecks.remove.useMutation({
    onSuccess: () => utils.scalar.qaChecks.list.invalidate(),
  });

  const [feature, setFeature] = useState("");
  const [testCase, setTestCase] = useState("");
  const [expected, setExpected] = useState("");

  const save = () => {
    if (!feature.trim() || !testCase.trim()) {
      toast.error("Feature + test case required");
      return;
    }
    createMut.mutate(
      {
        projectId: project.id,
        feature: feature.trim(),
        testCase: testCase.trim(),
        expected: expected.trim() || null,
        status: "Not Tested",
      },
      {
        onSuccess: () => {
          setFeature("");
          setTestCase("");
          setExpected("");
        },
      },
    );
  };

  const updateStatus = (q: QaCheck, status: QaCheck["status"]) => {
    updateMut.mutate({
      id: q.id,
      status,
      fixedAt: status === "Fixed" ? todayISO() : q.fixedAt ?? null,
    });
  };

  const pass = items.filter(q => q.status === "Pass" || q.status === "Fixed").length;
  const fail = items.filter(q => q.status === "Fail").length;
  const untested = items.filter(q => q.status === "Not Tested").length;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <OpsKpi label="Pass / Fixed" value={pass} accent={GREEN} />
        <OpsKpi label="Fail" value={fail} accent={RED} />
        <OpsKpi label="Not tested" value={untested} accent={ORANGE} />
      </div>

      <OpsCard style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
          Add QA check
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <Field label="Feature / Page">
            <TextInput value={feature} onChange={setFeature} placeholder="Homepage" />
          </Field>
          <Field label="Test case">
            <TextInput value={testCase} onChange={setTestCase} placeholder="Form submits" />
          </Field>
          <Field label="Expected">
            <TextInput
              value={expected}
              onChange={setExpected}
              placeholder="Confirmation message"
            />
          </Field>
        </div>
        <InlineButton onClick={save} tone="primary" icon={Plus} disabled={createMut.isPending}>
          Add check
        </InlineButton>
      </OpsCard>

      {items.length === 0 ? (
        <OpsCard>
          <EmptyState icon={Bug} title="No QA checks yet" />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(q => {
            const tone =
              q.status === "Pass" || q.status === "Fixed"
                ? "green"
                : q.status === "Fail"
                ? "red"
                : "muted";
            return (
              <OpsCard key={q.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{q.feature}</p>
                      <StatusPill label={q.status} tone={tone} />
                    </div>
                    <p style={{ fontSize: 11, color: MUTED }}>{q.testCase}</p>
                    {q.expected && (
                      <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                        Expected: {q.expected}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <select
                      value={q.status}
                      onChange={e => updateStatus(q, e.target.value as QaCheck["status"])}
                      style={{
                        padding: "5px 8px",
                        borderRadius: 8,
                        border: `1px solid ${DARK}15`,
                        fontSize: 11,
                        backgroundColor: WHITE,
                        color: DARK,
                      }}
                    >
                      <option>Not Tested</option>
                      <option>Pass</option>
                      <option>Fail</option>
                      <option>Fixed</option>
                    </select>
                    <button
                      onClick={() => removeMut.mutate({ id: q.id })}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: RED,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
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

// ─── 3g · Files ─────────────────────────────────────────────────────────
function FilesTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const deliverablesQuery = trpc.scalar.deliverables.list.useQuery({
    projectId: project.id,
  });
  const all = (deliverablesQuery.data ?? []) as Deliverable[];
  // Re-use the deliverables collection for files with a `File` group marker.
  const files = all.filter(d => d.groupName === "File" || d.path);

  const createMut = trpc.scalar.deliverables.create.useMutation({
    onSuccess: () => {
      utils.scalar.deliverables.list.invalidate();
      toast.success("File added");
    },
  });
  const removeMut = trpc.scalar.deliverables.remove.useMutation({
    onSuccess: () => utils.scalar.deliverables.list.invalidate(),
  });

  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState<"Scalar" | "Client">("Client");

  const save = () => {
    if (!name.trim() || !path.trim()) {
      toast.error("Name + link required");
      return;
    }
    createMut.mutate(
      {
        projectId: project.id,
        label: name.trim(),
        groupName: "File",
        owner,
        path: path.trim(),
        description: description.trim() || null,
        done: true,
        deliveredAt: todayISO(),
      },
      {
        onSuccess: () => {
          setName("");
          setPath("");
          setDescription("");
        },
      },
    );
  };

  return (
    <div>
      <OpsCard style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
          Add file / asset link
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <Field label="File name">
            <TextInput value={name} onChange={setName} placeholder="Logo.png" />
          </Field>
          <Field label="Link">
            <TextInput value={path} onChange={setPath} placeholder="https://drive.google.com/…" />
          </Field>
          <Field label="From">
            <select
              value={owner}
              onChange={e => setOwner(e.target.value as "Scalar" | "Client")}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${DARK}15`,
                fontSize: 12,
                backgroundColor: WHITE,
                color: DARK,
              }}
            >
              <option>Client</option>
              <option>Scalar</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <TextInput value={description} onChange={setDescription} />
        </Field>
        <InlineButton onClick={save} tone="primary" icon={Plus} disabled={createMut.isPending}>
          Add file
        </InlineButton>
      </OpsCard>

      {files.length === 0 ? (
        <OpsCard>
          <EmptyState icon={FolderOpen} title="No files yet" hint="Add drive links as assets arrive." />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {files.map(f => (
            <OpsCard key={f.id} style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{f.label}</p>
                  <p style={{ fontSize: 11, color: MUTED }}>
                    {f.owner || "—"} · Added {fmtDate(f.deliveredAt)}
                  </p>
                  {f.description && (
                    <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{f.description}</p>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {f.path && (
                    <a
                      href={f.path}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: ACCENT,
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${ACCENT}40`,
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Open
                    </a>
                  )}
                  <button
                    onClick={() => removeMut.mutate({ id: f.id })}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: RED,
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </OpsCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 3h · Notes ─────────────────────────────────────────────────────────
function NotesTab({ project }: { project: Project }) {
  const utils = trpc.useUtils();
  const notesQuery = trpc.scalar.notes.list.useQuery({ projectId: project.id });
  const items = ((notesQuery.data ?? []) as Note[])
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const createMut = trpc.scalar.notes.create.useMutation({
    onSuccess: () => {
      utils.scalar.notes.list.invalidate();
      toast.success("Note saved");
    },
  });
  const removeMut = trpc.scalar.notes.remove.useMutation({
    onSuccess: () => utils.scalar.notes.list.invalidate(),
  });

  const [date, setDate] = useState(todayISO());
  const [body, setBody] = useState("");
  const [decidedBy, setDecidedBy] = useState("");
  const [impact, setImpact] = useState("");

  const save = () => {
    if (!body.trim()) {
      toast.error("Note body required");
      return;
    }
    createMut.mutate(
      {
        projectId: project.id,
        date,
        body: body.trim(),
        decidedBy: decidedBy.trim() || null,
        impact: impact.trim() || null,
      },
      {
        onSuccess: () => {
          setBody("");
          setDecidedBy("");
          setImpact("");
        },
      },
    );
  };

  return (
    <div>
      <OpsCard style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
          Add note / decision
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={date} onChange={setDate} />
          </Field>
          <Field label="Decided by">
            <TextInput value={decidedBy} onChange={setDecidedBy} placeholder="Client + Dajot" />
          </Field>
          <Field label="Impact">
            <TextInput value={impact} onChange={setImpact} placeholder="+2 weeks timeline" />
          </Field>
        </div>
        <Field label="Note">
          <TextArea value={body} onChange={setBody} rows={3} />
        </Field>
        <InlineButton onClick={save} tone="primary" icon={Plus} disabled={createMut.isPending}>
          Save note
        </InlineButton>
      </OpsCard>

      {items.length === 0 ? (
        <OpsCard>
          <EmptyState icon={StickyNote} title="No notes yet" />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(n => (
            <OpsCard key={n.id} style={{ padding: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: MUTED }}>{fmtDate(n.date)}</span>
                <button
                  onClick={() => removeMut.mutate({ id: n.id })}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: RED,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p style={{ fontSize: 12, color: DARK, whiteSpace: "pre-wrap" }}>{n.body}</p>
              {(n.decidedBy || n.impact) && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    backgroundColor: BG,
                    borderRadius: 8,
                    fontSize: 11,
                    color: DARK,
                  }}
                >
                  {n.decidedBy && <div>👤 {n.decidedBy}</div>}
                  {n.impact && <div style={{ marginTop: 2, color: MUTED }}>{n.impact}</div>}
                </div>
              )}
            </OpsCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 4 · CALENDAR
 * ═══════════════════════════════════════════════════════════════════════ */
function CalendarSection() {
  const projectsQuery = trpc.scalar.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as Project[];

  // Group deadlines by ISO week
  const byWeek: Record<string, Project[]> = {};
  for (const p of projects) {
    if (p.status === "Completed" || p.status === "Cancelled") continue;
    if (!p.targetDelivery) continue;
    const d = new Date(p.targetDelivery);
    if (Number.isNaN(d.getTime())) continue;
    const monday = startOfWeek(d);
    const key = monday.toISOString().slice(0, 10);
    (byWeek[key] = byWeek[key] || []).push(p);
  }
  const sortedWeeks = Object.keys(byWeek).sort();

  return (
    <div>
      <OpsHeader
        title="Scalar Calendar"
        sub="Weekly rhythm + upcoming deadlines by week."
      />

      {/* Weekly rhythm card */}
      <OpsCard style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: 11,
            color: ACCENT,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          Weekly rhythm — Dajot + Felix
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
          }}
        >
          <RhythmCard
            title="Daily 9 AM standup"
            body="Dajot + Felix align on priorities, blockers, client check-ins."
            tone="primary"
          />
          <RhythmCard
            title="Monday · Planning"
            body="Week priorities, deadline triage, assign new leads."
          />
          <RhythmCard
            title="Wednesday · Client check-ins"
            body="Progress updates by email/WhatsApp. Demos where possible."
          />
          <RhythmCard
            title="Friday · Week wrap"
            body="What shipped? What slipped? Log blockers for next week."
          />
          <RhythmCard
            title="Daily 3 PM"
            body="End-of-day update — shipped today + tomorrow's top task."
          />
        </div>
      </OpsCard>

      <OpsHeader title="Upcoming deadlines by week" />

      {sortedWeeks.length === 0 ? (
        <OpsCard>
          <EmptyState icon={Calendar} title="No deadlines queued" />
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sortedWeeks.map(weekKey => {
            const monday = new Date(weekKey);
            const sunday = addDays(monday, 6);
            const weekLabel = `${monday.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
            })} – ${sunday.toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`;
            const items = byWeek[weekKey].sort((a, b) => {
              const da = new Date(a.targetDelivery!).getTime();
              const db = new Date(b.targetDelivery!).getTime();
              return da - db;
            });
            return (
              <OpsCard key={weekKey}>
                <p
                  style={{
                    fontSize: 11,
                    color: ACCENT,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 10,
                  }}
                >
                  Week of {weekLabel} · {items.length} project
                  {items.length === 1 ? "" : "s"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {items.map(p => {
                    const days = daysFromNow(p.targetDelivery);
                    const tone: "red" | "orange" | "blue" =
                      days !== null && days < 0
                        ? "red"
                        : days !== null && days <= 7
                        ? "orange"
                        : "blue";
                    const label =
                      days === null
                        ? "—"
                        : days < 0
                        ? `${-days}d over`
                        : days === 0
                        ? "Today"
                        : `${days}d`;
                    return (
                      <div
                        key={p.id}
                        style={{
                          padding: "10px 12px",
                          backgroundColor: BG,
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
                          <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                            {p.clientName}{" "}
                            <span style={{ fontSize: 10, color: MUTED, fontFamily: "monospace" }}>
                              · {p.ref}
                            </span>
                          </p>
                          <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>
                            {p.service} · {p.lead || "—"} · {fmtDate(p.targetDelivery)}
                          </p>
                        </div>
                        <StatusPill label={label} tone={tone} />
                      </div>
                    );
                  })}
                </div>
              </OpsCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RhythmCard({
  title,
  body,
  tone = "default",
}: {
  title: string;
  body: string;
  tone?: "default" | "primary";
}) {
  const bg = tone === "primary" ? `${ACCENT}18` : BG;
  const border = tone === "primary" ? `${ACCENT}40` : `${DARK}06`;
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        backgroundColor: bg,
        border: `1px solid ${border}`,
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 700, color: DARK, marginBottom: 4 }}>{title}</p>
      <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{body}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 5 · TECHNICAL STANDARDS (read-only reference)
 * ═══════════════════════════════════════════════════════════════════════ */
function StandardsSection() {
  const stacks: Array<{
    service: ServiceType;
    stack: { label: string; tools: string[] }[];
    notes: string[];
  }> = [
    {
      service: "Website",
      stack: [
        { label: "Frontend", tools: ["Vite", "React 18", "TypeScript", "Tailwind CSS"] },
        { label: "CMS (when needed)", tools: ["WordPress", "Sanity"] },
        { label: "Hosting", tools: ["Vercel", "Netlify", "Railway", "client's cPanel"] },
        { label: "E-commerce", tools: ["WooCommerce", "Shopify"] },
      ],
      notes: [
        "Mobile-first, responsive down to 360px.",
        "Lighthouse ≥ 90 on Performance + Accessibility before launch.",
        "SSL required. Submit sitemap to Google Search Console at launch.",
      ],
    },
    {
      service: "App",
      stack: [
        { label: "Framework", tools: ["React Native", "Flutter (if required)"] },
        { label: "Backend", tools: ["Node.js", "Firebase"] },
        { label: "Database", tools: ["PostgreSQL", "MongoDB", "Firestore"] },
        { label: "Hosting / infra", tools: ["AWS", "Google Cloud", "Firebase"] },
      ],
      notes: [
        "MVP-first. Cut scope, not quality.",
        "Weekly client demo during build sprints.",
        "Security review before beta.",
      ],
    },
    {
      service: "Automation",
      stack: [
        { label: "No-code / low-code", tools: ["Zapier", "Make (Integromat)", "n8n"] },
        { label: "Custom", tools: ["Python scripts", "Google Apps Script", "Node.js"] },
        { label: "Auth / APIs", tools: ["OAuth 2", "REST", "Webhooks"] },
      ],
      notes: [
        "Map process end-to-end before building.",
        "Test with real data in staging before deploy.",
        "Document triggers + failure modes at handover.",
      ],
    },
  ];

  const quality = [
    { label: "Clean, commented code", tone: "green" as const },
    { label: "No console errors", tone: "green" as const },
    { label: "Git version controlled", tone: "green" as const },
    { label: "Page load < 3 seconds", tone: "green" as const },
    { label: "Mobile responsive", tone: "green" as const },
    { label: "SSL certificate installed", tone: "green" as const },
    { label: "Input validation + secure auth", tone: "green" as const },
    { label: "All features tested on 2+ devices", tone: "green" as const },
  ];

  return (
    <div>
      <OpsHeader
        title="Technical Standards"
        sub="Scalar tech stack baseline. Read-only reference."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {stacks.map(s => {
          const Icon = serviceIcon(s.service);
          return (
            <OpsCard key={s.service}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: `${ACCENT}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} style={{ color: "#8A6A10" }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{s.service}</p>
                  <p style={{ fontSize: 11, color: MUTED }}>
                    {s.service === "Website"
                      ? "7 weeks · Discovery → Handover"
                      : s.service === "App"
                      ? "12-16 weeks · Discovery → Launch"
                      : "4-8 weeks · Discovery → Handover"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {s.stack.map(layer => (
                  <div
                    key={layer.label}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: BG,
                      borderRadius: 10,
                      border: `1px solid ${DARK}06`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        color: MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        marginBottom: 6,
                      }}
                    >
                      {layer.label}
                    </p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {layer.tools.map(t => (
                        <StatusPill key={t} label={t} tone="gold" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: 10,
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Notes
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {s.notes.map(n => (
                  <li key={n} style={{ fontSize: 12, color: DARK, lineHeight: 1.7 }}>
                    {n}
                  </li>
                ))}
              </ul>
            </OpsCard>
          );
        })}

        <OpsCard>
          <p
            style={{
              fontSize: 11,
              color: ACCENT,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 10,
            }}
          >
            Pre-delivery quality checklist
          </p>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>
            If ANY box fails → not ready for delivery.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {quality.map(q => (
              <div
                key={q.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: DARK,
                  padding: "4px 0",
                }}
              >
                <CheckCircle2 size={14} style={{ color: GREEN, flexShrink: 0 }} />
                {q.label}
              </div>
            ))}
          </div>
        </OpsCard>

        <OpsCard>
          <p
            style={{
              fontSize: 11,
              color: ACCENT,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 10,
            }}
          >
            Success metrics
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            <OpsKpi label="On-time delivery" value="90%+" accent={GREEN} />
            <OpsKpi label="Client satisfaction" value=">95%" accent={GREEN} />
            <OpsKpi label="Post-launch bugs" value="<5 / project" accent={ORANGE} />
            <OpsKpi label="Projects / month" value="3-5" accent={BLUE} />
            <OpsKpi label="Client retention" value="80%+" accent={ACCENT} />
          </div>
        </OpsCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 6 · REPORTS
 * ═══════════════════════════════════════════════════════════════════════ */
function ReportsSection() {
  const projectsQuery = trpc.scalar.projects.list.useQuery();
  const qaQuery = trpc.scalar.qaChecks.list.useQuery();
  const projects = (projectsQuery.data ?? []) as Project[];
  const qaChecks = (qaQuery.data ?? []) as QaCheck[];

  const metrics = useMemo(() => {
    const completed = projects.filter(p => p.status === "Completed");
    const completedWithDates = completed.filter(p => p.targetDelivery && p.actualDelivery);
    const onTime = completedWithDates.filter(p => {
      const target = new Date(p.targetDelivery!).getTime();
      const actual = new Date(p.actualDelivery!).getTime();
      return actual <= target;
    });
    const onTimePct =
      completedWithDates.length === 0
        ? null
        : Math.round((onTime.length / completedWithDates.length) * 100);

    const bugsByProject: Record<number, number> = {};
    for (const q of qaChecks) {
      if (q.status === "Fail") {
        bugsByProject[q.projectId] = (bugsByProject[q.projectId] || 0) + 1;
      }
    }

    const now = new Date();
    const completedThisMonth = completed.filter(p => {
      if (!p.actualDelivery) return false;
      const d = new Date(p.actualDelivery);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const active = projects.filter(p => p.status === "In Progress");
    const queued = projects.filter(p => p.status === "Queued");
    const overdue = active.filter(p => {
      const days = daysFromNow(p.targetDelivery);
      return days !== null && days < 0;
    });

    return {
      onTimePct,
      completedWithDates: completedWithDates.length,
      bugsByProject,
      completedThisMonth,
      active: active.length,
      queued: queued.length,
      overdueList: overdue,
      activeList: active,
    };
  }, [projects, qaChecks]);

  const snapshot = useMemo(() => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const lines: string[] = [];
    lines.push(`HAMZURY · Scalar Weekly Snapshot`);
    lines.push(dateLabel);
    lines.push("");
    lines.push("DELIVERY");
    lines.push(
      ` · On-time delivery:   ${
        metrics.onTimePct === null
          ? "n/a"
          : `${metrics.onTimePct}% (${metrics.completedWithDates} shipped w/ dates)`
      }`,
    );
    lines.push(` · Shipped this month: ${metrics.completedThisMonth}`);
    lines.push(` · In progress:        ${metrics.active}`);
    lines.push(` · Queued:             ${metrics.queued}`);
    lines.push(` · Overdue:            ${metrics.overdueList.length}`);
    lines.push("");
    lines.push("ACTIVE PROJECTS");
    if (metrics.activeList.length === 0) {
      lines.push(" · (none)");
    } else {
      metrics.activeList.slice(0, 10).forEach(p => {
        lines.push(
          ` · ${p.clientName} — ${p.service} — Wk ${p.week ?? "—"} — ${p.lead || "?"} — due ${fmtDate(
            p.targetDelivery,
          )}`,
        );
      });
    }
    lines.push("");
    lines.push("POST-LAUNCH BUGS");
    const bugsEntries = Object.entries(metrics.bugsByProject);
    if (bugsEntries.length === 0) {
      lines.push(" · (none logged)");
    } else {
      for (const [pid, n] of bugsEntries) {
        const p = projects.find(x => x.id === Number(pid));
        lines.push(` · ${p?.clientName ?? pid} — ${n} open failure${n === 1 ? "" : "s"}`);
      }
    }
    lines.push("");
    lines.push("Built to Last.");
    return lines.join("\n");
  }, [metrics, projects]);

  const copy = () => {
    navigator.clipboard.writeText(snapshot).then(
      () => toast.success("Snapshot copied"),
      () => toast.error("Couldn't copy — select manually"),
    );
  };

  return (
    <div>
      <OpsHeader title="Reports" sub="Delivery KPIs + copy-paste weekly snapshot." />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <OpsKpi
          label="On-time delivery"
          value={metrics.onTimePct === null ? "—" : `${metrics.onTimePct}%`}
          sub={
            metrics.onTimePct === null
              ? "no completed projects yet"
              : `${metrics.completedWithDates} tracked`
          }
          accent={
            metrics.onTimePct === null || metrics.onTimePct >= 90 ? GREEN : ORANGE
          }
        />
        <OpsKpi
          label="Shipped this month"
          value={metrics.completedThisMonth}
          accent={GREEN}
        />
        <OpsKpi label="Active" value={metrics.active} accent={BLUE} />
        <OpsKpi label="Overdue" value={metrics.overdueList.length} accent={RED} />
      </div>

      <OpsCard style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: 11,
            color: ACCENT,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 10,
          }}
        >
          Post-launch bug count per project
        </p>
        {Object.keys(metrics.bugsByProject).length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No failing QA checks"
            hint="Every open bug logged in QA surfaces here."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(metrics.bugsByProject).map(([pid, n]) => {
              const p = projects.find(x => x.id === Number(pid));
              if (!p) return null;
              const tone = n <= 2 ? "blue" : n <= 5 ? "orange" : "red";
              return (
                <div
                  key={pid}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: BG,
                    borderRadius: 10,
                    border: `1px solid ${DARK}06`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: DARK }}>
                      {p.clientName}
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: MUTED,
                        marginTop: 2,
                        fontFamily: "monospace",
                      }}
                    >
                      {p.ref}
                    </p>
                  </div>
                  <StatusPill label={`${n} open`} tone={tone} />
                </div>
              );
            })}
          </div>
        )}
      </OpsCard>

      <OpsCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: ACCENT,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Weekly snapshot — copy-paste ready
          </p>
          <InlineButton onClick={copy} tone="primary" icon={Copy}>
            Copy
          </InlineButton>
        </div>
        <pre
          style={{
            fontFamily: "ui-monospace, 'SF Mono', monospace",
            fontSize: 11,
            color: DARK,
            backgroundColor: BG,
            padding: "14px 16px",
            borderRadius: 10,
            border: `1px solid ${DARK}06`,
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {snapshot}
        </pre>
      </OpsCard>
    </div>
  );
}
