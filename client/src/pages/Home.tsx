import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";
import { getLoginUrl } from "@/const";

import {
  ShieldCheck, Cpu, GraduationCap,
  ArrowRight, LogOut,
  Menu, X, ChevronDown, CheckCircle,
  TrendingUp,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

const LOGIN_URL = "/login";

// Home page brand: Apple-inspired grey
const GREY  = "#2D2D2D";
const DARK_GREY = "#1A1A1A";
const TEAL  = "#2D2D2D";  // Alias for backward compat — Home uses charcoal now
const GREEN = "#34A853";
const GOLD  = "#B48C4C";
const CREAM = "#FFFAF6";   // Milk white
const WHITE = "#FFFFFF";
const DARK  = "#1A1A1A";


const DEPARTMENTS = [
  {
    id: "bizdoc" as const,
    label: "BizDoc Consult",
    sub: "Compliance & Regulatory",
    icon: <ShieldCheck size={28} />,
    color: "#1B4D3E",
    href: "/bizdoc",
    intro: "Legal protection for your business. Every filing, licence, and compliance obligation handled.",
    pricing: "Starting from ₦50,000",
    services: [
      "CAC registration & annual filings",
      "Industry licenses (NAFDAC, SON, DPR, Export)",
      "Tax compliance: VAT, PAYE, TCC",
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
    color: "#2563EB",
    href: "/systemise",
    intro: "Systems that run without you. Strategy, automation, and digital infrastructure.",
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
    color: "#1E3A5F",
    href: "/skills",
    intro: "Practical skills from operators. Not theory. Real market ability.",
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

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"bizdoc" | "systemise" | "skills" | "track" | null>(null);
  const [trackRef, setTrackRef] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackNotFound, setTrackNotFound] = useState(false);
  const [trackResult, setTrackResult] = useState<null | { ref: string; clientName: string | null; businessName: string | null; service: string | null; status: string; progress: number }>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [partnershipOpen, setPartnershipOpen] = useState(false);

  const trackQuery = trpc.tracking.lookup.useQuery(
    { ref: trackRef },
    { enabled: false, retry: false }
  );

  function handleTrack() {
    if (trackRef.trim().length < 4) return;
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
          progress: Math.round(((d.statusIndex + 1) / d.statusTotal) * 100),
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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM, fontFamily: "'Inter', sans-serif" }}>
      <PageMeta
        title="HAMZURY | Compliance, Systems & Skills for Businesses"
        description="Compliance, systems, and skills for Nigerian businesses. BizDoc, Systemize, and Hamzury Skills under one roof."
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 relative ${scrolled ? "py-3" : "py-5"}`}
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

          {/* Desktop center nav — scroll links */}
          <div className="hidden md:flex items-center gap-8 text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ color: DARK }}>
            <button onClick={() => scrollTo("what")} className="transition-opacity hover:opacity-40">Services</button>
            <button onClick={() => scrollTo("process")} className="transition-opacity hover:opacity-40">Process</button>
            <Link href="/founder" className="transition-opacity hover:opacity-40">Founder</Link>
          </div>

          {/* Hamburger */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: TEAL }}
            onClick={() => setMobileMenuOpen(p => !p)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 z-50 border-t"
            style={{ backgroundColor: WHITE, borderColor: `${GOLD}20`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
          >
            <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col">
              {[
                { label: "Services",  action: () => { scrollTo("what"); setMobileMenuOpen(false); } },
                { label: "Process",   action: () => { scrollTo("process"); setMobileMenuOpen(false); } },
                { label: "Pricing",   action: () => { window.location.href = "/pricing"; } },
                { label: "Founder",   action: () => { window.location.href = "/founder"; } },
                { label: "Track", action: () => { openTrackTab(); setMobileMenuOpen(false); } },
              ].map(item => (
                <button key={item.label}
                  onClick={item.action}
                  className="block text-left px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
                  style={{ color: TEAL }}>
                  {item.label}
                </button>
              ))}

              {/* Departments */}
              <div className="border-t mt-1 pt-2" style={{ borderColor: `${GOLD}15` }}>
                <p className="px-3 text-[10px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: `${GOLD}90` }}>Departments</p>
                {[
                  { label: "BizDoc Consult",  href: "/bizdoc" },
                  { label: "Systemise",        href: "/systemise" },
                  { label: "Hamzury Skills",   href: "/skills" },
                  { label: "RIDI Initiative",  href: "/ridi" },
                  { label: "MetFix Hardware \u00B7 Coming Soon",  href: "/metfix" },
                ].map(d => (
                  <Link key={d.href} href={d.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    <span className="text-sm font-medium" style={{ color: TEAL }}>{d.label}</span>
                  </Link>
                ))}
              </div>

              {/* Staff Login */}
              <div className="border-t mt-1 pt-2 pb-1" style={{ borderColor: `${GOLD}15` }}>
                <Link href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors">
                  <LogOut size={14} style={{ color: TEAL, opacity: 0.4 }} />
                  <span className="text-[13px] font-medium" style={{ color: TEAL, opacity: 0.5 }}>Staff Login</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

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
              Compliance. Systems. Skills. One integrated platform for serious businesses.
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
                Track
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

      {/* ─── WHAT (4 cards: 3 Departments + Track) ─── */}
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
                          {dept.id === "bizdoc" && <p className="text-xs mt-3 pt-3" style={{ color: "#888", borderTop: `1px solid ${dept.color}12` }}>Services <strong style={{ color: dept.color }}>from ₦50,000</strong> · Free consultation included</p>}
                          {dept.id === "skills" && <p className="text-xs mt-3 pt-3" style={{ color: "#888", borderTop: `1px solid ${dept.color}12` }}>Programs <strong style={{ color: dept.color }}>from ₦35,000</strong> · Flexible payment plans available</p>}
                          {dept.id === "systemise" && <p className="text-xs mt-3 pt-3" style={{ color: "#888", borderTop: `1px solid ${dept.color}12` }}>Projects <strong style={{ color: dept.color }}>from ₦80,000</strong> · Scope review is free</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Card 4: Track (Client Portal) ── */}
            {(() => {
              const isOpen = activeTab === "track";
              return (
                <div
                  id="track"
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
                          <h3 className="text-xl font-semibold tracking-tight" style={{ color: TEAL, letterSpacing: "-0.025em" }}>Track</h3>
                          <p className="text-sm opacity-70 mt-1">A dedicated dashboard for your business. Track all your needs and progress in one place.</p>
                          <p className="text-[11px] uppercase tracking-wider font-medium opacity-35 mt-0.5" style={{ color: DARK }}>Live Project Tracking</p>
                        </div>
                      </div>
                      <ChevronDown size={18} style={{ color: TEAL, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease", flexShrink: 0 }} />
                    </div>
                  </button>
                  <div style={{ maxHeight: isOpen ? "900px" : "0px", overflow: "hidden", transition: "max-height 0.45s ease" }}>
                    <div className="px-6 md:px-8 pb-8 pt-4 border-t" style={{ borderColor: `${TEAL}15`, backgroundColor: CREAM }}>
                      {/* TRACK label */}
                      <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>TRACK</p>

                      {/* Input row */}
                      <div className="flex gap-2 mb-3">
                        <input type="text" placeholder="HMZ-26/3-XXXX"
                          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border font-mono"
                          style={{ borderColor: `${TEAL}18`, backgroundColor: WHITE, color: TEAL }}
                          value={trackRef}
                          onChange={e => {
                            let raw = e.target.value.replace(/[^0-9]/g, "");
                            if (raw.length > 8) raw = raw.slice(0, 8);
                            let formatted = "HMZ-";
                            if (raw.length > 0) formatted += raw.slice(0, 2);
                            if (raw.length > 2) formatted += "/" + raw.slice(2, 3);
                            if (raw.length > 3) formatted += "-" + raw.slice(3);
                            setTrackRef(formatted);
                            setTrackNotFound(false);
                            setTrackResult(null);
                          }}
                          onKeyDown={e => e.key === "Enter" && handleTrack()} />
                        <button onClick={handleTrack} disabled={trackLoading}
                          className="px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
                          style={{ backgroundColor: TEAL, color: GOLD }}>
                          {trackLoading ? "…" : "Access"}
                        </button>
                      </div>
                      <p className="text-[11px] mb-4" style={{ color: TEAL, opacity: 0.35 }}>Enter your reference number e.g. HMZ-26/3-XXXX</p>

                      {/* Not found */}
                      {trackNotFound && (
                        <p className="text-[12px] mb-3" style={{ color: `${TEAL}90` }}>No file found. Contact your CSO if you just enrolled.</p>
                      )}

                      {/* Result card */}
                      {trackResult && (
                        <div className="rounded-2xl p-4 text-left border" style={{ backgroundColor: WHITE, borderColor: `${TEAL}12` }}>
                          <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: GOLD }}>
                            {trackResult.ref}
                          </p>
                          <p className="text-[16px] font-bold mb-0.5" style={{ color: TEAL }}>
                            {trackResult.businessName || trackResult.clientName || "Your File"}
                          </p>
                          <p className="text-[13px] mb-3" style={{ color: TEAL, opacity: 0.55 }}>{trackResult.service}</p>
                          <div className="mb-3">
                            <div className="flex justify-between text-[11px] mb-1.5" style={{ color: `${TEAL}55` }}>
                              <span>{trackResult.status}</span>
                              <span style={{ color: GOLD }}>{trackResult.progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ backgroundColor: `${TEAL}12` }}>
                              <div className="h-full rounded-full" style={{ width: `${trackResult.progress}%`, backgroundColor: GOLD }} />
                            </div>
                          </div>
                          <a href="/client/dashboard"
                            onClick={e => {
                              e.preventDefault();
                              localStorage.setItem("hamzury-client-session", JSON.stringify({
                                ref: trackResult.ref, phone: trackRef, name: trackResult.clientName,
                                businessName: trackResult.businessName, service: trackResult.service,
                                status: trackResult.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000
                              }));
                              window.location.href = "/client/dashboard";
                            }}
                            className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                            style={{ backgroundColor: TEAL, color: GOLD }}>
                            Open Full Dashboard →
                          </a>
                        </div>
                      )}
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
              "Businesses deserve more than consultants who disappear after the invoice. We stay until the work is done. And build systems that keep working after we leave."
            </p>
            <Link
              href="/founder"
              className="text-sm font-semibold tracking-wide transition-opacity hover:opacity-60 inline-flex items-center gap-2"
              style={{ color: TEAL }}
            >
              Muhammad Hamzury <ArrowRight size={14} />
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
          <div className="mb-10" />

          {/* Founder's Why — 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[
              {
                dept: "BizDoc Consult",
                why: "Incomplete compliance shuts businesses down. BizDoc eliminates that risk.",
                color: "#1B4D3E",
              },
              {
                dept: "Systemize",
                why: "A business without systems is just a job. We build the structure to scale.",
                color: "#2563EB",
              },
              {
                dept: "Hamzury Skills",
                why: "The market can't take your skills. We invest in people who build lasting businesses.",
                color: "#B48C4C",
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
              { num: "01", title: "Brief",    short: "Tell us what you need",                detail: "Service type, timeline, context. The more specific, the faster we move." },
              { num: "02", title: "Assigned", short: "CSO responds within 24 hours",         detail: "Your Client Success Officer reviews and responds within 24 hours." },
              { num: "03", title: "Execute",  short: "Specialists handle the work",          detail: "Full ownership. No chasing. No repeating yourself." },
              { num: "04", title: "Verify",   short: "Quality checked before it reaches you",detail: "Every deliverable passes internal quality check. No exceptions." },
              { num: "05", title: "Deliver",  short: "Certified and actively maintained",   detail: "Certified, filed, and set up for ongoing maintenance." },
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


      {/* ── OUR TEAM ── */}
      <section className="py-16 md:py-24 px-6 md:px-12" style={{ backgroundColor: CREAM }}>
        <div className="max-w-7xl mx-auto text-center">
          <span className="px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase border inline-block mb-6"
            style={{ color: GREEN, borderColor: `${GREEN}20` }}>
            Our Team
          </span>
          <h2 className="text-[clamp(28px,4vw,42px)] font-light tracking-tight mb-3" style={{ color: TEAL, letterSpacing: "-0.02em" }}>
            The people behind HAMZURY.
          </h2>
          <p className="text-[15px] mb-8 max-w-md mx-auto opacity-55" style={{ color: DARK }}>
            15 operators, advisors, and educators. Each role is deliberate.
          </p>
          <Link href="/team">
            <span className="inline-block px-8 py-3 rounded-full text-[13px] font-medium cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: TEAL, color: CREAM }}>
              Meet the team
            </span>
          </Link>
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
            <a href="/affiliate" className="hover:opacity-100 transition-opacity" style={{ color: GOLD, opacity: 0.5 }}>
              Affiliate Programme
            </a>
          </div>
          <button
            onClick={() => { window.location.href = LOGIN_URL; }}
            className="text-[11px] font-medium uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
            style={{ color: GOLD }}
          >
            Staff Login →
          </button>
        </div>
        <div className="max-w-7xl mx-auto text-center mt-6">
          <p className="text-[12px] font-light italic mb-4" style={{ color: `${CREAM}80` }}>
            "Structure before speed. That is how we build." — Muhammad Hamzury, Founder
          </p>
        </div>
      </footer>

      <MotivationalQuoteBar color="#2D2D2D" />
      <div className="md:hidden h-10" />

      {/* Partnership Modal */}
      <PartnershipModal open={partnershipOpen} onClose={() => setPartnershipOpen(false)} />
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
        service: `Partnership: ${form.type}`,
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
              <p className="text-sm leading-relaxed mb-6" style={{ color: DARK, opacity: 0.5 }}>Your inquiry has been received. Our team reviews every partnership request personally. Expect a response within 48 hours.</p>
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
