import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFAF6" }}>
      <PageMeta
        title="Terms of Service — HAMZURY"
        description="Read the terms and conditions governing your use of HAMZURY Innovation Hub services including BizDoc Consult, Systemise, and Skills."
        canonical="https://hamzury.com/terms"
      />
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 bg-[#FFFAF6]/90 backdrop-blur-md border-b border-[#B48C4C]/20 z-50 flex justify-between items-center">
        <Link href="/" className="text-[13px] font-semibold flex items-center gap-1 hover:text-[#B48C4C] transition-colors" style={{ color: "#1A1A1A" }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[13px] font-semibold uppercase tracking-wider opacity-40" style={{ color: "#1A1A1A" }}>
          Terms of Service
        </span>
      </nav>

      {/* CONTENT */}
      <main className="pt-36 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase mb-6 block" style={{ color: "#B48C4C" }}>
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-[1.1]" style={{ color: "#1A1A1A" }}>
            Terms of Service
          </h1>
          <p className="text-[14px] opacity-50 mb-16" style={{ color: "#1A1A1A" }}>
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="space-y-12 text-[15px] font-light leading-relaxed" style={{ color: "#1A1A1A" }}>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>1. Acceptance of Terms</h2>
              <p>By accessing or using any HAMZURY platform — including BizDoc Consult, Systemise, and HAMZURY Skills — you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>2. Description of Services</h2>
              <p className="mb-4">HAMZURY provides the following services through its platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>BizDoc Consult:</strong> Business registration, compliance filing, regulatory licensing, and related advisory services.</li>
                <li><strong>Systemise:</strong> Operational systems design, process architecture, and business optimisation consulting.</li>
                <li><strong>HAMZURY Skills:</strong> Business education programmes, cohort learning, and professional development courses.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>3. Service Engagement</h2>
              <p className="mb-4">Submitting an enquiry or application does not constitute a binding service agreement. A service engagement is only confirmed upon:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Written confirmation from HAMZURY (email or in-platform notification)</li>
                <li>Acceptance of the specific service scope and fees for your engagement</li>
                <li>Receipt of any required upfront payment where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>4. Client Responsibilities</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, complete, and up-to-date information for all filings and applications</li>
                <li>Respond to information requests from HAMZURY within agreed timeframes</li>
                <li>Inform HAMZURY promptly of any changes that may affect an ongoing engagement</li>
                <li>Not use the platform for any unlawful purpose or to file fraudulent regulatory documents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>5. Fees and Payment</h2>
              <p className="mb-4">Service fees are communicated prior to engagement commencement. All fees are in Nigerian Naira (NGN) unless otherwise stated. HAMZURY reserves the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pause or suspend services where payment obligations are not met</li>
                <li>Revise fees for new engagements with reasonable notice</li>
              </ul>
              <p className="mt-4">Government fees, agency charges, and third-party costs are separate from HAMZURY's service fees and are passed through at cost.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>6. Timelines and Delivery</h2>
              <p>HAMZURY provides estimated timelines for all engagements based on standard regulatory processing times. These timelines are estimates and may be affected by agency delays, public holidays, or incomplete client documentation. HAMZURY is not liable for delays caused by government agencies or factors outside its control.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>7. Confidentiality</h2>
              <p>HAMZURY treats all client information as strictly confidential. We will not share your business documents, financial information, or identity documents with any third party except as required to perform the requested service (e.g., submitting to CAC, FIRS, or other regulatory bodies) or as required by law.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>8. Intellectual Property</h2>
              <p>All content on HAMZURY platforms — including text, design, frameworks, and educational materials — is the property of HAMZURY. You may not reproduce, distribute, or create derivative works from our content without explicit written permission.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>9. Limitation of Liability</h2>
              <p>HAMZURY's liability for any service engagement is limited to the fees paid for that specific engagement. We are not liable for indirect, consequential, or incidental damages arising from regulatory outcomes, government decisions, or circumstances beyond our control.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>10. Termination</h2>
              <p>Either party may terminate a service engagement by written notice. Upon termination, any fees for work completed to the point of termination remain due. HAMZURY will return all original documents provided by the client within a reasonable timeframe.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>11. Governing Law</h2>
              <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through good-faith negotiation before pursuing formal legal remedies. The courts of the Federal Capital Territory, Abuja shall have jurisdiction over any formal disputes.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-4" style={{ color: "#1A1A1A" }}>12. Contact</h2>
              <p>For questions about these Terms, contact us through the enquiry form on our website. We aim to respond within 2 business days.</p>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-12 border-t border-[#1A1A1A]/10 flex justify-between items-center">
        <span className="text-[12px] font-bold tracking-wider" style={{ color: "#1A1A1A" }}>HAMZURY</span>
        <Link href="/privacy" className="text-[12px] opacity-40 hover:opacity-70 transition-opacity" style={{ color: "#1A1A1A" }}>Privacy Policy</Link>
      </footer>
    </div>
  );
}
