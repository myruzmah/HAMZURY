import { PublicShell, Hero, Section, PackageCard, FinalCta } from "./_divisions/DivisionLayout";
import { getDivision } from "@/brand";

const D = getDivision("scalar");


export default function ScalarPage() {
  return (
    <PublicShell
      accent={D.accent}
      title="Scalar — Web & Automation | HAMZURY"
      description="Websites that work. Systems that scale. Custom web, CRM integration, WhatsApp automation, AI chatbots."
    >
      <Hero
        accent={D.accent}
        category="Web & Automation"
        name="Scalar"
        tagline="Websites that work. Systems that scale."
        subline="Custom websites, CRM integrations, WhatsApp + email automation, dashboards, AI chatbots — engineered for Nigerian operations."
        primaryCta={{ label: "See Packages", href: "#packages" }}
        secondaryCta={{ label: "Start Assessment", href: "/scalar/assessment" }}
      />

      <Section
        accent={D.accent}
        eyebrow="Problem"
        title="Your business is running on WhatsApp and a Google Sheet"
        subtitle="That's fine at zero. It stops being fine at ₦5M/month."
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { t: "You can't tell a client your website", b: "Prospects Google you. They find nothing. Deals quietly die before you even hear the brief." },
            { t: "Leads leak every day", b: "People message, ask, forget. No follow-up system. No way to see who asked what last Tuesday." },
            { t: "You're the bottleneck for every task", b: "Send quote. Chase invoice. Confirm delivery. Nothing happens until you personally touch it." },
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

      <Section accent={D.accent} eyebrow="Solution" title="A real website + the systems behind it" narrow>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          {[
            "Professional, mobile-first website",
            "Lead capture with CRM routing",
            "WhatsApp Business API integration",
            "Email automation (welcome, nurture, recovery)",
            "Business dashboards (sales, leads, invoices)",
            "AI chatbot trained on your business",
            "Payment integration (Paystack, Flutterwave)",
            "Analytics, SEO, performance tuning",
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

      <Section accent={D.accent} eyebrow="Packages" title="From first website to full operations system">
        <div id="packages" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, alignItems: "stretch",
        }}>
          <PackageCard
            accent={D.accent}
            name="Presence"
            price="₦300,000"
            cadence="one-time"
            features={[
              "5 responsive pages",
              "Contact form",
              "WhatsApp click-to-chat",
              "3 months hosting",
              "SSL + basic SEO",
            ]}
            onSelect={{ label: "Get Presence", href: "/scalar/assessment?tier=a" }}
          />
          <PackageCard
            accent={D.accent}
            name="Growth"
            price="₦500,000"
            cadence="one-time"
            features={[
              "10 pages + blog",
              "Advanced SEO",
              "Google Analytics",
              "CMS (edit content yourself)",
              "6 months hosting",
            ]}
            onSelect={{ label: "Start Growth", href: "/scalar/assessment?tier=b" }}
          />
          <PackageCard
            accent={D.accent}
            name="Automate"
            price="₦1,000,000"
            cadence="one-time"
            popular
            features={[
              "Everything in Growth",
              "CRM integration",
              "WhatsApp + email automation",
              "Payment gateway",
              "12 months hosting",
            ]}
            onSelect={{ label: "Automate", href: "/scalar/assessment?tier=c" }}
          />
          <PackageCard
            accent={D.accent}
            name="Platform"
            price="₦2,000,000"
            cadence="one-time + retainer"
            features={[
              "Everything in Automate",
              "Business dashboard",
              "AI chatbot (trained on you)",
              "System integrations",
              "Custom features + training",
            ]}
            onSelect={{ label: "Build Platform", href: "/scalar/assessment?tier=d" }}
          />
        </div>
      </Section>

      <FinalCta
        accent={D.accent}
        headline="Stop duct-taping your operations together."
        subline="Tell us what's broken. We'll show you what to build — no jargon, no oversell."
        cta={{ label: "Start Scalar Assessment", href: "/scalar/assessment" }}
      />
    </PublicShell>
  );
}
