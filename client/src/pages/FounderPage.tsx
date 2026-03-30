import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";

export default function FounderPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Muhammad Hamzury | Founder, HAMZURY"
        description="I build systems so businesses never fail from paperwork, broken processes, or lack of structure."
        ogImage="https://hamzury.com/founder.jpg"
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50"
          style={{ color: CHARCOAL }}
        >
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[11px] font-normal tracking-[0.2em] uppercase" style={{ color: `${CHARCOAL}40` }}>
          Founder
        </span>
      </nav>

      {/* Hero quote */}
      <section className="pt-40 pb-10 md:pt-52 md:pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote
            className="text-[clamp(24px,4.5vw,42px)] font-light italic leading-[1.35] tracking-tight"
            style={{ color: CHARCOAL }}
          >
            "Businesses deserve more than consultants who disappear after the invoice. We stay until the systems are running."
          </blockquote>
        </div>
      </section>

      {/* Name */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[15px] font-semibold tracking-tight" style={{ color: CHARCOAL }}>
            Muhammad Hamzury
          </p>
          <p className="text-[13px] font-light mt-1" style={{ color: `${CHARCOAL}50` }}>
            Founder, HAMZURY
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-xl mx-auto space-y-16 text-center">
          {[
            "Compliance protects.",
            "Systems scale.",
            "Skills earn.",
          ].map((statement) => (
            <p
              key={statement}
              className="text-[clamp(22px,3.5vw,32px)] font-light tracking-tight"
              style={{ color: CHARCOAL }}
            >
              {statement}
            </p>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-md mx-auto text-center">
          <a
            href="https://wa.me/2348034620520"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-full text-[14px] font-medium tracking-tight transition-opacity duration-200 hover:opacity-80"
            style={{ backgroundColor: CHARCOAL, color: MILK }}
          >
            Talk to the team
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
            HAMZURY
          </Link>
          <div className="flex gap-6">
            {[
              { href: "/bizdoc", label: "BizDoc" },
              { href: "/systemise", label: "Systemise" },
              { href: "/skills", label: "Skills" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
