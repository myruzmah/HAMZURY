/**
 * CEO Portal — tRPC router (restored sections).
 *
 * Restores the 7 sections that were cut from client/src/pages/CEOPortal.tsx
 * at commit 136da29 for launch (equipment, software, brandingQa, documents,
 * divisionUpdates, canvaTemplates, weeklyMeetings). Each sub-router exposes
 * list/create/update/remove (4 procedures × 7 = 28).
 *
 * Auth gate: founder | ceo (matches existing ROLE_ACCESS for /ceo in
 * client/src/App.tsx). Founder retains executive oversight.
 *
 * JSON-stringified columns (parsed on read, stringified on write):
 *   - ceo_branding_qa.checklist          → string[]
 *   - ceo_documents.tags                 → string[]
 *   - ceo_division_updates.wins          → string[]
 *   - ceo_division_updates.blockers      → string[]
 *   - ceo_canva_templates.tags           → string[]
 *   - ceo_weekly_meetings.attendees      → string[]
 *   - ceo_weekly_meetings.agenda         → string[]
 *   - ceo_weekly_meetings.decisions      → string[]
 *   - ceo_weekly_meetings.actionItems    → string[]
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
  ceoEquipment,
  ceoSoftware,
  ceoBrandingQa,
  ceoDocuments,
  ceoDivisionUpdates,
  ceoCanvaTemplates,
  ceoWeeklyMeetings,
  ceoNotes,
} from "../../drizzle/schema";

// ─── Local procedure builder (CEO + Founder) ──────────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const CEO_OPS_ROLES = ["founder", "ceo"];

const ceoOps = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !CEO_OPS_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "CEO Portal is for the CEO or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const ceoOpsProcedure = t.procedure.use(ceoOps);
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
const EQUIPMENT_CATEGORY = [
  "Laptop", "Desktop", "Phone", "Tablet", "Camera", "Audio", "Peripheral", "Furniture", "Other",
] as const;
const EQUIPMENT_CONDITION = [
  "New", "Good", "Fair", "Poor", "Repair", "Retired",
] as const;
const SOFTWARE_STATUS = ["Active", "Trial", "Expired", "Cancelled"] as const;
const BRANDING_QA_DIVISION = [
  "Bizdoc", "Scalar", "Medialy", "HUB", "Podcast", "Video", "BizDev", "CSO", "Skills", "Other",
] as const;
const BRANDING_QA_OUTCOME = ["Approved", "Needs Revision", "Rejected", "Pending"] as const;
const DOCUMENT_CATEGORY = [
  "Legal", "Financial", "Operational", "Strategic", "HR", "Client", "Other",
] as const;
const DOCUMENT_STATUS = ["Active", "Pending", "Expired", "Archived"] as const;
const DIVISION_UPDATE_DIVISION = [
  "Bizdoc", "Scalar", "Medialy", "HUB", "Podcast", "Video", "BizDev", "CSO", "Skills", "Finance", "HR", "Other",
] as const;
const DIVISION_UPDATE_STATUS = ["Submitted", "Reviewed", "Acted On", "Archived"] as const;
const CANVA_TEMPLATE_CATEGORY = [
  "Social Post", "Carousel", "Story", "Flyer", "Brochure", "Pitch Deck", "Proposal", "Cover", "Other",
] as const;
const WEEKLY_MEETING_TYPE = [
  "Monday Kickoff", "Wednesday Midweek", "Friday Wrap", "Branding QA", "Ad-hoc", "Other",
] as const;
const WEEKLY_MEETING_STATUS = ["Planned", "Held", "Cancelled", "Postponed"] as const;
const NOTE_CATEGORY = [
  "strategy", "observation", "idea", "decision", "parking", "other",
] as const;

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const equipmentCreateIn = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(EQUIPMENT_CATEGORY).optional().default("Other"),
  serial: z.string().max(120).optional().nullable(),
  assignedTo: z.string().max(255).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  purchaseDate: z.string().max(10).optional().nullable(),
  purchaseCost: z.string().max(80).optional().nullable(),
  condition: z.enum(EQUIPMENT_CONDITION).optional().default("Good"),
  notes: z.string().max(8000).optional().nullable(),
});

const softwareCreateIn = z.object({
  name: z.string().min(1).max(255),
  vendor: z.string().max(255).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  licenseKey: z.string().max(500).optional().nullable(),
  seats: z.number().int().nonnegative().optional().nullable(),
  seatsUsed: z.number().int().nonnegative().optional().nullable(),
  monthlyCost: z.string().max(80).optional().nullable(),
  renewalDate: z.string().max(10).optional().nullable(),
  status: z.enum(SOFTWARE_STATUS).optional().default("Active"),
  primaryUser: z.string().max(255).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const brandingQaCreateIn = z.object({
  reviewDate: z.string().min(1).max(10),
  division: z.enum(BRANDING_QA_DIVISION).optional().default("Other"),
  contentType: z.string().max(120).optional().nullable(),
  contentRef: z.string().max(500).optional().nullable(),
  checklist: z.array(z.string()).optional().nullable(),
  passRate: z.number().int().min(0).max(100).optional().nullable(),
  outcome: z.enum(BRANDING_QA_OUTCOME).optional().default("Pending"),
  reviewer: z.string().max(255).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const documentCreateIn = z.object({
  title: z.string().min(1).max(255),
  category: z.enum(DOCUMENT_CATEGORY).optional().default("Other"),
  storageLocation: z.string().max(500).optional().nullable(),
  ownerName: z.string().max(255).optional().nullable(),
  expiryDate: z.string().max(10).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  status: z.enum(DOCUMENT_STATUS).optional().default("Active"),
  notes: z.string().max(8000).optional().nullable(),
});

const divisionUpdateCreateIn = z.object({
  weekOf: z.string().min(1).max(10),
  division: z.enum(DIVISION_UPDATE_DIVISION).optional().default("Other"),
  submittedBy: z.string().max(255).optional().nullable(),
  pulseScore: z.number().int().min(0).max(10).optional().nullable(),
  wins: z.array(z.string()).optional().nullable(),
  blockers: z.array(z.string()).optional().nullable(),
  nextWeekFocus: z.string().max(8000).optional().nullable(),
  status: z.enum(DIVISION_UPDATE_STATUS).optional().default("Submitted"),
  notes: z.string().max(8000).optional().nullable(),
});

const canvaTemplateCreateIn = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(CANVA_TEMPLATE_CATEGORY).optional().default("Other"),
  division: z.string().max(80).optional().nullable(),
  canvaUrl: z.string().max(1000).optional().nullable(),
  thumbnailUrl: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  usageCount: z.number().int().nonnegative().optional().default(0),
  lastUsedAt: z.string().max(10).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const noteCreateIn = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(20000),
  category: z.enum(NOTE_CATEGORY).optional().default("other"),
  pinned: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().nullable(),
});

const weeklyMeetingCreateIn = z.object({
  meetingDate: z.string().min(1).max(10),
  meetingType: z.enum(WEEKLY_MEETING_TYPE).optional().default("Monday Kickoff"),
  attendees: z.array(z.string()).optional().nullable(),
  agenda: z.array(z.string()).optional().nullable(),
  decisions: z.array(z.string()).optional().nullable(),
  actionItems: z.array(z.string()).optional().nullable(),
  durationMinutes: z.number().int().nonnegative().optional().nullable(),
  facilitator: z.string().max(255).optional().nullable(),
  status: z.enum(WEEKLY_MEETING_STATUS).optional().default("Planned"),
  notes: z.string().max(8000).optional().nullable(),
});

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const equipmentRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(ceoEquipment).orderBy(desc(ceoEquipment.createdAt));
  }),
  create: ceoOpsProcedure.input(equipmentCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(ceoEquipment).values({ ...input } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(equipmentCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(ceoEquipment).set(patch as any).where(eq(ceoEquipment.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoEquipment).where(eq(ceoEquipment.id, input.id));
    return { success: true };
  }),
});

const softwareRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(ceoSoftware).orderBy(desc(ceoSoftware.createdAt));
  }),
  create: ceoOpsProcedure.input(softwareCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(ceoSoftware).values({ ...input } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(softwareCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(ceoSoftware).set(patch as any).where(eq(ceoSoftware.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoSoftware).where(eq(ceoSoftware.id, input.id));
    return { success: true };
  }),
});

const brandingQaRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(ceoBrandingQa).orderBy(desc(ceoBrandingQa.createdAt));
    return rows.map(r => ({ ...r, checklist: parseArr(r.checklist) }));
  }),
  create: ceoOpsProcedure.input(brandingQaCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { checklist, ...rest } = input;
    await conn.insert(ceoBrandingQa).values({
      ...rest,
      checklist: serializeArr(checklist ?? null),
    } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(brandingQaCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, checklist, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (checklist !== undefined) finalPatch.checklist = serializeArr(checklist);
      await conn.update(ceoBrandingQa).set(finalPatch as any).where(eq(ceoBrandingQa.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoBrandingQa).where(eq(ceoBrandingQa.id, input.id));
    return { success: true };
  }),
});

const documentsRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(ceoDocuments).orderBy(desc(ceoDocuments.createdAt));
    return rows.map(r => ({ ...r, tags: parseArr(r.tags) }));
  }),
  create: ceoOpsProcedure.input(documentCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { tags, ...rest } = input;
    await conn.insert(ceoDocuments).values({
      ...rest,
      tags: serializeArr(tags ?? null),
    } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(documentCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, tags, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (tags !== undefined) finalPatch.tags = serializeArr(tags);
      await conn.update(ceoDocuments).set(finalPatch as any).where(eq(ceoDocuments.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoDocuments).where(eq(ceoDocuments.id, input.id));
    return { success: true };
  }),
});

const divisionUpdatesRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(ceoDivisionUpdates).orderBy(desc(ceoDivisionUpdates.createdAt));
    return rows.map(r => ({
      ...r,
      wins: parseArr(r.wins),
      blockers: parseArr(r.blockers),
    }));
  }),
  create: ceoOpsProcedure.input(divisionUpdateCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { wins, blockers, ...rest } = input;
    await conn.insert(ceoDivisionUpdates).values({
      ...rest,
      wins: serializeArr(wins ?? null),
      blockers: serializeArr(blockers ?? null),
    } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(divisionUpdateCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, wins, blockers, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (wins !== undefined) finalPatch.wins = serializeArr(wins);
      if (blockers !== undefined) finalPatch.blockers = serializeArr(blockers);
      await conn.update(ceoDivisionUpdates).set(finalPatch as any).where(eq(ceoDivisionUpdates.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoDivisionUpdates).where(eq(ceoDivisionUpdates.id, input.id));
    return { success: true };
  }),
});

const canvaTemplatesRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(ceoCanvaTemplates).orderBy(desc(ceoCanvaTemplates.createdAt));
    return rows.map(r => ({ ...r, tags: parseArr(r.tags) }));
  }),
  create: ceoOpsProcedure.input(canvaTemplateCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { tags, ...rest } = input;
    await conn.insert(ceoCanvaTemplates).values({
      ...rest,
      tags: serializeArr(tags ?? null),
    } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(canvaTemplateCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, tags, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (tags !== undefined) finalPatch.tags = serializeArr(tags);
      await conn.update(ceoCanvaTemplates).set(finalPatch as any).where(eq(ceoCanvaTemplates.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoCanvaTemplates).where(eq(ceoCanvaTemplates.id, input.id));
    return { success: true };
  }),
});

const weeklyMeetingsRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(ceoWeeklyMeetings).orderBy(desc(ceoWeeklyMeetings.createdAt));
    return rows.map(r => ({
      ...r,
      attendees: parseArr(r.attendees),
      agenda: parseArr(r.agenda),
      decisions: parseArr(r.decisions),
      actionItems: parseArr(r.actionItems),
    }));
  }),
  create: ceoOpsProcedure.input(weeklyMeetingCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { attendees, agenda, decisions, actionItems, ...rest } = input;
    await conn.insert(ceoWeeklyMeetings).values({
      ...rest,
      attendees: serializeArr(attendees ?? null),
      agenda: serializeArr(agenda ?? null),
      decisions: serializeArr(decisions ?? null),
      actionItems: serializeArr(actionItems ?? null),
    } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(weeklyMeetingCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, attendees, agenda, decisions, actionItems, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (attendees !== undefined) finalPatch.attendees = serializeArr(attendees);
      if (agenda !== undefined) finalPatch.agenda = serializeArr(agenda);
      if (decisions !== undefined) finalPatch.decisions = serializeArr(decisions);
      if (actionItems !== undefined) finalPatch.actionItems = serializeArr(actionItems);
      await conn.update(ceoWeeklyMeetings).set(finalPatch as any).where(eq(ceoWeeklyMeetings.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoWeeklyMeetings).where(eq(ceoWeeklyMeetings.id, input.id));
    return { success: true };
  }),
});

const notesRouter = router({
  list: ceoOpsProcedure.query(async () => {
    const conn = await db();
    // Pinned first, newest first within each group.
    const rows = await conn.select().from(ceoNotes).orderBy(desc(ceoNotes.pinned), desc(ceoNotes.createdAt));
    return rows.map(r => ({ ...r, tags: parseArr(r.tags) }));
  }),
  create: ceoOpsProcedure.input(noteCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { tags, ...rest } = input;
    await conn.insert(ceoNotes).values({
      ...rest,
      tags: serializeArr(tags ?? null),
    } as any);
    return { success: true };
  }),
  update: ceoOpsProcedure
    .input(idIn.merge(noteCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, tags, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (tags !== undefined) finalPatch.tags = serializeArr(tags);
      await conn.update(ceoNotes).set(finalPatch as any).where(eq(ceoNotes.id, id));
      return { success: true };
    }),
  remove: ceoOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(ceoNotes).where(eq(ceoNotes.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level CEO Ops router ─────────────────────────────────────────────────
export const ceoOpsRouter = router({
  equipment: equipmentRouter,
  software: softwareRouter,
  brandingQa: brandingQaRouter,
  documents: documentsRouter,
  divisionUpdates: divisionUpdatesRouter,
  canvaTemplates: canvaTemplatesRouter,
  weeklyMeetings: weeklyMeetingsRouter,
  notes: notesRouter,
});
