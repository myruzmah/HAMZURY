import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, X, Menu, FileText, Shield, Scale, Award, Briefcase, MessageSquare, Loader2, ClipboardList, Search, PenTool, Send, CheckCircle, Handshake } from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";
import { trpc } from "@/lib/trpc";

const G  = "#1B4D3E";
const Au = "#B48C4C";
const Cr = "#FFFAF6";
const W  = "#FFFFFF";

// ── SERVICE CARDS ────────────────────────────────────────────────────────────
const SERVICE_CARDS = [
  { icon: Award,     title: "Starter Pack",          tag: "RECOMMENDED", line: "CAC Ltd + TIN + Bank Account + Seal — everything to start legally.", price: "₦250K", context: "BizDoc Packages" },
  { icon: Shield,    title: "Pro Pack",              tag: "POPULAR",     line: "Starter + Tax Filing + Compliance Management — stay protected.",     price: "₦400K", context: "BizDoc Packages" },
  { icon: Briefcase, title: "Complete Pack",         tag: "BEST VALUE",  line: "Pro + Legal Pack + Sector Licence — fully covered.",                 price: "₦600K", context: "BizDoc Packages" },
  { icon: Briefcase, title: "Business Registration", tag: null,          line: "CAC, foreign company setup, and all entity formation.",              price: null,    context: "Business Registration" },
  { icon: FileText,  title: "Foreign Business",      tag: null,          line: "Expatriate quota, CERPAC, business permit — full foreign setup.",    price: null,    context: "Foreign Business" },
  { icon: Shield,    title: "Tax Compliance",        tag: null,          line: "TIN, annual returns, FIRS clearance, and ongoing monitoring.",       price: null,    context: "Tax Compliance" },
  { icon: Scale,     title: "Legal Documents",       tag: null,          line: "Contracts, NDAs, document packs, and custom legal drafting.",        price: null,    context: "Legal Documents" },
  { icon: Award,     title: "Sector Licences",       tag: null,          line: "NAFDAC, NMDPRA, CBN, NEPC, and every industry permit.",             price: null,    context: "Sector Licences" },
];

const STEPS = [
  { icon: ClipboardList, label: "Tell us" },
  { icon: Search,        label: "We assess" },
  { icon: PenTool,       label: "We file" },
  { icon: Send,          label: "Delivered" },
  { icon: CheckCircle,   label: "Covered" },
  { icon: Handshake,     label: "Done" },
];

const BLUEPRINTS = [
  { id: "restaurant",    label: "Restaurant & Food",        badge: "FOOD",     emoji: "🍽" },
  { id: "import-export", label: "Import / Export",           badge: "TRADE",    emoji: "🚢" },
  { id: "tech-startup",  label: "Tech Startup",              badge: "TECH",     emoji: "💻" },
  { id: "fashion",       label: "Fashion & Clothing",        badge: "FASHION",  emoji: "✂️" },
  { id: "construction",  label: "Construction & Property",   badge: "PROPERTY", emoji: "🏗" },
  { id: "consulting",    label: "Consulting & Services",     badge: "SERVICES", emoji: "📋" },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function BizDocPortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const svcScrollRef = useRef<HTMLDivElement>(null);
  const bpScrollRef = useRef<HTMLDivElement>(null);

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

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth * 0.8;
    ref.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <>
      <PageMeta
        title="BizDoc Consult. Business Compliance, Legal & Growth"
        description="CAC registration, tax compliance, sector licences, legal documents, and managed business compliance for Nigerian businesses."
      />

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        @keyframes flow-pulse {
          0%   { width: 0%; }
          60%  { width: 100%; }
          100% { width: 100%; opacity: 0.2; }
        }
        @keyframes dot-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(180,140,76,0); }
          50%      { box-shadow: 0 0 0 8px rgba(180,140,76,0.12); }
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
              {[
                { label: "Home",       href: "/" },
                { label: "Systemise",  href: "/systemise" },
                { label: "Skills",     href: "/skills" },
                { label: "Pricing",    href: "/pricing" },
                { label: "Consultant", href: "/consultant" },
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

      {/* ── HERO ── */}
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

      {/* ═══════════════════════════════════════════════════════════════════════
         HOW WE WORK — premium horizontal flow
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20 overflow-hidden" style={{ backgroundColor: W }}>
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-10 md:mb-14 text-center" style={{ color: Au }}>
            HOW WE WORK
          </p>

          <div className="relative">
            {/* Background track line */}
            <div
              className="absolute left-[28px] right-[28px] md:left-[36px] md:right-[36px] top-[20px] md:top-[24px] h-[1.5px]"
              style={{ backgroundColor: `${G}10` }}
            />
            {/* Animated gold pulse line */}
            <div
              className="absolute left-[28px] right-[28px] md:left-[36px] md:right-[36px] top-[20px] md:top-[24px] h-[1.5px] overflow-hidden"
            >
              <div
                className="h-full rounded-full"
                style={{ backgroundColor: Au, animation: "flow-pulse 4s ease-in-out infinite" }}
              />
            </div>

            {/* Steps */}
            <div className="relative z-10 flex items-start justify-between">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === STEPS.length - 1;
                return (
                  <div key={i} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
                    <div
                      className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full flex items-center justify-center transition-all duration-500"
                      style={{
                        backgroundColor: isLast ? Au : W,
                        border: isLast ? "none" : `1.5px solid ${G}18`,
                        boxShadow: isLast ? "0 4px 20px rgba(180,140,76,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
                        animation: isLast ? "dot-glow 3s ease-in-out infinite" : "none",
                      }}
                    >
                      <Icon size={16} style={{ color: isLast ? W : G, opacity: isLast ? 1 : 0.7 }} strokeWidth={1.5} />
                    </div>
                    <span
                      className="mt-2.5 text-[9px] md:text-[10px] font-medium text-center leading-tight"
                      style={{ color: G, opacity: isLast ? 0.85 : 0.45 }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
         BLUEPRINTS — horizontal scroll with arrows
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24" style={{ backgroundColor: Cr }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between px-6 mb-8 md:mb-12">
            <div>
              <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: Au }}>
                POSITIONING BLUEPRINTS
              </p>
              <h2 className="text-[clamp(22px,3vw,32px)] font-light tracking-tight leading-tight" style={{ color: G }}>
                Your industry roadmap.
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scroll(bpScrollRef, "left")} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105" style={{ border: `1.5px solid ${G}18` }}>
                <ArrowRight size={14} style={{ color: G, transform: "rotate(180deg)" }} />
              </button>
              <button onClick={() => scroll(bpScrollRef, "right")} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105" style={{ backgroundColor: G }}>
                <ArrowRight size={14} style={{ color: Au }} />
              </button>
            </div>
          </div>

          <div ref={bpScrollRef} className="flex gap-4 overflow-x-auto pl-6 pr-6 pb-2 snap-x snap-mandatory hide-scroll">
            {BLUEPRINTS.map((bp) => (
              <Link key={bp.id} href="/bizdoc/blueprint">
                <div className="snap-start shrink-0 w-[200px] md:w-[220px] group cursor-pointer">
                  {/* Card */}
                  <div
                    className="rounded-2xl p-5 md:p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg mb-3"
                    style={{ backgroundColor: W, boxShadow: "0 1px 8px rgba(0,0,0,0.03)" }}
                  >
                    <span className="text-[22px] mb-3 block">{bp.emoji}</span>
                    <span className="text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase block mb-2" style={{ color: Au }}>
                      {bp.badge}
                    </span>
                    <h3 className="text-[13px] md:text-[14px] font-semibold leading-snug" style={{ color: G }}>
                      {bp.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium flex items-center gap-1 pl-1 transition-all group-hover:gap-2" style={{ color: Au }}>
                    View Roadmap <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
            {/* Spacer for edge scroll */}
            <div className="shrink-0 w-1" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
         SERVICES — horizontal scroll with arrows
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between px-6 mb-8 md:mb-12">
            <div>
              <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: Au }}>
                OUR SERVICES
              </p>
              <h2 className="text-[clamp(22px,3.5vw,36px)] font-light tracking-tight leading-tight" style={{ color: G }}>
                Every layer your business needs.
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scroll(svcScrollRef, "left")} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105" style={{ border: `1.5px solid ${G}18` }}>
                <ArrowRight size={14} style={{ color: G, transform: "rotate(180deg)" }} />
              </button>
              <button onClick={() => scroll(svcScrollRef, "right")} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105" style={{ backgroundColor: G }}>
                <ArrowRight size={14} style={{ color: Au }} />
              </button>
            </div>
          </div>

          <div ref={svcScrollRef} className="flex gap-4 overflow-x-auto pl-6 pr-6 pb-2 snap-x snap-mandatory hide-scroll">
            {SERVICE_CARDS.map((svc) => {
              const Icon = svc.icon;
              return (
                <div
                  key={svc.title}
                  className="snap-start shrink-0 w-[260px] md:w-[280px] rounded-2xl p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  style={{
                    backgroundColor: Cr,
                    border: svc.tag ? `1.5px solid ${Au}30` : `1px solid ${G}08`,
                  }}
                >
                  {/* Tag badge */}
                  {svc.tag && (
                    <span
                      className="self-start text-[8px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full mb-4"
                      style={{ backgroundColor: `${Au}15`, color: Au }}
                    >
                      {svc.tag}
                    </span>
                  )}

                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${G}06` }}
                  >
                    <Icon size={16} style={{ color: G }} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-[14px] md:text-[15px] font-semibold mb-1.5" style={{ color: G }}>
                    {svc.title}
                  </h3>

                  {svc.price && (
                    <span className="text-[12px] font-semibold mb-2 block" style={{ color: Au }}>
                      {svc.price}
                    </span>
                  )}

                  <p className="text-[12px] leading-relaxed mb-auto pb-4" style={{ color: G, opacity: 0.5 }}>
                    {svc.line}
                  </p>

                  <button
                    onClick={() => openChat(svc.context)}
                    className="text-[12px] font-semibold flex items-center gap-1.5 transition-all hover:gap-2.5"
                    style={{ color: Au }}
                  >
                    Get Started <ArrowRight size={12} />
                  </button>
                </div>
              );
            })}
            <div className="shrink-0 w-1" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
         TRACK
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="track" className="py-24 md:py-32" style={{ backgroundColor: Cr }}>
        <div className="max-w-lg mx-auto px-6 text-center">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: Au }}>
            TRACK
          </p>
          <h2 className="text-[clamp(24px,3.5vw,32px)] font-light tracking-tight mb-3" style={{ color: G }}>
            Track Your File
          </h2>
          <p className="text-[13px] mb-8" style={{ color: G, opacity: 0.45 }}>
            Enter your reference to check status.
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={trackCode}
              onChange={(e) => handleTrackInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="HMZ-26/3-XXXX"
              maxLength={17}
              className="flex-1 rounded-full px-5 py-3.5 text-[14px] outline-none font-mono transition-all focus:ring-1"
              style={{ backgroundColor: W, color: G, border: `1px solid ${G}12`, boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}
            />
            <button
              onClick={handleTrack}
              disabled={trackQuery.isFetching}
              className="px-6 py-3.5 rounded-full text-[13px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 shrink-0"
              style={{ backgroundColor: G, color: Au }}
            >
              {trackQuery.isFetching ? <Loader2 size={14} className="animate-spin" /> : "Access"}
            </button>
          </div>

          {/* Result: found */}
          {trackSubmitted && !trackQuery.isFetching && trackQuery.data?.found && (
            <div className="rounded-2xl p-6 text-left" style={{ backgroundColor: W, boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: Au }}>
                {trackQuery.data.ref}
              </p>
              <p className="text-[16px] font-semibold mb-0.5" style={{ color: G }}>
                {trackQuery.data.clientName}
              </p>
              <p className="text-[12px] mb-5" style={{ color: G, opacity: 0.45 }}>
                {trackQuery.data.service}
              </p>
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: trackQuery.data.statusTotal }).map((_, i) => (
                  <div key={i} className="h-1 flex-1 rounded-full transition-all"
                    style={{ backgroundColor: i <= (trackQuery.data.statusIndex ?? -1) ? G : `${G}12` }} />
                ))}
              </div>
              <p className="text-[11px] font-semibold mb-5" style={{ color: G }}>{trackQuery.data.status}</p>
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
                className="block w-full py-3 rounded-full text-[13px] font-semibold text-center transition-all hover:scale-[1.01]"
                style={{ backgroundColor: G, color: Au }}
              >
                Open Dashboard
              </a>
            </div>
          )}

          {trackSubmitted && !trackQuery.isFetching && trackQuery.data && !trackQuery.data.found && (
            <p className="text-[12px]" style={{ color: G, opacity: 0.4 }}>
              Reference not found. You'll receive yours after payment.
            </p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6" style={{ backgroundColor: W, borderTop: `1px solid ${G}06` }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px]" style={{ color: G, opacity: 0.35 }}>
          <p className="font-medium tracking-wider">BIZDOC CONSULT</p>
          <p>© {new Date().getFullYear()} HAMZURY</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy"><span className="hover:opacity-80 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-80 transition-opacity cursor-pointer">Terms</span></Link>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color="#1B4D3E" department="bizdoc" />
      <div className="md:hidden h-10" />
    </>
  );
}
