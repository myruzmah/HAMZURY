/**
 * HAMZURY — Homepage
 * "Built to Last." Apple-minimal. Navy / Brown / Cream.
 *
 * Keeps two essentials from the old home:
 *   1. Client reference lookup (enter HMZ-YY/M-XXXX → /client/dashboard)
 *   2. Staff login (subtle toggle, same pattern the team already knows)
 */
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import PageMeta from "@/components/PageMeta";
import { PUBLIC, TYPE, RADIUS, SHADOW, DIVISIONS, CONTACT, BRAND_TAGLINE } from "@/brand";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  /* ── Track / staff-login state (preserved from legacy home) ── */
  const [ref, setRef] = useState("");
  const [staffMode, setStaffMode] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [staffPw, setStaffPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const lookupClient = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const clean = ref.trim().toUpperCase();
    if (!clean) { setMsg("Enter your reference number."); return; }
    try { localStorage.setItem("hamzury_client_ref", clean); } catch {}
    setLocation("/client/dashboard");
  };

  const staffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ staffId: staffId.trim(), password: staffPw }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || "Login failed."); setLoading(false); return; }
      setLocation(data.dashboard || "/");
    } catch (err) {
      setMsg("Network error. Try again.");
      setLoading(false);
    }
  };

  const scrollToTrack = () => trackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: PUBLIC.cream, color: PUBLIC.dark,
      fontFamily: TYPE.body, fontSize: 16, lineHeight: 1.6,
    }}>
      <PageMeta
        title="HAMZURY — Digital Infrastructure for Nigerian Businesses"
        description="Tax handled. Website working. Social media growing. Team trained. Everything your business needs. Under one roof."
      />

      {/* ─── NAV ─── */}
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
            <span style={{ fontFamily: TYPE.display, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>
              HAMZURY
            </span>
          </Link>
          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {DIVISIONS.map(d => (
              <Link key={d.key} href={d.path} style={{
                fontSize: 13, color: PUBLIC.dark, textDecoration: "none", fontWeight: 500,
              }}>{d.name}</Link>
            ))}
            {isAuthenticated && user ? (
              <button onClick={logout} style={{
                fontSize: 12, color: PUBLIC.muted, background: "transparent", border: "none",
                cursor: "pointer",
              }}>Sign out</button>
            ) : null}
            <button onClick={scrollToTrack} style={{
              fontSize: 13, color: PUBLIC.white, backgroundColor: PUBLIC.navy,
              padding: "8px 16px", borderRadius: RADIUS.pill, fontWeight: 500,
              border: "none", cursor: "pointer",
            }}>
              Track / Sign in
            </button>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section style={{
        padding: "120px 24px 80px", maxWidth: 1100, margin: "0 auto", textAlign: "center",
      }}>
        <p style={{
          fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 16,
        }}>{BRAND_TAGLINE}</p>
        <h1 style={{
          fontFamily: TYPE.display,
          fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 700,
          lineHeight: 1.02, letterSpacing: -2, color: PUBLIC.dark,
          marginBottom: 24,
        }}>
          Digital infrastructure for<br/>Nigerian businesses.
        </h1>
        <p style={{
          fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.55,
          color: PUBLIC.muted, maxWidth: 640, margin: "0 auto 40px",
        }}>
          Tax handled. Website working. Social media growing. Team trained.
          <br/>Everything your business needs. Under one roof.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#divisions" style={{
            padding: "14px 28px", borderRadius: RADIUS.pill,
            backgroundColor: PUBLIC.navy, color: PUBLIC.white,
            fontSize: 15, fontWeight: 500, textDecoration: "none",
          }}>
            Explore Services <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle", marginLeft: 6 }} />
          </a>
          <Link href="/contact" style={{
            padding: "14px 28px", borderRadius: RADIUS.pill,
            backgroundColor: "transparent", color: PUBLIC.dark,
            fontSize: 15, fontWeight: 500, textDecoration: "none",
            border: `1px solid ${PUBLIC.dark}25`,
          }}>
            Talk to Us
          </Link>
        </div>
      </section>

      {/* ─── 4 DIVISIONS GRID ─── */}
      <section id="divisions" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{
            fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
          }}>Four divisions</p>
          <h2 style={{
            fontFamily: TYPE.display, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.1, color: PUBLIC.dark,
          }}>
            One standard. Every service.
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {DIVISIONS.map(d => (
            <Link key={d.key} href={d.path} style={{
              display: "block", padding: "36px 32px",
              backgroundColor: PUBLIC.white, borderRadius: RADIUS.lg,
              border: `1px solid ${PUBLIC.hairline}`,
              boxShadow: SHADOW.card, textDecoration: "none",
              color: PUBLIC.dark, transition: "transform 0.2s",
            }}>
              <p style={{
                fontSize: 11, color: PUBLIC.navy, fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10,
              }}>{d.category}</p>
              <h3 style={{
                fontFamily: TYPE.display, fontSize: 28, fontWeight: 700,
                letterSpacing: -0.5, marginBottom: 10,
              }}>{d.name}</h3>
              <p style={{ fontSize: 15, color: PUBLIC.muted, lineHeight: 1.55, marginBottom: 18 }}>
                {d.tagline}
              </p>
              <span style={{ fontSize: 13, color: PUBLIC.navy, fontWeight: 500 }}>
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: "80px 24px", backgroundColor: PUBLIC.white }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <p style={{
            fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
          }}>How it works</p>
          <h2 style={{
            fontFamily: TYPE.display, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.1, marginBottom: 56,
          }}>
            Simple process.
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
          }}>
            {[
              { n: "01", t: "You tell us what you need", b: "One form, five minutes." },
              { n: "02", t: "We create a plan", b: "Clear scope, clear price." },
              { n: "03", t: "You approve", b: "No surprises, no pressure." },
              { n: "04", t: "We deliver", b: "On schedule. Built to last." },
            ].map(s => (
              <div key={s.n} style={{ textAlign: "left" }}>
                <p style={{
                  fontFamily: TYPE.display, fontSize: 36, fontWeight: 700,
                  color: PUBLIC.navy, letterSpacing: -1, marginBottom: 12,
                }}>{s.n}</p>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{s.t}</p>
                <p style={{ fontSize: 14, color: PUBLIC.muted, lineHeight: 1.6 }}>{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY HAMZURY ─── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontSize: 12, color: PUBLIC.navy, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12,
            }}>Why HAMZURY</p>
            <h2 style={{
              fontFamily: TYPE.display, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700,
              letterSpacing: -0.8, lineHeight: 1.1,
            }}>
              {BRAND_TAGLINE}
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}>
            {[
              {
                t: "One standard",
                b: "Same quality across every division. You don't discover a weak link three months in.",
              },
              {
                t: "Real team",
                b: "Full-time staff, not gig contractors. The person who answers your first call is still there at month twelve.",
              },
              {
                t: "Nigerian context",
                b: "We understand Nigerian business because we operate one. FIRS, CAC, NAFDAC — it's home, not research.",
              },
            ].map((c, i) => (
              <div key={i} style={{
                padding: "32px 28px", backgroundColor: PUBLIC.white,
                borderRadius: RADIUS.lg, border: `1px solid ${PUBLIC.hairline}`,
              }}>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{c.t}</p>
                <p style={{ fontSize: 14, color: PUBLIC.muted, lineHeight: 1.7 }}>{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRACK / STAFF LOGIN ─── */}
      <section ref={trackRef} id="track" style={{
        padding: "96px 24px",
        backgroundColor: PUBLIC.white, borderTop: `1px solid ${PUBLIC.hairline}`,
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          {/* subtle staff-mode toggle */}
          <button
            onClick={() => { setStaffMode(s => !s); setMsg(null); }}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 11, color: PUBLIC.muted, textTransform: "uppercase",
              letterSpacing: "0.15em", marginBottom: 18, opacity: 0.6,
            }}
          >
            {staffMode ? "Back to tracking" : "Staff?"}
          </button>

          {!staffMode ? (
            <>
              <h2 style={{
                fontFamily: TYPE.display, fontSize: 28, fontWeight: 700,
                letterSpacing: -0.6, marginBottom: 8,
              }}>
                Track your project.
              </h2>
              <p style={{ fontSize: 14, color: PUBLIC.muted, marginBottom: 28 }}>
                Enter your reference number. You'll land on your client dashboard.
              </p>
              <form onSubmit={lookupClient} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={ref}
                  onChange={e => setRef(e.target.value)}
                  placeholder="HMZ-26/4-XXXX"
                  style={{
                    flex: 1, minWidth: 220, padding: "12px 16px",
                    border: `1px solid ${PUBLIC.hairline}`, borderRadius: RADIUS.pill,
                    fontSize: 14, outline: "none", backgroundColor: PUBLIC.white,
                    fontFamily: "monospace",
                  }}
                />
                <button type="submit" style={{
                  padding: "12px 24px", borderRadius: RADIUS.pill,
                  backgroundColor: PUBLIC.navy, color: PUBLIC.white,
                  fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                }}>
                  Track →
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 style={{
                fontFamily: TYPE.display, fontSize: 28, fontWeight: 700,
                letterSpacing: -0.6, marginBottom: 8,
              }}>
                Staff sign-in.
              </h2>
              <p style={{ fontSize: 14, color: PUBLIC.muted, marginBottom: 28 }}>
                Use your HAMZURY email + password.
              </p>
              <form onSubmit={staffLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                  placeholder="your-name@hamzury.com"
                  style={{
                    padding: "12px 16px", border: `1px solid ${PUBLIC.hairline}`,
                    borderRadius: RADIUS.md, fontSize: 14, outline: "none",
                    backgroundColor: PUBLIC.white,
                  }}
                />
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={staffPw}
                    onChange={e => setStaffPw(e.target.value)}
                    placeholder="password"
                    style={{
                      width: "100%", padding: "12px 40px 12px 16px",
                      border: `1px solid ${PUBLIC.hairline}`, borderRadius: RADIUS.md,
                      fontSize: 14, outline: "none", backgroundColor: PUBLIC.white, boxSizing: "border-box",
                    }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: PUBLIC.muted,
                  }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button type="submit" disabled={loading} style={{
                  padding: "12px 24px", borderRadius: RADIUS.pill,
                  backgroundColor: PUBLIC.navy, color: PUBLIC.white,
                  fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Sign in
                </button>
              </form>
            </>
          )}

          {msg && (
            <p style={{
              marginTop: 14, fontSize: 12, color: "#C2410C",
              padding: "8px 12px", backgroundColor: "#FED7AA40", borderRadius: RADIUS.sm,
              display: "inline-block",
            }}>{msg}</p>
          )}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={{
        padding: "96px 24px", backgroundColor: PUBLIC.navy,
        color: PUBLIC.white, textAlign: "center",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: TYPE.display, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700,
            letterSpacing: -0.8, lineHeight: 1.1, color: PUBLIC.white, marginBottom: 14,
          }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 18, color: `${PUBLIC.white}CC`, lineHeight: 1.6, marginBottom: 32 }}>
            Pick a service. Fill a form. We'll take it from there.
          </p>
          <a href="#divisions" style={{
            padding: "14px 32px", borderRadius: RADIUS.pill,
            backgroundColor: PUBLIC.white, color: PUBLIC.navy,
            fontSize: 15, fontWeight: 600, textDecoration: "none", display: "inline-block",
          }}>
            Start here →
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
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
                {BRAND_TAGLINE}<br/>Digital infrastructure for Nigerian businesses.
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
                {CONTACT.hours.weekdays}<br/>{CONTACT.hours.saturday}
              </p>
            </div>
          </div>
          <div style={{
            paddingTop: 24, borderTop: `1px solid ${PUBLIC.hairline}`,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
          }}>
            <p style={{ fontSize: 12, color: PUBLIC.muted }}>© {new Date().getFullYear()} HAMZURY. All rights reserved.</p>
            <p style={{ fontSize: 12, color: PUBLIC.muted }}>{CONTACT.general}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <p style={{
        fontSize: 11, color: PUBLIC.muted, textTransform: "uppercase",
        letterSpacing: 0.06, fontWeight: 600, marginBottom: 10,
      }}>{title}</p>
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
