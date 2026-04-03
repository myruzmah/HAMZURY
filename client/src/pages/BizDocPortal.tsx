import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, ArrowLeft, X, Menu, FileText, Shield, Scale, Award, Briefcase, MessageSquare, Loader2, ChevronDown } from "lucide-react";
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

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function BizDocPortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSvcIdx, setActiveSvcIdx] = useState(0);
  const svcScrollRef = useRef<HTMLDivElement>(null);

  const PACKAGES = SERVICE_CARDS.filter(s => s.tag);
  const INDIVIDUAL = SERVICE_CARDS.filter(s => !s.tag);

  // Mobile swipe for individual services
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setActiveSvcIdx(prev =>
        diff > 0 ? Math.min(prev + 1, INDIVIDUAL.length - 1) : Math.max(prev - 1, 0)
      );
    }
  };

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
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-drift {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        .fade-up { animation: fade-up 0.8s ease-out both; }
        .fade-up-d1 { animation: fade-up 0.8s ease-out 0.1s both; }
        .fade-up-d2 { animation: fade-up 0.8s ease-out 0.2s both; }
        .fade-up-d3 { animation: fade-up 0.8s ease-out 0.3s both; }
      `}</style>

      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2.5" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F2` : "transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <Link href="/bizdoc">
            <span
              className="text-[12px] tracking-[0.3em] font-medium uppercase cursor-pointer select-none"
              style={{ color: scrolled ? G : W }}
            >
              BIZDOC
            </span>
          </Link>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:opacity-70"
            style={{ color: scrolled ? G : W, backgroundColor: scrolled ? `${G}06` : "rgba(255,255,255,0.1)" }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {navMenuOpen && (
            <div
              className="absolute top-14 right-0 rounded-2xl py-3 min-w-[240px] border"
              style={{ backgroundColor: W, borderColor: `${G}08`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
              onClick={() => setNavMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setNavMenuOpen(false);
                  const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                  if (btn) btn.click();
                }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl w-[calc(100%-16px)] text-left mx-2 mb-1 transition-all hover:scale-[0.98]"
                style={{ backgroundColor: `${Au}0C`, color: Au }}
              >
                <MessageSquare size={15} strokeWidth={1.5} />
                <span className="text-[13px] font-medium">Chat with us</span>
              </button>
              <div className="h-px mx-4 my-1" style={{ backgroundColor: `${G}06` }} />
              {[
                { label: "Home",       href: "/" },
                { label: "Systemise",  href: "/systemise" },
                { label: "Skills",     href: "/skills" },
                { label: "Pricing",    href: "/pricing" },
                { label: "Consultant", href: "/consultant" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50/80 cursor-pointer" style={{ color: G }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
         HERO
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(165deg, ${G} 0%, #143D31 50%, #0F2E24 100%)` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -right-[20%] w-[600px] h-[600px] rounded-full opacity-[0.03]" style={{ background: `radial-gradient(circle, ${Au} 0%, transparent 70%)` }} />
          <div className="absolute -bottom-[30%] -left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: `radial-gradient(circle, ${W} 0%, transparent 70%)` }} />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className="fade-up">
            <span className="inline-block text-[10px] font-semibold tracking-[0.35em] uppercase mb-8 px-4 py-2 rounded-full" style={{ color: Au, backgroundColor: `${Au}10`, border: `1px solid ${Au}15` }}>
              BUSINESS COMPLIANCE
            </span>
          </div>
          <h1
            className="text-[clamp(34px,7vw,56px)] font-light leading-[1.08] mb-7 tracking-tight fade-up-d1"
            style={{ color: W }}
          >
            Every filing. Every licence.{" "}
            <span style={{ color: Au }}>Handled.</span>
          </h1>
          <p className="text-[15px] leading-[1.8] mb-14 max-w-lg mx-auto fade-up-d2" style={{ color: W, opacity: 0.5 }}>
            CAC registration. Tax compliance. Sector licences. Legal documentation. So you can operate, win contracts, and scale.
          </p>
          <div className="flex flex-wrap gap-3 justify-center fade-up-d3">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-9 py-4 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              style={{ backgroundColor: Au, color: G }}
            >
              Our Services
            </button>
            <button
              onClick={() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" })}
              className="px-9 py-4 rounded-full text-[13px] font-medium tracking-wide transition-all duration-300 hover:bg-white/10"
              style={{ color: W, border: `1px solid rgba(255,255,255,0.15)` }}
            >
              Track
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <ChevronDown size={18} style={{ color: W, animation: "hero-drift 2.5s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
         SERVICES — grid layout, compact cards
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-16 md:py-24" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8 md:mb-12">
            <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: Au }}>
              OUR SERVICES
            </p>
            <h2 className="text-[clamp(22px,3.5vw,32px)] font-light tracking-tight leading-tight" style={{ color: G }}>
              Every layer your business needs.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {SERVICE_CARDS.map((svc) => {
              const Icon = svc.icon;
              const isPackage = !!svc.tag;
              return (
                <div
                  key={svc.title}
                  className="rounded-[16px] p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col group relative overflow-hidden cursor-pointer"
                  style={{
                    backgroundColor: isPackage ? Cr : W,
                    border: isPackage ? `1.5px solid ${Au}20` : `1px solid ${G}08`,
                  }}
                  onClick={() => openChat(svc.context)}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: isPackage ? `linear-gradient(90deg, ${Au}, ${Au}40)` : `linear-gradient(90deg, ${G}30, ${G}10)` }} />

                  {svc.tag && (
                    <span className="self-start text-[7px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full mb-3" style={{ backgroundColor: `${Au}10`, color: Au }}>
                      {svc.tag}
                    </span>
                  )}

                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: isPackage ? `${Au}08` : `${G}05` }}>
                    <Icon size={14} style={{ color: isPackage ? Au : G }} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-[13px] font-semibold mb-0.5" style={{ color: G }}>{svc.title}</h3>
                  {svc.price && <span className="text-[14px] font-light mb-1.5 block tracking-tight" style={{ color: Au }}>{svc.price}</span>}
                  <p className="text-[10px] leading-[1.6] mb-auto pb-3" style={{ color: G, opacity: 0.4 }}>{svc.line}</p>

                  <span className="text-[10px] font-semibold flex items-center gap-1 transition-all group-hover:gap-2" style={{ color: Au }}>
                    Get Started <ArrowRight size={10} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
         TRACK
         ═══════════════════════════════════════════════════════════════════════ */}
      <section id="track" className="py-24 md:py-32" style={{ backgroundColor: Cr }}>
        <div className="max-w-lg mx-auto px-6 text-center">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: Au }}>
            TRACK
          </p>
          <h2 className="text-[clamp(24px,3.5vw,34px)] font-light tracking-tight mb-2" style={{ color: G }}>
            Track Your File
          </h2>
          <p className="text-[13px] mb-10" style={{ color: G, opacity: 0.4 }}>
            Enter your reference to check status.
          </p>

          <div className="flex gap-2.5 mb-8">
            <input
              type="text"
              value={trackCode}
              onChange={(e) => handleTrackInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="HMZ-26/4-XXXX"
              maxLength={17}
              className="flex-1 rounded-2xl px-5 py-4 text-[14px] outline-none font-mono transition-all duration-300 focus:shadow-md"
              style={{ backgroundColor: W, color: G, border: `1px solid ${G}0A`, boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}
            />
            <button
              onClick={handleTrack}
              disabled={trackQuery.isFetching}
              className="px-7 py-4 rounded-2xl text-[13px] font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 shrink-0"
              style={{ backgroundColor: G, color: Au }}
            >
              {trackQuery.isFetching ? <Loader2 size={15} className="animate-spin" /> : "Access"}
            </button>
          </div>

          {trackSubmitted && !trackQuery.isFetching && trackQuery.data?.found && (
            <div className="rounded-[22px] p-7 text-left relative overflow-hidden" style={{ backgroundColor: W, boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${Au}, ${Au}40)` }} />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: Au }}>
                {trackQuery.data.ref}
              </p>
              <p className="text-[17px] font-semibold mb-0.5" style={{ color: G }}>
                {trackQuery.data.clientName}
              </p>
              <p className="text-[12px] mb-6" style={{ color: G, opacity: 0.4 }}>
                {trackQuery.data.service}
              </p>
              <div className="flex items-center gap-1.5 mb-2.5">
                {Array.from({ length: trackQuery.data.statusTotal }).map((_, i) => (
                  <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-500"
                    style={{ backgroundColor: i <= (trackQuery.data.statusIndex ?? -1) ? Au : `${G}0A` }} />
                ))}
              </div>
              <p className="text-[11px] font-semibold mb-6" style={{ color: G }}>{trackQuery.data.status}</p>
              <a
                href="/client/dashboard"
                onClick={e => {
                  e.preventDefault();
                  localStorage.setItem("hamzury-client-session", JSON.stringify({
                    ref: trackQuery.data!.ref, phone: "", name: trackQuery.data!.clientName,
                    businessName: trackQuery.data!.businessName, service: trackQuery.data!.service,
                    status: trackQuery.data!.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000
                  }));
                  window.location.href = "/client/dashboard";
                }}
                className="block w-full py-3.5 rounded-2xl text-[13px] font-semibold text-center transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                style={{ backgroundColor: G, color: Au }}
              >
                Open Dashboard
              </a>
            </div>
          )}

          {trackSubmitted && !trackQuery.isFetching && trackQuery.data && !trackQuery.data.found && (
            <p className="text-[12px]" style={{ color: G, opacity: 0.35 }}>
              Reference not found. You'll receive yours after payment.
            </p>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]" style={{ color: G, opacity: 0.3 }}>
          <p className="font-medium tracking-[0.2em]">BIZDOC CONSULT</p>
          <p>© {new Date().getFullYear()} HAMZURY</p>
          <div className="flex items-center gap-6">
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
