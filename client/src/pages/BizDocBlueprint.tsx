import { useState, useEffect } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, ChevronLeft, ChevronRight, X, Menu, MessageSquare } from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY BIZDOC — POSITIONING BLUEPRINT  /bizdoc/blueprint
   Industry-specific roadmaps: Legal → Financial → Marketing → Sales → Ops → Team
   ═══════════════════════════════════════════════════════════════════════════ */

const G     = "#1B4D3E";
const Au    = "#B48C4C";
const Cr    = "#FFFAF6";
const TEXT  = "#1A1A1A";
const W     = "#FFFFFF";
const CREAM = "#F5F3EF";

// ── PHASE TABS ────────────────────────────────────────────────────────────────
const PHASE_TABS = [
  { id: "legal",      num: "01", label: "Legal" },
  { id: "financial",  num: "02", label: "Financial" },
  { id: "marketing",  num: "03", label: "Marketing" },
  { id: "sales",      num: "04", label: "Sales" },
  { id: "operations", num: "05", label: "Operations" },
  { id: "team",       num: "06", label: "Team" },
];

type PhaseItem = { title: string; detail: string };
type Phase = { id: string; tagline: string; primary: PhaseItem[]; recommended: string[] };
type Blueprint = { id: string; label: string; tagline: string; badge: string; phases: Phase[] };

const BLUEPRINTS: Blueprint[] = [
  {
    id: "restaurant", label: "Restaurant / Food Business", badge: "FOOD & HOSPITALITY",
    tagline: "From kitchen to chain — the compliance, finance, and growth roadmap for food businesses in Nigeria.",
    phases: [
      {
        id: "legal",
        tagline: "Get legally protected before you serve a single plate.",
        primary: [
          { title: "CAC Business Name or Limited Company", detail: "Register with CAC to open a business account, sign leases, and bid for catering contracts. Limited company recommended if you plan to franchise or take investors." },
          { title: "NAFDAC Registration", detail: "Required for any packaged food product — bottled drinks, packaged spices, frozen items. Even restaurants selling packaged sauces need this." },
          { title: "State Food Handler's Permit", detail: "Required by most state environmental health agencies. Covers food safety, hygiene inspections, and waste disposal compliance." },
          { title: "Premises Permit & Fire Safety", detail: "Local government premises permit + fire safety certificate. Required before opening a dine-in location." },
        ],
        recommended: ["⭐ Starter Pack (₦250K) — CAC + TIN + Bank Account", "Sector Licence add-on for NAFDAC", "Post-Registration for TIN + BN"],
      },
      {
        id: "financial",
        tagline: "Separate your money from the business money — from day one.",
        primary: [
          { title: "Dedicated Business Account", detail: "Open a business account in your registered name. This is non-negotiable for tracking revenue, paying suppliers, and applying for loans." },
          { title: "POS & Payment Integration", detail: "Set up POS terminals and online payment (Paystack/Flutterwave) for delivery orders. Cashless payments increase average order value by 15-25%." },
          { title: "Monthly Bookkeeping System", detail: "Track cost of goods, staff wages, rent, and daily sales. A simple spreadsheet works initially — graduate to QuickBooks or Wave when revenue passes ₦500K/month." },
          { title: "Tax Compliance (VAT + CIT)", detail: "Register for VAT if turnover exceeds ₦25M. File Company Income Tax annually. Non-compliance blocks future loans and government contracts." },
        ],
        recommended: ["Tax Compliance package", "Annual Filing service", "⭐ Pro Pack (₦400K) — includes tax filing"],
      },
      {
        id: "marketing",
        tagline: "Your food might be excellent. Nobody cares if they don't know you exist.",
        primary: [
          { title: "Google Business Profile", detail: "Claim and optimize your Google listing. This is how people find you when they search 'restaurants near me'. Free, immediate, high-impact." },
          { title: "Instagram & TikTok Content", detail: "Food is visual. Post 3-5 times per week — behind-the-scenes kitchen shots, plating videos, customer reactions. Consistency beats perfection." },
          { title: "Local Delivery Platform Listing", detail: "Get on Chowdeck, Glovo, or Jumia Food. These platforms bring customers who are already hungry and ready to pay." },
          { title: "WhatsApp Business Catalogue", detail: "Set up your full menu on WhatsApp Business. Most Nigerian food orders still happen via WhatsApp — make it easy." },
        ],
        recommended: ["Systemise Website Package (from ₦150K)", "Systemise Social Media Management", "Skills Digital Marketing Program (₦45K)"],
      },
      {
        id: "sales",
        tagline: "Move from waiting for walk-ins to actively generating orders.",
        primary: [
          { title: "Corporate Catering Pipeline", detail: "Approach offices, event planners, and coworking spaces with a catering menu. Corporate orders are high-volume, recurring, and paid upfront." },
          { title: "Loyalty & Referral System", detail: "Stamp card or digital loyalty (buy 10 get 1 free). Referral discount for bringing a friend. Simple, effective, costs almost nothing." },
          { title: "Weekend & Event Specials", detail: "Create limited-time weekend menus or event packages. Scarcity drives urgency — 'Available this Saturday only' outperforms regular menus." },
          { title: "Subscription Meal Plans", detail: "Weekly or monthly meal prep subscriptions for professionals. Predictable revenue, efficient batch cooking, lower food waste." },
        ],
        recommended: ["Skills Business Development Program (₦35K)", "BizDoc Compliance for catering contracts"],
      },
      {
        id: "operations",
        tagline: "Systems that run when you're not in the kitchen.",
        primary: [
          { title: "Standard Operating Procedures", detail: "Document every recipe, portion size, opening/closing checklist. This is how chains maintain quality — and how you'll train new staff without losing standards." },
          { title: "Inventory & Supplier Management", detail: "Weekly inventory counts, approved supplier list, and reorder triggers. Food cost should stay between 28-35% of revenue." },
          { title: "Health & Safety Compliance", detail: "Regular hygiene audits, staff health checks, pest control schedule. One food poisoning incident can destroy a restaurant permanently." },
          { title: "Delivery & Logistics", detail: "Dedicated riders or third-party delivery. Track delivery times, customer complaints, and order accuracy. Late deliveries lose customers faster than bad food." },
        ],
        recommended: ["Systemise Business Automation", "⭐ Complete Pack (₦600K) — includes operational compliance"],
      },
      {
        id: "team",
        tagline: "Your team makes or breaks the experience.",
        primary: [
          { title: "Kitchen Staff Structure", detail: "Head chef, sous chef, line cooks, prep staff. Define roles clearly. The head chef manages quality — not everything." },
          { title: "Front-of-House Training", detail: "Customer greeting, order accuracy, complaint handling, upselling (drinks, desserts, sides). Train weekly, not once." },
          { title: "Staff Contracts & Payroll", detail: "Written employment contracts for all staff. Set up a payroll system — even if it's a spreadsheet. Pay on time, every time." },
          { title: "Performance & Retention", detail: "Monthly performance reviews. Bonuses tied to customer ratings or sales targets. Staff turnover is expensive — retention is cheaper." },
        ],
        recommended: ["BizDoc HR Compliance package", "Skills Internship Programme (free placement)"],
      },
    ],
  },
  {
    id: "import-export", label: "Import / Export Business", badge: "TRADE & LOGISTICS",
    tagline: "Navigate customs, licences, and compliance to move goods across borders profitably.",
    phases: [
      {
        id: "legal",
        tagline: "One missing licence can hold your container at the port for months.",
        primary: [
          { title: "CAC Limited Company", detail: "Import/export requires a registered limited company — not a business name. Banks, customs, and foreign suppliers all require it." },
          { title: "Import/Export Licence (NEPC)", detail: "Register with the Nigerian Export Promotion Council. This licence is required for all export activities and some import categories." },
          { title: "SON Conformity Assessment (SONCAP)", detail: "Mandatory for importing regulated products into Nigeria. Your goods will be held at port without a valid SONCAP certificate." },
          { title: "Form M & Pre-Arrival Assessment Report", detail: "Central Bank Form M is required for all imports above $10,000. PAAR from Customs is needed before your goods arrive at the port." },
        ],
        recommended: ["⭐ Complete Pack (₦600K) — CAC + Tax + Sector Licence", "Foreign Business setup for expatriate quota", "Post-Registration (TIN + BN)"],
      },
      {
        id: "financial",
        tagline: "International trade is capital-intensive. Structure your money correctly or lose it.",
        primary: [
          { title: "Domiciliary Account (USD, GBP, EUR)", detail: "Open a domiciliary account at your bank for receiving and sending foreign currency. Essential for paying suppliers and receiving export proceeds." },
          { title: "Letter of Credit Setup", detail: "For large orders, banks issue Letters of Credit to guarantee payment to your supplier. Builds trust and protects both parties." },
          { title: "Customs Duty Calculation", detail: "Understand your tariff classification (HS Code) and the applicable duty rate. Wrong classification = overpayment or seizure." },
          { title: "Foreign Exchange Management", detail: "Track exchange rates, hedge where possible, and maintain records for CBN compliance. FX volatility can wipe out your margin." },
        ],
        recommended: ["Tax Compliance package", "Annual Filing service", "⭐ Pro Pack (₦400K)"],
      },
      {
        id: "marketing",
        tagline: "Find buyers before you ship — not after.",
        primary: [
          { title: "Alibaba / TradeKey / Global Sources", detail: "List your export products on B2B trade platforms. Verified supplier badges increase inquiry rates significantly." },
          { title: "Trade Fair Participation", detail: "Attend Lagos International Trade Fair, Kano Trade Fair, and sector-specific exhibitions. Face-to-face builds trust in commodity trading." },
          { title: "Professional Website & Catalogue", detail: "International buyers research online before contacting you. A professional website with product specs, certifications, and MOQ is essential." },
          { title: "NEPC Export Directory", detail: "Get listed in the NEPC export directory. Foreign trade missions use this to find Nigerian suppliers." },
        ],
        recommended: ["Systemise Website Package (from ₦150K)", "Systemise Brand Identity", "Skills Digital Marketing Program (₦45K)"],
      },
      {
        id: "sales",
        tagline: "Close international deals with proper documentation and follow-through.",
        primary: [
          { title: "Proforma Invoice System", detail: "Create professional proforma invoices with Incoterms (FOB, CIF, DDP). Buyers judge your professionalism by your documentation." },
          { title: "Sample & Quality Assurance", detail: "Send samples before bulk orders. Include quality certificates, lab reports, and packaging specs. This closes deals faster than price negotiation." },
          { title: "Agent & Distributor Network", detail: "Build relationships with clearing agents, freight forwarders, and destination-country distributors. Your network determines your speed." },
          { title: "Contract & Payment Terms", detail: "Standard trade contracts with clear payment terms (T/T, L/C, D/P). Never ship without securing at least 30-50% advance payment." },
        ],
        recommended: ["BizDoc Legal Pack", "Skills Business Development Program (₦35K)"],
      },
      {
        id: "operations",
        tagline: "Logistics is the business. Get this wrong and margins disappear.",
        primary: [
          { title: "Freight & Shipping Management", detail: "Compare rates across shipping lines. Consolidate shipments to reduce per-unit cost. Track every container from origin to destination." },
          { title: "Customs Clearing Process", detail: "Work with a licensed customs broker. Pre-clear documentation before arrival. Demurrage charges at Nigerian ports destroy profit margins." },
          { title: "Warehouse & Inventory", detail: "Bonded warehouse for imports awaiting clearance. Local warehouse for domestic distribution. Track stock levels and reorder points." },
          { title: "Insurance & Risk Management", detail: "Marine cargo insurance for every shipment. All-risk cover is worth the premium — one lost container can bankrupt a small trader." },
        ],
        recommended: ["Systemise Business Automation", "BizDoc Compliance Management"],
      },
      {
        id: "team",
        tagline: "You can't run international trade alone. Build the right support structure.",
        primary: [
          { title: "Logistics Coordinator", detail: "Hire or train someone to track shipments, liaise with clearing agents, and manage documentation. This is your most critical hire." },
          { title: "Finance / Accounts Officer", detail: "Track FX transactions, duty payments, supplier payments, and customer invoices. Errors here are expensive and often irreversible." },
          { title: "Quality Control Inspector", detail: "Inspect goods before shipment (for exports) or after arrival (for imports). Rejects at destination cost 3x more than catching them at source." },
          { title: "Clearing Agent Relationship", detail: "Not an employee but effectively part of your team. Choose based on track record, not price. A bad agent costs more in delays." },
        ],
        recommended: ["BizDoc HR Compliance package", "Skills Internship Programme"],
      },
    ],
  },
  {
    id: "tech-startup", label: "Tech Startup", badge: "TECHNOLOGY",
    tagline: "Build, launch, and scale a tech company in Nigeria with the right legal and business foundation.",
    phases: [
      {
        id: "legal",
        tagline: "Protect your IP and structure before you raise or scale.",
        primary: [
          { title: "CAC Limited Company (with proper MEMART)", detail: "Register as a Limited Company with a Memorandum of Association that covers tech, SaaS, and digital services. Critical for investor due diligence." },
          { title: "Intellectual Property Protection", detail: "Register your trademark (brand name, logo) with the Trademarks Registry. For software, document your IP ownership in founder agreements." },
          { title: "Data Protection Compliance (NDPR)", detail: "Nigeria Data Protection Regulation compliance is mandatory if you collect user data. Privacy policy, data processing agreements, and consent mechanisms." },
          { title: "Founder & Shareholder Agreements", detail: "Founder vesting schedule, equity split, decision-making authority, and exit clauses. Do this before you build — not after your first disagreement." },
        ],
        recommended: ["⭐ Starter Pack (₦250K) — CAC + TIN + Bank Account", "BizDoc Legal Pack for IP & contracts", "NDPR Compliance add-on"],
      },
      {
        id: "financial",
        tagline: "Cash management kills more startups than bad products.",
        primary: [
          { title: "Startup-Friendly Banking", detail: "Open accounts with banks that serve startups (Providus, Wema, Sterling). Some offer API banking, virtual accounts, and developer-friendly tools." },
          { title: "Revenue Model & Unit Economics", detail: "Define how you make money — subscription, transaction fee, commission, licensing. Know your CAC, LTV, and burn rate before you fundraise." },
          { title: "Grant & Investment Readiness", detail: "Prepare a data room: pitch deck, financials, cap table, legal docs, product metrics. Nigerian grants (Tony Elumelu, NITDA) require specific formats." },
          { title: "Payroll & Contractor Setup", detail: "Structure your team — who is full-time (PAYE tax) vs contractor (invoice-based). Misclassification creates tax liability." },
        ],
        recommended: ["Tax Compliance package", "⭐ Pro Pack (₦400K)", "Annual Filing service"],
      },
      {
        id: "marketing",
        tagline: "Distribution is everything. The best product with no users is just a hobby.",
        primary: [
          { title: "Product-Led Growth Strategy", detail: "Free tier, freemium, or free trial. Let the product sell itself. Nigerian tech users test before they trust." },
          { title: "Community Building", detail: "Twitter/X, LinkedIn, WhatsApp communities. Share insights, not just product updates. Authority attracts users; ads rent attention." },
          { title: "Content Marketing & SEO", detail: "Blog posts, tutorials, case studies targeting your ideal user's Google searches. Organic traffic compounds — paid ads stop when budget stops." },
          { title: "Partnership & Integration Marketing", detail: "Partner with complementary tools. API integrations, co-marketing campaigns, and referral programs with aligned businesses." },
        ],
        recommended: ["Systemise Website Package (from ₦150K)", "Skills Digital Marketing Program (₦45K)", "Systemise SEO Package"],
      },
      {
        id: "sales",
        tagline: "Enterprise deals fund startups. Learn to close them.",
        primary: [
          { title: "Enterprise Sales Process", detail: "Identify decision-makers, run demos, handle procurement processes, and navigate long sales cycles. B2B sales in Nigeria averages 3-6 months." },
          { title: "Pricing Strategy", detail: "Nigerian market is price-sensitive. Tiered pricing, annual discounts, and Naira pricing (not USD) for local clients. Test pricing — don't guess." },
          { title: "Pilot / POC Programs", detail: "Offer 30-60 day pilot programs for enterprise clients. Low risk for them, high conversion for you. Structure with clear success metrics." },
          { title: "Channel Partners & Resellers", detail: "Recruit implementation partners, consultants, and resellers who already have relationships with your target customers." },
        ],
        recommended: ["Skills Business Development Program (₦35K)", "BizDoc Legal Pack for contracts"],
      },
      {
        id: "operations",
        tagline: "Scale the system, not the chaos.",
        primary: [
          { title: "Product Development Process", detail: "Sprint cycles, backlog management, QA process, deployment pipeline. Ship weekly, not quarterly. User feedback drives the roadmap." },
          { title: "Customer Support System", detail: "Help desk, knowledge base, and SLA definitions. Response time matters more than resolution time in early stage." },
          { title: "Infrastructure & Security", detail: "Cloud hosting (AWS, GCP, Azure), SSL, regular backups, access controls. One security breach ends a startup. Budget for security from day one." },
          { title: "Metrics & Analytics", detail: "Track DAU/MAU, churn, NPS, feature adoption, and revenue per user. If you can't measure it, you can't improve it." },
        ],
        recommended: ["Systemise CTO-as-a-Service", "Systemise Business Automation"],
      },
      {
        id: "team",
        tagline: "Hire slow, fire fast. Your first 10 hires define your culture.",
        primary: [
          { title: "Technical Co-founder or CTO", detail: "If you're non-technical, you need a technical co-founder — not a contractor. Someone who owns the product architecture and tech decisions." },
          { title: "First Engineering Hires", detail: "Full-stack developers who can wear multiple hats. Senior enough to build without micromanagement, junior enough to stay hungry." },
          { title: "Growth / Marketing Hire", detail: "Someone who understands both content and performance marketing. In early stage, this person runs everything from social media to paid ads." },
          { title: "Equity & Compensation Structure", detail: "ESOP pool (10-15%), vesting schedules (4-year with 1-year cliff), and clear equity policies. Attract talent you can't afford with salary alone." },
        ],
        recommended: ["BizDoc HR Compliance package", "Skills Internship Programme", "Systemise Recruitment Support"],
      },
    ],
  },
  {
    id: "fashion", label: "Fashion & Clothing Brand", badge: "FASHION & RETAIL",
    tagline: "From designs to a scalable brand — compliance, production, and distribution for fashion businesses.",
    phases: [
      {
        id: "legal",
        tagline: "Protect your brand before someone else copies it.",
        primary: [
          { title: "CAC Business Name or Limited Company", detail: "Register to open business accounts, sign supplier agreements, and protect your brand legally. Limited company if you plan to scale beyond one shop." },
          { title: "Trademark Registration", detail: "Register your brand name and logo with the Trademarks Registry. In fashion, brand identity is everything — protect it before a competitor copies it." },
          { title: "Product Labelling Compliance", detail: "SON requires proper labelling — material composition, care instructions, country of origin. Non-compliance leads to market seizure." },
          { title: "Import Permits (if applicable)", detail: "If importing fabrics or finished goods, SONCAP and Form M requirements apply. Plan customs costs into your pricing." },
        ],
        recommended: ["⭐ Starter Pack (₦250K) — CAC + TIN + Bank Account", "BizDoc Legal Pack for trademarks", "Post-Registration (TIN + BN)"],
      },
      {
        id: "financial",
        tagline: "Fashion margins are tight. Track every naira or lose your business.",
        primary: [
          { title: "Cost of Production Tracking", detail: "Fabric, trims, labour, packaging — know your exact cost per piece. If you don't know your margins, you're guessing at profitability." },
          { title: "Pricing Strategy", detail: "Markup should account for production, marketing, overhead, and profit. Nigerian fashion brands often underprice — your price signals your positioning." },
          { title: "Inventory Management", detail: "Track stock by style, size, and colour. Dead stock is dead money. Pre-orders and made-to-order reduce inventory risk." },
          { title: "Business Account & POS", detail: "Separate personal and business money. Accept transfers, POS, and online payments. Make it easy for customers to pay." },
        ],
        recommended: ["Tax Compliance package", "⭐ Pro Pack (₦400K)", "Annual Filing service"],
      },
      {
        id: "marketing",
        tagline: "In fashion, perception is reality. Control yours.",
        primary: [
          { title: "Instagram & TikTok Strategy", detail: "Fashion lives on Instagram and TikTok. Post 4-5 times per week — lookbooks, behind-the-scenes, styling tips, customer features." },
          { title: "Influencer & Styling Partnerships", detail: "Send pieces to styled influencers, not just anyone. Micro-influencers (5K-50K followers) in your niche convert better than celebrities." },
          { title: "Professional Photography", detail: "Product photos sell clothes. Invest in proper photography — flat lays, on-model shots, lifestyle images. One photoshoot = 3 months of content." },
          { title: "Pop-Up & Trunk Shows", detail: "Physical presence builds trust in Nigerian fashion. Pop-ups at malls, markets, and events let customers touch fabric and try on." },
        ],
        recommended: ["Systemise Website Package (from ₦150K)", "Skills Faceless Content Intensive (₦25K)", "Systemise Social Media Management"],
      },
      {
        id: "sales",
        tagline: "Move from DM orders to a real sales system.",
        primary: [
          { title: "E-commerce Setup", detail: "Your own website with Paystack checkout. Instagram DMs don't scale — a website handles orders while you sleep." },
          { title: "Wholesale & Stockist Network", detail: "Approach boutiques, concept stores, and online retailers to stock your pieces. Wholesale is lower margin but higher volume." },
          { title: "Pre-Order & Collection Drops", detail: "Launch collections with pre-order windows. Creates urgency, reduces inventory risk, and funds production before you manufacture." },
          { title: "Customer Database & Retention", detail: "Collect customer data (WhatsApp, email). New collection announcements, birthday discounts, exclusive access for repeat buyers." },
        ],
        recommended: ["Systemise E-commerce Package", "Skills Business Development Program (₦35K)"],
      },
      {
        id: "operations",
        tagline: "Scale production without sacrificing quality.",
        primary: [
          { title: "Production Pipeline", detail: "Design → pattern → sample → approval → bulk production → QC → packaging. Define timelines for each stage. Late delivery kills fashion businesses." },
          { title: "Supplier Relationships", detail: "Build relationships with reliable fabric suppliers and tailors. Have backup suppliers for every critical material. Never depend on one source." },
          { title: "Quality Control Process", detail: "Check every piece before packaging — stitching, sizing, finishing. Returns and complaints destroy margins and reputation." },
          { title: "Packaging & Delivery", detail: "Branded packaging adds perceived value. Reliable delivery (own riders or logistics partners). Track every order from dispatch to delivery." },
        ],
        recommended: ["Systemise Business Automation", "⭐ Complete Pack (₦600K)"],
      },
      {
        id: "team",
        tagline: "Build a team that can produce without you in the workshop.",
        primary: [
          { title: "Head Tailor / Production Manager", detail: "Someone who manages the tailoring team, ensures quality, and hits deadlines. This is your most critical operational hire." },
          { title: "Social Media / Content Creator", detail: "Dedicated person for content creation, community management, and customer DMs. In fashion, your online presence is your storefront." },
          { title: "Sales / Customer Service", detail: "Handle orders, inquiries, returns, and follow-ups. One bad customer experience gets screenshotted and shared — respond fast." },
          { title: "Dispatch & Logistics", detail: "Packaging, labelling, and dispatch. As volume grows, this becomes a full-time role. Errors here (wrong size, wrong address) are expensive." },
        ],
        recommended: ["BizDoc HR Compliance package", "Skills Internship Programme"],
      },
    ],
  },
  {
    id: "construction", label: "Construction & Real Estate", badge: "PROPERTY & BUILD",
    tagline: "Permits, financing, project management, and compliance for construction and property businesses.",
    phases: [
      {
        id: "legal",
        tagline: "One missing permit can shut down an entire project.",
        primary: [
          { title: "CAC Limited Company", detail: "Construction contracts — especially government — require a registered limited company. Sole proprietorship won't get you past prequalification." },
          { title: "Building Permits & Approvals", detail: "State planning authority approval, environmental impact assessment (where required), and local government building permit. Start early — approvals take weeks." },
          { title: "COREN / ARCON Registration", detail: "Council for Regulation of Engineering (COREN) for structural work. Architects Registration Council (ARCON) for design. Required for professional liability." },
          { title: "Contract Documentation", detail: "JCT or FIDIC standard contracts for every project. Scope, payment schedule, variation clauses, and dispute resolution. Verbal agreements don't survive disputes." },
        ],
        recommended: ["⭐ Complete Pack (₦600K) — CAC + Tax + Sector Licence", "BizDoc Legal Pack", "Post-Registration (TIN + BN)"],
      },
      {
        id: "financial",
        tagline: "Cash flow kills construction companies faster than bad projects.",
        primary: [
          { title: "Project Costing & BOQ", detail: "Bill of Quantities for every project. Material costs, labour, equipment hire, overheads, and profit margin. Undercosting is the number one reason construction firms fail." },
          { title: "Stage Payment Structure", detail: "Negotiate milestone-based payments — mobilization (20-30%), foundation, structure, finishing, handover. Never fund projects from pocket while waiting for final payment." },
          { title: "Bank Guarantee & Bond", detail: "Performance bonds and advance payment guarantees for large contracts. Banks provide these against your financials — keep your books clean." },
          { title: "Tax & Withholding Compliance", detail: "Construction payments attract 5% withholding tax. File your WHT credits to offset against CIT. Non-compliance blocks future government contracts." },
        ],
        recommended: ["Tax Compliance package", "⭐ Pro Pack (₦400K)", "Annual Filing service"],
      },
      {
        id: "marketing",
        tagline: "In construction, your reputation is your marketing.",
        primary: [
          { title: "Project Portfolio", detail: "Professional photos and documentation of completed projects. Before/after, progress shots, and client testimonials. This is your most powerful sales tool." },
          { title: "LinkedIn & Industry Presence", detail: "Construction decisions happen on LinkedIn and at industry events. Share project updates, site progress, and industry insights." },
          { title: "BPP Registration", detail: "Register with the Bureau of Public Procurement for government contract opportunities. This is how you access the largest buyer in Nigeria." },
          { title: "Industry Association Membership", detail: "Nigerian Institute of Building, Nigerian Society of Engineers — membership opens networking, tender information, and credibility." },
        ],
        recommended: ["Systemise Website Package (from ₦150K)", "Systemise Brand Identity"],
      },
      {
        id: "sales",
        tagline: "Win contracts with preparation, not just pricing.",
        primary: [
          { title: "Prequalification Documents", detail: "Company profile, audited accounts, project list, key personnel CVs, equipment list, reference letters. Keep this updated and ready at all times." },
          { title: "Tender Response System", detail: "Monitor tender notices (BPP, newspapers, online portals). Assign someone to prepare responses. Late or incomplete submissions waste opportunities." },
          { title: "Relationship Building", detail: "Construction is a relationship business. Attend site visits, industry events, and maintain connections with quantity surveyors and architects who specify contractors." },
          { title: "JV & Subcontracting", detail: "Joint ventures with larger firms for contracts above your capacity. Subcontracting for established firms to build your track record." },
        ],
        recommended: ["Skills Business Development Program (₦35K)", "BizDoc Legal Pack for contracts"],
      },
      {
        id: "operations",
        tagline: "Deliver on time, on budget, on spec. That's the entire business.",
        primary: [
          { title: "Project Management System", detail: "Gantt charts, milestone tracking, and weekly site reports. Use tools like MS Project or even a well-structured spreadsheet. Track everything." },
          { title: "Material Procurement", detail: "Bulk purchasing, approved vendor list, and delivery scheduling. Material price volatility is real — lock in prices early or include escalation clauses." },
          { title: "Health & Safety Compliance", detail: "Site safety officer, PPE for all workers, safety briefings, and incident reporting. HSE compliance is now enforced — violations shut down sites." },
          { title: "Quality Assurance", detail: "Stage inspections at foundation, structural, and finishing phases. Independent QA if possible. Rework costs 3x more than getting it right the first time." },
        ],
        recommended: ["Systemise Business Automation", "Systemise Project Management Setup"],
      },
      {
        id: "team",
        tagline: "Construction is people-intensive. Structure your workforce.",
        primary: [
          { title: "Site Manager / Project Manager", detail: "Your representative on site. Manages daily operations, coordinates trades, and reports progress. This hire determines whether projects run smoothly." },
          { title: "Quantity Surveyor", detail: "Manages costs, valuations, and payment certificates. On large projects, a QS saves you more than they cost." },
          { title: "Skilled Labour Pool", detail: "Reliable masons, electricians, plumbers, and carpenters. Build long-term relationships with skilled tradespeople — the best ones are always booked." },
          { title: "Administrative Support", detail: "Documentation, filing, correspondence, and payment processing. Construction generates enormous paperwork — someone needs to manage it." },
        ],
        recommended: ["BizDoc HR Compliance package", "Skills Internship Programme"],
      },
    ],
  },
  {
    id: "consulting", label: "Consulting / Professional Services", badge: "PROFESSIONAL SERVICES",
    tagline: "Structure your expertise into a scalable, compliant consulting practice.",
    phases: [
      {
        id: "legal",
        tagline: "Your credibility starts with your legal structure.",
        primary: [
          { title: "CAC Limited Company", detail: "Clients — especially corporate and government — require you to be a registered company. Business name registration limits your credibility and contract eligibility." },
          { title: "Professional Body Registration", detail: "Register with your relevant professional body (ICAN, NBA, COREN, NIM, etc.). Many consulting engagements require proof of professional standing." },
          { title: "Service Agreement Templates", detail: "Standard consulting agreements covering scope, deliverables, timelines, fees, confidentiality, and IP ownership. Never start work on a verbal agreement." },
          { title: "Professional Indemnity Insurance", detail: "Covers you against claims arising from professional advice. Increasingly required by large clients as a condition of engagement." },
        ],
        recommended: ["⭐ Starter Pack (₦250K) — CAC + TIN + Bank Account", "BizDoc Legal Pack", "Post-Registration (TIN + BN)"],
      },
      {
        id: "financial",
        tagline: "Consultants who don't invoice properly don't get paid properly.",
        primary: [
          { title: "Pricing & Fee Structure", detail: "Hourly, daily, project-based, or retainer. Know your rates and anchor them to value delivered, not time spent. Nigerian market responds to project pricing." },
          { title: "Invoicing & Payment Terms", detail: "Professional invoices with 14-30 day payment terms. Chase payments systematically — Nigerian corporates pay late by default. Build that into your cash flow." },
          { title: "Tax Compliance (WHT + VAT + CIT)", detail: "Consulting fees attract 10% withholding tax from corporate clients. Register for VAT if turnover exceeds ₦25M. File CIT annually." },
          { title: "Expense Tracking", detail: "Track billable expenses (travel, materials, tools) separately. Include in proposals where applicable. Don't absorb costs the client should cover." },
        ],
        recommended: ["Tax Compliance package", "⭐ Pro Pack (₦400K)", "Annual Filing service"],
      },
      {
        id: "marketing",
        tagline: "Consultants are hired based on trust. Build it publicly.",
        primary: [
          { title: "LinkedIn Authority Building", detail: "Post insights 3-4 times per week. Share frameworks, case studies (anonymised), and industry analysis. LinkedIn is the primary hiring channel for consultants." },
          { title: "Speaking & Events", detail: "Speak at industry events, webinars, and panels. One good speaking engagement generates more leads than months of content." },
          { title: "Case Studies & Thought Leadership", detail: "Document your best client outcomes as case studies. 'We helped X achieve Y in Z timeframe' — this is your proof of value." },
          { title: "Referral System", detail: "Consulting runs on referrals. Ask every satisfied client for a testimonial and an introduction. Systematise this — don't leave it to chance." },
        ],
        recommended: ["Systemise Website Package (from ₦150K)", "Skills Digital Marketing Program (₦45K)", "Systemise Brand Identity"],
      },
      {
        id: "sales",
        tagline: "Close engagements with structured proposals and clear value.",
        primary: [
          { title: "Proposal System", detail: "Standardised proposal template — situation analysis, approach, deliverables, timeline, team, and fees. Customise for each client but don't reinvent the wheel." },
          { title: "Discovery Call Framework", detail: "Structured 30-minute discovery calls. Ask about their challenge, previous attempts, timeline, budget, and decision process. Qualify before you propose." },
          { title: "Retainer & Long-Term Contracts", detail: "Monthly retainers provide predictable revenue. Offer retainer options alongside project-based pricing. Recurring revenue stabilises consulting businesses." },
          { title: "Strategic Partnerships", detail: "Partner with complementary consultants, law firms, accounting firms. Cross-referral agreements expand your reach without marketing spend." },
        ],
        recommended: ["Skills Business Development Program (₦35K)", "BizDoc Legal Pack for contracts"],
      },
      {
        id: "operations",
        tagline: "Systematise your delivery so quality doesn't depend on your availability.",
        primary: [
          { title: "Methodology & Frameworks", detail: "Document your consulting approach into repeatable frameworks. This is how you scale beyond yourself — others can deliver using your methodology." },
          { title: "Project Management", detail: "Track deliverables, deadlines, and client communications. Even solo consultants need a system — Notion, Asana, or a simple Trello board." },
          { title: "Knowledge Management", detail: "Templates, research, industry data, and previous deliverables — organised and searchable. Don't start from scratch on every engagement." },
          { title: "Client Communication Cadence", detail: "Weekly updates, progress reports, and checkpoint meetings. Clients who feel informed don't micromanage. Silence creates anxiety." },
        ],
        recommended: ["Systemise Business Automation", "Systemise CTO-as-a-Service"],
      },
      {
        id: "team",
        tagline: "Scale from solo consultant to a consulting firm.",
        primary: [
          { title: "Associate Consultants", detail: "Build a bench of freelance consultants you can deploy on projects. Pay per engagement. This lets you take larger projects without fixed overhead." },
          { title: "Project Coordinator / EA", detail: "Someone to manage scheduling, client communications, invoicing, and follow-ups. Frees your time for billable work and business development." },
          { title: "Research / Analyst Support", detail: "Junior analyst for data gathering, report formatting, and presentation preparation. Leverage their time so you can focus on high-value advisory." },
          { title: "Succession & Knowledge Transfer", detail: "Document everything so the firm doesn't collapse without you. Train associates to deliver independently. The goal is a business, not a job." },
        ],
        recommended: ["BizDoc HR Compliance package", "Skills Internship Programme"],
      },
    ],
  },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function BizDocBlueprint() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedBp, setSelectedBp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const PER_PAGE = 6;
  const pageCount = Math.ceil(BLUEPRINTS.length / PER_PAGE);
  const paged = BLUEPRINTS.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const bp = BLUEPRINTS.find(b => b.id === selectedBp);
  const tabDef = PHASE_TABS[activeTab];
  const phase = bp?.phases.find(p => p.id === tabDef?.id) ?? null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: Cr, color: TEXT }}>
      <PageMeta
        title="Positioning Blueprint — HAMZURY BizDoc"
        description="Industry-specific roadmaps covering legal, financial, marketing, sales, operations, and team — with package recommendations for every stage."
      />

      {/* ── NAV (architect style — matches BizDoc portal) ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <span
            className="text-[13px] tracking-[4px] font-light uppercase cursor-default select-none"
            style={{ color: scrolled ? G : W, letterSpacing: "0.25em" }}
          >
            BIZDOC
          </span>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: scrolled ? G : W }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {navMenuOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
              style={{ backgroundColor: W }}
              onClick={() => setNavMenuOpen(false)}
            >
              {[
                { label: "BizDoc Home", href: "/bizdoc" },
                { label: "Home",        href: "/" },
                { label: "Systemise",   href: "/systemise" },
                { label: "Skills",      href: "/skills" },
                { label: "Pricing",     href: "/pricing" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: G }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO (full viewport, architect style) ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: G }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-6" style={{ color: Au }}>POSITIONING BLUEPRINT</p>
          <h1
            className="text-[clamp(32px,6vw,48px)] font-light leading-[1.1] mb-6 tracking-tight"
            style={{ color: W }}
          >
            Your industry.{" "}
            <span style={{ color: Au }}>Your roadmap.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-md mx-auto" style={{ color: W, opacity: 0.55 }}>
            Legal. Financial. Marketing. Sales. Operations. Team. Every phase mapped to the services your business actually needs.
          </p>
          <button
            onClick={() => document.getElementById("blueprints")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: Au, color: G }}
          >
            Select Your Industry
          </button>
        </div>
      </section>

      <MotivationalQuoteBar department="bizdoc" />

      {/* ── BLUEPRINT GRID / DETAIL ── */}
      <section id="blueprints" className="py-24 md:py-32 px-6" style={{ backgroundColor: Cr }}>
        <div className="max-w-5xl mx-auto">
          {!selectedBp && (
            <>
              <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: Au }}>
                SELECT YOUR INDUSTRY
              </p>
              <h2
                className="text-[clamp(28px,4vw,42px)] font-light mb-20 text-center leading-tight tracking-tight"
                style={{ color: G }}
              >
                Where is your business?
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {paged.map((b) => (
                  <button key={b.id}
                    onClick={() => { setSelectedBp(b.id); setActiveTab(0); }}
                    className="rounded-[20px] p-8 text-left transition-all duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: W, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Au}18`, color: Au }}>{b.badge}</span>
                    </div>
                    <h3 className="text-[16px] font-semibold mb-2" style={{ color: G }}>{b.label}</h3>
                    <p className="text-[13px] leading-relaxed mb-4" style={{ color: G, opacity: 0.55 }}>{b.tagline.slice(0, 90)}…</p>
                    <span className="text-[13px] font-medium flex items-center gap-1.5" style={{ color: Au }}>
                      View Roadmap <ArrowRight size={13} />
                    </span>
                  </button>
                ))}
              </div>
              {pageCount > 1 && (
                <div className="flex items-center justify-end gap-2 mb-8">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}25` }}>
                    <ChevronLeft size={16} style={{ color: G }} />
                  </button>
                  <span className="text-[12px] opacity-50" style={{ color: TEXT }}>{page + 1} / {pageCount}</span>
                  <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page === pageCount - 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${G}25` }}>
                    <ChevronRight size={16} style={{ color: G }} />
                  </button>
                </div>
              )}
            </>
          )}

          {selectedBp && bp && (
            <div className="rounded-[20px] overflow-hidden" style={{ boxShadow: "0 4px 40px rgba(0,0,0,0.08)" }}>
              {/* Header */}
              <div className="px-8 py-7" style={{ backgroundColor: G }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Au}25`, color: Au }}>{bp.badge}</span>
                    </div>
                    <h3 className="text-[clamp(22px,3vw,30px)] font-bold mb-1" style={{ color: W }}>{bp.label}</h3>
                    <p className="text-[13px] opacity-60" style={{ color: W }}>{bp.tagline}</p>
                  </div>
                  <button onClick={() => setSelectedBp(null)}
                    className="shrink-0 text-[12px] font-medium px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)", color: W }}>
                    Close
                  </button>
                </div>
                <div className="flex gap-1 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                  {PHASE_TABS.map((tab, i) => {
                    const active = activeTab === i;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(i)}
                        className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ backgroundColor: active ? Au : "rgba(255,255,255,0.1)", color: active ? TEXT : "rgba(255,255,255,0.6)" }}>
                        <span className="opacity-50 mr-1">{tab.num}</span>{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {phase && (
                <div className="px-8 py-10" style={{ backgroundColor: W }}>
                  <p className="text-[14px] leading-relaxed max-w-xl mb-8" style={{ color: TEXT, opacity: 0.55 }}>{phase.tagline}</p>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-6 flex items-center gap-2" style={{ color: Au }}>
                        <span className="w-4 h-px inline-block" style={{ backgroundColor: Au }} />
                        WHAT YOU NEED
                      </p>
                      <div className="flex flex-col gap-4">
                        {phase.primary.map((item) => (
                          <div key={item.title} className="rounded-[16px] p-5" style={{ backgroundColor: Cr }}>
                            <p className="text-[14px] font-semibold mb-1.5" style={{ color: G }}>{item.title}</p>
                            <p className="text-[13px] leading-relaxed" style={{ color: TEXT, opacity: 0.55 }}>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-8">
                      <div>
                        <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: `${TEXT}55` }}>RECOMMENDED</p>
                        <ul className="flex flex-col gap-3">
                          {phase.recommended.map((s) => (
                            <li key={s} className="flex items-start gap-2.5 text-[13px]" style={{ color: G, opacity: 0.75 }}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: Au }} />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <a href="/bizdoc"
                        className="mt-auto w-full py-3.5 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02] text-center block"
                        style={{ backgroundColor: Au, color: G }}>
                        Get Started
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 md:py-32 text-center" style={{ backgroundColor: W }}>
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: Au }}>
            NOT SURE WHERE TO START?
          </p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-6" style={{ color: G }}>
            Tell us your industry. We'll map it out.
          </h2>
          <a href="/bizdoc"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: Au, color: G }}>
            Talk to BizDoc <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: G }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[13px] tracking-[4px] font-light uppercase" style={{ color: `${W}88` }}>BIZDOC</span>
          <div className="flex items-center gap-6 text-[12px] flex-wrap justify-center sm:justify-end">
            <a href="/bizdoc" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>BizDoc Home</a>
            <a href="/systemise" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Systemise</a>
            <a href="/skills" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Skills</a>
            <a href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Privacy</a>
            <a href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: `${W}55` }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
