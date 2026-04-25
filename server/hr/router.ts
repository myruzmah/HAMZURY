/**
 * HR Portal — tRPC router.
 *
 * Restores the 6 sections (interns, requisitions, onboarding, internCoord,
 * performance, exits) that previously lived in the localStorage opsStore on
 * client/src/pages/HRPortal.tsx and were cut at commit d55bab2 for launch.
 * Each sub-router exposes list/create/update/remove (4 procedures × 6 = 24).
 *
 * Auth gate: founder | ceo | hr.
 *  - HR is the primary user (Khadija, the HR Manager).
 *  - CEO + Founder retain admin oversight (matches the existing pattern in
 *    other ops routers — founder/ceo are never locked out at the procedure
 *    level even when ROLE_ACCESS in App.tsx narrows the page entry point).
 *
 * JSON-stringified columns (parsed on read, stringified on write):
 *   - hr_onboarding.day1Tasks/week1Tasks/month1Tasks/month3Tasks → string[]
 *   - hr_performance.nextGoals                                    → string[]
 *   - hr_exits.handoverItems                                       → string[]
 *
 * No FKs between these tables — they're independent collections.
 * No server-generated ref pattern — int autoincrement only.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  hrInterns,
  hrRequisitions,
  hrOnboarding,
  hrInternCoord,
  hrPerformance,
  hrExits,
  hrCalendarEvents,
} from "../../drizzle/schema";

// ─── Local procedure builder (HR + CEO + Founder) ─────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const HR_ROLES = ["founder", "ceo", "hr"];

const hrOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !HR_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "HR Portal is for HR, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const hrProcedure = t.procedure.use(hrOnly);
const router = t.router;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function db() {
  const conn = await getDb();
  if (!conn) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  }
  return conn;
}

/** Serialise a string[] to JSON for storage. Returns null if empty/missing. */
function serializeArr(arr: string[] | undefined | null): string | null {
  if (!arr || arr.length === 0) return null;
  try { return JSON.stringify(arr); }
  catch { return null; }
}

/** Parse a stored JSON string back to string[] (or [] on failure). */
function parseArr(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(x => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// ─── Enums ────────────────────────────────────────────────────────────────────
const INTERN_STATUS = ["Selecting", "Onboarding", "Active", "Converting", "Exited"] as const;
const REQ_STATUS = [
  "Requested", "CEO Approved", "Posted", "Screening",
  "Interviewing", "Offer", "Hired", "Closed",
] as const;
const ONBOARD_STATUS = [
  "Day 1", "Week 1", "Month 1", "Probation", "Confirmed", "Parted Ways",
] as const;
const COORD_STATUS = ["Onboarding", "Active", "Review", "Converting", "Ended"] as const;
const PERF_STATUS = [
  "Scheduled", "In Progress", "Completed", "Improvement Plan", "Escalated",
] as const;
const EXIT_TYPE = ["Resignation", "Termination", "End of Contract", "Other"] as const;
const EXIT_STATUS = ["Notified", "Transition", "Final Week", "Departed", "Post-Exit"] as const;
const CAL_EVENT_TYPE = [
  "attendance", "checkin", "review", "report", "training", "leave", "other",
] as const;

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const internCreateIn = z.object({
  internId: z.string().min(1).max(40),
  name: z.string().min(1).max(255),
  division: z.string().min(1).max(120),
  hubCommitment: z.boolean().optional().default(false),
  hubHoursPerWeek: z.number().int().nonnegative().optional().nullable(),
  divisionHoursPerWeek: z.number().int().nonnegative().optional().nullable(),
  startDate: z.string().max(10).optional().nullable(),
  durationMonths: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(INTERN_STATUS).optional().default("Active"),
  performanceNotes: z.string().max(8000).optional().nullable(),
});

const requisitionCreateIn = z.object({
  role: z.string().min(1).max(255),
  division: z.string().min(1).max(120),
  requesterLead: z.string().min(1).max(255),
  responsibilities: z.string().max(8000).optional().nullable(),
  requirements: z.string().max(8000).optional().nullable(),
  salaryRange: z.string().max(120).optional().nullable(),
  timeline: z.string().max(120).optional().nullable(),
  status: z.enum(REQ_STATUS).optional().default("Requested"),
  ceoApproved: z.boolean().optional().default(false),
  postedAt: z.string().max(10).optional().nullable(),
  closedAt: z.string().max(10).optional().nullable(),
  shortlistCount: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

/** Onboarding input — caller passes real string[]; server stringifies. */
const onboardingCreateIn = z.object({
  staffName: z.string().min(1).max(255),
  staffId: z.string().max(40).optional().nullable(),
  division: z.string().max(120).optional().nullable(),
  hireDate: z.string().min(8).max(10),
  day1Tasks: z.array(z.string()).optional().nullable(),
  week1Tasks: z.array(z.string()).optional().nullable(),
  month1Tasks: z.array(z.string()).optional().nullable(),
  month3Tasks: z.array(z.string()).optional().nullable(),
  day1Done: z.boolean().optional().default(false),
  week1Done: z.boolean().optional().default(false),
  month1Done: z.boolean().optional().default(false),
  month3Done: z.boolean().optional().default(false),
  status: z.enum(ONBOARD_STATUS).optional().default("Day 1"),
  probationOutcome: z.string().max(120).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const internCoordCreateIn = z.object({
  internId: z.string().min(1).max(40),
  internName: z.string().min(1).max(255),
  division: z.string().min(1).max(120),
  divisionLead: z.string().max(255).optional().nullable(),
  hubManager: z.string().max(255).optional().nullable(),
  divisionHoursPerWeek: z.number().int().nonnegative().optional().nullable(),
  hubHoursPerWeek: z.number().int().nonnegative().optional().nullable(),
  lastReviewAt: z.string().max(10).optional().nullable(),
  divisionFeedback: z.string().max(8000).optional().nullable(),
  hubFeedback: z.string().max(8000).optional().nullable(),
  status: z.enum(COORD_STATUS).optional().default("Active"),
  conversionDecision: z.string().max(120).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const performanceCreateIn = z.object({
  staffName: z.string().min(1).max(255),
  staffId: z.string().max(40).optional().nullable(),
  division: z.string().max(120).optional().nullable(),
  reviewerLead: z.string().min(1).max(255),
  quarter: z.string().min(1).max(20),
  achievements: z.string().max(8000).optional().nullable(),
  challenges: z.string().max(8000).optional().nullable(),
  growth: z.string().max(8000).optional().nullable(),
  goalsMet: z.string().max(120).optional().nullable(),
  nextGoals: z.array(z.string()).optional().nullable(),
  supportNeeded: z.string().max(8000).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  status: z.enum(PERF_STATUS).optional().default("Scheduled"),
  reviewedAt: z.string().max(10).optional().nullable(),
});

const exitCreateIn = z.object({
  staffName: z.string().min(1).max(255),
  staffId: z.string().max(40).optional().nullable(),
  division: z.string().max(120).optional().nullable(),
  exitType: z.enum(EXIT_TYPE).optional().default("Resignation"),
  noticeDate: z.string().max(10).optional().nullable(),
  lastDay: z.string().max(10).optional().nullable(),
  reason: z.string().max(8000).optional().nullable(),
  handoverItems: z.array(z.string()).optional().nullable(),
  feedback: z.string().max(8000).optional().nullable(),
  equipmentReturned: z.boolean().optional().default(false),
  accessRevoked: z.boolean().optional().default(false),
  finalPayProcessed: z.boolean().optional().default(false),
  exitInterviewDone: z.boolean().optional().default(false),
  status: z.enum(EXIT_STATUS).optional().default("Notified"),
  notes: z.string().max(8000).optional().nullable(),
});

const calendarCreateIn = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(8000).optional().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional().nullable(),
  eventType: z.enum(CAL_EVENT_TYPE).optional().default("other"),
  assignee: z.string().max(255).optional().nullable(),
  reminderSent: z.boolean().optional().default(false),
});

const calendarListIn = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).optional();

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const internsRouter = router({
  list: hrProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(hrInterns).orderBy(desc(hrInterns.createdAt));
  }),
  create: hrProcedure.input(internCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(hrInterns).values(input as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(internCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(hrInterns).set(patch as any).where(eq(hrInterns.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrInterns).where(eq(hrInterns.id, input.id));
    return { success: true };
  }),
});

const requisitionsRouter = router({
  list: hrProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(hrRequisitions).orderBy(desc(hrRequisitions.createdAt));
  }),
  create: hrProcedure.input(requisitionCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(hrRequisitions).values(input as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(requisitionCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(hrRequisitions).set(patch as any).where(eq(hrRequisitions.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrRequisitions).where(eq(hrRequisitions.id, input.id));
    return { success: true };
  }),
});

const onboardingRouter = router({
  list: hrProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hrOnboarding).orderBy(desc(hrOnboarding.createdAt));
    return rows.map(r => ({
      ...r,
      day1Tasks: parseArr(r.day1Tasks),
      week1Tasks: parseArr(r.week1Tasks),
      month1Tasks: parseArr(r.month1Tasks),
      month3Tasks: parseArr(r.month3Tasks),
    }));
  }),
  create: hrProcedure.input(onboardingCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { day1Tasks, week1Tasks, month1Tasks, month3Tasks, ...rest } = input;
    await conn.insert(hrOnboarding).values({
      ...rest,
      day1Tasks: serializeArr(day1Tasks ?? null),
      week1Tasks: serializeArr(week1Tasks ?? null),
      month1Tasks: serializeArr(month1Tasks ?? null),
      month3Tasks: serializeArr(month3Tasks ?? null),
    } as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(onboardingCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, day1Tasks, week1Tasks, month1Tasks, month3Tasks, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (day1Tasks !== undefined) finalPatch.day1Tasks = serializeArr(day1Tasks);
      if (week1Tasks !== undefined) finalPatch.week1Tasks = serializeArr(week1Tasks);
      if (month1Tasks !== undefined) finalPatch.month1Tasks = serializeArr(month1Tasks);
      if (month3Tasks !== undefined) finalPatch.month3Tasks = serializeArr(month3Tasks);
      await conn.update(hrOnboarding).set(finalPatch as any).where(eq(hrOnboarding.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrOnboarding).where(eq(hrOnboarding.id, input.id));
    return { success: true };
  }),
});

const internCoordRouter = router({
  list: hrProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(hrInternCoord).orderBy(desc(hrInternCoord.createdAt));
  }),
  create: hrProcedure.input(internCoordCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(hrInternCoord).values(input as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(internCoordCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(hrInternCoord).set(patch as any).where(eq(hrInternCoord.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrInternCoord).where(eq(hrInternCoord.id, input.id));
    return { success: true };
  }),
});

const performanceRouter = router({
  list: hrProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hrPerformance).orderBy(desc(hrPerformance.createdAt));
    return rows.map(r => ({ ...r, nextGoals: parseArr(r.nextGoals) }));
  }),
  create: hrProcedure.input(performanceCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { nextGoals, ...rest } = input;
    await conn.insert(hrPerformance).values({
      ...rest,
      nextGoals: serializeArr(nextGoals ?? null),
    } as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(performanceCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, nextGoals, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (nextGoals !== undefined) finalPatch.nextGoals = serializeArr(nextGoals);
      await conn.update(hrPerformance).set(finalPatch as any).where(eq(hrPerformance.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrPerformance).where(eq(hrPerformance.id, input.id));
    return { success: true };
  }),
});

const exitsRouter = router({
  list: hrProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hrExits).orderBy(desc(hrExits.createdAt));
    return rows.map(r => ({ ...r, handoverItems: parseArr(r.handoverItems) }));
  }),
  create: hrProcedure.input(exitCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { handoverItems, ...rest } = input;
    await conn.insert(hrExits).values({
      ...rest,
      handoverItems: serializeArr(handoverItems ?? null),
    } as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(exitCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, handoverItems, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (handoverItems !== undefined) finalPatch.handoverItems = serializeArr(handoverItems);
      await conn.update(hrExits).set(finalPatch as any).where(eq(hrExits.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrExits).where(eq(hrExits.id, input.id));
    return { success: true };
  }),
});

const calendarRouter = router({
  list: hrProcedure.input(calendarListIn).query(async ({ input }) => {
    const conn = await db();
    const filters = [];
    if (input?.from) filters.push(gte(hrCalendarEvents.startAt, input.from));
    if (input?.to)   filters.push(lte(hrCalendarEvents.startAt, input.to));
    const where = filters.length > 0 ? and(...filters) : undefined;
    const rows = where
      ? await conn.select().from(hrCalendarEvents).where(where).orderBy(asc(hrCalendarEvents.startAt))
      : await conn.select().from(hrCalendarEvents).orderBy(asc(hrCalendarEvents.startAt));
    return rows;
  }),
  create: hrProcedure.input(calendarCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(hrCalendarEvents).values(input as any);
    return { success: true };
  }),
  update: hrProcedure
    .input(idIn.merge(calendarCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(hrCalendarEvents).set(patch as any).where(eq(hrCalendarEvents.id, id));
      return { success: true };
    }),
  remove: hrProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hrCalendarEvents).where(eq(hrCalendarEvents.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level HR router ──────────────────────────────────────────────────────
export const hrRouter = router({
  interns: internsRouter,
  requisitions: requisitionsRouter,
  onboarding: onboardingRouter,
  internCoord: internCoordRouter,
  performance: performanceRouter,
  exits: exitsRouter,
  calendar: calendarRouter,
});
