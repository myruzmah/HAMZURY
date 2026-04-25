/**
 * Faceless Ops Portal — tRPC router.
 *
 * Mirrors the 7 localStorage collections that FacelessOpsPortal.tsx used to
 * read/write via opsStore: content, scripts, voiceovers, production,
 * channels, distribution, tools. The 8th source collection ("templates")
 * is intentionally NOT a table — those 10 ready-to-use script templates
 * remain a hardcoded TS const in the client (they're product copy).
 *
 * All procedures are gated to the Faceless Unit + senior leadership
 * (founder, ceo, faceless_lead, faceless_staff) — matches ROLE_ACCESS for
 * /faceless/ops in client/src/App.tsx.
 *
 * No server-generated ref pattern (no FCL-NNN convention in source).
 *
 * Multi-value JSON columns (stringified text):
 *   - faceless_production.assetSources → string[]
 *   - faceless_distribution.tags        → string[]
 * Parsed on read, stringified on write so the client always receives real arrays.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  facelessContent,
  facelessScripts,
  facelessVoiceovers,
  facelessProduction,
  facelessChannels,
  facelessDistribution,
  facelessTools,
} from "../../drizzle/schema";

// ─── Local procedure builder (faceless ops staff) ─────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const FACELESS_ROLES = ["founder", "ceo", "faceless_lead", "faceless_staff"];

const facelessOpsOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !FACELESS_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Faceless Ops Portal is for the Faceless Unit, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const facelessOpsProcedure = t.procedure.use(facelessOpsOnly);
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
function serializeStringArray(arr: string[] | undefined | null): string | null {
  if (!arr || arr.length === 0) return null;
  try { return JSON.stringify(arr); }
  catch { return null; }
}

/** Parse a stored JSON string back to string[] (or [] on failure). */
function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(x => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// ─── Enums ────────────────────────────────────────────────────────────────────
const CONTENT_STATUS_ENUM = [
  "Idea", "Scripting", "Voiceover", "Editing", "Scheduled", "Published",
] as const;
const SCRIPT_APPROVAL_ENUM = [
  "Draft", "In Review", "Approved", "Revise",
] as const;
const VO_TOOL_ENUM = [
  "ElevenLabs", "Murf", "Play.ht", "Speechify", "Other",
] as const;
const VO_STATUS_ENUM = [
  "Queued", "Generating", "Needs QC", "Approved", "Rejected",
] as const;
const PROD_PATH_ENUM = ["Manual", "AI-Assisted"] as const;
const PROD_EDIT_STATUS_ENUM = [
  "Not Started", "Rough Cut", "Polishing", "QC", "Exported",
] as const;
const CHANNEL_KIND_ENUM = [
  "YouTube Channel", "Social Package", "Bulk Package",
] as const;
const CHANNEL_STATUS_ENUM = [
  "Onboarding", "Active", "Paused", "Completed",
] as const;
const DIST_PLATFORM_ENUM = [
  "YouTube", "YouTube Shorts", "TikTok", "Instagram Reels", "Instagram", "Facebook",
] as const;
const DIST_STATUS_ENUM = [
  "Scheduled", "Published", "Draft", "Failed",
] as const;
const TOOL_CATEGORY_ENUM = [
  "Voice", "Script", "Video", "Image", "Stock", "Music", "Editing", "Captions", "Scheduler",
] as const;

// ─── Input schemas ────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const contentCreateIn = z.object({
  topic: z.string().min(1).max(255),
  niche: z.string().max(120).optional().nullable(),
  client: z.string().min(1).max(255),
  channel: z.string().min(1).max(255),
  format: z.string().max(120).optional().nullable(),
  publishDate: z.string().max(10).optional().nullable(),
  status: z.enum(CONTENT_STATUS_ENUM).optional().default("Idea"),
  notes: z.string().max(8000).optional().nullable(),
});

const scriptCreateIn = z.object({
  title: z.string().min(1).max(255),
  contentId: z.number().int().positive().optional().nullable(),
  hook: z.string().min(1),
  body: z.string().optional().nullable(),
  cta: z.string().optional().nullable(),
  aiPrompt: z.string().optional().nullable(),
  wordCount: z.number().int().nonnegative().optional().nullable(),
  approval: z.enum(SCRIPT_APPROVAL_ENUM).optional().default("Draft"),
  reviewer: z.string().max(120).optional().nullable(),
});

const voiceoverCreateIn = z.object({
  scriptTitle: z.string().min(1).max(255),
  scriptId: z.number().int().positive().optional().nullable(),
  tool: z.enum(VO_TOOL_ENUM).optional().default("ElevenLabs"),
  voice: z.string().min(1).max(255),
  speed: z.string().max(60).optional().nullable(),
  audioPath: z.string().max(1024).optional().nullable(),
  status: z.enum(VO_STATUS_ENUM).optional().default("Queued"),
  note: z.string().max(8000).optional().nullable(),
});

const productionCreateIn = z.object({
  videoTitle: z.string().min(1).max(255),
  contentId: z.number().int().positive().optional().nullable(),
  path: z.enum(PROD_PATH_ENUM).optional().default("Manual"),
  /** Client passes a real array; server stringifies it for storage. */
  assetSources: z.array(z.string()).optional().nullable(),
  assetsReady: z.boolean().optional().default(false),
  voFileReady: z.boolean().optional().default(false),
  editStatus: z.enum(PROD_EDIT_STATUS_ENUM).optional().default("Not Started"),
  exportPath: z.string().max(1024).optional().nullable(),
  duration: z.string().max(40).optional().nullable(),
});

const channelCreateIn = z.object({
  kind: z.enum(CHANNEL_KIND_ENUM).optional().default("Social Package"),
  name: z.string().min(1).max(255),
  client: z.string().min(1).max(255),
  niche: z.string().max(120).optional().nullable(),
  tier: z.string().max(120).optional().nullable(),
  priceNGN: z.number().int().nonnegative().optional().nullable(),
  monthlyQuota: z.number().int().nonnegative().optional().nullable(),
  delivered: z.number().int().nonnegative().optional().nullable(),
  status: z.enum(CHANNEL_STATUS_ENUM).optional().default("Onboarding"),
  startedAt: z.string().max(10).optional().nullable(),
});

const distributionCreateIn = z.object({
  videoTitle: z.string().min(1).max(255),
  platform: z.enum(DIST_PLATFORM_ENUM).optional().default("YouTube"),
  thumbnailUrl: z.string().max(1024).optional().nullable(),
  /** Client passes a real array; server stringifies it for storage. */
  tags: z.array(z.string()).optional().nullable(),
  scheduleAt: z.string().max(32).optional().nullable(),
  publishedAt: z.string().max(32).optional().nullable(),
  status: z.enum(DIST_STATUS_ENUM).optional().default("Draft"),
  channelName: z.string().max(255).optional().nullable(),
});

const toolCreateIn = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(TOOL_CATEGORY_ENUM).optional().default("Voice"),
  monthlyNGN: z.number().int().nonnegative().optional().default(0),
  seats: z.number().int().nonnegative().optional().nullable(),
  renewsOn: z.string().max(10).optional().nullable(),
  note: z.string().max(8000).optional().nullable(),
});

// ─── Sub-routers ──────────────────────────────────────────────────────────────
const contentRouter = router({
  list: facelessOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(facelessContent).orderBy(desc(facelessContent.createdAt));
  }),
  create: facelessOpsProcedure.input(contentCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(facelessContent).values(input as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(contentCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(facelessContent).set(patch as any).where(eq(facelessContent.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessContent).where(eq(facelessContent.id, input.id));
    return { success: true };
  }),
});

const scriptsRouter = router({
  list: facelessOpsProcedure
    .input(z.object({ contentId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.contentId) {
        return conn.select().from(facelessScripts)
          .where(eq(facelessScripts.contentId, input.contentId))
          .orderBy(desc(facelessScripts.createdAt));
      }
      return conn.select().from(facelessScripts).orderBy(desc(facelessScripts.createdAt));
    }),
  create: facelessOpsProcedure.input(scriptCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(facelessScripts).values(input as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(scriptCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(facelessScripts).set(patch as any).where(eq(facelessScripts.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessScripts).where(eq(facelessScripts.id, input.id));
    return { success: true };
  }),
});

const voiceoversRouter = router({
  list: facelessOpsProcedure
    .input(z.object({ scriptId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.scriptId) {
        return conn.select().from(facelessVoiceovers)
          .where(eq(facelessVoiceovers.scriptId, input.scriptId))
          .orderBy(desc(facelessVoiceovers.createdAt));
      }
      return conn.select().from(facelessVoiceovers).orderBy(desc(facelessVoiceovers.createdAt));
    }),
  create: facelessOpsProcedure.input(voiceoverCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(facelessVoiceovers).values(input as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(voiceoverCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(facelessVoiceovers).set(patch as any).where(eq(facelessVoiceovers.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessVoiceovers).where(eq(facelessVoiceovers.id, input.id));
    return { success: true };
  }),
});

const productionRouter = router({
  list: facelessOpsProcedure
    .input(z.object({ contentId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      const rows = input?.contentId
        ? await conn.select().from(facelessProduction)
            .where(eq(facelessProduction.contentId, input.contentId))
            .orderBy(desc(facelessProduction.createdAt))
        : await conn.select().from(facelessProduction)
            .orderBy(desc(facelessProduction.createdAt));
      // Parse JSON `assetSources` so the client always sees a real array.
      return rows.map(r => ({ ...r, assetSources: parseStringArray(r.assetSources) }));
    }),
  create: facelessOpsProcedure.input(productionCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { assetSources, ...rest } = input;
    await conn.insert(facelessProduction).values({
      ...rest,
      assetSources: serializeStringArray(assetSources ?? null),
    } as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(productionCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, assetSources, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (assetSources !== undefined) {
        finalPatch.assetSources = serializeStringArray(assetSources);
      }
      await conn.update(facelessProduction).set(finalPatch as any)
        .where(eq(facelessProduction.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessProduction).where(eq(facelessProduction.id, input.id));
    return { success: true };
  }),
});

const channelsRouter = router({
  list: facelessOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(facelessChannels).orderBy(desc(facelessChannels.createdAt));
  }),
  create: facelessOpsProcedure.input(channelCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(facelessChannels).values(input as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(channelCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(facelessChannels).set(patch as any).where(eq(facelessChannels.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessChannels).where(eq(facelessChannels.id, input.id));
    return { success: true };
  }),
});

const distributionRouter = router({
  list: facelessOpsProcedure.query(async () => {
    const conn = await db();
    const rows = await conn.select().from(facelessDistribution)
      .orderBy(desc(facelessDistribution.createdAt));
    // Parse JSON `tags` so the client always sees a real array.
    return rows.map(r => ({ ...r, tags: parseStringArray(r.tags) }));
  }),
  create: facelessOpsProcedure.input(distributionCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { tags, ...rest } = input;
    await conn.insert(facelessDistribution).values({
      ...rest,
      tags: serializeStringArray(tags ?? null),
    } as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(distributionCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, tags, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      if (tags !== undefined) {
        finalPatch.tags = serializeStringArray(tags);
      }
      await conn.update(facelessDistribution).set(finalPatch as any)
        .where(eq(facelessDistribution.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessDistribution).where(eq(facelessDistribution.id, input.id));
    return { success: true };
  }),
});

const toolsRouter = router({
  list: facelessOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(facelessTools).orderBy(desc(facelessTools.createdAt));
  }),
  create: facelessOpsProcedure.input(toolCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(facelessTools).values(input as any);
    return { success: true };
  }),
  update: facelessOpsProcedure
    .input(idIn.merge(toolCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(facelessTools).set(patch as any).where(eq(facelessTools.id, id));
      return { success: true };
    }),
  remove: facelessOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(facelessTools).where(eq(facelessTools.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level faceless router ────────────────────────────────────────────────
export const facelessRouter = router({
  content: contentRouter,
  scripts: scriptsRouter,
  voiceovers: voiceoversRouter,
  production: productionRouter,
  channels: channelsRouter,
  distribution: distributionRouter,
  tools: toolsRouter,
});
