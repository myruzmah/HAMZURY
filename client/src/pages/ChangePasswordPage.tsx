/**
 * ChangePasswordPage — first-login password change.
 * 2026-04-30. Lands here when /api/login returns firstLogin=true.
 * Apple-clean look matching the staff portal rebrand. Once the user
 * sets a new password (≥ 8 chars), redirects to ?next= or "/".
 */
import { useState } from "react";
import PageMeta from "@/components/PageMeta";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const BG = "#FFFBEB";              // Milk
const WHITE = "#FFFFFF";
const INK = "#1A1A1A";
const INK_MUTED = "#6B7280";
const HAIRLINE = "#E7E5E4";
const GREEN = "#1B4D3E";
const GOLD = "#B48C4C";
const RED = "#EF4444";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Read ?next= from URL
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const nextDestination = params.get("next") || "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm) { setError("New password and confirmation don't match."); return; }
    if (next === current) { setError("New password must be different from your current one."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't change password");
      window.location.href = nextDestination;
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <PageMeta title="Set your password — HAMZURY" description="First-login password change" />
      <div style={{
        maxWidth: 440, width: "100%",
        backgroundColor: WHITE, borderRadius: 16,
        border: `1px solid ${HAIRLINE}`,
        padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11,
            backgroundColor: `${GREEN}10`, color: GREEN,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
          }}>
            <Lock size={20} strokeWidth={1.75} />
          </div>
          <p style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>
            HAMZURY · First login
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: INK, letterSpacing: -0.4, margin: 0 }}>
            Set your password
          </h1>
          <p style={{ fontSize: 12, color: INK_MUTED, marginTop: 8, lineHeight: 1.6 }}>
            Welcome. Before you reach your dashboard, please set a new
            password. The seeded default is no longer accepted after this.
            Minimum 8 characters; not the same as your current one.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: INK_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>
              Current password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%", padding: "10px 36px 10px 12px", borderRadius: 9,
                  border: `1px solid ${HAIRLINE}`, fontSize: 13, color: INK,
                  backgroundColor: WHITE, fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(s => !s)}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  width: 26, height: 26, border: "none", background: "transparent",
                  color: INK_MUTED, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >{showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, color: INK_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>
              New password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                minLength={8}
                style={{
                  width: "100%", padding: "10px 36px 10px 12px", borderRadius: 9,
                  border: `1px solid ${HAIRLINE}`, fontSize: 13, color: INK,
                  backgroundColor: WHITE, fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => setShowNext(s => !s)}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  width: 26, height: 26, border: "none", background: "transparent",
                  color: INK_MUTED, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >{showNext ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
            <p style={{ fontSize: 10, color: INK_MUTED, marginTop: 5, lineHeight: 1.5 }}>
              At least 8 characters. Mix letters, numbers, and a symbol if you can — the system doesn't enforce, but stronger is better.
            </p>
          </div>

          <div>
            <label style={{ fontSize: 11, color: INK_MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 9,
                border: `1px solid ${confirm && confirm !== next ? RED : HAIRLINE}`, fontSize: 13, color: INK,
                backgroundColor: WHITE, fontFamily: "inherit",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: 9,
              backgroundColor: `${RED}10`, border: `1px solid ${RED}30`,
              color: RED, fontSize: 12, lineHeight: 1.45,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={busy || !current || !next || !confirm}
            style={{
              padding: "12px 18px", borderRadius: 10, border: "none",
              backgroundColor: !busy && current && next && confirm ? GREEN : `${INK_MUTED}30`,
              color: !busy && current && next && confirm ? GOLD : INK_MUTED,
              fontSize: 13, fontWeight: 700,
              cursor: busy ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 4,
            }}
          >
            {busy ? "Setting password…" : (
              <>
                Set password and continue
                <ArrowRight size={14} strokeWidth={2} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
