import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown, Menu, X, MessageSquare } from "lucide-react";
import PageMeta from "@/components/PageMeta";

/**
 * Pricing — LOCKED to the Excel Master `Pricing_Matrix_All_Divisions.xlsx`.
 * Version 2026-04 · Founder-approved.
 *
 * 4 divisions × 4 tiers each = 16 locked packages.
 *   Bizdoc:  Starter   · Compliant   · ProMax (POPULAR) · Enterprise
 *   Scalar:  Presence  · Growth      · Automate (POPULAR) · Platform
 *   Medialy: Setup     · Manage      · Accelerate (POPULAR) · Authority
 *   HUB:     Single    · Certification (POPULAR) · Team · Corporate
 *
 * Never change these in the UI without updating the Excel first.
 */

const MILK = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD = "#B48C4C";
const WHITE = "#FFFFFF";

type Service = {
  name: string;
  price: string;
  includes: string[];
  isPackage?: boolean;
  popular?: boolean;
};

const BIZDOC: Service[] = [
  {
    name: "Bizdoc Starter",
    price: "\u20A690,000",
    isPackage: true,
    includes: [
      "CAC Limited Company registration",
      "EFCC SCUML setup (if required)",
      "Tax ProMax registration (TIN)",
      "1 corporate bank account support",
    ],
  },
  {
    name: "Bizdoc Compliant",
    price: "\u20A6150,000",
    isPackage: true,
    includes: [
      "Everything in Starter",
      "TCC (Tax Clearance Certificate)",
      "Annual Returns filing",
      "VAT + PAYE setup",
    ],
  },
  {
    name: "\u2B50 Bizdoc ProMax",
    price: "\u20A6300,000",
    isPackage: true,
    popular: true,
    includes: [
      "Everything in Compliant",
      "Branding light pack (logo + letterhead)",
      "Business Plan document",
      "1 year Tax Management (Tax ProMax)",
      "Full contracts pack (NDA / service / employment)",
    ],
  },
  {
    name: "Bizdoc Enterprise",
    price: "\u20A6500,000",
    isPackage: true,
    includes: [
      "Everything in ProMax",
      "ITF registration",
      "NSITF registration",
      "PENCOM setup",
      "BPP / NEPC enrolment",
      "Priority compliance support",
    ],
  },
  {
    name: "CAC Registration",
    price: "From \u20A650,000",
    includes: [
      "Business Name, Ltd, or Trustees",
      "Name availability search",
      "Full CAC documentation",
      "Certificate of registration",
    ],
  },
  {
    name: "Tax Compliance (TIN / TCC)",
    price: "From \u20A630,000",
    includes: [
      "TIN registration (FIRS)",
      "Tax Clearance Certificate (TCC)",
      "VAT setup & filing",
      "PAYE registration",
    ],
  },
  {
    name: "Tax Pro Max (Annual)",
    price: "\u20A6150,000 / year",
    includes: [
      "Annual tax filing & returns",
      "TIN & TCC management",
      "Penalty prevention monitoring",
      "Quarterly compliance reports",
    ],
  },
  {
    name: "Industry Licence or Permit",
    price: "From \u20A660,000",
    includes: [
      "NAFDAC, SON, NEPC, SCUML",
      "Application preparation",
      "Agency liaison & follow-up",
      "Certificate delivery",
    ],
  },
  {
    name: "Legal Documentation",
    price: "From \u20A640,000",
    includes: [
      "Contract drafting & review",
      "Legal agreements & NDAs",
      "Terms & conditions",
      "Full document pack available",
    ],
  },
  {
    name: "Foreign Business Setup",
    price: "From \u20A6350,000",
    includes: [
      "CERPAC residence permit",
      "Expatriate Quota (EQ)",
      "Business Permit",
      "Full foreign setup pack available",
    ],
  },
  {
    name: "Compliance Management Subscription",
    price: "\u20A650,000 / month",
    includes: [
      "Monthly compliance monitoring",
      "Deadline tracking & reminders",
      "Priority response",
      "Quarterly status reports",
    ],
  },
];

const SCALAR: Service[] = [
  {
    name: "Scalar Presence",
    price: "\u20A6300,000",
    isPackage: true,
    includes: [
      "Professional 5-page website",
      "Mobile responsive",
      "Domain + hosting setup (1 year)",
      "Basic SEO foundation",
      "Delivery in 7 – 10 working days",
    ],
  },
  {
    name: "Scalar Growth",
    price: "\u20A6500,000",
    isPackage: true,
    includes: [
      "Everything in Presence",
      "Lead-capture forms + email notifications",
      "WhatsApp chat integration",
      "Google Analytics + Search Console",
      "Delivery in 2 – 3 weeks",
    ],
  },
  {
    name: "\u2B50 Scalar Automate",
    price: "\u20A61,000,000",
    isPackage: true,
    popular: true,
    includes: [
      "Everything in Growth",
      "Custom CRM & client dashboard",
      "Email / WhatsApp automation",
      "AI chatbot (FAQ + booking)",
      "Team training + 30 days support",
      "Delivery in 4 – 6 weeks",
    ],
  },
  {
    name: "Scalar Platform",
    price: "\u20A62,000,000",
    isPackage: true,
    includes: [
      "Everything in Automate",
      "Custom platform / marketplace",
      "Multi-role dashboards",
      "Advanced AI agent + analytics",
      "90 days post-launch support",
      "Delivery in 6 – 10 weeks",
    ],
  },
  {
    name: "Brand Identity",
    price: "From \u20A680,000",
    includes: [
      "Logo design & visual identity",
      "Color palette & typography",
      "Brand guidelines document",
      "Full brand system from \u20A6350,000",
    ],
  },
  {
    name: "Website Design",
    price: "From \u20A6200,000",
    includes: [
      "Custom design & development",
      "Mobile responsive",
      "SEO foundation & analytics",
      "E-commerce from \u20A6500,000",
    ],
  },
  {
    name: "CRM & Lead Generation",
    price: "From \u20A6180,000",
    includes: [
      "CRM setup & configuration",
      "Lead pipeline design",
      "Automation & notifications",
      "Team onboarding",
    ],
  },
  {
    name: "AI Agent (Custom)",
    price: "From \u20A6200,000",
    includes: [
      "Custom AI customer agent",
      "Live chat + WhatsApp",
      "FAQ training + handoff",
      "Custom AI platform from \u20A6400,000",
    ],
  },
  {
    name: "Workflow Automation",
    price: "From \u20A6150,000",
    includes: [
      "Workflow mapping & design",
      "Tool integration & setup",
      "SOP documentation",
      "Team training session",
    ],
  },
];

const MEDIALY: Service[] = [
  {
    name: "Medialy Setup",
    price: "\u20A650,000 one-time",
    isPackage: true,
    includes: [
      "Profile tune-up on 3 platforms",
      "Bio + link tree + branded cover",
      "Content pillar plan (3-month outline)",
      "Posting schedule template",
    ],
  },
  {
    name: "Medialy Manage",
    price: "\u20A6150,000 / month",
    isPackage: true,
    includes: [
      "12 posts / month (mix of feed + story)",
      "Content calendar + approvals",
      "Community management (replies + DMs)",
      "Monthly performance report",
    ],
  },
  {
    name: "\u2B50 Medialy Accelerate",
    price: "\u20A6300,000 / month",
    isPackage: true,
    popular: true,
    includes: [
      "Everything in Manage",
      "20 posts / month (feed + reels + stories)",
      "Reels scripting + editing",
      "Paid ads setup + management (ad spend separate)",
      "Weekly performance reviews",
    ],
  },
  {
    name: "Medialy Authority",
    price: "\u20A6500,000 / month",
    isPackage: true,
    includes: [
      "Everything in Accelerate",
      "30+ posts / month across 4 platforms",
      "Founder content production (podcast clips, interviews)",
      "Dedicated content creator + editor",
      "Influencer outreach + partnerships",
    ],
  },
  {
    name: "Social Media Management",
    price: "From \u20A6120,000 / month",
    includes: [
      "Content creation & scheduling",
      "Community management",
      "Monthly performance reports",
    ],
  },
  {
    name: "Content Production",
    price: "From \u20A6200,000",
    includes: [
      "Photography + videography shoot day",
      "Short-form reel / tiktok editing",
      "Platform-ready exports",
      "One-time or retainer",
    ],
  },
];

const HUB: Service[] = [
  {
    name: "HUB Single Course",
    price: "\u20A625,000 \u2013 \u20A6100,000",
    isPackage: true,
    includes: [
      "One programme (choose from 8 tracks)",
      "Live cohort delivery",
      "Practical assignments",
      "Certificate of completion",
    ],
  },
  {
    name: "\u2B50 HUB Certification",
    price: "\u20A6200,000 \u2013 \u20A6400,000",
    isPackage: true,
    popular: true,
    includes: [
      "Full certification track (12-week intensive)",
      "External cert support (Google / Coursera)",
      "1-on-1 mentorship sessions",
      "HAMZURY certificate (digital + physical)",
      "Alumni community access",
    ],
  },
  {
    name: "HUB Team Training",
    price: "\u20A6500,000",
    isPackage: true,
    includes: [
      "Up to 20 staff trained",
      "Custom curriculum tailored to business",
      "On-site or virtual delivery",
      "Post-training skills assessment",
    ],
  },
  {
    name: "HUB Corporate",
    price: "From \u20A61,000,000",
    isPackage: true,
    includes: [
      "Unlimited seats / full department",
      "Multi-month curriculum design",
      "Quarterly progress reports",
      "Dedicated instructor pool",
      "Priority content customisation",
    ],
  },
  {
    name: "AI Founder Launchpad",
    price: "\u20A675,000",
    includes: [
      "Build & launch with AI tools",
      "Live coaching sessions",
      "Business model validation",
      "Certificate of completion",
    ],
  },
  {
    name: "Vibe Coding for Founders",
    price: "\u20A665,000",
    includes: [
      "AI-assisted coding workflow",
      "Build your own MVP",
      "Real product deployment",
      "Certificate of completion",
    ],
  },
  {
    name: "RIDI Cohort",
    price: "Sponsored",
    includes: [
      "Fully funded training",
      "Application-based selection",
      "For underserved communities",
      "Mentorship + placement support",
    ],
  },
];

const TABS = [
  { key: "bizdoc", label: "Bizdoc", data: BIZDOC, accent: "#1B4D3E" },
  { key: "scalar", label: "Scalar", data: SCALAR, accent: "#D4A017" },
  { key: "medialy", label: "Medialy", data: MEDIALY, accent: "#1D4ED8" },
  { key: "hub", label: "HUB", data: HUB, accent: "#1E3A5F" },
] as const;

/* ── Expandable card ───────────────────────────────────────────────────── */

function ServiceCard({ service, accent }: { service: Service; accent: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-[20px] overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: WHITE,
        boxShadow: service.popular
          ? `0 2px 16px ${accent}25`
          : service.isPackage
          ? `0 2px 12px ${GOLD}18`
          : "0 1px 3px rgba(0,0,0,0.04)",
        border: service.popular
          ? `1.5px solid ${accent}55`
          : service.isPackage
          ? `1.5px solid ${GOLD}35`
          : "1px solid transparent",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-6 text-left transition-colors duration-200 hover:bg-[#FAFAF8]"
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {service.popular && (
            <div
              style={{
                display: "inline-block",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "3px 8px",
                borderRadius: 999,
                backgroundColor: `${accent}15`,
                color: accent,
                marginBottom: 6,
              }}
            >
              MOST POPULAR
            </div>
          )}
          <p className="text-[15px] font-semibold tracking-tight" style={{ color: CHARCOAL }}>
            {service.name}
          </p>
          <p className="text-[22px] font-light mt-1" style={{ color: accent }}>
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

      {open && (
        <div className="px-7 pb-6">
          <ul className="space-y-2 mb-4">
            {service.includes.map((it, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: accent, fontSize: 14, lineHeight: 1.4 }}>•</span>
                <span className="text-[14px]" style={{ color: CHARCOAL, lineHeight: 1.5 }}>
                  {it}
                </span>
              </li>
            ))}
          </ul>
          <a
            href={`https://wa.me/2349130700056?text=${encodeURIComponent(
              `Hello HAMZURY — I'm interested in ${service.name} (${service.price}).`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold"
            style={{ backgroundColor: accent, color: WHITE }}
          >
            <MessageSquare size={14} /> Ask about this
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("bizdoc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const active = TABS.find(t => t.key === activeTab)!;

  return (
    <div style={{ backgroundColor: MILK, minHeight: "100vh" }}>
      <PageMeta
        title="Pricing | HAMZURY"
        description="Four divisions. Four tiers each. Founder-approved pricing — locked 2026-04."
      />

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: `${MILK}F2`,
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
        >
          <Link href="/" style={{ color: CHARCOAL, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <ArrowLeft size={16} /> HAMZURY
          </Link>
          <nav className="hidden md:flex gap-6 text-[13px]" style={{ color: CHARCOAL }}>
            <Link href="/bizdoc">Bizdoc</Link>
            <Link href="/scalar">Scalar</Link>
            <Link href="/medialy">Medialy</Link>
            <Link href="/hub">HUB</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(v => !v)}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div
            className="md:hidden flex flex-col gap-3 p-4"
            style={{ borderTop: "1px solid rgba(0,0,0,0.06)", backgroundColor: MILK }}
          >
            <Link href="/bizdoc">Bizdoc</Link>
            <Link href="/scalar">Scalar</Link>
            <Link href="/medialy">Medialy</Link>
            <Link href="/hub">HUB</Link>
            <Link href="/contact">Contact</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <p style={{ fontSize: 11, letterSpacing: "0.18em", color: GOLD, fontWeight: 600 }}>
          FOUNDER-APPROVED · LOCKED 2026-04
        </p>
        <h1
          className="mt-3"
          style={{ fontSize: 42, fontWeight: 300, color: CHARCOAL, letterSpacing: -1 }}
        >
          Transparent pricing.
          <br />
          <span style={{ fontWeight: 600 }}>No hidden fees.</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto" style={{ fontSize: 15, color: CHARCOAL, lineHeight: 1.6 }}>
          Four divisions, four tiers each. Built around what businesses actually need —
          not what looks clever on a pitch deck. Tap any package to see what's inside.
        </p>
      </section>

      {/* Tabs */}
      <div
        className="max-w-4xl mx-auto px-6 mb-10 flex flex-wrap gap-2 justify-center"
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: activeTab === t.key ? "none" : `1px solid ${CHARCOAL}20`,
              backgroundColor: activeTab === t.key ? t.accent : "transparent",
              color: activeTab === t.key ? WHITE : CHARCOAL,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Service cards */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {active.data.map((s, i) => (
            <ServiceCard key={i} service={s} accent={active.accent} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p style={{ fontSize: 13, color: `${CHARCOAL}80` }}>
            Need something custom? Talk to our team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-3 px-6 py-3 rounded-full"
            style={{ backgroundColor: CHARCOAL, color: WHITE, fontSize: 13, fontWeight: 600 }}
          >
            Start a conversation
          </Link>
        </div>
      </section>

      <footer
        className="text-center pb-10"
        style={{ fontSize: 11, color: `${CHARCOAL}60` }}
      >
        Hamzury. Built to Last.
      </footer>
    </div>
  );
}
