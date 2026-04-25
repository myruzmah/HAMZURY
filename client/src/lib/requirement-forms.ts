/**
 * Service requirement form definitions — post-payment intake forms.
 *
 * Each Hamzury service (CAC, Compliance, Website, Brand, etc.) has its own
 * step-by-step requirement form. These are the forms a client sees AFTER
 * paying for a service: they collect everything the delivery team needs to
 * start work — names, addresses, IDs, asset uploads, etc.
 *
 * This file currently only ports the `cac` entry verbatim from the source
 * HTML (`/tmp/hamzury-pkg/hamzury-package/hamzury-requirements.html`). The
 * other 23 services are added in follow-up sessions — adding one is just:
 *   (a) extend the FORMS object below
 *   (b) add a one-line route in App.tsx
 *
 * The schema is intentionally a strict superset of the diagnostic-form
 * schema so RequirementForm.tsx can mirror DiagnosticForm.tsx's shape.
 */

// ─── Service ID union — keep this in lockstep with SERVICE_IDS in
// `server/requirements/router.ts`. Adding a service means updating both. ─
export type RequirementFormId =
  // Business (8)
  | "cac"
  | "compliance"
  | "tin"
  | "licences"
  | "plan"
  | "trademark"
  | "audit"
  | "advisory"
  // Software (5)
  | "website"
  | "webapp"
  | "ecommerce"
  | "automation"
  | "softwareplus"
  // Media (8)
  | "brand"
  | "social"
  | "content"
  | "podcast"
  | "video"
  | "photography"
  | "ads"
  | "mediaplus"
  // Skills/HUB (3)
  | "training"
  | "coaching"
  | "consult";

// ─── Field types ──────────────────────────────────────────────────────────

export interface BaseField {
  /** Stable id used as the answer/upload key. */
  id: string;
  /** Human-readable label rendered above the input. */
  label: string;
  /** Marks the field as required. Submit/continue is blocked until filled. */
  required?: boolean;
  /** Placeholder text inside text/textarea/select inputs. */
  placeholder?: string;
  /** Helper line shown under the field. */
  hint?: string;
}

export interface TextField extends BaseField {
  type: "text" | "email" | "tel" | "number";
}

export interface TextareaField extends BaseField {
  type: "textarea";
}

export interface SelectField extends BaseField {
  type: "select";
  options: string[];
}

export interface FileField extends BaseField {
  type: "file";
  /** HTML accept attribute (e.g. "image/*,.pdf"). */
  accept?: string;
  /** Allow multiple files. Defaults to false. */
  multiple?: boolean;
  /** Optional cap on number of files when `multiple: true`. */
  maxFiles?: number;
}

export type RequirementField =
  | TextField
  | TextareaField
  | SelectField
  | FileField;

export interface RequirementStep {
  /** Step heading, e.g. "Proposed names". */
  title: string;
  /** Optional sub-heading shown under the title. */
  subtitle?: string;
  fields: RequirementField[];
}

export interface RequirementForm {
  /** Department key — used for analytics/grouping. */
  department: "business" | "software" | "media" | "skills";
  /** Display name, e.g. "CAC Registration". */
  name: string;
  /** Top-of-page intro card. */
  intro: {
    /** Short eyebrow line shown above the title. */
    eyebrow: string;
    /** Hero title — may contain `<em>` HTML. */
    title: string;
    /** Body paragraph under the title. */
    body: string;
    /** Estimated time, e.g. "8-10 minutes". */
    duration: string;
  };
  steps: RequirementStep[];
}

// ─── FORMS ────────────────────────────────────────────────────────────────

export const FORMS: Partial<Record<RequirementFormId, RequirementForm>> = {
  cac: {
    department: "business",
    name: "CAC Registration",
    intro: {
      eyebrow: "Service requirements",
      title: "Let's <em>register</em> your business.",
      body: "We need a few details to file with the Corporate Affairs Commission. This takes about 8\u201310 minutes, and you can save and return anytime.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "Proposed names",
        subtitle:
          "We check availability and file with your first choice. If taken, we use the second.",
        fields: [
          {
            type: "text",
            id: "name1",
            label: "First choice business name",
            required: true,
            placeholder: "e.g. Hamzury Limited",
          },
          {
            type: "text",
            id: "name2",
            label: "Second choice",
            required: true,
            placeholder: "In case the first is taken",
          },
          {
            type: "select",
            id: "entity_type",
            label: "Entity type",
            required: true,
            options: [
              "Limited Liability Company (Ltd)",
              "Business Name (BN)",
              "Incorporated Trustees",
              "Partnership",
              "I\u2019m not sure \u2014 advise me",
            ],
          },
        ],
      },
      {
        title: "About the business",
        subtitle: "What it does, where it\u2019s based.",
        fields: [
          {
            type: "textarea",
            id: "nature",
            label: "Nature of business",
            required: true,
            placeholder:
              "Describe what the business does in 2\u20133 sentences.",
          },
          {
            type: "text",
            id: "address",
            label: "Proposed registered address",
            required: true,
            placeholder: "Street, city, state",
          },
          {
            type: "number",
            id: "share_capital",
            label: "Share capital (\u20a6)",
            placeholder: "100,000 (default minimum)",
            hint: "Leave blank to use the CAC minimum.",
          },
        ],
      },
      {
        title: "Director details",
        subtitle:
          "For the primary director. We\u2019ll collect additional directors separately if needed.",
        fields: [
          { type: "text", id: "director_name", label: "Full name", required: true },
          {
            type: "text",
            id: "director_address",
            label: "Residential address",
            required: true,
          },
          {
            type: "tel",
            id: "director_phone",
            label: "Phone number",
            required: true,
            placeholder: "+234 ...",
          },
          {
            type: "email",
            id: "director_email",
            label: "Email address",
            required: true,
          },
        ],
      },
      {
        title: "Documents",
        subtitle:
          "Upload the director\u2019s ID and a passport photograph. Images or PDFs, up to 10MB each.",
        fields: [
          {
            type: "file",
            id: "director_id",
            label:
              "Government ID (NIN, Driver\u2019s Licence, or International Passport)",
            required: true,
            accept: "image/*,.pdf",
          },
          {
            type: "file",
            id: "passport_photo",
            label: "Passport photograph",
            required: true,
            accept: "image/*",
          },
          {
            type: "file",
            id: "signature",
            label: "Signature (white background, clear)",
            accept: "image/*",
          },
        ],
      },
      {
        title: "Anything else?",
        subtitle: "Additional notes, special requests, or questions for our team.",
        fields: [
          {
            type: "textarea",
            id: "notes",
            label: "Notes",
            placeholder:
              "Optional \u2014 anything you\u2019d like us to know.",
          },
        ],
      },
    ],
  },
};
