import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Users, ArrowRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const DARK = "#1E3A5F";
const GOLD = "#B48C4C";
const TEXT = "#1A1A1A";
const BG = "#FFFAF6";
const W = "#FFFFFF";

// Real HUB alumni — replace placeholders with real names, programmes and outcomes.
const REAL_ALUMNI: { name: string; programme: string; outcome: string; year: string }[] = [
  { name: "[Alumni name]", programme: "[Programme — e.g. Code Craft Bootcamp]", outcome: "[Where they are now — e.g. Junior dev at X, freelance, founded Y]", year: "2026" },
  { name: "[Alumni name]", programme: "[Programme]", outcome: "[Where they are now]", year: "2026" },
  { name: "[Alumni name]", programme: "[Programme]", outcome: "[Where they are now]", year: "2025" },
  { name: "[Alumni name]", programme: "[Programme]", outcome: "[Where they are now]", year: "2025" },
];

const PERKS = [
  { name: "Private Network", brief: "Closed alumni community across every cohort + programme.", focus: ["WhatsApp + Discord channels", "Mentor circles", "Cohort reunions"] },
  { name: "Monthly Meetups", brief: "Jos in-person + virtual fireside chats with founders & operators.", focus: ["Skills workshops", "Founder talks", "Hiring panels"] },
  { name: "Job + Gig Board", brief: "First look at roles inside Hamzury and partner companies.", focus: ["Full-time + contract", "Freelance gigs", "Internal Hamzury openings"] },
  { name: "Course Discounts", brief: "Lifetime discounts on every future HUB programme + workshop.", focus: ["20% on Online Academy", "Priority cohort booking", "Bring-a-friend credits"] },
];

export default function AlumniPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ backgroundColor: BG, color: TEXT, minHeight: "100vh" }}>
      <PageMeta title="Alumni | HAMZURY HUB" description="HUB Alumni network — private community, monthly meetups, job board and lifetime course discounts." />

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
              <Link href="/startup"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: TEXT }}>Startup</span></Link>
              <Link href="/alumni"><span className="block w-full text-left px-5 py-2.5 text-[13px] font-medium hover:bg-gray-50 cursor-pointer" style={{ color: GOLD }}>Alumni</span></Link>
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
            HAMZURY HUB · ALUMNI
          </p>
          <h1 className="text-[clamp(32px,6vw,54px)] font-light leading-[1.05] tracking-tight mb-6" style={{ color: TEXT }}>
            Once HUB, <span style={{ color: DARK }}>always HUB.</span>
          </h1>
          <p className="text-[15px] leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: TEXT, opacity: 0.6 }}>
            Graduating any HUB programme makes you part of a lifetime network — meetups, jobs, mentor circles, and discounts on everything we run next.
          </p>
        </div>
      </section>

      {/* Real alumni */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>OUR ALUMNI</p>
            <h2 className="text-[clamp(24px,3.5vw,32px)] font-light tracking-tight" style={{ color: TEXT }}>
              Real people. <span style={{ color: DARK }}>Real outcomes.</span>
            </h2>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {REAL_ALUMNI.map((a, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ backgroundColor: W, border: "1px solid rgba(0,0,0,0.06)" }}>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: GOLD }}>{a.year}</p>
                <h3 className="text-[16px] font-semibold tracking-tight mb-1" style={{ color: TEXT }}>{a.name}</h3>
                <p className="text-[12px] mb-2" style={{ color: TEXT, opacity: 0.55 }}>{a.programme}</p>
                <p className="text-[13px] leading-[1.55]" style={{ color: TEXT, opacity: 0.75 }}>{a.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {PERKS.map(v => (
            <div key={v.name} className="rounded-2xl p-6" style={{ backgroundColor: W, border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} style={{ color: GOLD }} />
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
              Become an Alum <ArrowRight size={14} />
            </span>
          </Link>
          <p className="text-[12px] mt-4" style={{ color: TEXT, opacity: 0.5 }}>
            Alumni access is unlocked the day you graduate any HUB programme.
          </p>
        </div>
      </section>
    </div>
  );
}
