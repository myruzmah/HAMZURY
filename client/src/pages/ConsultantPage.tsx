import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TEAL  = "#2D2D2D";   // Charcoal — general
const GOLD  = "#B48C4C";
const CREAM = "#FFFAF6";   // Milk white
const DARK  = "#1A1A1A";
const W     = "#FFFFFF";

export default function ConsultantPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title="Barrister Abdullahi Musa — BizDoc Lead, HAMZURY"
        description="Meet Barrister Abdullahi Musa, Head of BizDoc Consult at HAMZURY Innovation Hub — licensed legal practitioner and Nigeria's compliance specialist for CAC, FIRS, and federal regulatory filings."
        canonical="https://hamzury.com/consultant"
        ogImage="https://hamzury.com/consultant.jpg"
      />

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 z-50 flex justify-between items-center border-b backdrop-blur-md"
        style={{ backgroundColor: `${CREAM}E8`, borderColor: `${GOLD}25` }}
      >
        <Link
          href="/bizdoc"
          className="text-[13px] font-semibold flex items-center gap-1.5 transition-colors hover:opacity-60"
          style={{ color: DARK }}
        >
          <ArrowLeft size={14} /> BizDoc Consult
        </Link>
        <span className="text-[12px] font-semibold uppercase tracking-[0.2em] opacity-40" style={{ color: DARK }}>
          Lead Consultant
        </span>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.35em] uppercase mb-5 block" style={{ color: GOLD }}>
            The Compliance Expert
          </span>
          <h1
            className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-[1.08]"
            style={{ color: TEAL }}
          >
            Compliance done right.<br className="hidden md:block" /> From the first filing.
          </h1>
          <p
            className="text-lg md:text-xl font-light max-w-2xl leading-relaxed"
            style={{ color: DARK, opacity: 0.65 }}
          >
            BizDoc Consult is headed by a licensed Barrister and Solicitor of the Supreme Court
            of Nigeria — bringing legal precision and regulatory depth to every compliance engagement.
          </p>
        </div>
      </section>

      {/* PROFILE */}
      <section className="pb-28 px-6 md:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-start">

          {/* Photo */}
          <div className="relative">
            <div
              className="rounded-2xl overflow-hidden w-full"
              style={{
                aspectRatio: "3/4",
                border: `2px solid ${GOLD}40`,
                boxShadow: `0 32px 80px rgba(10,31,28,0.12)`,
              }}
            >
              <img
                src="/consultant.jpg"
                alt="Barrister Abdullahi Musa — Head of BizDoc Consult, HAMZURY"
                className="w-full h-full object-cover object-top"
                onError={e => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  const p = t.parentElement;
                  if (p) {
                    p.style.display = "flex";
                    p.style.alignItems = "center";
                    p.style.justifyContent = "center";
                    p.style.backgroundColor = `${TEAL}08`;
                    p.innerHTML = `<span style="font-size:2rem;font-weight:600;color:${TEAL}40;letter-spacing:0.05em">AM</span>`;
                  }
                }}
              />
            </div>
            {/* Legal credential badge */}
            <div
              className="absolute -bottom-4 left-6 px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-lg"
              style={{ backgroundColor: TEAL, color: GOLD }}
            >
              B.L · Called to the Nigerian Bar
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-8 pt-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1" style={{ color: TEAL }}>
                Barrister Abdullahi Musa
              </h2>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                Head of BizDoc Consult · HAMZURY Innovation Hub
              </p>
            </div>

            <div
              className="space-y-4 text-[15px] font-light leading-relaxed"
              style={{ color: DARK, opacity: 0.72 }}
            >
              <p>
                Barrister Abdullahi Musa is a licensed legal practitioner called to the Bar
                of the Supreme Court of Nigeria, with focused practice in corporate compliance,
                regulatory law, and business structuring. He leads BizDoc Consult with the
                precision of a courtroom and the discipline of an operator — every file is a
                legal matter handled as one.
              </p>
              <p>
                His practice spans CAC incorporations, FIRS tax compliance, NAFDAC and SON
                licensing, trademark filings, and corporate contracts. From first-time founders
                registering a business name to established companies resolving multi-year filing
                gaps — every engagement is personally managed, fully documented, and legally sound.
              </p>
              <p>
                The standard here is simple: if it goes out under BizDoc's name, it is correct.
                Not approximately correct — correct. Nigerian businesses deserve a compliance desk
                that holds that line without exception.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                "Corporate Law",
                "CAC Filings",
                "Tax Compliance",
                "NAFDAC Licensing",
                "Trademark & IP",
                "Legal Contracts",
              ].map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: `${TEAL}08`,
                    color: TEAL,
                    border: `1px solid ${TEAL}15`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/2348067149356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-semibold px-6 py-3.5 rounded-full transition-all hover:opacity-85 shadow-sm"
                style={{ backgroundColor: TEAL, color: GOLD }}
              >
                Book a Clarity Session →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERTISE — dark section */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: TEAL }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.35em] uppercase mb-4 block" style={{ color: GOLD }}>
            Core Practice Areas
          </span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-14" style={{ color: W }}>
            What Barrister Musa handles.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "CAC Registration & Filings",
                body: "Business name reservations, limited company incorporations, NGO/CBO registrations, and annual returns — across all states.",
              },
              {
                title: "Tax Compliance",
                body: "TIN registration, VAT setup, PAYE configuration, FIRS annual returns, and tax clearance certificates managed end-to-end.",
              },
              {
                title: "Regulatory Licensing",
                body: "NAFDAC, SON, DPR, NSCDC, and sector-specific federal licences. Application, follow-up, and certificate delivery.",
              },
              {
                title: "Corporate Law & Contracts",
                body: "Business contracts, shareholder agreements, employment frameworks, and corporate legal structures drafted and reviewed by a Barrister.",
              },
              {
                title: "Trademark & IP Protection",
                body: "Brand trademark registration, design copyright, and intellectual property documentation to protect your business identity.",
              },
              {
                title: "Post-Registration Compliance",
                body: "Annual compliance calendars, filing reminders, certificate renewals, and multi-year regulatory clean-up for established businesses.",
              },
            ].map(item => (
              <div
                key={item.title}
                className="rounded-2xl p-7 border transition-all hover:border-opacity-40"
                style={{ borderColor: `${GOLD}25`, backgroundColor: `${W}06` }}
              >
                <h3 className="text-base font-semibold mb-3" style={{ color: GOLD }}>
                  {item.title}
                </h3>
                <p
                  className="text-[14px] font-light leading-relaxed"
                  style={{ color: W, opacity: 0.65 }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="py-20 px-6 md:px-12" style={{ backgroundColor: W }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl font-serif mb-4" style={{ color: GOLD, opacity: 0.5 }}>"</div>
          <blockquote
            className="text-xl md:text-2xl font-light leading-[1.6] mb-6"
            style={{ color: TEAL }}
          >
            A business without legal structure is a business borrowing time from regulators.
            Our job is to make sure that debt never comes due.
          </blockquote>
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase" style={{ color: GOLD }}>
            — Barrister Abdullahi Musa, Head of BizDoc Consult
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12" style={{ backgroundColor: CREAM }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium mb-3" style={{ color: TEAL }}>
              Ready to sort your compliance?
            </h2>
            <p className="text-[15px] font-light opacity-60" style={{ color: DARK }}>
              Book a clarity session directly with the BizDoc desk. We'll tell you exactly what needs doing.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <a
              href="https://wa.me/2348067149356"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80 whitespace-nowrap"
              style={{ backgroundColor: TEAL, color: GOLD }}
            >
              Book on WhatsApp →
            </a>
            <Link
              href="/bizdoc"
              className="px-7 py-4 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-70 whitespace-nowrap border"
              style={{ borderColor: `${TEAL}30`, color: TEAL, backgroundColor: "transparent" }}
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-8 px-6 md:px-12 border-t"
        style={{ borderColor: `${TEAL}10` }}
      >
        <div className="flex justify-between items-center">
          <Link href="/" className="text-[12px] font-bold tracking-wider hover:opacity-60 transition-opacity" style={{ color: TEAL }}>
            HAMZURY
          </Link>
          <Link
            href="/privacy"
            className="text-[12px] opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: DARK }}
          >
            Privacy Policy
          </Link>
        </div>
        <p className="text-[12px] font-light italic mt-3" style={{ color: `${CREAM}80` }}>
          "Structure before speed. That is how we build." — Muhammad Hamzury, Founder
        </p>
      </footer>
    </div>
  );
}
