/**
 * Podcast Ops Portal — tRPC router.
 *
 * Mirrors the 6 localStorage collections that PodcastOpsPortal.tsx used to
 * read/write via opsStore: shows, episodes, guests, publishing, analytics,
 * equipment. All procedures are gated to the Podcast Unit + senior leadership
 * (founder, ceo, podcast_lead, podcast_staff) — matches ROLE_ACCESS for
 * /podcast/ops.
 *
 * Namespace: `podcastOps` (NOT `podcasts` — the latter belongs to the CEO
 * dashboard's `podcastEpisodes` table). Episode rows live in
 * `podcast_episodes_ops` to avoid colliding with the CEO table.
 *
 * The `assets` field on episodes is a JSON-stringified AssetItem[] —
 * serialised on write, parsed on read so the client receives a real array.
 */

import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import superjson from "superjson";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import {
  podcastShows,
  podcastEpisodesOps,
  podcastGuests,
  podcastPublishing,
  podcastAnalytics,
  podcastEquipment,
} from "../../drizzle/schema";

// ─── Local procedure builder (podcast ops staff) ───────────────────────────────
const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

const PODCAST_ROLES = ["founder", "ceo", "podcast_lead", "podcast_staff"];

const podcastOpsOnly = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required." });
  }
  if (!ctx.user.hamzuryRole || !PODCAST_ROLES.includes(ctx.user.hamzuryRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Podcast Ops Portal is for the Podcast Unit, CEO, or Founder.",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const podcastOpsProcedure = t.procedure.use(podcastOpsOnly);
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
 * Asset item zod shape — matches client/src/components/ops/AssetChecklist.AssetItem.
 * Stored on episodes as JSON-stringified text.
 */
const assetItemIn = z.object({
  id: z.string(),
  label: z.string(),
  group: z.string().optional(),
  done: z.boolean(),
  path: z.string().optional(),
  owner: z.string().optional(),
  note: z.string().optional(),
});
type AssetItemShape = z.infer<typeof assetItemIn>;

/** Serialise an AssetItem[] to JSON string for storage. */
function serializeAssets(arr: AssetItemShape[] | undefined | null): string | null {
  if (!arr) return null;
  try { return JSON.stringify(arr); }
  catch { return null; }
}

/** Parse a stored JSON string back to AssetItem[] (or [] on failure). */
function parseAssets(raw: string | null | undefined): AssetItemShape[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ─── Input schemas ─────────────────────────────────────────────────────────────
const idIn = z.object({ id: z.number().int().positive() });

const SHOW_TIER_ENUM = [
  "10ep", "15ep", "20ep", "interview", "edit-only", "corporate",
] as const;
const SHOW_CADENCE_ENUM = ["Weekly", "Biweekly", "Monthly", "Ad-hoc"] as const;
const EPISODE_HOST_ENUM = ["Maryam", "Habeeba", "Co-host"] as const;
const EPISODE_PHASE_ENUM = [
  "topic", "research", "script", "booked", "recorded",
  "assembly", "cleaning", "mixing", "qc", "published",
] as const;
const GUEST_REC_PREF_ENUM = ["Remote", "In-Person"] as const;
const EQUIPMENT_CATEGORY_ENUM = [
  "Microphone", "Interface", "Headphones", "Software", "Other",
] as const;
const EQUIPMENT_CONDITION_ENUM = ["Good", "Needs Repair", "Retired"] as const;

const showCreateIn = z.object({
  clientName: z.string().min(1).max(255),
  showName: z.string().min(1).max(255),
  tier: z.enum(SHOW_TIER_ENUM).optional().default("10ep"),
  episodesTotal: z.number().int().nonnegative().optional().default(0),
  episodesDelivered: z.number().int().nonnegative().optional().default(0),
  priceNGN: z.number().int().nonnegative().optional().default(0),
  startDate: z.string().max(10).optional().nullable(),
  releaseCadence: z.enum(SHOW_CADENCE_ENUM).optional().default("Weekly"),
  contact: z.string().max(255).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const episodeCreateIn = z.object({
  epNumber: z.string().min(1).max(40),
  title: z.string().min(1).max(255),
  topic: z.string().max(255).optional().nullable(),
  showId: z.number().int().positive().optional().nullable(),
  guestName: z.string().max(255).optional().nullable(),
  guestId: z.number().int().positive().optional().nullable(),
  host: z.enum(EPISODE_HOST_ENUM).optional().default("Maryam"),
  phase: z.enum(EPISODE_PHASE_ENUM).optional().default("topic"),
  recordingDate: z.string().max(10).optional().nullable(),
  publishDate: z.string().max(10).optional().nullable(),
  durationTarget: z.string().max(40).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  /** Client passes a real array; server stringifies it for storage. */
  assets: z.array(assetItemIn).optional().nullable(),
});

const guestCreateIn = z.object({
  fullName: z.string().min(1).max(255),
  preferredName: z.string().max(255).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
  company: z.string().max(255).optional().nullable(),
  email: z.string().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  bio: z.string().max(8000).optional().nullable(),
  headshotUrl: z.string().max(1024).optional().nullable(),
  expertise: z.string().max(8000).optional().nullable(),
  talkingPoints: z.string().max(8000).optional().nullable(),
  avoidTopics: z.string().max(8000).optional().nullable(),
  availability: z.string().max(255).optional().nullable(),
  timezone: z.string().max(60).optional().nullable(),
  recordingPreference: z.enum(GUEST_REC_PREF_ENUM).optional().default("Remote"),
  micSetup: z.string().max(255).optional().nullable(),
  briefSent: z.boolean().optional().default(false),
  techCheckDone: z.boolean().optional().default(false),
  formReceived: z.boolean().optional().default(false),
  episodeTitle: z.string().max(255).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const publishingCreateIn = z.object({
  episodeId: z.number().int().positive().optional().nullable(),
  epLabel: z.string().min(1).max(255),
  showId: z.number().int().positive().optional().nullable(),
  scheduledDate: z.string().min(8).max(10),
  apple: z.boolean().optional().default(false),
  spotify: z.boolean().optional().default(false),
  google: z.boolean().optional().default(false),
  amazon: z.boolean().optional().default(false),
  audiogramReady: z.boolean().optional().default(false),
  quoteCardsReady: z.boolean().optional().default(false),
  socialPostScheduled: z.boolean().optional().default(false),
  notes: z.string().max(8000).optional().nullable(),
});

const analyticsCreateIn = z.object({
  episodeId: z.number().int().positive().optional().nullable(),
  epLabel: z.string().min(1).max(255),
  publishedOn: z.string().min(8).max(10),
  downloads7d: z.number().int().nonnegative().optional().default(0),
  downloads30d: z.number().int().nonnegative().optional().nullable(),
  topPlatform: z.string().max(60).optional().nullable(),
  completionPct: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

const equipmentCreateIn = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(EQUIPMENT_CATEGORY_ENUM).optional().default("Microphone"),
  brand: z.string().max(255).optional().nullable(),
  assignedTo: z.string().max(120).optional().nullable(),
  condition: z.enum(EQUIPMENT_CONDITION_ENUM).optional().default("Good"),
  location: z.string().max(255).optional().nullable(),
  serial: z.string().max(255).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
});

// ─── Sub-routers ───────────────────────────────────────────────────────────────
const showsRouter = router({
  list: podcastOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(podcastShows).orderBy(desc(podcastShows.createdAt));
  }),
  create: podcastOpsProcedure.input(showCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(podcastShows).values(input as any);
    return { success: true };
  }),
  update: podcastOpsProcedure
    .input(idIn.merge(showCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(podcastShows).set(patch as any).where(eq(podcastShows.id, id));
      return { success: true };
    }),
  remove: podcastOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(podcastShows).where(eq(podcastShows.id, input.id));
    return { success: true };
  }),
});

const episodesRouter = router({
  list: podcastOpsProcedure
    .input(z.object({ showId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      const rows = input?.showId
        ? await conn.select().from(podcastEpisodesOps)
            .where(eq(podcastEpisodesOps.showId, input.showId))
            .orderBy(desc(podcastEpisodesOps.createdAt))
        : await conn.select().from(podcastEpisodesOps)
            .orderBy(desc(podcastEpisodesOps.createdAt));
      // Parse JSON `assets` so the client always sees a real array.
      return rows.map(r => ({ ...r, assets: parseAssets(r.assets) }));
    }),
  create: podcastOpsProcedure.input(episodeCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    const { assets, ...rest } = input;
    await conn.insert(podcastEpisodesOps).values({
      ...rest,
      assets: serializeAssets(assets ?? null),
    } as any);
    return { success: true };
  }),
  update: podcastOpsProcedure
    .input(idIn.merge(episodeCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, assets, ...patch } = input;
      const finalPatch: Record<string, unknown> = { ...patch };
      // Only touch `assets` if it was actually included in the input.
      if (assets !== undefined) {
        finalPatch.assets = serializeAssets(assets);
      }
      await conn.update(podcastEpisodesOps).set(finalPatch as any).where(eq(podcastEpisodesOps.id, id));
      return { success: true };
    }),
  remove: podcastOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    // Cascade: drop dependent publishing + analytics rows referencing this episode.
    await conn.delete(podcastPublishing).where(eq(podcastPublishing.episodeId, input.id));
    await conn.delete(podcastAnalytics).where(eq(podcastAnalytics.episodeId, input.id));
    await conn.delete(podcastEpisodesOps).where(eq(podcastEpisodesOps.id, input.id));
    return { success: true };
  }),
});

const guestsRouter = router({
  list: podcastOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(podcastGuests).orderBy(desc(podcastGuests.createdAt));
  }),
  create: podcastOpsProcedure.input(guestCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(podcastGuests).values(input as any);
    return { success: true };
  }),
  update: podcastOpsProcedure
    .input(idIn.merge(guestCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(podcastGuests).set(patch as any).where(eq(podcastGuests.id, id));
      return { success: true };
    }),
  remove: podcastOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(podcastGuests).where(eq(podcastGuests.id, input.id));
    return { success: true };
  }),
});

const publishingRouter = router({
  list: podcastOpsProcedure
    .input(z.object({ episodeId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.episodeId) {
        return conn.select().from(podcastPublishing)
          .where(eq(podcastPublishing.episodeId, input.episodeId))
          .orderBy(desc(podcastPublishing.scheduledDate));
      }
      return conn.select().from(podcastPublishing)
        .orderBy(desc(podcastPublishing.scheduledDate));
    }),
  create: podcastOpsProcedure.input(publishingCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(podcastPublishing).values(input as any);
    return { success: true };
  }),
  update: podcastOpsProcedure
    .input(idIn.merge(publishingCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(podcastPublishing).set(patch as any).where(eq(podcastPublishing.id, id));
      return { success: true };
    }),
  remove: podcastOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(podcastPublishing).where(eq(podcastPublishing.id, input.id));
    return { success: true };
  }),
});

const analyticsRouter = router({
  list: podcastOpsProcedure
    .input(z.object({ episodeId: z.number().int().positive().optional() }).optional())
    .query(async ({ input }) => {
      const conn = await db();
      if (input?.episodeId) {
        return conn.select().from(podcastAnalytics)
          .where(eq(podcastAnalytics.episodeId, input.episodeId))
          .orderBy(desc(podcastAnalytics.publishedOn));
      }
      return conn.select().from(podcastAnalytics)
        .orderBy(desc(podcastAnalytics.publishedOn));
    }),
  create: podcastOpsProcedure.input(analyticsCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(podcastAnalytics).values(input as any);
    return { success: true };
  }),
  update: podcastOpsProcedure
    .input(idIn.merge(analyticsCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(podcastAnalytics).set(patch as any).where(eq(podcastAnalytics.id, id));
      return { success: true };
    }),
  remove: podcastOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(podcastAnalytics).where(eq(podcastAnalytics.id, input.id));
    return { success: true };
  }),
});

const equipmentRouter = router({
  list: podcastOpsProcedure.query(async () => {
    const conn = await db();
    return conn.select().from(podcastEquipment).orderBy(desc(podcastEquipment.createdAt));
  }),
  create: podcastOpsProcedure.input(equipmentCreateIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.insert(podcastEquipment).values(input as any);
    return { success: true };
  }),
  update: podcastOpsProcedure
    .input(idIn.merge(equipmentCreateIn.partial()))
    .mutation(async ({ input }) => {
      const conn = await db();
      const { id, ...patch } = input;
      await conn.update(podcastEquipment).set(patch as any).where(eq(podcastEquipment.id, id));
      return { success: true };
    }),
  remove: podcastOpsProcedure.input(idIn).mutation(async ({ input }) => {
    const conn = await db();
    await conn.delete(podcastEquipment).where(eq(podcastEquipment.id, input.id));
    return { success: true };
  }),
});

// ─── Top-level podcastOps router ───────────────────────────────────────────────
export const podcastOpsRouter = router({
  shows: showsRouter,
  episodes: episodesRouter,
  guests: guestsRouter,
  publishing: publishingRouter,
  analytics: analyticsRouter,
  equipment: equipmentRouter,
});
