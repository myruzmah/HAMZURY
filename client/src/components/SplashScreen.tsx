import { useState, useEffect } from "react";

/**
 * Splash screen — milk background, text logo with color-fill animation.
 * No images — pure CSS text for fast load.
 *
 * Brand colors:
 *  - Home (HAMZURY): charcoal #1A1A1A
 *  - BizDoc (BIZDOC): green #1B4D3E + gold accent bar
 *  - Systemise (HAMZURY): blue #2563EB
 *  - Skills (HAMZURY): navy #1E3A5F
 */
type SplashProps = {
  text: string;
  color: string;
  /** Optional accent color shown as a bar beneath the text (BizDoc gold) */
  accent?: string;
  duration?: number;
};

export default function SplashScreen({ text, color, accent, duration = 1600 }: SplashProps) {
  const [phase, setPhase] = useState<"fill" | "fadeout" | "done">("fill");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fadeout"), duration);
    const t2 = setTimeout(() => setPhase("done"), duration + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "#FFFAF6",
        opacity: phase === "fadeout" ? 0 : 1,
        transition: "opacity 0.4s ease-out",
        pointerEvents: phase === "fadeout" ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes splash-fill {
          0%   { background-size: 0% 100%; }
          100% { background-size: 100% 100%; }
        }
        @keyframes accent-grow {
          0%   { width: 0; opacity: 0; }
          40%  { opacity: 1; }
          100% { width: 60px; opacity: 1; }
        }
        .splash-logo {
          font-size: clamp(28px, 8vw, 48px);
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          background: linear-gradient(90deg, ${color} 50%, ${color}18 50%);
          background-size: 0% 100%;
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: splash-fill ${duration * 0.8}ms ease-out forwards;
        }
        .splash-accent {
          height: 4px;
          border-radius: 2px;
          margin-top: 10px;
          animation: accent-grow ${duration * 0.7}ms ease-out ${duration * 0.2}ms forwards;
        }
      `}</style>
      <div className="flex flex-col items-center">
        <span className="splash-logo">{text}</span>
        {accent && (
          <div className="splash-accent" style={{ backgroundColor: accent, width: 0 }} />
        )}
      </div>
    </div>
  );
}
