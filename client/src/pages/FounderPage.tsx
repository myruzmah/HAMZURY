import { Link } from "wouter";
import { ArrowLeft, Shield, Settings, GraduationCap, MapPin, Users, Building2, MessageCircle } from "lucide-react";
import PageMeta from "@/components/PageMeta";

// ─── Palette ──────────────────────────────────────────────────────────────────
const WHITE = "#FFFFFF";
const MILK  = "#FFFAF6";   // Milk white
const CHOCO = "#2C1A0E";
const GOLD  = "#B48C4C";
const DARK  = "#1A1A1A";

// ─── Social links ─────────────────────────────────────────────────────────────
const SOCIALS = [
  { name: "Instagram",   href: "https://instagram.com/hamzury",          icon: "IG" },
  { name: "Twitter / X", href: "https://x.com/hamzury",                  icon: "\u{1D54F}"  },
  { name: "LinkedIn",    href: "https://linkedin.com/company/hamzury",   icon: "in" },
  { name: "Facebook",    href: "https://facebook.com/hamzury",           icon: "f"  },
  { name: "WhatsApp",    href: "https://wa.me/2348034620520",             icon: "W"  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FounderPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: WHITE }}>
      <PageMeta
        title="Muhammad Hamzury | Founder, HAMZURY Institution"
        description="I build systems so businesses never fail from paperwork, broken processes, or lack of structure. 250+ businesses registered. 1,200+ students trained. Based in Jos, Nigeria."
        ogImage="https://hamzury.com/founder.jpg"
      />

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b flex items-center justify-between px-6 md:px-12 h-16"
        style={{ backgroundColor: WHITE, borderColor: `${CHOCO}12` }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
          style={{ color: CHOCO }}
        >
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span
          className="text-xs font-normal tracking-widest uppercase opacity-40"
          style={{ color: CHOCO }}
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
              Founder, HAMZURY Institution
            </span>

            <h1
              className="text-5xl md:text-6xl font-medium tracking-tight leading-[1.08] mb-4"
              style={{ color: CHOCO }}
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
              className="text-lg md:text-xl font-light leading-relaxed max-w-xl"
              style={{ color: DARK }}
            >
              I build systems so businesses never fail from paperwork, broken processes, or lack of structure.
            </p>
          </div>

          {/* Founder portrait */}
          <div className="shrink-0 relative">
            <div
              className="w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden"
              style={{
                border: `3px solid ${GOLD}`,
                boxShadow: `0 24px 64px rgba(44,26,14,0.18), 0 0 0 8px ${MILK}`,
              }}
            >
              <img
                src="/founder.jpg"
                alt="Muhammad Hamzury, Founder, HAMZURY Institution"
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
                    parent.innerHTML = `<span style="font-size:2.5rem;font-weight:600;color:${CHOCO};letter-spacing:0.05em">MH</span>`;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: The Story ────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: CHOCO }}>
        <div className="max-w-3xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            The Story
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-14"
            style={{ color: MILK }}
          >
            How this started.
          </h2>

          <div className="space-y-8">
            {[
              "Started with a photocopy machine and a folder of client documents.",
              "Built HAMZURY from scratch in Jos, Nigeria. No investors. No connections. Just a belief that Nigerian businesses deserve better infrastructure.",
              "Left a comfortable career paying over one million naira monthly to build this.",
              "Five years later: 250+ businesses registered, 1,200+ students trained, and a team of 15 who show up every day.",
            ].map((line, i) => (
              <p
                key={i}
                className="text-base md:text-lg font-light leading-relaxed"
                style={{ color: `${MILK}CC` }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: What I Believe ───────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: MILK }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Principles
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-14"
            style={{ color: CHOCO }}
          >
            What I believe.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Settings,
                title: "Structure Before Speed",
                body: "A business without systems is just a job. I build what lasts, not what looks good temporarily.",
              },
              {
                Icon: Shield,
                title: "Compliance is Freedom",
                body: "When your paperwork is sorted, no government agency can shut you down. That peace of mind is priceless.",
              },
              {
                Icon: GraduationCap,
                title: "Skills Change Destinies",
                body: "The right training at the right time can redirect someone's entire life. I have seen it happen hundreds of times.",
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="p-8 rounded-2xl border"
                style={{ backgroundColor: WHITE, borderColor: `${CHOCO}10` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: CHOCO, color: GOLD }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  className="text-base font-semibold mb-3"
                  style={{ color: CHOCO }}
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

      {/* ── Section 4: Evidence ─────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Track Record
          </p>
          <h2
            className="text-3xl md:text-4xl font-medium tracking-tight mb-14"
            style={{ color: CHOCO }}
          >
            The evidence.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                Icon: Building2,
                stat: "250+",
                label: "Businesses legally registered and protected",
              },
              {
                Icon: GraduationCap,
                stat: "1,200+",
                label: "Students trained across 6 cohort programmes",
              },
              {
                Icon: Settings,
                stat: "3",
                label: "Integrated departments: BizDoc, Systemise, Skills",
              },
              {
                Icon: MapPin,
                stat: "Jos",
                label: "Physical office in Jos. Expanding to Abuja April 2026",
              },
              {
                Icon: Users,
                stat: "15",
                label: "Full-time team members. Zero outsourcing",
              },
            ].map(({ Icon, stat, label }) => (
              <div
                key={label}
                className="rounded-2xl p-8 flex flex-col gap-3"
                style={{
                  backgroundColor: MILK,
                  border: `1px solid ${CHOCO}08`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-1"
                  style={{ backgroundColor: `${CHOCO}0A` }}
                >
                  <Icon size={16} style={{ color: CHOCO }} />
                </div>
                <span
                  className="text-3xl font-semibold tracking-tight"
                  style={{ color: CHOCO }}
                >
                  {stat}
                </span>
                <span
                  className="text-sm font-light leading-snug"
                  style={{ color: DARK, opacity: 0.6 }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Quote ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: CHOCO }}>
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="text-5xl font-serif mb-6"
            style={{ color: GOLD, opacity: 0.5 }}
          >
            &ldquo;
          </div>
          <blockquote
            className="text-xl md:text-2xl font-light leading-[1.6] mb-8"
            style={{ color: MILK }}
          >
            Businesses deserve more than consultants who disappear after the invoice.
            We stay until the compliance is done, the systems are running, and the team is capable.
            Structure is what separates businesses that last from businesses that don't.
          </blockquote>
          <p
            className="text-[10px] font-normal tracking-widest uppercase"
            style={{ color: GOLD }}
          >
            Muhammad Hamzury
          </p>
        </div>
      </section>

      {/* ── Section 6: Contact ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12" style={{ backgroundColor: MILK }}>
        <div className="max-w-xl mx-auto text-center">
          <p
            className="text-[10px] font-medium tracking-[0.35em] uppercase mb-3"
            style={{ color: GOLD }}
          >
            Get in Touch
          </p>
          <h2
            className="text-3xl font-medium tracking-tight mb-6"
            style={{ color: CHOCO }}
          >
            Let's talk.
          </h2>
          <p
            className="text-base font-light leading-relaxed mb-10"
            style={{ color: DARK, opacity: 0.6 }}
          >
            If you want to discuss your business, I am available.
          </p>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/2348034620520"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all hover:opacity-90"
            style={{ backgroundColor: CHOCO, color: GOLD }}
          >
            <MessageCircle size={16} />
            WhatsApp: +234 803 462 0520
          </a>

          {/* Social icons */}
          <div className="flex gap-4 justify-center flex-wrap mt-12">
            {SOCIALS.map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all hover:scale-110"
                style={{ backgroundColor: CHOCO, color: GOLD }}
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
        style={{ backgroundColor: WHITE, borderColor: `${CHOCO}10`, color: `${DARK}99` }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Link
              href="/"
              className="font-medium tracking-widest uppercase transition-opacity hover:opacity-60"
              style={{ color: CHOCO }}
            >
              HAMZURY
            </Link>
            <p className="text-[12px] font-light italic" style={{ color: `${CHOCO}60` }}>
              "Structure before speed. That is how we build." — Muhammad Hamzury, Founder
            </p>
          </div>
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
                style={{ color: `${CHOCO}60` }}
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
