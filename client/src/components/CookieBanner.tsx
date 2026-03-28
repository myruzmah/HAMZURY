import { useState, useEffect } from "react";
import { Link } from "wouter";

const STORAGE_KEY = "hamzury-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 md:px-8 md:pb-6">
      <div
        className="max-w-3xl mx-auto rounded-2xl shadow-2xl border border-[#C9A97E]/20 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        style={{ backgroundColor: "#1D1D1F" }}
      >
        <p className="text-[13px] flex-1 leading-relaxed" style={{ color: "rgba(248,245,240,0.75)" }}>
          We use cookies and similar technologies to improve your experience. By continuing, you agree to our{" "}
          <Link href="/privacy" className="underline hover:opacity-80 transition-opacity" style={{ color: "#C9A97E" }}>
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={decline}
            className="text-[12px] font-semibold px-4 py-2 rounded-full border transition-opacity hover:opacity-70"
            style={{ borderColor: "rgba(248,245,240,0.2)", color: "rgba(248,245,240,0.6)" }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-[12px] font-semibold px-5 py-2 rounded-full transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#C9A97E", color: "#1D1D1F" }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
