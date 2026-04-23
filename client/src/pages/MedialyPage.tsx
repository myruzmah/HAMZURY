import { PublicShell, Hero, Section, PackageCard, FinalCta } from "./_divisions/DivisionLayout";

export default function MedialyPage() {
  return (
    <PublicShell
      title="Medialy — Social Media | HAMZURY"
      description="Social media that actually brings clients. Content strategy, daily posts, community management, analytics."
    >
      <Hero
        category="Social Media"
        name="Medialy"
        tagline="Social media that actually brings clients."
        subline="Content strategy, daily posting, engagement management, monthly analytics — and the discipline to show up every day."
        primaryCta={{ label: "See Packages", href: "#packages" }}
        secondaryCta={{ label: "Start Assessment", href: "/medialy/assessment" }}
      />

      <Section
        eyebrow="Problem"
        title="You post twice. You go silent. You wonder why it's not working."
        subtitle="You're not lazy. You're just doing your actual job."
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {[
            { t: "No posting rhythm", b: "Three posts one week. Silent for a month. Then guilt. Then another burst. The algorithm gave up on you two cycles ago." },
            { t: "No content ideas that convert", b: "Motivational quotes don't sell anything. You know this. But you don't have hours to think about what does." },
            { t: "Followers don't mean clients", b: "1,200 followers. Zero inbox messages about services. Something is wrong, but you don't know what to fix." },
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

      <Section eyebrow="Solution" title="A content team that shows up every day" narrow>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          {[
            "Monthly content strategy + calendar",
            "Daily posts across chosen platforms",
            "Stories, reels, short-form video",
            "Caption writing + hashtag research",
            "Community management (replies, DMs)",
            "Monthly performance analytics",
            "Influencer + collaboration outreach",
            "Paid ads management (optional)",
          ].map((item, i) => (
            <li key={i} style={{
              padding: "12px 16px", backgroundColor: "#FFFFFF", borderRadius: 12,
              border: "1px solid #00000008", fontSize: 14,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ color: "#1E3A8A", fontWeight: 700 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Packages" title="From setup to full management">
        <div id="packages" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, alignItems: "stretch",
        }}>
          <PackageCard
            name="Setup"
            price="₦50,000"
            cadence="one-time"
            features={[
              "2-platform profile setup",
              "Content strategy document",
              "10 post templates",
              "1-hour training session",
              "Branded profile assets",
            ]}
            onSelect={{ label: "Get Setup", href: "/medialy/assessment?tier=a" }}
          />
          <PackageCard
            name="Manage"
            price="₦150,000"
            cadence="/ month"
            features={[
              "20 posts / month",
              "Daily stories",
              "Community management",
              "Monthly analytics report",
              "2 platforms",
            ]}
            onSelect={{ label: "Start Manage", href: "/medialy/assessment?tier=b" }}
          />
          <PackageCard
            name="Accelerate"
            price="₦300,000"
            cadence="/ month"
            popular
            features={[
              "40 posts across 3 platforms",
              "8 reels / TikToks monthly",
              "Influencer outreach",
              "Competitor analysis",
              "Biweekly strategy calls",
            ]}
            onSelect={{ label: "Accelerate", href: "/medialy/assessment?tier=c" }}
          />
          <PackageCard
            name="Authority"
            price="₦500,000"
            cadence="/ month"
            features={[
              "All 5+ platforms",
              "Paid ads management",
              "₦100k ad spend included",
              "Advanced analytics",
              "Dedicated social strategist",
            ]}
            onSelect={{ label: "Build Authority", href: "/medialy/assessment?tier=d" }}
          />
        </div>
      </Section>

      <FinalCta
        headline="Let consistency do the heavy lifting."
        subline="Tell us your business and audience. We'll build the posting rhythm that turns followers into clients."
        cta={{ label: "Start Medialy Assessment", href: "/medialy/assessment" }}
      />
    </PublicShell>
  );
}
