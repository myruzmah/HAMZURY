/**
 * Video Ops Portal — tRPC router.
 *
 * Mirrors the 4 localStorage collections that VideoOpsPortal.tsx used to
 * read/write via opsStore: projects, assets, revisions, deliverables.
 * All procedures are gated to the video unit + senior leadership
 * (founder, ceo, video_lead, video_staff) — matches ROLE_ACCESS for /video/ops.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  videoProjects,
  videoAssets,
  videoRevisions,
  videoDeliverables,
} from "../../drizzle/schema";

// ─── Local procedure builder (video ops staff) ─────────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const VIDEO_ROLES = ["founder", "ceo", "video_lead", "video_staff"];

const videoOpsOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !VIDEO_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Video Ops Portal is for the Video Unit, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const videoOpsProcedure = t.procedure.use(videoOpsOnly);
const router = t.router;

// ─── Helpers ───────────────────────────────────────────────────────────────────
async function db() {
  const conn = await getDb();
  if (!conn) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  }
  return conn;
}

// ─── Input schemas ─────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const SERVICE_TAGS = ["Editing", "Color", "Sound", "Animation", "Full Production"] as const;

const projectIn = z.object({
  name: z.string().min(1).max(255),
  client: z.string().max(255).optional().default(""),
  projectCode: z.string().max(80).optional().default(""),
  deliveryDate: z.string().max(10).optional().default(""),
  budget: z.number().int().nonnegative().optional().default(0),
  services: z.array(z.enum(SERVICE_TAGS)).optional().default(["Editing"]),
  status: z.enum(["Pre", "Production", "Post", "Delivered"]).optional().default("Pre"),
  phase: z.string().max(40).optional().default("script"),
  owner: z.enum(["Salis", "Client"]).optional().default("Salis"),
});

const assetIn = z.object({
  projectId: z.number().int().positive(),
  label: z.string().min(1).max(255),
  assetGroup: z.enum(["Footage", "Audio", "Graphics", "Copy"]).optional().default("Footage"),
  done: z.boolean().optional().default(false),
  path: z.string().max(1024).optional().nullable(),
  owner: z.string().max(120).optional().nullable(),
  note: z.string().max(4000).optional().nullable(),
});

const revisionIn = z.object({
  projectId: z.number().int().positive(),
  version: z.string().min(1).max(20),
  feedback: z.string().min(1).max(8000),
  status: z.enum(["Pending", "In Progress", "Resolved"]).optional().default("Pending"),
  date: z.string().min(8).max(10),
});

const deliverableIn = z.object({
  projectId: z.number().int().positive(),
  kind: z.enum(["MP4", "Thumbnail", "SRT", "Project File", "Other"]).optional().default("MP4"),
  path: z.string().max(1024).optional().nullable(),
  format: z.string().max(80).optional().nullable(),
  resolution: z.string().max(80).optional().nullable(),
  done: z.boolean().optional().default(false),
});

// ─── Project (de)serialisation: services array <-> JSON text ──────────────────
function serializeProjectInput<T extends { services?: string[] }>(input: T): T & { services?: string } {
  const out: any = { ...input };
  if (Array.isArray(input.services)) out.services = JSON.stringify(input.services);
  return out;
}
type ProjectRow = typeof videoProjects.$inferSelect;
function deserializeProjectRow(row: ProjectRow) {
  let services: string[] = [];
  try {
    if (row.services) services = JSON.parse(row.services);
  } catch { services = []; }
  return { ...row, services };
}

// ─── Sub-routers ───────────────────────────────────────────────────────────────
const projectsRouter = router({
  list: videoOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(videoProjects).orderBy(desc(videoProjects.createdAt));
    return rows.map(deserializeProjectRow);
  }),
  create: videoOpsProcedure.input(projectIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(videoProjects).values(serializeProjectInput(input) as any);
    return { success: true };
  }),
  update: videoOpsProcedure
    .input(idIn.merge(projectIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(videoProjects)
        .set(serializeProjectInput(patch) as any)
        .where(eq(videoProjects.id, id));
      return { success: true };
    }),
  remove: videoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    // Cascade in app code: drop child rows referencing this project.
    await conn.delete(videoAssets).where(eq(videoAssets.projectId, input.id));
    await conn.delete(videoRevisions).where(eq(videoRevisions.projectId, input.id));
    await conn.delete(videoDeliverables).where(eq(videoDeliverables.projectId, input.id));
    await conn.delete(videoProjects).where(eq(videoProjects.id, input.id));
    return { success: true };
  }),
});

const assetsRouter = router({
  list: videoOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(videoAssets)
          .where(eq(videoAssets.projectId, input.projectId))
          .orderBy(desc(videoAssets.createdAt));
      }
      return conn.select().from(videoAssets).orderBy(desc(videoAssets.createdAt));
    }),
  create: videoOpsProcedure.input(assetIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(videoAssets).values(input);
    return { success: true };
  }),
  update: videoOpsProcedure
    .input(idIn.merge(assetIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(videoAssets).set(patch).where(eq(videoAssets.id, id));
      return { success: true };
    }),
  remove: videoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(videoAssets).where(eq(videoAssets.id, input.id));
    return { success: true };
  }),
});

const revisionsRouter = router({
  list: videoOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(videoRevisions)
          .where(eq(videoRevisions.projectId, input.projectId))
          .orderBy(desc(videoRevisions.date));
      }
      return conn.select().from(videoRevisions).orderBy(desc(videoRevisions.date));
    }),
  create: videoOpsProcedure.input(revisionIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(videoRevisions).values(input);
    return { success: true };
  }),
  update: videoOpsProcedure
    .input(idIn.merge(revisionIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(videoRevisions).set(patch).where(eq(videoRevisions.id, id));
      return { success: true };
    }),
  remove: videoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(videoRevisions).where(eq(videoRevisions.id, input.id));
    return { success: true };
  }),
});

const deliverablesRouter = router({
  list: videoOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(videoDeliverables)
          .where(eq(videoDeliverables.projectId, input.projectId))
          .orderBy(desc(videoDeliverables.createdAt));
      }
      return conn.select().from(videoDeliverables).orderBy(desc(videoDeliverables.createdAt));
    }),
  create: videoOpsProcedure.input(deliverableIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(videoDeliverables).values(input);
    return { success: true };
  }),
  update: videoOpsProcedure
    .input(idIn.merge(deliverableIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(videoDeliverables).set(patch).where(eq(videoDeliverables.id, id));
      return { success: true };
    }),
  remove: videoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(videoDeliverables).where(eq(videoDeliverables.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level video router ────────────────────────────────────────────────────
export const videoRouter = router({
  projects: projectsRouter,
  assets: assetsRouter,
  revisions: revisionsRouter,
  deliverables: deliverablesRouter,
});
