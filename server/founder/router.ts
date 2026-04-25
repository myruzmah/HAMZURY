/**
 * Founder Portal — tRPC router.
 *
 * Mirrors the 6 localStorage collections that FounderPortal.tsx used to
 * read/write via opsStore. All procedures are gated to the founder
 * (matched by hamzuryRole === "founder"). CEO is intentionally excluded
 * from the vault — it holds personal accounts/recovery info.
 *
 * Encrypted fields (founder_vault.secret, founder_vault.recovery) use
 * server/_core/crypto.ts (AES-256-GCM). The router encrypts on write and
 * decrypts on read so the client never sees raw blobs.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import { decryptString, encryptString } from "../_core/crypto";
import {
  founderDebtPayments,
  founderScheduleChecks,
  founderContent,
  founderLearning,
  founderMilestones,
  founderVault,
} from "../../drizzle/schema";

// ─── Local procedure builder (founder-only) ────────────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const founderOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (ctx.user.hamzuryRole !== "founder") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Founder Portal is for the Founder only." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const founderProcedure = t.procedure.use(founderOnly);
const router = t.router;

// ─── Helpers ───────────────────────────────────────────────────────────────────
async function db() {
  const conn = await getDb();
  if (!conn) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return conn;
}

// ─── Schemas (input validation) ────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const debtPaymentIn = z.object({
  date: z.string().min(8).max(10),
  amount: z.number().int().nonnegative(),
  source: z.string().min(1).max(255),
  notes: z.string().max(2000).optional().nullable(),
});

const scheduleCheckIn = z.object({
  week: z.string().min(7).max(10),  // e.g. "2026-W17"
  slot: z.string().min(1).max(200),
  done: z.boolean().optional().default(true),
});

const contentIn = z.object({
  date: z.string().min(8).max(10),
  platform: z.string().min(1).max(80),
  contentType: z.string().min(1).max(80),
  theme: z.string().max(255).optional().nullable(),
  mentor: z.string().max(120).optional().nullable(),
  posted: z.string().min(1).max(20),
  engagement: z.string().max(100).optional().nullable(),
  saved: z.boolean().optional().default(false),
  notes: z.string().max(4000).optional().nullable(),
});

const learningIn = z.object({
  date: z.string().min(8).max(10),
  source: z.string().min(1).max(255),
  mentor: z.string().max(120).optional().nullable(),
  lesson: z.string().min(1).max(8000),
  screenshot: z.boolean().optional().default(false),
  whyWorth: z.string().max(4000).optional().nullable(),
  howApply: z.string().max(4000).optional().nullable(),
  applied: z.enum(["Not Yet", "In Progress", "Yes"]).optional().default("Not Yet"),
});

const milestoneIn = z.object({
  label: z.string().min(1).max(255),
  target: z.string().max(10).optional().nullable(),
  status: z.enum(["Not Started", "Planning", "In Progress", "Done"]).optional().default("Not Started"),
});

const vaultIn = z.object({
  kind: z.enum(["account", "doc"]).default("account"),
  service: z.string().min(1).max(255),
  username: z.string().max(255).optional().nullable(),
  secret: z.string().max(4000).optional().nullable(),
  securityQ: z.string().max(2000).optional().nullable(),
  recovery: z.string().max(4000).optional().nullable(),
  storageLocation: z.string().max(255).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

// ─── Vault encrypt/decrypt helpers ─────────────────────────────────────────────
type VaultRow = typeof founderVault.$inferSelect;
function encryptVaultFields<T extends Partial<typeof founderVault.$inferInsert>>(input: T): T {
  const out: any = { ...input };
  if (typeof input.secret === "string" && input.secret.length > 0) out.secret = encryptString(input.secret);
  if (typeof input.recovery === "string" && input.recovery.length > 0) out.recovery = encryptString(input.recovery);
  return out;
}
function decryptVaultRow(r: VaultRow): VaultRow {
  return {
    ...r,
    secret: r.secret ? decryptString(r.secret) : r.secret,
    recovery: r.recovery ? decryptString(r.recovery) : r.recovery,
  };
}

// ─── Sub-routers ───────────────────────────────────────────────────────────────
const debtRouter = router({
  list: founderProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(founderDebtPayments).orderBy(desc(founderDebtPayments.date));
  }),
  create: founderProcedure.input(debtPaymentIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(founderDebtPayments).values(input);
    return { success: true };
  }),
  update: founderProcedure.input(idIn.merge(debtPaymentIn.partial())).mutation(async ({ input }) => {
    const conn = await db();
    const { id, ...patch } = input;
    await conn.update(founderDebtPayments).set(patch).where(eq(founderDebtPayments.id, id));
    return { success: true };
  }),
  remove: founderProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(founderDebtPayments).where(eq(founderDebtPayments.id, input.id));
    return { success: true };
  }),
});

const scheduleRouter = router({
  /** List checks for an ISO week. */
  list: founderProcedure
    .input(z.object({ week: z.string().min(7).max(10).optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      const q = conn.select().from(founderScheduleChecks);
      if (input?.week) {
        return q.where(eq(founderScheduleChecks.week, input.week));
      }
      return q;
    }),
  /** Toggle a slot for a week — upserts the (week, slot) pair. */
  toggle: founderProcedure.input(scheduleCheckIn).mutation(async ({ input }) => {
    const conn = await db();
    // Manual upsert: try update first, insert on no-match.
    const existing = await conn.select().from(founderScheduleChecks)
      .where(and(eq(founderScheduleChecks.week, input.week), eq(founderScheduleChecks.slot, input.slot)))
      .limit(1);
    if (existing.length > 0) {
      await conn.update(founderScheduleChecks)
        .set({ done: input.done ?? true })
        .where(eq(founderScheduleChecks.id, existing[0].id));
    } else {
      await conn.insert(founderScheduleChecks).values({ week: input.week, slot: input.slot, done: input.done ?? true });
    }
    return { success: true };
  }),
  remove: founderProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(founderScheduleChecks).where(eq(founderScheduleChecks.id, input.id));
    return { success: true };
  }),
});

const contentRouter = router({
  list: founderProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(founderContent).orderBy(desc(founderContent.date));
  }),
  create: founderProcedure.input(contentIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(founderContent).values(input);
    return { success: true };
  }),
  update: founderProcedure.input(idIn.merge(contentIn.partial())).mutation(async ({ input }) => {
    const conn = await db();
    const { id, ...patch } = input;
    await conn.update(founderContent).set(patch).where(eq(founderContent.id, id));
    return { success: true };
  }),
  remove: founderProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(founderContent).where(eq(founderContent.id, input.id));
    return { success: true };
  }),
});

const learningRouter = router({
  list: founderProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(founderLearning).orderBy(desc(founderLearning.date));
  }),
  create: founderProcedure.input(learningIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(founderLearning).values(input);
    return { success: true };
  }),
  update: founderProcedure.input(idIn.merge(learningIn.partial())).mutation(async ({ input }) => {
    const conn = await db();
    const { id, ...patch } = input;
    await conn.update(founderLearning).set(patch).where(eq(founderLearning.id, id));
    return { success: true };
  }),
  remove: founderProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(founderLearning).where(eq(founderLearning.id, input.id));
    return { success: true };
  }),
});

const milestoneRouter = router({
  list: founderProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(founderMilestones).orderBy(desc(founderMilestones.target));
  }),
  create: founderProcedure.input(milestoneIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(founderMilestones).values(input);
    return { success: true };
  }),
  update: founderProcedure.input(idIn.merge(milestoneIn.partial())).mutation(async ({ input }) => {
    const conn = await db();
    const { id, ...patch } = input;
    await conn.update(founderMilestones).set(patch).where(eq(founderMilestones.id, id));
    return { success: true };
  }),
  remove: founderProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(founderMilestones).where(eq(founderMilestones.id, input.id));
    return { success: true };
  }),
});

const vaultRouter = router({
  /** Returns rows with secret/recovery decrypted. */
  list: founderProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(founderVault).orderBy(desc(founderVault.createdAt));
    return rows.map(decryptVaultRow);
  }),
  create: founderProcedure.input(vaultIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(founderVault).values(encryptVaultFields(input));
    return { success: true };
  }),
  update: founderProcedure.input(idIn.merge(vaultIn.partial())).mutation(async ({ input }) => {
    const conn = await db();
    const { id, ...patch } = input;
    await conn.update(founderVault).set(encryptVaultFields(patch)).where(eq(founderVault.id, id));
    return { success: true };
  }),
  remove: founderProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(founderVault).where(eq(founderVault.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level founder router ──────────────────────────────────────────────────
export const founderRouter = router({
  debt: debtRouter,
  schedule: scheduleRouter,
  content: contentRouter,
  learning: learningRouter,
  milestones: milestoneRouter,
  vault: vaultRouter,
});
