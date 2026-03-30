import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, X, Menu, FileText, Shield, Scale, Award, Briefcase, MessageSquare, Eye, EyeOff, Loader2 } from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";
import { trpc } from "@/lib/trpc";

const G  = "#1B4D3E";
const Au = "#B48C4C";
const Cr = "#FFFAF6";
const W  = "#FFFFFF";
const Milk = "#FFFAF6";

// ── SERVICE CARDS (simplified from pillars) ─────────────────────────────────
const SERVICE_CARDS = [
  {
    icon: Briefcase,
    title: "Business Registration",
    line: "CAC, foreign company setup, and all entity formation.",
    context: "I need help with business registration. Tell me more.",
  },
  {
    icon: FileText,
    title: "Full Business Setup",
    line: "Registration to operations — every layer handled end to end.",
    context: "I want everything handled from registration to operations. Tell me more.",
  },
  {
    icon: Shield,
    title: "Tax & Compliance",
    line: "TIN, annual returns, FIRS clearance, and ongoing monitoring.",
    context: "I need help with tax compliance and returns. Tell me more.",
  },
  {
    icon: Scale,
    title: "Legal Documents & IP",
    line: "Contracts, NDAs, trademark registration, and full legal frameworks.",
    context: "I need legal documents and trademark protection. Tell me more.",
  },
  {
    icon: Award,
    title: "Sector Licences",
    line: "NAFDAC, NMDPRA, CBN, NEPC, and every industry permit.",
    context: "I need help with sector licences and permits. Tell me more.",
  },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function BizDocPortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const blueprintRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track
  const [trackCode, setTrackCode] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.tracking.lookup.useQuery(
    { ref: trackCode },
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

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
    if (btn) btn.click();
  };

  return (
    <>
      <PageMeta
        title="BizDoc Consult. Business Compliance, Legal & Growth"
        description="CAC registration, tax compliance, sector licences, legal documents, and managed business compliance for Nigerian businesses."
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
          <span
            className="text-[13px] tracking-[4px] font-light uppercase cursor-default select-none"
            style={{ color: scrolled ? G : W, letterSpacing: "0.25em" }}
          >
            BIZDOC
          </span>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: scrolled ? G : W }}
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
              <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: `${G}40` }}>Related</p>
              {[
                { label: "Pricing",    href: "/pricing" },
                { label: "Consultant", href: "/consultant" },
                { label: "Systemise",  href: "/systemise" },
                { label: "Hamzury Skills", href: "/skills" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: G }}>
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="mx-4 my-1.5" style={{ height: 1, backgroundColor: `${G}0C` }} />
              <p className="px-5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: `${G}40` }}>Explore</p>
              {[
                { label: "Home",       href: "/" },
                { label: "RIDI",       href: "/ridi" },
                { label: "Team",       href: "/team" },
                { label: "Affiliate",  href: "/affiliate" },
                { label: "Training",   href: "/training" },
                { label: "Alumni",     href: "/alumni" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: G, opacity: 0.7 }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── full viewport, one focal point */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: G }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1
            className="text-[clamp(32px,6vw,48px)] font-light leading-[1.1] mb-6 tracking-tight"
            style={{ color: W }}
          >
            Every filing. Every licence.{" "}
            <span style={{ color: Au }}>Handled.</span>
          </h1>
          <p className="text-[14px] leading-relaxed mb-12 max-w-md mx-auto" style={{ color: W, opacity: 0.55 }}>
            CAC registration. Tax compliance. Sector licences. Legal documentation. So you can operate, win contracts, and scale.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: Au, color: G }}
            >
              Our Services
            </button>
            <button
              onClick={() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-full text-[14px] font-medium transition-all duration-300 hover:opacity-80"
              style={{ color: W, border: `1px solid rgba(255,255,255,0.2)` }}
            >
              Track
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── clean grid, no accordions */}
      <section id="services" className="py-24 md:py-32" style={{ backgroundColor: Milk }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4 text-center" style={{ color: Au }}>
            OUR SERVICES
          </p>
          <h2
            className="text-[clamp(28px,4vw,42px)] font-light mb-20 text-center leading-tight tracking-tight"
            style={{ color: G }}
          >
            Every layer your business needs.
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
                  <p className="text-[13px] leading-relaxed mb-6" style={{ color: G, opacity: 0.55 }}>
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

            {/* View Blueprints card */}
            <div
              className="rounded-[20px] p-8 flex flex-col justify-center items-center text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              style={{
                backgroundColor: `${G}06`,
                boxShadow: "0 2px 20px rgba(0,0,0,0.02)",
              }}
              onClick={() => openChat("I want to see the Business Blueprint for my industry. What sectors do you cover?")}
            >
              <p className="text-[13px] font-medium mb-2" style={{ color: G }}>
                View Blueprints
              </p>
              <p className="text-[12px] leading-relaxed mb-4" style={{ color: G, opacity: 0.45 }}>
                Industry-specific roadmaps for legal, financial, marketing, sales, operations, and team.
              </p>
              <ArrowRight size={16} style={{ color: Au }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section id="track" className="py-24 md:py-32" style={{ backgroundColor: W }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-4" style={{ color: Au }}>
            TRACK
          </p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light tracking-tight mb-3" style={{ color: G }}>
            Track Your File
          </h2>
          <p className="text-[13px] mb-10" style={{ color: G, opacity: 0.5 }}>
            Enter your tracking reference to access your file status.
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={trackCode}
              onChange={(e) => {
                let raw = e.target.value.replace(/[^0-9]/g, "");
                if (raw.length > 8) raw = raw.slice(0, 8);
                let formatted = "HMZ-";
                if (raw.length > 0) formatted += raw.slice(0, 2);
                if (raw.length > 2) formatted += "/" + raw.slice(2, 3);
                if (raw.length > 3) formatted += "-" + raw.slice(3);
                setTrackCode(formatted);
                setTrackSubmitted(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="HMZ-26/3-XXXX"
              maxLength={17}
              className="flex-1 rounded-full px-5 py-3.5 text-[14px] outline-none font-mono"
              style={{ backgroundColor: `${G}06`, color: G }}
            />
            <button
              onClick={handleTrack}
              disabled={trackQuery.isFetching}
              className="px-6 py-3.5 rounded-full text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
              style={{ backgroundColor: G, color: Au }}
            >
              {trackQuery.isFetching ? "..." : "Access"}
            </button>
          </div>

          {/* Result: found */}
          {trackSubmitted && !trackQuery.isFetching && trackQuery.data?.found && (
            <div className="rounded-[20px] p-6 text-left" style={{ backgroundColor: Milk }}>
              <p className="text-[11px] font-medium tracking-wider uppercase mb-1" style={{ color: Au }}>
                {trackQuery.data.ref}
              </p>
              <p className="text-[17px] font-medium mb-0.5" style={{ color: G }}>
                {trackQuery.data.clientName}
              </p>
              <p className="text-[13px] mb-5" style={{ color: G, opacity: 0.5 }}>
                {trackQuery.data.service}
              </p>
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: trackQuery.data.statusTotal }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full"
                    style={{ backgroundColor: i <= (trackQuery.data.statusIndex ?? -1) ? G : `${G}18` }} />
                ))}
              </div>
              <p className="text-[12px] font-medium mb-5" style={{ color: G }}>{trackQuery.data.status}</p>
              <a
                href="/client/dashboard"
                onClick={e => {
                  e.preventDefault();
                  localStorage.setItem("hamzury-client-session", JSON.stringify({
                    ref: trackQuery.data!.ref, phone: "", name: trackQuery.data!.clientName,
                    expiresAt: Date.now() + 24 * 60 * 60 * 1000
                  }));
                  window.location.href = "/client/dashboard";
                }}
                className="block w-full py-3 rounded-full text-[13px] font-medium text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: G, color: Au }}
              >
                Open Full Dashboard
              </a>
            </div>
          )}

          {/* Result: not found */}
          {trackSubmitted && !trackQuery.isFetching && trackQuery.data && !trackQuery.data.found && (
            <p className="text-[13px]" style={{ color: G, opacity: 0.45 }}>
              Reference not found. You will receive your reference after payment. Use our chat to get started.
            </p>
          )}

          {/* Staff login toggle */}
          <div className="mt-12">
            <button onClick={() => setStaffMode(s => !s)} className="text-[11px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70" style={{ color: G, opacity: 0.25 }}>
              {staffMode ? "Back to Track" : "Staff?"}
            </button>
            {staffMode && (
              <form onSubmit={handleStaffLogin} className="mt-4 space-y-3 max-w-xs mx-auto">
                <input type="text" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="Staff ID" className="w-full px-4 py-3 rounded-full text-[13px] outline-none" style={{ backgroundColor: `${G}06`, color: G }} />
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={staffPw} onChange={e => setStaffPw(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-full text-[13px] outline-none pr-10" style={{ backgroundColor: `${G}06`, color: G }} />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60" style={{ color: G }}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                </div>
                {staffError && <p className="text-[12px] text-red-500">{staffError}</p>}
                <button type="submit" disabled={staffLoading || !staffId.trim() || !staffPw} className="w-full py-3 rounded-full text-[13px] font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2" style={{ backgroundColor: G, color: Au }}>
                  {staffLoading ? <Loader2 size={14} className="animate-spin" /> : null}{staffLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── minimal */}
      <footer className="py-10 px-6" style={{ backgroundColor: Milk }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]" style={{ color: G, opacity: 0.4 }}>
          <p>BizDoc Consult</p>
          <p>© {new Date().getFullYear()} HAMZURY</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy"><span className="hover:opacity-80 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-80 transition-opacity cursor-pointer">Terms</span></Link>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color="#1B4D3E" />
      <div className="md:hidden h-10" />
    </>
  );
}
