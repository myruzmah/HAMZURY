import { useState, useEffect } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import {
  Monitor, Lock, MessageSquare,
  Eye, EyeOff, Loader2,
  Briefcase, ChevronRight, ChevronDown, Rocket,
  Award, Pin, CreditCard, Brain, Zap,
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen";
import { trpc } from "@/lib/trpc";

const DARK = "#1E3A5F";
const GOLD = "#B48C4C";
const TEXT = "#1A1A1A";
const BG = "#FFFAF6";
const W = "#FFFFFF";

/* ── Course data (same as SkillsPortal) ─────────────────────────────────── */

type CourseItem = {
  name: string;
  duration?: string;
  certificate?: boolean;
  status: "active" | "next" | "coming";
  context: string;
  age?: string;
  prerequisites?: string;
  locations?: string[];
  maxStudents?: number;
  onlinePrice?: number | "free" | "custom";
};

type OfferCategory = {
  id: string;
  title: string;
  icon: typeof Monitor;
  description: string;
  items: CourseItem[];
};

const OFFER_CATEGORIES: OfferCategory[] = [
  {
    id: "business",
    title: "Business Building",
    icon: Briefcase,
    description: "Learn to build, launch, and scale a real business — from idea to first revenue.",
    items: [
      { name: "Service Business in 21 Days", duration: "3 weeks", certificate: true, status: "active", age: "18+", onlinePrice: 15000, context: "I want to learn how to build a service business in 21 days. Please screen me and find the right path for my goals." },
      { name: "Executive Strategy Circle", duration: "1 week", certificate: true, status: "active", age: "25+", prerequisites: "Business owner or C-suite", onlinePrice: 20000, context: "I am interested in the Executive Strategy Circle. Please ask me screening questions." },
      { name: "Staff Digital Skills Training", duration: "Custom", certificate: true, status: "active", age: "Any", onlinePrice: "custom", context: "I am interested in Staff Digital Skills Training for my company. Please ask me about our team size and needs." },
      { name: "Clarity Session", duration: "1 hour", certificate: false, status: "active", age: "Any", onlinePrice: "free", context: "I want to book a free Clarity Session. I'm not sure what direction to take and need guidance." },
    ],
  },
  {
    id: "digital",
    title: "Digital Skills",
    icon: Monitor,
    description: "Hands-on skills that pay. Web development, data, cybersecurity — learn by building.",
    items: [
      { name: "Basic Computer Skills", duration: "3 weeks", certificate: true, status: "active", age: "15+", onlinePrice: 8000, context: "I am interested in Basic Computer Skills online. Please ask me questions to understand my current level and help me enroll." },
      { name: "Website Development", duration: "8 weeks", certificate: true, status: "active", age: "16+", prerequisites: "Basic Computer Skills", onlinePrice: 15000, context: "I am interested in the Website Development course online. Please ask me screening questions to understand my background." },
      { name: "Data Analysis", duration: "8 weeks", certificate: true, status: "active", age: "16+", prerequisites: "Basic Computer Skills", onlinePrice: 15000, context: "I am interested in the Data Analysis course online. Please ask me screening questions to understand my background." },
      { name: "Cybersecurity Fundamentals", duration: "8 weeks", certificate: true, status: "active", age: "17+", prerequisites: "Basic Computer Skills", onlinePrice: 18000, context: "I am interested in Cybersecurity Fundamentals online. Please ask me screening questions." },
      { name: "Faceless Content Creation", duration: "2 weeks", certificate: true, status: "active", age: "16+", onlinePrice: 10000, context: "I am interested in Faceless Content Creation online. Please ask me screening questions." },
    ],
  },
  {
    id: "ai",
    title: "AI & Automation",
    icon: Brain,
    description: "Use AI to work smarter, sell faster, and automate what slows you down.",
    items: [
      { name: "AI & Business Automation", duration: "5 days", certificate: true, status: "active", age: "18+", prerequisites: "Basic Computer Skills", onlinePrice: 15000, context: "I am interested in AI & Business Automation online. Please ask me screening questions." },
      { name: "AI Lead Generation", duration: "3 days", certificate: true, status: "active", age: "18+", onlinePrice: 12000, context: "I am interested in the AI Lead Generation workshop online. Please ask me screening questions." },
      { name: "AI Founder Launchpad", duration: "4 weeks", certificate: true, status: "active", age: "18+", onlinePrice: 18000, context: "I am interested in the AI Founder Launchpad. Please screen me and help me understand if this is the right fit." },
      { name: "Vibe Coding with AI", duration: "3 weeks", certificate: true, status: "active", age: "16+", onlinePrice: 15000, context: "I want to learn Vibe Coding with AI. Please ask me screening questions about my current skills." },
    ],
  },
];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Active", bg: "#16A34A18", text: "#15803D" },
  next: { label: "Next Cohort", bg: `${GOLD}20`, text: "#8B6914" },
  coming: { label: "Coming Soon", bg: `${DARK}10`, text: `${TEXT}66` },
};

const CAT_COLORS: Record<string, string> = {
  business: GOLD,
  digital: "#2563EB",
  ai: "#8B5CF6",
};

// ── Sticky note colors ────────────────────────────────────────────────────
const STICKY_COLORS = [
  { bg: "#FFF9C4", border: "#F9E547", shadow: "#F9E54730" },
  { bg: "#FCE4EC", border: "#F48FB1", shadow: "#F48FB130" },
  { bg: "#E8F5E9", border: "#81C784", shadow: "#81C78430" },
  { bg: "#E3F2FD", border: "#64B5F6", shadow: "#64B5F630" },
  { bg: "#F3E5F5", border: "#CE93D8", shadow: "#CE93D830" },
  { bg: "#FFF3E0", border: "#FFB74D", shadow: "#FFB74D30" },
];

/* ── Component ──────────────────────────────────────────────────────────── */

export default function SkillsHALS() {
  const [scrolled, setScrolled] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [pinnedItem, setPinnedItem] = useState<CourseItem | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeWhyCard, setActiveWhyCard] = useState<number | null>(null);

  // Login state
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector("[data-chat-trigger]") as HTMLElement;
    if (btn) btn.click();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPass.trim()) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: loginId.trim().toUpperCase(), password: loginPass }),
      });
      if (res.ok) {
        window.location.href = "/cso";
        return;
      }
      const studentRes = await fetch(`/api/trpc/skills.trackApplication?input=${encodeURIComponent(JSON.stringify({ ref: loginId.trim().toUpperCase() }))}`);
      if (studentRes.ok) {
        const data = await studentRes.json();
        if (data?.result?.data) {
          localStorage.setItem("hamzury-client-session", JSON.stringify({
            ref: data.result.data.ref, phone: "", name: data.result.data.program,
            service: data.result.data.program, status: data.result.data.status,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
          }));
          window.location.href = "/client/dashboard";
          return;
        }
      }
      setLoginError("Invalid credentials. Check your Student ID or Staff ID and try again.");
    } catch {
      setLoginError("Connection error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <SplashScreen text="HAMZURY" color={DARK} departmentName="HALS" tagline="Hamzury Academy Learning System" />
      <PageMeta title="HALS — Hamzury Academy Learning System" description="Learn in-demand skills. Get certified. Launch your career. Hamzury Academy's complete training portal." />

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/skills"><span className="text-[13px] tracking-[4px] font-light uppercase cursor-pointer" style={{ color: TEXT }}>HALS</span></Link>
          <Link href="/skills"><span className="text-[11px] tracking-[2px] font-light uppercase cursor-pointer transition-opacity hover:opacity-60" style={{ color: `${TEXT}55` }}>Skills</span></Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-[70vh] flex items-center justify-center px-6 pt-24 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-5" style={{ color: GOLD }}>100% ONLINE</p>
          <h1 className="text-[clamp(30px,5.5vw,48px)] font-light leading-[1.08] tracking-tight mb-6" style={{ color: TEXT }}>
            Learn real skills.{" "}
            <span style={{ color: DARK }}>Build real income.</span>
          </h1>
          <p className="text-[15px] leading-relaxed max-w-lg mx-auto mb-10" style={{ color: TEXT, opacity: 0.55 }}>
            No lectures. No theory. Pick a skill, learn by doing, get certified — all from your phone or laptop. No human gatekeepers. Just you and the work.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#programs"
              className="px-7 py-3.5 rounded-full text-[13px] font-medium transition-all hover:scale-[1.02]"
              style={{ backgroundColor: DARK, color: BG }}
            >
              Browse Skills
            </a>
            <button
              onClick={() => openChat("I'm on the HALS page and I want to enroll in a programme. Help me find the right one.")}
              className="px-7 py-3.5 rounded-full text-[13px] font-medium transition-all hover:scale-[1.02]"
              style={{ backgroundColor: `${DARK}08`, color: DARK }}
            >
              <MessageSquare size={14} className="inline mr-1.5" />
              Enroll via Chat
            </button>
          </div>
        </div>
      </section>

      {/* ── STICKY NOTE (pinned course) ── */}
      {pinnedItem && (() => {
        const stickyColor = STICKY_COLORS[pinnedItem.name.length % STICKY_COLORS.length];
        const rotation = ((pinnedItem.name.charCodeAt(0) % 5) - 2) * 0.8;
        return (
          <div className="fixed bottom-20 right-4 z-50 w-[280px] animate-in fade-in slide-in-from-bottom-4" style={{ transform: `rotate(${rotation}deg)` }}>
            <div className="rounded-2xl p-5 shadow-xl relative" style={{ backgroundColor: stickyColor.bg, borderLeft: `4px solid ${stickyColor.border}`, fontFamily: "'Caveat', cursive" }}>
              <button onClick={() => setPinnedItem(null)} className="absolute top-2 right-3 text-[18px] opacity-40 hover:opacity-80">x</button>
              <div className="w-3 h-3 rounded-full mb-3 mx-auto" style={{ backgroundColor: stickyColor.border, boxShadow: `0 0 6px ${stickyColor.shadow}` }} />
              <h4 className="text-[20px] font-bold mb-2" style={{ color: TEXT }}>{pinnedItem.name}</h4>
              <div className="space-y-1 mb-3">
                {pinnedItem.duration && <p className="text-[15px]" style={{ color: `${TEXT}88` }}>{pinnedItem.duration}</p>}
                {pinnedItem.age && <p className="text-[15px]" style={{ color: `${TEXT}88` }}>Age: {pinnedItem.age}</p>}
                {pinnedItem.prerequisites && <p className="text-[14px]" style={{ color: `${TEXT}66` }}>Needs: {pinnedItem.prerequisites}</p>}
                {typeof pinnedItem.onlinePrice === "number" && (
                  <p className="text-[18px] font-bold" style={{ color: DARK }}>₦{pinnedItem.onlinePrice.toLocaleString()}</p>
                )}
                {pinnedItem.onlinePrice === "free" && <p className="text-[18px] font-bold" style={{ color: "#16A34A" }}>Free</p>}
                {pinnedItem.onlinePrice === "custom" && <p className="text-[16px] font-bold" style={{ color: GOLD }}>Custom pricing</p>}
                {pinnedItem.certificate && <p className="text-[14px]" style={{ color: `${TEXT}66` }}>Certificate included</p>}
              </div>
              <button
                onClick={() => { openChat(pinnedItem.context); setPinnedItem(null); }}
                className="w-full py-2.5 rounded-xl text-[14px] font-bold transition-all hover:scale-[1.02]"
                style={{ backgroundColor: DARK, color: BG, fontFamily: "inherit" }}
              >
                Start Now
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── PROGRAMS — Accordion with sticky pitch ── */}
      <section id="programs" className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>PICK A SKILL</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-4 text-center tracking-tight" style={{ color: TEXT }}>
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-[13px] text-center mb-6 max-w-lg mx-auto" style={{ color: `${TEXT}55` }}>
            Tap a category. Tap a course to see the pitch. Nothing over ₦20,000.
          </p>

          {/* ── Quick Sign-In dropdown ── */}
          <div className="max-w-sm mx-auto mb-10">
            <button
              onClick={() => setShowLogin(p => !p)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-all"
              style={{ backgroundColor: `${DARK}06`, color: `${TEXT}66` }}
            >
              <Lock size={13} />
              Already enrolled? Sign in
              <ChevronDown size={14} className="transition-transform duration-200" style={{ transform: showLogin ? "rotate(180deg)" : "rotate(0)" }} />
            </button>
            {showLogin && (
              <form onSubmit={handleLogin} className="mt-3 rounded-xl p-5" style={{ backgroundColor: BG, border: `1px solid ${DARK}10` }}>
                <input
                  type="text"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  placeholder="Ref number (HMZ-26/4-1234)"
                  className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none mb-3"
                  style={{ backgroundColor: W, border: `1px solid ${DARK}08`, color: TEXT }}
                />
                <div className="relative mb-3">
                  <input
                    type={showPass ? "text" : "password"}
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none pr-10"
                    style={{ backgroundColor: W, border: `1px solid ${DARK}08`, color: TEXT }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-2.5 top-2.5" style={{ color: `${TEXT}33` }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {loginError && <p className="text-[11px] text-red-500 mb-2">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loginLoading || !loginId.trim() || !loginPass.trim()}
                  className="w-full py-2.5 rounded-lg text-[13px] font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: DARK, color: BG }}
                >
                  {loginLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Sign In"}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-3">
            {OFFER_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isOpen = expandedCat === cat.id;
              const color = CAT_COLORS[cat.id] || DARK;
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ backgroundColor: BG, border: `1px solid ${isOpen ? color : DARK}${isOpen ? "25" : "08"}` }}>
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
                        <p className="text-[11px]" style={{ color: `${TEXT}44` }}>{cat.items.length} skills</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="transition-transform duration-300" style={{ color: `${TEXT}44`, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <p className="text-[12px] mb-5" style={{ color: `${TEXT}55` }}>{cat.description}</p>
                      <div className="space-y-2">
                        {cat.items.map(item => {
                          const badge = STATUS_BADGE[item.status];
                          const isPinned = pinnedItem?.name === item.name;
                          return (
                            <button
                              key={item.name}
                              onClick={() => setPinnedItem(isPinned ? null : item)}
                              className="w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-sm text-left"
                              style={{ backgroundColor: isPinned ? `${color}08` : W, border: `1px solid ${isPinned ? color : DARK}${isPinned ? "30" : "06"}` }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[13px] font-medium" style={{ color: TEXT }}>{item.name}</span>
                                  <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.text }}>{badge.label}</span>
                                  {isPinned && <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}20`, color: GOLD }}>Pinned</span>}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  {item.duration && <span className="text-[10px]" style={{ color: `${TEXT}44` }}>{item.duration}</span>}
                                  {typeof item.onlinePrice === "number" && (
                                    <span className="text-[10px] font-medium" style={{ color: GOLD }}>₦{item.onlinePrice.toLocaleString()}</span>
                                  )}
                                  {item.onlinePrice === "free" && <span className="text-[10px] font-medium" style={{ color: "#16A34A" }}>Free</span>}
                                  {item.certificate && <span className="text-[10px]" style={{ color: `${TEXT}44` }}>Certificate</span>}
                                </div>
                              </div>
                              <Pin size={14} style={{ color: isPinned ? GOLD : `${TEXT}22` }} />
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

      {/* ── WHY HALS — Horizontal icon flow ── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: GOLD }}>WHY HALS</p>
          <h2 className="text-[clamp(22px,3.5vw,32px)] font-light mb-14 text-center tracking-tight" style={{ color: TEXT }}>
            Built for people who do, not people who wait.
          </h2>

          {/* Icon flow row */}
          <div className="flex items-center justify-center gap-0 mb-6 overflow-x-auto px-2">
            {[
              { icon: Zap, label: "Self-Service", title: "No gatekeepers", desc: "Browse, enroll, pay, start — all without waiting for anyone." },
              { icon: Award, label: "Certificate", title: "Proof of work", desc: "Graduate with a verifiable certificate and a portfolio of real projects." },
              { icon: CreditCard, label: "Affordable", title: "Max ₦20,000", desc: "Every online skill is affordable. No hidden fees. Pay once, learn completely." },
              { icon: Rocket, label: "Founder", title: "Student → Founder", desc: "90% of our graduates have working startups. We build builders." },
            ].map((step, i, arr) => {
              const Icon = step.icon;
              const isActive = activeWhyCard === i;
              return (
                <div key={i} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => setActiveWhyCard(isActive ? null : i)}
                    className="flex flex-col items-center gap-2 transition-all"
                    style={{ minWidth: 72 }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? DARK : `${DARK}08`,
                        boxShadow: isActive ? `0 0 0 4px ${DARK}15` : "none",
                        transform: isActive ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <Icon size={20} style={{ color: isActive ? GOLD : DARK }} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide" style={{ color: isActive ? DARK : `${TEXT}55` }}>{step.label}</span>
                  </button>
                  {i < arr.length - 1 && (
                    <div className="w-8 md:w-12 h-[2px] mx-1 flex-shrink-0" style={{ backgroundColor: i < (activeWhyCard ?? -1) ? GOLD : `${DARK}12` }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Info popup */}
          {activeWhyCard !== null && (() => {
            const steps = [
              { title: "No gatekeepers", desc: "Browse, enroll, pay, start — all without waiting for anyone. The system does the work." },
              { title: "Proof of work", desc: "Graduate with a verifiable certificate, a portfolio of real projects, and a reference number." },
              { title: "Max ₦20,000", desc: "Every online skill is affordable. No hidden fees. No surprises. Pay once, learn completely." },
              { title: "Student → Founder", desc: "90% of our graduates have working startups. We don't just teach — we build builders." },
            ];
            const s = steps[activeWhyCard];
            return (
              <div className="max-w-sm mx-auto rounded-2xl p-6 text-center transition-all animate-in fade-in slide-in-from-bottom-2" style={{ backgroundColor: W, border: `1px solid ${DARK}08`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <h4 className="text-[15px] font-medium mb-2" style={{ color: TEXT }}>{s.title}</h4>
                <p className="text-[12px] leading-relaxed" style={{ color: `${TEXT}77` }}>{s.desc}</p>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-14 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "215+", label: "Students Trained" },
            { value: "90%", label: "Startup Success Rate" },
            { value: "6+", label: "Active Programs" },
            { value: "3", label: "Locations" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-[clamp(24px,4vw,36px)] font-light tracking-tight" style={{ color: GOLD }}>{stat.value}</p>
              <p className="text-[11px] tracking-wide uppercase mt-1" style={{ color: `${W}88` }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>


      {/* FOOTER */}
      <footer className="py-10 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]" style={{ color: TEXT, opacity: 0.4 }}>
          <Link href="/skills"><span className="cursor-pointer">Hamzury Skills</span></Link>
          <p>&copy; {new Date().getFullYear()} HAMZURY</p>
          <div className="flex items-center gap-6">
            <Link href="/skills/milestones"><span className="hover:opacity-80 transition-opacity cursor-pointer">Milestones</span></Link>
            <Link href="/skills/startups"><span className="hover:opacity-80 transition-opacity cursor-pointer">Startups</span></Link>
            <Link href="/skills/alumni"><span className="hover:opacity-80 transition-opacity cursor-pointer">Alumni</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
