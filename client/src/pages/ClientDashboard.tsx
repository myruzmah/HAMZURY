import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  CheckCircle, Circle, ChevronDown, Loader2, LogOut,
  Send, MessageSquare,
  CreditCard, Copy,
  ArrowRight, ChevronRight,
  Shield, Globe, Zap, TrendingUp, Clock,
  Users, Sparkles, Palette, Briefcase,
  X, FileText, Lock, Package, Bot, Layers,
  BookOpen, Building2, FileCheck, Award, Cpu,
  Download, ExternalLink,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

/* ══════════════════════════════════════════════════════════════════════ */
/*  HAMZURY CLIENT DASHBOARD — Grid-Line Architecture                    */
/* ══════════════════════════════════════════════════════════════════════ */

/* ── Brand Colors ── */
const CREAM = "#FFFAF6";
const WHITE = "#FFFFFF";
const BG = "#FFFAF6";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const GREY = "#D1D5DB";
const CHAT_USER_BG = "#000000";
const CHAT_BOT_BG = "#F5F5F7";

/* ── Animations ── */
const cssAnimations = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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

/* ── Service detail cards ── */
const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  cac: { pitch: "Without CAC, your business doesn't legally exist.", why: "Every serious business needs legal recognition. Without it, you cannot open a bank account, sign contracts, or bid for tenders.", how: "We handle name reservation, document preparation, and CAC filing. You never visit any office.", what: "CAC Certificate, Business Registration Number, Bank Introduction Letter.", includes: ["Name reservation", "Incorporation filing", "Certificate delivery"], price: "from ₦50,000", value: "We handle the entire filing process so you never visit CAC yourself." },
  tin: { pitch: "No TIN means no tax clearance.", why: "Tax compliance is not optional. Without TIN, you face penalties and cannot access government contracts.", how: "We register your business with FIRS, set up VAT, and handle the first filing.", what: "TIN Number, VAT Registration, First Filing Acknowledgement.", includes: ["TIN registration with FIRS", "VAT setup", "First filing support"], price: "from ₦60,000" },
  tcc: { pitch: "Tax Clearance is your proof of good standing.", why: "Banks and government agencies require TCC. Without it, you cannot bid for contracts or prove compliance.", how: "We review your 3-year tax history, file everything with FIRS, and collect your certificate.", what: "Tax Clearance Certificate, Filing Confirmation, Compliance Report.", includes: ["3-year tax review", "Filing and submission", "Certificate collection"], price: "from ₦60,000" },
  licence: { pitch: "Operating without the right permit risks shutdown.", why: "Your sector has rules. Non-compliance means fines, shutdowns, or legal action against your business.", how: "We assess your sector requirements, prepare all applications, and handle the filing process.", what: "Sector-Specific Licence, Application Filing Confirmation, Compliance Guidance.", includes: ["Sector assessment", "Application filing", "Licence collection"], price: "from ₦80,000" },
  contracts: { pitch: "If a partner or staff betrays you, are your agreements protecting you?", why: "Without proper contracts, you have no legal recourse when things go wrong with staff, partners, or clients.", how: "We draft legally sound contracts tailored to your business relationships and Nigerian law.", what: "Employment Contracts, NDAs, Partnership Agreements, Service Agreements.", includes: ["Employment contracts", "NDAs", "Partnership agreements"], price: "from ₦40,000" },
  templates: { pitch: "Professional document templates save you time and protect your business.", why: "Unprofessional documents lose you deals. Every invoice, proposal, and contract should reflect your brand.", how: "We create branded, legally reviewed templates you can reuse across your business operations.", what: "Contract Templates, Invoice Templates, Agreement Packs, Proposal Templates.", includes: ["Contract templates", "Invoice templates", "Agreement packs"], price: "from ₦15,000" },
  annual: { pitch: "Miss your annual returns and CAC can strike off your company.", why: "Annual returns are mandatory. Missing them means your company can be dissolved without notice.", how: "We prepare and file your annual returns with CAC, including any back-filing needed.", what: "Annual Return Filing, Status Letter, Back-Filing (if needed).", includes: ["Annual return filing", "Status letter", "Back-filing if needed"], price: "₦30,000" },
  brand_id: { pitch: "Your brand is your first impression.", why: "Premium clients judge your business in 3 seconds. A weak brand loses them before you speak.", how: "We design your complete brand identity -- logo, colors, typography, and brand guidelines.", what: "Logo, Color Palette, Typography, Brand Guidelines Document.", includes: ["Logo design", "Color palette", "Brand guidelines"], price: "from ₦150,000" },
  positioning: { pitch: "Positioning is how premium clients choose you over competitors.", why: "If you look like everyone else, clients choose on price. Positioning makes you the obvious choice.", how: "We analyze your market, define your value proposition, and build a messaging framework.", what: "Market Analysis, Value Proposition, Messaging Framework, Competitor Map.", includes: ["Market analysis", "Value proposition", "Messaging framework"], price: "from ₦100,000" },
  website: { pitch: "Your website works while you sleep.", why: "If clients cannot find you online or your website looks amateur, you lose business every day.", how: "We build a professional, mobile-responsive website that converts visitors into clients.", what: "Landing Page, About, Services, Contact, Mobile View, SEO, Hosting.", includes: ["Professional website", "Mobile responsive", "SEO basics"], price: "from ₦200,000" },
  content_strategy: { pitch: "Content without strategy is noise.", why: "Posting without a plan wastes time and confuses your audience. Strategy turns content into revenue.", how: "We build a content calendar, choose your platforms, and create an engagement plan that grows your brand.", what: "Content Calendar, Platform Strategy, Engagement Plan, Brand Voice Guide.", includes: ["Content calendar", "Platform strategy", "Engagement plan"], price: "from ₦100,000" },
  materials: { pitch: "Business materials that match your brand.", why: "Inconsistent materials make your business look disorganized. Every touchpoint should build trust.", how: "We design branded print and digital materials that align with your identity.", what: "Business Cards, Letterhead, Presentation Template, Email Signature.", includes: ["Business cards", "Letterhead", "Presentation template"], price: "from ₦50,000" },
  pitch_deck: { pitch: "A pitch deck that closes deals.", why: "Investors decide in minutes. A weak deck means you lose funding before you finish speaking.", how: "We design an investor-ready deck with compelling visuals, clear financials, and a strong narrative.", what: "Investor-Ready Deck, Financial Summary, Visual Storytelling, Market Opportunity.", includes: ["Investor-ready deck", "Financial summary", "Visual storytelling"], price: "from ₦80,000" },
  social_setup: { pitch: "Set up your social media properly from day one.", why: "A poorly set up profile tells premium clients you are not serious. First impressions are permanent online.", how: "We optimize your profiles, apply your branding, and publish initial content across all platforms.", what: "Profile Optimization, Bio & Branding, Initial Content, Platform Configuration.", includes: ["Profile optimization", "Bio and branding", "Initial content"], price: "from ₦50,000" },
  social_mgmt: { pitch: "Consistent posting builds trust. We handle it so you don't have to.", why: "Irregular posting kills trust. Your audience needs to see you consistently to remember and buy from you.", how: "We create, schedule, and manage all your social media content daily across all platforms.", what: "Daily Posting, Engagement Management, Monthly Content Calendar, Performance Report.", includes: ["Daily posting", "Engagement management", "Monthly report"], price: "₦100,000/month" },
  content: { pitch: "Professional content that builds authority.", why: "Amateur content repels premium clients. Professional content positions you as the expert in your field.", how: "We produce photo/video content, write compelling copy, and schedule it for maximum reach.", what: "Photo/Video Content, Copywriting, Scheduling, Platform Optimization.", includes: ["Photo/video content", "Copywriting", "Scheduling"], price: "from ₦100,000" },
  seo: { pitch: "If clients can't find you on Google, you're invisible.", why: "90% of buyers search Google before calling. If you are not on page 1, your competitors get the business.", how: "We research your keywords, optimize your pages, and set up your Google Business profile.", what: "Keyword Research, On-Page Optimization, Google Business Profile, Monthly SEO Report.", includes: ["Keyword research", "On-page optimization", "Google Business"], price: "from ₦80,000" },
  reputation: { pitch: "What do people see when they Google your business name?", why: "One bad review or no reviews at all can cost you clients. Reputation is your silent salesperson.", how: "We manage your reviews, build trust signals, and prepare a crisis response plan.", what: "Review Management, Crisis Response Plan, Trust Signals, Online Reputation Report.", includes: ["Review management", "Crisis response", "Trust signals"], price: "from ₦60,000" },
  crm: { pitch: "Stop losing leads in WhatsApp.", why: "Every lead you forget is revenue lost. Without a system, your team drops opportunities daily.", how: "We set up a CRM, configure your pipeline, and train your team to track every lead to conversion.", what: "CRM Setup, Pipeline Configuration, Team Training, Conversion Reports.", includes: ["CRM setup", "Pipeline configuration", "Team training"], price: "from ₦180,000" },
  automation: { pitch: "Stop doing manually what should be automated.", why: "Every hour your team spends on repetitive tasks is money and opportunity lost.", how: "We build automated workflows for follow-ups, invoicing, lead tracking, and communications.", what: "WhatsApp Automation, Email Sequences, Task Automation, Lead Follow-up Bot.", includes: ["Workflow automation", "Email sequences", "Task automation"], price: "from ₦120,000" },
  dashboard: { pitch: "See your business performance at a glance.", why: "If you cannot see your numbers in real time, you are making decisions blind.", how: "We build a custom dashboard that shows revenue, clients, tasks, and team performance in one screen.", what: "Custom Dashboard, Real-Time Data, KPI Tracking, Team View.", includes: ["Custom dashboard", "Real-time data", "KPI tracking"], price: "from ₦200,000" },
  ai_agent: { pitch: "An AI that handles customer queries 24/7.", why: "Clients message at midnight. If nobody answers, they go to your competitor who does.", how: "We build and train a custom AI bot integrated with your systems to handle support, bookings, and follow-ups.", what: "Custom AI Bot, Integration Setup, Training Data, 24/7 Customer Support.", includes: ["Custom AI bot", "Integration setup", "Training data"], price: "from ₦150,000" },
  research: { pitch: "Know your market before your competitors do.", why: "Entering a market without research is gambling. Data turns guesses into confident decisions.", how: "We conduct market research, analyze competitors, and deliver a trend report with actionable insights.", what: "Market Research Report, Competitor Analysis, Trend Report, Actionable Insights.", includes: ["Market research", "Competitor analysis", "Trend report"], price: "from ₦80,000" },
  founder: { pitch: "Build your idea, offer, and first revenue path.", why: "Most founders waste months building the wrong thing. This program gives you structure from day one.", how: "12-week program using AI tools to validate your idea, build your offer, and generate your first revenue.", what: "12-Week Program, AI Tools Training, Capstone Project, Certificate.", includes: ["12-week program", "AI tools training", "Capstone project"], price: "₦75,000" },
  team: { pitch: "Your systems are only as good as the people using them.", why: "Untrained teams break systems. Every tool you buy is wasted if your people cannot use it properly.", how: "We design a custom curriculum, run practical exercises, and certify your team on completion.", what: "Custom Curriculum, Practical Exercises, Certification, Progress Tracking.", includes: ["Custom curriculum", "Practical exercises", "Certification"], price: "Custom pricing" },
  ai_skills: { pitch: "AI is changing business. Learn it before your competitors do.", why: "Businesses using AI are moving 10x faster. Every month you wait, the gap widens.", how: "We teach AI tools mastery, prompt engineering, and real business applications you can use immediately.", what: "AI Tools Mastery, Prompt Engineering, Business Application, Certificate.", includes: ["AI tools mastery", "Prompt engineering", "Business application"], price: "₦55,000" },
  growth: { pitch: "Scaling without structure breaks businesses.", why: "Growth without systems creates chaos. More clients without more structure means lower quality and burnout.", how: "We design your growth strategy, expansion plan, and management systems to handle 10x capacity.", what: "Growth Strategy, Expansion Plan, Management Systems, Capacity Blueprint.", includes: ["Growth strategy", "Expansion planning", "Management systems"], price: "Custom pricing" },
  nda: { pitch: "Protect your business relationships with proper NDAs.", why: "Sharing ideas without an NDA is like handing your playbook to a stranger.", how: "We draft customized NDAs reviewed for Nigerian law and tailored to your business relationships.", what: "NDA Drafting, Customization, Legal Review, Signed Document.", includes: ["NDA drafting", "Customization", "Legal review"], price: "from ₦30,000" },
  board_res: { pitch: "Board resolutions formalize your company's major decisions.", why: "Without documented resolutions, major business decisions have no legal backing.", how: "We draft resolutions, prepare minutes templates, and support the filing process.", what: "Resolution Drafting, Minutes Template, Filing Support.", includes: ["Resolution drafting", "Minutes template", "Filing support"], price: "from ₦25,000" },
  ip: { pitch: "Your brand name and ideas are assets. Protect them.", why: "If someone registers your brand name before you, you lose the right to use it.", how: "We search for conflicts, file your trademark application, and deliver your certificate.", what: "Trademark Search, Application Filing, Certificate Delivery.", includes: ["Trademark search", "Application filing", "Certificate delivery"], price: "₦75,000" },
  workspace: { pitch: "Set up your team's digital workspace.", why: "Scattered tools and personal emails make your business look unprofessional and hard to manage.", how: "We set up business email, cloud storage, collaboration tools, and onboard your entire team.", what: "Business Email, Cloud Storage, Collaboration Tools, Document Management, Calendar.", includes: ["Google Workspace or Microsoft 365", "Email setup", "Team onboarding"], price: "from ₦50,000" },
  monthly_filing: { pitch: "We file your taxes every month so you never miss a deadline.", why: "Late tax filing means penalties, interest, and blocked accounts.", how: "We collect your records, review statements, complete questionnaires, file with FIRS, and deliver your report.", what: "Monthly FIRS Filing, VAT Returns, PAYE Processing, Monthly Report.", includes: ["Monthly FIRS filing", "VAT returns", "PAYE processing"], price: "Included in ₦150,000/year" },
  renewal_dates: { pitch: "Your licences and registrations have expiry dates. We track every one.", why: "Expired permits mean fines and operational shutdowns.", how: "We track all your renewal dates and alert you well before any deadline.", what: "CAC Annual Returns Date, Licence Renewal Dates, Permit Expiry Alerts.", includes: ["CAC annual returns date", "Licence renewal dates", "Permit expiry alerts"], price: "Included" },
  scuml: { pitch: "SCUML certificate is required for opening corporate bank accounts.", why: "Banks will not open your corporate account without SCUML.", how: "We handle EFCC registration and SCUML certificate collection so your bank account is ready.", what: "EFCC Registration, SCUML Certificate, Bank Account Readiness Letter.", includes: ["EFCC registration", "SCUML certificate", "Bank account readiness"], price: "₦45,000" },
  tcc_cert: { pitch: "Tax Clearance Certificate -- proof your business is compliant.", why: "TCC is required for government contracts, bank facilities, and proving your business is in good standing.", how: "We review your 3-year tax records, submit to FIRS, and collect your certificate annually.", what: "3-Year Tax Review, FIRS Submission, Certificate Delivery.", includes: ["3-year tax review", "FIRS submission", "Certificate delivery"], price: "Included" },
  financial_report: { pitch: "Monthly and annual financial reports showing your compliance status.", why: "Without clear financial reports, you cannot prove compliance or make informed business decisions.", how: "We compile your filing summaries and deliver monthly and annual financial statements.", what: "Monthly Filing Summary, Annual Financial Statement, Tax Position Report.", includes: ["Monthly filing summary", "Annual financial statement", "Tax position report"], price: "Included" },
  acknowledgement: { pitch: "Every filing comes with an official acknowledgement from FIRS.", why: "Without filing receipts, you have no proof of compliance. In a dispute, proof is everything.", how: "We file, collect the official acknowledgement, and store it for your records.", what: "Filing Receipt, Submission Confirmation, Record Keeping.", includes: ["Filing receipt", "Submission confirmation", "Record keeping"], price: "Included" },
  online_always: { pitch: "Learn at your own pace. Our online programs are always open.", why: "Waiting for a cohort means losing months. Start building your skills now.", how: "Self-paced modules on our HALS platform with full access and certificate on completion.", what: "Self-Paced Modules, HALS Access, Certificate on Completion.", includes: ["Self-paced modules", "HALS access", "Certificate on completion"], price: "from ₦45,000" },
  physical_cohort: { pitch: "Limited seats. Next cohort filling fast.", why: "Online learning is flexible but in-person training builds stronger skills and real connections.", how: "3-week intensive in Abuja with hands-on projects, networking, and direct mentorship.", what: "3-Week Intensive, Hands-On Projects, Networking, Certificate.", includes: ["3-week intensive", "Hands-on projects", "Networking", "Certificate"], price: "from ₦55,000" },
};

/* ── Service Folder Breakdown ── */
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

/* ── Utilities ── */
function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
}
function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Session ── */
interface ClientSession { ref: string; phone?: string; expiresAt: number; }

function loadClientSession(): ClientSession | null {
  try {
    const raw = localStorage.getItem("hamzury-client-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientSession;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) { localStorage.removeItem("hamzury-client-session"); return null; }
    return parsed;
  } catch { return null; }
}

/* ── Chat persistence ── */
type ChatMsg = { role: "user" | "assistant"; content: string };
function loadChatMessages(ref: string): ChatMsg[] { try { const r = localStorage.getItem(`hamzury-dashboard-chat-${ref}`); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveChatMessages(ref: string, msgs: ChatMsg[]) { try { localStorage.setItem(`hamzury-dashboard-chat-${ref}`, JSON.stringify(msgs.slice(-50))); } catch {} }

/* ── Map service → active items ── */
type ItemState = "delivered" | "in_progress" | "paid" | "inactive";
function mapServiceToItems(service: string, status: string, notes?: string): Record<string, ItemState> {
  const s = service.toLowerCase();
  const done = status === "Completed";
  const map: Record<string, ItemState> = {};
  const add = (id: string) => { if (!map[id]) map[id] = done ? "delivered" : "in_progress"; };
  if (s.includes("full business") || s.includes("architecture")) { ["tin", "brand_id", "website", "social_setup", "social_mgmt", "dashboard", "crm", "automation", "workspace"].forEach(add); }
  if (s.includes("scuml")) add("scuml");
  if (s.includes("branding") || s.includes("brand")) add("brand_id");
  if (s.includes("website") || s.includes("webpage")) add("website");
  if (s.includes("social media account")) add("social_setup");
  if (s.includes("social media management")) add("social_mgmt");
  if (s.includes("lead generation")) add("crm");
  if (s.includes("founder dashboard")) add("dashboard");
  if (s.includes("whatsapp automation")) add("automation");
  if (s.includes("management") || s.includes("subscription") || s.includes("tax management")) { ["monthly_filing", "renewal_dates", "tcc_cert", "financial_report", "acknowledgement"].forEach(add); }
  if (s.includes("cac") || s.includes("registration")) add("cac");
  if (s.includes("tax") && !s.includes("whatsapp")) add("tin");
  if (s.includes("tcc")) add("tcc");
  if (s.includes("licence") || s.includes("nafdac")) add("licence");
  if (s.includes("automation") || s.includes("crm")) { add("automation"); add("crm"); }
  if (s.includes("training") || s.includes("skill") || s.includes("cohort")) add("team");
  if (s.includes("contract") || s.includes("legal")) add("contracts");
  if (notes) { const m = notes.match(/\[DELIVERED:\s*([^\]]+)\]/i); if (m) m[1].split(",").map(x => x.trim()).forEach(id => { if (id) map[id] = "delivered"; }); }
  return map;
}

/* ── Founder Quotes ── */
const FOUNDER_QUOTES = [
  "The businesses that win aren't the loudest — they're the most structured. You're building yours right.",
  "Every document filed, every system built, every brand element designed — these are the walls of your empire.",
  "Most businesses fail not because of a bad product, but because of a weak foundation. Yours is being built properly.",
  "Structure is the difference between a business that survives and one that scales. You chose to scale.",
  "The moment you decided to structure your business, you separated yourself from 90% of your competitors.",
];

/* ── Requirements form fields ── */
const REQ_SECTIONS = [
  { id: "business", label: "Business", icon: Building2, why: "We need your business details to register and position your company correctly.",
    fields: [
      { key: "businessName1", label: "Preferred Business Name", placeholder: "1st choice name", required: true },
      { key: "businessName2", label: "2nd Choice Name", placeholder: "Alternative name" },
      { key: "businessName3", label: "3rd Choice Name", placeholder: "Backup name" },
      { key: "businessAddress", label: "Registered Address", placeholder: "Full address", required: true },
      { key: "businessNature", label: "Nature of Business", placeholder: "What does your business do?" },
      { key: "businessEmail", label: "Business Email", placeholder: "email@business.com" },
    ] },
  { id: "registration", label: "Directors", icon: FileCheck, why: "Director details are required for CAC registration and legal documentation.",
    fields: [
      { key: "director1Name", label: "Director 1 Full Name", placeholder: "Legal name", required: true },
      { key: "director1Phone", label: "Director 1 Phone", placeholder: "080..." },
      { key: "director1IdType", label: "ID Type", placeholder: "Select", select: ["NIN", "International Passport", "Voter's Card", "Driver's License"] },
      { key: "director1IdNumber", label: "ID Number", placeholder: "ID number" },
      { key: "director2Name", label: "Director 2 (optional)", placeholder: "Leave blank if sole" },
      { key: "sharesplit", label: "Share Split", placeholder: "Select", select: ["100/0 (Sole)", "60/40", "50/50", "70/30", "80/20", "Other"] },
    ] },
  { id: "brand", label: "Brand", icon: Palette, why: "Your brand preferences guide our design team to create an identity that represents you.",
    fields: [
      { key: "brandNames", label: "Brand Names to Trademark", placeholder: "Names you want protected", required: true },
      { key: "hasLogo", label: "Have a logo?", placeholder: "Select", select: ["No", "Yes — I'll send it", "Yes — want a new one"] },
      { key: "colorPreference", label: "Color Preferences", placeholder: "Colors you like" },
      { key: "targetAudience", label: "Target Audience", placeholder: "Who are your ideal clients?" },
      { key: "brandPersonality", label: "Brand Personality", placeholder: "Select", select: ["Premium & Authoritative", "Friendly & Approachable", "Bold & Disruptive", "Clean & Minimal", "Warm & Trustworthy"] },
    ] },
  { id: "digital", label: "Digital", icon: Globe, why: "Knowing your current digital presence helps us set up or improve your online channels.",
    fields: [
      { key: "instagram", label: "Instagram", placeholder: "@yourbusiness" },
      { key: "whatsapp", label: "WhatsApp Business", placeholder: "080..." },
      { key: "currentWebsite", label: "Current Website", placeholder: "www..." },
      { key: "servicesOffered", label: "Services You Offer", placeholder: "List your main services", textarea: true },
    ] },
  { id: "notes", label: "Notes", icon: FileText, why: "Anything else you want us to know — preferences, deadlines, special requests.",
    fields: [
      { key: "additionalNotes", label: "Additional Notes", placeholder: "Anything else?", textarea: true },
    ] },
] as const;

/* ══════════════════════════════════════════════════════════════════════ */
/*  PROGRESS LINE — Core visual component                               */
/* ══════════════════════════════════════════════════════════════════════ */

type LineItem = { id: string; label: string; status: "done" | "active" | "pending"; };

function ProgressLine({ label, icon: Icon, items, selectedId, onSelect, children }: {
  label: string; icon: React.ElementType; items: LineItem[];
  selectedId: string | null; onSelect: (id: string | null) => void;
  children?: (item: LineItem) => React.ReactNode;
}) {
  const doneCount = items.filter(i => i.status === "done").length;
  const activeCount = items.filter(i => i.status !== "pending").length;
  const pct = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: activeCount > 0 ? `${GREEN}15` : `${GREY}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={15} style={{ color: activeCount > 0 ? GREEN : MUTED }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: DARK, letterSpacing: "0.01em" }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>
          {doneCount} of {items.length}{pct > 0 ? ` · ${pct}%` : ""}
        </span>
      </div>

      {/* Line with circles */}
      <div style={{ position: "relative", padding: "0 8px" }}>
        <div style={{ position: "absolute", top: 9, left: 8, right: 8, height: 2, backgroundColor: `${GREY}60`, borderRadius: 1 }} />
        <div style={{ position: "absolute", top: 9, left: 8, height: 2, width: items.length > 1 ? `${(Math.max(0, activeCount - 1) / (items.length - 1)) * 100}%` : "0%", backgroundColor: GREEN, borderRadius: 1, transition: "width 0.6s ease" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {items.map((item) => {
            const isDone = item.status === "done";
            const isActive = item.status === "active";
            const isSelected = selectedId === item.id;
            return (
              <button key={item.id} onClick={() => onSelect(isSelected ? null : item.id)} title={item.label}
                style={{ width: 20, height: 20, borderRadius: 10, border: "none", backgroundColor: isDone ? GREEN : isActive ? GOLD : WHITE, boxShadow: isSelected ? `0 0 0 3px ${GOLD}40` : isDone || isActive ? "none" : `inset 0 0 0 2px ${GREY}`, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", animation: isActive ? "pulse-dot 2s infinite" : "none", padding: 0 }}>
                {isDone && <CheckCircle size={12} style={{ color: WHITE }} />}
                {isActive && <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: WHITE }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px 0" }}>
        {items.map((item) => (
          <span key={item.id} style={{ fontSize: 9, color: selectedId === item.id ? GOLD : MUTED, fontWeight: selectedId === item.id ? 600 : 400, textAlign: "center", width: `${100 / items.length}%`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.label}
          </span>
        ))}
      </div>

      {/* Expanded detail */}
      {selectedId && children && (() => {
        const item = items.find(i => i.id === selectedId);
        if (!item) return null;
        return (
          <div style={{ marginTop: 12, padding: 16, borderRadius: 12, backgroundColor: WHITE, border: `1px solid ${GREY}30`, animation: "fadeUp 0.3s ease" }}>
            {children(item)}
          </div>
        );
      })()}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD                                                       */
/* ══════════════════════════════════════════════════════════════════════ */

export default function ClientDashboard() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<{ section: string; itemId: string } | null>(null);
  const [copiedAcct, setCopiedAcct] = useState(false);
  const [claimedInvoices, setClaimedInvoices] = useState<Set<string>>(new Set());
  const [reqForm, setReqForm] = useState<Record<string, string>>({});
  const [reqSubmitted, setReqSubmitted] = useState(false);
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [showCart, setShowCart] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [autoGreeted, setAutoGreeted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * FOUNDER_QUOTES.length));

  useEffect(() => { const s = loadClientSession(); setSession(s); setSessionLoaded(true); if (!s) window.location.href = "/"; }, []);

  const { data, isLoading, isError } = trpc.tracking.fullLookup.useQuery(
    { ref: session?.ref ?? "", phone: session?.phone },
    { enabled: !!session?.ref, retry: false, refetchInterval: 30000 }
  );
  const { data: bankDetails } = trpc.invoices.bankDetails.useQuery(undefined, { staleTime: Infinity });
  const claimMutation = trpc.invoices.claimPayment.useMutation({ onSuccess: (_, v) => setClaimedInvoices(p => new Set(p).add(v.invoiceNumber)) });
  const submitMutation = trpc.onboarding.submit.useMutation({ onSuccess: () => { setReqSubmitted(true); setReqSubmitting(false); }, onError: () => setReqSubmitting(false) });

  function handleLogout() { localStorage.removeItem("hamzury-client-session"); if (session?.ref) localStorage.removeItem(`hamzury-dashboard-chat-${session.ref}`); window.location.href = "/client"; }
  const sel = (section: string, itemId: string) => setExpandedSection(p => p?.section === section && p?.itemId === itemId ? null : { section, itemId });
  const toggleCart = (id: string) => setCartItems(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  useEffect(() => { if (!session?.ref) return; const saved = loadChatMessages(session.ref); if (saved.length > 0) { setChatMessages(saved); setAutoGreeted(true); } }, [session?.ref]);
  useEffect(() => { if (session?.ref && chatMessages.length > 0) saveChatMessages(session.ref, chatMessages); }, [chatMessages, session?.ref]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleChatSend = useCallback(async (text?: string) => {
    const msg = (text || chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    const userMsg: ChatMsg = { role: "user", content: msg };
    setChatMessages(prev => [...prev, userMsg, { role: "assistant", content: "" }]);
    setChatLoading(true);
    try {
      const allMsgs = [...chatMessages, userMsg];
      const history = allMsgs.slice(-10).map(h => ({ role: h.role, content: h.content }));
      const olderMsgs = allMsgs.slice(0, -10);
      const chatMemory = olderMsgs.length > 0 ? olderMsgs.map(m => `${m.role === "user" ? "Client" : "Advisor"}: ${m.content.slice(0, 100)}`).join(" | ") : undefined;
      const response = await fetch("/api/chat/dashboard-message", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, tone_preference: "Friendly", chat_memory: chatMemory,
          task_context: data ? { clientName: data.task?.clientName, businessName: data.task?.businessName, service: data.task?.service, department: data.task?.department, status: data.task?.status, progress: data.task?.progress, checklist: data.checklist?.slice(0, 15).map((c: any) => ({ label: c.label, completed: !!c.checked })), recentActivity: data.activity?.slice(0, 5).map((a: any) => a.action) } : undefined }),
      });
      if (!response.ok || !response.body) throw new Error("fail");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "", buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;
          try { const p = JSON.parse(d); const delta = p.choices?.[0]?.delta?.content; if (delta) { fullText += delta; setChatMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: fullText }; return u; }); } } catch {}
        }
      }
      setChatMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: fullText || "Our team will answer that directly." }; return u; });
    } catch { setChatMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Connection issue. Please try again." }; return u; }); }
    finally { setChatLoading(false); }
  }, [chatInput, chatLoading, chatMessages, data]);

  if (sessionLoaded && !session) { window.location.href = "/"; return null; }
  if (sessionLoaded && session && !isLoading && (isError || !data || !data.found)) { localStorage.removeItem("hamzury-client-session"); window.location.href = "/"; return null; }
  if (!sessionLoaded || !session || isLoading || !data || !data.found) {
    return (<div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: WHITE }}><Loader2 className="animate-spin" size={20} style={{ color: DARK }} /><p className="text-[13px] mt-3" style={{ color: MUTED }}>Loading...</p></div>);
  }

  /* ── Data extraction ── */
  const task = data.task;
  const checklist = data.checklist || [];
  const invoiceSummary = data.invoiceSummary;
  const isBizdoc = (task.department || "").toLowerCase() === "bizdoc";
  const activeBankDetails = bankDetails ? isBizdoc && bankDetails.bizdoc?.configured ? bankDetails.bizdoc : bankDetails.general : null;
  const activeItems = mapServiceToItems(task.service || "", task.status || "", task.notes || "");
  const firstName = (task.clientName || "").split(" ")[0];
  const businessName = task.businessName || task.clientName || "Your Business";

  /* Auto-greeting */
  if (!autoGreeted && chatMessages.length === 0) {
    const svc = task.service || "", st = task.status || "", pct = task.progress || 0;
    let g = `Hi ${firstName}.`;
    if (svc.toLowerCase().includes("full business") || svc.toLowerCase().includes("architecture")) g += ` ${businessName} is set up for a full business architecture — compliance and brand setup are in progress. ${pct}% of your structure is in place.`;
    else if (svc) g += ` Your ${svc.toLowerCase()} is currently ${st.toLowerCase()}. ${pct}% complete.`;
    g += ` Anything you'd like to know?`;
    setTimeout(() => { setChatMessages([{ role: "assistant", content: g }]); setAutoGreeted(true); }, 0);
  }

  /* Parse existing requirements */
  const existingReqs = (() => {
    const notes = task.notes || "";
    const match = notes.match(/━━━ CLIENT REQUIREMENTS[^━]*━━━([\s\S]*?)━━━/);
    if (!match) return null;
    const parsed: Record<string, string> = {};
    match[1].split("\n").forEach((line: string) => { const b = line.match(/•\s*([^:]+):\s*(.*)/); if (b) parsed[b[1].trim()] = b[2].trim(); });
    return Object.keys(parsed).length > 0 ? parsed : null;
  })();
  const hasSubmittedReqs = reqSubmitted || !!existingReqs;

  /* Delivery link */
  const deliveryLink = (task.businessName || "").toLowerCase().includes("tilz") ? "/clients/tilz-spa/delivery" : null;

  /* ── Section data ── */
  const svc = (task.service || "").toLowerCase();
  const isFullBuild = svc.includes("full business") || svc.includes("architecture");

  const timelineItems: LineItem[] = (() => {
    if (isFullBuild) {
      const brandDone = ["brand_id", "positioning"].some(id => activeItems[id] === "delivered");
      const digitalDone = ["website", "social_setup"].some(id => activeItems[id] === "delivered");
      const opsDone = ["dashboard", "crm", "automation"].some(id => activeItems[id] === "delivered");
      const brandActive = ["brand_id", "positioning"].some(id => activeItems[id] === "in_progress");
      const digitalActive = ["website", "social_setup"].some(id => activeItems[id] === "in_progress");
      const opsActive = ["dashboard", "crm", "automation"].some(id => activeItems[id] === "in_progress");
      return [
        { id: "brand_phase", label: "Brand", status: brandDone ? "done" : brandActive ? "active" : "pending" as const },
        { id: "digital_phase", label: "Digital", status: digitalDone ? "done" : digitalActive ? "active" : brandDone ? "active" : "pending" as const },
        { id: "ops_phase", label: "Operations", status: opsDone ? "done" : opsActive ? "active" : digitalDone ? "active" : "pending" as const },
        { id: "growth_phase", label: "Growth", status: task.status === "Completed" ? "done" : opsDone ? "active" : "pending" as const },
      ];
    }
    if (checklist.length > 0) {
      const firstUnchecked = checklist.findIndex((x: any) => !x.checked);
      return checklist.slice(0, 6).map((c: any, i: number) => ({ id: `cl_${i}`, label: (c.label || "").split(" ").slice(0, 2).join(" "), status: c.checked ? "done" as const : i === firstUnchecked ? "active" as const : "pending" as const }));
    }
    const p = task.progress || 0;
    return [
      { id: "start", label: "Started", status: "done" as const },
      { id: "progress", label: "In Progress", status: p > 30 ? "done" as const : "active" as const },
      { id: "review", label: "Review", status: p > 70 ? "done" as const : p > 50 ? "active" as const : "pending" as const },
      { id: "complete", label: "Complete", status: task.status === "Completed" ? "done" as const : "pending" as const },
    ];
  })();

  const reqItems: LineItem[] = REQ_SECTIONS.map(s => {
    if (hasSubmittedReqs) return { id: s.id, label: s.label, status: "done" as const };
    const filled = s.fields.filter(f => (reqForm[f.key] || "").trim().length > 0).length;
    return { id: s.id, label: s.label, status: filled === s.fields.length ? "done" as const : filled > 0 ? "active" as const : "pending" as const };
  });

  const paymentItems: LineItem[] = !invoiceSummary?.invoices?.length
    ? [{ id: "no_inv", label: "Invoice", status: "pending" }]
    : invoiceSummary.invoices.map((inv: any) => ({ id: inv.number || `inv_${inv.id}`, label: inv.status === "paid" ? "Paid" : "Due", status: inv.status === "paid" ? "done" as const : "active" as const }));

  const mkItems = (defs: { id: string; label: string }[]): LineItem[] => defs.map(d => ({ ...d, status: activeItems[d.id] === "delivered" ? "done" as const : activeItems[d.id] ? "active" as const : "pending" as const }));

  const brandItems = mkItems([{ id: "brand_id", label: "Identity" }, { id: "positioning", label: "Position" }, { id: "website", label: "Website" }, { id: "content_strategy", label: "Content" }, { id: "materials", label: "Materials" }, { id: "pitch_deck", label: "Pitch" }]);
  const workspaceItems = mkItems([{ id: "workspace", label: "Email" }, { id: "crm", label: "CRM" }, { id: "automation", label: "Automation" }, { id: "dashboard", label: "Dashboard" }, { id: "research", label: "Research" }]);
  const complianceItems = mkItems([{ id: "cac", label: "CAC" }, { id: "tin", label: "TIN" }, { id: "tcc", label: "TCC" }, { id: "licence", label: "Licence" }, { id: "contracts", label: "Legal" }, { id: "annual", label: "Returns" }, { id: "scuml", label: "SCUML" }]);
  const digitalItems = mkItems([{ id: "website", label: "Website" }, { id: "dashboard", label: "Dashboard" }, { id: "crm", label: "CRM" }, { id: "automation", label: "Automation" }, { id: "ai_agent", label: "AI Agent" }]);
  const templateItems = mkItems([{ id: "templates", label: "Contracts" }, { id: "materials", label: "Letterhead" }, { id: "social_setup", label: "Social Kit" }, { id: "content", label: "Content" }, { id: "pitch_deck", label: "Proposals" }]);
  const staffItems = mkItems([{ id: "founder", label: "Founder" }, { id: "team", label: "Team" }, { id: "ai_skills", label: "AI Skills" }, { id: "growth", label: "Growth" }]);
  const aiItems = mkItems([{ id: "ai_agent", label: "AI Chat" }, { id: "automation", label: "Automation" }, { id: "seo", label: "SEO" }, { id: "social_mgmt", label: "Social" }, { id: "reputation", label: "Reputation" }]);

  const subscriptionItems: LineItem[] = (() => {
    const svcLower = (task.service || "").toLowerCase();
    const items: LineItem[] = [];
    if (svcLower.includes("full business") || svcLower.includes("architecture") || svcLower.includes("website") || svcLower.includes("management")) items.push({ id: "sub_website", label: "Website", status: activeItems["website"] === "delivered" ? "done" : activeItems["website"] ? "active" : "pending" });
    if (svcLower.includes("full business") || svcLower.includes("social media management") || svcLower.includes("social")) items.push({ id: "sub_social", label: "Social", status: activeItems["social_mgmt"] === "delivered" ? "done" : activeItems["social_mgmt"] ? "active" : "pending" });
    if (svcLower.includes("full business") || svcLower.includes("dashboard") || svcLower.includes("management")) items.push({ id: "sub_dashboard", label: "Dashboard", status: activeItems["dashboard"] === "delivered" ? "done" : activeItems["dashboard"] ? "active" : "pending" });
    if (svcLower.includes("tax") || svcLower.includes("pro max")) items.push({ id: "sub_tax", label: "Tax", status: "active" });
    if (svcLower.includes("full business") || svcLower.includes("crm") || svcLower.includes("lead")) items.push({ id: "sub_crm", label: "CRM", status: activeItems["crm"] === "delivered" ? "done" : activeItems["crm"] ? "active" : "pending" });
    if (svcLower.includes("full business") || svcLower.includes("automation") || svcLower.includes("whatsapp")) items.push({ id: "sub_auto", label: "WhatsApp", status: activeItems["automation"] === "delivered" ? "done" : activeItems["automation"] ? "active" : "pending" });
    return items.length > 0 ? items : [];
  })();

  const deliveryItems: LineItem[] = (() => {
    const items: LineItem[] = [];
    Object.entries(activeItems).forEach(([id, state]) => {
      const folder = SERVICE_FOLDERS[id];
      if (!folder) return;
      items.push({ id, label: folder.label.split(" ").slice(0, 2).join(" "), status: state === "delivered" ? "done" : state === "in_progress" ? "active" : "pending" });
    });
    return items.length > 0 ? items : [{ id: "pending_delivery", label: "Awaiting", status: "pending" }];
  })();

  const cartTotal = (() => { let t = 0; cartItems.forEach(id => { const s = SERVICE_DETAILS[id]; if (s) { const n = parseInt((s.price || "").replace(/[^0-9]/g, "")); if (n) t += n; } }); return t; })();

  function handleSubmitReqs() { if (!session?.ref || reqSubmitting) return; setReqSubmitting(true); submitMutation.mutate({ ref: session.ref.toUpperCase(), data: reqForm }); }

  function handleCheckout() {
    const names = Array.from(cartItems).map(id => SERVICE_DETAILS[id]?.what?.split(",")[0] || id).join(", ");
    setMobileChatOpen(true); setShowCart(false);
    setTimeout(() => handleChatSend(`I want to activate these services: ${names}. Total estimate: ${formatNaira(cartTotal)}. How do I pay?`), 300);
  }

  function renderServiceDetail(id: string) {
    const sv = SERVICE_DETAILS[id];
    const folder = SERVICE_FOLDERS[id];
    const state = activeItems[id];
    if (!sv) return <p style={{ fontSize: 13, color: MUTED }}>Details coming soon.</p>;
    const hasIt = !!state && state !== "inactive";
    const isInCart = cartItems.has(id);
    return (
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: DARK, marginBottom: 6 }}>{sv.pitch}</p>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 10 }}>{sv.why}</p>
        {folder && <div style={{ marginBottom: 10 }}>
          {folder.items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              {state === "delivered" ? <CheckCircle size={12} style={{ color: GREEN }} /> : state === "in_progress" ? <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD }} /> : <Circle size={12} style={{ color: GREY }} />}
              <span style={{ fontSize: 12, color: state === "delivered" ? GREEN : DARK }}>{item}</span>
            </div>
          ))}
        </div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: GOLD }}>{sv.price}</span>
          {hasIt ? <span style={{ fontSize: 11, color: GREEN, fontWeight: 500 }}>{state === "delivered" ? "✓ Delivered" : "⏳ In Progress"}</span>
            : <button onClick={() => toggleCart(id)} style={{ fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 8, border: isInCart ? `1px solid ${GREEN}` : `1px solid ${GOLD}`, backgroundColor: isInCart ? `${GREEN}10` : "transparent", color: isInCart ? GREEN : GOLD, cursor: "pointer" }}>{isInCart ? "✓ Added" : "Add to Cart"}</button>}
        </div>
      </div>
    );
  }

  /* ── Chat Panel ── */
  const ChatPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col ${isMobile ? "h-[70vh]" : "h-full"}`} style={{ backgroundColor: WHITE }}>
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: BG }}><Sparkles size={14} style={{ color: GOLD }} /></div>
          <p className="text-[14px]" style={{ color: DARK, fontWeight: 500 }}>Advisor</p>
        </div>
        {isMobile && <button onClick={() => setMobileChatOpen(false)} style={{ minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer" }}><X size={18} style={{ color: MUTED }} /></button>}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3" style={{ minHeight: 0 }}>
        {chatMessages.length === 0 && <div className="flex flex-col items-center justify-center h-full text-center px-4"><Sparkles size={24} style={{ color: MUTED, opacity: 0.3 }} className="mb-3" /><p className="text-[13px]" style={{ color: MUTED }}>Ask anything about your business.</p></div>}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] rounded-2xl px-4 py-3" style={{ backgroundColor: msg.role === "user" ? CHAT_USER_BG : CHAT_BOT_BG, color: msg.role === "user" ? WHITE : DARK, borderBottomRightRadius: msg.role === "user" ? 6 : 18, borderBottomLeftRadius: msg.role === "user" ? 18 : 6 }}>
              {msg.content ? <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ fontWeight: 400 }}>{msg.content}</p>
                : <div className="flex items-center gap-1.5 py-1"><div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: MUTED }} /><div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: MUTED, animationDelay: "150ms" }} /><div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: MUTED, animationDelay: "300ms" }} /></div>}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="shrink-0 px-4 py-3 flex items-center gap-2" style={{ boxShadow: "0 -1px 0 rgba(0,0,0,0.04)" }}>
        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }} placeholder="Type a message..." className="flex-1 text-[13px] bg-transparent focus:outline-none py-3 px-4 rounded-full" style={{ color: DARK, backgroundColor: BG, fontWeight: 400, minHeight: 44 }} disabled={chatLoading} />
        <button onClick={() => handleChatSend()} disabled={!chatInput.trim() || chatLoading} className="flex items-center justify-center shrink-0 transition-all hover:opacity-80 disabled:opacity-30 rounded-full" style={{ backgroundColor: GOLD, color: WHITE, width: 44, height: 44 }}>
          {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                             */
  /* ════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <style>{cssAnimations}</style>
      <PageMeta title={`${businessName} | HAMZURY`} description="Your business dashboard." />

      {/* HEADER */}
      <nav className="sticky top-0 z-30 flex items-center justify-between" style={{ height: 48, padding: "0 20px", backgroundColor: `${WHITE}f2`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 0.5px 0 rgba(0,0,0,0.06)" }}>
        <a href="/" className="text-[13px] tracking-tight" style={{ color: DARK, fontWeight: 600, letterSpacing: "0.02em" }}>HAMZURY</a>
        <button onClick={handleLogout} className="text-[13px] transition-opacity hover:opacity-60" style={{ color: MUTED, fontWeight: 400, minHeight: 44, display: "flex", alignItems: "center" }}>Exit</button>
      </nav>

      <div style={{ height: "calc(100vh - 48px)", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px", paddingBottom: 140 }}>

          {/* 1. WELCOME */}
          <div style={{ paddingTop: 40, paddingBottom: 36, textAlign: "center" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK, letterSpacing: "-0.02em", marginBottom: 6 }}>Welcome, {firstName}</h1>
            <p style={{ fontSize: 20, fontWeight: 500, color: GOLD, marginBottom: 16 }}>{businessName}</p>
            <p style={{ fontSize: 13, color: MUTED, fontStyle: "italic", lineHeight: 1.7, maxWidth: 360, margin: "0 auto", marginBottom: 8 }}>"{FOUNDER_QUOTES[quoteIdx]}"</p>
            <p style={{ fontSize: 11, color: `${MUTED}80`, fontWeight: 500, letterSpacing: "0.04em" }}>— Muhammad Hamzury</p>
          </div>

          {/* 2. PROJECT TIMELINE */}
          <ProgressLine label="Project Timeline" icon={Clock} items={timelineItems} selectedId={expandedSection?.section === "timeline" ? expandedSection.itemId : null} onSelect={id => id ? sel("timeline", id) : setExpandedSection(null)}>
            {(item) => {
              const desc: Record<string, string> = { brand_phase: "Brand identity, logo, guidelines, positioning — the foundation of how your business looks.", digital_phase: "Website, social media setup, content strategy — making you visible online.", ops_phase: "Dashboards, CRM, automation, workspace — the systems that run your business.", growth_phase: "Training, scaling strategy, retainer — growing beyond the foundation." };
              return (<div>
                <p style={{ fontSize: 13, fontWeight: 500, color: DARK, marginBottom: 4 }}>{item.status === "done" ? "✓ Completed" : item.status === "active" ? "⏳ In Progress" : "Upcoming"}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{desc[item.id] || "Part of your project journey."}</p>
                {task.deadline && <p style={{ fontSize: 11, color: GOLD, marginTop: 8, fontWeight: 500 }}>Target: {formatDate(task.deadline)}</p>}
              </div>);
            }}
          </ProgressLine>

          {/* 3. REQUIREMENTS */}
          <ProgressLine label="Requirements" icon={FileCheck} items={reqItems} selectedId={expandedSection?.section === "req" ? expandedSection.itemId : null} onSelect={id => id ? sel("req", id) : setExpandedSection(null)}>
            {(item) => {
              const sec = REQ_SECTIONS.find(s => s.id === item.id);
              if (!sec) return null;
              if (hasSubmittedReqs) {
                return (<div><p style={{ fontSize: 12, color: GREEN, fontWeight: 500, marginBottom: 8 }}>✓ Submitted</p>
                  {sec.fields.map(f => { const val = existingReqs?.[f.key] || existingReqs?.[f.label] || ""; if (!val) return null; return (<div key={f.key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${GREY}20` }}><span style={{ fontSize: 11, color: MUTED }}>{f.label}</span><span style={{ fontSize: 12, color: DARK, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{val}</span></div>); })}
                </div>);
              }
              return (<div>
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>{sec.why}</p>
                {sec.fields.map(f => (<div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: MUTED, fontWeight: 500, display: "block", marginBottom: 4 }}>{f.label} {"required" in f && f.required && <span style={{ color: GOLD }}>*</span>}</label>
                  {"select" in f && f.select ? (
                    <select value={reqForm[f.key] || ""} onChange={e => setReqForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 8, border: `1px solid ${GREY}60`, backgroundColor: WHITE, color: DARK, outline: "none" }}>
                      <option value="">{f.placeholder}</option>
                      {f.select.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : "textarea" in f && f.textarea ? (
                    <textarea value={reqForm[f.key] || ""} onChange={e => setReqForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3} style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 8, border: `1px solid ${GREY}60`, backgroundColor: WHITE, color: DARK, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  ) : (
                    <input type="text" value={reqForm[f.key] || ""} onChange={e => setReqForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 8, border: `1px solid ${GREY}60`, backgroundColor: WHITE, color: DARK, outline: "none" }} />
                  )}
                </div>))}
                {sec.id === "notes" && <button onClick={handleSubmitReqs} disabled={reqSubmitting || !reqForm.businessName1} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", backgroundColor: reqSubmitting ? GREY : GOLD, color: WHITE, fontSize: 13, fontWeight: 600, cursor: reqSubmitting ? "default" : "pointer", marginTop: 8 }}>{reqSubmitting ? "Submitting..." : "Submit Requirements"}</button>}
              </div>);
            }}
          </ProgressLine>

          {/* 4. PAYMENT */}
          <ProgressLine label="Payment" icon={CreditCard} items={paymentItems} selectedId={expandedSection?.section === "pay" ? expandedSection.itemId : null} onSelect={id => id ? sel("pay", id) : setExpandedSection(null)}>
            {(item) => {
              if (!invoiceSummary) return <p style={{ fontSize: 12, color: MUTED }}>No invoices yet. Payment details will appear here.</p>;
              const inv = invoiceSummary.invoices.find((i: any) => (i.number || `inv_${i.id}`) === item.id);
              const paid = invoiceSummary.paid || 0, total = invoiceSummary.total || 0, remaining = total - paid;
              return (<div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div><p style={{ fontSize: 11, color: MUTED }}>Paid</p><p style={{ fontSize: 18, fontWeight: 700, color: GREEN }}>{formatNaira(paid)}</p></div>
                  {remaining > 0 && <div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: MUTED }}>Remaining</p><p style={{ fontSize: 18, fontWeight: 700, color: ORANGE }}>{formatNaira(remaining)}</p></div>}
                </div>
                {inv && <div style={{ padding: "10px 12px", borderRadius: 8, backgroundColor: `${GREY}15`, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>{inv.number}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: inv.status === "paid" ? `${GREEN}15` : `${ORANGE}15`, color: inv.status === "paid" ? GREEN : ORANGE }}>{inv.status === "paid" ? "PAID" : "PENDING"}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{formatNaira(inv.total)}</p>
                  {inv.dueDate && <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Due: {formatDate(inv.dueDate)}</p>}
                </div>}
                {remaining > 0 && activeBankDetails?.configured && <div style={{ padding: 12, borderRadius: 8, border: `1px solid ${GOLD}30`, marginTop: 8 }}>
                  <p style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Bank Details</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{activeBankDetails.bankName}</p>
                  <p style={{ fontSize: 12, color: MUTED }}>{activeBankDetails.accountName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: DARK, fontFamily: "monospace" }}>{activeBankDetails.accountNumber}</span>
                    <button onClick={() => { navigator.clipboard.writeText(activeBankDetails.accountNumber); setCopiedAcct(true); setTimeout(() => setCopiedAcct(false), 2000); }} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>{copiedAcct ? <CheckCircle size={14} style={{ color: GREEN }} /> : <Copy size={14} style={{ color: MUTED }} />}</button>
                  </div>
                  {inv && !claimedInvoices.has(inv.number) && <button onClick={() => claimMutation.mutate({ invoiceNumber: inv.number, clientName: task.clientName })} disabled={claimMutation.isPending} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 8, border: `1px solid ${GREEN}`, backgroundColor: `${GREEN}10`, color: GREEN, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{claimMutation.isPending ? "Confirming..." : "I've Paid"}</button>}
                  {inv && claimedInvoices.has(inv.number) && <p style={{ fontSize: 12, color: GREEN, fontWeight: 500, marginTop: 8, textAlign: "center" }}>✓ Payment notification sent.</p>}
                </div>}
              </div>);
            }}
          </ProgressLine>

          {/* 5. BRAND */}
          <ProgressLine label="Brand Positioning" icon={Palette} items={brandItems} selectedId={expandedSection?.section === "brand" ? expandedSection.itemId : null} onSelect={id => id ? sel("brand", id) : setExpandedSection(null)}>
            {(item) => {
              const sv = SERVICE_DETAILS[item.id];
              const folder = SERVICE_FOLDERS[item.id];
              const state = activeItems[item.id];
              if (!sv) return <p style={{ fontSize: 13, color: MUTED }}>Details coming soon.</p>;
              const hasIt = !!state && state !== "inactive";
              const isInCart = cartItems.has(item.id);
              const isDelivered = state === "delivered";
              return (
                <div>
                  {/* Brand header with accent bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: isDelivered ? GREEN : state === "in_progress" ? GOLD : GREY }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: 0 }}>{sv.pitch}</p>
                      {isDelivered && <p style={{ fontSize: 11, color: GREEN, fontWeight: 500, margin: "2px 0 0" }}>✓ Delivered</p>}
                      {state === "in_progress" && <p style={{ fontSize: 11, color: GOLD, fontWeight: 500, margin: "2px 0 0" }}>⏳ In Progress</p>}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>{sv.why}</p>
                  {/* Deliverables checklist */}
                  {folder && <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: `${BG}`, marginBottom: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Deliverables</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                      {folder.items.map((fi, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                          {isDelivered ? <CheckCircle size={11} style={{ color: GREEN }} /> : state === "in_progress" ? <div style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: GOLD }} /> : <Circle size={11} style={{ color: `${GREY}80` }} />}
                          <span style={{ fontSize: 11, color: isDelivered ? DARK : `${MUTED}`, fontWeight: isDelivered ? 500 : 400 }}>{fi}</span>
                        </div>
                      ))}
                    </div>
                  </div>}
                  {/* Price + action */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GOLD }}>{sv.price}</span>
                    {hasIt ? <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 6, backgroundColor: isDelivered ? `${GREEN}10` : `${GOLD}10`, color: isDelivered ? GREEN : GOLD, fontWeight: 600 }}>{isDelivered ? "Completed" : "Building"}</span>
                      : <button onClick={() => toggleCart(item.id)} style={{ fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 8, border: isInCart ? `1px solid ${GREEN}` : `1px solid ${GOLD}`, backgroundColor: isInCart ? `${GREEN}10` : "transparent", color: isInCart ? GREEN : GOLD, cursor: "pointer" }}>{isInCart ? "✓ Added" : "Add to Cart"}</button>}
                  </div>
                </div>
              );
            }}
          </ProgressLine>

          {/* 6. WORKSPACE */}
          <ProgressLine label="Workspace & Systems" icon={Layers} items={workspaceItems} selectedId={expandedSection?.section === "wk" ? expandedSection.itemId : null} onSelect={id => id ? sel("wk", id) : setExpandedSection(null)}>
            {(item) => renderServiceDetail(item.id)}
          </ProgressLine>

          {/* 7. COMPLIANCE */}
          <ProgressLine label="Documents & Compliance" icon={Shield} items={complianceItems} selectedId={expandedSection?.section === "comp" ? expandedSection.itemId : null} onSelect={id => id ? sel("comp", id) : setExpandedSection(null)}>
            {(item) => renderServiceDetail(item.id)}
          </ProgressLine>

          {/* 8. DIGITAL */}
          <ProgressLine label="Website, CRM & Dashboard" icon={Globe} items={digitalItems} selectedId={expandedSection?.section === "dig" ? expandedSection.itemId : null} onSelect={id => id ? sel("dig", id) : setExpandedSection(null)}>
            {(item) => renderServiceDetail(item.id)}
          </ProgressLine>

          {/* 9. TEMPLATES */}
          <ProgressLine label="Templates & Materials" icon={FileText} items={templateItems} selectedId={expandedSection?.section === "tpl" ? expandedSection.itemId : null} onSelect={id => id ? sel("tpl", id) : setExpandedSection(null)}>
            {(item) => renderServiceDetail(item.id)}
          </ProgressLine>

          {/* 10. STAFF */}
          <ProgressLine label="Staff & Training" icon={Users} items={staffItems} selectedId={expandedSection?.section === "staff" ? expandedSection.itemId : null} onSelect={id => id ? sel("staff", id) : setExpandedSection(null)}>
            {(item) => renderServiceDetail(item.id)}
          </ProgressLine>

          {/* 11. AI */}
          <ProgressLine label="What AI Can Do For You" icon={Cpu} items={aiItems} selectedId={expandedSection?.section === "ai" ? expandedSection.itemId : null} onSelect={id => id ? sel("ai", id) : setExpandedSection(null)}>
            {(item) => {
              const sv = SERVICE_DETAILS[item.id];
              if (!sv) return null;
              const hasIt = !!activeItems[item.id];
              const isInCart = cartItems.has(item.id);
              return (<div>
                <p style={{ fontSize: 13, fontWeight: 500, color: DARK, marginBottom: 4 }}>{sv.pitch}</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 8 }}>{sv.why}</p>
                {sv.value && <div style={{ padding: "8px 12px", borderRadius: 8, backgroundColor: `${GREEN}08`, marginBottom: 10 }}><p style={{ fontSize: 11, color: GREEN, fontWeight: 500 }}>💰 {sv.value}</p></div>}
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: MUTED, fontWeight: 500, marginBottom: 4 }}>Includes:</p>
                  {sv.includes.map((inc, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}><CheckCircle size={10} style={{ color: GOLD }} /><span style={{ fontSize: 12, color: DARK }}>{inc}</span></div>)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{sv.price}</span>
                  {hasIt ? <span style={{ fontSize: 11, color: GREEN, fontWeight: 500 }}>{activeItems[item.id] === "delivered" ? "✓ Active" : "⏳ Setting Up"}</span>
                    : <button onClick={() => toggleCart(item.id)} style={{ fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 8, border: "none", backgroundColor: isInCart ? GREEN : GOLD, color: WHITE, cursor: "pointer" }}>{isInCart ? "✓ In Cart" : "Add"}</button>}
                </div>
              </div>);
            }}
          </ProgressLine>

          {/* Cart badge */}
          {cartItems.size > 0 && <div style={{ position: "sticky", bottom: 80, zIndex: 20, display: "flex", justifyContent: "center", marginBottom: -20 }}>
            <button onClick={() => setShowCart(!showCart)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderRadius: 50, border: "none", backgroundColor: DARK, color: WHITE, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 13, fontWeight: 600 }}>
              <Package size={16} /> {cartItems.size} service{cartItems.size > 1 ? "s" : ""} · {formatNaira(cartTotal)} <ChevronRight size={14} />
            </button>
          </div>}

          {showCart && cartItems.size > 0 && <div style={{ padding: 16, borderRadius: 12, backgroundColor: WHITE, border: `1px solid ${GREY}30`, marginBottom: 24, animation: "fadeUp 0.3s ease" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 12 }}>Your Selection</p>
            {Array.from(cartItems).map(id => { const sv = SERVICE_DETAILS[id]; if (!sv) return null; return (<div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${GREY}15` }}><div><p style={{ fontSize: 12, fontWeight: 500, color: DARK }}>{sv.what?.split(",")[0]}</p><p style={{ fontSize: 11, color: GOLD }}>{sv.price}</p></div><button onClick={() => toggleCart(id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}><X size={14} style={{ color: MUTED }} /></button></div>); })}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={handleCheckout} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", backgroundColor: GREEN, color: WHITE, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Checkout · {formatNaira(cartTotal)}</button>
              <button onClick={() => { setMobileChatOpen(true); setShowCart(false); setTimeout(() => handleChatSend("I'm interested in some services but not sure where to start. What do you recommend?"), 300); }} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${GREY}`, backgroundColor: "transparent", color: MUTED, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Help me</button>
            </div>
          </div>}

          {/* 12. DELIVERY */}
          <ProgressLine label="Delivery" icon={Package} items={deliveryItems} selectedId={expandedSection?.section === "del" ? expandedSection.itemId : null} onSelect={id => id ? sel("del", id) : setExpandedSection(null)}>
            {(item) => {
              const state = activeItems[item.id];
              const folder = SERVICE_FOLDERS[item.id];
              const isDelivered = state === "delivered";
              return (<div>
                {folder && <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: DARK, marginBottom: 6 }}>{folder.label}</p>
                  {folder.items.map((fi, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>{isDelivered ? <CheckCircle size={12} style={{ color: GREEN }} /> : <Circle size={12} style={{ color: GREY }} />}<span style={{ fontSize: 12, color: isDelivered ? DARK : `${MUTED}80` }}>{fi}</span></div>)}
                </div>}
                {isDelivered && deliveryLink && <a href={deliveryLink} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 10, backgroundColor: GREEN, color: WHITE, fontSize: 13, fontWeight: 600, textDecoration: "none", marginTop: 8 }}><Download size={14} /> View & Download</a>}
                {isDelivered && !deliveryLink && <p style={{ fontSize: 12, color: GREEN, fontWeight: 500, marginTop: 6 }}>✓ Delivered — accessible in your files.</p>}
                {!isDelivered && state === "in_progress" && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}><div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD, animation: "pulse-dot 2s infinite" }} /><span style={{ fontSize: 12, color: GOLD, fontWeight: 500 }}>In progress — you'll be notified when ready.</span></div>}
                {!isDelivered && !state && <p style={{ fontSize: 12, color: MUTED, fontStyle: "italic" }}>Soon — this deliverable is queued.</p>}
              </div>);
            }}
          </ProgressLine>

          {/* 13. SUBSCRIPTION — Continuous Management */}
          {subscriptionItems.length > 0 && (
            <ProgressLine label="Continuous Updates" icon={Zap} items={subscriptionItems} selectedId={expandedSection?.section === "sub" ? expandedSection.itemId : null} onSelect={id => id ? sel("sub", id) : setExpandedSection(null)}>
              {(item) => {
                const SUB_INFO: Record<string, { title: string; desc: string; items: string[] }> = {
                  sub_website: { title: "Website Management", desc: "Your website stays fresh, fast, and optimised. We handle updates, content changes, performance monitoring, and security patches.", items: ["Monthly content updates", "Performance monitoring", "Security patches", "SEO optimisation", "Bug fixes & improvements"] },
                  sub_social: { title: "Social Media Management", desc: "Consistent posting, engagement, and growth strategy. Your brand stays visible and active across all platforms.", items: ["Daily content posting", "Engagement management", "Monthly content calendar", "Monthly performance report", "Hashtag & trend strategy"] },
                  sub_dashboard: { title: "Dashboard Management", desc: "Your business dashboards are kept current — data updated, reports generated, and insights surfaced weekly.", items: ["Weekly data updates", "Client tracking maintenance", "Revenue reports", "Task management sync", "Custom report generation"] },
                  sub_tax: { title: "Tax Pro Max", desc: "End-to-end tax compliance management. We file, track, and optimise your taxes so you never miss a deadline.", items: ["Quarterly tax filing", "TCC processing", "Annual returns", "Tax savings optimisation", "Portal access management"] },
                  sub_crm: { title: "CRM & Lead Management", desc: "Your leads are tracked, nurtured, and followed up automatically. No opportunity falls through the cracks.", items: ["Lead pipeline management", "Follow-up automation", "Conversion tracking", "Monthly funnel reports", "New lead capture forms"] },
                  sub_auto: { title: "WhatsApp Automation", desc: "Your WhatsApp stays intelligent — auto-replies updated, booking flows optimised, new sequences added as your business grows.", items: ["Auto-reply updates", "New booking flows", "Follow-up sequences", "Broadcast campaigns", "Analytics & optimisation"] },
                };
                const info = SUB_INFO[item.id];
                if (!info) return null;
                const isDone = item.status === "done";
                return (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 4, height: 28, borderRadius: 2, backgroundColor: isDone ? GREEN : GOLD }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: DARK, margin: 0 }}>{info.title}</p>
                        <p style={{ fontSize: 11, color: isDone ? GREEN : GOLD, fontWeight: 500, margin: "2px 0 0" }}>{isDone ? "✓ Active & managed" : "⏳ Being set up"}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, marginBottom: 10 }}>{info.desc}</p>
                    <div style={{ padding: "10px 14px", borderRadius: 10, backgroundColor: BG }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>What's included</p>
                      {info.items.map((it, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                          <CheckCircle size={10} style={{ color: isDone ? GREEN : GOLD }} />
                          <span style={{ fontSize: 11, color: DARK }}>{it}</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 10, color: MUTED, fontStyle: "italic", marginTop: 8 }}>This is a continuously managed service — we handle everything.</p>
                  </div>
                );
              }}
            </ProgressLine>
          )}

          {/* 14. REFERENCE */}
          <div style={{ textAlign: "center", padding: "24px 0 16px", borderTop: `1px solid ${GREY}20` }}>
            <p style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Your Reference</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: DARK, fontFamily: "monospace", letterSpacing: "0.05em" }}>{task.ref}</p>
            <p style={{ fontSize: 10, color: `${MUTED}80`, marginTop: 4 }}>All your documents and invoices use this reference.</p>
          </div>

        </div>
      </div>

      {/* CHAT BUTTON */}
      {!mobileChatOpen && <button onClick={() => setMobileChatOpen(true)} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 40, width: 56, height: 56, borderRadius: 28, border: "none", backgroundColor: GOLD, color: WHITE, cursor: "pointer", boxShadow: "0 4px 20px rgba(180,140,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}><MessageSquare size={22} /></button>}

      {/* CHAT PANEL */}
      {mobileChatOpen && <>
        <div onClick={() => setMobileChatOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }} />
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0", overflow: "hidden", boxShadow: "0 -8px 40px rgba(0,0,0,0.12)", animation: "slideUp 0.3s ease" }}>
          <ChatPanel isMobile />
        </div>
      </>}
    </div>
  );
}
