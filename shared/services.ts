/**
 * HAMZURY — Services catalog (single source of truth).
 * v1 restructure: consolidated from chat widget + BizDoc/Systemise/Skills portal copy.
 *
 * Every service has:
 *  - dept       : which HAMZURY department owns delivery
 *  - pitch      : one-liner used by CSO / chat / proposals
 *  - why        : why the client needs this (value articulation)
 *  - how        : how HAMZURY delivers (process summary)
 *  - what       : what the client receives (deliverables)
 *  - priceNote  : human price string (for display) — real quotes are per-client
 *  - folder     : which 10-CLIENTS subfolder stores delivery artefacts
 */

export type Department = "bizdoc" | "systemise" | "skills" | "cso" | "finance" | "media" | "other";

export type ServiceDetail = {
  key: string;
  name: string;
  dept: Department;
  pitch: string;
  why: string;
  how: string;
  what: string;
  priceNote: string;
  folder: string;
};

export const SERVICE_FOLDERS: Record<Department, string> = {
  bizdoc:    "10-CLIENTS/BizDoc",
  systemise: "10-CLIENTS/Systemise",
  skills:    "10-CLIENTS/Skills",
  cso:       "10-CLIENTS/CSO",
  finance:   "10-CLIENTS/Finance",
  media:     "10-CLIENTS/Media",
  other:     "10-CLIENTS/Other",
};

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  // ─── BizDoc ────────────────────────────────────────────────────────────
  cac_registration: {
    key: "cac_registration", name: "CAC Business Registration", dept: "bizdoc",
    pitch: "Register your business properly with CAC so you can open accounts, bid for contracts, and look professional.",
    why: "Unregistered businesses cannot open corporate accounts, receive corporate payments, or legally enforce contracts.",
    how: "Name search → approval → post-incorp → certificate & status report within 7–14 working days.",
    what: "Certificate of incorporation, status report, CAC pack, director/shareholder records.",
    priceNote: "From ₦25,000 (BN) / ₦75,000 (LTD).",
    folder: "10-CLIENTS/BizDoc/CAC",
  },
  tax_compliance: {
    key: "tax_compliance", name: "Tax Compliance (TIN + FIRS)", dept: "bizdoc",
    pitch: "Keeps you penalty-free and contract-ready. Without it you risk fines and cannot bid for tenders.",
    why: "TCC is demanded by every serious client, bank and government body. Non-compliance = fines + blocked contracts.",
    how: "TIN registration → monthly returns → annual filings → TCC issuance.",
    what: "TIN, CIT filings, VAT filings, TCC.",
    priceNote: "From ₦40,000 setup; ₦15,000/mo ongoing.",
    folder: "10-CLIENTS/BizDoc/Tax",
  },
  sector_licences: {
    key: "sector_licences", name: "Sector Licences", dept: "bizdoc",
    pitch: "Operate legally in your industry — SON, NAFDAC, DPR, NCC, CBN and more.",
    why: "Operating without the right permit risks shutdown, seizure of goods, or reputational damage.",
    how: "We map your sector → identify required licences → file + follow up until issued.",
    what: "Sector-specific permit(s), renewal calendar, compliance file.",
    priceNote: "Varies per sector.",
    folder: "10-CLIENTS/BizDoc/Licences",
  },
  legal_documents: {
    key: "legal_documents", name: "Legal Documents", dept: "bizdoc",
    pitch: "Contracts that protect your business relationships and operations.",
    why: "Without proper contracts you have no legal recourse when things go wrong.",
    how: "Discovery → draft → review → execute → filed master copy.",
    what: "Service agreements, employment contracts, NDAs, partnership deeds.",
    priceNote: "From ₦20,000 per document.",
    folder: "10-CLIENTS/BizDoc/Legal",
  },
  itf_compliance: {
    key: "itf_compliance", name: "ITF Compliance", dept: "bizdoc",
    pitch: "Mandatory for businesses with 5+ employees OR turnover above ₦50M. Required for large contracts.",
    why: "ITF certificate is a tender prerequisite and a payroll compliance requirement.",
    how: "Register employer → file 1% payroll contribution → obtain certificate.",
    what: "ITF registration, annual contribution filing, ITF compliance certificate.",
    priceNote: "From ₦50,000 setup.",
    folder: "10-CLIENTS/BizDoc/ITF",
  },
  scuml: {
    key: "scuml", name: "SCUML Registration", dept: "bizdoc",
    pitch: "SCUML is mandatory for designated non-financial businesses (DNFBPs) under EFCC rules.",
    why: "Without SCUML, banks flag your transactions and you cannot legally operate in regulated sectors.",
    how: "File with EFCC → compliance interview → certificate.",
    what: "SCUML certificate + compliance pack.",
    priceNote: "From ₦60,000.",
    folder: "10-CLIENTS/BizDoc/SCUML",
  },
  bn_to_ltd_conversion: {
    key: "bn_to_ltd_conversion", name: "BN → LTD Conversion", dept: "bizdoc",
    pitch: "Graduate from Business Name to Limited Liability Company for bigger deals and liability protection.",
    why: "LTD gives you limited liability, easier equity raises, and credibility with corporate buyers.",
    how: "Resolution → CAC application → new certificate → TIN/bank transition.",
    what: "LTD certificate, MEMART, new status report.",
    priceNote: "From ₦120,000.",
    folder: "10-CLIENTS/BizDoc/CAC",
  },
  cac_address_change: {
    key: "cac_address_change", name: "CAC Address Change", dept: "bizdoc",
    pitch: "Update your registered CAC address so legal correspondence reaches you and bank verification passes.",
    why: "Outdated address causes bank KYC failures, compliance issues, and lost legal mail.",
    how: "Board resolution → CAC filing → updated records (5–7 working days).",
    what: "Amended certificate reflecting new address.",
    priceNote: "From ₦35,000.",
    folder: "10-CLIENTS/BizDoc/CAC",
  },
  cac_name_change: {
    key: "cac_name_change", name: "CAC Name Change", dept: "bizdoc",
    pitch: "Rebranding? Change your business name at CAC while keeping all history and compliance intact.",
    why: "A clean legal name change protects your operating history during a rebrand or repositioning.",
    how: "Name search → board resolution → CAC amendment → updated certificate. TIN and bank records also updated.",
    what: "Updated certificate, linked TIN/bank updates, new compliance file.",
    priceNote: "From ₦45,000.",
    folder: "10-CLIENTS/BizDoc/CAC",
  },
  renewals_bizdoc: {
    key: "renewals_bizdoc", name: "Compliance Renewals", dept: "bizdoc",
    pitch: "Keep compliance current — zero surprises, zero lapses.",
    why: "One missed renewal can cost more than a year of retainers in penalties.",
    how: "Renewal calendar → reminders at 45/30/14/7 days → file & confirm.",
    what: "TCC, ITF, SCUML, sector licence renewals tracked in a single calendar.",
    priceNote: "Ongoing — bundled in retainer.",
    folder: "10-CLIENTS/BizDoc/Renewals",
  },
  tax_dashboard: {
    key: "tax_dashboard", name: "BizDoc Tax Dashboard (subscription)", dept: "bizdoc",
    pitch: "A single live dashboard that keeps your tax, compliance and filings visible at all times.",
    why: "You stop guessing what's filed and what's due — Finance + CEO see real status in real time.",
    how: "We onboard your entity → connect FIRS/state portals → file monthly → publish to your dashboard.",
    what: "Live dashboard, monthly returns, TCC renewal, audit-ready records.",
    priceNote: "₦150,000/year (flagship plan).",
    folder: "10-CLIENTS/BizDoc/Tax/Dashboard",
  },

  // ─── Systemise ──────────────────────────────────────────────────────────
  brand_identity: {
    key: "brand_identity", name: "Brand Identity", dept: "systemise",
    pitch: "Build the visual foundation that makes clients trust you before they even speak to you.",
    why: "Every touchpoint — signboard, pitch, packaging — is judged in under 5 seconds. Identity wins or loses the deal.",
    how: "Discovery → mood → logo + system → brand book → rollout across channels.",
    what: "Logo pack, colour + type system, brand book, social templates.",
    priceNote: "From ₦150,000.",
    folder: "10-CLIENTS/Systemise/Brand",
  },
  website_design: {
    key: "website_design", name: "Website Design & Build", dept: "systemise",
    pitch: "Your website is your 24/7 salesperson. It should convert visitors into clients, not just look pretty.",
    why: "A working website shortens sales cycles, qualifies leads overnight and raises your average deal size.",
    how: "Map goal → copy → design → build → launch + SEO + analytics.",
    what: "Responsive site, CMS access, SEO foundations, analytics, handover pack.",
    priceNote: "From ₦250,000.",
    folder: "10-CLIENTS/Systemise/Web",
  },
  social_media: {
    key: "social_media", name: "Social Media Management", dept: "systemise",
    pitch: "Builds your audience and turns followers into paying clients. Consistency wins.",
    why: "Random posting doesn't convert. A system does.",
    how: "Strategy → calendar → production → publishing → reporting.",
    what: "Monthly content calendar, scheduled posts, engagement reports.",
    priceNote: "From ₦180,000/month.",
    folder: "10-CLIENTS/Systemise/Social",
  },
  crm_automation: {
    key: "crm_automation", name: "CRM & Automation", dept: "systemise",
    pitch: "Eliminate repeated manual work so you can focus on growth.",
    why: "Manual follow-ups die. Automated ones close deals while you sleep.",
    how: "Map your sales process → pick tools → configure automations → train team.",
    what: "CRM setup, automations, dashboards, team training.",
    priceNote: "From ₦220,000.",
    folder: "10-CLIENTS/Systemise/CRM",
  },
  ai_automation: {
    key: "ai_automation", name: "AI & Automation", dept: "systemise",
    pitch: "Run smarter with less manual work — pick what fits your operation.",
    why: "Every hour you save on repetitive work is an hour you sell or invest.",
    how: "Audit → automation map → build → deploy → measure savings.",
    what: "AI agents, automation flows, ROI report.",
    priceNote: "From ₦300,000.",
    folder: "10-CLIENTS/Systemise/AI",
  },
  seo_aeo: {
    key: "seo_aeo", name: "SEO & AEO", dept: "systemise",
    pitch: "Show up where it matters — Google, ChatGPT, and beyond.",
    why: "Search visibility compounds. The longer you ignore it, the further you fall.",
    how: "Technical audit → keyword + AEO strategy → on-page + structured data → monthly content.",
    what: "SEO/AEO audit, structured data, ranking reports.",
    priceNote: "From ₦150,000/month.",
    folder: "10-CLIENTS/Systemise/SEO",
  },
  dashboards: {
    key: "dashboards", name: "Custom Dashboards", dept: "systemise",
    pitch: "See your entire business at a glance. Dashboards that turn data into decisions.",
    why: "If you can't see it, you can't run it.",
    how: "Data audit → metric map → build → iterate.",
    what: "Custom dashboard, data connectors, training session.",
    priceNote: "From ₦250,000.",
    folder: "10-CLIENTS/Systemise/Dashboards",
  },

  // ─── Skills ─────────────────────────────────────────────────────────────
  ai_founder_launchpad: {
    key: "ai_founder_launchpad", name: "AI Founder Launchpad", dept: "skills",
    pitch: "6-week intensive — build, launch and grow a business using AI tools.",
    why: "AI is the biggest leverage in a generation. Founders who master it outpace those who don't.",
    how: "Weekly cohort → live builds → mentorship → graduation demo.",
    what: "Curriculum, tools, mentorship, launch portfolio.",
    priceNote: "From ₦250,000 per seat.",
    folder: "10-CLIENTS/Skills/AIFounder",
  },
  vibe_coding: {
    key: "vibe_coding", name: "Vibe Coding for Founders", dept: "skills",
    pitch: "Build real apps and websites without a traditional coding background.",
    why: "Prototypes win deals. Founders who can ship own the narrative.",
    how: "Hands-on builds → real product → launch.",
    what: "Working prototype + skills transfer.",
    priceNote: "From ₦180,000 per seat.",
    folder: "10-CLIENTS/Skills/VibeCoding",
  },
  corporate_training: {
    key: "corporate_training", name: "Corporate Staff Training", dept: "skills",
    pitch: "Upskill your entire team on AI, automation, and digital operations.",
    why: "The gap between trained and untrained teams is widening fast.",
    how: "Needs assessment → custom curriculum → in-person + virtual delivery.",
    what: "Training plan, delivery, assessments, certificates.",
    priceNote: "Custom — from ₦500,000.",
    folder: "10-CLIENTS/Skills/Corporate",
  },

  // ─── Packages ───────────────────────────────────────────────────────────
  bizdoc_package_a: {
    key: "bizdoc_package_a", name: "BizDoc Package A (Starter)", dept: "bizdoc",
    pitch: "Get your business legally set up and compliance-ready.",
    why: "Without this base, nothing else stands.",
    how: "Registration + TIN + basic compliance.",
    what: "CAC, TIN, basic compliance pack.",
    priceNote: "From ₦150,000.",
    folder: "10-CLIENTS/BizDoc/Packages",
  },
  bizdoc_package_b: {
    key: "bizdoc_package_b", name: "BizDoc + Systemise Package B", dept: "bizdoc",
    pitch: "Full setup + brand + website for founders ready to look serious.",
    why: "Clients need legal proof and a working digital presence — bundled, not scattered.",
    how: "Parallel delivery by BizDoc + Systemise, coordinated by CSO.",
    what: "Registration, compliance, brand, website, basic social.",
    priceNote: "From ₦630,000 (project).",
    folder: "10-CLIENTS/Packages/B",
  },
  systemise_package: {
    key: "systemise_package", name: "Systemise Full Brand Pack", dept: "systemise",
    pitch: "Brand + website + social foundations in one go.",
    why: "Piecemeal branding is expensive and inconsistent. Bundled is cheaper and faster.",
    how: "Parallel streams with a single Systemise lead.",
    what: "Identity, website, social kit, SEO foundations.",
    priceNote: "From ₦450,000.",
    folder: "10-CLIENTS/Systemise/Packages",
  },
};

/** Convenience list used by UI search/filter. */
export const SERVICE_LIST: ServiceDetail[] = Object.values(SERVICE_DETAILS);

/** Group services by department — used by Services Library in Back Office. */
export function servicesByDept(): Record<Department, ServiceDetail[]> {
  const out: Record<Department, ServiceDetail[]> = {
    bizdoc: [], systemise: [], skills: [], cso: [], finance: [], media: [], other: [],
  };
  for (const s of SERVICE_LIST) out[s.dept].push(s);
  return out;
}
