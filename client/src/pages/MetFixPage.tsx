import { Link } from "wouter";
import { ArrowLeft, Cpu, Wifi, Cog, Zap } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const DARK = "#1A1A1A";
const ACCENT = "#B48C4C";
const BG = "#FFFAF6";   // Milk white

const SERVICES = [
  { icon: <Cpu size={24} />, title: "Robotics", desc: "Custom robotics solutions for automation and industrial use." },
  { icon: <Wifi size={24} />, title: "Drones", desc: "Commercial drone systems for surveillance, delivery, and mapping." },
  { icon: <Cog size={24} />, title: "Hardware Installation", desc: "Enterprise hardware setup, networking, and maintenance." },
  { icon: <Zap size={24} />, title: "Automation Systems", desc: "IoT and smart systems for offices, warehouses, and production." },
];

export default function MetFixPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <PageMeta
        title="MetFix Hardware | HAMZURY"
        description="Hardware installation, robotics, drones, and automation systems. Coming soon from HAMZURY."
      />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: `${BG}E6`, borderColor: `${DARK}08` }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer text-[13px] font-medium" style={{ color: DARK, opacity: 0.5 }}>
              <ArrowLeft size={16} /> HAMZURY
            </span>
          </Link>
          <span className="text-[13px] font-bold tracking-[0.2em] uppercase" style={{ color: DARK }}>METFIX</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.25em] uppercase mb-8 border"
            style={{ color: ACCENT, borderColor: `${ACCENT}30` }}>
            Coming Soon
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-tight leading-[0.95] mb-6" style={{ color: DARK, letterSpacing: "-0.03em" }}>
            Hardware that works.
          </h1>
          <p className="text-[16px] font-light leading-relaxed max-w-lg mx-auto" style={{ color: DARK, opacity: 0.55 }}>
            Robotics. Drones. Automation systems. Enterprise hardware installation. The physical infrastructure your business needs.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border" style={{ borderColor: `${DARK}08` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${DARK}08`, color: DARK }}>
                {s.icon}
              </div>
              <h3 className="text-[16px] font-semibold mb-2" style={{ color: DARK }}>{s.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: DARK, opacity: 0.55 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 text-center">
        <p className="text-[14px] mb-4" style={{ color: DARK, opacity: 0.45 }}>
          Launching Q2 2026. Want early access?
        </p>
        <a href="https://wa.me/2349130700056?text=I%27m%20interested%20in%20MetFix%20hardware%20services"
          target="_blank" rel="noopener noreferrer"
          className="inline-block px-8 py-3 rounded-full text-[13px] font-medium transition-transform hover:scale-105"
          style={{ backgroundColor: DARK, color: BG }}>
          Contact Us
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-6 border-t text-center" style={{ borderColor: `${DARK}08` }}>
        <p className="text-[12px] font-light italic mb-3" style={{ color: DARK, opacity: 0.4 }}>
          "Build what lasts." — Muhammad Hamzury, Founder
        </p>
        <p className="text-[11px]" style={{ color: DARK, opacity: 0.3 }}>
          &copy; {new Date().getFullYear()} HAMZURY. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
