import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";

const TEAL  = "#0A1F1C";
const GOLD  = "#C9A97E";
const CREAM = "#F8F5F0";
const WHITE = "#FFFFFF";
const DARK  = "#2C2C2C";

const ROLE_META: Record<string, { label: string; name: string; hint: string; dashboard: string }> = {
  founder: { label: "Founder Access",        name: "Muhammad Hamzury", hint: "Enter your founder password", dashboard: "/founder/dashboard" },
  ceo:     { label: "CEO Access",            name: "Idris Ibrahim",    hint: "Enter your CEO password",     dashboard: "/hub/ceo"           },
  cso:     { label: "BizDoc Staff Login",    name: "CSO",              hint: "Enter your staff password",   dashboard: "/hub/cso"           },
  finance: { label: "Finance Staff Login",   name: "Finance",          hint: "Enter your staff password",   dashboard: "/hub/finance"       },
  hr:      { label: "HR Staff Login",        name: "HR",               hint: "Enter your staff password",   dashboard: "/hub/hr"            },
  bizdev:  { label: "BizDev Staff Login",    name: "BizDev",           hint: "Enter your staff password",   dashboard: "/hub/bizdev"        },
};

// All roles for the generic /staff-login page (no ?role= param)
const ALL_ROLES = [
  { id: "founder", label: "Founder — Muhammad Hamzury" },
  { id: "ceo",     label: "CEO — Idris Ibrahim"        },
  { id: "cso",     label: "Client Success Officer"     },
  { id: "finance", label: "Finance Officer"            },
  { id: "hr",      label: "HR Officer"                 },
  { id: "bizdev",  label: "Business Development"       },
];

export default function StaffLoginPage() {
  // Read ?role= from URL
  const params  = new URLSearchParams(window.location.search);
  const roleParam = params.get("role") ?? "";
  const isLocked  = roleParam in ROLE_META;               // true = came from a specific portal
  const meta      = ROLE_META[roleParam] ?? null;

  const [role, setRole]         = useState(isLocked ? roleParam : ALL_ROLES[0].id);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const currentMeta = ROLE_META[role];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Enter your password."); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = data.dashboard;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
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
            {isLocked ? currentMeta?.label : "Staff Portal"}
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-3xl p-8 border space-y-5"
          style={{ backgroundColor: WHITE, borderColor: `${GOLD}25`, boxShadow: "0 4px 40px rgba(10,31,28,0.08)" }}
        >
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: TEAL }}>
              Welcome back{isLocked && meta ? `, ${meta.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-[13px] mt-1" style={{ color: DARK, opacity: 0.45 }}>
              {isLocked && currentMeta ? currentMeta.hint : "Select your role and sign in"}
            </p>
          </div>

          {/* Role selector — only shown on generic /staff-login */}
          {!isLocked && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: DARK, opacity: 0.5 }}>
                Your Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none appearance-none"
                style={{ borderColor: `${GOLD}40`, backgroundColor: CREAM, color: TEAL }}
              >
                {ALL_ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          )}

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
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
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

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: TEAL, color: WHITE }}>
            <LogIn size={16} />
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-[12px] opacity-30 hover:opacity-60 transition-opacity" style={{ color: TEAL }}>
            ← Back to hamzury.com
          </a>
        </div>
      </div>
    </div>
  );
}
