import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2, LogOut, ArrowLeft, DollarSign, Calculator,
  CheckCircle2, Clock, TrendingUp, PieChart, Wallet, FileText, Plus, Trash2, X,
  BarChart3, Bot, Trophy,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { calculateCommission, formatNaira } from "@shared/commission";

export default function FinanceDashboard() {
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();

  const commissionsQuery = trpc.commissions.list.useQuery(undefined, { refetchInterval: 15000 });
  const statsQuery = trpc.institutional.stats.useQuery();
  const tasksQuery = trpc.tasks.list.useQuery();
  const subsQuery = trpc.subscriptions.list.useQuery();
  const allPaymentsQuery = trpc.subscriptions.allPayments.useQuery();
  const recordPaymentMutation = trpc.subscriptions.recordPayment.useMutation({
    onSuccess: () => { allPaymentsQuery.refetch(); toast.success("Payment recorded"); },
    onError: () => toast.error("Failed to record payment"),
  });
  const [payingMonth, setPayingMonth] = useState<{ subscriptionId: number; month: string; amountDue: number } | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [subsFilter, setSubsFilter] = useState<"all" | "active" | "paused" | "cancelled" | "overdue">("all");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFAF6" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "#B48C4C" }} />
      </div>
    );
  }
  if (!user) return null;

  const commissions = commissionsQuery.data || [];
  const stats = statsQuery.data;
  const completedTasks = (tasksQuery.data || []).filter(t => t.status === "Completed");

  const totalRevenue = commissions.reduce((s, c) => s + Number(c.quotedPrice || 0), 0);
  const totalInstitutional = commissions.reduce((s, c) => s + Number(c.institutionalAmount || 0), 0);
  const totalPool = commissions.reduce((s, c) => s + Number(c.commissionPool || 0), 0);
  const pendingCount = commissions.filter(c => c.status === "pending").length;
  const approvedCount = commissions.filter(c => c.status === "approved").length;
  const paidCount = commissions.filter(c => c.status === "paid").length;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFAF6" }}>
      <PageMeta title="Finance Dashboard — HAMZURY" description="Commissions and finance overview for HAMZURY staff." />
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 px-4 md:px-8 py-3 bg-[#2D2D2D] z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[13px] font-semibold flex items-center gap-1 transition-colors" style={{ color: "#B48C4C" }}>
            <ArrowLeft size={14} /> HAMZURY
          </Link>
          <span className="text-[#FFFAF6]/20">|</span>
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: "#B48C4C" }} />
            <span className="text-lg font-bold" style={{ color: "#FFFAF6" }}>Finance Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="hidden md:block text-[#FFFAF6]/20">|</span>
          <span className="text-[13px] hidden md:block" style={{ color: "#B48C4C" }}>{user.name || user.email}</span>
          <button onClick={logout} className="flex items-center gap-1 text-[13px]" style={{ color: "#FFFAF6" }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="pt-[56px] p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <FinStatCard label="Total Revenue" value={formatNaira(totalRevenue)} color="#B48C4C" icon={<TrendingUp size={16} />} />
          <FinStatCard label="Staff Pool (40%)" value={formatNaira(totalPool)} color="#22C55E" icon={<DollarSign size={16} />} />
          <FinStatCard label="Institutional (60%)" value={formatNaira(totalInstitutional)} color="#2D2D2D" icon={<PieChart size={16} />} />
          <FinStatCard label="Pending" value={String(pendingCount)} color="#EAB308" icon={<Clock size={16} />} />
          <FinStatCard label="Approved" value={String(approvedCount)} color="#3B82F6" icon={<CheckCircle2 size={16} />} />
          <FinStatCard label="Paid Out" value={String(paidCount)} color="#22C55E" icon={<CheckCircle2 size={16} />} />
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="mb-6 bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <TabsTrigger value="calculator" className="gap-1.5"><Calculator size={14} /> Calculator</TabsTrigger>
            <TabsTrigger value="commissions" className="gap-1.5"><DollarSign size={14} /> Commissions ({commissions.length})</TabsTrigger>
            <TabsTrigger value="payouts" className="gap-1.5"><Wallet size={14} /> Payout Queue</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5"><TrendingUp size={14} /> Subscriptions</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5"><FileText size={14} /> Invoices</TabsTrigger>
            <TabsTrigger value="allocations" className="gap-1.5"><BarChart3 size={14} /> Allocations</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <CommissionCalculator />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionList commissions={commissions} onRefresh={() => commissionsQuery.refetch()} />
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutQueue commissions={commissions.filter(c => c.status === "approved")} onRefresh={() => commissionsQuery.refetch()} />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider font-bold opacity-40" style={{ color: "#2D2D2D" }}>Filter:</span>
              {(["all", "active", "paused", "cancelled", "overdue"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSubsFilter(f)}
                  className="text-[11px] px-3 py-1.5 rounded-full font-medium transition-colors"
                  style={{
                    backgroundColor: subsFilter === f ? "#2D2D2D" : "#2D2D2D08",
                    color: subsFilter === f ? "#B48C4C" : "#2D2D2D",
                  }}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#2D2D2D10" }}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: "#2D2D2D06", borderColor: "#2D2D2D08" }}>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Client</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Service</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Monthly Amount</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Status</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Next Payment Due</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Payment</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#2D2D2D" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(subsQuery.data || []).filter(sub => {
                    if (subsFilter === "all") return true;
                    if (subsFilter === "overdue") {
                      const currentMonth = new Date().toISOString().slice(0, 7);
                      const today = new Date().getDate();
                      const monthPayment = (allPaymentsQuery.data || []).find(p => p.subscriptionId === sub.id && p.month === currentMonth);
                      return sub.status === "active" && !monthPayment && today > (sub.billingDay ?? 1);
                    }
                    return sub.status === subsFilter;
                  }).map(sub => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const today = new Date();
                    const billingDay = sub.billingDay ?? 1;
                    const monthPayment = (allPaymentsQuery.data || []).find(p => p.subscriptionId === sub.id && p.month === currentMonth);
                    const isOverdue = sub.status === "active" && !monthPayment && today.getDate() > billingDay;

                    // Calculate next payment due date
                    const nextDueDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
                    if (monthPayment?.status === "paid" || today.getDate() > billingDay) {
                      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                    }
                    const nextDueStr = nextDueDate.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

                    const subStatusColor = sub.status === "active" ? "bg-green-100 text-green-700" :
                      sub.status === "paused" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-600";

                    return (
                      <tr key={sub.id} className="border-b hover:bg-gray-50" style={{ borderColor: "#2D2D2D06" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "#2D2D2D" }}>{sub.clientName}</td>
                        <td className="px-4 py-3 opacity-60" style={{ color: "#2D2D2D" }}>{sub.service}</td>
                        <td className="px-4 py-3" style={{ color: "#B48C4C" }}>₦{Number(sub.monthlyFee).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase ${subStatusColor}`}>
                            {sub.status}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-red-100 text-red-600 ml-1">
                              overdue
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-[12px] opacity-60" style={{ color: isOverdue ? "#DC2626" : "#2D2D2D" }}>
                          {sub.status === "cancelled" ? "—" : nextDueStr}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase ${
                            monthPayment?.status === "paid" ? "bg-green-100 text-green-700" :
                            isOverdue ? "bg-red-100 text-red-600" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {monthPayment?.status === "paid" ? "paid" : isOverdue ? "overdue" : "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === "active" && monthPayment?.status !== "paid" && (
                            <button
                              onClick={() => setPayingMonth({ subscriptionId: sub.id, month: currentMonth, amountDue: Number(sub.monthlyFee) })}
                              className="text-[11px] px-3 py-1.5 rounded-lg"
                              style={{ backgroundColor: "#2D2D2D10", color: "#2D2D2D" }}
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {(subsQuery.data || []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center opacity-40 text-[13px]">No subscriptions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {payingMonth && (
              <div className="rounded-2xl p-5 border space-y-3" style={{ borderColor: "#2D2D2D15", backgroundColor: "#2D2D2D04" }}>
                <p className="text-[13px] font-semibold" style={{ color: "#2D2D2D" }}>
                  Record payment for {(subsQuery.data || []).find(s => s.id === payingMonth.subscriptionId)?.clientName} — {payingMonth.month}
                </p>
                <input
                  placeholder="Payment reference (bank/transfer ref)"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                  style={{ borderColor: "#2D2D2D20" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { recordPaymentMutation.mutate({ subscriptionId: payingMonth.subscriptionId, month: payingMonth.month, amountPaid: payingMonth.amountDue, paymentRef }); setPayingMonth(null); setPaymentRef(""); }}
                    disabled={recordPaymentMutation.isPending}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium"
                    style={{ backgroundColor: "#2D2D2D", color: "#B48C4C" }}
                  >
                    Confirm ₦{payingMonth.amountDue.toLocaleString()} Received
                  </button>
                  <button onClick={() => setPayingMonth(null)} className="px-3 py-2 rounded-xl text-[13px] opacity-40" style={{ color: "#2D2D2D" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceTab />
          </TabsContent>

          <TabsContent value="allocations">
            <AllocationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Allocations Tab ─────────────────────────────────────────────────────────

const ALLOC_PAGE_SIZE = 15;

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  Elite:    { bg: "#B48C4C20", text: "#B48C4C" },
  Premier:  { bg: "#22C55E20", text: "#22C55E" },
  Standard: { bg: "#3B82F620", text: "#3B82F6" },
  Entry:    { bg: "#2D2D2D20", text: "#2D2D2D" },
};

function getCurrentQuarter() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q}-${now.getFullYear()}`;
}

function AllocationsTab() {
  const [allocPage, setAllocPage] = useState(1);
  const currentQuarter = getCurrentQuarter();

  // tRPC queries — will return undefined until server routes are wired
  const allocationsQuery = (trpc.finance as any).allocations?.useQuery?.() ?? { data: undefined, isLoading: false };
  const aiFundQuery = (trpc.finance as any).aiFund?.useQuery?.() ?? { data: undefined, isLoading: false };
  const leagueQuery = (trpc.finance as any).leagueTable?.useQuery?.({ quarter: currentQuarter }) ?? { data: undefined, isLoading: false };

  const allocations: any[] = allocationsQuery.data || [];
  const aiFund: any = aiFundQuery.data || null;
  const leagueTable: any[] = leagueQuery.data || [];

  const allocTotalPages = Math.max(1, Math.ceil(allocations.length / ALLOC_PAGE_SIZE));
  const allocPaged = allocations.slice((allocPage - 1) * ALLOC_PAGE_SIZE, allocPage * ALLOC_PAGE_SIZE);

  const G = "#2D2D2D";
  const GOLD = "#B48C4C";

  const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* ── Revenue Allocations Table ── */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="p-4 border-b border-[#2D2D2D]/5 flex items-center gap-2">
          <BarChart3 size={16} style={{ color: GOLD }} />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: G }}>Revenue Allocations</h3>
        </div>
        {allocationsQuery.isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto mb-3" size={24} style={{ color: GOLD }} />
            <p className="text-sm opacity-40">Loading allocations...</p>
          </div>
        ) : allocations.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 size={36} className="mx-auto mb-3 opacity-20" style={{ color: GOLD }} />
            <p className="text-sm opacity-40">No allocations recorded yet.</p>
            <p className="text-xs opacity-30 mt-1">Revenue allocations will appear here once finance routes are wired.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D2D2D]/5 text-[11px] uppercase tracking-wider opacity-50">
                  <th className="p-3 text-left">Ref</th>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">Service</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Institutional (50%)</th>
                  <th className="p-3 text-right">Staff Pool (30%)</th>
                  <th className="p-3 text-right">Affiliate (20%)</th>
                  <th className="p-3 text-right">AI Fund</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D2D]/5">
                {allocPaged.map((a: any) => {
                  const total = Number(a.totalAmount || 0);
                  const institutional = Number(a.institutional ?? total * 0.5);
                  const staffPool = Number(a.staffPool ?? total * 0.3);
                  const affiliatePool = Number(a.affiliatePool ?? total * 0.2);
                  const aiFundAmt = Number(a.aiFund || 0);
                  const statusColor = a.status === "allocated" ? "#22C55E" : a.status === "pending" ? "#EAB308" : "#3B82F6";
                  return (
                    <tr key={a.id || a.ref} className="hover:bg-[#FFFAF6]/50">
                      <td className="p-3 font-mono text-[12px] font-bold">{a.ref || "—"}</td>
                      <td className="p-3">{a.client || "—"}</td>
                      <td className="p-3">{a.service || "—"}</td>
                      <td className="p-3 text-right font-semibold" style={{ color: GOLD }}>{formatNaira(total)}</td>
                      <td className="p-3 text-right" style={{ color: G }}>{formatNaira(institutional)}</td>
                      <td className="p-3 text-right" style={{ color: "#22C55E" }}>{formatNaira(staffPool)}</td>
                      <td className="p-3 text-right" style={{ color: "#3B82F6" }}>{formatNaira(affiliatePool)}</td>
                      <td className="p-3 text-right" style={{ color: "#8B5CF6" }}>{formatNaira(aiFundAmt)}</td>
                      <td className="p-3 text-center">
                        <span
                          className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                        >
                          {a.status || "pending"}
                        </span>
                      </td>
                      <td className="p-3 text-[12px]">{fmtDate(a.date || a.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {allocations.length > ALLOC_PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2D2D2D]/5 text-xs text-gray-500">
            <span>Showing {(allocPage - 1) * ALLOC_PAGE_SIZE + 1}–{Math.min(allocPage * ALLOC_PAGE_SIZE, allocations.length)} of {allocations.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setAllocPage(p => Math.max(1, p - 1))} disabled={allocPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                ← Prev
              </button>
              <span className="px-3 py-1.5 font-medium">{allocPage} / {allocTotalPages}</span>
              <button onClick={() => setAllocPage(p => Math.min(allocTotalPages, p + 1))} disabled={allocPage === allocTotalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── AI Fund Card + Affiliate League Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Fund Card */}
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-[#2D2D2D]/5 flex items-center gap-2">
            <Bot size={16} style={{ color: "#8B5CF6" }} />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: G }}>AI Fund</h3>
          </div>
          <div className="p-6 text-center">
            <p className="text-[10px] uppercase tracking-wider font-bold opacity-40 mb-2" style={{ color: G }}>Current Balance</p>
            <p className="text-3xl font-bold" style={{ color: "#8B5CF6" }}>
              {aiFund ? formatNaira(Number(aiFund.balance || 0)) : "₦0"}
            </p>
            <p className="text-[11px] opacity-30 mt-1" style={{ color: G }}>Reserved for AI tools & infrastructure</p>
          </div>
          {/* Recent entries log */}
          <div className="border-t border-[#2D2D2D]/5">
            <div className="px-4 py-2 border-b border-[#2D2D2D]/3" style={{ backgroundColor: "#FFFAF6" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-40" style={{ color: G }}>Recent Entries</p>
            </div>
            {aiFund?.entries && aiFund.entries.length > 0 ? (
              <div className="divide-y divide-[#2D2D2D]/5 max-h-48 overflow-y-auto">
                {(aiFund.entries as any[]).slice(0, 8).map((entry: any, idx: number) => (
                  <div key={idx} className="px-4 py-2.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[12px] truncate" style={{ color: G }}>{entry.description || entry.ref || "Entry"}</p>
                      <p className="text-[10px] opacity-30" style={{ color: G }}>{fmtDate(entry.date || entry.createdAt)}</p>
                    </div>
                    <span className="text-[12px] font-semibold shrink-0 ml-3" style={{ color: Number(entry.amount) >= 0 ? "#22C55E" : "#EF4444" }}>
                      {Number(entry.amount) >= 0 ? "+" : ""}{formatNaira(Number(entry.amount || 0))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-[11px] opacity-30" style={{ color: G }}>No entries yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Affiliate League Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-[#2D2D2D]/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={16} style={{ color: GOLD }} />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: G }}>Affiliate League Table</h3>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${G}08`, color: G }}>
              {currentQuarter}
            </span>
          </div>
          {leagueQuery.isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto mb-3" size={24} style={{ color: GOLD }} />
              <p className="text-sm opacity-40">Loading league table...</p>
            </div>
          ) : leagueTable.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy size={36} className="mx-auto mb-3 opacity-20" style={{ color: GOLD }} />
              <p className="text-sm opacity-40">No affiliate data for {currentQuarter}.</p>
              <p className="text-xs opacity-30 mt-1">League table will populate once affiliate routes are wired.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D2D2D]/5 text-[11px] uppercase tracking-wider opacity-50">
                    <th className="p-3 text-center w-12">#</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-center">Tier</th>
                    <th className="p-3 text-right">Total Revenue</th>
                    <th className="p-3 text-right">Earnings</th>
                    <th className="p-3 text-center">Quality Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D2D]/5">
                  {leagueTable.map((row: any, idx: number) => {
                    const tier = row.tier || "Entry";
                    const tc = TIER_COLORS[tier] || TIER_COLORS.Entry;
                    const position = row.position ?? idx + 1;
                    return (
                      <tr key={row.id || idx} className="hover:bg-[#FFFAF6]/50">
                        <td className="p-3 text-center">
                          <span className="text-[13px] font-bold" style={{ color: position <= 3 ? GOLD : G }}>
                            {position}
                          </span>
                        </td>
                        <td className="p-3 font-medium" style={{ color: G }}>{row.name || "—"}</td>
                        <td className="p-3 text-center">
                          <span
                            className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: tc.bg, color: tc.text }}
                          >
                            {tier}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold" style={{ color: GOLD }}>{formatNaira(Number(row.totalRevenue || 0))}</td>
                        <td className="p-3 text-right" style={{ color: "#22C55E" }}>{formatNaira(Number(row.totalEarnings || 0))}</td>
                        <td className="p-3 text-center">
                          <span
                            className="text-[12px] font-bold"
                            style={{
                              color: Number(row.qualityScore || 0) >= 8 ? "#22C55E" :
                                     Number(row.qualityScore || 0) >= 5 ? "#EAB308" : "#EF4444"
                            }}
                          >
                            {row.qualityScore ?? "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Tab ─────────────────────────────────────────────────────────────

type LineItem = { serviceName: string; quantity: number; unitPrice: number };

const INVOICE_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft:     { bg: "#9CA3AF20", text: "#6B7280" },
  sent:      { bg: "#3B82F620", text: "#3B82F6" },
  paid:      { bg: "#22C55E20", text: "#22C55E" },
  partial:   { bg: "#EAB30820", text: "#EAB308" },
  overdue:   { bg: "#EF444420", text: "#EF4444" },
  cancelled: { bg: "#9CA3AF20", text: "#9CA3AF" },
};

const INV_PAGE_SIZE = 15;

function InvoiceTab() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);

  const invoicesQuery = trpc.invoices.list.useQuery(
    statusFilter === "all" ? undefined : { status: statusFilter },
    { refetchInterval: 15000 },
  );
  const markPaidMutation = trpc.invoices.markPaid.useMutation({
    onSuccess: () => { invoicesQuery.refetch(); toast.success("Invoice marked as paid"); },
    onError: () => toast.error("Failed to mark invoice as paid"),
  });

  const invoiceList = invoicesQuery.data || [];
  const totalPages = Math.max(1, Math.ceil(invoiceList.length / INV_PAGE_SIZE));
  const paged = invoiceList.slice((page - 1) * INV_PAGE_SIZE, page * INV_PAGE_SIZE);

  const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "—";
    const dt = typeof d === "string" ? new Date(d) : d;
    return dt.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#2D2D2D" }}>Invoices</h3>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-[12px] px-3 py-1.5 rounded-lg border outline-none"
            style={{ borderColor: "#2D2D2D15", color: "#2D2D2D" }}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="sm"
          className="gap-1.5 text-[12px]"
          style={{ backgroundColor: "#2D2D2D", color: "#B48C4C" }}
        >
          <Plus size={14} /> Create Invoice
        </Button>
      </div>

      {/* Invoice table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {invoicesQuery.isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto mb-3" size={24} style={{ color: "#B48C4C" }} />
            <p className="text-sm opacity-40">Loading invoices...</p>
          </div>
        ) : invoiceList.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#B48C4C" }} />
            <p className="text-sm opacity-40">No invoices found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D2D2D]/5 text-[11px] uppercase tracking-wider opacity-50">
                  <th className="p-3 text-left">Invoice #</th>
                  <th className="p-3 text-left">Client Name</th>
                  <th className="p-3 text-right">Total (₦)</th>
                  <th className="p-3 text-right">Amount Paid</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-left">Due Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D2D]/5">
                {paged.map(inv => {
                  const sc = INVOICE_STATUS_COLORS[inv.status] || INVOICE_STATUS_COLORS.draft;
                  return (
                    <tr key={inv.id} className="hover:bg-[#FFFAF6]/50">
                      <td className="p-3 font-mono text-[12px] font-bold">{inv.invoiceNumber}</td>
                      <td className="p-3">{inv.clientName}</td>
                      <td className="p-3 text-right font-semibold" style={{ color: "#B48C4C" }}>
                        ₦{Number(inv.total).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">₦{Number(inv.amountPaid || 0).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span
                          className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-[12px]">{fmtDate(inv.dueDate)}</td>
                      <td className="p-3 text-center">
                        {inv.status !== "paid" && inv.status !== "cancelled" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" disabled={markPaidMutation.isPending} className="text-[11px]">
                                Mark Paid
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark invoice as paid?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will mark invoice <strong>{inv.invoiceNumber}</strong> for{" "}
                                  <strong>{inv.clientName}</strong> (₦{Number(inv.total).toLocaleString()}) as fully paid.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => markPaidMutation.mutate({ id: inv.id })}>
                                  Confirm Paid
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <span className="text-[11px] opacity-40">
                            {inv.status === "paid" ? "Paid" : "Cancelled"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {invoiceList.length > INV_PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#2D2D2D]/5 text-xs text-gray-500">
            <span>Showing {(page - 1) * INV_PAGE_SIZE + 1}–{Math.min(page * INV_PAGE_SIZE, invoiceList.length)} of {invoiceList.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                ← Prev
              </button>
              <span className="px-3 py-1.5 font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onCreated={() => { invoicesQuery.refetch(); setShowCreate(false); }} />}
    </div>
  );
}

// ─── Create Invoice Modal ────────────────────────────────────────────────────

function CreateInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ serviceName: "", quantity: 1, unitPrice: 0 }]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => { toast.success("Invoice created"); onCreated(); },
    onError: (err) => toast.error(err.message || "Failed to create invoice"),
  });

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = Math.max(0, subtotal - discount + tax);

  const updateItem = useCallback((idx: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }, []);

  const addItem = () => setItems(prev => [...prev, { serviceName: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleSubmit = () => {
    if (!clientName.trim()) { toast.error("Client name is required"); return; }
    if (items.some(i => !i.serviceName.trim())) { toast.error("All line items need a service name"); return; }
    if (total <= 0) { toast.error("Total must be greater than zero"); return; }

    createMutation.mutate({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim() || undefined,
      clientPhone: clientPhone.trim() || undefined,
      items: items.map(i => ({ ...i, lineTotal: i.quantity * i.unitPrice })),
      subtotal,
      total,
      discount: discount || undefined,
      tax: tax || undefined,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D2D]/10">
          <h2 className="text-base font-bold" style={{ color: "#2D2D2D" }}>Create Invoice</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} style={{ color: "#2D2D2D" }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Client Name *</label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client name" className="text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Client Email</label>
              <Input value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="email@example.com" type="email" className="text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Client Phone</label>
              <Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+234..." className="text-[13px]" />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50" style={{ color: "#2D2D2D" }}>Line Items</label>
              <button onClick={addItem} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "#B48C4C" }}>
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_80px_120px_100px_32px] gap-2 items-center">
                  <Input
                    value={item.serviceName}
                    onChange={e => updateItem(idx, "serviceName", e.target.value)}
                    placeholder="Service name"
                    className="text-[13px]"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-[13px] text-center"
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={item.unitPrice || ""}
                    onChange={e => updateItem(idx, "unitPrice", Math.max(0, parseFloat(e.target.value) || 0))}
                    className="text-[13px]"
                    placeholder="Unit price"
                  />
                  <div className="text-[13px] font-medium text-right pr-1" style={{ color: "#B48C4C" }}>
                    ₦{(item.quantity * item.unitPrice).toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1 rounded hover:bg-red-50 transition-colors"
                    disabled={items.length === 1}
                    style={{ opacity: items.length === 1 ? 0.3 : 1 }}
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Subtotal</label>
              <div className="text-[14px] font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: "#FFFAF6", color: "#2D2D2D" }}>
                ₦{subtotal.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Discount (₦)</label>
              <Input type="number" min={0} value={discount || ""} onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))} className="text-[13px]" placeholder="0" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Tax (₦)</label>
              <Input type="number" min={0} value={tax || ""} onChange={e => setTax(Math.max(0, parseFloat(e.target.value) || 0))} className="text-[13px]" placeholder="0" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Total</label>
              <div className="text-[14px] font-bold px-3 py-2 rounded-lg" style={{ backgroundColor: "#2D2D2D", color: "#B48C4C" }}>
                ₦{total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Due Date + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Due Date</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wider opacity-50 mb-1 block" style={{ color: "#2D2D2D" }}>Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none resize-none"
                style={{ borderColor: "#2D2D2D20" }}
              />
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#2D2D2D]/10">
          <Button variant="outline" onClick={onClose} className="text-[12px]">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="gap-1.5 text-[12px]"
            style={{ backgroundColor: "#2D2D2D", color: "#B48C4C" }}
          >
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            Create Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Commission Calculator ──────────────────────────────────────────────────

function CommissionCalculator() {
  const [price, setPrice] = useState("");
  const breakdown = useMemo(() => {
    const num = parseFloat(price);
    if (isNaN(num) || num <= 0) return null;
    return calculateCommission(num);
  }, [price]);

  const G = "#2D2D2D";
  const GOLD = "#B48C4C";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <h3 className="text-base font-medium mb-1" style={{ color: G }}>Commission Calculator</h3>
        <p className="text-xs opacity-40 mb-6">Enter the quoted deal price to see the full 40/60 split and 5-tier breakdown.</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: GOLD }}>NGN</span>
          <Input
            type="number"
            placeholder="Enter quoted price..."
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="text-lg bg-[#FFFAF6] border-[#2D2D2D]/10"
            style={{ color: G }}
          />
        </div>
      </div>

      {breakdown && (
        <>
          {/* Top split */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl text-center" style={{ backgroundColor: `${GOLD}12`, border: `1px solid ${GOLD}30` }}>
              <p className="text-[10px] uppercase tracking-wider opacity-60 mb-2" style={{ color: G }}>Staff Commission Pool (40%)</p>
              <p className="text-2xl font-normal" style={{ color: G }}>{formatNaira(breakdown.staffPool)}</p>
            </div>
            <div className="p-5 rounded-2xl text-center" style={{ backgroundColor: G, border: `1px solid ${G}` }}>
              <p className="text-[10px] uppercase tracking-wider opacity-60 mb-2" style={{ color: GOLD }}>Institutional (60%)</p>
              <p className="text-2xl font-normal" style={{ color: "#FFFAF6" }}>{formatNaira(breakdown.institutionalAmount)}</p>
            </div>
          </div>

          {/* Staff Pool Tier Breakdown */}
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2D2D2D]/5" style={{ backgroundColor: "#FFFAF6" }}>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-50" style={{ color: G }}>Staff Pool — 5-Tier Breakdown</p>
            </div>
            <div className="divide-y divide-[#2D2D2D]/5">
              <TierRow badge="T1" label="Department Lead" sub="Oversees the work" pct="4% of revenue" amount={breakdown.tiers.deptLead} />
              <TierRow badge="T2" label="CEO" sub="Support layer" pct="4% of revenue" amount={breakdown.tiers.ceo} sub2={`Finance ${formatNaira(breakdown.tiers.finance)} · HR ${formatNaira(breakdown.tiers.hr)}`} />
              <TierRow badge="T3" label="Execution Team" sub="Split by effort %" pct="16% of revenue" amount={breakdown.tiers.execution} highlight />
              <TierRow badge="T4" label="Facilities" sub="Cleaner, Security, Support" pct="2% of revenue" amount={breakdown.tiers.facilities} />
              <TierRow badge="T5" label="Lead Generator (BizDev)" sub="Demand layer" pct="5% of revenue" amount={breakdown.tiers.leadGenerator} sub2={`Converter (CSO): ${formatNaira(breakdown.tiers.converter)}`} />
            </div>
            <div className="px-5 py-3 border-t flex justify-between" style={{ backgroundColor: "#FFFAF6", borderColor: "#2D2D2D10" }}>
              <span className="text-[12px] font-medium opacity-50" style={{ color: G }}>Total Staff Pool</span>
              <span className="text-[14px] font-medium" style={{ color: GOLD }}>{formatNaira(breakdown.staffPool)}</span>
            </div>
          </div>

          {/* Institutional Breakdown */}
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2D2D2D]/5" style={{ backgroundColor: "#FFFAF6" }}>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-50" style={{ color: G }}>Institutional Allocation (60%)</p>
            </div>
            <div className="divide-y divide-[#2D2D2D]/5">
              <TierRow badge="I1" label="Department Reinvestment" sub="Tools, training, equipment" pct="25%" amount={breakdown.institutional.reinvestment} />
              <TierRow badge="I2" label="Institutional Savings" sub="Emergency fund, expansion capital" pct="10%" amount={breakdown.institutional.savings} />
              <TierRow badge="I3" label="Founder's Share" sub="Strategic vision, legacy" pct="5%" amount={breakdown.institutional.founder} />
              <TierRow badge="I4" label="Emergency Fund" sub="Unplanned crises" pct="2%" amount={breakdown.institutional.emergency} />
              <TierRow badge="I5" label="RIDI Charity" sub="Scholarships, community projects" pct="3%" amount={breakdown.institutional.ridi} />
              <TierRow badge="I6" label="Shareholders" sub="Return on investment" pct="5%" amount={breakdown.institutional.shareholders} />
            </div>
            <div className="px-5 py-3 border-t flex justify-between" style={{ backgroundColor: "#FFFAF6", borderColor: "#2D2D2D10" }}>
              <span className="text-[12px] font-medium opacity-50" style={{ color: G }}>Total Institutional</span>
              <span className="text-[14px] font-medium" style={{ color: G }}>{formatNaira(breakdown.institutionalAmount)}</span>
            </div>
          </div>

          {/* Validation */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: breakdown.validation.isValid ? "#22C55E" : "#EF4444" }} />
            <p className="text-xs opacity-50" style={{ color: G }}>
              Staff {formatNaira(breakdown.staffPool)} + Institutional {formatNaira(breakdown.institutionalAmount)} = {formatNaira(breakdown.validation.grandTotal)} · {breakdown.validation.isValid ? "✓ Valid" : "⚠ Check totals"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function TierRow({ badge, label, sub, sub2, pct, amount, highlight }: { badge: string; label: string; sub: string; sub2?: string; pct: string; amount: number; highlight?: boolean }) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4" style={{ backgroundColor: highlight ? "#2D2D2D05" : "transparent" }}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ backgroundColor: "#2D2D2D08", color: "#2D2D2D", opacity: 0.6 }}>{badge}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-normal" style={{ color: "#2D2D2D" }}>{label}</span>
            <span className="text-[11px] opacity-30" style={{ color: "#2D2D2D" }}>{pct}</span>
          </div>
          <p className="text-[11px] opacity-40" style={{ color: "#2D2D2D" }}>{sub}</p>
          {sub2 && <p className="text-[11px] opacity-30 mt-0.5" style={{ color: "#2D2D2D" }}>{sub2}</p>}
        </div>
      </div>
      <span className="text-[14px] font-normal shrink-0" style={{ color: "#B48C4C" }}>{formatNaira(amount)}</span>
    </div>
  );
}

// ─── Commission List ────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function CommissionList({ commissions, onRefresh }: { commissions: any[]; onRefresh: () => void }) {
  const [page, setPage] = useState(1);
  const [generatingInv, setGeneratingInv] = useState<number | null>(null);
  const updateMutation = trpc.commissions.updateStatus.useMutation({
    onSuccess: () => { toast.success("Commission status updated"); onRefresh(); },
    onError: () => toast.error("Failed to update commission"),
  });
  const invoicesQuery = trpc.invoices.list.useQuery({});
  const invoicesMutation = trpc.invoices.create.useMutation({
    onSuccess: () => { toast.success("Invoice generated"); setGeneratingInv(null); invoicesQuery.refetch(); },
    onError: (e) => { toast.error(e.message || "Failed to generate invoice"); setGeneratingInv(null); },
  });

  function quickGenerateInvoice(c: any) {
    // Check if an invoice for this task already exists
    const existing = (invoicesQuery.data || []).find((inv: any) => inv.taskId === c.taskId);
    if (existing) { toast(`Invoice ${existing.invoiceNumber} already exists for this task`); return; }
    setGeneratingInv(c.id);
    invoicesMutation.mutate({
      clientName: c.clientName || "Client",
      taskId: c.taskId,
      items: [{ serviceName: c.service || "Professional Service", quantity: 1, unitPrice: Number(c.quotedPrice), lineTotal: Number(c.quotedPrice) }],
      subtotal: Number(c.quotedPrice),
      total: Number(c.quotedPrice),
    });
  }

  const totalPages = Math.max(1, Math.ceil(commissions.length / PAGE_SIZE));
  const paged = commissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusColors: Record<string, string> = {
    pending: "#EAB308",
    approved: "#3B82F6",
    paid: "#22C55E",
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="p-4 border-b border-[#2D2D2D]/5">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#2D2D2D" }}>All Commissions</h3>
      </div>
      {commissions.length === 0 ? (
        <div className="p-12 text-center">
          <DollarSign size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#B48C4C" }} />
          <p className="text-sm opacity-40">No commissions recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D2D]/5 text-[11px] uppercase tracking-wider opacity-50">
                <th className="p-3 text-left">Ref</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Institutional</th>
                <th className="p-3 text-right">Pool</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D]/5">
              {paged.map(c => (
                <tr key={c.id} className="hover:bg-[#FFFAF6]/50">
                  <td className="p-3 font-mono text-[12px] font-bold">{c.taskRef}</td>
                  <td className="p-3">{c.clientName || "—"}</td>
                  <td className="p-3">{c.service || "—"}</td>
                  <td className="p-3 text-right font-semibold">{formatNaira(Number(c.quotedPrice))}</td>
                  <td className="p-3 text-right">{formatNaira(Number(c.institutionalAmount))}</td>
                  <td className="p-3 text-right" style={{ color: "#22C55E" }}>{formatNaira(Number(c.commissionPool))}</td>
                  <td className="p-3 text-center">
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${statusColors[c.status]}20`, color: statusColors[c.status] }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Button size="sm" variant="ghost"
                      disabled={invoicesMutation.isPending && generatingInv === c.id}
                      className="text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => quickGenerateInvoice(c)}
                      title="Generate Invoice">
                      {invoicesMutation.isPending && generatingInv === c.id ? <Loader2 size={11} className="animate-spin mr-1" /> : <FileText size={11} className="mr-1" />}
                      Invoice
                    </Button>
                    {c.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={updateMutation.isPending} className="text-[11px]">
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve commission?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will approve the commission for <strong>{c.clientName || c.taskRef}</strong> ({formatNaira(Number(c.commissionPool))} pool). This action moves it to the payout queue.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => updateMutation.mutate({ id: c.id, status: "approved" })}>
                              Approve
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {c.status === "approved" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={updateMutation.isPending} className="text-[11px]">
                            Mark Paid
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm payout?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This marks the commission for <strong>{c.clientName || c.taskRef}</strong> ({formatNaira(Number(c.commissionPool))} pool) as paid. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => updateMutation.mutate({ id: c.id, status: "paid" })}>
                              Confirm Paid
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {c.status === "paid" && <span className="text-[11px] opacity-40">Done</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {commissions.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#2D2D2D]/5 text-xs text-gray-500">
          <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, commissions.length)} of {commissions.length}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ← Prev
            </button>
            <span className="px-3 py-1.5 font-medium">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payout Queue ───────────────────────────────────────────────────────────

function PayoutQueue({ commissions, onRefresh }: { commissions: any[]; onRefresh: () => void }) {
  const updateMutation = trpc.commissions.updateStatus.useMutation({
    onSuccess: () => { toast.success("Payout processed"); onRefresh(); },
    onError: () => toast.error("Failed to process payout"),
  });

  if (commissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
        <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium opacity-60">No pending payouts</p>
        <p className="text-sm opacity-40 mt-2">Approved commissions will appear here for payout processing.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="p-4 border-b border-[#2D2D2D]/5">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#2D2D2D" }}>Approved — Ready for Payout</h3>
      </div>
      <div className="divide-y divide-[#2D2D2D]/5">
        {commissions.map(c => {
          const tiers = c.tierBreakdown as any;
          return (
            <div key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-[#2D2D2D]/5">{c.taskRef}</span>
                  <span className="text-[14px] font-semibold ml-3" style={{ color: "#2D2D2D" }}>{c.clientName}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={updateMutation.isPending}
                      size="sm"
                      style={{ backgroundColor: "#22C55E", color: "white" }}
                    >
                      Mark as Paid
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm payout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This marks the commission for <strong>{c.clientName}</strong> ({formatNaira(Number(c.commissionPool))} pool) as paid. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => updateMutation.mutate({ id: c.id, status: "paid" })}>
                        Confirm Paid
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {tiers && (
                <div className="grid grid-cols-5 gap-2 text-center">
                  <MiniTier label="Dept Lead" amount={tiers.deptLead} />
                  <MiniTier label="CEO" amount={tiers.ceo} />
                  <MiniTier label="Execution" amount={tiers.execution} />
                  <MiniTier label="Lead Gen" amount={tiers.leadGenerator} />
                  <MiniTier label="Converter" amount={tiers.converter} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniTier({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="p-2 rounded-lg bg-[#FFFAF6]">
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">{label}</p>
      <p className="text-[13px] font-bold" style={{ color: "#2D2D2D" }}>{formatNaira(amount)}</p>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function FinStatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#2D2D2D]/5 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color: "#2D2D2D" }}>{value}</p>
    </div>
  );
}
