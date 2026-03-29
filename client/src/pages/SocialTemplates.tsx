import { useState } from "react";
import PageMeta from "@/components/PageMeta";

const DEPARTMENTS = ["General", "BizDoc", "Systemise", "Skills"] as const;
type Department = (typeof DEPARTMENTS)[number];

const COLORS: Record<Department, { primary: string; accent: string; bg: string; text: string }> = {
  General: { primary: "#1A1A1A", accent: "#2D2D2D", bg: "#FFFAF6", text: "#1A1A1A" },
  BizDoc: { primary: "#1B4D3E", accent: "#1B4D3E", bg: "#FFFAF6", text: "#1B4D3E" },
  Systemise: { primary: "#2563EB", accent: "#2563EB", bg: "#FFFAF6", text: "#2563EB" },
  Skills: { primary: "#1E3A5F", accent: "#1E3A5F", bg: "#FFFAF6", text: "#1E3A5F" },
};

const GOLD = "#B48C4C";
const MILK = "#FFFAF6";

interface SlideData {
  render: (colors: typeof COLORS.General) => React.ReactNode;
}

function SlideFrame({ children, colors, index }: { children: React.ReactNode; colors: typeof COLORS.General; index: number }) {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          aspectRatio: "1 / 1",
          background: colors.primary,
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        }}
      >
        {children}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 8,
          fontSize: 13,
          color: "#2D2D2D",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        Slide {index + 1} of 5
      </div>
    </div>
  );
}

/* ─── GENERAL SLIDES ─── */
const generalSlides: SlideData[] = [
  {
    // Cover
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 32, fontWeight: 500 }}>HAMZURY</div>
        <div style={{ fontSize: 36, fontWeight: 300, lineHeight: 1.2, marginBottom: 24, letterSpacing: "-0.01em" }}>Position first.<br />Then scale.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 24 }} />
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "#2D2D2D", fontWeight: 300, maxWidth: "90%" }}>
          Documentation. Digital systems. Training. Everything your business needs to operate, compete, and grow.
        </div>
      </div>
    ),
  },
  {
    // Problem / Pillars
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 32, fontWeight: 500 }}>HAMZURY</div>
        <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 40 }}>Three Departments.<br />One Mission.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { name: "BizDoc", desc: "Registration. Compliance. Licensing." },
            { name: "Systemise", desc: "Brand. Website. Automation." },
            { name: "Skills", desc: "Training. Development. Community." },
          ].map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, marginTop: 8, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{d.name}</div>
                <div style={{ fontSize: 13, color: "#2D2D2D", fontWeight: 300 }}>{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    // Quote
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>HAMZURY</div>
        <div style={{ width: 24, height: 1, background: GOLD, marginBottom: 32 }} />
        <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", marginBottom: 32, color: MILK }}>
          "We do not build businesses for people. We build the systems that let people build businesses that last."
        </div>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 500, letterSpacing: "0.05em" }}>
          Muhammad Hamzury, Founder
        </div>
      </div>
    ),
  },
  {
    // Stats
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>HAMZURY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          {[
            { num: "5", label: "Years" },
            { num: "100+", label: "Businesses" },
            { num: "15", label: "Team Members" },
            { num: "3", label: "Departments" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 40, fontWeight: 300, color: GOLD, lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "#2D2D2D", fontWeight: 400, letterSpacing: "0.02em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    // CTA
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>HAMZURY</div>
        <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3, marginBottom: 32 }}>Your business deserves<br />better infrastructure.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 32 }} />
        <div style={{ fontSize: 15, color: GOLD, fontWeight: 500, letterSpacing: "0.02em" }}>hamzury.com</div>
      </div>
    ),
  },
];

/* ─── BIZDOC SLIDES ─── */
const bizdocSlides: SlideData[] = [
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 32, fontWeight: 500 }}>BIZDOC</div>
        <div style={{ fontSize: 36, fontWeight: 300, lineHeight: 1.2, marginBottom: 24, letterSpacing: "-0.01em" }}>Your business<br />needs protection.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 24 }} />
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(250,250,248,0.6)", fontWeight: 300, maxWidth: "90%" }}>
          Registration. Compliance. Licensing. We handle the paperwork so you focus on growth.
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: MILK, color: c.primary }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: c.primary, marginBottom: 40, fontWeight: 500, opacity: 0.5 }}>BIZDOC</div>
        <div style={{ fontSize: 48, fontWeight: 300, color: c.primary, lineHeight: 1.1, marginBottom: 16 }}>80%</div>
        <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.5, color: c.primary }}>
          of businesses in Nigeria operate with incomplete documentation.
        </div>
        <div style={{ width: 40, height: 1, background: GOLD, marginTop: 32 }} />
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 44px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 28, fontWeight: 500 }}>BIZDOC / SERVICES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            "Business Registration (CAC)",
            "Tax Compliance (FIRS, SIRS)",
            "Industry Licenses (NAFDAC, SON, DPR)",
            "Trademark and IP Protection",
            "Contracts, Legal and SCUML",
            "Full Business Setup (Foreign and Local)",
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
              <div style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.4 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>BIZDOC / TRACK RECORD</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {[
            { num: "5", label: "Years" },
            { num: "100+", label: "Businesses Documented" },
            { num: "0", label: "Clients Penalised" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 40, fontWeight: 300, color: GOLD, lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "rgba(250,250,248,0.6)", fontWeight: 400, letterSpacing: "0.02em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>BIZDOC</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.4, marginBottom: 32 }}>Get compliant.<br />Stay protected.<br />Grow faster.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 32 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, color: GOLD, fontWeight: 500 }}>hamzury.com/bizdoc</div>
          <div style={{ fontSize: 13, color: "rgba(250,250,248,0.5)", fontWeight: 300 }}>08067149356</div>
        </div>
      </div>
    ),
  },
];

/* ─── SYSTEMISE SLIDES ─── */
const systemiseSlides: SlideData[] = [
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 32, fontWeight: 500 }}>SYSTEMISE</div>
        <div style={{ fontSize: 32, fontWeight: 300, lineHeight: 1.2, marginBottom: 24, letterSpacing: "-0.01em" }}>Your business needs<br />a system. Not more effort.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 24 }} />
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(250,250,248,0.6)", fontWeight: 300, maxWidth: "90%" }}>
          Brand. Website. Automation. Social media. We build the digital infrastructure that runs without you.
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 48px", background: MILK, color: c.primary, textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: c.primary, marginBottom: 40, fontWeight: 500, opacity: 0.5 }}>SYSTEMISE</div>
        <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.4 }}>
          You are the system.
        </div>
        <div style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.4, marginTop: 8 }}>
          That is the problem.
        </div>
        <div style={{ width: 40, height: 1, background: GOLD, marginTop: 36 }} />
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 44px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 28, fontWeight: 500 }}>SYSTEMISE / SERVICES</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {["Brand Identity", "Websites", "Social Media", "Automation", "Podcasts", "Growth Strategy"].map((s) => (
            <div key={s} style={{ padding: "16px 0", borderBottom: "1px solid rgba(250,250,248,0.08)" }}>
              <div style={{ fontSize: 15, fontWeight: 300 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 36, fontWeight: 500 }}>SYSTEMISE / PROCESS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {[
            { step: "01", label: "Discovery" },
            { step: "02", label: "Blueprint" },
            { step: "03", label: "Build" },
            { step: "04", label: "Launch" },
          ].map((s) => (
            <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ fontSize: 13, color: GOLD, fontWeight: 500, width: 24 }}>{s.step}</div>
              <div style={{ fontSize: 20, fontWeight: 300 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>SYSTEMISE</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.4, marginBottom: 32 }}>Stop running your<br />business manually.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 32 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, color: GOLD, fontWeight: 500 }}>hamzury.com/systemise</div>
          <div style={{ fontSize: 13, color: "rgba(250,250,248,0.5)", fontWeight: 300 }}>09130700056</div>
        </div>
      </div>
    ),
  },
];

/* ─── SKILLS SLIDES ─── */
const skillsSlides: SlideData[] = [
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 32, fontWeight: 500 }}>SKILLS</div>
        <div style={{ fontSize: 34, fontWeight: 300, lineHeight: 1.2, marginBottom: 24, letterSpacing: "-0.01em" }}>Learn from operators.<br />Not theorists.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 24 }} />
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(250,250,248,0.6)", fontWeight: 300, maxWidth: "90%" }}>
          Practical training programs built by people who run real businesses.
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 48px", background: MILK, color: c.primary, textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: c.primary, marginBottom: 40, fontWeight: 500, opacity: 0.5 }}>SKILLS</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.5 }}>
          Your degree prepared you<br />for a job. Not for business.
        </div>
        <div style={{ width: 40, height: 1, background: GOLD, marginTop: 36 }} />
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "52px 44px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 28, fontWeight: 500 }}>SKILLS / PROGRAMS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            "Business Essentials",
            "Digital Marketing",
            "Tech and IT Training",
            "CEO Development",
            "AI-Powered Learning",
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
              <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.4 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 32, fontWeight: 500 }}>SKILLS / RIDI</div>
        <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.5, marginBottom: 32, color: "rgba(250,250,248,0.8)" }}>
          Free tech training for underserved communities.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <div style={{ fontSize: 40, fontWeight: 300, color: GOLD, lineHeight: 1, marginBottom: 6 }}>28</div>
            <div style={{ fontSize: 13, color: "rgba(250,250,248,0.5)", fontWeight: 400 }}>Communities</div>
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 300, color: GOLD, lineHeight: 1, marginBottom: 6 }}>200+</div>
            <div style={{ fontSize: 13, color: "rgba(250,250,248,0.5)", fontWeight: 400 }}>Students</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    render: (c) => (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", background: c.primary, color: MILK }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 40, fontWeight: 500 }}>SKILLS</div>
        <div style={{ fontSize: 24, fontWeight: 300, lineHeight: 1.4, marginBottom: 32 }}>Stop waiting.<br />Start building skills<br />that pay.</div>
        <div style={{ width: 40, height: 1, background: GOLD, marginBottom: 32 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 14, color: GOLD, fontWeight: 500 }}>hamzury.com/skills</div>
          <div style={{ fontSize: 13, color: "rgba(250,250,248,0.5)", fontWeight: 300 }}>09130700056</div>
        </div>
      </div>
    ),
  },
];

const ALL_SLIDES: Record<Department, SlideData[]> = {
  General: generalSlides,
  BizDoc: bizdocSlides,
  Systemise: systemiseSlides,
  Skills: skillsSlides,
};

export default function SocialTemplates() {
  const [active, setActive] = useState<Department>("General");
  const colors = COLORS[active];
  const slides = ALL_SLIDES[active];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F7", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <PageMeta title="Social Media Templates — HAMZURY" description="Internal social media content templates for HAMZURY departments." canonical="https://hamzury.com/templates" />
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E5E5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "#2D2D2D", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Internal: Social Media Templates
          </div>
          <div style={{ fontSize: 24, fontWeight: 300, color: "#1A1A1A", letterSpacing: "-0.01em" }}>
            Carousel Templates
          </div>
          <div style={{ fontSize: 13, color: "#2D2D2D", marginTop: 4, fontWeight: 300 }}>
            1080 x 1080 — Instagram / LinkedIn format — screenshot each slide to export
          </div>
        </div>
      </div>

      {/* Department Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E5E5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0 }}>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept}
              onClick={() => setActive(dept)}
              style={{
                padding: "14px 24px",
                fontSize: 14,
                fontWeight: active === dept ? 500 : 400,
                color: active === dept ? COLORS[dept].primary : "#2D2D2D",
                background: "none",
                border: "none",
                borderBottom: active === dept ? `2px solid ${COLORS[dept].primary}` : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Slides Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 480px), 1fr))",
            gap: 32,
          }}
        >
          {slides.map((slide, i) => (
            <SlideFrame key={`${active}-${i}`} colors={colors} index={i}>
              {slide.render(colors)}
            </SlideFrame>
          ))}
        </div>
      </div>
    </div>
  );
}
