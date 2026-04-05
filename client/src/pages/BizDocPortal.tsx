import { useState, useEffect } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowRight, X, Menu, FileText, Shield, Award, Briefcase, MessageSquare, Loader2, ChevronDown } from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";
import { trpc } from "@/lib/trpc";

const G  = "#1B4D3E";
const Au = "#B48C4C";
const Cr = "#FFFAF6";
const W  = "#FFFFFF";

// ── SERVICE CATEGORIES ───────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  {
    id: "registration",
    title: "Registration & Modification",
    icon: Briefcase,
    items: [
      { name: "CAC Business Name (BN)", context: "CAC Business Name" },
      { name: "CAC Private Limited Company (Ltd)", context: "CAC Limited Company" },
      { name: "CAC NGO / Trusteeship", context: "CAC NGO Registration" },
      { name: "Director / Shareholder Changes", context: "Director Shareholder Changes" },
      { name: "Address Updates", context: "Address Updates" },
      { name: "Name Changes", context: "Name Changes" },
      { name: "Share Allotments", context: "Share Allotments" },
      { name: "Annual Returns", context: "Annual Returns" },
    ],
  },
  {
    id: "subscriptions",
    title: "Subscription Packages",
    icon: Shield,
    items: [
      { name: "Tax ProMax Update", context: "Tax ProMax Update", tag: "₦150K/YEAR" },
      { name: "Tax + CAC Management", context: "Tax CAC Management", tag: "₦200K/YEAR" },
      { name: "Full Compliance Management", context: "Full Compliance Management", tag: "₦500K/YEAR" },
    ],
  },
  {
    id: "renewals",
    title: "Renewals",
    icon: Award,
    items: [
      { name: "Tax Clearance Certificate (TCC)", context: "TCC Renewal" },
      { name: "ITF Compliance Certificate", context: "ITF Renewal" },
      { name: "NSITF Compliance Certificate", context: "NSITF Renewal" },
      { name: "PENCOM Clearance Certificate", context: "PENCOM Renewal" },
      { name: "BPP Registration Renewal", context: "BPP Renewal" },
      { name: "Contract Documents", context: "Contract Documents" },
    ],
  },
  {
    id: "blueprint",
    title: "Business Positioning Blueprint",
    icon: FileText,
    description: "Understand what documents and licences your specific industry needs. We'll guide you through it.",
    cta: { label: "Open Blueprint Tool", href: "/bizdoc/blueprint" },
  },
] as const;

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function BizDocPortal() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
         SERVICES — category cards with item rows
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isBlueprint = cat.id === "blueprint";

              return (
                <div
                  key={cat.id}
                  className="rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: Cr,
                    border: `1px solid ${G}08`,
                  }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${G}08` }}
                    >
                      <Icon size={16} style={{ color: G }} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[14px] font-semibold tracking-tight" style={{ color: G }}>
                      {cat.title}
                    </h3>
                  </div>

                  <div className="h-px mx-5" style={{ backgroundColor: `${G}08` }} />

                  {/* Blueprint special card */}
                  {isBlueprint && "description" in cat ? (
                    <div className="px-5 py-5">
                      <p className="text-[12px] leading-[1.7] mb-5" style={{ color: G, opacity: 0.5 }}>
                        {cat.description}
                      </p>
                      {"cta" in cat && cat.cta && (
                        <Link href={cat.cta.href}>
                          <span
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-300 hover:scale-[1.03] hover:shadow-md cursor-pointer"
                            style={{ backgroundColor: G, color: Au }}
                          >
                            {cat.cta.label}
                            <ArrowRight size={13} />
                          </span>
                        </Link>
                      )}
                    </div>
                  ) : (
                    /* Item rows */
                    <div className="px-3 py-3 flex flex-col gap-1">
                      {"items" in cat && cat.items?.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => openChat(item.context)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all duration-200 hover:scale-[0.995] group/item"
                          style={{ backgroundColor: "transparent" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${W}`)}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <span className="flex-1 text-[12px] font-medium leading-snug" style={{ color: G }}>
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {"tag" in item && item.tag && (
                              <span
                                className="text-[8px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${Au}12`, color: Au }}
                              >
                                {item.tag}
                              </span>
                            )}
                            <ArrowRight
                              size={11}
                              className="opacity-0 group-hover/item:opacity-60 transition-opacity duration-200"
                              style={{ color: G }}
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
         RECOMMENDED PACKAGES
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: `${G}04` }}>
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.35em] uppercase mb-3 text-center" style={{ color: Au }}>
            RECOMMENDED
          </p>
          <h2 className="text-[clamp(22px,3.5vw,32px)] font-light tracking-tight text-center mb-4" style={{ color: G }}>
            Start Right. Stay Compliant.
          </h2>
          <p className="text-sm text-center opacity-50 mb-12 max-w-lg mx-auto" style={{ color: G }}>
            Choose the package that matches where your business is right now.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Package 1 — Starter */}
            <button
              onClick={() => openChat("Starter Package")}
              className="bg-white rounded-2xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg group"
              style={{ borderColor: `${G}10` }}
            >
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4 px-2.5 py-1 rounded-full inline-block" style={{ backgroundColor: `${Au}12`, color: Au }}>STARTER</p>
              <h3 className="text-lg font-medium mb-2" style={{ color: G }}>₦200,000</h3>
              <p className="text-xs opacity-50 mb-5" style={{ color: G }}>One-time setup</p>
              <ul className="space-y-2.5 text-[12px]" style={{ color: G }}>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Full CAC Ltd Registration</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> EFCC Certificate</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Tax ProMax Activation</li>
              </ul>
              <div className="mt-5 pt-4 border-t text-xs font-medium flex items-center justify-between" style={{ borderColor: `${G}08`, color: Au }}>
                Get Started <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Package 2 — Growth */}
            <button
              onClick={() => openChat("Growth Package")}
              className="bg-white rounded-2xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg group relative"
              style={{ borderColor: `${Au}30` }}
            >
              <div className="absolute -top-2.5 left-6 text-[9px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full" style={{ backgroundColor: Au, color: W }}>POPULAR</div>
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4 px-2.5 py-1 rounded-full inline-block" style={{ backgroundColor: `${G}08`, color: G }}>GROWTH</p>
              <h3 className="text-lg font-medium mb-2" style={{ color: G }}>₦450,000</h3>
              <p className="text-xs opacity-50 mb-5" style={{ color: G }}>One-time setup</p>
              <ul className="space-y-2.5 text-[12px]" style={{ color: G }}>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Everything in Starter</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Branding & Templates</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Business Plan</li>
              </ul>
              <div className="mt-5 pt-4 border-t text-xs font-medium flex items-center justify-between" style={{ borderColor: `${G}08`, color: Au }}>
                Get Started <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Package 3 — Pro */}
            <button
              onClick={() => openChat("Pro Package")}
              className="bg-white rounded-2xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg group"
              style={{ borderColor: `${G}10` }}
            >
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4 px-2.5 py-1 rounded-full inline-block" style={{ backgroundColor: `${G}08`, color: G }}>PRO</p>
              <h3 className="text-lg font-medium mb-2" style={{ color: G }}>₦570,000</h3>
              <p className="text-xs opacity-50 mb-5" style={{ color: G }}>1 year management</p>
              <ul className="space-y-2.5 text-[12px]" style={{ color: G }}>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Everything in Growth</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> 1 Year Tax ProMax Management</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> All Contract Documents</li>
              </ul>
              <div className="mt-5 pt-4 border-t text-xs font-medium flex items-center justify-between" style={{ borderColor: `${G}08`, color: Au }}>
                Get Started <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>

            {/* Package 4 — Enterprise */}
            <button
              onClick={() => openChat("Enterprise Package")}
              className="rounded-2xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg group"
              style={{ backgroundColor: G, borderColor: G }}
            >
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4 px-2.5 py-1 rounded-full inline-block" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: W }}>ENTERPRISE</p>
              <h3 className="text-lg font-medium mb-2" style={{ color: W }}>₦1,000,000</h3>
              <p className="text-xs opacity-50 mb-5" style={{ color: W }}>1 year full compliance</p>
              <ul className="space-y-2.5 text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> Everything in Pro</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> ITF + NSITF + PENCOM</li>
                <li className="flex items-start gap-2"><span style={{ color: Au }}>✓</span> BPP Registration</li>
                <li className="flex items-start gap-2 opacity-60"><span className="text-[10px]">ℹ️</span> <span className="italic">After company does 1 year</span></li>
              </ul>
              <div className="mt-5 pt-4 border-t text-xs font-medium flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.12)", color: Au }}>
                Get Started <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
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
