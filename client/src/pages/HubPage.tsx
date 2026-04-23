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
  CreditCard, UserCheck, Heart, Camera, Video, TrendingUp, Rocket,
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
    title: "Core Programmes",
    icon: GraduationCap,
    description: "Cohort-based tech education. Mon–Wed, 8am–2pm. LMS + AI-guided learning + physical sessions + international certification.",
    items: [
      { name: "Business Builders Academy", duration: "3 weeks", certificate: true, status: "active", age: "18+", locations: ["Abuja", "Online"], maxStudents: 30, onlinePrice: 150000, whatYouGet: ["Opportunity identification & market research", "Business model canvas + financial modelling", "Pitch deck built with AI", "Google Business Certificate", "Hamzury HUB Certificate"], context: "I am interested in Business Builders Academy. Please ask me screening questions to confirm fit for the next cohort." },
      { name: "Digital Dominance", duration: "4 weeks", certificate: true, status: "active", age: "16+", locations: ["Abuja", "Online"], maxStudents: 30, onlinePrice: 80000, whatYouGet: ["Social media across Instagram, TikTok, LinkedIn, Twitter", "Content creation with Canva + AI", "Personal branding + thought leadership", "Growth hacking + monetisation", "Google Digital Marketing Certificate"], context: "I am interested in Digital Dominance. Please ask me screening questions and share what to prepare." },
      { name: "Code Craft Bootcamp", duration: "12 weeks", certificate: true, status: "active", age: "16+", prerequisites: "Basic computer skills", locations: ["Abuja", "Online"], maxStudents: 25, onlinePrice: 300000, whatYouGet: ["Python + web fundamentals (HTML/CSS/JS)", "Flask / Django + SQL databases", "Full-stack final project (team-based)", "AI coding assistants + debugging", "Coursera Programming Certificate"], context: "I am interested in Code Craft Bootcamp. Please ask me screening questions about background." },
      { name: "Compliance Mastery", duration: "6 weeks", certificate: true, status: "active", age: "18+", locations: ["Abuja", "Online"], maxStudents: 25, onlinePrice: 120000, whatYouGet: ["CAC registration + TIN", "VAT, PAYE, Tax Clearance Certificates", "NAFDAC, PENCOM + industry licences", "Guest lectures from Bizdoc team", "Professional Compliance Certificate"], context: "I am interested in Compliance Mastery. Please ask me screening questions about my role and need." },
      { name: "Money Mastery", duration: "4 weeks", certificate: true, status: "active", age: "18+", locations: ["Abuja", "Online"], maxStudents: 25, onlinePrice: 90000, whatYouGet: ["Personal budgeting + debt management", "Investing basics + portfolio diversification", "Multiple income streams", "10-year wealth plan", "Financial Literacy Certificate"], context: "I am interested in Money Mastery. Please ask me screening questions." },
      { name: "MetFix Hardware & Robotics", duration: "8 weeks", certificate: true, status: "active", age: "16+", locations: ["Abuja (physical)", "Online (simulations)"], maxStudents: 20, onlinePrice: 180000, whatYouGet: ["Laptop disassembly + hardware repair", "Arduino, circuits, sensors", "Robotics design + build", "Final competition", "Hardware Engineering Certificate"], context: "I am interested in MetFix Hardware & Robotics. Please ask me whether I want the physical (₦180k) or online (₦80k) track and my background." },
    ],
  },
  {
    id: "kids",
    title: "Kids Programme",
    icon: Users,
    description: "Saturdays 8am–2pm. Age-appropriate tech education with weekly parent progress reports.",
    items: [
      { name: "Basic Computer Skills — Kids", duration: "2 weeks (Thu–Sat)", certificate: true, status: "active", age: "8–15", locations: ["Abuja"], maxStudents: 15, onlinePrice: 25000, whatYouGet: ["Computer parts + keyboard + mouse skills", "MS Word + internet basics + online safety", "Creative final project (document + presentation)", "Weekly parent progress reports", "Computer Literacy Certificate"], context: "I want to enrol my child in the Basic Computer Skills kids programme. Please ask about my child's age and experience." },
    ],
  },
  {
    id: "online",
    title: "Online Academy",
    icon: Monitor,
    description: "Self-paced LMS courses with video lessons, auto-graded quizzes and certificates. Optional mentor support +₦10k.",
    items: [
      { name: "Excel Mastery", duration: "2 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 15000, whatYouGet: ["Formulas, pivot tables, charts", "Data cleaning + analysis", "Business reporting templates", "Course completion certificate"], context: "I am interested in the Excel Mastery online course. Please ask me any screening questions." },
      { name: "PowerPoint Pro", duration: "1 week", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 10000, whatYouGet: ["Slide design principles", "Animations + transitions", "Pitch-deck templates", "Course completion certificate"], context: "I am interested in PowerPoint Pro online." },
      { name: "Email Marketing", duration: "3 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 20000, whatYouGet: ["List building + segmentation", "Writing that converts", "Automation basics (Mailchimp, Brevo)", "Course completion certificate"], context: "I am interested in the Email Marketing online course." },
      { name: "SEO Basics", duration: "3 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 25000, whatYouGet: ["Keyword research", "On-page + technical SEO", "Google Search Console", "Course completion certificate"], context: "I am interested in the SEO Basics online course." },
      { name: "Graphic Design Fundamentals", duration: "4 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 30000, whatYouGet: ["Colour, typography, layout", "Canva + Figma basics", "Brand identity exercises", "Course completion certificate"], context: "I am interested in Graphic Design Fundamentals online." },
      { name: "Video Editing Basics", duration: "4 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 35000, whatYouGet: ["CapCut + DaVinci Resolve", "Cuts, transitions, audio", "Short-form content for reels/TikTok", "Course completion certificate"], context: "I am interested in Video Editing Basics online." },
      { name: "Freelancing 101", duration: "4 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 40000, whatYouGet: ["Upwork, Fiverr, direct outreach", "Proposals + pricing", "Client management", "Course completion certificate"], context: "I am interested in Freelancing 101 online." },
      { name: "AI Tools Mastery", duration: "6 weeks", certificate: true, status: "active", age: "Any", locations: ["Online"], onlinePrice: 50000, whatYouGet: ["ChatGPT + Claude for work + study", "Make.com + Zapier automation", "AI image + video tools", "Course completion certificate"], context: "I am interested in AI Tools Mastery online." },
    ],
  },
  {
    id: "enterprise",
    title: "Team & Corporate",
    icon: Briefcase,
    description: "Discounts for groups and custom curricula for companies. 3–5 students: 15% off · 6–10: 20% off · 11+: 25% off.",
    items: [
      { name: "Team Training (3–10 staff)", duration: "Custom", certificate: true, status: "active", age: "Any", locations: ["Abuja", "Online", "On-site"], onlinePrice: "custom", whatYouGet: ["Custom curriculum from HUB programmes", "On-site or virtual delivery", "All certificates included", "Manager progress reports", "Group discount applied"], context: "I want Team Training for my company. Please ask about team size, goals, and which HUB programmes we need." },
      { name: "Corporate (10+ employees)", duration: "Retainer", certificate: true, status: "active", age: "Any", locations: ["Abuja", "Online", "On-site"], onlinePrice: "custom", whatYouGet: ["Full curriculum customisation", "Ongoing coaching + quarterly reviews", "Skills assessment framework", "All certificates + alumni access", "Dedicated HUB liaison"], context: "I want HUB Corporate training for 10+ employees. Please ask about company size, function, and needs." },
      { name: "Scholarship (Application)", duration: "Varies", certificate: true, status: "active", age: "Any", locations: ["Abuja", "Online"], onlinePrice: "free", whatYouGet: ["Full or partial tuition coverage", "Application-based", "Eligibility: financial need + commitment", "Same programme + certificate as paid students"], context: "I want to apply for a HUB scholarship. Please tell me what to prepare." },
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
  // ── APRIL 2026 ──
  "2026-04-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "April Cohort Resumption", detail: "New students start today. Orientation + welcome session for all April intakes across every programme.", chatContext: "I'd like to join the April cohort. Please tell me what to prepare." }],
  "2026-04-06": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of the month. New challenge released to all four teams — AI, Cyber, Quantum, Robotics.", chatContext: "Tell me about the HUB team competition and how I can join." }],
  "2026-04-13": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Digital Dominance — New Cohort", detail: "4-week social media programme begins. ₦80,000. Mon–Wed 8am–2pm. Google Digital Marketing Certificate.", chatContext: "I want to enrol in Digital Dominance starting April 13th." }],
  "2026-04-20": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Money Mastery — New Cohort", detail: "4-week financial literacy programme begins. ₦90,000. Personal finance, investing, wealth building.", chatContext: "I want to enrol in Money Mastery starting April 20th." }],
  "2026-04-30": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Business Builders Graduation", detail: "3-week Business Builders Academy ends. Final pitches + Google Business Certificate.", chatContext: "When is the next Business Builders Academy cohort?" }],

  // ── MAY 2026 ──
  "2026-05-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "May Cohort Resumption", detail: "New students welcome + orientation. All 8 programmes open for enrolment today.", chatContext: "I'd like to join the May cohort." }],
  "2026-05-04": [
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. New challenge for AI · Cyber · Quantum · Robotics teams.", chatContext: "Tell me about the May team competition." },
    { type: "Classes Start", color: CAL_COLORS.cohort, title: "Code Craft Bootcamp Starts", detail: "12-week full-stack programme. ₦300,000. Python → Web → Backend → Final project. Coursera Certificate.", chatContext: "I want to enrol in Code Craft Bootcamp starting May 4th." },
  ],
  "2026-05-11": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Compliance Mastery Starts", detail: "6-week programme with Bizdoc partnership. ₦120,000. CAC, tax, NAFDAC, PENCOM.", chatContext: "I want to enrol in Compliance Mastery." }],
  "2026-05-18": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "MetFix Hardware & Robotics", detail: "8-week hardware + robotics track. ₦180k physical / ₦80k online. Arduino, circuits, competition.", chatContext: "I want to enrol in MetFix Hardware & Robotics." }],
  "2026-05-28": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Digital Dominance Graduation", detail: "4-week cohort ends. Final social media showcase + certificate ceremony.", chatContext: "When is the next Digital Dominance cohort?" }],

  // ── JUNE 2026 ──
  "2026-06-01": [
    { type: "Orientation", color: CAL_COLORS.orientation, title: "June Cohort Resumption", detail: "New students start + orientation. Summer intakes open.", chatContext: "I'd like to join the June cohort." },
    { type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of June. New challenge released.", chatContext: "Tell me about the June team competition." },
  ],
  "2026-06-15": [{ type: "Project Start", color: CAL_COLORS.project, title: "Code Craft — Web Development Block", detail: "Code Craft students enter the HTML/CSS/JS block. Portfolio site is due by end of block.", chatContext: "Tell me more about Code Craft Bootcamp." }],
  "2026-06-22": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Compliance Mastery Graduation", detail: "6-week programme ends. Students graduate with full compliance roadmap + Professional Compliance Certificate.", chatContext: "When is the next Compliance Mastery cohort?" }],
  "2026-06-29": [{ type: "Project Start", color: CAL_COLORS.project, title: "Team Competition Mid-Year Judging", detail: "All four teams present Q2 challenge outputs. Awards, points, team photos.", chatContext: "Tell me about the team competition mid-year judging." }],

  // ── JULY 2026 ──
  "2026-07-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "July Cohort Resumption", detail: "New students welcome. All programmes open for July intake.", chatContext: "I'd like to join the July cohort." }],
  "2026-07-06": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. New month, new challenge.", chatContext: "Tell me about the July team competition." }],
  "2026-07-13": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "MetFix Physical Track", detail: "Physical MetFix Hardware cohort begins at HUB workshop. ₦180,000. Abuja only.", chatContext: "I want to enrol in MetFix physical track." }],
  "2026-07-20": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Business Builders Academy", detail: "3-week business foundations programme. ₦150,000. Google Business Certificate.", chatContext: "I want to enrol in Business Builders Academy." }],
  "2026-07-27": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Code Craft Mid-Point Review", detail: "Week 6 milestone. Students present portfolio sites for peer + instructor review.", chatContext: "Tell me about the Code Craft mid-point review." }],

  // ── AUGUST 2026 ──
  "2026-08-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "August Cohort Resumption", detail: "New students orientation + welcome.", chatContext: "I'd like to join the August cohort." }],
  "2026-08-03": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. August challenge released.", chatContext: "Tell me about the August team competition." }],
  "2026-08-10": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Kids Programme — August Cohort", detail: "Basic Computer Skills (Kids, 8–15). Thu–Sat, 2 weeks. ₦25,000.", chatContext: "I want to enrol my child in the August kids programme." }],
  "2026-08-17": [{ type: "Project Start", color: CAL_COLORS.project, title: "MetFix Robotics Build", detail: "MetFix students begin robot design + programming phase.", chatContext: "Tell me about MetFix robotics." }],
  "2026-08-31": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Money Mastery Graduation", detail: "Students present their 10-year wealth plans. Financial Literacy Certificate.", chatContext: "When is the next Money Mastery cohort?" }],

  // ── SEPTEMBER 2026 ──
  "2026-09-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "September Cohort Resumption", detail: "New students orientation. Back-to-school intake — extra capacity.", chatContext: "I'd like to join the September cohort." }],
  "2026-09-07": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday. New challenge.", chatContext: "Tell me about the September team competition." }],
  "2026-09-21": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "MetFix + Robotics Graduation", detail: "8-week programme ends. Robot showcase + Hardware Engineering Certificate.", chatContext: "When is the next MetFix cohort?" }],
  "2026-09-28": [{ type: "Project Start", color: CAL_COLORS.project, title: "Q3 Team Competition Finals", detail: "All four teams compete. Annual rankings updated.", chatContext: "Tell me about Q3 team competition finals." }],

  // ── OCTOBER 2026 ──
  "2026-10-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "October Cohort Resumption", detail: "New students welcome. Q4 intakes open.", chatContext: "I'd like to join the October cohort." }],
  "2026-10-05": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of October.", chatContext: "Tell me about the October team competition." }],
  "2026-10-19": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Final 2026 Digital Dominance Cohort", detail: "Last Digital Dominance cohort of 2026. 4 weeks.", chatContext: "I want to join the final 2026 Digital Dominance cohort." }],
  "2026-10-26": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Code Craft Bootcamp Graduation", detail: "12-week full-stack programme ends. Final project demo day + Coursera Certificate.", chatContext: "When is the next Code Craft Bootcamp?" }],

  // ── NOVEMBER 2026 ──
  "2026-11-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "November Cohort Resumption", detail: "Final standard intakes of 2026.", chatContext: "I'd like to join the November cohort." }],
  "2026-11-02": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition Challenge Announced", detail: "First Monday of November.", chatContext: "Tell me about the November team competition." }],
  "2026-11-16": [{ type: "Project Start", color: CAL_COLORS.project, title: "Year-End Project Phase", detail: "All ongoing programmes enter capstone project phase. Market-ready deliverables.", chatContext: "Tell me about the year-end project phase." }],
  "2026-11-30": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "November Programme Graduations", detail: "Digital Dominance, Money Mastery, Kids programme graduations + certificate ceremony.", chatContext: "Tell me about November graduations." }],

  // ── DECEMBER 2026 ──
  "2026-12-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "December Cohort Resumption", detail: "Last cohort of 2026. Short-run programmes only (Digital Dominance, Money Mastery, Online Academy).", chatContext: "I'd like to join the December cohort — last chance in 2026." }],
  "2026-12-07": [{ type: "Competition", color: CAL_COLORS.executive, title: "Team Competition — Year-End Championship", detail: "First Monday of December. Annual team championship begins.", chatContext: "Tell me about the year-end team competition championship." }],
  "2026-12-14": [{ type: "Executive", color: CAL_COLORS.executive, title: "Year-End Workshop + Showcase (2 Days)", detail: "All 2026 students gather. Team championship finals, project showcase, pitching, 2027 planning. The biggest event of the year.", chatContext: "Tell me about the year-end workshop and showcase in December." }],
  "2026-12-21": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "2027 Early Bird Orientation", detail: "Preview 2027 programmes. Early registrants get priority placement + 10% discount.", chatContext: "I'd like to attend the 2027 Early Bird Orientation." }],
};

const CALENDAR_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
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

  /** HUB has no AI chat — all "contact" CTAs open WhatsApp with context. */
  const openChat = (context: string) => {
    const msg = encodeURIComponent(context);
    window.open(`https://wa.me/2349130700056?text=${msg}`, "_blank");
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
        <div className="overflow-x-auto scrollbar-hide mb-8 -mx-6 px-6">
          <div className="flex gap-0 min-w-max mx-auto w-fit rounded-2xl overflow-hidden" style={{ backgroundColor: `${DARK}04` }}>
            {CALENDAR_MONTHS.map(m => {
              const isActive = m === activeMonth;
              const evCount = monthEventCount(m);
              const past = isPastMonth(m);
              return (
                <button
                  key={m}
                  onClick={() => { setActiveMonth(m); setSelectedDate(null); }}
                  className="relative flex flex-col items-center justify-center transition-all duration-200"
                  style={{
                    width: 52,
                    height: 48,
                    backgroundColor: isActive ? DARK : "transparent",
                    color: isActive ? W : past ? `${TEXT}30` : TEXT,
                    borderRadius: isActive ? 14 : 0,
                  }}
                >
                  <span className="text-[11px] font-semibold tracking-wide">{MONTH_SHORT[m]}</span>
                  {evCount > 0 && (
                    <div className="flex gap-[2px] mt-1">
                      {Array.from({ length: Math.min(evCount, 4) }).map((_, i) => (
                        <div key={i} className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: isActive ? GOLD : past ? `${TEXT}20` : CAL_COLORS.cohort }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-[20px] overflow-hidden relative" style={{ backgroundColor: BG, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
          <div className="px-6 py-5" style={{ borderBottom: `1px solid ${DARK}08` }}>
            <h3 className="text-[20px] font-medium tracking-tight text-center" style={{ color: DARK }}>{MONTH_NAMES[activeMonth]} 2026</h3>
          </div>

          <div className="grid grid-cols-7 px-4 pt-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
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

          {/* Inline overlay for selected date — floats over calendar */}
          {selectedDate && selectedEvents.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10" style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
              <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: W, boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-medium tracking-wide uppercase" style={{ color: `${TEXT}44` }}>
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                  <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-full hover:bg-black/5 transition-colors"><X size={16} style={{ color: `${TEXT}55` }} /></button>
                </div>
                {selectedEvents.map((ev, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: ev.color }} />
                      <div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${ev.color}15`, color: ev.color }}>{ev.type}</span>
                        <h4 className="text-[16px] font-semibold mt-1.5 mb-1.5" style={{ color: TEXT }}>{ev.title}</h4>
                        <p className="text-[13px] leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>{ev.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { openChat(ev.chatContext); setSelectedDate(null); }}
                      className="w-full py-3 rounded-xl text-[13px] font-medium transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                      style={{ backgroundColor: ev.color, color: W }}
                    >
                      <MessageSquare size={14} /> Learn More & Enroll
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
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
      className="rounded-lg p-5 relative transition-all duration-300 hover:shadow-xl sticky-enter"
      style={{
        backgroundColor: stickyColor.bg,
        border: `1px solid ${stickyColor.border}`,
        boxShadow: `3px 3px 12px ${stickyColor.shadow}, 0 1px 3px rgba(0,0,0,0.06)`,
        minWidth: 260,
        maxWidth: 300,
        fontFamily: "'Caveat', 'Segoe Print', 'Comic Sans MS', cursive",
        transform: `rotate(${Math.random() > 0.5 ? '' : '-'}${(Math.random() * 2 + 0.5).toFixed(1)}deg)`,
      }}
    >
      {/* Pin visual */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full" style={{ backgroundColor: stickyColor.border, boxShadow: `0 2px 6px ${stickyColor.shadow}` }}>
        <div className="w-2 h-2 rounded-full bg-white/60 absolute top-1 left-1.5" />
      </div>

      {/* Unpin */}
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full transition-colors hover:bg-black/10" title="Unpin">
        <X size={14} style={{ color: `${TEXT}55` }} />
      </button>

      <div className="mt-2">
        <h4 className="text-[18px] font-bold mb-1" style={{ color: TEXT }}>{item.name}</h4>

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
              className="w-full py-2 rounded-lg text-[12px] font-medium flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(0,0,0,0.06)", color: TEXT }}
            >
              <Play size={12} /> Watch Video
            </a>
          )}
          <button
            onClick={() => openChat(`I'm interested in ${item.name}. Please:\n1. Explain what this course covers, who it's for, and what I'll gain\n2. Run a clarity questionnaire to assess my current skill level and background\n3. Based on my answers, tell me honestly if I'm ready — or suggest the right starting point\n4. If I'm a fit, ask me to choose location: Online, Abuja, Jos, or Kano\n5. If Online — confirm availability, collect my details, process payment (max ₦20,000 for online). After payment give me my certificate/reference number to login\n6. If Physical — we have limited seats (${item.maxStudents || 'limited'} per cohort). If qualified, process payment and invite to orientation. We'll email admission details, procedures, and orientation packages\n7. Enrollment is for the NEXT cohort only\n8. Course: ${item.name} | Duration: ${item.duration || 'TBD'} | Age: ${item.age || 'Any'} | Prerequisites: ${item.prerequisites || 'None'}`)}
            className="w-full py-2.5 rounded-lg text-[12px] font-medium transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
            style={{ backgroundColor: DARK, color: W }}
          >
            <MessageSquare size={12} /> Learn More & Book a Seat
          </button>
        </div>
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

  /** HUB has no AI chat — route CTAs directly to WhatsApp with context. */
  const openChat = (context: string) => {
    const msg = encodeURIComponent(context);
    window.open(`https://wa.me/2349130700056?text=${msg}`, "_blank");
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
    courses: DARK,
    internship: "#7C3AED",
    workshops: GOLD,
    corporate: "#059669",
    hals: "#2563EB",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <SplashScreen text="HAMZURY" color={DARK} departmentName="HUB" tagline="Tech skills that get you paid." />
      <PageMeta
        title="HUB — Tech Training | HAMZURY"
        description="Tech skills that get you paid. Web development, data analysis, graphics, marketing, AI & automation — with job-placement support."
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
          <span className="text-[13px] tracking-[4px] font-light uppercase" style={{ color: TEXT }}>HAMZURY HUB</span>
          <button onClick={() => setMobileMenuOpen(p => !p)} className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70" style={{ color: TEXT }} aria-label="Menu">
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {mobileMenuOpen && (
            <div className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl" style={{ backgroundColor: W }} onClick={() => setMobileMenuOpen(false)}>
              <a
                href={`https://wa.me/2349130700056?text=${encodeURIComponent("Hello HAMZURY HUB — I'd like to talk about a programme.")}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3.5 rounded-xl w-full text-left mx-2"
                style={{ backgroundColor: "#25D36615", color: "#128C7E" }}
              >
                <MessageSquare size={16} />
                <span className="text-[13px] font-medium">WhatsApp us</span>
              </a>
              {[
                { label: "Bizdoc",  href: "/bizdoc" },
                { label: "Scalar",  href: "/scalar" },
                { label: "Medialy", href: "/medialy" },
                { label: "About",   href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "HAMZURY", href: "/" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── MAY COHORT BANNER — campaign strip ── */}
      <section className="pt-20 pb-2" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-full text-[12px] md:text-[13px] font-medium mx-auto"
            style={{
              backgroundColor: `${GOLD}12`,
              border: `1px solid ${GOLD}30`,
              color: DARK,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: GOLD }}
            />
            <span className="tracking-[0.08em]">
              <strong style={{ color: GOLD }}>May Cohort</strong>
              <span className="opacity-60"> · starts May 1, 2026 · enrolment open</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── HERO ── */}
      <section className="min-h-[85vh] flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>
            HAMZURY HUB · BUILT TO LAST
          </p>
          <h1 className="text-[clamp(32px,6vw,54px)] font-light leading-[1.05] tracking-tight mb-6" style={{ color: TEXT }}>
            Tech skills that{" "}<span style={{ color: DARK }}>get you paid.</span>
          </h1>
          <p className="text-[15px] leading-relaxed mb-12 max-w-lg mx-auto" style={{ color: TEXT, opacity: 0.55 }}>
            Eight programmes. Real portfolios. International certification. Pick your path — we'll walk you to placement.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link
              href="/hub/enroll"
              className="px-8 py-4 rounded-full text-[14px] font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: DARK, color: GOLD }}
            >
              Enrol for May Cohort →
            </Link>
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: TEXT, border: `1px solid ${TEXT}20` }}
            >
              See Programmes
            </button>
            <button
              onClick={() => document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: GOLD, border: `1px solid ${GOLD}40` }}
            >
              Calendar
            </button>
          </div>
          <p className="text-[12px]" style={{ color: `${TEXT}50` }}>
            Not sure which skill? Start the enrolment form — we'll help you choose.
          </p>
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

      {/* ── CALENDAR ── */}
      <CalendarSection />

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
