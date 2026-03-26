import { useState } from "react";
import { Link } from "wouter";
import { Home, X } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const DARK  = "#2C2C2C";

interface StaffMember {
  name: string;
  role: string;
  dept: string;
  initials: string;
  color: string;
  bio: string;
}

const TEAM: StaffMember[] = [
  {
    name: "Idris Ibrahim",
    role: "Chief Executive Officer",
    dept: "HAMZURY",
    initials: "II",
    color: "#0A1F1C",
    bio: "Leads HAMZURY's overall strategy, growth, and innovation. Responsible for vision-setting, team leadership, and institutional partnerships.",
  },
  {
    name: "Barrister Abdullahi Musa",
    role: "Head of Compliance & Legal",
    dept: "BizDoc Consult",
    initials: "AM",
    color: "#1B4D3E",
    bio: "Licensed legal practitioner and Nigeria's compliance specialist. Handles CAC, FIRS, sector licences, and corporate legal frameworks.",
  },
  {
    name: "Digital Systems Lead",
    role: "CTO & Systems Architect",
    dept: "Systemize",
    initials: "SL",
    color: "#1E3A5F",
    bio: "Architects all digital infrastructure, automation systems, and technology strategy across HAMZURY's portfolio.",
  },
  {
    name: "Programmes Lead",
    role: "CEO, HAMZURY Skills",
    dept: "HAMZURY Skills",
    initials: "PL",
    color: "#8B6914",
    bio: "Designs and delivers HAMZURY's education programs. Oversees cohort curriculum, trainer quality, and learner outcomes.",
  },
  {
    name: "Client Success Lead",
    role: "Head of Client Experience",
    dept: "CSO Division",
    initials: "CS",
    color: "#0A1F1C",
    bio: "Manages every client relationship from onboarding to delivery. Ensures no client ever needs to chase HAMZURY.",
  },
  {
    name: "Finance Lead",
    role: "Finance & Accounts Officer",
    dept: "Finance",
    initials: "FL",
    color: "#0A1F1C",
    bio: "Manages financial planning, reporting, and compliance. Handles accounts payable/receivable and budget oversight.",
  },
  {
    name: "People & Culture Lead",
    role: "HR & Talent Officer",
    dept: "Human Resources",
    initials: "HR",
    color: "#0A1F1C",
    bio: "Leads recruitment, staff development, and organisational culture. Ensures every HAMZURY hire is a culture fit.",
  },
  {
    name: "Partnerships Lead",
    role: "Business Development & Growth",
    dept: "BizDev",
    initials: "BD",
    color: "#0A1F1C",
    bio: "Drives strategic partnerships, institutional alliances, and new revenue channels for HAMZURY.",
  },
  {
    name: "RIDI Programme Lead",
    role: "Community Development Director",
    dept: "RIDI Initiative",
    initials: "RL",
    color: "#E86A2E",
    bio: "Coordinates RIDI's community outreach, scholar selection, and enablement delivery. Expanding access to rural opportunity.",
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
