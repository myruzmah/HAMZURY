/**
 * HUB Admin Portal — tRPC router (restored sections).
 *
 * Restores the 5 sections that were cut from client/src/pages/HubAdminPortal.tsx
 * at commit d7e9c60 for launch (certifications, alumni, lmsProgress,
 * internDuties, metfix). Each sub-router exposes list/create/update/remove
 * (4 procedures × 5 = 20).
 *
 * Auth gate: founder | ceo | skills_staff (matches existing
 * ROLE_ACCESS["/hub/admin"] in client/src/App.tsx). Skills staff (Idris,
 * Isa/Musa interns) are the primary users. CEO + Founder retain oversight.
 *
 * Directory namespace: server/hubAdmin/ (NOT server/hub/) to avoid future
 * collision with a public Hub-facing router.
 *
 * JSON-stringified columns (parsed on read, stringified on write):
 *   - hub_certifications.skills            → string[]
 *   - hub_alumni.skills                    → string[]
 *   - hub_lms_progress.modulesCompleted    → string[]
 *   - hub_intern_duties.checklist          → string[]
 *   - hub_metfix.parts                     → string[]
 *
 * No FKs between these tables — they're independent collections. No
 * server-generated ref pattern; int autoincrement only.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  hubCertifications,
  hubAlumni,
  hubLmsProgress,
  hubInternDuties,
  hubMetfix,
} from "../../drizzle/schema";

// ─── Local procedure builder (Founder + CEO + Skills Staff) ──────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const HUB_ADMIN_ROLES = ["founder", "ceo", "skills_staff"];

const hubAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !HUB_ADMIN_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "HUB Admin Portal is for Skills Staff, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const hubAdminProcedure = t.procedure.use(hubAdmin);
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
const CERTIFICATION_LEVEL = [
  "Foundation", "Intermediate", "Advanced", "Mastery", "Internal", "Other",
] as const;
const CERTIFICATION_STATUS = ["Issued", "Pending", "Revoked", "Expired"] as const;
const ALUMNI_PLACEMENT = [
  "Employed", "Self-Employed", "Internship", "Further Studies", "Seeking", "Unknown",
] as const;
const LMS_PROGRESS_STATUS = [
  "Active", "On Track", "Behind", "Stalled", "Completed", "Dropped",
] as const;
const INTERN_DUTY_CATEGORY = [
  "Teaching Support", "Admin", "Facilities", "Social Media", "LMS", "Events", "Other",
] as const;
const INTERN_DUTY_STATUS = [
  "Assigned", "In Progress", "Blocked", "Done", "Cancelled",
] as const;
const METFIX_JOB_TYPE = [
  "Sale", "Repair", "Diagnosis", "Service", "Parts Order", "Other",
] as const;
const METFIX_STATUS = [
  "Intake", "In Progress", "Awaiting Parts", "Ready", "Delivered", "Cancelled",
] as const;

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const certificationCreateIn = z.object({
  studentName: z.string().min(1).max(255),
  studentRef: z.string().max(60).optional().nullable(),
  programme: z.string().min(1).max(255),
  level: z.enum(CERTIFICATION_LEVEL).optional().default("Foundation"),
  issuingBody: z.string().max(255).optional().nullable(),
  certificateRef: z.string().max(200).optional().nullable(),
  issueDate: z.string().min(1).max(10),
  expiryDate: z.string().max(10).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  status: z.enum(CERTIFICATION_STATUS).optional().default("Issued"),
  notes: z.string().max(8000).optional().nullable(),
});

const alumniCreateIn = z.object({
  studentName: z.string().min(1).max(255),
  studentRef: z.string().max(60).optional().nullable(),
  programme: z.string().min(1).max(255),
  graduationDate: z.string().min(1).max(10),
  currentEmployer: z.string().max(255).optional().nullable(),
  jobTitle: z.string().max(255).optional().nullable(),
  placementStatus: z.enum(ALUMNI_PLACEMENT).optional().default("Seeking"),
  email: z.string().max(320).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const lmsProgressCreateIn = z.object({
  studentName: z.string().min(1).max(255),
  studentRef: z.string().max(60).optional().nullable(),
  programme: z.string().min(1).max(255),
  currentModule: z.string().max(255).optional().nullable(),
  completionPct: z.number().int().min(0).max(100).optional().default(0),
  modulesCompleted: z.array(z.string()).optional().nullable(),
  lastActivity: z.string().max(10).optional().nullable(),
  status: z.enum(LMS_PROGRESS_STATUS).optional().default("Active"),
  notes: z.string().max(8000).optional().nullable(),
});

const internDutyCreateIn = z.object({
  internName: z.string().min(1).max(255),
  dutyTitle: z.string().min(1).max(255),
  category: z.enum(INTERN_DUTY_CATEGORY).optional().default("Other"),
  assignedDate: z.string().min(1).max(10),
  dueDate: z.string().max(10).optional().nullable(),
  checklist: z.array(z.string()).optional().nullable(),
  status: z.enum(INTERN_DUTY_STATUS).optional().default("Assigned"),
  assignedBy: z.string().max(255).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const metfixCreateIn = z.object({
  itemName: z.string().min(1).max(255),
  jobType: z.enum(METFIX_JOB_TYPE).optional().default("Repair"),
  customerName: z.string().max(255).optional().nullable(),
  customerPhone: z.string().max(50).optional().nullable(),
  intakeDate: z.string().min(1).max(10),
  completedDate: z.string().max(10).optional().nullable(),
  amount: z.string().max(80).optional().nullable(),
  technician: z.string().max(255).optional().nullable(),
  parts: z.array(z.string()).optional().nullable(),
  status: z.enum(METFIX_STATUS).optional().default("Intake"),
  notes: z.string().max(8000).optional().nullable(),
});

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const certificationsRouter = router({
  list: hubAdminProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hubCertifications).orderBy(desc(hubCertifications.createdAt));
    return rows.map(r => ({ ...r, skills: parseArr(r.skills) }));
  }),
  create: hubAdminProcedure.input(certificationCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { skills, ...rest } = input;
    await conn.insert(hubCertifications).values({
      ...rest,
      skills: serializeArr(skills ?? null),
    } as any);
    return { success: true };
  }),
  update: hubAdminProcedure
    .input(idIn.merge(certificationCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, skills, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (skills !== undefined) finalPatch.skills = serializeArr(skills);
      await conn.update(hubCertifications).set(finalPatch as any).where(eq(hubCertifications.id, id));
      return { success: true };
    }),
  remove: hubAdminProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hubCertifications).where(eq(hubCertifications.id, input.id));
    return { success: true };
  }),
});

const alumniRouter = router({
  list: hubAdminProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hubAlumni).orderBy(desc(hubAlumni.createdAt));
    return rows.map(r => ({ ...r, skills: parseArr(r.skills) }));
  }),
  create: hubAdminProcedure.input(alumniCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { skills, ...rest } = input;
    await conn.insert(hubAlumni).values({
      ...rest,
      skills: serializeArr(skills ?? null),
    } as any);
    return { success: true };
  }),
  update: hubAdminProcedure
    .input(idIn.merge(alumniCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, skills, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (skills !== undefined) finalPatch.skills = serializeArr(skills);
      await conn.update(hubAlumni).set(finalPatch as any).where(eq(hubAlumni.id, id));
      return { success: true };
    }),
  remove: hubAdminProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hubAlumni).where(eq(hubAlumni.id, input.id));
    return { success: true };
  }),
});

const lmsProgressRouter = router({
  list: hubAdminProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hubLmsProgress).orderBy(desc(hubLmsProgress.createdAt));
    return rows.map(r => ({ ...r, modulesCompleted: parseArr(r.modulesCompleted) }));
  }),
  create: hubAdminProcedure.input(lmsProgressCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { modulesCompleted, ...rest } = input;
    await conn.insert(hubLmsProgress).values({
      ...rest,
      modulesCompleted: serializeArr(modulesCompleted ?? null),
    } as any);
    return { success: true };
  }),
  update: hubAdminProcedure
    .input(idIn.merge(lmsProgressCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, modulesCompleted, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (modulesCompleted !== undefined) finalPatch.modulesCompleted = serializeArr(modulesCompleted);
      await conn.update(hubLmsProgress).set(finalPatch as any).where(eq(hubLmsProgress.id, id));
      return { success: true };
    }),
  remove: hubAdminProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hubLmsProgress).where(eq(hubLmsProgress.id, input.id));
    return { success: true };
  }),
});

const internDutiesRouter = router({
  list: hubAdminProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hubInternDuties).orderBy(desc(hubInternDuties.createdAt));
    return rows.map(r => ({ ...r, checklist: parseArr(r.checklist) }));
  }),
  create: hubAdminProcedure.input(internDutyCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { checklist, ...rest } = input;
    await conn.insert(hubInternDuties).values({
      ...rest,
      checklist: serializeArr(checklist ?? null),
    } as any);
    return { success: true };
  }),
  update: hubAdminProcedure
    .input(idIn.merge(internDutyCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, checklist, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (checklist !== undefined) finalPatch.checklist = serializeArr(checklist);
      await conn.update(hubInternDuties).set(finalPatch as any).where(eq(hubInternDuties.id, id));
      return { success: true };
    }),
  remove: hubAdminProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hubInternDuties).where(eq(hubInternDuties.id, input.id));
    return { success: true };
  }),
});

const metfixRouter = router({
  list: hubAdminProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(hubMetfix).orderBy(desc(hubMetfix.createdAt));
    return rows.map(r => ({ ...r, parts: parseArr(r.parts) }));
  }),
  create: hubAdminProcedure.input(metfixCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { parts, ...rest } = input;
    await conn.insert(hubMetfix).values({
      ...rest,
      parts: serializeArr(parts ?? null),
    } as any);
    return { success: true };
  }),
  update: hubAdminProcedure
    .input(idIn.merge(metfixCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, parts, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (parts !== undefined) finalPatch.parts = serializeArr(parts);
      await conn.update(hubMetfix).set(finalPatch as any).where(eq(hubMetfix.id, id));
      return { success: true };
    }),
  remove: hubAdminProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(hubMetfix).where(eq(hubMetfix.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level HUB Admin router ───────────────────────────────────────────────
export const hubAdminRouter = router({
  certifications: certificationsRouter,
  alumni: alumniRouter,
  lmsProgress: lmsProgressRouter,
  internDuties: internDutiesRouter,
  metfix: metfixRouter,
});
