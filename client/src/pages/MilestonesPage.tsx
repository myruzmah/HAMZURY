import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Award } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const DARK = "#1E3A5F";
const GOLD = "#B48C4C";
const TEXT = "#1A1A1A";
const BG = "#FFFAF6";
const W = "#FFFFFF";

type Milestone = { year: string; headline: string; achievements: string[]; progress?: string };

// Replace the placeholder achievements / progress lines with the real ones as years roll forward.
const MILESTONES: Milestone[] = [
  {
    year: "2026",
    headline: "Year of acceleration.",
    achievements: [
      "[Add real 2026 achievement — e.g. cohort sizes, graduates placed, partner companies added]",
      "[Add real 2026 achievement]",
      "[Add real 2026 achievement]",
    ],
    progress: "[Add what is in flight right now — open cohorts, upcoming partnerships, regional expansion]",
  },
  {
    year: "2025",
    headline: "Year of building.",
    achievements: [
      "[Add real 2025 achievement]",
      "[Add real 2025 achievement]",
      "[Add real 2025 achievement]",
    ],
  },
  {
    year: "2024",
    headline: "Year zero.",
    achievements: [
      "[Add the founding story — first cohort, first office, first hires]",
      "[Add real 2024 achievement]",
    ],
  },
];

export default function MilestonesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: BG, color: TEXT, minHeight: "100vh" }}>
      <PageMeta title="Milestones | HAMZURY HUB" description="HAMZURY HUB's yearly milestones — achievements, progress and what's next." />

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`} style={{ backgroundColor: scrolled ? `${W}F5` : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <Link href="/hub"><span className="text-[13px] tracking-[4px] font-light uppercase cursor-pointer hover:opacity-70 transition-opacity" style={{ color: TEXT }}>HAMZURY HUB</span></Link>
          <button onClick={() => setMobileMenuOpen(p => !p)} className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70" style={{ color: TEXT }} aria-label="Menu">
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {mobileMenuOpen && (
            <div className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl" style={{ backgroundColor: W }} onClick={() => setMobileMenuOpen(false)}>
              <Link href="/hub"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Programmes</span></Link>
              <Link href="/startup"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Startup</span></Link>
              <Link href="/alumni"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Alumni</span></Link>
              <Link href="/milestones"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: GOLD }}>Milestones</span></Link>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>HAMZURY HUB · MILESTONES</p>
          <h1 className="text-[clamp(32px,6vw,54px)] font-light leading-[1.05] tracking-tight mb-6" style={{ color: TEXT }}>
            Year by year. <span style={{ color: DARK }}>Receipts only.</span>
          </h1>
          <p className="text-[15px] leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: TEXT, opacity: 0.6 }}>
            Every year we ship a list of what we built, who we placed, and what's still in motion. No spin.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-px rounded-2xl overflow-hidden" style={{ backgroundColor: `${DARK}10` }}>
          {MILESTONES.map((m) => (
            <div key={m.year} className="p-7 md:p-9" style={{ backgroundColor: W }}>
              <div className="flex items-baseline gap-4 mb-5">
                <span className="text-[44px] md:text-[52px] font-light leading-none tracking-tight" style={{ color: GOLD }}>{m.year}</span>
                <h2 className="text-[20px] md:text-[22px] font-medium tracking-tight" style={{ color: TEXT }}>{m.headline}</h2>
              </div>
              <ul className="space-y-2.5 mb-5">
                {m.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.6]" style={{ color: TEXT, opacity: 0.75 }}>
                    <Award size={14} className="shrink-0 mt-1" style={{ color: GOLD }} />
                    {a}
                  </li>
                ))}
              </ul>
              {m.progress && (
                <div className="rounded-xl p-4" style={{ backgroundColor: `${GOLD}08`, border: `1px solid ${GOLD}22` }}>
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1.5" style={{ color: GOLD }}>IN PROGRESS</p>
                  <p className="text-[13.5px] leading-[1.6]" style={{ color: TEXT, opacity: 0.75 }}>{m.progress}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
