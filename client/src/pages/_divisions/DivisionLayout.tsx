/**
 * Shared layout used by the 4 division landing pages + the homepage.
 * Apple-minimal. Navy/Brown/Cream. "Built to Last".
 */
import { Link } from "wouter";
import { PUBLIC, TYPE, RADIUS, SHADOW, DIVISIONS, CONTACT, BRAND_TAGLINE } from "@/brand";
import PageMeta from "@/components/PageMeta";

export function PublicShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: PUBLIC.cream,
      color: PUBLIC.dark,
      fontFamily: TYPE.body,
      fontSize: 16,
      lineHeight: 1.6,
    }}>
      <PageMeta title={title} description={description} />
      <TopNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * NAV — minimal, Apple-style
 * ═══════════════════════════════════════════════════════════════════════ */
function TopNav() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      backgroundColor: `${PUBLIC.cream}F0`,
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${PUBLIC.hairline}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none", color: PUBLIC.dark,
        }}>
          <img src="/hamzury-mark.png" alt="HAMZURY" style={{ height: 28, width: "auto" }} />
          <span style={{
            fontFamily: TYPE.display, fontSize: 16, fontWeight: 700,
            letterSpacing: -0.2,
          }}>
            HAMZURY
          </span>
        </Link>
        <nav style={{
          display: "flex", gap: 28, alignItems: "center",
        }}>
          {DIVISIONS.map(d => (
            <Link
              key={d.key}
              href={d.path}
              style={{
                fontSize: 13, color: PUBLIC.dark, textDecoration: "none",
                fontWeight: 500, letterSpacing: -0.1,
              }}
            >{d.name}</Link>
          ))}
          <Link href="/contact" style={{
            fontSize: 13, color: PUBLIC.white,
            backgroundColor: PUBLIC.navy, textDecoration: "none",
            padding: "8px 16px", borderRadius: RADIUS.pill, fontWeight: 500,
          }}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * FOOTER
 * ═══════════════════════════════════════════════════════════════════════ */
function SiteFooter() {
  return (
    <footer style={{
      marginTop: 80,
      padding: "48px 24px 32px",
      borderTop: `1px solid ${PUBLIC.hairline}`,
      backgroundColor: PUBLIC.white,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 32, marginBottom: 32,
        }}>
          <div>
            <img src="/hamzury-mark.png" alt="HAMZURY" style={{ height: 28, marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: PUBLIC.muted, lineHeight: 1.7 }}>
              {BRAND_TAGLINE}<br/>
              Digital infrastructure for Nigerian businesses.
            </p>
          </div>
          <FooterCol title="Services" items={DIVISIONS.map(d => ({ label: d.name, href: d.path }))} />
          <FooterCol title="Company" items={[
            { label: "About", href: "/about" },
            { label: "Contact", href: "/contact" },
          ]} />
          <FooterCol title="Legal" items={[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ]} />
          <div>
            <p style={{ fontSize: 11, color: PUBLIC.muted, textTransform: "uppercase", letterSpacing: 0.06, fontWeight: 600, marginBottom: 10 }}>
              Office
            </p>
            <p style={{ fontSize: 13, color: PUBLIC.dark, lineHeight: 1.7 }}>
              {CONTACT.address}
            </p>
            <p style={{ fontSize: 12, color: PUBLIC.muted, marginTop: 8, lineHeight: 1.6 }}>
              {CONTACT.hours.weekdays}<br/>
              {CONTACT.hours.saturday}
            </p>
          </div>
        </div>
        <div style={{
          paddingTop: 24, borderTop: `1px solid ${PUBLIC.hairline}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
        }}>
          <p style={{ fontSize: 12, color: PUBLIC.muted }}>
            © {new Date().getFullYear()} HAMZURY. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: PUBLIC.muted }}>
            {CONTACT.general}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: PUBLIC.muted, textTransform: "uppercase", letterSpacing: 0.06, fontWeight: 600, marginBottom: 10 }}>
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(i => (
          <li key={i.href}>
            <Link href={i.href} style={{ fontSize: 13, color: PUBLIC.dark, textDecoration: "none" }}>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * REUSABLE PIECES for division landing pages
 * ═══════════════════════════════════════════════════════════════════════ */

export function Hero({
  category, name, tagline, subline, primaryCta, secondaryCta,
}: {
  category: string;
  name: string;
  tagline: string;
  subline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section style={{
      padding: "96px 24px 80px",
      maxWidth: 1200, margin: "0 auto",
      textAlign: "center",
    }}>
      <p style={{
        fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
      }}>{category}</p>
      <h1 style={{
        fontFamily: TYPE.display, fontSize: "clamp(40px, 6vw, 68px)",
        fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5,
        color: PUBLIC.dark, marginBottom: 18,
      }}>
        {name}
      </h1>
      <p style={{
        fontSize: "clamp(18px, 2.2vw, 22px)", lineHeight: 1.5,
        color: PUBLIC.dark, maxWidth: 640, margin: "0 auto 12px",
        fontWeight: 400, letterSpacing: -0.2,
      }}>
        {tagline}
      </p>
      {subline && (
        <p style={{
          fontSize: 16, color: PUBLIC.muted, maxWidth: 560, margin: "0 auto 36px",
          lineHeight: 1.6,
        }}>{subline}</p>
      )}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: subline ? 0 : 36 }}>
        {primaryCta && (
          <Link href={primaryCta.href} style={{
            padding: "14px 28px", borderRadius: RADIUS.pill,
            backgroundColor: PUBLIC.navy, color: PUBLIC.white,
            fontSize: 15, fontWeight: 500, textDecoration: "none",
            letterSpacing: -0.1,
          }}>
            {primaryCta.label} →
          </Link>
        )}
        {secondaryCta && (
          <Link href={secondaryCta.href} style={{
            padding: "14px 28px", borderRadius: RADIUS.pill,
            backgroundColor: "transparent", color: PUBLIC.dark,
            fontSize: 15, fontWeight: 500, textDecoration: "none",
            border: `1px solid ${PUBLIC.dark}20`, letterSpacing: -0.1,
          }}>
            {secondaryCta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export function Section({
  eyebrow, title, subtitle, children, bg, narrow,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  bg?: string;
  narrow?: boolean;
}) {
  return (
    <section style={{
      padding: "80px 24px",
      backgroundColor: bg || "transparent",
    }}>
      <div style={{
        maxWidth: narrow ? 800 : 1200, margin: "0 auto",
      }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          {eyebrow && (
            <p style={{
              fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
            }}>{eyebrow}</p>
          )}
          <h2 style={{
            fontFamily: TYPE.display,
            fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.1, color: PUBLIC.dark,
            marginBottom: subtitle ? 14 : 0,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{
              fontSize: 18, color: PUBLIC.muted, lineHeight: 1.6,
              maxWidth: 640, margin: "0 auto",
            }}>{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function PackageCard({
  name, price, cadence, features, popular, onSelect,
}: {
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  popular?: boolean;
  onSelect?: { label: string; href: string };
}) {
  return (
    <div style={{
      backgroundColor: PUBLIC.white,
      borderRadius: RADIUS.lg,
      padding: "32px 28px",
      border: `1px solid ${popular ? PUBLIC.navy : PUBLIC.hairline}`,
      boxShadow: popular ? SHADOW.raised : SHADOW.card,
      position: "relative",
      display: "flex", flexDirection: "column",
    }}>
      {popular && (
        <span style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          padding: "4px 12px", borderRadius: RADIUS.pill,
          backgroundColor: PUBLIC.navy, color: PUBLIC.white,
          fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.08,
        }}>
          Most Popular
        </span>
      )}
      <p style={{ fontSize: 14, fontWeight: 600, color: PUBLIC.dark, marginBottom: 8 }}>
        {name}
      </p>
      <p style={{
        fontFamily: TYPE.display, fontSize: 36, fontWeight: 700,
        color: PUBLIC.dark, letterSpacing: -1, lineHeight: 1,
      }}>
        {price}
      </p>
      {cadence && (
        <p style={{ fontSize: 12, color: PUBLIC.muted, marginTop: 4, marginBottom: 20 }}>
          {cadence}
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 24px", flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{
            fontSize: 14, color: PUBLIC.dark, lineHeight: 1.6,
            padding: "6px 0", display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{
              color: PUBLIC.navy, fontWeight: 700, flexShrink: 0, marginTop: 2,
            }}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {onSelect && (
        <a href={onSelect.href} style={{
          padding: "12px 20px", borderRadius: RADIUS.pill,
          backgroundColor: popular ? PUBLIC.navy : "transparent",
          color: popular ? PUBLIC.white : PUBLIC.dark,
          border: popular ? "none" : `1px solid ${PUBLIC.dark}25`,
          fontSize: 13, fontWeight: 500, textDecoration: "none", textAlign: "center",
          letterSpacing: -0.1,
        }}>
          {onSelect.label}
        </a>
      )}
    </div>
  );
}

export function FinalCta({
  headline, subline, cta,
}: {
  headline: string;
  subline: string;
  cta: { label: string; href: string };
}) {
  return (
    <section style={{
      padding: "96px 24px",
      backgroundColor: PUBLIC.navy,
      color: PUBLIC.white,
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{
          fontFamily: TYPE.display, fontSize: "clamp(30px, 4vw, 44px)",
          fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1,
          color: PUBLIC.white, marginBottom: 14,
        }}>
          {headline}
        </h2>
        <p style={{
          fontSize: 18, color: `${PUBLIC.white}CC`, lineHeight: 1.6,
          marginBottom: 32,
        }}>
          {subline}
        </p>
        <a href={cta.href} style={{
          padding: "14px 32px", borderRadius: RADIUS.pill,
          backgroundColor: PUBLIC.white, color: PUBLIC.navy,
          fontSize: 15, fontWeight: 600, textDecoration: "none",
          display: "inline-block", letterSpacing: -0.1,
        }}>
          {cta.label} →
        </a>
      </div>
    </section>
  );
}
