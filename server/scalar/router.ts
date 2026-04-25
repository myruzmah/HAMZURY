/**
 * Scalar Ops Portal — tRPC router.
 *
 * Mirrors the 6 localStorage collections that ScalarOpsPortal.tsx used to
 * read/write via opsStore: projects, deliverables, blockers, comms, notes, qaChecks.
 * All procedures are gated to the Scalar unit + senior leadership
 * (founder, ceo, scalar_lead, scalar_staff) — matches ROLE_ACCESS for /scalar/ops.
 *
 * Project ref convention: HMZ-P-XXX (sequential, generated server-side).
 * Children FK on the int `projectId`, not the string `ref`.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  scalarProjects,
  scalarDeliverables,
  scalarBlockers,
  scalarComms,
  scalarNotes,
  scalarQaChecks,
} from "../../drizzle/schema";

// ─── Local procedure builder (scalar ops staff) ────────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const SCALAR_ROLES = ["founder", "ceo", "scalar_lead", "scalar_staff"];

const scalarOpsOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !SCALAR_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Scalar Ops Portal is for the Scalar Unit, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const scalarOpsProcedure = t.procedure.use(scalarOpsOnly);
const router = t.router;

// ─── Helpers ───────────────────────────────────────────────────────────────────
async function db() {
  const conn = await getDb();
  if (!conn) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  }
  return conn;
}

/**
 * Generate the next sequential HMZ-P-XXX ref.
 * Reads existing refs, parses the trailing number, increments, zero-pads to 3.
 * Inlined here so we don't extend the locked generateRef() in db.ts.
 */
async function nextScalarRef(): Promise<string> {
  const conn = await db();
  const rows = await conn.select({ ref: scalarProjects.ref }).from(scalarProjects);
  let max = 0;
  for (const r of rows) {
    const m = /HMZ-P-(\d+)/.exec(r.ref || "");
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return `HMZ-P-${String(max + 1).padStart(3, "0")}`;
}

// ─── Input schemas ─────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const SERVICE_ENUM = ["Website", "App", "Automation"] as const;
const STATUS_ENUM = ["Queued", "In Progress", "On Hold", "Completed", "Cancelled"] as const;
const LEAD_ENUM = ["Dajot", "Felix", ""] as const;

/** Project create input — `ref` is omitted; server generates it. */
const projectCreateIn = z.object({
  clientName: z.string().min(1).max(255),
  clientContact: z.string().max(255).optional().nullable(),
  clientEmail: z.string().max(255).optional().nullable(),
  clientPhone: z.string().max(50).optional().nullable(),
  service: z.enum(SERVICE_ENUM).optional().default("Website"),
  status: z.enum(STATUS_ENUM).optional().default("Queued"),
  week: z.number().int().nonnegative().optional().nullable(),
  phaseId: z.string().max(40).optional().nullable(),
  lead: z.enum(LEAD_ENUM).optional().default(""),
  startDate: z.string().max(10).optional().nullable(),
  targetDelivery: z.string().max(10).optional().nullable(),
  actualDelivery: z.string().max(10).optional().nullable(),
  projectValue: z.number().int().nonnegative().optional().nullable(),
  scope: z.string().max(8000).optional().nullable(),
  goals: z.string().max(8000).optional().nullable(),
});

/** Project update input — same as create, plus optional `ref` override. */
const projectUpdateIn = projectCreateIn.partial().extend({
  ref: z.string().max(20).optional(),
});

const deliverableIn = z.object({
  projectId: z.number().int().positive(),
  label: z.string().min(1).max(255),
  description: z.string().max(8000).optional().nullable(),
  dueDate: z.string().max(10).optional().nullable(),
  done: z.boolean().optional().default(false),
  deliveredAt: z.string().max(10).optional().nullable(),
  clientApproved: z.boolean().optional().default(false),
  groupName: z.string().max(80).optional().nullable(),
  owner: z.string().max(120).optional().nullable(),
  path: z.string().max(1024).optional().nullable(),
});

const blockerIn = z.object({
  projectId: z.number().int().positive(),
  issue: z.string().min(1).max(8000),
  impact: z.string().max(8000).optional().nullable(),
  status: z.enum(["Open", "Resolved"]).optional().default("Open"),
  resolution: z.string().max(8000).optional().nullable(),
  resolvedAt: z.string().max(10).optional().nullable(),
});

const commIn = z.object({
  projectId: z.number().int().positive(),
  date: z.string().min(8).max(10),
  commType: z.string().min(1).max(80),
  summary: z.string().min(1).max(8000),
  actionItems: z.string().max(8000).optional().nullable(),
  followUpDate: z.string().max(10).optional().nullable(),
});

const noteIn = z.object({
  projectId: z.number().int().positive(),
  date: z.string().min(8).max(10),
  body: z.string().min(1).max(8000),
  decidedBy: z.string().max(255).optional().nullable(),
  impact: z.string().max(8000).optional().nullable(),
});

const qaCheckIn = z.object({
  projectId: z.number().int().positive(),
  feature: z.string().min(1).max(255),
  testCase: z.string().min(1).max(8000),
  expected: z.string().max(8000).optional().nullable(),
  actual: z.string().max(8000).optional().nullable(),
  status: z.enum(["Not Tested", "Pass", "Fail", "Fixed"]).optional().default("Not Tested"),
  bug: z.string().max(8000).optional().nullable(),
  fixedAt: z.string().max(10).optional().nullable(),
});

// ─── Sub-routers ───────────────────────────────────────────────────────────────
const projectsRouter = router({
  list: scalarOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(scalarProjects).orderBy(desc(scalarProjects.createdAt));
  }),
  create: scalarOpsProcedure.input(projectCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const ref = await nextScalarRef();
    await conn.insert(scalarProjects).values({ ...input, ref } as any);
    return { success: true, ref };
  }),
  update: scalarOpsProcedure
    .input(idIn.merge(projectUpdateIn))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(scalarProjects).set(patch as any).where(eq(scalarProjects.id, id));
      return { success: true };
    }),
  remove: scalarOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    // Cascade in app code: drop child rows referencing this project.
    await conn.delete(scalarDeliverables).where(eq(scalarDeliverables.projectId, input.id));
    await conn.delete(scalarBlockers).where(eq(scalarBlockers.projectId, input.id));
    await conn.delete(scalarComms).where(eq(scalarComms.projectId, input.id));
    await conn.delete(scalarNotes).where(eq(scalarNotes.projectId, input.id));
    await conn.delete(scalarQaChecks).where(eq(scalarQaChecks.projectId, input.id));
    await conn.delete(scalarProjects).where(eq(scalarProjects.id, input.id));
    return { success: true };
  }),
});

const deliverablesRouter = router({
  list: scalarOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(scalarDeliverables)
          .where(eq(scalarDeliverables.projectId, input.projectId))
          .orderBy(desc(scalarDeliverables.createdAt));
      }
      return conn.select().from(scalarDeliverables).orderBy(desc(scalarDeliverables.createdAt));
    }),
  create: scalarOpsProcedure.input(deliverableIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(scalarDeliverables).values(input as any);
    return { success: true };
  }),
  update: scalarOpsProcedure
    .input(idIn.merge(deliverableIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(scalarDeliverables).set(patch as any).where(eq(scalarDeliverables.id, id));
      return { success: true };
    }),
  remove: scalarOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(scalarDeliverables).where(eq(scalarDeliverables.id, input.id));
    return { success: true };
  }),
});

const blockersRouter = router({
  list: scalarOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(scalarBlockers)
          .where(eq(scalarBlockers.projectId, input.projectId))
          .orderBy(desc(scalarBlockers.createdAt));
      }
      return conn.select().from(scalarBlockers).orderBy(desc(scalarBlockers.createdAt));
    }),
  create: scalarOpsProcedure.input(blockerIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(scalarBlockers).values(input as any);
    return { success: true };
  }),
  update: scalarOpsProcedure
    .input(idIn.merge(blockerIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(scalarBlockers).set(patch as any).where(eq(scalarBlockers.id, id));
      return { success: true };
    }),
  remove: scalarOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(scalarBlockers).where(eq(scalarBlockers.id, input.id));
    return { success: true };
  }),
});

const commsRouter = router({
  list: scalarOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(scalarComms)
          .where(eq(scalarComms.projectId, input.projectId))
          .orderBy(desc(scalarComms.date));
      }
      return conn.select().from(scalarComms).orderBy(desc(scalarComms.date));
    }),
  create: scalarOpsProcedure.input(commIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(scalarComms).values(input as any);
    return { success: true };
  }),
  update: scalarOpsProcedure
    .input(idIn.merge(commIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(scalarComms).set(patch as any).where(eq(scalarComms.id, id));
      return { success: true };
    }),
  remove: scalarOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(scalarComms).where(eq(scalarComms.id, input.id));
    return { success: true };
  }),
});

const notesRouter = router({
  list: scalarOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(scalarNotes)
          .where(eq(scalarNotes.projectId, input.projectId))
          .orderBy(desc(scalarNotes.date));
      }
      return conn.select().from(scalarNotes).orderBy(desc(scalarNotes.date));
    }),
  create: scalarOpsProcedure.input(noteIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(scalarNotes).values(input as any);
    return { success: true };
  }),
  update: scalarOpsProcedure
    .input(idIn.merge(noteIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(scalarNotes).set(patch as any).where(eq(scalarNotes.id, id));
      return { success: true };
    }),
  remove: scalarOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(scalarNotes).where(eq(scalarNotes.id, input.id));
    return { success: true };
  }),
});

const qaChecksRouter = router({
  list: scalarOpsProcedure
    .input(z.object({ projectId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.projectId) {
        return conn.select().from(scalarQaChecks)
          .where(eq(scalarQaChecks.projectId, input.projectId))
          .orderBy(desc(scalarQaChecks.createdAt));
      }
      return conn.select().from(scalarQaChecks).orderBy(desc(scalarQaChecks.createdAt));
    }),
  create: scalarOpsProcedure.input(qaCheckIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(scalarQaChecks).values(input as any);
    return { success: true };
  }),
  update: scalarOpsProcedure
    .input(idIn.merge(qaCheckIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(scalarQaChecks).set(patch as any).where(eq(scalarQaChecks.id, id));
      return { success: true };
    }),
  remove: scalarOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(scalarQaChecks).where(eq(scalarQaChecks.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level scalar router ───────────────────────────────────────────────────
export const scalarRouter = router({
  projects: projectsRouter,
  deliverables: deliverablesRouter,
  blockers: blockersRouter,
  comms: commsRouter,
  notes: notesRouter,
  qaChecks: qaChecksRouter,
});
