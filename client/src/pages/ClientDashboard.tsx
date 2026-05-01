import React, { useState, useEffect } from "react";
import {
  LogOut, Shield, AlertTriangle, Clock, CheckCircle2,
  Building2, Phone, Mail, MapPin, CreditCard,
  ArrowRight, Calendar, AlertCircle, Info,
  FileText, RefreshCw, Loader2, XCircle,
} from "lucide-react";
import PageMeta from "../components/PageMeta";
import { trpc } from "@/lib/trpc";

/* ══════════════════════════════════════════════════════════════════════ */
/*  HAMZURY VERIFIED CLIENT DASHBOARD — MVP                              */
/*  Uses server-verified client truth layer only.                        */
/*  No mock data. No localStorage-only auth. No fabricated states.       */
/* ══════════════════════════════════════════════════════════════════════ */

/* ── Brand Colors ── */
const BG = "#FFFAF6";
const WHITE = "#FFFFFF";
const DARK = "#1A1A1A";
const MUTED = "#666666";
const GOLD = "#B48C4C";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const RED = "#EF4444";
const GREY = "#D1D5DB";

/* ── Utilities ── */
function formatNaira(amount: string | number | null | undefined) {
  if (!amount) return "—";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n) || n === 0) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  try { return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return date; }
}

/* ── Risk badge colors ── */
const RISK_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  none:     { bg: `${GREEN}15`, text: GREEN,  label: "On Track" },
  low:      { bg: `${GREEN}15`, text: GREEN,  label: "Low Risk" },
  medium:   { bg: `${ORANGE}15`, text: ORANGE, label: "Needs Attention" },
  high:     { bg: `${RED}15`,    text: RED,    label: "High Risk" },
  critical: { bg: `${RED}25`,    text: RED,    label: "Critical" },
};

/* ── Status badge colors ── */
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  active:     { bg: `${GREEN}15`, text: GREEN,  label: "Active" },
  converted:  { bg: `${GOLD}20`,  text: GOLD,   label: "Converted" },
  unverified: { bg: `${GREY}40`,  text: MUTED,  label: "Unverified" },
  dormant:    { bg: `${RED}15`,    text: RED,    label: "Dormant" },
};

/* ── Task status colors ── */
const TASK_STATUS: Record<string, { bg: string; text: string }> = {
  "Not Started":       { bg: `${GREY}40`,   text: MUTED },
  "In Progress":       { bg: `${GOLD}20`,   text: GOLD },
  "Waiting on Client": { bg: `${ORANGE}15`, text: ORANGE },
  "Submitted":         { bg: `${GREEN}15`,  text: GREEN },
  "Completed":         { bg: `${GREEN}20`,  text: GREEN },
};

/* ── InfoRow component ── */
function InfoRow({ icon: Icon, label, value, muted }: {
  icon: React.ElementType; label: string; value: string | React.ReactNode; muted?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0" }}>
      <Icon size={14} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: MUTED, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 14, color: muted ? MUTED : DARK, fontWeight: 500, wordBreak: "break-word" }}>{value || "—"}</p>
      </div>
    </div>
  );
}

/* ── Missing data indicator ── */
function MissingField({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 12, color: ORANGE, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}>
      <AlertCircle size={11} /> {label}
    </span>
  );
}

/* ── Card wrapper ── */
function Card({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div style={{
      backgroundColor: WHITE, borderRadius: 16, padding: "20px 20px 16px",
      border: `1px solid ${DARK}08`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Icon size={15} style={{ color: GOLD }} />
        <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: DARK }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  LOGIN GATE                                                           */
/* ══════════════════════════════════════════════════════════════════════ */

function LoginGate({ onVerified }: { onVerified: (token: string) => void }) {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyMutation = trpc.clientTruth.verify.useMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!ref.trim() || !phone.trim()) { setError("Both fields are required."); return; }
    setLoading(true);
    try {
      const result = await verifyMutation.mutateAsync({ ref: ref.trim(), phone: phone.trim() });
      // Store token in localStorage for session persistence across refreshes
      localStorage.setItem("hamzury-client-token", result.token);
      onVerified(result.token);
    } catch (err: any) {
      setError(err?.message || "No client found with that reference and phone number.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <PageMeta title="Client Dashboard — HAMZURY" />
      <form onSubmit={handleSubmit} style={{
        backgroundColor: WHITE, borderRadius: 24, padding: "48px 32px", maxWidth: 400, width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.06)", textAlign: "center",
      }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: 1 }}>HAMZURY</span>
        </div>
        <p style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 32 }}>Client Dashboard</p>

        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: DARK, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Reference Number
          </label>
          <input
            type="text" value={ref} onChange={e => setRef(e.target.value)}
            placeholder="HMZ-26/4-1818" required
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${DARK}12`,
              fontSize: 14, color: DARK, backgroundColor: BG, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: DARK, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Phone Number
          </label>
          <input
            type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="08012345678" required
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${DARK}12`,
              fontSize: 14, color: DARK, backgroundColor: BG, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {error && (
          <p style={{ color: RED, fontSize: 13, marginBottom: 16, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <XCircle size={14} /> {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
          backgroundColor: DARK, color: BG, fontSize: 14, fontWeight: 700,
          cursor: loading ? "wait" : "pointer", letterSpacing: 0.5, opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          {loading ? "Verifying..." : "Access Dashboard"}
        </button>

        <p style={{ marginTop: 24, fontSize: 11, color: `${DARK}30` }}>
          Enter the reference number and phone number provided by HAMZURY.
        </p>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  MAIN DASHBOARD VIEW                                                  */
/* ══════════════════════════════════════════════════════════════════════ */

function DashboardView({ token, onLogout }: { token: string; onLogout: () => void }) {
  // Fetch client data via verified session
  const clientQuery = trpc.clientTruth.session.useQuery(
    { token },
    { retry: 1, refetchOnWindowFocus: false },
  );

  // Fetch tasks via verified session
  const tasksQuery = trpc.clientTruth.tasks.useQuery(
    { token },
    { retry: 1, refetchOnWindowFocus: false },
  );

  // Fetch subscriptions via verified session
  const subsQuery = trpc.clientTruth.subscriptions.useQuery(
    { token },
    { retry: 1, refetchOnWindowFocus: false },
  );

  // Fetch invoices via verified session
  const invoicesQuery = trpc.clientTruth.invoices.useQuery(
    { token },
    { retry: 1, refetchOnWindowFocus: false },
  );

  // Handle invalid/expired session
  if (clientQuery.isLoading) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={24} style={{ color: GOLD }} className="animate-spin" />
          <p style={{ marginTop: 12, fontSize: 13, color: MUTED }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!clientQuery.data) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <AlertTriangle size={32} style={{ color: RED, marginBottom: 12 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 8 }}>Session Expired</h2>
          <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Your session has expired or is invalid. Please log in again.</p>
          <button onClick={onLogout} style={{
            padding: "10px 24px", borderRadius: 10, border: "none", backgroundColor: DARK,
            color: BG, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Log In Again
          </button>
        </div>
      </div>
    );
  }

  const c = clientQuery.data;
  const tasks = tasksQuery.data || [];
  const subs = subsQuery.data || [];
  const invoices = invoicesQuery.data || [];

  const statusInfo = STATUS_COLORS[c.status] || STATUS_COLORS.unverified;
  const riskInfo = RISK_COLORS[c.riskFlag || "none"] || RISK_COLORS.none;

  const completedTasks = tasks.filter((t: any) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "In Progress").length;
  const totalTasks = tasks.length;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      <PageMeta title={`${c.name} — HAMZURY Dashboard`} />

      {/* ── Header ── */}
      <header style={{
        backgroundColor: WHITE, borderBottom: `1px solid ${DARK}06`, padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color: DARK, letterSpacing: 0.5 }}>HAMZURY</span>
          <span style={{ fontSize: 11, color: GOLD, marginLeft: 8, fontWeight: 600 }}>Client Portal</span>
        </div>
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
          borderRadius: 8, border: `1px solid ${DARK}10`, backgroundColor: "transparent",
          fontSize: 12, color: MUTED, cursor: "pointer", fontWeight: 500,
        }}>
          <LogOut size={13} /> Sign Out
        </button>
      </header>

      {/* ── Content ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* ── Client Identity Card ── */}
        <Card title="Client Identity" icon={Building2}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: DARK, marginBottom: 2 }}>
                {c.businessName || c.name}
              </h2>
              {c.businessName && <p style={{ fontSize: 13, color: MUTED }}>{c.name}</p>}
            </div>
            <div style={{
              padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              backgroundColor: statusInfo.bg, color: statusInfo.text,
            }}>
              {statusInfo.label}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${DARK}06`, paddingTop: 8 }}>
            <InfoRow icon={FileText} label="Reference" value={
              <span style={{ fontFamily: "monospace", fontSize: 13, color: GOLD, fontWeight: 600 }}>{c.ref}</span>
            } />
            <InfoRow icon={Phone} label="Phone" value={c.phone || <MissingField label="Not on file" />} />
            <InfoRow icon={Mail} label="Email" value={c.email || <MissingField label="Not on file" />} />
            {c.location && <InfoRow icon={MapPin} label="Location" value={c.location} />}
            {c.department && (
              <InfoRow icon={Shield} label="Department" value={
                c.department === "bizdoc" ? "BizDoc — Business Documentation" :
                c.department === "systemise" ? "Systemise — Technology & Branding" :
                c.department === "skills" ? "Skills — Training & Development" :
                c.department
              } />
            )}
          </div>
        </Card>

        {/* ── Status & Risk Summary ── */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{
            backgroundColor: WHITE, borderRadius: 14, padding: 16, textAlign: "center",
            border: `1px solid ${DARK}06`,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16, margin: "0 auto 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: riskInfo.bg,
            }}>
              {(c.riskFlag === "high" || c.riskFlag === "critical")
                ? <AlertTriangle size={16} style={{ color: riskInfo.text }} />
                : <CheckCircle2 size={16} style={{ color: riskInfo.text }} />
              }
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: riskInfo.text }}>{riskInfo.label}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>Risk Status</p>
          </div>

          <div style={{
            backgroundColor: WHITE, borderRadius: 14, padding: 16, textAlign: "center",
            border: `1px solid ${DARK}06`,
          }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>{completedTasks}/{totalTasks}</p>
            <p style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>Tasks Completed</p>
            {inProgressTasks > 0 && (
              <p style={{ fontSize: 11, color: ORANGE, marginTop: 4 }}>{inProgressTasks} in progress</p>
            )}
          </div>
        </div>

        {/* ── Payment Summary ── */}
        <div style={{ marginTop: 16 }}>
          <Card title="Payment Summary" icon={CreditCard}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 8 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Contract</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{formatNaira(c.contractValue)}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Paid</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>{formatNaira(c.amountPaid)}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Balance</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: c.balance && parseFloat(c.balance) > 0 ? ORANGE : GREEN }}>
                  {formatNaira(c.balance)}
                </p>
              </div>
            </div>
            {!c.contractValue && !c.amountPaid && (
              <p style={{ fontSize: 12, color: ORANGE, fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
                <AlertCircle size={12} style={{ display: "inline", marginRight: 4 }} />
                Payment details are being confirmed by HAMZURY Finance.
              </p>
            )}
          </Card>
        </div>

        {/* ── Next Action ── */}
        {(c.nextAction || c.dueDate || c.currentBlocker) && (
          <div style={{ marginTop: 16 }}>
            <Card title="Next Steps" icon={ArrowRight}>
              {c.nextAction && <InfoRow icon={ArrowRight} label="Next Action" value={c.nextAction} />}
              {c.dueDate && <InfoRow icon={Calendar} label="Due Date" value={formatDate(c.dueDate)} />}
              {c.currentBlocker && (
                <div style={{
                  marginTop: 8, padding: "10px 12px", borderRadius: 10,
                  backgroundColor: `${ORANGE}10`, border: `1px solid ${ORANGE}20`,
                }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    Current Blocker
                  </p>
                  <p style={{ fontSize: 13, color: DARK }}>{c.currentBlocker}</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── Services / Tasks ── */}
        <div style={{ marginTop: 16 }}>
          <Card title="Services" icon={FileText}>
            {tasks.length === 0 ? (
              <p style={{ fontSize: 13, color: MUTED, fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
                No services recorded yet. Your HAMZURY team will update this as work begins.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tasks.map((task: any) => {
                  const ts = TASK_STATUS[task.status] || TASK_STATUS["Not Started"];
                  return (
                    <div key={task.id} style={{
                      padding: "12px 14px", borderRadius: 12, border: `1px solid ${DARK}06`,
                      backgroundColor: `${DARK}02`,
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 3 }}>{task.service}</p>
                          {task.businessName && (
                            <p style={{ fontSize: 11, color: MUTED }}>{task.businessName}</p>
                          )}
                        </div>
                        <span style={{
                          padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                          backgroundColor: ts.bg, color: ts.text, whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                          {task.status}
                        </span>
                      </div>
                      {(task.expectedDelivery || task.quotedPrice) && (
                        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                          {task.expectedDelivery && (
                            <span style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                              <Calendar size={11} /> Est. {formatDate(task.expectedDelivery)}
                            </span>
                          )}
                          {task.quotedPrice && (
                            <span style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                              <CreditCard size={11} /> {formatNaira(task.quotedPrice)}
                            </span>
                          )}
                        </div>
                      )}
                      {task.department && (
                        <span style={{ fontSize: 10, color: GOLD, marginTop: 6, display: "inline-block" }}>
                          {task.department === "bizdoc" ? "BizDoc" : task.department === "systemise" ? "Systemise" : task.department === "skills" ? "Skills" : task.department}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Subscriptions ── */}
        {subs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Card title="Subscriptions" icon={RefreshCw}>
              {subs.map((sub: any) => (
                <div key={sub.id} style={{
                  padding: "12px 14px", borderRadius: 12, border: `1px solid ${DARK}06`,
                  backgroundColor: `${DARK}02`, marginBottom: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{sub.service}</p>
                    <span style={{
                      padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 600,
                      backgroundColor: sub.status === "active" ? `${GREEN}15` : `${RED}15`,
                      color: sub.status === "active" ? GREEN : RED,
                    }}>
                      {sub.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: MUTED }}>
                      {formatNaira(sub.monthlyFee)}/month
                    </span>
                    <span style={{ fontSize: 12, color: MUTED }}>
                      Billing day: {sub.billingDay}
                    </span>
                    <span style={{ fontSize: 12, color: MUTED }}>
                      Since {sub.startDate}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── Invoices ── */}
        {invoices.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Card title="Invoices" icon={FileText}>
              {invoices.map((inv: any) => (
                <div key={inv.id} style={{
                  padding: "10px 14px", borderRadius: 10, border: `1px solid ${DARK}06`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 6,
                }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: DARK, fontFamily: "monospace" }}>
                      {inv.invoiceNumber}
                    </span>
                    <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>
                      {formatNaira(inv.total)}
                    </span>
                  </div>
                  <span style={{
                    padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600,
                    backgroundColor: inv.status === "paid" ? `${GREEN}15` : inv.status === "overdue" ? `${RED}15` : `${GOLD}15`,
                    color: inv.status === "paid" ? GREEN : inv.status === "overdue" ? RED : GOLD,
                  }}>
                    {inv.status}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── Contact HAMZURY ── */}
        <div style={{
          marginTop: 24, textAlign: "center", padding: "20px 16px",
          backgroundColor: WHITE, borderRadius: 16, border: `1px solid ${DARK}06`,
        }}>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
            Questions about your project?
          </p>
          <a
            href="/contact"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 10, backgroundColor: DARK,
              color: BG, fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            <Phone size={14} /> Contact HAMZURY
          </a>
          <p style={{ fontSize: 10, color: `${DARK}25`, marginTop: 12 }}>
            CSO: Maryam Ashir Lalo — 08067149356
          </p>
        </div>

        {/* ── Footer ── */}
        <p style={{ textAlign: "center", fontSize: 10, color: `${DARK}20`, marginTop: 24 }}>
          Powered by HAMZURY — Structure Builds Empires
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  ROOT COMPONENT                                                       */
/* ══════════════════════════════════════════════════════════════════════ */

export default function ClientDashboard() {
  const [token, setToken] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem("hamzury-client-token");
    if (stored) setToken(stored);
  }, []);

  function handleLogout() {
    localStorage.removeItem("hamzury-client-token");
    setToken(null);
  }

  if (!token) {
    return <LoginGate onVerified={setToken} />;
  }

  return <DashboardView token={token} onLogout={handleLogout} />;
}
