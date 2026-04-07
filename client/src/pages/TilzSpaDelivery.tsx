import { useEffect, useRef, useState, useCallback } from "react";
import PageMeta from "@/components/PageMeta";
import {
  ChevronDown, FileText, BookOpen, Globe, User, ClipboardList,
  Share2, Rocket, LayoutDashboard, DollarSign, CalendarCheck,
  MessageSquare, CreditCard, Phone, MapPin, Lock, Play,
  ArrowRight, Star, Shield, TrendingUp, Camera, Repeat, Headphones,
  Download, ExternalLink, Eye,
} from "lucide-react";

// ── BRAND COLOURS ───────────────────────────────────────────────────────────
const C = {
  chocolate: "#3C2415",
  cappuccino: "#C4A882",
  roseGold: "#B76E79",
  gold: "#D4AF6F",
  cream: "#F5F0E8",
  ivory: "#FAF7F2",
  white: "#FFFFFF",
};

// ── KEYFRAMES (injected once) ───────────────────────────────────────────────
const STYLE_ID = "tilz-delivery-keyframes";
function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes tdFadeInUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tdFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes tdSlideInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tdSlideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes tdPulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.4; }
    }
    @keyframes tdBounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(8px); }
    }
    @keyframes tdScaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes tdShimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes tdGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(212,175,111,0.15); }
      50%      { box-shadow: 0 0 40px rgba(212,175,111,0.3); }
    }
  `;
  document.head.appendChild(style);
}

// ── SCROLL-REVEAL HOOK ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── STAGGERED CARD REVEAL HOOK ──────────────────────────────────────────────
function useStaggerReveal(count: number, threshold = 0.1) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          for (let i = 0; i < count; i++) {
            setTimeout(() => setVisibleIndices(prev => new Set(prev).add(i)), i * 120);
          }
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [count, threshold]);
  return { containerRef, visibleIndices };
}

// ── DELIVERABLES DATA ───────────────────────────────────────────────────────
const DELIVERABLES = [
  { icon: FileText, title: "Brand Strategy", desc: "Your brand DNA, mission, vision, positioning", action: "Download", href: "#", type: "download" as const },
  { icon: BookOpen, title: "Brand Guidelines", desc: "Logo rules, colours, typography, voice", action: "Download", href: "#", type: "download" as const },
  { icon: Globe, title: "Website", desc: "Your live verified client site on hamzury.com", action: "View", href: "/clients/tilz-spa", type: "link" as const },
  { icon: User, title: "Founder Page", desc: "Your personal founder story", action: "View", href: "/clients/tilz-spa/founder", type: "link" as const },
  { icon: ClipboardList, title: "Operations Manual", desc: "Daily SOPs, booking flow, hygiene protocols", action: "Download", href: "#", type: "download" as const },
  { icon: Share2, title: "Social Media Kit", desc: "Instagram/TikTok/WhatsApp content strategy", action: "Download", href: "#", type: "download" as const },
  { icon: Rocket, title: "Launch & Growth Plan", desc: "30-day launch roadmap + influencer strategy", action: "Download", href: "#", type: "download" as const },
  { icon: LayoutDashboard, title: "Founder Dashboard", desc: "Your CEO control room", action: "Open", href: "/clients/tilz-spa/dashboard/founder", type: "link" as const },
  { icon: DollarSign, title: "Finance Dashboard", desc: "Revenue, expenses, P&L reports", action: "Open", href: "/clients/tilz-spa/dashboard/finance", type: "link" as const },
  { icon: CalendarCheck, title: "Receptionist Dashboard", desc: "Front desk: bookings, check-ins, walk-ins", action: "Open", href: "/clients/tilz-spa/dashboard/receptionist", type: "link" as const },
  { icon: MessageSquare, title: "WhatsApp Automation", desc: "Auto-replies, booking, scheduling", action: "Open", href: "/clients/tilz-spa/dashboard/whatsapp", type: "link" as const },
];

// ── UPSELL DATA ─────────────────────────────────────────────────────────────
const UPSELLS = [
  { icon: MapPin, title: "Google Business Profile Setup", desc: "Get found on Google Maps", price: "₦80,000" },
  { icon: Camera, title: "Instagram Management", desc: "3 months of content creation & growth", price: "₦400,000" },
  { icon: Headphones, title: "Staff Training", desc: "Customer service & spa operations training", price: "₦150,000" },
  { icon: Shield, title: "CCTV & Security System", desc: "Protect your investment", price: "₦250,000" },
  { icon: Repeat, title: "Loyalty Program System", desc: "Keep clients coming back", price: "₦120,000" },
  { icon: TrendingUp, title: "Monthly Retainer", desc: "Ongoing tech support & updates", price: "₦50,000/mo" },
];

const WA_HAMZURY = "https://wa.me/2348067149356";

// ── SECTION WRAPPER ─────────────────────────────────────────────────────────
function Section({ children, bg = C.white, id, noPadTop }: {
  children: React.ReactNode; bg?: string; id?: string; noPadTop?: boolean;
}) {
  const { ref, visible } = useReveal(0.08);
  return (
    <section
      id={id}
      ref={ref}
      style={{
        background: bg,
        padding: noPadTop ? "0 24px 100px" : "100px 24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

// ── GOLD DIVIDER ────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{
      width: 60,
      height: 2,
      background: `linear-gradient(90deg, ${C.gold}, ${C.cappuccino})`,
      margin: "40px auto",
      borderRadius: 1,
    }} />
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TilzSpaDelivery() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const deliverableStagger = useStaggerReveal(DELIVERABLES.length, 0.05);
  const upsellStagger = useStaggerReveal(UPSELLS.length, 0.08);

  useEffect(() => {
    injectKeyframes();
    document.documentElement.style.scrollBehavior = "smooth";
    setTimeout(() => setHeroLoaded(true), 200);
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);

  const sectionTitle = useCallback((text: string, color = C.chocolate): React.CSSProperties => ({
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 700,
    color,
    textAlign: "center" as const,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    marginBottom: 16,
  }), []);

  const sectionSub = useCallback((color = C.cappuccino): React.CSSProperties => ({
    fontSize: "clamp(15px, 2.5vw, 18px)",
    color,
    textAlign: "center" as const,
    lineHeight: 1.7,
    maxWidth: 600,
    margin: "0 auto 48px",
  }), []);

  return (
    <>
      <PageMeta
        title="Tilz Spa by Tilda — Brand Delivery | HAMZURY"
        description="Your complete brand package, delivered with care by HAMZURY."
      />

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO — "Your Brand is Ready"
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: C.cream,
        position: "relative",
        overflow: "hidden",
        padding: "40px 24px",
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.gold}10 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{
          opacity: heroLoaded ? 1 : 0,
          transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
          transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Small HAMZURY badge */}
          <div style={{
            opacity: heroLoaded ? 1 : 0,
            transition: "opacity 1.5s ease 0.3s",
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: C.cappuccino,
            marginBottom: 48,
            fontWeight: 500,
          }}>
            Delivered by HAMZURY
          </div>

          {/* Logo text */}
          <h1 style={{
            fontSize: "clamp(48px, 10vw, 96px)",
            fontWeight: 300,
            color: C.chocolate,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: 8,
          }}>
            Tilz Spa
          </h1>
          <p style={{
            fontSize: "clamp(16px, 3vw, 22px)",
            color: C.cappuccino,
            fontStyle: "italic",
            fontWeight: 300,
            letterSpacing: "0.05em",
            marginBottom: 48,
          }}>
            by Tilda
          </p>

          {/* Main headline */}
          <h2 style={{
            fontSize: "clamp(24px, 4.5vw, 40px)",
            fontWeight: 600,
            color: C.chocolate,
            marginBottom: 20,
            letterSpacing: "-0.01em",
          }}>
            Your Brand is Ready
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(14px, 2.5vw, 18px)",
            color: C.roseGold,
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}>
            Prepared exclusively for Oge Matilda
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: heroLoaded ? 0.6 : 0,
          transition: "opacity 1.5s ease 1s",
          animation: "tdBounce 2s ease-in-out infinite",
          cursor: "pointer",
        }}
          onClick={() => document.getElementById("welcome")?.scrollIntoView({ behavior: "smooth" })}
        >
          <ChevronDown size={28} color={C.cappuccino} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. WELCOME MESSAGE
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.white} id="welcome">
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 300,
            color: C.chocolate,
            marginBottom: 32,
            fontStyle: "italic",
          }}>
            Dear Tilda,
          </p>
          <p style={{
            fontSize: "clamp(15px, 2.5vw, 18px)",
            lineHeight: 2,
            color: "#5a4a3a",
            marginBottom: 24,
          }}>
            Thank you for trusting HAMZURY with your vision. What you are about to explore
            is not just a collection of files — it is the complete foundation of your brand,
            meticulously crafted to position Tilz Spa as the premium wellness destination
            in Abuja.
          </p>
          <p style={{
            fontSize: "clamp(15px, 2.5vw, 18px)",
            lineHeight: 2,
            color: "#5a4a3a",
            marginBottom: 24,
          }}>
            Every logo placement, every colour choice, every word in your operations manual
            was designed with one goal: to make Tilz Spa unforgettable.
          </p>
          <p style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: C.cappuccino,
            fontWeight: 500,
            letterSpacing: "0.03em",
          }}>
            Scroll down to unbox everything inside.
          </p>
          <GoldDivider />
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. WHAT'S INSIDE — Delivery Manifest
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.ivory} id="deliverables">
        <h2 style={sectionTitle("What's Inside")}>What's Inside</h2>
        <p style={sectionSub()}>
          Your complete brand architecture — 11 deliverables, one unified vision.
        </p>

        <div
          ref={deliverableStagger.containerRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {DELIVERABLES.map((d, i) => {
            const isVisible = deliverableStagger.visibleIndices.has(i);
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                style={{
                  background: C.white,
                  borderRadius: 16,
                  padding: "32px 28px",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(24px)",
                  transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
                  border: `1px solid ${C.cream}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.cream}, ${C.ivory})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon size={22} color={C.gold} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: C.chocolate,
                    marginBottom: 6,
                  }}>
                    {d.title}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: "#8a7a6a",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>
                    {d.desc}
                  </p>
                </div>
                <a
                  href={d.href}
                  style={{
                    marginTop: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.roseGold,
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                  }}
                >
                  {d.type === "download" ? <Download size={14} /> : <ExternalLink size={14} />}
                  {d.action}
                </a>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. BRAND MOCKUPS — Visual Preview
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.white} id="mockups">
        <h2 style={sectionTitle("Your Brand in Action")}>Your Brand in Action</h2>
        <p style={sectionSub()}>
          See how Tilz Spa looks across every touchpoint.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 40,
          marginTop: 20,
        }}>
          {/* ── Business Card Front ─────────────────── */}
          <MockupWrapper label="Business Card — Front">
            <div style={{
              width: "100%",
              aspectRatio: "3.5/2",
              background: C.chocolate,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "0 8px 32px rgba(60,36,21,0.2)",
            }}>
              <span style={{
                fontSize: 28,
                fontWeight: 300,
                color: C.cream,
                letterSpacing: "0.08em",
              }}>
                Tilz Spa
              </span>
              <span style={{
                fontSize: 12,
                color: C.cappuccino,
                fontStyle: "italic",
                letterSpacing: "0.12em",
              }}>
                by Tilda
              </span>
              <div style={{
                width: 30,
                height: 1,
                background: C.gold,
                marginTop: 8,
              }} />
            </div>
          </MockupWrapper>

          {/* ── Business Card Back ──────────────────── */}
          <MockupWrapper label="Business Card — Back">
            <div style={{
              width: "100%",
              aspectRatio: "3.5/2",
              background: C.cream,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 8px 32px rgba(60,36,21,0.1)",
              border: `1px solid ${C.cappuccino}30`,
              padding: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={13} color={C.chocolate} />
                <span style={{ fontSize: 13, color: C.chocolate }}>08172371818</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={13} color={C.chocolate} />
                <span style={{ fontSize: 13, color: C.chocolate }}>Wuse 2, Abuja</span>
              </div>
              <div style={{
                width: 30,
                height: 1,
                background: C.cappuccino,
                marginTop: 4,
              }} />
              <span style={{
                fontSize: 10,
                color: C.cappuccino,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}>
                Premium Wellness
              </span>
            </div>
          </MockupWrapper>

          {/* ── Instagram Post Mockup ──────────────── */}
          <MockupWrapper label="Instagram Post">
            <div style={{
              width: "100%",
              maxWidth: 280,
              margin: "0 auto",
              background: C.white,
              borderRadius: 20,
              border: "3px solid #222",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
            }}>
              {/* Status bar */}
              <div style={{
                height: 24,
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  width: 50,
                  height: 5,
                  background: "#333",
                  borderRadius: 10,
                }} />
              </div>
              {/* Header */}
              <div style={{
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: "1px solid #eee",
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: C.chocolate,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{ fontSize: 10, color: C.cream, fontWeight: 700 }}>TS</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>tilzspa</span>
              </div>
              {/* Image area */}
              <div style={{
                aspectRatio: "1/1",
                background: `linear-gradient(135deg, ${C.chocolate} 0%, ${C.roseGold} 100%)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}>
                <span style={{
                  fontSize: 24,
                  fontWeight: 300,
                  color: C.cream,
                  letterSpacing: "0.06em",
                }}>
                  Tilz Spa
                </span>
                <span style={{
                  fontSize: 11,
                  color: C.gold,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}>
                  Now Open
                </span>
              </div>
              {/* Caption */}
              <div style={{ padding: "10px 12px" }}>
                <p style={{ fontSize: 11, color: "#333", lineHeight: 1.5 }}>
                  <strong>tilzspa</strong> Your body deserves luxury. Book your first session today.
                </p>
              </div>
            </div>
          </MockupWrapper>

          {/* ── WhatsApp Status Mockup ─────────────── */}
          <MockupWrapper label="WhatsApp Status">
            <div style={{
              width: "100%",
              maxWidth: 280,
              margin: "0 auto",
              background: "#111",
              borderRadius: 20,
              border: "3px solid #222",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}>
              <div style={{
                height: 24,
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  width: 50,
                  height: 5,
                  background: "#333",
                  borderRadius: 10,
                }} />
              </div>
              {/* Progress bar */}
              <div style={{ padding: "8px 12px 0" }}>
                <div style={{
                  height: 2,
                  background: "#333",
                  borderRadius: 1,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: "60%",
                    height: "100%",
                    background: C.white,
                    borderRadius: 1,
                  }} />
                </div>
              </div>
              {/* Content */}
              <div style={{
                aspectRatio: "9/14",
                background: `linear-gradient(160deg, ${C.roseGold} 0%, ${C.chocolate} 100%)`,
                margin: 8,
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 24,
              }}>
                <span style={{
                  fontSize: 26,
                  fontWeight: 300,
                  color: C.cream,
                  letterSpacing: "0.06em",
                }}>
                  Tilz Spa
                </span>
                <div style={{
                  width: 40,
                  height: 1,
                  background: C.gold,
                }} />
                <span style={{
                  fontSize: 13,
                  color: C.cream,
                  textAlign: "center",
                  lineHeight: 1.6,
                  opacity: 0.9,
                }}>
                  Premium Spa &amp; Wellness
                </span>
                <span style={{
                  fontSize: 11,
                  color: C.gold,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginTop: 8,
                }}>
                  Wuse 2, Abuja
                </span>
              </div>
            </div>
          </MockupWrapper>

          {/* ── Letterhead Mockup ──────────────────── */}
          <MockupWrapper label="Letterhead">
            <div style={{
              width: "100%",
              aspectRatio: "210/297",
              maxHeight: 420,
              background: C.white,
              borderRadius: 4,
              border: `1px solid ${C.cream}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <span style={{
                  fontSize: 20,
                  fontWeight: 300,
                  color: C.chocolate,
                  letterSpacing: "0.08em",
                }}>
                  Tilz Spa
                </span>
                <div style={{
                  fontSize: 9,
                  color: C.cappuccino,
                  fontStyle: "italic",
                  marginTop: 2,
                }}>
                  by Tilda
                </div>
              </div>
              <div style={{
                height: 2,
                background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
                marginBottom: 24,
              }} />
              {/* Body lines */}
              {[100, 85, 92, 78, 95, 60].map((w, i) => (
                <div key={i} style={{
                  height: 6,
                  width: `${w}%`,
                  background: C.cream,
                  borderRadius: 3,
                  marginBottom: 10,
                }} />
              ))}
              <div style={{ flex: 1 }} />
              {/* Footer */}
              <div style={{
                borderTop: `1px solid ${C.cream}`,
                paddingTop: 10,
                display: "flex",
                justifyContent: "center",
                gap: 16,
                fontSize: 8,
                color: C.cappuccino,
              }}>
                <span>08172371818</span>
                <span>Wuse 2, Abuja</span>
                <span>tilzspa.com</span>
              </div>
            </div>
          </MockupWrapper>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. LOGIN CREDENTIALS
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.ivory} id="credentials">
        <h2 style={sectionTitle("Your Login Credentials")}>Your Login Credentials</h2>
        <p style={sectionSub()}>
          Access your dashboards securely with these credentials.
        </p>

        <div style={{
          background: C.white,
          borderRadius: 20,
          padding: "40px 32px",
          maxWidth: 640,
          margin: "0 auto",
          boxShadow: "0 4px 24px rgba(60,36,21,0.06)",
          border: `1px solid ${C.cream}`,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
            justifyContent: "center",
          }}>
            <Lock size={18} color={C.gold} />
            <span style={{
              fontSize: 13,
              color: C.cappuccino,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              Confidential
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
            }}>
              <thead>
                <tr>
                  {["Dashboard", "Email", "Password"].map(h => (
                    <th key={h} style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      borderBottom: `2px solid ${C.cream}`,
                      color: C.chocolate,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Founder", "founder@tilzspa.com", "TilzSpa@2026"],
                  ["Finance", "finance@tilzspa.com", "TilzSpa@2026"],
                  ["Receptionist", "reception@tilzspa.com", "TilzSpa@2026"],
                  ["WhatsApp", "founder@tilzspa.com", "TilzSpa@2026"],
                ].map(([dash, email, pw], i) => (
                  <tr key={dash}>
                    <td style={{
                      padding: "14px 16px",
                      borderBottom: `1px solid ${C.cream}`,
                      fontWeight: 600,
                      color: C.chocolate,
                    }}>{dash}</td>
                    <td style={{
                      padding: "14px 16px",
                      borderBottom: `1px solid ${C.cream}`,
                      color: "#6a5a4a",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}>{email}</td>
                    <td style={{
                      padding: "14px 16px",
                      borderBottom: `1px solid ${C.cream}`,
                      color: "#6a5a4a",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}>{pw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{
            marginTop: 24,
            fontSize: 12,
            color: C.roseGold,
            textAlign: "center",
            fontWeight: 500,
          }}>
            Keep these credentials safe. Do not share outside your team.
          </p>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. VIDEO WALKTHROUGH
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.white} id="walkthrough">
        <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.gold}20, ${C.roseGold}20)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <Play size={28} color={C.gold} />
          </div>

          <h2 style={{
            ...sectionTitle(),
            marginBottom: 16,
          }}>
            Your Personal Brand Walkthrough
          </h2>
          <p style={{
            fontSize: "clamp(15px, 2.5vw, 17px)",
            color: "#6a5a4a",
            lineHeight: 1.8,
            marginBottom: 36,
          }}>
            Our team will walk you through every deliverable in a 30-minute video call.
            We will explain how to use each dashboard, review your brand guidelines,
            and answer any questions you may have.
          </p>

          <a
            href="https://wa.me/2348067149356?text=Hello%20HAMZURY%2C%20I'd%20like%20to%20schedule%20my%20Tilz%20Spa%20brand%20walkthrough%20call"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 36px",
              background: C.chocolate,
              color: C.cream,
              borderRadius: 50,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              boxShadow: "0 4px 20px rgba(60,36,21,0.2)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(60,36,21,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(60,36,21,0.2)";
            }}
          >
            <CalendarCheck size={18} />
            Schedule Your Walkthrough
          </a>

          <p style={{
            marginTop: 20,
            fontSize: 14,
            color: C.cappuccino,
          }}>
            Or call us: <a href="tel:08067149356" style={{ color: C.chocolate, fontWeight: 600, textDecoration: "none" }}>08067149356</a>
          </p>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          7. UPSELL — "What's Next for Tilz Spa?"
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.ivory} id="upsell">
        <h2 style={sectionTitle("What's Next for Tilz Spa?")}>What's Next for Tilz Spa?</h2>
        <p style={sectionSub()}>
          Premium services to take your business even further.
        </p>

        <div
          ref={upsellStagger.containerRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {UPSELLS.map((u, i) => {
            const isVisible = upsellStagger.visibleIndices.has(i);
            const Icon = u.icon;
            return (
              <div
                key={u.title}
                style={{
                  background: C.white,
                  borderRadius: 16,
                  padding: "32px 28px",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
                  border: `1px solid ${C.cream}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.gold}15, ${C.roseGold}15)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon size={22} color={C.roseGold} strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.chocolate,
                }}>
                  {u.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: "#8a7a6a",
                  lineHeight: 1.6,
                }}>
                  {u.desc}
                </p>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.gold,
                  marginTop: 4,
                }}>
                  {u.price}
                </div>
                <a
                  href={`${WA_HAMZURY}?text=${encodeURIComponent(`Hello HAMZURY, I'm interested in ${u.title} for Tilz Spa. Please share more details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.roseGold,
                    textDecoration: "none",
                    paddingTop: 8,
                  }}
                >
                  Learn More <ArrowRight size={14} />
                </a>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          8. TRACK YOUR PROJECT
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.white} id="track">
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
          <h2 style={sectionTitle("Track Your Project")}>Track Your Project</h2>
          <p style={{
            fontSize: "clamp(15px, 2.5vw, 17px)",
            color: "#6a5a4a",
            lineHeight: 1.8,
            marginBottom: 32,
          }}>
            Track your project progress anytime using your reference number.
          </p>

          <div style={{
            background: C.ivory,
            borderRadius: 16,
            padding: "28px 32px",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            border: `1px solid ${C.cream}`,
          }}>
            <span style={{
              fontSize: 12,
              color: C.cappuccino,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              Reference Number
            </span>
            <span style={{
              fontSize: 28,
              fontWeight: 700,
              color: C.chocolate,
              letterSpacing: "0.04em",
              fontFamily: "monospace",
            }}>
              HMZ-26/4-1818
            </span>
          </div>

          <div style={{ marginTop: 28 }}>
            <a
              href="/client/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 32px",
                background: "transparent",
                color: C.chocolate,
                borderRadius: 50,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                border: `2px solid ${C.chocolate}`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = C.chocolate;
                (e.currentTarget as HTMLElement).style.color = C.cream;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = C.chocolate;
              }}
            >
              <Eye size={16} />
              Check Status
            </a>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          9. INVOICE SUMMARY
      ═══════════════════════════════════════════════════════════════════ */}
      <Section bg={C.ivory} id="invoice">
        <h2 style={sectionTitle("Invoice Summary")}>Invoice Summary</h2>
        <p style={sectionSub()}>
          A transparent breakdown of your project investment.
        </p>

        <div style={{
          background: C.white,
          borderRadius: 20,
          padding: "40px 32px",
          maxWidth: 560,
          margin: "0 auto",
          boxShadow: "0 4px 24px rgba(60,36,21,0.06)",
          border: `1px solid ${C.cream}`,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}>
            <CreditCard size={20} color={C.gold} />
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.chocolate,
            }}>
              Full Business Architecture (Phase 1)
            </span>
          </div>

          {[
            { label: "Total Project Cost", value: "₦1,200,000", bold: true },
            { label: "Paid (March 2026)", value: "₦500,000", color: "#4a8a5a" },
            { label: "Founder Contribution", value: "₦200,000", color: C.gold },
            { label: "Balance Due", value: "₦500,000", color: C.roseGold },
          ].map((row, i) => (
            <div key={row.label} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 0",
              borderBottom: i < 3 ? `1px solid ${C.cream}` : "none",
            }}>
              <span style={{
                fontSize: 14,
                color: "#6a5a4a",
              }}>
                {row.label}
              </span>
              <span style={{
                fontSize: row.bold ? 20 : 16,
                fontWeight: 700,
                color: row.color || C.chocolate,
              }}>
                {row.value}
              </span>
            </div>
          ))}

          <div style={{
            marginTop: 24,
            padding: "16px 20px",
            background: `${C.gold}10`,
            borderRadius: 12,
            borderLeft: `3px solid ${C.gold}`,
          }}>
            <p style={{
              fontSize: 13,
              color: "#6a5a4a",
              lineHeight: 1.7,
            }}>
              <strong style={{ color: C.chocolate }}>₦200,000</strong> contributed by HAMZURY Founder
              <strong style={{ color: C.chocolate }}> Muhammad Hamzury</strong> towards your project.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════════
          10. FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer style={{
        background: C.chocolate,
        padding: "80px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {/* Tilz Spa text */}
          <p style={{
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 300,
            color: C.cream,
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}>
            Tilz Spa <span style={{ fontStyle: "italic", fontSize: "0.6em", color: C.cappuccino }}>by Tilda</span>
          </p>

          <GoldDivider />

          {/* Verified badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: `${C.gold}15`,
            borderRadius: 50,
            marginBottom: 28,
          }}>
            <Star size={14} color={C.gold} fill={C.gold} />
            <span style={{
              fontSize: 12,
              color: C.gold,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              HAMZURY Verified Client
            </span>
          </div>

          <p style={{
            fontSize: 15,
            color: C.cappuccino,
            lineHeight: 1.8,
            marginBottom: 32,
          }}>
            Built with precision. Delivered with pride.
          </p>

          {/* HAMZURY logo text */}
          <p style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: `${C.cappuccino}80`,
            marginBottom: 8,
          }}>
            HAMZURY
          </p>

          <p style={{
            fontSize: 12,
            color: `${C.cappuccino}60`,
          }}>
            &copy; 2026 HAMZURY. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

// ── MOCKUP WRAPPER ──────────────────────────────────────────────────────────
function MockupWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <p style={{
        fontSize: 12,
        color: C.cappuccino,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight: 600,
        marginBottom: 16,
        textAlign: "center",
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}
