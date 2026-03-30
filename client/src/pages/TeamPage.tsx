import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronDown, MessageSquare } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";
const MILK     = "#FFFAF6";
const WHITE    = "#FFFFFF";

// Department tag colors
const DEPT_COLORS: Record<string, string> = {
  "HAMZURY":        "#2563EB",
  "BizDoc Consult": "#1B4D3E",
  "CSO Division":   "#2563EB",
  "BizDev & HR":    "#2563EB",
  "BizDev":         "#2563EB",
  "Finance":        "#2563EB",
  "HAMZURY Skills": "#1E3A5F",
  "Media":          "#2563EB",
  "Systemise":      "#1E3A5F",
  "Operations":     "#2563EB",
};

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

function StaffCard({ member }: { member: StaffMember }) {
  const [expanded, setExpanded] = useState(false);
  const deptColor = DEPT_COLORS[member.dept] ?? member.color;

  return (
    <button
      onClick={() => setExpanded(prev => !prev)}
      className="w-full text-left rounded-[20px] overflow-hidden transition-all duration-300 hover:-translate-y-1 focus:outline-none"
      style={{
        backgroundColor: WHITE,
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-6">
        {/* Top row: avatar + name */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-[14px] font-semibold"
            style={{ backgroundColor: member.color, color: WHITE }}
          >
            {member.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-medium tracking-tight truncate" style={{ color: CHARCOAL }}>
              {member.name}
            </p>
            <p className="text-[13px] font-light mt-0.5" style={{ color: `${CHARCOAL}70` }}>
              {member.role}
            </p>
          </div>
          <ChevronDown
            size={16}
            className="shrink-0 transition-transform duration-300"
            style={{
              color: `${CHARCOAL}30`,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>

        {/* Department tag */}
        <div className="mt-3">
          <span
            className="inline-block text-[10px] font-semibold tracking-[0.12em] uppercase px-3 py-1 rounded-full"
            style={{ backgroundColor: `${deptColor}10`, color: deptColor }}
          >
            {member.dept}
          </span>
        </div>

        {/* Expandable bio */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxHeight: expanded ? 200 : 0,
            opacity: expanded ? 1 : 0,
            marginTop: expanded ? 16 : 0,
          }}
        >
          <div style={{ height: 1, backgroundColor: `${CHARCOAL}08`, marginBottom: 14 }} />
          <p className="text-[13px] font-light leading-relaxed" style={{ color: `${CHARCOAL}70` }}>
            {member.bio}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function TeamPage() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK, fontFamily: "'Inter', sans-serif" }}>
      <PageMeta
        title="Our Team — HAMZURY"
        description="Meet the operators, advisors, and educators behind HAMZURY's portfolio of services."
        canonical="https://hamzury.com/team"
      />

      {/* ── Nav ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${WHITE}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative">
          <Link href="/">
            <span
              className="text-[13px] tracking-[4px] font-light uppercase cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: CHARCOAL, letterSpacing: "0.25em" }}
            >
              HAMZURY
            </span>
          </Link>
          <button
            onClick={() => setNavMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 transition-opacity hover:opacity-70"
            style={{ color: CHARCOAL }}
            aria-label="Menu"
          >
            {navMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {navMenuOpen && (
            <div
              className="absolute top-12 right-0 rounded-2xl py-2 min-w-[220px] shadow-xl"
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
              <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: `${CHARCOAL}40` }}>Related</p>
              {[
                { label: "Founder",    href: "/founder" },
                { label: "Training",   href: "/training" },
                { label: "Consultant", href: "/consultant" },
                { label: "Alumni",     href: "/alumni" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: CHARCOAL }}>
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="mx-4 my-1.5" style={{ height: 1, backgroundColor: `${CHARCOAL}0C` }} />
              <p className="px-5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: `${CHARCOAL}40` }}>Departments</p>
              {[
                { label: "Home",           href: "/" },
                { label: "BizDoc Consult", href: "/bizdoc" },
                { label: "Systemise",      href: "/systemise" },
                { label: "Hamzury Skills", href: "/skills" },
                { label: "RIDI",           href: "/ridi" },
                { label: "Pricing",        href: "/pricing" },
                { label: "Affiliate",      href: "/affiliate" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: CHARCOAL, opacity: 0.7 }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-5" style={{ color: GOLD }}>
            OUR TEAM
          </p>
          <h1
            className="text-[clamp(32px,5vw,52px)] font-light tracking-tight leading-[1.1] mb-6"
            style={{ color: CHARCOAL, letterSpacing: "-0.025em" }}
          >
            The team behind HAMZURY.
          </h1>
          <p className="text-[15px] font-light leading-relaxed max-w-md mx-auto" style={{ color: `${CHARCOAL}60` }}>
            Operators, advisors, and educators who built what they now teach. Each role is deliberate. Each person, exceptional.
          </p>
        </div>
      </section>

      {/* ── Staff grid ── */}
      <section className="pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map((member) => (
              <StaffCard key={member.name + member.role} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder quote ── */}
      <section className="py-20 px-6" style={{ backgroundColor: WHITE }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[15px] font-light italic leading-relaxed mb-4" style={{ color: `${CHARCOAL}60` }}>
            "We don't hire to fill seats. We hire to build something that outlasts all of us."
          </p>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase" style={{ color: GOLD }}>
            Muhammad Hamzury — Founder
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6" style={{ backgroundColor: CHARCOAL }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="text-[14px] font-light tracking-tight" style={{ color: MILK, letterSpacing: "-0.02em" }}>
            HAMZURY
          </span>
          <div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: MILK }}
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
    </div>
  );
}
