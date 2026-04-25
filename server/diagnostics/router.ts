/**
 * Diagnostics router — public diagnostic forms (Clarity, Business, Software,
 * Media, Skills). All submissions land in the `leads` table with a
 * generated HMZ-YY/M-XXXX reference number, ready for the CSO to review.
 *
 * The procedure is `rateLimitedProcedure` (NOT logged in — these forms are
 * public). 5 submissions per IP / 10 minutes is enforced by the middleware.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { rateLimitedProcedure, router } from "../_core/trpc";
import { createLead, generateRefNumber } from "../db";

// ─── Constants ────────────────────────────────────────────────────────────────

const FORM_LABELS = {
  clarity: "Clarity Session",
  business: "Diagnose my Business",
  software: "Diagnose my Software",
  media: "Diagnose my Media",
  skills: "Diagnose my Skills",
} as const;

type FormId = keyof typeof FORM_LABELS;

// ─── Validation helpers ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone: digits, spaces, parens, dashes, plus — at least 10 digits total.
const PHONE_DIGIT_RE = /\d/g;
const PHONE_ALLOWED_RE = /^[\d+\s()\-]+$/;

function isValidPhone(p: string): boolean {
  if (!PHONE_ALLOWED_RE.test(p.trim())) return false;
  const digits = p.match(PHONE_DIGIT_RE);
  return !!digits && digits.length >= 10;
}

// ─── Input schema ────────────────────────────────────────────────────────────

const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
]);

const submitInputSchema = z.object({
  formId: z.enum(["clarity", "business", "software", "media", "skills"]),
  answers: z.record(z.string(), answerValueSchema),
  contact: z.object({
    name: z.string().min(1, "Name is required").max(255),
    email: z.string().email("Please enter a valid email address").max(320),
    phone: z.string().min(7).max(50),
    businessName: z.string().max(255).optional(),
  }),
  ndprConsent: z.literal(true, {
    message: "You must agree to be contacted (NDPR)",
  }),
});

// ─── Router ──────────────────────────────────────────────────────────────────

export const diagnosticsRouter = router({
  /**
   * Public diagnostic form submission. Creates a lead, returns the ref.
   * Inserts the full questionnaire payload into `lead.context` as JSON
   * so the CSO can read every answer back later.
   */
  submit: rateLimitedProcedure
    .input(submitInputSchema)
    .mutation(async ({ input }) => {
      const formId = input.formId as FormId;

      // Extra validation beyond zod (zod's email already covers most cases,
      // we just sanity-check phone format here since zod can't easily express it).
      if (!EMAIL_RE.test(input.contact.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please enter a valid email address.",
        });
      }
      if (!isValidPhone(input.contact.phone)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Please enter a valid phone number (at least 10 digits).",
        });
      }

      const service = `Diagnostic — ${FORM_LABELS[formId]}`;
      const context = JSON.stringify({
        formId,
        answers: input.answers,
        submittedAt: new Date().toISOString(),
      });

      const phone = input.contact.phone.trim();
      const ref = generateRefNumber(phone);
      const lead = await createLead({
        ref,
        name: input.contact.name.trim(),
        businessName: input.contact.businessName?.trim() || undefined,
        phone,
        email: input.contact.email.trim().toLowerCase(),
        service,
        context,
        source: `diagnostic_${formId}`,
      });

      return { success: true as const, ref: lead.ref };
    }),
});
