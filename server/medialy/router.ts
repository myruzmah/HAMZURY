/**
 * Medialy Ops Portal — tRPC router.
 *
 * Mirrors the 7 localStorage collections that MedialyOpsPortal.tsx used to
 * read/write via opsStore: clients, content, approvals, tasks, performance,
 * comms, reports. All procedures are gated to the Medialy Unit + senior
 * leadership (founder, ceo, medialy_lead, medialy_staff) — matches
 * ROLE_ACCESS for /medialy/ops.
 *
 * Distinct namespaces:
 *   - `medialy_clients`     — retainer clients (NOT the CRM `clients` table).
 *   - `medialy_performance` — client-scoped weekly/monthly entries
 *     (NOT the existing `socialPlatformStats` table).
 *
 * Two server-generated ref formats:
 *   - approvals.ref → "CNT-NNN" via nextMedialyContentRef()
 *   - tasks.ref     → "TSK-NNN" via nextMedialyTaskRef()
 * Inlined helpers (NOT extending generateRef in db.ts — locked).
 *
 * The `platforms` field on clients is JSON-stringified Platform[] —
 * serialised on write, parsed on read so the client receives a real array.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  medialyClients,
  medialyContent,
  medialyApprovals,
  medialyTasks,
  medialyPerformance,
  medialyComms,
  medialyReports,
} from "../../drizzle/schema";

// ─── Local procedure builder (medialy ops staff) ──────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const MEDIALY_ROLES = ["founder", "ceo", "medialy_lead", "medialy_staff"];

const medialyOpsOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !MEDIALY_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Medialy Ops Portal is for the Medialy Unit, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const medialyOpsProcedure = t.procedure.use(medialyOpsOnly);
const router = t.router;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function db() {
  const conn = await getDb();
  if (!conn) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  }
  return conn;
}

/** Serialise a string[] to JSON for storage. Returns null if empty. */
function serializePlatforms(arr: string[] | undefined | null): string | null {
  if (!arr || arr.length === 0) return null;
  try { return JSON.stringify(arr); }
  catch { return null; }
}

/** Parse a stored JSON string back to string[] (or [] on failure). */
function parsePlatforms(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(x => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Generate the next sequential CNT-NNN ref for medialy_approvals.
 * Reads existing refs, parses the trailing number, increments, zero-pads to 3.
 * Inlined here so we don't extend the locked generateRef() in db.ts.
 */
async function nextMedialyContentRef(): Promise<string> {
  const conn = await db();
  const rows = await conn.select({ ref: medialyApprovals.ref }).from(medialyApprovals);
  let max = 0;
  for (const r of rows) {
    const m = /CNT-(\d+)/.exec(r.ref || "");
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `CNT-${String(max + 1).padStart(3, "0")}`;
}

/**
 * Generate the next sequential TSK-NNN ref for medialy_tasks.
 * Same pattern as nextMedialyContentRef but on the medialy_tasks.ref column.
 */
async function nextMedialyTaskRef(): Promise<string> {
  const conn = await db();
  const rows = await conn.select({ ref: medialyTasks.ref }).from(medialyTasks);
  let max = 0;
  for (const r of rows) {
    const m = /TSK-(\d+)/.exec(r.ref || "");
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `TSK-${String(max + 1).padStart(3, "0")}`;
}

// ─── Enums ────────────────────────────────────────────────────────────────────
const TIER_ENUM = ["Setup", "Manage", "Accelerate", "Authority"] as const;
const PAY_STATUS_ENUM = ["Paid", "Due", "Overdue"] as const;
const PLATFORM_ENUM = [
  "Instagram", "TikTok", "Facebook", "LinkedIn", "Twitter", "YouTube",
] as const;
const POST_TYPE_ENUM = [
  "Feed", "Reel", "Story", "Carousel", "Flyer", "Video",
] as const;
const CONTENT_STATUS_ENUM = [
  "Draft", "Review", "Approved", "Scheduled", "Posted",
] as const;
const ASSIGNEE_ENUM = ["Hikma", "Ahmad", "Salis"] as const;
const APPROVAL_STATUS_ENUM = [
  "Pending", "Changes Requested", "Approved", "Rejected",
] as const;
const TASK_TYPE_ENUM = [
  "Content Creation", "Photography", "Reporting", "Meeting", "Editing", "Admin",
] as const;
const TASK_STATUS_ENUM = [
  "Not Started", "In Progress", "Done", "Blocked",
] as const;
const PERIOD_ENUM = ["Week", "Month"] as const;
const COMMS_TYPE_ENUM = [
  "WhatsApp", "Video Call", "Email", "Phone", "In Person",
] as const;

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const clientCreateIn = z.object({
  name: z.string().min(1).max(255),
  brand: z.string().max(255).optional().nullable(),
  tier: z.enum(TIER_ENUM).optional().default("Manage"),
  monthlyFee: z.number().int().nonnegative().optional().default(0),
  /** Client passes a real array; server stringifies it for storage. */
  platforms: z.array(z.enum(PLATFORM_ENUM)).optional().nullable(),
  postsPerMonth: z.number().int().nonnegative().optional().default(0),
  postsRemaining: z.number().int().nonnegative().optional().default(0),
  paymentStatus: z.enum(PAY_STATUS_ENUM).optional().default("Paid"),
  nextPaymentDue: z.string().max(10).optional().nullable(),
  satisfaction: z.number().int().min(1).max(5).optional().default(5),
  startedAt: z.string().max(10).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const contentCreateIn = z.object({
  clientId: z.number().int().positive(),
  date: z.string().min(8).max(10),
  platform: z.enum(PLATFORM_ENUM).optional().default("Instagram"),
  postType: z.enum(POST_TYPE_ENUM).optional().default("Feed"),
  caption: z.string().max(8000).optional().nullable(),
  hashtags: z.string().max(8000).optional().nullable(),
  assetLink: z.string().max(1024).optional().nullable(),
  status: z.enum(CONTENT_STATUS_ENUM).optional().default("Draft"),
  postTime: z.string().max(10).optional().nullable(),
  assignee: z.enum(ASSIGNEE_ENUM).optional().default("Ahmad"),
  likes: z.number().int().nonnegative().optional().nullable(),
  comments: z.number().int().nonnegative().optional().nullable(),
  shares: z.number().int().nonnegative().optional().nullable(),
  engagementPct: z.number().int().nonnegative().optional().nullable(),
});

/** Approval create input — `ref` is omitted; server generates CNT-NNN. */
const approvalCreateIn = z.object({
  clientId: z.number().int().positive(),
  clientName: z.string().min(1).max(255),
  weekLabel: z.string().min(1).max(80),
  itemCount: z.number().int().nonnegative().optional().default(0),
  previewLink: z.string().max(1024).optional().nullable(),
  submittedAt: z.string().max(10).optional().nullable(),
  feedback: z.string().max(8000).optional().nullable(),
  revisionCount: z.number().int().nonnegative().optional().default(0),
  approvedAt: z.string().max(10).optional().nullable(),
  status: z.enum(APPROVAL_STATUS_ENUM).optional().default("Pending"),
});

/** Task create input — `ref` is omitted; server generates TSK-NNN. */
const taskCreateIn = z.object({
  title: z.string().min(1).max(255),
  taskType: z.enum(TASK_TYPE_ENUM).optional().default("Content Creation"),
  clientId: z.number().int().positive().optional().nullable(),
  assignee: z.string().min(1).max(120),
  dueDate: z.string().min(8).max(10),
  status: z.enum(TASK_STATUS_ENUM).optional().default("Not Started"),
  notes: z.string().max(8000).optional().nullable(),
});

const performanceCreateIn = z.object({
  clientId: z.number().int().positive(),
  period: z.enum(PERIOD_ENUM).optional().default("Week"),
  label: z.string().min(1).max(80),
  reach: z.number().int().nonnegative().optional().default(0),
  engagement: z.number().int().nonnegative().optional().default(0),
  followerGrowthPct: z.number().int().optional().default(0),
  bestPost: z.string().max(1024).optional().nullable(),
  worstPost: z.string().max(1024).optional().nullable(),
  platformBreakdown: z.string().max(8000).optional().nullable(),
  bestContentType: z.enum(POST_TYPE_ENUM).optional().nullable(),
});

const commsCreateIn = z.object({
  clientId: z.number().int().positive(),
  whenDate: z.string().min(8).max(10),
  commType: z.enum(COMMS_TYPE_ENUM).optional().default("WhatsApp"),
  summary: z.string().min(1).max(8000),
  followUpOn: z.string().max(10).optional().nullable(),
  owner: z.enum(ASSIGNEE_ENUM).optional().default("Hikma"),
});

const reportCreateIn = z.object({
  label: z.string().min(1).max(255),
  weekOf: z.string().min(8).max(10),
  body: z.string().min(1),
});

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const clientsRouter = router({
  list: medialyOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(medialyClients).orderBy(desc(medialyClients.createdAt));
    // Parse JSON `platforms` so the client always sees a real array.
    return rows.map(r => ({ ...r, platforms: parsePlatforms(r.platforms) }));
  }),
  create: medialyOpsProcedure.input(clientCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { platforms, ...rest } = input;
    await conn.insert(medialyClients).values({
      ...rest,
      platforms: serializePlatforms(platforms ?? null),
    } as any);
    return { success: true };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(clientCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, platforms, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      // Only touch `platforms` if it was actually included in the input.
      if (platforms !== undefined) {
        finalPatch.platforms = serializePlatforms(platforms);
      }
      await conn.update(medialyClients).set(finalPatch as any).where(eq(medialyClients.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    // No cascade — original behaviour was "will not delete linked content".
    await conn.delete(medialyClients).where(eq(medialyClients.id, input.id));
    return { success: true };
  }),
});

const contentRouter = router({
  list: medialyOpsProcedure
    .input(z.object({ clientId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.clientId) {
        return conn.select().from(medialyContent)
          .where(eq(medialyContent.clientId, input.clientId))
          .orderBy(desc(medialyContent.createdAt));
      }
      return conn.select().from(medialyContent).orderBy(desc(medialyContent.createdAt));
    }),
  create: medialyOpsProcedure.input(contentCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(medialyContent).values(input as any);
    return { success: true };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(contentCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(medialyContent).set(patch as any).where(eq(medialyContent.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(medialyContent).where(eq(medialyContent.id, input.id));
    return { success: true };
  }),
});

const approvalsRouter = router({
  list: medialyOpsProcedure
    .input(z.object({ clientId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.clientId) {
        return conn.select().from(medialyApprovals)
          .where(eq(medialyApprovals.clientId, input.clientId))
          .orderBy(desc(medialyApprovals.createdAt));
      }
      return conn.select().from(medialyApprovals).orderBy(desc(medialyApprovals.createdAt));
    }),
  create: medialyOpsProcedure.input(approvalCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const ref = await nextMedialyContentRef();
    await conn.insert(medialyApprovals).values({ ...input, ref } as any);
    return { success: true, ref };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(approvalCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(medialyApprovals).set(patch as any).where(eq(medialyApprovals.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(medialyApprovals).where(eq(medialyApprovals.id, input.id));
    return { success: true };
  }),
});

const tasksRouter = router({
  list: medialyOpsProcedure
    .input(z.object({ clientId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.clientId) {
        return conn.select().from(medialyTasks)
          .where(eq(medialyTasks.clientId, input.clientId))
          .orderBy(desc(medialyTasks.createdAt));
      }
      return conn.select().from(medialyTasks).orderBy(desc(medialyTasks.createdAt));
    }),
  create: medialyOpsProcedure.input(taskCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const ref = await nextMedialyTaskRef();
    await conn.insert(medialyTasks).values({ ...input, ref } as any);
    return { success: true, ref };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(taskCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(medialyTasks).set(patch as any).where(eq(medialyTasks.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(medialyTasks).where(eq(medialyTasks.id, input.id));
    return { success: true };
  }),
});

const performanceRouter = router({
  list: medialyOpsProcedure
    .input(z.object({ clientId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.clientId) {
        return conn.select().from(medialyPerformance)
          .where(eq(medialyPerformance.clientId, input.clientId))
          .orderBy(desc(medialyPerformance.createdAt));
      }
      return conn.select().from(medialyPerformance).orderBy(desc(medialyPerformance.createdAt));
    }),
  create: medialyOpsProcedure.input(performanceCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(medialyPerformance).values(input as any);
    return { success: true };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(performanceCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(medialyPerformance).set(patch as any).where(eq(medialyPerformance.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(medialyPerformance).where(eq(medialyPerformance.id, input.id));
    return { success: true };
  }),
});

const commsRouter = router({
  list: medialyOpsProcedure
    .input(z.object({ clientId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.clientId) {
        return conn.select().from(medialyComms)
          .where(eq(medialyComms.clientId, input.clientId))
          .orderBy(desc(medialyComms.whenDate));
      }
      return conn.select().from(medialyComms).orderBy(desc(medialyComms.whenDate));
    }),
  create: medialyOpsProcedure.input(commsCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(medialyComms).values(input as any);
    return { success: true };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(commsCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(medialyComms).set(patch as any).where(eq(medialyComms.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(medialyComms).where(eq(medialyComms.id, input.id));
    return { success: true };
  }),
});

const reportsRouter = router({
  list: medialyOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(medialyReports).orderBy(desc(medialyReports.createdAt));
  }),
  create: medialyOpsProcedure.input(reportCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(medialyReports).values(input as any);
    return { success: true };
  }),
  update: medialyOpsProcedure
    .input(idIn.merge(reportCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(medialyReports).set(patch as any).where(eq(medialyReports.id, id));
      return { success: true };
    }),
  remove: medialyOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(medialyReports).where(eq(medialyReports.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level medialy router ─────────────────────────────────────────────────
export const medialyRouter = router({
  clients: clientsRouter,
  content: contentRouter,
  approvals: approvalsRouter,
  tasks: tasksRouter,
  performance: performanceRouter,
  comms: commsRouter,
  reports: reportsRouter,
});
