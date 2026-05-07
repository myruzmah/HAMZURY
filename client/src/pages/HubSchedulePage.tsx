/**
 * HUB Schedule — public page at /hub/schedule.
 * 2026-05-07 — moved out of /hub home so the home page stays lean. The full
 * quarterly grid (sale → orientation → cohorts → graduation, plus always-on
 * intake) lives here. Source of truth: client/src/lib/hub-schedule.ts.
 */
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import HubScheduleSection from "@/components/HubScheduleSection";

const DARK = "#1E3A5F";
const GOLD = "#B48C4C";
const TEXT = "#1A1A1A";
const W    = "#FFFFFF";
const BG   = "#FFFAF6";

export default function HubSchedulePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "Inter, -apple-system, sans-serif" }}>
      <PageMeta
        title="HUB Schedule — Quarterly Cohorts | HAMZURY"
        description="When sales open, when cohorts run, when graduation happens. Quarterly schedule for HAMZURY HUB physical cohorts plus the always-on intake (internships, online academy)."
      />
      <nav className="py-5 px-6 border-b" style={{ backgroundColor: W, borderColor: `${DARK}08` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/hub" className="inline-flex items-center gap-2 text-[12px] tracking-[0.3em] font-medium uppercase" style={{ color: DARK }}>
            <ArrowLeft size={14} /> HAMZURY HUB
          </Link>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: GOLD }}>
            Learn what actually works
          </span>
        </div>
      </nav>

      <header className="px-6 pt-12 md:pt-20 pb-2 text-center max-w-3xl mx-auto">
        <p className="text-[11px] font-medium tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>HUB · SCHEDULE</p>
        <h1 className="text-[clamp(28px,4.5vw,44px)] font-light leading-[1.1] tracking-tight" style={{ color: TEXT }}>
          When sales open. <br className="hidden sm:block" />When cohorts run. <span style={{ color: DARK }}>When graduation happens.</span>
        </h1>
        <p className="text-[14px] mt-5 max-w-2xl mx-auto" style={{ color: `${TEXT}66` }}>
          Physical cohorts run on a quarterly rhythm. Internships and Online Academy stay open all year — apply any day, start any day.
        </p>
      </header>

      <HubScheduleSection />

      <footer className="py-10 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]" style={{ color: TEXT, opacity: 0.45 }}>
          <Link href="/hub">
            <span className="cursor-pointer hover:opacity-80">← Back to HUB</span>
          </Link>
          <p>&copy; {new Date().getFullYear()} HAMZURY HUB · Learn what actually works.</p>
          <Link href="/hub/enroll">
            <span className="cursor-pointer hover:opacity-80" style={{ color: GOLD }}>Enrol now →</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
