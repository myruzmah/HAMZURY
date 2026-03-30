import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";

import {
  ShieldCheck, Cpu, GraduationCap,
  ArrowRight, LogOut,
  Menu, X, ChevronDown, CheckCircle,
  TrendingUp, MessageSquare, Eye, EyeOff, Loader2,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

// Apple-standard palette
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";
const GREEN    = "#22C55E";
const MILK     = "#FFFAF6";
const WHITE    = "#FFFFFF";

// Department accents
const BIZDOC_GREEN  = "#1B4D3E";
const SYSTEMISE_BLUE = "#2563EB";
const SKILLS_NAVY   = "#1E3A5F";

// Backward compat aliases
const TEAL  = CHARCOAL;
const DARK  = CHARCOAL;
const CREAM = MILK;

const DEPARTMENTS = [
  {
    id: "bizdoc" as const,
    label: "BizDoc",
    pitch: "Everything your business owes the system.",
    icon: <ShieldCheck size={24} />,
    color: BIZDOC_GREEN,
    href: "/bizdoc",
  },
  {
    id: "systemise" as const,
    label: "Systemise",
    pitch: "Systems that scale while you sleep.",
    icon: <Cpu size={24} />,
    color: SYSTEMISE_BLUE,
    href: "/systemise",
  },
  {
    id: "skills" as const,
    label: "Skills",
    pitch: "Learn what actually works.",
    icon: <GraduationCap size={24} />,
    color: SKILLS_NAVY,
    href: "/skills",
  },
];

/* ── Fade-up on scroll hook ── */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" } as React.CSSProperties };
}

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

  // Staff login (inline)
  const [staffMode, setStaffMode] = useState(false);
  const [staffIdVal, setStaffIdVal] = useState("");
  const [staffPw, setStaffPw] = useState("");
  const [showStaffPw, setShowStaffPw] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!staffIdVal.trim() || !staffPw) return;
    setStaffLoading(true); setStaffError("");
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ staffId: staffIdVal.trim().toUpperCase(), password: staffPw }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = data.dashboard;
    } catch (err: unknown) { setStaffError(err instanceof Error ? err.message : String(err)); }
    finally { setStaffLoading(false); }
  }

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
    setTimeout(() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Fade-up refs for each section
  const fadeDepts = useFadeUp();
  const fadeTrack = useFadeUp();
  const fadeQuote = useFadeUp();
  const fadeWhy   = useFadeUp();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: MILK, fontFamily: "'Inter', sans-serif" }}>
      <PageMeta
        title="HAMZURY | Compliance, Systems & Skills for Businesses"
        description="Compliance, systems, and skills for Nigerian businesses. BizDoc, Systemize, and Hamzury Skills under one roof."
        ogImage="https://hamzury.com/og-image.jpg"
        canonical="https://hamzury.com/"
      />
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
          "priceRange": "\u20A6\u20A6",
          "sameAs": [
            "https://instagram.com/hamzury",
            "https://linkedin.com/company/hamzury"
          ]
        })}}
      />

      {/* ─── NAV ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          padding: scrolled ? "12px 0" : "20px 0",
          backgroundColor: scrolled ? `${WHITE}F2` : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <div
            className="text-lg font-semibold tracking-tight cursor-pointer select-none"
            onClick={() => scrollTo("hero")}
            style={{ color: CHARCOAL, letterSpacing: "-0.04em" }}
          >
            HAMZURY
          </div>

          {/* Desktop nav — only page links, no scroll-to duplicates */}
          <div className="hidden md:flex items-center gap-8 text-[12px] font-medium tracking-[0.12em] uppercase" style={{ color: CHARCOAL }}>
            <Link href="/founder" className="opacity-50 hover:opacity-100 transition-opacity duration-200">Founder</Link>
          </div>

          {/* Hamburger */}
          <button
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-black/5 transition-colors duration-200 md:hidden"
            style={{ color: CHARCOAL }}
            onClick={() => setMobileMenuOpen(p => !p)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Desktop menu icon */}
          <button
            className="hidden md:flex items-center justify-center w-11 h-11 rounded-full hover:bg-black/5 transition-colors duration-200"
            style={{ color: CHARCOAL }}
            onClick={() => setMobileMenuOpen(p => !p)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div
            className="absolute top-full left-0 right-0 z-50"
            style={{ backgroundColor: WHITE, boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
          >
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex flex-col">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                  if (btn) btn.click();
                }}
                className="flex items-center gap-2 px-3 py-3.5 rounded-xl w-full text-left"
                style={{ backgroundColor: "#B48C4C10", color: "#B48C4C" }}
              >
                <MessageSquare size={16} />
                <span className="text-[13px] font-medium">Chat with us</span>
              </button>
              {[
                  { label: "BizDoc",    href: "/bizdoc" },
                  { label: "Systemise", href: "/systemise" },
                  { label: "Skills",    href: "/skills" },
                  { label: "Pricing",   href: "/pricing" },
                  { label: "Team",      href: "/team" },
                  { label: "Founder",   href: "/founder" },
                ].map(d => (
                  <Link key={d.href} href={d.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-black/[0.03] transition-colors duration-200">
                    <span className="text-sm font-medium" style={{ color: CHARCOAL }}>{d.label}</span>
                  </Link>
                ))}

            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO (full viewport) ─── */}
      <section id="hero" className="relative flex flex-col justify-center" style={{ minHeight: "100svh", backgroundColor: MILK }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
          <div className="pt-32 pb-20 md:pt-40 md:pb-28">

            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase mb-8" style={{ color: GOLD }}>
              Business Infrastructure
            </p>

            <h1 className="font-semibold tracking-tight leading-[0.95] mb-8" style={{
              color: CHARCOAL,
              fontSize: "clamp(40px, 8vw, 72px)",
              letterSpacing: "-0.04em",
            }}>
              Structure for<br />
              <span style={{ color: GREEN }}>businesses</span><br />
              that last.
            </h1>

            <p className="text-base font-normal leading-relaxed max-w-md mb-12" style={{ color: CHARCOAL, opacity: 0.4 }}>
              Compliance. Systems. Skills.<br />
              One platform for serious businesses.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo("departments")}
                className="inline-flex items-center gap-2 rounded-full px-7 h-12 font-medium text-[14px] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: CHARCOAL, color: WHITE }}
              >
                Explore Services
              </button>
              <button onClick={openTrackTab}
                className="inline-flex items-center gap-2 px-7 h-12 rounded-full font-medium text-[14px] transition-all duration-200 hover:bg-black/[0.04]"
                style={{ color: CHARCOAL, border: `1.5px solid ${CHARCOAL}25` }}
              >
                Track
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-15 animate-bounce">
          <ChevronDown size={18} style={{ color: CHARCOAL }} />
        </div>
      </section>

      {/* ─── DEPARTMENTS (3 clean cards) ─── */}
      <section id="departments" className="px-4 md:px-8" style={{ paddingTop: 120, paddingBottom: 120, backgroundColor: MILK }}>
        <div ref={fadeDepts.ref} style={fadeDepts.style} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEPARTMENTS.map(dept => (
              <Link key={dept.id} href={dept.href} className="block group">
                <div
                  className="relative rounded-[20px] p-8 md:p-9 h-full flex flex-col transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                  style={{
                    backgroundColor: WHITE,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Accent bar */}
                  <div className="absolute top-8 left-0 w-[3px] h-8 rounded-r-full" style={{ backgroundColor: dept.color }} />

                  <div className="mb-6" style={{ color: dept.color }}>
                    {dept.icon}
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight mb-3" style={{ color: CHARCOAL, letterSpacing: "-0.02em" }}>
                    {dept.label}
                  </h3>

                  <p className="text-[15px] leading-relaxed flex-1 mb-8" style={{ color: CHARCOAL, opacity: 0.45 }}>
                    {dept.pitch}
                  </p>

                  <span
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity duration-200 group-hover:opacity-100"
                    style={{ color: dept.color, opacity: 0.7 }}
                  >
                    Enter <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRACK (minimal) ─── */}
      <section id="track" className="px-4 md:px-8" style={{ paddingTop: 120, paddingBottom: 120, backgroundColor: WHITE }}>
        <div ref={fadeTrack.ref} style={fadeTrack.style} className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-10" style={{ color: CHARCOAL, letterSpacing: "-0.03em" }}>
            Track
          </h2>

          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="HMZ-26/3-XXXX"
              className="flex-1 rounded-full px-5 h-12 text-sm outline-none font-mono"
              style={{ backgroundColor: MILK, color: CHARCOAL, border: "none" }}
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
              className="px-6 h-12 rounded-full text-sm font-medium transition-opacity duration-200 hover:opacity-90 disabled:opacity-40 shrink-0"
              style={{ backgroundColor: CHARCOAL, color: WHITE }}>
              {trackLoading ? "..." : "Access"}
            </button>
          </div>

          <p className="text-[13px] mb-6" style={{ color: CHARCOAL, opacity: 0.3 }}>
            Enter your reference to see your dashboard.
          </p>

          {/* Not found */}
          {trackNotFound && (
            <p className="text-[13px] mb-4" style={{ color: CHARCOAL, opacity: 0.5 }}>
              No file found. You will receive your reference after payment.
            </p>
          )}

          {/* Result card */}
          {trackResult && (
            <div className="rounded-[20px] p-6 text-left mt-6" style={{ backgroundColor: MILK, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-[11px] font-semibold tracking-wider uppercase mb-1" style={{ color: GOLD }}>
                {trackResult.ref}
              </p>
              <p className="text-[17px] font-semibold mb-0.5" style={{ color: CHARCOAL }}>
                {trackResult.businessName || trackResult.clientName || "Your File"}
              </p>
              <p className="text-[13px] mb-4" style={{ color: CHARCOAL, opacity: 0.45 }}>{trackResult.service}</p>
              <div className="mb-4">
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: `${CHARCOAL}60` }}>
                  <span>{trackResult.status}</span>
                  <span style={{ color: GOLD }}>{trackResult.progress}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ backgroundColor: `${CHARCOAL}08` }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${trackResult.progress}%`, backgroundColor: GOLD }} />
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
                className="block w-full h-11 rounded-full text-sm font-medium text-center leading-[44px] transition-opacity duration-200 hover:opacity-90"
                style={{ backgroundColor: CHARCOAL, color: WHITE }}>
                Open Full Dashboard
              </a>
            </div>
          )}

          {/* Staff login toggle */}
          <div className="mt-12">
            <button onClick={() => setStaffMode(s => !s)} className="text-[11px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70" style={{ color: CHARCOAL, opacity: 0.2 }}>
              {staffMode ? "Back to Track" : "Staff?"}
            </button>
            {staffMode && (
              <form onSubmit={handleStaffLogin} className="mt-4 space-y-3 max-w-xs mx-auto">
                <input type="text" value={staffIdVal} onChange={e => setStaffIdVal(e.target.value)} placeholder="Staff ID" className="w-full px-4 py-3 rounded-full text-[13px] outline-none" style={{ backgroundColor: `${CHARCOAL}06`, color: CHARCOAL }} />
                <div className="relative">
                  <input type={showStaffPw ? "text" : "password"} value={staffPw} onChange={e => setStaffPw(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-full text-[13px] outline-none pr-10" style={{ backgroundColor: `${CHARCOAL}06`, color: CHARCOAL }} />
                  <button type="button" onClick={() => setShowStaffPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60" style={{ color: CHARCOAL }}>{showStaffPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                {staffError && <p className="text-[12px] text-red-500">{staffError}</p>}
                <button type="submit" disabled={staffLoading || !staffIdVal.trim() || !staffPw} className="w-full py-3 rounded-full text-[13px] font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2" style={{ backgroundColor: CHARCOAL, color: WHITE }}>
                  {staffLoading ? <Loader2 size={14} className="animate-spin" /> : null}{staffLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOUNDER QUOTE ─── */}
      <section className="px-4 md:px-8" style={{ paddingTop: 120, paddingBottom: 120, backgroundColor: MILK }}>
        <div ref={fadeQuote.ref} style={fadeQuote.style} className="max-w-2xl mx-auto text-center">
          <p className="text-base italic leading-relaxed mb-6" style={{ color: CHARCOAL, opacity: 0.6 }}>
            "Businesses deserve more than consultants who disappear after the invoice. We stay until the work is done."
          </p>
          <Link
            href="/founder"
            className="text-sm font-medium transition-opacity duration-200 hover:opacity-60 inline-flex items-center gap-2"
            style={{ color: GOLD }}
          >
            Muhammad Hamzury <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ─── WHY HAMZURY (3 statements) ─── */}
      <section className="px-4 md:px-8" style={{ paddingTop: 120, paddingBottom: 120, backgroundColor: WHITE }}>
        <div ref={fadeWhy.ref} style={fadeWhy.style} className="max-w-2xl mx-auto text-center space-y-4">
          <p className="text-xl font-medium tracking-tight" style={{ color: BIZDOC_GREEN, letterSpacing: "-0.02em" }}>
            Compliance that protects.
          </p>
          <p className="text-xl font-medium tracking-tight" style={{ color: SYSTEMISE_BLUE, letterSpacing: "-0.02em" }}>
            Systems that scale.
          </p>
          <p className="text-xl font-medium tracking-tight" style={{ color: SKILLS_NAVY, letterSpacing: "-0.02em" }}>
            Skills that earn.
          </p>
        </div>
      </section>

      {/* ─── FOOTER (minimal) ─── */}
      <footer className="px-4 md:px-8" style={{ paddingTop: 60, paddingBottom: 60, backgroundColor: MILK }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-normal mb-4" style={{ color: CHARCOAL, opacity: 0.3 }}>
            HAMZURY &middot; Abuja, Nigeria
          </p>
          <div className="flex items-center justify-center gap-4 text-[12px] font-medium" style={{ color: CHARCOAL }}>
            <Link href="/privacy"  className="opacity-30 hover:opacity-60 transition-opacity duration-200">Privacy</Link>
            <span className="opacity-15">&middot;</span>
            <Link href="/terms"    className="opacity-30 hover:opacity-60 transition-opacity duration-200">Terms</Link>
            <span className="opacity-15">&middot;</span>
            <Link href="/skills"   className="opacity-30 hover:opacity-60 transition-opacity duration-200">Training</Link>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color="#1A1A1A" />

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
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col md:items-center md:justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(16px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mt-auto md:mt-0 w-full md:max-w-lg">
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: WHITE + "30" }} />
        </div>
        <div className="rounded-t-3xl md:rounded-2xl overflow-hidden" style={{ backgroundColor: WHITE, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-0.5" style={{ color: GOLD }}>Partnership</p>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: CHARCOAL, letterSpacing: "-0.02em" }}>Let's build together.</h3>
            </div>
            <button onClick={onClose} className="opacity-25 hover:opacity-60 transition-opacity duration-200" style={{ color: CHARCOAL }}>
              <X size={20} />
            </button>
          </div>

          {step === "done" ? (
            <div className="px-6 py-10 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: GREEN + "15" }}>
                <CheckCircle size={24} style={{ color: GREEN }} />
              </div>
              <h4 className="text-xl font-semibold mb-2 tracking-tight" style={{ color: CHARCOAL }}>We'll reach out shortly.</h4>
              <p className="text-sm leading-relaxed mb-6" style={{ color: CHARCOAL, opacity: 0.45 }}>Your inquiry has been received. Expect a response within 48 hours.</p>
              <button onClick={onClose}
                className="px-6 h-11 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: CHARCOAL, color: WHITE }}>
                Done
              </button>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm leading-relaxed" style={{ color: CHARCOAL, opacity: 0.4 }}>
                Tell us who you are and what you have in mind.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: CHARCOAL, opacity: 0.35 }}>Your Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full rounded-xl px-4 h-11 text-sm outline-none"
                    style={{ backgroundColor: MILK, color: CHARCOAL, border: "none" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: CHARCOAL, opacity: 0.35 }}>Company</label>
                  <input value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                    placeholder="Business name"
                    className="w-full rounded-xl px-4 h-11 text-sm outline-none"
                    style={{ backgroundColor: MILK, color: CHARCOAL, border: "none" }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: CHARCOAL, opacity: 0.35 }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    type="tel" placeholder="WhatsApp preferred"
                    className="w-full rounded-xl px-4 h-11 text-sm outline-none"
                    style={{ backgroundColor: MILK, color: CHARCOAL, border: "none" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: CHARCOAL, opacity: 0.35 }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    type="email" placeholder="your@email.com"
                    className="w-full rounded-xl px-4 h-11 text-sm outline-none"
                    style={{ backgroundColor: MILK, color: CHARCOAL, border: "none" }} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: CHARCOAL, opacity: 0.35 }}>Partnership Type *</label>
                <div className="flex flex-wrap gap-2">
                  {PARTNER_TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="px-3.5 py-2 rounded-full text-[12px] font-medium transition-all duration-200"
                      style={{
                        backgroundColor: form.type === t ? CHARCOAL : MILK,
                        color: form.type === t ? WHITE : CHARCOAL,
                        opacity: form.type === t ? 1 : 0.6,
                        border: "none",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: CHARCOAL, opacity: 0.35 }}>Your Idea (optional)</label>
                <textarea value={form.idea} onChange={e => setForm(f => ({ ...f, idea: e.target.value }))}
                  placeholder="What do you have in mind?"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ backgroundColor: MILK, color: CHARCOAL, border: "none" }} />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.type || submitting}
                className="w-full h-12 rounded-full text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-30"
                style={{ backgroundColor: CHARCOAL, color: WHITE }}>
                {submitting ? "Submitting..." : "Submit Inquiry"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
