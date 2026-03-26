import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const W     = "#FFFFFF";

interface Props { open: boolean; onClose: () => void; }

export function RateUsWidget({ open, onClose }: Props) {
  const [mounted, setMounted]     = useState(false);
  const [rating, setRating]       = useState(0);
  const [hover, setHover]         = useState(0);
  const [comment, setComment]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); }
    else { setMounted(false); setRating(0); setComment(""); setSubmitted(false); }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" style={{ backgroundColor: "rgba(10,31,28,0.50)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div
        className={`absolute top-0 right-0 h-full w-full md:w-[400px] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${mounted ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: CREAM }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ backgroundColor: TEAL }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: GOLD, color: TEAL }}>★</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Rate HAMZURY</p>
            <p className="text-[11px]" style={{ color: GOLD, opacity: 0.8 }}>Your feedback shapes us</p>
          </div>
          <button onClick={onClose} className="p-1.5 opacity-70 hover:opacity-100"><X size={18} color={W} /></button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          {!submitted ? (
            <>
              <p className="text-[22px] font-light text-center mb-2" style={{ color: TEAL }}>How was your experience?</p>
              <p className="text-[13px] text-center mb-8 opacity-50" style={{ color: TEAL }}>Be honest — it helps us improve.</p>
              <div className="flex gap-3 mb-8">
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110 active:scale-95">
                    <Star size={36}
                      fill={(hover || rating) >= s ? GOLD : "transparent"}
                      stroke={(hover || rating) >= s ? GOLD : `${TEAL}40`}
                      strokeWidth={1.5} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us more (optional)…"
                    rows={3}
                    className="w-full rounded-2xl px-4 py-3 text-sm outline-none border resize-none mb-4"
                    style={{ borderColor: `${TEAL}20`, backgroundColor: W, color: "#2C2C2C" }}
                  />
                  <button
                    onClick={() => setSubmitted(true)}
                    className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: TEAL, color: GOLD }}>
                    Submit Rating
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-4">🙏</div>
              <p className="text-[22px] font-light mb-2" style={{ color: TEAL }}>Thank you!</p>
              <p className="text-[14px] opacity-50 mb-8" style={{ color: TEAL }}>Your feedback means everything to us.</p>
              <button onClick={onClose} className="px-8 py-3 rounded-2xl text-sm font-semibold" style={{ backgroundColor: TEAL, color: GOLD }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
