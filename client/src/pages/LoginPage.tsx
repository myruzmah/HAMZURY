import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

const TEAL  = "#86868B";   // Apple grey — general
const GOLD  = "#C9A97E";
const CREAM = "#FAFAF8";   // Milk white
const WHITE = "#FFFFFF";
const DARK  = "#1D1D1F";

export default function LoginPage() {
  const [staffId, setStaffId]   = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Post-login state
  const [loginResult, setLoginResult] = useState<{
    name: string; role: string; dashboard: string;
  } | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Password change form
  const [currentPw, setCurrentPw]             = useState("");
  const [newPw, setNewPw]                     = useState("");
  const [confirmPw, setConfirmPw]             = useState("");
  const [changePwError, setChangePwError]     = useState("");
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [showNewPw, setShowNewPw]             = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const id = staffId.trim().toUpperCase();
    if (!id) { setError("Please enter your Staff ID."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ staffId: id, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setLoginResult({ name: data.name, role: data.role, dashboard: data.dashboard });
      if (data.firstLogin) {
        setShowChangeModal(true);
      } else {
        window.location.href = data.dashboard;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPw) { setChangePwError("Please enter a new password."); return; }
    if (newPw.length < 8) { setChangePwError("Password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setChangePwError("Passwords do not match."); return; }
    setChangePwLoading(true);
    setChangePwError("");
    try {
      const res  = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      window.location.href = loginResult?.dashboard ?? "/";
    } catch (e: unknown) {
      setChangePwError(e instanceof Error ? e.message : String(e));
    } finally {
      setChangePwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: CREAM }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="text-3xl font-light tracking-tight" style={{ color: TEAL, letterSpacing: "-0.04em" }}>
            HAMZURY
          </a>
          <p className="text-[11px] font-medium tracking-[0.25em] uppercase mt-1" style={{ color: GOLD }}>
            Staff Portal
          </p>
        </div>

        {/* Login Card */}
        {!showChangeModal && (
          <form
            onSubmit={handleLogin}
            className="rounded-3xl p-8 border space-y-5"
            style={{ backgroundColor: WHITE, borderColor: `${GOLD}25`, boxShadow: "0 4px 40px rgba(10,31,28,0.08)" }}
          >
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: TEAL }}>Welcome back</h1>
              <p className="text-[13px] mt-1" style={{ color: DARK, opacity: 0.45 }}>Sign in with your Staff ID</p>
            </div>

            {/* Staff ID */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>
                Staff ID
              </label>
              <input
                type="text"
                placeholder="HMZ001-26/3"
                value={staffId}
                onChange={e => { setStaffId(e.target.value.toUpperCase()); setError(""); }}
                disabled={loading}
                autoFocus
                autoComplete="username"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none disabled:opacity-50 transition-all font-mono tracking-wider"
                style={{ borderColor: `${GOLD}40`, backgroundColor: CREAM, color: TEAL }}
                onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
                onBlur={e => (e.currentTarget.style.borderColor = `${GOLD}40`)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none pr-11 disabled:opacity-50 transition-all"
                  style={{ borderColor: error ? "#EF4444" : `${GOLD}40`, backgroundColor: CREAM, color: DARK }}
                  onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
                  onBlur={e => (e.currentTarget.style.borderColor = error ? "#EF4444" : `${GOLD}40`)}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity"
                  style={{ color: TEAL }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && <p className="text-[11px] mt-1.5" style={{ color: "#EF4444" }}>{error}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: TEAL, color: WHITE }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        )}

        {/* First-login password change */}
        {showChangeModal && loginResult && (
          <div className="rounded-3xl p-8 border space-y-5"
            style={{ backgroundColor: WHITE, borderColor: `${GOLD}25`, boxShadow: "0 4px 40px rgba(10,31,28,0.08)" }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-semibold tracking-tight" style={{ color: TEAL }}>
                  Welcome, {loginResult.name.split(" ")[0]}
                </h1>
                <button onClick={() => { window.location.href = loginResult.dashboard; }}
                  className="opacity-30 hover:opacity-70 transition-opacity" style={{ color: TEAL }}>
                  <X size={18} />
                </button>
              </div>
              <p className="text-[13px]" style={{ color: DARK, opacity: 0.5 }}>
                Set a personal password to replace your default.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>
                  Current Password
                </label>
                <input type="password" placeholder="Your current password"
                  value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                  style={{ borderColor: `${GOLD}40`, backgroundColor: CREAM, color: DARK }}
                  onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
                  onBlur={e => (e.currentTarget.style.borderColor = `${GOLD}40`)} />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>
                  New Password
                </label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} placeholder="At least 8 characters"
                    value={newPw} onChange={e => setNewPw(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none pr-11 transition-all"
                    style={{ borderColor: `${GOLD}40`, backgroundColor: CREAM, color: DARK }}
                    onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
                    onBlur={e => (e.currentTarget.style.borderColor = `${GOLD}40`)} />
                  <button type="button" onClick={() => setShowNewPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-70 transition-opacity" style={{ color: TEAL }}>
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>
                  Confirm Password
                </label>
                <input type="password" placeholder="Repeat new password"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
                  style={{ borderColor: `${GOLD}40`, backgroundColor: CREAM, color: DARK }}
                  onFocus={e => (e.currentTarget.style.borderColor = TEAL)}
                  onBlur={e => (e.currentTarget.style.borderColor = `${GOLD}40`)} />
              </div>
              {changePwError && <p className="text-[11px]" style={{ color: "#EF4444" }}>{changePwError}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button"
                  onClick={() => { window.location.href = loginResult.dashboard; }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border transition-opacity hover:opacity-70"
                  style={{ borderColor: `${TEAL}20`, color: TEAL }}>
                  Later
                </button>
                <button type="submit" disabled={changePwLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: TEAL, color: WHITE }}>
                  {changePwLoading ? "Saving…" : "Set Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center mt-6">
          <a href="/" className="text-[11px] opacity-25 hover:opacity-50 transition-opacity" style={{ color: TEAL }}>
            ← hamzury.com
          </a>
        </div>
      </div>
    </div>
  );
}
