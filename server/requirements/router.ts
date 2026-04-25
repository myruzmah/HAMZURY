/**
 * Requirements router — post-payment service requirement intake forms.
 *
 * Each Hamzury service (CAC, Compliance, Website, Brand, etc.) has a paired
 * requirement form. Once a lead has paid, they're sent
 * `https://hamzury.com/requirements/<service>?ref=HMZ-YY/M-XXXX` — that page
 * loads the right FORMS entry, verifies the ref via `verifyRef`, lets them
 * upload files via `uploadFile`, then submits the structured payload via
 * `submit`.
 *
 * All three procedures are public-facing: `verifyRef` is a read used to
 * confirm the URL is legitimate before showing the form, while `uploadFile`
 * and `submit` are rate-limited public mutations (5 per IP per 10 minutes
 * via `rateLimitedProcedure`).
 *
 * Storage: file uploads land in the project's existing storage proxy via
 * `storagePut(...)` in server/storage.ts (same path as documents.upload in
 * routers.ts). Files are stored under `requirements/<ref>/<serviceId>/...`.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { publicProcedure, rateLimitedProcedure, router } from "../_core/trpc";
import { getLeadByRef, updateLead } from "../db";
import { storagePut } from "../storage";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * The 24 service ids — kept in lockstep with `client/src/lib/requirement-forms.ts`.
 * Adding a new service means adding it here AND in the FORMS object on the client.
 */
const SERVICE_IDS = [
  // Business (8)
  "cac",
  "compliance",
  "tin",
  "licences",
  "plan",
  "trademark",
  "audit",
  "advisory",
  // Software (5)
  "website",
  "webapp",
  "ecommerce",
  "automation",
  "softwareplus",
  // Media (8)
  "brand",
  "social",
  "content",
  "podcast",
  "video",
  "photography",
  "ads",
  "mediaplus",
  // Skills/HUB (3)
  "training",
  "coaching",
  "consult",
] as const;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file

const REF_RE = /^HMZ-\d{2}\/\d{1,2}-\d{4}$/;

// ─── Input schemas ───────────────────────────────────────────────────────────

const refSchema = z
  .string()
  .trim()
  .regex(REF_RE, "Reference must look like HMZ-YY/M-XXXX.");

const serviceIdSchema = z.enum(SERVICE_IDS);

/** Valid answer types: text/textarea/select/single → string · multi → string[] · number → number. */
const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
]);

const submitInputSchema = z.object({
  ref: refSchema,
  serviceId: serviceIdSchema,
  answers: z.record(z.string(), answerValueSchema),
  uploadKeys: z.record(z.string(), z.array(z.string())),
  ndprConsent: z.literal(true, {
    message: "You must confirm before submitting.",
  }),
});

const uploadInputSchema = z.object({
  ref: refSchema,
  serviceId: serviceIdSchema,
  fieldId: z.string().min(1).max(80),
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(MAX_BYTES),
  /** base64-encoded file contents — same pattern as documents.upload in routers.ts. */
  fileData: z.string().min(1),
});

// ─── Router ──────────────────────────────────────────────────────────────────

export const requirementsRouter = router({
  /**
   * Verify the ?ref= URL param maps to a real lead. Returns lite lead info
   * for the form header (name, businessName, originally-purchased service)
   * so the page can confirm "Hi <name>, let's get the details for <service>".
   */
  verifyRef: publicProcedure
    .input(z.object({ ref: refSchema }))
    .query(async ({ input }) => {
      const lead = await getLeadByRef(input.ref);
      if (!lead) {
        return { valid: false as const };
      }
      return {
        valid: true as const,
        lead: {
          name: lead.name ?? "",
          businessName: lead.businessName ?? "",
          service: lead.service ?? "",
        },
      };
    }),

  /**
   * Direct file upload — accepts base64 file data over tRPC and writes it
   * to the storage proxy under `requirements/<ref>/<serviceId>/<unique>-<name>`.
   * Returns the storage key so the client can include it in the final
   * submit payload.
   *
   * Mirrors the pattern used by `documents.upload` in routers.ts (which is
   * the project's only existing upload path). Express body limit is
   * already 50mb; per-file limit here is enforced at 10 MB.
   */
  uploadFile: rateLimitedProcedure
    .input(uploadInputSchema)
    .mutation(async ({ input }) => {
      const lead = await getLeadByRef(input.ref);
      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reference not found. Check the link and try again.",
        });
      }

      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.length > MAX_BYTES) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Files must be 10 MB or smaller.",
        });
      }

      // Sanitize filename — strip path separators + control chars, cap length.
      const safeName = input.fileName
        .replace(/[\\/]/g, "_")
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f]/g, "")
        .slice(0, 200) || "file";

      // Encode the ref into a path-safe form (replace `/` since it's a path separator).
      const safeRef = input.ref.replace(/\//g, "-");
      const key = `requirements/${safeRef}/${input.serviceId}/${input.fieldId}/${nanoid()}-${safeName}`;

      const result = await storagePut(key, buffer, input.contentType);
      return {
        key: result.key,
        url: result.url,
        fileName: safeName,
        sizeBytes: buffer.length,
      };
    }),

  /**
   * Final submit. Verifies the ref still exists, packages the answers +
   * upload keys into JSON, and writes them onto the lead's `context` field
   * (alongside a status bump to `requirements_collected`). The CSO sees
   * the same lead row in their portal — now with full requirement data
   * attached — and can spawn a task from it.
   *
   * We deliberately do NOT call createTask here. The CSO/finance team
   * controls task creation post-payment in the existing flow; this just
   * captures the intake data and marks the lead as ready for delivery.
   */
  submit: rateLimitedProcedure
    .input(submitInputSchema)
    .mutation(async ({ input }) => {
      const lead = await getLeadByRef(input.ref);
      if (!lead) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reference not found. Please double-check the link.",
        });
      }

      const submittedAt = new Date().toISOString();
      const requirementsPayload = {
        serviceId: input.serviceId,
        answers: input.answers,
        uploadKeys: input.uploadKeys,
        submittedAt,
      };

      // Preserve any existing context (e.g. the diagnostic answers captured
      // at lead creation time) and append the requirements block.
      let mergedContext: string;
      try {
        const existing = lead.context ? JSON.parse(lead.context) : {};
        mergedContext = JSON.stringify({
          ...(typeof existing === "object" && existing !== null
            ? existing
            : { previous: lead.context }),
          requirements: requirementsPayload,
        });
      } catch {
        // Lead context wasn't valid JSON — keep it as a sub-string field.
        mergedContext = JSON.stringify({
          previous: lead.context ?? null,
          requirements: requirementsPayload,
        });
      }

      // Bump status to "onboarding" — semantically: the client has paid and
      // submitted everything we need to begin delivery. (We don't introduce a
      // new enum value because that requires a migration; "onboarding" is
      // already in the leadStatus enum and matches this stage of the flow.)
      await updateLead(lead.id, {
        context: mergedContext,
        status: "onboarding",
      });

      return {
        success: true as const,
        ref: lead.ref,
        submittedAt,
      };
    }),
});
