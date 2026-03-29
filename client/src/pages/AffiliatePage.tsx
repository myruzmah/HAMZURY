import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageMeta from "../components/PageMeta";
import { BRAND } from "../lib/brand";
import { saveAffiliateSession } from "../lib/affiliateSession";
import {
  Link2,
  Megaphone,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Medal,
  ShieldCheck,
  Star,
  Gem,
} from "lucide-react";

const TEAL = "#B48C4C";   // Affiliate uses gold as primary
const GOLD = "#B48C4C";
const MILK = "#FFFAF6";   // Milk white
const WHITE = "#FFFFFF";
const TEXT = "#1A1A1A";

// ─── Tier data ──────────────────────────────────────────────────────────────
const TIERS = [
  {
    label: "Elite",
    icon: <Gem size={28} color={GOLD} />,
    range: "Top 10 affiliates",
    commission: "15%",
    highlight: true,
  },
  {
    label: "Premier",
    icon: <Star size={28} color="#3B82F6" />,
    range: "Rank 11–20",
    commission: "12%",
    highlight: false,
  },
  {
    label: "Standard",
    icon: <Medal size={28} color="#16A34A" />,
    range: "Rank 21–30",
    commission: "10%",
    highlight: false,
  },
  {
    label: "Entry",
    icon: <Medal size={28} color="#6B7280" />,
    range: "Rank 31–40",
    commission: "8%",
    highlight: false,
  },
  {
    label: "Waiting Pool",
    icon: <ShieldCheck size={28} color="#94A3B8" />,
    range: "Rank 41–50",
    commission: "₦1K flat",
    highlight: false,
  },
];

// ─── Terms data ───────────────────────────────────────────────────────────
const TERMS = [
  "Commissions are paid 30 days after client payment confirmation",
  "Minimum withdrawal: ₦10,000",
  "Referrals must complete at least 70% deposit to qualify",
  "Self-referrals are not allowed",
  "HAMZURY reserves the right to verify all referrals",
  "Commission rates are subject to change with 30-day notice",
  "Affiliates must not misrepresent HAMZURY services",
  "Fraudulent referrals result in immediate termination",
];

// ─── Procedures data ─────────────────────────────────────────────────────
const PROCEDURES = [
  "Fill the registration form below or contact the CSO office",
  "Receive your unique affiliate code and dashboard access",
  "Access marketing materials from your dashboard",
  "Track referrals and earnings in real-time",
  "Request withdrawals once you hit ₦10,000 minimum",
];

export default function AffiliatePage() {
  const [, navigate] = useLocation();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Tab: "login" | "register"
  const [tab, setTab] = useState<"login" | "register">("login");

  // Scroll-to-login ref
  const formRef = useRef<HTMLDivElement>(null);

  const login = trpc.affiliate.login.useMutation({
    onSuccess: async (data: Record<string, unknown>) => {
      saveAffiliateSession(data);
      // Also set server-side cookie session for persistence
      try {
        await fetch("/api/affiliate-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: email.trim(), password }),
        });
      } catch { /* best-effort */ }
      navigate("/affiliate/dashboard");
    },
    onError: (err: { message?: string }) => {
      setError(err.message || "Invalid credentials. Please try again.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    login.mutate({ email: email.trim(), password });
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) return;
    setRegSuccess(true);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div style={{ background: WHITE, minHeight: "100vh", color: TEXT }}>
      <PageMeta
        title="Affiliate Program — HAMZURY Innovation Hub"
        description="Join the HAMZURY Affiliate Program. Earn 8–15% commission for every business you refer to us."
      />

      {/* ────────────────────────────── SECTION 1 — HERO ─────────────────────────────── */}
      <section
        style={{ background: TEAL }}
        className="relative overflow-hidden"
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(180,140,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(180,140,76,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <Link href="/">
            <span
              className="text-xs font-bold tracking-[0.3em] cursor-pointer inline-block mb-8"
              style={{ color: GOLD, textTransform: "uppercase" }}
            >
              HAMZURY Innovation Hub
            </span>
          </Link>

          <h1
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ color: WHITE }}
          >
            Earn While You{" "}
            <span style={{ color: GOLD }}>Refer</span>
          </h1>

          <p
            className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Join the HAMZURY Affiliate Program and earn commissions for every
            business you refer to us. The more you refer, the more you earn.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setTab("register");
                scrollToForm();
              }}
              className="px-8 py-4 rounded-lg font-semibold text-sm transition hover:opacity-90"
              style={{ background: GOLD, color: TEAL }}
            >
              Join Now — Apply
            </button>
            <button
              onClick={() => {
                setTab("login");
                scrollToForm();
              }}
              className="px-8 py-4 rounded-lg font-semibold text-sm transition"
              style={{
                background: "transparent",
                border: `1.5px solid rgba(180,140,76,0.5)`,
                color: GOLD,
              }}
            >
              Already a member? Login ↓
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── SECTION 2 — HOW IT WORKS ─────────────────────── */}
      <section style={{ background: WHITE }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: TEAL }}
            >
              How It Works
            </h2>
            <p className="text-sm" style={{ color: "#777" }}>
              Three simple steps to start earning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Link2 size={32} color={GOLD} />,
                step: "01",
                title: "Get Your Link",
                desc: "Register and receive your unique referral link and affiliate code instantly.",
              },
              {
                icon: <Megaphone size={32} color={GOLD} />,
                step: "02",
                title: "Share It",
                desc: "Share with entrepreneurs, business owners, and your professional network.",
              },
              {
                icon: <DollarSign size={32} color={GOLD} />,
                step: "03",
                title: "Earn",
                desc: "Earn commission for every confirmed client referral — paid directly to you.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center text-center p-8 rounded-2xl"
                style={{ background: MILK, border: `1px solid #EDE8DF` }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${TEAL}12` }}
                >
                  {item.icon}
                </div>
                <span
                  className="text-xs font-bold tracking-widest mb-2"
                  style={{ color: GOLD }}
                >
                  STEP {item.step}
                </span>
                <h3 className="text-lg font-semibold mb-2" style={{ color: TEAL }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── SECTION 3 — TIERS ────────────────────────────── */}
      <section style={{ background: MILK }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3" style={{ color: TEAL }}>
              Your Earning Tiers
            </h2>
            <p className="text-sm" style={{ color: "#777" }}>
              Grow your referrals, unlock higher commissions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {TIERS.map((tier) => (
              <div
                key={tier.label}
                className="rounded-2xl p-6 flex flex-col items-center text-center transition"
                style={{
                  background: WHITE,
                  border: tier.highlight
                    ? `2px solid ${GOLD}`
                    : "1.5px solid #EDE8DF",
                  boxShadow: tier.highlight
                    ? `0 4px 24px ${GOLD}30`
                    : "0 1px 8px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {tier.highlight && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: GOLD, color: TEAL }}
                  >
                    Most Popular
                  </span>
                )}
                <div className="mb-3 mt-2">{tier.icon}</div>
                <h3 className="text-lg font-bold mb-1" style={{ color: TEAL }}>
                  {tier.label}
                </h3>
                <p className="text-xs mb-3" style={{ color: "#888" }}>
                  {tier.range}
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: tier.highlight ? GOLD : TEAL }}
                >
                  {tier.commission}
                </p>
                <p className="text-xs mt-1" style={{ color: "#999" }}>
                  per deal
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── SECTION 4 — TERMS ────────────────────────────── */}
      <section style={{ background: WHITE }} className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: TEAL }}>
              Affiliate Terms
            </h2>
            <p className="text-sm" style={{ color: "#777" }}>
              Please read before applying
            </p>
          </div>

          <div className="space-y-3">
            {TERMS.map((term, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: MILK, border: "1px solid #EDE8DF" }}
              >
                <CheckCircle2
                  size={18}
                  color={GOLD}
                  className="flex-shrink-0 mt-0.5"
                />
                <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                  {term}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── SECTION 5 — PROCEDURES ──────────────────────── */}
      <section style={{ background: MILK }} className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: TEAL }}>
              How to Apply
            </h2>
            <p className="text-sm" style={{ color: "#777" }}>
              Getting started is easy
            </p>
          </div>

          <div className="space-y-4">
            {PROCEDURES.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-2xl"
                style={{ background: WHITE, border: "1.5px solid #EDE8DF" }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: TEAL, color: GOLD }}
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed pt-1" style={{ color: TEXT }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── SECTION 6 — LOGIN / REGISTER ────────────────── */}
      <section
        ref={formRef}
        style={{ background: WHITE }}
        className="py-20"
      >
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-8">
            <ShieldCheck size={36} color={GOLD} className="mx-auto mb-3" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: TEAL }}>
              Affiliate Portal — Member Access
            </h2>
            <p className="text-sm" style={{ color: "#777" }}>
              Sign in to your account or submit a registration request
            </p>
          </div>

          {/* Tab Toggle */}
          <div
            className="flex rounded-xl overflow-hidden mb-6"
            style={{ border: `1.5px solid #E8E3DC` }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-3 text-sm font-semibold transition"
                style={{
                  background: tab === t ? TEAL : WHITE,
                  color: tab === t ? WHITE : "#888",
                }}
              >
                {t === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <div
            className="rounded-2xl shadow-lg p-8"
            style={{ background: WHITE, border: `1px solid #E8E3DC` }}
          >
            {/* ── Login Form ── */}
            {tab === "login" && (
              <>
                <p className="text-sm mb-6" style={{ color: "#777" }}>
                  Sign in to view your referrals, commissions, and marketing assets.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium mb-1"
                      style={{ color: TEXT }}
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition"
                      style={{
                        border: `1.5px solid ${error ? "#DC2626" : "#D5CFC6"}`,
                        background: "#FFFAF6",
                        color: TEXT,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = TEAL)}
                      onBlur={(e) =>
                        (e.target.style.borderColor = error ? "#DC2626" : "#D5CFC6")
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium mb-1"
                      style={{ color: TEXT }}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none transition"
                      style={{
                        border: `1.5px solid ${error ? "#DC2626" : "#D5CFC6"}`,
                        background: "#FFFAF6",
                        color: TEXT,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = TEAL)}
                      onBlur={(e) =>
                        (e.target.style.borderColor = error ? "#DC2626" : "#D5CFC6")
                      }
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={login.isPending}
                    className="w-full py-3 rounded-lg text-sm font-semibold transition"
                    style={{
                      background: login.isPending ? "#6B8E84" : TEAL,
                      color: WHITE,
                      cursor: login.isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    {login.isPending ? "Signing in…" : "Sign In"}
                  </button>
                </form>

                <p className="text-xs mt-6 text-center" style={{ color: "#999" }}>
                  Not registered yet?{" "}
                  <button
                    onClick={() => setTab("register")}
                    style={{ color: TEAL }}
                    className="underline"
                  >
                    Apply here
                  </button>{" "}
                  or contact{" "}
                  <a
                    href="mailto:partnerships@hamzury.com"
                    style={{ color: TEAL }}
                    className="underline"
                  >
                    partnerships@hamzury.com
                  </a>
                </p>
              </>
            )}

            {/* ── Register Form ── */}
            {tab === "register" && (
              <>
                {regSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle2 size={48} color={GOLD} className="mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: TEAL }}>
                      Registration Request Sent!
                    </h3>
                    <p className="text-sm" style={{ color: "#777" }}>
                      Our team will review your application and reach out within
                      24–48 hours.
                    </p>
                    <button
                      onClick={() => setTab("login")}
                      className="mt-6 text-sm underline"
                      style={{ color: TEAL }}
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-6" style={{ color: "#777" }}>
                      Submit your details and we'll set up your affiliate account.
                    </p>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: TEXT }}
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                          style={{
                            border: "1.5px solid #D5CFC6",
                            background: "#FFFAF6",
                            color: TEXT,
                          }}
                          onFocus={(e) => (e.target.style.borderColor = TEAL)}
                          onBlur={(e) => (e.target.style.borderColor = "#D5CFC6")}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: TEXT }}
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                          style={{
                            border: "1.5px solid #D5CFC6",
                            background: "#FFFAF6",
                            color: TEXT,
                          }}
                          onFocus={(e) => (e.target.style.borderColor = TEAL)}
                          onBlur={(e) => (e.target.style.borderColor = "#D5CFC6")}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium mb-1"
                          style={{ color: TEXT }}
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+234 800 000 0000"
                          required
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                          style={{
                            border: "1.5px solid #D5CFC6",
                            background: "#FFFAF6",
                            color: TEXT,
                          }}
                          onFocus={(e) => (e.target.style.borderColor = TEAL)}
                          onBlur={(e) => (e.target.style.borderColor = "#D5CFC6")}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-lg text-sm font-semibold transition hover:opacity-90"
                        style={{ background: TEAL, color: WHITE }}
                      >
                        Submit Registration Request
                      </button>
                    </form>

                    <p className="text-xs mt-5 text-center" style={{ color: "#999" }}>
                      Already have an account?{" "}
                      <button
                        onClick={() => setTab("login")}
                        style={{ color: TEAL }}
                        className="underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{ background: TEAL, borderTop: `1px solid rgba(180,140,76,0.15)` }}
        className="py-8 text-center"
      >
        <Link href="/">
          <span
            className="text-sm font-bold tracking-widest cursor-pointer"
            style={{ color: GOLD, letterSpacing: "0.2em" }}
          >
            HAMZURY
          </span>
        </Link>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
          &copy; {new Date().getFullYear()} HAMZURY Innovation Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
