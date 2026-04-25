/**
 * Finance Ops Portal — tRPC router (restored sections).
 *
 * Restores the 1 section that was cut from client/src/pages/FinancePortal.tsx
 * for launch (monthly report archive — was localStorage-backed). Single
 * sub-router `monthlyReports` exposes list/create/update/remove (4 procs).
 *
 * Auth gate: founder | ceo | finance (matches existing
 * ROLE_ACCESS["/finance"] in client/src/App.tsx, plus founder/ceo for
 * oversight). Abubakar is the primary user.
 *
 * Directory namespace: server/financeOps/ (NOT server/finance/) to avoid
 * collision with the existing `finance:` namespace inside appRouter
 * (allocations, aiFund, etc).
 *
 * Money columns are decimal(14, 2) on MySQL → arrive in JS as strings
 * via mysql2. Inputs accept string or number; we coerce to string.
 * No FKs to other tables — this is an independent audit-trail collection.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import { financeMonthlyReports } from "../../drizzle/schema";

// ─── Local procedure builder (Founder + CEO + Finance) ───────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const FINANCE_OPS_ROLES = ["founder", "ceo", "finance"];

const financeOps = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !FINANCE_OPS_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Finance Portal is for Finance, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const financeOpsProcedure = t.procedure.use(financeOps);
const router = t.router;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function db() {
  const conn = await getDb();
  if (!conn) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  }
  return conn;
}

/** Coerce string|number|null|undefined to a decimal(14,2)-safe string or null. */
function toDecimalString(v: string | number | null | undefined): string | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2);
}

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const monthlyReportCreateIn = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
  revenue: z.union([z.string(), z.number()]).optional().nullable(),
  expenses: z.union([z.string(), z.number()]).optional().nullable(),
  profit: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  archivedBy: z.string().max(255).optional().nullable(),
});

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const monthlyReportsRouter = router({
  list: financeOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn
      .select()
      .from(financeMonthlyReports)
      .orderBy(desc(financeMonthlyReports.month), desc(financeMonthlyReports.createdAt));
    return rows;
  }),
  create: financeOpsProcedure.input(monthlyReportCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { revenue, expenses, profit, ...rest } = input;
    await conn.insert(financeMonthlyReports).values({
      ...rest,
      revenue: toDecimalString(revenue ?? null),
      expenses: toDecimalString(expenses ?? null),
      profit: toDecimalString(profit ?? null),
    } as any);
    return { success: true };
  }),
  update: financeOpsProcedure
    .input(idIn.merge(monthlyReportCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, revenue, expenses, profit, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (revenue !== undefined)  finalPatch.revenue  = toDecimalString(revenue);
      if (expenses !== undefined) finalPatch.expenses = toDecimalString(expenses);
      if (profit !== undefined)   finalPatch.profit   = toDecimalString(profit);
      await conn.update(financeMonthlyReports).set(finalPatch as any).where(eq(financeMonthlyReports.id, id));
      return { success: true };
    }),
  remove: financeOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(financeMonthlyReports).where(eq(financeMonthlyReports.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level Finance Ops router ─────────────────────────────────────────────
export const financeOpsRouter = router({
  monthlyReports: monthlyReportsRouter,
});
