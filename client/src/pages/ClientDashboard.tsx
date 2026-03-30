import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  CheckCircle, Circle, ChevronDown, Loader2, AlertCircle, LogOut,
  Send, MessageSquare, Calendar,
  CreditCard, Copy, Upload,
  ArrowRight, Quote,
  Shield, Globe, Zap, TrendingUp, Clock,
  Users, Sparkles, Palette, Briefcase,
  X, UserPlus, FileCheck, Award, GraduationCap, Lock, FileText,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

/* ── HAMZURY Brand + Apple Layout ── */
const CREAM = "#FFFAF6";
const WHITE = "#FFFFFF";
const BG = "#FFFAF6";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const LABEL = "#B48C4C";
const GOLD = "#B48C4C";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const GREY = "#D1D5DB";
const BORDER = "transparent";
const CHAT_USER_BG = "#000000";
const CHAT_BOT_BG = "#F5F5F7";

const DEPT_ACCENT: Record<string, string> = {
  bizdoc: "#B48C4C",
  systemise: "#B48C4C",
  skills: "#B48C4C",
};

/* ── Service detail type ── */
type ServiceDetail = {
  pitch: string;
  why: string;
  how: string;
  what: string;
  includes: string[];
  price: string;
  value?: string;
};

/* ── Service detail cards (Sinek: Why / How / What) ── */
const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  cac: {
    pitch: "Without CAC, your business doesn't legally exist.",
    why: "Every serious business needs legal recognition. Without it, you cannot open a bank account, sign contracts, or bid for tenders.",
    how: "We handle name reservation, document preparation, and CAC filing. You never visit any office.",
    what: "CAC Certificate, Business Registration Number, Bank Introduction Letter.",
    includes: ["Name reservation", "Incorporation filing", "Certificate delivery"],
    price: "from\u20A650,000", value: "We handle the entire filing process so you never visit CAC yourself." },
  tin: {
    pitch: "No TIN means no tax clearance.",
    why: "Tax compliance is not optional. Without TIN, you face penalties and cannot access government contracts.",
    how: "We register your business with FIRS, set up VAT, and handle the first filing.",
    what: "TIN Number, VAT Registration, First Filing Acknowledgement.",
    includes: ["TIN registration with FIRS", "VAT setup", "First filing support"], price: "from\u20A660,000", value: "We register, file, and manage your tax ID so you stay compliant without stress." },
  tcc: {
    pitch: "Tax Clearance is your proof of good standing.",
    why: "Banks and government agencies require TCC. Without it, you cannot bid for contracts or prove compliance.",
    how: "We review your 3-year tax history, file everything with FIRS, and collect your certificate.",
    what: "Tax Clearance Certificate, Filing Confirmation, Compliance Report.",
    includes: ["3-year tax review", "Filing and submission", "Certificate collection"], price: "from\u20A660,000" },
  licence: {
    pitch: "Operating without the right permit risks shutdown.",
    why: "Your sector has rules. Non-compliance means fines, shutdowns, or legal action against your business.",
    how: "We assess your sector requirements, prepare all applications, and handle the filing process.",
    what: "Sector-Specific Licence, Application Filing Confirmation, Compliance Guidance.",
    includes: ["Sector assessment", "Application filing", "Licence collection"], price: "from\u20A680,000" },
  contracts: {
    pitch: "If a partner or staff betrays you, are your agreements protecting you?",
    why: "Without proper contracts, you have no legal recourse when things go wrong with staff, partners, or clients.",
    how: "We draft legally sound contracts tailored to your business relationships and Nigerian law.",
    what: "Employment Contracts, NDAs, Partnership Agreements, Service Agreements.",
    includes: ["Employment contracts", "NDAs", "Partnership agreements"], price: "from\u20A640,000" },
  templates: {
    pitch: "Professional document templates save you time and protect your business.",
    why: "Unprofessional documents lose you deals. Every invoice, proposal, and contract should reflect your brand.",
    how: "We create branded, legally reviewed templates you can reuse across your business operations.",
    what: "Contract Templates, Invoice Templates, Agreement Packs, Proposal Templates.",
    includes: ["Contract templates", "Invoice templates", "Agreement packs"], price: "from\u20A615,000" },
  annual: {
    pitch: "Miss your annual returns and CAC can strike off your company.",
    why: "Annual returns are mandatory. Missing them means your company can be dissolved without notice.",
    how: "We prepare and file your annual returns with CAC, including any back-filing needed.",
    what: "Annual Return Filing, Status Letter, Back-Filing (if needed).",
    includes: ["Annual return filing", "Status letter", "Back-filing if needed"], price: "\u20A630,000" },
  management: {
    pitch: "We handle all your renewals, filings, and compliance calendar.",
    why: "Compliance deadlines never stop. Missing one costs more than hiring someone to track them all.",
    how: "We collect your records monthly, file taxes, deliver reports, and track every deadline automatically.",
    what: "Monthly Compliance Check, Renewal Management, Deadline Tracking, Filing Reports.",
    includes: ["Monthly compliance check", "Renewal management", "Deadline tracking"], price: "\u20A650,000/month", value: "Every month we collect your records, file your taxes, deliver your report, and track your deadlines automatically." },
  brand_id: {
    pitch: "Your brand is your first impression.",
    why: "Premium clients judge your business in 3 seconds. A weak brand loses them before you speak.",
    how: "We design your complete brand identity -- logo, colors, typography, and brand guidelines.",
    what: "Logo, Color Palette, Typography, Brand Guidelines Document.",
    includes: ["Logo design", "Color palette", "Brand guidelines"], price: "from \u20A6150,000" },
  positioning: {
    pitch: "Positioning is how premium clients choose you over competitors.",
    why: "If you look like everyone else, clients choose on price. Positioning makes you the obvious choice.",
    how: "We analyze your market, define your value proposition, and build a messaging framework.",
    what: "Market Analysis, Value Proposition, Messaging Framework, Competitor Map.",
    includes: ["Market analysis", "Value proposition", "Messaging framework"], price: "from \u20A6100,000" },
  website: {
    pitch: "Your website works while you sleep.",
    why: "If clients cannot find you online or your website looks amateur, you lose business every day.",
    how: "We build a professional, mobile-responsive website that converts visitors into clients.",
    what: "Landing Page, About, Services, Contact, Mobile View, SEO, Hosting.",
    includes: ["Professional website", "Mobile responsive", "SEO basics"], price: "from \u20A6200,000" },
  content_strategy: {
    pitch: "Content without strategy is noise.",
    why: "Posting without a plan wastes time and confuses your audience. Strategy turns content into revenue.",
    how: "We build a content calendar, choose your platforms, and create an engagement plan that grows your brand.",
    what: "Content Calendar, Platform Strategy, Engagement Plan, Brand Voice Guide.",
    includes: ["Content calendar", "Platform strategy", "Engagement plan"], price: "from \u20A6100,000" },
  materials: {
    pitch: "Business materials that match your brand.",
    why: "Inconsistent materials make your business look disorganized. Every touchpoint should build trust.",
    how: "We design branded print and digital materials that align with your identity.",
    what: "Business Cards, Letterhead, Presentation Template, Email Signature.",
    includes: ["Business cards", "Letterhead", "Presentation template"], price: "from \u20A650,000" },
  pitch_deck: {
    pitch: "A pitch deck that closes deals, not one that puts investors to sleep.",
    why: "Investors decide in minutes. A weak deck means you lose funding before you finish speaking.",
    how: "We design an investor-ready deck with compelling visuals, clear financials, and a strong narrative.",
    what: "Investor-Ready Deck, Financial Summary, Visual Storytelling, Market Opportunity.",
    includes: ["Investor-ready deck", "Financial summary", "Visual storytelling"], price: "from \u20A680,000" },
  social_setup: {
    pitch: "Set up your social media properly from day one.",
    why: "A poorly set up profile tells premium clients you are not serious. First impressions are permanent online.",
    how: "We optimize your profiles, apply your branding, and publish initial content across all platforms.",
    what: "Profile Optimization, Bio & Branding, Initial Content, Platform Configuration.",
    includes: ["Profile optimization", "Bio and branding", "Initial content"], price: "from \u20A650,000" },
  social_mgmt: {
    pitch: "Consistent posting builds trust. We handle it so you don't have to.",
    why: "Irregular posting kills trust. Your audience needs to see you consistently to remember and buy from you.",
    how: "We create, schedule, and manage all your social media content daily across all platforms.",
    what: "Daily Posting, Engagement Management, Monthly Content Calendar, Performance Report.",
    includes: ["Daily posting", "Engagement management", "Monthly report"], price: "\u20A6100,000/month", value: "We create, schedule, and manage all your social media content daily so you focus on business." },
  content: {
    pitch: "Professional content that builds authority.",
    why: "Amateur content repels premium clients. Professional content positions you as the expert in your field.",
    how: "We produce photo/video content, write compelling copy, and schedule it for maximum reach.",
    what: "Photo/Video Content, Copywriting, Scheduling, Platform Optimization.",
    includes: ["Photo/video content", "Copywriting", "Scheduling"], price: "from \u20A6100,000" },
  seo: {
    pitch: "If clients can't find you on Google, you're invisible.",
    why: "90% of buyers search Google before calling. If you are not on page 1, your competitors get the business.",
    how: "We research your keywords, optimize your pages, and set up your Google Business profile.",
    what: "Keyword Research, On-Page Optimization, Google Business Profile, Monthly SEO Report.",
    includes: ["Keyword research", "On-page optimization", "Google Business"], price: "from \u20A680,000" },
  reputation: {
    pitch: "What do people see when they Google your business name?",
    why: "One bad review or no reviews at all can cost you clients. Reputation is your silent salesperson.",
    how: "We manage your reviews, build trust signals, and prepare a crisis response plan.",
    what: "Review Management, Crisis Response Plan, Trust Signals, Online Reputation Report.",
    includes: ["Review management", "Crisis response", "Trust signals"], price: "from \u20A660,000" },
  crm: {
    pitch: "Stop losing leads in WhatsApp.",
    why: "Every lead you forget is revenue lost. Without a system, your team drops opportunities daily.",
    how: "We set up a CRM, configure your pipeline, and train your team to track every lead to conversion.",
    what: "CRM Setup, Pipeline Configuration, Team Training, Conversion Reports.",
    includes: ["CRM setup", "Pipeline configuration", "Team training"], price: "from \u20A6180,000" },
  automation: {
    pitch: "Stop doing manually what should be automated.",
    why: "Every hour your team spends on repetitive tasks is money and opportunity lost.",
    how: "We build automated workflows for follow-ups, invoicing, lead tracking, and communications.",
    what: "WhatsApp Automation, Email Sequences, Task Automation, Lead Follow-up Bot.",
    includes: ["Workflow automation", "Email sequences", "Task automation"], price: "from \u20A6120,000", value: "We build workflows that handle follow-ups, invoicing, and lead tracking without your team doing it manually." },
  dashboard: {
    pitch: "See your business performance at a glance.",
    why: "If you cannot see your numbers in real time, you are making decisions blind.",
    how: "We build a custom dashboard that shows revenue, clients, tasks, and team performance in one screen.",
    what: "Custom Dashboard, Real-Time Data, KPI Tracking, Team View.",
    includes: ["Custom dashboard", "Real-time data", "KPI tracking"], price: "from \u20A6200,000", value: "See your entire business performance in one screen -- revenue, clients, tasks, team -- updated in real time." },
  ai_agent: {
    pitch: "An AI that handles customer queries 24/7.",
    why: "Clients message at midnight. If nobody answers, they go to your competitor who does.",
    how: "We build and train a custom AI bot integrated with your systems to handle support, bookings, and follow-ups.",
    what: "Custom AI Bot, Integration Setup, Training Data, 24/7 Customer Support.",
    includes: ["Custom AI bot", "Integration setup", "Training data"], price: "from \u20A6150,000", value: "A custom AI that answers client questions, books appointments, or handles support 24/7 while you sleep." },
  research: {
    pitch: "Know your market before your competitors do.",
    why: "Entering a market without research is gambling. Data turns guesses into confident decisions.",
    how: "We conduct market research, analyze competitors, and deliver a trend report with actionable insights.",
    what: "Market Research Report, Competitor Analysis, Trend Report, Actionable Insights.",
    includes: ["Market research", "Competitor analysis", "Trend report"], price: "from \u20A680,000" },
  founder: {
    pitch: "Build your idea, offer, and first revenue path.",
    why: "Most founders waste months building the wrong thing. This program gives you structure from day one.",
    how: "12-week program using AI tools to validate your idea, build your offer, and generate your first revenue.",
    what: "12-Week Program, AI Tools Training, Capstone Project, Certificate.",
    includes: ["12-week program", "AI tools training", "Capstone project"], price: "\u20A675,000" },
  team: {
    pitch: "Your systems are only as good as the people using them.",
    why: "Untrained teams break systems. Every tool you buy is wasted if your people cannot use it properly.",
    how: "We design a custom curriculum, run practical exercises, and certify your team on completion.",
    what: "Custom Curriculum, Practical Exercises, Certification, Progress Tracking.",
    includes: ["Custom curriculum", "Practical exercises", "Certification"], price: "Custom pricing" },
  ai_skills: {
    pitch: "AI is changing business. Learn it before your competitors do.",
    why: "Businesses using AI are moving 10x faster. Every month you wait, the gap widens.",
    how: "We teach AI tools mastery, prompt engineering, and real business applications you can use immediately.",
    what: "AI Tools Mastery, Prompt Engineering, Business Application, Certificate.",
    includes: ["AI tools mastery", "Prompt engineering", "Business application"], price: "\u20A655,000" },
  growth: {
    pitch: "Scaling without structure breaks businesses.",
    why: "Growth without systems creates chaos. More clients without more structure means lower quality and burnout.",
    how: "We design your growth strategy, expansion plan, and management systems to handle 10x capacity.",
    what: "Growth Strategy, Expansion Plan, Management Systems, Capacity Blueprint.",
    includes: ["Growth strategy", "Expansion planning", "Management systems"], price: "Custom pricing" },
  nda: {
    pitch: "Protect your business relationships with proper NDAs.",
    why: "Sharing ideas without an NDA is like handing your playbook to a stranger. One leak can destroy your advantage.",
    how: "We draft customized NDAs reviewed for Nigerian law and tailored to your business relationships.",
    what: "NDA Drafting, Customization, Legal Review, Signed Document.",
    includes: ["NDA drafting", "Customization", "Legal review"], price: "from \u20A630,000" },
  board_res: {
    pitch: "Board resolutions formalize your company's major decisions.",
    why: "Without documented resolutions, major business decisions have no legal backing. Banks and regulators require them.",
    how: "We draft resolutions, prepare minutes templates, and support the filing process.",
    what: "Resolution Drafting, Minutes Template, Filing Support.",
    includes: ["Resolution drafting", "Minutes template", "Filing support"], price: "from \u20A625,000" },
  ip: {
    pitch: "Your brand name and ideas are assets. Protect them.",
    why: "If someone registers your brand name before you, you lose the right to use it. Trademarks are first-come, first-served.",
    how: "We search for conflicts, file your trademark application, and deliver your certificate.",
    what: "Trademark Search, Application Filing, Certificate Delivery.",
    includes: ["Trademark search", "Application filing", "Certificate delivery"], price: "\u20A675,000" },
  workspace: {
    pitch: "Set up your team's digital workspace.",
    why: "Scattered tools and personal emails make your business look unprofessional and hard to manage.",
    how: "We set up business email, cloud storage, collaboration tools, and onboard your entire team.",
    what: "Business Email, Cloud Storage, Collaboration Tools, Document Management, Calendar.",
    includes: ["Google Workspace or Microsoft 365", "Email setup", "Team onboarding"], price: "from \u20A650,000" },
  monthly_filing: {
    pitch: "We file your taxes every month so you never miss a deadline.",
    why: "Late tax filing means penalties, interest, and blocked accounts. The cost of missing a deadline always exceeds the cost of filing.",
    how: "We collect your records, review statements, complete questionnaires, file with FIRS, and deliver your report.",
    what: "Monthly FIRS Filing, VAT Returns, PAYE Processing, Monthly Report.",
    includes: ["Monthly FIRS filing", "VAT returns", "PAYE processing"], price: "Included in \u20A6150,000/year", value: "We handle every filing so you never think about tax deadlines again." },
  renewal_dates: {
    pitch: "Your licences and registrations have expiry dates. We track every one.",
    why: "Expired permits mean fines and operational shutdowns. Most businesses discover too late.",
    how: "We track all your renewal dates and alert you well before any deadline.",
    what: "CAC Annual Returns Date, Licence Renewal Dates, Permit Expiry Alerts.",
    includes: ["CAC annual returns date", "Licence renewal dates", "Permit expiry alerts"], price: "Included" },
  scuml: {
    pitch: "SCUML certificate is required for opening corporate bank accounts.",
    why: "Banks will not open your corporate account without SCUML. It is a legal requirement under the EFCC Act.",
    how: "We handle EFCC registration and SCUML certificate collection so your bank account is ready.",
    what: "EFCC Registration, SCUML Certificate, Bank Account Readiness Letter.",
    includes: ["EFCC registration", "SCUML certificate", "Bank account readiness"], price: "\u20A645,000" },
  tcc_cert: {
    pitch: "Tax Clearance Certificate -- proof your business is compliant.",
    why: "TCC is required for government contracts, bank facilities, and proving your business is in good standing.",
    how: "We review your 3-year tax records, submit to FIRS, and collect your certificate annually.",
    what: "3-Year Tax Review, FIRS Submission, Certificate Delivery.",
    includes: ["3-year tax review", "FIRS submission", "Certificate delivery"], price: "Included" },
  financial_report: {
    pitch: "Monthly and annual financial reports showing your compliance status.",
    why: "Without clear financial reports, you cannot prove compliance or make informed business decisions.",
    how: "We compile your filing summaries and deliver monthly and annual financial statements.",
    what: "Monthly Filing Summary, Annual Financial Statement, Tax Position Report.",
    includes: ["Monthly filing summary", "Annual financial statement", "Tax position report"], price: "Included" },
  acknowledgement: {
    pitch: "Every filing comes with an official acknowledgement from FIRS.",
    why: "Without filing receipts, you have no proof of compliance. In a dispute, proof is everything.",
    how: "We file, collect the official acknowledgement, and store it for your records.",
    what: "Filing Receipt, Submission Confirmation, Record Keeping.",
    includes: ["Filing receipt", "Submission confirmation", "Record keeping"], price: "Included" },
  online_always: {
    pitch: "Learn at your own pace. Our online programs are always open.",
    why: "Waiting for a cohort means losing months. Start building your skills now, not later.",
    how: "Self-paced modules on our HALS platform with full access and certificate on completion.",
    what: "Self-Paced Modules, HALS Access, Certificate on Completion.",
    includes: ["Self-paced modules", "HALS access", "Certificate on completion"], price: "from \u20A645,000", value: "Start learning today -- no waiting for a cohort." },
  physical_cohort: {
    pitch: "Limited seats. Next cohort filling fast.",
    why: "Online learning is flexible but in-person training builds stronger skills and real connections.",
    how: "3-week intensive in Abuja with hands-on projects, networking, and direct mentorship.",
    what: "3-Week Intensive, Hands-On Projects, Networking, Certificate.",
    includes: ["3-week intensive", "Hands-on projects", "Networking", "Certificate"], price: "from \u20A655,000", value: "Only 25 seats per cohort. Early registration recommended." },
};

/* ── Monthly/subscription service IDs ── */
const MONTHLY_SERVICE_IDS = new Set(["monthly_filing", "social_mgmt"]);

/* ── Service Folder Breakdown (deliverables per service) ── */
const SERVICE_FOLDERS: Record<string, { label: string; items: string[] }> = {
  cac: { label: "CAC Registration", items: ["Name Reservation", "Incorporation Filing", "Certificate of Incorporation", "Certified True Copy (CTC)", "Post-Incorporation Docs"] },
  scuml: { label: "SCUML Certificate", items: ["EFCC Registration", "SCUML Certificate", "Bank Account Opening Letter"] },
  tin: { label: "TIN Registration", items: ["FIRS TIN Application", "VAT Registration", "First Tax Filing Setup"] },
  tcc: { label: "Tax Clearance", items: ["3-Year Tax Review", "FIRS Application", "Tax Clearance Certificate Delivery"] },
  licence: { label: "Sector Licence", items: ["Sector Assessment", "Application Filing", "Licence Collection & Delivery"] },
  annual: { label: "Annual Returns", items: ["Annual Return Filing", "Status Letter", "Back-Filing (if needed)"] },
  brand_id: { label: "Complete Branding", items: ["Logo Design", "Color Palette", "Brand Guidelines", "Business Card Design", "Letterhead", "Social Media Templates"] },
  positioning: { label: "Positioning", items: ["Market Analysis", "Value Proposition", "Messaging Framework", "Competitor Mapping"] },
  website: { label: "Website", items: ["Landing Page / Index", "About Page", "Services Page", "Contact Page", "Mobile Responsive", "SEO Setup", "Domain & Hosting"] },
  content_strategy: { label: "Content Strategy", items: ["Content Calendar", "Platform Strategy", "Engagement Plan", "Brand Voice Guide"] },
  materials: { label: "Business Materials", items: ["Business Cards", "Letterhead", "Presentation Template", "Email Signature"] },
  pitch_deck: { label: "Pitch Deck", items: ["Investor-Ready Deck", "Financial Summary", "Visual Storytelling", "Market Opportunity Slide"] },
  social_setup: { label: "Social Media Setup", items: ["Instagram Account Setup", "Facebook Page Setup", "Twitter/X Setup", "LinkedIn Setup", "TikTok Setup", "Bio & Branding Applied"] },
  social_mgmt: { label: "Social Media Management", items: ["Daily Content Posting", "Engagement Management", "Monthly Content Calendar", "Monthly Performance Report"] },
  content: { label: "Content Creation", items: ["Photo/Video Content", "Copywriting", "Scheduling", "Platform Optimization"] },
  seo: { label: "Search Visibility", items: ["Keyword Research", "On-Page Optimization", "Google Business Profile", "Monthly SEO Report"] },
  reputation: { label: "Online Reputation", items: ["Review Management", "Crisis Response Plan", "Trust Signals Setup"] },
  crm: { label: "Lead Generation & Management", items: ["Lead Capture Forms", "Follow-up Automation", "Pipeline Tracking", "Conversion Reports"] },
  automation: { label: "WhatsApp Automation", items: ["WhatsApp Business Setup", "Auto-Reply Messages", "Lead Capture Bot", "Appointment Booking", "Follow-up Sequences"] },
  dashboard: { label: "Founder Dashboard", items: ["Business Overview Panel", "Client Tracking", "Revenue Dashboard", "Task Management", "Team View"] },
  ai_agent: { label: "AI Agent", items: ["Custom AI Bot", "Integration Setup", "Training Data", "24/7 Customer Support"] },
  research: { label: "Research Tools", items: ["Market Research", "Competitor Analysis", "Trend Report"] },
  workspace: { label: "Digital Workspace", items: ["Business Email Creation", "Cloud Storage Setup", "Team Collaboration Tools", "Document Management", "Calendar Setup"] },
  contracts: { label: "Contracts & Legal", items: ["Employment Contracts", "NDAs", "Partnership Agreements", "Service Agreements"] },
  templates: { label: "Document Templates", items: ["Contract Templates", "Invoice Templates", "Agreement Packs", "Proposal Templates"] },
  nda: { label: "NDAs & Agreements", items: ["NDA Drafting", "Customization", "Legal Review"] },
  board_res: { label: "Board Resolutions", items: ["Resolution Drafting", "Minutes Template", "Filing Support"] },
  ip: { label: "IP & Trademark", items: ["Trademark Search", "Application Filing", "Certificate Delivery"] },
  monthly_filing: { label: "Monthly Tax Filing", items: ["Login & Data Collection", "Statement of Account Review", "Questionnaire Completion", "FIRS Filing", "Monthly Report Delivery"] },
  renewal_dates: { label: "Renewal Dates & Tracking", items: ["CAC Annual Returns Date", "Licence Renewal Dates", "Permit Expiry Alerts"] },
  tcc_cert: { label: "TCC Certificate", items: ["3-Year Tax Review", "FIRS Application", "Certificate Collection & Delivery"] },
  financial_report: { label: "Financial Report", items: ["Monthly Filing Summary", "Annual Financial Statement", "Tax Position Report"] },
  acknowledgement: { label: "Filing Acknowledgement", items: ["Filing Receipt", "Submission Confirmation", "Record Keeping"] },
  founder: { label: "Founder Program", items: ["12-Week Program", "AI Tools Training", "Capstone Project", "Certificate"] },
  team: { label: "Team Training", items: ["Custom Curriculum", "Practical Exercises", "Certification", "Progress Tracking"] },
  ai_skills: { label: "AI Skills", items: ["AI Tools Mastery", "Prompt Engineering", "Business Application"] },
  online_always: { label: "Online (Always Open)", items: ["Self-Paced Modules", "HALS Access", "Certificate on Completion"] },
  physical_cohort: { label: "Physical Cohort", items: ["3-Week Intensive", "Hands-On Projects", "Networking", "Certificate"] },
  growth: { label: "Growth Strategy", items: ["Growth Strategy", "Expansion Planning", "Management Systems"] },
};

/* ── Tax Management Pipeline Data ── */
const TAX_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TAX_CHECKLIST = [
  "Login credentials received",
  "Statement of account collected",
  "Questionnaire completed",
  "Monthly filing done",
  "Monthly report delivered",
];
const TAX_MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentTaxMonth = new Date().getMonth(); // 0-indexed

/* ── 5 Business Health Areas ── */
interface HealthItem {
  name: string;
  done: boolean;
  inProgress: boolean;
}

interface HealthArea {
  key: string;
  title: string;
  icon: typeof Shield;
  score: number;
  max: number;
  items: HealthItem[];
  pitch: string;
  emptyPitch: string;
  includes: string[];
  dept: string;
}

type HealthLevel = "strong" | "building" | "weak" | "none";

function getHealthLevel(score: number, max: number): HealthLevel {
  if (score <= 0) return "none";
  const pct = score / max;
  if (pct >= 0.7) return "strong";
  if (pct >= 0.3) return "building";
  return "weak";
}

function healthLevelLabel(level: HealthLevel): string {
  if (level === "strong") return "Strong";
  if (level === "building") return "Building";
  if (level === "weak") return "Weak";
  return "None";
}

function healthLevelColor(level: HealthLevel): string {
  if (level === "strong") return GREEN;
  if (level === "building") return GOLD;
  if (level === "weak") return ORANGE;
  return GREY;
}

/* ── Calculate health from all services ── */
function calculateBusinessHealth(service: string, status: string): HealthArea[] {
  const s = (service || "").toLowerCase();
  const isDone = status === "Completed";
  const isActive = status === "In Progress" || status === "Pending";

  const legal: HealthArea = {
    key: "legal", title: "Legal Protection", icon: Shield,
    score: 0, max: 5, items: [],
    pitch: "Without tax compliance, you cannot get clearance for government contracts.",
    emptyPitch: "Your business has no legal protection. No CAC, no TIN, no contracts. One compliance audit could shut you down.",
    includes: ["CAC Business Registration", "Tax Compliance (TIN/VAT)", "Industry Licences", "Contracts & Legal Templates", "SCUML / AML Compliance"],
    dept: "bizdoc",
  };

  const brand: HealthArea = {
    key: "brand", title: "Brand & Trust", icon: Globe,
    score: 0, max: 3, items: [],
    pitch: "Premium clients check you online before calling. What do they find?",
    emptyPitch: "If a premium client finds you online right now, will they trust you enough to pay?",
    includes: ["Brand Identity & Positioning", "Professional Website", "Social Media Presence"],
    dept: "systemise",
  };

  const systems: HealthArea = {
    key: "systems", title: "Systems & Automation", icon: Zap,
    score: 0, max: 3, items: [],
    pitch: "Manual processes are costing you hours every week.",
    emptyPitch: "Are you still doing things manually that should already be automated?",
    includes: ["CRM & Client Management", "Workflow Automation", "Dashboard & AI Agents"],
    dept: "systemise",
  };

  const team: HealthArea = {
    key: "team", title: "Team & Skills", icon: Users,
    score: 0, max: 2, items: [],
    pitch: "Systems are only as good as the people using them.",
    emptyPitch: "Can your team run the business properly without you being there every day?",
    includes: ["Staff Training & Onboarding", "Skills Development Programs"],
    dept: "skills",
  };

  const growth: HealthArea = {
    key: "growth", title: "Growth & Scale", icon: TrendingUp,
    score: 0, max: 2, items: [],
    pitch: "You have the foundation. Now it's time to scale deliberately.",
    emptyPitch: "Is your business ready to handle 10x more clients without breaking?",
    includes: ["Business Strategy & Expansion", "Management Subscription"],
    dept: "bizdoc",
  };

  // Map current service to health areas
  if (s.includes("cac") || s.includes("registration") || s.includes("business name")) {
    legal.items.push({ name: "Business Registration (CAC)", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("foreign") || s.includes("cerpac") || s.includes("apostille") || s.includes("eq")) {
    legal.items.push({ name: "Foreign Business Registration", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("tax") || s.includes("tin") || s.includes("tcc") || s.includes("vat") || s.includes("paye")) {
    legal.items.push({ name: "Tax Compliance", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("scuml") || s.includes("aml")) {
    legal.items.push({ name: "SCUML / AML Compliance", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("licence") || s.includes("permit") || s.includes("nafdac") || s.includes("son") || s.includes("dpr")) {
    legal.items.push({ name: "Industry Licence", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("contract") || s.includes("legal") || s.includes("agreement")) {
    legal.items.push({ name: "Contracts & Legal", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
  }
  if (s.includes("website") || s.includes("brand identity")) {
    brand.items.push({ name: "Brand & Website", done: isDone, inProgress: isActive && !isDone });
    brand.score += isDone ? 1 : 0.5;
  }
  if (s.includes("social media") || s.includes("social")) {
    brand.items.push({ name: "Social Media Presence", done: isDone, inProgress: isActive && !isDone });
    brand.score += isDone ? 1 : 0.5;
  }
  if (s.includes("automation") || s.includes("crm") || s.includes("dashboard") || s.includes("ai agent")) {
    systems.items.push({ name: "Business Automation", done: isDone, inProgress: isActive && !isDone });
    systems.score += isDone ? 1 : 0.5;
  }
  if (s.includes("training") || s.includes("skill") || s.includes("cohort")) {
    team.items.push({ name: "Team Training", done: isDone, inProgress: isActive && !isDone });
    team.score += isDone ? 1 : 0.5;
  }
  if (s.includes("strategy") || s.includes("expansion") || s.includes("management")) {
    growth.items.push({ name: "Business Strategy", done: isDone, inProgress: isActive && !isDone });
    growth.score += isDone ? 1 : 0.5;
  }

  // "Full Business Architecture" touches multiple areas
  if (s.includes("full business") || s.includes("architecture")) {
    legal.items.push({ name: "Business Documentation", done: isDone, inProgress: isActive && !isDone });
    legal.score += isDone ? 1 : 0.5;
    brand.items.push({ name: "Business Positioning", done: false, inProgress: isActive });
    brand.score += isDone ? 0.5 : 0.25;
    systems.items.push({ name: "Basic Systems Setup", done: false, inProgress: isActive });
    systems.score += isDone ? 0.5 : 0.25;
  }

  return [legal, brand, systems, team, growth];
}

/* ── Founder quotes ── */
const FOUNDER_QUOTES = [
  "Businesses deserve more than consultants who disappear after the invoice. We stay until the work is done.",
  "Structure is what separates businesses that last from businesses that don't.",
  "If your business can't run without you, you don't have a business. You have a job.",
  "Compliance is not a cost. It is the price of being taken seriously.",
  "The businesses that win are the ones that got structured early.",
  "Every document, every system, every skill -- it all adds up to a business that lasts.",
  "We don't just register businesses. We prepare them to operate, compete, and scale.",
];

/* ── Utility functions ── */
function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

/* ── Session ── */
interface ClientSession {
  ref: string;
  phone?: string;
  expiresAt: number;
}

function loadClientSession(): ClientSession | null {
  try {
    const raw = localStorage.getItem("hamzury-client-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientSession;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem("hamzury-client-session");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const ACTIVITY_LABELS: Record<string, string> = {
  task_created: "File created",
  status_change: "Status updated",
  checklist_toggled: "Checklist updated",
  note_added: "Internal note added",
  document_uploaded: "Document uploaded",
  client_note: "Your message received",
  payment_confirmed: "Payment confirmed",
  invoice_created: "Invoice generated",
  commission_created: "Commission recorded",
  kpi_approved: "Quality approved",
};

/* ── Animations ── */
const cssAnimations = `
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes stagePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52,199,89,0.3); }
  50% { box-shadow: 0 0 0 6px rgba(52,199,89,0); }
}
@keyframes expandDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 600px; }
}
@keyframes slideDown {
  from { opacity: 0; max-height: 0; overflow: hidden; }
  to { opacity: 1; max-height: 600px; overflow: visible; }
}
@keyframes progressFill {
  from { width: 0; }
  to { width: var(--progress); }
}
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* ── Chat message type ── */
type ChatMsg = { role: "user" | "assistant"; content: string };

/* ── Load persisted chat ── */
function loadChatMessages(ref: string): ChatMsg[] {
  try {
    const raw = localStorage.getItem(`hamzury-dashboard-chat-${ref}`);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMsg[];
  } catch {
    return [];
  }
}

function saveChatMessages(ref: string, msgs: ChatMsg[]) {
  try {
    localStorage.setItem(`hamzury-dashboard-chat-${ref}`, JSON.stringify(msgs.slice(-50)));
  } catch { /* full storage */ }
}

/* ── Progress Bar Component ── */
function ProgressBar({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: `${MUTED}20` }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
      />
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════════════════ */
/*  BUSINESS HEALTH DASHBOARD                                                 */
/* ════════════════════════════════════════════════════════════════════════════ */

export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [claimedInvoices, setClaimedInvoices] = useState<Set<string>>(new Set());
  const [copiedAcct, setCopiedAcct] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(false);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [uploads, setUploads] = useState<{name: string; file: string; time: string}[]>([]);
  const [uploadName, setUploadName] = useState("");
  const [showUploadInput, setShowUploadInput] = useState(false);
  const [showStrengthDetail, setShowStrengthDetail] = useState(false);
  const [expandedTaxMonth, setExpandedTaxMonth] = useState<number | null>(null);

  /* Chat state */
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [autoGreeted, setAutoGreeted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  /* Message to staff */
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  /* Shopping cart */
  const [cart, setCart] = useState<{id: string; label: string; price: string; amount: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [cartNotice, setCartNotice] = useState("");

  const addToCart = (itemId: string, svc: ServiceDetail) => {
    // Send to chat — AI handles the checkout
    const label = svc.what?.split(",")[0] || svc.what?.split(".")[0] || itemId;
    setMobileChatOpen(true);
    setTimeout(() => handleChatSend(`I want to activate ${label}. ${svc.price}. Show me what is included and how to pay.`), 300);
  };

  useEffect(() => {
    const s = loadClientSession();
    setSession(s);
    setSessionLoaded(true);
    if (!s) {
      window.location.href = "/client";
    }
  }, []);

  /* Random founder quote (stable per session) */
  const founderQuote = useMemo(
    () => FOUNDER_QUOTES[Math.floor(Math.random() * FOUNDER_QUOTES.length)],
    []
  );

  /* ── tRPC queries ── */
  const { data, isLoading, isError } = trpc.tracking.fullLookup.useQuery(
    { ref: session?.ref ?? "", phone: session?.phone },
    { enabled: !!session?.ref, retry: false, refetchInterval: 30000 }
  );

  const { data: subHistory } = trpc.subscriptions.clientHistory.useQuery(
    { ref: session?.ref ?? "" },
    { enabled: !!session?.ref, retry: false }
  );

  const { data: bankDetails } = trpc.invoices.bankDetails.useQuery(undefined, { staleTime: Infinity });

  const claimMutation = trpc.invoices.claimPayment.useMutation({
    onSuccess: (_, vars) => {
      setClaimedInvoices((prev) => new Set(prev).add(vars.invoiceNumber));
    },
  });

  const noteMutation = trpc.tracking.submitClientNote.useMutation({
    onSuccess: () => {
      setMessage("");
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 4000);
    },
  });

  function handleLogout() {
    localStorage.removeItem("hamzury-client-session");
    if (session?.ref) localStorage.removeItem(`hamzury-dashboard-chat-${session.ref}`);
    window.location.href = "/client";
  }

  function handleSendMessage() {
    if (!message.trim() || !session?.ref) return;
    noteMutation.mutate({ ref: session.ref, message: message.trim() });
  }

  /* ── Load persisted chat on session ready + auto-greet ── */
  useEffect(() => {
    if (!session?.ref) return;
    const saved = loadChatMessages(session.ref);
    if (saved.length > 0) {
      setChatMessages(saved);
      setAutoGreeted(true);
    }
  }, [session?.ref]);

  /* Auto-greeting handled inline after data check below */

  /* ── Persist chat messages ── */
  useEffect(() => {
    if (session?.ref && chatMessages.length > 0) {
      saveChatMessages(session.ref, chatMessages);
    }
  }, [chatMessages, session?.ref]);

  /* ── Auto-scroll chat ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  /* ── Streaming AI Chat ── */
  const handleChatSend = useCallback(async (text?: string) => {
    const msg = (text || chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput("");

    const userMsg: ChatMsg = { role: "user", content: msg };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    // Add placeholder
    setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const history = [...chatMessages, userMsg].slice(-10).map(h => ({ role: h.role, content: h.content }));
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: msg,
          history,
          department: "general",
        }),
      });

      if (!response.ok || !response.body) throw new Error("Stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;
          try {
            const parsed = JSON.parse(d);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              setChatMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullText };
                return updated;
              });
            }
          } catch { /* skip */ }
        }
      }

      const answer = fullText || "Our team will answer that directly. Start a chat or reach out via the contact options.";
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: answer };
        return updated;
      });
    } catch {
      setChatMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Connection issue. Please try again shortly." };
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages]);

  /* ── Send chat from health card ── */
  const sendFromHealthCard = useCallback((areaTitle: string, level: HealthLevel) => {
    const msg = level === "none"
      ? `I want to build my ${areaTitle.toLowerCase()}`
      : `I want to strengthen my ${areaTitle.toLowerCase()}`;
    setMobileChatOpen(true);
    setTimeout(() => handleChatSend(msg), 100);
  }, [handleChatSend]);

  /* ── Loading / error — NO early returns to preserve hook order ── */
  if (!sessionLoaded || !session || isLoading || isError || !data || !data.found) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ backgroundColor: WHITE }}>
        {(!sessionLoaded || isLoading) ? (
          <>
            <Loader2 className="animate-spin" size={20} style={{ color: DARK }} />
            <p className="text-[13px]" style={{ color: MUTED, fontWeight: 400 }}>Loading...</p>
          </>
        ) : (isError || !data || (data && !data.found)) ? (
          <>
            <AlertCircle size={28} style={{ color: MUTED }} />
            <p className="text-[15px]" style={{ color: DARK, fontWeight: 500 }}>File not found</p>
            <p className="text-[13px]" style={{ color: MUTED }}>{session?.ref}</p>
            <button onClick={handleLogout} className="text-[13px] px-6 py-3 rounded-full" style={{ backgroundColor: DARK, color: WHITE, fontWeight: 500, minHeight: 44 }}>Try again</button>
          </>
        ) : null}
      </div>
    );
  }

  /* ── Destructure data ── */
  const task = data.task;
  const checklist = data.checklist || [];
  const activity = data.activity || [];
  const invoiceSummary = data.invoiceSummary;

  const isBizdoc = (task.department || "").toLowerCase() === "bizdoc";
  const activeBankDetails = bankDetails
    ? isBizdoc && bankDetails.bizdoc.configured
      ? bankDetails.bizdoc
      : bankDetails.general
    : null;

  /* ── Calculate Business Health ── */
  const healthAreas = calculateBusinessHealth(task.service, task.status);
  const areasWithScore = healthAreas.filter(a => a.score > 0);
  const overallAreasActive = areasWithScore.length;
  const overallPct = overallAreasActive * 20;

  const overallMessages: Record<number, string> = {
    0: "Your business is unstructured. Let's fix that.",
    20: "You've started. But 4 critical areas are still exposed.",
    40: "Getting stronger. But gaps remain.",
    60: "Solid foundation. A few more steps to full protection.",
    80: "Almost there. One more area to complete.",
    100: "Fully structured. Your business is built to last.",
  };
  const overallMessage = overallMessages[overallPct] || overallMessages[0];

  /* ── Auto-greeting (safe — after data is available, runs once) ── */
  if (!autoGreeted && chatMessages.length === 0) {
    const fn = (task.clientName || "").split(" ")[0];
    const svc = task.service || "";
    const st = task.status || "";
    const bn = task.businessName || "";
    // Build context-aware greeting with business direction
    let g = `Hi ${fn}.`;
    if (bn && svc) {
      if (svc.toLowerCase().includes("full business") || svc.toLowerCase().includes("architecture")) {
        g += ` ${bn} is set up for a full business architecture -- your compliance and brand setup are in progress. Once complete, your business will be positioned to attract premium clients and operate with full legal protection. ${overallPct}% of your business structure is in place.`;
      } else {
        g += ` ${bn} -- your ${svc.toLowerCase()} is currently ${st.toLowerCase()}. ${overallPct}% of your business structure is in place. Once this service is delivered, your business gets stronger.`;
      }
    } else if (svc) {
      g += ` Your ${svc} service is currently ${st.toLowerCase()}. ${overallPct}% of your business structure is in place.`;
    }
    g += ` Anything you'd like to know?`;
    // Use setTimeout to avoid setState during render
    setTimeout(() => { setChatMessages([{ role: "assistant", content: g }]); setAutoGreeted(true); }, 0);
  }

  const hasInvoices = invoiceSummary && invoiceSummary.invoices.length > 0;
  const isCompleted = task.status === "Completed";
  const deptAccent = DEPT_ACCENT[(task.department || "").toLowerCase()] || DARK;

  /* ── Chat panel component ── */
  const ChatPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`flex flex-col ${isMobile ? "h-[70vh]" : "h-full"}`}
      style={{ backgroundColor: WHITE }}
    >
      {/* Chat header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BG }}
          >
            <Sparkles size={14} style={{ color: GOLD }} />
          </div>
          <p className="text-[14px]" style={{ color: DARK, fontWeight: 500 }}>Advisor</p>
        </div>
        {isMobile && (
          <button onClick={() => setMobileChatOpen(false)} className="p-2 rounded-full" style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} style={{ color: MUTED }} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3" style={{ minHeight: 0 }}>
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles size={24} style={{ color: MUTED, opacity: 0.3 }} className="mb-3" />
            <p className="text-[13px]" style={{ color: MUTED }}>
              Ask anything about your business.
            </p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-3"
              style={{
                backgroundColor: msg.role === "user" ? CHAT_USER_BG : CHAT_BOT_BG,
                color: msg.role === "user" ? WHITE : DARK,
                borderBottomRightRadius: msg.role === "user" ? 6 : 18,
                borderBottomLeftRadius: msg.role === "user" ? 18 : 6,
              }}
            >
              {msg.content ? (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ fontWeight: 400 }}>{msg.content}</p>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: MUTED, animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: MUTED, animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: MUTED, animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-2"
        style={{ boxShadow: "0 -1px 0 rgba(0,0,0,0.04)" }}
      >
        <input
          ref={chatInputRef}
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
          placeholder="Type a message..."
          className="flex-1 text-[13px] bg-transparent focus:outline-none py-3 px-4 rounded-full"
          style={{ color: DARK, backgroundColor: BG, fontWeight: 400, minHeight: 44 }}
          disabled={chatLoading}
        />
        <button
          onClick={() => handleChatSend()}
          disabled={!chatInput.trim() || chatLoading}
          className="flex items-center justify-center shrink-0 transition-all hover:opacity-80 disabled:opacity-30 rounded-full"
          style={{ backgroundColor: GOLD, color: WHITE, width: 44, height: 44 }}
        >
          {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <style>{cssAnimations}</style>
      <PageMeta
        title={`${task.businessName || task.clientName} | HAMZURY`}
        description="Your business dashboard."
      />

      {/* ═══ HEADER — minimal, sticky, Apple-style ═══ */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between"
        style={{
          height: 48,
          padding: "0 20px",
          backgroundColor: `${WHITE}f2`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 0.5px 0 rgba(0,0,0,0.06)",
        }}
      >
        <a
          href="/"
          className="text-[13px] tracking-tight"
          style={{ color: DARK, fontWeight: 600, letterSpacing: "0.02em" }}
        >
          HAMZURY
        </a>
        <button
          onClick={handleLogout}
          className="text-[13px] transition-opacity hover:opacity-60"
          style={{ color: MUTED, fontWeight: 400, minHeight: 44, display: "flex", alignItems: "center" }}
        >
          Exit
        </button>
      </nav>

      {/* ═══ MAIN SCROLL CONTAINER ═══ */}
      <div style={{ height: "calc(100vh - 48px)", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", paddingBottom: 120 }}>

          {/* ═══ 5 VERTICAL BUSINESS PILLARS (logic preserved inside IIFE) ═══ */}
          {(() => {
            /* ── Pillar definitions ── */
            const PILLARS = [
              {
                id: "compliance",
                icon: Shield,
                label: "Compliance",
                desc: "Registration, tax, licences, permits",
                pitch: "Is your business legally protected? Most businesses miss at least 2 critical documents.",
                color: "#1B4D3E",
                items: [
                  { id: "cac", label: "CAC Registration", short: "CAC" },
                  { id: "tin", label: "TIN Registration", short: "TIN" },
                  { id: "tcc", label: "Tax Clearance", short: "TCC" },
                  { id: "licence", label: "Sector Licence", short: "Licence" },
                  { id: "annual", label: "Annual Returns", short: "Returns" },
                  { id: "scuml", label: "SCUML Certificate", short: "SCUML" },
                ],
              },
              {
                id: "compliance_mgmt",
                icon: Clock,
                label: "Compliance Management",
                desc: "Monthly filing, renewals, certificates, reports",
                pitch: "We prevent penalties, track deadlines, and file on your behalf. \u20A6150,000/year.",
                color: "#1B4D3E",
                items: [
                  { id: "monthly_filing", label: "Monthly Tax Filing", short: "Filing" },
                  { id: "renewal_dates", label: "Renewal Dates & Tracking", short: "Renewals" },
                  { id: "tcc_cert", label: "TCC Certificate", short: "TCC" },
                  { id: "financial_report", label: "Financial Report", short: "Report" },
                  { id: "acknowledgement", label: "Filing Acknowledgement", short: "Receipt" },
                ],
              },
              {
                id: "legal",
                icon: Briefcase,
                label: "Legal & Templates",
                desc: "Contracts, agreements, documents, templates",
                pitch: "If a partner or staff betrays you, are your agreements protecting you?",
                color: "#1B4D3E",
                items: [
                  { id: "contracts", label: "Contracts & Legal", short: "Contracts" },
                  { id: "templates", label: "Document Templates", short: "Templates" },
                  { id: "nda", label: "NDAs & Agreements", short: "NDAs" },
                  { id: "board_res", label: "Board Resolutions", short: "Board" },
                  { id: "ip", label: "IP & Trademark", short: "IP" },
                ],
              },
              {
                id: "branding",
                icon: Palette,
                label: "Branding & Strategy",
                desc: "Brand identity, positioning, website, strategy",
                pitch: "If a premium client finds you online, will they trust you enough to pay?",
                color: "#2563EB",
                items: [
                  { id: "brand_id", label: "Brand Identity", short: "Brand" },
                  { id: "positioning", label: "Positioning", short: "Position" },
                  { id: "website", label: "Website", short: "Web" },
                  { id: "content_strategy", label: "Content Strategy", short: "Content" },
                  { id: "materials", label: "Business Materials", short: "Materials" },
                  { id: "pitch_deck", label: "Pitch Deck", short: "Pitch" },
                ],
              },
              {
                id: "visibility",
                icon: Globe,
                label: "Visibility & Presence",
                desc: "Social media, content, online presence",
                pitch: "Are premium clients finding you? If not, you are invisible to the market.",
                color: "#2563EB",
                items: [
                  { id: "social_setup", label: "Social Media Setup", short: "Setup" },
                  { id: "social_mgmt", label: "Social Media Mgmt", short: "Mgmt" },
                  { id: "content", label: "Content Creation", short: "Content" },
                  { id: "seo", label: "Search Visibility", short: "SEO" },
                  { id: "reputation", label: "Online Reputation", short: "Trust" },
                ],
              },
              {
                id: "tools",
                icon: Zap,
                label: "Tools & Systems",
                desc: "Automation, CRM, dashboard, AI agents",
                pitch: "Are repeated tasks still wasting your team's time every week?",
                color: "#2563EB",
                items: [
                  { id: "crm", label: "CRM & Leads", short: "CRM" },
                  { id: "automation", label: "Automation", short: "Auto" },
                  { id: "dashboard", label: "Dashboard", short: "Dash" },
                  { id: "ai_agent", label: "AI Agent", short: "AI" },
                  { id: "research", label: "Research Tools", short: "Research" },
                  { id: "workspace", label: "Digital Workspace Setup", short: "Workspace" },
                ],
              },
              {
                id: "skills",
                icon: GraduationCap,
                label: "Skills & Growth",
                desc: "Training, team capability, programs",
                pitch: "Can your team run the business without you being there every day?",
                color: "#1E3A5F",
                items: [
                  { id: "founder", label: "Founder Program", short: "Founder" },
                  { id: "team", label: "Team Training", short: "Team" },
                  { id: "ai_skills", label: "AI Skills", short: "AI" },
                  { id: "online_always", label: "Online (Always Open)", short: "Online" },
                  { id: "physical_cohort", label: "Physical Cohort", short: "Physical" },
                  { id: "growth", label: "Growth Strategy", short: "Growth" },
                ],
              },
            ];

            type ItemState = "delivered" | "in_progress" | "paid" | "inactive";

            /* ── Map service to active items ── */
            function mapServiceToItems(service: string, status: string): Record<string, ItemState> {
              const s = service.toLowerCase();
              const done = status === "Completed";
              const active: Record<string, ItemState> = {};

              if (s.includes("full business") || s.includes("architecture")) {
                active.tin = "paid";
                active.brand_id = "in_progress";
                active.website = "paid";
                active.social_setup = "paid";
                active.social_mgmt = "paid";
                active.dashboard = "paid";
                active.crm = "paid";
                active.automation = "paid";
                active.workspace = "paid";
              }
              if (s.includes("scuml")) active.scuml = done ? "delivered" : "in_progress";
              if (s.includes("tin")) active.tin = done ? "delivered" : "in_progress";
              if (s.includes("branding") || s.includes("brand")) active.brand_id = done ? "delivered" : "in_progress";
              if (s.includes("website") || s.includes("webpage")) active.website = done ? "delivered" : "in_progress";
              if (s.includes("social media account")) active.social_setup = done ? "delivered" : "in_progress";
              if (s.includes("social media management")) active.social_mgmt = done ? "delivered" : "in_progress";
              if (s.includes("lead generation")) active.crm = done ? "delivered" : "in_progress";
              if (s.includes("founder dashboard")) active.dashboard = done ? "delivered" : "in_progress";
              if (s.includes("whatsapp automation")) active.automation = done ? "delivered" : "in_progress";
              if (s.includes("management") || s.includes("subscription") || s.includes("tax management")) {
                active.monthly_filing = done ? "delivered" : "in_progress";
                active.renewal_dates = "paid";
                active.tcc_cert = "paid";
                active.financial_report = "paid";
                active.acknowledgement = "paid";
              }
              if (s.includes("cac") || s.includes("registration")) active.cac = done ? "delivered" : "in_progress";
              if (s.includes("tax") && !s.includes("whatsapp")) active.tin = done ? "delivered" : "in_progress";
              if (s.includes("tcc")) active.tcc = done ? "delivered" : "in_progress";
              if (s.includes("licence") || s.includes("nafdac")) active.licence = done ? "delivered" : "in_progress";
              if (s.includes("automation") || s.includes("crm")) { active.crm = done ? "delivered" : "in_progress"; active.automation = done ? "delivered" : "in_progress"; }
              if (s.includes("dashboard") && !s.includes("founder")) active.dashboard = done ? "delivered" : "in_progress";
              if (s.includes("training") || s.includes("skill") || s.includes("cohort")) active.team = done ? "delivered" : "in_progress";
              if (s.includes("contract") || s.includes("legal")) active.contracts = done ? "delivered" : "in_progress";

              return active;
            }

            const activeItems = mapServiceToItems(task.service || "", task.status || "");

            /* ── Business Strength ── */
            const pillarsWithActive = PILLARS.filter(p => p.items.some(it => activeItems[it.id]));
            const strengthPct = Math.round((pillarsWithActive.length / PILLARS.length) * 100);

            const strengthMessages: Record<number, string> = {
              0: "Your business is unstructured. Let's fix that.",
              20: "You've started. But 4 critical areas are still exposed.",
              40: "Getting stronger. But gaps remain.",
              60: "Solid foundation. A few more steps to full protection.",
              80: "Almost there. One more area to complete.",
              100: "Fully structured. Your business is built to last.",
            };
            const strengthMessage = strengthMessages[strengthPct] || strengthMessages[0];

            function itemStateColor(state: ItemState): string {
              if (state === "delivered") return GREEN;
              if (state === "in_progress") return GREEN;
              if (state === "paid") return GOLD;
              return `${GREY}60`;
            }

            function lineColor(fromState: ItemState, toState: ItemState): string {
              if (fromState !== "inactive" && toState !== "inactive") return GREEN;
              if (fromState !== "inactive" || toState !== "inactive") return GOLD;
              return `${GREY}40`;
            }

            /* ── Compute paid items for chip row ── */
            const paidItems = PILLARS.flatMap(p =>
              p.items.filter(item => activeItems[item.id]).map(item => ({
                ...item,
                state: activeItems[item.id],
                pillarColor: p.color,
                pillarLabel: p.label,
              }))
            );

            /* ── Find the current in-progress service for hero ── */
            const inProgressItem = paidItems.find(it => it.state === "in_progress");
            const currentDeliveryLabel = inProgressItem
              ? SERVICE_FOLDERS[inProgressItem.id]?.label || inProgressItem.label
              : task.service?.split(",")[0]?.trim() || "";
            const currentDeliverySubtitle = inProgressItem
              ? (task.deadline ? `Delivering ${formatDate(task.deadline)}` : "In progress")
              : (isCompleted ? "All services delivered" : task.status || "");

            return (
              <>
                {/* ═══ SECTION 1: HERO — the ONE thing that matters ═══ */}
                <div style={{ paddingTop: 48, paddingBottom: 40, animation: "fadeUp 0.6s ease-out" }}>
                  <h1 style={{ fontSize: 28, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 24 }}>
                    {task.businessName || task.clientName}
                  </h1>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 20 }}>
                    <ProgressBar pct={task.progress || strengthPct || 0} color={GOLD} height={6} />
                    <p className="tabular-nums" style={{ fontSize: 13, color: MUTED, marginTop: 8, fontWeight: 400 }}>
                      {task.progress || strengthPct}%
                    </p>
                  </div>

                  {/* Current delivery */}
                  <p style={{ fontSize: 18, fontWeight: 500, color: DARK, marginBottom: 4 }}>
                    {currentDeliveryLabel}
                  </p>
                  <p style={{ fontSize: 14, color: MUTED, fontWeight: 400, marginBottom: 4 }}>
                    {currentDeliverySubtitle}
                  </p>
                  <p style={{ fontSize: 13, color: MUTED, fontWeight: 400 }}>
                    {paidItems.length} of {PILLARS.reduce((n, p) => n + p.items.length, 0)} services active
                  </p>
                </div>


                {/* ═══ SECTION 2: SERVICE CHIPS — horizontal scroll ═══ */}
                {paidItems.length > 0 && (
                  <div style={{ marginBottom: 40, marginLeft: -20, marginRight: -20, animation: "fadeUp 0.6s ease-out 0.1s both" }}>
                    <div
                      className="hide-scrollbar"
                      style={{ overflowX: "auto", display: "flex", gap: 8, padding: "0 20px" }}
                    >
                      {paidItems.map((item) => {
                        const isSelected = selectedItem === item.id;
                        const isDelivered = item.state === "delivered";
                        const isInProgress = item.state === "in_progress";
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItem(isSelected ? null : item.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 16px",
                              borderRadius: 100,
                              backgroundColor: isSelected ? `${GOLD}15` : isDelivered ? `${GREEN}10` : BG,
                              fontSize: 13,
                              fontWeight: 400,
                              color: DARK,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              border: "none",
                              cursor: "pointer",
                              minHeight: 44,
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            {item.short}
                            {isInProgress && (
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: GREEN, display: "inline-block", animation: "stagePulse 2s infinite" }} />
                            )}
                            {isDelivered && (
                              <CheckCircle size={12} style={{ color: GREEN }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}


                {/* ═══ SECTION 3: CHIP DETAIL — slide down when tapped ═══ */}
                {selectedItem && (() => {
                  const detail = SERVICE_DETAILS[selectedItem];
                  const folder = SERVICE_FOLDERS[selectedItem];
                  const state: ItemState = activeItems[selectedItem] || "inactive";
                  const isMonthly = MONTHLY_SERVICE_IDS.has(selectedItem);

                  /* ── Tax Management pipeline (special case) ── */
                  if (selectedItem === "monthly_filing" && state !== "inactive") {
                    return (
                      <div style={{ marginBottom: 40, animation: "fadeUp 0.3s ease-out", backgroundColor: WHITE, borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <p style={{ fontSize: 18, fontWeight: 500, color: DARK, marginBottom: 16 }}>Tax Management</p>
                        {detail?.value && (
                          <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.6 }}>{detail.value}</p>
                        )}
                        {/* Month pipeline row */}
                        <div className="hide-scrollbar" style={{ overflowX: "auto", display: "flex", alignItems: "center", gap: 0, marginBottom: 16, flexWrap: "wrap" }}>
                          {TAX_MONTHS.map((m, mi) => {
                            const isDone = mi < currentTaxMonth;
                            const isCurrent = mi === currentTaxMonth;
                            const isExp = expandedTaxMonth === mi;
                            return (
                              <div key={m} style={{ display: "flex", alignItems: "center" }}>
                                {mi > 0 && <div style={{ width: 8, height: 1, background: isDone ? GREEN : isCurrent ? GOLD : `${MUTED}30`, flexShrink: 0 }} />}
                                <button
                                  onClick={() => setExpandedTaxMonth(isExp ? null : mi)}
                                  style={{
                                    textAlign: "center",
                                    padding: "4px 6px",
                                    borderRadius: 8,
                                    backgroundColor: isExp ? `${GOLD}12` : "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    minHeight: 44,
                                  }}
                                >
                                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isDone ? GREEN : isCurrent ? GOLD : `${MUTED}30`, margin: "0 auto 4px" }} />
                                  <p style={{ fontSize: 11, color: isDone ? GREEN : isCurrent ? GOLD : MUTED, fontWeight: isCurrent ? 600 : 400 }}>{m}</p>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {/* Expanded month checklist */}
                        {expandedTaxMonth !== null && (() => {
                          const mi = expandedTaxMonth;
                          const isDone = mi < currentTaxMonth;
                          const isCurrent = mi === currentTaxMonth;
                          const yr = new Date().getFullYear();
                          const checklistItems = [...TAX_CHECKLIST];
                          if (mi === 11) {
                            checklistItems.push("Annual TCC Filing");
                            checklistItems.push("TCC Certificate Delivery");
                          }
                          return (
                            <div style={{ animation: "fadeUp 0.2s ease-out" }}>
                              <p style={{ fontSize: 13, fontWeight: 500, color: DARK, marginBottom: 12 }}>
                                {TAX_MONTH_FULL[mi]} {yr}
                              </p>
                              {checklistItems.map((cl, ci) => {
                                const clDone = isDone || (isCurrent && ci === 0);
                                const clInProgress = isCurrent && ci === 1;
                                const clPending = isCurrent && ci > 1;
                                const isPastAll = !isDone && !isCurrent;
                                return (
                                  <div key={ci} style={{ padding: "8px 0", borderBottom: ci < checklistItems.length - 1 ? `1px solid ${MUTED}10` : "none", display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: clDone ? GREEN : clInProgress ? GOLD : `${MUTED}30`, flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, color: clDone ? DARK : MUTED, fontWeight: 400 }}>
                                      {cl}{clInProgress ? " -- collecting" : ""}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }

                  return (
                    <div style={{ marginBottom: 40, animation: "fadeUp 0.3s ease-out", backgroundColor: WHITE, borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <p style={{ fontSize: 18, fontWeight: 500, color: DARK, marginBottom: 16 }}>
                        {folder?.label || SERVICE_DETAILS[selectedItem]?.what?.split(",")[0] || selectedItem}
                      </p>

                      {/* Deliverables list */}
                      {folder && folder.items.map((fi, fIdx) => (
                        <div key={fIdx} style={{ padding: "10px 0", borderBottom: fIdx < folder.items.length - 1 ? `1px solid ${MUTED}10` : "none", display: "flex", alignItems: "center", gap: 10 }}>
                          {state === "delivered" ? (
                            <CheckCircle size={14} style={{ color: GREEN, flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: `${MUTED}30`, flexShrink: 0 }} />
                          )}
                          <span style={{ fontSize: 13, color: state === "delivered" ? DARK : MUTED, fontWeight: 400 }}>{fi}</span>
                        </div>
                      ))}

                      {/* Price for inactive items */}
                      {detail && state === "inactive" && (
                        <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 13, color: MUTED }}>{detail.price}</span>
                          <button
                            onClick={() => addToCart(selectedItem, detail)}
                            style={{
                              padding: "10px 24px",
                              borderRadius: 100,
                              backgroundColor: GOLD,
                              color: WHITE,
                              border: "none",
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: "pointer",
                              minHeight: 44,
                            }}
                          >
                            Activate
                          </button>
                        </div>
                      )}

                      {/* Active state info */}
                      {state !== "inactive" && detail?.price && (
                        <p style={{ fontSize: 13, color: MUTED, marginTop: 16 }}>{detail.price}</p>
                      )}
                    </div>
                  );
                })()}


                {/* ═══ SECTION 4: PAYMENT SUMMARY — two numbers ═══ */}
                {invoiceSummary && invoiceSummary.paid > 0 && (
                  <div
                    onClick={() => setInvoicesOpen(!invoicesOpen)}
                    style={{
                      marginBottom: 16,
                      cursor: "pointer",
                      animation: "fadeUp 0.6s ease-out 0.2s both",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "center", padding: "32px 0" }}>
                      <div>
                        <p style={{ fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }} className="tabular-nums">{formatNaira(invoiceSummary.paid)}</p>
                        <p style={{ fontSize: 12, color: MUTED, marginTop: 4, fontWeight: 400 }}>paid</p>
                      </div>
                      {invoiceSummary.total - invoiceSummary.paid > 0 && (
                        <div>
                          <p style={{ fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: "-0.02em" }} className="tabular-nums">{formatNaira(invoiceSummary.total - invoiceSummary.paid)}</p>
                          <p style={{ fontSize: 12, color: MUTED, marginTop: 4, fontWeight: 400 }}>remaining</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/* ═══ INVOICE DETAIL SHEET (behind tap) ═══ */}
                {invoicesOpen && hasInvoices && (
                  <div style={{ marginBottom: 40, animation: "fadeUp 0.3s ease-out" }}>
                    {invoiceSummary!.invoices.map((inv) => {
                      const balance = inv.total - inv.paid;
                      const isPaid = inv.status === "paid";
                      const hasClaimed = claimedInvoices.has(inv.number);
                      return (
                        <div
                          key={inv.number}
                          style={{ backgroundColor: WHITE, borderRadius: 16, padding: 24, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontFamily: "monospace", color: MUTED }}>{inv.number}</span>
                            <span style={{ fontSize: 13, color: isPaid ? GREEN : GOLD, fontWeight: 500 }}>
                              {inv.status}
                            </span>
                          </div>
                          <p style={{ fontSize: 18, fontWeight: 600, color: DARK, marginBottom: 4 }}>{formatNaira(inv.total)}</p>
                          {balance > 0 && (
                            <p style={{ fontSize: 13, color: MUTED }}>Balance: {formatNaira(balance)}</p>
                          )}
                          {inv.dueDate && (
                            <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Due {formatDate(inv.dueDate)}</p>
                          )}

                          {/* Bank details */}
                          {!isPaid && balance > 0 && activeBankDetails?.configured && (
                            <div style={{ marginTop: 20 }}>
                              <div style={{ backgroundColor: BG, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 13, color: MUTED }}>Bank</span>
                                    <span style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{activeBankDetails!.bankName}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: 13, color: MUTED }}>Account</span>
                                    <span style={{ fontSize: 13, color: DARK, fontWeight: 500 }}>{activeBankDetails!.accountName}</span>
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 13, color: MUTED }}>Number</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(activeBankDetails!.accountNumber);
                                        setCopiedAcct(true);
                                        setTimeout(() => setCopiedAcct(false), 2000);
                                      }}
                                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontFamily: "monospace", fontWeight: 600, color: DARK, background: "none", border: "none", cursor: "pointer", minHeight: 44 }}
                                    >
                                      {activeBankDetails!.accountNumber}
                                      <Copy size={12} style={{ color: MUTED }} />
                                    </button>
                                  </div>
                                  {copiedAcct && (
                                    <p style={{ fontSize: 13, textAlign: "center", color: GREEN }}>Copied</p>
                                  )}
                                </div>
                              </div>

                              {hasClaimed ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, backgroundColor: `${GREEN}08`, borderRadius: 12 }}>
                                  <CheckCircle size={14} style={{ color: GREEN }} />
                                  <span style={{ fontSize: 13, color: DARK }}>Payment claim received</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => claimMutation.mutate({ invoiceNumber: inv.number, clientName: task.clientName })}
                                  disabled={claimMutation.isPending}
                                  style={{
                                    width: "100%",
                                    padding: "14px 0",
                                    borderRadius: 12,
                                    backgroundColor: DARK,
                                    color: WHITE,
                                    border: "none",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    minHeight: 48,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    opacity: claimMutation.isPending ? 0.5 : 1,
                                  }}
                                >
                                  {claimMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                                  I've Paid
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}


                {/* ═══ SECTION 5: WHITE SPACE ═══ */}
                <div style={{ height: 40 }} />


                {/* ═══ SECTION 6: INACTIVE SUGGESTIONS — 5 dots ═══ */}
                <div style={{ textAlign: "center", padding: "32px 0", animation: "fadeUp 0.6s ease-out 0.3s both" }}>
                  <p style={{ fontSize: 18, fontWeight: 500, color: DARK, marginBottom: 24 }}>
                    Your business could be stronger
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
                    {(["Compliance", "Brand", "Systems", "Team", "Growth"] as const).map((area, i) => {
                      const areaMap: Record<string, string[]> = {
                        Compliance: ["compliance", "compliance_mgmt", "legal"],
                        Brand: ["branding", "visibility"],
                        Systems: ["tools"],
                        Team: ["skills"],
                        Growth: ["skills"],
                      };
                      const isActive = areaMap[area]?.some(pid => PILLARS.find(p => p.id === pid)?.items.some(it => activeItems[it.id])) || false;
                      return (
                        <button
                          key={area}
                          onClick={() => {
                            setMobileChatOpen(true);
                            setTimeout(() => handleChatSend(isActive ? `How can I strengthen my ${area.toLowerCase()}?` : `I want to build my ${area.toLowerCase()}`), 200);
                          }}
                          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", minHeight: 44, padding: "8px 4px" }}
                        >
                          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: isActive ? GREEN : `${MUTED}30`, transition: "background-color 0.3s ease" }} />
                          <span style={{ fontSize: 11, color: MUTED, fontWeight: 400 }}>{area}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: 13, color: MUTED }}>Tap to explore</p>
                </div>


                {/* ═══ SECTION 7: QUOTE — tiny, almost invisible ═══ */}
                <div style={{ textAlign: "center", padding: "48px 24px 24px" }}>
                  <p style={{ fontSize: 11, color: MUTED, fontStyle: "italic", lineHeight: 1.6, fontWeight: 400 }}>
                    "{founderQuote}"
                  </p>
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 8, fontWeight: 400 }}>
                    -- Muhammad Hamzury
                  </p>
                </div>


                {/* ═══ SECTION 8: FOOTER — just the ref ═══ */}
                <div style={{ textAlign: "center", paddingTop: 24, paddingBottom: 32 }}>
                  <p style={{ fontSize: 11, color: `${MUTED}60` }}>{task.ref}</p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ═══ CHAT: Floating gold button + slide panel ═══ */}
      {!mobileChatOpen && (
        <button
          onClick={() => setMobileChatOpen(true)}
          className="fixed z-40 flex items-center justify-center transition-all hover:scale-105"
          style={{
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: GOLD,
            color: WHITE,
            boxShadow: "0 4px 16px rgba(180,140,76,0.35)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <MessageSquare size={22} />
        </button>
      )}

      {mobileChatOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
            onClick={() => setMobileChatOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:bottom-6 md:right-6 md:w-[400px]"
            style={{
              backgroundColor: WHITE,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70vh",
              boxShadow: "0 -2px 24px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <ChatPanel isMobile />
          </div>
        </>
      )}
    </div>
  );
}
