/**
 * Diagnostics router — public diagnostic forms (Clarity, Business, Software,
 * Media, Skills). All submissions land in the `leads` table with a
 * generated HMZ-YY/M-XXXX reference number, ready for the CSO to review.
 *
 * Clarity Session is special: after the primary lead is created, the answers
 * are run through `analyzeClarityAnswers` and one extra lead is inserted per
 * matched Hamzury division (Bizdoc / Scalar / Medialy / HUB). The CSO then
 * receives ONE consolidated email per the SINGLE POINT OF CONTACT rule —
 * companies do NOT each contact the visitor separately.
 *
 * The procedure is `rateLimitedProcedure` (NOT logged in — these forms are
 * public). 5 submissions per IP / 10 minutes is enforced by the middleware.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { rateLimitedProcedure, router } from "../_core/trpc";
import { createLead, generateRefNumber } from "../db";
import {
  analyzeClarityAnswers,
  COMPANY_LABELS,
  type MatchedCompany,
} from "./cross-company-router";
import {
  sendClarityMultiMatchEmail,
  sendNewLeadAlert,
} from "../email";

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

// ─── Per-site diagnostic input schema (Bizdoc / Scalar / Medialy) ────────────
// These three forms are SEPARATE from the 14-q Hamzury Clarity Session.
// Each posts a verbatim Q&A array (so we never have to map indexes here)
// alongside the standard contact block. Everything serialised to lead.context.

const qaPairSchema = z.object({
  /** Section eyebrow for the question (e.g. "Registration", "Tax"). */
  section: z.string().max(120),
  /** The question text exactly as shown to the user. */
  question: z.string().max(500),
  /** The user's answer — string, array of strings, or number. */
  answer: z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z.null(),
  ]),
});

const perSiteContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Please enter a valid email address").max(320),
  phone: z.string().min(7).max(50),
  businessName: z.string().max(255).optional(),
});

const perSiteSubmitInputSchema = z.object({
  qa: z.array(qaPairSchema).min(1).max(40),
  contact: perSiteContactSchema,
  ndprConsent: z.literal(true, {
    message: "You must agree to be contacted (NDPR)",
  }),
});

type PerSiteSubmitInput = z.infer<typeof perSiteSubmitInputSchema>;

/**
 * Shared submit pipeline for the 3 per-site diagnostic forms.
 * Validates email + phone, generates ref, writes one row to `leads`, fires
 * the standard new-lead alert email, and returns the ref to the client.
 */
async function submitPerSiteDiagnostic(opts: {
  input: PerSiteSubmitInput;
  source: string;
  serviceLabel: string;
}): Promise<{ success: true; ref: string }> {
  const { input, source, serviceLabel } = opts;

  if (!EMAIL_RE.test(input.contact.email)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Please enter a valid email address.",
    });
  }
  if (!isValidPhone(input.contact.phone)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Please enter a valid phone number (at least 10 digits).",
    });
  }

  const phone = input.contact.phone.trim();
  const name = input.contact.name.trim();
  const email = input.contact.email.trim().toLowerCase();
  const businessName = input.contact.businessName?.trim() || undefined;

  const context = JSON.stringify({
    source,
    serviceLabel,
    qa: input.qa,
    submittedAt: new Date().toISOString(),
  });

  // 2026-04-30 — auto-tag the division so CSO inbox shows the right
  // colored badge. Per-site diagnostics know exactly which division they
  // belong to (bizdoc / scalar / medialy / hub).
  const sourceToDept: Record<string, string> = {
    diagnostic_bizdoc: "bizdoc",
    diagnostic_scalar: "systemise",
    diagnostic_medialy: "medialy",
    diagnostic_hub: "skills",
  };
  const assignedDepartment = sourceToDept[source];

  const ref = generateRefNumber(phone);
  const lead = await createLead({
    ref,
    name,
    businessName,
    phone,
    email,
    service: serviceLabel,
    context,
    source,
    status: "new",
    assignedDepartment,
  });

  try {
    await sendNewLeadAlert({
      ref: lead.ref,
      clientName: name,
      service: serviceLabel,
      phone,
      email,
      source,
    });
  } catch (err) {
    console.error("[diagnostics] Failed to send lead alert email:", err);
  }

  return { success: true as const, ref: lead.ref };
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const diagnosticsRouter = router({
  /**
   * Public diagnostic form submission. Creates a lead, returns the ref.
   * Inserts the full questionnaire payload into `lead.context` as JSON
   * so the CSO can read every answer back later.
   *
   * For Clarity Session submissions, also creates one cross-routed lead
   * per matched division (Bizdoc / Scalar / Medialy / HUB) and sends ONE
   * consolidated email to the CSO. If no matches, falls back to the
   * standard single-lead alert.
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
      const name = input.contact.name.trim();
      const email = input.contact.email.trim().toLowerCase();
      const businessName = input.contact.businessName?.trim() || undefined;

      const ref = generateRefNumber(phone);
      const lead = await createLead({
        ref,
        name,
        businessName,
        phone,
        email,
        service,
        context,
        source: `diagnostic_${formId}`,
      });

      // ─── Cross-company routing — Clarity Session only ──────────────────────
      let matches: MatchedCompany[] = [];
      const routedRefs: Array<{
        company: string;
        primaryService: string;
        reason: string;
        ref: string;
      }> = [];

      if (formId === "clarity") {
        // Coerce answers shape: client form sends Record<string, string|number|string[]>.
        matches = analyzeClarityAnswers(
          input.answers as Record<string, string | number | string[]>,
        );

        for (const match of matches) {
          try {
            const routedRef = generateRefNumber(phone);
            const routedLead = await createLead({
              ref: routedRef,
              name,
              businessName,
              phone,
              email,
              service: match.primaryService,
              // Schema has no separate `notes` column — encode the routing
              // reason + back-reference into `context` so the CSO sees it.
              context: `${match.reason}. Cross-routed from clarity ref ${lead.ref}`,
              source: "diagnostic_clarity_routed",
              status: "new",
            });
            routedRefs.push({
              company: COMPANY_LABELS[match.company],
              primaryService: match.primaryService,
              reason: match.reason,
              ref: routedLead.ref,
            });
          } catch (err) {
            // One failed routed lead must not break the whole submit —
            // the primary lead is already saved.
            console.error(
              `[diagnostics] Failed to create routed lead for ${match.company}:`,
              err,
            );
          }
        }
      }

      // ─── Email: ONE consolidated for multi-match Clarity, else standard ───
      try {
        if (formId === "clarity" && routedRefs.length > 0) {
          await sendClarityMultiMatchEmail({
            primaryRef: lead.ref,
            visitorName: name,
            businessName,
            phone,
            email,
            matches: routedRefs,
          });
        } else {
          // Fallback: standard single-lead email (existing behavior),
          // used for non-clarity forms AND for clarity submissions with
          // zero matches.
          await sendNewLeadAlert({
            ref: lead.ref,
            clientName: name,
            service,
            phone,
            email,
            source: `diagnostic_${formId}`,
          });
        }
      } catch (err) {
        // Email failure must not fail the form submission.
        console.error("[diagnostics] Failed to send lead alert email:", err);
      }

      return {
        success: true as const,
        ref: lead.ref,
        routedLeads: routedRefs.length,
      };
    }),

  /**
   * BIZDOC site diagnostic — 8 short questions about CAC / TIN / tax / annual
   * returns / business stage. Separate flow from the 14-q Clarity Session.
   * Lands as a single lead with `source = "diagnostic_bizdoc"`.
   */
  submitBizdoc: rateLimitedProcedure
    .input(perSiteSubmitInputSchema)
    .mutation(async ({ input }) => {
      return submitPerSiteDiagnostic({
        input,
        source: "diagnostic_bizdoc",
        serviceLabel: "Diagnostic — Bizdoc (Compliance)",
      });
    }),

  /**
   * SCALAR site audit — software / systems / automation / AI readiness.
   * Lands as a single lead with `source = "diagnostic_scalar"`.
   */
  submitScalarAudit: rateLimitedProcedure
    .input(perSiteSubmitInputSchema)
    .mutation(async ({ input }) => {
      return submitPerSiteDiagnostic({
        input,
        source: "diagnostic_scalar",
        serviceLabel: "Diagnostic — Scalar (Software Audit)",
      });
    }),

  /**
   * MEDIALY site brand diagnostic — brand identity, content, social cadence.
   * Lands as a single lead with `source = "diagnostic_medialy"`.
   */
  submitMedialyBrand: rateLimitedProcedure
    .input(perSiteSubmitInputSchema)
    .mutation(async ({ input }) => {
      return submitPerSiteDiagnostic({
        input,
        source: "diagnostic_medialy",
        serviceLabel: "Diagnostic — Medialy (Brand)",
      });
    }),
});
