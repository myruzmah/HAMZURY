/**
 * HAMZURY HUB — "What we offer" catalog (single source of truth).
 * 2026-05-07 — extracted from HubPage.tsx so HubAdminPortal can render the
 * same data identically (no drift). Also adds Anthropic Claude / Google
 * Gemini / OpenAI ChatGPT courses to the Online Academy.
 *
 * RULE: this is THE list of programmes/courses shown on /hub AND in
 * /hub/admin → Programs tab. Renaming or adding here updates both.
 */
import {
  Users, GraduationCap, Monitor, Briefcase, Baby,
} from "lucide-react";
import type { ElementType } from "react";

export type CourseItem = {
  name: string;
  duration?: string;
  certificate?: boolean;
  status: "active" | "next" | "coming";
  whatYouGet?: string[];
  context: string;
  age?: string;
  prerequisites?: string;
  videoUrl?: string;
  locations?: string[];
  maxStudents?: number;
  onlinePrice?: number | "free" | "custom";
};

export type OfferCategory = {
  id: string;
  title: string;
  icon: ElementType;
  description: string;
  items: CourseItem[];
};

export const OFFER_CATEGORIES: OfferCategory[] = [
  {
    id: "programs",
    title: "Core Programmes — Physical Cohorts (Jos)",
    icon: GraduationCap,
    description: "Cohort-based, AI-driven business training. Advanced programmes run Mon–Wed 8am–2pm; basics run Thu–Sat (morning + afternoon batches). 20 students per class. Each student gets a 1-on-1 mentor. Up to 3 classes can run at the same time during enrolment windows.",
    items: [
      { name: "Business Builders Academy", duration: "3 weeks", certificate: true, status: "active", age: "18+", locations: ["Jos (physical)", "Online"], maxStudents: 20, onlinePrice: 150000, whatYouGet: ["Find the business problem worth solving (using AI to research the market)", "Design the business — model, financials, operations — with AI as your analyst", "Pitch deck and one-pager built with AI", "1-on-1 mentor across the 3 weeks", "Hamzury HUB + Google Business Certificate"], context: "I am interested in Business Builders Academy. Please ask me screening questions to confirm fit for the next Jos cohort." },
      { name: "Digital Dominance", duration: "4 weeks", certificate: true, status: "active", age: "16+", locations: ["Jos (physical)", "Online"], maxStudents: 20, onlinePrice: 80000, whatYouGet: ["Social media growth across IG, TikTok, LinkedIn, X — using AI for content + analytics", "Video editing (CapCut + Premiere) — short-form, long-form, reels", "Recording basics — phone-first cinematography, lighting, audio", "Motion graphics + simple After Effects with AI assistants", "Personal branding + monetisation — turn views into income", "1-on-1 mentor across the 4 weeks", "Hamzury HUB + Google Digital Marketing Certificate"], context: "I am interested in Digital Dominance. Please ask me screening questions and share what to prepare." },
      { name: "Code Craft Bootcamp", duration: "8 weeks", certificate: true, status: "active", age: "16+", prerequisites: "Basic computer skills", locations: ["Jos (physical)", "Online"], maxStudents: 20, onlinePrice: 300000, whatYouGet: ["Build real businesses with AI — not vibe-coding, real product engineering", "Python + JavaScript fundamentals taught in service of products", "AI coding assistants (Cursor, Claude Code) used the right way", "Backend + database + deployment — your project goes live", "Capstone: ship a working AI-powered product", "1-on-1 mentor across the 8 weeks", "Hamzury HUB + Coursera Programming Certificate"], context: "I am interested in Code Craft Bootcamp. Please ask me screening questions about background." },
      { name: "Compliance Mastery", duration: "6 weeks", certificate: true, status: "active", age: "18+", locations: ["Jos (physical)", "Online"], maxStudents: 20, onlinePrice: 120000, whatYouGet: ["CAC registration + TIN — done with AI assistants for filings", "VAT, PAYE, Tax Clearance Certificates", "NAFDAC, PENCOM + industry licences", "Guest lectures from Bizdoc team", "1-on-1 mentor across the 6 weeks", "Professional Compliance Certificate"], context: "I am interested in Compliance Mastery. Please ask me screening questions about my role and need." },
      { name: "Data Analytics", duration: "6 weeks", certificate: true, status: "active", age: "18+", locations: ["Jos (physical)", "Online"], maxStudents: 20, onlinePrice: 130000, whatYouGet: ["Excel + Google Sheets — pivot tables, formulas, dashboards", "SQL fundamentals — query real business data", "Power BI / Looker Studio — visualisation and storytelling", "AI-assisted analysis — Claude / ChatGPT for fast insight", "Final project: a real business dashboard you can show", "1-on-1 mentor across the 6 weeks", "Hamzury HUB + Google Data Analytics Certificate"], context: "I am interested in Data Analytics. Please ask me screening questions about my background and goals." },
      { name: "MetFix Hardware & Robotics", duration: "8 weeks", certificate: true, status: "active", age: "16+", locations: ["Jos (physical)", "Online (simulations)"], maxStudents: 20, onlinePrice: 180000, whatYouGet: ["Laptop disassembly + hardware repair", "Arduino, circuits, sensors", "Robotics design + build with AI-assisted design", "Final competition", "1-on-1 mentor across the 8 weeks", "Hardware Engineering Certificate"], context: "I am interested in MetFix Hardware & Robotics. Please ask me whether I want the physical (₦180k) or online (₦80k) track and my background." },
      { name: "Cybersecurity & Networking", duration: "6 weeks", certificate: true, status: "coming", age: "16+", locations: ["Jos (physical)", "Online"], maxStudents: 20, onlinePrice: 130000, whatYouGet: ["IT support fundamentals — Windows + macOS + Linux", "Networking, Wi-Fi, routers, switches", "Cybersecurity basics — accounts, passwords, phishing, backups", "Cloud setup (Google Workspace, Microsoft 365)", "AI-assisted troubleshooting playbook", "1-on-1 mentor across the 6 weeks", "Hamzury HUB IT Certificate"], context: "I am interested in the Cybersecurity & Networking programme. Please ask me screening questions about my background." },
    ],
  },
  {
    id: "kids",
    title: "Kids Programme (8–15)",
    icon: Baby,
    description: "Thu–Sat, morning + afternoon batches. Age-appropriate, AI-aware tech education with weekly parent progress reports. 20 children per class.",
    items: [
      { name: "Beginner Tech Skills — Kids", duration: "2 weeks (Thu–Sat)", certificate: true, status: "active", age: "8–15", locations: ["Jos"], maxStudents: 20, onlinePrice: 25000, whatYouGet: ["Computer parts + keyboard + mouse skills", "MS Word + internet basics + online safety", "Intro to AI — what it is, how to use it safely", "Creative final project (document + presentation built with AI help)", "Weekly parent progress reports", "Hamzury HUB Beginner Certificate"], context: "I want to enrol my child in the Beginner Tech Skills kids programme. Please ask about my child's age and experience." },
      { name: "Kids Robotics & Build Club", duration: "4 weeks (Thu–Sat)", certificate: true, status: "active", age: "10–15", locations: ["Jos"], maxStudents: 20, onlinePrice: 60000, whatYouGet: ["Build their first robot — circuits, sensors, motors", "Block-based programming (Scratch + microcontroller blocks)", "Team challenges + final showcase", "Weekly parent progress reports", "Hamzury HUB Robotics Certificate (Kids)"], context: "I want to enrol my child in Kids Robotics & Build Club. Please ask about my child's age." },
      { name: "Kids Coding with AI", duration: "3 weeks (Thu–Sat)", certificate: true, status: "active", age: "10–15", locations: ["Jos"], maxStudents: 20, onlinePrice: 45000, whatYouGet: ["Make games + small apps with the help of AI assistants", "Logic, sequence, debugging — fundamentals for life", "Build something cool to show off — final showcase", "Weekly parent progress reports", "Hamzury HUB Junior Coder Certificate"], context: "I want to enrol my child in Kids Coding with AI. Please ask about my child's age and experience." },
    ],
  },
  {
    id: "internships",
    title: "Internships",
    icon: Briefcase,
    description: "Two paths into Hamzury: come as a HUB graduate on the placement-track, or come from your university on SIWES / Industrial Training. Start any month, stay 1–12 months. Real client work, real KPIs, real reviews.",
    items: [
      { name: "HUB Internship (placement-track)", duration: "1–12 months", certificate: true, status: "active", age: "18+", prerequisites: "Completed any HUB programme", locations: ["Jos (physical)"], maxStudents: 20, onlinePrice: 50000, whatYouGet: ["Placement inside Hamzury (Bizdoc / Scalar / Medialy / HUB / Studio)", "Flat ₦50,000 per month — pay only for the months you do, no discount", "Real client work, real KPIs, real reviews", "Stipend + transport allowance", "Performance-based offer at the end (junior staff role)", "1-on-1 mentor — your line manager"], context: "I want to apply for the Hamzury HUB Internship (placement-track). Please ask me which programme I completed and what role I want." },
      { name: "Higher-Institution Internship (SIWES / IT)", duration: "1–12 months", certificate: true, status: "active", age: "16+", prerequisites: "Letter from your university or polytechnic", locations: ["Jos (physical)"], maxStudents: 20, onlinePrice: 45000, whatYouGet: ["For students on SIWES / industrial training from universities and polytechnics", "Pricing: 1 mo ₦45k · 2 mo ₦80k · 3 mo ₦100k", "Each additional month adds ₦20k (4 mo ₦120k → 12 mo ₦280k)", "Real placement inside Hamzury (Bizdoc / Scalar / Medialy / HUB / Studio)", "Logbook signed + Hamzury HUB internship certificate at completion", "1-on-1 mentor — your line manager"], context: "I am a student on industrial training (SIWES / IT) from my school. Please ask for my school, course of study, required duration, and start date." },
    ],
  },
  {
    id: "online",
    title: "Online Academy — Solving Business with AI",
    icon: Monitor,
    description: "Self-paced LMS courses, all built around solving a business segment using AI. Video lessons, auto-graded quizzes, certificates, optional 1-on-1 mentor support (+₦10k).",
    items: [
      { name: "AI for Operations & Admin", duration: "2 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 20000, whatYouGet: ["Cut admin time with AI — emails, scheduling, summaries", "Automate routine tasks with Make.com + AI", "SOPs that write themselves", "Course completion certificate"], context: "I am interested in AI for Operations & Admin online." },
      { name: "AI for Sales & Customer Growth", duration: "3 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 25000, whatYouGet: ["Lead research with AI — find buyers fast", "Outreach scripts that convert", "CRM + pipeline automation", "Course completion certificate"], context: "I am interested in AI for Sales & Customer Growth online." },
      { name: "AI for Finance & Bookkeeping", duration: "3 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 25000, whatYouGet: ["AI-assisted bookkeeping + reconciliation", "Cash-flow + budgeting with AI", "Tax + compliance basics", "Course completion certificate"], context: "I am interested in AI for Finance & Bookkeeping online." },
      { name: "AI for Marketing & Content", duration: "4 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 35000, whatYouGet: ["Content engine — write, design, schedule with AI", "Brand voice + on-message creative", "Performance + A/B testing", "Course completion certificate"], context: "I am interested in AI for Marketing & Content online." },
      { name: "AI for HR & People Ops", duration: "3 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 25000, whatYouGet: ["AI-assisted hiring (JDs, screening, comms)", "Onboarding + training systems", "Performance reviews with AI summaries", "Course completion certificate"], context: "I am interested in AI for HR & People Ops online." },
      { name: "AI for Product & Strategy", duration: "4 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 35000, whatYouGet: ["Customer research + insights with AI", "Roadmaps + prioritisation", "Strategy memos + investor decks", "Course completion certificate"], context: "I am interested in AI for Product & Strategy online." },
      { name: "AI Tools Mastery (foundation)", duration: "2 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 15000, whatYouGet: ["ChatGPT + Claude for work — prompts that work", "Make.com + Zapier automation basics", "Daily-use AI image + video tools", "Course completion certificate"], context: "I am interested in AI Tools Mastery online." },
      // 2026-05-07 — Tool-specific deep-dives. Each course teaches ONE leading
      // model and how to use it to solve real problems / automate work.
      { name: "Anthropic Claude — Solve & Automate", duration: "2 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 18000, whatYouGet: ["Claude.ai prompting fundamentals — what makes Claude different", "Use Claude to solve real business problems (research, drafting, analysis)", "Claude Projects + system prompts for repeatable workflows", "Claude Code basics — pair with AI to write + ship code", "Automate document review, summaries, and decision support", "Hands-on capstone: build one Claude-powered workflow you'll actually use", "Course completion certificate"], context: "I am interested in Anthropic Claude — Solve & Automate. Please tell me what to prepare." },
      { name: "Google Gemini — Solve & Automate", duration: "2 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 18000, whatYouGet: ["Gemini in Google Workspace — Docs, Sheets, Gmail, Meet", "NotebookLM for research, briefs, and audio summaries", "Gemini for data — formulas, visualisation, AI-driven sheets", "Image + video generation with Imagen / Veo basics", "Automate Google-stack work — Drive triggers, Sheets formulas, Gmail drafts", "Hands-on capstone: a Gemini-powered Workspace automation", "Course completion certificate"], context: "I am interested in Google Gemini — Solve & Automate. Please tell me what to prepare." },
      { name: "OpenAI ChatGPT — Solve & Automate", duration: "2 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 18000, whatYouGet: ["ChatGPT prompting that consistently produces useful output", "Custom GPTs — build a private assistant for your business", "ChatGPT for code, content, analysis, and customer comms", "Connect to your data — file uploads, web browsing, code interpreter", "Automate with ChatGPT + Zapier / Make.com", "Hands-on capstone: ship one ChatGPT-powered tool that saves real hours", "Course completion certificate"], context: "I am interested in OpenAI ChatGPT — Solve & Automate. Please tell me what to prepare." },
    ],
  },
  {
    id: "enterprise",
    title: "Corporate — AI Solving Business Problems",
    icon: Briefcase,
    description: "Short, sharp, AI-driven training for teams. Maximum 1 week per engagement. Each cohort gets a dedicated 1-on-1 mentor and a real business problem to solve before they leave.",
    items: [
      { name: "Corporate Workshop (1–5 days)", duration: "Up to 1 week", certificate: true, status: "active", age: "Any", locations: ["Jos", "On-site (your office)", "Online"], onlinePrice: "custom", whatYouGet: ["AI applied to one segment of your business — pick: Ops, Sales, Marketing, Finance, HR, Product", "Real workshop, real outputs — your team leaves with a working AI solution", "1-on-1 mentor for the cohort", "Custom certification + executive briefing", "Follow-up 30-day check-in"], context: "I want a Corporate Workshop. Please ask which business segment we want AI to solve, team size, and dates." },
      { name: "Scholarship (Application)", duration: "Varies", certificate: true, status: "active", age: "Any", locations: ["Jos", "Online"], onlinePrice: "free", whatYouGet: ["Full or partial tuition coverage on any HUB programme", "Application-based — financial need + commitment", "Same programme + certificate as paid students", "1-on-1 mentor included"], context: "I want to apply for a HUB scholarship. Please tell me what to prepare." },
    ],
  },
];

export const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "#16A34A18", text: "#15803D" },
  next: { label: "Next Cohort", bg: "#B48C4C20", text: "#8B6914" },
  coming: { label: "Coming Soon", bg: "#1E3A5F10", text: "#1A1A1A66" },
};

/** All items flat — used by Calendar to derive cohort start events. */
export function flattenAllItems(): Array<{ category: string; item: CourseItem }> {
  return OFFER_CATEGORIES.flatMap(cat => cat.items.map(item => ({ category: cat.title, item })));
}
