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
    id: "courses",
    title: "Course Enrollment",
    icon: GraduationCap,
    description: "Digital skills courses with certificates. For adults, professionals, and kids.",
    items: [
      { name: "Basic Computer Skills", duration: "3 weeks (Thu–Fri–Sat)", certificate: true, status: "active", age: "15+", locations: ["Online", "Abuja", "Jos", "Kano"], maxStudents: 30, onlinePrice: 8000, whatYouGet: ["Computer literacy", "Microsoft Office / Google Suite", "Internet & email skills", "Certificate of Completion"], context: "I am interested in Basic Computer Skills. Please ask me questions to understand my current level and help me enroll for the next cohort.", videoUrl: "https://www.youtube.com/@hamzury" },
      { name: "Website Development", duration: "8 weeks", certificate: true, status: "active", age: "16+", prerequisites: "Basic Computer Skills", locations: ["Online", "Abuja", "Jos"], maxStudents: 25, onlinePrice: 15000, whatYouGet: ["Build real websites from scratch", "HTML, CSS, JavaScript, React", "Deploy your own portfolio site", "Certificate of Completion"], context: "I am interested in the Website Development course. Please ask me screening questions to understand my background and find the right track.", videoUrl: "https://www.youtube.com/@hamzury" },
      { name: "Data Analysis", duration: "8 weeks", certificate: true, status: "active", age: "16+", prerequisites: "Basic Computer Skills", locations: ["Online", "Abuja", "Jos"], maxStudents: 25, onlinePrice: 15000, whatYouGet: ["Excel, Google Sheets mastery", "Data visualization with charts", "Basic Python for data", "Certificate of Completion"], context: "I am interested in the Data Analysis course. Please ask me screening questions to understand my background and find the right track.", videoUrl: "https://www.youtube.com/@hamzury" },
      { name: "Robotics & Creative Tech", duration: "8 weeks", certificate: true, status: "active", age: "14+", locations: ["Abuja", "Jos"], maxStudents: 20, whatYouGet: ["Hands-on robotics building", "IoT and sensor projects", "Creative problem-solving", "Certificate of Completion"], context: "I am interested in the Robotics & Creative Tech course. Please ask me screening questions to understand my background.", videoUrl: "https://www.youtube.com/@hamzury" },
      { name: "Cybersecurity Fundamentals", duration: "8 weeks", certificate: true, status: "active", age: "17+", prerequisites: "Basic Computer Skills", locations: ["Online", "Abuja"], maxStudents: 20, onlinePrice: 18000, whatYouGet: ["Network security basics", "Ethical hacking concepts", "Defense strategies", "Certificate of Completion"], context: "I am interested in Cybersecurity Fundamentals. Please ask me screening questions to understand my background.", videoUrl: "https://www.youtube.com/@hamzury" },
      { name: "AI & Business Automation", duration: "5 days", certificate: true, status: "active", age: "18+", prerequisites: "Basic Computer Skills", locations: ["Online", "Abuja"], maxStudents: 20, onlinePrice: 15000, whatYouGet: ["Automate tasks with AI", "ChatGPT, Make.com, Zapier", "Build your first automation", "Certificate of Completion"], context: "I am interested in AI & Business Automation. Please ask me screening questions.", videoUrl: "https://www.youtube.com/@hamzury" },
      { name: "Kids Coding Programme", duration: "6 weeks (Saturdays)", certificate: true, status: "active", age: "8–14", locations: ["Abuja", "Jos"], maxStudents: 15, whatYouGet: ["Scratch & block coding", "Simple game building", "Creative thinking", "Certificate for young builders"], context: "I am interested in the Kids Coding Programme for my child. Please ask me some questions about the child's age and interest.", videoUrl: "https://www.youtube.com/@hamzury" },
    ],
  },
  {
    id: "internship",
    title: "Internship Program",
    icon: Briefcase,
    description: "Hands-on experience in real departments. Clarity sessions for students without direction.",
    items: [
      { name: "IT Internship", duration: "3 months", certificate: true, status: "active", age: "17+", prerequisites: "At least 1 completed Skills course", locations: ["Abuja", "Jos"], maxStudents: 10, whatYouGet: ["Work in a real department", "Build real products", "Mentorship from seniors", "Clarity sessions if unsure", "Stipend for top performers"], context: "I want to apply for the IT Internship Program. I understand there's a clarity session. Please help me get started and ask me screening questions." },
      { name: "Business Operations Internship", duration: "3 months", certificate: true, status: "active", age: "18+", locations: ["Abuja"], maxStudents: 8, whatYouGet: ["Client management experience", "Operations & process design", "Business writing skills", "Certificate of Completion"], context: "I want to apply for the Business Operations Internship. Please ask me screening questions." },
      { name: "Clarity Session (Free)", duration: "1 hour", certificate: false, status: "active", age: "Any", locations: ["Online", "Abuja", "Jos", "Kano"], onlinePrice: "free", whatYouGet: ["1-on-1 guidance session", "Discover your direction", "Personalized recommendations", "No commitment required"], context: "I want to book a Clarity Session. I'm not sure what direction to take and need guidance." },
    ],
  },
  {
    id: "workshops",
    title: "Workshops",
    icon: Lightbulb,
    description: "Short intensive sessions for specific skills. Open to all levels.",
    items: [
      { name: "AI Lead Generation", duration: "3 days", certificate: true, status: "active", age: "18+", locations: ["Online", "Abuja"], maxStudents: 25, onlinePrice: 12000, whatYouGet: ["Find leads using AI tools", "Automate outreach", "Build a lead pipeline", "Certificate of Completion"], context: "I am interested in the AI Lead Generation workshop. Please ask me screening questions." },
      { name: "Faceless Content Creation", duration: "2 weeks", certificate: true, status: "active", age: "16+", locations: ["Online"], maxStudents: 30, onlinePrice: 10000, whatYouGet: ["Create content without showing face", "AI video & image tools", "Build a content system", "Certificate of Completion"], context: "I am interested in Faceless Content Creation. Please ask me screening questions." },
      { name: "Executive Strategy Circle", duration: "1 week", certificate: true, status: "active", age: "25+", prerequisites: "Business owner or C-suite role", locations: ["Abuja"], maxStudents: 12, onlinePrice: 20000, whatYouGet: ["Leadership & strategy", "Decision frameworks", "Peer networking", "Executive Certificate"], context: "I am interested in the Executive Strategy Circle. Please ask me screening questions." },
    ],
  },
  {
    id: "corporate",
    title: "Corporate Training",
    icon: Users,
    description: "Custom training for organisations. Upskill your team at your pace.",
    items: [
      { name: "Staff Digital Skills Training", duration: "Custom", certificate: true, status: "active", age: "Any", locations: ["Online", "Abuja", "Jos", "Kano"], onlinePrice: "custom", whatYouGet: ["Tailored curriculum", "On-site or remote delivery", "Progress tracking per staff", "Bulk certificates"], context: "I am interested in Staff Digital Skills Training for my company. Please ask me about our team size and needs." },
      { name: "Executive Workshops", duration: "2–5 days", certificate: true, status: "active", age: "25+", locations: ["Abuja", "Online"], onlinePrice: "custom", whatYouGet: ["C-suite focused content", "Strategy & AI tools", "Private sessions", "Executive Certificates"], context: "I am interested in Executive Workshops for our leadership team. Please ask me about our needs." },
    ],
  },
  {
    id: "hals",
    title: "HALS — Learning Portal",
    icon: Monitor,
    description: "Your complete training portal. Access classes, submit work, track progress — online or on campus.",
    items: [],
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

const CALENDAR_EVENTS: Record<string, CalEvent[]> = {
  // ── Q1 (Jan–Mar) — passed ──
  "2026-01-12": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Q1 Classes Began", detail: "Q1 cohort started. First cohort of the year.", chatContext: "Q1 has passed. I'd like to join the next available cohort." }],
  "2026-02-09": [{ type: "Project Start", color: CAL_COLORS.project, title: "Q1 Project Phase", detail: "Q1 students worked on real projects.", chatContext: "Q1 has passed. Tell me about the next project phase." }],
  "2026-03-16": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Q1 Graduation + 3-Day Seminar", detail: "Q1 graduation ceremony and 3-day seminar & workshop for all Q1 students.", chatContext: "Q1 has passed. When is the next graduation?" }],
  // ── Q2 (Apr–Jun) ──
  "2026-04-07": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "Q2 Orientation Day", detail: "Welcome session. Meet instructors, tour facilities, get your schedule.", chatContext: "I'd like to attend Q2 Orientation on April 7th." }],
  "2026-04-14": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Q2 Cohort 1 — Classes Begin", detail: "All programs start: Web Dev, Data Analysis, Robotics, Cybersecurity, AI Automation, Kids Coding.", chatContext: "Q2 classes start April 14th. I'd like to enroll." }],
  "2026-04-17": [{ type: "Classes", color: CAL_COLORS.cohort, title: "Basic Computer Skills Starts", detail: "Thu–Fri–Sat basic skills classes. 3-week programme.", chatContext: "I want to join Basic Computer Skills starting April 17th." }],
  "2026-05-01": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "RIDI Scholarship Admissions Open", detail: "RIDI scholarship applications now open for May intake. Training students to build functional businesses with AI. Sponsored students also help market Hamzury Skills.", chatContext: "I'd like to apply for the RIDI Scholarship for the May intake. Please tell me about the programme and how to apply." }],
  "2026-05-05": [{ type: "Project Start", color: CAL_COLORS.project, title: "Q2 Project Phase Begins", detail: "Students build capstone projects. IT students placed in real departments.", chatContext: "Tell me about the Q2 project phase starting May 5th." }],
  "2026-05-12": [{ type: "Executive", color: CAL_COLORS.executive, title: "Executive Circle — Q2", detail: "Premium 1-week intensive for founders and executives.", chatContext: "I'm interested in the Executive Circle starting May 12th." }],
  "2026-05-26": [{ type: "Project Start", color: CAL_COLORS.project, title: "Kids Coding Showcase", detail: "Kids present Scratch games and projects to parents.", chatContext: "Tell me about the Kids Coding Showcase on May 26th." }],
  "2026-06-02": [{ type: "Classes", color: CAL_COLORS.cohort, title: "Q2 Final Assessments", detail: "Final assessments, project presentations, portfolio reviews.", chatContext: "What should students prepare for Q2 finals?" }],
  "2026-06-08": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Q2 Graduation + 3-Day Seminar", detail: "Graduation ceremony, 3-day seminar & workshop for all Q2 cohort students. Certificates, project awards, alumni induction.", chatContext: "I'd like to attend the Q2 graduation on June 8th." }],
  "2026-06-15": [{ type: "Executive", color: CAL_COLORS.executive, title: "Q2 Internal Programme", detail: "End-of-quarter internal programme for all Q2 cohort students. Review, feedback, next steps.", chatContext: "Tell me about the Q2 internal programme." }],
  // ── Q3 (Jul–Sep) ──
  "2026-07-06": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "Q3 Orientation Day", detail: "Welcome session for Q3 cohort. All programs open for enrollment.", chatContext: "I'd like to attend Q3 Orientation on July 6th." }],
  "2026-07-13": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Q3 Cohort 1 — Classes Begin", detail: "Q3 cohort starts. All programs accept new students.", chatContext: "Q3 classes start July 13th. I'd like to enroll." }],
  "2026-07-16": [{ type: "Classes", color: CAL_COLORS.cohort, title: "Basic Computer Skills — Q3", detail: "New intake for basic skills (Thu–Fri–Sat).", chatContext: "I want to join Basic Computer Skills starting July 16th." }],
  "2026-08-03": [{ type: "Project Start", color: CAL_COLORS.project, title: "Q3 Project Phase", detail: "Hands-on project building with mentor guidance.", chatContext: "Tell me about the Q3 project phase." }],
  "2026-08-17": [{ type: "Executive", color: CAL_COLORS.executive, title: "Executive Circle — Q3", detail: "Premium intensive for senior leaders.", chatContext: "I'm interested in the Q3 Executive Circle." }],
  "2026-09-01": [{ type: "Classes", color: CAL_COLORS.cohort, title: "Q3 Final Assessments", detail: "Final assessments and project demos.", chatContext: "What should Q3 students prepare for finals?" }],
  "2026-09-08": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Q3 Graduation + 3-Day Seminar", detail: "Graduation, 3-day seminar & workshop. Certificates, awards, alumni induction.", chatContext: "Tell me about the Q3 graduation." }],
  "2026-09-15": [{ type: "Executive", color: CAL_COLORS.executive, title: "Q3 Internal Programme", detail: "End-of-quarter internal programme for all Q3 cohort students.", chatContext: "Tell me about the Q3 internal programme." }],
  // ── Q4 (Oct–Dec) ──
  "2026-10-05": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "Q4 Orientation Day", detail: "Welcome session for final 2026 cohort.", chatContext: "I'd like to attend Q4 Orientation." }],
  "2026-10-12": [{ type: "Classes Start", color: CAL_COLORS.cohort, title: "Q4 Cohort 1 — Classes Begin", detail: "Last cohort of 2026. All programs accept students.", chatContext: "Q4 classes start October 12th — last chance in 2026." }],
  "2026-10-15": [{ type: "Classes", color: CAL_COLORS.cohort, title: "Basic Computer Skills — Q4", detail: "Final 2026 intake for basic skills.", chatContext: "I want to join Basic Computer Skills in October." }],
  "2026-11-02": [{ type: "Project Start", color: CAL_COLORS.project, title: "Q4 Project Phase", detail: "Final projects. Market-ready deliverables.", chatContext: "Tell me about the Q4 project phase." }],
  "2026-11-16": [{ type: "Executive", color: CAL_COLORS.executive, title: "Executive Circle — Q4", detail: "Year-end executive intensive. 2027 planning.", chatContext: "I'm interested in the Q4 Executive Circle." }],
  "2026-11-30": [{ type: "Classes", color: CAL_COLORS.cohort, title: "Q4 Final Assessments", detail: "Final assessments and capstone presentations.", chatContext: "What should Q4 students prepare for finals?" }],
  "2026-12-07": [{ type: "Graduation", color: CAL_COLORS.graduation, title: "Q4 Graduation + 3-Day Seminar", detail: "Q4 graduation and seminar. Certificates and awards.", chatContext: "Tell me about the Q4 graduation." }],
  "2026-12-14": [{ type: "Executive", color: CAL_COLORS.executive, title: "Year-End: 2-Day Workshop + Showcase", detail: "All 2026 students (online + offline) gather for a 2-day workshop: project showcase, pitching, and scaling strategies. The biggest event of the year.", chatContext: "Tell me about the year-end workshop and project showcase in December." }],
  "2026-12-21": [{ type: "Orientation", color: CAL_COLORS.orientation, title: "2027 Early Bird Orientation", detail: "Preview 2027 programs. Early registrants get priority placement.", chatContext: "I'd like to attend the 2027 Early Bird Orientation." }],
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

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
    if (btn) btn.click();
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

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
    if (btn) btn.click();
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
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                  if (btn) btn.click();
                }}
                className="flex items-center gap-2 px-3 py-3.5 rounded-xl w-full text-left mx-2"
                style={{ backgroundColor: "#B48C4C10", color: "#B48C4C" }}
              >
                <MessageSquare size={16} />
                <span className="text-[13px] font-medium">Chat with us</span>
              </button>
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

      {/* ── HERO ── */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[clamp(32px,6vw,48px)] font-light leading-[1.1] tracking-tight mb-6" style={{ color: TEXT }}>
            Learn what{" "}<span style={{ color: DARK }}>actually works.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-md mx-auto" style={{ color: TEXT, opacity: 0.5 }}>
            Practical training for founders, operators, and teams. Build income, capability, and real market ability.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: TEXT, border: `1px solid ${TEXT}20` }}
            >
              Our Programs
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
