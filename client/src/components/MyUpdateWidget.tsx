import { useState } from "react";
import { TrendingUp, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const WHITE = "#FFFFFF";

export default function MyUpdateWidget() {
  const [open, setOpen]                 = useState(false);
  const [ref, setRef]                   = useState("");
  const [loading, setLoading]           = useState(false);
  const [notFound, setNotFound]         = useState(false);
  const [result, setResult]             = useState<null | {
    ref: string; clientName: string | null; businessName: string | null;
    service: string | null; status: string; progress: number;
  }>(null);

  const query = trpc.tracking.lookup.useQuery(
    { ref },
    { enabled: false, retry: false }
  );

  function handleAccess() {
    if (ref.trim().length < 4) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    query.refetch().then(res => {
      setLoading(false);
      if (res.data?.found) {
        const d = res.data;
        setResult({
          ref: d.ref,
          clientName: d.clientName ?? null,
          businessName: d.businessName ?? null,
          service: d.service ?? null,
          status: d.status,
          progress: Math.round(((d.statusIndex + 1) / d.statusTotal) * 100),
        });
      } else {
        setNotFound(true);
      }
    }).catch(() => { setLoading(false); setNotFound(true); });
  }

  return (
    <section className="py-12 px-5 md:px-12">
      <div className="max-w-lg mx-auto">
        <div
          className="rounded-2xl border overflow-hidden transition-all duration-300"
          style={{ borderColor: open ? TEAL : TEAL + "20", backgroundColor: open ? CREAM : WHITE }}
        >
          {/* Header */}
          <button
            className="w-full text-left p-6 md:p-7"
            onClick={() => setOpen(o => !o)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: TEAL + "10", color: TEAL }}
                >
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: TEAL, letterSpacing: "-0.025em" }}>
                    My Update
                  </h3>
                  <p className="text-[11px] uppercase tracking-wider font-medium opacity-35 mt-0.5" style={{ color: TEAL }}>
                    Live Project Tracking
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                style={{
                  color: TEAL,
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                  flexShrink: 0,
                }}
              />
            </div>
          </button>

          {/* Body */}
          <div style={{ maxHeight: open ? "900px" : "0px", overflow: "hidden", transition: "max-height 0.45s ease" }}>
            <div className="px-6 md:px-8 pb-8 pt-4 border-t" style={{ borderColor: `${TEAL}15`, backgroundColor: CREAM }}>
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>MY UPDATE</p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="HMZ-17/3-XXXX"
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border font-mono"
                  style={{ borderColor: `${TEAL}18`, backgroundColor: WHITE, color: TEAL }}
                  value={ref}
                  onChange={e => { setRef(e.target.value); setNotFound(false); setResult(null); }}
                  onKeyDown={e => e.key === "Enter" && handleAccess()}
                />
                <button
                  onClick={handleAccess}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
                  style={{ backgroundColor: TEAL, color: GOLD }}
                >
                  {loading ? "…" : "Access"}
                </button>
              </div>
              <p className="text-[11px] mb-4" style={{ color: TEAL, opacity: 0.35 }}>
                Enter your reference number e.g. HMZ-17/3-9567
              </p>

              {notFound && (
                <p className="text-[12px] mb-3" style={{ color: `${TEAL}90` }}>
                  No file found. Contact your CSO if you just enrolled.
                </p>
              )}

              {result && (
                <div className="rounded-2xl p-4 text-left border" style={{ backgroundColor: WHITE, borderColor: `${TEAL}12` }}>
                  <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: GOLD }}>
                    {result.ref}
                  </p>
                  <p className="text-[16px] font-bold mb-0.5" style={{ color: TEAL }}>
                    {result.businessName || result.clientName || "Your File"}
                  </p>
                  <p className="text-[13px] mb-3" style={{ color: TEAL, opacity: 0.55 }}>{result.service}</p>
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] mb-1.5" style={{ color: `${TEAL}55` }}>
                      <span>{result.status}</span>
                      <span style={{ color: GOLD }}>{result.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: `${TEAL}12` }}>
                      <div className="h-full rounded-full" style={{ width: `${result.progress}%`, backgroundColor: GOLD }} />
                    </div>
                  </div>
                  <a
                    href="/client/dashboard"
                    onClick={e => {
                      e.preventDefault();
                      localStorage.setItem("hamzury-client-session", JSON.stringify({
                        ref: result.ref, name: result.clientName,
                        businessName: result.businessName, service: result.service,
                        status: result.status, expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                      }));
                      window.location.href = "/client/dashboard";
                    }}
                    className="block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: TEAL, color: GOLD }}
                  >
                    Open Full Dashboard →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
