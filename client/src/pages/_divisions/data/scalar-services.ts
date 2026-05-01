/**
 * Scalar services catalog — same shape as Bizdoc, generated from
 * existing Scalar service categories + a realistic spread of websites,
 * automation, AI, CRM, podcast tech, ecommerce, and managed services.
 *
 * status: "draft" — every fee/timeline is a Nigerian-market estimate.
 * Founder must verify before launch.
 *
 * TODO verify with founder — every fee in this file is an estimate.
 */
import type { DivisionServicesCatalog, ServiceItem } from "../division-services-types";

const websites: ServiceItem[] = [
  { id: "site_landing", name: "Landing Page (1-pager)", use: "A focused single page for a campaign or product launch — built to convert visitors who click an ad.", fee: "₦150,000", timeline: "Live in about a week.", need: "Brand assets, a quick copy brief, and who you're trying to reach." }, // TODO verify with founder
  { id: "site_business", name: "Professional Business Website", use: "A 5-7 page site that makes your business look serious online, with a CMS so you can edit it later.", fee: "₦350,000", timeline: "Two to three weeks from kickoff to launch.", need: "Brand assets, a rough page outline, and any content you've already written." }, // TODO verify with founder
  { id: "site_ecommerce", name: "E-commerce Store", use: "A storefront that takes payments via Paystack or Flutterwave and handles delivery logic.", fee: "₦600,000", timeline: "Three to four weeks.", need: "Your product list, prices, and how you want delivery to work." }, // TODO verify with founder
  { id: "site_portfolio", name: "Portfolio / Showcase Site", use: "An image-led site for creatives and consultants — let your work do the talking.", fee: "₦250,000", timeline: "Around two weeks.", need: "Portfolio pieces, a short bio, and contact info." }, // TODO verify with founder
  { id: "site_blog", name: "Blog / Editorial Site", use: "A content-led site with author profiles — for when writing is your product.", fee: "₦300,000", timeline: "Two to three weeks.", need: "Existing articles (if any) and author bios." }, // TODO verify with founder
  { id: "site_redesign", name: "Website Redesign", use: "Rebuild an older site with a modern stack so it loads fast and looks current.", fee: "Starts from ₦400,000", timeline: "Three to four weeks.", need: "Your current site URL and a quick content audit." }, // TODO verify with founder
  { id: "site_hosting", name: "Hosting + Domain Management", use: "We handle hosting, renewals, and the boring infrastructure so your site stays up.", fee: "₦80,000/year", timeline: "Live within 24 hours.", need: "Your existing domain — or we'll register a fresh one." }, // TODO verify with founder
  { id: "site_seo_audit", name: "SEO Audit + Implementation", use: "Find why Google isn't sending you traffic and fix it — technical and on-page.", fee: "₦200,000", timeline: "Two to three weeks.", need: "Site URL and the keywords you'd love to rank for." }, // TODO verify with founder
];

const software: ServiceItem[] = [
  { id: "software_internal_tool", name: "Internal Operations Tool", use: "A custom dashboard for your back-office team — replaces the spreadsheet they've outgrown.", fee: "Starts from ₦1,200,000", timeline: "Six to ten weeks.", need: "A walkthrough of your workflow and some sample data." }, // TODO verify with founder
  { id: "software_dashboard", name: "Operational Dashboard", use: "A live KPI dashboard that pulls from the tools you already use.", fee: "₦600,000", timeline: "Three to five weeks.", need: "Your data sources, the KPIs that matter, and access permissions." }, // TODO verify with founder
  { id: "software_mobile_app", name: "Mobile App (MVP)", use: "iOS + Android cross-platform MVP — the first version your customers can actually use.", fee: "Starts from ₦2,500,000", timeline: "Ten to sixteen weeks.", need: "A feature spec or a Figma file — even rough is fine." }, // TODO verify with founder
  { id: "software_api_integration", name: "API / Third-Party Integration", use: "Wire two systems together so data flows between them automatically.", fee: "₦300,000", timeline: "About two weeks.", need: "API docs and authentication keys for both sides." }, // TODO verify with founder
  { id: "software_management", name: "Software Management Retainer", use: "We keep your software healthy — updates, patches, and small fixes every month.", fee: "₦150,000/month", timeline: "Live within a week.", need: "Access to your existing codebase." }, // TODO verify with founder
  { id: "software_audit", name: "Software / Security Audit", use: "A code, security, and performance review — the kind of thing investors ask for.", fee: "₦250,000", timeline: "Two to three weeks.", need: "Repo access and your deployment details." }, // TODO verify with founder
];

const automation: ServiceItem[] = [
  { id: "auto_workflow", name: "Workflow Automation", use: "Stop doing the same manual task fifty times a week. We automate it across your tools.", fee: "Starts from ₦200,000", timeline: "One to three weeks.", need: "A map of the process and the tools you currently use." }, // TODO verify with founder
  { id: "auto_whatsapp", name: "WhatsApp Business API Setup", use: "Get the green tick — verified WhatsApp Business with broadcast templates.", fee: "₦250,000", timeline: "Two to three weeks.", need: "CAC certificate and your business verification docs." }, // TODO verify with founder
  { id: "auto_email_marketing", name: "Email Marketing Automation", use: "Drip campaigns and segmented blasts — so the right message lands at the right time.", fee: "₦180,000", timeline: "One to two weeks.", need: "Your email list and brand assets." }, // TODO verify with founder
  { id: "auto_payments", name: "Payment Gateway Setup", use: "Take payments online via Paystack or Flutterwave — properly integrated, not bolted on.", fee: "₦150,000", timeline: "About a week.", need: "Business CAC and your bank details." }, // TODO verify with founder
  { id: "auto_zapier_make", name: "Zapier / Make Integration", use: "No-code automations that connect your SaaS tools without writing software.", fee: "₦120,000", timeline: "About a week.", need: "The tools you use and what you want to automate." }, // TODO verify with founder
  { id: "auto_invoicing", name: "Automated Invoicing System", use: "Recurring billing and receipt automation — chase fewer invoices.", fee: "₦220,000", timeline: "About two weeks.", need: "Your pricing model and current customer data." }, // TODO verify with founder
];

const ai: ServiceItem[] = [
  { id: "ai_chatbot", name: "AI Chatbot (trained on your business)", use: "A website + WhatsApp chatbot that actually knows your business — trained on your own docs.", fee: "₦450,000", timeline: "Three to four weeks.", need: "Your FAQ docs, brand voice samples, and the channels you want it on." }, // TODO verify with founder
  { id: "ai_lead_bot", name: "Lead Qualification Bot", use: "A bot that pre-screens leads so your sales team only talks to people worth their time.", fee: "₦280,000", timeline: "About two weeks.", need: "Your qualification criteria and a few sample chats." }, // TODO verify with founder
  { id: "ai_agent_custom", name: "Custom AI Agent", use: "A multi-step AI agent that runs an internal workflow end to end — for when a chatbot isn't enough.", fee: "Starts from ₦800,000", timeline: "Four to eight weeks.", need: "A workflow spec and the tools you want it to plug into.", tag: "CUSTOM" }, // TODO verify with founder
  { id: "ai_content_generator", name: "AI Content Generator", use: "Branded copy and image generation pipeline — for teams making lots of content fast.", fee: "₦300,000", timeline: "Two to three weeks.", need: "Your brand guide and a few sample assets." }, // TODO verify with founder
  { id: "ai_analytics", name: "AI Analytics / Insights", use: "Ask your data questions in plain English. No more waiting on the analyst.", fee: "₦500,000", timeline: "Three to four weeks.", need: "Access to your data warehouse." }, // TODO verify with founder
];

const crm: ServiceItem[] = [
  { id: "crm_setup", name: "CRM Setup + Configuration", use: "HubSpot, Zoho, or Pipedrive set up around how you actually sell — not the textbook way.", fee: "₦300,000", timeline: "Two to three weeks.", need: "A sales process map and your team list." }, // TODO verify with founder
  { id: "crm_migration", name: "CRM Migration", use: "Move off spreadsheets or a legacy CRM without losing history.", fee: "₦200,000", timeline: "One to two weeks.", need: "An export of your existing data and a field map." }, // TODO verify with founder
  { id: "crm_training", name: "CRM Team Training", use: "A two-session workshop so your team actually uses the CRM after we leave.", fee: "₦80,000", timeline: "Within a week of CRM go-live.", need: "An admin contact and a calendar slot." }, // TODO verify with founder
  { id: "crm_dashboards", name: "Sales Dashboards & Reports", use: "Custom reports on top of your CRM — the numbers your leadership actually asks for.", fee: "₦150,000", timeline: "One to two weeks.", need: "Your KPI list and CRM access." }, // TODO verify with founder
];

const podcast_tech: ServiceItem[] = [
  { id: "podcast_studio_setup", name: "Podcast Studio Tech Setup", use: "Hardware and software so your show sounds like a production, not a Zoom call.", fee: "Starts from ₦600,000", timeline: "Two to three weeks.", need: "Room dimensions and how many hosts." }, // TODO verify with founder
  { id: "podcast_distribution", name: "Distribution Platform Setup", use: "Get on Spotify, Apple, and Google with a proper podcast feed — not a one-off upload.", fee: "₦100,000", timeline: "About a week.", need: "Show artwork, intro/outro, and your hosting choice." }, // TODO verify with founder
  { id: "podcast_website", name: "Podcast Website with Episode Pages", use: "A custom site that auto-syncs with your feed — every new episode appears on its own page.", fee: "₦220,000", timeline: "About two weeks.", need: "Your RSS feed URL and branding." }, // TODO verify with founder
];

const ecommerce_ops: ServiceItem[] = [
  { id: "ec_inventory", name: "Inventory Management Setup", use: "Track SKU levels across all your stores and warehouses without manual stocktakes.", fee: "₦200,000", timeline: "About two weeks.", need: "Your product list, current stock levels, and locations." }, // TODO verify with founder
  { id: "ec_logistics", name: "Logistics & Delivery Integration", use: "Plug GIG, Sendbox, and DHL into your store so customers see real shipping options.", fee: "₦150,000", timeline: "One to two weeks.", need: "Your logistics partner accounts and pricing rules." }, // TODO verify with founder
  { id: "ec_marketplace", name: "Marketplace Listing Setup", use: "Get listed on Jumia and Konga — properly synced so stock stays accurate.", fee: "₦180,000", timeline: "About two weeks.", need: "Your catalogue, brand approval, and pricing." }, // TODO verify with founder
];

const industries = [
  { id: "smb_starter", name: "SMB Starter Stack", emoji: "🌱", intro: "Get a small business online and selling fast.", itemIds: ["site_business","auto_whatsapp","auto_payments","crm_setup"] },
  { id: "startup_mvp", name: "Startup — MVP Build", emoji: "🚀", intro: "Build the product, integrate payments, ship.", itemIds: ["software_mobile_app","auto_payments","crm_setup","ai_chatbot"] },
  { id: "ecommerce_brand", name: "E-commerce Brand", emoji: "🛒", intro: "Open a store, manage stock, deliver everywhere.", itemIds: ["site_ecommerce","ec_inventory","ec_logistics","auto_whatsapp","auto_email_marketing"] },
  { id: "service_business", name: "Service Business Stack", emoji: "💼", intro: "Site + CRM + automation for consultants and agencies.", itemIds: ["site_business","crm_setup","auto_workflow","ai_lead_bot","auto_email_marketing"] },
  { id: "podcaster", name: "Podcaster / Creator", emoji: "🎙", intro: "Studio setup, distribution, and a real website.", itemIds: ["podcast_studio_setup","podcast_distribution","podcast_website","auto_email_marketing"] },
  { id: "ai_first_business", name: "AI-First Business", emoji: "🤖", intro: "Operate with AI woven into customer ops.", itemIds: ["ai_chatbot","ai_agent_custom","ai_analytics","auto_workflow","crm_setup"] },
  { id: "enterprise_modernize", name: "Enterprise Modernization", emoji: "🏢", intro: "Replace legacy with custom internal tools and dashboards.", itemIds: ["software_internal_tool","software_dashboard","software_management","crm_migration","software_audit"] },
];

export const scalarServicesCatalog: DivisionServicesCatalog = {
  categories: [
    { id: "websites", name: "Websites & Landing Pages", intro: "Sites that load fast, convert visitors, and rank well.", items: websites },
    { id: "software", name: "Custom Software & Apps", intro: "Internal tools, dashboards, and apps built for your operations.", items: software },
    { id: "automation", name: "Systems & Automation", intro: "Connect your tools so manual work disappears.", items: automation },
    { id: "ai", name: "AI & Intelligent Tools", intro: "Practical AI — chatbots, agents, and analytics that pay back.", items: ai },
    { id: "crm", name: "CRM Setup & Optimisation", intro: "A CRM your team will actually use.", items: crm },
    { id: "podcast_tech", name: "Podcast Production Tech", intro: "Hardware, software, and distribution for serious shows.", items: podcast_tech },
    { id: "ecommerce_ops", name: "E-commerce Operations", intro: "Inventory, logistics, and marketplace listings.", items: ecommerce_ops },
  ],
  industries,
};
