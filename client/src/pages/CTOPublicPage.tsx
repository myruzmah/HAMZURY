import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Menu, X, MessageSquare } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const BLUE = "#2563EB";   // Systemise primary
const MILK = "#FFFAF6";
const DARK = "#1A1A1A";
const GOLD = "#B48C4C";

export default function CTOPublicPage() {
  const [navMenuOpen, setNavMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: MILK }}>
      <PageMeta
        title="Muhammad Auwal | CTO, HAMZURY"
        description="Building the systems that power HAMZURY — infrastructure, automation, and digital architecture for every department."
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link
          href="/systemise"
          className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50"
          style={{ color: BLUE }}
        >
          <ArrowLeft size={14} /> SYSTEMISE
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
              style={{ backgroundColor: "#FFFFFF" }}
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
              {[
                { label: "Home",      href: "/" },
                { label: "Systemise", href: "/systemise" },
                { label: "BizDoc",    href: "/bizdoc" },
                { label: "Skills",    href: "/skills" },
                { label: "Founder",   href: "/founder" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <span className="block px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 cursor-pointer" style={{ color: DARK }}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero quote */}
      <section className="pt-40 pb-10 md:pt-52 md:pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote
            className="text-[clamp(24px,4.5vw,42px)] font-light italic leading-[1.35] tracking-tight"
            style={{ color: DARK }}
          >
            "Build it once. Build it right. Then let the system do the work."
          </blockquote>
        </div>
      </section>

      {/* Name */}
      <section className="pb-24 md:pb-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[15px] font-semibold tracking-tight" style={{ color: DARK }}>
            Muhammad Auwal
          </p>
          <p className="text-[13px] font-light mt-1" style={{ color: `${DARK}50` }}>
            Chief Technology Officer, HAMZURY
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-xl mx-auto space-y-16 text-center">
          {[
            "Infrastructure first.",
            "Automation always.",
            "Every system accountable.",
          ].map((statement) => (
            <p
              key={statement}
              className="text-[clamp(22px,3.5vw,32px)] font-light tracking-tight"
              style={{ color: DARK }}
            >
              {statement}
            </p>
          ))}
        </div>
      </section>

      {/* What I build */}
      <section className="py-24 md:py-32 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-8 text-center" style={{ color: GOLD }}>
            SCOPE
          </p>
          <div className="space-y-8">
            {[
              { title: "Digital Architecture", desc: "Websites, portals, dashboards, and client-facing platforms." },
              { title: "Automation & CRM", desc: "Workflows, pipelines, and systems that run without manual input." },
              { title: "Cloud & Hosting", desc: "Railway, DNS, domain management, uptime, and deployment." },
              { title: "Internal Tools", desc: "The HAMZURY platform — every feature, every dashboard, every integration." },
            ].map(item => (
              <div key={item.title} className="text-center">
                <p className="text-[16px] font-semibold mb-1" style={{ color: BLUE }}>{item.title}</p>
                <p className="text-[13px] font-light" style={{ color: `${DARK}60` }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={() => {
              localStorage.setItem("hamzury-chat-context", "I want to speak to the Systemise team about a tech project.");
              const btn = document.querySelector('[data-chat-trigger]') as HTMLElement;
              if (btn) btn.click();
            }}
            className="inline-block px-8 py-4 rounded-full text-[14px] font-medium tracking-tight transition-opacity duration-200 hover:opacity-80"
            style={{ backgroundColor: BLUE, color: "#FFFFFF" }}
          >
            Start a project
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[12px] font-semibold tracking-wider transition-opacity hover:opacity-50" style={{ color: DARK }}>
            HAMZURY
          </Link>
          <div className="flex gap-6">
            {[
              { href: "/systemise", label: "Systemise" },
              { href: "/bizdoc", label: "BizDoc" },
              { href: "/skills", label: "Skills" },
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-[12px] transition-opacity hover:opacity-70" style={{ color: `${DARK}40` }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
