import { Link } from "wouter";
import { ArrowLeft, Target, Rocket, Globe } from "lucide-react";
import PageMeta from "@/components/PageMeta";

// ─── Palette ──────────────────────────────────────────────────────────────────
const WHITE = "#FFFFFF";
const MILK  = "#FBF8EE";
const TEAL  = "#2C1A0E";
const GOLD  = "#C9A97E";
const DARK  = "#2C2C2C";

// ─── Social links ─────────────────────────────────────────────────────────────
const SOCIALS = [
  { name: "Instagram",   href: "https://instagram.com/hamzury",          icon: "IG" },
  { name: "Twitter / X", href: "https://x.com/hamzury",                  icon: "𝕏"  },
  { name: "LinkedIn",    href: "https://linkedin.com/company/hamzury",   icon: "in" },
  { name: "Facebook",    href: "https://facebook.com/hamzury",           icon: "f"  },
  { name: "WhatsApp",    href: "https://wa.me/2348034620520",             icon: "W"  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FounderPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: WHITE }}>
      <PageMeta
        title="Our Founder | HAMZURY"
        description="Muhammad Hamzury. From a photocopy shop in Jos to Nigeria's integrated business infrastructure hub. The origin story of BizDoc, Systemise, and RIDI."
        ogImage="https://hamzury.com/founder.jpg"
      />

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b flex items-center justify-between px-6 md:px-12 h-16"
        style={{ backgroundColor: WHITE, borderColor: `${TEAL}12` }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
          style={{ color: TEAL }}
        >
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span
          className="text-xs font-normal tracking-widest uppercase opacity-40"
          style={{ color: TEAL }}
        >
          Founder
        </span>
      </nav>

      {/* ── Section 1: Hero ─────────────────────────────────────────────────── */}
      <section
        className="pt-16 min-h-screen flex flex-col justify-center"
        style={{ backgroundColor: WHITE }}
      >
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-32 flex flex-col md:flex-row items-center gap-14">
          {/* Text */}
          <div className="flex-1">
            <span
              className="text-[10px] font-medium tracking-[0.35em] uppercase block mb-6"
              style={{ color: GOLD }}
            >
              Hamzury Innovation Hub
            </span>

            <h1
              className="text-5xl md:text-6xl font-medium tracking-tight leading-[1.08] mb-4"
              style={{ color: TEAL }}
            >
              Muhammad Hamzury
            </h1>

            <p
              className="text-base font-normal tracking-[0.15em] uppercase mb-8"
              style={{ color: DARK, opacity: 0.5 }}
            >
              Founder
            </p>

            {/* Gold rule */}
            <div
              className="mb-8"
              style={{ width: 56, height: 2, backgroundColor: GOLD, borderRadius: 2 }}
            />

            <p
              className="text-lg md:text-xl font-light leading-relaxed max-w-xl mb-6"
              style={{ color: DARK }}
            >
              Building Nigeria's premier business infrastructure.{" "}
              <span style={{ color: TEAL, fontWeight: 500 }}>
                one company at a time.
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {["Founder · HAMZURY", "Chairman · RIDI"].map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${TEAL}0D`, color: TEAL, border: `1px solid ${TEAL}18` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Founder portrait */}
          <div className="shrink-0 relative">
            <div
              className="w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden"
              style={{
                border: `3px solid ${GOLD}`,
                boxShadow: `0 24px 64px rgba(10,31,28,0.18), 0 0 0 8px ${MILK}`,
              }}
            >
              <img
                src="/founder.jpg"
                alt="Muhammad Hamzury, Founder, HAMZURY Innovation Hub"
                className="w-full h-full object-cover object-top"
                onError={e => {
                  const t = e.currentTarget;
                  t.style.display = "none";
                  const parent = t.parentElement;
                  if (parent) {
                    parent.style.display = "flex";
                    parent.style.alignItems = "center";
                    parent.style.justifyContent = "center";
                    parent.style.backgroundColor = MILK;
                    parent.innerHTML = `<span style="font-size:2.5rem;font-weight:600;color:${TEAL};letter-spacing:0.05em">MH</span>`;
                  }
                }}
              />
            </div>
            {/* Chairman RIDI badge */}
            <div
              className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg"
              style={{ backgroundColor: GOLD, color: TEAL }}
            >
              Chairman · RIDI
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 1b: Origin Story ─────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: TEAL }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            The Origin
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-14"
            style={{ color: MILK }}
          >
            Where HAMZURY came from.
          </h2>

          {/* Arabic/Ajami callout */}
          <div
            className="rounded-2xl p-6 mb-14 border"
            style={{ borderColor: `${GOLD}30`, backgroundColor: `${MILK}08` }}
          >
            <p className="text-sm font-light leading-relaxed" style={{ color: `${MILK}B0` }}>
              The Arabic script in the HAMZURY logo is not decoration.
              It is a tribute to{" "}
              <span className="font-semibold" style={{ color: GOLD }}>Haruna</span>,
              my father, who understood Ajami and believed knowledge belongs to everyone.
              He opened a photocopy and typing shop so the community could learn.
              Every student who needed a document typed, every family who needed a form filled,
              he made sure they had access. That was his contribution.
            </p>
          </div>

          {/* Timeline steps */}
          <div className="space-y-0">
            {[
              {
                phase: "The Beginning",
                body: "After my father passed, I started where he left off. Scratch cards, typing work, learning to serve people and build trust one transaction at a time. No strategy. Just work.",
              },
              {
                phase: "University of Jos",
                body: "I took on a shop others had abandoned. The reputation wasn't good. But I saw what it could be. I built a customer base that knew us as honest, reliable, the best cafe on campus. Not through advertising. Through showing up every day.",
              },
              {
                phase: "The Turning Point",
                body: "I watched the cafe business decline in real time. Everyone had a phone. Footfall dried up. But instead of a dying business, I saw a signal. The world was moving digital. This space would become something bigger. Hamzury Innovation Hub.",
              },
              {
                phase: "RIDI",
                body: "As the Hub grew, I saw the same pattern. Talented people held back not by ability, but by access. I founded RIDI because tech skills are a necessity, not a privilege. We've sponsored thousands of students across 28 communities.",
              },
              {
                phase: "The Full System",
                body: "Skills alone weren't enough. Graduates needed legal structures, systems, and market positioning to build with. So we built BizDoc, Systemise, and Skills. Not as separate products, but as one integrated system for businesses that intend to last.",
              },
            ].map((item, i) => (
              <div
                key={item.phase}
                className="flex gap-6 md:gap-10 items-start pb-10 last:pb-0"
              >
                {/* Step number + vertical line */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: GOLD, color: TEAL }}
                  >
                    {i + 1}
                  </div>
                  {i < 4 && (
                    <div
                      className="w-px flex-1 mt-3"
                      style={{ backgroundColor: `${GOLD}25`, minHeight: 40 }}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6">
                  <p
                    className="text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: GOLD }}
                  >
                    {item.phase}
                  </p>
                  <p
                    className="text-base font-light leading-relaxed"
                    style={{ color: `${MILK}CC` }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Where We Are Today ───────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: MILK }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Progress
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-12"
            style={{ color: TEAL }}
          >
            Where We Are Today
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { stat: "250+",    label: "Businesses Supported"        },
              { stat: "3",       label: "Active Departments"          },
              { stat: "28",      label: "RIDI Communities"            },
              { stat: "₦50M+",   label: "Revenue Facilitated"        },
            ].map(({ stat, label }) => (
              <div
                key={label}
                className="rounded-2xl p-8 flex flex-col gap-2"
                style={{
                  backgroundColor: WHITE,
                  boxShadow: "0 2px 16px rgba(10,31,28,0.07)",
                }}
              >
                <span
                  className="text-4xl font-semibold tracking-tight"
                  style={{ color: TEAL }}
                >
                  {stat}
                </span>
                <span
                  className="text-sm font-light leading-snug"
                  style={{ color: DARK, opacity: 0.65 }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: The Road Ahead ───────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Vision
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-12"
            style={{ color: TEAL }}
          >
            The Road Ahead
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Target,
                title: "Nationwide Reach",
                body: "Expand to all 6 geopolitical zones by 2027. The default business infrastructure partner across Nigeria.",
              },
              {
                Icon: Rocket,
                title: "Skills at Scale",
                body: "Launch the Hamzury Skills national bootcamp network, bringing structured, practical training to every state.",
              },
              {
                Icon: Globe,
                title: "5,000 Businesses Formalised",
                body: "Register and document 5,000 Nigerian businesses through BizDoc, sole traders to enterprises.",
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="p-8 rounded-2xl border"
                style={{ borderColor: `${TEAL}12`, backgroundColor: MILK }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${TEAL}0D` }}
                >
                  <Icon size={18} style={{ color: TEAL }} />
                </div>
                <h3
                  className="text-base font-semibold mb-3"
                  style={{ color: TEAL }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: DARK, opacity: 0.65 }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What HAMZURY Stands For (Core Beliefs) ──────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: MILK }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Core Beliefs
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-12"
            style={{ color: TEAL }}
          >
            What HAMZURY stands for
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Structure",
                body: "Every business needs a foundation. We build it quietly, completely, and to last.",
              },
              {
                title: "Precision",
                body: "No shortcuts. The work is done correctly, or not at all. We hold the line on quality.",
              },
              {
                title: "Continuity",
                body: "We don't just file paperwork. We build systems that outlive the filing.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="p-8 rounded-2xl border"
                style={{ backgroundColor: WHITE, borderColor: `${TEAL}10` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm mb-6"
                  style={{ backgroundColor: TEAL, color: GOLD }}
                >
                  {title[0]}
                </div>
                <h3
                  className="text-base font-semibold mb-3"
                  style={{ color: TEAL }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: DARK, opacity: 0.65 }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Each Department Exists ───────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            The Origin
          </p>
          <h2
            className="text-3xl font-medium tracking-tight mb-14"
            style={{ color: TEAL }}
          >
            Why each department exists.
          </h2>
          <div className="space-y-12">
            {[
              {
                dept: "RIDI",
                why: "Everyone needs skills. Not as a luxury, as a necessity.",
                body: "RIDI exists because I've lived both sides of the access gap. I watched brilliant people do nothing with their talent. Not from lack of will, but lack of entry. RIDI closes that gap. Same programs, same certification, for anyone willing to do the work, regardless of income or geography.",
              },
              {
                dept: "HAMZURY SKILLS",
                why: "The innovation hub exists to make talent and let talent benefit from itself.",
                body: "Skills without opportunity is frustrating. This department does both: develops capability and creates pathways for real economic return. We train people, place them, partner them, and back them.",
              },
              {
                dept: "SYSTEMISE",
                why: "Structure and visibility are what kill good ideas.",
                body: "I've watched brilliant businesses struggle not from bad products, but invisible systems. Founders couldn't see their numbers. Teams couldn't follow structure. Brands said nothing. Systemise fixes the invisible architecture good businesses need. Today, it's led by our CEO, Idris Ibrahim.",
              },
              {
                dept: "BIZDOC",
                why: "Compliance is not a chore. It is the foundation of trust.",
                body: "A non-compliant business is on borrowed time. BizDoc was built so founders could stop fearing regulators and start building with confidence. Compliance is the starting point, not an afterthought.",
              },
            ].map(item => (
              <div
                key={item.dept}
                className="flex gap-8 items-start border-b pb-10 last:border-0 last:pb-0"
                style={{ borderColor: `${TEAL}10` }}
              >
                <div className="shrink-0 w-28">
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase"
                    style={{ color: GOLD }}
                  >
                    {item.dept}
                  </span>
                </div>
                <div>
                  <p
                    className="text-base font-normal leading-snug mb-3"
                    style={{ color: TEAL }}
                  >
                    "{item.why}"
                  </p>
                  <p
                    className="text-sm font-light leading-relaxed"
                    style={{ color: DARK, opacity: 0.6 }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder Quote ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: MILK }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="text-5xl font-serif mb-6"
            style={{ color: GOLD, opacity: 0.5 }}
          >
            "
          </div>
          <blockquote
            className="text-2xl md:text-3xl font-light leading-[1.55] mb-8"
            style={{ color: TEAL }}
          >
            Nigerian businesses don't fail for lack of ambition. They fail for lack of structure. We're here to change that.
          </blockquote>
          <p
            className="text-[10px] font-normal tracking-widest uppercase"
            style={{ color: GOLD }}
          >
            Muhammad Hamzury, Founder
          </p>
        </div>
      </section>

      {/* ── Section 4: Connect / Social ─────────────────────────────────────── */}
      <section className="py-24 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-xl mx-auto text-center">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Follow Along
          </p>
          <h2
            className="text-3xl font-medium tracking-tight mb-10"
            style={{ color: TEAL }}
          >
            Connect
          </h2>
          <div className="flex gap-4 justify-center flex-wrap">
            {SOCIALS.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all hover:scale-110"
                style={{ backgroundColor: TEAL, color: GOLD }}
                aria-label={s.name}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-6 md:px-12 border-t text-sm"
        style={{ backgroundColor: WHITE, borderColor: `${TEAL}10`, color: `${DARK}99` }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/"
            className="font-medium tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{ color: TEAL }}
          >
            HAMZURY
          </Link>
          <div className="flex gap-6 text-xs">
            {[
              { href: "/bizdoc",    label: "BizDoc"     },
              { href: "/systemise", label: "Systemise"  },
              { href: "/skills",    label: "Skills"     },
              { href: "/privacy",   label: "Privacy"    },
              { href: "/terms",     label: "Terms"      },
              { href: "/login",     label: "Staff Login" },
              { href: "/pricing",   label: "Pricing"    },
              { href: "/alumni",    label: "Alumni"     },
              { href: "/ridi",      label: "RIDI"       },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-opacity hover:opacity-100"
                style={{ color: `${TEAL}60` }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
