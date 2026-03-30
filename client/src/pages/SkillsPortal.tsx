import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ChevronDown,
  Users, GraduationCap, Star, Target,
  Lightbulb, BookOpen, X, Loader2, Menu,
  Calendar, Clock, CheckCircle,
} from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS PORTAL. /skills
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#1E3A5F";   // Dark navy blue. Skills primary
const GOLD  = "#B48C4C";   // Gold accent (5% usage)
const TEXT  = "#1A1A1A";
const BG    = "#FFFAF6";   // Milk white background
const CREAM = "#F5F3EF";   // Soft cream for cards
const W     = "#FFFFFF";

// ── 2026 PROGRAMS ──────────────────────────────────────────────────────────────
type Program = {
  icon: typeof Users;
  quarter: string;
  badge: string;
  program: string;
  description: string;
  duration: string;
};

const PROGRAMS_2026: Program[] = [
  // Q2 — Start and Sell
  {
    icon: Lightbulb, quarter: "Q2", badge: "START & SELL",
    program: "AI Founder Launchpad",
    description: "Build your idea, offer, brand, and first revenue path using AI tools. Go from concept to paying customers in 3 weeks.",
    duration: "3-week cohort",
  },
  {
    icon: BookOpen, quarter: "Q2", badge: "START & SELL",
    program: "Vibe Coding for Founders",
    description: "Build MVPs and internal tools with AI-assisted coding. No prior programming experience needed.",
    duration: "3-week cohort",
  },
  {
    icon: Target, quarter: "Q2", badge: "START & SELL",
    program: "AI Sales Operator",
    description: "Learn lead generation, follow-up systems, and AI-powered sales. Build a pipeline that works while you sleep.",
    duration: "3-week cohort",
  },
  // Q3 — Systemize and Grow
  {
    icon: Star, quarter: "Q3", badge: "SYSTEMIZE & GROW",
    program: "Service Business in 21 Days",
    description: "Launch a real service business from scratch in 3 weeks. Offer, pricing, clients, and first revenue included.",
    duration: "3-week cohort",
  },
  {
    icon: Lightbulb, quarter: "Q3", badge: "SYSTEMIZE & GROW",
    program: "Operations Automation Sprint",
    description: "Automate the repetitive parts of your business. Invoicing, follow-ups, onboarding, and reporting on autopilot.",
    duration: "3-week cohort",
  },
  {
    icon: BookOpen, quarter: "Q3", badge: "SYSTEMIZE & GROW",
    program: "AI Marketing and Content Engine",
    description: "Build a content and marketing system powered by AI. Produce a month of content in a single session.",
    duration: "3-week cohort",
  },
  // Q4 — Productize and Scale
  {
    icon: GraduationCap, quarter: "Q4", badge: "PRODUCTIZE & SCALE",
    program: "Digital Product Builder",
    description: "Turn your knowledge or service into a sellable digital product. Course, template, or tool — shipped by graduation.",
    duration: "3-week cohort",
  },
  {
    icon: Star, quarter: "Q4", badge: "PRODUCTIZE & SCALE",
    program: "Dashboard Builder Lab",
    description: "Build internal dashboards and data tools for businesses. A freelance-ready skill with immediate earning potential.",
    duration: "3-week cohort",
  },
  {
    icon: Users, quarter: "Q4", badge: "PRODUCTIZE & SCALE",
    program: "Customer Success and Business Ops Lab",
    description: "Master client management and business operations. Keep clients happy and your backend running smoothly.",
    duration: "3-week cohort",
  },
];

const ALWAYS_RUNNING: Program[] = [
  {
    icon: Lightbulb, quarter: "Always", badge: "ONGOING",
    program: "Robotics and Creative Tech Lab",
    description: "Hands-on robotics, coding, and creative problem-solving. Runs every Thursday and Friday.",
    duration: "Ongoing",
  },
  {
    icon: Users, quarter: "Always", badge: "ONGOING",
    program: "Corporate Staff Training",
    description: "Custom training for company teams. Tailored programs delivered at your pace and schedule.",
    duration: "Ongoing",
  },
  {
    icon: BookOpen, quarter: "Always", badge: "ONGOING",
    program: "HALS — Hamzury AI Learning System",
    description: "Self-paced online learning platform. Access courses, assignments, and resources anytime.",
    duration: "Ongoing",
  },
  {
    icon: GraduationCap, quarter: "Always", badge: "ONGOING",
    program: "RIDI Sponsorship",
    description: "Subsidized training for underserved communities. Apply for a fully-funded seat in any program.",
    duration: "Ongoing",
  },
];

// ── HOW WE WORK ───────────────────────────────────────────────────────────────
const SKILL_STEPS = [
  { num: "01", title: "Apply", short: "Tell us your goal and program interest", detail: "Pick a program. Answer a few qualifying questions. We confirm fit, not gatekeep." },
  { num: "02", title: "We Confirm Fit", short: "We verify this program matches your stage", detail: "Reviewed within 24 hours. If a different program suits you better, we say so." },
  { num: "03", title: "You Enrol", short: "Secure your seat with payment or scholarship", detail: "Payment secures your cohort seat. RIDI and partner scholarship codes accepted. Limited seats." },
  { num: "04", title: "You Learn", short: "Live sessions, practicals, real projects", detail: "Every session is live. Real business scenarios. Instructors are operators, not lecturers." },
  { num: "05", title: "You Execute", short: "Leave with a skill and a 30-day action plan", detail: "Graduate with a 30-day plan for your business. Alumni support for 60 days after." },
];

// ── (Legacy blueprint types removed — 2026 programs use simplified cards) ──

// (Legacy COURSE_BLUEPRINTS removed — replaced by PROGRAMS_2026 and ALWAYS_RUNNING above)



// ── CALENDAR STATUS HELPERS ──────────────────────────────────────────────────
function CalendarStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    upcoming:     { label: "Upcoming",     bg: `${DARK}12`, text: DARK },
    registration: { label: "Registration Open", bg: `${GOLD}20`, text: "#8B6914" },
    active:       { label: "Active",       bg: "#16A34A18", text: "#15803D" },
    support:      { label: "Support Window", bg: "#3B82F615", text: "#1D4ED8" },
    completed:    { label: "Completed",    bg: `${TEXT}10`, text: `${TEXT}88` },
  };
  const s = map[status] ?? { label: status, bg: `${TEXT}10`, text: TEXT };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status === "active" && <CheckCircle size={11} />}
      {status === "registration" && <Calendar size={11} />}
      {s.label}
    </span>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return "TBD";
  return new Date(d + "T00:00:00").toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function CalendarSection() {
  const { data: calendar, isLoading } = trpc.skillsCalendar.list.useQuery();

  return (
    <section id="calendar" className="py-20 md:py-28 px-6" style={{ backgroundColor: W }}>
      <div className="max-w-6xl mx-auto">
        <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>PROGRAM CALENDAR</p>
        <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-2" style={{ color: TEXT }}>Upcoming quarters.</h2>
        <p className="text-[14px] mb-4 opacity-50" style={{ color: TEXT }}>Three tracks run Monday to Wednesday. Robotics lab on Thursday and Friday.</p>

        {/* Weekly rhythm note */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { day: "Mon-Wed", desc: "Track sessions", icon: BookOpen },
            { day: "Thu-Fri", desc: "Robotics lab", icon: Lightbulb },
          ].map(r => (
            <div key={r.day} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px]"
              style={{ backgroundColor: `${DARK}08`, border: `1px solid ${DARK}12` }}>
              <r.icon size={13} style={{ color: DARK }} />
              <span className="font-semibold" style={{ color: DARK }}>{r.day}</span>
              <span style={{ color: `${TEXT}88` }}>{r.desc}</span>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin" style={{ color: GOLD }} />
            <span className="ml-3 text-sm" style={{ color: `${TEXT}55` }}>Loading calendar...</span>
          </div>
        )}

        {!isLoading && (!calendar || calendar.length === 0) && (
          <div className="rounded-2xl border p-8 text-center" style={{ borderColor: `${DARK}15`, backgroundColor: `${DARK}06` }}>
            <Calendar size={32} className="mx-auto mb-3 opacity-20" style={{ color: TEXT }} />
            <p className="text-sm font-medium" style={{ color: TEXT }}>Calendar coming soon.</p>
            <p className="text-xs mt-1 opacity-50" style={{ color: TEXT }}>Check back for upcoming quarter dates.</p>
          </div>
        )}

        {!isLoading && calendar && calendar.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {(calendar as any[]).map((q: any) => (
              <div key={q.id} className="rounded-2xl border overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: `${DARK}15`, backgroundColor: BG }}>
                {/* Card header */}
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${DARK}10` }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-[18px] font-semibold" style={{ color: DARK }}>{q.quarter?.replace("-", " ")}</p>
                      {q.theme && <p className="text-[13px] italic mt-0.5" style={{ color: GOLD }}>{q.theme}</p>}
                    </div>
                    <CalendarStatusBadge status={q.status ?? q.calendarStatus ?? "upcoming"} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: `${TEXT}66` }}>
                    <Calendar size={11} />
                    <span>Registration: {formatDate(q.registrationStart)} - {formatDate(q.registrationEnd)}</span>
                  </div>
                </div>

                {/* Tracks */}
                <div className="px-6 py-4 space-y-3">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: `${TEXT}44` }}>TRACKS (Mon-Wed)</p>
                  {[
                    { name: q.track1Name, time: q.track1Time || "8:00 AM - 10:00 AM", num: 1 },
                    { name: q.track2Name, time: q.track2Time || "10:30 AM - 12:30 PM", num: 2 },
                    { name: q.track3Name, time: q.track3Time || "1:30 PM - 3:30 PM", num: 3 },
                  ].filter(t => t.name).map(t => (
                    <div key={t.num} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: `${DARK}12`, color: DARK }}>{t.num}</div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: TEXT }}>{t.name}</p>
                        <p className="text-[11px] flex items-center gap-1" style={{ color: `${TEXT}55` }}>
                          <Clock size={10} /> {t.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {q.roboticsName && (
                    <>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase pt-2" style={{ color: `${TEXT}44` }}>
                        ROBOTICS ({q.roboticsDays || "Thu-Fri"})
                      </p>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: `${GOLD}20` }}>
                          <Lightbulb size={11} style={{ color: GOLD }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: TEXT }}>{q.roboticsName}</p>
                          <p className="text-[11px] flex items-center gap-1" style={{ color: `${TEXT}55` }}>
                            <Clock size={10} /> {q.roboticsTime || "10:00 AM - 1:00 PM"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Key dates */}
                <div className="px-6 pb-6 pt-2">
                  <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: `${DARK}06` }}>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: `${TEXT}44` }}>KEY DATES</p>
                    {[
                      { label: "Orientation", date: q.orientationDate },
                      { label: "Classes", date: `${formatDate(q.classesStart)} - ${formatDate(q.classesEnd)}` },
                      { label: "Graduation", date: q.graduationDate },
                      ...(q.executiveCircleStart ? [{ label: "Executive Circle", date: `${formatDate(q.executiveCircleStart)} - ${formatDate(q.executiveCircleEnd)}` }] : []),
                    ].map(d => (
                      <div key={d.label} className="flex items-center justify-between text-[12px]">
                        <span style={{ color: `${TEXT}66` }}>{d.label}</span>
                        <span className="font-medium" style={{ color: DARK }}>
                          {typeof d.date === "string" && d.date.includes("-") && !d.date.includes(" - ") ? formatDate(d.date) : d.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SkillsPortal() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // How We Work
  const [activeStep, setActiveStep] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);

  // My Update
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <PageMeta
        title="Hamzury Skills. Business Education & Professional Development"
        description="Cohort-based business education for ambitious professionals. Digital marketing, business development, data analysis, and AI programs."
      />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 relative ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${GOLD}18` : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}>
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <span className="font-semibold tracking-[2px] text-sm" style={{ color: TEXT }}>HAMZURY SKILLS</span>
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: TEXT }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-t"
            style={{ backgroundColor: W, borderColor: `${GOLD}20`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Systemise", href: "/systemise" },
                { label: "BizDoc Consult", href: "/bizdoc" },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
                  style={{ color: TEXT }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-[8%] max-w-[1200px] mx-auto pt-16">
        <span className="text-xs tracking-[3px] font-normal mb-6 uppercase" style={{ color: GOLD }}>Business Education</span>
        <h1 className="text-[clamp(40px,7vw,72px)] leading-[1.05] font-normal tracking-tight mb-6" style={{ color: TEXT }}>
          Learn what<br />actually works.
        </h1>
        <p className="text-[clamp(16px,2vw,20px)] leading-relaxed font-light max-w-[560px] mb-12" style={{ color: `${TEXT}CC` }}>
          Practical training for founders, operators, and teams. Build income, capability, and real market ability.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
            className="px-10 py-5 rounded-lg text-sm font-medium uppercase tracking-[1px] shadow-lg flex items-center gap-3 hover:-translate-y-1 transition-all"
            style={{ backgroundColor: DARK, color: BG, boxShadow: `0 8px 32px ${DARK}25` }}>
            Our Services <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => myUpdateRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="px-7 py-4 rounded-lg text-sm font-medium border transition-opacity hover:opacity-80 inline-flex items-center gap-2"
            style={{ borderColor: `${TEXT}30`, color: TEXT }}>
            Track <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 px-6 border-t border-b" style={{ borderColor: `${TEXT}12`, backgroundColor: W }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: "1,200+", label: "Students Trained" },
            { stat: "85+",    label: "Businesses Launched" },
            { stat: "13",     label: "Programs in 2026" },
            { stat: "4.8/5",  label: "Student Rating" },
          ].map(item => (
            <div key={item.label}>
              <p className="text-2xl font-light mb-1" style={{ color: TEXT }}>{item.stat}</p>
              <p className="text-xs tracking-wide uppercase opacity-50" style={{ color: TEXT }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAMS 2026 ── */}
      <section id="programs" className="py-20 md:py-28" style={{ backgroundColor: BG }}>
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>2026 PROGRAMS</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-3" style={{ color: TEXT }}>Three quarters. Nine cohort programs.</h2>
          <p className="text-[15px] opacity-50 mb-14" style={{ color: TEXT }}>Each quarter builds on the last. Pick the stage that matches where you are.</p>

          {/* Q2 */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${DARK}12`, color: DARK }}>Q2</span>
              <span className="text-[15px] font-medium" style={{ color: TEXT }}>Start and Sell</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PROGRAMS_2026.filter(p => p.quarter === "Q2").map(p => (
                <div key={p.program} className="rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: W, borderColor: `${DARK}15` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon size={16} style={{ color: DARK }} />
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: GOLD }}>{p.badge}</span>
                  </div>
                  <h3 className="text-[16px] font-semibold mb-2" style={{ color: TEXT }}>{p.program}</h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: `${TEXT}88` }}>{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${DARK}08`, color: DARK }}>{p.duration}</span>
                    <button onClick={() => {
                        localStorage.setItem("hamzury-chat-context", `I am interested in the ${p.program} program. Tell me more.`);
                        const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                        if (btn) btn.click();
                      }}
                      className="text-[12px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: DARK }}>
                      Apply Now <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q3 */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${DARK}12`, color: DARK }}>Q3</span>
              <span className="text-[15px] font-medium" style={{ color: TEXT }}>Systemize and Grow</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PROGRAMS_2026.filter(p => p.quarter === "Q3").map(p => (
                <div key={p.program} className="rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: W, borderColor: `${DARK}15` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon size={16} style={{ color: DARK }} />
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: GOLD }}>{p.badge}</span>
                  </div>
                  <h3 className="text-[16px] font-semibold mb-2" style={{ color: TEXT }}>{p.program}</h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: `${TEXT}88` }}>{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${DARK}08`, color: DARK }}>{p.duration}</span>
                    <button onClick={() => {
                        localStorage.setItem("hamzury-chat-context", `I am interested in the ${p.program} program. Tell me more.`);
                        const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                        if (btn) btn.click();
                      }}
                      className="text-[12px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: DARK }}>
                      Apply Now <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q4 */}
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${DARK}12`, color: DARK }}>Q4</span>
              <span className="text-[15px] font-medium" style={{ color: TEXT }}>Productize and Scale</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PROGRAMS_2026.filter(p => p.quarter === "Q4").map(p => (
                <div key={p.program} className="rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: W, borderColor: `${DARK}15` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon size={16} style={{ color: DARK }} />
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: GOLD }}>{p.badge}</span>
                  </div>
                  <h3 className="text-[16px] font-semibold mb-2" style={{ color: TEXT }}>{p.program}</h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: `${TEXT}88` }}>{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${DARK}08`, color: DARK }}>{p.duration}</span>
                    <button onClick={() => {
                        localStorage.setItem("hamzury-chat-context", `I am interested in the ${p.program} program. Tell me more.`);
                        const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                        if (btn) btn.click();
                      }}
                      className="text-[12px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: DARK }}>
                      Apply Now <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Always Running */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>ALWAYS RUNNING</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ALWAYS_RUNNING.map(p => (
                <div key={p.program} className="rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ backgroundColor: W, borderColor: `${GOLD}20` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <p.icon size={15} style={{ color: GOLD }} />
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: `${TEXT}55` }}>{p.badge}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold mb-2" style={{ color: TEXT }}>{p.program}</h3>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: `${TEXT}77` }}>{p.description}</p>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${GOLD}12`, color: GOLD }}>{p.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>HOW WE WORK</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-12" style={{ color: TEXT }}>From application to execution.</h2>

          <div className="hidden md:block">
            <div className="flex gap-0 rounded-2xl overflow-hidden border mb-8" style={{ borderColor: `${TEXT}15` }}>
              {SKILL_STEPS.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className="flex-1 py-4 px-3 text-center transition-all duration-200"
                  style={{ backgroundColor: activeStep === i ? DARK : "transparent", borderRight: i < SKILL_STEPS.length - 1 ? `1px solid ${TEXT}12` : "none" }}>
                  <div className="text-[10px] font-bold tracking-[0.2em] mb-1" style={{ color: activeStep === i ? GOLD : `${TEXT}55` }}>{s.num}</div>
                  <div className="text-[13px] font-semibold" style={{ color: activeStep === i ? W : TEXT }}>{s.title}</div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl p-8" style={{ backgroundColor: `${TEXT}08` }}>
              <p className="text-[13px] font-semibold mb-2" style={{ color: GOLD }}>{SKILL_STEPS[activeStep].short}</p>
              <p className="text-[15px] leading-relaxed" style={{ color: TEXT }}>{SKILL_STEPS[activeStep].detail}</p>
            </div>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {SKILL_STEPS.map((s, i) => {
              const isOpen = openStep === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden border transition-all"
                  style={{ borderColor: isOpen ? DARK : `${TEXT}15`, backgroundColor: isOpen ? DARK : W }}>
                  <button onClick={() => setOpenStep(isOpen ? null : i)} className="w-full text-left px-5 py-4 flex items-center gap-4">
                    <span className="text-[11px] font-bold tracking-wider w-6" style={{ color: isOpen ? GOLD : `${TEXT}55` }}>{s.num}</span>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold" style={{ color: isOpen ? W : TEXT }}>{s.title}</p>
                      <p className="text-[11px] opacity-60 mt-0.5" style={{ color: isOpen ? W : TEXT }}>{s.short}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? GOLD : `${TEXT}55` }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "300px" : "0px" }}>
                    <p className="px-5 pb-5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COURSE BLUEPRINT LINK ── */}
      <section className="py-12 px-6 text-center" style={{ backgroundColor: CREAM }}>
        <p className="text-sm mb-4 opacity-60" style={{ color: TEXT }}>Detailed curriculum revealed after enrollment.</p>
        <a href="/skills/blueprint"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
          style={{ borderColor: `${DARK}30`, color: DARK }}>
          View Course Blueprint <ArrowRight size={14} />
        </a>
      </section>

      {/* ── ALUMNI VOICES ── */}
      <section className="py-20 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: GOLD }}>Alumni Voices</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Before Hamzury Skills, I was spending ₦80k/month on ads with no strategy. Now I manage my own campaigns profitably.", name: "Zainab Yusuf", program: "Digital Marketing. Cohort 4", outcome: "3× ROI in 60 days" },
              { quote: "I started my consulting business within 2 months of graduating. The business development course gave me the exact framework.", name: "Emmanuel Okonkwo", program: "Business Development. Cohort 3", outcome: "Business launched" },
              { quote: "I went from Excel beginner to building dashboards for 3 corporate clients. The data analysis cohort changed my career.", name: "Halima Abubakar", program: "Data Analysis. Cohort 5", outcome: "3 new clients" },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: W, border: `1px solid ${GOLD}25` }}>
                <span className="text-2xl font-serif" style={{ color: GOLD }}>"</span>
                <p className="text-sm leading-relaxed flex-1" style={{ color: TEXT, opacity: 0.8 }}>{t.quote}</p>
                <div className="pt-3" style={{ borderTop: `1px solid ${GOLD}20` }}>
                  <p className="text-xs font-semibold" style={{ color: TEXT }}>{t.name}</p>
                  <p className="text-xs" style={{ color: GOLD }}>{t.program}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>✓ {t.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: DARK }}>
        <div className="max-w-[800px] mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>THE HAMZURY SKILLS STANDARD</p>
          <h2 className="text-[clamp(24px,4vw,36px)] font-normal tracking-tight mb-6" style={{ color: W }}>
            We don't run generic courses.<br />We build real capability.
          </h2>
          <p className="text-[clamp(15px,2vw,17px)] leading-[1.7] font-light opacity-70" style={{ color: W }}>
            Every program is built around what operators in Nigeria actually need to execute. And taught by people who have done it, not just studied it.
          </p>
        </div>
      </section>

      {/* ── MILESTONES & SUCCESS STORIES ── */}
      <section className="py-20 md:py-28 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>MILESTONES & SUCCESS STORIES</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-2" style={{ color: TEXT }}>Real results. Real people.</h2>
          <p className="text-[14px] mb-10 opacity-50" style={{ color: TEXT }}>Every number represents a life changed. Every story is one of our graduates.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: "1,200+", sub: "Students Trained", color: DARK },
              { label: "85+",    sub: "Businesses Launched by Graduates", color: DARK },
              { label: "28",     sub: "Communities Reached via RIDI", color: DARK },
              { label: "Adaeze O.",   sub: "Went from job-seeker to digital agency owner in 6 months after our Digital Marketing cohort.", color: "#1B4D3E" },
              { label: "Ibrahim K.",  sub: "Landed a software engineering role 3 weeks after IT Foundations. Now mentoring the next cohort.", color: "#1E3A5F" },
              { label: "Shifa AI",    sub: "AI-powered health advisory startup. Born out of the HAMZURY startup incubation programme.", color: "#2C1A0E" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{ borderColor: `${item.color}15`, backgroundColor: `${item.color}06` }}>
                <p className="text-[20px] font-light mb-2" style={{ color: item.color }}>{item.label}</p>
                <p className="text-[13px] leading-relaxed opacity-60" style={{ color: TEXT }}>{item.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── UPCOMING PROGRAMS CALENDAR ── */}
      <CalendarSection />

      {/* ── HALS - ONLINE LMS ── */}
      <section className="py-12 px-6 border-t" style={{ borderColor: `${TEXT}10`, backgroundColor: BG }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: DARK }}>HALS. HAMZURY ADAPTIVE LEARNING SYSTEM</p>
            <p className="text-[15px] font-light mb-1" style={{ color: TEXT }}>Our fully online learning platform.</p>
            <p className="text-[13px] opacity-50" style={{ color: TEXT }}>Access your courses, assignments, and cohort materials. Anytime, anywhere.</p>
          </div>
          <a href="https://hals.hamzury.com" target="_blank" rel="noopener noreferrer"
            className="px-7 py-3.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0 border"
            style={{ borderColor: `${DARK}30`, color: DARK, backgroundColor: W }}>
            Access HALS →
          </a>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section ref={myUpdateRef} className="py-16 px-6 border-t" style={{ borderColor: `${TEXT}10`, backgroundColor: W }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>TRACK</p>
          <h2 className="text-[clamp(22px,3vw,30px)] font-light tracking-tight mb-2" style={{ color: TEXT }}>Track Your Application</h2>
          <p className="text-[13px] mb-8 opacity-50" style={{ color: TEXT }}>Enter the reference code from your application confirmation.</p>
          <div className="flex gap-3 mb-6">
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
              className="flex-1 px-4 py-3 rounded-xl border text-[14px] font-mono outline-none transition-all"
              style={{ borderColor: `${TEXT}20`, backgroundColor: `${TEXT}04`, color: TEXT }}
            />
            <button
              onClick={handleTrack}
              disabled={trackRef.trim().length < 4 || trackQuery.isFetching}
              className="px-5 py-3 rounded-xl text-[13px] font-medium transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: DARK, color: BG }}
            >
              {trackQuery.isFetching ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {trackQuery.isFetching ? "Checking…" : "Check"}
            </button>
          </div>
          {/* Result */}
          {trackSubmitted && !trackQuery.isFetching && (
            <div>
              {trackQuery.data?.found ? (
                <div className="rounded-2xl p-5 border" style={{ borderColor: `${TEXT}12`, backgroundColor: `${TEXT}04` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono opacity-40" style={{ color: TEXT }}>{trackQuery.data.ref}</span>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: `${GOLD}25`, color: DARK }}
                    >
                      {STATUS_LABELS[trackQuery.data.status] ?? trackQuery.data.status}
                    </span>
                  </div>
                  <p className="text-[15px] font-light mb-1" style={{ color: TEXT }}>{trackQuery.data.program}</p>
                  <p className="text-[12px] opacity-40 mb-3" style={{ color: TEXT }}>
                    Applied {new Date(trackQuery.data.createdAt).toLocaleDateString("en-NG")}
                  </p>
                  {/* Payment status */}
                  {trackQuery.data.paymentStatus && trackQuery.data.paymentStatus !== "paid" && (
                    <div className="mt-2 p-3 rounded-xl text-[12px]" style={{ backgroundColor: `${GOLD}12`, color: DARK }}>
                      Payment status: <strong>{trackQuery.data.paymentStatus}</strong>. Transfer to Moniepoint 8067149356 (HAMZURY Skills) to confirm your seat.
                    </div>
                  )}
                  {trackQuery.data.status === "accepted" && (
                    <div className="mt-2 p-3 rounded-xl text-[12px]" style={{ backgroundColor: "#16A34A15", color: "#15803D" }}>
                      🎉 Congratulations. Check your email for onboarding details.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: `${TEXT}05` }}>
                  <p className="text-[14px] font-light mb-1" style={{ color: TEXT }}>Reference not found</p>
                  <p className="text-[12px] opacity-40" style={{ color: TEXT }}>
                    Check the ref format. E.g. HAM-A4K9-1234. Or WhatsApp us on 08067149356.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CEO QUOTE ── */}
      <section className="py-16 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[clamp(18px,3vw,26px)] font-light leading-relaxed italic mb-8 text-white" style={{ opacity: 0.85 }}>
            "The most expensive skill is the one you never learned. We exist to remove that excuse."
          </p>
          <Link href="/skills/ceo">
            <div className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: GOLD, color: DARK }}>CEO</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white group-hover:underline">Skills Division CEO</p>
                <p className="text-[11px]" style={{ color: GOLD, opacity: 0.7 }}>View profile →</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: DARK, color: `${BG}bb` }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-normal tracking-widest text-sm uppercase" style={{ color: BG }}>Hamzury Skills</span>
          <div className="flex items-center gap-6 text-xs flex-wrap justify-center sm:justify-end" style={{ color: `${BG}55` }}>
            <p className="text-[12px] font-light italic mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              "The right skills change everything." — Muhammad Hamzury, Founder
            </p>
            <span>© 2026 Hamzury Skills</span>
            <a href="/login" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Staff</a>
            <a href="/pricing" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Pricing</a>
            <Link href="/alumni" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Alumni</Link>
            <Link href="/ridi" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>RIDI</Link>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Privacy</Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Terms</Link>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM BAR ── */}
      <MotivationalQuoteBar color="#1E3A5F" />
      <div className="md:hidden h-10" />
    </div>
  );
}
