import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";
const WHITE    = "#FFFFFF";

export default function AlumniPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta title="HAMZURY Alumni \u2014 Join the Network" description="The HAMZURY alumni network \u2014 graduates building businesses, leading teams, and shaping industries." />

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
        <Link href="/skills" className="text-[11px] font-normal tracking-[0.2em] uppercase transition-opacity hover:opacity-50" style={{ color: `${CHARCOAL}40` }}>
          Back to Skills
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 md:pt-52 md:pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-[clamp(32px,5vw,52px)] font-light tracking-tight leading-[1.1] mb-5"
            style={{ color: CHARCOAL }}
          >
            Once HAMZURY,<br />always HAMZURY.
          </h1>
          <p className="text-[15px] font-light leading-relaxed max-w-md mx-auto" style={{ color: `${CHARCOAL}60` }}>
            Our graduates are running businesses, leading teams, and shaping the next generation of African enterprise.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-24 px-6">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { stat: "1,200+", label: "Graduates" },
            { stat: "85+", label: "Active Businesses" },
            { stat: "6", label: "Cohorts Completed" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[clamp(28px,4vw,40px)] font-light tracking-tight" style={{ color: CHARCOAL }}>{s.stat}</p>
              <p className="text-[11px] font-medium tracking-wider uppercase mt-1" style={{ color: `${CHARCOAL}35` }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase mb-10 text-center" style={{ color: `${CHARCOAL}40` }}>
            Alumni benefits
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Lifetime Network", body: "Access to every HAMZURY graduate, cohort group, and community channel." },
              { title: "Preferred Contractor Access", body: "HAMZURY clients source trusted contractors from the alumni pool first." },
              { title: "Continued Learning", body: "Priority access and discounts for all new programs and advanced cohorts." },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-[20px] p-7"
                style={{ backgroundColor: WHITE, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-[15px] font-semibold tracking-tight mb-3" style={{ color: CHARCOAL }}>{b.title}</p>
                <p className="text-[13px] font-light leading-relaxed" style={{ color: `${CHARCOAL}50` }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directory placeholder */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase mb-4" style={{ color: `${CHARCOAL}40` }}>
            Alumni directory
          </p>
          <p className="text-[15px] font-light leading-relaxed" style={{ color: `${CHARCOAL}40` }}>
            Profiles launching with the next cohort graduation. Check back soon.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-md mx-auto text-center">
          <Link
            href="/skills"
            className="inline-block px-8 py-4 rounded-full text-[14px] font-medium tracking-tight transition-opacity duration-200 hover:opacity-80"
            style={{ backgroundColor: CHARCOAL, color: MILK }}
          >
            Explore Skills programs
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 text-[12px]" style={{ color: `${CHARCOAL}40` }}>
          <Link href="/" className="transition-opacity hover:opacity-70">Home</Link>
          <Link href="/skills" className="transition-opacity hover:opacity-70">Skills</Link>
          <Link href="/ridi" className="transition-opacity hover:opacity-70">RIDI</Link>
          <Link href="/privacy" className="transition-opacity hover:opacity-70">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
