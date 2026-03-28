import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";

const NAVY  = "#1B2A4A";   // Skills primary — dark navy blue
const GOLD  = "#C9A97E";
const CREAM = "#FAFAF8";   // Milk white
const W     = "#FFFFFF";
const DARK  = "#1D1D1F";

export default function AlumniPage() {
  return (
    <div style={{ backgroundColor: CREAM, minHeight: "100vh" }}>
      <PageMeta title="HAMZURY Alumni — Join the Network" description="The HAMZURY alumni network — graduates who are now building businesses, leading teams, and shaping industries." />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6" style={{ backgroundColor: `${CREAM}F5`, borderBottom: `1px solid ${GOLD}18`, backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/"><span className="text-[15px] font-semibold tracking-tight cursor-pointer" style={{ color: NAVY }}>HAMZURY</span></Link>
          <Link href="/skills"><span className="text-[12px] font-medium uppercase tracking-wider cursor-pointer" style={{ color: `${NAVY}60` }}>Back to Skills</span></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: NAVY }}>
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>HAMZURY ALUMNI</p>
        <h1 className="text-[clamp(36px,6vw,64px)] font-light tracking-tight mb-4 text-white" style={{ letterSpacing: "-0.03em" }}>
          Once HAMZURY,<br />always HAMZURY.
        </h1>
        <p className="text-[16px] font-light max-w-md mx-auto opacity-60 text-white">
          Our graduates are running businesses, leading teams, and shaping the next generation of African enterprise.
        </p>
      </section>

      {/* Stats */}
      <section className="py-14 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { stat: "1,200+", label: "Graduates" },
            { stat: "85+",    label: "Active Businesses" },
            { stat: "6",      label: "Cohorts Completed" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-[32px] font-light mb-1" style={{ color: NAVY }}>{s.stat}</p>
              <p className="text-[11px] uppercase tracking-wider opacity-40" style={{ color: DARK }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6" style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-8" style={{ color: GOLD }}>ALUMNI BENEFITS</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Lifetime Network", body: "Access to every HAMZURY graduate, cohort group, and community channel. Your next business partner, client, or hire is in this network." },
              { title: "Preferred Contractor Access", body: "HAMZURY clients regularly source trusted contractors from the alumni pool. Being alumni puts you at the front of every referral list." },
              { title: "Continued Learning", body: "Alumni get priority access and discounts for all new programs, workshops, and advanced cohorts as we expand our curriculum." },
            ].map(b => (
              <div key={b.title} className="rounded-2xl p-6 border" style={{ borderColor: `${NAVY}12`, backgroundColor: W }}>
                <p className="text-[15px] font-semibold mb-2" style={{ color: NAVY }}>{b.title}</p>
                <p className="text-[13px] leading-relaxed opacity-60" style={{ color: DARK }}>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Grid (placeholder) */}
      <section className="py-16 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-8" style={{ color: GOLD }}>ALUMNI DIRECTORY</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-5 text-center" style={{ borderColor: `${NAVY}10`, backgroundColor: CREAM }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${NAVY}15`, color: NAVY }}>
                  {String.fromCharCode(65 + i)}
                </div>
                <p className="text-[13px] font-medium mb-0.5" style={{ color: NAVY }}>Alumni Profile</p>
                <p className="text-[11px] opacity-40" style={{ color: DARK }}>Coming soon</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] mt-8 opacity-40" style={{ color: DARK }}>
            Alumni profiles launching with the next cohort graduation. Check back soon.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t text-center" style={{ borderColor: `${NAVY}10`, backgroundColor: CREAM }}>
        <div className="flex flex-wrap items-center justify-center gap-6 text-[12px]" style={{ color: `${NAVY}50` }}>
          <Link href="/"><span className="hover:opacity-100 cursor-pointer transition-opacity">Home</span></Link>
          <Link href="/skills"><span className="hover:opacity-100 cursor-pointer transition-opacity">Skills</span></Link>
          <Link href="/ridi"><span className="hover:opacity-100 cursor-pointer transition-opacity">RIDI</span></Link>
          <Link href="/privacy"><span className="hover:opacity-100 cursor-pointer transition-opacity">Privacy</span></Link>
        </div>
      </footer>
    </div>
  );
}
