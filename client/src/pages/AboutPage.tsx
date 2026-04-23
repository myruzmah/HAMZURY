import { PublicShell, Section, FinalCta } from "./_divisions/DivisionLayout";
import { PUBLIC, TYPE, BRAND_TAGLINE } from "@/brand";

export default function AboutPage() {
  return (
    <PublicShell
      title="About HAMZURY | Built to Last"
      description="HAMZURY is a Nigerian firm building digital infrastructure for Nigerian businesses. Tax, web, content, training — under one roof."
    >
      <section style={{
        padding: "96px 24px 64px", maxWidth: 900, margin: "0 auto", textAlign: "center",
      }}>
        <p style={{
          fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14,
        }}>About</p>
        <h1 style={{
          fontFamily: TYPE.display, fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700,
          lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 20,
        }}>
          {BRAND_TAGLINE}
        </h1>
        <p style={{
          fontSize: "clamp(17px, 2vw, 21px)", color: PUBLIC.muted,
          lineHeight: 1.6, maxWidth: 640, margin: "0 auto",
        }}>
          We build the digital infrastructure Nigerian businesses actually need.
          Four divisions. One standard. One team.
        </p>
      </section>

      <Section eyebrow="Our story" title="Why HAMZURY exists" narrow>
        <div style={{ fontSize: 17, lineHeight: 1.8, color: PUBLIC.dark, maxWidth: 720, margin: "0 auto" }}>
          <p style={{ marginBottom: 18 }}>
            Every Nigerian founder knows the exhaustion of stitching their business together
            by hand. One freelancer for the website. A different person for tax. A cousin who
            "does social media". An accountant who answers WhatsApp at midnight.
          </p>
          <p style={{ marginBottom: 18 }}>
            Quality drifts. Standards slip. You become the glue.
          </p>
          <p style={{ marginBottom: 18 }}>
            HAMZURY exists to be the single place where a Nigerian business can register, build,
            publish, and train — with the same standard across every service. We built it because
            we wanted it for our own businesses first.
          </p>
        </div>
      </Section>

      <Section eyebrow="How we work" title="Three commitments">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { t: "One standard", b: "The same quality floor across Bizdoc, Scalar, Medialy, and HUB. No weak link, no surprise drop-off." },
            { t: "Full-time team", b: "Everyone who touches your work is on our payroll. Not a freelancer who vanishes on delivery day." },
            { t: "Built to last", b: "We build systems that survive the founder stepping away for a weekend. Documented, handed over, maintained." },
          ].map((c, i) => (
            <div key={i} style={{
              padding: "28px 24px", backgroundColor: PUBLIC.white,
              borderRadius: 16, border: `1px solid ${PUBLIC.hairline}`,
            }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{c.t}</p>
              <p style={{ fontSize: 14, color: PUBLIC.muted, lineHeight: 1.7 }}>{c.b}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Founder" title="Muhammad Hamzury" narrow>
        <div style={{
          maxWidth: 680, margin: "0 auto", fontSize: 16, lineHeight: 1.8,
          color: PUBLIC.dark,
        }}>
          <p style={{ marginBottom: 16 }}>
            Founder of HAMZURY. Builds businesses the way a craftsman builds a house — one
            standard, every layer, no shortcuts.
          </p>
          <p style={{ marginBottom: 16 }}>
            HAMZURY is the infrastructure company he wished existed when he started — and is
            now building for every founder who comes after.
          </p>
        </div>
      </Section>

      <FinalCta
        headline="Want to work with us?"
        subline="Pick a division, fill the assessment, we'll come back with a plan."
        cta={{ label: "See Services", href: "/#divisions" }}
      />
    </PublicShell>
  );
}
