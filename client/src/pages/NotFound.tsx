import { useLocation } from "wouter";
import PageMeta from "@/components/PageMeta";

const TEAL = "#2D2D2D";    // Apple grey — general
const GOLD = "#B48C4C";
const CREAM = "#FFFAF6";   // Milk white
const DARK = "#1A1A1A";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: CREAM }}>
      <PageMeta
        title="Page Not Found — HAMZURY"
        description="The page you're looking for doesn't exist. Return to HAMZURY Innovation Hub."
        canonical="https://hamzury.com/404"
      />

      {/* Brand */}
      <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-10"
        style={{ color: GOLD }}>HAMZURY INNOVATION HUB</p>

      {/* 404 */}
      <div className="mb-6">
        <span className="text-[96px] font-bold leading-none"
          style={{ color: TEAL, letterSpacing: "-0.05em", opacity: 0.08 }}>404</span>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight mb-3"
        style={{ color: TEAL, letterSpacing: "-0.03em", marginTop: "-60px" }}>
        Page not found.
      </h1>
      <p className="text-sm mb-8 max-w-xs"
        style={{ color: DARK, opacity: 0.5 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setLocation("/")}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ backgroundColor: TEAL, color: GOLD }}>
          ← Back to HAMZURY
        </button>
        <button
          onClick={() => setLocation("/bizdoc")}
          className="px-6 py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
          style={{ borderColor: TEAL + "30", color: TEAL, backgroundColor: "transparent" }}>
          BizDoc Consult
        </button>
      </div>

      {/* Dept links */}
      <div className="mt-12 flex flex-col gap-1.5 text-xs" style={{ color: DARK, opacity: 0.35 }}>
        <span>Looking for something?</span>
        <div className="flex gap-4">
          <button onClick={() => setLocation("/systemise")} className="underline hover:opacity-70">Systemise</button>
          <button onClick={() => setLocation("/skills")} className="underline hover:opacity-70">Skills</button>
          <button onClick={() => setLocation("/")} className="underline hover:opacity-70">Home</button>
        </div>
      </div>
    </div>
  );
}
