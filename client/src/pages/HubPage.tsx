import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Users, GraduationCap, Star, Target, Monitor,
  Lightbulb, BookOpen, X, Loader2, Menu,
  Calendar, Clock, CheckCircle, MessageSquare, Eye, EyeOff,
  Award, Briefcase, ChevronRight, ChevronLeft, AlertCircle,
  Pin, ExternalLink, Wrench, Baby, MapPin, Play, Lock,
  CreditCard, UserCheck, Heart, Camera, Video, TrendingUp,
} from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";
import SplashScreen from "@/components/SplashScreen";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY HUB — /hub — Apple-standard design (was /skills)
   Renamed 2026-04: Skills → HUB. Structure + content kept identical.
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#1E3A5F";
const GOLD  = "#B48C4C";
const TEXT  = "#1A1A1A";
const BG    = "#FFFAF6";
const W     = "#FFFFFF";

// ── WHAT WE OFFER — 4 categories ──────────────────────────────────────────────
type CourseItem = {
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

type OfferCategory = {
  id: string;
  title: string;
  icon: typeof Users;
  description: string;
  items: CourseItem[];
};

const OFFER_CATEGORIES: OfferCategory[] = [
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

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "#16A34A18", text: "#15803D" },
  next: { label: "Next Cohort", bg: `${GOLD}20`, text: "#8B6914" },
  coming: { label: "Coming Soon", bg: `${DARK}10`, text: `${TEXT}66` },
};

// ── Sticky note colors — real sticky note pastel palette ─────────────────────
const STICKY_COLORS = [
  { bg: "#FFF9C4", border: "#F9E547", shadow: "#F9E54730" }, // yellow
  { bg: "#FCE4EC", border: "#F48FB1", shadow: "#F48FB130" }, // pink
  { bg: "#E8F5E9", border: "#81C784", shadow: "#81C78430" }, // green
  { bg: "#E3F2FD", border: "#64B5F6", shadow: "#64B5F630" }, // blue
  { bg: "#F3E5F5", border: "#CE93D8", shadow: "#CE93D830" }, // lavender
  { bg: "#FFF3E0", border: "#FFB74D", shadow: "#FFB74D30" }, // peach
];

// ── CALENDAR — hardcoded events, no API dependency ───────────────────────────
const CAL_COLORS = {
  cohort: "#2563EB",
  graduation: "#16A34A",
  project: "#EAB308",
  orientation: GOLD,
  executive: "#8B5CF6",
};

type CalEvent = {
  type: string;
  color: string;
  title: string;
  detail: string;
  chatContext: string;
};

/**
 * HUB 2026 Calendar — operational rhythm from PHASE7_HUB/CALENDAR/HUB_Calendar.ics
 *
 * Weekly cadence (not individual dates — shown as reference to students):
 *   Mon–Wed 8:00–10:30am · Main-programme teaching
 *   Mon–Wed 11:00am–2:00pm · Hall gathering (Entrepreneurship / Content / AI)
 *   Thu–Sat 8:00–10:30am · Kids programme
 *   Thu–Sat 11:00am–2:00pm · Kids hall gathering
 *
 * Monthly milestones (captured below):
 *   · 1st of every month — New Cohort Resumption (orientation)
 *   · First Monday of every month — Team Competition Challenge announced
 *     (Teams: AI · Cyber · Quantum · Robotics)
 *   · Mid-month — Programme-specific cohort starts
 *   · End of programme — Programme graduation
 */
const CALENDAR_EVENTS: Record<string, CalEvent[]> = {
  // ── APRIL 2026 ── (first Monday: 6th)
  "2026-04-06": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "April Cohort — Resumption & Orientation", detail: "New students start today. Welcome session + orientation for all April intakes across every programme.", chatContext: "I'd like to join the April cohort. Please tell me what to prepare." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of the month. New challenge released to all four teams — AI, Cyber, Quantum, Robotics.", chatContext: "Tell me about the HUB team competition and how I can join." },
  ],
  "2026-04-13": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Digital Dominance — New Cohort", detail: "4-week social media programme begins. ₦80,000. Mon–Wed 8am–2pm. Google Digital Marketing Certificate.", chatContext: "I want to enrol in Digital Dominance starting April 13th." }],
  "2026-04-20": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Data Analytics — New Cohort", detail: "6-week data analytics programme begins. ₦130,000. Excel, SQL, Power BI, AI-assisted analysis.", chatContext: "I want to enrol in Data Analytics starting April 20th." }],
  "2026-04-30": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Business Builders Graduation", detail: "3-week Business Builders Academy ends. Final pitches + Google Business Certificate.", chatContext: "When is the next Business Builders Academy cohort?" }],

  // ── MAY 2026 ── (first Monday: 4th)
  "2026-05-04": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "May Cohort — Resumption & Orientation", detail: "New students welcome + orientation. All programmes open for enrolment today.", chatContext: "I'd like to join the May cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. New challenge for AI · Cyber · Quantum · Robotics teams.", chatContext: "Tell me about the May team competition." },
    { type: "Classes Start", color: CAL_COLORS.cohort, title: "Code Craft Bootcamp Starts", detail: "8-week full-stack programme. ₦300,000. Build with AI — backend, frontend, ship a real product. Coursera Certificate.", chatContext: "I want to enrol in Code Craft Bootcamp starting May 4th." },
  ],
  "2026-05-11": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Compliance Mastery Starts", detail: "6-week programme with Bizdoc partnership. ₦120,000. CAC, tax, NAFDAC, PENCOM.", chatContext: "I want to enrol in Compliance Mastery." }],
  "2026-05-18": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "MetFix Hardware & Robotics", detail: "8-week hardware + robotics track. ₦180k physical / ₦80k online. Arduino, circuits, competition.", chatContext: "I want to enrol in MetFix Hardware & Robotics." }],
  "2026-05-28": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Digital Dominance Graduation", detail: "4-week cohort ends. Final social media showcase + certificate ceremony.", chatContext: "When is the next Digital Dominance cohort?" }],

  // ── JUNE 2026 ── (first Monday: 1st)
  "2026-06-01": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "June Cohort — Resumption & Orientation", detail: "New students start + orientation. Summer intakes open.", chatContext: "I'd like to join the June cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of June. New challenge released.", chatContext: "Tell me about the June team competition." },
  ],
  "2026-06-15": [{ type: "Project Start", color: CAL_COLORS.project, title: "Code Craft — Web Development Block", detail: "Code Craft students enter the HTML/CSS/JS block. Portfolio site is due by end of block.", chatContext: "Tell me more about Code Craft Bootcamp." }],
  "2026-06-22": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Compliance Mastery Graduation", detail: "6-week programme ends. Students graduate with full compliance roadmap + Professional Compliance Certificate.", chatContext: "When is the next Compliance Mastery cohort?" }],
  "2026-06-29": [{ type: "Project Start", color: CAL_COLORS.project, title: "Team Competition Mid-Year Judging", detail: "All four teams present Q2 challenge outputs. Awards, points, team photos.", chatContext: "Tell me about the team competition mid-year judging." }],

  // ── JULY 2026 ── (first Monday: 6th)
  "2026-07-06": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "July Cohort — Resumption & Orientation", detail: "New students welcome. All programmes open for July intake.", chatContext: "I'd like to join the July cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. New month, new challenge.", chatContext: "Tell me about the July team competition." },
  ],
  "2026-07-13": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "MetFix Physical Track", detail: "Physical MetFix Hardware cohort begins at HUB workshop. ₦180,000. Abuja only.", chatContext: "I want to enrol in MetFix physical track." }],
  "2026-07-20": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Business Builders Academy", detail: "3-week business foundations programme. ₦150,000. Google Business Certificate.", chatContext: "I want to enrol in Business Builders Academy." }],
  "2026-07-27": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Code Craft Mid-Point Review", detail: "Week 6 milestone. Students present portfolio sites for peer + instructor review.", chatContext: "Tell me about the Code Craft mid-point review." }],

  // ── AUGUST 2026 ── (first Monday: 3rd)
  "2026-08-03": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "August Cohort — Resumption & Orientation", detail: "New students orientation + welcome.", chatContext: "I'd like to join the August cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. August challenge released.", chatContext: "Tell me about the August team competition." },
  ],
  "2026-08-10": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Kids Programme — August Cohort", detail: "Basic Computer Skills (Kids, 8–15). Thu–Sat, 2 weeks. ₦25,000.", chatContext: "I want to enrol my child in the August kids programme." }],
  "2026-08-17": [{ type: "Project Start", color: CAL_COLORS.project, title: "MetFix Robotics Build", detail: "MetFix students begin robot design + programming phase.", chatContext: "Tell me about MetFix robotics." }],
  "2026-08-31": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Data Analytics Graduation", detail: "Students present their final business dashboards. Hamzury HUB + Google Data Analytics Certificate.", chatContext: "When is the next Data Analytics cohort?" }],

  // ── SEPTEMBER 2026 ── (first Monday: 7th)
  "2026-09-07": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "September Cohort — Resumption & Orientation", detail: "New students orientation. Back-to-school intake — extra capacity.", chatContext: "I'd like to join the September cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. New challenge.", chatContext: "Tell me about the September team competition." },
  ],
  "2026-09-21": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "MetFix + Robotics Graduation", detail: "8-week programme ends. Robot showcase + Hardware Engineering Certificate.", chatContext: "When is the next MetFix cohort?" }],
  "2026-09-28": [{ type: "Project Start", color: CAL_COLORS.project, title: "Q3 Team Competition Finals", detail: "All four teams compete. Annual rankings updated.", chatContext: "Tell me about Q3 team competition finals." }],

  // ── OCTOBER 2026 ── (first Monday: 5th)
  "2026-10-05": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "October Cohort — Resumption & Orientation", detail: "New students welcome. Q4 intakes open.", chatContext: "I'd like to join the October cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of October.", chatContext: "Tell me about the October team competition." },
  ],
  "2026-10-19": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Final 2026 Digital Dominance Cohort", detail: "Last Digital Dominance cohort of 2026. 4 weeks.", chatContext: "I want to join the final 2026 Digital Dominance cohort." }],
  "2026-10-26": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Code Craft Bootcamp Graduation", detail: "8-week full-stack programme ends. Final project demo day + Coursera Certificate.", chatContext: "When is the next Code Craft Bootcamp?" }],

  // ── NOVEMBER 2026 ── (first Monday: 2nd)
  "2026-11-02": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "November Cohort — Resumption & Orientation", detail: "Final standard intakes of 2026.", chatContext: "I'd like to join the November cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of November.", chatContext: "Tell me about the November team competition." },
  ],
  "2026-11-16": [{ type: "Project Start", color: CAL_COLORS.project, title: "Year-End Project Phase", detail: "All ongoing programmes enter capstone project phase. Market-ready deliverables.", chatContext: "Tell me about the year-end project phase." }],
  "2026-11-30": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "November Programme Graduations", detail: "Digital Dominance, Data Analytics, Kids programme graduations + certificate ceremony.", chatContext: "Tell me about November graduations." }],

  // ── DECEMBER 2026 ── (first Monday: 7th)
  "2026-12-07": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "December Cohort — Resumption & Orientation", detail: "Last cohort of 2026. Short-run programmes only (Digital Dominance, Data Analytics, Online Academy).", chatContext: "I'd like to join the December cohort — last chance in 2026." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition — Year-End Championship", detail: "Annual team championship begins.", chatContext: "Tell me about the year-end team competition championship." },
  ],
  "2026-12-14": [{ type: "Executive", color: CAL_COLORS.executive, title: "Year-End Workshop + Showcase (2 Days)", detail: "All 2026 students gather. Team championship finals, project showcase, pitching, 2027 planning. The biggest event of the year.", chatContext: "Tell me about the year-end workshop and showcase in December." }],
  "2026-12-21": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "2027 Early Bird Orientation", detail: "Preview 2027 programmes. Early registrants get priority placement + 10% discount.", chatContext: "I'd like to attend the 2027 Early Bird Orientation." }],
};

const CALENDAR_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthGrid(year: number, month: number) {
  // Week starts on Monday: shift Sunday (0) to the end so 0=Mon, 6=Sun.
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const pad = (n: number) => String(n).padStart(2, "0");
  const cells: { day: number; isCurrentMonth: boolean; key: string }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      const d = daysInPrev - firstDay + 1 + i;
      const m = month - 1 < 0 ? 11 : month - 1;
      const y = month - 1 < 0 ? year - 1 : year;
      cells.push({ day: d, isCurrentMonth: false, key: `${y}-${pad(m + 1)}-${pad(d)}` });
    } else if (i - firstDay >= daysInMonth) {
      const d = i - firstDay - daysInMonth + 1;
      const m = month + 1 > 11 ? 0 : month + 1;
      const y = month + 1 > 11 ? year + 1 : year;
      cells.push({ day: d, isCurrentMonth: false, key: `${y}-${pad(m + 1)}-${pad(d)}` });
    } else {
      const d = i - firstDay + 1;
      cells.push({ day: d, isCurrentMonth: true, key: `${year}-${pad(month + 1)}-${pad(d)}` });
    }
  }
  return cells;
}

function CalendarSection() {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();
  const [activeMonth, setActiveMonth] = useState(() => {
    // Default to current month if 2026, otherwise April
    return currentYear === 2026 ? currentMonth : 3;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const isPastMonth = (m: number) => currentYear > 2026 || (currentYear === 2026 && m < currentMonth);

  const cells = buildMonthGrid(2026, activeMonth);
  const todayKey = (() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  })();

  const selectedEvents = selectedDate ? CALENDAR_EVENTS[selectedDate] ?? [] : [];

  /** HUB has no AI chat — all "contact" CTAs route to the enrolment form. */
  const openChat = (_context: string) => {
    window.location.href = "/hub/enroll";
  };

  const legendItems = [
    { label: "Cohort / Classes", color: CAL_COLORS.cohort },
    { label: "Graduation", color: CAL_COLORS.graduation },
    { label: "Project Start", color: CAL_COLORS.project },
    { label: "Orientation", color: CAL_COLORS.orientation },
    { label: "Executive", color: CAL_COLORS.executive },
  ];

  const monthEventCount = (m: number) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const prefix = `2026-${pad(m + 1)}-`;
    return Object.keys(CALENDAR_EVENTS).filter(k => k.startsWith(prefix)).length;
  };

  return (
    <section id="calendar" className="py-24 md:py-32 px-6" style={{ backgroundColor: W }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>CALENDAR</p>
        <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-6 text-center tracking-tight" style={{ color: TEXT }}>What's happening & when.</h2>
        <p className="text-[13px] text-center mb-12 max-w-md mx-auto" style={{ color: `${TEXT}55` }}>Click any highlighted date to see details.</p>

        {/* Month strip — horizontal scroll on mobile, centered on desktop */}
        {/* 3-month rolling strip with prev / next chevrons */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => { setActiveMonth(m => Math.max(0, m - 1)); setSelectedDate(null); }}
            disabled={activeMonth <= 0}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:bg-black/5"
            style={{ color: TEXT }}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-1 rounded-full p-1" style={{ backgroundColor: `${DARK}06` }}>
            {(() => {
              // Show a 3-month window centered on activeMonth, clamped to [0, 11].
              let start = Math.max(0, Math.min(activeMonth - 1, 9));
              const window = [start, start + 1, start + 2];
              return window.map(m => {
                const isActive = m === activeMonth;
                const evCount = monthEventCount(m);
                const past = isPastMonth(m);
                return (
                  <button
                    key={m}
                    onClick={() => { setActiveMonth(m); setSelectedDate(null); }}
                    className="relative flex flex-col items-center justify-center transition-all duration-200"
                    style={{
                      width: 64,
                      height: 44,
                      backgroundColor: isActive ? DARK : "transparent",
                      color: isActive ? W : past ? `${TEXT}30` : TEXT,
                      borderRadius: 999,
                    }}
                  >
                    <span className="text-[12px] font-semibold tracking-wide">{MONTH_SHORT[m]}</span>
                    {evCount > 0 && (
                      <div className="flex gap-[2px] mt-0.5">
                        {Array.from({ length: Math.min(evCount, 4) }).map((_, i) => (
                          <div key={i} className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: isActive ? GOLD : past ? `${TEXT}20` : CAL_COLORS.cohort }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              });
            })()}
          </div>

          <button
            onClick={() => { setActiveMonth(m => Math.min(11, m + 1)); setSelectedDate(null); }}
            disabled={activeMonth >= 11}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:bg-black/5"
            style={{ color: TEXT }}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="rounded-[20px] overflow-hidden relative" style={{ backgroundColor: BG, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DARK}08` }}>
            <h3 className="text-[20px] font-medium tracking-tight text-center" style={{ color: DARK }}>{MONTH_NAMES[activeMonth]} 2026</h3>
          </div>

          <div className="grid grid-cols-7 px-4 pt-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
              <div key={i} className="text-center text-[11px] font-medium pb-3" style={{ color: `${TEXT}44` }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-4 pb-4 gap-1">
            {cells.map((cell, i) => {
              const events = CALENDAR_EVENTS[cell.key] || [];
              const hasEvents = events.length > 0;
              const isToday = cell.key === todayKey;
              const isSelected = cell.key === selectedDate;
              const eventColor = hasEvents ? events[0].color : undefined;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (hasEvents) setSelectedDate(isSelected ? null : cell.key);
                    else setSelectedDate(null);
                  }}
                  className="relative flex flex-col items-center py-2.5 md:py-3.5 rounded-xl transition-all duration-200"
                  style={{
                    cursor: hasEvents ? "pointer" : "default",
                    backgroundColor: isSelected ? `${eventColor}15` : hasEvents && cell.isCurrentMonth ? `${eventColor}08` : "transparent",
                    border: isSelected ? `2px solid ${eventColor}40` : "2px solid transparent",
                  }}
                >
                  <span
                    className="text-[13px] md:text-[15px] leading-none"
                    style={{
                      color: !cell.isCurrentMonth ? `${TEXT}18` : isToday ? GOLD : hasEvents ? eventColor : TEXT,
                      fontWeight: isToday ? 800 : hasEvents ? 700 : 400,
                    }}
                  >
                    {cell.day}
                  </span>
                  {isToday && cell.isCurrentMonth && <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: GOLD }} />}
                  {hasEvents && cell.isCurrentMonth && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {events.map((ev, j) => <div key={j} className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: ev.color }} />)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-6 py-4" style={{ borderTop: `1px solid ${DARK}08` }}>
            {legendItems.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[11px]" style={{ color: `${TEXT}66` }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Apple-standard event detail overlay */}
          {selectedDate && selectedEvents.length > 0 && (
            <CalendarEventModal
              date={selectedDate}
              events={selectedEvents}
              onClose={() => setSelectedDate(null)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

// ── CALENDAR EVENT MODAL — Apple-standard ─────────────────────────────────────
function CalendarEventModal({
  date,
  events,
  onClose,
}: {
  date: string;
  events: { type: string; color: string; title: string; detail: string; chatContext: string }[];
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const ev = events[0];
  const fullDate = new Date(date + "T00:00:00").toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-4 z-10"
      style={{ backgroundColor: "rgba(20,20,30,0.45)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[24px] w-full max-w-md overflow-hidden"
        style={{ backgroundColor: W, boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1.5" style={{ color: ev.color }}>
              {ev.type}
            </p>
            <p className="text-[12px] font-medium" style={{ color: `${TEXT}66` }}>{fullDate}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 flex-shrink-0"
            aria-label="Close"
          >
            <X size={16} style={{ color: `${TEXT}66` }} />
          </button>
        </div>

        {/* Title + summary */}
        <div className="px-7 pb-6">
          <h3 className="text-[24px] md:text-[26px] font-light leading-[1.2] tracking-tight mb-3" style={{ color: TEXT }}>
            {ev.title}
          </h3>
          <p className="text-[14px] leading-[1.6]" style={{ color: TEXT, opacity: 0.6 }}>
            {ev.detail}
          </p>
        </div>

        {/* Inline Learn-more expansion */}
        <div
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{
            maxHeight: expanded ? 320 : 0,
            opacity: expanded ? 1 : 0,
          }}
        >
          <div className="px-7 pb-6">
            <div className="rounded-2xl p-5" style={{ backgroundColor: `${ev.color}08`, border: `1px solid ${ev.color}22` }}>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: ev.color }}>WHAT TO EXPECT</p>
              <ul className="space-y-2.5">
                {[
                  "20-student cohort with a dedicated 1-on-1 mentor.",
                  "Mon–Wed 8–2 (advanced) or Thu–Sat (basics) at the Jos campus, or fully online.",
                  "₦10,000 secures your seat — or apply with a scholarship code.",
                  "Hamzury HUB certificate plus a partner certificate on completion.",
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.6]" style={{ color: TEXT, opacity: 0.75 }}>
                    <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-7 pb-7 flex flex-col gap-2.5" style={{ borderTop: `1px solid ${TEXT}08`, paddingTop: 20 }}>
          <Link href="/hub/enroll">
            <span
              className="w-full py-3.5 rounded-full text-[14px] font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
              style={{ backgroundColor: DARK, color: GOLD }}
            >
              Book your seat <ArrowRight size={14} />
            </span>
          </Link>
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-full py-3 rounded-full text-[13px] font-medium transition-colors hover:bg-black/5"
            style={{ color: TEXT, opacity: 0.7 }}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Learn more"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STICKY NOTE COMPONENT — handwritten style, real sticky colors ─────────────
function StickyNote({
  item,
  stickyColor,
  onClose,
  openChat,
}: {
  item: CourseItem;
  stickyColor: typeof STICKY_COLORS[0];
  onClose: () => void;
  openChat: (ctx: string) => void;
}) {
  const badge = STATUS_BADGE[item.status];
  const isNextOnly = item.status === "next" || item.status === "active";
  const enrollLabel = item.status === "active" ? "Enroll — Next Cohort" : "Enroll — Next Cohort";

  return (
    <div
      className="relative transition-all duration-300 sticky-enter"
      style={{
        backgroundColor: W,
        borderRadius: 20,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 36px rgba(20,20,30,0.10)",
        minWidth: 280,
        maxWidth: 320,
        overflow: "hidden",
        border: `1px solid ${TEXT}08`,
      }}
    >
      {/* Apple Notes-style accent strip */}
      <div className="h-1.5" style={{ backgroundColor: stickyColor.border }} />

      {/* Close */}
      <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/5" title="Close">
        <X size={14} style={{ color: `${TEXT}55` }} />
      </button>

      <div className="p-5">
        <h4 className="text-[17px] font-semibold tracking-tight mb-2 pr-6" style={{ color: TEXT, letterSpacing: "-0.01em" }}>{item.name}</h4>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.text }}>{badge.label}</span>
          {item.duration && <span className="text-[12px]" style={{ color: `${TEXT}66` }}>{item.duration}</span>}
        </div>

        {/* Online price */}
        {item.onlinePrice != null && (
          <p className="text-[12px] font-sans font-medium mb-2" style={{ color: GOLD }}>
            <CreditCard size={11} className="inline mr-1" />
            {item.onlinePrice === "free"
              ? "Free online"
              : item.onlinePrice === "custom"
                ? "Custom pricing"
                : `From \u20A6${item.onlinePrice.toLocaleString()} online`}
          </p>
        )}

        {/* Age */}
        {item.age && (
          <p className="text-[13px] mb-1" style={{ color: `${TEXT}88` }}>
            <span className="font-sans text-[10px] font-medium uppercase tracking-wide" style={{ color: `${TEXT}55` }}>Age: </span>{item.age}
          </p>
        )}

        {/* Prerequisites */}
        {item.prerequisites && (
          <div className="flex items-start gap-1.5 mb-2 p-2 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
            <Lock size={12} className="shrink-0 mt-0.5" style={{ color: `${TEXT}55` }} />
            <p className="text-[11px] font-sans" style={{ color: `${TEXT}77` }}>Requires: {item.prerequisites}</p>
          </div>
        )}

        {/* Locations */}
        {item.locations && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <MapPin size={11} style={{ color: `${TEXT}55` }} />
            {item.locations.map(loc => (
              <span key={loc} className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.06)", color: `${TEXT}77` }}>{loc}</span>
            ))}
          </div>
        )}

        {/* Limited seats */}
        {item.maxStudents && (
          <p className="text-[11px] font-sans mb-2" style={{ color: `${TEXT}66` }}>
            <UserCheck size={11} className="inline mr-1" />
            Limited to {item.maxStudents} students per cohort
          </p>
        )}

        {/* What you get */}
        {item.whatYouGet && (
          <div className="space-y-1 mb-3">
            {item.whatYouGet.map((g, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle size={11} className="shrink-0 mt-0.5" style={{ color: stickyColor.border }} />
                <span className="text-[12px]" style={{ color: `${TEXT}88` }}>{g}</span>
              </div>
            ))}
          </div>
        )}

        {item.certificate && (
          <p className="text-[11px] font-sans mb-3" style={{ color: `${TEXT}55` }}>
            <Award size={11} className="inline mr-1" /> Certificate included
          </p>
        )}

        {/* Action buttons */}
        <div className="space-y-2 font-sans">
          {item.videoUrl && (
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-full text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: `${TEXT}06`, color: TEXT }}
            >
              <Play size={12} /> Watch Video
            </a>
          )}
          {item.status === "coming" ? (
            <button
              disabled
              className="w-full py-3 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
              style={{ backgroundColor: `${TEXT}10`, color: `${TEXT}55` }}
            >
              Coming Soon
            </button>
          ) : (
            <Link href="/hub/enroll">
              <span
                className="w-full py-3 rounded-full text-[13px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: "#16A34A", color: W }}
              >
                <span style={{ fontSize: 15, lineHeight: 1 }}>🪑</span> Book a seat
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HOW IT WORKS — horizontal minimal icons, click to expand ─────────────────
function HowItWorks() {
  const [open, setOpen] = useState<number | null>(null);

  const STEPS = [
    { icon: Pin,        t: "Apply",    b: "Three-minute form. We reply on WhatsApp." },
    { icon: CreditCard, t: "Hold",     b: "₦10,000 or scholarship code locks your seat." },
    { icon: GraduationCap, t: "Learn", b: "Twenty per class. Mentor included." },
    { icon: Award,      t: "Graduate", b: "HUB + partner certificate. Lifetime alumni." },
  ];

  const RULES = [
    { icon: MapPin,     t: "Where",    b: "Jos active. Abuja 2027. Online global." },
    { icon: Calendar,   t: "When",     b: "Mon–Wed 8–2 for advanced. Thu–Sat for basics." },
    { icon: Users,      t: "Size",     b: "Twenty per class. No more." },
    { icon: Briefcase,  t: "Stack",    b: "Up to three programmes in parallel." },
    { icon: UserCheck,  t: "Mentor",   b: "One mentor. Weekly check-ins." },
    { icon: Lightbulb,  t: "AI-first", b: "Build with AI. Ship real outcomes." },
  ];

  const renderRow = (items: typeof STEPS, prefix: string) => (
    <div className="overflow-x-auto -mx-6 px-6 pb-2 scrollbar-hide">
      <div className="flex items-start gap-2 md:gap-3 min-w-max md:min-w-0 md:justify-center md:flex-wrap">
        {items.map((it, i) => {
          const key = `${prefix}-${i}`;
          const isOpen = open === i && open !== null && (prefix === "step" ? i < STEPS.length : i >= STEPS.length);
          // simpler: use prefix-aware open key
          return null;
        })}
      </div>
    </div>
  );
  void renderRow; // discard helper, we'll inline render below

  return (
    <section id="rules" className="py-24 md:py-32 px-6" style={{ backgroundColor: BG }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14 md:mb-16">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-5" style={{ color: GOLD }}>HOW IT WORKS</p>
          <h2 className="text-[clamp(32px,5vw,52px)] font-light leading-[1.05] tracking-tight mb-4" style={{ color: TEXT }}>
            From application <span style={{ color: DARK }}>to certificate.</span>
          </h2>
          <p className="text-[14px]" style={{ color: TEXT, opacity: 0.55 }}>Tap an icon to expand.</p>
        </div>

        {/* Steps row */}
        <IconRow items={STEPS} group="step" />

        {/* Divider */}
        <div className="mt-16 mb-12 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ backgroundColor: `${DARK}12` }} />
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>FINE PRINT</p>
          <div className="flex-1 h-px" style={{ backgroundColor: `${DARK}12` }} />
        </div>

        {/* Rules row */}
        <IconRow items={RULES} group="rule" />

        {/* Offices */}
        <div className="mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${DARK}10` }}>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>OFFICES</p>
          <div className="flex flex-wrap justify-center gap-6 text-[13px]">
            {[
              { city: "Jos",    state: "active", color: "#16A34A" },
              { city: "Online", state: "active", color: "#16A34A" },
              { city: "Abuja",  state: "2027",   color: GOLD },
            ].map((o) => (
              <div key={o.city} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.color }} />
                <span className="font-medium" style={{ color: TEXT }}>{o.city}</span>
                <span style={{ color: TEXT, opacity: 0.45 }}>{o.state}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconRow({ items, group }: { items: { icon: typeof Users; t: string; b: string }[]; group: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {/* Horizontal icon strip */}
      <div className="flex items-start justify-center gap-1 md:gap-2 overflow-x-auto -mx-6 px-6 pb-1 scrollbar-hide">
        {items.map((it, i) => {
          const Icon = it.icon;
          const isOpen = open === i;
          return (
            <button
              key={`${group}-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all flex-shrink-0"
              style={{
                backgroundColor: isOpen ? `${GOLD}14` : "transparent",
              }}
              aria-expanded={isOpen}
            >
              <div
                className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isOpen ? DARK : `${DARK}08`,
                  color: isOpen ? GOLD : DARK,
                }}
              >
                <Icon size={18} strokeWidth={1.6} />
              </div>
              <span className="text-[11px] md:text-[12px] font-medium tracking-tight" style={{ color: isOpen ? DARK : `${TEXT}88` }}>
                {it.t}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inline expand */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: open !== null ? 200 : 0,
          opacity: open !== null ? 1 : 0,
          marginTop: open !== null ? 16 : 0,
        }}
      >
        {open !== null && (
          <div className="max-w-md mx-auto text-center px-6 py-5 rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${DARK}10` }}>
            <p className="text-[15px] leading-relaxed" style={{ color: TEXT, opacity: 0.8 }}>
              {items[open].b}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function HubPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [pinnedItems, setPinnedItems] = useState<CourseItem[]>([]);

  // Track
  const myUpdateRef = useRef<HTMLElement>(null);
  const [trackRef, setTrackRef] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.skills.trackApplication.useQuery(
    { ref: trackRef.trim().toUpperCase() },
    { enabled: false, retry: false }
  );
  function handleTrack() {
    if (trackRef.trim().length < 4) return;
    setTrackSubmitted(true);
    trackQuery.refetch();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const STATUS_LABELS: Record<string, string> = {
    submitted: "Application received",
    under_review: "Under review",
    accepted: "Accepted. Check your email",
    waitlisted: "Waitlisted. We'll notify you",
    rejected: "Not accepted this cycle",
  };

  /** HUB has no AI chat — all CTAs route to the enrolment form. */
  const openChat = (_context: string) => {
    window.location.href = "/hub/enroll";
  };

  const togglePin = (item: CourseItem) => {
    if (pinnedItems.find(p => p.name === item.name)) {
      setPinnedItems(prev => prev.filter(p => p.name !== item.name));
    } else {
      setPinnedItems(prev => [...prev, item]);
    }
  };

  const unpinItem = (name: string) => {
    setPinnedItems(prev => prev.filter(p => p.name !== name));
  };

  const catColors: Record<string, string> = {
    programs: DARK,
    kids: "#F97316",
    online: "#2563EB",
    enterprise: "#059669",
    access: "#7C3AED",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <SplashScreen text="HAMZURY" color={DARK} departmentName="HUB" tagline="Learn what actually works." />
      <PageMeta
        title="HUB — Tech Training | HAMZURY"
        description="Learn what actually works. AI-driven programmes in business, code, data, marketing and compliance — with international certification and placement support."
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
        .sticky-board { scrollbar-width: none; -ms-overflow-style: none; }
        .sticky-board::-webkit-scrollbar { display: none; }
        @keyframes sticky-in {
          0% { opacity: 0; transform: scale(0.85) rotate(-3deg); }
          70% { transform: scale(1.03) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .sticky-enter { animation: sticky-in 0.35s ease-out forwards; }
        @keyframes pin-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <Link href="/hub">
            <span className="text-[13px] tracking-[4px] font-light uppercase cursor-pointer hover:opacity-70 transition-opacity" style={{ color: TEXT }}>HAMZURY HUB</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(p => !p)} className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70" style={{ color: TEXT }} aria-label="Menu">
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl" style={{ backgroundColor: W }} onClick={() => setMobileMenuOpen(false)}>
              {[
                { label: "Programmes",         action: () => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Calendar",           action: () => document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Cohort Rules",       action: () => document.getElementById("rules")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Verify Certificate", action: () => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" }) },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer"
                  style={{ color: TEXT }}
                >
                  {item.label}
                </button>
              ))}
              <Link href="/startup">
                <span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>
                  Startup
                </span>
              </Link>
              <Link href="/alumni">
                <span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>
                  Alumni
                </span>
              </Link>
              <Link href="/milestones">
                <span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>
                  Milestones
                </span>
              </Link>
              <Link href="/partner">
                <span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>
                  Partner with us
                </span>
              </Link>
              <Link href="/feedback">
                <span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>
                  Feedback
                </span>
              </Link>
              <Link href="/hub/enroll">
                <span className="block mx-2 mt-2 px-4 py-3 rounded-xl text-[13px] font-semibold text-center cursor-pointer" style={{ backgroundColor: DARK, color: GOLD }}>
                  Enrol now →
                </span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-[85vh] flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[clamp(32px,6vw,54px)] font-light leading-[1.05] tracking-tight mb-6" style={{ color: TEXT }}>
            Learn what{" "}<span style={{ color: DARK }}>actually works.</span>
          </h1>
          <div className="flex flex-wrap gap-3 justify-center mt-12 mb-8">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: DARK, color: GOLD }}
            >
              Programmes
            </button>
            <button
              onClick={() => document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: GOLD, border: `1px solid ${GOLD}40` }}
            >
              Calendar
            </button>
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER — inline accordion, click item = pin ── */}
      <section id="services" className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>WHAT WE OFFER</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-4 text-center tracking-tight" style={{ color: TEXT }}>Pick what interests you.</h2>
          <p className="text-[13px] text-center mb-12 max-w-lg mx-auto" style={{ color: `${TEXT}55` }}>
            Click a category to expand. Tap any course to pin it as a sticky note on your screen.
          </p>

          <div className="space-y-3">
            {OFFER_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isOpen = expandedCat === cat.id;
              const color = catColors[cat.id];
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ backgroundColor: BG, border: `1px solid ${isOpen ? color : DARK}${isOpen ? "25" : "08"}` }}>
                  {cat.id === "hals" ? (
                    <Link href="/hub">
                      <span
                        className="w-full flex items-center justify-between px-6 py-5 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
                            <Icon size={18} style={{ color }} />
                          </div>
                          <div className="text-left">
                            <h3 className="text-[15px] font-medium" style={{ color: TEXT }}>{cat.title}</h3>
                            <p className="text-[11px]" style={{ color: `${TEXT}44` }}>Online portal & courses</p>
                          </div>
                        </div>
                        <ArrowRight size={18} style={{ color: `${TEXT}44` }} />
                      </span>
                    </Link>
                  ) : (
                  <button
                    onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                    className="w-full flex items-center justify-between px-6 py-5 transition-all"
                    style={{ backgroundColor: isOpen ? `${color}08` : "transparent" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isOpen ? color : `${DARK}08` }}>
                        <Icon size={18} style={{ color: isOpen ? W : DARK }} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-[15px] font-medium" style={{ color: TEXT }}>{cat.title}</h3>
                        <p className="text-[11px]" style={{ color: `${TEXT}44` }}>{cat.items.length} options</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="transition-transform duration-300" style={{ color: `${TEXT}44`, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }} />
                  </button>
                  )}

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <p className="text-[12px] mb-5" style={{ color: `${TEXT}55` }}>{cat.description}</p>
                      <div className="space-y-2">
                        {cat.items.map(item => {
                          const badge = STATUS_BADGE[item.status];
                          const isPinned = pinnedItems.some(p => p.name === item.name);
                          return (
                            <button
                              key={item.name}
                              onClick={() => togglePin(item)}
                              className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-sm text-left"
                              style={{
                                backgroundColor: isPinned ? `${color}08` : W,
                                border: `1px solid ${isPinned ? color : DARK}${isPinned ? "25" : "06"}`,
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[13px] font-medium" style={{ color: TEXT }}>{item.name}</span>
                                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.text }}>{badge.label}</span>
                                  {item.prerequisites && (
                                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ backgroundColor: `${TEXT}08`, color: `${TEXT}55` }}>
                                      <Lock size={8} /> Requires prior course
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {item.duration && <span className="text-[10px]" style={{ color: `${TEXT}44` }}>{item.duration}</span>}
                                  {item.certificate && <span className="text-[10px]" style={{ color: `${TEXT}44` }}>Certificate</span>}
                                  {item.age && <span className="text-[10px]" style={{ color: `${TEXT}44` }}>Age: {item.age}</span>}
                                  {item.maxStudents && <span className="text-[10px]" style={{ color: `${TEXT}44` }}>{item.maxStudents} seats</span>}
                                </div>
                              </div>
                              <div className="ml-3 shrink-0">
                                {isPinned ? (
                                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>Pinned</span>
                                ) : (
                                  <Pin size={14} style={{ color: `${TEXT}33` }} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FLOATING PINNED STICKY NOTES ── */}
      {pinnedItems.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3 items-end max-h-[70vh] overflow-y-auto sticky-board">
          {pinnedItems.map((item, idx) => {
            const stickyColor = STICKY_COLORS[idx % STICKY_COLORS.length];
            return (
              <StickyNote
                key={item.name}
                item={item}
                stickyColor={stickyColor}
                onClose={() => unpinItem(item.name)}
                openChat={openChat}
              />
            );
          })}
        </div>
      )}

      {/* ── HOW IT WORKS — horizontal minimal icons, click to expand ── */}
      <HowItWorks />


      {/* ── CALENDAR ── */}
      <CalendarSection />

      {/* ── PARTNERS — single slim strip ── */}
      <section className="py-6 px-6" style={{ backgroundColor: W, borderTop: `1px solid ${DARK}08`, borderBottom: `1px solid ${DARK}08` }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD }}>PARTNERS</span>
          <span className="hidden md:inline-block w-px h-3" style={{ backgroundColor: `${TEXT}15` }} />
          {["Plan Aid Academy", "RIDI", "NITDA", "METFIX"].map((p) => (
            <span key={p} className="text-[12px] font-medium tracking-wide" style={{ color: `${TEXT}70` }}>{p}</span>
          ))}
          <span className="hidden md:inline-block w-px h-3" style={{ backgroundColor: `${TEXT}15` }} />
          <Link href="/partner"><span className="text-[12px] font-medium cursor-pointer" style={{ color: DARK }}>Partner with us →</span></Link>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section id="track" ref={myUpdateRef} className="py-24 md:py-32" style={{ backgroundColor: BG }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>TRACK</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-3" style={{ color: TEXT }}>Verify &amp; Track</h2>
          <p className="text-[13px] mb-10" style={{ color: TEXT, opacity: 0.45 }}>Verify a certificate or track your application status with your reference number.</p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={trackRef}
              onChange={e => {
                let raw = e.target.value.replace(/[^0-9]/g, "");
                if (raw.length > 8) raw = raw.slice(0, 8);
                let formatted = "HMZ-";
                if (raw.length > 0) formatted += raw.slice(0, 2);
                if (raw.length > 2) formatted += "/" + raw.slice(2, 3);
                if (raw.length > 3) formatted += "-" + raw.slice(3);
                setTrackRef(formatted);
                setTrackSubmitted(false);
              }}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="HMZ-26/3-XXXX"
              className="flex-1 px-5 py-3.5 rounded-full text-[14px] font-mono outline-none"
              style={{ backgroundColor: `${TEXT}05`, color: TEXT }}
            />
            <button
              onClick={handleTrack}
              disabled={trackRef.trim().length < 4 || trackQuery.isFetching}
              className="px-6 py-3.5 rounded-full text-[13px] font-medium transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: DARK, color: BG }}
            >
              {trackQuery.isFetching ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {trackQuery.isFetching ? "..." : "Check"}
            </button>
          </div>

          {trackSubmitted && !trackQuery.isFetching && (
            <div>
              {trackQuery.data?.found ? (
                <div className="rounded-[20px] p-6 text-left" style={{ backgroundColor: W, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono" style={{ color: TEXT, opacity: 0.35 }}>{trackQuery.data.ref}</span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ backgroundColor: `${GOLD}20`, color: DARK }}>
                      {STATUS_LABELS[trackQuery.data.status] ?? trackQuery.data.status}
                    </span>
                  </div>
                  <p className="text-[15px] font-light mb-1" style={{ color: TEXT }}>{trackQuery.data.program}</p>
                  <p className="text-[12px] mb-4" style={{ color: TEXT, opacity: 0.4 }}>Applied {new Date(trackQuery.data.createdAt).toLocaleDateString("en-NG")}</p>
                  {trackQuery.data.paymentStatus && trackQuery.data.paymentStatus !== "paid" && (
                    <div className="mb-3 p-3 rounded-xl text-[12px]" style={{ backgroundColor: `${GOLD}10`, color: DARK }}>
                      Payment status: <strong>{trackQuery.data.paymentStatus}</strong>. Transfer to Moniepoint 8067149356 (HAMZURY HUB) to confirm your seat.
                    </div>
                  )}
                  {trackQuery.data.status === "accepted" && (
                    <div className="mb-3 p-3 rounded-xl text-[12px]" style={{ backgroundColor: "#16A34A10", color: "#15803D" }}>
                      Congratulations. Check your email for onboarding details.
                    </div>
                  )}
                  <Link href="/hub">
                    <span
                      className="block w-full py-3 rounded-full text-[13px] font-medium text-center transition-opacity hover:opacity-90 cursor-pointer"
                      style={{ backgroundColor: DARK, color: BG }}
                    >
                      Sign in via HALS Portal
                    </span>
                  </Link>
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: TEXT, opacity: 0.45 }}>
                  Reference not found. You will receive your reference after payment. Use our chat to get started.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]" style={{ color: TEXT, opacity: 0.4 }}>
          <p>HAMZURY HUB</p>
          <p>&copy; {new Date().getFullYear()} HAMZURY · Built to Last.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy"><span className="hover:opacity-80 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-80 transition-opacity cursor-pointer">Terms</span></Link>
            <button onClick={() => openChat("I am interested in partnering with HAMZURY HUB.")} className="hover:opacity-80 transition-opacity cursor-pointer">Partner with Us</button>
            <button onClick={() => openChat("I want to file a complaint or give a suggestion about HUB services.")} className="hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1">
              <AlertCircle size={10} /> Complaint / Suggestion
            </button>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color="#1E3A5F" department="skills" />
      <div className="md:hidden h-10" />
    </div>
  );
}
