import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta title="Privacy Policy — HAMZURY" description="How HAMZURY collects, uses, and protects your personal data. NDPR-compliant." />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link href="/" className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[11px] font-normal tracking-[0.2em] uppercase" style={{ color: `${CHARCOAL}40` }}>
          Privacy Policy
        </span>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-28 md:pt-40 md:pb-36 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-[clamp(28px,4vw,42px)] font-light tracking-tight leading-[1.1] mb-3"
            style={{ color: CHARCOAL }}
          >
            Privacy Policy
          </h1>
          <p className="text-[13px] mb-20" style={{ color: `${CHARCOAL}40` }}>
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="space-y-16">

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>1. Who We Are</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                HAMZURY (operating as BizDoc Consult, Systemise, and HAMZURY Skills) is a business compliance and operational platform registered in Nigeria.
                We provide compliance services, strategic systems, and business education. Our registered address is Abuja, Nigeria.
              </p>
              <p className="text-[14px] font-light leading-[1.8] mt-4" style={{ color: `${CHARCOAL}70` }}>
                Questions about this policy may be directed to us via the contact information on our website.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>2. Information We Collect</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>We collect information you provide directly to us, including:</p>
              <ul className="space-y-3">
                {[
                  "Full name and business name",
                  "Phone number (WhatsApp/mobile)",
                  "Email address",
                  "Business context and service requirements",
                  "Files and documents uploaded through our staff portal",
                  "Application details submitted through HAMZURY Skills",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                    <span className="mt-2.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[14px] font-light leading-[1.8] mt-4" style={{ color: `${CHARCOAL}70` }}>
                We also collect technical information such as IP addresses, browser type, and usage data when you access our platform.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>3. How We Use Your Information</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>We use the information we collect to:</p>
              <ul className="space-y-3">
                {[
                  "Process and manage your compliance service requests",
                  "Assign and track your files through our internal workflow",
                  "Contact you via WhatsApp or email regarding your file status",
                  "Process program applications and student enrollments",
                  "Improve our services and platform",
                  "Comply with legal obligations under Nigerian law",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                    <span className="mt-2.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>4. Legal Basis for Processing</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>
                We process your personal data on the following legal bases under the Nigeria Data Protection Regulation (NDPR):
              </p>
              <ul className="space-y-3">
                {[
                  "Consent \u2014 when you submit an intake form or application",
                  "Contract \u2014 to deliver the services you have requested",
                  "Legitimate interest \u2014 to operate and improve our platform",
                  "Legal obligation \u2014 where required by Nigerian law",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                    <span className="mt-2.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>5. Data Sharing</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>
                We do not sell your personal data. We may share your information with:
              </p>
              <ul className="space-y-3">
                {[
                  "HAMZURY staff assigned to your file or case",
                  "Regulatory bodies (CAC, FIRS, etc.) only as required to deliver your service",
                  "Technology service providers operating our platform infrastructure",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                    <span className="mt-2.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[14px] font-light leading-[1.8] mt-4" style={{ color: `${CHARCOAL}70` }}>All third-party providers are required to handle your data securely and in compliance with applicable law.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>6. Data Retention</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                We retain your personal data for as long as necessary to deliver our services and meet our legal obligations.
                Compliance documents and records may be retained for up to seven years in line with Nigerian regulatory requirements.
                You may request deletion of your data at any time where we are not legally required to retain it.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>7. Your Rights</h2>
              <p className="text-[14px] font-light leading-[1.8] mb-4" style={{ color: `${CHARCOAL}70` }}>Under the NDPR, you have the right to:</p>
              <ul className="space-y-3">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your data (where applicable)",
                  "Withdraw consent at any time",
                  "Lodge a complaint with the Nigeria Data Protection Commission (NDPC)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                    <span className="mt-2.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: GOLD }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[14px] font-light leading-[1.8] mt-4" style={{ color: `${CHARCOAL}70` }}>To exercise any of these rights, contact us through the information on our website. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>8. Cookies</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                Our platform uses cookies and local storage to maintain your session and preferences. We do not use third-party advertising cookies.
                You may disable cookies in your browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>9. Security</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure.
                No system is completely secure; if you believe your data has been compromised, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>10. Changes to This Policy</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                We may update this policy from time to time. Changes will be posted on this page with a revised date.
                Continued use of our platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-semibold mb-5" style={{ color: CHARCOAL }}>Contact</h2>
              <p className="text-[14px] font-light leading-[1.8]" style={{ color: `${CHARCOAL}70` }}>
                For any privacy-related enquiries, please contact us through our intake desk or email the HAMZURY compliance team.
                Our registered office is located in Abuja, Nigeria.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-12">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
            HAMZURY
          </Link>
          <div className="flex gap-6">
            <Link href="/bizdoc" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>BizDoc</Link>
            <Link href="/systemise" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Systemise</Link>
            <Link href="/skills" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Skills</Link>
            <Link href="/founder" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Founder</Link>
            <Link href="/terms" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
