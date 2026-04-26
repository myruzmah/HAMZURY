import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare, X, Phone, Star, ChevronRight, ChevronLeft, Search,
  BookOpen, CreditCard, Building2, Rocket, ShieldCheck, Clock, Users,
  Sparkles, ArrowRight, ExternalLink, HelpCircle, Code2, Megaphone,
  GraduationCap, Compass, Briefcase,
} from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════════════════════
   HAMZURY Chat — v11: COMMAND CENTER (multi-company cross-sell engine)
   --------------------------------------------------------------------------
   Replaces the v10 FAQ-only widget. The widget auto-detects which company's
   site it's running on (hamzury / bizdoc / scalar / medialy), shows that
   company's services, offers a free Business Checkup (Clarity Session) for
   visitors who aren't sure what they need, and softly cross-sells to the
   sister Hamzury company when an out-of-scope service is requested.

   States:
     • welcome    — company-specific greeting with primary CTAs
     • menu       — service catalog (filtered per company)
     • service    — service detail with WhatsApp + Diagnose actions
     • crosssell  — soft offer to send to sister company
     • diagnostic — launcher for /clarity-session (or department checkup)
     • faq        — preserved Help Centre (secondary mode)

   Existing flows are untouched: diagnostic forms still POST to
   trpc.diagnostics.submit, requirement forms remain at /requirements/<id>.
   No new server endpoints, no DB changes.
   ══════════════════════════════════════════════════════════════════════════ */

type Department = "general" | "bizdoc" | "systemise" | "skills";
type CompanyKey = "hamzury" | "bizdoc" | "scalar" | "medialy";

type Props = {
  department?: Department;
  open?: boolean;
  onClose?: () => void;
  isDashboard?: boolean;
};

/* ── Brand constants ───────────────────────────────────────────────────── */
const CHARCOAL = "#2D2D2D";
const GOLD     = "#B48C4C";
const CREAM    = "#FFFAF6";
const DARK     = "#1A1A1A";
const MUTED    = "#6B7280";
const HAIRLINE = "#E7E5E4";

const DEPT_BRAND: Record<Department, { header: string; accent: string; name: string }> = {
  general:   { header: "#1E3A8A", accent: "#C9A97E", name: "HAMZURY" },
  bizdoc:    { header: "#1B4D3E", accent: "#C9A97E", name: "Bizdoc" },
  systemise: { header: "#D4A017", accent: "#0F172A", name: "Scalar" },
  skills:    { header: "#1E3A5F", accent: "#B48C4C", name: "HUB" },
};

/* ── Contact (Brand Bible) ─────────────────────────────────────────────── */
// Single-source rule from the Command Center spec: ONE CSO line for all four
// companies. CSO is the only voice that contacts visitors, regardless of
// which company's site the lead came from.
const CSO_WHATSAPP = "2349130700056";
const CSO_PHONE    = "2349130700056";

/* ══════════════════════════════════════════════════════════════════════════
   COMPANY CONFIGURATION (Command Center spec, section 3)
   --------------------------------------------------------------------------
   Service IDs reference client/src/lib/requirement-forms.ts. The full
   24-service catalog lives in SERVICE_CATALOG below — companies just filter.
   Hypothetical sister sites (bizdoc.com / scalar.com / medialy.com) don't
   exist yet; the cross-sell links are placeholders, see CROSS_SELL_LINK.
   ══════════════════════════════════════════════════════════════════════════ */

type CompanyConfig = {
  name: string;
  tagline: string;
  greeting: string;
  accentColor: string;
  waNumber: string;
  /** "all" → 5-department menu (Hamzury hub). Otherwise a list of service ids. */
  services: "all" | RequirementId[];
  /** When true, the widget shows the cross-sell prompt for out-of-scope picks. */
  crossSellOffer: boolean;
  /** Map of department → sister company (for cross-sell routing). */
  sisterCompanies?: Partial<Record<Department2, CompanyKey>>;
  /** The "Take the diagnosis" route on this site. */
  diagnosticRoute: string;
  /** Diagnostic CTA copy. */
  diagnosticTitle: string;
  diagnosticBlurb: string;
};

type Department2 = "business" | "software" | "media" | "skills";

type RequirementId =
  | "cac" | "tin" | "licences" | "plan" | "trademark" | "compliance"
  | "website" | "crm" | "ai_integration" | "automation" | "ecommerce" | "software_mgmt"
  | "brand" | "social" | "podcast" | "content_strategy" | "video" | "media_mgmt"
  | "tech_training" | "ai_business" | "entrepreneurship" | "team_training" | "certification" | "skills_mgmt";

const COMPANIES: Record<CompanyKey, CompanyConfig> = {
  hamzury: {
    name: "Hamzury",
    tagline: "Everything you need to grow",
    greeting: "Welcome to Hamzury. What are you here for today?",
    accentColor: "#0A0A0A",
    waNumber: CSO_WHATSAPP,
    services: "all",
    crossSellOffer: false,
    diagnosticRoute: "/clarity-session",
    diagnosticTitle: "Business Checkup",
    diagnosticBlurb:
      "14 questions, ~12-15 minutes. We review your responses and reach out within 24 hours with a clear plan.",
  },
  bizdoc: {
    name: "Bizdoc",
    tagline: "Compliance & growth, sorted",
    greeting: "Welcome to Bizdoc. What do you need?",
    accentColor: "#1B4D3E",
    waNumber: CSO_WHATSAPP, // single-source CSO line
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
    greeting: "Welcome to Scalar. What can we build for you?",
    accentColor: "#1F6B5C",
    waNumber: CSO_WHATSAPP, // single-source CSO line
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
    greeting: "Welcome to Medialy. How can we help your brand?",
    accentColor: "#B8731F",
    waNumber: CSO_WHATSAPP, // single-source CSO line
    services: ["brand", "social", "podcast", "content_strategy", "video", "media_mgmt"],
    crossSellOffer: true,
    sisterCompanies: { business: "bizdoc", software: "scalar", skills: "hamzury" },
    diagnosticRoute: "/diagnose-media",
    diagnosticTitle: "Media Checkup",
    diagnosticBlurb:
      "A short diagnosis on your brand and presence. ~10 minutes — we reply within 24 hours.",
  },
};

/**
 * Hypothetical sister sites referenced in cross-sell prompts. Until those
 * sites exist (bizdoc.com, scalar.com, medialy.com), the cross-sell button
 * sends visitors to the relevant section of hamzury.com instead.
 */
const CROSS_SELL_LINK: Record<CompanyKey, string> = {
  hamzury: "https://www.hamzury.com",
  // TODO(domains): swap to https://bizdoc.com when that site exists.
  bizdoc:  "https://www.hamzury.com/bizdoc",
  // TODO(domains): swap to https://scalar.com when that site exists.
  scalar:  "https://www.hamzury.com/scalar",
  // TODO(domains): swap to https://medialy.com when that site exists.
  medialy: "https://www.hamzury.com/medialy",
};

/* ── Detect which company's site we're on ─────────────────────────────── */
function detectCompany(): CompanyKey {
  if (typeof window === "undefined") return "hamzury";
  const host = window.location.hostname.toLowerCase();
  if (host.includes("bizdoc")) return "bizdoc";
  if (host.includes("scalar")) return "scalar";
  if (host.includes("medialy")) return "medialy";
  return "hamzury";
}

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE CATALOG — sourced from client/src/lib/requirement-forms.ts.
   Names and blurbs match the requirement-form intro copy so the chat menu
   uses the same labels visitors see post-payment.
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

/** Hamzury hub uses the 5-department menu (4 service depts + Clarity). */
const DEPARTMENTS: { id: Department2; name: string; blurb: string; icon: React.ElementType; accent: string }[] = [
  { id: "business", name: "Business",  blurb: "Compliance, registration, growth (Bizdoc)",     icon: Briefcase,    accent: "#1B4D3E" },
  { id: "software", name: "Software",  blurb: "Websites, CRMs, automation (Scalar)",          icon: Code2,         accent: "#1F6B5C" },
  { id: "media",    name: "Media",     blurb: "Brand, content, social (Medialy)",             icon: Megaphone,     accent: "#B8731F" },
  { id: "skills",   name: "Skills",    blurb: "Training & certification (HUB)",               icon: GraduationCap, accent: "#1E3A5F" },
];

const DEPT_LABEL: Record<Department2, string> = {
  business: "Business",
  software: "Software",
  media:    "Media",
  skills:   "Skills",
};

/** Map the routing prop's department to the spec's CompanyKey. */
function deptToCompanyKey(dept: Department): CompanyKey {
  if (dept === "bizdoc") return "bizdoc";
  if (dept === "systemise") return "scalar";
  // "general" + "skills" → hamzury hub experience.
  return "hamzury";
}

/* ══════════════════════════════════════════════════════════════════════════
   FAQ CONTENT (preserved from v10 — secondary mode)
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
      { q: "What does Scalar build?", a: "Scalar is our web + automation division. We build professional websites, client dashboards, CRMs, WhatsApp integrations, and AI agents. Simply: websites that work, systems that scale." },
      { q: "What does Medialy manage?", a: "Medialy is our social media division. We run Instagram, TikTok, Facebook, LinkedIn — content calendars, posting, growth, and ads. Social media that actually brings clients." },
      { q: "What does HUB teach?", a: "HUB is our tech-skills training wing. We teach Code Craft, Digital Literacy, AI for Founders, Basic Computer Skills (for kids and adults), and RIDI sponsored cohorts. Tech skills that get you paid." },
      { q: "Do you work with businesses outside Nigeria?", a: "Yes. Bizdoc handles foreign business setup and Nigerian-registration for diaspora founders. Scalar and Medialy serve clients in any timezone. Send us a WhatsApp message and the CSO team will tell you how we'd structure it." },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Packages",
    summary: "How each division's packages are priced",
    icon: CreditCard,
    accent: "#D4A017",
    items: [
      { q: "How much does Bizdoc charge?", a: "Four tiers: Starter (₦200,000 — CAC Ltd + EFCC + Tax ProMax), Growth (₦450,000 — + Branding + Business Plan), Pro (₦570,000 — + 1 yr Tax Management + Contracts), Enterprise (₦1,000,000 — + ITF/NSITF/PENCOM/BPP). Individual services also available from ₦30,000." },
      { q: "How much does Scalar charge?", a: "Presence ₦300,000 (website), Growth ₦500,000 (website + lead capture), Automate ₦1,000,000 (website + CRM + automations — our most popular), Platform ₦2,000,000 (custom dashboards + AI)." },
      { q: "How much does Medialy charge?", a: "Setup ₦50,000 (one-time profile setup), Manage ₦150,000/month, Accelerate ₦300,000/month (our most popular — content + ads), Authority ₦500,000/month (full brand presence)." },
      { q: "How much does HUB charge?", a: "Single courses ₦25,000 – ₦100,000 depending on length. Full certifications ₦200,000 – ₦400,000. Team training for organisations from ₦500,000. RIDI cohort is sponsored (free for selected applicants)." },
      { q: "Do you offer discounts?", a: "We don't discount below listed prices. If your budget is tight, we'll usually recommend a smaller package or a payment plan rather than cut quality. Talk to us on WhatsApp and we'll show you the closest fit." },
      { q: "Can I pay in instalments?", a: "Yes, for packages ₦300,000 and up. Typical split: 50% to start, 50% before delivery. For ongoing services (Medialy monthly, Bizdoc compliance), we bill at the start of each cycle. WhatsApp the CSO team to set up a plan." },
    ],
  },
  {
    id: "start",
    title: "Getting Started",
    summary: "What happens after you reach out",
    icon: Rocket,
    accent: "#1D4ED8",
    items: [
      { q: "How do I actually start?", a: "Tap the WhatsApp button at the bottom of this page. You'll reach our CSO Lead Handler within 2 hours. They'll ask 3 short questions (what service, timeline, budget range), then route you to the right Closer — either a direct proposal or a short diagnosis form." },
      { q: "What information will you ask me for?", a: "At first contact: your name, the service you need, your timeline, and a rough budget. That's it. If the project is complex, we send a short form to get the detail we need before quoting. We never ask for payment details in chat." },
      { q: "How fast do you respond?", a: "Lead Handler acknowledges within 2 hours. Closer contacts you within 24 hours. Strategy PDFs (for complex projects) are back within 24 hours of you completing the diagnosis form. All locked into our CSO flow." },
      { q: "Do I need to prepare anything before we talk?", a: "Not really. A rough idea of what you want and when you want it live is enough. If you have a reference site you like, a logo, or documents (like CAC certificate for existing companies), have them on hand — but we can start without them." },
      { q: "Can we meet in person?", a: "Yes — we're in Kano. Book a visit through the CSO team on WhatsApp. Most clients don't need an in-person meeting; WhatsApp + one short call usually covers it." },
    ],
  },
  {
    id: "payment",
    title: "Payment & Invoices",
    summary: "How billing works",
    icon: ShieldCheck,
    accent: "#1E3A5F",
    items: [
      { q: "How do I pay?", a: "By bank transfer to our company account. The CSO team sends you an invoice with the exact account number and reference code (format: HMZ-INV-XXX). Never send money to a personal account — every legitimate invoice uses the company account on the invoice document." },
      { q: "Do you accept card or crypto?", a: "Bank transfer is primary. For international clients we can accept USD wire or Wise transfer by arrangement. We don't accept crypto at the moment." },
      { q: "What's your refund policy?", a: "Work not started: full refund. Work started: pro-rated refund based on hours logged. We want you happy — if something's wrong, tell the Closer first and we'll usually fix it rather than refund. Refunds are escalated to the founder for approval." },
      { q: "Can you send a receipt?", a: "Yes — once payment clears, the Coordinator sends an official receipt by email and WhatsApp within the same day, plus a formal Tax Invoice if your business needs it for accounting." },
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
      { q: "Am I owing tax penalties?", a: "Possibly — any Nigerian business that's missed filing dates may have late-filing penalties. Bizdoc runs a free compliance check: we look up your CAC / TIN status and tell you exactly what's outstanding. WhatsApp us your company name and we'll come back within 24 hours with the full picture." },
      { q: "I haven't filed annual returns in years. Is it too late?", a: "No. Bizdoc regularly clears 5 – 10 years of missed returns in one batch filing. Penalties apply, but they cap — and your company stays active. Send your CAC number to our WhatsApp; we'll quote the exact back-filing cost." },
      { q: "Do I need SCUML?", a: "Only if your business is in a regulated category (property, jewellery, precious-metals, car dealership, legal practice, accounting, etc.) or you deal with cash over regulatory thresholds. Bizdoc will tell you whether you need it before you pay for it." },
      { q: "What is Tax ProMax?", a: "Tax ProMax is our annual tax-management service — ₦150,000/year. We file all your monthly, quarterly, and annual returns on time, liaise with FIRS on your behalf, and make sure you never miss a deadline. Included in the Pro and Enterprise packages." },
      { q: "How long does CAC registration take?", a: "Business Name: 5 – 7 working days. Limited Company: 10 – 14 working days. Name reservation is usually 48 hours. We submit digitally the same day you pay and the name is approved." },
    ],
  },
  {
    id: "timelines",
    title: "Timelines & Delivery",
    summary: "How long things take",
    icon: Clock,
    accent: "#B48C4C",
    items: [
      { q: "How long does a Scalar website take?", a: "Presence package: 7 – 10 working days. Growth: 2 – 3 weeks. Automate: 4 – 6 weeks (because of CRM + automations). Platform: 6 – 10 weeks depending on complexity. We agree the exact schedule at proposal stage." },
      { q: "How fast can Medialy go live?", a: "Setup completes in 5 working days (profile tuning + content plan). Content goes live from week 2. First measurable growth appears by week 6 with consistent posting." },
      { q: "Can you rush it?", a: "Sometimes, yes — priority delivery available on most services for a 30% rush fee. Ask the CSO team when you brief the project; we'll tell you honestly whether the rush is possible before you pay extra." },
      { q: "What if you're late?", a: "If we miss a committed delivery date, the Coordinator notifies you before the date, not after. We propose a new timeline and usually add a small bonus (extra pages, extra posts, extra training hour) to keep the trust. We don't go dark." },
      { q: "What happens after delivery?", a: "Scalar: 30 days of free tweaks after go-live, then paid support packages. Bizdoc: ongoing Compliance Management subscription (₦50,000/mo) keeps you covered. Medialy: service is monthly — you can pause any month with 30 days notice. HUB: lifetime access to course materials." },
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
      { q: "Who founded HAMZURY?", a: "Muhammad Hamzury — founder and primary architect of the firm's operations. He leads product decisions, Founder Roadmap content, and final approvals on custom work. You don't normally deal with him directly; the Closer handles your project and escalates only if needed." },
      { q: "Who will I actually work with?", a: "Lead Handler (first contact, adds you to tracking) → Closer (your assigned advisor, owns your project end-to-end) → Division lead (Abdullahi for Bizdoc, Dajot for Scalar, Hikma for Medialy, Idris for HUB). Every handoff is logged so nothing drops." },
      { q: "How secure is my information?", a: "We keep client files in a locked cloud workspace. We never share invoices, contracts, or business documents with third parties without written approval. Staff sign an NDA before joining. Internal chats referring to your project use only your HMZ reference code — never public names." },
      { q: "Do you have case studies?", a: "Yes — examples include Tilz Spa, Tel Tel Drugstores, Jeff Optimum, and others. Ask the CSO team on WhatsApp for the specific case study that matches your industry and we'll send the PDF." },
    ],
  },
];

/* ── WhatsApp link helpers ─────────────────────────────────────────────── */
function whatsappLink(message: string): string {
  return `https://wa.me/${CSO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

const WA_COLD_OPEN = "Hello HAMZURY — I'd like to talk. Please help.";

function waAfterFaq(category: string, question: string): string {
  return (
    `Hello HAMZURY — I just read your FAQ about "${question}" (${category}). ` +
    `I'd like to talk to a human about this.`
  );
}

function waForService(companyName: string, serviceName: string): string {
  return `Hi ${companyName} — I'm interested in ${serviceName}. Can someone walk me through it?`;
}

/* ══════════════════════════════════════════════════════════════════════════
   COMMAND CENTER PANEL
   ══════════════════════════════════════════════════════════════════════════ */

type View =
  | { kind: "welcome" }
  | { kind: "menu"; deptFilter?: Department2 }
  | { kind: "service"; serviceId: RequirementId }
  | { kind: "crosssell"; deptRequested: Department2; targetCompany: CompanyKey }
  | { kind: "diagnostic" }
  | { kind: "faq" };

function CommandCenterPanel({
  department,
  onClose,
}: {
  department: Department;
  onClose: () => void;
}) {
  // Derive which company config to use. Auto-detect by hostname first; if the
  // route prop strongly indicates a division (bizdoc/systemise), prefer that
  // — handy in dev where the hostname is localhost but a division portal is
  // open.
  const companyKey: CompanyKey = useMemo(() => {
    const detected = detectCompany();
    if (detected !== "hamzury") return detected;
    return deptToCompanyKey(department);
  }, [department]);

  const company = COMPANIES[companyKey];
  const brand = DEPT_BRAND[department];
  const headerColor = brand.header;
  const accentColor = brand.accent;

  const [view, setView] = useState<View>({ kind: "welcome" });

  // FAQ-mode state (preserved from v10)
  const [faqCategoryId, setFaqCategoryId] = useState<string | null>(null);
  const [faqOpenQ, setFaqOpenQ] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState("");

  /* ── Title resolver ─────────────────────────────────────────────────── */
  const headerTitle = (() => {
    switch (view.kind) {
      case "welcome":    return company.name;
      case "menu":       return view.deptFilter ? DEPT_LABEL[view.deptFilter] : "Our services";
      case "service": {
        const s = SERVICE_CATALOG.find((x) => x.id === view.serviceId);
        return s?.name ?? "Service";
      }
      case "crosssell":  return "One moment…";
      case "diagnostic": return company.diagnosticTitle;
      case "faq":        return faqSearch ? `Results for "${faqSearch}"` : (FAQ_CATEGORIES.find((c) => c.id === faqCategoryId)?.title ?? "Help Centre");
    }
  })();

  const canGoBack = view.kind !== "welcome" || faqCategoryId || faqSearch;

  const goBack = () => {
    if (view.kind === "faq") {
      if (faqSearch) { setFaqSearch(""); return; }
      if (faqCategoryId) { setFaqCategoryId(null); setFaqOpenQ(null); return; }
      setView({ kind: "welcome" });
      return;
    }
    if (view.kind === "menu" && view.deptFilter) {
      // Drill back to the 5-department menu on Hamzury hub.
      setView({ kind: "menu" });
      return;
    }
    if (view.kind === "service") {
      // Return to the menu (preserve dept filter if we had one).
      const svc = SERVICE_CATALOG.find((s) => s.id === view.serviceId);
      if (company.services === "all" && svc) {
        setView({ kind: "menu", deptFilter: svc.department });
      } else {
        setView({ kind: "menu" });
      }
      return;
    }
    setView({ kind: "welcome" });
  };

  /* ── Resolve the visible service list per company ───────────────────── */
  const visibleServices: Service[] = useMemo(() => {
    if (company.services === "all") {
      if (view.kind === "menu" && view.deptFilter) {
        return SERVICE_CATALOG.filter((s) => s.department === view.deptFilter);
      }
      return SERVICE_CATALOG;
    }
    const allowed = new Set(company.services);
    return SERVICE_CATALOG.filter((s) => allowed.has(s.id));
  }, [company.services, view]);

  return (
    <div
      className="fixed z-[70] flex flex-col"
      style={{
        bottom: 16, right: 16,
        width: "min(380px, calc(100vw - 32px))",
        height: "min(640px, calc(100vh - 32px))",
        backgroundColor: CREAM,
        borderRadius: 18,
        boxShadow: "0 20px 48px rgba(0,0,0,0.22)",
        overflow: "hidden",
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: headerColor,
          color: accentColor,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {canGoBack && (
            <button
              onClick={goBack}
              aria-label="Back"
              style={{
                width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.12)", color: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", opacity: 0.85, textTransform: "uppercase", fontWeight: 600 }}>
              {company.name} {view.kind === "faq" ? "· Help Centre" : "· Command Centre"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {headerTitle}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer",
            backgroundColor: "rgba(255,255,255,0.12)", color: accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 16px" }}>
        {view.kind === "welcome" && (
          <WelcomeView
            company={company}
            companyKey={companyKey}
            onPickServices={() => setView({ kind: "menu" })}
            onPickDiagnostic={() => setView({ kind: "diagnostic" })}
            onPickFAQ={() => { setFaqCategoryId(null); setFaqOpenQ(null); setFaqSearch(""); setView({ kind: "faq" }); }}
          />
        )}

        {view.kind === "menu" && (
          <MenuView
            company={company}
            companyKey={companyKey}
            services={visibleServices}
            deptFilter={view.deptFilter}
            onPickService={(id) => setView({ kind: "service", serviceId: id })}
            onPickDept={(d) => setView({ kind: "menu", deptFilter: d })}
            onPickDiagnostic={() => setView({ kind: "diagnostic" })}
            onCrossSell={(deptRequested, target) =>
              setView({ kind: "crosssell", deptRequested, targetCompany: target })
            }
          />
        )}

        {view.kind === "service" && (
          <ServiceDetailView
            companyName={company.name}
            service={SERVICE_CATALOG.find((s) => s.id === view.serviceId)!}
            diagnosticRoute={company.diagnosticRoute}
          />
        )}

        {view.kind === "crosssell" && (
          <CrossSellView
            currentCompany={company.name}
            target={COMPANIES[view.targetCompany]}
            targetKey={view.targetCompany}
            onTakeCheckup={() => setView({ kind: "diagnostic" })}
            onBack={() => setView({ kind: "menu" })}
          />
        )}

        {view.kind === "diagnostic" && (
          <DiagnosticView company={company} />
        )}

        {view.kind === "faq" && (
          <FAQView
            categoryId={faqCategoryId}
            setCategoryId={setFaqCategoryId}
            openQ={faqOpenQ}
            setOpenQ={setFaqOpenQ}
            search={faqSearch}
            setSearch={setFaqSearch}
          />
        )}
      </div>

      {/* Footer: human escape hatch — always one tap away */}
      <div
        style={{
          borderTop: `1px solid ${HAIRLINE}`,
          padding: "10px 14px",
          backgroundColor: "#fff",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: MUTED, flex: 1 }}>
          Need a human? CSO replies on WhatsApp within 2 hours.
        </span>
        <a
          href={whatsappLink(WA_COLD_OPEN)}
          target="_blank" rel="noreferrer"
          style={{
            fontSize: 11, fontWeight: 600,
            padding: "6px 12px", borderRadius: 999,
            color: "#fff", backgroundColor: "#25D366",
            textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW: Welcome
   ══════════════════════════════════════════════════════════════════════════ */
function WelcomeView({
  company,
  companyKey,
  onPickServices,
  onPickDiagnostic,
  onPickFAQ,
}: {
  company: CompanyConfig;
  companyKey: CompanyKey;
  onPickServices: () => void;
  onPickDiagnostic: () => void;
  onPickFAQ: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 14,
          padding: "16px 14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Sparkles size={14} color={company.accentColor} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: company.accentColor }}>
            {company.tagline}
          </span>
        </div>
        <p style={{ fontSize: 14, color: DARK, lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
          {company.greeting}
        </p>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: "8px 0 0" }}>
          Pick a path below — or take the free checkup if you're not sure yet.
        </p>
      </div>

      <BigButton
        icon={<Compass size={18} />}
        label={companyKey === "hamzury" ? "Browse our services" : `${company.name}'s services`}
        sublabel={companyKey === "hamzury" ? "5 departments — pick one" : `${(company.services as RequirementId[]).length} services on offer`}
        onClick={onPickServices}
        primary
      />

      <BigButton
        icon={<HelpCircle size={18} />}
        label="I'm not sure what I need"
        sublabel={`Free ${company.diagnosticTitle} — we'll figure it out together`}
        onClick={onPickDiagnostic}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <a
          href={whatsappLink(WA_COLD_OPEN)}
          target="_blank" rel="noreferrer"
          style={ghostBtn()}
        >
          <Phone size={14} /> Request a call
        </a>
        <button onClick={onPickFAQ} style={ghostBtn()}>
          <BookOpen size={14} /> Browse FAQ
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW: Menu — services list (filtered per company), w/ cross-sell triggers
   ══════════════════════════════════════════════════════════════════════════ */
function MenuView({
  company,
  companyKey,
  services,
  deptFilter,
  onPickService,
  onPickDept,
  onPickDiagnostic,
  onCrossSell,
}: {
  company: CompanyConfig;
  companyKey: CompanyKey;
  services: Service[];
  deptFilter: Department2 | undefined;
  onPickService: (id: RequirementId) => void;
  onPickDept: (d: Department2) => void;
  onPickDiagnostic: () => void;
  onCrossSell: (dept: Department2, target: CompanyKey) => void;
}) {
  const isHamzuryHub = company.services === "all";

  // Hamzury hub (top-level) shows departments first, then drills into 6 services.
  if (isHamzuryHub && !deptFilter) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>
          Pick the department closest to what you need.
        </p>
        {DEPARTMENTS.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              onClick={() => onPickDept(d.id)}
              style={menuRow()}
            >
              <span style={iconBubble(d.accent)}>
                <Icon size={16} />
              </span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{d.name}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{d.blurb}</div>
              </div>
              <ChevronRight size={16} color={MUTED} />
            </button>
          );
        })}
        <button onClick={onPickDiagnostic} style={menuRow()}>
          <span style={iconBubble("#1E3A8A")}>
            <HelpCircle size={16} />
          </span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>Clarity Session</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>I'm not sure what I need yet</div>
          </div>
          <ChevronRight size={16} color={MUTED} />
        </button>
      </div>
    );
  }

  // Service list — used by all 4 companies (and the hub's department drill-down).
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>
        {deptFilter ? `Pick a ${DEPT_LABEL[deptFilter].toLowerCase()} service.` : "Pick a service to learn more."}
      </p>
      {services.map((s) => (
        <button
          key={s.id}
          onClick={() => onPickService(s.id)}
          style={menuRow()}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{s.name}</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{s.blurb}</div>
          </div>
          <ChevronRight size={16} color={MUTED} />
        </button>
      ))}

      {/* Cross-sell prompts — only on division sites that have crossSellOffer = true */}
      {company.crossSellOffer && company.sisterCompanies && (
        <div style={{ borderTop: `1px solid ${HAIRLINE}`, marginTop: 4, paddingTop: 12 }}>
          <p style={{ fontSize: 11, color: MUTED, margin: "0 0 8px", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
            Also under the Hamzury family
          </p>
          {(Object.entries(company.sisterCompanies) as [Department2, CompanyKey][]).map(([dept, target]) => (
            <button
              key={dept}
              onClick={() => onCrossSell(dept, target)}
              style={{ ...menuRow(), opacity: 0.92 }}
            >
              <span style={iconBubble(COMPANIES[target].accentColor)}>
                {dept === "software" ? <Code2 size={14} /> :
                 dept === "media" ? <Megaphone size={14} /> :
                 dept === "skills" ? <GraduationCap size={14} /> : <Briefcase size={14} />}
              </span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{DEPT_LABEL[dept]} ({COMPANIES[target].name})</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>That's our sister company's territory</div>
              </div>
              <ChevronRight size={16} color={MUTED} />
            </button>
          ))}
        </div>
      )}

      {/* "I'm not sure" ALWAYS available */}
      <button onClick={onPickDiagnostic} style={{ ...menuRow(), backgroundColor: "#FFFCF5", borderColor: company.accentColor }}>
        <span style={iconBubble(company.accentColor)}>
          <HelpCircle size={16} />
        </span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>I'm not sure what I need</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Take the free {company.diagnosticTitle}</div>
        </div>
        <ChevronRight size={16} color={MUTED} />
      </button>

      {/* Suppress the unused-var lint on companyKey while still allowing future use */}
      <span style={{ display: "none" }}>{companyKey}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW: Service detail
   ══════════════════════════════════════════════════════════════════════════ */
function ServiceDetailView({
  companyName,
  service,
  diagnosticRoute,
}: {
  companyName: string;
  service: Service;
  diagnosticRoute: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: GOLD, textTransform: "uppercase", marginBottom: 4 }}>
          {DEPT_LABEL[service.department]}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 6px" }}>
          {service.name}
        </h3>
        <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: 0 }}>
          {service.blurb}
        </p>
      </div>

      <a
        href={whatsappLink(waForService(companyName, service.name))}
        target="_blank" rel="noreferrer"
        style={primaryBtn("#25D366")}
      >
        <MessageSquare size={15} /> Talk to us on WhatsApp
      </a>

      <a
        href={diagnosticRoute === "/clarity-session" ? "/clarity-session" : service.diagnosticRoute}
        target="_blank" rel="noreferrer"
        style={primaryBtn(DARK)}
      >
        <Compass size={15} /> Take the diagnosis <ArrowRight size={14} />
      </a>

      <div
        style={{
          fontSize: 11,
          color: MUTED,
          padding: "10px 12px",
          backgroundColor: "#FFFCF5",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 10,
          lineHeight: 1.5,
        }}
      >
        Pay & start kicks off the formal requirement form once your invoice is settled.
        Contact CSO on WhatsApp for the invoice and account details.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW: Cross-sell
   ══════════════════════════════════════════════════════════════════════════ */
function CrossSellView({
  currentCompany,
  target,
  targetKey,
  onTakeCheckup,
  onBack,
}: {
  currentCompany: string;
  target: CompanyConfig;
  targetKey: CompanyKey;
  onTakeCheckup: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Sparkles size={14} color={target.accentColor} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: target.accentColor, textTransform: "uppercase" }}>
            Sister company
          </span>
        </div>
        <p style={{ fontSize: 14, color: DARK, fontWeight: 600, margin: "0 0 6px", lineHeight: 1.5 }}>
          We're {currentCompany}. That's {target.name}'s territory.
        </p>
        <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: 0 }}>
          {target.tagline}. We can hand you over so you don't lose context — or, if you'd rather sort everything in one go, take the Business Checkup.
        </p>
      </div>

      <a
        href={CROSS_SELL_LINK[targetKey]}
        target="_blank" rel="noreferrer"
        style={primaryBtn(target.accentColor)}
      >
        <ExternalLink size={15} /> Send me to {target.name}
      </a>

      <button onClick={onTakeCheckup} style={primaryBtn(DARK)}>
        <HelpCircle size={15} /> Take the Business Checkup instead
      </button>

      <button onClick={onBack} style={ghostBtn()}>
        <ChevronLeft size={14} /> Just back to {currentCompany}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW: Diagnostic launcher
   ══════════════════════════════════════════════════════════════════════════ */
function DiagnosticView({ company }: { company: CompanyConfig }) {
  const handleLaunch = () => {
    toast.success(`Opening the ${company.diagnosticTitle}`, {
      description: "We review every submission and reach out within 24 hours.",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: company.accentColor, textTransform: "uppercase", marginBottom: 4 }}>
          Free
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 6px" }}>
          {company.diagnosticTitle}
        </h3>
        <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: 0 }}>
          {company.diagnosticBlurb}
        </p>
      </div>

      <a
        href={company.diagnosticRoute}
        target="_blank" rel="noreferrer"
        onClick={handleLaunch}
        style={primaryBtn(DARK)}
      >
        <Compass size={15} /> Start now <ArrowRight size={14} />
      </a>

      <div
        style={{
          fontSize: 11,
          color: MUTED,
          padding: "10px 12px",
          backgroundColor: "#FFFCF5",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 10,
          lineHeight: 1.5,
        }}
      >
        Opens in a new tab. Your answers are reviewed by CSO — one consultative
        conversation that covers everything you need, even if multiple Hamzury
        teams are involved.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   VIEW: FAQ (preserved from v10)
   ══════════════════════════════════════════════════════════════════════════ */
function FAQView({
  categoryId,
  setCategoryId,
  openQ,
  setOpenQ,
  search,
  setSearch,
}: {
  categoryId: string | null;
  setCategoryId: (id: string | null) => void;
  openQ: number | null;
  setOpenQ: (n: number | null) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const currentCat = useMemo(
    () => FAQ_CATEGORIES.find((c) => c.id === categoryId) || null,
    [categoryId]
  );

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const hits: { category: FAQCategory; item: FAQ }[] = [];
    for (const cat of FAQ_CATEGORIES) {
      for (const it of cat.items) {
        if (it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)) {
          hits.push({ category: cat, item: it });
        }
      }
    }
    return hits.slice(0, 8);
  }, [search]);

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            backgroundColor: "#fff",
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 10, padding: "8px 12px",
          }}
        >
          <Search size={14} color={MUTED} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCategoryId(null); setOpenQ(null); }}
            placeholder="Search the FAQ…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 13, background: "transparent", color: DARK,
            }}
          />
        </div>
      </div>

      {search ? (
        searchHits.length === 0 ? (
          <EmptySearch query={search} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {searchHits.map((h, i) => (
              <AnswerCard key={`${h.category.id}-${i}`} category={h.category} item={h.item} />
            ))}
          </div>
        )
      ) : currentCat ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 4 }}>{currentCat.summary}</p>
          {currentCat.items.map((it, i) => {
            const isOpen = openQ === i;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: "#fff",
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenQ(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 10,
                    padding: "12px 14px",
                    border: "none", cursor: "pointer", textAlign: "left",
                    backgroundColor: "transparent",
                    color: DARK, fontSize: 13, fontWeight: 600,
                  }}
                >
                  <span>{it.q}</span>
                  <ChevronRight
                    size={15}
                    color={MUTED}
                    style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
                  />
                </button>
                {isOpen && (
                  <div style={{ padding: "0 14px 14px" }}>
                    <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: "0 0 12px" }}>
                      {it.a}
                    </p>
                    <DeflectRow category={currentCat.title} question={it.q} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <CategoryGrid onPick={(id) => { setCategoryId(id); setOpenQ(null); }} />
      )}
    </>
  );
}

function CategoryGrid({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {FAQ_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            onClick={() => onPick(cat.id)}
            style={{
              backgroundColor: "#fff",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 12,
              padding: "14px 12px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <span
              style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: `${cat.accent}18`, color: cat.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Icon size={16} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK, lineHeight: 1.2 }}>{cat.title}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.3 }}>{cat.summary}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AnswerCard({ category, item }: { category: FAQCategory; item: FAQ }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 10,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 10, color: category.accent, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>
        {category.title}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 6 }}>{item.q}</div>
      <p style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.55, margin: "0 0 10px" }}>{item.a}</p>
      <DeflectRow category={category.title} question={item.q} />
    </div>
  );
}

function DeflectRow({ category, question }: { category: string; question: string }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <a
        href={whatsappLink(waAfterFaq(category, question))}
        target="_blank" rel="noreferrer"
        style={{
          fontSize: 11, fontWeight: 600,
          padding: "6px 12px", borderRadius: 999,
          color: "#fff", backgroundColor: "#25D366",
          textDecoration: "none",
        }}
      >
        Still need help? WhatsApp us
      </a>
      <a
        href={`tel:+${CSO_PHONE}`}
        style={{
          fontSize: 11, fontWeight: 600,
          padding: "6px 12px", borderRadius: 999,
          color: DARK, backgroundColor: "#F3F4F6",
          textDecoration: "none",
        }}
      >
        Call
      </a>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div
      style={{
        padding: "24px 16px",
        backgroundColor: "#fff",
        border: `1px solid ${HAIRLINE}`,
        borderRadius: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: DARK, marginBottom: 4 }}>
        No FAQ match for "{query}"
      </div>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
        Your question is better answered by a human. Tap below — our CSO Lead
        Handler replies within 2 hours.
      </p>
      <a
        href={whatsappLink(`Hello HAMZURY — I have a question about: ${query}`)}
        target="_blank" rel="noreferrer"
        style={{
          display: "inline-block",
          fontSize: 12, fontWeight: 600,
          padding: "8px 16px", borderRadius: 999,
          color: "#fff", backgroundColor: "#25D366",
          textDecoration: "none",
        }}
      >
        Ask on WhatsApp
      </a>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Reusable inline-style helpers
   ══════════════════════════════════════════════════════════════════════════ */
function menuRow(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 12,
    padding: "12px 14px",
    width: "100%",
    cursor: "pointer",
    color: DARK,
    transition: "transform 0.15s, box-shadow 0.15s",
  };
}

function iconBubble(color: string): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: `${color}18`, color,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  };
}

function primaryBtn(bg: string): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "12px 14px",
    fontSize: 13, fontWeight: 600,
    color: "#fff", backgroundColor: bg,
    border: "none", borderRadius: 12,
    cursor: "pointer", textDecoration: "none",
  };
}

function ghostBtn(): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    flex: 1,
    padding: "10px 12px",
    fontSize: 12, fontWeight: 600,
    color: DARK, backgroundColor: "#F3F4F6",
    border: "none", borderRadius: 999,
    cursor: "pointer", textDecoration: "none",
  };
}

function BigButton({
  icon,
  label,
  sublabel,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 14px",
        backgroundColor: primary ? DARK : "#fff",
        color: primary ? "#fff" : DARK,
        border: `1px solid ${primary ? DARK : HAIRLINE}`,
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span
        style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: primary ? "rgba(255,255,255,0.12)" : `${GOLD}18`,
          color: primary ? "#fff" : GOLD,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{label}</span>
        {sublabel && (
          <span style={{ display: "block", fontSize: 11, opacity: primary ? 0.85 : 0.7, marginTop: 2 }}>
            {sublabel}
          </span>
        )}
      </span>
      <ArrowRight size={16} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — floating contact stack (preserved layout from v10)
   ══════════════════════════════════════════════════════════════════════════ */
export default function ChatWidget({
  department = "general",
  open: externalOpen,
  onClose,
  isDashboard: _isDashboard,
}: Props) {
  const isControlled = externalOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? externalOpen : internalOpen;

  const close = () => {
    if (isControlled) onClose?.();
    else setInternalOpen(false);
  };

  /* ── Bubble notifications (teaser messages above bubble) ─────────────── */
  const [bubbleNotes, setBubbleNotes] = useState<string[]>([]);
  useEffect(() => {
    if (isOpen || isControlled) return;
    const NOTES = [
      "Hi! 👋 What are you here for?",
      department === "bizdoc"
        ? "Tap for compliance & tax"
        : department === "systemise"
        ? "Tap for websites & systems"
        : department === "skills"
        ? "Tap for our programs"
        : "Tap for our services",
    ];
    const t1 = setTimeout(() => setBubbleNotes([NOTES[0]]), 1800);
    const t2 = setTimeout(() => setBubbleNotes([NOTES[0], NOTES[1]]), 3200);
    const t3 = setTimeout(() => setBubbleNotes([]), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isOpen, isControlled, department]);

  /* ── Contact menu + rating ───────────────────────────────────────────── */
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [showBadge, setShowBadge] = useState(true);

  const brand = DEPT_BRAND[department];

  return (
    <>
      {isOpen && <CommandCenterPanel department={department} onClose={close} />}

      {/* Teaser notifications */}
      {!isControlled && !isOpen && bubbleNotes.length > 0 && (
        <div className="fixed bottom-[88px] right-4 z-[60] flex flex-col items-end gap-1.5">
          {bubbleNotes.map((note, i) => (
            <div
              key={i}
              onClick={() => { setBubbleNotes([]); setShowBadge(false); setContactMenuOpen(true); }}
              className="px-4 py-2.5 rounded-2xl rounded-br-sm shadow-lg text-[13px] font-medium max-w-[220px] cursor-pointer"
              style={{ backgroundColor: brand.header, color: "#fff" }}
            >
              {note}
            </div>
          ))}
        </div>
      )}

      {/* Floating contact stack — only when widget is uncontrolled */}
      {!isControlled && (
        <>
          {/* Expanded 3-option menu */}
          {contactMenuOpen && !isOpen && (
            <div className="fixed bottom-[84px] right-4 z-[60] flex flex-col items-end gap-2.5">
              {/* WhatsApp — direct line to CSO */}
              <a
                href={whatsappLink(WA_COLD_OPEN)}
                target="_blank" rel="noreferrer"
                onClick={() => setContactMenuOpen(false)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#25D366", color: "#FFFFFF" }}
                title="WhatsApp us"
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.03 0C5.5 0 .2 5.3.2 11.82c0 2.08.55 4.11 1.58 5.9L0 24l6.44-1.69a11.8 11.8 0 0 0 5.59 1.42h.01c6.52 0 11.83-5.3 11.83-11.82 0-3.16-1.23-6.13-3.35-8.43Zm-8.49 18.2h-.01a9.76 9.76 0 0 1-4.97-1.36l-.36-.21-3.82 1 1.02-3.72-.23-.38a9.77 9.77 0 0 1-1.5-5.19c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.02 6.93 2.87a9.75 9.75 0 0 1 2.87 6.94c0 5.4-4.4 9.85-9.74 9.85Zm5.38-7.36c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.67.15-.2.29-.77.96-.95 1.16-.17.2-.35.22-.64.07-.29-.15-1.23-.45-2.35-1.45a8.8 8.8 0 0 1-1.63-2.02c-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.14-.17.19-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.09 4.49.71.3 1.27.48 1.7.62.72.23 1.37.2 1.89.12.58-.09 1.77-.73 2.02-1.43.25-.7.25-1.3.17-1.43-.07-.13-.27-.2-.56-.35Z"/>
                  </svg>
                </span>
                <span className="text-[12px] font-medium">WhatsApp</span>
              </a>
              {/* Call */}
              <a
                href={`tel:+${CSO_PHONE}`}
                onClick={() => setContactMenuOpen(false)}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: "#1F2937", color: "#FFFFFF" }}
                title="Call us"
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <Phone size={13} strokeWidth={2.2} />
                </span>
                <span className="text-[12px] font-medium">Call</span>
              </a>
              {/* Chat = Command Centre */}
              <button
                data-chat-trigger
                onClick={() => {
                  setContactMenuOpen(false);
                  setBubbleNotes([]);
                  setInternalOpen(true);
                  setShowBadge(false);
                }}
                className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-transform hover:scale-[1.03]"
                style={{ backgroundColor: brand.header, color: brand.accent }}
                title="Open Command Centre"
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <MessageSquare size={13} strokeWidth={2.2} />
                </span>
                <span className="text-[12px] font-medium">Chat</span>
              </button>
            </div>
          )}

          {/* Bottom row: Rate + main bubble */}
          <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2">
            <button
              onClick={() => setFeedbackOpen((v) => !v)}
              className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border"
              style={{ backgroundColor: "white", borderColor: "rgba(45,45,45,0.1)", color: GOLD }}
              title="Rate us"
            >
              <Star size={18} />
            </button>
            <button
              data-chat-trigger
              onClick={() => {
                if (isOpen) { close(); return; }
                // 2026-04 founder decision: always show the 3-option menu
                // (WhatsApp / Call / Chat). Never open the panel directly —
                // keeps behaviour consistent regardless of teaser state.
                setBubbleNotes([]);
                setShowBadge(false);
                setContactMenuOpen((v) => !v);
              }}
              className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 relative"
              style={{ backgroundColor: brand.header, color: brand.accent }}
              aria-label={isOpen ? "Close chat" : contactMenuOpen ? "Hide options" : "Contact us"}
            >
              {isOpen || contactMenuOpen ? <X size={22} /> : <MessageSquare size={22} />}
              {!isOpen && !contactMenuOpen && showBadge && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
              )}
            </button>
          </div>
        </>
      )}

      {/* Feedback popup */}
      {feedbackOpen && (
        <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#1A1A1A]/10 p-5 w-72">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[14px] font-semibold" style={{ color: CHARCOAL }}>Rate your experience</p>
            <button onClick={() => setFeedbackOpen(false)} className="opacity-40 hover:opacity-100"><X size={16} /></button>
          </div>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setFeedbackRating(n)} className="transition-transform hover:scale-110">
                <Star size={28} fill={n <= feedbackRating ? GOLD : "none"} stroke={n <= feedbackRating ? GOLD : "#D1D5DB"} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <textarea
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            placeholder="Tell us more (optional)"
            className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none resize-none h-20 mb-3"
            style={{ borderColor: "rgba(45,45,45,0.1)", backgroundColor: "#FAFAFA" }}
          />
          <button
            onClick={() => {
              if (feedbackRating) {
                toast.success(`Thank you for your ${feedbackRating}-star feedback`);
                setFeedbackOpen(false); setFeedbackRating(0); setFeedbackMsg("");
              }
            }}
            disabled={feedbackRating === 0}
            className="w-full py-2.5 rounded-full text-[13px] font-medium text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: CHARCOAL }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
}
