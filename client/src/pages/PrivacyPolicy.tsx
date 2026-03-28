import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAF8" }}>
      <PageMeta title="Privacy Policy — HAMZURY" description="How HAMZURY collects, uses, and protects your personal data. NDPR-compliant." />
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#C9A97E]/20 z-50 flex justify-between items-center">
        <Link href="/" className="text-[13px] font-semibold flex items-center gap-1 hover:text-[#C9A97E] transition-colors" style={{ color: "#1D1D1F" }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[13px] font-semibold uppercase tracking-wider opacity-40" style={{ color: "#1D1D1F" }}>
          Privacy Policy
        </span>
      </nav>

      {/* CONTENT */}
      <main className="pt-36 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase mb-6 block" style={{ color: "#C9A97E" }}>
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-[1.1]" style={{ color: "#1D1D1F" }}>
            Privacy Policy
          </h1>
          <p className="text-[14px] opacity-50 mb-16" style={{ color: "#1D1D1F" }}>
            Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>

          <div className="space-y-12 text-[15px] font-light leading-relaxed" style={{ color: "#1D1D1F" }}>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>1. Who We Are</h2>
              <p>
                HAMZURY (operating as BizDoc Consult, Systemise, and HAMZURY Skills) is a business compliance and operational platform registered in Nigeria.
                We provide compliance services, strategic systems, and business education. Our registered address is Abuja, Nigeria.
              </p>
              <p className="mt-3">
                Questions about this policy may be directed to us via the contact information on our website.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>2. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="mt-3 space-y-2 list-none">
                {[
                  "Full name and business name",
                  "Phone number (WhatsApp/mobile)",
                  "Email address",
                  "Business context and service requirements",
                  "Files and documents uploaded through our staff portal",
                  "Application details submitted through HAMZURY Skills",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 opacity-80">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#C9A97E" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We also collect technical information such as IP addresses, browser type, and usage data when you access our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="mt-3 space-y-2 list-none">
                {[
                  "Process and manage your compliance service requests",
                  "Assign and track your files through our internal workflow",
                  "Contact you via WhatsApp or email regarding your file status",
                  "Process program applications and student enrollments",
                  "Improve our services and platform",
                  "Comply with legal obligations under Nigerian law",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 opacity-80">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#C9A97E" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>4. Legal Basis for Processing</h2>
              <p>
                We process your personal data on the following legal bases under the Nigeria Data Protection Regulation (NDPR):
              </p>
              <ul className="mt-3 space-y-2 list-none">
                {[
                  "Consent — when you submit an intake form or application",
                  "Contract — to deliver the services you have requested",
                  "Legitimate interest — to operate and improve our platform",
                  "Legal obligation — where required by Nigerian law",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 opacity-80">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#C9A97E" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>5. Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share your information with:
              </p>
              <ul className="mt-3 space-y-2 list-none">
                {[
                  "HAMZURY staff assigned to your file or case",
                  "Regulatory bodies (CAC, FIRS, etc.) only as required to deliver your service",
                  "Technology service providers operating our platform infrastructure",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 opacity-80">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#C9A97E" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">All third-party providers are required to handle your data securely and in compliance with applicable law.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>6. Data Retention</h2>
              <p>
                We retain your personal data for as long as necessary to deliver our services and meet our legal obligations.
                Compliance documents and records may be retained for up to seven years in line with Nigerian regulatory requirements.
                You may request deletion of your data at any time where we are not legally required to retain it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>7. Your Rights</h2>
              <p>Under the NDPR, you have the right to:</p>
              <ul className="mt-3 space-y-2 list-none">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your data (where applicable)",
                  "Withdraw consent at any time",
                  "Lodge a complaint with the Nigeria Data Protection Commission (NDPC)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 opacity-80">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#C9A97E" }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">To exercise any of these rights, contact us through the information on our website. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>8. Cookies</h2>
              <p>
                Our platform uses cookies and local storage to maintain your session and preferences. We do not use third-party advertising cookies.
                You may disable cookies in your browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>9. Security</h2>
              <p>
                We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure.
                No system is completely secure; if you believe your data has been compromised, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>10. Changes to This Policy</h2>
              <p>
                We may update this policy from time to time. Changes will be posted on this page with a revised date.
                Continued use of our platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="pt-6 border-t border-[#1D1D1F]/10">
              <h2 className="text-lg font-semibold mb-4" style={{ color: "#1D1D1F" }}>Contact</h2>
              <p>
                For any privacy-related enquiries, please contact us through our intake desk or email the HAMZURY compliance team.
                Our registered office is located in Abuja, Nigeria.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-10 px-6 md:px-12 border-t border-[#C9A97E]/20 text-sm" style={{ backgroundColor: "#FAFAF8", color: "rgba(44,44,44,0.5)" }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-extrabold hover:text-[#C9A97E] transition-colors" style={{ color: "#1D1D1F" }}>HAMZURY</Link>
          <div className="flex gap-6">
            <Link href="/bizdoc" className="hover:text-[#C9A97E] transition-colors">BizDoc</Link>
            <Link href="/systemise" className="hover:text-[#C9A97E] transition-colors">Systemise</Link>
            <Link href="/skills" className="hover:text-[#C9A97E] transition-colors">Skills</Link>
            <Link href="/founder" className="hover:text-[#C9A97E] transition-colors">Founder</Link>
            <Link href="/terms" className="hover:text-[#C9A97E] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
