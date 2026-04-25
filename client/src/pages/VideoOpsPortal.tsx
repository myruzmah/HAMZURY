import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard, Film, ClipboardList, Image as ImageIcon, MessageSquare,
  Package, DollarSign, BarChart3, Plus, Trash2, Edit3, Save,
} from "lucide-react";
import { toast } from "sonner";
import OpsShell, { OpsCard, OpsKpi, OpsHeader } from "@/components/ops/OpsShell";
import PhaseTracker, { type Phase } from "@/components/ops/PhaseTracker";
import AssetChecklist, { type AssetItem } from "@/components/ops/AssetChecklist";
import { trpc } from "@/lib/trpc";

/* ══════════════════════════════════════════════════════════════════════
 * HAMZURY VIDEO OPS PORTAL — Salis (lead video editor)
 * Migrated from localStorage (opsStore "video") to tRPC + MySQL.
 * Source: PHASE8_SPECIAL_UNITS/VIDEO_UNIT
 * ══════════════════════════════════════════════════════════════════════ */

const RED = "#DC2626";
const DARK = "#1A1A1A";
const MUTED = "#6B7280";
const WHITE = "#FFFFFF";
const GREEN = "#22C55E";
const GOLD = "#B48C4C";
const ORANGE = "#F59E0B";

type Section =
  | "overview" | "projects" | "timeline" | "assets"
  | "feedback" | "deliverables" | "pricing";

type ServiceTag = "Editing" | "Color" | "Sound" | "Animation" | "Full Production";

type ProjectRow = {
  id: number;
  name: string;
  client: string;
  projectCode: string;
  deliveryDate: string;
  budget: number;
  services: ServiceTag[];
  status: "Pre" | "Production" | "Post" | "Delivered";
  phase: string;
  owner: "Salis" | "Client";
};

type AssetRow = {
  id: number;
  projectId: number;
  label: string;
  assetGroup: "Footage" | "Audio" | "Graphics" | "Copy";
  done: boolean;
  path?: string | null;
  owner?: string | null;
  note?: string | null;
};

type RevisionRow = {
  id: number;
  projectId: number;
  version: string; // v1 / v2 / v3
  feedback: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: string;
};

type DeliverableRow = {
  id: number;
  projectId: number;
  kind: "MP4" | "Thumbnail" | "SRT" | "Project File" | "Other";
  path?: string | null;
  format?: string | null;
  resolution?: string | null;
  done: boolean;
};

/* Phase tracker phases */
const VIDEO_PHASES: Phase[] = [
  { id: "script",     label: "Script" },
  { id: "storyboard", label: "Storyboard" },
  { id: "filming",    label: "Filming" },
  { id: "assembly",   label: "Assembly" },
  { id: "rough",      label: "Rough Cut" },
  { id: "color",      label: "Color" },
  { id: "sound",      label: "Sound" },
  { id: "final",      label: "Final" },
];

const SERVICE_PRICING = [
  { tier: "Simple Edit",        price: "₦50,000",     note: "Up to 3 min, basic cuts" },
  { tier: "Standard Edit",      price: "₦150,000",    note: "Up to 10 min, color + sound" },
  { tier: "Commercial",         price: "₦500,000",    note: "Full polish, music, VO" },
  { tier: "Corporate Film",     price: "₦1,200,000",  note: "Full crew, locations, post" },
  { tier: "Full Commercial",    price: "₦2,000,000",  note: "End-to-end production" },
];

/* ──────────────────────────── Main ──────────────────────────── */
export default function VideoOpsPortal() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [active, setActive] = useState<Section>("overview");
  const role = (user as any)?.hamzuryRole;
  const roleAllowed =
    role === "founder" || role === "ceo" ||
    role === "video_lead" || role === "video_staff";

  if (!user) return null;

  const nav = [
    { key: "overview",     label: "Overview",     icon: LayoutDashboard },
    { key: "projects",     label: "Projects",     icon: Film },
    { key: "timeline",     label: "Timeline",     icon: ClipboardList },
    { key: "assets",       label: "Assets",       icon: ImageIcon },
    { key: "feedback",     label: "Revisions",    icon: MessageSquare },
    { key: "deliverables", label: "Deliverables", icon: Package },
    { key: "pricing",      label: "Pricing",      icon: DollarSign },
  ];

  return (
    <OpsShell
      title="Video Ops"
      subtitle="HAMZURY Video Unit"
      brand={{ name: "Video", accent: GOLD, bg: RED }}
      nav={nav}
      active={active}
      onChange={k => setActive(k as Section)}
      logoSmall="HAMZURY"
      logoLarge="Video Ops"
      userName={user.name ?? undefined}
      roleLabel="VIDEO UNIT"
      onLogout={logout}
      pageTitle="Video Ops — HAMZURY"
    >
      {!roleAllowed && (
        <div style={{
          backgroundColor: `${ORANGE}12`, border: `1px solid ${ORANGE}40`,
          color: ORANGE, padding: "12px 16px", borderRadius: 12, marginBottom: 16, fontSize: 13,
        }}>
          Role check: this portal is read-only for you. Salis, Founder, CEO only can edit.
        </div>
      )}
      {active === "overview"     && <OverviewSection />}
      {active === "projects"     && <ProjectsSection />}
      {active === "timeline"     && <TimelineSection />}
      {active === "assets"       && <AssetsSection />}
      {active === "feedback"     && <RevisionsSection />}
      {active === "deliverables" && <DeliverablesSection />}
      {active === "pricing"      && <PricingSection />}
    </OpsShell>
  );
}

/* ───────────────────── Overview ───────────────────── */
function OverviewSection() {
  const projectsQuery = trpc.video.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as ProjectRow[];
  const active = projects.filter(p => p.status !== "Delivered");
  const delivered = projects.filter(p => p.status === "Delivered");
  const byService = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach(p => (p.services || []).forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return map;
  }, [projects]);

  return (
    <div>
      <OpsHeader
        title="Overview"
        sub="Active + delivered projects, performance, service mix."
      />
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12, marginBottom: 20,
      }}>
        <OpsKpi label="Active Projects"  value={active.length}    accent={RED} />
        <OpsKpi label="Delivered"        value={delivered.length} accent={GREEN} sub="all-time" />
        <OpsKpi label="In Production"    value={active.filter(p => p.status === "Production").length} accent={ORANGE} />
        <OpsKpi label="In Post"          value={active.filter(p => p.status === "Post").length} accent={GOLD} />
      </div>

      <OpsCard style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
          Service mix
        </p>
        {Object.keys(byService).length === 0 ? (
          <p style={{ fontSize: 13, color: MUTED }}>No projects yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(byService).map(([k, v]) => (
              <div key={k} style={{
                padding: "8px 14px", borderRadius: 999,
                backgroundColor: `${RED}12`, color: RED,
                fontSize: 12, fontWeight: 600,
              }}>
                {k}: {v}
              </div>
            ))}
          </div>
        )}
      </OpsCard>

      <OpsCard>
        <p style={{ fontSize: 12, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>
          Performance targets
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "On-time delivery", target: "100%" },
            { label: "First-time approval", target: ">80%" },
            { label: "Repeat client rate", target: ">50%" },
          ].map(t => (
            <div key={t.label} style={{
              padding: 12, borderRadius: 10,
              backgroundColor: `${DARK}04`, color: DARK,
            }}>
              <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: RED, marginTop: 4 }}>{t.target}</p>
            </div>
          ))}
        </div>
      </OpsCard>
    </div>
  );
}

/* ───────────────────── Projects ───────────────────── */
type EditingProject = Partial<ProjectRow> & { id?: number };

function ProjectsSection() {
  const utils = trpc.useUtils();
  const projectsQuery = trpc.video.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as ProjectRow[];

  const [editing, setEditing] = useState<EditingProject | null>(null);

  const createMut = trpc.video.projects.create.useMutation({
    onSuccess: () => {
      utils.video.projects.list.invalidate();
      toast.success("Saved");
    },
  });
  const updateMut = trpc.video.projects.update.useMutation({
    onSuccess: () => {
      utils.video.projects.list.invalidate();
      toast.success("Saved");
    },
  });
  const removeMut = trpc.video.projects.remove.useMutation({
    onSuccess: () => utils.video.projects.list.invalidate(),
  });

  const save = () => {
    if (!editing?.name) { toast.error("Project name required"); return; }
    if (editing.id) {
      updateMut.mutate({
        id: editing.id,
        name: editing.name,
        client: editing.client,
        projectCode: editing.projectCode,
        deliveryDate: editing.deliveryDate,
        budget: editing.budget,
        services: editing.services,
        status: editing.status,
        phase: editing.phase,
        owner: editing.owner,
      });
    } else {
      createMut.mutate({
        name: editing.name,
        client: editing.client || "",
        projectCode: editing.projectCode || `VID-${String(projects.length + 1).padStart(3, "0")}`,
        deliveryDate: editing.deliveryDate || "",
        budget: editing.budget ?? 0,
        services: editing.services || ["Editing"],
        status: (editing.status as any) || "Pre",
        phase: editing.phase || "script",
        owner: (editing.owner as any) || "Salis",
      });
    }
    setEditing(null);
  };

  return (
    <div>
      <OpsHeader
        title="Projects"
        sub="All video projects. Click a project to see its timeline."
        action={
          <button onClick={() => setEditing({})} style={{
            padding: "8px 14px", borderRadius: 999, border: "none",
            backgroundColor: RED, color: WHITE,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Plus size={12} /> New Project
          </button>
        }
      />
      {projects.length === 0 ? (
        <OpsCard>
          <p style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "24px 0" }}>
            No projects yet. Start your first one.
          </p>
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projects.map(p => (
            <OpsCard key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                    {p.projectCode} · {p.client} · Delivery: {p.deliveryDate || "TBD"}
                  </p>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {(p.services || []).map(s => (
                      <span key={s} style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, backgroundColor: `${RED}12`, color: RED }}>{s}</span>
                    ))}
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 999, backgroundColor: `${GREEN}15`, color: GREEN }}>{p.status}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setEditing(p)} style={{ border: "none", background: "transparent", color: MUTED, cursor: "pointer" }}><Edit3 size={14} /></button>
                  <button onClick={() => removeMut.mutate({ id: p.id })} style={{ border: "none", background: "transparent", color: "#DC2626", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>
            </OpsCard>
          ))}
        </div>
      )}
      {editing && (
        <div onClick={() => setEditing(null)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: WHITE, borderRadius: 16, padding: 24,
            width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto",
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, marginBottom: 16 }}>{editing.id ? "Edit" : "New"} Project</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Lab l="Project ID"><Inp v={editing.projectCode} onChange={v => setEditing({ ...editing, projectCode: v })} /></Lab>
              <Lab l="Name"><Inp v={editing.name} onChange={v => setEditing({ ...editing, name: v })} /></Lab>
              <Lab l="Client"><Inp v={editing.client} onChange={v => setEditing({ ...editing, client: v })} /></Lab>
              <Lab l="Delivery Date"><Inp v={editing.deliveryDate} type="date" onChange={v => setEditing({ ...editing, deliveryDate: v })} /></Lab>
              <Lab l="Budget ₦"><Inp v={editing.budget} type="number" onChange={v => setEditing({ ...editing, budget: Number(v) })} /></Lab>
              <Lab l="Status"><Sel v={editing.status} onChange={v => setEditing({ ...editing, status: v as any })} opts={["Pre","Production","Post","Delivered"]} /></Lab>
              <Lab l="Phase"><Sel v={editing.phase} onChange={v => setEditing({ ...editing, phase: v })} opts={VIDEO_PHASES.map(p => p.id)} /></Lab>
              <Lab l="Owner"><Sel v={editing.owner} onChange={v => setEditing({ ...editing, owner: v as any })} opts={["Salis","Client"]} /></Lab>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setEditing(null)} style={btnGhost}>Cancel</button>
              <button onClick={save} style={btnPrimary}><Save size={12} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Timeline (phase tracker per project) ───────────────────── */
function TimelineSection() {
  const utils = trpc.useUtils();
  const projectsQuery = trpc.video.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as ProjectRow[];
  const [selected, setSelected] = useState<number | null>(null);

  // Keep selection valid as projects load.
  useEffect(() => {
    if (selected == null && projects[0]) setSelected(projects[0].id);
  }, [selected, projects]);

  const project = projects.find(p => p.id === selected);

  const updateMut = trpc.video.projects.update.useMutation({
    onSuccess: () => utils.video.projects.list.invalidate(),
  });

  const setPhase = (phaseId: string) => {
    if (!project) return;
    updateMut.mutate({ id: project.id, phase: phaseId });
    toast.success(`Advanced to ${VIDEO_PHASES.find(p => p.id === phaseId)?.label}`);
  };

  return (
    <div>
      <OpsHeader title="Timeline" sub="Phase tracker. Pre-Production → Production → Post-Production." />
      <OpsCard style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          Select project
        </p>
        <select
          value={selected ?? ""}
          onChange={e => setSelected(e.target.value ? Number(e.target.value) : null)}
          style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, width: "100%", maxWidth: 360 }}
        >
          <option value="">— pick one —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name} · {p.projectCode}</option>
          ))}
        </select>
      </OpsCard>

      {project ? (
        <OpsCard>
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 4 }}>{project.name}</p>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: 20 }}>Click a phase to advance.</p>
          <PhaseTracker
            phases={VIDEO_PHASES}
            currentPhaseId={project.phase}
            onSelect={setPhase}
            accent={RED}
            label="Video Production Phase"
          />
        </OpsCard>
      ) : (
        <OpsCard>
          <p style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "20px 0" }}>
            Select a project to see its timeline.
          </p>
        </OpsCard>
      )}
    </div>
  );
}

/* ───────────────────── Assets ───────────────────── */
function AssetsSection() {
  const utils = trpc.useUtils();
  const projectsQuery = trpc.video.projects.list.useQuery();
  const projects = (projectsQuery.data ?? []) as ProjectRow[];
  const [projectId, setProjectId] = useState<number | null>(null);

  useEffect(() => {
    if (projectId == null && projects[0]) setProjectId(projects[0].id);
  }, [projectId, projects]);

  const assetsQuery = trpc.video.assets.list.useQuery(
    projectId != null ? { projectId } : undefined,
    { enabled: projectId != null },
  );
  const assets = (assetsQuery.data ?? []) as AssetRow[];

  const createMut = trpc.video.assets.create.useMutation({
    onSuccess: () => utils.video.assets.list.invalidate(),
  });
  const updateMut = trpc.video.assets.update.useMutation({
    onSuccess: () => utils.video.assets.list.invalidate(),
  });

  const toggle = (idStr: string) => {
    const id = Number(idStr);
    const row = assets.find(a => a.id === id);
    if (!row) return;
    updateMut.mutate({ id, done: !row.done });
  };

  const addAsset = () => {
    if (projectId == null) { toast.error("Select a project first"); return; }
    const label = prompt("Asset label (e.g. 'Raw footage - interview')"); if (!label) return;
    const group = prompt("Group: Footage / Audio / Graphics / Copy", "Footage") as AssetRow["assetGroup"];
    createMut.mutate({
      projectId,
      label,
      assetGroup: group || "Footage",
      done: false,
    });
  };

  const items: AssetItem[] = assets.map(a => ({
    id: String(a.id),
    label: a.label,
    group: a.assetGroup,
    done: a.done,
    path: a.path ?? undefined,
    owner: a.owner ?? undefined,
    note: a.note ?? undefined,
  }));

  return (
    <div>
      <OpsHeader
        title="Assets"
        sub="Track what's in and what's missing. Grouped by type."
        action={
          <button onClick={addAsset} style={btnPrimary}><Plus size={12} /> Add Asset</button>
        }
      />
      <OpsCard style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
          Project
        </p>
        <select
          value={projectId ?? ""}
          onChange={e => setProjectId(e.target.value ? Number(e.target.value) : null)}
          style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 13, width: "100%", maxWidth: 360 }}
        >
          <option value="">— pick one —</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </OpsCard>

      {projectId != null && items.length === 0 ? (
        <OpsCard>
          <p style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "20px 0" }}>
            No assets logged yet.
          </p>
        </OpsCard>
      ) : projectId != null ? (
        <AssetChecklist
          items={items}
          onToggle={toggle}
          grouped
          accent={RED}
          title="Production assets"
          hint="Check items as they arrive."
        />
      ) : null}
    </div>
  );
}

/* ───────────────────── Revisions ───────────────────── */
function RevisionsSection() {
  const utils = trpc.useUtils();
  const revisionsQuery = trpc.video.revisions.list.useQuery();
  const projectsQuery = trpc.video.projects.list.useQuery();
  const rows = (revisionsQuery.data ?? []) as RevisionRow[];
  const projects = (projectsQuery.data ?? []) as ProjectRow[];

  const createMut = trpc.video.revisions.create.useMutation({
    onSuccess: () => utils.video.revisions.list.invalidate(),
  });
  const updateMut = trpc.video.revisions.update.useMutation({
    onSuccess: () => utils.video.revisions.list.invalidate(),
  });
  const removeMut = trpc.video.revisions.remove.useMutation({
    onSuccess: () => utils.video.revisions.list.invalidate(),
  });

  const addRev = () => {
    const projectCode = prompt("Project ID? " + projects.map(p => p.projectCode).join(", "));
    if (!projectCode) return;
    const project = projects.find(p => p.projectCode === projectCode);
    if (!project) { toast.error(`No project with code ${projectCode}`); return; }
    const version = prompt("Version (v1, v2, v3)?", "v1") || "v1";
    const feedback = prompt("Feedback?") || "";
    createMut.mutate({
      projectId: project.id,
      version,
      feedback,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
    });
  };
  const setStatus = (id: number, status: RevisionRow["status"]) => {
    updateMut.mutate({ id, status });
  };

  // Map projectId -> projectCode for display.
  const codeFor = (id: number) => projects.find(p => p.id === id)?.projectCode ?? `#${id}`;

  return (
    <div>
      <OpsHeader
        title="Client Feedback / Revisions"
        sub="v1 / v2 / v3 rounds per project. Track resolution."
        action={<button onClick={addRev} style={btnPrimary}><Plus size={12} /> Log Feedback</button>}
      />
      {rows.length === 0 ? (
        <OpsCard>
          <p style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "20px 0" }}>
            No revisions logged.
          </p>
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(r => (
            <OpsCard key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>
                    {codeFor(r.projectId)} · {r.version} · {r.date}
                  </p>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{r.feedback}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <select value={r.status} onChange={e => setStatus(r.id, e.target.value as any)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${DARK}15`, fontSize: 12, backgroundColor: WHITE }}>
                    <option>Pending</option><option>In Progress</option><option>Resolved</option>
                  </select>
                  <button onClick={() => removeMut.mutate({ id: r.id })} style={{ border: "none", background: "transparent", color: "#DC2626", cursor: "pointer", fontSize: 11 }}>
                    <Trash2 size={12} /> Delete
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

/* ───────────────────── Deliverables ───────────────────── */
function DeliverablesSection() {
  const utils = trpc.useUtils();
  const deliverablesQuery = trpc.video.deliverables.list.useQuery();
  const projectsQuery = trpc.video.projects.list.useQuery();
  const rows = (deliverablesQuery.data ?? []) as DeliverableRow[];
  const projects = (projectsQuery.data ?? []) as ProjectRow[];

  const createMut = trpc.video.deliverables.create.useMutation({
    onSuccess: () => utils.video.deliverables.list.invalidate(),
  });
  const updateMut = trpc.video.deliverables.update.useMutation({
    onSuccess: () => utils.video.deliverables.list.invalidate(),
  });
  const removeMut = trpc.video.deliverables.remove.useMutation({
    onSuccess: () => utils.video.deliverables.list.invalidate(),
  });

  const codeFor = (id: number) => projects.find(p => p.id === id)?.projectCode ?? `#${id}`;

  const addDel = () => {
    const projectCode = prompt("Project ID? " + projects.map(p => p.projectCode).join(", "));
    if (!projectCode) return;
    const project = projects.find(p => p.projectCode === projectCode);
    if (!project) { toast.error(`No project with code ${projectCode}`); return; }
    const kind = (prompt("Kind: MP4, Thumbnail, SRT, Project File, Other", "MP4") || "MP4") as DeliverableRow["kind"];
    const format = prompt("Format (e.g. H.264)?") || "";
    const resolution = prompt("Resolution (e.g. 1920x1080)?") || "";
    createMut.mutate({ projectId: project.id, kind, format, resolution, done: false });
  };
  const toggle = (id: number) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    updateMut.mutate({ id, done: !row.done });
  };

  return (
    <div>
      <OpsHeader
        title="Deliverables"
        sub="Final MP4, thumbnail, SRT captions, project file."
        action={<button onClick={addDel} style={btnPrimary}><Plus size={12} /> Add</button>}
      />
      {rows.length === 0 ? (
        <OpsCard>
          <p style={{ fontSize: 13, color: MUTED, textAlign: "center", padding: "20px 0" }}>
            No deliverables tracked yet.
          </p>
        </OpsCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map(r => (
            <OpsCard key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{r.kind} · {codeFor(r.projectId)}</p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                    {r.format || "—"} · {r.resolution || "—"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => toggle(r.id)} style={{
                    padding: "6px 12px", borderRadius: 999, border: "none",
                    backgroundColor: r.done ? GREEN : `${DARK}10`,
                    color: r.done ? WHITE : DARK,
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    {r.done ? "✓ Delivered" : "Mark delivered"}
                  </button>
                  <button onClick={() => removeMut.mutate({ id: r.id })} style={{ border: "none", background: "transparent", color: "#DC2626", cursor: "pointer" }}>
                    <Trash2 size={13} />
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

/* ───────────────────── Pricing ───────────────────── */
function PricingSection() {
  return (
    <div>
      <OpsHeader title="Pricing & Service Catalog" sub="5 service tiers — from simple edits to full commercials." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {SERVICE_PRICING.map(s => (
          <OpsCard key={s.tier} style={{ padding: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {s.tier}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: DARK }}>{s.price}</p>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{s.note}</p>
          </OpsCard>
        ))}
      </div>
    </div>
  );
}

/* ───────────────── Small form helpers ───────────────── */
const inputStyle: React.CSSProperties = {
  padding: "8px 10px", borderRadius: 8, border: `1px solid ${DARK}15`,
  fontSize: 13, backgroundColor: WHITE, width: "100%",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 999, border: "none",
  backgroundColor: RED, color: WHITE,
  fontSize: 12, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 6,
};
const btnGhost: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 999, border: `1px solid ${DARK}15`,
  backgroundColor: WHITE, color: DARK,
  fontSize: 12, fontWeight: 600, cursor: "pointer",
};

function Lab({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10, color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{l}</span>
      {children}
    </label>
  );
}
function Inp({ v, onChange, type = "text" }: { v: any; onChange: (v: string) => void; type?: string }) {
  return <input type={type} value={v ?? ""} onChange={e => onChange(e.target.value)} style={inputStyle} />;
}
function Sel({ v, onChange, opts }: { v: any; onChange: (v: string) => void; opts: string[] }) {
  return (
    <select value={v ?? ""} onChange={e => onChange(e.target.value)} style={inputStyle}>
      <option value="">—</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Suppress unused import warnings for icons only used as conditional defaults.
void BarChart3;
