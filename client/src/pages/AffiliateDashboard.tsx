import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PageMeta from "../components/PageMeta";
import { BRAND } from "../lib/brand";
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
    if (isNaN(num) || num < 5000) {
      setFieldErr("Minimum withdrawal is ₦5,000.");
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
    background: "#FAFAF8",
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
          min="5000"
          placeholder="e.g. 15000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
        <p className="text-xs mt-1" style={{ color: "#999" }}>
          Minimum: ₦5,000
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

// ─── League Table ─────────────────────────────────────────────────────────────

const TIER_CONFIG = [
  { name: "Elite",        min: 1,  max: 10, rate: 15, color: "#C9A97E", bg: "#FDF8F0" },
  { name: "Premier",      min: 11, max: 20, rate: 12, color: "#3B82F6", bg: "#EFF6FF" },
  { name: "Standard",     min: 21, max: 30, rate: 10, color: "#16A34A", bg: "#F0FDF4" },
  { name: "Entry",        min: 31, max: 40, rate: 8,  color: "#6B7280", bg: "#F9FAFB" },
  { name: "Waiting Pool", min: 41, max: 50, rate: 0,  color: "#94A3B8", bg: "#F8FAFC" },
];

function getTierForRank(rank: number) {
  return TIER_CONFIG.find((t) => rank >= t.min && rank <= t.max) ?? TIER_CONFIG[4];
}

function getLeagueStatus(rank: number): { label: string; color: string } {
  // Bottom 10 of active (41-50 are Waiting Pool)
  if (rank >= 41) return { label: "Danger ⚠️", color: "#EF4444" };
  // Danger zone: last 3 in each tier (positions 8-10, 18-20, 28-30, 38-40)
  const posInTier = ((rank - 1) % 10) + 1;
  if (posInTier >= 8) return { label: "Danger ⚠️", color: "#EF4444" };
  // Top 10 of waiting pool promoted
  if (rank <= 5) return { label: "Promoted ↑", color: "#16A34A" };
  return { label: "Stable", color: "#6B7280" };
}

// Generate 50 mock affiliates; current user placed at rank 14
function buildLeagueTable(userName: string, userEarnings: number) {
  const mockNames = [
    "Chukwuemeka A.", "Ngozi B.", "Taiwo F.", "Babatunde O.", "Amina S.",
    "Oluwaseun K.", "Fatima M.", "Emeka D.", "Chisom N.", "Kelechi I.",
    "Aisha R.", "Segun T.", "Yetunde L.", "Mustapha G.", "Blessing E.",
    "Adaeze U.", "Damilola H.", "Uche P.", "Sade W.", "Ibrahim C.",
    "Temitope A.", "Nkechi V.", "Biodun J.", "Zainab Q.", "Rotimi X.",
    "Chidinma Y.", "Kehinde Z.", "Folake B.", "Tunde M.", "Esther K.",
    "Onyeka R.", "Gbemisola T.", "Chidi S.", "Hauwa D.", "Lola F.",
    "Victor E.", "Nnamdi L.", "Adunola C.", "Samuel O.", "Patience N.",
    "Chukwudi A.", "Rashida B.", "Ope T.", "Funmi G.", "Okechukwu S.",
    "Miriam E.", "Tayo D.", "Bola H.", "Nora P.", "Emeka W.",
  ];

  const USER_RANK = 14;
  const userPoints = Math.max(Math.round(userEarnings / 1000), 5);

  // Build base points: rank 1 highest, descending
  const rows: Array<{
    rank: number;
    name: string;
    points: number;
    isUser: boolean;
  }> = [];

  let mockIdx = 0;
  for (let rank = 1; rank <= 50; rank++) {
    if (rank === USER_RANK) {
      rows.push({ rank, name: userName, points: userPoints, isUser: true });
    } else {
      // Points: roughly 200 at rank 1, decrement by ~3 per rank, add jitter
      const base = Math.max(200 - rank * 3, 2);
      const jitter = Math.floor((rank * 7 + mockIdx * 13) % 20) - 10;
      const pts = Math.max(base + jitter, 1);
      rows.push({ rank, name: mockNames[mockIdx % mockNames.length], points: pts, isUser: false });
      mockIdx++;
    }
  }
  return rows;
}

function LeagueTable({
  affiliate,
  totalEarnings,
}: {
  affiliate: AffiliateSession;
  totalEarnings: number;
}) {
  const USER_RANK = 14;
  const userTier = getTierForRank(USER_RANK);
  const posInTier = ((USER_RANK - 1) % 10) + 1;
  const isDangerZone = posInTier >= 8;
  const userPoints = Math.max(Math.round(totalEarnings / 1000), 5);
  const table = buildLeagueTable(affiliate.name, totalEarnings);

  return (
    <div className="space-y-6">
      {/* User position card */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between"
        style={{
          background: userTier.bg,
          border: `2px solid ${userTier.color}40`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
            style={{ background: userTier.color, color: "#fff" }}
          >
            #{USER_RANK}
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: BRAND.text }}>
              {affiliate.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: userTier.color + "22", color: userTier.color }}
              >
                {userTier.name} Tier
              </span>
              <span className="text-xs" style={{ color: "#888" }}>
                {userTier.rate === 0 ? "₦1,000 flat/referral" : `${userTier.rate}% commission`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-6 sm:text-right">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#999" }}>
              Points
            </p>
            <p className="text-2xl font-bold" style={{ color: userTier.color }}>
              {userPoints}
            </p>
          </div>
          {isDangerZone && (
            <div
              className="rounded-xl px-4 py-2 flex flex-col justify-center"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <p className="text-xs font-bold text-red-600">Danger Zone</p>
              <p className="text-xs text-red-500 mt-0.5">Risk of relegation</p>
            </div>
          )}
        </div>
      </div>

      {/* Full league table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #E8E3DC", background: BRAND.white }}
      >
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #E8E3DC" }}>
          <Trophy size={16} style={{ color: "#C9A97E" }} />
          <p className="text-sm font-semibold" style={{ color: BRAND.text }}>
            Affiliate League Table — Q2 2026
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#F8F5F0", borderBottom: "1px solid #E8E3DC" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold w-16" style={{ color: "#888" }}>Rank</th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Affiliate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: "#888" }}>Tier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Points</th>
                <th className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell" style={{ color: "#888" }}>Rate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: "#888" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, idx) => {
                const tier = getTierForRank(row.rank);
                const status = getLeagueStatus(row.rank);
                // Add tier divider before first row of each tier
                const isFirstInTier =
                  idx === 0 || getTierForRank(table[idx - 1].rank).name !== tier.name;

                return (
                  <>
                    {isFirstInTier && (
                      <tr key={`divider-${tier.name}`}>
                        <td
                          colSpan={6}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest"
                          style={{ background: tier.color + "18", color: tier.color, borderBottom: `1px solid ${tier.color}30` }}
                        >
                          {tier.name} — {tier.rate === 0 ? "₦1,000 flat/referral" : `${tier.rate}% commission`}
                        </td>
                      </tr>
                    )}
                    <tr
                      key={row.rank}
                      style={{
                        borderBottom: "1px solid #F0EDE8",
                        background: row.isUser ? tier.color + "10" : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                          style={{
                            background: tier.color + (row.isUser ? "33" : "18"),
                            color: tier.color,
                          }}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-medium text-sm"
                          style={{ color: row.isUser ? BRAND.federal : BRAND.text }}
                        >
                          {row.name}
                        </span>
                        {row.isUser && (
                          <span
                            className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: BRAND.federal + "18", color: BRAND.federal }}
                          >
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: tier.color + "18", color: tier.color }}
                        >
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: BRAND.text }}>
                        {row.points}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: "#666" }}>
                        {tier.rate === 0 ? "₦1k flat" : `${tier.rate}%`}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relegation info card */}
      <div
        className="rounded-2xl p-5 grid sm:grid-cols-3 gap-4"
        style={{ background: BRAND.federal + "06", border: `1px solid ${BRAND.federal}20` }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: BRAND.federal }}>
            Next Review
          </p>
          <p className="text-sm font-bold" style={{ color: BRAND.text }}>End of Q2 2026</p>
          <p className="text-xs mt-0.5" style={{ color: "#888" }}>30 June 2026</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#EF4444" }}>
            Relegation
          </p>
          <p className="text-xs" style={{ color: "#555" }}>
            Bottom 10 active affiliates this quarter will move to the Waiting Pool.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#16A34A" }}>
            Promotion
          </p>
          <p className="text-xs" style={{ color: "#555" }}>
            Top 10 in the Waiting Pool will be promoted to Entry tier active slots.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type Tab = "overview" | "leads" | "earnings" | "withdraw" | "assets" | "league";

export default function AffiliateDashboard() {
  useLocation();
  const [affiliate, setAffiliate] = useState<AffiliateSession | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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

  const tabs: { id: Tab; label: string; icon?: React.ReactNode }[] = [
    { id: "overview", label: "Overview" },
    { id: "leads", label: `Lead Tracker${totalReferrals > 0 ? ` (${totalReferrals})` : ""}` },
    { id: "earnings", label: "Earnings" },
    { id: "withdraw", label: "Withdraw" },
    { id: "assets", label: "Marketing Assets" },
    { id: "league", label: "League Table", icon: <Trophy size={14} /> },
  ];

  return (
    <div style={{ background: BRAND.bg, minHeight: "100vh" }}>
      <PageMeta
        title="Affiliate Dashboard — HAMZURY"
        description="Track your referrals, earnings, and withdrawals."
      />

      {/* Top nav */}
      <header
        className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
        style={{
          background: BRAND.federal,
          boxShadow: "0 1px 12px rgba(0,0,0,0.18)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/">
            <span
              className="font-bold tracking-widest cursor-pointer text-sm"
              style={{ color: BRAND.white, letterSpacing: "0.2em" }}
            >
              HAMZURY
            </span>
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: BRAND.gold + "30", color: BRAND.gold }}>
            Affiliate
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold" style={{ color: BRAND.white }}>
              {affiliate.name}
            </p>
            <p className="text-xs" style={{ color: BRAND.gold }}>
              {affiliate.code}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg transition"
            style={{ background: "rgba(255,255,255,0.12)", color: BRAND.white }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div
        className="border-b px-6 overflow-x-auto"
        style={{ background: BRAND.white, borderColor: "#E8E3DC" }}
      >
        <div className="flex gap-0 min-w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-5 py-4 text-sm font-medium transition border-b-2 whitespace-nowrap flex items-center gap-1.5"
              style={{
                borderColor: activeTab === t.id ? BRAND.federal : "transparent",
                color: activeTab === t.id ? BRAND.federal : "#888",
              }}
            >
              {t.icon && <span style={{ color: activeTab === t.id ? BRAND.federal : "#888" }}>{t.icon}</span>}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: BRAND.text }}>
                Welcome back, {affiliate.name.split(" ")[0]}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#888" }}>
                Affiliate code:{" "}
                <code className="font-mono font-semibold" style={{ color: BRAND.federal }}>
                  {affiliate.code}
                </code>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                    onClick={() => setActiveTab("assets")}
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
                      <tr style={{ background: "#F8F5F0", borderBottom: "1px solid #E8E3DC" }}>
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
                        onClick={() => setActiveTab("leads")}
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
        {activeTab === "leads" && (
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
                  onClick={() => setActiveTab("assets")}
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
                    <tr style={{ background: "#F8F5F0", borderBottom: "1px solid #E8E3DC" }}>
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
        {activeTab === "earnings" && (
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
                      <tr style={{ background: "#F8F5F0", borderBottom: "1px solid #E8E3DC" }}>
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
                <li>• Minimum payout threshold: <strong>₦5,000</strong>.</li>
                <li>• Withdrawals must be requested before Wednesday to be included in that week's batch.</li>
                <li>• Bank transfers typically settle within 1 business day after processing.</li>
              </ul>
            </div>
          </div>
        )}

        {/* WITHDRAW */}
        {activeTab === "withdraw" && (
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
                      <tr style={{ background: "#F8F5F0", borderBottom: "1px solid #E8E3DC" }}>
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
        {activeTab === "assets" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold" style={{ color: BRAND.text }}>
              Marketing Assets
            </h2>
            <MarketingAssets affiliate={affiliate} />
          </div>
        )}

        {/* LEAGUE TABLE */}
        {activeTab === "league" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: BRAND.text }}>
                <Trophy size={18} style={{ color: "#C9A97E" }} />
                Affiliate League Table
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#888" }}>
                50 active affiliate slots ranked by quarterly performance. Bottom 10 are relegated each quarter.
              </p>
            </div>
            <LeagueTable
              affiliate={affiliate}
              totalEarnings={pendingEarnings + totalPaid}
            />
          </div>
        )}
      </main>
    </div>
  );
}
