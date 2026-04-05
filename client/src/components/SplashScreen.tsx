import { useState, useEffect } from "react";

/**
 * Splash screen — milk background with logo text that fills with color, then fades out.
 * BizDoc uses "BIZDOC" text + green fill.
 * Home, Systemise, Skills use "HAMZURY" text + their brand color fill.
 */
type SplashProps = {
  /** Text to display — "BIZDOC" or "HAMZURY" */
  text: string;
  /** Brand color that fills the text */
  color: string;
  /** Duration in ms before fade-out starts (default 1600) */
  duration?: number;
};

export default function SplashScreen({ text, color, duration = 1600 }: SplashProps) {
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
        .splash-text {
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
      `}</style>
      <span className="splash-text">{text}</span>
    </div>
  );
}
