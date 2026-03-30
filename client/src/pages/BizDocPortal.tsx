import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, X, Menu } from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";
import { trpc } from "@/lib/trpc";

const G  = "#1B4D3E";
const Au = "#B48C4C";
const Cr = "#FFFAF6";
const W  = "#FFFFFF";
const Milk = "#FFFAF6";

// ── PILLARS (pain-point first) ────────────────────────────────────────────────
type PillarDef = {
  num: string; tag: string; title: string; sub: string;
  pitch: string; forWhom: string; services: string[];
  highlight: string;
};

const PILLARS: PillarDef[] = [
  {
    num: "01",
    tag: "REGISTRATION",
    title: "My business isn't registered — or I'm a foreign investor trying to operate in Nigeria",
    sub: "CAC Registration, Modifications & Foreign Company Setup",
    pitch: "Without CAC, your business doesn't legally exist. Whether you're local or foreign, we handle every registration from entity formation to expatriate compliance.",
    forWhom: "Startups, SMEs, foreign investors, diaspora entrepreneurs, and anyone who needs a corporate account, contracts, or tenders.",
    services: [
      "Business Name Registration",
      "Private Limited Company (RC)",
      "CAC Foreign Company Registration (CAMA 2020, Section 54)",
      "Business Permit — Federal Ministry of Interior",
      "Expatriate Quota (EQ) Application & Processing",
      "CERPAC — Combined Expatriate Residence Permit & Aliens Card",
      "Apostille & Document Authentication",
      "SCUML Registration",
      "Director & Shareholder Amendments",
      "Business Restructuring (BN → Ltd, Name Change, Address Change)",
      "Company Restoration",
      "Annual Returns Filing & Back-Filing",
      "Free corporate bank intro letter",
    ],
    highlight: "Local or foreign — one team handles your entire registration.",
  },
  {
    num: "02",
    tag: "FULL SETUP",
    title: "I want everything handled — from registration to operations",
    sub: "Complete Business Processing — Docs, Accounts, Operations",
    pitch: "You bring the idea. We deliver a fully registered, tax-compliant, legally protected, operationally ready business. End to end.",
    forWhom: "New founders, relocating businesses, and anyone who wants the full package without chasing multiple vendors.",
    services: [
      "Full CAC Registration (BN or Ltd)",
      "TIN + VAT + PAYE Setup",
      "Corporate Bank Account Intro",
      "All Legal Documents (Agreements, NDAs, Employment Contracts)",
      "Sector Licence Identification & Filing",
      "Brand Registration & Trademark Filing",
      "Operational SOP Framework",
      "Monthly Compliance Calendar Setup",
      "Dedicated Account Manager for 90 Days",
    ],
    highlight: "One engagement. Every layer. Fully handled.",
  },
  {
    num: "03",
    tag: "COMPLIANCE",
    title: "FIRS is chasing me, my returns are late, and I don't know what I owe",
    sub: "Tax, Annual Returns & Regulatory Compliance",
    pitch: "FIRS notices aren't warnings — they're enforcement. We handle TIN, returns, clearance certificates, and ongoing monitoring so you never fall behind again.",
    forWhom: "Behind on filings, received a FIRS notice, missed annual returns, or need a TCC.",
    services: [
      "TIN Registration",
      "VAT Registration & Monthly Filing",
      "PAYE Setup & Filing",
      "PENCOM Registration & Clearance",
      "Tax Clearance Certificate (TCC)",
      "FIRS Notice Response & Resolution",
      "Back-Filing for Previous Years",
      "Annual Returns Filing (current + missed years)",
      "Company Status Check & Restoration",
      "CAC Good Standing Certificate",
      "Monthly Managed Compliance (from ₦15,000/month)",
    ],
    highlight: "Tax, returns, and regulatory — all in one place.",
  },
  {
    num: "04",
    tag: "LEGAL",
    title: "I have no legal documents — verbal agreements are costing me money",
    sub: "Contracts, Agreements, Trademark & IP Protection",
    pitch: "Verbal agreements give zero recourse. We draft every document your business needs — from a single NDA to a full legal framework with trademark protection.",
    forWhom: "Any business dealing with clients, partners, staff, or investors. Single documents or full sets.",
    services: [
      "Service & Client Agreements",
      "NDAs & Confidentiality Deeds",
      "Employment Contracts",
      "Shareholder Agreements",
      "Partnership Deeds",
      "Board Resolutions",
      "Trademark Registration (local & international)",
      "IP Protection Advisory",
      "Legal Templates & Custom Frameworks",
    ],
    highlight: "One document or a full legal library — we draft it all.",
  },
  {
    num: "05",
    tag: "LICENCES",
    title: "I don't have the right licences — one inspection could shut me down",
    sub: "All Industry Permits & Sector-Specific Licences",
    pitch: "One inspection away from shutdown. We identify every licence your sector requires, file the applications, and track renewals so you stay compliant.",
    forWhom: "Regulated sectors: food, oil & gas, healthcare, fintech, construction, export, tech.",
    services: [
      "NAFDAC Product Registration",
      "DPR / NMDPRA Petroleum Licence",
      "CBN / Fintech Approval",
      "COREN / ARCON Professional Licence",
      "NEPC Export Licence",
      "SON Product Certification",
      "NITDA Accreditation",
      "State-Level Permits & Renewals",
      "Licence Renewal Tracking & Alerts",
    ],
    highlight: "Every permit your sector demands — filed and tracked.",
  },
];

// ── BUSINESS BLUEPRINT ───────────────────────────────────────────────────────
type BpPrimary = { name: string; note: string };
type BpStage = {
  id: string; label: string; tagline: string;
  primary: BpPrimary[];
  secondary: string[];
  automations: string[];
  by: "BizDoc" | "Systemise" | "Skills";
};
type Blueprint = {
  id: string; label: string; tagline: string;
  stages: BpStage[];
  mayAlsoNeed?: { trigger: string; items: string[] }[];
};

const STAGE_TABS = [
  { id: "legal",      num: "01", label: "Legal",      full: "Legal & Compliance" },
  { id: "financial",  num: "02", label: "Financial",  full: "Financial Setup" },
  { id: "marketing",  num: "03", label: "Marketing",  full: "Brand & Marketing" },
  { id: "sales",      num: "04", label: "Sales",      full: "Sales System" },
  { id: "operations", num: "05", label: "Operations", full: "Operations" },
  { id: "team",       num: "06", label: "Team",       full: "Team & Skills" },
];

const BLUEPRINTS: Blueprint[] = [
  {
    id: "general", label: "General Business", tagline: "Any sector. Every stage of building a fully operational Nigerian business.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Everything that makes you legally real, government-recognised, and protected from liability.",
        primary: [
          { name: "CAC Registration", note: "Business Name (sole trader) or Private Limited Company (min 2 shareholders, min ₦10k share capital, MEMAT). Your legal identity, nothing works without it." },
          { name: "TIN + FIRS Enrollment", note: "Tax Identification Number from FIRS. Required for every invoice, bank account, and government transaction." },
          { name: "SCUML Registration", note: "Mandatory for professional services, real estate, and cash-intensive businesses under MLMASA 2022." },
          { name: "Trademark Registration", note: "Your brand name, logo, and product names legally protected. An unregistered brand can be copied or blocked as you grow." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "The five certificates required for any government bid or institutional contract. Missing one = automatic disqualification." },
        ],
        secondary: ["VAT Registration (at ₦25M turnover)", "Annual Returns filing system", "PAYE registration once staff hired", "Employment contracts + NDAs", "Service agreements for all clients"],
        automations: ["BizDoc compliance dashboard with renewal alerts", "Document vault (digital + certified copies)", "FIRS filing calendar with auto-reminders"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "The money infrastructure that keeps your business solvent, audit-ready, and investor-friendly.",
        primary: [
          { name: "Corporate Bank Account", note: "Business account separate from personal. Required for all formal contracts and government payments." },
          { name: "Financial Reporting System", note: "Chart of accounts, invoicing, expense tracking, P&L reports from day one. Know exactly where your money goes — every naira, every month." },
          { name: "Payment Collection Gateway", note: "Accept card, bank transfer, and USSD payments from clients instantly. Every hour without a payment system is revenue you're leaving on the table." },
          { name: "Invoice + Payment Terms Template", note: "Professional invoice format with your RC number, TIN, bank details, and clear payment terms. Your competitors already have this." },
          { name: "PAYE + Payroll Setup", note: "Automated payroll processing with tax deductions, pension remittance, and payslip generation. One mistake here costs you staff trust permanently." },
          { name: "Tax Registration & Compliance", note: "VAT, CIT, and all statutory filings mapped to deadlines. Miss one filing and FIRS penalties start compounding immediately." },
          { name: "Cash Flow Management", note: "Weekly cash position tracking, receivables ageing, and payment forecasting. The businesses that survive aren't the most profitable — they're the ones that never run out of cash." },
        ],
        secondary: ["Monthly budget template", "Petty cash policy", "Vendor payment schedule", "Annual audit preparation checklist", "Expense policy for staff", "Business restructuring guidance"],
        automations: ["Auto-invoicing on project milestone", "Bank reconciliation automation", "Payroll processing automation", "Tax filing calendar with deadline alerts", "Financial dashboard with real-time P&L"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "How clients find you, trust you, and choose you over everyone else in your market.",
        primary: [
          { name: "Logo + Brand Identity", note: "Professional logo, brand colours, typography. The visual system that makes you recognisable and trustworthy." },
          { name: "Professional Website", note: "5-page website: Home, About, Services, Testimonials, Contact. Your 24/7 salesperson that works while you sleep." },
          { name: "Google My Business", note: "Verified listing drives local enquiries organically. The most cost-effective marketing tool available to any Nigerian business." },
          { name: "Instagram Business Account", note: "Content strategy, bio optimisation, highlights setup. Builds brand credibility and warm-audience leads." },
          { name: "LinkedIn Company Page", note: "B2B brand credibility. Corporate clients and procurement officers check LinkedIn before engaging." },
        ],
        secondary: ["Brand guidelines document", "Content calendar (3x/week minimum)", "Email newsletter setup", "WhatsApp Business profile", "Facebook Business page"],
        automations: ["Social media scheduling and auto-posting", "Email automation sequences for leads and clients", "SEO performance monitoring", "Review request automation"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "How you convert interest into paying clients, consistently, not just when you get lucky.",
        primary: [
          { name: "Pricing Structure", note: "Clear service tiers, pricing rationale, and discount policy. Clients who can't find your price don't buy." },
          { name: "Sales Pipeline Management", note: "Every lead tracked. Every follow-up automated. No revenue lost to forgetting. The businesses that close consistently are the ones with a system." },
          { name: "Proposal / Quote Template", note: "Professional, branded proposals that close deals faster. Includes scope, timeline, investment, and terms. Your competitors already have this." },
          { name: "Client Onboarding Flow", note: "Welcome email, onboarding checklist, kickoff meeting agenda. Makes clients feel they made the right choice." },
          { name: "Referral Programme", note: "Structured system to turn happy clients into your best salespeople. Referrals close 70% faster at zero acquisition cost." },
        ],
        secondary: ["Testimonial collection system", "Upsell and cross-sell menu", "Lost deal tracking (why clients said no)", "Annual client review process", "Re-engagement sequence for past clients"],
        automations: ["Sales pipeline automation", "WhatsApp Business auto-reply", "Proposal generation and tracking", "Follow-up email sequences", "Meeting booking automation"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "How your business runs consistently. With or without you watching every detail.",
        primary: [
          { name: "Core SOPs", note: "Standard Operating Procedures for your 3 most important processes. Documented, tested, and followed by every team member." },
          { name: "Project & Task Tracking", note: "Every task assigned, deadlined, and tracked. No project falls through the cracks. When things slip, you know the same day — not the same month." },
          { name: "File Management System", note: "Structured folder system for client files, company documents, and templates. Everything in the right place, accessible in under 30 seconds." },
          { name: "Team Communication Hub", note: "Defined channels, response time standards, no important messages lost in chat. Clear communication is the difference between a team and a group chat." },
          { name: "Quality Control Checklist", note: "Per-service checklist reviewed before delivery. Prevents errors, maintains standards, protects your reputation." },
        ],
        secondary: ["Vendor/supplier management system", "Weekly reporting template", "Client portal for document sharing", "Incident/complaint resolution SOP", "Business continuity plan"],
        automations: ["Cross-system workflow automation", "Automated client status update emails", "Task reminder automation", "AI support chatbot for common enquiries"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Who you need, what skills matter, and how to build a team that performs without constant supervision.",
        primary: [
          { name: "Org Chart + Role Definitions", note: "Clear reporting lines, responsibilities per role. Every team member knows exactly what they own." },
          { name: "Job Descriptions (first 3 hires)", note: "Operations Coordinator, Client Relations Officer, Finance Officer. The core three every growing business needs first." },
          { name: "Employment Contracts + Offer Letters", note: "Legally compliant contracts with probation, IP clauses, confidentiality, and exit terms." },
          { name: "Onboarding Checklist", note: "First 30/60/90-day plan for every new hire. Reduces time-to-productivity and prevents early resignations." },
          { name: "KPI Scorecard", note: "Monthly performance metrics per role. Objective, transparent, and tied to business outcomes." },
        ],
        secondary: ["Performance review cycle (quarterly)", "Training budget allocation", "Staff handbook", "Promotion and pay review framework", "Team communication charter"],
        automations: ["HR management and employee records system", "Payslip automation", "Leave management system", "Training tracker"],
        by: "Skills",
      },
    ],
  },
  {
    id: "contractor", label: "Contractor", tagline: "Civil, electrical, construction. Every stage from incorporation to winning ₦50M+ government contracts.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Without these, your bid is rejected before anyone reads your price.",
        primary: [
          { name: "CAC Private Limited Company", note: "Objects clause must cover construction/engineering. Min 2 directors, min 2 shareholders. BN not accepted for government contracts." },
          { name: "COREN / CORBON / ARCON Registration", note: "Engineers: COREN. Builders: CORBON. Architects: ARCON. Operating without these is a criminal offence under each respective Act." },
          { name: "SCUML Registration", note: "Construction is a Designated Non-Financial Business, mandatory under MLMASA 2022. EFCC actively monitors the sector." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "All five required for every government tender. Missing any one means automatic disqualification, regardless of your price or track record." },
          { name: "Professional Indemnity Insurance", note: "Required for professional registration renewal (COREN/ARCON) and major project contracts. Covers you for design errors and negligence claims." },
        ],
        secondary: ["NSE / NIA professional membership", "Annual Returns filing", "VAT registration", "PAYE for site workers", "Site-specific environmental permits"],
        automations: ["BPP tender portal monitoring", "Compliance certificate renewal tracker", "ITF levy payment automation"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Construction cash flow is irregular, advance payments, retentions, and stage payments need careful management.",
        primary: [
          { name: "Corporate Bank Account (tier-1 bank)", note: "Required for advance payment guarantees and performance bonds. Tier-1 bank relationship is a prerequisite for most government contracts." },
          { name: "Project Accounting System", note: "Project cost tracking per contract, retention management, subcontractor payments. Every naira allocated before it's spent — not after." },
          { name: "VAT + PAYE Registration", note: "VAT applies to construction services. PAYE required for all site staff and head office employees." },
          { name: "Performance Bond Capacity", note: "Bank facility to issue advance payment guarantees and performance bonds, typically 10–15% of contract value." },
          { name: "Subcontractor Payment Schedule", note: "Formal payment process for subcontractors. Prevents site disputes, legal claims, and project stoppages." },
        ],
        secondary: ["Mobilisation fund management", "Retention release tracking", "Material procurement cost tracking", "Project profitability analysis per contract", "Working capital facility with bank"],
        automations: ["Project budget tracking per contract", "Retention release reminders", "Payment milestone alerts", "Payroll automation for site workers"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "The companies winning major tenders look like they've already won many. Your brand must match the contract size you want.",
        primary: [
          { name: "Professional Website with Portfolio", note: "Project photos, completed values, client names, project specs. Procurement officers search your website before shortlisting." },
          { name: "Capability Statement (PDF)", note: "3-page document: company overview, core competencies, key projects, certifications, leadership team. Your pre-bid sales tool." },
          { name: "LinkedIn Company Page", note: "Active presence with project updates, team profiles, and certifications. Institutional clients verify contractors on LinkedIn." },
          { name: "Company Profile Folder", note: "Full company profile document, CAC cert, COREN cert, TCC, BPP, bank references, key staff CVs. Ready to submit on any tender." },
        ],
        secondary: ["Google My Business for local discovery", "Project case studies (before/after)", "Client reference letter collection", "Award and certification display"],
        automations: ["Portfolio update workflow", "Social media content scheduling", "Tender alert system monitoring"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "In construction, the tender is the sale. And it must be perfectly prepared every time.",
        primary: [
          { name: "Tender / Bid Tracking System", note: "Track every open tender. Deadline, value, requirements, submission status. Missing a bid deadline is revenue thrown away." },
          { name: "Bill of Quantities Template Library", note: "Pre-built BoQ templates per project type. Reduces bid preparation time by 60% and improves pricing accuracy." },
          { name: "Prequalification Profile Database", note: "All your prequalification documents organised, current, and ready for instant submission to any client or MDA." },
          { name: "Subcontractor + Supplier Database", note: "Vetted, priced suppliers per trade. Speeds up costing and improves tender competitiveness." },
        ],
        secondary: ["JV/partnership agreement framework", "Client relationship management (key accounts)", "Bid win/loss analysis", "Government MDA contact database"],
        automations: ["BPP portal tender monitoring", "Bid deadline alerts", "Automated tender document assembly", "Pricing calculator tool"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Projects that run on documented systems finish on time and on budget. Projects without them run over both.",
        primary: [
          { name: "Project Management System", note: "Programme of works, milestone tracking, resource allocation, daily progress logs. Projects that track daily finish on time. The rest finish over budget." },
          { name: "Site Reporting SOP", note: "Daily site reports, weekly progress reports, monthly client reports. All standardised and non-negotiable." },
          { name: "HSE Management System", note: "Method statements, risk assessments, toolbox talks, incident reporting. Legal requirement for all construction sites." },
          { name: "Subcontractor Management", note: "Scope of work documents, payment schedules, performance tracking, variation order management." },
          { name: "Material Procurement Tracking", note: "Purchase order system, delivery confirmation, quality inspection record per delivery." },
        ],
        secondary: ["Variation order management system", "Defects liability tracking", "Equipment maintenance log", "Site security protocol", "Client change request management"],
        automations: ["Daily site report automation", "Material delivery tracking", "Subcontractor invoice management", "HSE compliance tracker"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "COREN-registered engineers and certified supervisors are a legal requirement on site. Not an HR choice.",
        primary: [
          { name: "COREN-Registered Engineer(s)", note: "Mandatory for all engineering works. Without a named COREN-registered engineer, your company cannot legally execute any engineering project." },
          { name: "Certified Site Supervisors", note: "Site supervisors with CORBON or relevant trade certification. Required for H&S compliance and professional indemnity." },
          { name: "Quantity Surveyor", note: "QS for accurate costing, BoQ preparation, and contract administration. Over/under-pricing tenders costs you contracts or money." },
          { name: "Project Manager", note: "PMP-certified or experienced PM. The difference between a project that finishes on time and one that drags into a loss." },
        ],
        secondary: ["Procurement officer", "HSE coordinator", "Finance/contracts officer", "Admin officer", "Draughtsman / CAD technician"],
        automations: ["Staff attendance tracking (site)", "Timesheet automation", "Training certification tracker"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "For federal contracts above ₦500M", items: ["Audited Financial Statements (3 years)", "Performance Bond from a tier-1 bank (10–15% of contract value)", "ISO 9001 Quality Management Certification"] },
      { trigger: "For electrical / power infrastructure projects", items: ["NERC (Nigerian Electricity Regulatory Commission) Registration", "NEMSA (Nigerian Electricity Management Services Agency) Certification"] },
    ],
  },
  {
    id: "tech-startup", label: "Tech / Startup", tagline: "Software, SaaS, fintech. Every stage from registration to a fundable, scalable product company.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Investors and enterprise clients only engage properly incorporated, IP-protected entities.",
        primary: [
          { name: "CAC Private Limited Company", note: "Objects clause covers software/technology. Min 2 shareholders. No institutional investor will fund an unincorporated entity." },
          { name: "Shareholders Agreement + ESOP", note: "IP ownership, founder vesting (4-year cliff), exit rights, anti-dilution, drag-along. Must exist before any investor conversation." },
          { name: "NDPR Compliance (NITDA)", note: "Mandatory for any product handling Nigerian user data. NITDA fines for non-compliance are real and increasing." },
          { name: "Trademark Registration", note: "Brand name, logo, and product name legally protected. File early. Before you're worth copying." },
          { name: "TCC + ITF + NSITF + PenCom + NITDA", note: "Tax clearance required for due diligence. NITDA accreditation required for government IT contracts." },
        ],
        secondary: ["Privacy Policy + Terms of Service", "PAYE once hiring begins", "CBN licence (if fintech/payment)", "SEC registration (if raising equity)", "Annual Returns"],
        automations: ["NDPR compliance monitoring tool", "IP renewal alerts", "Annual returns reminder"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Clean books attract investors. Messy books kill deals at due diligence. Every time.",
        primary: [
          { name: "Corporate Bank Account + USD Account", note: "NGN account for local operations. USD domiciliary account for SaaS subscriptions, international clients, and investor transfers." },
          { name: "Financial Reporting System", note: "Investor-ready financial reporting from day one. Monthly P&L, balance sheet, and cash flow statements automatically generated. Clean books attract investors. Messy books kill deals." },
          { name: "Payment Collection Infrastructure", note: "Local and international payment options integrated. Multiple payment methods reduce churn and friction at checkout. Every failed payment is a customer you already won — and lost." },
          { name: "Cap Table Management", note: "Equity structure document tracking all shareholders, ESOP pool, and investor allocations. Required for every investor meeting." },
          { name: "Subscription Revenue Tracking", note: "MRR, ARR, churn rate, LTV/CAC ratios tracked monthly. Investors buy these metrics. Not just your product." },
        ],
        secondary: ["Runway calculator (months of cash remaining)", "Unit economics model", "Investor update template (monthly)", "Expense policy for team", "Payroll setup"],
        automations: ["Subscription billing and revenue management", "Automated investor updates", "Real-time financial dashboard", "Expense tracking and categorisation"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Tech products grow through content, community, and SEO. Not cold calling.",
        primary: [
          { name: "Product Website (SaaS landing page)", note: "Clear value proposition, demo or trial CTA, pricing page, case studies. Converts visitors to signups without a sales call." },
          { name: "Founder LinkedIn + Twitter/X", note: "VCs follow founders before they meet them. Thought leadership content builds credibility ahead of any pitch meeting." },
          { name: "Content / SEO Strategy", note: "Blog targeting your buyers' search queries. Organic traffic compounds. It's the cheapest long-term acquisition channel." },
          { name: "Product Hunt Launch", note: "Structured launch strategy for product discovery. Top 5 on launch day drives thousands of signups and press attention." },
        ],
        secondary: ["Developer community presence (GitHub)", "G2 / Capterra product listing", "YouTube product demo videos", "Email newsletter for users", "Podcast / webinar series"],
        automations: ["SEO rank tracking and keyword monitoring", "Content scheduling and auto-publishing", "Product usage analytics and funnel tracking", "User feedback collection and analysis"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "B2B SaaS sales is a system. Pipeline, demo, proposal, close, expand.",
        primary: [
          { name: "Sales Pipeline & CRM", note: "Every lead tracked. Every demo scheduled. Every deal staged. No revenue lost to 'I forgot to follow up.' Your competitors already have this." },
          { name: "Demo Flow + Sales Script", note: "Structured 30-minute demo that leads to a decision. A good demo is your most powerful sales asset." },
          { name: "Pricing Page + Freemium Tier", note: "Self-serve pricing lets buyers decide without a sales call. Freemium drives viral adoption in your target market." },
          { name: "MSA / Sales Agreement Template", note: "Master Service Agreement for enterprise clients. Reviewed by counsel, protects your IP, defines SLAs." },
        ],
        secondary: ["Outbound LinkedIn sequence", "Case studies (2 per industry)", "Referral/partner programme", "Customer success playbook", "Expansion revenue strategy (upsells)"],
        automations: ["Deal stage automation and pipeline alerts", "Self-serve demo booking", "Automated onboarding emails", "Lead scoring", "Churn prediction alerts"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Engineering velocity, product quality, and customer success. All need systems.",
        primary: [
          { name: "Agile / Sprint Workflow", note: "2-week sprints, clear acceptance criteria, velocity tracking. Product ships faster with fewer bugs. Every week without sprints is a week of guessing." },
          { name: "Engineering Documentation", note: "API docs, architecture diagrams, onboarding guide for new devs. Reduces knowledge concentration risk." },
          { name: "Customer Support System", note: "Ticketing, live chat, knowledge base. Support quality is a retention lever, not just a cost. One bad support experience loses a customer for life." },
          { name: "Incident Response SOP", note: "Downtime protocol: who is notified, in what order, what the public statement is, how it's resolved and communicated." },
        ],
        secondary: ["Feature request management and prioritisation", "Bug tracking and triage workflow", "DevOps CI/CD pipeline", "Vendor SLA management", "Security audit schedule"],
        automations: ["CI/CD build and deployment automation", "Support ticket routing", "User behaviour tracking", "Automated status page for uptime monitoring"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Nigerian tech companies that scale hire for skill-fit first. Culture can be taught, missing skills can't.",
        primary: [
          { name: "CTO / Lead Engineer", note: "Technical co-founder or hire. Sets architecture, hires engineers, owns product quality." },
          { name: "Product Manager", note: "Owns the roadmap. Translates business goals into engineering priorities. Critical for product-market fit decisions." },
          { name: "Business Development / Sales Lead", note: "Owns revenue. Manages pipeline, demos, and enterprise relationships." },
          { name: "DevOps / Cloud Engineer", note: "Owns infrastructure reliability. Downtime costs you users. A dedicated DevOps prevents most of it." },
        ],
        secondary: ["UX/UI Designer", "Customer Success Manager", "Marketing lead", "Data analyst", "Legal / IP counsel (part-time)"],
        automations: ["HR management and employee records", "Engineering time tracking", "Payroll automation", "Team training and upskilling platform"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If processing payments or holding customer funds", items: ["CBN Payment Solution Provider (PSP) Licence", "NIBSS integration agreement", "PCI-DSS compliance for card data"] },
      { trigger: "If raising equity funding (SAFE, Series A+)", items: ["SEC Registration or Exemption Filing", "Audited Financial Statements", "Legal opinion on cap table structure"] },
    ],
  },
  {
    id: "food-nafdac", label: "Food / NAFDAC", tagline: "Packaged food, beverages, supplements. Every stage from product registration to national distribution.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "No NAFDAC number. No shelf. No shelf. No business.",
        primary: [
          { name: "CAC Registration", note: "Production facility address must match registered address. NAFDAC will not process any product without a valid CAC certificate." },
          { name: "NAFDAC Product Registration", note: "Mandatory for all food, beverage, cosmetic, supplement, and water products. Unregistered products attract seizure and prosecution." },
          { name: "SON Standards Compliance", note: "Standards Organisation of Nigeria. Required for products with national quality benchmarks. SON can order destruction of non-conforming goods." },
          { name: "TIN + SCUML + VAT", note: "TIN for all transactions. SCUML mandatory for cash-intensive food businesses. VAT for institutional and export sales." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "Required for government feeding programmes, institutional supply contracts, and any formal procurement bid." },
        ],
        secondary: ["HACCP Certificate (required by major retail chains)", "Product liability insurance", "Distribution agreement template", "Supplier agreements", "Annual Returns"],
        automations: ["NAFDAC renewal tracker", "SON compliance alerts", "Supplier certification monitoring"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "FMCG cash flow is volume-driven. Your financial system must handle high-frequency, multi-channel transactions.",
        primary: [
          { name: "Corporate Bank Account", note: "Separate from personal. Required for distributor payments, retail chain onboarding, and institutional invoicing." },
          { name: "FMCG Financial Reporting", note: "COGS tracking per product, distributor account management, and real-time margin analysis. Know exactly where your money goes u2014 per product, per channel." },
          { name: "Distributor Payment Terms", note: "Payment terms policy: who gets credit, for how long, and what happens when they default. Undocumented credit is a cash flow killer." },
          { name: "VAT + PAYE + Payroll", note: "VAT on sales above threshold. PAYE for all production and office staff. Automated payroll prevents underpayment disputes." },
        ],
        secondary: ["Working capital line of credit", "Seasonal demand forecasting model", "Promotional spend budget", "Waste/yield tracking", "Insurance premiums management"],
        automations: ["Auto-invoicing to distributors", "COGS and margin tracking", "Distributor statement automation", "Payroll automation"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Food brands are built on trust, visibility, and shelf presence. in that order.",
        primary: [
          { name: "Packaging Design", note: "NAFDAC-compliant packaging with all required information. Packaging IS your marketing. It sells before any ad does." },
          { name: "Instagram (Product Lifestyle)", note: "Professional product photography, recipe content, lifestyle imagery. The #1 channel for FMCG brand building in Nigeria." },
          { name: "Product Website + E-commerce", note: "Product specs, where to buy, bulk order form. Consumers research before buying. Especially for health/supplement products." },
          { name: "WhatsApp Business Catalogue", note: "Product catalogue with prices and MOQs for bulk/distributor enquiries. Handles B2B sales at scale without a sales team." },
        ],
        secondary: ["Influencer / food blogger partnerships", "Google My Business listing", "Supermarket shelf materials (talkers, wobblers)", "Email newsletter for loyal customers", "Point-of-sale promotional materials"],
        automations: ["Instagram content scheduler", "WhatsApp Business auto-reply and catalogue", "Order tracking and confirmation automation"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "FMCG revenue is distribution coverage. The more shelves you're on, the more you sell.",
        primary: [
          { name: "Distribution Channel Strategy", note: "Define: direct-to-retail vs. distributor model vs. own e-commerce. Different margins, different cash flows, different risks." },
          { name: "Trade Pricing Structure", note: "RRP, distributor price, trade price, promotional price. documented, protected, and consistently enforced." },
          { name: "Distributor CRM", note: "Track every distributor. Sellout data, outstanding balances, territory coverage, promotional compliance." },
          { name: "Retail Onboarding Checklist", note: "What every new retail account needs: product spec sheet, price list, credit terms, NAFDAC number, minimum order." },
        ],
        secondary: ["Supermarket listing applications (Shoprite, SPAR)", "Sales rep territory management", "Trade promotion calendar", "Promotional ROI tracking"],
        automations: ["Distributor order and delivery tracking", "Sellout data collection (sell-through rates)", "Trade promotion calculator", "Reorder level alerts"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Production consistency and supply chain reliability determine whether your brand survives scale.",
        primary: [
          { name: "Production SOP (Batch Records)", note: "Documented recipe, quantities, process steps, QC checkpoints per batch. NAFDAC requires batch records for all registered products." },
          { name: "Inventory Management System", note: "Raw material stock levels, finished goods inventory, reorder points. Running out of stock costs you shelf space permanently." },
          { name: "Supplier Management", note: "Approved supplier list, quality specifications per input, delivery schedule, alternative sourcing plan." },
          { name: "Dispatch & Logistics SOP", note: "Order picking, packing standard, dispatch documentation, cold chain management (if applicable)." },
        ],
        secondary: ["Equipment maintenance schedule", "Waste and yield tracking per batch", "Recall procedure SOP", "Pest control contract", "Staff hygiene protocol (NAFDAC requirement)"],
        automations: ["Inventory reorder alerts", "Batch tracking system", "Supplier delivery monitoring", "Production schedule planner"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "FMCG businesses that scale have specialists. Not one person handling production, sales, and compliance simultaneously.",
        primary: [
          { name: "Production / Factory Manager", note: "Owns quality, output, NAFDAC compliance, and staff on the production floor." },
          { name: "Quality Control Officer", note: "NAFDAC-facing role. Manages product testing, batch records, NAFDAC inspections, and compliance documentation." },
          { name: "Sales / Distribution Manager", note: "Owns distributor relationships, retail listings, trade execution, and sellout targets." },
        ],
        secondary: ["Logistics coordinator", "Finance officer", "Marketing coordinator", "Customer service (B2B accounts)"],
        automations: ["Staff attendance system", "Training tracker (HACCP, food hygiene)", "Payslip automation"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If exporting food products internationally", items: ["NAFDAC Export Certificate", "NXP Form (via CBN)", "NEPC Export Registration", "Phytosanitary Certificate from NAQS"] },
    ],
  },
  {
    id: "oil-gas", label: "Oil & Gas", tagline: "Downstream, midstream, support services. Every stage from incorporation to winning IOC and NNPC contracts.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "NMDPRA will not license an improperly structured company. IOCs will not engage an uncertified vendor.",
        primary: [
          { name: "CAC Private Limited Company", note: "Min ₦100M share capital (upstream) / ₦10M (services/downstream). Objects clause must explicitly cover petroleum operations. Technical Director with petroleum engineering qualification mandatory." },
          { name: "SCUML / EFCC Account Registration", note: "Mandatory for all oil & gas companies under MLMASA 2022. Operating without EFCC/SCUML registration attracts direct investigation." },
          { name: "NMDPRA Operating Licence", note: "Upstream: Oil Mining Lease. Midstream: Pipeline/Gas Processing Licence. Downstream: Depot/Retail/Bulk Licence. Operating without the correct licence is a federal criminal offence." },
          { name: "NCDMB Local Content Certificate", note: "All NNPC and IOC contracts require verified local content. Without it, you are excluded from Nigeria's most valuable sector contracts." },
          { name: "TCC + ITF + NSITF + PenCom + BPP + HSE Cert", note: "All six required for NNPC/IOC vendor prequalification and government oil sector contracts. Missing one means no contract, no payment." },
        ],
        secondary: ["EIA from NESREA (before operations begin)", "NIPEX vendor registration", "Annual Returns", "PAYE registration", "IOC-specific prequalification documents"],
        automations: ["Licence renewal tracker", "NIPEX tender monitoring", "Compliance deadline alerts", "NCDMB reporting calendar"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Oil & gas runs on USD. Your financial infrastructure must handle multi-currency contracts and sector-specific tax.",
        primary: [
          { name: "Corporate Bank Account (tier-1)", note: "Tier-1 bank required for IOC/NNPC payment processing. USD domiciliary account mandatory for upstream and export operations." },
          { name: "Multi-Currency Accounting System", note: "USD and NGN tracking per contract, invoicing in the currency of the contract, and forex reconciliation." },
          { name: "Petroleum Profit Tax (PPT) Compliance", note: "Distinct from standard CIT. Oil sector companies are taxed under the PITA regime. different rates, different filing requirements." },
          { name: "Project Cost Control", note: "Cost tracking per contract. Mobilisation, direct costs, subcontractors, overheads. Oil contracts lose money through poor cost control, not bad prices." },
        ],
        secondary: ["Performance bond management", "Royalty payment accounting (upstream)", "Insurance premium tracking", "Forex hedging policy", "Subcontractor payment schedule"],
        automations: ["Multi-currency reconciliation", "Automated PAYE and PPT filing", "Project budget vs. actual tracking", "Subcontractor invoice processing"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "IOC procurement teams search your company before they invite you to bid. Your digital presence must match the contract size you want.",
        primary: [
          { name: "Professional Website with Capabilities", note: "Project history, equipment list, certifications, key personnel, NCDMB score. This is what IOC procurement teams evaluate before shortlisting." },
          { name: "LinkedIn Company Page (active)", note: "Decision-makers at Shell, TotalEnergies, and NNPC use LinkedIn for vendor discovery. An inactive page disqualifies you before the conversation starts." },
          { name: "Capability Statement Document", note: "4-page PDF: company overview, technical capabilities, key projects (with values), certifications, leadership. Submitted before every bid." },
          { name: "NCDMB Directory Listing", note: "Verified listing on the NCDMB Nigerian Content portal. The primary directory used by IOCs for vendor discovery." },
        ],
        secondary: ["NOG / ADIPEC trade fair presence", "Sector-specific PR and thought leadership", "Equipment and fleet photography", "ISO certification display"],
        automations: ["LinkedIn content scheduler", "IOC tender alert system", "Capability deck auto-update workflow"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "In oil & gas, relationships and prequalification win contracts. Price comes second.",
        primary: [
          { name: "NIPEX Profile Optimisation", note: "NNPC's procurement portal. Your NIPEX profile is how NNPC finds you. Incomplete profiles are invisible to procurement teams." },
          { name: "IOC Vendor Prequalification Tracker", note: "Shell, TotalEnergies, Chevron. Each has its own vendor registration system. Track status, renewal dates, and category expansions." },
          { name: "Tender Monitoring System", note: "Monitor BPP, NIPEX, DPR portals for new tenders. A bid missed is revenue permanently lost." },
          { name: "Procurement Relationship Database", note: "Named contacts at key MDAs and IOC procurement departments. Relationships determine who gets invited to bid." },
        ],
        secondary: ["JV/partnership agreement framework", "Local content plan per tender", "Bid preparation workflow", "Contract negotiation framework"],
        automations: ["BPP portal monitoring", "Bid deadline alerts", "NIPEX activity notifications", "Prequalification renewal tracking"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Field operations must be documented, tracked, and HSE-compliant at every moment. Non-compliance shuts sites.",
        primary: [
          { name: "HSE Management System", note: "Method statements, risk assessments, toolbox talks, permit-to-work, incident reporting. Mandatory for all site operations and IOC audits." },
          { name: "Field Operations SOP", note: "Documented procedures for every field activity. IOCs audit your SOPs before contract award. Not after." },
          { name: "Project Management for Active Contracts", note: "Programme, milestones, resource allocation, subcontractor management per contract." },
          { name: "NCDMB Local Content Reporting", note: "Monthly local content reports required by NCDMB for active contracts. Non-compliance puts your NCDMB certificate at risk." },
        ],
        secondary: ["Equipment and asset tracking", "Site incident reporting system", "Subcontractor performance management", "Environmental monitoring records", "Expatriate quota management"],
        automations: ["HSE compliance tracker", "Field reporting app (OFS Portal)", "Contract milestone alerts", "NCDMB reporting automation"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Oil & gas contracts require specific qualified professionals. Without them, you cannot bid.",
        primary: [
          { name: "Technical Director (petroleum engineer)", note: "Mandatory NMDPRA requirement. Must hold relevant professional qualification (OIM, SPE membership, or equivalent)." },
          { name: "HSE Officer (NEBOSH / IOSH certified)", note: "Required for all site operations. IOCs will not commence work without a qualified HSE officer named on the contract." },
          { name: "Business Development Manager", note: "Owns the tender pipeline. monitoring, prequalification, bid preparation, and procurement relationships." },
          { name: "Finance / Cost Controller", note: "Multi-currency accounting, project cost control, PPT compliance, and IOC billing management." },
        ],
        secondary: ["Legal / compliance officer", "Procurement specialist", "Site supervisors (trade-certified)", "Local content coordinator", "NCDMB reporting officer"],
        automations: ["Staff HSSE training tracker", "Expatriate quota management", "HSE certification renewal alerts"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If operating petroleum tankers or vessel transport", items: ["NIMASA Vessel Registration", "NPA Operational Permit", "NUPRC Tank Calibration Certificate"] },
      { trigger: "If handling radioactive materials (uranium, thorium, isotopes)", items: ["NNSA Radioactive Material Licence. federal offence to operate without it", "NNSA Radiation Protection Certificate", "IAEA safeguards notification"] },
    ],
  },
  {
    id: "export", label: "Export", tagline: "Commodities, agro-produce, manufactured goods. Every stage from entity setup to consistent international sales.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Individual exporters have no legal standing. Every document routes through your registered company.",
        primary: [
          { name: "CAC Private Limited Company", note: "NEPC, customs, and international buyers require a registered company. Objects clause must cover trading and export." },
          { name: "NEPC Registration", note: "Mandatory for all exporters. Required for NXP form approval, FOREX repatriation, and NEPC export incentive access." },
          { name: "TIN + SCUML + NXP Form", note: "TIN for customs processing. SCUML for commodity exporters. NXP (via CBN) for every shipment. Without it, cargo won't clear." },
          { name: "TCC + ITF + NSITF + PenCom", note: "Required for NEXIM Bank export financing, NEPC incentive programmes, and government export support schemes." },
        ],
        secondary: ["NAFDAC export cert (food/pharma)", "Phytosanitary certificate from NAQS (agro)", "Certificate of Origin (Chamber of Commerce)", "SON conformity assessment (manufactured goods)", "Annual Returns"],
        automations: ["Export licence renewal tracker", "NXP compliance monitoring", "Shipment document checklist automation"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Export revenue is in foreign currency. Your financial system must handle FX professionally.",
        primary: [
          { name: "Corporate Bank Account + Domiciliary Account", note: "NGN account for local costs. USD/EUR domiciliary account for export proceeds and international buyer payments." },
          { name: "Multi-Currency Invoicing", note: "Incoterms-aware pricing (FOB, CIF, EXW) in the buyer's currency. Incorrect Incoterms create massive liability disputes." },
          { name: "Export Credit Insurance (NEXIM)", note: "Protects you if an international buyer defaults on payment. Required for NEXIM Bank trade finance facilities." },
          { name: "FOREX Repatriation Compliance", note: "CBN NXP rules require export proceeds repatriated within 180 days. Violations attract CBN sanctions and blacklisting." },
        ],
        secondary: ["Working capital / export pre-finance facility", "Letter of credit management procedure", "Trade finance facility (NEXIM Bank)", "Forex hedging policy"],
        automations: ["FX rate alerts", "Domiciliary account reconciliation", "NXP compliance tracking", "Export revenue vs. cost analysis"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "International buyers research Nigerian exporters carefully before sending payment. Your digital presence is your reference check.",
        primary: [
          { name: "Export Business Website", note: "Product specs, certifications, MOQ, production capacity, contact. International buyers Google you before wiring money." },
          { name: "LinkedIn Company Page", note: "International trade buyers verify exporter credibility on LinkedIn. An active, professional page builds trust before first contact." },
          { name: "B2B Marketplace Listings", note: "Alibaba, TradeIndia, Made-in-Nigeria, Africa Export Directory. Where international buyers actively search for Nigerian suppliers." },
          { name: "Product Photography + Spec Sheets", note: "Professional product photos and specification sheets in international formats. Low-quality visuals kill deals before any negotiation." },
        ],
        secondary: ["NEPC-supported trade fair participation", "Export-focused content strategy", "Country-specific market entry materials", "Halal / Kosher certification display (where applicable)"],
        automations: ["B2B marketplace auto-responder", "Enquiry management system", "Export portfolio tracker"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Export sales is about building trust at distance. relationships, samples, and documentation close deals.",
        primary: [
          { name: "International Buyer CRM", note: "Every prospect tracked. Country, product interest, sample status, last contact, deal stage. Distance kills deals without systematic follow-up." },
          { name: "Proforma Invoice + Sales Contract", note: "International-standard proforma with product specs, Incoterms, price validity, and payment terms. Legally enforceable in destination jurisdictions." },
          { name: "Sample Management Process", note: "How samples are dispatched, tracked, and followed up. A buyer who requested a sample and heard nothing is a lost deal." },
          { name: "Letter of Credit Handling", note: "LC receipt, document preparation, compliant presentation to bank, proceeds collection. One documentary discrepancy delays payment by weeks." },
        ],
        secondary: ["Agent / distributor agreements per market", "Country-specific payment terms strategy (TT, LC, escrow)", "JV/partnership framework for market entry"],
        automations: ["International enquiry follow-up automation", "Proforma invoice generator", "Shipment tracking integration", "Payment receipt alerts"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Every export shipment is a chain of handoffs. Any break in the chain costs the entire consignment.",
        primary: [
          { name: "Export Documentation SOP", note: "Standard checklist: NXP, commercial invoice, packing list, bill of lading, cert of origin, product-specific certs. All documents must be 100% consistent." },
          { name: "Freight Forwarder Management", note: "Vetted freight forwarder with experience in your commodity and destination market. Wrong forwarder costs you money and missed sailings." },
          { name: "Quality Control Before Shipment", note: "QC inspection protocol before container sealing. Rejected cargo at destination costs the entire consignment. With no refund." },
          { name: "Customs Clearing Agent Management", note: "Reliable NCS-licensed clearing agent at export port. Delays at the port cost demurrage and damage relationships with buyers." },
        ],
        secondary: ["Cold chain management (for perishables)", "Warehouse and loading SOP", "Returns and disputes handling procedure", "Shipping insurance policy"],
        automations: ["Shipment tracking system", "Customs documentation checklist", "Freight quote comparison tool", "Container seal number tracking"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Export success requires specialist knowledge. international trade, documentation, and FX management are distinct competencies.",
        primary: [
          { name: "Export Manager / Trade Coordinator", note: "Owns the entire export cycle. documentation, buyer relationships, shipment coordination, FOREX repatriation." },
          { name: "Quality Control Officer", note: "Ensures every shipment meets destination country standards before it leaves the warehouse." },
          { name: "Finance / FOREX Officer", note: "Manages international buyer invoices, LC processing, domiciliary account operations, and CBN NXP compliance." },
        ],
        secondary: ["Logistics coordinator", "Customer relationship manager (international accounts)", "Documentation specialist"],
        automations: ["Staff documentation training tracker", "Payslip automation", "Leave management"],
        by: "Skills",
      },
    ],
  },
  {
    id: "mining", label: "Mining", tagline: "Solid minerals, quarrying, processing. Every stage from legal setup to investor-ready operations.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Individual mining is illegal in Nigeria. Every extraction operation requires specific licences. And the penalties for operating without them are severe.",
        primary: [
          { name: "CAC Private Limited Company", note: "Individual mining is illegal under the Minerals Act. Objects clause must cover exploration and extraction. Min ₦50M share capital (large-scale), ₦10M (small-scale). Technical Director (geologist/mining engineer) mandatory." },
          { name: "Mining Licence (MMSD)", note: "Reconnaissance Permit → Exploration Licence → Mining Lease. Operating at any phase without the correct licence is a criminal offence. Ministry can seal the site and arrest principals." },
          { name: "SCUML / EFCC Registration", note: "Mining is a DNFBP. SCUML registration is mandatory. EFCC actively monitors the sector for illegal mineral proceeds." },
          { name: "EIA from NESREA", note: "Required before any extraction begins. Violations attract prosecution, large fines, and permanent site closure." },
          { name: "TCC + ITF + NSITF + PenCom + Royalty Registration", note: "Tax clearance for operations. Royalty registration with MMSD before first extraction. All compliance certificates for institutional off-take agreements." },
        ],
        secondary: ["Community Development Agreement (host community)", "NEPC export licence (if exporting minerals)", "Annual Returns", "PAYE for site workers", "State mineral statute compliance"],
        automations: ["Mining licence renewal tracker", "Royalty payment reminders", "MMSD reporting calendar", "Environmental monitoring alerts"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Mining revenue is lumpy. Your financial system must manage extraction cycles, royalties, and export proceeds.",
        primary: [
          { name: "Corporate Bank Account + Domiciliary", note: "NGN for local operations. USD account for mineral export proceeds from international buyers." },
          { name: "Project Cost Accounting", note: "Separate cost centres for exploration, extraction, processing, and administration. Mining capex/opex separation is critical for investor reporting." },
          { name: "Royalty Management System", note: "Automatic calculation of royalty obligations per mineral type (MMSD royalty schedule). Late payment = licence suspension." },
          { name: "PAYE + Payroll for Site Workers", note: "All site workers on payroll with PAYE remittance. Informal payment of site workers is a major FIRS audit trigger." },
        ],
        secondary: ["Mineral inventory valuation", "Capital equipment depreciation schedule", "Foreign buyer payment management", "Working capital facility"],
        automations: ["Royalty calculation automation", "Mineral sales tracking", "Site worker payroll", "MMSD payment reminders"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Serious mineral buyers and investors research before they visit your site. Your documentation is your marketing.",
        primary: [
          { name: "Company Website with Geological Summary", note: "Mineral type, estimated reserves, licence status, location, contact. International buyers assess your site viability from your website before travelling." },
          { name: "Investment / Capabilities Deck", note: "Geological report summary, licence documentation, reserve estimates, leadership team, investment ask. Required for any serious off-take or investment conversation." },
          { name: "LinkedIn Company Page", note: "International mining investors and off-take buyers use LinkedIn to verify Nigerian operators before engagement." },
          { name: "Mineral Sample Portfolio", note: "Assay certificates, sample photos, lab analysis reports. Buyers request samples before any negotiation. Be ready to send professional documentation." },
        ],
        secondary: ["Mining investment conference presence (MINEXAFRICA)", "Industry directory listings", "Geological report publication (summary version)", "International commodity exchange registration"],
        automations: ["Investor enquiry management", "Site visit scheduling", "Sample request and dispatch tracking"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Mineral sales require documentation, verified reserves, and trust. International buyers do not wire money without all three.",
        primary: [
          { name: "Off-Take Agreement Template", note: "Long-term or spot purchase agreement. Price formula (LME/COMEX benchmark), quantity, quality specs, delivery terms, payment structure." },
          { name: "Geological Reserve Report", note: "Third-party certified geological report. Required by all serious off-take buyers and investors as proof of reserve viability." },
          { name: "Assay Certificate Management", note: "Current assay certificates per mineral type, per batch. International buyers verify assay independently. Certificates must come from accredited labs." },
          { name: "Buyer Due Diligence Package", note: "CAC cert, mining licence, EIA, MMSD royalty clearance, export licence, geological report. Everything a buyer needs for their compliance check, pre-assembled." },
        ],
        secondary: ["Commodity pricing strategy (LME/COMEX peg)", "Export logistics coordination", "JV/partnership framework for investor entry"],
        automations: ["Commodity price alert system", "Off-take buyer CRM", "Assay scheduling tracker", "Payment receipt alerts"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "A mining operation without documented processes is a health hazard, an environmental liability, and a legal risk. Simultaneously.",
        primary: [
          { name: "Mining Operations SOP", note: "Extraction procedures, blasting protocols (if applicable), ore handling, stockpile management. Required for site insurance and MMSD compliance audits." },
          { name: "Safety Management System", note: "Incident reporting, near-miss tracking, emergency response plan, first aid provision. Mining sites have the highest workplace fatality rate of any industry." },
          { name: "Environmental Monitoring Records", note: "Water quality, air quality, soil disruption records. Required by NESREA for licence renewal. Missing records = licence at risk." },
          { name: "Community Liaison Programme", note: "Regular engagement, development fund management, grievance mechanism. Community conflict is the #1 cause of mine shutdowns in Nigeria." },
        ],
        secondary: ["Equipment maintenance log (excavators, crushers, conveyors)", "Illegal mining prevention protocol", "Site security system", "Waste/tailings management plan"],
        automations: ["Equipment maintenance tracking", "Environmental monitoring alerts", "Community relations log", "Site incident report system"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Mining requires qualified professionals by law. Without them, your licence application will be rejected.",
        primary: [
          { name: "Mine Manager (qualified mining engineer)", note: "Technical head of operations. Required by MMSD for all mining licence applications and renewals." },
          { name: "Geologist", note: "Reserve estimation, geological mapping, sampling oversight. The technical foundation for all investor and buyer conversations." },
          { name: "HSE Officer", note: "Mandatory for all extraction sites. MMSD and NESREA both require a named HSE officer for site operations." },
          { name: "Community Liaison Officer", note: "Manages relationships with host communities. Prevents the site shutdowns that derail more mining projects than any regulatory issue." },
        ],
        secondary: ["Environmental compliance officer", "Finance controller (cost + royalty)", "Equipment operator (certified)", "Security coordinator"],
        automations: ["Staff safety training tracker", "Certification renewal alerts", "Site attendance tracking"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If mining radioactive minerals (uranium, thorium, monazite)", items: ["NNSA Radioactive Material Licence. operating without it is a federal offence", "NNSA Radiation Protection Certificate", "IAEA safeguards notification (uranium above threshold)"] },
      { trigger: "If processing minerals into chemicals or pharmaceutical inputs", items: ["NAFDAC registration for processed outputs", "SON conformity assessment", "Factory licence from state ministry"] },
    ],
  },
  {
    id: "travel-agency", label: "Travel Agency", tagline: "Ticketing, tours, visa services. Every stage from accreditation to a profitable agency business.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Airlines and GDS platforms only work with accredited, registered, and SCUML-compliant agencies.",
        primary: [
          { name: "CAC Registration (BN or Ltd)", note: "Airlines, GDS systems, and IATA require a registered entity before granting agency access or BSP agreement." },
          { name: "NIHOTOUR / NTA Licence", note: "Mandatory for legally operating a travel agency. Operating without it risks shutdown and prosecution under the Tourism Act." },
          { name: "SCUML Registration", note: "Travel agents are designated non-financial businesses. SCUML registration is mandatory under MLMASA 2022." },
          { name: "IATA Accreditation", note: "Unlocks BSP ticketing and agent-rate fares. Without IATA, you cannot compete on airline ticket pricing with accredited agencies." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "All required for government travel management contracts and institutional travel accounts." },
        ],
        secondary: ["TIN + VAT + PAYE", "Client service agreement template", "Annual Returns", "CBN BDC licence (if selling forex)", "NANTA membership"],
        automations: ["IATA renewal tracker", "NIHOTOUR compliance alerts", "Corporate travel contract reminders"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Travel agency revenue is commission-based and high-volume. Your financial system must track it precisely.",
        primary: [
          { name: "Corporate Bank Account", note: "Required for BSP settlement (IATA), corporate travel billing, and forex transactions." },
          { name: "BSP Reconciliation System", note: "IATA Billing & Settlement Plan reconciliation. Matches tickets issued vs. commission received. Discrepancies cost your BSP status." },
          { name: "Commission Tracking", note: "Per-airline, per-hotel, per-tour operator commission tracking. Untracked commissions are unrecovered revenue." },
          { name: "VAT on Service Fees", note: "VAT applies to service fees (not ticket face value). Must be filed monthly if you meet the threshold." },
        ],
        secondary: ["Forex management for BTA/PTA", "Client travel credit management", "Insurance premium accounting", "Payroll for agents"],
        automations: ["BSP auto-reconciliation", "Commission tracking automation", "Monthly VAT filing reminders", "Payroll automation"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Travel is aspirational. Your marketing must make people want to move.",
        primary: [
          { name: "Agency Website with Destination Pages", note: "Destination inspiration, package listings, booking enquiry form. Travellers compare agencies online before calling." },
          { name: "Instagram (Destination Photography)", note: "Lifestyle destination content. The #1 driver of travel inspiration in Nigeria. Beautiful content generates bookings directly." },
          { name: "WhatsApp Business Catalogue", note: "Travel packages with photos, prices, inclusions, and booking CTA. Most Nigerian travel bookings are closed on WhatsApp." },
          { name: "Google My Business Listing", note: "Local discovery for walk-in clients and referral-driven searches. Reviews drive credibility better than any ad." },
        ],
        secondary: ["Facebook travel community management", "Email newsletter (travel deals)", "YouTube destination videos", "Travel blog for SEO"],
        automations: ["Instagram content scheduler", "WhatsApp auto-reply and catalogue", "Review request automation", "Email deal newsletter automation"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Travel sales is relationship-first. Corporate accounts are worth 10x any walk-in client.",
        primary: [
          { name: "Corporate Travel Account Management", note: "Dedicated account management for companies with regular travel needs. One corporate account can be ₦5M+ per year." },
          { name: "Travel Quotation System", note: "Fast, professional quotes with full inclusions, exclusions, validity, and booking deadline. Slow quotes lose bookings to competitors." },
          { name: "Group / MICE Booking Pipeline", note: "Meetings, incentives, conferences, events. High-value bookings that require dedicated sales process and documentation." },
          { name: "Client Travel Profile Database", note: "Passport details, seat preferences, meal requirements, loyalty numbers. Personalisation builds loyalty faster than discounts." },
        ],
        secondary: ["Referral incentive programme", "Loyalty programme for frequent travellers", "Visa processing upsell system", "Hotel + experience partnership pricing"],
        automations: ["Travel quote generator", "Booking confirmation automation", "Group travel management system", "Client birthday / anniversary marketing"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Travel operations require zero errors. One missed visa, one wrong flight date, and you lose a client permanently.",
        primary: [
          { name: "Booking SOP (Flight + Hotel + Visa + Insurance)", note: "Step-by-step process for every booking type. Every team member follows the same checklist, every time." },
          { name: "Visa Application Tracking", note: "Submission date, embassy reference, passport return date. tracked per client. A missed visa deadline ends the client relationship." },
          { name: "GDS Proficiency (Amadeus/Sabre)", note: "Full team training on GDS. Ticket issuance, modifications, reissuance, BSP reconciliation." },
          { name: "Emergency Support Protocol", note: "24/7 support for clients in transit. Missed connections, cancelled flights, lost documents. Clients who feel abandoned never return." },
        ],
        secondary: ["Supplier (airline/hotel) relationship management", "Travel documentation checklist per destination", "Refund and cancellation management SOP"],
        automations: ["Visa deadline tracker", "Booking confirmation automation", "GDS pricing alert system", "Client itinerary auto-generation"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Travel agencies that grow have specialists. Not one person issuing tickets, doing visas, and managing corporate accounts simultaneously.",
        primary: [
          { name: "IATA-Certified Ticketing Officer", note: "GDS-proficient, IATA-trained. The core technical role in any travel agency." },
          { name: "Visa Processing Specialist", note: "Embassy procedures, documentation requirements, success rate tracking. Visa expertise is a major competitive differentiator." },
          { name: "Corporate Accounts Manager", note: "Owns the top 10 corporate relationships. Each relationship is worth multiples of any individual booking." },
        ],
        secondary: ["Social media / marketing coordinator", "Finance / BSP reconciliation officer", "Customer service officer"],
        automations: ["Staff GDS training tracker", "BSP certification renewal alerts", "Payslip automation"],
        by: "Skills",
      },
    ],
  },
  {
    id: "healthcare", label: "Healthcare", tagline: "Clinics, pharmacies, diagnostics. Every stage from legal authority to a thriving patient-centred practice.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Healthcare regulations are actively enforced. Non-compliant facilities are sealed without warning. And there is no grace period.",
        primary: [
          { name: "CAC Private Limited Company", note: "Professional directors (MDCN/PCN registered) must be named. Personal liability is unlimited without corporate structure." },
          { name: "State Ministry of Health Facility Licence", note: "Mandatory before opening. Surprise inspections happen. Non-licensed facilities are sealed immediately and principals prosecuted." },
          { name: "MDCN / PCN / MLSCN Registration", note: "All practitioners must be registered with their respective professional bodies. Unregistered practice is a criminal offence." },
          { name: "NHIA Accreditation", note: "Unlocks the HMO patient base. The largest and fastest-growing healthcare revenue stream. Non-accredited facilities cannot access it." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "Required for government health contracts, HMO panel approval, NHIA procurement, and teaching hospital supply agreements." },
        ],
        secondary: ["NAFDAC drug dispensing licence (pharmacy)", "SCUML registration (cash-intensive practices)", "TIN + VAT + PAYE", "Annual Returns", "BPP vendor registration"],
        automations: ["Facility licence renewal tracker", "Professional registration alerts", "NHIA compliance calendar"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "HMO reimbursements, cash payments, and government contracts each need separate tracking. Or revenue leaks everywhere.",
        primary: [
          { name: "Corporate Bank Account", note: "Required for HMO payments, government contract receipts, and institutional invoicing." },
          { name: "Healthcare Financial Reporting", note: "Separate cost centres for HMO revenue, cash revenue, drug sales, and diagnostic revenue. Accurate reporting per revenue stream." },
          { name: "NHIA Capitation Tracking", note: "Monthly capitation payments from NHIA tracked per enrolled beneficiary. Discrepancies must be disputed within the billing cycle." },
          { name: "Drug Inventory Valuation", note: "Pharmaceutical stock valued at cost, selling price tracked per item, expiry monitoring. Drug inventory is your largest asset after equipment." },
          { name: "PAYE + Payroll for Clinical Staff", note: "Doctors, pharmacists, nurses. All on payroll with PAYE remittance. Informal clinical staff payment creates unlimited employment liability." },
        ],
        secondary: ["HMO claims management system", "Capital equipment depreciation schedule", "Government contract payment tracking", "Insurance premium management"],
        automations: ["HMO claims automation", "Drug reorder alerts (minimum stock levels)", "Payroll automation", "Government invoice tracker"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Patients research healthcare providers before booking. Your digital presence is your first consultation.",
        primary: [
          { name: "Professional Website", note: "Services, specialisms, credentials, doctor profiles, booking. A professional site builds trust before the patient calls." },
          { name: "Google My Business (Optimised)", note: "The #1 way patients discover local healthcare providers. Verified listing with photos, hours, reviews drives daily walk-ins." },
          { name: "Instagram (Health Education Content)", note: "Health tips, condition awareness, team profiles. Education content builds community trust. And trust drives referrals." },
          { name: "WhatsApp Business", note: "Appointment booking, prescription reminders, health alerts. Patients prefer WhatsApp to phone calls for routine interactions." },
        ],
        secondary: ["Community health talks and screenings", "Patient newsletter (email/WhatsApp)", "Facebook local community group presence", "Referral doctor relationship programme"],
        automations: ["Appointment booking and reminder system", "Review request automation", "WhatsApp health broadcast list", "Content scheduler"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "In healthcare, 'sales' means patient trust, HMO relationships, and institutional contracts. All three require different approaches.",
        primary: [
          { name: "HMO Panel Application Strategy", note: "Priority HMOs by patient volume in your catchment area. Each panel adds a direct patient referral channel worth hundreds of consultations per year." },
          { name: "Corporate Health Package Pricing", note: "Bundled health packages for companies. Annual checkups, telemedicine, emergency coverage. One corporate health contract is worth 100+ individual consultations." },
          { name: "Patient Retention Programme", note: "Recall system, follow-up protocol, chronic disease management. Retained patients refer 3x more than new patients." },
          { name: "Referral Doctor Network", note: "Relationships with GPs, specialists, and pharmacists who refer to your facility. Referral networks drive premium, pre-sold patients." },
        ],
        secondary: ["NHIA capitation maximisation strategy", "Health screening corporate packages", "Patient loyalty programme"],
        automations: ["Patient appointment reminders", "HMO claims submission", "Recall and follow-up automation", "Corporate health billing"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Clinical operations must be documented, reproducible, and compliant at every patient interaction. No exceptions.",
        primary: [
          { name: "Clinical SOPs", note: "Consultation protocol, drug dispensing procedure, diagnostic result communication, referral pathway. MDCN and MOH both audit clinical SOPs." },
          { name: "Electronic Medical Records (EMR)", note: "Patient records system with appointment scheduling, consultation notes, prescription history, billing. Paper records create compliance, billing, and liability risks." },
          { name: "Drug Inventory Management", note: "FIFO dispensing, expiry monitoring, controlled drug register (for Schedule I/II substances), NAFDAC waybill compliance." },
          { name: "Medical Waste Disposal System", note: "Contracted waste management with certified medical waste contractor. Improper disposal attracts NESREA prosecution." },
          { name: "Staff Scheduling System", note: "Rota management for doctors, nurses, and support staff. Coverage gaps create clinical risk and patient experience failures." },
        ],
        secondary: ["Infection control protocol", "Equipment maintenance schedule", "Patient complaint management SOP", "Insurance claims management"],
        automations: ["EMR appointment scheduling", "Drug reorder and expiry alerts", "Medical waste disposal tracking", "Staff rota automation"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Healthcare team composition is regulated. The right professionals in the right roles determine your accreditation status.",
        primary: [
          { name: "Registered Medical / Dental Practitioner", note: "MDCN-registered. Mandatory for any facility holding a State MOH licence. The absence of a registered doctor voids your facility licence." },
          { name: "Registered Pharmacist", note: "PCN-registered. Mandatory for any pharmacy or drug dispensing operation. Operating without a registered pharmacist is a criminal offence." },
          { name: "Registered Nurse / Midwife", note: "NMCN-registered. Required for in-patient, maternity, and procedural facilities by State MOH regulations." },
          { name: "Receptionist / Patient Coordinator", note: "First touchpoint for every patient. Communication quality, appointment management, and billing accuracy all depend on this role." },
        ],
        secondary: ["Lab scientist (MLSCN registered)", "Radiographer (RRBN registered)", "Health records officer", "Billing and insurance officer"],
        automations: ["Professional registration renewal tracker", "Staff rota system", "Training and CPD hours tracker"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If operating a diagnostic / imaging centre", items: ["Radiographers Registration Board of Nigeria (RRBN) registration", "NNSA Nuclear Medicine Licence (for PET/nuclear imaging)", "Radiation safety certificate"] },
    ],
  },
  {
    id: "real-estate", label: "Real Estate", tagline: "Development, agency, property management. Every stage from AML compliance to premium market positioning.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Real estate is the most AML-monitored sector in Nigeria. Non-compliance means EFCC investigation, not just a fine.",
        primary: [
          { name: "CAC Private Limited Company", note: "₦5M+ paid-up capital recommended. Property transactions above ₦5M attract AML scrutiny. Corporate structure protects personal assets." },
          { name: "SCUML Registration (Non-Negotiable)", note: "Real estate agents and developers must register with SCUML under MLMASA 2022. Non-registration = EFCC investigation. This is not optional." },
          { name: "TIN + VAT + PAYE", note: "VAT on commercial property transactions. PAYE for all agents, staff, and contractors on payroll. TIN required for all property sale proceeds." },
          { name: "Certificate of Occupancy per Property", note: "Without perfected title (C of O), deals can be reversed in court and banks will not mortgage the property." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "Required for government housing contracts, FHA/FCDA transactions, NHF-funded developments, and federal property procurement." },
        ],
        secondary: ["Building Plan Approval (FCDA/State Planning)", "ESVARBON registration (surveyors/valuers)", "REDAN membership", "FMBN developer registration (NHF)", "Annual Returns"],
        automations: ["SCUML renewal tracker", "Property title monitoring system", "AML transaction alert system"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Development finance, client deposits, and contractor payments all need separate tracking. Or you lose money and clients simultaneously.",
        primary: [
          { name: "Corporate Bank Account + Client Escrow Account", note: "Client deposits held in a separate escrow account. Commingling client deposits with operating funds is a criminal breach of trust." },
          { name: "Development Finance Tracking", note: "Cost per unit, construction drawdown schedule, sales proceeds tracking, profit margin per development. Projects that run over budget usually do so because no one was tracking." },
          { name: "Payment Plan Management", note: "Instalment tracking per client, outstanding balances, default triggers, and completion milestones tied to payment receipts." },
          { name: "VAT on Commercial Property", note: "VAT applies to commercial property transactions above the threshold. Incorrect VAT treatment creates FIRS audit exposure." },
        ],
        secondary: ["Mortgage referral partner relationships", "Rental income accounting (for managed properties)", "NHF mortgage proceeds management", "Insurance premium tracking"],
        automations: ["Payment milestone reminders per client", "Development cost vs. budget tracker", "Deed of assignment workflow trigger on full payment"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Premium buyers compare extensively online before making contact. Your digital presence must match your asking price.",
        primary: [
          { name: "Property Website with Listings", note: "Professional photography, floor plans, virtual tours, price, location map. Premium buyers dismiss agencies with poor websites. Before any conversation." },
          { name: "Instagram (Development Showcase)", note: "Construction progress updates, completed unit walkthroughs, lifestyle content. The #1 platform for Nigerian property marketing at the premium tier." },
          { name: "LinkedIn (Investor Relations)", note: "Co-investors, joint venture partners, and institutional buyers are on LinkedIn. Serious property developers need an active professional presence." },
          { name: "Property Portal Listings", note: "PropertyPro, Nigeria Property Centre, Jumia House. where active property buyers search. Listings drive direct enquiries daily." },
        ],
        secondary: ["WhatsApp Business for enquiry management", "YouTube virtual tour videos", "Google My Business listing", "Referral agent network management"],
        automations: ["Property listing syndication across portals", "Enquiry auto-response", "Virtual tour booking system", "Investor update email automation"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Property sales is a long relationship. From first enquiry to deed of assignment can take months and requires systematic management.",
        primary: [
          { name: "CRM for Buyer Pipeline", note: "Every prospect tracked. Enquiry source, budget, preferred location, viewing status, offer stage. Property CRM prevents revenue leaking through unmanaged follow-ups." },
          { name: "Sale Agreement + Deed of Assignment Templates", note: "Professionally drafted, counsel-reviewed transaction documents. Every property sale without proper documentation creates title disputes." },
          { name: "Mortgage Referral Process", note: "Structured relationships with FMBN, commercial banks, and mortgage brokers. Buyers who can't fund themselves often can with the right mortgage referral." },
          { name: "Off-Plan Sales Management", note: "Sales process, payment schedule, construction milestone communication, and buyer expectation management for pre-construction projects." },
        ],
        secondary: ["Investor relations programme (for co-investment)", "Referral agent commission system", "Buyer qualification process", "VIP preview event system"],
        automations: ["Payment milestone reminders per buyer", "Deed of assignment workflow automation", "Buyer communication automation", "Mortgage application status tracking"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "A development that runs over budget or behind schedule destroys your reputation and your margin. Simultaneously.",
        primary: [
          { name: "Construction Project Management", note: "Programme of works, milestone tracking, contractor management, material procurement per development." },
          { name: "Contractor Management System", note: "Scope of work, payment schedule, quality inspection protocol, variation management. Unmanaged contractors are the biggest cost overrun risk." },
          { name: "Site Progress Reporting", note: "Weekly site reports to management and (for off-plan) to buyers. Buyers who receive regular updates raise fewer panicked calls." },
          { name: "Handover Documentation", note: "Punch list management, snag resolution, handover inspection checklist, keys + documents package. A smooth handover drives referrals." },
        ],
        secondary: ["Defects liability management (12-24 months)", "Facility management SOP (for managed properties)", "Tenant management system (for rental portfolio)", "Maintenance request management"],
        automations: ["Construction progress tracker", "Contractor invoice management", "Handover checklist automation", "Tenant payment tracking"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Property professionals with the right qualifications are legally required for valuation, development, and investment advisory.",
        primary: [
          { name: "Estate Surveyor / Valuer (ESVARBON)", note: "ESVARBON-registered. Required for all property valuations, investment advisory, and professional management mandates." },
          { name: "Sales Manager", note: "Owns the buyer pipeline. enquiries, viewings, negotiations, closings. Commission-driven sales management is the engine of any property business." },
          { name: "Project Manager (for developments)", note: "Controls timeline, budget, contractor quality, and milestone delivery. The difference between a profitable and loss-making development." },
          { name: "Legal Officer", note: "Reviews and prepares all transaction documents. Sale agreements, deeds, C of O applications. One bad document costs more than the officer's annual salary." },
        ],
        secondary: ["Marketing coordinator", "Finance officer", "Property manager (rental portfolio)", "Customer service / after-sales officer"],
        automations: ["Staff performance tracking (sales targets)", "Commission calculation automation", "Professional registration renewal alerts"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If accepting NHF mortgage payments", items: ["FMBN developer registration", "NHF loan verification certificate from FMBN"] },
      { trigger: "If managing commercial properties professionally", items: ["ESVARBON registration", "Property management agreement in ESVARBON-compliant format"] },
    ],
  },
  {
    id: "logistics", label: "Logistics", tagline: "Haulage, freight, last-mile. Every stage from permits to winning long-term corporate contracts.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "One impoundment or accident without proper documentation can shut your entire fleet and personal assets simultaneously.",
        primary: [
          { name: "CAC Registration (BN or Ltd)", note: "Ltd preferred for institutional clients. E-commerce platforms and manufacturers require registered companies for formal onboarding." },
          { name: "FRSC Road Haulage Permit", note: "Commercial vehicles without valid permits are impounded at checkpoints. One impoundment costs more than years of compliance fees." },
          { name: "Commercial Vehicle Insurance", note: "Any accident without commercial insurance creates unlimited personal liability. Legally required for all commercial vehicle operations." },
          { name: "SCUML Registration", note: "Mandatory for freight forwarders and cargo handlers under MLMASA 2022. EFCC monitors high-cash logistics operators." },
          { name: "TCC + ITF + NSITF + PenCom + BPP", note: "All five required for institutional logistics contracts, government transport agreements, and e-commerce platform partnerships." },
        ],
        secondary: ["NSC registration (for port/freight operations)", "NPA port operator permit (for seaport operations)", "PAYE + VAT registration", "Annual Returns", "Carrier's liability insurance"],
        automations: ["Vehicle licence renewal tracker", "Insurance renewal alerts", "FRSC compliance calendar", "BPP tender monitoring"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Logistics revenue is high volume and low margin. Financial precision separates profitable operations from cash-flow disasters.",
        primary: [
          { name: "Corporate Bank Account", note: "Required for institutional billing, government contract payments, and fleet financing applications." },
          { name: "Fleet Cost Accounting", note: "Per-vehicle fuel, maintenance, insurance, driver cost tracking. Know which vehicle makes money and which bleeds it." },
          { name: "Fuel Management System", note: "Fuel is the largest variable cost in logistics. Fuel card system with per-vehicle tracking eliminates leakage and driver fraud." },
          { name: "PAYE + Payroll for Drivers", note: "All drivers on formal payroll with PAYE remittance. Informal driver payment creates FIRS audit risk and employment liability." },
        ],
        secondary: ["Fleet financing facility (asset finance)", "Maintenance reserve fund", "Contract receivables management", "Cargo insurance premium tracking"],
        automations: ["Fuel expense tracking per vehicle", "Driver payroll automation", "Contract billing automation", "Maintenance cost alerts"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Corporate logistics clients search for proven, reliable operators. Your track record must be visible and verifiable.",
        primary: [
          { name: "Professional Website", note: "Fleet list with photos, coverage map, service types, tracking capability, client testimonials. Corporate procurement managers evaluate this before calling." },
          { name: "LinkedIn Company Page", note: "B2B logistics development. Manufacturers, retailers, and FMCG companies are on LinkedIn. An active presence generates corporate enquiries." },
          { name: "Google My Business Listing", note: "Local business discovery for SMEs needing logistics support. Verified reviews drive credibility without advertising spend." },
          { name: "Fleet Photography", note: "Professional photos of your fleet, branding, GPS tracking screens. Institutional clients assess equipment quality from photos before engagement." },
        ],
        secondary: ["Industry directory listings (Logistics Association of Nigeria)", "Client testimonial videos", "LinkedIn content (fleet expansion, new routes)", "WhatsApp Business for direct enquiries"],
        automations: ["Google My Business review management", "LinkedIn content scheduler", "Coverage area and fleet update workflow"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Long-term contracts with anchor clients are the logistics business model. One contract can justify an entire fleet.",
        primary: [
          { name: "Service Level Agreement (SLA) Template", note: "Defines your liability ceiling for delays, damage, and loss. Without an SLA, you bear unlimited liability for every consignment." },
          { name: "Corporate Rate Card", note: "Published rates by load type, distance, and vehicle class. Corporate procurement managers need to see structured pricing before engaging." },
          { name: "Freight Quoting System", note: "Fast, accurate quotes with route, load type, timeline, and cost. Slow quotes lose contracts to whoever responds first." },
          { name: "E-commerce Platform Partnerships", note: "Formal logistics partner applications. E-commerce is the fastest-growing last-mile logistics market in Nigeria." },
        ],
        secondary: ["Manufacturer/retailer direct sales outreach", "JV/subcontracting network for coverage gaps", "Referral partner network (freight forwarders, clearing agents)"],
        automations: ["Freight quote generator", "SLA compliance dashboard", "Contract renewal alerts", "Customer satisfaction survey automation"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "A logistics operation without real-time visibility loses money every day. Through fuel leakage, idle time, and missed deliveries.",
        primary: [
          { name: "GPS Fleet Management System", note: "Real-time vehicle tracking, route history, idle time reports, speed alerts. The single most impactful operational investment in logistics." },
          { name: "Driver Dispatch SOP", note: "Load assignment, route briefing, departure checklist, delivery confirmation protocol. Undocumented dispatch creates accountability gaps that cost money." },
          { name: "Delivery Confirmation System", note: "Electronic proof of delivery (ePOD). Signed, timestamped, photographed. Required for SLA compliance reporting and dispute resolution." },
          { name: "Vehicle Maintenance Schedule", note: "Preventive maintenance calendar per vehicle. Breakdown on a live contract costs demurrage, client penalties, and fleet credibility." },
          { name: "Customer Complaint Resolution SOP", note: "Escalation path, response time standard, compensation policy. A complaint resolved well creates more loyalty than a delivery that never went wrong." },
        ],
        secondary: ["Route optimisation software", "Returns and reverse logistics management", "Cold chain temperature monitoring (pharmaceutical/food cargo)", "Checkpoint security protocol"],
        automations: ["GPS tracking and alerts", "Automated delivery notifications to clients", "Maintenance scheduling automation", "Fuel consumption anomaly alerts"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Logistics success is operations excellence. The right people in the right roles prevent the daily breakdowns that erode profit.",
        primary: [
          { name: "Operations / Fleet Manager", note: "Owns vehicle utilisation, driver discipline, route efficiency, and maintenance compliance. This role's performance directly determines profitability." },
          { name: "Logistics Coordinators / Dispatchers", note: "Load assignment, driver communication, delivery tracking, client updates. The control tower of daily operations." },
          { name: "Commercial Vehicle-Licensed Drivers", note: "FRSC-verified commercial driving licence required for all drivers. Unlicensed commercial drivers void your vehicle insurance." },
        ],
        secondary: ["Customer service officer (for institutional client management)", "Finance / billing officer", "IT / tracking system administrator"],
        automations: ["Driver attendance tracking", "Commercial licence renewal alerts", "Training certification tracker (FRSC defensive driving)"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "For pharmaceutical / cold-chain logistics", items: ["NAFDAC cold-chain compliance certification", "GDP (Good Distribution Practice) certificate", "Temperature monitoring documentation"] },
      { trigger: "For seaport freight forwarding operations", items: ["Nigerian Customs Service agent licence (Form M)", "NPA port operator permit"] },
    ],
  },
  {
    id: "ngo", label: "NGO / Non-Profit", tagline: "Civil society organisations, foundations, and faith-based bodies. Every stage from incorporation to grant readiness.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "An unregistered NGO cannot open a bank account, receive grants, or sign agreements with government or international donors.",
        primary: [
          { name: "CAC Incorporated Trustee Registration", note: "The legal form for NGOs in Nigeria. Requires minimum 2 trustees, approved constitution, and CAC Form IT. Without it, your organisation has no legal standing." },
          { name: "FIRS TIN + Tax Exemption Application", note: "Non-profit organisations can apply for tax exemption under CITA S.23. Without TIN, you cannot receive bank transfers from institutional donors." },
          { name: "SCUML Registration", note: "Mandatory for NGOs under MLMASA 2022. EFCC and CBN require SCUML compliance before banks unblock NGO accounts. Non-compliance leads to account freezing." },
          { name: "CAC-Compliant Constitution", note: "Must include objects clause, governance structure, trustee powers, dissolution clause, and non-distribution constraint. Poorly drafted constitutions fail CAC review." },
          { name: "Corporate Affairs Commission Annual Returns", note: "Filed annually. NGOs that miss two consecutive years risk being struck off and losing their incorporated trustee status permanently." },
        ],
        secondary: ["State government registration (for state-level operations)", "Corporate governance policy document", "Conflict of interest policy", "Whistleblower policy", "PAYE registration for paid staff"],
        automations: ["CAC annual returns reminder calendar", "SCUML renewal tracker", "Board resolution template library"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Grant-makers audit your financials before every disbursement. Your accounts must be clean, segregated, and documented.",
        primary: [
          { name: "Dedicated NGO Bank Account", note: "Separate account in the organisation's registered name. Donors and grant-makers will not disburse to personal accounts under any circumstances." },
          { name: "Fund Accounting System", note: "Fund accounting configured per donor. Tracks each grant separately, generates donor-specific financial reports, and prepares for audit." },
          { name: "Annual Audit by Registered Auditor", note: "Required by most international donors and mandatory for SCUML compliance. Unaudited financials disqualify applications for most grants above ₦5M." },
          { name: "Procurement Policy", note: "Documented procedure for how the NGO spends donor funds. Quotation thresholds, approvals required, vendor blacklisting. Donor requirement for all grants." },
        ],
        secondary: ["Petty cash policy and reconciliation", "Staff expense reimbursement policy", "Budget vs. actuals monthly reporting", "Donor reporting template (narrative + financial)"],
        automations: ["Fund-by-fund expense tracking", "Budget utilisation alerts", "Donor report generation", "Payroll automation for programme staff"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Visibility is credibility. Funders research your organisation's impact online before engaging.",
        primary: [
          { name: "Professional Website", note: "Mission, programmes, impact numbers, team, and annual reports. International donors review your website before any engagement. A poor website ends the conversation." },
          { name: "Annual Report (Design + Content)", note: "Polished annual report showing programmes delivered, beneficiaries reached, funds utilised. The single most important document for attracting major donors." },
          { name: "LinkedIn Organisation Page", note: "Foundation and corporate donors are on LinkedIn. An active page showing impact builds credibility with institutional funders." },
          { name: "Impact Photography + Data", note: "Documented evidence of programme delivery. Photos, beneficiary counts, testimonials. Funders cannot fund impact they cannot see." },
        ],
        secondary: ["Facebook community page", "Newsletter to donor base", "YouTube programme documentation", "WhatsApp community management"],
        automations: ["Social media content scheduler", "Donor newsletter automation", "Impact data dashboard (Google Data Studio)"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Grant writing is fundraising sales. Your proposals must be compelling, compliant, and submitted on time.",
        primary: [
          { name: "Grant Tracking System", note: "Database of open grant opportunities. Funder, deadline, amount, eligibility, submission status. Missing a grant deadline is revenue thrown away." },
          { name: "Proposal Writing Capability", note: "Theory of change, logical framework, M&E plan, budget narrative. The standard components of any competitive grant proposal. Must be donor-format compliant." },
          { name: "Donor Relationship Management (CRM)", note: "Track every funder relationship. Last contact, interests, reporting schedule, renewal date. One warm relationship is worth more than 10 cold applications." },
          { name: "Corporate Partnership Deck", note: "CSR-aligned pitch deck for private sector partners. Companies need to show how their sponsorship meets their CSR mandate." },
        ],
        secondary: ["Donor stewardship programme", "Board member fundraising roles", "Individual donor appeal letters", "Grant calendar (quarterly planning)"],
        automations: ["Grant deadline alerts", "Donor communication follow-up reminders", "Proposal template library", "Reporting deadline tracker"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Programme delivery must be documented. Every activity, every beneficiary, every naira spent.",
        primary: [
          { name: "Programme Management System", note: "Project-based work management. Activity plans, deliverable tracking, M&E milestones, staff assignments." },
          { name: "M&E Framework", note: "Monitoring & Evaluation framework with indicators, data collection tools, and reporting templates. Required by all serious funders." },
          { name: "Beneficiary Database", note: "Registered beneficiaries with consent, demographics, and programme participation records. Evidence base for impact reports and audits." },
          { name: "Field Activity SOPs", note: "Standardised procedures for community outreach, training delivery, distribution events. Protects staff, beneficiaries, and the organisation's reputation." },
        ],
        secondary: ["Vehicle and asset management", "Volunteer management policy", "Partner MOU template", "Risk register and mitigation plan", "Safeguarding policy"],
        automations: ["Beneficiary data collection (KoBoToolbox/ODK)", "Programme reporting automation", "Volunteer check-in system", "Incident reporting tool"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "NGO credibility is built on qualified programme staff and a governance board that funders respect.",
        primary: [
          { name: "Board of Trustees (minimum 3)", note: "Legally required under CAC. Must include credible professionals relevant to your mission. Funders evaluate board quality as part of due diligence." },
          { name: "Programme Manager", note: "Owns activity implementation, beneficiary engagement, field operations, and M&E. The operational backbone of any NGO delivering community programmes." },
          { name: "Finance/Admin Officer", note: "Manages all donor funds, procurement, and reporting. Must have formal finance training. Mismanagement of donor funds ends organisations permanently." },
          { name: "Communications Officer", note: "Manages all external communications. Website, social media, annual report, donor updates. Impact without visibility does not attract future funding." },
        ],
        secondary: ["Monitoring & Evaluation officer", "Grants/partnerships officer", "Field officers (programme delivery)", "Legal/compliance advisor (board member)"],
        automations: ["HR and leave management", "Staff timesheet tracking (grant-allocated hours)", "Payroll automation", "Training tracker for programme staff"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If receiving foreign donor funding", items: ["FCCPC registration", "CBN approval for foreign currency receipts", "EFCC/SCUML enhanced due diligence documentation"] },
      { trigger: "If operating a school, clinic, or social enterprise arm", items: ["Separate CAC registration for commercial arm", "Relevant sector licence (Ministry of Education / Ministry of Health)", "Tax segregation between charitable and commercial activities"] },
    ],
  },
  {
    id: "school", label: "School / Education", tagline: "Nursery, primary, secondary, or vocational. Every stage from proprietorship registration to a recognised, enrolling institution.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Operating a school without the right approvals is a criminal offence. Parents, employers, and WAEC/NECO will verify your accreditation.",
        primary: [
          { name: "CAC Registration (BN or Ltd)", note: "School proprietorship as a Business Name (sole) or Limited Company. Ltd preferred for multi-campus expansion and investor entry." },
          { name: "State Ministry of Education Approval", note: "Mandatory before enrolling any student. Approval requires: premises inspection, qualified staff list, curriculum submission, safety report." },
          { name: "WAEC / NECO Centre Accreditation", note: "Required for secondary schools to write external examinations. Without it, your SS3 students cannot write WAEC at your school." },
          { name: "TIN + PAYE Registration", note: "All schools with paid staff must be registered with FIRS and remit PAYE monthly. Education sector is an active FIRS audit target." },
          { name: "NUC Accreditation (if tertiary)", note: "National Universities Commission or NBTE (polytechnics) or NCCE (colleges of education). Mandatory before any tertiary institution enrols students." },
        ],
        secondary: ["Fire safety certificate (annual)", "Food handler's permit (if school feeds students)", "First aid and safety compliance", "Child protection policy", "Annual Returns filing"],
        automations: ["Accreditation renewal tracker", "PAYE/payroll calendar", "Staff certification alert system"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "School revenue is term-based and predictable. Your financial system must handle collections, payroll, and arrears with zero leakage.",
        primary: [
          { name: "Corporate Bank Account", note: "All school fees must be received in the school's registered account. Personal accounts for school fees create tax and audit risk." },
          { name: "School Management Software (Billing Module)", note: "Proschool, Classonomy, or similar. Generates invoices per student, tracks outstanding fees, sends payment reminders. Eliminates manual ledgers." },
          { name: "Staff Payroll System", note: "Automated monthly payroll with PAYE deduction, pension remittance, and payslip generation. Teacher payroll disputes are a major cause of school disruptions." },
          { name: "Term-Based Budget", note: "Budget prepared per academic term. Staff costs, operations, maintenance, programmes. Term fees set to recover all costs plus operating surplus." },
        ],
        secondary: ["Fee arrears management policy", "Bursary/scholarship fund management", "Capital improvement reserve fund", "Supplier payment schedule", "Bank loan for infrastructure"],
        automations: ["Automated school fee reminders (SMS/WhatsApp)", "Payroll automation", "Outstanding fees dashboard", "Budget vs. actuals tracking"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Parents choose schools on reputation, appearance, and results. Your marketing must demonstrate all three.",
        primary: [
          { name: "School Website with Results/Testimonials", note: "Exam results, extracurricular programmes, teacher profiles, facility photos, admission process. First thing parents check before visiting." },
          { name: "School Brand Identity", note: "Professional logo, colours, uniform design, stationery, signage. A school that looks established attracts enrolments and justifies premium fees." },
          { name: "Google My Business Listing", note: "Parents search 'schools near me' constantly. A verified listing with reviews drives walk-in enquiries and open day attendance." },
          { name: "Social Media (Facebook + Instagram)", note: "Showcase school activities, events, achievements. Parents recommend schools to other parents based on active, positive online presence." },
        ],
        secondary: ["Annual school magazine / prospectus", "Open day events (twice yearly)", "Alumni association management", "WhatsApp parent community management"],
        automations: ["Automated admission enquiry response", "Social media content scheduler", "Review request automation", "Parent newsletter automation"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Enrolment is sales. The school visit, the prospectus, and the admission process must convert every serious enquiry.",
        primary: [
          { name: "Admission Process + Enrolment Pack", note: "Clear, professional admission steps: enquiry → school visit → entrance assessment → offer letter → fee payment → enrolment. Each step documented and consistent." },
          { name: "School Prospectus", note: "Printed and digital prospectus: school philosophy, curriculum, facilities, results, fees, and staff. Given to every visiting parent." },
          { name: "Referral Programme for Parents", note: "Existing parents who refer new families earn fee discounts or gifts. Word-of-mouth is the highest-converting enrolment channel for schools." },
          { name: "Corporate Partnership (Staff School Fees)", note: "Agreements with employers to subsidise school fees for employees' children. Provides predictable enrolment from corporate parents." },
        ],
        secondary: ["Scholarship programme for community goodwill", "After-school programme upsell", "Holiday programme revenue", "Alumni giving programme (older schools)"],
        automations: ["Online admission form and tracking", "Enquiry CRM", "Automated tour scheduling", "Offer letter generation"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "A school that runs on documented systems maintains quality whether the proprietor is on campus or not.",
        primary: [
          { name: "Academic Calendar + Timetable System", note: "Published term dates, examination schedule, holiday calendar. Parents plan around it. Last-minute changes damage school reputation." },
          { name: "Student Information System", note: "Digital records for every student. Attendance, academic performance, behaviour, fees, health. Accessible to class teachers, admin, and parents on demand." },
          { name: "Staff Management Handbook", note: "Conduct standards, leave policy, performance review cycle, disciplinary procedure. Teacher performance directly determines school results." },
          { name: "Parent Communication System", note: "Standardised communication channels. Report cards, school notices, emergency alerts. One communication failure can trigger parent withdrawals." },
        ],
        secondary: ["Health and safety policy (signed annually)", "ICT/computer lab management", "Library management system", "Bus/transport management", "Canteen quality standards"],
        automations: ["Automated attendance tracking (SMS to parents)", "Result computation and report card generation", "Parent portal (online report access)", "Bus tracking system"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Qualified, certified teachers are a legal requirement. Unqualified staff put your Ministry of Education approval at risk.",
        primary: [
          { name: "Teachers College (NCE) Certified Teachers", note: "Ministry of Education requires NCE-certified teachers. Inspectors check certificates. Schools with unqualified staff lose approval at inspection." },
          { name: "Head Teacher / Principal", note: "Academic head with teaching qualification and management experience. Responsible for curriculum delivery, staff performance, and academic results." },
          { name: "School Administrator / Bursar", note: "Manages fees, admissions records, correspondence, and parent relations. The operational hub of the school." },
          { name: "Counsellor / Welfare Officer", note: "Required by most state ministries for secondary schools. Supports student welfare, career guidance, and disciplinary matters." },
        ],
        secondary: ["Subject specialists (sciences, arts, ICT)", "Sports coordinator", "Security personnel", "Kitchen staff (if boarding)", "IT technician"],
        automations: ["Staff attendance tracking", "Teacher CPD (Continuing Professional Development) tracker", "Payslip automation", "Leave management system"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If operating a boarding school", items: ["NAFDAC food licence (for school kitchen)", "Ministry of Health health inspection certificate", "Fire Safety Certificate for hostel buildings", "Child protection policy (mandatory for boarding)"] },
      { trigger: "If offering TVET / vocational programmes", items: ["NBTE accreditation for vocational programmes", "NABTEB examination centre registration", "Industrial Training Fund (ITF) affiliation"] },
    ],
  },
  {
    id: "agriculture", label: "Agriculture / Agribusiness", tagline: "Farming, processing, storage, or export. Every stage from land registration to a commercially viable agribusiness.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Without the right registrations, agribusinesses cannot access government schemes, bank loans, or export markets.",
        primary: [
          { name: "CAC Registration (BN or Ltd)", note: "Ltd preferred for commercial farms and agroprocessing businesses. Required for NIRSAL, BOA, and CBN Anchor Borrowers scheme access." },
          { name: "Land Documentation (CofO / Right of Occupancy)", note: "Certificate of Occupancy or Governor's Consent on farm land. Banks will not lend against unregistered land. Investors will not fund unverified land title." },
          { name: "NAFDAC Registration (for processed products)", note: "Mandatory for processed food and beverage products. Products without NAFDAC numbers cannot be sold in supermarkets or exported." },
          { name: "SON Conformity Assessment (for packaged goods)", note: "Standards Organisation of Nigeria certification for packaged agricultural products. Required for retail shelves and export." },
          { name: "TIN + FIRS Enrollment", note: "Required for NIRSAL loan applications, government offtake agreements, and commodity exchange trading." },
        ],
        secondary: ["State Ministry of Agriculture registration", "NEPC registration (for export)", "Phytosanitary certificate from NAQS (for export)", "Environmental impact assessment (large-scale farms)", "Annual Returns"],
        automations: ["NAFDAC renewal tracker", "Land document vault (digital + certified)", "Compliance certificate calendar"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Agriculture cash flows are seasonal. Your financial system must manage input cycles, harvest proceeds, and loan repayment schedules.",
        primary: [
          { name: "Corporate Bank Account", note: "Required for NIRSAL, BOA, and CBN Anchor Borrowers disbursements. All government agricultural schemes pay only to registered corporate accounts." },
          { name: "Farm Management Accounting", note: "Cost per hectare, yield per crop cycle, input cost tracking, harvest revenue. Know your breakeven before planting." },
          { name: "Agricultural Credit / NIRSAL Facility", note: "NIRSAL Microfinance Bank or BOA. Affordable credit for working capital, equipment, and infrastructure. Requires business plan and land documentation." },
          { name: "Input Cost Tracking", note: "Seeds, fertilisers, labour, fuel, pesticides. Tracked per crop cycle per plot. Without this, you cannot know if your farm is profitable." },
        ],
        secondary: ["Crop insurance (NAIC. Nigeria Agricultural Insurance Corporation)", "Commodity exchange account (AFEX/NCX)", "Produce storage cost management", "Post-harvest loss tracking"],
        automations: ["Input cost tracking per plot", "Harvest revenue tracking", "Loan repayment schedule alerts", "Crop insurance renewal reminders"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Commercial buyers, supermarkets, and export markets require traceable, branded produce from verified suppliers.",
        primary: [
          { name: "Product Branding + Packaging", note: "Professional packaging with NAFDAC number, weight, ingredients, storage instructions. Supermarkets reject unbranded products at the gate." },
          { name: "Offtake Buyer Relationships", note: "Pre-arranged purchase agreements with processors, supermarkets, institutional buyers, or export agents. Farming without an offtake buyer is gambling." },
          { name: "LinkedIn + WhatsApp Business", note: "B2B marketing to food processors, retailers, export buyers. WhatsApp catalogues for direct consumer sales (for value-added products)." },
          { name: "Commodity Exchange Listing (AFEX/NCX)", note: "List your produce on AFEX or NCX for price discovery, warehouse receipting, and access to commodity-backed credit." },
        ],
        secondary: ["Farmer cooperative membership (price protection)", "Agricultural fair participation (Agrofood Nigeria)", "Google My Business (for direct farm sales)", "E-commerce for value-added products"],
        automations: ["Buyer notification on harvest readiness", "WhatsApp catalogue for produce", "Price alert system (commodity exchange)", "Export buyer CRM"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Commercial agriculture lives or dies on offtake agreements. Locking in buyers before harvest is the only risk management strategy that works.",
        primary: [
          { name: "Offtake Agreement Template", note: "Pre-harvest purchase agreement. Quantity, quality grade, delivery terms, price formula, penalty clauses. Verbal offtake agreements are worthless at harvest time." },
          { name: "Produce Grading System", note: "Standardised quality grades per crop type. Buyers pay premium prices for consistently graded produce. Ungraded produce sells at commodity spot price." },
          { name: "Institutional Buyer Pipeline", note: "Food processors (Dangote, Flour Mills, Nestle), supermarkets (Shoprite, SPAR), hotels, hospitals, schools. Direct institutional accounts worth multiples of market sales." },
          { name: "Export Documentation Package", note: "Phytosanitary cert, certificate of origin, NAFDAC cert, NEPC registration, NXP form. Pre-assembled for any export enquiry. Slow documentation kills export deals." },
        ],
        secondary: ["Farmer aggregation network (buy from smallholders, sell to processors)", "Commodity futures hedging (AFEX)", "Forward contract management"],
        automations: ["Harvest readiness notification to buyers", "Grading record system", "Export document tracker", "Commodity price monitoring"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Farm operations without SOPs produce inconsistent yields, post-harvest losses, and buyer rejections.",
        primary: [
          { name: "Farm Management System", note: "Digital farm records. Planting dates, input applications, weather logs, yield data per plot. Required for GlobalGAP certification and export compliance." },
          { name: "Post-Harvest Handling SOP", note: "Grading, cleaning, packaging, and storage procedures per crop type. Poor post-harvest handling causes 30-40% produce loss in Nigeria." },
          { name: "Cold Chain / Storage Management", note: "Controlled atmosphere storage or warehouse receipt system. Post-harvest losses can be reduced from 40% to under 10% with proper storage." },
          { name: "Input Supply Chain Management", note: "Pre-season input procurement. Seeds, fertilisers, pesticides from verified suppliers. Input fraud (fake fertilisers) is the leading cause of farm failure in Nigeria." },
        ],
        secondary: ["Irrigation system management", "Equipment maintenance log (tractors, planters, harvesters)", "Labour management (seasonal workers)", "Waste and residue management"],
        automations: ["Farm activity tracking (mobile app)", "Weather monitoring and alert system", "Equipment maintenance scheduling", "Pest/disease monitoring alert system"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Commercial agriculture requires technical expertise. agronomists, extension officers, and skilled farm supervisors determine your yield.",
        primary: [
          { name: "Agronomist / Farm Manager", note: "Degree-qualified agronomist for crop selection, planting schedules, input optimisation, and pest management. The difference between a profitable farm and a failed season." },
          { name: "Farm Supervisors", note: "Experienced farm supervisors per production unit. Oversee daily field operations, labour management, and input application." },
          { name: "Quality Control / Post-Harvest Officer", note: "Manages grading, packing, storage, and cold chain. Directly determines the price your produce commands." },
        ],
        secondary: ["Irrigation technician", "Equipment operator (certified)", "Marketing/sales officer for produce", "Finance/record-keeping officer"],
        automations: ["Staff attendance tracking (field workers)", "Training certification tracker (NASC agronomist CPD)", "Labour cost per hectare tracking"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If producing organic-certified products", items: ["USDA NOP or EU organic certification", "Control Union / SGS organic inspection", "Organic input traceability documentation"] },
      { trigger: "If processing for export to EU / US markets", items: ["GlobalGAP certification", "HACCP food safety management system", "Residue testing from accredited laboratory"] },
    ],
  },
  {
    id: "hotel", label: "Hotel / Hospitality", tagline: "Guest houses, hotels, event centres. Every stage from facility licensing to a fully booked, profitable property.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Unlicensed hospitality businesses are raided, sealed, and prosecuted. Every room, every event, every restaurant requires specific permits.",
        primary: [
          { name: "CAC Private Limited Company", note: "Hotels with investors, multiple locations, or institutional bookings require Ltd. Objects clause must cover hospitality and accommodation." },
          { name: "State Tourism / Hospitality Licence", note: "Every hotel must be licensed by the State Ministry of Tourism or NTDC. Operating without it risks sealed premises and prosecution." },
          { name: "NAFDAC Food Licence (for restaurant/bar)", note: "Mandatory for any food or beverage service. Inspectors visit without notice. Restaurants operating without NAFDAC licence face immediate shutdown." },
          { name: "Fire Safety Certificate", note: "Annual certificate from State Fire Service. Required for hotel operating licence renewal. Missing certificate = revocation of hospitality licence." },
          { name: "NTDC Star Rating (optional but high-value)", note: "Nigerian Tourism Development Corporation star classification. Rated hotels command 30-50% higher room rates and access corporate travel contracts." },
        ],
        secondary: ["Environmental health permit (annual)", "Liquor licence (if serving alcohol)", "Music/entertainment licence (copyright fee)", "PAYE + VAT registration", "Annual Returns"],
        automations: ["Licence renewal calendar", "Fire safety inspection scheduling", "Health inspection checklist automation"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Hotel revenue is daily and variable. Your financial system must track occupancy revenue, F&B, events, and costs in real time.",
        primary: [
          { name: "Property Management System (PMS) with Accounting", note: "Opera, Protel, or Cloudbeds. Integrates front desk, housekeeping, billing, and financial reporting. Essential for any hotel above 10 rooms." },
          { name: "Revenue Per Available Room (RevPAR) Tracking", note: "Daily occupancy rate × average room rate = RevPAR. The core profitability metric every hotel owner must track weekly." },
          { name: "VAT + WHT Compliance (Hospitality Sector)", note: "VAT on all room rates, F&B, and event services. Withholding tax on corporate bookings. FIRS audits hospitality businesses regularly." },
          { name: "Payroll for Rotating Shift Staff", note: "Hotel staff work morning, afternoon, and night shifts. Payroll must account for shift differentials, overtime, and PAYE for each employee." },
        ],
        secondary: ["Utility cost management (power, water, gas)", "Maintenance reserve fund (3% of revenue)", "Food and beverage cost tracking (COGS %)", "Event deposits and refund policy"],
        automations: ["Daily revenue report automation", "Occupancy rate dashboard", "Utility consumption monitoring", "Payroll automation for shift workers"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "80% of hotel bookings now begin online. Your digital presence determines your occupancy rate.",
        primary: [
          { name: "OTA Listings (Booking.com, Expedia, Hotels.ng)", note: "Online Travel Agencies drive 60-70% of bookings for most Nigerian hotels. Without OTA presence, you rely entirely on walk-ins and repeat guests." },
          { name: "Professional Website with Direct Booking", note: "Direct booking saves 15-20% OTA commission. Hotel website with online payment and instant confirmation converts at 3x the rate of WhatsApp-only booking." },
          { name: "Google My Business + TripAdvisor", note: "Travellers read 10+ reviews before booking. Active management of reviews on both platforms directly impacts occupancy rate." },
          { name: "Instagram (Room Photography)", note: "Professional room and facility photography is the single highest-ROI investment in hotel marketing. Bad photos lose bookings before anyone calls." },
        ],
        secondary: ["Corporate account direct sales", "Wedding planner partnerships (for event centres)", "Travel agent commission programme", "Email newsletter to past guests"],
        automations: ["OTA rate management system", "Automated guest review request (post-checkout)", "Direct booking confirmation automation", "Guest birthday/anniversary email"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Corporate accounts, events, and OTA contracts are the three revenue streams that fill hotels. All require a structured sales approach.",
        primary: [
          { name: "Corporate Rate Card", note: "Negotiated rates for companies with regular travel needs. One corporate account = 20-50 room nights per year. Managed with a formal rate agreement." },
          { name: "Events & Banqueting Sales Package", note: "Weddings, conferences, corporate events. Packaged with room blocks, catering, AV, décor. Events revenue can exceed room revenue in the right property." },
          { name: "Revenue Management System", note: "Dynamic pricing. Raise rates during high demand, offer promotions during low season. Properly managed, revenue management increases RevPAR by 15-25%." },
          { name: "Long-Stay / Serviced Apartment Offering", note: "Monthly rates for expats, consultants, and relocating professionals. Long-stay guests have near-zero acquisition cost and predictable revenue." },
        ],
        secondary: ["Tour operator packages", "Loyalty programme for repeat guests", "Gift voucher sales", "Day-use room rates"],
        automations: ["OTA yield management", "Revenue management dashboard", "Automated upsell emails (pre-arrival)", "Booking confirmation and pre-arrival emails"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Hotel operations run 24 hours a day. Without documented systems, quality collapses and reviews suffer.",
        primary: [
          { name: "Housekeeping SOP", note: "Room cleaning checklist, turnaround time standard, linen change policy, inspection procedure. Cleanliness is the #1 factor in hotel reviews." },
          { name: "Front Desk Operating Procedures", note: "Check-in, check-out, lost key, room change, complaint escalation. All documented and followed regardless of who is on duty." },
          { name: "Maintenance Schedule", note: "Preventive maintenance for AC units, plumbing, electrical, lifts. Reactive maintenance is 3x more expensive than preventive. Breakdown during peak season costs reviews and bookings." },
          { name: "F&B Operating Standards", note: "Kitchen hygiene procedures, food temperature logs, supplier quality standards. One food poisoning incident can close a hotel permanently." },
        ],
        secondary: ["Security protocol and access control", "Night audit procedure", "Energy management (generator fuel optimisation)", "Lost and found procedure", "Emergency evacuation plan"],
        automations: ["PMS housekeeping module", "Maintenance request tracking", "Temperature logging automation (cold chain)", "Energy consumption monitoring"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Hospitality is a people business. The right staff at every guest touchpoint is what drives reviews, repeat stays, and referrals.",
        primary: [
          { name: "General Manager / Hotel Manager", note: "Experienced hospitality professional who owns P&L, guest satisfaction, staff performance, and compliance. The most critical hire in any hotel." },
          { name: "Front Desk Officers", note: "Trained in PMS operation, guest check-in/out, complaints handling, and upselling. First and last impression for every guest." },
          { name: "Head Housekeeper", note: "Manages room cleaning standards, linen inventory, lost property, and housekeeping staff. Cleanliness complaints are the #1 cause of negative reviews." },
          { name: "Head Chef / F&B Supervisor", note: "Menu development, kitchen hygiene, supplier management, food cost control. F&B quality determines whether guests stay and return." },
        ],
        secondary: ["Revenue manager (for 50+ room properties)", "Sales and marketing coordinator", "Maintenance technician", "Security supervisor", "Night auditor"],
        automations: ["Shift scheduling automation", "Payslip generation", "Staff training tracker", "Guest feedback collection automation"],
        by: "Skills",
      },
    ],
  },
  {
    id: "manufacturing", label: "Manufacturing", tagline: "Small to mid-scale production. Every stage from factory registration to a licensed, export-ready manufacturing business.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Manufacturing without the right permits is a criminal offence. NAFDAC, SON, EPA, and NESREA all actively inspect factory premises.",
        primary: [
          { name: "CAC Private Limited Company", note: "Manufacturing at scale requires Ltd. Objects clause must specifically cover manufacturing, production, and distribution." },
          { name: "NAFDAC Registration (food, cosmetics, pharma, water)", note: "Mandatory for any product that is consumed, applied to the skin, or used medicinally. No NAFDAC = product seized at market and factory sealed." },
          { name: "SON Conformity Assessment (MANCAP)", note: "Standards Organisation of Nigeria mandatory certification for manufactured goods. Required for retail distribution and institutional procurement." },
          { name: "Factory Licence (State Ministry)", note: "Factories Act requires annual licensing of all production facilities. Inspectors verify safety standards, fire exits, and worker conditions." },
          { name: "NESREA Environmental Compliance", note: "Environmental Impact Assessment and waste management plan required for all manufacturing facilities. Non-compliance = factory shutdown by NESREA." },
        ],
        secondary: ["NOTAP registration (for technology transfer agreements)", "Fire safety certificate", "PAYE + VAT registration", "ITF levy registration", "Annual Returns"],
        automations: ["NAFDAC renewal tracker", "SON certification calendar", "Environmental compliance monitoring"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Manufacturing has high fixed costs and variable revenue. cost accounting and working capital management separate profitable factories from loss-making ones.",
        primary: [
          { name: "Manufacturing Cost Accounting", note: "Tracks raw material cost, direct labour, factory overhead per unit produced. Know your cost per SKU before setting any price." },
          { name: "Working Capital Facility", note: "Raw material procurement requires cash upfront. Revenue comes weeks or months later. A working capital facility from a commercial bank bridges this gap." },
          { name: "Inventory Management System", note: "Raw material stock, work-in-progress, finished goods inventory tracked daily. Stock-outs stop production. Overstock ties up capital." },
          { name: "VAT Compliance (Input + Output)", note: "Manufacturing creates both input VAT (on raw materials) and output VAT (on products sold). Proper VAT accounting recovers input VAT from FIRS." },
        ],
        secondary: ["Equipment depreciation schedule", "Scrap/waste value recovery accounting", "Export duty drawback claims", "Capital expenditure planning", "Letter of credit for imported raw materials"],
        automations: ["Inventory reorder automation", "Production cost dashboard", "VAT input/output reconciliation", "Payroll automation for factory workers"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Distributors, retailers, and institutional buyers choose manufacturers they know and trust. Brand visibility and product credibility are how you get shortlisted.",
        primary: [
          { name: "Product Packaging Design", note: "Professional packaging with NAFDAC number, SON mark, barcode, nutritional information, and brand identity. Packaging is your primary sales tool at retail." },
          { name: "Company Profile + Product Catalogue", note: "Professional catalogue with product specifications, certifications, minimum order quantities, and pricing tiers. Distributed to every distributor and procurement officer." },
          { name: "LinkedIn + Trade Directory Listings", note: "B2B buyers verify manufacturers on LinkedIn and trade directories (Made-in-Nigeria platform, Kompass). Active profiles generate distributor and institutional enquiries." },
          { name: "Trade Exhibition Participation", note: "Lagos International Trade Fair, NASME exhibitions. Direct access to distributors, retailers, and institutional buyers in one venue." },
        ],
        secondary: ["Distributor incentive programme", "Retail shelf visibility plan", "YouTube factory tour video (trust-building)", "WhatsApp Business catalogue for distributors"],
        automations: ["Distributor order portal", "Product catalogue digital delivery", "Trade enquiry auto-response", "New distributor onboarding workflow"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Manufacturing distribution is built on distributor networks. The right distributors cover markets you can never reach alone.",
        primary: [
          { name: "Distribution Network Setup", note: "Tier-1 state distributors, tier-2 area distributors, retail push. Each tier has defined margins, credit terms, and territory exclusivity." },
          { name: "Distributor Agreement Template", note: "Territory, pricing, credit terms, targets, returns policy, brand standards. Unsigned distributor agreements lead to price undercutting and territory conflicts." },
          { name: "Trade Marketing Plan", note: "In-store merchandising standards, POSM (point-of-sale materials), retailer incentives, shopper promotions. Retail shelf presence drives repeat purchase." },
          { name: "Institutional Sales Pipeline", note: "Government procurement, corporate catering, hospital supply, school supply. Large-volume institutional clients who buy consistently at fixed prices." },
        ],
        secondary: ["Export distribution setup (NEPC-registered agents)", "E-commerce / Jumia / Konga distributor listing", "Route-to-market plan per region"],
        automations: ["Distributor order management system", "Sales rep tracking (field force app)", "Secondary sales data collection", "Trade promotion management"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Production consistency, zero contamination, and on-time delivery are the three operational promises manufacturers must keep every day.",
        primary: [
          { name: "Production SOPs", note: "Step-by-step procedures for every stage of production. Material intake, mixing, processing, packaging, quality check, dispatch. Every operator follows the same procedure every time." },
          { name: "Quality Management System (QMS)", note: "In-process quality checks at every production stage, finished goods testing, rejection and rework procedure. Required for ISO 9001 and NAFDAC GMP compliance." },
          { name: "Maintenance Programme (Preventive)", note: "Scheduled maintenance for all production equipment. Daily checks, weekly servicing, monthly overhaul schedule. Equipment breakdown stops production and breaks delivery promises." },
          { name: "Supply Chain Management", note: "Approved supplier list, raw material quality specifications, delivery lead times, backup suppliers. Single-supplier dependency is a production risk." },
        ],
        secondary: ["Waste management system", "ISO 9001 quality management implementation", "HACCP (for food manufacturers)", "Energy audit and optimisation", "Production capacity planning"],
        automations: ["Production scheduling system", "Equipment maintenance tracking", "Quality inspection checklist (digital)", "Raw material reorder automation"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Manufacturing requires technical specialists. Without qualified production, quality, and safety personnel, NAFDAC will not licence your facility.",
        primary: [
          { name: "Production Manager", note: "Engineering or science graduate with manufacturing experience. Responsible for output targets, quality standards, and cost efficiency." },
          { name: "Quality Control / Assurance Officer", note: "Manages in-process and finished product quality checks. Required by NAFDAC GMP standards for food, cosmetic, and pharmaceutical manufacturers." },
          { name: "HSE Officer (Factory)", note: "Mandatory under the Factories Act. Responsible for worker safety, accident reporting, fire drills, and regulatory compliance with NESREA." },
          { name: "Procurement Officer", note: "Manages raw material sourcing, supplier relationships, price negotiation, and inventory levels. Poor procurement = production stoppages and inflated costs." },
        ],
        secondary: ["Distribution/logistics coordinator", "Maintenance technician (electrical + mechanical)", "Sales representative (distributor visits)", "Finance officer (cost accounting)"],
        automations: ["Factory worker attendance tracking", "Staff certification tracker (HSE, food handler)", "Payslip automation", "Training completion tracker"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If manufacturing pharmaceutical products", items: ["NAFDAC GMP certification", "PCN (Pharmacists Council of Nigeria) registration", "Dedicated pharmaceutical-grade facility requirements"] },
      { trigger: "If exporting manufactured goods", items: ["SON export certificate", "NEPC registration", "Certificate of Origin (Chamber of Commerce)", "Country-specific import compliance (EU, US FDA, etc.)"] },
    ],
  },
  {
    id: "retail", label: "Retail / E-commerce", tagline: "Physical store, online shop, or both. Every stage from business registration to a profitable, scaling retail operation.",
    stages: [
      {
        id: "legal", label: "Legal & Compliance", tagline: "Retail businesses touching food, cosmetics, electronics, or fashion face sector-specific compliance requirements beyond basic CAC registration.",
        primary: [
          { name: "CAC Registration (BN or Ltd)", note: "Business Name for single-owner shops. Ltd for businesses with investors, multiple branches, or plans to onboard marketplaces like Jumia/Konga as a seller." },
          { name: "NAFDAC Product Registration (for food/cosmetics)", note: "Any food, drink, cosmetic, or supplement you sell must either have a NAFDAC number on the label or be sourced from a NAFDAC-registered supplier." },
          { name: "Consumer Protection Compliance (FCCPC)", note: "Federal Competition and Consumer Protection Commission governs returns policy, price labelling, warranty obligations, and deceptive marketing. Complaints lead to FCCPC investigations." },
          { name: "TIN + VAT Registration", note: "VAT applies to most retail goods. FIRS requires VAT registration and monthly filing once annual turnover exceeds ₦25M. Large retailers are audited regularly." },
        ],
        secondary: ["Trademark registration (for own-brand products)", "Import duty compliance (for imported goods)", "SON conformity mark (for electronics)", "Annual Returns"],
        automations: ["Supplier compliance tracker", "NAFDAC number verification system", "VAT filing reminder"],
        by: "BizDoc",
      },
      {
        id: "financial", label: "Financial Setup", tagline: "Retail margins are thin. Inventory management, shrinkage control, and cash flow optimisation determine whether you profit or bleed.",
        primary: [
          { name: "Point of Sale (POS) System", note: "Records every sale, tracks inventory depletion, generates daily sales reports. Manual cashbook retail loses 15-25% to errors and theft." },
          { name: "Inventory Valuation System", note: "FIFO (First In, First Out) valuation for perishables. LIFO for non-perishables. Know the value of your stock at any point. Banks lend against verified inventory." },
          { name: "Gross Margin Tracking per SKU", note: "Know the margin on every product you sell. Retail profitability comes from margin management. Not just revenue growth." },
          { name: "Working Capital Management", note: "Stock financing facility to manage the gap between inventory purchase and sale. Supplier credit terms negotiation. Cash flow calendar for peak trading periods." },
        ],
        secondary: ["Shrinkage control policy", "Supplier payment schedule", "Seasonal inventory planning", "Gift card and voucher liability tracking"],
        automations: ["Automated inventory reorder alerts", "Daily sales reconciliation", "Supplier payment automation", "Cash flow forecast dashboard"],
        by: "BizDoc",
      },
      {
        id: "marketing", label: "Brand & Marketing", tagline: "Nigerian retail is shifting online. physical stores without digital presence lose traffic daily to competitors who have it.",
        primary: [
          { name: "Online Store (Own Website or Marketplace)", note: "Own website (Shopify/WooCommerce) or Jumia/Konga seller account. Or both. Own website keeps 100% margin. Marketplace provides volume." },
          { name: "Instagram + TikTok Shopping", note: "Instagram Shop and TikTok Shop are the fastest-growing retail channels in Nigeria. Product videos on TikTok regularly drive viral sales spikes." },
          { name: "Google My Business + Shopping", note: "Physical stores get found on Google Maps. Google Shopping lists your products in search results with price and availability." },
          { name: "WhatsApp Business Catalogue", note: "WhatsApp is where most Nigerian retail sales are actually closed. A professional catalogue with photos, prices, and a clear ordering process converts enquiries to sales." },
        ],
        secondary: ["Facebook Marketplace", "Loyalty programme (app or stamp card)", "Influencer partnerships for product launches", "Email marketing for repeat customers"],
        automations: ["Social media product post scheduler", "Automated WhatsApp order confirmation", "Customer re-engagement email sequence", "Review request automation"],
        by: "Systemise",
      },
      {
        id: "sales", label: "Sales System", tagline: "Repeat customers cost 5x less than new ones. Your sales system must capture, retain, and upsell every customer you win.",
        primary: [
          { name: "Customer Database (CRM)", note: "Name, phone, purchase history, preferences. Enables targeted promotions, reorder reminders, and personalised service that drives loyalty." },
          { name: "Pricing Strategy", note: "Competitive pricing tiers, bundle offers, anchor pricing, markdown schedule. Price without strategy erodes margin." },
          { name: "Promotional Calendar", note: "Annual sales event calendar. January clearance, Easter promos, Eid, Back to School, Black Friday, Christmas. Planned promotions drive predictable revenue spikes." },
          { name: "B2B / Bulk Order System", note: "Corporate gifting, office supplies, institutional orders. Bulk clients buy at lower margins but in volumes that make fulfilment efficient." },
        ],
        secondary: ["Referral programme (recommend a friend)", "Staff sales incentive scheme", "Flash sale management", "Cross-selling and upselling training for staff"],
        automations: ["Automated promotional SMS/WhatsApp campaigns", "Abandoned cart recovery (e-commerce)", "Reorder reminder automation", "Customer birthday discount automation"],
        by: "Systemise",
      },
      {
        id: "operations", label: "Operations", tagline: "Retail operations run on inventory accuracy, order fulfilment speed, and customer service quality. All three require documented systems.",
        primary: [
          { name: "Inventory Management System", note: "Real-time stock levels, reorder points, supplier lead times, slow-moving stock alerts. Stockouts lose sales. Overstock kills cash flow." },
          { name: "Order Fulfilment SOP (e-commerce)", note: "Pick, pack, dispatch, track. Every step documented and timed. E-commerce customers expect same-day or next-day dispatch. Delays = negative reviews." },
          { name: "Returns and Refund Policy", note: "FCCPC requires a clear, accessible returns policy. Handled well, returns build loyalty. Handled poorly, they generate FCCPC complaints and social media crises." },
          { name: "Supplier Management System", note: "Approved supplier list, lead times, minimum order quantities, quality standards, backup suppliers. Supply chain reliability determines shelf availability." },
        ],
        secondary: ["Shrinkage/theft prevention protocol", "Store layout and visual merchandising standards", "Last-mile delivery management (for e-commerce)", "CCTV and security system"],
        automations: ["Inventory tracking (barcode/QR)", "Automated dispatch notifications to customers", "Supplier reorder automation", "Returns tracking system"],
        by: "Systemise",
      },
      {
        id: "team", label: "Team & Skills", tagline: "Retail is a customer-facing business. The team that interacts with your customers every day is your most important competitive advantage.",
        primary: [
          { name: "Store Manager", note: "Owns daily operations, staff management, sales targets, inventory accuracy, and customer satisfaction. The P&L owner at store level." },
          { name: "Sales Associates / Customer Service Staff", note: "Product knowledge training, upselling techniques, complaint handling. Trained staff convert 30-40% more browsers into buyers." },
          { name: "Inventory / Stock Controller", note: "Manages receiving, storage, stock counting, and shrinkage monitoring. Inventory inaccuracy is the leading cause of retail operational loss." },
          { name: "E-commerce / Social Media Coordinator", note: "Manages online orders, marketplace accounts, social media, and digital promotions. E-commerce without a dedicated coordinator misses orders and generates bad reviews." },
        ],
        secondary: ["Delivery rider / logistics coordinator", "Finance / cashier officer", "Visual merchandiser", "IT/POS system administrator"],
        automations: ["Staff rota scheduling", "Sales performance dashboard per staff", "Customer service training tracker", "Payslip automation"],
        by: "Skills",
      },
    ],
    mayAlsoNeed: [
      { trigger: "If importing goods for resale", items: ["Import duty classification (HS Code)", "Form M (CBN import approval)", "SON SONCAP certificate (for regulated products)", "Pre-shipment inspection certificate"] },
      { trigger: "If operating a pharmacy or medical supplies retail", items: ["PCN licence for pharmacy operations", "NAFDAC drug distribution licence", "Cold chain compliance for temperature-sensitive products"] },
    ],
  },
];

// ── HOW WE WORK STEPS ────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01", title: "Tell Us", short: "Tell us what you need",
    detail: "We listen for what you actually need. Not just what you asked for.",
  },
  {
    num: "02", title: "We Scope It", short: "Exact plan + timeline",
    detail: "Written scope of work. What we do, the order, the timeline, the cost. No surprises.",
  },
  {
    num: "03", title: "You Pay", short: "Secure transfer. Tracked immediately",
    detail: "Payment activates your tracking reference. Every service logged from the moment payment lands.",
  },
  {
    num: "04", title: "We Execute", short: "Specialists handle every step",
    detail: "The right specialist team takes over. Progress updates throughout. No guessing.",
  },
  {
    num: "05", title: "We Deliver", short: "Certified and filed",
    detail: "Delivered digitally and in certified hard copy. Renewals entered into your compliance calendar.",
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function BizDocPortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const blueprintRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Four Pillars
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  // How We Work
  const [activeStep, setActiveStep] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);

  // Business Blueprint
  const [bizPage, setBizPage] = useState(0);
  const [selectedBiz, setSelectedBiz] = useState<string | null>(null);
  const [activeBpTab, setActiveBpTab] = useState(0);

  // Track - full ref input (HAM-2026-XX-XXXX)
  const [trackCode, setTrackCode] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.tracking.lookup.useQuery(
    { ref: trackCode },
    { enabled: false, retry: false }
  );

  const handleTrackInput = (val: string) => {
    let raw = val.replace(/[^0-9]/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);
    let formatted = "HMZ-";
    if (raw.length > 0) formatted += raw.slice(0, 2);
    if (raw.length > 2) formatted += "/" + raw.slice(2, 3);
    if (raw.length > 3) formatted += "-" + raw.slice(3);
    setTrackCode(formatted);
    setTrackSubmitted(false);
  };

  const handleTrack = () => {
    if (trackCode.trim().length < 8) return;
    setTrackSubmitted(true);
    trackQuery.refetch();
  };

  const selectedBp = BLUEPRINTS.find((b) => b.id === selectedBiz);
  const BIZ_PER_PAGE = 6;
  const bizPageCount = Math.ceil(BLUEPRINTS.length / BIZ_PER_PAGE);
  const pagedBiz = BLUEPRINTS.slice(bizPage * BIZ_PER_PAGE, (bizPage + 1) * BIZ_PER_PAGE);
  const activeBpTabDef = STAGE_TABS[activeBpTab];
  const activeBpStage = selectedBp?.stages.find((s) => s.id === activeBpTabDef?.id) ?? null;

  const BADGE_COLOR: Record<string, string> = {
    BizDoc: G,
    Systemise: "#7C3AED",
    Skills: "#D97706",
  };

  return (
    <>
      <PageMeta
        title="BizDoc Consult. Business Compliance, Legal & Growth"
        description="CAC registration, tax compliance, sector licences, legal documents, and managed business compliance for Nigerian businesses."
      />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${Au}18` : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <span className="text-[13px] tracking-[4px] font-light uppercase cursor-default select-none" style={{ color: scrolled ? G : W, letterSpacing: "0.25em" }}>
            BIZDOC
          </span>
          {/* Menu trigger */}
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: scrolled ? G : W }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Dropdown menu */}
          {navMenuOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl py-2 min-w-[200px] shadow-xl"
              style={{ backgroundColor: W, border: `1px solid ${Au}20` }}
              onClick={() => setNavMenuOpen(false)}
            >
              {[
                { label: "Home",      href: "/" },
                { label: "Systemise", href: "/systemise" },
                { label: "Skills",    href: "/skills" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-3 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: G }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>


      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-28 md:pt-40 md:pb-36" style={{ backgroundColor: G }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <h1 className="text-[clamp(34px,5vw,58px)] font-medium leading-[1.1] mb-6" style={{ color: W }}>
              Every filing. Every licence. Handled.
            </h1>
            <p className="text-[16px] leading-relaxed mb-10 opacity-65 max-w-lg" style={{ color: W }}>
              CAC registration. Tax compliance. Sector licences. Legal documentation. So you can operate, win contracts, and scale.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById("pillars")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[14px] font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: Au, color: G }}
              >
                Our Services <ArrowRight size={16} className="inline ml-1" />
              </button>
              <button
                onClick={() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-[14px] font-semibold transition-opacity hover:opacity-90 border"
                style={{ borderColor: `${Au}50`, color: Au }}
              >
                Track <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: consultant card */}
          <div className="hidden md:block">
            <div className="rounded-3xl p-8" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${Au}25` }}>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: Au }}>WHAT WE HANDLE</p>
              {[
                "Business Registration (Local & Foreign)",
                "Full Business Setup — End to End",
                "Tax, Returns & Regulatory Compliance",
                "Legal Documents, Trademark & IP",
                "Sector Licences & Permits",
              ].map(item => (
                <div key={item} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: `${Au}15` }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: Au }} />
                  <span className="text-[13px]" style={{ color: `${W}BB` }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: Au }}>HOW WE WORK</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold mb-12" style={{ color: G }}>Five steps. First conversation to certified delivery.</h2>

          {/* Desktop: split layout */}
          <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-px rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(27,77,62,0.12)" }}>
            <div className="flex flex-col divide-y divide-black/5" style={{ backgroundColor: W }}>
              {STEPS.map((step, i) => {
                const active = activeStep === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="text-left px-7 py-5 flex items-start gap-4 transition-all duration-200"
                    style={{ backgroundColor: active ? "#1B4D3E" : W }}
                  >
                    <span className="text-[12px] font-bold tracking-wider mt-0.5 shrink-0" style={{ color: active ? Au : `${Au}60` }}>{step.num}</span>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: active ? W : G }}>{step.title}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: active ? "rgba(255,255,255,0.5)" : "rgba(28,28,30,0.4)" }}>{step.short}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col justify-center px-10 py-10" style={{ backgroundColor: Cr }}>
              <span className="text-[clamp(56px,8vw,80px)] font-bold leading-none mb-4" style={{ color: `${Au}25` }}>{STEPS[activeStep].num}</span>
              <h3 className="text-[24px] font-bold mb-3" style={{ color: G }}>{STEPS[activeStep].title}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: G, opacity: 0.7 }}>{STEPS[activeStep].detail}</p>
            </div>
          </div>

          {/* Mobile: accordion */}
          <div className="md:hidden flex flex-col gap-3">
            {STEPS.map((step, i) => {
              const isOpen = openStep === i;
              return (
                <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: isOpen ? Au : "rgba(28,28,30,0.10)", backgroundColor: W }}>
                  <button onClick={() => setOpenStep(isOpen ? null : i)} className="w-full text-left px-5 py-4 flex items-center gap-4">
                    <span className="text-[11px] font-bold tracking-wider shrink-0" style={{ color: Au }}>{step.num}</span>
                    <p className="flex-1 text-[14px] font-semibold" style={{ color: G }}>{step.title}</p>
                    <ChevronDown size={16} style={{ color: Au, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
                  </button>
                  <div style={{ maxHeight: isOpen ? "400px" : "0px", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                    <p className="px-5 pb-5 text-[13px] leading-relaxed" style={{ color: G, opacity: 0.7 }}>{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PILLARS ───────────────────────────────────────────────────────── */}
      <section id="pillars" className="py-24 md:py-32" style={{ backgroundColor: Milk }}>
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: Au }}>OUR SERVICES</p>
          <h2 className="text-[clamp(28px,4vw,42px)] font-light mb-4 leading-tight" style={{ color: G, letterSpacing: "-0.02em" }}>Every layer your business needs to stay protected.</h2>
          <p className="text-[16px] font-light opacity-55 mb-14 leading-relaxed" style={{ color: G }}>Registration, compliance, tax, legal, and beyond. Fully handled or partially exposed. Pick your gaps.</p>

          <div className="flex flex-col gap-3">
            {PILLARS.map((p) => {
              const isOpen = openPillar === p.num;
              return (
                <div
                  key={p.num}
                  className="rounded-2xl border overflow-hidden transition-all duration-200"
                  style={{ borderColor: isOpen ? Au : "rgba(28,28,30,0.10)", backgroundColor: W }}
                >
                  <button
                    onClick={() => setOpenPillar(isOpen ? null : p.num)}
                    className="w-full text-left px-6 py-5 flex items-start gap-4"
                  >
                    <span className="text-[11px] font-bold tracking-[0.2em] mt-0.5 shrink-0" style={{ color: Au }}>{p.num}</span>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full mb-1.5"
                        style={{ backgroundColor: `${Au}18`, color: Au }}>{p.tag}</span>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[16px] font-bold leading-snug" style={{ color: G }}>{p.title}</h3>
                        <ChevronDown
                          size={18}
                          className="shrink-0 transition-transform duration-300"
                          style={{ color: Au, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </div>
                      <p className="text-[12px] font-medium mt-0.5 opacity-60" style={{ color: G }}>{p.sub}</p>
                      {!isOpen && (
                        <p className="text-[13px] mt-1.5 opacity-50" style={{ color: G }}>{p.forWhom}</p>
                      )}
                    </div>
                  </button>

                  <div style={{ maxHeight: isOpen ? "1400px" : "0px", overflow: "hidden", transition: "max-height 0.5s ease" }}>
                    <div className="px-6 pb-7 pt-1 border-t" style={{ borderColor: `${Au}20` }}>
                      <p className="text-[14px] leading-relaxed mb-5 whitespace-pre-line" style={{ color: G, opacity: 0.75 }}>{p.pitch}</p>

                      <ul className="flex flex-col gap-1.5 mb-5">
                        {p.services.map((svc) => (
                          <li key={svc} className="flex items-center gap-2 text-[13px]" style={{ color: G }}>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: Au }} />
                            {svc}
                          </li>
                        ))}
                      </ul>

                      <p className="text-[13px] font-semibold mb-5 px-4 py-2 rounded-xl inline-block"
                        style={{ backgroundColor: `${Au}12`, color: G }}>{p.highlight}</p>

                      <button
                        onClick={() => {
                          localStorage.setItem("hamzury-chat-context", `I am interested in ${p.title}. Tell me more.`);
                          const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                          if (btn) btn.click();
                        }}
                        className="inline-flex items-center gap-2 text-[13px] font-semibold"
                        style={{ color: Au }}
                      >
                        Get Started <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BUSINESS BLUEPRINT ───────────────────────────────────────────── */}
      <section ref={blueprintRef} id="blueprint" className="py-20 md:py-28" style={{ backgroundColor: Cr }}>
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: Au }}>BUSINESS BLUEPRINT</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-bold mb-3" style={{ color: G }}>Every stage of building a real business.</h2>
          <p className="text-[15px] opacity-60 mb-12" style={{ color: G }}>Pick your industry. We walk you through every critical stage. Legal, Financial, Marketing, Sales, Operations, and Team. With exactly what you need at each step.</p>

          {!selectedBiz && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {pagedBiz.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => { setSelectedBiz(biz.id); setActiveBpTab(0); }}
                    className="rounded-2xl p-4 text-left transition-all duration-200 border hover:border-[#1B4D3E] hover:shadow-md"
                    style={{ backgroundColor: W, borderColor: "rgba(28,28,30,0.10)" }}
                  >
                    <p className="text-[14px] font-bold mb-1" style={{ color: G }}>{biz.label}</p>
                    <p className="text-[11px] leading-tight opacity-60" style={{ color: G }}>{biz.tagline.split(".")[0].trim()}</p>
                  </button>
                ))}
              </div>
              {bizPageCount > 1 && (
                <div className="flex items-center justify-end gap-2 mb-8">
                  <button onClick={() => setBizPage((p) => Math.max(0, p - 1))} disabled={bizPage === 0}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}20` }}>
                    <ChevronLeft size={16} style={{ color: G }} />
                  </button>
                  <span className="text-[12px] opacity-50" style={{ color: G }}>{bizPage + 1} / {bizPageCount}</span>
                  <button onClick={() => setBizPage((p) => Math.min(bizPageCount - 1, p + 1))} disabled={bizPage === bizPageCount - 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}20` }}>
                    <ChevronRight size={16} style={{ color: G }} />
                  </button>
                </div>
              )}
            </>
          )}

          {selectedBiz && selectedBp && (
            <div className="rounded-3xl overflow-hidden border" style={{ borderColor: `${G}20` }}>
              {/* Header */}
              <div className="px-8 py-7" style={{ backgroundColor: G }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: Au }}>BLUEPRINT</p>
                    <h3 className="text-[clamp(22px,3vw,30px)] font-bold mb-2" style={{ color: W }}>{selectedBp.label}</h3>
                    <p className="text-[13px] opacity-60" style={{ color: W }}>{selectedBp.tagline}</p>
                  </div>
                  <button onClick={() => setSelectedBiz(null)}
                    className="shrink-0 text-[12px] font-medium px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)", color: W }}>
                    Close
                  </button>
                </div>
                <div className="flex gap-1 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                  {STAGE_TABS.map((tab, i) => {
                    const stageExists = selectedBp.stages.find((s) => s.id === tab.id);
                    if (!stageExists) return null;
                    const active = activeBpTab === i;
                    return (
                      <button key={tab.id} onClick={() => setActiveBpTab(i)}
                        className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ backgroundColor: active ? Au : "rgba(255,255,255,0.1)", color: active ? G : "rgba(255,255,255,0.6)" }}>
                        <span className="opacity-50 mr-1">{tab.num}</span>{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeBpStage && (
                <div className="px-7 py-8" style={{ backgroundColor: W }}>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: `${G}60` }}>STAGE {activeBpTabDef?.num}</p>
                      <h4 className="text-[20px] font-bold mb-1" style={{ color: G }}>{activeBpStage.label}</h4>
                      <p className="text-[13px] leading-relaxed max-w-xl" style={{ color: G, opacity: 0.6 }}>{activeBpStage.tagline}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${BADGE_COLOR[activeBpStage.by]}15`, color: BADGE_COLOR[activeBpStage.by] }}>
                      {activeBpStage.by}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: Au }}>
                        <span className="w-3 h-px" style={{ backgroundColor: Au, display: "inline-block" }} />
                        Primary (must do first)
                      </p>
                      <div className="flex flex-col gap-3">
                        {activeBpStage.primary.map((item) => (
                          <div key={item.name} className="rounded-xl p-4" style={{ backgroundColor: Cr }}>
                            <p className="text-[13px] font-semibold mb-1" style={{ color: G }}>{item.name}</p>
                            <p className="text-[12px] leading-relaxed" style={{ color: G, opacity: 0.6 }}>{item.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: `${G}50` }}>Secondary</p>
                        <ul className="flex flex-col gap-2">
                          {activeBpStage.secondary.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-[12px]" style={{ color: G, opacity: 0.7 }}>
                              <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: G, opacity: 0.4 }} />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: `${G}50` }}>⚡ Automations</p>
                        <ul className="flex flex-col gap-2">
                          {activeBpStage.automations.map((a) => (
                            <li key={a} className="flex items-start gap-2 text-[12px]" style={{ color: G, opacity: 0.7 }}>
                              <span className="shrink-0 mt-0.5">⚡</span>
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button onClick={() => {
                          localStorage.setItem("hamzury-chat-context", `I need help setting up a ${selectedBp?.label || "business"}. Tell me more about the process.`);
                          const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                          if (btn) btn.click();
                        }}
                        className="mt-2 w-full py-3 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: G, color: Au }}>
                        Get Started →
                      </button>
                    </div>
                  </div>

                  {activeBpTab === STAGE_TABS.length - 1 && selectedBp.mayAlsoNeed && (
                    <div className="mt-8 pt-6 border-t" style={{ borderColor: `${G}10` }}>
                      <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: Au }}>YOU MAY ALSO NEED</p>
                      <div className="flex flex-col gap-4">
                        {selectedBp.mayAlsoNeed.map((need) => (
                          <div key={need.trigger} className="rounded-xl p-4" style={{ backgroundColor: Cr }}>
                            <p className="text-[12px] font-semibold mb-2" style={{ color: G }}>{need.trigger}</p>
                            <ul className="flex flex-col gap-1">
                              {need.items.map((item) => (
                                <li key={item} className="flex items-start gap-2 text-[12px]" style={{ color: G, opacity: 0.65 }}>
                                  <span className="shrink-0 mt-0.5">→</span>{item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── TRACK ──────────────────────────────────────────────────────── */}
      <section id="track" className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-xl mx-auto px-5 text-center">

          {/* Label */}
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: Au }}>
            TRACK
          </p>

          {/* Heading */}
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-bold tracking-tight mb-3" style={{ color: G }}>
            Track Your File
          </h2>

          {/* Subtext */}
          <p className="text-[14px] mb-8" style={{ color: G, opacity: 0.6 }}>
            Enter your tracking reference to access your file status.
          </p>

          {/* Input row */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={trackCode}
              onChange={(e) => {
                let raw = e.target.value.replace(/[^0-9]/g, "");
                if (raw.length > 8) raw = raw.slice(0, 8);
                let formatted = "HMZ-";
                if (raw.length > 0) formatted += raw.slice(0, 2);
                if (raw.length > 2) formatted += "/" + raw.slice(2, 3);
                if (raw.length > 3) formatted += "-" + raw.slice(3);
                setTrackCode(formatted);
                setTrackSubmitted(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="HMZ-26/3-XXXX"
              maxLength={17}
              className="flex-1 rounded-2xl px-4 py-3.5 text-[14px] outline-none border font-mono"
              style={{ borderColor: `${G}18`, backgroundColor: Cr, color: G }}
            />
            <button
              onClick={handleTrack}
              disabled={trackQuery.isFetching}
              className="px-6 py-3.5 rounded-2xl text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
              style={{ backgroundColor: G, color: Au }}
            >
              {trackQuery.isFetching ? "…" : "Access"}
            </button>
          </div>


          {/* Result: found */}
          {trackSubmitted && !trackQuery.isFetching && trackQuery.data?.found && (
            <div className="rounded-2xl p-5 text-left" style={{ backgroundColor: Cr, border: `1px solid ${G}15` }}>
              <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: Au }}>
                {trackQuery.data.ref}
              </p>
              <p className="text-[17px] font-bold mb-0.5" style={{ color: G }}>
                {trackQuery.data.clientName}
              </p>
              <p className="text-[13px] mb-4" style={{ color: G, opacity: 0.6 }}>
                {trackQuery.data.service}
              </p>
              {/* Progress bar - status steps */}
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: trackQuery.data.statusTotal }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full"
                    style={{ backgroundColor: i <= (trackQuery.data.statusIndex ?? -1) ? G : `${G}20` }} />
                ))}
              </div>
              <p className="text-[12px] font-semibold mb-4" style={{ color: G }}>{trackQuery.data.status}</p>
              <a
                href="/client/dashboard"
                onClick={e => {
                  e.preventDefault();
                  localStorage.setItem("hamzury-client-session", JSON.stringify({
                    ref: trackQuery.data!.ref, phone: "", name: trackQuery.data!.clientName,
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000
                  }));
                  window.location.href = "/client/dashboard";
                }}
                className="block w-full py-3 rounded-xl text-[13px] font-semibold text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: G, color: Au }}
              >
                Open Full Dashboard →
              </a>
            </div>
          )}

          {/* Result: not found */}
          {trackSubmitted && !trackQuery.isFetching && trackQuery.data && !trackQuery.data.found && (
            <p className="text-[13px]" style={{ color: G, opacity: 0.5 }}>
              Reference not found. You will receive your reference after payment. Use our chat to get started.
            </p>
          )}

        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 text-center" style={{ backgroundColor: G }}>
        <div className="max-w-2xl mx-auto px-5">
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold mb-4" style={{ color: W }}>
            Every day you wait is a deadline missed.
          </h2>
          <p className="text-[15px] opacity-60 mb-10" style={{ color: W }}>
            CAC won't remind you. FIRS won't warn you. Your licence renewal won't send you an email.<br />
            We stay ahead of every deadline. So you never face the consequences.
          </p>
          <button
            onClick={() => {
              localStorage.setItem("hamzury-chat-context", "I need help with business registration and compliance. Tell me more.");
              const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
              if (btn) btn.click();
            }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[15px] font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: Au, color: G }}
          >
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── CONSULTANT QUOTE ── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1B4D3E" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[clamp(18px,3vw,26px)] font-light leading-relaxed italic mb-8" style={{ color: "rgba(255,255,255,0.8)" }}>
            "Every business that struggles with compliance is leaving money on the table. We make sure you are never the business that gets shut down for paperwork."
          </p>
          <Link href="/consultant">
            <div className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: Au, color: "#1B4D3E" }}>BC</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white group-hover:underline">BizDoc Lead Consultant</p>
                <p className="text-[11px]" style={{ color: Au, opacity: 0.7 }}>View profile →</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-8 px-5 border-t" style={{ borderColor: "rgba(28,28,30,0.08)", backgroundColor: W }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] opacity-50" style={{ color: G }}>
          <p className="text-[12px] font-light italic mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
            "Compliance is freedom. That is how we protect." — Muhammad Hamzury, Founder
          </p>
          <p>© {new Date().getFullYear()} HAMZURY. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing"><span className="hover:opacity-100 transition-opacity cursor-pointer">Pricing</span></Link>
            <Link href="/alumni"><span className="hover:opacity-100 transition-opacity cursor-pointer">Alumni</span></Link>
            <Link href="/ridi"><span className="hover:opacity-100 transition-opacity cursor-pointer">RIDI</span></Link>
            <Link href="/privacy"><span className="hover:opacity-100 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-100 transition-opacity cursor-pointer">Terms</span></Link>
          </div>
        </div>
      </footer>

      {/* ── MOTIVATIONAL QUOTE BAR (mobile) ─────────────────────────────── */}
      <MotivationalQuoteBar color="#1B4D3E" />
      <div className="md:hidden h-10" />
    </>
  );
}