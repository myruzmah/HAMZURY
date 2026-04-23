import { PublicShell, Hero, Section, PackageCard, FinalCta } from "./_divisions/DivisionLayout";
import { getDivision } from "@/brand";

const D = getDivision("bizdoc");

export default function BizdocPage() {
  return (
    <PublicShell
      title="Bizdoc — Tax & Compliance | HAMZURY"
      description="We handle FIRS so you can handle business. CAC registration, tax clearance, monthly compliance. Built to last."
      accent={D.accent}
    >
      <Hero
        category="Tax & Compliance"
        name="Bizdoc"
        tagline="We handle FIRS so you can handle business."
        subline="CAC registration, tax clearance, monthly VAT/PAYE/WHT, annual returns — under one roof."
        accent={D.accent}
        primaryCta={{ label: "See Packages", href: "#packages" }}
        secondaryCta={{ label: "Start Assessment", href: "/bizdoc/assessment" }}
      />

      <Section
        accent={D.accent}
        eyebrow="Problem"
        title="Tax paperwork is quietly killing Nigerian businesses"
        subtitle="Three things every founder learns the hard way."
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { t: "Missed deadlines cost more than the filing", b: "FIRS penalties compound. One missed annual return becomes ₦250k in late fees before you finish lunch." },
            { t: "You can't bid for contracts without TCC", b: "No Tax Clearance Certificate = disqualified. Most founders only realise when they're halfway through a proposal." },
            { t: "Regulatory bodies multiply fast", b: "SCUML, PENCOM, NSITF, ITF, BPP — each one assumes you already handled the others. Nobody tells you which apply to you." },
          ].map((c, i) => (
            <div key={i} style={{
              padding: "28px 24px",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              border: "1px solid #00000008",
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.35 }}>{c.t}</p>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65 }}>{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section accent={D.accent} eyebrow="Solution" title="One team. Every compliance document. Every month." narrow>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          {[
            "CAC Ltd / BN registration",
            "TIN + Tax Clearance Certificate",
            "Monthly VAT, PAYE, WHT filings",
            "Annual returns (on time, every year)",
            "PENCOM, NSITF, ITF, BPP registrations",
            "SCUML certificate",
            "Industry-specific licences (NAFDAC, SON, etc.)",
            "Change-of-name, share allotment, board resolutions",
          ].map((item, i) => (
            <li key={i} style={{
              padding: "12px 16px", backgroundColor: "#FFFFFF", borderRadius: 12,
              border: "1px solid #00000008", fontSize: 14,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ color: D.accent, fontWeight: 700 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Packages"
        title="Pick what you need. Pay once. Stay compliant."
      >
        <div id="packages" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, alignItems: "stretch",
        }}>
          <PackageCard
            accent={D.accent}
            name="Starter"
            price="₦90,000"
            cadence="one-time"
            features={[
              "CAC Ltd registration",
              "TIN issuance",
              "Business letterhead",
              "Business cards",
              "3 document templates",
            ]}
            onSelect={{ label: "Start Here", href: "/bizdoc/assessment?tier=a" }}
          />
          <PackageCard
            accent={D.accent}
            name="Compliant"
            price="₦150,000"
            cadence="one-time"
            features={[
              "Everything in Starter",
              "SCUML certificate",
              "Document handover",
              "Compliance checklist",
            ]}
            onSelect={{ label: "Get Compliant", href: "/bizdoc/assessment?tier=b" }}
          />
          <PackageCard
            accent={D.accent}
            name="ProMax (yearly)"
            price="₦300,000"
            cadence="12 months managed"
            popular
            features={[
              "Everything in Compliant",
              "1-year tax management",
              "Monthly VAT/PAYE/WHT",
              "Annual return filed for you",
              "TCC renewal included",
            ]}
            onSelect={{ label: "Go ProMax", href: "/bizdoc/assessment?tier=c" }}
          />
          <PackageCard
            accent={D.accent}
            name="Enterprise"
            price="₦500,000"
            cadence="12 months managed"
            features={[
              "Everything in ProMax",
              "PENCOM, NSITF, ITF, BPP",
              "Industry-specific licences",
              "Dedicated compliance officer",
              "Quarterly reviews",
            ]}
            onSelect={{ label: "Go Enterprise", href: "/bizdoc/assessment?tier=d" }}
          />
        </div>
      </Section>

      <FinalCta
        accent={D.accent}
        headline="Don't guess what you need. Let us prescribe it."
        subline="Answer a few questions. Our compliance team reads your answers and sends back the exact package — no upsell, no guesswork."
        cta={{ label: "Start Bizdoc Assessment", href: "/bizdoc/assessment" }}
      />
    </PublicShell>
  );
}
