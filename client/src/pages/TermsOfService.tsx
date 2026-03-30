import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";

export default function TermsOfService() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Terms of Service — HAMZURY"
        description="Read the terms and conditions governing your use of HAMZURY Innovation Hub services including BizDoc Consult, Systemise, and Skills."
        canonical="https://hamzury.com/terms"
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link href="/" className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[11px] font-normal tracking-[0.2em] uppercase" style={{ color: `${CHARCOAL}40` }}>
          Terms of Service
        </span>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-28 md:pt-40 md:pb-36 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-[clamp(28px,4vw,42px)] font-light tracking-tight leading-[1.1] mb-3"
            style={{ color: CHARCOAL }}
          >
            Terms of Service
          </h1>
          <p className="text-[13px] mb-20" style={{ color: `${CHARCOAL}40` }}>
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="space-y-16">

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>1. Acceptance of Terms</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>By accessing or using any HAMZURY platform \u2014 including BizDoc Consult, Systemise, and HAMZURY Skills \u2014 you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>2. Description of Services</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>HAMZURY provides the following services through its platform:</p>
              <ul className="space-y-3 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                <li><strong style={{ color: CHARCOAL, fontWeight: 500 }}>BizDoc Consult:</strong> Business registration, compliance filing, regulatory licensing, and related advisory services.</li>
                <li><strong style={{ color: CHARCOAL, fontWeight: 500 }}>Systemise:</strong> Operational systems design, process architecture, and business optimisation consulting.</li>
                <li><strong style={{ color: CHARCOAL, fontWeight: 500 }}>HAMZURY Skills:</strong> Business education programmes, cohort learning, and professional development courses.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>3. Service Engagement</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>Submitting an enquiry or application does not constitute a binding service agreement. A service engagement is only confirmed upon:</p>
              <ul className="space-y-2 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                <li>Written confirmation from HAMZURY (email or in-platform notification)</li>
                <li>Acceptance of the specific service scope and fees for your engagement</li>
                <li>Receipt of any required upfront payment where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>4. Client Responsibilities</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>You agree to:</p>
              <ul className="space-y-2 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                <li>Provide accurate, complete, and up-to-date information for all filings and applications</li>
                <li>Respond to information requests from HAMZURY within agreed timeframes</li>
                <li>Inform HAMZURY promptly of any changes that may affect an ongoing engagement</li>
                <li>Not use the platform for any unlawful purpose or to file fraudulent regulatory documents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>5. Fees and Payment</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>Service fees are communicated prior to engagement commencement. All fees are in Nigerian Naira (NGN) unless otherwise stated. HAMZURY reserves the right to:</p>
              <ul className="space-y-2 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                <li>Pause or suspend services where payment obligations are not met</li>
                <li>Revise fees for new engagements with reasonable notice</li>
              </ul>
              <p className="text-[14px] font-light leading-[1.8] mt-4" style={{ color: `${CHARCOAL}70` }}>Government fees, agency charges, and third-party costs are separate from HAMZURY's service fees and are passed through at cost.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>6. Timelines and Delivery</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>HAMZURY provides estimated timelines for all engagements based on standard regulatory processing times. These timelines are estimates and may be affected by agency delays, public holidays, or incomplete client documentation. HAMZURY is not liable for delays caused by government agencies or factors outside its control.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>7. Confidentiality</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>HAMZURY treats all client information as strictly confidential. We will not share your business documents, financial information, or identity documents with any third party except as required to perform the requested service (e.g., submitting to CAC, FIRS, or other regulatory bodies) or as required by law.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>8. Intellectual Property</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>All content on HAMZURY platforms \u2014 including text, design, frameworks, and educational materials \u2014 is the property of HAMZURY. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>9. Limitation of Liability</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>HAMZURY's liability for any service engagement is limited to the fees paid for that specific engagement. We are not liable for indirect, consequential, or incidental damages arising from regulatory outcomes, government decisions, or circumstances beyond our control.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>10. Termination</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>Either party may terminate a service engagement by written notice. Upon termination, any fees for work completed to the point of termination remain due. HAMZURY will return all original documents provided by the client within a reasonable timeframe.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>11. Governing Law</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through good-faith negotiation before pursuing formal legal remedies. The courts of the Federal Capital Territory, Abuja shall have jurisdiction over any formal disputes.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>12. Contact</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>For questions about these Terms, contact us through the enquiry form on our website. We aim to respond within 2 business days.</p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
            HAMZURY
          </Link>
          <Link href="/privacy" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
