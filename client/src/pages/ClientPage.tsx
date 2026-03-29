import { useState, useEffect } from "react";
import { FileSearch, Loader2, AlertCircle, ArrowRight, Shield, Phone } from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

/* ── Unified brand — all refs are HAM-XXXX-YYYY ── */
const THEME = { primary: "#2D2D2D", accent: "#B48C4C", label: "HAMZURY" };

const CREAM = "#FFFAF6";
const DARK = "#1A1A1A";

function loadClientSession() {
  try {
    const raw = localStorage.getItem("hamzury-client-session");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem("hamzury-client-session");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function ClientPage() {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Check for existing session
  useEffect(() => {
    const session = loadClientSession();
    if (session?.ref) {
      window.location.href = "/client/dashboard";
    }
  }, []);

  const trackingQuery = trpc.tracking.lookup.useQuery(
    { ref: ref.trim().toUpperCase(), phone: phone.trim() || undefined },
    { enabled: searched && ref.trim().length >= 4, retry: false }
  );

  useEffect(() => {
    if (!searched) return;
    if (trackingQuery.data) {
      if (trackingQuery.data.found) {
        setError("");
      } else {
        const reason = (trackingQuery.data as { found: false; reason?: string }).reason;
        if (reason === "phone_mismatch") {
          setError("Phone number does not match our records. Please check and try again.");
        } else {
          setError("No file found with this reference number. Please check and try again.");
        }
      }
    }
    if (trackingQuery.isError) {
      setError("Something went wrong. Please try again in a moment.");
    }
  }, [trackingQuery.data, trackingQuery.isError, searched]);

  function handleSearch() {
    const trimmed = ref.trim();
    if (trimmed.length < 4) {
      setError("Please enter a valid reference number.");
      return;
    }
    setError("");
    setSearched(true);
    trackingQuery.refetch();
  }

  function handleAccessDashboard() {
    if (!trackingQuery.data || !trackingQuery.data.found) return;
    const d = trackingQuery.data;
    localStorage.setItem("hamzury-client-session", JSON.stringify({
      ref: d.ref,
      phone: phone.trim() || undefined,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    }));
    window.location.href = "/client/dashboard";
  }

  const theme = THEME;
  const isLoading = searched && trackingQuery.isLoading;
  const found = searched && trackingQuery.data?.found;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <PageMeta
        title="Track Your File - HAMZURY"
        description="Enter your reference number to track the progress of your business compliance file."
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-30 px-5 h-14 flex items-center justify-between"
        style={{ backgroundColor: `${CREAM}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${theme.primary}0d` }}
      >
        <a href="/" className="text-[15px] font-light tracking-tight" style={{ color: theme.primary, letterSpacing: "-0.03em" }}>
          HAMZURY
        </a>
        <span className="text-[11px] font-medium uppercase tracking-wider opacity-40" style={{ color: theme.primary }}>
          Client Portal
        </span>
      </nav>

      <main className="max-w-md mx-auto px-5 pt-16 pb-20">

        {/* Hero */}
        <div className="text-center mb-12">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${theme.primary}0a` }}
          >
            <FileSearch size={28} style={{ color: theme.accent }} />
          </div>
          <h1
            className="text-[28px] md:text-[34px] font-light tracking-tight leading-tight mb-3"
            style={{ color: theme.primary, letterSpacing: "-0.025em" }}
          >
            Track Your File
          </h1>
          <p className="text-[14px] font-light leading-relaxed opacity-60" style={{ color: DARK }}>
            Enter your reference number to see real-time progress on your compliance file, invoices, and activity.
          </p>
        </div>

        {/* Search card */}
        <div className="rounded-3xl p-7 mb-6" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${theme.primary}0a` }}>
          {/* Ref input */}
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: DARK, opacity: 0.4 }}>
            Reference Number
          </label>
          <input
            value={ref}
            onChange={(e) => { setRef(e.target.value.toUpperCase()); setSearched(false); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="HAM-XXXX-1234"
            className="w-full h-12 px-4 rounded-xl text-[15px] font-mono tracking-wide bg-transparent border transition-colors focus:outline-none"
            style={{
              borderColor: error ? "#DC2626" : `${theme.primary}15`,
              color: theme.primary,
            }}
            autoFocus
          />

          {/* Optional phone verification toggle */}
          {!showPhone && (
            <button
              onClick={() => setShowPhone(true)}
              className="flex items-center gap-1.5 mt-3 text-[11px] font-medium opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: theme.primary }}
            >
              <Shield size={12} />
              Add phone verification (optional)
            </button>
          )}

          {showPhone && (
            <div className="mt-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: DARK, opacity: 0.4 }}>
                Phone Number (optional)
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: theme.primary }} />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="08012345678"
                  className="w-full h-11 pl-9 pr-4 rounded-xl text-[14px] bg-transparent border transition-colors focus:outline-none"
                  style={{ borderColor: `${theme.primary}15`, color: theme.primary }}
                />
              </div>
              <p className="text-[10px] mt-1.5 opacity-30" style={{ color: DARK }}>
                Enter the phone number on file for extra security.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl" style={{ backgroundColor: "#FEE2E2" }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
              <p className="text-[12px]" style={{ color: "#991B1B" }}>{error}</p>
            </div>
          )}

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={isLoading || ref.trim().length < 4}
            className="w-full h-12 rounded-xl text-[13px] font-semibold uppercase tracking-wider mt-5 transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary, color: theme.accent }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Looking up...
              </>
            ) : (
              "Track My File"
            )}
          </button>
        </div>

        {/* Result preview */}
        {found && trackingQuery.data && "ref" in trackingQuery.data && (
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: theme.primary }}>
            <div className="p-7">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: theme.accent }}>
                  {trackingQuery.data.ref}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
                >
                  {trackingQuery.data.status}
                </span>
              </div>

              <h2 className="text-[20px] font-light tracking-tight mb-1" style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                {trackingQuery.data.businessName || trackingQuery.data.clientName}
              </h2>
              <p className="text-[13px] font-light mb-6" style={{ color: "#FFFFFF", opacity: 0.5 }}>
                {trackingQuery.data.service}
              </p>

              {/* Progress bar */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "#FFFFFF", opacity: 0.4 }}>
                  Progress
                </span>
                <span className="text-[18px] font-light" style={{ color: theme.accent }}>
                  {Math.round(((trackingQuery.data.statusIndex! + 1) / trackingQuery.data.statusTotal!) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full mb-6" style={{ backgroundColor: `#FFFFFF18` }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round(((trackingQuery.data.statusIndex! + 1) / trackingQuery.data.statusTotal!) * 100)}%`,
                    backgroundColor: theme.accent,
                  }}
                />
              </div>

              {/* Status message */}
              <p className="text-[13px] font-light leading-relaxed" style={{ color: "#FFFFFF", opacity: 0.7 }}>
                {trackingQuery.data.statusMessage}
              </p>
            </div>

            {/* Access full dashboard */}
            <button
              onClick={handleAccessDashboard}
              className="w-full flex items-center justify-center gap-2 py-4 text-[12px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
              style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
            >
              Open Full Dashboard
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Ref format hint */}
        <div className="mt-10 text-center">
          <p className="text-[11px] font-light opacity-30" style={{ color: DARK }}>
            Your reference number was sent to you via WhatsApp when your file was created.
          </p>
          <p className="text-[10px] mt-2 font-mono opacity-20" style={{ color: DARK }}>
            Format: HAM-XXXX-YYYY
          </p>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center space-y-3">
          <p className="text-[11px] opacity-25" style={{ color: DARK }}>
            Questions? WhatsApp us on 08067149356
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px]" style={{ color: DARK }}>
            <a href="/" className="opacity-30 hover:opacity-60 transition-opacity">Home</a>
            <a href="/bizdoc" className="opacity-30 hover:opacity-60 transition-opacity">BizDoc</a>
            <a href="/systemise" className="opacity-30 hover:opacity-60 transition-opacity">Systemise</a>
            <a href="/skills" className="opacity-30 hover:opacity-60 transition-opacity">Skills</a>
          </div>
        </div>
      </main>
    </div>
  );
}
