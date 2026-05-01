/**
 * DivisionPortalTemplate — the shared structure used by Bizdoc, Scalar,
 * Medialy, and HUB. Mirrors the original BizDocPortal design: splash,
 * minimal scroll-aware nav, gradient hero, recommended-packages grid,
 * categorised services, reference tracking, footer.
 *
 * Every division passes the same shape of config; the layout is locked.
 */
import { useState, useEffect, type ElementType } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import {
  ArrowRight, X, Menu, MessageSquare, Loader2, ChevronDown, ChevronRight, AlertCircle,
} from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";
import SplashScreen from "@/components/SplashScreen";
import { trpc } from "@/lib/trpc";
import DivisionServices from "./DivisionServices";
import type { DivisionServicesCatalog } from "./division-services-types";

/* ─── Config shape ─────────────────────────────────────────────────────── */
export type PackageConfig = {
  id: string;
  label: string;
  price: string;
  sub: string;
  items: string[];
  badge?: string;
  note?: string;
  dark?: boolean;
  context: string;
};

export type ServiceItem = { name: string; context: string; tag?: string };
export type ServiceCategory = {
  id: string;
  title: string;
  icon: ElementType;
  items: ServiceItem[];
};

export type DivisionPortalConfig = {
  /** Short uppercase name for splash + footer, e.g. "BIZDOC" */
  name: string;
  /** Full label for browser tab */
  pageTitle: string;
  /** SEO description */
  pageDescription: string;
  /** Splash tagline */
  splashTagline: string;
  /** Hero heading — first line. The last word is highlighted in gold. */
  heroHeading: string;
  heroHighlight: string;
  /** Hero subheading paragraph */
  heroSub: string;
  /** Recommended Packages eyebrow text, e.g. "RECOMMENDED" */
  packagesEyebrow: string;
  /** Recommended Packages title, e.g. "Start Right. Stay Compliant." */
  packagesTitle: string;
  /** Recommended Packages sub text */
  packagesSub: string;
  /** Services section eyebrow */
  servicesEyebrow: string;
  /** Services section title, e.g. "Every layer your business needs." */
  servicesTitle: string;
  /** 4 package cards */
  packages: PackageConfig[];
  /** 2-4 service categories (legacy — used as fallback when servicesCatalog is absent) */
  serviceCategories: ServiceCategory[];
  /** Optional richer services catalog. When supplied, the template renders the
   *  DivisionServices component (educational layer + cart + industries) instead
   *  of the legacy serviceCategories accordion. */
  servicesCatalog?: DivisionServicesCatalog;
  /** Nav menu links to other divisions */
  navLinks: { label: string; href: string }[];
  /** Primary accent (deep brand colour) */
  accent: string;
  /** Secondary accent (gold or warm highlight) */
  highlight: string;
  /** Path prefix, e.g. "/bizdoc" — used for splash key + motivational bar dept */
  path: string;
  /** Footer division label */
  footerLabel: string;
  /** Optional link shown as a 3rd hero button (e.g. "Blueprint") */
  blueprintLink?: { label: string; href: string };
  /** Motivational bar department name — must match existing dept names */
  motivationalDept: "bizdoc" | "systemise" | "skills" | "general";
};

/* ─── Component ────────────────────────────────────────────────────────── */
export default function DivisionPortalTemplate({ cfg }: { cfg: DivisionPortalConfig }) {
  const G  = cfg.accent;
  const Au = cfg.highlight;
  const Cr = "#FFFAF6";
  const W  = "#FFFFFF";

  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

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
    trackQuery.refetch().then(res => {
      if (res.data?.found) {
        const d = res.data;
        localStorage.setItem("hamzury-client-session", JSON.stringify({
          ref: d.ref, phone: "", name: d.clientName,
          businessName: d.businessName, service: d.service,
          status: d.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000
        }));
        window.location.href = "/client/dashboard";
      }
    });
  };

  const openChat = (context: string) => {
    localStorage.setItem("hamzury-chat-context", context);
    const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
    if (btn) btn.click();
  };

  return (
    <>
      <SplashScreen
        text={cfg.name}
        color={G}
        accent={Au}
        departmentName={cfg.name}
        tagline={cfg.splashTagline}
      />
      <PageMeta title={cfg.pageTitle} description={cfg.pageDescription} />

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
          <Link href={cfg.path}>
            <span
              className="text-[12px] tracking-[0.3em] font-medium uppercase cursor-pointer select-none"
              style={{ color: scrolled ? G : W }}
            >
              {cfg.name}
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
              {cfg.navLinks.map(item => (
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

      {/* ── HERO ── */}
      <section
        className="relative min-h-[80vh] md:min-h-[88vh] flex items-center justify-center overflow-hidden py-20 md:py-24"
        style={{ background: `linear-gradient(165deg, ${G} 0%, ${darken(G, 0.08)} 50%, ${darken(G, 0.18)} 100%)` }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-[40%] -right-[20%] w-[600px] h-[600px] rounded-full opacity-[0.03]"
            style={{ background: `radial-gradient(circle, ${Au} 0%, transparent 70%)` }}
          />
          <div
            className="absolute -bottom-[30%] -left-[15%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: `radial-gradient(circle, ${W} 0%, transparent 70%)` }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h1
            className="text-[clamp(34px,7vw,56px)] font-light leading-[1.08] mb-7 tracking-tight fade-up"
            style={{ color: W }}
          >
            {cfg.heroHeading}{" "}
            <span style={{ color: Au }}>{cfg.heroHighlight}</span>
          </h1>
          <p
            className="text-[15px] md:text-[16px] leading-[1.7] mb-12 max-w-lg mx-auto fade-up-d1"
            style={{ color: W, opacity: 0.72 }}
          >
            {cfg.heroSub}
          </p>
          <div className="flex flex-wrap gap-3 justify-center fade-up-d2">
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] hover:opacity-95"
              style={{ backgroundColor: Au, color: G, boxShadow: `0 8px 24px ${Au}40` }}
            >
              See our services
            </button>
            <button
              onClick={() => document.getElementById("track")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-300 hover:opacity-90"
              style={{ color: W, border: `1px solid rgba(255,255,255,0.28)` }}
            >
              Track my file
            </button>
            {cfg.blueprintLink && (
              <Link href={cfg.blueprintLink.href}>
                <span
                  className="px-7 py-3.5 rounded-full text-[12px] font-medium tracking-wide cursor-pointer inline-block transition-all duration-300 hover:opacity-80"
                  style={{ color: Au, border: `1px solid ${Au}25` }}
                >
                  {cfg.blueprintLink.label}
                </span>
              </Link>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <ChevronDown size={18} style={{ color: W, animation: "hero-drift 2.5s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ── RECOMMENDED PACKAGES ── */}
      <section className="py-16 md:py-28" style={{ backgroundColor: `${G}04` }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.35em] uppercase mb-3 text-center" style={{ color: Au }}>
            {cfg.packagesEyebrow}
          </p>
          <h2 className="text-[clamp(22px,3.5vw,32px)] font-light tracking-tight text-center mb-4" style={{ color: G }}>
            {cfg.packagesTitle}
          </h2>
          <p className="text-sm text-center opacity-50 mb-10 md:mb-12 max-w-lg mx-auto" style={{ color: G }}>
            {cfg.packagesSub}
          </p>

          {/* MOBILE: 2x2 compact grid */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {cfg.packages.map((pkg) => {
              const isOpen = expandedPkg === pkg.id;
              return (
                <div key={pkg.id} className="relative">
                  {pkg.badge && (
                    <div className="absolute -top-2 left-3 z-10 text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: Au, color: W }}>
                      {pkg.badge}
                    </div>
                  )}
                  <button
                    onClick={() => setExpandedPkg(isOpen ? null : pkg.id)}
                    className="w-full rounded-2xl border p-4 text-left transition-all"
                    style={{
                      backgroundColor: pkg.dark ? G : W,
                      borderColor: pkg.badge ? `${Au}40` : pkg.dark ? G : `${G}10`,
                    }}
                  >
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: pkg.dark ? "rgba(255,255,255,0.7)" : Au }}>
                      {pkg.label}
                    </p>
                    <p className="text-[16px] font-semibold mb-1" style={{ color: pkg.dark ? W : G }}>
                      {pkg.price}
                    </p>
                    <p className="text-[10.5px] opacity-60" style={{ color: pkg.dark ? W : G }}>
                      {pkg.sub}
                    </p>
                    <p className="text-[10.5px] mt-3 flex items-center gap-1 font-medium"
                       style={{ color: pkg.dark ? W : G, opacity: 0.7 }}>
                      {isOpen ? "Hide" : "Tap to see what's inside"}
                      <ChevronDown
                        size={11}
                        style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
                      />
                    </p>
                  </button>
                  {isOpen && (
                    <div
                      className="col-span-2 mt-2 rounded-2xl border p-4"
                      style={{
                        backgroundColor: pkg.dark ? darken(G, 0.08) : Cr,
                        borderColor: pkg.dark ? `${G}` : `${G}10`,
                      }}
                    >
                      <ul className="space-y-2 text-[11px] mb-3" style={{ color: pkg.dark ? "rgba(255,255,255,0.85)" : G }}>
                        {pkg.items.map((it, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span style={{ color: Au }}>✓</span> {it}
                          </li>
                        ))}
                        {pkg.note && (
                          <li className="flex items-start gap-2 opacity-60">
                            <span className="text-[9px]">ℹ️</span> <span className="italic">{pkg.note}</span>
                          </li>
                        )}
                      </ul>
                      <button
                        onClick={() => openChat(pkg.context)}
                        className="w-full py-3 rounded-xl text-[12px] font-semibold text-center transition-all hover:opacity-95"
                        style={{ backgroundColor: pkg.dark ? Au : G, color: pkg.dark ? G : Au }}
                      >
                        Start with this →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP: full 4-col grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
            {cfg.packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => openChat(pkg.context)}
                className="rounded-2xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg group relative"
                style={{
                  backgroundColor: pkg.dark ? G : W,
                  borderColor: pkg.badge ? `${Au}30` : pkg.dark ? G : `${G}10`,
                }}
              >
                {pkg.badge && (
                  <div className="absolute -top-2.5 left-6 text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: Au, color: W }}>
                    {pkg.badge}
                  </div>
                )}
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4 px-2.5 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: pkg.dark ? "rgba(255,255,255,0.12)" : pkg.badge ? `${G}08` : `${Au}12`,
                    color: pkg.dark ? W : pkg.badge ? G : Au,
                  }}
                >
                  {pkg.label}
                </p>
                <h3 className="text-lg font-medium mb-2" style={{ color: pkg.dark ? W : G }}>{pkg.price}</h3>
                <p className="text-xs opacity-50 mb-5" style={{ color: pkg.dark ? W : G }}>{pkg.sub}</p>
                <ul className="space-y-2.5 text-[12px]" style={{ color: pkg.dark ? "rgba(255,255,255,0.85)" : G }}>
                  {pkg.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> {it}</li>
                  ))}
                  {pkg.note && (
                    <li className="flex items-start gap-2 opacity-60"><span className="text-[10px]">ℹ️</span> <span className="italic">{pkg.note}</span></li>
                  )}
                </ul>
                <div className="mt-5 pt-4 border-t text-[12px] font-semibold flex items-center justify-between"
                  style={{ borderColor: pkg.dark ? "rgba(255,255,255,0.12)" : `${G}10`, color: Au }}
                >
                  <span>Start with this</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-12 md:py-24 overflow-x-hidden" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-6">
          <div className="mb-8 md:mb-12">
            <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.35em] uppercase mb-3" style={{ color: Au }}>
              {cfg.servicesEyebrow}
            </p>
            <h2 className="text-[clamp(22px,3.5vw,32px)] font-light tracking-tight leading-tight" style={{ color: G }}>
              {cfg.servicesTitle}
            </h2>
          </div>

          {cfg.servicesCatalog ? (
            <DivisionServices
              catalog={cfg.servicesCatalog}
              accent={G}
              highlight={Au}
              division={cfg.motivationalDept === "skills" ? "general" : cfg.motivationalDept}
            />
          ) : (
          <>
          {/* MOBILE: compact accordion */}
          <div className="md:hidden flex flex-col gap-2">
            {cfg.serviceCategories.map((cat) => {
              const Icon = cat.icon;
              const isOpen = expandedCat === cat.id;
              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden border" style={{ borderColor: isOpen ? `${G}20` : `${G}08`, backgroundColor: Cr }}>
                  <button
                    onClick={() => setExpandedCat(isOpen ? null : cat.id)}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-left"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${G}08` }}>
                      <Icon size={14} style={{ color: G }} strokeWidth={1.5} />
                    </div>
                    <span className="flex-1 text-[13px] font-semibold" style={{ color: G }}>{cat.title}</span>
                    <span className="text-[10px] opacity-40 mr-1" style={{ color: G }}>{cat.items.length}</span>
                    <ChevronRight
                      size={14}
                      style={{ color: G, opacity: 0.3, transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 flex flex-col gap-0.5">
                      <div className="h-px mb-1" style={{ backgroundColor: `${G}08` }} />
                      {cat.items.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => openChat(item.context)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-left transition-colors active:bg-white"
                        >
                          <span className="flex-1 text-[12px] font-medium" style={{ color: G }}>{item.name}</span>
                          {item.tag && (
                            <span className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Au}12`, color: Au }}>
                              {item.tag}
                            </span>
                          )}
                          <ArrowRight size={10} style={{ color: Au, opacity: 0.5 }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* DESKTOP: grid cards */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            {cfg.serviceCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  style={{ backgroundColor: Cr, border: `1px solid ${G}08` }}
                >
                  <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${G}08` }}>
                      <Icon size={16} style={{ color: G }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[14px] font-semibold tracking-tight" style={{ color: G }}>{cat.title}</h3>
                  </div>
                  <div className="h-px mx-5" style={{ backgroundColor: `${G}08` }} />
                  <div className="px-3 py-3 flex flex-col gap-1">
                    {cat.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => openChat(item.context)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:scale-[0.995] group/item"
                        style={{ backgroundColor: "transparent" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${W}`)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <span className="flex-1 text-[12px] font-medium leading-snug" style={{ color: G }}>{item.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.tag && (
                            <span className="text-[8px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${Au}12`, color: Au }}>
                              {item.tag}
                            </span>
                          )}
                          <ArrowRight size={11} className="opacity-0 group-hover/item:opacity-60 transition-opacity duration-200" style={{ color: G }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          </>
          )}
        </div>
      </section>

      {/* ── TRACK ── */}
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
          <p className="font-medium tracking-[0.2em]">{cfg.footerLabel}</p>
          <p>© {new Date().getFullYear()} HAMZURY · Built to Last.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/privacy"><span className="hover:opacity-80 transition-opacity cursor-pointer">Privacy</span></Link>
            <Link href="/terms"><span className="hover:opacity-80 transition-opacity cursor-pointer">Terms</span></Link>
            <button
              onClick={() => openChat(`I want to file a complaint or give a suggestion about ${cfg.name} services.`)}
              className="hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1"
            >
              <AlertCircle size={10} /> Complaint / Suggestion
            </button>
          </div>
        </div>
      </footer>

      <MotivationalQuoteBar color={G} department={cfg.motivationalDept} />
      <div className="md:hidden h-10" />
    </>
  );
}

/** Darken a hex color by a factor (0-1). Simple RGB shift — good enough for gradients. */
function darken(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = Math.max(0, Math.floor(((n >> 16) & 0xFF) * (1 - factor)));
  const g = Math.max(0, Math.floor(((n >> 8) & 0xFF) * (1 - factor)));
  const b = Math.max(0, Math.floor((n & 0xFF) * (1 - factor)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0").toUpperCase()}`;
}
