import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  MessageCircle, X, Phone, HelpCircle, Send, ChevronLeft,
  Building2, CreditCard, Rocket, ShieldCheck, Clock, Users, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  BIZDOC_SPECIALIZED,
  type SpecializedBusiness,
  type ChecklistItem,
} from "@/lib/bizdoc-specialized-checklists";
import {
  TOOLTIP_FOREIGNER,
  TOOLTIP_ENTITY,
  TOOLTIP_SHARE_CAPITAL,
  SHARE_CAPITAL_OPTIONS,
  effectiveShareCapitalFloor,
  calculateBizdocPrice,
  formatNaira,
  type EntityType,
  type PriceQuote,
} from "@/lib/bizdoc-prepayment";
import { postToAppsScript } from "@/lib/apps-script";

/* ══════════════════════════════════════════════════════════════════════════
   HAMZURY Chat — v12: TRUE WhatsApp-style chat interface
   --------------------------------------------------------------------------
   This file replaces the v11 button-driven Command Centre with a real chat
   thread that mimics WhatsApp's UI: dark-green header, scrollable message
   bubbles (gray bot left / green visitor right), typing-dot indicator,
   inline quick-reply pills under bot bubbles, and a free-text input bar
   with a paper-airplane Send button.

   Founder corrections respected (2026-04):
     1. NO external WhatsApp deep-link deflections. The chat IS the channel
        — visitors stay. `tel:` phone-call links remain (different intent).
     2. Visual mimicry of WhatsApp: header (#075E54), bot avatar + "online"
        status, gray vs green bubbles (#DCF8C6), typing dots, send icon,
        full-screen on mobile / 380×600 anchored bottom-right on desktop.
     3. FAQ never buried — surfaced as a top-level quick-reply on the
        welcome message AND as a header shortcut icon (HelpCircle).
     4. v13: 3-button floating action menu (WhatsApp / Call / FAQ) replaces
        the single bubble. FAQ opens its own standalone panel, not via the
        chat thread.

   Preserved from v11 (all configuration, no behaviour change):
     - detectCompany() hostname routing → Hamzury / Bizdoc / Scalar / Medialy
     - Per-company service catalog filter (Hamzury 24, divisions 6 each)
     - Cross-sell flow when visitor picks an out-of-scope service on a
       division site (sister-company hand-off)
     - Diagnostic launcher → /clarity-session or /diagnose-<dept> (new tab)
     - Single CSO line for all tel: links (2349130700056)
     - FAQ content (7 categories, ~35 Q&A pairs)
   ══════════════════════════════════════════════════════════════════════════ */

type Department = "general" | "bizdoc" | "systemise" | "skills";
type CompanyKey = "hamzury" | "bizdoc" | "scalar" | "medialy";

type Props = {
  department?: Department;
  open?: boolean;
  onClose?: () => void;
  isDashboard?: boolean;
};

/* ── Brand constants (UI palette) ──────────────────────────────────────── */
const CHARCOAL = "#2D2D2D";
const GOLD     = "#B48C4C";
const DARK     = "#1A1A1A";

/* ── WhatsApp-style palette ────────────────────────────────────────────── */
const WA_HEADER   = "#075E54"; // dark green WhatsApp header
const WA_BUBBLE   = "#25D366"; // bright green floating-bubble + send icon
const WA_USER_BG  = "#DCF8C6"; // light green outgoing bubble
const WA_BOT_BG   = "#FFFFFF"; // white incoming bubble
const WA_BOT_BORDER = "#E5E7EB";
const WA_CHAT_BG  = "#ECE5DD"; // WhatsApp's classic beige chat backdrop
const WA_INPUT_BG = "#F0F2F5";

/* ── Contact (single CSO line — Brand Bible) ───────────────────────────── */
const CSO_PHONE = "2349130700056";

/* ══════════════════════════════════════════════════════════════════════════
   COMPANY CONFIGURATION (preserved verbatim from v11 Command Centre spec)
   ══════════════════════════════════════════════════════════════════════════ */
type Department2 = "business" | "software" | "media" | "skills";

type RequirementId =
  | "cac" | "tin" | "licences" | "plan" | "trademark" | "compliance"
  | "website" | "crm" | "ai_integration" | "automation" | "ecommerce" | "software_mgmt"
  | "brand" | "social" | "podcast" | "content_strategy" | "video" | "media_mgmt"
  | "tech_training" | "ai_business" | "entrepreneurship" | "team_training" | "certification" | "skills_mgmt";

type CompanyConfig = {
  name: string;
  tagline: string;
  greeting: string;
  accentColor: string;
  services: "all" | RequirementId[];
  crossSellOffer: boolean;
  sisterCompanies?: Partial<Record<Department2, CompanyKey>>;
  diagnosticRoute: string;
  diagnosticTitle: string;
  diagnosticBlurb: string;
};

const COMPANIES: Record<CompanyKey, CompanyConfig> = {
  hamzury: {
    name: "Hamzury",
    tagline: "Everything you need to grow",
    greeting: "Welcome to Hamzury.",
    accentColor: "#0A0A0A",
    services: "all",
    crossSellOffer: false,
    diagnosticRoute: "/clarity-session",
    diagnosticTitle: "Business Checkup",
    diagnosticBlurb:
      "14 short questions, ~12 minutes. We review your responses and reach out within 24 hours.",
  },
  bizdoc: {
    name: "Bizdoc",
    tagline: "Compliance & growth, sorted",
    greeting: "Welcome to Bizdoc.",
    accentColor: "#1B4D3E",
    services: ["cac", "tin", "licences", "plan", "trademark", "compliance"],
    crossSellOffer: true,
    sisterCompanies: { software: "scalar", media: "medialy", skills: "hamzury" },
    diagnosticRoute: "/diagnose-business",
    diagnosticTitle: "Business Checkup",
    diagnosticBlurb:
      "A short diagnosis to reveal what your business actually needs. ~10 minutes — we reply within 24 hours.",
  },
  scalar: {
    name: "Scalar",
    tagline: "Software that scales with you",
    greeting: "Welcome to Scalar.",
    accentColor: "#1F6B5C",
    services: ["website", "crm", "ai_integration", "automation", "ecommerce", "software_mgmt"],
    crossSellOffer: true,
    sisterCompanies: { business: "bizdoc", media: "medialy", skills: "hamzury" },
    diagnosticRoute: "/diagnose-software",
    diagnosticTitle: "Software Checkup",
    diagnosticBlurb:
      "A short diagnosis on your tools, leads, and bottlenecks. ~10 minutes — we reply within 24 hours.",
  },
  medialy: {
    name: "Medialy",
    tagline: "Content & presence",
    greeting: "Welcome to Medialy.",
    accentColor: "#B8731F",
    services: ["brand", "social", "podcast", "content_strategy", "video", "media_mgmt"],
    crossSellOffer: true,
    sisterCompanies: { business: "bizdoc", software: "scalar", skills: "hamzury" },
    diagnosticRoute: "/diagnose-media",
    diagnosticTitle: "Media Checkup",
    diagnosticBlurb:
      "A short diagnosis on your brand and presence. ~10 minutes — we reply within 24 hours.",
  },
};

/* Sister-site cross-sell URLs (placeholders until standalone domains exist). */
const CROSS_SELL_LINK: Record<CompanyKey, string> = {
  hamzury: "https://www.hamzury.com",
  bizdoc:  "https://www.hamzury.com/bizdoc",
  scalar:  "https://www.hamzury.com/scalar",
  medialy: "https://www.hamzury.com/medialy",
};

/* ── Hostname → company auto-detection ─────────────────────────────────── */
function detectCompany(): CompanyKey {
  if (typeof window === "undefined") return "hamzury";
  const host = window.location.hostname.toLowerCase();
  if (host.includes("bizdoc")) return "bizdoc";
  if (host.includes("scalar")) return "scalar";
  if (host.includes("medialy")) return "medialy";
  return "hamzury";
}

function deptToCompanyKey(dept: Department): CompanyKey {
  if (dept === "bizdoc") return "bizdoc";
  if (dept === "systemise") return "scalar";
  return "hamzury";
}

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE CATALOG (24 services across 4 divisions)
   ══════════════════════════════════════════════════════════════════════════ */
type Service = {
  id: RequirementId;
  name: string;
  blurb: string;
  department: Department2;
  diagnosticRoute: string;
};

const SERVICE_CATALOG: Service[] = [
  // Business (6) — Bizdoc
  { id: "cac", name: "CAC Registration", blurb: "Register your company with the Corporate Affairs Commission.", department: "business", diagnosticRoute: "/diagnose-business" },
  { id: "tin", name: "Tax Registration (TIN)", blurb: "File your Tax Identification Number with FIRS.", department: "business", diagnosticRoute: "/diagnose-business" },
  { id: "licences", name: "Business Licences", blurb: "Tell us which licence and we handle the regulator.", department: "business", diagnosticRoute: "/diagnose-business" },
  { id: "plan", name: "Business Plan", blurb: "A real plan that raises money or guides decisions.", department: "business", diagnosticRoute: "/diagnose-business" },
  { id: "trademark", name: "Trademark Registration", blurb: "We file with the Trademarks, Patents & Designs Registry.", department: "business", diagnosticRoute: "/diagnose-business" },
  { id: "compliance", name: "Compliance Management", blurb: "Annual compliance taken off your plate — filings, returns, deadlines.", department: "business", diagnosticRoute: "/diagnose-business" },

  // Software (6) — Scalar
  { id: "website", name: "Website Design", blurb: "A site that represents your brand and actually converts.", department: "software", diagnosticRoute: "/diagnose-software" },
  { id: "crm", name: "CRM Setup", blurb: "A CRM that fits how your business works — not one you'll abandon.", department: "software", diagnosticRoute: "/diagnose-software" },
  { id: "ai_integration", name: "AI Integration", blurb: "Where AI can save you time or money in your business.", department: "software", diagnosticRoute: "/diagnose-software" },
  { id: "automation", name: "Workflow Automation", blurb: "Manual tasks your team keeps doing — automated.", department: "software", diagnosticRoute: "/diagnose-software" },
  { id: "ecommerce", name: "E-commerce Platform", blurb: "Nigerian-ready: Paystack, Flutterwave, delivery, inventory.", department: "software", diagnosticRoute: "/diagnose-software" },
  { id: "software_mgmt", name: "Software Management", blurb: "Ongoing care for your digital tools — updates, security, monthly reports.", department: "software", diagnosticRoute: "/diagnose-software" },

  // Media (6) — Medialy
  { id: "brand", name: "Brand Identity", blurb: "How your business looks, sounds, and feels.", department: "media", diagnosticRoute: "/diagnose-media" },
  { id: "social", name: "Instagram & TikTok Management", blurb: "We post in your voice — not a generic agency one.", department: "media", diagnosticRoute: "/diagnose-media" },
  { id: "podcast", name: "Podcast Production", blurb: "Concept to distribution. Show up to record; we handle the rest.", department: "media", diagnosticRoute: "/diagnose-media" },
  { id: "content_strategy", name: "Content Strategy", blurb: "A 90-day content strategy custom to your business and audience.", department: "media", diagnosticRoute: "/diagnose-media" },
  { id: "video", name: "Video Production", blurb: "Concept, pre-production, shoot, edit, delivery.", department: "media", diagnosticRoute: "/diagnose-media" },
  { id: "media_mgmt", name: "Media Management", blurb: "Brand, voice, and content across every channel — handled.", department: "media", diagnosticRoute: "/diagnose-media" },

  // Skills (6) — HUB
  { id: "tech_training", name: "Tech Skills Training", blurb: "Structured learning with accountability — not a YouTube playlist.", department: "skills", diagnosticRoute: "/diagnose-skills" },
  { id: "ai_business", name: "AI for Business", blurb: "Practical AI skills for you and your team.", department: "skills", diagnosticRoute: "/diagnose-skills" },
  { id: "entrepreneurship", name: "Entrepreneurship Program", blurb: "A structured programme for serious founders.", department: "skills", diagnosticRoute: "/diagnose-skills" },
  { id: "team_training", name: "Team Training Workshop", blurb: "A focused workshop for your team — designed to your brief.", department: "skills", diagnosticRoute: "/diagnose-skills" },
  { id: "certification", name: "Certification Programs", blurb: "Structured prep for recognised industry certifications.", department: "skills", diagnosticRoute: "/diagnose-skills" },
  { id: "skills_mgmt", name: "Skills Management", blurb: "Ongoing skill development — audits, learning paths, progress tracking.", department: "skills", diagnosticRoute: "/diagnose-skills" },
];

const DEPT_LABEL: Record<Department2, string> = {
  business: "Business",
  software: "Software",
  media:    "Media",
  skills:   "Skills",
};

/* ══════════════════════════════════════════════════════════════════════════
   GROUPED MENU TREES (Phase 1 — structural restructure of v14 flat lists)
   --------------------------------------------------------------------------
   Each company exposes a hierarchical menu instead of a flat 6/24 list.
   Visitors drill down through groups to a leaf (service / diagnostic /
   callback / placeholder). The chat keeps a `menuPath` stack so "← Back"
   simply pops one level.

   Where a leaf maps to an existing requirement-forms.ts service id, we
   use that id directly so the post-payment intake form continues to fire.
   New leaves with no form yet use a `phase2_<slug>` id and carry a
   `// TODO Phase 2: build requirement form` marker for the next pass.
   ══════════════════════════════════════════════════════════════════════════ */

type MenuNode =
  | { kind: "group"; label: string; children: MenuNode[] }
  | {
      kind: "service";
      label: string;
      serviceId: string;
      subtitle?: string;
      flagship?: boolean;
    }
  | { kind: "diagnostic"; label: string; route: string }
  | { kind: "callback"; label: string }
  | { kind: "placeholder"; label: string }
  /* Phase 2: a leaf for one of the 25 Bizdoc Specialized Business Setup
   *  types. Renders the document checklist for that business inline. */
  | { kind: "specialized"; label: string; specializedId: string }
  /* Phase 3: standalone "CAC Business Registration" leaf in Bizdoc
   *  Group 1. Skips the document checklist and goes straight to the
   *  pre-payment questionnaire (foreigner → entity → share capital). */
  | { kind: "bizdoc_cac"; label: string };

/* ── BIZDOC tree ────────────────────────────────────────────────────────── */
const BIZDOC_TREE: MenuNode[] = [
  {
    kind: "group",
    label: "1. Registrations & Licences",
    children: [
      // Phase 3 (v16): the CAC leaf now routes straight to the pre-payment
      // questionnaire (foreigner → entity → share capital) instead of the
      // generic service-detail flow.
      { kind: "bizdoc_cac", label: "CAC Business Registration" },
      { kind: "service", label: "TIN — Tax Identification Number", serviceId: "tin" },
      { kind: "service", label: "Business Licences", serviceId: "licences" },
      // TODO Phase 2: build requirement form for SCUML Certificate
      { kind: "service", label: "SCUML Certificate", serviceId: "phase2_scuml" },
      // TODO Phase 2: build requirement form for NAFDAC Registration
      { kind: "service", label: "NAFDAC Registration", serviceId: "phase2_nafdac" },
      // TODO Phase 2: build requirement form for other industry licences
      { kind: "service", label: "Other industry licence", serviceId: "phase2_other_licence" },
    ],
  },
  {
    kind: "group",
    label: "2. Ongoing Management & Compliance",
    children: [
      {
        kind: "service",
        label: "Compliance Management — annual retainer ★",
        serviceId: "compliance",
        flagship: true,
      },
      // TODO Phase 2: build requirement form for monthly tax filings
      { kind: "service", label: "Tax Management — monthly filings", serviceId: "phase2_tax_management" },
      // TODO Phase 2: build requirement form for annual returns & filings
      { kind: "service", label: "Annual Returns & Filings", serviceId: "phase2_annual_returns" },
      // TODO Phase 2: build requirement form for ongoing regulatory support
      { kind: "service", label: "Ongoing Regulatory Support", serviceId: "phase2_regulatory_support" },
    ],
  },
  {
    kind: "group",
    label: "3. Legal Documents & Templates",
    children: [
      // TODO Phase 2: build requirement form for contract templates
      { kind: "service", label: "Contract templates (employment, partnership, NDA, etc.)", serviceId: "phase2_contract_templates" },
      { kind: "service", label: "Trademark Registration", serviceId: "trademark" },
      // TODO Phase 2: build requirement form for custom legal drafting
      { kind: "service", label: "Custom legal document drafting", serviceId: "phase2_legal_drafting" },
      // TODO Phase 2: build requirement form for document review
      { kind: "service", label: "Document review", serviceId: "phase2_document_review" },
    ],
  },
  {
    kind: "group",
    label: "4. Specialized Business Setup",
    /* Phase 2 (v15): 25 specialized-business leaves built from
     *  client/src/lib/bizdoc-specialized-checklists.ts. Each leaf, when
     *  tapped, renders the per-business checklist inline as a single
     *  bot bubble of tickable items. */
    children: BIZDOC_SPECIALIZED.map((b) => ({
      kind: "specialized",
      label: b.label,
      specializedId: b.id,
    })),
  },
  {
    kind: "diagnostic",
    label: "5. I'm not sure — give me a free Business Diagnostic",
    route: "/diagnose-business",
  },
  { kind: "callback", label: "Request a call" },
];

/* ── SCALAR tree ────────────────────────────────────────────────────────── */
const SCALAR_TREE: MenuNode[] = [
  {
    kind: "group",
    label: "1. Build something new",
    children: [
      { kind: "service", label: "Website Design", serviceId: "website" },
      // TODO Phase 2: build requirement form for web app / SaaS
      { kind: "service", label: "Web Application / SaaS", serviceId: "phase2_web_app" },
      // TODO Phase 2: build requirement form for mobile app
      { kind: "service", label: "Mobile App (iOS/Android)", serviceId: "phase2_mobile_app" },
      { kind: "service", label: "E-commerce Platform", serviceId: "ecommerce" },
      { kind: "service", label: "Custom CRM", serviceId: "crm" },
      // TODO Phase 2: build requirement form for internal business tools
      { kind: "service", label: "Internal Business Tools", serviceId: "phase2_internal_tools" },
    ],
  },
  {
    kind: "group",
    label: "2. Maintain existing systems",
    children: [
      {
        kind: "service",
        label: "Software Management retainer ★",
        serviceId: "software_mgmt",
        flagship: true,
      },
      // TODO Phase 2: build requirement form for bug fixes & improvements
      { kind: "service", label: "Bug fixes & improvements", serviceId: "phase2_bug_fixes" },
      // TODO Phase 2: build requirement form for performance optimization
      { kind: "service", label: "Performance optimization", serviceId: "phase2_perf_opt" },
      // TODO Phase 2: build requirement form for security audit & hardening
      { kind: "service", label: "Security audit & hardening", serviceId: "phase2_security_audit" },
      // TODO Phase 2: build requirement form for migration / upgrade
      { kind: "service", label: "Migration / upgrade", serviceId: "phase2_migration" },
    ],
  },
  {
    kind: "group",
    label: "3. Integrations & automations",
    children: [
      // TODO Phase 2: build requirement form for Make/Zapier automations
      { kind: "service", label: "Workflow Automation (Make / Zapier)", serviceId: "phase2_workflow_automation" },
      // TODO Phase 2: build requirement form for API integrations
      { kind: "service", label: "API integrations between systems", serviceId: "phase2_api_integrations" },
      // TODO Phase 2: build requirement form for payment integrations
      { kind: "service", label: "Payment integrations", serviceId: "phase2_payment_integrations" },
      // TODO Phase 2: build requirement form for WhatsApp Business API integration
      { kind: "service", label: "WhatsApp Business API integration", serviceId: "phase2_whatsapp_api" },
      // Reuse existing automation requirement form for "custom integrations" catch-all.
      { kind: "service", label: "Custom integrations", serviceId: "automation" },
    ],
  },
  {
    kind: "group",
    label: "4. AI & advanced systems",
    children: [
      // TODO Phase 2: build requirement form for AI chatbot
      { kind: "service", label: "AI chatbot / customer service", serviceId: "phase2_ai_chatbot" },
      // TODO Phase 2: build requirement form for AI content generation
      { kind: "service", label: "AI content generation system", serviceId: "phase2_ai_content_gen" },
      // TODO Phase 2: build requirement form for custom AI on customer data
      { kind: "service", label: "Custom AI for your data", serviceId: "phase2_custom_ai" },
      // Reuse existing ai_integration form for "AI integrated into existing systems".
      { kind: "service", label: "AI integrated into existing systems", serviceId: "ai_integration" },
      // TODO Phase 2: build requirement form for AI consultation & strategy
      { kind: "service", label: "AI consultation & strategy", serviceId: "phase2_ai_consult" },
    ],
  },
  {
    kind: "diagnostic",
    label: "5. I'm not sure — give me a free Software Audit",
    route: "/diagnose-software",
  },
  { kind: "callback", label: "Request a call" },
];

/* ── MEDIALY tree ───────────────────────────────────────────────────────── */
const MEDIALY_TREE: MenuNode[] = [
  {
    kind: "group",
    label: "1. Brand & Identity",
    children: [
      // TODO Phase 2: split logo-only requirement form out of "brand"
      { kind: "service", label: "Logo Design", serviceId: "phase2_logo_design" },
      { kind: "service", label: "Full Brand Identity package", serviceId: "brand" },
      // TODO Phase 2: build requirement form for rebrand projects
      { kind: "service", label: "Rebrand existing business", serviceId: "phase2_rebrand" },
      // TODO Phase 2: build requirement form for brand guidelines doc
      { kind: "service", label: "Brand guidelines document", serviceId: "phase2_brand_guidelines" },
    ],
  },
  {
    kind: "group",
    label: "2. Ongoing Content & Social Media",
    children: [
      {
        kind: "service",
        label: "Social Media Management retainer ★",
        serviceId: "media_mgmt",
        flagship: true,
      },
      // Reuse existing social form for IG+TikTok specifically.
      { kind: "service", label: "Instagram & TikTok Management", serviceId: "social" },
      // TODO Phase 2: build requirement form for LinkedIn founder content
      { kind: "service", label: "LinkedIn Content for Founders", serviceId: "phase2_linkedin_founder" },
      // TODO Phase 2: build requirement form for WhatsApp Business marketing
      { kind: "service", label: "WhatsApp Business Marketing", serviceId: "phase2_whatsapp_marketing" },
      // TODO Phase 2: build requirement form for multi-platform management
      { kind: "service", label: "Multi-platform Management", serviceId: "phase2_multi_platform" },
    ],
  },
  {
    kind: "group",
    label: "3. Production (Video, Podcast, Photo)",
    children: [
      { kind: "service", label: "Video Production (one-off shoot)", serviceId: "video" },
      { kind: "service", label: "Podcast Production", serviceId: "podcast" },
      // TODO Phase 2: build requirement form for photography sessions
      { kind: "service", label: "Photography Sessions", serviceId: "phase2_photography" },
      // TODO Phase 2: build requirement form for reels / short-form series
      { kind: "service", label: "Reels / Short-form Video Series", serviceId: "phase2_reels_series" },
      // TODO Phase 2: build requirement form for event coverage
      { kind: "service", label: "Event Coverage", serviceId: "phase2_event_coverage" },
    ],
  },
  {
    kind: "group",
    label: "4. Strategy & Audits",
    children: [
      { kind: "service", label: "Content Strategy & Calendar", serviceId: "content_strategy" },
      // TODO Phase 2: build requirement form for social audits
      { kind: "service", label: "Social Media Audit", serviceId: "phase2_social_audit" },
      // TODO Phase 2: build requirement form for brand positioning workshop
      { kind: "service", label: "Brand Positioning Workshop", serviceId: "phase2_brand_positioning" },
      // TODO Phase 2: build requirement form for influencer strategy
      { kind: "service", label: "Influencer Strategy", serviceId: "phase2_influencer_strategy" },
    ],
  },
  {
    kind: "diagnostic",
    label: "5. I'm not sure — give me a free Brand Diagnostic",
    route: "/diagnose-media",
  },
  { kind: "callback", label: "Request a call" },
];

/* ── HUB / Skills tree (flat — already clean from requirement-forms.ts) ─ */
const HUB_TREE: MenuNode[] = [
  { kind: "service", label: "Tech Skills Training", serviceId: "tech_training" },
  { kind: "service", label: "AI for Business", serviceId: "ai_business" },
  { kind: "service", label: "Entrepreneurship Program", serviceId: "entrepreneurship" },
  { kind: "service", label: "Team Training Workshop", serviceId: "team_training" },
  { kind: "service", label: "Certification Programs", serviceId: "certification" },
  { kind: "service", label: "Skills Management", serviceId: "skills_mgmt" },
];

/* ── HAMZURY tree (parent — reuses division trees instead of duplicating) ─ */
const HAMZURY_TREE: MenuNode[] = [
  { kind: "group", label: "Business · Compliance & Growth", children: BIZDOC_TREE },
  { kind: "group", label: "Software · Digital Systems", children: SCALAR_TREE },
  { kind: "group", label: "Media · Content & Presence", children: MEDIALY_TREE },
  { kind: "group", label: "Skills · Training & Development", children: HUB_TREE },
  {
    kind: "diagnostic",
    label: "Clarity Session · Full Business Checkup",
    route: "/clarity-session",
  },
  { kind: "callback", label: "Request a call" },
];

const COMPANY_TREE: Record<CompanyKey, MenuNode[]> = {
  hamzury: HAMZURY_TREE,
  bizdoc:  BIZDOC_TREE,
  scalar:  SCALAR_TREE,
  medialy: MEDIALY_TREE,
};

/* ══════════════════════════════════════════════════════════════════════════
   FAQ CONTENT (preserved from v11 — surfaced as quick-replies)
   ══════════════════════════════════════════════════════════════════════════ */
type FAQ = { q: string; a: string };
type FAQCategory = {
  id: string;
  title: string;
  summary: string;
  icon: React.ElementType;
  accent: string;
  items: FAQ[];
};

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "services",
    title: "Our Services",
    summary: "What each HAMZURY division does",
    icon: Building2,
    accent: "#1B4D3E",
    items: [
      { q: "What does Bizdoc handle?", a: "Bizdoc is our tax & compliance division. We register companies with CAC, file annual returns, obtain TIN/TCC, SCUML, industry licences, and manage ongoing FIRS filings. If it's legal paperwork for your business, Bizdoc handles it." },
      { q: "What does Scalar build?", a: "Scalar is our web + automation division. We build professional websites, client dashboards, CRMs, integrations, and AI agents. Simply: websites that work, systems that scale." },
      { q: "What does Medialy manage?", a: "Medialy is our social media division. We run Instagram, TikTok, Facebook, LinkedIn — content calendars, posting, growth, and ads. Social media that actually brings clients." },
      { q: "What does HUB teach?", a: "HUB is our tech-skills training wing. We teach Code Craft, Digital Literacy, AI for Founders, Basic Computer Skills (for kids and adults), and RIDI sponsored cohorts." },
      { q: "Do you work with businesses outside Nigeria?", a: "Yes. Bizdoc handles foreign business setup and Nigerian-registration for diaspora founders. Scalar and Medialy serve clients in any timezone. Reply here and the CSO team will tell you how we'd structure it." },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Packages",
    summary: "How each division's packages are priced",
    icon: CreditCard,
    accent: "#D4A017",
    items: [
      { q: "How much does Bizdoc charge?", a: "Four tiers: Starter ₦200,000 (CAC Ltd + EFCC + Tax ProMax), Growth ₦450,000 (+ Branding + Business Plan), Pro ₦570,000 (+ 1 yr Tax Management + Contracts), Enterprise ₦1,000,000 (+ ITF/NSITF/PENCOM/BPP). Individual services from ₦30,000." },
      { q: "How much does Scalar charge?", a: "Presence ₦300,000 (website), Growth ₦500,000 (website + lead capture), Automate ₦1,000,000 (website + CRM + automations — most popular), Platform ₦2,000,000 (custom dashboards + AI)." },
      { q: "How much does Medialy charge?", a: "Setup ₦50,000 (one-time profile setup), Manage ₦150,000/month, Accelerate ₦300,000/month (most popular — content + ads), Authority ₦500,000/month (full brand presence)." },
      { q: "How much does HUB charge?", a: "Single courses ₦25,000 – ₦100,000. Full certifications ₦200,000 – ₦400,000. Team training from ₦500,000. RIDI cohort is sponsored (free for selected applicants)." },
      { q: "Do you offer discounts?", a: "We don't discount below listed prices. If your budget is tight, we'll usually recommend a smaller package or a payment plan. Tell us your budget here and we'll show you the closest fit." },
      { q: "Can I pay in instalments?", a: "Yes, for packages ₦300,000 and up. Typical split: 50% to start, 50% before delivery. For ongoing services we bill at the start of each cycle. Reply here to set up a plan." },
    ],
  },
  {
    id: "start",
    title: "Getting Started",
    summary: "What happens after you reach out",
    icon: Rocket,
    accent: "#1D4ED8",
    items: [
      { q: "How do I actually start?", a: "Tell us what you need right here. The CSO Lead Handler picks it up within 2 hours, asks 3 short questions, and routes you to the right Closer for either a direct proposal or a short diagnosis form." },
      { q: "What information will you ask me for?", a: "First contact: your name, the service you need, your timeline, and a rough budget. That's it. Complex projects get a short form for the detail we need before quoting. We never ask for payment details in chat." },
      { q: "How fast do you respond?", a: "Lead Handler acknowledges within 2 hours. Closer contacts you within 24 hours. Strategy PDFs (for complex projects) are back within 24 hours of you completing the diagnosis form." },
      { q: "Do I need to prepare anything before we talk?", a: "Not really. A rough idea of what you want and when you want it live is enough. If you have a reference site, a logo, or documents (like CAC certificate), have them on hand — but we can start without them." },
      { q: "Can we meet in person?", a: "Yes — we're in Kano. Book a visit through the CSO team. Most clients don't need an in-person meeting; messages + one short call usually cover it." },
    ],
  },
  {
    id: "payment",
    title: "Payment & Invoices",
    summary: "How billing works",
    icon: ShieldCheck,
    accent: "#1E3A5F",
    items: [
      { q: "How do I pay?", a: "By bank transfer to our company account. The CSO team sends you an invoice with the exact account number and reference (format: HMZ-INV-XXX). Never send money to a personal account — every legitimate invoice uses the company account on the invoice document." },
      { q: "Do you accept card or crypto?", a: "Bank transfer is primary. For international clients we can accept USD wire or Wise transfer by arrangement. We don't accept crypto at the moment." },
      { q: "What's your refund policy?", a: "Work not started: full refund. Work started: pro-rated refund based on hours logged. Tell the Closer first — we usually fix issues rather than refund. Refunds are escalated to the founder for approval." },
      { q: "Can you send a receipt?", a: "Yes — once payment clears, the Coordinator sends an official receipt by email within the same day, plus a formal Tax Invoice if your business needs it for accounting." },
      { q: "What does my invoice reference mean?", a: "Every invoice is HMZ-INV-XXX (three digits, sequential). Every client tracking code is HMZ-YY/M-XXXX (year/month/phone-last-4). Quote this code in every message and it goes straight to the right file." },
    ],
  },
  {
    id: "compliance",
    title: "Tax & Compliance",
    summary: "Bizdoc-specific questions",
    icon: BookOpen,
    accent: "#1B4D3E",
    items: [
      { q: "Am I owing tax penalties?", a: "Possibly — any Nigerian business that's missed filing dates may have late-filing penalties. Bizdoc runs a free compliance check: send your company name and we'll come back within 24 hours with the full picture." },
      { q: "I haven't filed annual returns in years. Is it too late?", a: "No. Bizdoc regularly clears 5 – 10 years of missed returns in one batch filing. Penalties apply, but they cap — and your company stays active. Send your CAC number; we'll quote the exact back-filing cost." },
      { q: "Do I need SCUML?", a: "Only if your business is in a regulated category (property, jewellery, precious-metals, car dealership, legal practice, accounting, etc.) or you deal with cash over regulatory thresholds. Bizdoc will tell you whether you need it before you pay for it." },
      { q: "What is Tax ProMax?", a: "Our annual tax-management service — ₦150,000/year. We file all monthly, quarterly, and annual returns on time, liaise with FIRS on your behalf, and make sure you never miss a deadline. Included in the Pro and Enterprise packages." },
      { q: "How long does CAC registration take?", a: "Business Name: 5 – 7 working days. Limited Company: 10 – 14 working days. Name reservation is usually 48 hours. We submit digitally the same day you pay." },
    ],
  },
  {
    id: "timelines",
    title: "Timelines & Delivery",
    summary: "How long things take",
    icon: Clock,
    accent: "#B48C4C",
    items: [
      { q: "How long does a Scalar website take?", a: "Presence package: 7 – 10 working days. Growth: 2 – 3 weeks. Automate: 4 – 6 weeks. Platform: 6 – 10 weeks depending on complexity. We agree the exact schedule at proposal stage." },
      { q: "How fast can Medialy go live?", a: "Setup completes in 5 working days (profile tuning + content plan). Content goes live from week 2. First measurable growth appears by week 6 with consistent posting." },
      { q: "Can you rush it?", a: "Sometimes, yes — priority delivery available on most services for a 30% rush fee. Ask when you brief the project; we'll tell you honestly whether the rush is possible before you pay extra." },
      { q: "What if you're late?", a: "If we miss a committed delivery date, the Coordinator notifies you before the date, not after. We propose a new timeline and usually add a small bonus to keep the trust. We don't go dark." },
      { q: "What happens after delivery?", a: "Scalar: 30 days of free tweaks after go-live, then paid support. Bizdoc: ongoing Compliance Management subscription (₦50,000/mo). Medialy: monthly — pause any month with 30 days notice. HUB: lifetime access to course materials." },
    ],
  },
  {
    id: "team",
    title: "Who We Are",
    summary: "Team, location, and the founder",
    icon: Users,
    accent: "#8B4513",
    items: [
      { q: "Where is HAMZURY based?", a: "Kano, Nigeria. We serve clients across Nigeria, West Africa, and diaspora markets. The core team is 18 people across the four divisions." },
      { q: "Who founded HAMZURY?", a: "Muhammad Hamzury — founder and primary architect of the firm's operations. He leads product decisions, content, and final approvals on custom work. The Closer handles your project day-to-day; he's escalated only if needed." },
      { q: "Who will I actually work with?", a: "Lead Handler (first contact, adds you to tracking) → Closer (your assigned advisor, owns your project end-to-end) → Division lead. Every handoff is logged so nothing drops." },
      { q: "How secure is my information?", a: "We keep client files in a locked cloud workspace. We never share invoices, contracts, or business documents with third parties without written approval. Staff sign an NDA before joining. Internal chats use only your HMZ reference code." },
      { q: "Do you have case studies?", a: "Yes — examples include Tilz Spa, Tel Tel Drugstores, Jeff Optimum, and others. Reply here with your industry and we'll send the case study that matches." },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   CHAT THREAD MODEL
   ══════════════════════════════════════════════════════════════════════════ */
type QuickReply = { label: string; onClick: () => void };

/** Phase 2 (v15) — a tickable checklist rendered inside a single bot bubble.
 *  The bubble shows the intro text, then one row per item (☐/☑ + title +
 *  "Why:" sub-text), then a "Continue →" call-to-action that fires the
 *  passed `onContinue` callback with the IDs of unticked (missing) items.
 */
type ChecklistAttachment = {
  items: ChecklistItem[];          // immutable item set for this bubble
  onContinue: (missingIdx: number[]) => void;
  continueLabel?: string;          // optional override for the CTA label
};

type Message = {
  id: number;
  role: "bot" | "user";
  text: string;
  quickReplies?: QuickReply[];
  checklist?: ChecklistAttachment;
  timestamp: Date;
};

/** Capture a free-text or call-back lead. v1 stores in component state +
 *  console.log; promote to tRPC `leads.create` once that endpoint exists. */
type CapturedLead = {
  kind: "callback" | "free_text";
  company: CompanyKey;
  payload: string;
  at: Date;
};

/* Phase 3 (v16) — Bizdoc pre-payment questionnaire state.
 *
 *  Set to a non-null value when the visitor enters the questionnaire flow,
 *  and back to `null` on completion or escape. Tracks which question is
 *  open, the answers gathered so far, and (when a tooltip is showing) the
 *  question to resume. */
type PrepaymentState = null | {
  businessId?: string;        // undefined for the standalone CAC leaf
  step: "q1" | "q2" | "q3" | "summary";
  hasForeigner?: boolean;
  entity?: EntityType;
  shareCapital?: number;
  missingChecklistCount: number;
  pausedForTooltip?: "q1" | "q2" | "q3";  // which question to resume after tooltip
};

/* Phase 5 (v17) — Closing flow state.
 *
 *  After a service is committed to (Bizdoc post-quote OR a non-Bizdoc
 *  service-detail tap), we run a single shared closing sequence:
 *    bank details → "I've paid" → affiliate question → requirement form.
 *  See client/src/lib/apps-script.ts and the spec sections "SHARED ELEMENTS
 *  — Closing sequence" and "SINGLE POINT OF CONTACT RULE" for details. */
type ClosingState = null | {
  serviceId: string;          // which service was committed to
  serviceName: string;
  pricing: { total: number; depositPercent?: number };
  step:
    | "bank"
    | "paid_choice"
    | "affiliate"
    | "affiliate_code_text"   // free-text for "affiliate code" / "content"
    | "complete";
  paymentChoice?: "full" | "deposit";
  affiliateAnswer?: string;
  affiliateCode?: string;
  ref?: string;               // generated when "I've paid" is tapped
};

/* ── Bank account details shown in the closing flow ─────────────────────
 *  TODO: Founder will swap these placeholder values for the real Hamzury
 *  Limited account before launch. Centralised here so a single edit
 *  flips them across every closing-flow message. */
const BANK_DETAILS = {
  bankName: "MoniePoint Bank",
  accountName: "Hamzury",
  accountNumber: "8034620520",
};

/** Ref generator mirrors `generateRef(phone?)` in `server/db.ts`:
 *    HMZ-YY/M-XXXX  (last 4 phone digits, or random when phone missing).
 *  Used client-side when the visitor taps "I've paid" so we can show the
 *  reference immediately without waiting for a server round-trip. */
function generateClientRef(phone?: string | null): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1);
  const digits = phone ? phone.replace(/\D/g, "") : "";
  const last4 =
    digits.length >= 4
      ? digits.slice(-4)
      : String(Math.floor(1000 + Math.random() * 9000));
  return `HMZ-${yy}/${m}-${last4}`;
}

/** Map a service id (real or `phase2_*` placeholder) to the requirement
 *  form route we open in a new tab after the affiliate step. Real ids
 *  live under /requirements/<id>; `phase2_*` placeholders haven't been
 *  built yet so we route to a generic placeholder URL.
 *
 *  TODO: Build /requirements/general (or replace per-service phase2_*
 *  routes) before launch — until then visitors land on a placeholder. */
function requirementFormUrl(serviceId: string, ref: string): string {
  const realIds = new Set([
    "cac", "tin", "licences", "plan", "trademark", "compliance",
    "website", "crm", "ai_integration", "automation", "ecommerce", "software_mgmt",
    "brand", "social", "podcast", "content_strategy", "video", "media_mgmt",
    "tech_training", "ai_business", "entrepreneurship", "team_training", "certification", "skills_mgmt",
  ]);
  const idForUrl = realIds.has(serviceId) ? serviceId : "general";
  return `/requirements/${idForUrl}?ref=${encodeURIComponent(ref)}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   WHATSAPP-STYLE CHAT PANEL
   ══════════════════════════════════════════════════════════════════════════ */
function WhatsAppChatPanel({
  department,
  onClose,
}: {
  department: Department;
  onClose: () => void;
}) {
  // Hostname auto-detect, with fall-back to the explicit dept prop (handy in
  // dev where the hostname is localhost but a division portal is open).
  const companyKey: CompanyKey = useMemo(() => {
    const detected = detectCompany();
    if (detected !== "hamzury") return detected;
    return deptToCompanyKey(department);
  }, [department]);
  const company = COMPANIES[companyKey];

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [, setLeads] = useState<CapturedLead[]>([]);
  const messageIdRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initRef = useRef(false);

  /* ── Phase 3 (v16): Bizdoc pre-payment questionnaire state ──────────────
   *  Persists the visitor's answers across multiple bot turns inside one
   *  flow. The state is managed via a ref because every bot quick-reply
   *  fires a closure that needs the latest snapshot synchronously — useState
   *  would be one render behind for chained replies. We DO mirror it into
   *  state so React re-renders if the UI ever needs to read it directly,
   *  but every handler reads/writes the ref. */
  const prepaymentRef = useRef<PrepaymentState>(null);

  /* ── Phase 5 (v17): Closing flow state ─────────────────────────────────
   *  Same ref pattern as prepaymentRef — survives across chained bot
   *  replies so each handler reads the latest snapshot synchronously. */
  const closingRef = useRef<ClosingState>(null);

  /* ── Last interest tracker ─────────────────────────────────────────────
   *  We log the last service / topic the visitor expressed interest in
   *  so a callback request can be tagged with what they were looking
   *  at. Updated whenever a service leaf or specialised business is
   *  picked. */
  const lastInterestRef = useRef<string>("");

  /* ── Phone tracker ─────────────────────────────────────────────────────
   *  The visitor's phone is captured either by the call-back flow or
   *  any free-text bubble that looks like a phone. Stored so the
   *  closing flow can stamp the ref + Apps Script payload with it. */
  const phoneRef = useRef<string>("");

  /* ── Menu navigation stack (Phase 1 grouped menus) ──────────────────────
   *  Each entry is the GROUP NODE the visitor drilled into, in order. The
   *  current visible level is the children of the last entry (or the
   *  company root tree when the stack is empty). Tapping a group pushes;
   *  tapping "← Back" pops.
   * --------------------------------------------------------------------- */
  const menuPathRef = useRef<MenuNode[]>([]);

  /* ── Keep the thread scrolled to the bottom on every change ────────── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const nextId = () => messageIdRef.current++;

  /** Append a user message immediately (no typing pause). */
  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", text, timestamp: new Date() },
    ]);
  }, []);

  /** Append a bot message after a 600-900ms typing pause. */
  const addBotMessage = useCallback(
    (text: string, quickReplies?: QuickReply[], delay = 700) => {
      setIsTyping(true);
      window.setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "bot", text, quickReplies, timestamp: new Date() },
        ]);
      }, delay);
    },
    []
  );

  /** Append a bot message that carries a tickable checklist payload. */
  const addBotChecklistMessage = useCallback(
    (text: string, checklist: ChecklistAttachment, delay = 800) => {
      setIsTyping(true);
      window.setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "bot", text, checklist, timestamp: new Date() },
        ]);
      }, delay);
    },
    []
  );

  /** Capture a lead — v1 stores in component state + console.log, plus
   *  dual-writes to the Apps Script webhook (Phase 5). The console.log
   *  is preserved so a tRPC mirror can be wired up in a later phase
   *  without losing the dev-friendly log line.
   *
   *  TODO: wire to `trpc.leads.create` once that endpoint lands. */
  const captureLead = useCallback(
    (kind: CapturedLead["kind"], payload: string) => {
      const lead: CapturedLead = { kind, company: companyKey, payload, at: new Date() };
      setLeads((prev) => [...prev, lead]);
      // eslint-disable-next-line no-console
      console.log("[ChatWidget] lead captured (v1 — replace with tRPC):", lead);
      // Dual-write to Apps Script (fire-and-forget, errors swallowed).
      postToAppsScript({
        formType: "leadCapture",
        site: companyKey,
        data: {
          source: kind === "callback" ? "chat_callback" : "chat_freetext",
          details: payload,
          phone: phoneRef.current || undefined,
        },
      });
    },
    [companyKey]
  );

  /* ── Flow handlers (declared as plain functions; they use the addBot
        / addUser closures directly. Keeps each conversation step
        readable as a script.) ─────────────────────────────────────────── */

  const showMainMenu = useCallback(() => {
    addBotMessage(
      "What can I help you with today?",
      [
        { label: "Browse our services", onClick: () => onPickServicesIntro() },
        { label: "I'm not sure what I need", onClick: () => onPickClarity() },
        { label: "Browse FAQ", onClick: () => onPickFaqIntro() },
        { label: "Request a call back", onClick: () => onPickCallback() },
      ],
      600
    );
  }, [addBotMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Menu helpers (Phase 1) ─────────────────────────────────────────── */

  /** Compute the children list at the current menu path. */
  const currentMenuLevel = (): MenuNode[] => {
    const stack = menuPathRef.current;
    if (stack.length === 0) return COMPANY_TREE[companyKey];
    const top = stack[stack.length - 1];
    return top.kind === "group" ? top.children : [];
  };

  /** Bot-message prompt text for the current level. */
  const promptForLevel = (): string => {
    const stack = menuPathRef.current;
    if (stack.length === 0) {
      return company.services === "all"
        ? "Welcome — pick where to start:"
        : `Welcome to ${company.name}. What do you need today?`;
    }
    const top = stack[stack.length - 1];
    return top.kind === "group" ? `${top.label} — pick one:` : "Pick one:";
  };

  /** Render the current menu level as quick replies + Back. */
  const renderCurrentLevel = () => {
    const level = currentMenuLevel();
    const replies: QuickReply[] = level.map((node) => ({
      label: node.label,
      onClick: () => onPickNode(node),
    }));

    // Cross-sell appears once at the ROOT of a division-site tree only.
    if (
      menuPathRef.current.length === 0 &&
      company.crossSellOffer &&
      company.sisterCompanies
    ) {
      for (const [dept, target] of Object.entries(company.sisterCompanies) as [
        Department2,
        CompanyKey
      ][]) {
        replies.push({
          label: `Need ${DEPT_LABEL[dept]}? (${COMPANIES[target].name})`,
          onClick: () => onCrossSell(dept, target),
        });
      }
    }

    if (menuPathRef.current.length > 0) {
      replies.push({ label: "← Back", onClick: () => onMenuBack() });
    } else {
      replies.push({ label: "Back to main menu", onClick: () => showMainMenu() });
    }

    addBotMessage(promptForLevel(), replies);
  };

  /** Visitor tapped a node at the current level — dispatch by kind. */
  const onPickNode = (node: MenuNode) => {
    addUserMessage(node.label);
    switch (node.kind) {
      case "group":
        menuPathRef.current = [...menuPathRef.current, node];
        renderCurrentLevel();
        return;
      case "service":
        onPickServiceLeaf(node);
        return;
      case "specialized":
        onPickSpecializedLeaf(node);
        return;
      case "bizdoc_cac":
        onPickBizdocCacLeaf();
        return;
      case "diagnostic":
        onPickDiagnosticLeaf(node);
        return;
      case "callback":
        // Re-use existing callback flow but skip the duplicate user-message
        // (we already added one above).
        setAwaitingCallback(true);
        addBotMessage("Sure — what's the best number to reach you on?", [
          {
            label: `Or call us now: +${CSO_PHONE}`,
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = `tel:+${CSO_PHONE}`;
              }
            },
          },
        ]);
        return;
      case "placeholder":
        addBotMessage(
          "Coming soon — we're finalising this section. In the meantime, our team can walk you through it on a call.",
          [
            { label: "Request a call", onClick: () => onPickCallback() },
            { label: "← Back", onClick: () => onMenuBack() },
          ]
        );
        return;
    }
  };

  /** Pop one level off the menu path. */
  const onMenuBack = () => {
    menuPathRef.current = menuPathRef.current.slice(0, -1);
    renderCurrentLevel();
  };

  /** Look up an existing service-catalog entry for a leaf id (if any). */
  const lookupServiceMeta = (
    leaf: Extract<MenuNode, { kind: "service" }>
  ): Service | undefined =>
    SERVICE_CATALOG.find((s) => s.id === leaf.serviceId);

  /** Service leaf tapped — show description, free diagnosis, callback,
   *  and (Phase 5) a "Pay & start" CTA that opens the closing flow with
   *  a placeholder price reveal. The placeholder language is intentional:
   *  Scalar / Medialy / HUB don't have firm pricing yet, so the bot
   *  shows a "₦XXX,XXX (we'll confirm exact pricing on a quick call)"
   *  message and routes to the same shared closing sequence Bizdoc uses
   *  after its quote summary. */
  const onPickServiceLeaf = (
    leaf: Extract<MenuNode, { kind: "service" }>
  ) => {
    const meta = lookupServiceMeta(leaf);
    const subtitle =
      leaf.subtitle ?? meta?.blurb ??
      "Our team will walk you through scope, timeline and price.";
    const flagshipPrefix = leaf.flagship ? "★ Flagship — " : "";
    lastInterestRef.current = leaf.label;
    addBotMessage(`${flagshipPrefix}${leaf.label} — ${subtitle}`, [
      {
        label: "Pay & start",
        onClick: () => onCommitNonBizdocService(leaf),
      },
      {
        label: "Take the free diagnosis",
        onClick: () => onLaunchDiagnosis(meta),
      },
      { label: "Request a call back", onClick: () => onPickCallback() },
      { label: "← Back", onClick: () => renderCurrentLevel() },
    ]);
  };

  /** Phase 5: visitor committed to a non-Bizdoc service from the
   *  service-detail bubble. We surface a placeholder price reveal
   *  ("₦XXX,XXX (we'll confirm…)") and start the shared closing flow.
   *  Real pricing comes later via the Pay-as-you-go price book. */
  const onCommitNonBizdocService = (
    leaf: Extract<MenuNode, { kind: "service" }>
  ) => {
    addUserMessage("Pay & start");
    addBotMessage(
      `Great — ${leaf.label}.\n\n` +
        `₦XXX,XXX (we'll confirm exact pricing on a quick call once we ` +
        `understand your specific brief).`,
      undefined,
      700,
    );
    startClosingFlow({
      serviceId: leaf.serviceId,
      serviceName: leaf.label,
      pricing: { total: 0 },
    });
  };

  /** Specialized-business leaf tapped (Phase 2 — Bizdoc Group 4).
   *  Renders the per-business document checklist as a single tickable
   *  bot bubble. After "Continue →", bot lists what's missing and hands
   *  off with a callback option (Phase 3 will replace the hand-off with
   *  the real pre-payment questionnaire + price calc). */
  const onPickSpecializedLeaf = (
    leaf: Extract<MenuNode, { kind: "specialized" }>
  ) => {
    const biz: SpecializedBusiness | undefined = BIZDOC_SPECIALIZED.find(
      (b) => b.id === leaf.specializedId
    );
    if (!biz) {
      // Defensive — should never fire because the menu is built from the
      // same array. Surface as a generic placeholder rather than crashing.
      addBotMessage(
        "We're finalising this checklist. Our team can walk you through it on a call.",
        [
          { label: "Request a call", onClick: () => onPickCallback() },
          { label: "← Back", onClick: () => onMenuBack() },
        ]
      );
      return;
    }

    const intro =
      `Setting up a ${biz.label} business in Nigeria requires several ` +
      `registrations. Tick what you already have so we know exactly what ` +
      `to help you with.`;

    lastInterestRef.current = `Specialized: ${biz.label}`;
    addBotChecklistMessage(intro, {
      items: biz.checklist,
      onContinue: (missingIdx) => onSpecializedContinue(biz, missingIdx),
    });
  };

  /** Visitor tapped "Continue →" inside the checklist bubble. Acknowledges
   *  the tick state, lists the missing items, then opens the Phase 3
   *  pre-payment questionnaire (Q1 → Q2 → Q3 → quote summary). */
  const onSpecializedContinue = (
    biz: SpecializedBusiness,
    missingIdx: number[]
  ) => {
    addUserMessage(
      missingIdx.length === 0
        ? "Continue → I have everything"
        : `Continue → I'm missing ${missingIdx.length} item${missingIdx.length === 1 ? "" : "s"}`
    );

    if (missingIdx.length === 0) {
      addBotMessage(
        `Great — you already have the full ${biz.label} compliance pack. ` +
          `Three quick questions before we finalise the price.`
      );
    } else {
      const missingList = missingIdx
        .map((i) => `• ${biz.checklist[i].title}`)
        .join("\n");
      addBotMessage(
        `Got it. Based on what you ticked, here's what's still missing for a ` +
          `${biz.label} setup:\n\n${missingList}`
      );
    }

    // Catch-all #25: extra free-text hint nudging the visitor to type their
    // exact business so the team can send a tailored checklist.
    if (biz.notes) {
      addBotMessage(biz.notes, undefined, 1400);
    }

    const missingDetail =
      missingIdx.length === 0
        ? "none"
        : missingIdx.map((i) => biz.checklist[i].title).join(", ");

    captureLead(
      "free_text",
      `Specialized:${biz.id} | missing:${missingDetail}`
    );

    // Phase 5: also dual-write a `specialized_business` source so the
    // Apps Script tab can distinguish a checklist hand-off from a
    // free-text bubble. (captureLead already wrote "chat_freetext".)
    postToAppsScript({
      formType: "leadCapture",
      site: "bizdoc",
      data: {
        source: "specialized_business",
        details: `${biz.id} | missing: ${missingDetail}`,
        phone: phoneRef.current || undefined,
      },
    });

    // Open the pre-payment questionnaire — fires Q1 first.
    startPrepayment({
      businessId: biz.id,
      missingChecklistCount: missingIdx.length,
    });
  };

  /* ════════════════════════════════════════════════════════════════════════
     Phase 3 (v16): PRE-PAYMENT QUESTIONNAIRE
     ----------------------------------------------------------------------
     Q1 — foreigner directors (always fires; both Bizdoc paths involve new
          CAC registration). Tooltip 1 explains the difference.
     Q2 — entity type. Tooltip 2 explains BN vs Ltd.
     Q3 — share capital (Ltd / PLC only). Tooltip 3 explains share capital.
          Greys out options below the legal floor for the chosen business
          and force-locks ₦100M when foreigner = Yes.
     Quote — calculateBizdocPrice() produces a placeholder breakdown.
     ──────────────────────────────────────────────────────────────────── */

  const startPrepayment = (input: {
    businessId?: string;
    missingChecklistCount: number;
  }) => {
    prepaymentRef.current = {
      businessId: input.businessId,
      step: "q1",
      missingChecklistCount: input.missingChecklistCount,
    };
    addBotMessage(
      "Before we finalise the price, three quick questions — these affect " +
        "what you legally need and what it costs."
    );
    askQ1();
  };

  /** Standalone "CAC Business Registration" leaf (Group 1) — skips the
   *  document checklist and goes straight to Q1. */
  const onPickBizdocCacLeaf = () => {
    lastInterestRef.current = "CAC Business Registration";
    startPrepayment({ businessId: undefined, missingChecklistCount: 0 });
  };

  // ── Q1 (foreigner) ──────────────────────────────────────────────────
  const askQ1 = () => {
    const state = prepaymentRef.current;
    if (!state) return;
    prepaymentRef.current = { ...state, step: "q1", pausedForTooltip: undefined };
    addBotMessage(
      "Are any of the directors or shareholders foreign nationals (non-Nigerian citizens)?",
      [
        { label: "Yes — at least one foreigner on board", onClick: () => answerQ1(true) },
        { label: "No — all Nigerian citizens",            onClick: () => answerQ1(false) },
        { label: "❓ What's the difference / why does this matter?",
          onClick: () => showTooltip("q1") },
      ],
      900
    );
  };

  const answerQ1 = (hasForeigner: boolean) => {
    const state = prepaymentRef.current;
    if (!state) return;
    addUserMessage(hasForeigner ? "Yes — at least one foreigner on board" : "No — all Nigerian citizens");
    prepaymentRef.current = { ...state, hasForeigner, step: "q2" };
    askQ2();
  };

  // ── Q2 (entity) ─────────────────────────────────────────────────────
  const askQ2 = () => {
    const state = prepaymentRef.current;
    if (!state) return;
    prepaymentRef.current = { ...state, step: "q2", pausedForTooltip: undefined };
    addBotMessage(
      "What entity type do you want to register?",
      [
        { label: "Limited Liability Company (Ltd) — most common",   onClick: () => answerQ2("ltd") },
        { label: "Business Name (BN) — sole trader / simple partnership", onClick: () => answerQ2("bn") },
        { label: "Public Limited Company (PLC) — for raising public capital", onClick: () => answerQ2("plc") },
        { label: "Incorporated Trustee — NGO, religious org, foundation", onClick: () => answerQ2("trustee") },
        { label: "❓ Help me decide — what's the difference?", onClick: () => showTooltip("q2") },
      ],
      900
    );
  };

  const answerQ2 = (entity: EntityType) => {
    const state = prepaymentRef.current;
    if (!state) return;
    const labels: Record<EntityType, string> = {
      ltd: "Limited Liability Company (Ltd)",
      bn: "Business Name (BN)",
      plc: "Public Limited Company (PLC)",
      trustee: "Incorporated Trustee",
    };
    addUserMessage(labels[entity]);
    const next: NonNullable<PrepaymentState> = { ...state, entity };

    // Q3 only fires for Ltd / PLC. BN + Trustee skip straight to summary
    // with a default share capital of 0 (no stamp duty applies).
    if (entity === "ltd" || entity === "plc") {
      next.step = "q3";
      prepaymentRef.current = next;
      askQ3();
    } else {
      next.step = "summary";
      next.shareCapital = 0;
      prepaymentRef.current = next;
      showQuote();
    }
  };

  // ── Q3 (share capital) ──────────────────────────────────────────────
  const askQ3 = () => {
    const state = prepaymentRef.current;
    if (!state) return;
    prepaymentRef.current = { ...state, step: "q3", pausedForTooltip: undefined };

    const biz = state.businessId
      ? BIZDOC_SPECIALIZED.find((b) => b.id === state.businessId)
      : undefined;
    const businessMin = biz?.minShareCapital;
    const floor = effectiveShareCapitalFloor({
      businessMin,
      hasForeigner: state.hasForeigner === true,
    });

    // Compose quick-replies — disabled options are still rendered as
    // labels-only buttons that explain why they're locked.
    const replies: QuickReply[] = SHARE_CAPITAL_OPTIONS.map((opt) => {
      const disabled = opt.value < floor;
      if (disabled) {
        return {
          label: `${opt.label} — locked (legal min ${formatNaira(floor)})`,
          onClick: () => {
            // Soft-tap explanation; does not advance the flow.
            addUserMessage(`Tapped locked option (${formatNaira(opt.value)})`);
            addBotMessage(
              `That option is below the legal minimum for your setup. ` +
                `The lowest you can pick is ${formatNaira(floor)}. ` +
                `Pick one of the available options to continue.`,
              undefined,
              500
            );
          },
        };
      }
      return {
        label: opt.label,
        onClick: () => answerQ3(opt.value),
      };
    });

    // "Higher" catch-all — always available.
    replies.push({
      label: "Higher — I have a specialized industry requirement",
      onClick: () => {
        addUserMessage("Higher — I have a specialized industry requirement");
        // For Phase 3 we treat "Higher" as exactly the floor + 100M as a
        // safe placeholder so the price quote can still render. CSO will
        // refine on follow-up. Capture so the team sees it.
        captureLead("free_text", `Prepayment | shareCapital:HIGHER (placeholder)`);
        answerQ3(Math.max(floor, 100_000_000));
      },
    });

    // Tooltip
    replies.push({
      label: "❓ What is share capital and how do I choose?",
      onClick: () => showTooltip("q3"),
    });

    // Floor explanation: when the business or foreigner rule pushes the
    // floor above ₦1M, send a short bot message before the question.
    if (floor > 1_000_000) {
      const reason =
        state.hasForeigner === true && (!businessMin || businessMin < 100_000_000)
          ? `because at least one director is foreign, CAC mandates at least ${formatNaira(floor)} share capital.`
          : biz
            ? `for ${biz.label}, the legal minimum share capital is ${formatNaira(floor)}.`
            : `the legal minimum share capital is ${formatNaira(floor)}.`;
      addBotMessage(`Heads up — ${reason} Lower options are locked.`, undefined, 700);
    }

    addBotMessage(
      "What share capital do you want to register with?",
      replies,
      1000
    );
  };

  const answerQ3 = (shareCapital: number) => {
    const state = prepaymentRef.current;
    if (!state) return;
    addUserMessage(formatNaira(shareCapital));
    prepaymentRef.current = { ...state, shareCapital, step: "summary" };
    showQuote();
  };

  // ── Tooltip flow ────────────────────────────────────────────────────
  const showTooltip = (which: "q1" | "q2" | "q3") => {
    const state = prepaymentRef.current;
    if (!state) return;
    addUserMessage(
      which === "q1"
        ? "❓ What's the difference / why does this matter?"
        : which === "q2"
          ? "❓ Help me decide — what's the difference?"
          : "❓ What is share capital and how do I choose?"
    );
    prepaymentRef.current = { ...state, pausedForTooltip: which };
    const text =
      which === "q1" ? TOOLTIP_FOREIGNER
        : which === "q2" ? TOOLTIP_ENTITY
          : TOOLTIP_SHARE_CAPITAL;
    addBotMessage(text, [
      { label: "Got it — back to questions", onClick: () => resumeFromTooltip() },
    ], 800);
  };

  const resumeFromTooltip = () => {
    const state = prepaymentRef.current;
    if (!state || !state.pausedForTooltip) return;
    addUserMessage("Got it — back to questions");
    const which = state.pausedForTooltip;
    if (which === "q1") askQ1();
    else if (which === "q2") askQ2();
    else askQ3();
  };

  // ── Quote summary ──────────────────────────────────────────────────
  const showQuote = () => {
    const state = prepaymentRef.current;
    if (!state || state.entity === undefined) return;
    const biz = state.businessId
      ? BIZDOC_SPECIALIZED.find((b) => b.id === state.businessId)
      : undefined;
    const quote: PriceQuote = calculateBizdocPrice({
      businessId: state.businessId,
      entity: state.entity,
      hasForeigner: state.hasForeigner === true,
      shareCapital: state.shareCapital ?? 0,
      missingChecklistCount: state.missingChecklistCount,
    });

    // Build the bullet summary per spec format.
    const bullets: string[] = [];
    if (biz) bullets.push(`• ${biz.label} specialised setup`);
    bullets.push(
      `• ${
        state.entity === "ltd" ? "Limited Liability Company (Ltd)"
          : state.entity === "bn" ? "Business Name (BN)"
            : state.entity === "plc" ? "Public Limited Company (PLC)"
              : "Incorporated Trustee"
      }`
    );
    if (state.hasForeigner) {
      bullets.push("• Foreign director on board → CERPAC + business permit added");
    }
    if (state.shareCapital && state.shareCapital > 0) {
      bullets.push(`• Share capital ${formatNaira(state.shareCapital)}`);
      bullets.push("• CAC stamp duty calculated at 0.75% of share capital");
    }

    const summary =
      `Based on your answers:\n\n${bullets.join("\n")}\n\n` +
      `Total: ${formatNaira(quote.total)}\n` +
      `Estimated timeline: ${quote.timelineWeeks}\n` +
      (state.missingChecklistCount > 0
        ? `Includes everything from your checklist.\n\n`
        : `\n`) +
      `Breakdown:\n${quote.breakdown.map((b) => `  – ${b}`).join("\n")}`;

    const deposit = Math.round(quote.total / 2);
    addBotMessage(summary, [
      { label: "Proceed — full payment",                 onClick: () => onPaymentChoice("full", quote.total) },
      { label: `Pay 50% deposit (${formatNaira(deposit)}) to start`, onClick: () => onPaymentChoice("deposit", deposit) },
      { label: "I have more questions",                  onClick: () => onPaymentChoice("more_questions", 0) },
    ], 1100);

    captureLead(
      "free_text",
      `Prepayment quote | biz:${state.businessId ?? "cac_only"} | entity:${state.entity}` +
        ` | foreigner:${state.hasForeigner ? "yes" : "no"} | shareCapital:${state.shareCapital ?? 0}` +
        ` | total:${quote.total}`
    );
  };

  /** Phase 5 (v17): wired from the Bizdoc quote summary CTAs. "More
   *  questions" routes to the callback flow; "full" / "deposit" both
   *  open the shared closing flow (bank details → paid → affiliate
   *  → requirement form link). */
  const onPaymentChoice = (
    choice: "full" | "deposit" | "more_questions",
    amount: number
  ) => {
    if (choice === "more_questions") {
      addUserMessage("I have more questions");
      addBotMessage(
        "No problem — Maryam will reach out with answers and walk you through " +
          "the next steps. What's the best number to reach you on?",
        [
          {
            label: `Or call us now: +${CSO_PHONE}`,
            onClick: () => {
              if (typeof window !== "undefined") window.location.href = `tel:+${CSO_PHONE}`;
            },
          },
        ]
      );
      setAwaitingCallback(true);
      prepaymentRef.current = null;
      return;
    }

    addUserMessage(
      choice === "full"
        ? "Proceed — full payment"
        : `Pay 50% deposit (${formatNaira(amount)}) to start`
    );

    captureLead(
      "free_text",
      `Prepayment ${choice} | amount:${amount}`
    );

    // Resolve the service id + display name from the prepayment state.
    const ps = prepaymentRef.current;
    const biz = ps?.businessId
      ? BIZDOC_SPECIALIZED.find((b) => b.id === ps.businessId)
      : undefined;
    const serviceId = ps?.businessId ?? "cac";
    const serviceName = biz ? `${biz.label} setup` : "CAC Business Registration";

    // Compute the "total" we'll quote in the closing-flow bank message:
    // - "full": amount IS the full total
    // - "deposit": amount is half of the total
    const total = choice === "deposit" ? amount * 2 : amount;
    const depositPercent = choice === "deposit" ? 50 : undefined;

    prepaymentRef.current = null;
    startClosingFlow({
      serviceId,
      serviceName,
      pricing: { total, depositPercent },
    });
  };

  /* ════════════════════════════════════════════════════════════════════════
     Phase 5 (v17): CLOSING FLOW
     ----------------------------------------------------------------------
     bank details → "I've paid" → affiliate question → requirement form.
     Spec: MASTER-CHAT-FLOW.md "SHARED ELEMENTS — Closing sequence" and
     "SINGLE POINT OF CONTACT RULE".
     ──────────────────────────────────────────────────────────────────── */
  const startClosingFlow = (input: {
    serviceId: string;
    serviceName: string;
    pricing: { total: number; depositPercent?: number };
  }) => {
    closingRef.current = {
      serviceId: input.serviceId,
      serviceName: input.serviceName,
      pricing: input.pricing,
      step: "bank",
    };
    showBankDetails();
  };

  const showBankDetails = () => {
    const state = closingRef.current;
    if (!state) return;
    addBotMessage(
      `Pay into:\n\n` +
        `Bank: ${BANK_DETAILS.bankName}\n` +
        `Account Name: ${BANK_DETAILS.accountName}\n` +
        `Account Number: ${BANK_DETAILS.accountNumber}\n\n` +
        `Once you've sent the transfer, tap below.`,
      [
        { label: "✓ I've paid in full",       onClick: () => onIvePaid("full") },
        { label: "✓ I've paid 50% deposit",   onClick: () => onIvePaid("deposit") },
        { label: "Question first",            onClick: () => onClosingQuestion() },
      ],
      900,
    );
    closingRef.current = { ...state, step: "paid_choice" };
  };

  const onClosingQuestion = () => {
    addUserMessage("Question first");
    addBotMessage(
      "No problem — Maryam will pick this up. What's the best number to reach you on?",
      [
        {
          label: `Or call us now: +${CSO_PHONE}`,
          onClick: () => {
            if (typeof window !== "undefined") window.location.href = `tel:+${CSO_PHONE}`;
          },
        },
      ],
    );
    setAwaitingCallback(true);
    closingRef.current = null;
  };

  const onIvePaid = (choice: "full" | "deposit") => {
    const state = closingRef.current;
    if (!state) return;
    addUserMessage(choice === "full" ? "✓ I've paid in full" : "✓ I've paid 50% deposit");
    const ref = generateClientRef(phoneRef.current || undefined);
    closingRef.current = {
      ...state,
      step: "affiliate",
      paymentChoice: choice,
      ref,
    };
    addBotMessage(
      "Thanks! Quick question — how did you hear about us?",
      [
        { label: "A friend",                onClick: () => onAffiliatePick("A friend") },
        { label: "Instagram",               onClick: () => onAffiliatePick("Instagram") },
        { label: "Google search",           onClick: () => onAffiliatePick("Google search") },
        { label: "I have an affiliate code", onClick: () => onAffiliatePick("affiliate code") },
        { label: "A piece of content",      onClick: () => onAffiliatePick("content") },
        { label: "Other",                   onClick: () => onAffiliatePick("Other") },
      ],
      800,
    );
  };

  const onAffiliatePick = (answer: string) => {
    const state = closingRef.current;
    if (!state) return;
    addUserMessage(
      answer === "affiliate code"
        ? "I have an affiliate code"
        : answer === "content"
          ? "A piece of content"
          : answer,
    );
    closingRef.current = { ...state, affiliateAnswer: answer };

    // Free-text follow-up for "affiliate code" or "content".
    if (answer === "affiliate code" || answer === "content") {
      closingRef.current = { ...closingRef.current!, step: "affiliate_code_text" };
      const prompt =
        answer === "affiliate code"
          ? "Got it — please type the affiliate code below."
          : "Got it — please type which piece of content (link, title, or short description) below.";
      addBotMessage(prompt, undefined, 700);
      setAwaitingAffiliateText(true);
      return;
    }

    finishClosing();
  };

  const finishClosing = () => {
    const state = closingRef.current;
    if (!state) return;
    const ref = state.ref ?? generateClientRef(phoneRef.current || undefined);
    const formUrl = requirementFormUrl(state.serviceId, ref);

    addBotMessage(
      `Welcome to ${company.name} 🎉\n` +
        `Reference: ${ref}\n\n` +
        `Please fill out this short form so we can begin work.`,
      [
        {
          label: "Open requirement form →",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.open(formUrl, "_blank", "noopener,noreferrer");
            }
          },
        },
        { label: "Back to main menu", onClick: () => showMainMenu() },
      ],
      900,
    );

    // Phase 5: dual-write the "chat_paid" lead to Apps Script. The
    // existing captureLead() console-logs an internal record; this fires
    // the additional Apps Script payload so the workspace sees it.
    postToAppsScript({
      formType: "leadCapture",
      site: companyKey,
      data: {
        source: "chat_paid",
        details:
          `${state.serviceName} | ${state.paymentChoice ?? "?"} | ` +
          `affiliate: ${state.affiliateAnswer ?? "?"}` +
          (state.affiliateCode ? ` (${state.affiliateCode})` : ""),
        phone: phoneRef.current || undefined,
        ref,
      },
    });

    closingRef.current = { ...state, step: "complete" };
  };

  /** Diagnostic leaf tapped — open route in a new tab. */
  const onPickDiagnosticLeaf = (
    leaf: Extract<MenuNode, { kind: "diagnostic" }>
  ) => {
    addBotMessage(
      `Opening the ${company.diagnosticTitle} in a new tab. ${company.diagnosticBlurb}`,
      [{ label: "Back to main menu", onClick: () => showMainMenu() }]
    );
    if (typeof window !== "undefined") {
      window.open(leaf.route, "_blank", "noopener,noreferrer");
      toast.success(`Opening the ${company.diagnosticTitle}`);
    }
  };

  const onPickServicesIntro = () => {
    addUserMessage("Browse our services");
    menuPathRef.current = [];
    renderCurrentLevel();
  };

  const onLaunchDiagnosis = (s?: Service) => {
    const route =
      company.services === "all" && s ? s.diagnosticRoute : company.diagnosticRoute;
    addUserMessage("Take the free diagnosis");
    addBotMessage(
      `Opening the ${company.diagnosticTitle} in a new tab. ${company.diagnosticBlurb}`,
      [{ label: "Back to main menu", onClick: () => showMainMenu() }]
    );
    if (typeof window !== "undefined") {
      window.open(route, "_blank", "noopener,noreferrer");
      toast.success(`Opening the ${company.diagnosticTitle}`);
    }
  };

  const onPickClarity = () => {
    addUserMessage("I'm not sure what I need");
    addBotMessage(
      `No problem. We do a free ${company.diagnosticTitle} — ${company.diagnosticBlurb}`,
      [
        { label: "Start the checkup", onClick: () => onLaunchDiagnosis() },
        { label: "Maybe later", onClick: () => showMainMenu() },
      ]
    );
  };

  const onPickFaqIntro = () => {
    addUserMessage("Browse FAQ");
    addBotMessage("Pick a topic:", [
      ...FAQ_CATEGORIES.map((c) => ({
        label: c.title,
        onClick: () => onPickFaqCategory(c),
      })),
      { label: "Back to main menu", onClick: () => showMainMenu() },
    ]);
  };

  const onPickFaqCategory = (c: FAQCategory) => {
    addUserMessage(c.title);
    addBotMessage(c.summary + " — pick a question:", [
      ...c.items.map((q) => ({
        label: q.q,
        onClick: () => onPickFaqAnswer(c, q),
      })),
      { label: "Back to FAQ topics", onClick: () => onPickFaqIntro() },
    ]);
  };

  const onPickFaqAnswer = (c: FAQCategory, q: FAQ) => {
    addUserMessage(q.q);
    addBotMessage(q.a, [
      { label: "More questions?", onClick: () => onPickFaqCategory(c) },
      { label: "Back to main menu", onClick: () => showMainMenu() },
    ]);
  };

  /* ── Call-back flow — collects a phone number ──────────────────────── */
  const [awaitingCallback, setAwaitingCallback] = useState(false);
  /* Phase 5: free-text follow-up for "affiliate code" / "content" picks. */
  const [awaitingAffiliateText, setAwaitingAffiliateText] = useState(false);

  const onPickCallback = () => {
    addUserMessage("Request a call back");
    setAwaitingCallback(true);
    addBotMessage(
      "Sure — what's the best number to reach you on?",
      [
        {
          label: `Or call us now: +${CSO_PHONE}`,
          onClick: () => {
            if (typeof window !== "undefined") {
              window.location.href = `tel:+${CSO_PHONE}`;
            }
          },
        },
      ]
    );
  };

  const finishCallback = (phone: string) => {
    setAwaitingCallback(false);
    phoneRef.current = phone;
    captureLead("callback", phone);
    // Phase 5: dual-write a "chat_callback" Apps Script lead with the
    // last interest the visitor expressed (so the CSO sees what they
    // were looking at when they asked for the call).
    postToAppsScript({
      formType: "leadCapture",
      site: companyKey,
      data: {
        source: "chat_callback",
        details: lastInterestRef.current || "(no specific interest yet)",
        phone,
      },
    });
    addBotMessage(
      "Got it. Maryam will call you within 1 hour during business hours (Mon-Fri 9am-5pm WAT). Anything else?",
      [
        { label: "Browse services", onClick: () => onPickServicesIntro() },
        { label: "I'm done", onClick: () => onFinish() },
      ]
    );
  };

  const onFinish = () => {
    addUserMessage("I'm done");
    addBotMessage("Thanks for visiting — we'll be in touch.", [
      { label: "Start over", onClick: () => showMainMenu() },
    ]);
  };

  /* ── Cross-sell handler (division sites only) ──────────────────────── */
  const onCrossSell = (dept: Department2, target: CompanyKey) => {
    addUserMessage(`I need ${DEPT_LABEL[dept]}`);
    addBotMessage(
      `We're ${company.name} — ${DEPT_LABEL[dept].toLowerCase()} is ${COMPANIES[target].name}'s area. Want me to send you over?`,
      [
        {
          label: `Yes, take me to ${COMPANIES[target].name}`,
          onClick: () => {
            addUserMessage(`Yes, take me to ${COMPANIES[target].name}`);
            if (typeof window !== "undefined") {
              window.open(CROSS_SELL_LINK[target], "_blank", "noopener,noreferrer");
            }
            addBotMessage(
              `Opening ${COMPANIES[target].name} in a new tab. Anything else I can help with?`,
              [{ label: "Back to main menu", onClick: () => showMainMenu() }]
            );
          },
        },
        {
          label: "No, stay here",
          onClick: () => {
            addUserMessage("No, stay here");
            showMainMenu();
          },
        },
      ]
    );
  };

  /* ── Free-text handler ──────────────────────────────────────────────── */
  const onSendFreeText = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    addUserMessage(text);

    // Phase 5: closing-flow follow-up for "affiliate code" / "content".
    if (awaitingAffiliateText && closingRef.current?.step === "affiliate_code_text") {
      setAwaitingAffiliateText(false);
      closingRef.current = { ...closingRef.current, affiliateCode: text };
      finishClosing();
      return;
    }

    // Phone-number capture: if we're waiting for a callback number AND the
    // text looks like a phone, treat it as the answer.
    if (awaitingCallback && /\d/.test(text) && text.replace(/\D/g, "").length >= 7) {
      finishCallback(text);
      return;
    }

    // Opportunistic phone capture from any free-text bubble — if the
    // visitor types something that strongly looks like a phone, store
    // it so the closing flow / Apps Script call can stamp leads with it.
    if (/\d/.test(text) && text.replace(/\D/g, "").length >= 10 && !phoneRef.current) {
      phoneRef.current = text;
    }

    captureLead("free_text", text);
    addBotMessage(
      "Got it — Maryam will follow up shortly. Anything else I can help with?",
      [
        { label: "Browse services", onClick: () => onPickServicesIntro() },
        { label: "Browse FAQ", onClick: () => onPickFaqIntro() },
        { label: "I'm done", onClick: () => onFinish() },
      ]
    );
  };

  /* ── First-open welcome flow (paced — feels human) ─────────────────── */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    addBotMessage(
      `Hi, welcome to ${company.name}. I'm Mary, your assistant.`,
      undefined,
      400
    );
    window.setTimeout(() => showMainMenu(), 1400);
  }, [addBotMessage, company.name, showMainMenu]);

  /* ── Header FAQ shortcut — opens FAQ from any view ─────────────────── */
  const headerFaqShortcut = () => {
    onPickFaqIntro();
  };

  return (
    <div
      className="fixed z-[70] flex flex-col"
      style={{
        // Mobile: full-screen modal. Desktop: 380×600 anchored bottom-right.
        bottom: 0, right: 0,
        width: "min(380px, 100vw)",
        height: "min(600px, 100vh)",
        backgroundColor: WA_CHAT_BG,
        borderRadius: typeof window !== "undefined" && window.innerWidth > 480 ? 12 : 0,
        boxShadow: "0 20px 48px rgba(0,0,0,0.22)",
        overflow: "hidden",
        margin: typeof window !== "undefined" && window.innerWidth > 480 ? 16 : 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── HEADER (WhatsApp dark-green) ──────────────────────────────── */}
      <div
        style={{
          backgroundColor: WA_HEADER,
          color: "#fff",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 38, height: 38, borderRadius: "50%",
            backgroundColor: "#FFFFFF22",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
            flexShrink: 0,
          }}
        >
          M
        </div>
        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Mary</div>
          <div style={{ fontSize: 12, color: "#D1FAE5" }}>online</div>
        </div>
        {/* FAQ shortcut */}
        <button
          onClick={headerFaqShortcut}
          aria-label="Open FAQ"
          title="Browse FAQ"
          style={{
            width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
            backgroundColor: "transparent", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <HelpCircle size={20} />
        </button>
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
            backgroundColor: "transparent", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* ── MESSAGE THREAD ────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          backgroundColor: WA_CHAT_BG,
        }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* ── INPUT BAR ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "8px 10px",
          backgroundColor: WA_INPUT_BG,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendFreeText();
            }
          }}
          placeholder={
            awaitingAffiliateText
              ? "Type the affiliate code or content…"
              : awaitingCallback
                ? "Type your phone number…"
                : "Type your message…"
          }
          aria-label="Type your message"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            backgroundColor: "#fff",
            borderRadius: 22,
            padding: "10px 14px",
            fontSize: 14,
            color: DARK,
          }}
        />
        <button
          onClick={onSendFreeText}
          aria-label="Send message"
          disabled={!inputValue.trim()}
          style={{
            width: 42, height: 42, borderRadius: "50%",
            border: "none",
            backgroundColor: WA_BUBBLE,
            color: "#fff",
            cursor: inputValue.trim() ? "pointer" : "default",
            opacity: inputValue.trim() ? 1 : 0.5,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "opacity 0.15s",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE — left-gray for bot, right-green for visitor
   ══════════════════════════════════════════════════════════════════════════ */
function MessageBubble({ message }: { message: Message }) {
  const isBot = message.role === "bot";
  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        marginTop: 2,
      }}
    >
      <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            backgroundColor: isBot ? WA_BOT_BG : WA_USER_BG,
            border: isBot ? `1px solid ${WA_BOT_BORDER}` : "none",
            borderRadius: 12,
            // Tail effect on the side touching the edge
            borderTopLeftRadius: isBot ? 4 : 12,
            borderTopRightRadius: isBot ? 12 : 4,
            padding: "8px 12px 6px",
            color: DARK,
            fontSize: 14,
            lineHeight: 1.45,
            boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
            wordBreak: "break-word",
          }}
        >
          <div style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>
          {message.checklist && (
            <ChecklistBlock attachment={message.checklist} />
          )}
          <div
            style={{
              fontSize: 10.5,
              color: "#667781",
              textAlign: "right",
              marginTop: 2,
            }}
          >
            {time}
          </div>
        </div>
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 6,
              justifyContent: isBot ? "flex-start" : "flex-end",
            }}
          >
            {message.quickReplies.map((qr, i) => (
              <button
                key={i}
                onClick={qr.onClick}
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: `1px solid ${WA_HEADER}`,
                  color: WA_HEADER,
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  whiteSpace: "normal",
                  textAlign: "left",
                  lineHeight: 1.3,
                }}
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CHECKLIST BLOCK — tickable items rendered inside a bot bubble
   --------------------------------------------------------------------------
   Phase 2 (v15): used by the Bizdoc "Specialized Business Setup" flow.
   Each item has a ☐/☑ tap target, a bold title, and a "Why:" sub-line.
   After "Continue →" is tapped, the bubble locks (no more toggling) and
   the parent flow handler decides what to do with the missing items.
   ══════════════════════════════════════════════════════════════════════════ */
function ChecklistBlock({ attachment }: { attachment: ChecklistAttachment }) {
  const { items, onContinue, continueLabel } = attachment;
  const [ticked, setTicked] = useState<boolean[]>(() => items.map(() => false));
  const [submitted, setSubmitted] = useState(false);

  const toggle = (i: number) => {
    if (submitted) return;
    setTicked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleContinue = () => {
    if (submitted) return;
    setSubmitted(true);
    const missingIdx = ticked
      .map((t, i) => (t ? -1 : i))
      .filter((i) => i >= 0);
    onContinue(missingIdx);
  };

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => {
        const isOn = ticked[i];
        return (
          <button
            key={i}
            onClick={() => toggle(i)}
            disabled={submitted}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${isOn ? WA_HEADER : WA_BOT_BORDER}`,
              backgroundColor: isOn ? "#E8F5EE" : "#FAFAFA",
              cursor: submitted ? "default" : "pointer",
              textAlign: "left",
              opacity: submitted && !isOn ? 0.6 : 1,
              transition: "background-color 0.15s, border-color 0.15s",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontSize: 16,
                lineHeight: 1.2,
                color: isOn ? WA_HEADER : "#9CA3AF",
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              {isOn ? "\u2611" : "\u2610"}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: 13,
                  color: DARK,
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11.5,
                  color: "#4B5563",
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                <span style={{ fontWeight: 600 }}>Why:</span> {item.why}
              </span>
            </span>
          </button>
        );
      })}
      <button
        onClick={handleContinue}
        disabled={submitted}
        style={{
          marginTop: 4,
          alignSelf: "flex-end",
          padding: "8px 14px",
          borderRadius: 999,
          border: "none",
          backgroundColor: submitted ? "#9CA3AF" : WA_HEADER,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: submitted ? "default" : "pointer",
        }}
      >
        {continueLabel ?? "Continue \u2192"}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   TYPING INDICATOR — three animated dots in a bot-style bubble
   ══════════════════════════════════════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 2 }}>
      <div
        style={{
          backgroundColor: WA_BOT_BG,
          border: `1px solid ${WA_BOT_BORDER}`,
          borderRadius: 12,
          borderTopLeftRadius: 4,
          padding: "10px 14px",
          display: "flex",
          gap: 4,
          alignItems: "center",
          boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
        }}
      >
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
        <style>{`
          @keyframes hamzury-chat-dot {
            0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
            30% { opacity: 1; transform: translateY(-3px); }
          }
        `}</style>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      style={{
        width: 7, height: 7, borderRadius: "50%",
        backgroundColor: "#9CA3AF",
        display: "inline-block",
        animation: "hamzury-chat-dot 1.2s infinite",
        animationDelay: delay,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FAQ PANEL — standalone overlay, independent of the chat thread.
   --------------------------------------------------------------------------
   Same anchor as the chat panel (bottom-right 380×600 / full-screen mobile).
   Three-step navigation: Categories → Questions → Answer, with Back buttons.
   ══════════════════════════════════════════════════════════════════════════ */
function FaqPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  type View =
    | { kind: "categories" }
    | { kind: "questions"; category: FAQCategory }
    | { kind: "answer"; category: FAQCategory; item: FAQ };

  const [view, setView] = useState<View>({ kind: "categories" });

  return (
    <div
      className="fixed z-[70] flex flex-col"
      style={{
        bottom: 0, right: 0,
        width: "min(380px, 100vw)",
        height: "min(600px, 100vh)",
        backgroundColor: "#FFFFFF",
        borderRadius: typeof window !== "undefined" && window.innerWidth > 480 ? 12 : 0,
        boxShadow: "0 20px 48px rgba(0,0,0,0.22)",
        overflow: "hidden",
        margin: typeof window !== "undefined" && window.innerWidth > 480 ? 16 : 0,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          backgroundColor: WA_HEADER,
          color: "#fff",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {view.kind !== "categories" && (
          <button
            onClick={() =>
              setView(
                view.kind === "answer"
                  ? { kind: "questions", category: view.category }
                  : { kind: "categories" }
              )
            }
            aria-label="Back"
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
              backgroundColor: "transparent", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
            {view.kind === "categories"
              ? "FAQ"
              : view.kind === "questions"
              ? view.category.title
              : view.category.title}
          </div>
          <div style={{ fontSize: 12, color: "#D1FAE5" }}>
            {view.kind === "categories"
              ? "Quick answers to common questions"
              : view.kind === "questions"
              ? view.category.summary
              : "Answer"}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close FAQ"
          style={{
            width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
            backgroundColor: "transparent", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* BODY */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 14px 18px",
          backgroundColor: "#F8FAF7",
          color: DARK,
        }}
      >
        {view.kind === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQ_CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setView({ kind: "questions", category: c })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      backgroundColor: c.accent,
                      color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{c.summary}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {view.kind === "questions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {view.category.items.map((q, i) => (
              <button
                key={i}
                onClick={() => setView({ kind: "answer", category: view.category, item: q })}
                style={{
                  textAlign: "left",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: DARK,
                  lineHeight: 1.4,
                }}
              >
                {q.q}
              </button>
            ))}
          </div>
        )}

        {view.kind === "answer" && (
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: DARK,
                marginBottom: 10,
                lineHeight: 1.4,
              }}
            >
              {view.item.q}
            </div>
            <div
              style={{
                fontSize: 13.5,
                lineHeight: 1.55,
                color: "#374151",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: "12px 14px",
                whiteSpace: "pre-wrap",
              }}
            >
              {view.item.a}
            </div>
            <button
              onClick={() => setView({ kind: "questions", category: view.category })}
              style={{
                marginTop: 14,
                padding: "9px 14px",
                borderRadius: 999,
                border: `1px solid ${WA_HEADER}`,
                backgroundColor: "#fff",
                color: WA_HEADER,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ChevronLeft size={14} /> More questions
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — three-button floating action menu + panels
   --------------------------------------------------------------------------
   v13: replaces the single floating bubble with three peer buttons stacked
   bottom-right (WhatsApp · Call · FAQ). WhatsApp opens the existing chat
   thread. Call is a plain `tel:` link. FAQ opens the standalone FaqPanel.
   The three buttons hide while either panel is open so they don't compete.
   ══════════════════════════════════════════════════════════════════════════ */
export default function ChatWidget({
  department = "general",
  open: externalOpen,
  onClose,
  isDashboard: _isDashboard,
}: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const chatOpen = isControlled ? externalOpen : internalOpen;

  const [faqOpen, setFaqOpen] = useState(false);
  const [bubbleNotes, setBubbleNotes] = useState<string[]>([]);
  const [showBadge, setShowBadge] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeChat = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  const openChat = () => {
    setBubbleNotes([]);
    setShowBadge(false);
    setFaqOpen(false);
    setMenuOpen(false);
    if (!isControlled) setInternalOpen(true);
  };

  const openFaq = () => {
    setBubbleNotes([]);
    setShowBadge(false);
    setMenuOpen(false);
    if (!isControlled) setInternalOpen(false);
    else onClose?.();
    setFaqOpen(true);
  };

  /* ── Teaser bubbles above the action menu ──────────────────────────── */
  useEffect(() => {
    if (chatOpen || faqOpen || isControlled) return;
    const NOTES = [
      "Hi, welcome.",
      department === "bizdoc"
        ? "Tap WhatsApp to chat about compliance & tax"
        : department === "systemise"
        ? "Tap WhatsApp to chat about websites & systems"
        : department === "skills"
        ? "Tap WhatsApp to chat about our programs"
        : "Tap WhatsApp to chat with us",
    ];
    const t1 = window.setTimeout(() => setBubbleNotes([NOTES[0]]), 1800);
    const t2 = window.setTimeout(() => setBubbleNotes([NOTES[0], NOTES[1]]), 3200);
    const t3 = window.setTimeout(() => setBubbleNotes([]), 8000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [chatOpen, faqOpen, isControlled, department]);

  const anyPanelOpen = chatOpen || faqOpen;

  return (
    <>
      {chatOpen && <WhatsAppChatPanel department={department} onClose={closeChat} />}
      {faqOpen && <FaqPanel onClose={() => setFaqOpen(false)} />}

      {/* Teaser notifications above the action menu (only when nothing open) */}
      {!isControlled && !anyPanelOpen && bubbleNotes.length > 0 && (
        <div
          className="fixed right-4 z-[60] flex flex-col items-end gap-1.5"
          style={{ bottom: 220 }}
        >
          {bubbleNotes.map((note, i) => (
            <div
              key={i}
              onClick={openChat}
              className="px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg text-[13px] font-medium max-w-[220px] cursor-pointer"
              style={{ backgroundColor: WA_HEADER, color: "#fff" }}
            >
              {note}
            </div>
          ))}
        </div>
      )}

      {/* Speed-dial: ONE main bubble. Tap to reveal Call · WhatsApp · FAQ.
           Hidden while a panel is open. */}
      {!isControlled && !anyPanelOpen && (
        <div
          className="fixed bottom-4 right-4 z-[60] flex flex-col items-center gap-3"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Sub-buttons appear ABOVE main bubble when menuOpen */}
          {menuOpen && (
            <>
              {/* FAQ (top) */}
              <button
                onClick={openFaq}
                className="rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  width: 48, height: 48,
                  backgroundColor: WA_HEADER,
                  color: "#fff",
                }}
                aria-label="Open FAQ"
                title="Browse FAQ"
              >
                <HelpCircle size={20} />
              </button>

              {/* Call (middle) */}
              <a
                href={`tel:+${CSO_PHONE}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  width: 48, height: 48,
                  backgroundColor: "#1F2937",
                  color: "#fff",
                }}
                aria-label={`Call +${CSO_PHONE}`}
                title="Call us"
              >
                <Phone size={20} />
              </a>

              {/* WhatsApp (bottom of sub-stack — opens our embedded chat) */}
              <button
                data-chat-trigger
                onClick={openChat}
                className="rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                style={{
                  width: 48, height: 48,
                  backgroundColor: WA_BUBBLE,
                  color: "#fff",
                }}
                aria-label="Open chat"
                title="Chat with us"
              >
                <MessageCircle size={20} />
              </button>
            </>
          )}

          {/* Main bubble — tap to toggle menu */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
            style={{
              width: 56, height: 56,
              backgroundColor: menuOpen ? "#1F2937" : WA_BUBBLE,
              color: "#fff",
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            title={menuOpen ? "Close" : "Tap to chat"}
          >
            {menuOpen ? <X size={22} /> : <MessageCircle size={24} />}
            {!menuOpen && showBadge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
