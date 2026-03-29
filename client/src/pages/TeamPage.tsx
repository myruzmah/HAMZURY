import { useState } from "react";
import { Link } from "wouter";
import { Home, X } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TEAL  = "#2D2D2D";   // Apple grey — general
const GOLD  = "#B48C4C";
const CREAM = "#FFFAF6";   // Milk white
const DARK  = "#1A1A1A";

interface StaffMember {
  name: string;
  slug: string;
  role: string;
  dept: string;
  initials: string;
  color: string;
  bio: string;
}

const TEAM: StaffMember[] = [
  {
    name: "Idris Ibrahim",
    slug: "idris-ibrahim",
    role: "Chief Executive Officer",
    dept: "HAMZURY",
    initials: "II",
    color: "#2563EB",
    bio: "Leads HAMZURY's strategy, growth, and partnerships. 5 years building business infrastructure across Nigeria. Every department reports to this desk.",
  },
  {
    name: "Barrister Abdullahi Musa",
    slug: "abdullahi-musa",
    role: "Head of Compliance & Legal",
    dept: "BizDoc Consult",
    initials: "AM",
    color: "#1B4D3E",
    bio: "Licensed legal practitioner. Specialises in CAC registration, FIRS compliance, sector licences, and corporate legal frameworks. Over 250 businesses registered.",
  },
  {
    name: "Yusuf",
    slug: "yusuf",
    role: "Compliance Officer",
    dept: "BizDoc Consult",
    initials: "YU",
    color: "#1B4D3E",
    bio: "Ensures every client file meets regulatory standards. Manages document verification, deadline tracking, and compliance monitoring.",
  },
  {
    name: "Tabitha",
    slug: "tabitha",
    role: "Chief Success Officer",
    dept: "CSO Division",
    initials: "TB",
    color: "#2563EB",
    bio: "Manages every client relationship from first contact to final delivery. No client ever needs to chase HAMZURY.",
  },
  {
    name: "Maryam",
    slug: "maryam",
    role: "CSO Assistant & Media",
    dept: "CSO Division",
    initials: "MY",
    color: "#2563EB",
    bio: "Supports client success operations and manages media communications. Bridges client needs with internal teams.",
  },
  {
    name: "Khadija",
    slug: "khadija",
    role: "Business Development & HR",
    dept: "BizDev & HR",
    initials: "KD",
    color: "#2563EB",
    bio: "Drives lead generation, strategic partnerships, and talent acquisition. Also oversees AI content strategy.",
  },
  {
    name: "Faree",
    slug: "faree",
    role: "Business Development & Podcast",
    dept: "BizDev",
    initials: "FR",
    color: "#2563EB",
    bio: "Builds partnerships and manages HAMZURY's podcast operations. Combines relationship building with content creation.",
  },
  {
    name: "Abubakar",
    slug: "abubakar",
    role: "Finance & Brand Officer",
    dept: "Finance",
    initials: "AB",
    color: "#2563EB",
    bio: "Manages financial planning, reporting, and brand consistency. Every naira is tracked. Every asset is on-brand.",
  },
  {
    name: "Abdulmalik Musa",
    slug: "abdulmalik-musa",
    role: "Skills Lead / Cohort Manager",
    dept: "HAMZURY Skills",
    initials: "AM",
    color: "#1E3A5F",
    bio: "Designs and delivers HAMZURY's education programmes. Manages cohort scheduling, curriculum, and learner outcomes.",
  },
  {
    name: "Dajot",
    slug: "dajot",
    role: "Skills / Code Instructor",
    dept: "HAMZURY Skills",
    initials: "DJ",
    color: "#1E3A5F",
    bio: "Technical instructor for coding and digital skills cohorts. Turns beginners into builders.",
  },
  {
    name: "Hikma",
    slug: "hikma",
    role: "Media Manager",
    dept: "Media",
    initials: "HK",
    color: "#2563EB",
    bio: "Creates and manages content across all HAMZURY social platforms. Storytelling that builds trust and converts.",
  },
  {
    name: "Salis",
    slug: "salis",
    role: "Video & Sound Producer",
    dept: "Media",
    initials: "SL",
    color: "#2563EB",
    bio: "Produces all video and audio content. Podcast production, client testimonials, and brand visuals.",
  },
  {
    name: "Lalo",
    slug: "lalo",
    role: "Lead Designer",
    dept: "Systemise",
    initials: "LL",
    color: "#1E3A5F",
    bio: "Designs brand identities, marketing materials, and digital interfaces. Every HAMZURY visual passes through this desk.",
  },
  {
    name: "Rabilu",
    slug: "rabilu",
    role: "Security & Operations",
    dept: "Operations",
    initials: "RB",
    color: "#2563EB",
    bio: "Manages physical security, office operations, and logistics. Keeps the building and team safe.",
  },
];

export default function TeamPage() {
  const [selected, setSelected] = useState<StaffMember | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title="Our Team — HAMZURY"
        description="Meet the operators, advisors, and educators behind HAMZURY's portfolio of services."
        canonical="https://hamzury.com/team"
      />

      {/* Fixed Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${CREAM}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${TEAL}0d` }}
      >
        <span className="text-[13px] font-light tracking-[0.12em] uppercase" style={{ color: TEAL, letterSpacing: "0.15em" }}>
          HAMZURY
        </span>
        <div />
        <Link href="/">
          <span className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-opacity hover:opacity-60" style={{ color: TEAL }}>
            <Home size={16} />
          </span>
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-5" style={{ color: GOLD }}>
            The People
          </p>
          <h1
            className="text-[clamp(32px,5vw,56px)] font-light tracking-tight mb-5 leading-[1.1]"
            style={{ color: TEAL, letterSpacing: "-0.025em" }}
          >
            The team behind
            <br />HAMZURY.
          </h1>
          <p className="text-[15px] font-light leading-relaxed max-w-lg" style={{ color: DARK, opacity: 0.55 }}>
            Operators, advisors, and educators who have built what they now teach. Each role is deliberate. Each person, exceptional.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {TEAM.map((member) => (
              <button
                key={member.name + member.role}
                onClick={() => setSelected(member)}
                className="text-left rounded-2xl overflow-hidden border bg-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md focus:outline-none"
                style={{ borderColor: `${member.color}18` }}
              >
                {/* Avatar band */}
                <div
                  className="h-28 flex items-center justify-center"
                  style={{ backgroundColor: `${member.color}0e` }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-[15px] font-semibold"
                    style={{ backgroundColor: member.color, color: GOLD }}
                  >
                    {member.initials}
                  </div>
                </div>
                {/* Info */}
                <div className="p-5">
                  <p className="text-[14px] font-medium mb-0.5" style={{ color: TEAL }}>
                    {member.name}
                  </p>
                  <p className="text-[12px] mb-1.5" style={{ color: DARK, opacity: 0.5 }}>
                    {member.role}
                  </p>
                  <p
                    className="text-[10px] font-semibold tracking-wider uppercase"
                    style={{ color: member.color, opacity: 0.65 }}
                  >
                    {member.dept}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-12 py-10 border-t"
        style={{ backgroundColor: TEAL, borderColor: `${GOLD}18` }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Founder Quote */}
          <div className="text-center mb-10 pb-8" style={{ borderBottom: `1px solid ${GOLD}18` }}>
            <p className="text-[15px] font-light italic leading-relaxed max-w-lg mx-auto mb-3" style={{ color: CREAM, opacity: 0.6 }}>
              "We don't hire to fill seats. We hire to build something that outlasts all of us."
            </p>
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase" style={{ color: GOLD, opacity: 0.5 }}>
              Muhammad Hamzury — Founder
            </p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="text-[14px] font-light tracking-tight" style={{ color: CREAM, letterSpacing: "-0.02em" }}>
            HAMZURY
          </span>
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: CREAM }}
          >
            <Link href="/" className="opacity-40 hover:opacity-80 transition-opacity">Home</Link>
            <Link href="/bizdoc" className="opacity-40 hover:opacity-80 transition-opacity">BizDoc</Link>
            <Link href="/systemise" className="opacity-40 hover:opacity-80 transition-opacity">Systemise</Link>
            <Link href="/skills" className="opacity-40 hover:opacity-80 transition-opacity">Skills</Link>
            <Link href="/ridi" className="opacity-40 hover:opacity-80 transition-opacity">RIDI</Link>
            <Link href="/login" className="opacity-20 hover:opacity-50 transition-opacity">Staff</Link>
          </div>
        </div>
      </footer>

      {/* Overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: `${TEAL}f2`, backdropFilter: "blur(16px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl p-10 flex flex-col items-center text-center"
            style={{ backgroundColor: `${TEAL}`, border: `1px solid ${GOLD}28` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
              style={{ color: CREAM, opacity: 0.5 }}
            >
              <X size={18} />
            </button>

            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-[22px] font-semibold mb-6"
              style={{ backgroundColor: selected.color, color: GOLD }}
            >
              {selected.initials}
            </div>

            {/* Name */}
            <h2
              className="text-[22px] font-light tracking-tight mb-2 leading-snug"
              style={{ color: CREAM, letterSpacing: "-0.02em" }}
            >
              {selected.name}
            </h2>

            {/* Role */}
            <p className="text-[13px] font-light mb-1" style={{ color: GOLD }}>
              {selected.role}
            </p>

            {/* Dept */}
            <p
              className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-6"
              style={{ color: CREAM, opacity: 0.35 }}
            >
              {selected.dept}
            </p>

            {/* Bio */}
            <p
              className="text-[14px] font-light leading-relaxed mb-8"
              style={{ color: CREAM, opacity: 0.65 }}
            >
              {selected.bio}
            </p>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/2348067149356?text=Hi%2C%20I%27d%20like%20to%20reach%20${encodeURIComponent(selected.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: GOLD, color: TEAL }}
            >
              Contact via WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
