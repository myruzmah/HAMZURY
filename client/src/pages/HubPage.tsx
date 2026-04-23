import { PublicShell, Hero, Section, PackageCard, FinalCta } from "./_divisions/DivisionLayout";
import { getDivision } from "@/brand";

const D = getDivision("hub");


export default function HubPage() {
  return (
    <PublicShell
      accent={D.accent}
      title="HUB — Tech Training | HAMZURY"
      description="Tech skills that get you paid. Web development, graphics, data, marketing, Microsoft Office, QuickBooks — with job-placement support."
    >
      <Hero
        accent={D.accent}
        category="Tech Training"
        name="HUB"
        tagline="Tech skills that get you paid."
        subline="Six in-demand programmes. Certified instructors. Job-placement support. We don't teach for certificates — we teach for pay slips."
        primaryCta={{ label: "See Programmes", href: "#programmes" }}
        secondaryCta={{ label: "Start Enrollment", href: "/hub/enroll" }}
      />

      <Section
        accent={D.accent}
        eyebrow="Problem"
        title="Most tech training ends at the certificate"
        subtitle="And that's exactly why graduates still can't find work."
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { t: "Theory without portfolios", b: "You learn what a function is. You don't build anything a client would actually pay for." },
            { t: "No job connections", b: "Training ends. You're back in WhatsApp groups begging for internships. The school has moved on." },
            { t: "Outdated curriculum", b: "Last year's tutorials. No AI. No real tools. You graduate ready for 2019." },
          ].map((c, i) => (
            <div key={i} style={{
              padding: "28px 24px", backgroundColor: "#FFFFFF",
              borderRadius: 16, border: "1px solid #00000008",
            }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.35 }}>{c.t}</p>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.65 }}>{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section accent={D.accent} eyebrow="Programmes" title="Six programmes. Real portfolios. Job support." narrow>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          {[
            "Code Craft — Full-stack web development",
            "Graphics Design — Brand, print, digital",
            "Data Analysis — Excel, SQL, Power BI",
            "Digital Marketing — SEO, ads, funnels",
            "Microsoft Office Mastery",
            "QuickBooks for Bookkeepers",
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

      <Section accent={D.accent} eyebrow="Packages" title="Individual, certification, team, corporate">
        <div id="programmes" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, alignItems: "stretch",
        }}>
          <PackageCard
            accent={D.accent}
            name="Single Course"
            price="₦50k – ₦100k"
            cadence="4 – 6 weeks"
            features={[
              "One programme",
              "Certificate on completion",
              "Live + recorded sessions",
              "Lifetime material access",
            ]}
            onSelect={{ label: "Enrol", href: "/hub/enroll?tier=a" }}
          />
          <PackageCard
            accent={D.accent}
            name="Certification"
            price="₦200k – ₦400k"
            cadence="8 – 12 weeks"
            popular
            features={[
              "Deeper curriculum",
              "Real-client portfolio",
              "Job-placement support",
              "1-on-1 mentorship",
              "Certificate + reference",
            ]}
            onSelect={{ label: "Certify", href: "/hub/enroll?tier=b" }}
          />
          <PackageCard
            accent={D.accent}
            name="Team Training"
            price="₦500,000"
            cadence="one-time"
            features={[
              "5 – 10 staff",
              "Customised curriculum",
              "On-site or virtual",
              "All certificates included",
              "Manager progress reports",
            ]}
            onSelect={{ label: "Train Team", href: "/hub/enroll?tier=c" }}
          />
          <PackageCard
            accent={D.accent}
            name="Corporate"
            price="₦1M+"
            cadence="retainer"
            features={[
              "10+ employees",
              "Full curriculum customisation",
              "Ongoing coaching",
              "Skills assessment framework",
              "Quarterly reviews",
            ]}
            onSelect={{ label: "Talk to Us", href: "/contact" }}
          />
        </div>
      </Section>

      <FinalCta
        accent={D.accent}
        headline="Train for the job, not the certificate."
        subline="Tell us where you are and where you want to be. We'll match you to the right programme — and walk you through to placement."
        cta={{ label: "Start HUB Enrollment", href: "/hub/enroll" }}
      />
    </PublicShell>
  );
}
