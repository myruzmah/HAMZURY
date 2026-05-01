import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Rocket, ArrowRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const DARK = "#1E3A5F";
const GOLD = "#B48C4C";
const TEXT = "#1A1A1A";
const BG = "#FFFAF6";
const W = "#FFFFFF";

// Real student-owned startups out of HUB — replace placeholders with real names and one-liners.
const STUDENT_STARTUPS: { name: string; founder: string; oneLiner: string; year: string }[] = [
  { name: "[Startup name]", founder: "[Founder — HUB cohort year]", oneLiner: "[One-line description of what they do]", year: "2026" },
  { name: "[Startup name]", founder: "[Founder]", oneLiner: "[One-line description]", year: "2026" },
  { name: "[Startup name]", founder: "[Founder]", oneLiner: "[One-line description]", year: "2025" },
  { name: "[Startup name]", founder: "[Founder]", oneLiner: "[One-line description]", year: "2025" },
];

const VENTURES = [
  { name: "Hamzury Ventures", brief: "Seed cheques + advisory for HUB graduates building real products.", focus: ["Pre-seed funding", "Founder office hours", "Bizdoc / Scalar / Medialy support"] },
  { name: "Co-founder Match", brief: "We pair complementary HUB grads who want to build together.", focus: ["Skill match-making", "Equity templates", "Founders' agreement support"] },
  { name: "Incubator Demo Days", brief: "Quarterly showcase where startups pitch to a curated room.", focus: ["Pitch coaching", "Investor intros", "Press + post-event coverage"] },
  { name: "Portfolio Hiring", brief: "Roles open inside HUB-backed startups, first look for alumni.", focus: ["Junior + mid roles", "Equity + cash offers", "Remote + Jos-based"] },
];

export default function StartupPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: BG, color: TEXT, minHeight: "100vh" }}>
      <PageMeta title="Startup | HAMZURY HUB" description="Hamzury Ventures + Startup access for HUB graduates — seed cheques, co-founder matching, demo days." />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <Link href="/hub">
            <span className="text-[13px] tracking-[4px] font-light uppercase cursor-pointer hover:opacity-70 transition-opacity" style={{ color: TEXT }}>
              HAMZURY HUB
            </span>
          </Link>
          <button onClick={() => setMobileMenuOpen(p => !p)} className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70" style={{ color: TEXT }} aria-label="Menu">
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {mobileMenuOpen && (
            <div className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl" style={{ backgroundColor: W }} onClick={() => setMobileMenuOpen(false)}>
              <Link href="/hub"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Programmes</span></Link>
              <Link href="/startup"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: GOLD }}>Startup</span></Link>
              <Link href="/alumni"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Alumni</span></Link>
              <Link href="/milestones"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Milestones</span></Link>
              <Link href="/hub/enroll">
                <span className="block mx-2 mt-2 px-4 py-3 rounded-xl text-[13px] font-semibold text-center cursor-pointer" style={{ backgroundColor: DARK, color: GOLD }}>
                  Enrol now →
                </span>
              </Link>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>
            HAMZURY HUB · STARTUP
          </p>
          <h1 className="text-[clamp(32px,6vw,54px)] font-light leading-[1.05] tracking-tight mb-6" style={{ color: TEXT }}>
            Graduate. <span style={{ color: DARK }}>Then build.</span>
          </h1>
          <p className="text-[15px] leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: TEXT, opacity: 0.6 }}>
            HUB graduates unlock access to Hamzury Ventures, co-founder matching, demo days, and hiring inside our portfolio companies.
          </p>
        </div>
      </section>

      {/* Real student-owned startups */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>BUILT BY HUB STUDENTS</p>
            <h2 className="text-[clamp(24px,3.5vw,32px)] font-light tracking-tight" style={{ color: TEXT }}>
              Startups that started <span style={{ color: DARK }}>in our classrooms.</span>
            </h2>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {STUDENT_STARTUPS.map((s, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: W, border: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: GOLD }}>{s.year}</p>
                <h3 className="text-[16px] font-semibold tracking-tight mb-1" style={{ color: TEXT }}>{s.name}</h3>
                <p className="text-[12px] mb-2" style={{ color: TEXT, opacity: 0.55 }}>{s.founder}</p>
                <p className="text-[13px] leading-[1.55]" style={{ color: TEXT, opacity: 0.75 }}>{s.oneLiner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {VENTURES.map(v => (
            <div key={v.name} className="rounded-2xl p-6" style={{ backgroundColor: W, border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Rocket size={16} style={{ color: GOLD }} />
                <h3 className="text-[16px] font-semibold" style={{ color: TEXT }}>{v.name}</h3>
              </div>
              <p className="text-[13px] mb-4" style={{ color: TEXT, opacity: 0.65 }}>{v.brief}</p>
              <ul className="space-y-1.5">
                {v.focus.map(f => (
                  <li key={f} className="text-[12px] flex items-start gap-1.5" style={{ color: TEXT, opacity: 0.7 }}>
                    <span style={{ color: GOLD }}>·</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <Link href="/hub/enroll">
            <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-semibold cursor-pointer transition-transform hover:scale-[1.02]" style={{ backgroundColor: DARK, color: GOLD }}>
              Start at HUB <ArrowRight size={14} />
            </span>
          </Link>
          <p className="text-[12px] mt-4" style={{ color: TEXT, opacity: 0.5 }}>
            Startup access is unlocked after graduating any HUB programme.
          </p>
        </div>
      </section>
    </div>
  );
}
