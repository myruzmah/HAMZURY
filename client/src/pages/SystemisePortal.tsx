import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, Layers, Monitor, Search, Instagram,
  PieChart, Menu, X, Loader2, MessageSquare, Eye, EyeOff, Zap,
} from "lucide-react";

import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   SYSTEMIZE PORTAL. /systemise — Apple-standard design
   ═══════════════════════════════════════════════════════════════════════════ */

const G  = "#2563EB";   // Authority blue
const Au = "#B48C4C";   // Gold accent (5% usage)
const Cr = "#FFFAF6";   // Milk white background
const W  = "#FFFFFF";

// ── SERVICE CARDS (simplified) ──────────────────────────────────────────────
const SERVICE_CARDS = [
  // Packages first — higher ticket, recommended
  {
    icon: Layers,
    title: "⭐ Digital Starter",
    line: "Brand Identity + Landing Page — look professional online. ₦350K",
    context: "Systemise Packages",
  },
  {
    icon: Monitor,
    title: "⭐ Business Launch",
    line: "Brand + Full Website + Social Media Setup — ready for clients. ₦500K",
    context: "Systemise Packages",
  },
  {
    icon: Zap,
    title: "⭐ Full Architecture",
    line: "Brand + Web + Social + CRM + AI — complete digital business. From ₦1.2M",
    context: "Systemise Packages",
  },
  // Individual services
  {
    icon: Layers,
    title: "Branding",
    line: "Logo, identity system, and brand guide for premium positioning.",
    context: "Brand Identity",
  },
  {
    icon: Monitor,
    title: "Website",
    line: "Fast, mobile-first website designed around your buyer's journey.",
    context: "Website Design",
  },
  {
    icon: Instagram,
    title: "Social Media",
    line: "Content created, scheduled, managed. Your audience grows hands-off.",
    context: "Social Media",
  },
  {
    icon: PieChart,
    title: "CRM & Sales",
    line: "Pipeline dashboard so you never lose track of a lead again.",
    context: "CRM & Automation",
  },
  {
    icon: Zap,
    title: "AI & Automation",
    line: "AI agents, workflow bots, and smart automations that work while you sleep.",
    context: "AI & Automation",
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function SystemizePortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);


  // Track
  const myUpdateRef = useRef<HTMLElement>(null);
  const [trackCode, setTrackCode] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.tracking.lookup.useQuery(
    { ref: trackCode.trim().toUpperCase() },
    { enabled: false, retry: false }
  );
  const handleTrackInput = (val: string) => {
    let raw = val.replace(/[^0-9]/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);
    let formatted = "HMZ-";
    if (raw.length > 0) formatted += raw.slice(0, 2);
    if (raw.length > 2) formatted += "/" + raw.slice(2, 3);
    if (raw.length > 3) formatted += "-" + raw.slice(3);
    setTrackCode(formatted);
    setTrackSubmitted(false);
  };

  const handleTrack = () => {
    if (trackCode.trim().length < 8) return;
    setTrackSubmitted(true);
    trackQuery.refetch();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
    if (btn) btn.click();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: Cr, color: "#2C2C2C" }}>
      <PageMeta
        title="Systemize. Brand, Website & Growth Systems | HAMZURY"
        description="Brand identity, website design, automation and SEO for growing businesses."
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
          <span className="text-[13px] tracking-[4px] font-light uppercase" style={{ color: G }}>SYSTEMIZE</span>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: G }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {navMenuOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
              style={{ backgroundColor: W }}
              onClick={() => setNavMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setNavMenuOpen(false);
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
                { label: "Home",      href: "/" },
                { label: "BizDoc",    href: "/bizdoc" },
                { label: "Skills",    href: "/skills" },
                { label: "Pricing",   href: "/pricing" },
                { label: "CTO",       href: "/cto" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: G }}>
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
            style={{ color: G }}
          >
            Clarity first.{" "}
            <span style={{ opacity: 0.5 }}>Systems that scale.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-md mx-auto" style={{ color: "#2C2C2C", opacity: 0.5 }}>
            Structure and visibility for ambitious businesses. Built to scale.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: G, color: W, boxShadow: `0 4px 24px ${G}20` }}
            >
              Our Services
            </button>
            <button
              onClick={() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: G, border: `1px solid ${G}25` }}
            >
              Track
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── clean grid, no accordions */}
      <section id="services" className="py-24 md:py-32" style={{ backgroundColor: Cr }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: Au }}>
            WHAT YOU GET
          </p>
          <h2
            className="text-[clamp(28px,4vw,42px)] font-light mb-20 text-center leading-tight tracking-tight"
            style={{ color: G }}
          >
            Five systems. One studio.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CARDS.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className="rounded-[20px] p-8 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: W,
                    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${G}08` }}
                  >
                    <Icon size={18} style={{ color: G }} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-semibold mb-2" style={{ color: G }}>
                    {svc.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#2C2C2C", opacity: 0.55 }}>
                    {svc.line}
                  </p>
                  <button
                    onClick={() => openChat(svc.context)}
                    className="text-[13px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-70"
                    style={{ color: Au }}
                  >
                    Get Started <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section id="track" ref={myUpdateRef} className="py-24 md:py-32" style={{ backgroundColor: W }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: Au }}>
            TRACK
          </p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-3" style={{ color: G }}>
            Track Your Project
          </h2>
          <p className="text-[13px] mb-10" style={{ color: G, opacity: 0.45 }}>
            Enter the reference code from your confirmation message.
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={trackCode}
              onChange={e => handleTrackInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="HMZ-26/3-XXXX"
              className="flex-1 px-5 py-3.5 rounded-full text-[14px] font-mono outline-none"
              style={{ backgroundColor: `${G}06`, color: G }}
            />
            <button
              onClick={handleTrack}
              disabled={trackCode.trim().length < 4 || trackQuery.isFetching}
              className="px-6 py-3.5 rounded-full text-[13px] font-medium transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: G, color: Au }}
            >
              {trackQuery.isFetching ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {trackQuery.isFetching ? "..." : "Check"}
            </button>
          </div>

          {/* Result */}
          {trackSubmitted && !trackQuery.isFetching && (
            <div>
              {trackQuery.data?.found ? (
                <div className="rounded-[20px] p-6 text-left" style={{ backgroundColor: Cr }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono" style={{ color: G, opacity: 0.35 }}>{trackQuery.data.ref}</span>
                    <span
                      className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: `${Au}20`, color: Au }}
                    >
                      {trackQuery.data.status}
                    </span>
                  </div>
                  <p className="text-[15px] font-light mb-1" style={{ color: G }}>
                    {trackQuery.data.businessName || trackQuery.data.clientName}
                  </p>
                  <p className="text-[12px] mb-5" style={{ color: G, opacity: 0.45 }}>{trackQuery.data.service}</p>
                  <div className="w-full h-1.5 rounded-full mb-2" style={{ backgroundColor: `${G}10` }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.round(((trackQuery.data.statusIndex + 1) / trackQuery.data.statusTotal) * 100)}%`,
                        backgroundColor: Au,
                      }}
                    />
                  </div>
                  <p className="text-[12px] mb-5" style={{ color: G, opacity: 0.45 }}>{trackQuery.data.statusMessage}</p>
                  <a
                    href="/client/dashboard"
                    onClick={e => {
                      e.preventDefault();
                      localStorage.setItem("hamzury-client-session", JSON.stringify({
                        ref: trackQuery.data!.ref, phone: "", name: trackQuery.data!.clientName ?? trackQuery.data!.businessName,
                        businessName: trackQuery.data!.businessName, service: trackQuery.data!.service,
                        status: trackQuery.data!.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000
                      }));
                      window.location.href = "/client/dashboard";
                    }}
                    className="block w-full py-3 rounded-full text-[13px] font-medium text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: G, color: Au }}
                  >
                    Open Full Dashboard
                  </a>
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: G, opacity: 0.45 }}>
                  Reference not found. You will receive your reference after payment. Use our chat to get started.
                </p>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ── FOOTER ── minimal */}
      <footer className="py-10 px-6" style={{ backgroundColor: Cr }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]" style={{ color: G, opacity: 0.4 }}>
          <p>Systemize</p>
          <p>© {new Date().getFullYear()} HAMZURY</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy"><span className="hover:opacity-80 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-80 transition-opacity cursor-pointer">Terms</span></Link>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color="#2563EB" />
      <div className="md:hidden h-10" />
    </div>
  );
}
