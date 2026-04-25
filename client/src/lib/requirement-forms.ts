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
  // Business (6)
  | "cac"
  | "tin"
  | "licences"
  | "plan"
  | "trademark"
  | "compliance"
  // Software (6)
  | "website"
  | "crm"
  | "ai_integration"
  | "automation"
  | "ecommerce"
  | "software_mgmt"
  // Media (6)
  | "brand"
  | "social"
  | "podcast"
  | "content_strategy"
  | "video"
  | "media_mgmt"
  // Skills (6)
  | "tech_training"
  | "ai_business"
  | "entrepreneurship"
  | "team_training"
  | "certification"
  | "skills_mgmt";

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

  // ═══ BUSINESS — remaining 5 ═══════════════════════════════════════════
  tin: {
    department: "business",
    name: "Tax Registration (TIN)",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s get your <em>TIN</em>.",
      body: "Everything we need to file your Tax Identification Number with the Federal Inland Revenue Service.",
      duration: "5\u20137 minutes",
    },
    steps: [
      {
        title: "Business basics",
        fields: [
          { type: "text", id: "business_name", label: "Business legal name", required: true },
          { type: "text", id: "rc_number", label: "RC / BN number", required: true, placeholder: "e.g. RC 123456" },
          { type: "textarea", id: "nature", label: "Nature of business", required: true, placeholder: "What does the business do?" },
          { type: "text", id: "address", label: "Registered address", required: true },
        ],
      },
      {
        title: "Director / proprietor",
        fields: [
          { type: "text", id: "director_name", label: "Full name", required: true },
          { type: "tel", id: "director_phone", label: "Phone", required: true, placeholder: "+234 ..." },
          { type: "email", id: "director_email", label: "Email", required: true },
          { type: "text", id: "director_nin", label: "NIN", required: true, hint: "Your 11-digit National Identification Number." },
        ],
      },
      {
        title: "Documents",
        subtitle: "Upload clear images or PDFs. Max 10MB each.",
        fields: [
          { type: "file", id: "cac_cert", label: "CAC Certificate", required: true, accept: ".pdf,image/*" },
          { type: "file", id: "memart", label: "MEMART (if Ltd)", accept: ".pdf,image/*" },
          { type: "file", id: "director_id", label: "Director\u2019s government ID", required: true, accept: ".pdf,image/*" },
          { type: "file", id: "utility_bill", label: "Recent utility bill for proof of address", accept: ".pdf,image/*", hint: "Not older than 3 months." },
        ],
      },
    ],
  },

  licences: {
    department: "business",
    name: "Business Licences",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s get your <em>licence</em> sorted.",
      body: "Tell us which licence, where, and we handle the regulator.",
      duration: "7\u20139 minutes",
    },
    steps: [
      {
        title: "Which licence?",
        fields: [
          {
            type: "select",
            id: "licence_type",
            label: "Licence type",
            required: true,
            options: [
              "NAFDAC (food, drug, cosmetics)",
              "SCUML (DNFBPs)",
              "SON (standards)",
              "NESREA (environmental)",
              "State operating permit",
              "Industry-specific (specify below)",
              "Not sure \u2014 advise me",
            ],
          },
          { type: "textarea", id: "specifics", label: "Describe what you need", placeholder: "Which product, what state, any deadline?" },
          {
            type: "select",
            id: "urgency",
            label: "Urgency",
            required: true,
            options: [
              "Standard (6\u20138 weeks)",
              "Expedited (3\u20134 weeks)",
              "Emergency \u2014 already operating and need this fast",
            ],
          },
        ],
      },
      {
        title: "Business details",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          { type: "text", id: "rc_number", label: "RC / BN number", required: true },
          { type: "text", id: "tin", label: "TIN", required: true },
          { type: "text", id: "premises_address", label: "Premises address", required: true, hint: "The exact location the licence will cover." },
        ],
      },
      {
        title: "Documents",
        fields: [
          { type: "file", id: "cac_cert", label: "CAC Certificate", required: true, accept: ".pdf,image/*" },
          { type: "file", id: "tin_cert", label: "TIN Certificate", accept: ".pdf,image/*" },
          { type: "file", id: "premises_photos", label: "Photos of your premises", accept: "image/*", multiple: true },
          { type: "file", id: "product_docs", label: "Product / service documentation", accept: ".pdf,image/*", multiple: true, hint: "Specs, labels, ingredient lists \u2014 whatever applies." },
        ],
      },
    ],
  },

  plan: {
    department: "business",
    name: "Business Plan",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s write your <em>plan</em>.",
      body: "A real business plan that raises money or guides decisions \u2014 not a 40-page document that sits on a shelf.",
      duration: "10\u201312 minutes",
    },
    steps: [
      {
        title: "The business",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          {
            type: "select",
            id: "stage",
            label: "Stage",
            required: true,
            options: [
              "Idea \u2014 not started",
              "Pre-revenue \u2014 building",
              "Earning \u2014 under \u20a65M/yr",
              "Earning \u2014 \u20a65\u201350M/yr",
              "Earning \u2014 over \u20a650M/yr",
            ],
          },
          { type: "text", id: "industry", label: "Industry", required: true },
          { type: "textarea", id: "what_you_do", label: "What does the business do?", required: true, placeholder: "In plain language \u2014 pretend you\u2019re describing it to your mum." },
        ],
      },
      {
        title: "The plan",
        subtitle: "Purpose of this document.",
        fields: [
          {
            type: "select",
            id: "purpose",
            label: "What\u2019s this plan for?",
            required: true,
            options: [
              "Raising investor funding",
              "Applying for a bank loan",
              "Applying for a grant",
              "Internal strategy",
              "Partner / stakeholder alignment",
              "Multiple of the above",
            ],
          },
          { type: "text", id: "audience", label: "Who will read it?", placeholder: "Specific investor? Bank? Grant body?" },
          { type: "textarea", id: "goals", label: "Specific goals this plan should help you achieve", required: true, placeholder: "Be specific with amounts and timelines." },
        ],
      },
      {
        title: "The market",
        fields: [
          { type: "textarea", id: "customer", label: "Who is your ideal customer?", required: true, placeholder: "Be specific \u2014 demographics, behaviours, where they spend time." },
          { type: "textarea", id: "problem", label: "What problem do you solve for them?", required: true },
          { type: "textarea", id: "competitors", label: "Main competitors and how you\u2019re different", required: true },
        ],
      },
      {
        title: "What you have",
        fields: [
          { type: "file", id: "existing_docs", label: "Any existing documents we can use", accept: ".pdf,.doc,.docx,image/*", multiple: true, hint: "Old pitch decks, financial projections, market research \u2014 anything." },
          { type: "textarea", id: "financials", label: "Financial snapshot", placeholder: "Current monthly revenue, costs, what you need funding for. Rough numbers are fine." },
        ],
      },
    ],
  },

  trademark: {
    department: "business",
    name: "Trademark Registration",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>protect</em> your brand.",
      body: "We file with the Trademarks, Patents & Designs Registry on your behalf.",
      duration: "6\u20138 minutes",
    },
    steps: [
      {
        title: "The mark",
        fields: [
          { type: "text", id: "brand_name", label: "Name / word mark to register", required: true },
          { type: "textarea", id: "description", label: "Describe what this mark represents", required: true, placeholder: "What products / services does it cover?" },
          {
            type: "select",
            id: "mark_type",
            label: "Type of mark",
            required: true,
            options: [
              "Word only (text)",
              "Logo only (image)",
              "Word + logo combined",
              "Not sure \u2014 advise me",
            ],
          },
        ],
      },
      {
        title: "Applicant",
        fields: [
          { type: "select", id: "applicant_type", label: "Registering as", required: true, options: ["Individual", "Registered company"] },
          { type: "text", id: "applicant_name", label: "Applicant full name / company name", required: true },
          { type: "text", id: "applicant_address", label: "Address", required: true },
          { type: "email", id: "applicant_email", label: "Email", required: true },
          { type: "tel", id: "applicant_phone", label: "Phone", required: true },
        ],
      },
      {
        title: "Documents",
        fields: [
          { type: "file", id: "logo_file", label: "Logo file (high-resolution)", required: true, accept: "image/*,.svg,.ai,.eps,.pdf" },
          { type: "file", id: "applicant_id", label: "Applicant\u2019s ID (NIN, passport) or CAC Certificate", required: true, accept: ".pdf,image/*" },
          { type: "file", id: "specimen", label: "Specimen of use (optional)", accept: "image/*,.pdf", hint: "A photo of the mark in use \u2014 on packaging, a signboard, your website." },
        ],
      },
    ],
  },

  compliance: {
    department: "business",
    name: "Compliance Management",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>onboard</em> your business.",
      body: "Everything we need to take compliance off your plate for the year. You\u2019ll upload key documents once, and we handle the rest.",
      duration: "10\u201312 minutes",
    },
    steps: [
      {
        title: "Business basics",
        subtitle: "The foundation of your compliance profile.",
        fields: [
          { type: "text", id: "business_name", label: "Business legal name", required: true },
          { type: "text", id: "rc_number", label: "RC / BN number", required: true, placeholder: "e.g. RC 123456" },
          { type: "text", id: "tin", label: "Tax Identification Number (TIN)", required: true },
          { type: "text", id: "address", label: "Registered address", required: true },
        ],
      },
      {
        title: "Documents",
        subtitle: "Upload your current compliance documents. Anything missing, we\u2019ll flag and help you get.",
        fields: [
          { type: "file", id: "cac_cert", label: "CAC Certificate of Incorporation", required: true, accept: ".pdf,image/*" },
          { type: "file", id: "memart", label: "Memorandum & Articles of Association", accept: ".pdf,image/*" },
          { type: "file", id: "tin_cert", label: "TIN certificate", accept: ".pdf,image/*" },
          { type: "file", id: "last_tax", label: "Last filed tax returns (if any)", accept: ".pdf,image/*" },
          { type: "file", id: "bank_statement", label: "Last 6 months bank statements", accept: ".pdf", multiple: true },
        ],
      },
      {
        title: "Team access",
        subtitle: "Who we coordinate with each month.",
        fields: [
          { type: "text", id: "contact_name", label: "Primary point-of-contact name", required: true },
          { type: "text", id: "contact_role", label: "Their role", required: true, placeholder: "e.g. Founder, Accountant, Admin" },
          { type: "email", id: "contact_email", label: "Email", required: true },
          { type: "tel", id: "contact_phone", label: "Phone / WhatsApp", required: true },
        ],
      },
      {
        title: "Current situation",
        subtitle: "A quick snapshot so we start the year with clear eyes.",
        fields: [
          {
            type: "select",
            id: "last_filing",
            label: "When did you last file taxes?",
            required: true,
            options: [
              "Within the past 6 months",
              "Within the past year",
              "1\u20132 years ago",
              "More than 2 years",
              "Never filed",
              "Not sure",
            ],
          },
          {
            type: "select",
            id: "penalty_status",
            label: "Any outstanding penalties?",
            required: true,
            options: [
              "None that I know of",
              "Yes, we\u2019re dealing with some",
              "Possibly \u2014 we haven\u2019t checked",
              "Not sure",
            ],
          },
          { type: "textarea", id: "concerns", label: "Anything you\u2019re worried about?", placeholder: "Tax letters you\u2019ve been avoiding, audits, issues with FIRS \u2014 tell us now so we can protect you." },
        ],
      },
    ],
  },

  // ═══ SOFTWARE — 6 ═════════════════════════════════════════════════════
  website: {
    department: "software",
    name: "Website Design",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s build your <em>website</em>.",
      body: "Everything we need to design something that represents your brand and actually converts. If you\u2019re missing anything, we can help you create it.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "The business",
        subtitle: "Who you are and who you serve.",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          { type: "text", id: "tagline", label: "Tagline or one-liner", placeholder: "What you do, in one sentence." },
          { type: "textarea", id: "about", label: "About the business", required: true, placeholder: "What you do, who you serve, what makes you different." },
          { type: "textarea", id: "audience", label: "Who visits your website?", required: true, placeholder: "Describe your ideal customer. Age, role, pain points, what they\u2019re looking for." },
        ],
      },
      {
        title: "The site",
        subtitle: "What the site needs to do and look like.",
        fields: [
          {
            type: "select",
            id: "page_count",
            label: "How many pages?",
            required: true,
            options: [
              "Just a landing page (1)",
              "Essential pages (3\u20135)",
              "Full site (6\u201310)",
              "Large site (10+)",
            ],
          },
          { type: "textarea", id: "main_goal", label: "What should visitors do on the site?", required: true, placeholder: "Book a call, buy a product, fill a form, read content \u2014 be specific." },
          { type: "text", id: "domain", label: "Preferred domain name", placeholder: "yourbusiness.com \u2014 or tell us you need help choosing." },
          { type: "textarea", id: "inspiration", label: "Websites you love", placeholder: "Paste 2\u20133 links to sites you want yours to feel like. Doesn\u2019t need to be your industry." },
        ],
      },
      {
        title: "Brand assets",
        subtitle: "Upload what you have. If you\u2019re missing anything, we can create it.",
        fields: [
          { type: "file", id: "logo", label: "Logo (vector preferred \u2014 .svg, .ai, .eps)", accept: ".svg,.ai,.eps,image/*" },
          { type: "file", id: "brand_guide", label: "Brand guide (if you have one)", accept: ".pdf,image/*" },
          { type: "textarea", id: "colors", label: "Brand colors", placeholder: "List hex codes if you have them, or describe the feeling." },
          { type: "file", id: "photos", label: "Product or team photos", accept: "image/*", multiple: true },
        ],
      },
      {
        title: "Content",
        subtitle: "The words and information that will live on the site.",
        fields: [
          {
            type: "select",
            id: "content_status",
            label: "Do you have website copy written?",
            required: true,
            options: [
              "Yes, all written",
              "Some of it",
              "No \u2014 please write it for us (+\u20a650,000)",
              "Not sure where to start",
            ],
          },
          { type: "file", id: "content_file", label: "Content document (if you have one)", accept: ".pdf,.doc,.docx,.txt" },
          { type: "textarea", id: "services_offered", label: "Services or products to feature", placeholder: "List them \u2014 we\u2019ll structure them on the site." },
        ],
      },
    ],
  },

  crm: {
    department: "software",
    name: "CRM Setup",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>organise</em> your leads.",
      body: "We set up a CRM that actually fits how your business works \u2014 not a tool you\u2019ll stop using in a month.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "Your business",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          {
            type: "select",
            id: "team_size",
            label: "Team size",
            required: true,
            options: ["Just me", "2\u20135 people", "6\u201315 people", "16\u201350 people", "Over 50"],
          },
          {
            type: "select",
            id: "industry",
            label: "Industry",
            required: true,
            options: [
              "Retail / e-commerce",
              "Services / consulting",
              "Real estate",
              "Financial services",
              "Education",
              "Health",
              "Tech",
              "Other",
            ],
          },
        ],
      },
      {
        title: "How leads reach you",
        fields: [
          { type: "textarea", id: "lead_sources", label: "Where do leads currently come from?", required: true, placeholder: "WhatsApp, Instagram, website, referrals, walk-ins\u2026" },
          { type: "textarea", id: "sales_stages", label: "Walk us through your sales process", required: true, placeholder: "From \u201cnew lead\u201d to \u201cpaid customer\u201d \u2014 what are the stages?" },
          {
            type: "select",
            id: "volume",
            label: "How many new leads per month?",
            required: true,
            options: ["Under 10", "10\u201350", "50\u2013200", "200\u20131000", "Over 1000"],
          },
        ],
      },
      {
        title: "Tools & data",
        fields: [
          { type: "textarea", id: "current_tools", label: "What tools / sheets do you currently use?", placeholder: "Google Sheets, WhatsApp groups, notebooks \u2014 honest answer." },
          { type: "file", id: "existing_data", label: "Existing lead data (if any)", accept: ".csv,.xlsx,.xls,.pdf", multiple: true, hint: "Spreadsheets, exports \u2014 we\u2019ll migrate them." },
          { type: "textarea", id: "integrations", label: "Systems we should integrate with", placeholder: "Email, payment gateway, website forms, WhatsApp?" },
        ],
      },
      {
        title: "Team & access",
        fields: [
          { type: "textarea", id: "team_list", label: "Who on your team needs access?", placeholder: "Name + role + email, one per line." },
          { type: "text", id: "main_contact", label: "Main point of contact", required: true },
          { type: "email", id: "contact_email", label: "Their email", required: true },
        ],
      },
    ],
  },

  ai_integration: {
    department: "software",
    name: "AI Integration",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s put <em>AI</em> to work.",
      body: "Before we build anything, we need to understand your business and where AI can actually save you time or money.",
      duration: "10\u201312 minutes",
    },
    steps: [
      {
        title: "Your business",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          { type: "textarea", id: "what_you_do", label: "What does your business do?", required: true },
          {
            type: "select",
            id: "team_size",
            label: "Team size",
            required: true,
            options: ["Just me", "2\u20135", "6\u201315", "16\u201350", "Over 50"],
          },
        ],
      },
      {
        title: "Priority use case",
        subtitle: "The one thing you want AI to help with first.",
        fields: [
          { type: "textarea", id: "use_case", label: "Describe the specific task or problem", required: true, placeholder: "E.g. \u201creply to the 200+ WhatsApp inquiries we get daily\u201d or \u201cscore which leads to follow up first\u201d." },
          {
            type: "select",
            id: "current_cost",
            label: "How is this done today?",
            options: [
              "By me personally",
              "A staff member",
              "An outsourced agent",
              "It\u2019s not done \u2014 things fall through",
              "Mix",
            ],
          },
          { type: "textarea", id: "pain", label: "What does it cost you today?", placeholder: "Time, money, lost sales, stress \u2014 quantify if you can." },
        ],
      },
      {
        title: "Data & systems",
        fields: [
          { type: "textarea", id: "data_sources", label: "Where does the relevant data live?", placeholder: "WhatsApp, a CRM, spreadsheets, website database\u2026" },
          {
            type: "select",
            id: "data_privacy",
            label: "Privacy requirements",
            required: true,
            options: [
              "Standard \u2014 no special constraints",
              "Contains customer personal data (NDPR applies)",
              "Contains financial / sensitive data",
              "Not sure \u2014 advise me",
            ],
          },
          { type: "file", id: "sample_data", label: "Sample data (optional)", accept: ".csv,.xlsx,.json,.pdf", multiple: true, hint: "Anonymise before uploading if it contains real customer info." },
        ],
      },
      {
        title: "Team readiness",
        fields: [
          {
            type: "select",
            id: "ai_experience",
            label: "Your team\u2019s current AI experience",
            options: [
              "We use AI daily",
              "We\u2019ve played with ChatGPT",
              "Curious but not used it",
              "Sceptical",
            ],
          },
          { type: "text", id: "champion", label: "Who on your team will own this?", placeholder: "Name + role. This person works with us throughout." },
        ],
      },
    ],
  },

  automation: {
    department: "software",
    name: "Workflow Automation",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s automate the <em>repetitive</em> stuff.",
      body: "Tell us the tasks your team keeps doing by hand. We\u2019ll tell you which ones can run themselves.",
      duration: "7\u20139 minutes",
    },
    steps: [
      {
        title: "The task",
        fields: [
          { type: "textarea", id: "task_name", label: "Describe the repetitive task", required: true, placeholder: "E.g. \u201cevery time someone pays, I manually send them an invoice, a thank-you message, and add them to a WhatsApp group\u201d." },
          {
            type: "select",
            id: "frequency",
            label: "How often does it happen?",
            required: true,
            options: ["Multiple times daily", "Daily", "A few times a week", "Weekly", "Monthly"],
          },
          {
            type: "select",
            id: "time_spent",
            label: "How long does it take each time?",
            required: true,
            options: ["Under 5 mins", "5\u201315 mins", "15\u201330 mins", "30\u201360 mins", "Over an hour"],
          },
        ],
      },
      {
        title: "Current steps",
        fields: [
          { type: "textarea", id: "steps", label: "Walk us through every step", required: true, placeholder: "Step 1: Check WhatsApp for payment receipt. Step 2: Copy name to spreadsheet. Step 3: Send invoice template..." },
          { type: "textarea", id: "tools_used", label: "Which tools are involved?", placeholder: "WhatsApp, Excel, Gmail, payment gateway, accounting software\u2026" },
        ],
      },
      {
        title: "Scope",
        fields: [
          {
            type: "select",
            id: "scope",
            label: "How many workflows do you want automated?",
            required: true,
            options: [
              "Just this one for now",
              "2\u20133 workflows",
              "5+ workflows",
              "I want an audit \u2014 tell me which ones to start with",
            ],
          },
          { type: "textarea", id: "other_tasks", label: "Other tasks you\u2019d also like automated", placeholder: "List them \u2014 we\u2019ll prioritise together." },
        ],
      },
    ],
  },

  ecommerce: {
    department: "software",
    name: "E-commerce Platform",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s build your <em>store</em>.",
      body: "A Nigerian-ready e-commerce site \u2014 Paystack, Flutterwave, delivery logic, inventory, the works.",
      duration: "10\u201312 minutes",
    },
    steps: [
      {
        title: "The business",
        fields: [
          { type: "text", id: "store_name", label: "Store name", required: true },
          { type: "textarea", id: "what_you_sell", label: "What do you sell?", required: true },
          {
            type: "select",
            id: "current_channel",
            label: "Where do you currently sell?",
            options: [
              "Instagram DMs",
              "WhatsApp",
              "Jumia / Konga",
              "Physical store",
              "Nowhere yet \u2014 fresh start",
              "Multiple of the above",
            ],
          },
        ],
      },
      {
        title: "Catalogue",
        fields: [
          {
            type: "select",
            id: "product_count",
            label: "How many products?",
            required: true,
            options: ["Under 10", "10\u201350", "50\u2013200", "200\u20131000", "Over 1000"],
          },
          { type: "file", id: "product_sheet", label: "Product info (spreadsheet)", accept: ".csv,.xlsx,.xls", hint: "Name, price, description, stock \u2014 one row per product." },
          { type: "file", id: "product_photos", label: "Product photos", accept: "image/*", multiple: true, hint: "High-res if possible. We\u2019ll optimise them." },
        ],
      },
      {
        title: "Operations",
        fields: [
          {
            type: "select",
            id: "payment",
            label: "Which payment method?",
            required: true,
            options: ["Paystack", "Flutterwave", "Both", "Not sure \u2014 advise me"],
          },
          { type: "textarea", id: "delivery_zones", label: "Delivery zones and fees", placeholder: "E.g. \u201cLagos mainland \u20a62,000, Lagos island \u20a63,500, rest of Nigeria \u20a65,000\u201d." },
          {
            type: "select",
            id: "delivery_partner",
            label: "Delivery handled by",
            options: [
              "I handle it myself",
              "A courier we already use",
              "Need you to recommend one",
              "Not applicable (digital products)",
            ],
          },
        ],
      },
      {
        title: "Brand & domain",
        fields: [
          { type: "text", id: "domain", label: "Preferred domain", placeholder: "yourstore.com \u2014 or tell us you need help choosing." },
          { type: "file", id: "logo", label: "Logo", accept: ".svg,.ai,.eps,image/*" },
          { type: "file", id: "brand_guide", label: "Brand guide (if any)", accept: ".pdf,image/*" },
        ],
      },
    ],
  },

  software_mgmt: {
    department: "software",
    name: "Software Management (monthly)",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>maintain</em> your systems.",
      body: "Ongoing care for your digital tools \u2014 updates, security, performance, and a monthly report.",
      duration: "6\u20138 minutes",
    },
    steps: [
      {
        title: "What we\u2019re managing",
        fields: [
          { type: "textarea", id: "systems_list", label: "List the systems", required: true, placeholder: "Website (example.com), CRM (Zoho), Analytics, WhatsApp Business, payment gateway\u2026" },
          {
            type: "select",
            id: "priority",
            label: "What matters most?",
            required: true,
            options: [
              "Zero downtime",
              "Regular updates & new features",
              "Security & data protection",
              "Performance & speed",
              "All of the above",
            ],
          },
        ],
      },
      {
        title: "Access",
        fields: [
          {
            type: "select",
            id: "access_method",
            label: "How will we access systems?",
            required: true,
            options: [
              "You give us admin accounts",
              "We use your account with 2FA sharing",
              "Read-only access where possible",
              "Mix \u2014 let\u2019s discuss per system",
            ],
          },
          { type: "textarea", id: "known_issues", label: "Known issues we should address first", placeholder: "Things that are broken, slow, or bothering you." },
        ],
      },
      {
        title: "Team contact",
        fields: [
          { type: "text", id: "contact_name", label: "Point of contact", required: true },
          { type: "email", id: "contact_email", label: "Email", required: true },
          { type: "tel", id: "contact_phone", label: "Phone / WhatsApp", required: true },
          {
            type: "select",
            id: "report_cadence",
            label: "Preferred report cadence",
            required: true,
            options: ["Monthly is fine", "Bi-weekly", "Weekly summary + monthly deep-dive"],
          },
        ],
      },
    ],
  },

  // ═══ MEDIA — 6 ════════════════════════════════════════════════════════
  brand: {
    department: "media",
    name: "Brand Identity",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s shape your <em>brand</em>.",
      body: "A brand identity is how your business looks, sounds, and feels. Answer these thoughtfully \u2014 what you share here shapes everything we design.",
      duration: "10\u201312 minutes",
    },
    steps: [
      {
        title: "The business",
        subtitle: "The foundation.",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          { type: "textarea", id: "mission", label: "What does your business exist to do?", required: true, placeholder: "One or two honest sentences. Not marketing language \u2014 the real reason." },
          { type: "textarea", id: "audience", label: "Who is it for?", required: true, placeholder: "Be specific. \u201cEveryone\u201d is never the answer." },
        ],
      },
      {
        title: "Personality",
        subtitle: "How your brand should feel when someone encounters it.",
        fields: [
          { type: "textarea", id: "personality", label: "If your brand were a person, how would you describe them?", required: true, placeholder: "Calm? Bold? Witty? Reassuring? Playful? Serious? Mix of these?" },
          { type: "textarea", id: "not_personality", label: "What should your brand NEVER feel like?", placeholder: "Cheap? Corporate? Aggressive? Generic? Name the opposite." },
          { type: "textarea", id: "competitors", label: "Three competitors or reference brands", placeholder: "Paste links or names. Tell us what you like (or don\u2019t) about each." },
        ],
      },
      {
        title: "Existing assets",
        subtitle: "Anything you have already \u2014 we work with it or evolve from it.",
        fields: [
          { type: "file", id: "current_logo", label: "Current logo (if any)", accept: "image/*,.svg,.ai,.eps,.pdf" },
          { type: "file", id: "current_materials", label: "Other existing materials", accept: "image/*,.pdf", multiple: true, hint: "Business cards, flyers, social posts \u2014 anything that shows your current look." },
          { type: "textarea", id: "color_preferences", label: "Color preferences", placeholder: "Colors you love, hate, or must include (maybe a cultural or personal reason)." },
        ],
      },
      {
        title: "Vision",
        subtitle: "Where this brand is going.",
        fields: [
          { type: "textarea", id: "long_vision", label: "Where do you see this business in 5 years?", placeholder: "A brand needs to grow into its future, not just fit its present." },
          {
            type: "select",
            id: "budget_range",
            label: "Is this the final identity or a starting point?",
            options: [
              "Final \u2014 this needs to last years",
              "Starting point \u2014 we\u2019ll evolve it",
              "Not sure yet",
            ],
          },
        ],
      },
    ],
  },

  social: {
    department: "media",
    name: "Instagram & TikTok Management",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s take over your <em>socials</em>.",
      body: "A few details on your business, accounts, and audience so we start posting with your voice \u2014 not a generic agency one.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "Your accounts",
        subtitle: "So we can access and take over posting.",
        fields: [
          { type: "text", id: "ig_handle", label: "Instagram handle", required: true, placeholder: "@yourbusiness" },
          { type: "text", id: "tiktok_handle", label: "TikTok handle" },
          {
            type: "select",
            id: "access_method",
            label: "How should we access accounts?",
            required: true,
            options: [
              "Meta Business Suite (recommended)",
              "Shared login",
              "Not sure \u2014 advise us",
            ],
          },
          { type: "textarea", id: "current_status", label: "Current state of your accounts", placeholder: "Active? Dormant? Embarrassing? Honest answers help." },
        ],
      },
      {
        title: "Your business",
        subtitle: "Product / service knowledge transfer.",
        fields: [
          { type: "textarea", id: "offer", label: "What do you sell / offer?", required: true, placeholder: "Products, services, price points." },
          { type: "textarea", id: "audience", label: "Who are you trying to reach?", required: true, placeholder: "Be specific. Age, gender, location, interests, pain points." },
          { type: "textarea", id: "tone", label: "Your brand voice", placeholder: "Casual? Professional? Witty? Educational? Mix \u2014 but which mix?" },
        ],
      },
      {
        title: "Content assets",
        subtitle: "Photos, videos, and brand materials we can use.",
        fields: [
          { type: "file", id: "brand_guide", label: "Brand guide (if any)", accept: ".pdf,image/*" },
          { type: "file", id: "photos", label: "Product / team photos", accept: "image/*", multiple: true },
          { type: "file", id: "videos", label: "Existing video clips", accept: "video/*", multiple: true, hint: "Raw clips are fine \u2014 we edit." },
          { type: "textarea", id: "content_pillars", label: "Content topics you\u2019d like us to cover", placeholder: "E.g. educational, behind-the-scenes, product demos, testimonials." },
        ],
      },
      {
        title: "Goals",
        subtitle: "What success looks like.",
        fields: [
          { type: "textarea", id: "goal", label: "What\u2019s the main thing you want from social?", required: true, placeholder: "Leads? Followers? Brand awareness? Sales? Authority? Community?" },
          { type: "textarea", id: "competitors", label: "Competitor accounts we should study", placeholder: "Paste 2\u20133 handles of businesses doing this well." },
        ],
      },
    ],
  },

  podcast: {
    department: "media",
    name: "Podcast Production",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s launch your <em>podcast</em>.",
      body: "From concept to distribution. You show up to record; we handle everything else.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "The show",
        fields: [
          { type: "text", id: "show_name", label: "Show name (working title is fine)", required: true },
          { type: "textarea", id: "topic", label: "What\u2019s it about?", required: true, placeholder: "One or two sentences \u2014 the pitch." },
          { type: "textarea", id: "audience", label: "Who\u2019s it for?", required: true, placeholder: "Be specific about who you want to tune in." },
        ],
      },
      {
        title: "Format",
        fields: [
          {
            type: "select",
            id: "format",
            label: "Format",
            required: true,
            options: [
              "Solo (you talking)",
              "Co-hosted",
              "Interview-based",
              "Panel discussions",
              "Mixed",
            ],
          },
          {
            type: "select",
            id: "media_type",
            label: "Video or audio?",
            required: true,
            options: [
              "Audio only",
              "Video + audio (we distribute both)",
              "Not sure \u2014 advise me",
            ],
          },
          {
            type: "select",
            id: "episode_length",
            label: "Episode length",
            required: true,
            options: ["15\u201330 mins", "30\u201360 mins", "60+ mins", "Varies"],
          },
          {
            type: "select",
            id: "cadence",
            label: "Publishing cadence",
            required: true,
            options: [
              "Weekly",
              "Bi-weekly",
              "Monthly",
              "Season-based (batch release)",
            ],
          },
        ],
      },
      {
        title: "Production",
        fields: [
          { type: "text", id: "host_name", label: "Main host name", required: true },
          {
            type: "select",
            id: "recording_location",
            label: "Where will you record?",
            options: [
              "Our studio",
              "My office",
              "Home setup",
              "Remote (each person from their own location)",
              "Need recommendation",
            ],
          },
          { type: "textarea", id: "guests", label: "Initial guest wishlist", placeholder: "First 5\u201310 guests you\u2019d love to have on." },
        ],
      },
      {
        title: "Brand assets",
        fields: [
          { type: "file", id: "artwork", label: "Existing show artwork (if any)", accept: "image/*,.svg,.ai" },
          { type: "textarea", id: "vibe", label: "Describe the visual vibe", placeholder: "Minimal and serious? Bold and colourful? Cinematic?" },
        ],
      },
    ],
  },

  content_strategy: {
    department: "media",
    name: "Content Strategy",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s build your <em>content plan</em>.",
      body: "A 90-day content strategy custom to your business, audience, and goals \u2014 not template garbage.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "The business",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          { type: "textarea", id: "offer", label: "What do you sell / offer?", required: true },
          { type: "textarea", id: "audience", label: "Who is your content for?", required: true, placeholder: "Be specific. Age, role, pain points, where they hang out." },
        ],
      },
      {
        title: "Current state",
        fields: [
          { type: "textarea", id: "channels", label: "Which platforms are you on?", required: true, placeholder: "IG, TikTok, LinkedIn, YouTube, newsletter, blog \u2014 and how often you post on each." },
          {
            type: "select",
            id: "performance",
            label: "How\u2019s it performing?",
            required: true,
            options: [
              "Going well",
              "Mixed \u2014 some posts hit, most don\u2019t",
              "Inconsistent",
              "Flatlined",
              "Haven\u2019t really started",
            ],
          },
          { type: "file", id: "analytics", label: "Analytics exports (optional)", accept: ".pdf,.csv,.xlsx,image/*", multiple: true, hint: "Instagram Insights, YouTube analytics, anything." },
        ],
      },
      {
        title: "Goals",
        fields: [
          {
            type: "select",
            id: "primary_goal",
            label: "Main goal over the next 90 days",
            required: true,
            options: [
              "Leads / sales",
              "Follower growth",
              "Brand awareness",
              "Authority / thought leadership",
              "Community building",
            ],
          },
          { type: "textarea", id: "success_metric", label: "What\u2019s your success number?", placeholder: "E.g. \u201cget to 50 leads/month from content\u201d or \u201chit 20k IG followers\u201d." },
        ],
      },
      {
        title: "Assets",
        fields: [
          { type: "file", id: "brand_guide", label: "Brand guide (if any)", accept: ".pdf,image/*" },
          { type: "textarea", id: "competitors", label: "Competitors doing content well", placeholder: "Links or handles \u2014 what do you like about their approach?" },
        ],
      },
    ],
  },

  video: {
    department: "media",
    name: "Video Production",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>shoot</em> it.",
      body: "Concept, pre-production, shoot, edit, delivery. Tell us what you\u2019re making.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "The project",
        fields: [
          {
            type: "select",
            id: "video_type",
            label: "Type of video",
            required: true,
            options: [
              "Brand film / about us",
              "Product launch / promo",
              "Ad campaign",
              "Testimonial",
              "Event coverage",
              "Explainer / tutorial",
              "Music video",
              "Other",
            ],
          },
          { type: "textarea", id: "goal", label: "Main goal", required: true, placeholder: "What should this video do for your business?" },
          {
            type: "select",
            id: "length",
            label: "Target length",
            required: true,
            options: [
              "Under 30 seconds",
              "30s \u2013 1 min",
              "1\u20133 mins",
              "3\u20135 mins",
              "5+ mins",
            ],
          },
        ],
      },
      {
        title: "Production",
        fields: [
          { type: "text", id: "shoot_location", label: "Proposed shoot location", placeholder: "Address or city. \u201cYou choose\u201d is fine." },
          { type: "textarea", id: "talent", label: "Who\u2019s on camera?", placeholder: "Founder? Staff? Models? Customers? Need us to cast?" },
          {
            type: "select",
            id: "script_status",
            label: "Script / concept",
            required: true,
            options: [
              "I have a full script",
              "I have a rough idea",
              "Please help me develop it from scratch",
            ],
          },
        ],
      },
      {
        title: "Deliverables",
        fields: [
          {
            type: "select",
            id: "deadline",
            label: "When do you need it?",
            required: true,
            options: [
              "Within 1 week (rush)",
              "2 weeks",
              "3\u20134 weeks",
              "1\u20132 months",
              "Flexible",
            ],
          },
          { type: "textarea", id: "aspect_ratios", label: "Which aspect ratios / formats?", placeholder: "Vertical (9:16), square (1:1), landscape (16:9)? For which platforms?" },
        ],
      },
      {
        title: "Brand & references",
        fields: [
          { type: "file", id: "logo", label: "Logo", accept: ".svg,.ai,.eps,image/*" },
          { type: "textarea", id: "references", label: "Reference videos", placeholder: "Paste 2\u20133 YouTube / Instagram links of videos whose style you like." },
        ],
      },
    ],
  },

  media_mgmt: {
    department: "media",
    name: "Media Management (monthly)",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s take over your <em>media</em>.",
      body: "Your brand, voice, and content across every channel \u2014 handled. You focus on the business.",
      duration: "10\u201312 minutes",
    },
    steps: [
      {
        title: "Channels",
        fields: [
          { type: "textarea", id: "channels_list", label: "List all your channels", required: true, placeholder: "Instagram @x, TikTok @y, LinkedIn, YouTube, newsletter, WhatsApp status \u2014 everything." },
          {
            type: "select",
            id: "access_method",
            label: "Access method",
            required: true,
            options: [
              "Meta Business Suite",
              "Shared logins",
              "Mix \u2014 discuss per channel",
            ],
          },
        ],
      },
      {
        title: "Your business",
        fields: [
          { type: "text", id: "business_name", label: "Business name", required: true },
          { type: "textarea", id: "offer", label: "What you sell / offer", required: true },
          { type: "textarea", id: "audience", label: "Who you\u2019re trying to reach", required: true },
          { type: "textarea", id: "voice", label: "Your brand voice", placeholder: "Casual? Authoritative? Playful? Mix \u2014 which mix?" },
        ],
      },
      {
        title: "Content assets",
        fields: [
          { type: "file", id: "brand_guide", label: "Brand guide", accept: ".pdf,image/*" },
          { type: "file", id: "photos_videos", label: "Existing photos and videos", accept: "image/*,video/*", multiple: true, hint: "Raw assets we can work with." },
          { type: "textarea", id: "pillars", label: "Content pillars you want to cover", placeholder: "E.g. educational, BTS, product demos, testimonials, personal stories." },
        ],
      },
      {
        title: "Goals & cadence",
        fields: [
          {
            type: "select",
            id: "primary_goal",
            label: "Main goal",
            required: true,
            options: [
              "Leads / sales",
              "Follower growth",
              "Authority / credibility",
              "Community",
              "Mix",
            ],
          },
          { type: "textarea", id: "posting_preferences", label: "Posting frequency preferences", placeholder: "E.g. \u201cIG \u2014 4x/week feed + daily stories, TikTok \u2014 3x/week, Newsletter \u2014 monthly\u201d." },
        ],
      },
    ],
  },

  // ═══ SKILLS — 6 ═══════════════════════════════════════════════════════
  tech_training: {
    department: "skills",
    name: "Tech Skills Training",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>skill up</em>.",
      body: "A focused training programme tailored to you or your team. Not a YouTube playlist \u2014 structured learning with accountability.",
      duration: "6\u20138 minutes",
    },
    steps: [
      {
        title: "The learner",
        fields: [
          {
            type: "select",
            id: "learner_type",
            label: "Who is this for?",
            required: true,
            options: [
              "Just me",
              "A team member (one)",
              "A team (2\u20135)",
              "A team (6\u201315)",
              "A large group (15+)",
            ],
          },
          {
            type: "select",
            id: "current_level",
            label: "Current skill level",
            required: true,
            options: [
              "Absolute beginner",
              "Can use the basics",
              "Intermediate \u2014 want to go deeper",
              "Advanced \u2014 need specialist training",
            ],
          },
        ],
      },
      {
        title: "The skill",
        fields: [
          {
            type: "select",
            id: "skill_area",
            label: "Skill area",
            required: true,
            options: [
              "Web development",
              "Product / UX design",
              "Data analysis",
              "Digital marketing",
              "Cybersecurity",
              "Project management",
              "Other (specify below)",
            ],
          },
          { type: "textarea", id: "specific_skill", label: "Be specific about what you want to learn", required: true, placeholder: "E.g. \u201cReact + Tailwind to build production apps\u201d rather than just \u201ccoding\u201d." },
          { type: "textarea", id: "goal", label: "What will you do with this skill?", placeholder: "Land a job? Build a product? Support your business?" },
        ],
      },
      {
        title: "Format & schedule",
        fields: [
          {
            type: "select",
            id: "format",
            label: "Preferred format",
            required: true,
            options: [
              "In-person",
              "Online (live)",
              "Self-paced with mentorship",
              "Hybrid",
            ],
          },
          {
            type: "select",
            id: "pace",
            label: "Time available per week",
            required: true,
            options: [
              "Under 3 hours",
              "3\u20136 hours",
              "6\u201310 hours",
              "10+ hours",
              "Full-time intensive",
            ],
          },
          { type: "text", id: "target_date", label: "Target completion date (optional)", placeholder: "Any deadline we should work toward?" },
        ],
      },
    ],
  },

  ai_business: {
    department: "skills",
    name: "AI for Business",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s master <em>AI</em> for your work.",
      body: "Practical AI skills that make you and your team faster, not a theory course.",
      duration: "6\u20138 minutes",
    },
    steps: [
      {
        title: "About you",
        fields: [
          {
            type: "select",
            id: "role",
            label: "Your role",
            required: true,
            options: [
              "Founder / CEO",
              "Department lead",
              "Operator / individual contributor",
              "Sole trader",
              "Mixed",
            ],
          },
          { type: "text", id: "industry", label: "Industry", required: true },
          {
            type: "select",
            id: "experience",
            label: "Current AI experience",
            required: true,
            options: [
              "Zero",
              "Used ChatGPT a few times",
              "Use AI weekly",
              "Use AI daily but want structured training",
            ],
          },
        ],
      },
      {
        title: "What you want to use AI for",
        fields: [
          { type: "textarea", id: "priorities", label: "Top 3 things you want AI to help with", required: true, placeholder: "1. ...\n2. ...\n3. ..." },
          {
            type: "select",
            id: "tools_preference",
            label: "Any tool preference?",
            options: [
              "ChatGPT",
              "Claude",
              "Gemini",
              "All \u2014 want to understand tradeoffs",
              "No preference \u2014 recommend",
            ],
          },
        ],
      },
      {
        title: "Learning setup",
        fields: [
          {
            type: "select",
            id: "team_size",
            label: "Team size (if team training)",
            options: ["Just me", "2\u20135", "6\u201315", "16+"],
          },
          {
            type: "select",
            id: "format",
            label: "Preferred format",
            required: true,
            options: [
              "In-person workshop",
              "Online live sessions",
              "Self-paced + Q&A",
            ],
          },
          { type: "textarea", id: "success", label: "What does success look like?", placeholder: "E.g. \u201cI save 10 hours a week\u201d or \u201cmy team replies to customers 3x faster\u201d." },
        ],
      },
    ],
  },

  entrepreneurship: {
    department: "skills",
    name: "Entrepreneurship Program",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s build the <em>founder</em> in you.",
      body: "A structured programme for serious founders \u2014 real frameworks, real accountability, real peers.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "You",
        fields: [
          { type: "text", id: "full_name", label: "Full name", required: true },
          {
            type: "select",
            id: "stage",
            label: "Where are you?",
            required: true,
            options: [
              "Pre-idea \u2014 I want to start something",
              "Idea stage \u2014 not built yet",
              "Built and launched \u2014 pre-revenue",
              "Earning \u2014 want to grow",
              "Established \u2014 want to scale / exit",
            ],
          },
          { type: "text", id: "time_in_business", label: "How long have you been building?", placeholder: "E.g. \u201c2 months\u201d, \u201c3 years\u201d, \u201chaven\u2019t started yet\u201d" },
        ],
      },
      {
        title: "The business",
        fields: [
          { type: "text", id: "business_name", label: "Business name (if any)", placeholder: "Or leave blank if not yet named." },
          { type: "textarea", id: "what_you_do", label: "What are you building?", required: true, placeholder: "The pitch, in plain words." },
          { type: "textarea", id: "biggest_problem", label: "What\u2019s the biggest problem you\u2019re stuck on right now?", placeholder: "Be honest \u2014 this shapes what we focus on." },
        ],
      },
      {
        title: "Commitment",
        fields: [
          {
            type: "select",
            id: "time_available",
            label: "How many hours/week can you commit?",
            required: true,
            options: [
              "3\u20135 hours",
              "6\u201310 hours",
              "10+ hours",
              "Full-time \u2014 this is my main focus",
            ],
          },
          { type: "textarea", id: "goal_12mo", label: "12-month goal", placeholder: "Concrete \u2014 revenue target? Product launch? First hire?" },
        ],
      },
      {
        title: "Background (optional)",
        fields: [
          { type: "file", id: "cv", label: "CV / LinkedIn export", accept: ".pdf,.doc,.docx" },
          { type: "file", id: "pitch_deck", label: "Pitch deck (if you have one)", accept: ".pdf,.ppt,.pptx" },
        ],
      },
    ],
  },

  team_training: {
    department: "skills",
    name: "Team Training Workshop",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s <em>upskill</em> your team.",
      body: "A focused workshop for your team on whatever capability is missing. We design it to your brief.",
      duration: "7\u20139 minutes",
    },
    steps: [
      {
        title: "The team",
        fields: [
          {
            type: "select",
            id: "team_size",
            label: "How many attendees?",
            required: true,
            options: ["Under 10", "10\u201325", "25\u201350", "50\u2013100", "Over 100"],
          },
          { type: "textarea", id: "roles", label: "What roles are they in?", required: true, placeholder: "E.g. \u201c5 sales reps, 2 managers, 3 customer support\u201d" },
          {
            type: "select",
            id: "experience_level",
            label: "Experience level mix",
            required: true,
            options: [
              "Mostly junior",
              "Mostly mid-level",
              "Mostly senior",
              "Mixed",
            ],
          },
        ],
      },
      {
        title: "The topic",
        fields: [
          { type: "textarea", id: "topic", label: "Topic / theme of the workshop", required: true, placeholder: "E.g. \u201cClosing B2B sales calls\u201d, \u201cCustomer service for luxury clients\u201d, \u201cExcel for finance teams\u201d." },
          { type: "textarea", id: "outcomes", label: "What should they walk away able to do?", required: true, placeholder: "3 specific, measurable outcomes." },
        ],
      },
      {
        title: "Logistics",
        fields: [
          {
            type: "select",
            id: "format",
            label: "Format",
            required: true,
            options: [
              "In-person at our venue",
              "In-person at your venue",
              "Online live",
              "Hybrid",
            ],
          },
          {
            type: "select",
            id: "duration",
            label: "Duration",
            required: true,
            options: ["Half day (3\u20134 hours)", "Full day", "2 days", "3+ days"],
          },
          { type: "text", id: "preferred_dates", label: "Preferred dates / window" },
          { type: "text", id: "venue", label: "Venue (if known)" },
        ],
      },
      {
        title: "Support needs",
        fields: [
          { type: "textarea", id: "support", label: "Anything we need to provide or arrange?", placeholder: "Materials, meals, laptops, certificates, specific facilitator profile\u2026" },
        ],
      },
    ],
  },

  certification: {
    department: "skills",
    name: "Certification Programs",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s get you <em>certified</em>.",
      body: "Structured prep for recognised industry certifications \u2014 study path, mock exams, guidance.",
      duration: "6\u20138 minutes",
    },
    steps: [
      {
        title: "The certification",
        fields: [
          { type: "text", id: "cert_name", label: "Certification name", required: true, placeholder: "E.g. PMP, AWS Solutions Architect, CFA Level 1, Google PM Cert\u2026" },
          {
            type: "select",
            id: "body",
            label: "Awarding body",
            options: [
              "PMI",
              "AWS",
              "Google",
              "Microsoft",
              "Cisco",
              "CFA Institute",
              "ACCA",
              "Other (specify above)",
            ],
          },
          { type: "text", id: "target_exam_date", label: "Target exam date", placeholder: "Your deadline \u2014 even rough is fine." },
        ],
      },
      {
        title: "Your background",
        fields: [
          {
            type: "select",
            id: "prep_level",
            label: "How prepared do you feel?",
            required: true,
            options: [
              "Starting from zero",
              "Some prior exposure",
              "Mid-way \u2014 need structured push",
              "Close to exam-ready \u2014 need mock practice",
            ],
          },
          { type: "textarea", id: "experience", label: "Relevant work experience", placeholder: "Years in the field, relevant roles, related certifications." },
          { type: "file", id: "prior_certs", label: "Prior certificates (if any)", accept: ".pdf,image/*", multiple: true },
        ],
      },
      {
        title: "Study plan",
        fields: [
          {
            type: "select",
            id: "study_hours",
            label: "Hours/week you can commit",
            required: true,
            options: ["Under 5", "5\u201310", "10\u201320", "20+"],
          },
          {
            type: "select",
            id: "format",
            label: "Preferred format",
            required: true,
            options: [
              "1-on-1 coaching",
              "Group cohort",
              "Self-paced with check-ins",
            ],
          },
        ],
      },
    ],
  },

  skills_mgmt: {
    department: "skills",
    name: "Skills Management (monthly)",
    intro: {
      eyebrow: "Service requirements",
      title: "Let\u2019s build a <em>learning team</em>.",
      body: "Ongoing skill development for your whole team \u2014 skill audits, learning paths, progress tracking.",
      duration: "8\u201310 minutes",
    },
    steps: [
      {
        title: "The team",
        fields: [
          {
            type: "select",
            id: "team_size",
            label: "Team size",
            required: true,
            options: ["Under 10", "10\u201325", "25\u201350", "50\u2013100", "Over 100"],
          },
          { type: "textarea", id: "departments", label: "Departments / functions", required: true, placeholder: "E.g. Sales (4), Engineering (6), Design (2), Ops (3)\u2026" },
          { type: "file", id: "team_roster", label: "Team roster (spreadsheet)", accept: ".csv,.xlsx,.xls", hint: "Name, role, department. We use this to build individual plans." },
        ],
      },
      {
        title: "Current baseline",
        fields: [
          {
            type: "select",
            id: "audit_status",
            label: "Have you done a skills audit recently?",
            required: true,
            options: [
              "Yes \u2014 within the past 6 months",
              "Yes \u2014 over a year ago",
              "No \u2014 we need one",
              "Not sure what that is",
            ],
          },
          { type: "textarea", id: "known_gaps", label: "Known skill gaps", placeholder: "What your team can\u2019t currently do that they need to." },
        ],
      },
      {
        title: "Growth plan",
        fields: [
          { type: "textarea", id: "priority_skills", label: "Priority skills for the next 12 months", required: true, placeholder: "Ranked list \u2014 what matters most." },
          {
            type: "select",
            id: "budget",
            label: "Annual learning & development budget",
            options: [
              "Under \u20a6500k",
              "\u20a6500k \u2013 \u20a62M",
              "\u20a62M \u2013 \u20a65M",
              "Over \u20a65M",
              "Haven\u2019t set one \u2014 advise us",
            ],
          },
          { type: "text", id: "owner", label: "Who owns L&D on your team?", placeholder: "Name + role. If no one yet, write \u201cnobody yet\u201d." },
        ],
      },
    ],
  },
};
