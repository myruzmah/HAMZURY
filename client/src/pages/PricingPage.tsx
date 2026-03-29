import { Link } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TEAL  = "#2D2D2D";   // Charcoal — general
const GOLD  = "#B48C4C";
const MILK  = "#FFFAF6";   // Milk white
const WHITE = "#FFFFFF";
const DARK  = "#1A1A1A";

const BIZDOC_PLANS = [
  {
    name: "Business Name Registration",
    price: "From ₦50,000",
    timeline: "7–14 business days",
    features: [
      "Name availability check",
      "CAC business name registration",
      "Certificate of registration",
      "Post-registration compliance brief",
    ],
  },
  {
    name: "Limited Company Incorporation",
    price: "From ₦120,000",
    timeline: "10–21 business days",
    badge: "Most Requested",
    features: [
      "Everything in Business Name",
      "MEMART & ARTT drafting",
      "Multi-director setup",
      "Corporate share structure",
      "Post-incorporation documents",
    ],
  },
  {
    name: "Tax & Regulatory Compliance",
    price: "From ₦80,000",
    timeline: "5–10 business days",
    features: [
      "TIN registration (FIRS)",
      "VAT setup & first filing",
      "PAYE registration",
      "Annual tax returns",
      "Tax clearance certificate",
    ],
  },
  {
    name: "Industry Licensing",
    price: "From ₦150,000",
    timeline: "Varies by agency",
    features: [
      "NAFDAC, SON, DPR, NSCDC",
      "Application preparation",
      "Agency liaison & follow-up",
      "Certificate delivery",
      "Renewal tracking",
    ],
  },
  {
    name: "Trademark & IP",
    price: "From ₦95,000",
    timeline: "30–90 days",
    features: [
      "Trademark search & clearance",
      "Registration application",
      "IPO liaison",
      "Certificate delivery",
      "5-year renewal reminder",
    ],
  },
  {
    name: "Annual Compliance Retainer",
    price: "From ₦180,000/yr",
    timeline: "Ongoing",
    badge: "Best Value",
    features: [
      "All annual CAC returns",
      "Tax filings (quarterly)",
      "Compliance calendar",
      "Priority response",
      "Monthly status updates",
    ],
  },
];

const SYSTEMISE_PLANS = [
  {
    name: "Brand Identity",
    price: "From ₦150,000",
    timeline: "2–3 weeks",
    features: [
      "Logo design (3 concepts)",
      "Color palette & typography",
      "Brand voice guide",
      "Business card design",
      "Brand guidelines document",
    ],
  },
  {
    name: "Website Design",
    price: "From ₦250,000",
    timeline: "3–4 weeks",
    badge: "Most Requested",
    features: [
      "Up to 8 pages",
      "Mobile responsive",
      "Contact & lead capture forms",
      "SEO foundation",
      "1 month post-launch support",
    ],
  },
  {
    name: "Business Systems Package",
    price: "From ₦350,000",
    timeline: "4–6 weeks",
    features: [
      "CRM setup & configuration",
      "Client onboarding automation",
      "Invoice & payment workflow",
      "Team SOP documentation",
      "Training session (2hrs)",
    ],
  },
  {
    name: "Full Brand + Systems",
    price: "From ₦600,000",
    timeline: "6–8 weeks",
    badge: "Complete Package",
    features: [
      "Complete brand identity",
      "Full website build",
      "CRM + automation setup",
      "Social media templates",
      "Monthly management (3 months)",
    ],
  },
];

const SKILLS_PLANS = [
  {
    name: "Business Essentials Bootcamp",
    price: "From ₦18,000",
    timeline: "2 weeks",
    features: [
      "10 live virtual sessions",
      "Business plan template",
      "Financial model",
      "30-day action plan",
      "Certificate of completion",
    ],
  },
  {
    name: "Digital Marketing Intensive",
    price: "From ₦35,000",
    timeline: "3 weeks",
    badge: "Most Popular",
    features: [
      "15 live virtual sessions",
      "Social media strategy",
      "Content calendar",
      "Email marketing setup",
      "Certificate of completion",
    ],
  },
  {
    name: "Data Analysis Bootcamp",
    price: "From ₦45,000",
    timeline: "4 weeks",
    features: [
      "20 live sessions + workshops",
      "Excel, SQL & Tableau",
      "Portfolio project",
      "Real business datasets",
      "Certificate of completion",
    ],
  },
  {
    name: "AI-Powered Business Bundle",
    price: "From ₦65,000",
    timeline: "3 days",
    badge: "Best Value",
    features: [
      "AI for Lead Generation",
      "AI for Content Creation",
      "AI for Business Automation",
      "50+ prompt templates",
      "Tool setup walkthrough",
    ],
  },
];

function PlanCard({ plan, accentColor }: {
  plan: { name: string; price: string; timeline: string; badge?: string; features: string[] };
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-7 border flex flex-col relative"
      style={{
        backgroundColor: WHITE,
        borderColor: plan.badge ? `${accentColor}40` : `${DARK}10`,
        boxShadow: plan.badge ? `0 4px 24px ${accentColor}12` : "none",
      }}
    >
      {plan.badge && (
        <span
          className="absolute -top-3 left-6 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full"
          style={{ backgroundColor: accentColor, color: accentColor === GOLD ? TEAL : WHITE }}
        >
          {plan.badge}
        </span>
      )}
      <h3 className="text-base font-semibold mb-1" style={{ color: TEAL }}>{plan.name}</h3>
      <p className="text-xs mb-4" style={{ color: DARK, opacity: 0.45 }}>Delivery: {plan.timeline}</p>
      <p className="text-2xl font-semibold mb-6" style={{ color: accentColor }}>{plan.price}</p>
      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5">
            <Check size={13} className="mt-0.5 shrink-0" style={{ color: accentColor }} />
            <span className="text-sm font-light" style={{ color: DARK, opacity: 0.75 }}>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="https://wa.me/2349130700056"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 rounded-full text-sm font-semibold text-center transition-all hover:opacity-85"
        style={{ backgroundColor: TEAL, color: GOLD }}
      >
        Get Started →
      </a>
    </div>
  );
}

function DeptSection({ id, label, subtitle, plans, accentColor }: {
  id: string;
  label: string;
  subtitle: string;
  plans: any[];
  accentColor: string;
}) {
  return (
    <section id={id} className="py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <span className="text-[11px] font-bold tracking-[0.3em] uppercase mb-4 block" style={{ color: accentColor }}>
          {label}
        </span>
        <p className="text-2xl md:text-3xl font-medium tracking-tight mb-3" style={{ color: TEAL }}>
          {subtitle}
        </p>
        <p className="text-sm font-light mb-12 max-w-xl" style={{ color: DARK, opacity: 0.55 }}>
          All prices are starting rates. Final quote based on scope and complexity. 70% deposit required to begin.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan.name} plan={plan} accentColor={accentColor} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Pricing — HAMZURY Innovation Hub"
        description="Transparent pricing for BizDoc Consult, Systemise, and Hamzury Skills. Starting rates for every service — from business registration to brand systems and skills training."
        canonical="https://hamzury.com/pricing"
      />

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 z-50 flex justify-between items-center border-b backdrop-blur-md"
        style={{ backgroundColor: `${MILK}E8`, borderColor: `${GOLD}20` }}
      >
        <Link
          href="/"
          className="text-[13px] font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-60"
          style={{ color: DARK }}
        >
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "BizDoc", href: "#bizdoc" },
            { label: "Systemise", href: "#systemise" },
            { label: "Skills", href: "#skills" },
          ].map(l => (
            <a key={l.href} href={l.href} className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: DARK }}>
              {l.label}
            </a>
          ))}
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.2em] opacity-40" style={{ color: DARK }}>
          Pricing
        </span>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-16 px-6 md:px-12" style={{ backgroundColor: TEAL }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[11px] font-bold tracking-[0.35em] uppercase mb-5 block" style={{ color: GOLD }}>
            Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-[1.1]" style={{ color: WHITE }}>
            Premium work.<br className="hidden md:block" /> Honest prices.
          </h1>
          <p className="text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.65)" }}>
            All services operate on a 70% upfront deposit, 30% on delivery model.
            Every engagement is scoped, quoted, and confirmed before work begins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[
              { label: "BizDoc Pricing", href: "#bizdoc", color: "#1B4D3E" },
              { label: "Systemise Pricing", href: "#systemise", color: "#1B4D3E" },
              { label: "Skills Pricing", href: "#skills", color: "#1B4D3E" },
            ].map(btn => (
              <a
                key={btn.label}
                href={btn.href}
                className="px-7 py-3.5 rounded-full text-sm font-semibold border transition-all hover:opacity-80"
                style={{ borderColor: `${GOLD}50`, color: GOLD, backgroundColor: "transparent" }}
              >
                {btn.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* POLICY BANNER */}
      <div className="py-5 px-6 md:px-12" style={{ backgroundColor: `${GOLD}15`, borderBottom: `1px solid ${GOLD}25` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="text-sm font-normal" style={{ color: TEAL }}>
            <strong>Deposit Policy:</strong> 70% upfront · 30% on delivery. Minimum deposit required to begin work.
          </p>
          <p className="text-sm font-normal" style={{ color: TEAL }}>
            <strong>Refunds:</strong> Only before work commences. Credit note offered after work begins.
          </p>
          <a
            href="/ask"
            className="text-sm font-semibold underline underline-offset-2 shrink-0"
            style={{ color: TEAL }}
          >
            Full refund policy →
          </a>
        </div>
      </div>

      {/* DEPT SECTIONS */}
      <div style={{ backgroundColor: MILK }}>
        <DeptSection
          id="bizdoc"
          label="BizDoc Consult"
          subtitle="Compliance & regulatory services."
          plans={BIZDOC_PLANS}
          accentColor="#1B4D3E"
        />
        <div style={{ borderTop: `1px solid ${DARK}08` }} />
        <DeptSection
          id="systemise"
          label="Systemise"
          subtitle="Brand, systems & digital."
          plans={SYSTEMISE_PLANS}
          accentColor={TEAL}
        />
        <div style={{ borderTop: `1px solid ${DARK}08` }} />
        <DeptSection
          id="skills"
          label="Hamzury Skills"
          subtitle="Training & development."
          plans={SKILLS_PLANS}
          accentColor={GOLD}
        />
      </div>

      {/* COMPARISON */}
      <section className="py-20 px-6 md:px-12" style={{ backgroundColor: TEAL }}>
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] font-bold tracking-[0.35em] uppercase mb-4 block" style={{ color: GOLD }}>
            Why HAMZURY
          </span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight mb-12" style={{ color: WHITE }}>
            HAMZURY vs. the alternatives.
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: `${GOLD}20` }}>
                  <th className="py-3 text-left font-normal text-[11px] uppercase tracking-wider" style={{ color: `${GOLD}80` }}>What You Get</th>
                  <th className="py-3 text-center font-semibold" style={{ color: GOLD }}>HAMZURY</th>
                  <th className="py-3 text-center font-normal opacity-50 text-xs" style={{ color: WHITE }}>Street Agent</th>
                  <th className="py-3 text-center font-normal opacity-50 text-xs" style={{ color: WHITE }}>DIY</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Legal accuracy guaranteed", true, false, false],
                  ["Full documentation delivered", true, false, false],
                  ["Dedicated specialist assigned", true, false, false],
                  ["Real-time progress tracking", true, false, false],
                  ["Post-registration support", true, false, false],
                  ["Transparent pricing upfront", true, false, true],
                  ["Barrister-led compliance desk", true, false, false],
                ].map(([label, h, s, d]) => (
                  <tr key={String(label)} className="border-b" style={{ borderColor: `${GOLD}10` }}>
                    <td className="py-4 font-light" style={{ color: "rgba(255,255,255,0.75)" }}>{String(label)}</td>
                    <td className="py-4 text-center"><span style={{ color: "#22C55E" }}>{h ? "✓" : "—"}</span></td>
                    <td className="py-4 text-center opacity-50"><span style={{ color: s ? "#22C55E" : "#EF4444" }}>{s ? "✓" : "✗"}</span></td>
                    <td className="py-4 text-center opacity-50"><span style={{ color: d ? "#22C55E" : "#EF4444" }}>{d ? "✓" : "✗"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12" style={{ backgroundColor: MILK }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium mb-4" style={{ color: TEAL }}>Not sure which service you need?</h2>
          <p className="text-sm font-light mb-10 max-w-md mx-auto" style={{ color: DARK, opacity: 0.6 }}>
            Start a chat with the relevant desk and get a clear recommendation within minutes — no obligation, no pressure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bizdoc"
              className="px-8 py-4 rounded-full text-sm font-semibold transition-all hover:opacity-85"
              style={{ backgroundColor: TEAL, color: GOLD }}
            >
              Open BizDoc →
            </Link>
            <Link
              href="/systemise"
              className="px-8 py-4 rounded-full text-sm font-semibold border transition-all hover:opacity-70"
              style={{ borderColor: `${TEAL}30`, color: TEAL, backgroundColor: "transparent" }}
            >
              Open Systemise →
            </Link>
            <Link
              href="/skills"
              className="px-8 py-4 rounded-full text-sm font-semibold border transition-all hover:opacity-70"
              style={{ borderColor: `${TEAL}30`, color: TEAL, backgroundColor: "transparent" }}
            >
              View Skills →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 md:px-12 border-t" style={{ borderColor: `${TEAL}10` }}>
        <div className="flex justify-between items-center">
          <Link href="/" className="text-[12px] font-bold tracking-wider hover:opacity-60 transition-opacity" style={{ color: TEAL }}>
            HAMZURY
          </Link>
          <p className="text-[11px] opacity-40" style={{ color: DARK }}>
            All prices are starting rates. Final quote confirmed before work begins.
          </p>
        </div>
        <p className="text-[12px] font-light italic mt-3" style={{ color: `${DARK}50` }}>
          "Structure before speed. That is how we build." — Muhammad Hamzury, Founder
        </p>
      </footer>
    </div>
  );
}
