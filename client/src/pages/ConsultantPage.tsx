import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";
const WHITE    = "#FFFFFF";

export default function ConsultantPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Barrister Abdullahi Musa \u2014 BizDoc Lead, HAMZURY"
        description="Meet Barrister Abdullahi Musa, Head of BizDoc Consult at HAMZURY \u2014 licensed legal practitioner and Nigeria's compliance specialist."
        canonical="https://hamzury.com/consultant"
        ogImage="https://hamzury.com/consultant.jpg"
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link
          href="/bizdoc"
          className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50"
          style={{ color: CHARCOAL }}
        >
          <ArrowLeft size={14} /> BizDoc Consult
        </Link>
        <span className="text-[11px] font-normal tracking-[0.2em] uppercase" style={{ color: `${CHARCOAL}40` }}>
          Lead Consultant
        </span>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 md:pt-52 md:pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-[clamp(32px,5vw,52px)] font-light tracking-tight leading-[1.1] mb-5"
            style={{ color: CHARCOAL }}
          >
            Compliance done right.
          </h1>
          <p className="text-[15px] font-light leading-relaxed max-w-lg mx-auto" style={{ color: `${CHARCOAL}60` }}>
            BizDoc Consult is headed by a licensed Barrister and Solicitor of the Supreme Court of Nigeria.
          </p>
        </div>
      </section>

      {/* Profile */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-lg mx-auto">
          <div
            className="rounded-[20px] overflow-hidden p-8 md:p-10"
            style={{ backgroundColor: WHITE, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {/* Photo */}
            <div
              className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6"
              style={{ backgroundColor: `${CHARCOAL}08` }}
            >
              <img
                src="/consultant.jpg"
                alt="Barrister Abdullahi Musa"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  const p = t.parentElement;
                  if (p) {
                    p.style.display = "flex";
                    p.style.alignItems = "center";
                    p.style.justifyContent = "center";
                    p.innerHTML = `<span style="font-size:1.5rem;font-weight:600;color:${CHARCOAL}40;letter-spacing:0.05em">AM</span>`;
                  }
                }}
              />
            </div>

            {/* Name & title */}
            <div className="text-center mb-8">
              <p className="text-[17px] font-semibold tracking-tight" style={{ color: CHARCOAL }}>
                Barrister Abdullahi Musa
              </p>
              <p className="text-[13px] font-light mt-1" style={{ color: `${CHARCOAL}50` }}>
                Head of BizDoc Consult
              </p>
              <p className="text-[11px] font-medium mt-2 tracking-wider uppercase" style={{ color: GOLD }}>
                B.L \u00b7 Called to the Nigerian Bar
              </p>
            </div>

            {/* Bio */}
            <p className="text-[14px] font-light leading-[1.8] text-center mb-8" style={{ color: `${CHARCOAL}70` }}>
              Licensed legal practitioner with focused practice in corporate compliance, regulatory law, and business structuring. Every engagement is personally managed, fully documented, and legally sound.
            </p>

            {/* Practice areas */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Corporate Law", "CAC Filings", "Tax Compliance", "NAFDAC Licensing", "Trademark & IP", "Legal Contracts"].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${CHARCOAL}06`, color: `${CHARCOAL}60` }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="https://wa.me/2348067149356"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 rounded-full text-[14px] font-medium tracking-tight transition-opacity duration-200 hover:opacity-80"
                style={{ backgroundColor: CHARCOAL, color: MILK }}
              >
                Book a clarity session
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
          <blockquote
            className="text-[clamp(18px,3vw,24px)] font-light italic leading-[1.5] tracking-tight"
            style={{ color: CHARCOAL }}
          >
            "A business without legal structure is a business borrowing time from regulators."
          </blockquote>
          <p className="text-[11px] font-medium tracking-wider uppercase mt-6" style={{ color: GOLD }}>
            Barrister Abdullahi Musa
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
            HAMZURY
          </Link>
          <div className="flex gap-6">
            <Link href="/bizdoc" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>BizDoc</Link>
            <Link href="/privacy" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
