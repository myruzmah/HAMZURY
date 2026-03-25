import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";
import { getLoginUrl } from "@/const";

import {
  ShieldCheck, Cpu, GraduationCap,
  ArrowRight, LogOut,
  Menu, X, ChevronDown, CheckCircle,
  Sparkles, Search, TrendingUp, MessageSquare,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

const LOGIN_URL = import.meta.env.DEV ? "/dev-login" : getLoginUrl();

const TEAL  = "#0A1F1C";
const GREEN = "#34A853";
const GOLD  = "#C9A97E";
const CREAM = "#FBF8EE";
const WHITE = "#FFFFFF";
const DARK  = "#1A1A1A";

const ROLE_DASHBOARDS: Record<string, { label: string; path: string }[]> = {
  admin: [
    { label: "CEO Hub",    path: "/hub/ceo"     },
    { label: "CSO Hub",    path: "/hub/cso"     },
    { label: "Finance",    path: "/hub/finance"  },
    { label: "HR Hub",     path: "/hub/federal"  },
    { label: "BizDev",     path: "/hub/bizdev"   },
  ],
  user: [
    { label: "My Dashboard", path: "/bizdoc/dashboard" },
    { label: "My Learning",  path: "/skills/student"  },
  ],
};

const DEPARTMENTS = [
  {
    id: "bizdoc" as const,
    label: "BizDoc Consult",
    sub: "Compliance & Regulatory",
    icon: <ShieldCheck size={28} />,
    color: "#1B4D3E",
    href: "/bizdoc",
    intro: "Your business is not legally protected until the filings are done. BizDoc handles every compliance obligation — so no raids, no penalties, no surprises.",
    pricing: "Starting from ₦50,000",
    services: [
      "CAC registration & annual filings",
      "Industry licenses (NAFDAC, SON, DPR, Export)",
      "Tax compliance — VAT, PAYE, TCC",
      "Corporate contracts & legal frameworks",
      "Trademark & intellectual property",
      "Business bank account facilitation",
    ],
  },
  {
    id: "systemise" as const,
    label: "Systemize",
    sub: "Strategy & Automation",
    icon: <Cpu size={28} />,
    color: TEAL,
    href: "/systemise",
    intro: "Most businesses fail not from bad ideas, but from broken systems. Systemize builds the infrastructure that lets your business run without you being in every decision.",
    pricing: "Starting from ₦150,000",
    services: [
      "Premium brand identity & positioning",
      "Website design & digital architecture",
      "Business process automation",
      "CRM & client management systems",
      "Social media & content systems",
      "Growth strategy & market positioning",
    ],
  },
  {
    id: "skills" as const,
    label: "Hamzury Skills",
    sub: "Talent & Development",
    icon: <GraduationCap size={28} />,
    color: "#8B6914",
    href: "/skills",
    intro: "Your team's capability ceiling is your business's growth ceiling. Hamzury Skills closes that gap with practical programs taught by operators, not theorists.",
    pricing: "Starting from ₦35,000 per cohort",
    services: [
      "Business Essentials intensive cohorts",
      "Digital marketing & growth programs",
      "IT internship & technical training",
      "CEO & leadership development programs",
      "AI-powered learning tracks",
      "RIDI scholarship program for communities",
    ],
  },
];

const BUBBLE_QUESTIONS = [
  // BizDoc — compliance & registration
  "How do I register my business legally?",
  "What documents do I need for CAC registration?",
  "How long does business registration take?",
  "What licenses does my type of business need?",
  "How do I file my annual returns?",
  "Can you help with trademark registration?",
  "What is tax clearance and why do I need it?",
  "How do I get a TIN number?",
  // Systemize — brand, systems, growth
  "How do I build a brand that attracts premium clients?",
  "Can HAMZURY design and build my website?",
  "How do I automate my business operations?",
  "What is a CRM and does my business need one?",
  "How do I create a consistent social media presence?",
  "How do I position my business to charge more?",
  "Can you help with my business growth strategy?",
  "What does it take to make my business scalable?",
  // Hamzury Skills — training & education
  "What training programs does HAMZURY offer?",
  "How do I improve my digital marketing skills?",
  "Is there a business essentials program for founders?",
  "What is included in the CEO development program?",
  "Can my whole team join a Skills cohort together?",
  "How do I apply for the RIDI scholarship?",
  // General / conversion
  "How does HAMZURY work step by step?",
  "Do you offer payment plans for your services?",
];

const PLACEHOLDERS = [
  "How do I register my business?",
  "What brand services do you offer?",
  "How long does CAC registration take?",
  "Does my business need a trademark?",
  "How can I automate my operations?",
  "What skills programs are available?",
  "How do I get started with HAMZURY?",
  "Can I pay in instalments?",
  "What is included in BizDoc?",
  "How do I build a premium brand?",
  "What industries do you work with?",
  "How do I grow my business faster?",
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"bizdoc" | "systemise" | "skills" | "ask" | "track" | null>(null);
  const [askMeOpen, setAskMeOpen] = useState(false);
  const [askMeInitialQ, setAskMeInitialQ] = useState("");
  const [trackRef, setTrackRef] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackNotFound, setTrackNotFound] = useState(false);
  const [trackResult, setTrackResult] = useState<null | { ref: string; clientName: string | null; businessName: string | null; service: string | null; status: string; progress: number }>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [dropdownQ, setDropdownQ] = useState("");
  const dropdownInputRef = useRef<HTMLInputElement>(null);
  const [partnershipOpen, setPartnershipOpen] = useState(false);

  const trackQuery = trpc.tracking.lookupByPhone.useQuery(
    { phone: trackRef },
    { enabled: false, retry: false }
  );

  function handleTrack() {
    if (trackRef.trim().length < 7) return;
    setTrackLoading(true);
    setTrackNotFound(false);
    setTrackResult(null);
    trackQuery.refetch().then(res => {
      setTrackLoading(false);
      if (res.data?.found) {
        const d = res.data;
        setTrackResult({
          ref: d.ref,
          clientName: d.clientName ?? null,
          businessName: d.businessName ?? null,
          service: d.service ?? null,
          status: d.status,
          progress: d.progress ?? Math.round(((d.statusIndex + 1) / d.statusTotal) * 100),
        });
      } else {
        setTrackNotFound(true);
      }
    }).catch(() => { setTrackLoading(false); setTrackNotFound(true); });
  }

  function openTrackTab() {
    setActiveTab("track");
    setTimeout(() => document.getElementById("what")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  const dashboards = ROLE_DASHBOARDS[user?.role || "user"] || ROLE_DASHBOARDS.user;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function openAskMe(q?: string) {
    setAskMeInitialQ(q || "");
    setAskMeOpen(true);
  }

  // Auto-focus dropdown search bar when Ask Me card opens
  useEffect(() => {
    if (activeTab === "ask") {
      setDropdownQ("");
      setTimeout(() => dropdownInputRef.current?.focus(), 450);
    }
  }, [activeTab]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM, fontFamily: "'Inter', sans-serif" }}>
      <PageMeta
        title="HAMZURY — Compliance, Systems & Skills for Businesses"
        description="Register your business, build your systems, and grow your skills with Hamzury Innovation Hub. BizDoc Consult, Systemize, and Hamzury Skills — all under one roof."
        ogImage="https://hamzury.com/og-image.jpg"
        canonical="https://hamzury.com/"
      />
      {/* JSON-LD LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Hamzury Innovation Hub",
          "url": "https://hamzury.com",
          "logo": "https://hamzury.com/logo.png",
          "description": "Business registration, systems design, and professional training for Nigerian businesses.",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Abuja",
            "addressRegion": "FCT",
            "addressCountry": "NG"
          },
          "telephone": "+2348034620520",
          "openingHours": "Mo-Fr 09:00-18:00",
          "priceRange": "₦₦",
          "sameAs": [
            "https://instagram.com/hamzury",
            "https://linkedin.com/company/hamzury"
          ]
        })}}
      />

      {/* ─── NAV ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${WHITE}F8` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${GOLD}18` : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div
            className="text-xl font-semibold tracking-tight cursor-pointer"
            onClick={() => scrollTo("hero")}
            style={{ color: TEAL, letterSpacing: "-0.03em" }}
          >
            HAMZURY
          </div>

          {/* Desktop center nav */}
          <div className="hidden md:flex items-center gap-8 text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ color: DARK }}>
            <button onClick={() => scrollTo("what")} className="transition-opacity hover:opacity-40">Services</button>
            <button onClick={() => scrollTo("process")} className="transition-opacity hover:opacity-40">Process</button>
            <Link href="/founder" className="transition-opacity hover:opacity-40">Founder</Link>
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 text-[12px] font-medium opacity-40 hover:opacity-80 transition-opacity"
                style={{ color: DARK }}
              >
                <LogOut size={13} />
              </button>
            ) : (
              <button
                onClick={() => { window.location.href = LOGIN_URL; }}
                className="text-[11px] font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all hover:scale-[1.02]"
                style={{ backgroundColor: TEAL, color: CREAM }}
              >
                Login
              </button>
            )}
          </div>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10"
            style={{ color: mobileMenuOpen ? WHITE : TEAL }}
            onClick={() => setMobileMenuOpen(p => !p)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col" style={{ backgroundColor: TEAL, paddingTop: "72px" }}>
          {/* Brand line */}
          <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: `${GOLD}20` }}>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: GOLD }}>Hamzury Innovation Hub</p>
            <p className="text-[12px] font-light" style={{ color: `${CREAM}70` }}>Business Infrastructure</p>
          </div>
          {/* Nav items */}
          <div className="flex-1 flex flex-col px-8 py-8 gap-2">
            <button
              className="text-2xl font-light tracking-tight text-left py-3 border-b transition-opacity hover:opacity-60"
              style={{ color: CREAM, borderColor: `${GOLD}15` }}
              onClick={() => { scrollTo("what"); setMobileMenuOpen(false); }}>
              Services
            </button>
            <button
              className="text-2xl font-light tracking-tight text-left py-3 border-b transition-opacity hover:opacity-60"
              style={{ color: CREAM, borderColor: `${GOLD}15` }}
              onClick={() => { scrollTo("process"); setMobileMenuOpen(false); }}>
              Process
            </button>
            <Link href="/founder"
              className="text-2xl font-light tracking-tight py-3 border-b block transition-opacity hover:opacity-60"
              style={{ color: CREAM, borderColor: `${GOLD}15` }}
              onClick={() => setMobileMenuOpen(false)}>
              Founder
            </Link>
            <button
              className="text-2xl font-light tracking-tight text-left py-3 transition-opacity hover:opacity-60"
              style={{ color: CREAM }}
              onClick={() => { openTrackTab(); setMobileMenuOpen(false); }}>
              My Update
            </button>
          </div>
          {/* Department chips */}
          <div className="px-8 pb-6">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: `${GOLD}80` }}>Departments</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "BizDoc Consult", href: "/bizdoc", color: "#1B4D3E" },
                { label: "Systemise", href: "/systemise", color: TEAL },
                { label: "Hamzury Skills", href: "/skills", color: "#8B6914" },
              ].map(d => (
                <Link key={d.href} href={d.href}
                  className="flex items-center gap-3 py-2 transition-opacity hover:opacity-70"
                  onClick={() => setMobileMenuOpen(false)}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                  <span className="text-sm font-medium" style={{ color: CREAM }}>{d.label}</span>
                </Link>
              ))}
            </div>
          </div>
          {/* Login / Sign Out */}
          <div className="px-8 pb-10" style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))" }}>
            <div className="h-px mb-6 opacity-20" style={{ backgroundColor: GOLD }} />
            {isAuthenticated ? (
              <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-sm font-medium opacity-50" style={{ color: CREAM }}>
                Sign Out
              </button>
            ) : (
              <button onClick={() => { window.location.href = LOGIN_URL; }}
                className="w-full text-sm font-semibold uppercase tracking-wider rounded-full h-14"
                style={{ backgroundColor: GOLD, color: TEAL }}>
                Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section id="hero" className="relative flex flex-col justify-center overflow-hidden" style={{ minHeight: "100svh", backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
          <div className="pt-36 pb-24 md:pt-44 md:pb-32">

            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
              <span className="text-[11px] font-medium tracking-[0.3em] uppercase" style={{ color: GOLD }}>
                Business Infrastructure
              </span>
            </div>

            <h1 className="font-light tracking-tight leading-[0.92] mb-10" style={{
              color: TEAL,
              fontSize: "clamp(3.2rem, 10vw, 8.5rem)",
              letterSpacing: "-0.045em",
            }}>
              Structure for<br />
              <em style={{ color: GREEN, fontStyle: "normal" }}>businesses</em><br />
              that last.
            </h1>

            <p className="text-lg font-light leading-relaxed max-w-lg mb-14" style={{ color: DARK, opacity: 0.5 }}>
              Three departments. One integrated system. Built for businesses that are serious about growth, compliance, and staying in business.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              {/* PRIMARY - explore departments */}
              <button
                onClick={(e) => { e.preventDefault(); document.getElementById("what")?.scrollIntoView({ behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: GREEN, color: WHITE }}
              >
                Explore Services
              </button>
              {/* SECONDARY - for existing clients */}
              <button onClick={openTrackTab}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:opacity-80"
                style={{ borderColor: `${TEAL}50`, color: TEAL, backgroundColor: "transparent", opacity: 0.7 }}
              >
                My Update
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-20 pt-10 border-t max-w-sm" style={{ borderColor: GOLD + "25" }}>
              {[
                { num: "250+",   label: "Businesses Served" },
                { num: "1,200+", label: "Students Trained"  },
                { num: "₦50M+",  label: "Revenue Facilitated" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-3xl font-light mb-1" style={{ color: GREEN }}>{s.num}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-40" style={{ color: DARK }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 animate-bounce">
          <ChevronDown size={20} style={{ color: TEAL }} />
        </div>
      </section>

      {/* Staff quick access bar */}
      {isAuthenticated && (
        <section className="py-4 px-6 md:px-12 border-b" style={{ backgroundColor: WHITE, borderColor: GOLD + "20" }}>
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase mr-2" style={{ color: GOLD }}>
              {user?.name?.split(" ")[0]}
            </span>
            {dashboards.map(d => (
              <Link key={d.path} href={d.path}>
                <button className="px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all hover:scale-[1.02]"
                  style={{ borderColor: TEAL + "20", color: TEAL, backgroundColor: CREAM }}>
                  {d.label}
                </button>
              </Link>
            ))}
          </div>
        </section>
      )}


      {/* ─── WHAT (5 cards: 3 Departments + Ask Me + My Update) ─── */}
      <section id="what" className="py-10 md:py-14 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase border" style={{ color: GREEN, borderColor: CREAM, backgroundColor: CREAM }}>What We Do</span>
          </div>

          <div className="flex flex-col gap-2">

            {/* ── Cards 1–3: Departments ── */}
            {DEPARTMENTS.map(dept => {
              const isOpen = activeTab === dept.id;
              return (
                <div
                  key={dept.id}
                  className="rounded-2xl border overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: isOpen ? dept.color : dept.color + "18",
                    backgroundColor: isOpen ? CREAM : WHITE,
                  }}
                >
                  {/* Header */}
                  <button
                    className="w-full text-left p-6 md:p-7"
                    onClick={() => setActiveTab(isOpen ? null : dept.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: dept.color + "12", color: dept.color }}>
                          {dept.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight" style={{ color: TEAL, letterSpacing: "-0.025em" }}>
                            {dept.label}
                          </h3>
                          <p className="text-[11px] uppercase tracking-wider font-medium opacity-35 mt-0.5" style={{ color: DARK }}>
                            {dept.sub}
                          </p>
                        </div>
                      </div>
                      <ChevronDown size={18} style={{ color: dept.color, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", flexShrink: 0 }} />
                    </div>
                  </button>

                  {/* Expanded content */}
                  <div style={{ maxHeight: isOpen ? "700px" : "0px", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                    <div className="px-6 md:px-7 pb-8 border-t" style={{ borderColor: dept.color + "18", backgroundColor: CREAM }}>
                      {/* Close button */}
                      <div className="flex justify-end pt-4 pb-2">
                        <button
                          onClick={() => setActiveTab(null)}
                          className="flex items-center gap-1 text-[11px] font-medium opacity-40 hover:opacity-80 transition-opacity"
                          style={{ color: dept.color }}
                        >
                          <X size={14} /> Close
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[14px] leading-relaxed mb-6" style={{ color: DARK, opacity: 0.65 }}>{dept.intro}</p>
                          <button
                            onClick={() => setLocation(dept.href)}
                            className="inline-flex items-center gap-2 h-11 px-7 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: dept.color, color: "white" }}
                          >
                            Enter {dept.label} <ArrowRight size={14} />
                          </button>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-4 opacity-35" style={{ color: DARK }}>What we handle</p>
                          <div className="space-y-2.5">
                            {dept.services.map(s => (
                              <div key={s} className="flex items-start gap-3">
                                <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                                <span className="text-[13px] leading-relaxed" style={{ color: DARK, opacity: 0.7 }}>{s}</span>
                              </div>
                            ))}
                          </div>
                          {dept.id === "bizdoc" && <p className="text-xs mt-3 pt-3" style={{ color: "#888", borderTop: "1px solid rgba(10,31,28,0.08)" }}>Services <strong style={{ color: TEAL }}>from ₦50,000</strong> · Free consultation included</p>}
                          {dept.id === "skills" && <p className="text-xs mt-3 pt-3" style={{ color: "#888", borderTop: "1px solid rgba(10,31,28,0.08)" }}>Programs <strong style={{ color: TEAL }}>from ₦35,000</strong> · Flexible payment plans available</p>}
                          {dept.id === "systemise" && <p className="text-xs mt-3 pt-3" style={{ color: "#888", borderTop: "1px solid rgba(10,31,28,0.08)" }}>Projects <strong style={{ color: TEAL }}>from ₦80,000</strong> · Scope review is free</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Card 4: Ask Me ── */}
            {(() => {
              const isOpen = activeTab === "ask";
              return (
                <div
                  className="rounded-2xl border overflow-hidden transition-all duration-300"
                  style={{ borderColor: isOpen ? GOLD : GOLD + "30", backgroundColor: isOpen ? CREAM : WHITE }}
                >
                  <button className="w-full text-left p-6 md:p-7" onClick={() => setActiveTab(isOpen ? null : "ask")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: GOLD + "15", color: GOLD }}>
                          <MessageSquare size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight" style={{ color: TEAL, letterSpacing: "-0.025em" }}>Ask Me Anything</h3>
                          <p className="text-[11px] uppercase tracking-wider font-medium opacity-35 mt-0.5" style={{ color: DARK }}>Instant Answers · AI Powered</p>
                        </div>
                      </div>
                      <ChevronDown size={18} style={{ color: GOLD, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", flexShrink: 0 }} />
                    </div>
                  </button>
                  <div style={{ maxHeight: isOpen ? "700px" : "0px", overflow: "hidden", transition: "max-height 0.45s ease" }}>
                    <div className="border-t" style={{ borderColor: GOLD + "20", backgroundColor: CREAM }}>
                      {/* ── Google homepage layout ── */}
                      <div className="px-6 md:px-8 pt-8 pb-6">
                        {/* Brand / logo area */}
                        <div className="text-center mb-6">
                          <p className="text-[18px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: GOLD }}>HAMZURY</p>
                          <p className="text-[12px]" style={{ color: DARK, opacity: 0.38 }}>Ask anything. Get instant answers.</p>
                        </div>

                        {/* Big pill search bar */}
                        <div className="max-w-sm mx-auto mb-4">
                          <div
                            className="flex items-center rounded-full px-4 py-3 transition-shadow focus-within:shadow-md"
                            style={{ border: `1.5px solid ${DARK}15`, backgroundColor: WHITE, boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
                          >
                            <Search size={17} style={{ color: DARK, opacity: 0.35, flexShrink: 0 }} />
                            <input
                              ref={dropdownInputRef}
                              type="text"
                              value={dropdownQ}
                              onChange={e => setDropdownQ(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && dropdownQ.trim()) openAskMe(dropdownQ); }}
                              placeholder="Ask anything…"
                              className="flex-1 mx-3 text-[15px] outline-none bg-transparent"
                              style={{ color: DARK }}
                            />
                            {dropdownQ ? (
                              <button onClick={() => { setDropdownQ(""); dropdownInputRef.current?.focus(); }}
                                className="opacity-30 hover:opacity-70 transition-opacity shrink-0" style={{ color: DARK }}>
                                <X size={15} />
                              </button>
                            ) : (
                              <Sparkles size={15} style={{ color: GOLD, opacity: 0.5, flexShrink: 0 }} />
                            )}
                          </div>
                        </div>

                        {/* Ask HAMZURY button */}
                        <div className="flex justify-center mb-7">
                          <button
                            onClick={() => openAskMe(dropdownQ || "")}
                            className="px-7 py-2.5 rounded-md text-[13px] font-medium transition-all hover:shadow-md"
                            style={{ backgroundColor: "#f8f9fa", color: DARK, border: "1px solid rgba(0,0,0,0.08)" }}
                          >
                            Ask HAMZURY
                          </button>
                        </div>

                        {/* Suggestions — Google vertical list */}
                        <div>
                          <p className="text-[11px] uppercase tracking-wider mb-2 ml-1" style={{ color: DARK, opacity: 0.28 }}>People also search for</p>
                          <div className="rounded-xl overflow-hidden border" style={{ borderColor: DARK + "10" }}>
                            {shuffle(BUBBLE_QUESTIONS).slice(0, 8).map(q => (
                              <button key={q} onClick={() => openAskMe(q)}
                                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/70 border-b last:border-0 transition-colors"
                                style={{ borderColor: DARK + "07" }}>
                                <Search size={13} style={{ color: DARK, opacity: 0.22, flexShrink: 0 }} />
                                <span className="text-[13px]" style={{ color: DARK, opacity: 0.68 }}>{q}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Card 5: My Update (Client Portal) ── */}
            {(() => {
              const isOpen = activeTab === "track";
              return (
                <div
                  className="rounded-2xl border overflow-hidden transition-all duration-300"
                  style={{ borderColor: isOpen ? TEAL : TEAL + "20", backgroundColor: isOpen ? CREAM : WHITE }}
                >
                  <button className="w-full text-left p-6 md:p-7" onClick={() => setActiveTab(isOpen ? null : "track")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: TEAL + "10", color: TEAL }}>
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight" style={{ color: TEAL, letterSpacing: "-0.025em" }}>My Update</h3>
                          <p className="text-[11px] uppercase tracking-wider font-medium opacity-35 mt-0.5" style={{ color: DARK }}>Live Project Tracking</p>
                        </div>
                      </div>
                      <ChevronDown size={18} style={{ color: TEAL, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", flexShrink: 0 }} />
                    </div>
                  </button>
                  <div style={{ maxHeight: isOpen ? "900px" : "0px", overflow: "hidden", transition: "max-height 0.45s ease" }}>
                    <div className="border-t" style={{ borderColor: TEAL + "18", backgroundColor: TEAL }}>
                      <div className="flex justify-end px-6 pt-4 pb-0">
                        <button onClick={() => setActiveTab(null)} className="flex items-center gap-1 text-[11px] font-medium opacity-40 hover:opacity-80 transition-opacity" style={{ color: CREAM }}>
                          <X size={14} /> Close
                        </button>
                      </div>
                      {/* Portal interior */}
                      <div className="relative px-6 md:px-10 pt-6 pb-10">
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{ backgroundImage: `radial-gradient(circle, ${GOLD}15 1px, transparent 1px)`, backgroundSize: "28px 28px" }}
                        />
                        <div className="relative max-w-md mx-auto text-center">
                          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border" style={{ borderColor: `${GOLD}30`, backgroundColor: `${GOLD}10` }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: GOLD }} />
                            <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: GOLD }}>Client Access</span>
                          </div>
                          <h3 className="font-light mb-2 tracking-tight" style={{ color: WHITE, fontSize: "clamp(1.3rem, 3vw, 1.7rem)", letterSpacing: "-0.03em" }}>
                            Track your project.<br />Access your dashboard.
                          </h3>
                          <p className="text-sm mb-6 leading-relaxed" style={{ color: `${WHITE}60` }}>
                            Enter your HAMZURY reference code to see live progress on your active service.
                          </p>
                          <div className="flex gap-2 max-w-xs mx-auto mb-3">
                            <input
                              type="text"
                              placeholder="e.g. 08034620520"
                              maxLength={15}
                              className="rounded-xl px-4 flex-1 border text-sm outline-none py-3"
                              style={{ backgroundColor: `${WHITE}08`, borderColor: `${WHITE}15`, color: WHITE }}
                              value={trackRef}
                              onChange={e => { setTrackRef(e.target.value); setTrackNotFound(false); setTrackResult(null); }}
                              onKeyDown={e => e.key === "Enter" && handleTrack()}
                            />
                            <button
                              onClick={handleTrack}
                              disabled={trackLoading}
                              className="px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shrink-0 disabled:opacity-50"
                              style={{ backgroundColor: GOLD, color: TEAL }}
                            >
                              {trackLoading ? "…" : "Access"}
                            </button>
                          </div>
                          {trackNotFound && (
                            <p className="text-[12px] mb-3" style={{ color: `${WHITE}50` }}>
                              No file found for this number. Contact your CSO if you just enrolled.
                            </p>
                          )}
                          {trackResult && (
                            <div className="mt-4 rounded-2xl p-5 text-left border" style={{ backgroundColor: `${WHITE}08`, borderColor: `${WHITE}12` }}>
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="text-white font-semibold">{trackResult.businessName || trackResult.clientName || "Your File"}</p>
                                  <p className="text-[11px] font-mono mt-0.5" style={{ color: `${WHITE}45` }}>{trackResult.ref}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `#34A85320`, color: "#34A853" }}>● Live</span>
                              </div>
                              <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1.5" style={{ color: `${WHITE}55` }}>
                                  <span>{trackResult.status}</span>
                                  <span style={{ color: GOLD }}>{trackResult.progress}%</span>
                                </div>
                                <div className="h-1.5 rounded-full" style={{ backgroundColor: `${WHITE}12` }}>
                                  <div className="h-full rounded-full transition-all" style={{ width: `${trackResult.progress}%`, backgroundColor: GOLD }} />
                                </div>
                              </div>
                              <p className="text-xs mb-4" style={{ color: `${WHITE}50` }}>{trackResult.service}</p>
                              <a
                                href="/client/dashboard"
                                className="block text-center py-2.5 rounded-xl text-sm font-semibold w-full transition-all hover:opacity-90"
                                style={{ backgroundColor: GOLD, color: TEAL }}
                                onClick={e => {
                                  e.preventDefault();
                                  localStorage.setItem("hamzury-client-session", JSON.stringify({ ref: trackResult.ref, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }));
                                  window.location.href = "/client/dashboard";
                                }}
                              >
                                Open Full Dashboard →
                              </a>
                            </div>
                          )}
                          <p className="mt-5 text-[11px]" style={{ color: `${WHITE}28` }}>First time? Your CSO will set you up at onboarding.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </section>

      {/* ─── WHO ─── */}
      <section id="who" className="py-24 px-6 md:px-12" style={{ backgroundColor: CREAM }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
            <span className="text-[11px] font-medium tracking-[0.3em] uppercase" style={{ color: GOLD }}>Founder</span>
          </div>
          <blockquote>
            <p
              className="font-light leading-[1.5] mb-10"
              style={{
                color: TEAL,
                fontSize: "clamp(1.35rem, 3vw, 2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              "We built HAMZURY because businesses deserve more than consultants who disappear after the invoice. We stay until the work is done — and we build systems that keep working after we leave."
            </p>
            <Link
              href="/founder"
              className="text-sm font-semibold tracking-wide transition-opacity hover:opacity-60 inline-flex items-center gap-2"
              style={{ color: TEAL }}
            >
              — Muhammad Hamzury <ArrowRight size={14} />
            </Link>
          </blockquote>
        </div>
      </section>


      {/* ─── WHY ─── */}
      <section id="why" className="py-16 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
            <span className="text-[11px] font-medium tracking-[0.3em] uppercase" style={{ color: GOLD }}>Why HAMZURY</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2" style={{ color: TEAL, letterSpacing: "-0.025em" }}>
            Built to solve real problems.
          </h2>
          <p className="text-sm mb-10" style={{ color: "#2C2C2C", opacity: 0.45 }}>
            Every department exists for a reason.
          </p>

          {/* Founder's Why — 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              {
                dept: "BizDoc Consult",
                why: "Too many businesses are shut down, fined, or blocked from contracts because their compliance is incomplete. BizDoc was built to eliminate that risk entirely.",
                color: "#1B4D3E",
              },
              {
                dept: "Systemize",
                why: "A business without systems is just a job. We built Systemize to convert founder-dependent operations into structured, scalable companies.",
                color: "#0A1F1C",
              },
              {
                dept: "Hamzury Skills",
                why: "Skills are the only asset the market can't take from you. We invest in people so they can build businesses that outlast any single trend.",
                color: "#C9A97E",
              },
            ].map(item => (
              <div key={item.dept} className="p-7 rounded-2xl" style={{ backgroundColor: "white", border: "1px solid rgba(10,31,28,0.07)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: item.color }}>{item.dept}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#2C2C2C", opacity: 0.75 }}>{item.why}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── PROCESS INFOGRAPHIC ─── */}
      <section id="process" className="py-20 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px w-8" style={{ backgroundColor: GOLD }} />
            <span className="text-[11px] font-medium tracking-[0.3em] uppercase" style={{ color: GOLD }}>Structure from Day One</span>
          </div>

          {(() => {
            const STEPS = [
              { num: "01", title: "Brief",    short: "Tell us what you need",                detail: "Share what you need — service type, timeline, and any context. The more specific you are, the faster we can move." },
              { num: "02", title: "Assigned", short: "CSO responds within 24 hours",         detail: "Your dedicated Client Success Officer reviews your brief and responds within 24 hours with a clear plan of action." },
              { num: "03", title: "Execute",  short: "Specialists handle the work",          detail: "Our specialists take full ownership. You won't need to chase anyone or explain anything twice." },
              { num: "04", title: "Verify",   short: "Quality checked before it reaches you",detail: "Every deliverable goes through an internal quality check before it leaves our team. No exceptions." },
              { num: "05", title: "Deliver",  short: "Certified and actively maintained",   detail: "Your work is certified, filed, and set up for ongoing maintenance. We don't disappear after delivery." },
            ];

            return (
              <>
                {/* ── Vertical timeline (all viewports) ── */}
                <div className="flex flex-col">
                  {STEPS.map((s, i) => (
                    <div key={s.num}>
                      <button
                        className="flex items-start gap-4 w-full text-left py-3"
                        onClick={() => setSelectedStep(selectedStep === i ? null : i)}
                      >
                        {/* Circle + connector line */}
                        <div className="flex flex-col items-center shrink-0" style={{ width: "40px" }}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 transition-all"
                            style={{
                              backgroundColor: selectedStep === i ? GOLD : TEAL,
                              color: selectedStep === i ? TEAL : GOLD,
                            }}
                          >
                            {s.num}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className="w-px flex-1 mt-1" style={{ minHeight: "20px", backgroundColor: GOLD + "25" }} />
                          )}
                        </div>
                        {/* Text */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="text-[14px] font-semibold" style={{ color: selectedStep === i ? GOLD : TEAL }}>{s.title}</p>
                            <ChevronDown size={16} style={{ color: GOLD, opacity: 0.5, transform: selectedStep === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
                          </div>
                          <p className="text-[12px] mt-0.5" style={{ color: DARK, opacity: 0.4 }}>{s.short}</p>
                          {/* Inline detail on mobile */}
                          <div style={{ maxHeight: selectedStep === i ? "80px" : "0px", overflow: "hidden", transition: "max-height 0.3s ease" }}>
                            <p className="text-[13px] leading-relaxed mt-3 pr-4" style={{ color: DARK, opacity: 0.6 }}>{s.detail}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <footer className="px-6 md:px-12 py-8 border-t" style={{ backgroundColor: TEAL, borderColor: `${GOLD}15` }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-base font-light tracking-tight" style={{ color: CREAM, letterSpacing: "-0.03em" }}>HAMZURY</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: CREAM }}>
            <Link href="/bizdoc"    className="opacity-40 hover:opacity-80 transition-opacity">BizDoc</Link>
            <Link href="/systemise" className="opacity-40 hover:opacity-80 transition-opacity">Systemize</Link>
            <Link href="/skills"    className="opacity-40 hover:opacity-80 transition-opacity">Skills</Link>
            <Link href="/affiliate" className="opacity-40 hover:opacity-80 transition-opacity">Affiliates</Link>
            <button onClick={() => setPartnershipOpen(true)} className="opacity-40 hover:opacity-80 transition-opacity">Partnership</button>
            <Link href="/privacy"   className="opacity-40 hover:opacity-80 transition-opacity">Privacy</Link>
            <Link href="/terms"     className="opacity-40 hover:opacity-80 transition-opacity">Terms</Link>
          </div>
          <button
            onClick={() => { window.location.href = LOGIN_URL; }}
            className="text-[11px] font-medium uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
            style={{ color: GOLD }}
          >
            Staff Login →
          </button>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50" style={{ backgroundColor: WHITE, borderTop: `1px solid ${GOLD}18`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around px-2 py-2">
          <MobileNavItem icon={<ShieldCheck size={20} />} label="Services" onClick={() => document.getElementById("what")?.scrollIntoView({ behavior: "smooth" })} />
          <MobileNavItem icon={<Search size={20} />} label="Ask Me" onClick={() => { setActiveTab("ask"); document.getElementById("what")?.scrollIntoView({ behavior: "smooth" }); setTimeout(() => dropdownInputRef.current?.focus(), 450); }} highlight />
          <MobileNavItem icon={<TrendingUp size={20} />} label="My Update" onClick={openTrackTab} />
        </div>
      </div>
      <div className="md:hidden h-20" />

      {/* Ask Me Search Engine */}
      <AskMeSearch open={askMeOpen} onClose={() => setAskMeOpen(false)} initialQ={askMeInitialQ} />

      {/* Partnership Modal */}
      <PartnershipModal open={partnershipOpen} onClose={() => setPartnershipOpen(false)} />
    </div>
  );
}


// ─── Mobile Nav Item ──────────────────────────────────────────────────────────
function MobileNavItem({ icon, label, href, onClick, highlight }: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void; highlight?: boolean }) {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => { if (onClick) onClick(); else if (href) setLocation(href); }}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
      style={{ minWidth: 0 }}
    >
      <span
        className={`flex items-center justify-center ${highlight ? "w-10 h-10 rounded-full" : "w-10 h-10"}`}
        style={highlight ? { backgroundColor: TEAL, color: GOLD } : { color: TEAL, opacity: 0.45 }}
      >
        {icon}
      </span>
      <span
        className="text-[10px] font-semibold uppercase tracking-wider leading-none"
        style={{ color: TEAL, opacity: highlight ? 1 : 0.4 }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Ask Me Inline Search Bar ─────────────────────────────────────────────────
function AskMeInlineBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="e.g. How do I register my business?"
        className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
        style={{
          border: "1px solid rgba(10,31,28,0.12)",
          backgroundColor: "#FAFAF8",
          color: DARK,
        }}
        onKeyDown={e => {
          if (e.key === "Enter" && val.trim()) onSearch(val.trim());
        }}
      />
      <button
        onClick={() => onSearch(val.trim())}
        className="px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-90"
        style={{ backgroundColor: TEAL, color: GOLD }}
      >
        Ask
      </button>
    </div>
  );
}

// ─── Ask Me Search Engine Popup ───────────────────────────────────────────────
function getSearchResult(input: string): { text: string; actions: { label: string; href: string }[] } {
  const q = input.toLowerCase();
  const match = (kw: string[]) => kw.some(k => q.includes(k));

  if (match(["cac", "register", "registration", "compliance", "tax", "legal", "license", "trademark", "certificate", "nafdac", "filing", "incorporation", "contract", "bank account"])) {
    return {
      text: "BizDoc is HAMZURY's compliance department. We handle CAC registration, tax clearance, industry licenses, corporate contracts, trademarks, and business bank account setup — everything your business needs to be legally sound and investor-ready.",
      actions: [
        { label: "Go to BizDoc →", href: "/bizdoc" },
        { label: "Start an inquiry", href: "/bizdoc" },
        { label: "See how it works", href: "/#process" },
      ],
    };
  }
  if (match(["price", "cost", "how much", "fee", "charge", "naira", "₦", "afford", "expensive"])) {
    return {
      text: "BizDoc services start from ₦50,000 (CAC registration). Systemize starts from ₦150,000 (brand + website). Skills programs range from ₦25,000 (short workshops) to ₦55,000 (10-week data analysis). All services require a 70% deposit upfront, with the remaining 30% on delivery.",
      actions: [
        { label: "BizDoc pricing →", href: "/bizdoc" },
        { label: "Systemize pricing →", href: "/systemise" },
        { label: "Skills programs →", href: "/skills" },
      ],
    };
  }
  if (match(["how long", "duration", "timeline", "days", "weeks", "when will", "how soon", "fast"])) {
    return {
      text: "CAC registration: 5–10 working days (business name: 3–5 days). Systemize projects: 2–6 weeks depending on scope. Skills programs: 2–10 weeks depending on the course. We provide a confirmed timeline after your inquiry is reviewed within 24 hours.",
      actions: [
        { label: "Start a BizDoc filing →", href: "/bizdoc" },
        { label: "See Skills programs →", href: "/skills" },
      ],
    };
  }
  if (match(["ceo", "ceo of hamzury", "who is the ceo", "idris", "chief executive"])) {
    return {
      text: "The CEO of HAMZURY Innovation Hub is Idris Ibrahim — he leads day-to-day operations and also heads the Systemise department, overseeing brand, systems, and digital strategy for clients.",
      actions: [
        { label: "Explore Systemise →", href: "/systemise" },
        { label: "Meet the Founder →", href: "/founder" },
      ],
    };
  }
  if (match(["founder", "muhammad", "hamzury who", "who started", "owner", "behind", "about hamzury"])) {
    return {
      text: "HAMZURY was founded by Muhammad Hamzury — who built the company from the ground up, from a typing shop in Jos to Nigeria's integrated business infrastructure hub. He also serves as Chairman of RIDI. The CEO is Idris Ibrahim.",
      actions: [
        { label: "Meet the Founder →", href: "/founder" },
        { label: "Explore HAMZURY →", href: "/" },
      ],
    };
  }
  if (match(["address", "location", "office", "abuja", "where", "visit", "physical"])) {
    return {
      text: "HAMZURY services are handled fully remotely — no need to come in person. For in-person consultations, reach us via WhatsApp to schedule.",
      actions: [
        { label: "WhatsApp us →", href: "https://wa.me/2348034620520" },
        { label: "Contact BizDoc →", href: "/bizdoc" },
      ],
    };
  }
  if (match(["brand", "website", "automat", "system", "crm", "social", "marketing", "design", "strategy", "digital", "grow", "scale", "process"])) {
    return {
      text: "Systemize is HAMZURY's strategy and systems department. We build premium brand identities, websites, business automation, CRM systems, and social media infrastructure. If you want to stop operating manually and start running like a premium business, Systemize is where you start.",
      actions: [
        { label: "Go to Systemize →", href: "/systemise" },
        { label: "Book a consultation", href: "/systemise" },
        { label: "See Systemize services", href: "/systemise" },
      ],
    };
  }
  if (match(["train", "course", "learn", "skill", "program", "cohort", "student", "education", "internship", "scholarship", "ridi", "talent", "team", "ceo"])) {
    return {
      text: "Skills is HAMZURY's talent and development department. We run business education programs, digital marketing training, IT internships, CEO development, and the RIDI scholarship for underserved communities. If your team needs leveling up — or you do — Skills is the right place.",
      actions: [
        { label: "Go to Skills →", href: "/skills" },
        { label: "Apply for a program", href: "/skills" },
        { label: "Learn about RIDI", href: "/skills" },
      ],
    };
  }
  if (match(["track", "file", "update", "status", "progress", "follow", "my file", "my update", "reference", "stage"])) {
    return {
      text: "You can check your file status under 'My Update'. Log in on the main page with your reference code to see the full timeline — current stage, next steps, and any actions required from you.",
      actions: [
        { label: "Go to My Update →", href: "/track" },
        { label: "Login", href: "/dev-login" },
        { label: "Contact BizDoc", href: "/bizdoc" },
      ],
    };
  }
  if (match(["affiliate", "refer", "earn", "referral", "league"])) {
    return {
      text: "Join our affiliate program and earn 5–13% commission on every business you refer. Tiers: Bronze (5%), Silver (7%), Gold (10%), Platinum (13%). Min withdrawal: ₦20,000. Commissions are paid 30 days after client payment confirmation.",
      actions: [
        { label: "Join affiliate program →", href: "/affiliate" },
        { label: "How affiliates earn", href: "/affiliate" },
        { label: "View the leaderboard", href: "/affiliate" },
      ],
    };
  }
  if (match(["commission"])) {
    return {
      text: "HAMZURY affiliates earn commissions based on referral volume — from 5% (Bronze) to 13% (Platinum). Commissions are paid 30 days after client payment confirmation.",
      actions: [
        { label: "Join affiliate program →", href: "/affiliate" },
        { label: "See commission tiers", href: "/affiliate" },
      ],
    };
  }
  if (match(["refund"])) {
    return {
      text: "We offer refunds only before work commences. Once filing begins, a credit note or revision cycle is offered. A 70% deposit is required upfront — the remaining 30% is due on delivery.",
      actions: [
        { label: "See full policy →", href: "/terms" },
        { label: "Contact BizDoc", href: "/bizdoc" },
      ],
    };
  }
  if (match(["deposit", "70%", "70 percent", "upfront", "payment plan"])) {
    return {
      text: "All services require a 70% upfront deposit before work begins. The remaining 30% is due upon delivery of your documents or completed work. This ensures we can immediately begin your filing or project.",
      actions: [
        { label: "Start a filing →", href: "/bizdoc" },
        { label: "See full policy", href: "/terms" },
      ],
    };
  }
  if (match(["whatsapp", "phone", "call", "reach", "number"])) {
    return {
      text: "You can reach us on WhatsApp at +234 803 462 0520. Click the green WhatsApp button on any page, or message us directly.",
      actions: [
        { label: "WhatsApp us →", href: "https://wa.me/2348034620520" },
        { label: "Contact BizDoc", href: "/bizdoc" },
      ],
    };
  }
  if (match(["contact", "email", "cso", "reach us", "speak"])) {
    return {
      text: "Reach us via WhatsApp (+234 803 462 0520), the chat widget on any page, or email cso@hamzury.com. Response within 24 hours.",
      actions: [
        { label: "WhatsApp us →", href: "https://wa.me/2348034620520" },
        { label: "Go to BizDoc →", href: "/bizdoc" },
      ],
    };
  }
  if (match(["foreign", "foreigner", "expatriate", "expat", "non-nigerian", "nationality"])) {
    return {
      text: "Yes — foreign nationals can register a business with additional documentation. Contact our BizDoc Consult team for a personalised checklist.",
      actions: [
        { label: "Contact BizDoc →", href: "/bizdoc" },
        { label: "See services", href: "/bizdoc" },
      ],
    };
  }
  if (match(["innovation hub", "hamzury hub", "umbrella", "parent company", "full name"])) {
    return {
      text: "Hamzury Innovation Hub is our full brand name — the umbrella company housing BizDoc Consult, Systemize, and Hamzury Skills.",
      actions: [
        { label: "Learn about us →", href: "/founder" },
        { label: "Explore departments", href: "/" },
      ],
    };
  }
  if (match(["how", "process", "work", "step", "start", "begin", "inquire", "contact"])) {
    return {
      text: "HAMZURY works in 5 steps: (1) Submit an inquiry through BizDoc, Systemize, or Skills. (2) Your CSO reviews within 24 hours and assigns a specialist. (3) The team executes and updates you. (4) We verify everything before delivery. (5) Certified work is delivered and maintained. Simple, structured, accountable.",
      actions: [
        { label: "Start with BizDoc →",     href: "/bizdoc"    },
        { label: "Start with Systemize →",  href: "/systemise" },
        { label: "Start with Skills →",     href: "/skills"    },
      ],
    };
  }
  // default
  return {
    text: "HAMZURY is a business infrastructure company with three departments: BizDoc for compliance and regulatory work, Systemize for brand and systems, and Skills for talent development. Together, we cover every critical gap in a growing business.",
    actions: [
      { label: "Explore BizDoc →",     href: "/bizdoc"    },
      { label: "Explore Systemize →",  href: "/systemise" },
      { label: "Explore Skills →",     href: "/skills"    },
    ],
  };
}

// ─── Clarification interpreter ────────────────────────────────────────────────
function getClarification(input: string): string {
  const q = input.toLowerCase();
  const m = (kw: string[]) => kw.some(k => q.includes(k));
  if (m(["cac", "register", "registration", "incorporate", "ltd", "limited"])) return "you want to register a business with CAC";
  if (m(["annual return", "annual filing", "yearly filing"])) return "you need help filing CAC annual returns";
  if (m(["tax", "firs", "vat", "tin", "paye", "tcc"])) return "you need help with tax or FIRS compliance";
  if (m(["trademark", "brand protection", "intellectual property", "ip protection"])) return "you want to protect your brand or trademark";
  if (m(["license", "permit", "nafdac", "son", "dpr", "approval"])) return "you need an industry license or operating permit";
  if (m(["price", "cost", "how much", "fee", "charge", "naira", "₦"])) return "you want to know about pricing or fees";
  if (m(["how long", "duration", "days", "weeks", "timeline", "when will", "how soon"])) return "you want to know how long a service will take";
  if (m(["brand", "website", "web", "design"])) return "you want to build or upgrade your brand and website";
  if (m(["automat", "crm", "system", "process", "workflow"])) return "you want to automate your business operations or set up systems";
  if (m(["social media", "content", "instagram", "tiktok"])) return "you need help with social media or content strategy";
  if (m(["grow", "scale", "strategy", "marketing", "positioning"])) return "you want to grow or scale your business";
  if (m(["internship", "intern"])) return "you want to apply for the HAMZURY internship programme";
  if (m(["scholarship", "ridi", "community", "underserved"])) return "you're asking about the RIDI scholarship programme";
  if (m(["train", "course", "learn", "program", "cohort", "digital marketing training", "data analysis", "ai course"])) return "you're interested in a specific training or skills programme";
  if (m(["ceo", "ceo program", "leadership", "executive"])) return "you're interested in CEO or executive development";
  if (m(["track", "update", "status", "progress", "my file", "my project", "where is my"])) return "you want to check on an active project or file status";
  if (m(["affiliate", "refer", "earn", "referral", "commission"])) return "you want to join the affiliate programme and earn commissions";
  if (m(["refund", "cancel", "money back"])) return "you have a question about refunds or cancellation";
  if (m(["deposit", "70%", "70 percent", "upfront", "payment plan", "installment"])) return "you want to understand the payment or deposit terms";
  if (m(["whatsapp", "call", "reach", "contact", "speak", "email"])) return "you want to get in touch with the HAMZURY team";
  if (m(["founder", "who", "owner", "behind", "about"])) return "you want to learn who founded HAMZURY and why";
  if (m(["address", "location", "office", "abuja", "where", "visit"])) return "you want to know where HAMZURY is located";
  if (m(["how", "process", "work", "step", "start", "begin"])) return "you want to understand how working with HAMZURY works step by step";
  return `you're asking about "${input.trim().toLowerCase()}"`;
}

type ChatMessage = { role: "user" | "assistant"; text: string; actions?: { label: string; href: string }[] };

function AskMeSearch({ open, onClose, initialQ }: { open: boolean; onClose: () => void; initialQ?: string }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [confirmedQuery, setConfirmedQuery] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleQ, setVisibleQ] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  // AI answer query — passes conversation history for context
  const aiQuery = trpc.ask.answer.useQuery(
    {
      question: confirmedQuery || "",
      history: messages.slice(-6).map(m => ({ role: m.role, text: m.text })),
    },
    { enabled: !!confirmedQuery, retry: false }
  );

  useEffect(() => {
    if (!confirmedQuery) return;
    if (aiQuery.data) {
      const actionsFor = getSearchResult(confirmedQuery).actions;
      setMessages(prev => [...prev, { role: "assistant", text: aiQuery.data!.answer, actions: actionsFor }]);
      setLoading(false);
      setConfirmedQuery(null);
    } else if (aiQuery.isError) {
      const fallback = getSearchResult(confirmedQuery);
      setMessages(prev => [...prev, { role: "assistant", text: fallback.text, actions: fallback.actions }]);
      setLoading(false);
      setConfirmedQuery(null);
    }
  }, [aiQuery.data, aiQuery.isError, confirmedQuery]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setMessages([]);
      setConfirmedQuery(null);
      setQuery(initialQ || "");
      setVisibleQ(shuffle(BUBBLE_QUESTIONS).slice(0, 12));
      setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
      setTimeout(() => inputRef.current?.focus(), 80);
      if (initialQ) setTimeout(() => submitQuery(initialQ), 250);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQ]);

  function submitQuery(q: string) {
    if (!q.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", text: q.trim() }]);
    setQuery("");
    setLoading(true);
    setConfirmedQuery(q.trim());
  }

  function handleAction(href: string) {
    onClose();
    if (href.startsWith("/#")) {
      document.getElementById(href.replace("/#", ""))?.scrollIntoView({ behavior: "smooth" });
    } else if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      setLocation(href);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: WHITE }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b shrink-0" style={{ borderColor: DARK + "10" }}>
        <button
          onClick={() => { if (hasMessages) { setMessages([]); setQuery(""); } else { onClose(); } }}
          className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-60"
          style={{ color: DARK, opacity: 0.5 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>
        <span className="text-[13px] font-semibold tracking-[0.15em] uppercase" style={{ color: GOLD }}>HAMZURY</span>
        {hasMessages ? (
          <button
            onClick={() => { setMessages([]); setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="text-[12px] font-medium transition-opacity hover:opacity-80"
            style={{ color: GREEN }}
          >
            New chat
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* ── Content area ── */}
      {!hasMessages ? (
        // Empty state — Google-style hero
        <div className="flex-1 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-2xl px-4 pt-16 md:pt-24 pb-8">
            <div className="text-center mb-8">
              <h1 className="font-light tracking-tight mb-1" style={{ color: TEAL, fontSize: "clamp(1.6rem, 5vw, 2.4rem)", letterSpacing: "-0.03em" }}>
                Ask <em style={{ fontStyle: "normal", color: GREEN }}>anything.</em>
              </h1>
              <p className="text-[13px]" style={{ color: DARK, opacity: 0.35 }}>About registration, branding, training, or how we work.</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex-1 w-full max-w-2xl px-4 pb-10">
            <p className="text-[12px] mb-4 text-center" style={{ color: DARK, opacity: 0.3 }}>People also search for</p>
            <div className="grid grid-cols-1 gap-0 rounded-xl overflow-hidden border" style={{ borderColor: DARK + "10" }}>
              {visibleQ.map(q => (
                <button
                  key={q}
                  onClick={() => submitQuery(q)}
                  className="flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 border-b last:border-0"
                  style={{ borderColor: DARK + "07" }}
                >
                  <Search size={14} style={{ color: DARK, opacity: 0.3, flexShrink: 0 }} />
                  <span className="text-[14px]" style={{ color: DARK, opacity: 0.75 }}>{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Chat state — conversation thread
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              msg.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm" style={{ backgroundColor: TEAL }}>
                    <p className="text-[15px] leading-relaxed" style={{ color: CREAM }}>{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ backgroundColor: CREAM, borderLeft: `4px solid ${GREEN}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: GREEN }}>
                          <Sparkles size={10} style={{ color: WHITE }} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GREEN }}>HAMZURY</span>
                      </div>
                      <p className="text-[15px] leading-relaxed" style={{ color: DARK }}>{msg.text}</p>
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 ml-1">
                        {msg.actions.map(a => (
                          <button key={a.label} onClick={() => handleAction(a.href)}
                            className="text-[13px] font-medium hover:underline transition-opacity hover:opacity-80"
                            style={{ color: "#1558d6" }}>
                            {a.label} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ backgroundColor: CREAM, borderLeft: `4px solid ${GREEN}` }}>
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: TEAL, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── Input bar — always pinned to bottom ── */}
      <div className="shrink-0 border-t px-4 py-3" style={{ borderColor: DARK + "10", backgroundColor: WHITE }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-center rounded-full px-4 py-3 transition-shadow"
            style={{ border: `1.5px solid ${DARK}18`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", backgroundColor: WHITE }}
          >
            <Search size={18} style={{ color: DARK, opacity: 0.3, flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && query.trim() && !loading) submitQuery(query);
                if (e.key === "Escape" && !hasMessages) onClose();
              }}
              placeholder={hasMessages ? "Ask a follow-up…" : (placeholder || "Search anything…")}
              className="flex-1 mx-3 text-[16px] outline-none bg-transparent"
              style={{ color: DARK }}
            />
            {query.trim() && !loading ? (
              <button
                onClick={() => submitQuery(query)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 shrink-0"
                style={{ backgroundColor: TEAL }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            ) : (
              <Sparkles size={18} style={{ color: GOLD, opacity: 0.5, flexShrink: 0 }} />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}


// ─── Partnership Modal ────────────────────────────────────────────────────────
const PARTNER_TYPES = [
  "Referral / Affiliate Partnership",
  "Co-branding / Co-marketing",
  "Technology Integration",
  "White-label Services",
  "Community / NGO Collaboration",
  "Other",
];

function PartnershipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [form, setForm] = useState({ name: "", business: "", phone: "", email: "", type: "", idea: "" });
  const [submitting, setSubmitting] = useState(false);
  const submitLead = trpc.leads.submit.useMutation();

  useEffect(() => {
    if (!open) { setStep("form"); setForm({ name: "", business: "", phone: "", email: "", type: "", idea: "" }); }
  }, [open]);

  if (!open) return null;

  async function handleSubmit() {
    if (!form.name.trim() || !form.type) return;
    setSubmitting(true);
    try {
      await submitLead.mutateAsync({
        name: form.name,
        businessName: form.business,
        phone: form.phone,
        email: form.email,
        service: `Partnership — ${form.type}`,
        context: form.idea,
      });
      setStep("done");
    } catch {
      setStep("done"); // still show success to user
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col md:items-center md:justify-center"
      style={{ backgroundColor: "rgba(10,31,28,0.6)", backdropFilter: "blur(12px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mt-auto md:mt-0 w-full md:max-w-lg">
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: WHITE + "30" }} />
        </div>
        <div className="rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: WHITE }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: GOLD + "20" }}>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: GOLD }}>Partnership</span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: TEAL, letterSpacing: "-0.02em" }}>Let's build together.</h3>
            </div>
            <button onClick={onClose} className="opacity-25 hover:opacity-60 transition-opacity" style={{ color: DARK }}>
              <X size={20} />
            </button>
          </div>

          {step === "done" ? (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: GREEN + "15" }}>
                <CheckCircle size={24} style={{ color: GREEN }} />
              </div>
              <h4 className="text-xl font-semibold mb-2 tracking-tight" style={{ color: TEAL }}>We'll reach out shortly.</h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: DARK, opacity: 0.5 }}>Your inquiry has been received. Our team reviews every partnership request personally — expect a response within 48 hours.</p>
              <button onClick={onClose}
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: TEAL, color: CREAM }}>
                Done
              </button>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm leading-relaxed" style={{ color: DARK, opacity: 0.55 }}>
                HAMZURY is open to partnerships that create real value for businesses. Tell us who you are and what you have in mind.
              </p>

              {/* Name + Business */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DARK, opacity: 0.4 }}>Your Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                    style={{ borderColor: TEAL + "15", backgroundColor: CREAM, color: DARK }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DARK, opacity: 0.4 }}>Company / Organisation</label>
                  <input value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                    placeholder="Business name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                    style={{ borderColor: TEAL + "15", backgroundColor: CREAM, color: DARK }} />
                </div>
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DARK, opacity: 0.4 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    type="tel" placeholder="WhatsApp preferred"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                    style={{ borderColor: TEAL + "15", backgroundColor: CREAM, color: DARK }} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DARK, opacity: 0.4 }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    type="email" placeholder="your@email.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border"
                    style={{ borderColor: TEAL + "15", backgroundColor: CREAM, color: DARK }} />
                </div>
              </div>

              {/* Partnership type */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: DARK, opacity: 0.4 }}>Partnership Type *</label>
                <div className="flex flex-wrap gap-2">
                  {PARTNER_TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="px-3.5 py-2 rounded-full text-[12px] font-medium border transition-all"
                      style={{
                        borderColor: form.type === t ? TEAL : TEAL + "18",
                        backgroundColor: form.type === t ? TEAL : CREAM,
                        color: form.type === t ? CREAM : TEAL,
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brief idea */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DARK, opacity: 0.4 }}>Your Idea (optional)</label>
                <textarea value={form.idea} onChange={e => setForm(f => ({ ...f, idea: e.target.value }))}
                  placeholder="What do you have in mind? The more specific, the faster we can respond."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none"
                  style={{ borderColor: TEAL + "15", backgroundColor: CREAM, color: DARK }} />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.type || submitting}
                className="w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: TEAL, color: CREAM }}>
                {submitting ? "Submitting…" : "Submit Partnership Inquiry →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
