import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown, Menu, X, MessageSquare } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK    = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD    = "#B48C4C";
const WHITE   = "#FFFFFF";

/* ── Service data ──────────────────────────────────────────────────────── */

type Service = { name: string; price: string; includes: string[]; isPackage?: boolean };

const BIZDOC: Service[] = [
  // Packages first
  { name: "⭐ BizDoc Starter Pack", price: "\u20A6250,000", isPackage: true, includes: ["CAC Limited Company registration", "TIN registration (FIRS)", "Corporate bank account opening", "Company seal", "Save \u20A660,000 vs buying separately"] },
  { name: "⭐ BizDoc Pro Pack", price: "\u20A6400,000", isPackage: true, includes: ["Everything in Starter Pack", "Annual tax filing", "Compliance management (6 months)", "Deadline tracking & reminders", "Save \u20A6110,000 vs buying separately"] },
  { name: "⭐ BizDoc Complete Pack", price: "\u20A6600,000", isPackage: true, includes: ["Everything in Pro Pack", "Full legal document pack (contracts, NDA, T&C)", "One sector licence or permit", "Quarterly compliance review", "Save \u20A6180,000+ vs buying separately"] },
  // Individual
  { name: "CAC Registration", price: "From \u20A650,000", includes: ["Business Name, Ltd, or Trustees", "Name availability search", "Full CAC documentation", "Certificate of registration"] },
  { name: "Tax Compliance", price: "From \u20A630,000", includes: ["TIN registration (FIRS)", "Tax Clearance Certificate (TCC)", "VAT setup & filing", "PAYE registration"] },
  { name: "Tax Pro Max (Annual)", price: "\u20A6150,000/yr", includes: ["Annual tax filing & returns", "TIN & TCC management", "Penalty prevention monitoring", "Quarterly compliance reports"] },
  { name: "Industry Licences & Permits", price: "From \u20A660,000", includes: ["NAFDAC, SON, NEPC, SCUML", "Application preparation", "Agency liaison & follow-up", "Certificate delivery"] },
  { name: "Legal Documentation", price: "From \u20A640,000", includes: ["Contract drafting & review", "Legal agreements & NDAs", "Terms & conditions", "Full document pack available"] },
  { name: "Foreign Business Setup", price: "From \u20A6350,000", includes: ["CERPAC residence permit", "Expatriate Quota (EQ)", "Business Permit", "Full foreign setup pack available"] },
  { name: "Compliance Subscription", price: "\u20A650,000/mo", includes: ["Monthly compliance monitoring", "Deadline tracking & reminders", "Priority response", "Quarterly status reports"] },
];

const SYSTEMISE: Service[] = [
  // Packages first
  { name: "⭐ Digital Starter Pack", price: "\u20A6350,000", isPackage: true, includes: ["Full brand identity (logo, colors, guidelines)", "One-page landing website", "Social media brand kit", "Save \u20A680,000 vs buying separately"] },
  { name: "⭐ Business Launch Pack", price: "\u20A6500,000", isPackage: true, includes: ["Full brand identity system", "Business website (5-8 pages)", "Social media setup & first month content", "SEO foundation", "Save \u20A6150,000+ vs buying separately"] },
  { name: "⭐ Full Business Architecture", price: "From \u20A61,200,000", isPackage: true, includes: ["Complete brand system", "Full website with dashboard", "Social media management (3 months)", "CRM & lead pipeline setup", "AI automation integration", "Save \u20A6300,000+ vs buying separately"] },
  // Individual
  { name: "Brand Identity", price: "From \u20A680,000", includes: ["Logo design & visual identity", "Color palette & typography", "Brand guidelines document", "Full brand system: \u20A6350,000"] },
  { name: "Website Design", price: "From \u20A6200,000", includes: ["Custom design & development", "Mobile responsive", "SEO foundation & analytics", "E-commerce from \u20A6500,000"] },
  { name: "Social Media Management", price: "From \u20A6120,000/mo", includes: ["Content creation & scheduling", "Community management", "Monthly performance reports", "Full management: \u20A6400,000/mo"] },
  { name: "CRM & Lead Generation", price: "From \u20A6180,000", includes: ["CRM setup & configuration", "Lead pipeline design", "Automation & notifications", "Team onboarding"] },
  { name: "AI & Automation", price: "From \u20A6200,000", includes: ["AI customer support agent", "Workflow automation", "Invoice & payment automation", "Custom AI agent from \u20A6400,000"] },
  { name: "Workflow Automation", price: "From \u20A6150,000", includes: ["Workflow mapping & design", "Tool integration & setup", "SOP documentation", "Team training session"] },
];

const SKILLS: Service[] = [
  // Packages first
  { name: "⭐ Founder Fast Track", price: "\u20A6120,000", isPackage: true, includes: ["AI Founder Launchpad program", "Vibe Coding for Founders program", "Combined 6-week intensive", "Save \u20A620,000 vs buying separately"] },
  { name: "⭐ Full Founder Bundle", price: "\u20A6200,000", isPackage: true, includes: ["All 3 core programs", "1-on-1 mentorship sessions", "Certificate & portfolio", "Priority community access", "Save \u20A655,000+ vs buying separately"] },
  { name: "⭐ Corporate Team Package", price: "From \u20A6350,000", isPackage: true, includes: ["Staff training (up to 20 people)", "Custom curriculum design", "On-site or virtual delivery", "Post-training assessment", "Save \u20A6150,000+ vs buying separately"] },
  // Individual
  { name: "AI Founder Launchpad", price: "\u20A675,000", includes: ["Build & launch with AI tools", "Live coaching sessions", "Business model validation", "Certificate of completion"] },
  { name: "Vibe Coding for Founders", price: "\u20A665,000", includes: ["AI-assisted coding workflow", "Build your own MVP", "Real product deployment", "Certificate of completion"] },
  { name: "AI Sales Operator", price: "\u20A655,000", includes: ["AI-powered sales systems", "Lead generation automation", "CRM & pipeline setup", "Certificate of completion"] },
  { name: "Service Business in 21 Days", price: "\u20A645,000", includes: ["Service business blueprint", "Client acquisition strategy", "Pricing & packaging", "Certificate of completion"] },
  { name: "Operations Automation Sprint", price: "\u20A660,000", includes: ["Automate repetitive tasks", "Tool selection & setup", "Workflow design", "Certificate of completion"] },
  { name: "Corporate Staff Training", price: "Custom pricing", includes: ["Tailored to your organisation", "On-site or virtual delivery", "Custom curriculum design", "Post-training assessment"] },
  { name: "RIDI Sponsorship", price: "Sponsored", includes: ["Fully sponsored training", "For underserved communities", "Application-based selection", "Mentorship included"] },
];

const TABS = [
  { key: "bizdoc", label: "BizDoc", data: BIZDOC },
  { key: "systemise", label: "Systemise", data: SYSTEMISE },
  { key: "skills", label: "Skills", data: SKILLS },
] as const;

/* ── Expandable card ───────────────────────────────────────────────────── */

function ServiceCard({ service }: { service: Service }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-[20px] overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: WHITE,
        boxShadow: service.isPackage ? `0 2px 12px ${GOLD}20` : "0 1px 3px rgba(0,0,0,0.04)",
        border: service.isPackage ? `1.5px solid ${GOLD}40` : "1px solid transparent",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-6 text-left transition-colors duration-200 hover:bg-[#FAFAF8]"
      >
        <div>
          <p className="text-[15px] font-semibold tracking-tight" style={{ color: CHARCOAL }}>
            {service.name}
          </p>
          <p className="text-[22px] font-light mt-1" style={{ color: GOLD }}>
            {service.price}
          </p>
        </div>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-300"
          style={{
            color: `${CHARCOAL}40`,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? 300 : 0,
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-7 pb-6 pt-0">
          <div style={{ height: 1, backgroundColor: `${CHARCOAL}08`, marginBottom: 16 }} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: `${CHARCOAL}40` }}>
            What's included
          </p>
          <ul className="space-y-2">
            {service.includes.map((item) => (
              <li key={item} className="text-[13px] font-light leading-relaxed" style={{ color: `${CHARCOAL}90` }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<string>("bizdoc");
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Pricing — HAMZURY"
        description="Transparent pricing for BizDoc Consult, Systemise, and Hamzury Skills."
        canonical="https://hamzury.com/pricing"
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
        <div className="relative">
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: CHARCOAL }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {navMenuOpen && (
            <div
              className="absolute top-10 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
              style={{ backgroundColor: WHITE }}
              onClick={() => setNavMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setNavMenuOpen(false);
                  const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                  if (btn) btn.click();
                }}
                className="flex items-center gap-2 px-3 py-3.5 rounded-xl w-full text-left mx-2"
                style={{ backgroundColor: "#B48C4C10", color: "#B48C4C" }}
              >
                <MessageSquare size={16} />
                <span className="text-[13px] font-medium">Chat with us</span>
              </button>
              {[
                { label: "Home",      href: "/" },
                { label: "BizDoc",    href: "/bizdoc" },
                { label: "Systemise", href: "/systemise" },
                { label: "Skills",    href: "/skills" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: CHARCOAL }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-[clamp(32px,5vw,52px)] font-light tracking-tight leading-[1.1] mb-5"
            style={{ color: CHARCOAL }}
          >
            Transparent pricing<br />for serious businesses.
          </h1>
          <p className="text-[15px] font-light leading-relaxed" style={{ color: `${CHARCOAL}60` }}>
            Packages save you money. Individual services available too. 70% deposit, 30% on delivery.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-3xl mx-auto">
          {/* Tab bar */}
          <div className="flex justify-center gap-2 mb-14">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-6 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200"
                style={{
                  backgroundColor: activeTab === tab.key ? CHARCOAL : "transparent",
                  color: activeTab === tab.key ? MILK : `${CHARCOAL}60`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {currentTab.data.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="pb-20 px-6">
        <p className="text-[13px] font-light text-center max-w-md mx-auto leading-relaxed" style={{ color: `${CHARCOAL}40` }}>
          All prices are estimates. Contact us for a custom quote.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
            HAMZURY
          </Link>
          <div className="flex gap-6">
            <Link href="/bizdoc" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>BizDoc</Link>
            <Link href="/systemise" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Systemise</Link>
            <Link href="/skills" className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${CHARCOAL}40` }}>Skills</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
