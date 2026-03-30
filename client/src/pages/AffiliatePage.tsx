import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import PageMeta from "../components/PageMeta";
import { BRAND } from "../lib/brand";
import { saveAffiliateSession } from "../lib/affiliateSession";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";
const WHITE    = "#FFFFFF";

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

  // Tab
  const [tab, setTab] = useState<"login" | "register">("login");

  // Scroll ref
  const formRef = useRef<HTMLDivElement>(null);

  const login = trpc.affiliate.login.useMutation({
    onSuccess: async (data: Record<string, unknown>) => {
      saveAffiliateSession(data);
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

  const inputStyle = {
    border: "none",
    backgroundColor: `${CHARCOAL}04`,
    color: CHARCOAL,
    borderRadius: 12,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Affiliate Program \u2014 HAMZURY"
        description="Join the HAMZURY Affiliate Program. Earn 8\u201315% commission for every business you refer to us."
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50"
          style={{ color: CHARCOAL }}
        >
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[11px] font-normal tracking-[0.2em] uppercase" style={{ color: `${CHARCOAL}40` }}>
          Affiliate
        </span>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 md:pt-52 md:pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="text-[clamp(32px,5vw,52px)] font-light tracking-tight leading-[1.1] mb-5"
            style={{ color: CHARCOAL }}
          >
            Earn while you refer.
          </h1>
          <p className="text-[15px] font-light leading-relaxed max-w-md mx-auto mb-10" style={{ color: `${CHARCOAL}60` }}>
            Join the HAMZURY Affiliate Program. Earn commissions for every business you send our way.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setTab("register"); scrollToForm(); }}
              className="px-8 py-4 rounded-full text-[14px] font-medium tracking-tight transition-opacity duration-200 hover:opacity-80"
              style={{ backgroundColor: CHARCOAL, color: MILK }}
            >
              Apply now
            </button>
            <button
              onClick={() => { setTab("login"); scrollToForm(); }}
              className="px-8 py-4 rounded-full text-[14px] font-medium tracking-tight transition-opacity duration-200 hover:opacity-70"
              style={{ color: `${CHARCOAL}60` }}
            >
              Already a member? Sign in
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase mb-10 text-center" style={{ color: `${CHARCOAL}40` }}>
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Get your link", desc: "Register and receive your unique referral code." },
              { step: "02", title: "Share it", desc: "Share with entrepreneurs and business owners." },
              { step: "03", title: "Earn", desc: "Earn commission on every confirmed client." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <p className="text-[11px] font-medium tracking-wider mb-2" style={{ color: GOLD }}>{item.step}</p>
                <p className="text-[15px] font-semibold tracking-tight mb-2" style={{ color: CHARCOAL }}>{item.title}</p>
                <p className="text-[13px] font-light leading-relaxed" style={{ color: `${CHARCOAL}50` }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase mb-10 text-center" style={{ color: `${CHARCOAL}40` }}>
            Commission tiers
          </p>
          <div className="space-y-3">
            {[
              { label: "Elite", range: "Top 10", rate: "15%" },
              { label: "Premier", range: "Rank 11\u201320", rate: "12%" },
              { label: "Standard", range: "Rank 21\u201330", rate: "10%" },
              { label: "Entry", range: "Rank 31\u201340", rate: "8%" },
              { label: "Waiting Pool", range: "Rank 41\u201350", rate: "\u20A61K flat" },
            ].map((tier) => (
              <div
                key={tier.label}
                className="flex items-center justify-between px-6 py-5 rounded-[16px]"
                style={{ backgroundColor: WHITE, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div>
                  <p className="text-[15px] font-semibold tracking-tight" style={{ color: CHARCOAL }}>{tier.label}</p>
                  <p className="text-[12px] font-light mt-0.5" style={{ color: `${CHARCOAL}40` }}>{tier.range}</p>
                </div>
                <p className="text-[20px] font-light" style={{ color: GOLD }}>{tier.rate}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login / Register */}
      <section ref={formRef} className="py-24 md:py-32 px-6">
        <div className="max-w-sm mx-auto">
          <p className="text-[15px] font-semibold tracking-tight text-center mb-8" style={{ color: CHARCOAL }}>
            Affiliate portal
          </p>

          {/* Tab bar */}
          <div className="flex gap-1 mb-8 p-1 rounded-full" style={{ backgroundColor: `${CHARCOAL}06` }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-[13px] font-medium rounded-full transition-all duration-200"
                style={{
                  backgroundColor: tab === t ? WHITE : "transparent",
                  color: tab === t ? CHARCOAL : `${CHARCOAL}40`,
                  boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-5 py-4 text-[14px] font-light outline-none"
                style={inputStyle}
              />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-4 text-[14px] font-light outline-none"
                style={inputStyle}
              />

              {error && (
                <p className="text-[12px] px-4 py-2.5 rounded-xl" style={{ color: "#DC2626", backgroundColor: "#FEF2F2" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={login.isPending}
                className="w-full py-4 rounded-full text-[14px] font-medium transition-opacity duration-200 hover:opacity-80"
                style={{
                  backgroundColor: CHARCOAL,
                  color: MILK,
                  opacity: login.isPending ? 0.5 : 1,
                  cursor: login.isPending ? "not-allowed" : "pointer",
                }}
              >
                {login.isPending ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-[12px] text-center mt-4" style={{ color: `${CHARCOAL}40` }}>
                Not registered?{" "}
                <button onClick={() => setTab("register")} className="underline" style={{ color: CHARCOAL }}>
                  Apply here
                </button>
              </p>
            </form>
          )}

          {/* Register form */}
          {tab === "register" && (
            <>
              {regSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: GOLD }} />
                  <p className="text-[15px] font-semibold mb-2" style={{ color: CHARCOAL }}>
                    Application sent.
                  </p>
                  <p className="text-[13px] font-light" style={{ color: `${CHARCOAL}50` }}>
                    We will review your application and reach out within 24\u201348 hours.
                  </p>
                  <button
                    onClick={() => setTab("login")}
                    className="mt-6 text-[13px] underline"
                    style={{ color: CHARCOAL }}
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full name"
                    required
                    className="w-full px-5 py-4 text-[14px] font-light outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full px-5 py-4 text-[14px] font-light outline-none"
                    style={inputStyle}
                  />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Phone number"
                    required
                    className="w-full px-5 py-4 text-[14px] font-light outline-none"
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full text-[14px] font-medium transition-opacity duration-200 hover:opacity-80"
                    style={{ backgroundColor: CHARCOAL, color: MILK }}
                  >
                    Submit application
                  </button>
                  <p className="text-[12px] text-center mt-4" style={{ color: `${CHARCOAL}40` }}>
                    Already have an account?{" "}
                    <button onClick={() => setTab("login")} className="underline" style={{ color: CHARCOAL }}>
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
            HAMZURY
          </Link>
          <p className="text-[11px]" style={{ color: `${CHARCOAL}30` }}>
            &copy; {new Date().getFullYear()} HAMZURY Innovation Hub
          </p>
        </div>
      </footer>
    </div>
  );
}
