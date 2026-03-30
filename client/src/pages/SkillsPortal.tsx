import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Users, GraduationCap, Star, Target,
  Lightbulb, BookOpen, X, Loader2, Menu,
  Calendar, Clock, CheckCircle, MessageSquare, Eye, EyeOff,
} from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS PORTAL. /skills — Apple-standard design
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#1E3A5F";   // Dark navy blue
const GOLD  = "#B48C4C";   // Gold accent (5% usage)
const TEXT  = "#1A1A1A";
const BG    = "#FFFAF6";   // Milk white
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
  { icon: Lightbulb, quarter: "Q2", badge: "START & SELL", program: "AI Founder Launchpad", description: "Build your idea, offer, brand, and first revenue path using AI tools.", duration: "3-week cohort" },
  { icon: BookOpen, quarter: "Q2", badge: "START & SELL", program: "Vibe Coding for Founders", description: "Build MVPs and internal tools with AI-assisted coding.", duration: "3-week cohort" },
  { icon: Target, quarter: "Q2", badge: "START & SELL", program: "AI Sales Operator", description: "Lead generation, follow-up systems, and AI-powered sales.", duration: "3-week cohort" },
  { icon: Star, quarter: "Q3", badge: "SYSTEMIZE & GROW", program: "Service Business in 21 Days", description: "Launch a real service business from scratch in 3 weeks.", duration: "3-week cohort" },
  { icon: Lightbulb, quarter: "Q3", badge: "SYSTEMIZE & GROW", program: "Operations Automation Sprint", description: "Automate invoicing, follow-ups, onboarding, and reporting.", duration: "3-week cohort" },
  { icon: BookOpen, quarter: "Q3", badge: "SYSTEMIZE & GROW", program: "AI Marketing and Content Engine", description: "Build a content and marketing system powered by AI.", duration: "3-week cohort" },
  { icon: GraduationCap, quarter: "Q4", badge: "PRODUCTIZE & SCALE", program: "Digital Product Builder", description: "Turn your knowledge into a sellable digital product.", duration: "3-week cohort" },
  { icon: Star, quarter: "Q4", badge: "PRODUCTIZE & SCALE", program: "Dashboard Builder Lab", description: "Build internal dashboards and data tools for businesses.", duration: "3-week cohort" },
  { icon: Users, quarter: "Q4", badge: "PRODUCTIZE & SCALE", program: "Customer Success and Business Ops Lab", description: "Master client management and business operations.", duration: "3-week cohort" },
];

const ALWAYS_RUNNING: Program[] = [
  { icon: Lightbulb, quarter: "Always", badge: "ONGOING", program: "Robotics and Creative Tech Lab", description: "Hands-on robotics, coding, and creative problem-solving.", duration: "Ongoing" },
  { icon: Users, quarter: "Always", badge: "ONGOING", program: "Corporate Staff Training", description: "Custom training for company teams at your pace.", duration: "Ongoing" },
  { icon: BookOpen, quarter: "Always", badge: "ONGOING", program: "HALS — AI Learning System", description: "Self-paced online learning platform.", duration: "Ongoing" },
  { icon: GraduationCap, quarter: "Always", badge: "ONGOING", program: "RIDI Sponsorship", description: "Subsidized training for underserved communities.", duration: "Ongoing" },
];

// ── CALENDAR HELPERS ──────────────────────────────────────────────────────────
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
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wide"
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
    <section id="calendar" className="py-24 md:py-32 px-6" style={{ backgroundColor: W }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>
          CALENDAR
        </p>
        <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-16 text-center tracking-tight" style={{ color: TEXT }}>
          Upcoming quarters.
        </h2>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="animate-spin" style={{ color: GOLD }} />
            <span className="ml-3 text-sm" style={{ color: `${TEXT}55` }}>Loading calendar...</span>
          </div>
        )}

        {!isLoading && (!calendar || calendar.length === 0) && (
          <div className="rounded-[20px] p-10 text-center" style={{ backgroundColor: `${DARK}04` }}>
            <Calendar size={28} className="mx-auto mb-3" style={{ color: TEXT, opacity: 0.2 }} />
            <p className="text-[14px] font-light" style={{ color: TEXT }}>Calendar coming soon.</p>
          </div>
        )}

        {!isLoading && calendar && calendar.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(calendar as any[]).map((q: any) => (
              <div
                key={q.id}
                className="rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: BG, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[16px] font-medium" style={{ color: DARK }}>{q.quarter?.replace("-", " ")}</p>
                    {q.theme && <p className="text-[12px] mt-0.5" style={{ color: GOLD }}>{q.theme}</p>}
                  </div>
                  <CalendarStatusBadge status={q.status ?? q.calendarStatus ?? "upcoming"} />
                </div>

                <div className="space-y-2.5 mb-4">
                  {[
                    { name: q.track1Name, time: q.track1Time || "8:00 AM - 10:00 AM", num: 1 },
                    { name: q.track2Name, time: q.track2Time || "10:30 AM - 12:30 PM", num: 2 },
                    { name: q.track3Name, time: q.track3Time || "1:30 PM - 3:30 PM", num: 3 },
                  ].filter(t => t.name).map(t => (
                    <div key={t.num} className="flex items-center gap-2.5">
                      <span className="text-[10px] font-medium w-4 text-center" style={{ color: DARK, opacity: 0.4 }}>{t.num}</span>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: TEXT }}>{t.name}</p>
                        <p className="text-[11px] flex items-center gap-1" style={{ color: `${TEXT}55` }}>
                          <Clock size={10} /> {t.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: `${DARK}04` }}>
                  {[
                    { label: "Orientation", date: q.orientationDate },
                    { label: "Classes", date: `${formatDate(q.classesStart)} - ${formatDate(q.classesEnd)}` },
                    { label: "Graduation", date: q.graduationDate },
                    ...(q.executiveCircleStart ? [{ label: "Executive Circle", date: `${formatDate(q.executiveCircleStart)} - ${formatDate(q.executiveCircleEnd)}` }] : []),
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between text-[11px]">
                      <span style={{ color: `${TEXT}55` }}>{d.label}</span>
                      <span className="font-medium" style={{ color: DARK }}>
                        {typeof d.date === "string" && d.date.includes("-") && !d.date.includes(" - ") ? formatDate(d.date) : d.date}
                      </span>
                    </div>
                  ))}
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

  // Staff login (inline)
  const [staffMode, setStaffMode] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [staffPw, setStaffPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!staffId.trim() || !staffPw) return;
    setStaffLoading(true); setStaffError("");
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ staffId: staffId.trim().toUpperCase(), password: staffPw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = data.dashboard;
    } catch (err: unknown) { setStaffError(err instanceof Error ? err.message : String(err)); }
    finally { setStaffLoading(false); }
  }

  // Apply form
  const [applyName, setApplyName] = useState("");
  const [applyPhone, setApplyPhone] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyProgram, setApplyProgram] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyResult, setApplyResult] = useState<{ ref: string } | null>(null);
  const [applyError, setApplyError] = useState("");
  const submitApp = trpc.skills.submitApplication.useMutation();
  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!applyName.trim() || !applyPhone.trim() || !applyProgram) return;
    setApplyLoading(true); setApplyError("");
    try {
      const res = await submitApp.mutateAsync({ fullName: applyName.trim(), phone: applyPhone.trim(), email: applyEmail.trim() || undefined, program: applyProgram });
      setApplyResult({ ref: res.ref });
    } catch (err: unknown) { setApplyError(err instanceof Error ? err.message : String(err)); }
    finally { setApplyLoading(false); }
  }

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

  // Quarter grouping
  const quarters = ["Q2", "Q3", "Q4"] as const;
  const quarterLabels: Record<string, string> = { Q2: "Start and Sell", Q3: "Systemize and Grow", Q4: "Productize and Scale" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <PageMeta
        title="Hamzury Skills. Business Education & Professional Development"
        description="Cohort-based business education for ambitious professionals. Digital marketing, business development, data analysis, and AI programs."
      />

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
          <span className="text-[13px] tracking-[4px] font-light uppercase" style={{ color: TEXT }}>HAMZURY SKILLS</span>
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: TEXT }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {mobileMenuOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
              style={{ backgroundColor: W }}
              onClick={() => setMobileMenuOpen(false)}
            >
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
                { label: "Home",    href: "/" },
                { label: "CEO",     href: "/skills/ceo" },
                { label: "RIDI",    href: "/ridi" },
                { label: "BizDoc",  href: "/bizdoc" },
                { label: "Pricing", href: "/pricing" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── full viewport, one focal point */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-[clamp(32px,6vw,48px)] font-light leading-[1.1] tracking-tight mb-6"
            style={{ color: TEXT }}
          >
            Learn what{" "}
            <span style={{ color: DARK }}>actually works.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-md mx-auto" style={{ color: TEXT, opacity: 0.5 }}>
            Practical training for founders, operators, and teams. Build income, capability, and real market ability.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: DARK, color: BG, boxShadow: `0 4px 24px ${DARK}20` }}
            >
              Apply Now
            </button>
            <button
              onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: TEXT, border: `1px solid ${TEXT}20` }}
            >
              Programs
            </button>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── clean grid cards */}
      <section id="programs" className="py-24 md:py-32" style={{ backgroundColor: BG }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>
            2026 PROGRAMS
          </p>
          <h2
            className="text-[clamp(28px,4vw,42px)] font-light mb-20 text-center leading-tight tracking-tight"
            style={{ color: TEXT }}
          >
            Three quarters. Nine cohort programs.
          </h2>

          {quarters.map(q => (
            <div key={q} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[11px] font-medium tracking-[0.15em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${DARK}08`, color: DARK }}>
                  {q}
                </span>
                <span className="text-[14px] font-light" style={{ color: TEXT, opacity: 0.6 }}>
                  {quarterLabels[q]}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROGRAMS_2026.filter(p => p.quarter === q).map(p => (
                  <div
                    key={p.program}
                    className="rounded-[20px] p-7 transition-all duration-300 hover:-translate-y-1"
                    style={{ backgroundColor: W, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}
                  >
                    <h3 className="text-[15px] font-semibold mb-2" style={{ color: TEXT }}>{p.program}</h3>
                    <p className="text-[13px] leading-relaxed mb-5" style={{ color: TEXT, opacity: 0.55 }}>
                      {p.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium" style={{ color: DARK, opacity: 0.5 }}>
                        {p.duration}
                      </span>
                      <button
                        onClick={() => openChat(`I am interested in the ${p.program} program. Tell me more.`)}
                        className="text-[12px] font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
                        style={{ color: GOLD }}
                      >
                        Apply <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Always Running */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[11px] font-medium tracking-[0.15em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>
                ALWAYS RUNNING
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ALWAYS_RUNNING.map(p => (
                <div
                  key={p.program}
                  className="rounded-[20px] p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: W, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}
                >
                  <h3 className="text-[14px] font-semibold mb-2" style={{ color: TEXT }}>{p.program}</h3>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: TEXT, opacity: 0.5 }}>
                    {p.description}
                  </p>
                  <span className="text-[11px] font-medium" style={{ color: GOLD }}>
                    {p.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CALENDAR ── */}
      <CalendarSection />

      {/* ── APPLY ── */}
      <section id="apply" className="py-24 md:py-32" style={{ backgroundColor: W }}>
        <div className="max-w-md mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>
            APPLY
          </p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-3 text-center" style={{ color: TEXT }}>
            Start your application
          </h2>
          <p className="text-[13px] mb-10 text-center" style={{ color: TEXT, opacity: 0.45 }}>
            Pick a program or apply as an IT intern. We'll get back to you within 48 hours.
          </p>

          {applyResult ? (
            <div className="rounded-[20px] p-6 text-center" style={{ backgroundColor: BG }}>
              <p className="text-[13px] font-medium mb-2" style={{ color: DARK }}>Application submitted</p>
              <p className="text-[20px] font-mono font-bold mb-3" style={{ color: GOLD }}>{applyResult.ref}</p>
              <p className="text-[12px]" style={{ color: TEXT, opacity: 0.5 }}>
                Save this reference. Use it in the Track section below to check your status.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-3">
              <input
                type="text" value={applyName} onChange={e => setApplyName(e.target.value)}
                placeholder="Full name" required
                className="w-full px-5 py-3.5 rounded-full text-[14px] outline-none"
                style={{ backgroundColor: `${TEXT}05`, color: TEXT }}
              />
              <input
                type="tel" value={applyPhone} onChange={e => setApplyPhone(e.target.value)}
                placeholder="Phone number" required
                className="w-full px-5 py-3.5 rounded-full text-[14px] outline-none"
                style={{ backgroundColor: `${TEXT}05`, color: TEXT }}
              />
              <input
                type="email" value={applyEmail} onChange={e => setApplyEmail(e.target.value)}
                placeholder="Email (optional)"
                className="w-full px-5 py-3.5 rounded-full text-[14px] outline-none"
                style={{ backgroundColor: `${TEXT}05`, color: TEXT }}
              />
              <select
                value={applyProgram} onChange={e => setApplyProgram(e.target.value)} required
                className="w-full px-5 py-3.5 rounded-full text-[14px] outline-none appearance-none"
                style={{ backgroundColor: `${TEXT}05`, color: applyProgram ? TEXT : `${TEXT}50` }}
              >
                <option value="">Select a program</option>
                <optgroup label="IT Internship">
                  <option value="IT Internship — Systemise">IT Internship — Systemise</option>
                  <option value="IT Internship — Skills">IT Internship — Skills</option>
                  <option value="IT Internship — BizDoc">IT Internship — BizDoc</option>
                  <option value="IT Internship — Media">IT Internship — Media</option>
                </optgroup>
                <optgroup label="Q2 — Start and Sell">
                  <option value="AI Founder Launchpad">AI Founder Launchpad</option>
                  <option value="Vibe Coding for Founders">Vibe Coding for Founders</option>
                  <option value="AI Sales Operator">AI Sales Operator</option>
                </optgroup>
                <optgroup label="Q3 — Systemize and Grow">
                  <option value="Service Business in 21 Days">Service Business in 21 Days</option>
                  <option value="Operations Automation Sprint">Operations Automation Sprint</option>
                  <option value="AI Marketing and Content Engine">AI Marketing and Content Engine</option>
                </optgroup>
                <optgroup label="Q4 — Productize and Scale">
                  <option value="Digital Product Builder">Digital Product Builder</option>
                  <option value="Dashboard Builder Lab">Dashboard Builder Lab</option>
                  <option value="Customer Success and Business Ops Lab">Customer Success and Business Ops Lab</option>
                </optgroup>
                <optgroup label="Always Running">
                  <option value="Robotics and Creative Tech Lab">Robotics and Creative Tech Lab</option>
                  <option value="Corporate Staff Training">Corporate Staff Training</option>
                </optgroup>
              </select>
              {applyError && <p className="text-[12px] text-red-500 text-center">{applyError}</p>}
              <button
                type="submit"
                disabled={applyLoading || !applyName.trim() || !applyPhone.trim() || !applyProgram}
                className="w-full py-3.5 rounded-full text-[14px] font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ backgroundColor: DARK, color: BG }}
              >
                {applyLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {applyLoading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── TRACK ── */}
      <section id="track" ref={myUpdateRef} className="py-24 md:py-32" style={{ backgroundColor: BG }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>
            TRACK
          </p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-3" style={{ color: TEXT }}>
            Track Your Application
          </h2>
          <p className="text-[13px] mb-10" style={{ color: TEXT, opacity: 0.45 }}>
            Enter the reference code from your application confirmation.
          </p>

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

          {/* Result */}
          {trackSubmitted && !trackQuery.isFetching && (
            <div>
              {trackQuery.data?.found ? (
                <div className="rounded-[20px] p-6 text-left" style={{ backgroundColor: W, boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono" style={{ color: TEXT, opacity: 0.35 }}>{trackQuery.data.ref}</span>
                    <span
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: `${GOLD}20`, color: DARK }}
                    >
                      {STATUS_LABELS[trackQuery.data.status] ?? trackQuery.data.status}
                    </span>
                  </div>
                  <p className="text-[15px] font-light mb-1" style={{ color: TEXT }}>{trackQuery.data.program}</p>
                  <p className="text-[12px] mb-4" style={{ color: TEXT, opacity: 0.4 }}>
                    Applied {new Date(trackQuery.data.createdAt).toLocaleDateString("en-NG")}
                  </p>
                  {trackQuery.data.paymentStatus && trackQuery.data.paymentStatus !== "paid" && (
                    <div className="mb-3 p-3 rounded-xl text-[12px]" style={{ backgroundColor: `${GOLD}10`, color: DARK }}>
                      Payment status: <strong>{trackQuery.data.paymentStatus}</strong>. Transfer to Moniepoint 8067149356 (HAMZURY Skills) to confirm your seat.
                    </div>
                  )}
                  {trackQuery.data.status === "accepted" && (
                    <div className="mb-3 p-3 rounded-xl text-[12px]" style={{ backgroundColor: "#16A34A10", color: "#15803D" }}>
                      Congratulations. Check your email for onboarding details.
                    </div>
                  )}
                  <a
                    href="/client/dashboard"
                    onClick={e => {
                      e.preventDefault();
                      localStorage.setItem("hamzury-client-session", JSON.stringify({
                        ref: trackQuery.data!.ref, phone: "", name: trackQuery.data!.program,
                        status: trackQuery.data!.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000
                      }));
                      window.location.href = "/client/dashboard";
                    }}
                    className="block w-full py-3 rounded-full text-[13px] font-medium text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: DARK, color: BG }}
                  >
                    Open Full Dashboard
                  </a>
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: TEXT, opacity: 0.45 }}>
                  Reference not found. You will receive your reference after payment. Use our chat to get started.
                </p>
              )}
            </div>
          )}

          {/* Staff login toggle */}
          <div className="mt-12">
            <button onClick={() => setStaffMode(s => !s)} className="text-[11px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70" style={{ color: TEXT, opacity: 0.25 }}>
              {staffMode ? "Back to Track" : "Staff?"}
            </button>
            {staffMode && (
              <form onSubmit={handleStaffLogin} className="mt-4 space-y-3 max-w-xs mx-auto">
                <input type="text" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="Staff ID" className="w-full px-4 py-3 rounded-full text-[13px] outline-none" style={{ backgroundColor: `${TEXT}06`, color: TEXT }} />
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={staffPw} onChange={e => setStaffPw(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-full text-[13px] outline-none pr-10" style={{ backgroundColor: `${TEXT}06`, color: TEXT }} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60" style={{ color: TEXT }}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                {staffError && <p className="text-[12px] text-red-500">{staffError}</p>}
                <button type="submit" disabled={staffLoading || !staffId.trim() || !staffPw} className="w-full py-3 rounded-full text-[13px] font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2" style={{ backgroundColor: TEXT, color: GOLD }}>
                  {staffLoading ? <Loader2 size={14} className="animate-spin" /> : null}{staffLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── minimal */}
      <footer className="py-10 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]" style={{ color: TEXT, opacity: 0.4 }}>
          <p>Hamzury Skills</p>
          <p>© {new Date().getFullYear()} HAMZURY</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy"><span className="hover:opacity-80 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-80 transition-opacity cursor-pointer">Terms</span></Link>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color="#1E3A5F" />
      <div className="md:hidden h-10" />
    </div>
  );
}
