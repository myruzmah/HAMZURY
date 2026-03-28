import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { ArrowLeft, ArrowRight, GraduationCap, Target, Users, Lightbulb } from "lucide-react";

const NAVY = "#1B2A4A";  // Skills primary — dark navy blue
const GOLD = "#C9A97E";
const BG   = "#FAFAF8";  // Milk white

export default function SkillsCEOPage() {
  return (
    <div style={{ background: "#FAFAF8", minHeight: "100vh" }}>
      <PageMeta
        title="CEO — HAMZURY Skills"
        description="Meet the CEO of HAMZURY Skills — driving practical business education for entrepreneurs and professionals."
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/skills" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={14} /> Skills
            </Link>
            <span className="text-gray-200">|</span>
            <span className="font-extrabold tracking-widest text-sm" style={{ color: GOLD }}>
              HAMZURY <span className="font-normal text-gray-700">SKILLS</span>
            </span>
          </div>
          <Link href="/skills">
            <span
              className="hidden sm:inline text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ background: GOLD, color: "#fff" }}
            >
              View Programs
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6" style={{ background: CREAM }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[3px] mb-4" style={{ color: GOLD }}>
            Leadership
          </p>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900 leading-tight">
            Skills CEO
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Championing practical business education that equips entrepreneurs and professionals with the tools they actually need.
          </p>
        </div>
      </section>

      {/* Profile */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Photo placeholder */}
          <div className="space-y-6">
            <div
              className="aspect-square max-w-sm mx-auto md:mx-0 rounded-2xl flex items-center justify-center"
              style={{ background: GOLD + "18", border: `2px dashed ${GOLD}60` }}
            >
              <div className="text-center">
                <GraduationCap size={64} style={{ color: GOLD }} className="mx-auto mb-3" />
                <p className="text-xs text-gray-400 uppercase tracking-widest">Photo Coming Soon</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm max-w-sm mx-auto md:mx-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Quick Facts
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span style={{ color: GOLD }}>→</span>
                  <span>Leads HAMZURY Skills department</span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: GOLD }}>→</span>
                  <span>Focus: entrepreneurship, digital skills, business fundamentals</span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: GOLD }}>→</span>
                  <span>Oversees curriculum design and RIDI scholarship program</span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: GOLD }}>→</span>
                  <span>Based in Abuja, FCT</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">HAMZURY Skills CEO</h2>
              <p className="text-sm font-medium" style={{ color: GOLD }}>
                Chief Executive, HAMZURY Skills
              </p>
            </div>

            <p className="text-base text-gray-600 leading-relaxed">
              The Skills department exists because most business education is either too theoretical to use or too expensive to access. HAMZURY Skills was built to close that gap — practical programs, taught by practitioners, priced to be accessible without being cheap.
            </p>

            <p className="text-base text-gray-600 leading-relaxed">
              As CEO, the focus is on building education that moves with the market. The curriculum is updated every cohort to reflect what's actually working for businesses today — not what was working five years ago in a different economy.
            </p>

            <p className="text-base text-gray-600 leading-relaxed">
              The RIDI Scholarship program is a direct expression of that philosophy. Talent should never be held back by funding. The scholarship exists to ensure the most motivated learners can participate regardless of financial position.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy pillars */}
      <section className="py-20 px-6" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            What Drives the Department
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Practical Over Theoretical",
                desc: "Every module is designed around real decisions business owners face — not case studies from Harvard.",
              },
              {
                icon: Users,
                title: "Community-First",
                desc: "Learning alongside peers who are building real businesses creates accountability no solo course can match.",
              },
              {
                icon: Lightbulb,
                title: "Market-Relevant",
                desc: "Curriculum is reviewed before every cohort. If the market has shifted, the program shifts with it.",
              },
              {
                icon: GraduationCap,
                title: "Accessible Excellence",
                desc: "High standards don't require high barriers. The RIDI Scholarship ensures motivated learners are never locked out.",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <p.icon size={28} style={{ color: GOLD }} className="mb-3" />
                <h3 className="font-bold text-gray-900 text-sm mb-2">{p.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to build real skills?
          </h2>
          <p className="text-gray-600 mb-8">
            Explore HAMZURY Skills programs and apply for the next cohort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/skills">
              <button
                className="px-8 py-3 rounded-lg text-white font-bold flex items-center gap-2 justify-center"
                style={{ background: GOLD }}
              >
                Browse Programs <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/">
              <button className="px-8 py-3 rounded-lg font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                Back to HAMZURY
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>
            <span className="font-bold" style={{ color: GOLD }}>HAMZURY SKILLS</span> &copy; {new Date().getFullYear()}
          </span>
          <div className="flex gap-6">
            <Link href="/skills" className="hover:text-gray-700">Programs</Link>
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
