import { useState } from "react";
import { Link } from "wouter";
import { Loader2, CheckCircle, Menu, X, MessageSquare } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";

const ORANGE = "#E86A2E";
const GOLD   = "#B48C4C";   // RIDI primary
const CREAM  = "#FFFAF6";   // Milk white
const WHITE  = "#FFFFFF";
const DARK   = "#1A1A1A";

const SDG_BADGES = [
  { n: "SDG 4",  label: "Quality Education" },
  { n: "SDG 5",  label: "Gender Equality" },
  { n: "SDG 8",  label: "Decent Work" },
  { n: "SDG 9",  label: "Innovation" },
  { n: "SDG 10", label: "Reduced Inequalities" },
  { n: "SDG 11", label: "Sustainable Communities" },
  { n: "SDG 13", label: "Climate Action" },
];

const PROGRAMS = [
  {
    title: "Education & Digital Access",
    body: "We provide laptops, internet access, and structured digital literacy training so that rural youth are not left behind in a connected world.",
  },
  {
    title: "Climate & Sustainability",
    body: "Hands-on climate awareness sessions that equip communities with the knowledge and tools to adapt, respond, and build resilient livelihoods.",
  },
  {
    title: "Talent Identification & Sponsorship",
    body: "We actively scout high-potential individuals across underserved communities and sponsor their full education: tuition, transport, feeding, and stipend.",
  },
  {
    title: "Innovation & Entrepreneurship",
    body: "In partnership with Hamzury Innovation, we give scholars a structured pathway from skill to startup: idea validation, business fundamentals, and mentorship.",
  },
  {
    title: "Community Engagement & Unity",
    body: "Grassroots dialogue, town halls, and youth forums that build social cohesion and equip communities to advocate for their own development.",
  },
];

const IMPACT_STATS = [
  { value: "637",  label: "Beneficiaries Reached" },
  { value: "50",   label: "Scholars in Pilot Cohort" },
  { value: "100%", label: "Completion Rate" },
  { value: ">50%", label: "Female Participation" },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  community: string;
  program: string;
  situation: string;
  fundingTask: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  community: "",
  program: "",
  situation: "",
  fundingTask: "",
};

export default function RIDIPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  const applyMutation = trpc.skills.submitApplication.useMutation({
    onSuccess: (data: any) => {
      setReference(data?.ref ?? "HAM-0000-0000");
      setSubmitted(true);
      setSubmitError("");
    },
    onError: () => {
      setSubmitError("Something went wrong. Please try again or email ridi@hamzury.com.");
    },
  });

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    applyMutation.mutate({
      program: "RIDI Scholarship",
      pathway: "scholarship",
      fullName: form.name,
      email: form.email,
      phone: form.phone,
      businessDescription: `${form.community}. ${form.situation}`,
      biggestChallenge: form.fundingTask,
      pricingTier: "ridi",
      agreedToTerms: true,
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `1.5px solid ${DARK}18`,
    backgroundColor: WHITE,
    color: DARK,
    fontSize: "15px",
    fontWeight: 300,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  return (
    <div style={{ backgroundColor: CREAM, minHeight: "100vh", fontFamily: "inherit" }}>
      <PageMeta
        title="RIDI | Rural Innovation Development Initiative"
        description="RIDI is a registered non-profit identifying high-potential rural youth and removing every barrier between them and opportunity. Apply for sponsorship."
      />

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 h-14"
        style={{
          backgroundColor: `${CREAM}F0`,
          borderBottom: `1px solid ${DARK}0E`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <Link href="/">
          <span
            className="text-[15px] font-medium tracking-wide cursor-pointer"
            style={{ color: DARK, opacity: 0.75 }}
          >
            HAMZURY
          </span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: DARK }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {navMenuOpen && (
            <div
              className="absolute top-10 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
              style={{ backgroundColor: WHITE }}
              onClick={() => setNavMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setNavMenuOpen(false);
                  const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
                  if (btn) btn.click();
                }}
                className="flex items-center gap-2 px-3 py-3.5 rounded-xl w-full text-left mx-2"
                style={{ backgroundColor: "#B48C4C10", color: "#B48C4C" }}
              >
                <MessageSquare size={16} />
                <span className="text-[13px] font-medium">Chat with us</span>
              </button>
              <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: `${DARK}40` }}>Related</p>
              {[
                { label: "Hamzury Skills", href: "/skills" },
                { label: "Alumni",         href: "/alumni" },
                { label: "Training",       href: "/training" },
                { label: "Founder",        href: "/founder" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: DARK }}>
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="mx-4 my-1.5" style={{ height: 1, backgroundColor: `${DARK}0C` }} />
              <p className="px-5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: `${DARK}40` }}>Explore</p>
              {[
                { label: "Home",           href: "/" },
                { label: "BizDoc Consult", href: "/bizdoc" },
                { label: "Systemise",      href: "/systemise" },
                { label: "Pricing",        href: "/pricing" },
                { label: "Affiliate",      href: "/affiliate" },
                { label: "Team",           href: "/team" },
                { label: "Consultant",     href: "/consultant" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: DARK, opacity: 0.7 }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          backgroundColor: ORANGE,
          paddingTop: "140px",
          paddingBottom: "100px",
          paddingLeft: "24px",
          paddingRight: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: WHITE,
            opacity: 0.6,
            marginBottom: "24px",
          }}
        >
          RIDI · 2026
        </p>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 66px)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            color: WHITE,
            lineHeight: 1.12,
            maxWidth: "700px",
            margin: "0 auto 28px",
          }}
        >
          Turning rural talent into unstoppable founders.
        </h1>

        <p
          style={{
            fontSize: "17px",
            fontWeight: 300,
            color: WHITE,
            opacity: 0.75,
            maxWidth: "560px",
            margin: "0 auto 56px",
            lineHeight: 1.75,
          }}
        >
          A registered non-profit that identifies high-potential rural youth and removes every barrier between them and opportunity.
        </p>

        <div
          style={{
            display: "flex",
            gap: "48px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "637", label: "Beneficiaries" },
            { value: "100%", label: "Pilot Completion" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 300, color: WHITE, marginBottom: "4px", letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
              <p style={{ fontSize: "12px", fontWeight: 400, color: WHITE, opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is RIDI ── */}
      <section style={{ backgroundColor: CREAM, padding: "96px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 300,
              color: DARK,
              letterSpacing: "-0.02em",
              marginBottom: "28px",
              lineHeight: 1.25,
            }}
          >
            RIDI exists to unlock potential<br />where systems have failed.
          </h2>

          <p style={{ fontSize: "16px", fontWeight: 300, color: DARK, lineHeight: 1.85, marginBottom: "20px", opacity: 0.85 }}>
            Founded February 2026 and registered as a non-profit, RIDI operates a Full-Stack Enablement model. No partial support. Every scholar receives training, a device, transport, feeding, a stipend, and mentorship for the full programme.
          </p>

          <p style={{ fontSize: "15px", fontWeight: 300, color: DARK, lineHeight: 1.85, opacity: 0.6, marginBottom: "52px" }}>
            Our mission: unlock human potential through digital access, climate awareness, skills development, and structured opportunity. The next generation of innovators is already in your community. They just need a door opened.
          </p>

          {/* SDG strip */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {SDG_BADGES.map(b => (
              <div
                key={b.n}
                style={{
                  padding: "7px 14px",
                  borderRadius: "100px",
                  backgroundColor: `${ORANGE}12`,
                  border: `1px solid ${ORANGE}30`,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: ORANGE, letterSpacing: "0.05em" }}>{b.n}</span>
                <span style={{ fontSize: "11px", fontWeight: 300, color: DARK, opacity: 0.6 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section style={{ backgroundColor: WHITE, padding: "96px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: ORANGE, marginBottom: "12px" }}>
            PROGRAMMES
          </p>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: 300,
              color: DARK,
              letterSpacing: "-0.02em",
              marginBottom: "56px",
              lineHeight: 1.25,
            }}
          >
            Five pillars of intervention.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            {PROGRAMS.map((p, i) => (
              <div
                key={p.title}
                style={{
                  padding: "32px 28px",
                  borderRadius: "20px",
                  border: `1.5px solid ${DARK}0C`,
                  backgroundColor: CREAM,
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: ORANGE,
                    opacity: 0.5,
                    letterSpacing: "0.2em",
                    marginBottom: "14px",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p style={{ fontSize: "15px", fontWeight: 500, color: DARK, marginBottom: "12px", lineHeight: 1.3 }}>
                  {p.title}
                </p>
                <p style={{ fontSize: "13px", fontWeight: 300, color: DARK, opacity: 0.6, lineHeight: 1.75 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Numbers ── */}
      <section style={{ backgroundColor: `${ORANGE}12`, padding: "96px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: ORANGE, marginBottom: "48px" }}>
            IMPACT TO DATE
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "32px",
            }}
          >
            {IMPACT_STATS.map(s => (
              <div key={s.label}>
                <p
                  style={{
                    fontSize: "clamp(32px, 4vw, 48px)",
                    fontWeight: 300,
                    color: ORANGE,
                    letterSpacing: "-0.02em",
                    marginBottom: "8px",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: "12px", fontWeight: 400, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section style={{ backgroundColor: CREAM, padding: "96px 24px" }}>
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: ORANGE, marginBottom: "12px" }}>
            APPLY
          </p>
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 300,
              color: DARK,
              letterSpacing: "-0.02em",
              marginBottom: "14px",
              lineHeight: 1.25,
            }}
          >
            Apply for RIDI Sponsorship
          </h2>
          <p style={{ fontSize: "15px", fontWeight: 300, color: DARK, opacity: 0.55, lineHeight: 1.75, marginBottom: "52px" }}>
            We select applicants based on need, potential, and commitment. Applications reviewed within 7 days.
          </p>

          {submitted ? (
            <div
              style={{
                padding: "48px 40px",
                borderRadius: "24px",
                backgroundColor: WHITE,
                border: `1.5px solid ${ORANGE}30`,
                textAlign: "center",
              }}
            >
              <CheckCircle size={40} style={{ color: ORANGE, margin: "0 auto 20px" }} strokeWidth={1.5} />
              <p style={{ fontSize: "18px", fontWeight: 400, color: DARK, marginBottom: "12px" }}>
                Application Received
              </p>
              <p style={{ fontSize: "13px", fontWeight: 500, color: ORANGE, letterSpacing: "0.1em", marginBottom: "20px" }}>
                {reference}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 300, color: DARK, opacity: 0.6, lineHeight: 1.8 }}>
                We review every application personally. Expect a response within 7 days via WhatsApp or email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Your full name"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Phone / WhatsApp *
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+234 800 000 0000"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  State & LGA / Community *
                </label>
                <input
                  required
                  type="text"
                  value={form.community}
                  onChange={set("community")}
                  placeholder="e.g. Plateau State, Pankshin LGA, Kwang"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Programme *
                </label>
                <select
                  required
                  value={form.program}
                  onChange={set("program")}
                  style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}
                >
                  <option value="" disabled>Select a programme</option>
                  <option value="Digital Literacy & Entrepreneurship">Digital Literacy & Entrepreneurship</option>
                  <option value="IT Foundations">IT Foundations</option>
                  <option value="Climate Awareness">Climate Awareness</option>
                  <option value="Business Essentials">Business Essentials</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  Tell us about your situation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.situation}
                  onChange={set("situation")}
                  placeholder="Describe the financial or social barriers you face. We want to understand your context."
                  style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: DARK, opacity: 0.5, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  RIDI Task *
                </label>
                <p style={{ fontSize: "13px", fontWeight: 300, color: DARK, opacity: 0.55, lineHeight: 1.7, marginBottom: "10px" }}>
                  How would you source ₦50,000 to fund a skills programme in your community? This is assessed as part of your application.
                </p>
                <textarea
                  required
                  rows={5}
                  value={form.fundingTask}
                  onChange={set("fundingTask")}
                  placeholder="Share your approach. Be specific and honest."
                  style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                />
              </div>

              {submitError && (
                <p style={{ fontSize: "13px", color: "#C0392B", fontWeight: 300, lineHeight: 1.6 }}>
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={applyMutation.isPending}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "16px 32px",
                  borderRadius: "14px",
                  backgroundColor: ORANGE,
                  color: WHITE,
                  fontSize: "15px",
                  fontWeight: 400,
                  border: "none",
                  cursor: applyMutation.isPending ? "not-allowed" : "pointer",
                  opacity: applyMutation.isPending ? 0.7 : 1,
                  transition: "opacity 0.2s, transform 0.2s",
                  marginTop: "8px",
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={e => { if (!applyMutation.isPending) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 size={16} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                    Submitting…
                  </>
                ) : (
                  "Submit Application →"
                )}
              </button>

              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          backgroundColor: CREAM,
          borderTop: `1px solid ${DARK}0D`,
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "28px", marginBottom: "20px" }}>
          {[
            { label: "Home", href: "/" },
            { label: "Skills", href: "/skills" },
            { label: "Alumni", href: "/alumni" },
            { label: "Privacy", href: "/privacy" },
          ].map(l => (
            <Link key={l.label} href={l.href}>
              <span style={{ fontSize: "12px", fontWeight: 400, color: DARK, opacity: 0.4, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {l.label}
              </span>
            </Link>
          ))}
        </div>
        <p style={{ fontSize: "12px", fontWeight: 300, color: DARK, opacity: 0.35 }}>
          ridi@hamzury.com · ridi.hamzury.com
        </p>
        <p style={{ fontSize: "11px", fontWeight: 300, color: DARK, opacity: 0.25, marginTop: "8px" }}>
          Rural Innovation Development Initiative | Registered Non-Profit, Nigeria · Est. 14 February 2026
        </p>
      </footer>
    </div>
  );
}
