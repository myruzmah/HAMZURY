/**
 * BizDev Portal — tRPC router.
 *
 * Restores the 4 sections (campaigns, grants, sponsorships, templates) that
 * previously lived in the localStorage opsStore on
 * client/src/pages/BizDevPortal.tsx and were cut at commit d55bab2 for launch.
 * Each sub-router exposes list/create/update/remove (4 procedures × 4 = 16).
 *
 * Auth gate: founder | ceo | bizdev | bizdev_staff (matches existing
 * ROLE_ACCESS in App.tsx for /bizdev). BizDev is the primary user (Isa
 * Ibrahim, the BizDev Lead). CEO + Founder retain admin oversight.
 *
 * JSON-stringified columns (parsed on read, stringified on write):
 *   - bizdev_campaigns.channels        → string[]
 *   - bizdev_grants.requirements       → string[]
 *   - bizdev_sponsorships.deliverables → string[]
 *   - bizdev_templates.tags            → string[]
 *
 * No FKs between these tables — they're independent collections.
 * No server-generated ref pattern — int autoincrement only.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  bizdevCampaigns,
  bizdevGrants,
  bizdevSponsorships,
  bizdevTemplates,
} from "../../drizzle/schema";

// ─── Local procedure builder (BizDev + BizDev staff + CEO + Founder) ──────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const BIZDEV_OPS_ROLES = ["founder", "ceo", "bizdev", "bizdev_staff"];

const bizdevOps = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !BIZDEV_OPS_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "BizDev Portal is for BizDev, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const bizdevOpsProcedure = t.procedure.use(bizdevOps);
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
const CAMPAIGN_STATUS = ["Planning", "Active", "Paused", "Completed", "Cancelled"] as const;
const GRANT_STATUS = [
  "Researching", "Drafting", "Submitted", "Under Review", "Awarded", "Rejected",
] as const;
const SPONSORSHIP_STATUS = [
  "Prospect", "Pitched", "Negotiating", "Closed", "Lost", "Delivered",
] as const;
const TEMPLATE_CATEGORY = [
  "Proposal", "Outreach", "Pitch Deck", "Follow-up", "Contract", "Other",
] as const;

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const campaignCreateIn = z.object({
  name: z.string().min(1).max(255),
  partner: z.string().max(255).optional().nullable(),
  objective: z.string().max(8000).optional().nullable(),
  channels: z.array(z.string()).optional().nullable(),
  startDate: z.string().max(10).optional().nullable(),
  endDate: z.string().max(10).optional().nullable(),
  budget: z.string().max(80).optional().nullable(),
  leadsGenerated: z.number().int().nonnegative().optional().nullable(),
  conversions: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(CAMPAIGN_STATUS).optional().default("Planning"),
  notes: z.string().max(8000).optional().nullable(),
});

const grantCreateIn = z.object({
  name: z.string().min(1).max(255),
  funder: z.string().max(255).optional().nullable(),
  amount: z.string().max(80).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  requirements: z.array(z.string()).optional().nullable(),
  applicationDate: z.string().max(10).optional().nullable(),
  deadline: z.string().max(10).optional().nullable(),
  decisionDate: z.string().max(10).optional().nullable(),
  status: z.enum(GRANT_STATUS).optional().default("Researching"),
  outcome: z.string().max(8000).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const sponsorshipCreateIn = z.object({
  sponsor: z.string().min(1).max(255),
  event: z.string().max(255).optional().nullable(),
  contact: z.string().max(255).optional().nullable(),
  amount: z.string().max(80).optional().nullable(),
  deliverables: z.array(z.string()).optional().nullable(),
  pitchDate: z.string().max(10).optional().nullable(),
  closeDate: z.string().max(10).optional().nullable(),
  status: z.enum(SPONSORSHIP_STATUS).optional().default("Prospect"),
  notes: z.string().max(8000).optional().nullable(),
});

const templateCreateIn = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(TEMPLATE_CATEGORY).optional().default("Other"),
  body: z.string().max(50000).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  usageCount: z.number().int().nonnegative().optional().default(0),
  lastUsedAt: z.string().max(10).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const campaignsRouter = router({
  list: bizdevOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(bizdevCampaigns).orderBy(desc(bizdevCampaigns.createdAt));
    return rows.map(r => ({ ...r, channels: parseArr(r.channels) }));
  }),
  create: bizdevOpsProcedure.input(campaignCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { channels, ...rest } = input;
    await conn.insert(bizdevCampaigns).values({
      ...rest,
      channels: serializeArr(channels ?? null),
    } as any);
    return { success: true };
  }),
  update: bizdevOpsProcedure
    .input(idIn.merge(campaignCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, channels, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (channels !== undefined) finalPatch.channels = serializeArr(channels);
      await conn.update(bizdevCampaigns).set(finalPatch as any).where(eq(bizdevCampaigns.id, id));
      return { success: true };
    }),
  remove: bizdevOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(bizdevCampaigns).where(eq(bizdevCampaigns.id, input.id));
    return { success: true };
  }),
});

const grantsRouter = router({
  list: bizdevOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(bizdevGrants).orderBy(desc(bizdevGrants.createdAt));
    return rows.map(r => ({ ...r, requirements: parseArr(r.requirements) }));
  }),
  create: bizdevOpsProcedure.input(grantCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { requirements, ...rest } = input;
    await conn.insert(bizdevGrants).values({
      ...rest,
      requirements: serializeArr(requirements ?? null),
    } as any);
    return { success: true };
  }),
  update: bizdevOpsProcedure
    .input(idIn.merge(grantCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, requirements, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (requirements !== undefined) finalPatch.requirements = serializeArr(requirements);
      await conn.update(bizdevGrants).set(finalPatch as any).where(eq(bizdevGrants.id, id));
      return { success: true };
    }),
  remove: bizdevOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(bizdevGrants).where(eq(bizdevGrants.id, input.id));
    return { success: true };
  }),
});

const sponsorshipsRouter = router({
  list: bizdevOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(bizdevSponsorships).orderBy(desc(bizdevSponsorships.createdAt));
    return rows.map(r => ({ ...r, deliverables: parseArr(r.deliverables) }));
  }),
  create: bizdevOpsProcedure.input(sponsorshipCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { deliverables, ...rest } = input;
    await conn.insert(bizdevSponsorships).values({
      ...rest,
      deliverables: serializeArr(deliverables ?? null),
    } as any);
    return { success: true };
  }),
  update: bizdevOpsProcedure
    .input(idIn.merge(sponsorshipCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, deliverables, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (deliverables !== undefined) finalPatch.deliverables = serializeArr(deliverables);
      await conn.update(bizdevSponsorships).set(finalPatch as any).where(eq(bizdevSponsorships.id, id));
      return { success: true };
    }),
  remove: bizdevOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(bizdevSponsorships).where(eq(bizdevSponsorships.id, input.id));
    return { success: true };
  }),
});

const templatesRouter = router({
  list: bizdevOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(bizdevTemplates).orderBy(desc(bizdevTemplates.createdAt));
    return rows.map(r => ({ ...r, tags: parseArr(r.tags) }));
  }),
  create: bizdevOpsProcedure.input(templateCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { tags, ...rest } = input;
    await conn.insert(bizdevTemplates).values({
      ...rest,
      tags: serializeArr(tags ?? null),
    } as any);
    return { success: true };
  }),
  update: bizdevOpsProcedure
    .input(idIn.merge(templateCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, tags, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (tags !== undefined) finalPatch.tags = serializeArr(tags);
      await conn.update(bizdevTemplates).set(finalPatch as any).where(eq(bizdevTemplates.id, id));
      return { success: true };
    }),
  remove: bizdevOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(bizdevTemplates).where(eq(bizdevTemplates.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level BizDev Restored router ─────────────────────────────────────────
export const bizdevRestoredRouter = router({
  campaigns: campaignsRouter,
  grants: grantsRouter,
  sponsorships: sponsorshipsRouter,
  templates: templatesRouter,
});
