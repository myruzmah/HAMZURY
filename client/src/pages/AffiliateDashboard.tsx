import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy, Copy, Check, ExternalLink, LayoutDashboard, Users, DollarSign, Wallet, LogOut, ArrowLeft, Gift, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PageMeta from "../components/PageMeta";
import { BRAND } from "../lib/brand";
import { ScrollArea } from "@/components/ui/scroll-area";
import { loadAffiliateSession, clearAffiliateSession, tryAffiliateCookieSession, type AffiliateSession } from "../lib/affiliateSession";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AffRecord {
  id: number;
  affiliateId: number;
  affiliateCode: string;
  leadId?: number | null;
  taskRef?: string | null;
  clientName?: string | null;
  service?: string | null;
  department?: string | null;
  quotedAmount?: string | null;
  commissionRate?: string | null;
  commissionAmount?: string | null;
  status: string;
  paidAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AffWithdrawal {
  id: number;
  affiliateId: number;
  amount: string;
  method: string;
  accountName?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  status: string;
  processedAt?: Date | string | null;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: string | number | null | undefined): string {
  const num = parseFloat(String(n ?? "0"));
  return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function statusColor(status: string) {
  if (status === "earned" || status === "active" || status === "completed") return "#16A34A";
  if (status === "paid") return "#2563EB";
  if (status === "pending" || status === "processing") return "#CA8A04";
  if (status === "rejected" || status === "suspended") return "#DC2626";
  return "#6B7280";
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1"
      style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
    >
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#999" }}>
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color: accent || BRAND.text }}>
        {value}
      </span>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: statusColor(status) + "18",
        color: statusColor(status),
      }}
    >
      {statusLabel(status)}
    </span>
  );
}

function CopyBtn({ text, label, variant }: { text: string; label: string; variant?: "gold" }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  const isGold = variant === "gold";
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition shrink-0"
      style={{
        background: copied ? "#16A34A" : isGold ? BRAND.gold : BRAND.federal,
        color: copied ? "#fff" : isGold ? "#2563EB" : BRAND.white,
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : `Copy ${label}`}
    </button>
  );
}

// ─── Withdrawal Form ──────────────────────────────────────────────────────────

function WithdrawalForm({ affiliateId, affiliateCode }: { affiliateId: number; affiliateCode: string }) {
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErr, setFieldErr] = useState("");

  const mutation = trpc.affiliate.requestWithdrawal.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
    },
    onError: (err: { message?: string }) => setFieldErr(err.message || "Request failed."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErr("");
    if (!amount || !accountName || !accountNumber || !bankName) {
      setFieldErr("All fields are required.");
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num < 10000) {
      setFieldErr("Minimum withdrawal is ₦10,000.");
      return;
    }
    if (accountNumber.replace(/\D/g, "").length < 10) {
      setFieldErr("Enter a valid 10-digit account number.");
      return;
    }
    mutation.mutate({ affiliateId, affiliateCode, amount, accountName, accountNumber, bankName });
  }

  if (success) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
      >
        <p className="text-sm font-semibold text-green-700 mb-1">Withdrawal Request Submitted</p>
        <p className="text-xs text-green-600">
          We'll process your request within 3–5 business days. You'll receive a confirmation when
          it's approved.
        </p>
        <button
          className="mt-4 text-xs underline text-green-700"
          onClick={() => setSuccess(false)}
        >
          Submit another request
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-lg text-sm outline-none";
  const inputStyle = {
    border: "1.5px solid #D5CFC6",
    background: "#FFFAF6",
    color: BRAND.text,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: BRAND.text }}>
          Amount (₦)
        </label>
        <input
          type="number"
          min="10000"
          placeholder="e.g. 10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "#999" }}>
          Minimum: ₦10,000
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: BRAND.text }}>
          Account Name
        </label>
        <input
          type="text"
          placeholder="As it appears on your bank account"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: BRAND.text }}>
          Account Number
        </label>
        <input
          type="text"
          placeholder="10-digit NUBAN"
          maxLength={10}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: BRAND.text }}>
          Bank Name
        </label>
        <input
          type="text"
          placeholder="e.g. Access Bank, GTBank"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>
      {fieldErr && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{fieldErr}</p>
      )}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-6 py-3 rounded-lg text-sm font-semibold transition"
        style={{
          background: mutation.isPending ? "#6B8E84" : BRAND.federal,
          color: BRAND.white,
          cursor: mutation.isPending ? "not-allowed" : "pointer",
        }}
      >
        {mutation.isPending ? "Submitting…" : "Request Withdrawal"}
      </button>
    </form>
  );
}

// ─── Marketing Assets ─────────────────────────────────────────────────────────

function MarketingAssets({ affiliate }: { affiliate: AffiliateSession }) {
  const referralLink = `https://hamzury.com/?ref=${affiliate.code}`;
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const assets = [
    {
      title: "BizDoc Consult",
      desc: "Business compliance services — CAC registration, FIRS, pension, permits.",
      link: `https://hamzury.com/bizdoc?ref=${affiliate.code}`,
    },
    {
      title: "Systemise",
      desc: "Revenue systems & business automation for Nigerian entrepreneurs.",
      link: `https://hamzury.com/systemise?ref=${affiliate.code}`,
    },
    {
      title: "HAMZURY Skills",
      desc: "Practical business education — faceless content, AI tools, IT programs.",
      link: `https://hamzury.com/skills?ref=${affiliate.code}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Referral link */}
      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: BRAND.text }}>
          Your Referral Link
        </p>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "#F0F4F8", border: "1px solid #D5CFC6" }}
        >
          <code className="flex-1 text-xs truncate" style={{ color: BRAND.federal }}>
            {referralLink}
          </code>
          <button
            onClick={copyLink}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            style={{
              background: copied ? "#16A34A" : BRAND.federal,
              color: BRAND.white,
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: "#888" }}>
          Share this link with potential clients. When they submit a lead and convert, your
          commission is credited automatically.
        </p>
      </div>

      {/* Department links */}
      <div>
        <p className="text-sm font-semibold mb-3" style={{ color: BRAND.text }}>
          Department Links
        </p>
        <div className="grid gap-3">
          {assets.map((a) => (
            <div
              key={a.title}
              className="rounded-xl p-4 flex items-start gap-4"
              style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: BRAND.text }}>
                  {a.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#777" }}>
                  {a.desc}
                </p>
                <code className="text-xs mt-1 block truncate" style={{ color: BRAND.federal }}>
                  {a.link}
                </code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(a.link)}
                className="text-xs px-2 py-1 rounded-lg shrink-0"
                style={{ background: "#F0F4F8", color: BRAND.federal }}
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media Templates */}
      <div
        className="rounded-xl p-5 flex items-center justify-between"
        style={{ background: BRAND.gold + "12", border: `1px solid ${BRAND.gold}30` }}
      >
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: BRAND.text }}>
            Social Media Templates
          </p>
          <p className="text-xs" style={{ color: "#777" }}>
            Ready-made graphics and captions for WhatsApp, Instagram, and Twitter.
          </p>
        </div>
        <Link href="/templates">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer shrink-0"
            style={{ background: BRAND.gold, color: "#2563EB" }}
          >
            <ExternalLink size={12} />
            View Templates
          </span>
        </Link>
      </div>

      {/* Tips */}
      <div
        className="rounded-xl p-5"
        style={{ background: BRAND.federal + "08", border: `1px solid ${BRAND.federal}22` }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: BRAND.federal }}>
          Tips for Successful Referrals
        </p>
        <ul className="space-y-2 text-xs" style={{ color: "#555" }}>
          {[
            "Share your BizDoc link with business owners who need CAC registration or compliance help.",
            "Mention specific problems HAMZURY solves — clients respond better to solutions than promotions.",
            "Follow up after sharing your link. A personal recommendation converts far better than a cold share.",
            "For Skills, target students and job seekers who want practical business skills.",
            "Your affiliate code is embedded in every link — always use your link, not the plain website URL.",
          ].map((tip, i) => (
            <li key={i} className="flex gap-2">
              <span style={{ color: BRAND.gold }}>→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Sidebar Sections ─────────────────────────────────────────────────────────

type Section = "overview" | "leads" | "earnings" | "withdraw" | "assets" | "league";

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AffiliateDashboard() {
  useLocation();
  const [affiliate, setAffiliate] = useState<AffiliateSession | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("overview");

  useEffect(() => {
    async function loadSession() {
      // Try cookie first
      const cookieSession = await tryAffiliateCookieSession();
      if (cookieSession) {
        setAffiliate(cookieSession);
        return;
      }
      // Fall back to localStorage
      const stored = loadAffiliateSession();
      if (stored) {
        setAffiliate(stored);
      } else {
        // Not authenticated
        window.location.href = "/affiliate";
      }
    }
    loadSession();
  }, []);

  const recordsQuery = trpc.affiliate.records.useQuery(
    { affiliateId: affiliate?.id ?? 0 },
    { enabled: !!affiliate?.id, refetchInterval: 30_000 }
  );
  const withdrawalsQuery = trpc.affiliate.withdrawals.useQuery(
    { affiliateId: affiliate?.id ?? 0 },
    { enabled: !!affiliate?.id, refetchInterval: 30_000 }
  );
  const statsQuery = trpc.affiliate.stats.useQuery(
    { affiliateId: affiliate?.id ?? 0 },
    { enabled: !!affiliate?.id, refetchInterval: 30_000 }
  );

  async function handleLogout() {
    try { await fetch("/api/affiliate-logout", { method: "POST", credentials: "include" }); } catch {}
    clearAffiliateSession();
    window.location.href = "/affiliate";
  }

  if (!affiliate) {
    return (
      <div
        style={{ background: BRAND.bg, minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <p className="text-sm" style={{ color: "#999" }}>
          Loading…
        </p>
      </div>
    );
  }

  const records: AffRecord[] = (recordsQuery.data ?? []) as AffRecord[];
  const withdrawals: AffWithdrawal[] = (withdrawalsQuery.data ?? []) as AffWithdrawal[];
  const stats = statsQuery.data;

  const pendingEarnings = stats?.pendingEarnings ?? 0;
  const totalPaid = stats?.totalPaid ?? 0;
  const totalReferrals = stats?.total ?? 0;
  const converted = stats?.converted ?? 0;

  const sidebarItems: { key: Section; icon: React.ElementType; label: string }[] = [
    { key: "overview",  icon: LayoutDashboard, label: "Overview" },
    { key: "leads",     icon: Users,           label: `Referrals${totalReferrals > 0 ? ` (${totalReferrals})` : ""}` },
    { key: "earnings",  icon: DollarSign,      label: "Earnings" },
    { key: "withdraw",  icon: Wallet,          label: "Withdrawals" },
    { key: "assets",    icon: Gift,            label: "Marketing Assets" },
    { key: "league",    icon: Award,           label: "League Table" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: BRAND.bg }}>
      <PageMeta
        title="Affiliate Dashboard — HAMZURY"
        description="Track your referrals, earnings, and withdrawals."
      />

      {/* ── Sidebar ── */}
      <div className="w-16 md:w-60 flex flex-col h-full shrink-0" style={{ backgroundColor: BRAND.federal }}>
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-center md:justify-start md:px-5 border-b shrink-0" style={{ borderColor: `${BRAND.gold}20` }}>
          <Trophy size={18} style={{ color: BRAND.gold }} />
          <span className="hidden md:block ml-2.5 font-medium text-sm" style={{ color: BRAND.gold }}>Affiliate</span>
        </div>

        {/* Affiliate info (visible on md+) */}
        <div className="hidden md:block px-4 py-3 border-b shrink-0" style={{ borderColor: `${BRAND.gold}15` }}>
          <p className="text-xs font-semibold truncate" style={{ color: BRAND.white }}>{affiliate.name}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: BRAND.gold }}>{affiliate.code}</p>
        </div>

        {/* Nav items */}
        <div className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="w-full flex items-center justify-center md:justify-start md:px-3 py-3 rounded-xl transition-all"
              style={{
                backgroundColor: activeSection === key ? `${BRAND.gold}18` : "transparent",
                color: activeSection === key ? BRAND.gold : `${BRAND.gold}60`,
              }}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden md:block ml-3 text-sm font-normal">{label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t shrink-0" style={{ borderColor: `${BRAND.gold}15` }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm"
            style={{ color: `${BRAND.gold}50` }}
          >
            <LogOut size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Sign Out</span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center md:justify-start md:px-3 py-2.5 rounded-xl transition-all text-sm mt-1"
            style={{ color: `${BRAND.gold}50` }}
          >
            <ArrowLeft size={16} className="shrink-0" />
            <span className="hidden md:block ml-3 font-normal">Back to HAMZURY</span>
          </Link>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0 bg-white" style={{ borderColor: `${BRAND.federal}10` }}>
          <div>
            <h1 className="text-base font-medium" style={{ color: BRAND.federal }}>
              {sidebarItems.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs opacity-40" style={{ color: BRAND.federal }}>{affiliate.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: BRAND.gold + "30", color: BRAND.gold }}>
              Affiliate
            </span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 max-w-5xl">

            {/* OVERVIEW */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: BRAND.text }}>
                    Welcome back, {affiliate.name.split(" ")[0]}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm" style={{ color: "#888" }}>Affiliate code:</span>
                    <code className="font-mono font-semibold text-sm" style={{ color: BRAND.gold }}>
                      {affiliate.code}
                    </code>
                    <CopyBtn text={affiliate.code} label="Code" />
                  </div>
                </div>

                {/* Referral link banner */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: `linear-gradient(135deg, #2563EB 0%, #1B4D3E 100%)`, border: `1px solid ${BRAND.gold}30` }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: BRAND.gold }}>
                    Your Referral Link
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <code
                      className="flex-1 text-sm font-medium px-4 py-2.5 rounded-lg truncate w-full"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
                    >
                      hamzury.com?ref={affiliate.code}
                    </code>
                    <CopyBtn text={`https://hamzury.com?ref=${affiliate.code}`} label="Link" variant="gold" />
                  </div>
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Share this link with potential clients. Commissions are tracked automatically.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <StatCard
                    label="Total Earnings"
                    value={fmt(pendingEarnings + totalPaid)}
                    accent={BRAND.gold}
                  />
                  <StatCard label="Total Referrals" value={String(totalReferrals)} />
                  <StatCard label="Converted" value={String(converted)} />
                  <StatCard
                    label="Pending Earnings"
                    value={fmt(pendingEarnings)}
                    accent="#CA8A04"
                  />
                  <StatCard label="Total Paid Out" value={fmt(totalPaid)} accent="#16A34A" />
                </div>

                {/* Recent records */}
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: BRAND.text }}>
                    Recent Referrals
                  </p>
                  {records.length === 0 ? (
                    <div
                      className="rounded-xl p-8 text-center"
                      style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
                    >
                      <p className="text-sm" style={{ color: "#999" }}>
                        No referrals yet. Share your affiliate link to get started.
                      </p>
                      <button
                        onClick={() => setActiveSection("assets")}
                        className="mt-3 text-xs underline"
                        style={{ color: BRAND.federal }}
                      >
                        Get your referral link →
                      </button>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid #E8E3DC", background: BRAND.white }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: "#FFFAF6", borderBottom: "1px solid #E8E3DC" }}>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                              Client
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "#888" }}>
                              Service
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                              Commission
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {records.slice(0, 5).map((r) => (
                            <tr
                              key={r.id}
                              style={{ borderBottom: "1px solid #F0EDE8" }}
                            >
                              <td className="px-4 py-3 font-medium" style={{ color: BRAND.text }}>
                                {r.clientName || "—"}
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "#666" }}>
                                {r.service || "—"}
                              </td>
                              <td className="px-4 py-3 font-semibold" style={{ color: BRAND.text }}>
                                {r.commissionAmount ? fmt(r.commissionAmount) : "Pending"}
                              </td>
                              <td className="px-4 py-3">
                                <Badge status={r.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {records.length > 5 && (
                        <div className="px-4 py-3 text-center">
                          <button
                            onClick={() => setActiveSection("leads")}
                            className="text-xs underline"
                            style={{ color: BRAND.federal }}
                          >
                            View all {records.length} referrals →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* How commissions work */}
                <div
                  className="rounded-xl p-5"
                  style={{ background: BRAND.federal + "06", border: `1px solid ${BRAND.federal}20` }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: BRAND.federal }}>
                    How Commissions Work
                  </p>
                  <ol className="space-y-1.5 text-xs" style={{ color: "#555" }}>
                    <li>1. You refer a client using your unique affiliate link.</li>
                    <li>2. The client submits a lead and signs on for a HAMZURY service.</li>
                    <li>3. When their task is completed and payment is confirmed, your commission is marked <strong>Earned</strong>.</li>
                    <li>4. Commissions are paid out weekly on Fridays via bank transfer.</li>
                    <li>5. Default commission rate: <strong>10%</strong> of the client's quoted service fee.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* LEAD TRACKER */}
            {activeSection === "leads" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold" style={{ color: BRAND.text }}>
                    Lead Tracker
                  </h2>
                  <p className="text-xs" style={{ color: "#888" }}>
                    {totalReferrals} referral{totalReferrals !== 1 ? "s" : ""} total
                  </p>
                </div>

                {records.length === 0 ? (
                  <div
                    className="rounded-xl p-10 text-center"
                    style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
                  >
                    <p className="text-sm" style={{ color: "#999" }}>
                      No referrals recorded yet.
                    </p>
                    <button
                      onClick={() => setActiveSection("assets")}
                      className="mt-3 text-xs underline"
                      style={{ color: BRAND.federal }}
                    >
                      Get your referral link →
                    </button>
                  </div>
                ) : (
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: "1px solid #E8E3DC", background: BRAND.white }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: "#FFFAF6", borderBottom: "1px solid #E8E3DC" }}>
                          <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                            Ref
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                            Client
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell" style={{ color: "#888" }}>
                            Service
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "#888" }}>
                            Quoted
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                            Commission
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>
                            Status
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold hidden lg:table-cell" style={{ color: "#888" }}>
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid #F0EDE8" }}>
                            <td className="px-4 py-3">
                              <code className="text-xs" style={{ color: BRAND.federal }}>
                                {r.taskRef || "—"}
                              </code>
                            </td>
                            <td className="px-4 py-3 font-medium" style={{ color: BRAND.text }}>
                              {r.clientName || "—"}
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: "#666" }}>
                              {r.service || "—"}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "#666" }}>
                              {r.quotedAmount ? fmt(r.quotedAmount) : "—"}
                            </td>
                            <td className="px-4 py-3 font-semibold" style={{ color: BRAND.text }}>
                              {r.commissionAmount ? fmt(r.commissionAmount) : "Pending"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge status={r.status} />
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: "#888" }}>
                              {new Date(r.createdAt).toLocaleDateString("en-NG", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* EARNINGS */}
            {activeSection === "earnings" && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold" style={{ color: BRAND.text }}>
                  Earnings Summary
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Pending (Awaiting Payout)" value={fmt(pendingEarnings)} accent="#CA8A04" />
                  <StatCard label="Total Paid Out" value={fmt(totalPaid)} accent="#16A34A" />
                  <StatCard
                    label="Total Earned (All Time)"
                    value={fmt(pendingEarnings + totalPaid)}
                    accent={BRAND.federal}
                  />
                </div>

                {/* Monthly Breakdown */}
                {(() => {
                  const months: Record<string, { earned: number; paid: number; count: number }> = {};
                  records.forEach((r) => {
                    if (!r.commissionAmount) return;
                    const d = new Date(r.createdAt);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    if (!months[key]) months[key] = { earned: 0, paid: 0, count: 0 };
                    const amt = parseFloat(String(r.commissionAmount));
                    months[key].count++;
                    if (r.status === "paid") months[key].paid += amt;
                    else months[key].earned += amt;
                  });
                  const sorted = Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
                  if (sorted.length === 0) return null;
                  return (
                    <div>
                      <p className="text-sm font-semibold mb-3" style={{ color: BRAND.text }}>
                        Monthly Breakdown
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sorted.map(([key, m]) => {
                          const [y, mo] = key.split("-");
                          const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-NG", { month: "long", year: "numeric" });
                          return (
                            <div
                              key={key}
                              className="rounded-xl p-4"
                              style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#888" }}>
                                {label}
                              </p>
                              <p className="text-lg font-bold" style={{ color: BRAND.text }}>
                                {fmt(m.earned + m.paid)}
                              </p>
                              <div className="flex gap-4 mt-1">
                                <span className="text-xs" style={{ color: "#CA8A04" }}>{fmt(m.earned)} pending</span>
                                <span className="text-xs" style={{ color: "#16A34A" }}>{fmt(m.paid)} paid</span>
                              </div>
                              <p className="text-xs mt-1" style={{ color: "#aaa" }}>{m.count} commission{m.count !== 1 ? "s" : ""}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: BRAND.text }}>
                    Earnings Breakdown
                  </p>
                  {records.filter((r) => r.commissionAmount).length === 0 ? (
                    <div
                      className="rounded-xl p-8 text-center"
                      style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
                    >
                      <p className="text-sm" style={{ color: "#999" }}>
                        No commissions earned yet.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid #E8E3DC", background: BRAND.white }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: "#FFFAF6", borderBottom: "1px solid #E8E3DC" }}>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Client</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "#888" }}>Service</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Rate</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Amount</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records
                            .filter((r) => r.commissionAmount)
                            .map((r) => (
                              <tr key={r.id} style={{ borderBottom: "1px solid #F0EDE8" }}>
                                <td className="px-4 py-3 font-medium" style={{ color: BRAND.text }}>{r.clientName || "—"}</td>
                                <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: "#666" }}>{r.service || "—"}</td>
                                <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{r.commissionRate || "10"}%</td>
                                <td className="px-4 py-3 font-semibold" style={{ color: BRAND.text }}>{fmt(r.commissionAmount)}</td>
                                <td className="px-4 py-3"><Badge status={r.status} /></td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payout schedule */}
                <div
                  className="rounded-xl p-5"
                  style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: BRAND.text }}>
                    Payout Schedule
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: "#666" }}>
                    <li>• Commissions are processed every <strong>Friday</strong> between 12pm – 5pm WAT.</li>
                    <li>• Minimum payout threshold: <strong>₦10,000</strong>.</li>
                    <li>• Withdrawals must be requested before Wednesday to be included in that week's batch.</li>
                    <li>• Bank transfers typically settle within 1 business day after processing.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* WITHDRAW */}
            {activeSection === "withdraw" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: BRAND.text }}>
                    Request Withdrawal
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "#888" }}>
                    Available balance:{" "}
                    <strong style={{ color: BRAND.text }}>{fmt(pendingEarnings)}</strong>
                  </p>
                </div>

                <WithdrawalForm affiliateId={affiliate.id} affiliateCode={affiliate.code} />

                {/* Past withdrawals */}
                {withdrawals.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-3" style={{ color: BRAND.text }}>
                      Past Withdrawal Requests
                    </p>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid #E8E3DC", background: BRAND.white }}
                    >
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: "#FFFAF6", borderBottom: "1px solid #E8E3DC" }}>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Date</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Amount</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "#888" }}>Bank</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.map((w) => (
                            <tr key={w.id} style={{ borderBottom: "1px solid #F0EDE8" }}>
                              <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>
                                {new Date(w.createdAt).toLocaleDateString("en-NG", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 font-semibold" style={{ color: BRAND.text }}>
                                {fmt(w.amount)}
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: "#666" }}>
                                {w.bankName || "—"} {w.accountNumber ? `•••${w.accountNumber.slice(-4)}` : ""}
                              </td>
                              <td className="px-4 py-3">
                                <Badge status={w.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MARKETING ASSETS */}
            {activeSection === "assets" && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold" style={{ color: BRAND.text }}>
                  Marketing Assets
                </h2>
                <MarketingAssets affiliate={affiliate} />
              </div>
            )}

            {/* LEAGUE — COMING SOON */}
            {activeSection === "league" && (
              <div
                className="rounded-2xl flex flex-col items-center justify-center text-center py-16 px-6"
                style={{ background: BRAND.white, border: "1px solid #E8E3DC" }}
              >
                <Trophy size={40} style={{ color: "#B48C4C" }} />
                <h2 className="text-lg font-bold mt-4" style={{ color: BRAND.text }}>
                  Affiliate Premier League
                </h2>
                <p className="text-sm mt-2 max-w-md" style={{ color: "#888" }}>
                  Coming Q3 2026 — Quarterly rankings, promotion/relegation, and rewards.
                </p>
              </div>
            )}

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
