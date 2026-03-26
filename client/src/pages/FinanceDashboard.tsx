import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
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
  CheckCircle2, Clock, TrendingUp, PieChart, Wallet,
} from "lucide-react";
import { useState, useMemo } from "react";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8F5F0" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "#C9A97E" }} />
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAFA" }}>
      <PageMeta title="Finance Dashboard — HAMZURY" description="Commissions and finance overview for HAMZURY staff." />
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 px-4 md:px-8 py-3 bg-[#0A1F1C] z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[13px] font-semibold flex items-center gap-1 transition-colors" style={{ color: "#C9A97E" }}>
            <ArrowLeft size={14} /> HAMZURY
          </Link>
          <span className="text-[#F8F5F0]/20">|</span>
          <div className="flex items-center gap-2">
            <Wallet size={18} style={{ color: "#C9A97E" }} />
            <span className="text-lg font-bold" style={{ color: "#F8F5F0" }}>Finance Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-[#F8F5F0]/20">|</span>
          <span className="text-[13px] hidden md:block" style={{ color: "#C9A97E" }}>{user.name || user.email}</span>
          <button onClick={logout} className="flex items-center gap-1 text-[13px]" style={{ color: "#F8F5F0" }}>
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="pt-[56px] p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Revenue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <FinStatCard label="Total Revenue" value={formatNaira(totalRevenue)} color="#C9A97E" icon={<TrendingUp size={16} />} />
          <FinStatCard label="Staff Pool (40%)" value={formatNaira(totalPool)} color="#22C55E" icon={<DollarSign size={16} />} />
          <FinStatCard label="Institutional (60%)" value={formatNaira(totalInstitutional)} color="#0A1F1C" icon={<PieChart size={16} />} />
          <FinStatCard label="Pending" value={String(pendingCount)} color="#EAB308" icon={<Clock size={16} />} />
          <FinStatCard label="Approved" value={String(approvedCount)} color="#3B82F6" icon={<CheckCircle2 size={16} />} />
          <FinStatCard label="Paid Out" value={String(paidCount)} color="#22C55E" icon={<CheckCircle2 size={16} />} />
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="mb-6 bg-white border border-[#0A1F1C]/10">
            <TabsTrigger value="calculator" className="gap-1.5"><Calculator size={14} /> Calculator</TabsTrigger>
            <TabsTrigger value="commissions" className="gap-1.5"><DollarSign size={14} /> Commissions ({commissions.length})</TabsTrigger>
            <TabsTrigger value="payouts" className="gap-1.5"><Wallet size={14} /> Payout Queue</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5"><TrendingUp size={14} /> Subscriptions</TabsTrigger>
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
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#0A1F1C10" }}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: "#0A1F1C06", borderColor: "#0A1F1C08" }}>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#0A1F1C" }}>Client</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#0A1F1C" }}>Service</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#0A1F1C" }}>Month</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#0A1F1C" }}>Fee</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#0A1F1C" }}>Status</th>
                    <th className="text-left px-4 py-3 font-medium opacity-60" style={{ color: "#0A1F1C" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(subsQuery.data || []).map(sub => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const monthPayment = (allPaymentsQuery.data || []).find(p => p.subscriptionId === sub.id && p.month === currentMonth);
                    return (
                      <tr key={sub.id} className="border-b hover:bg-gray-50" style={{ borderColor: "#0A1F1C06" }}>
                        <td className="px-4 py-3 font-medium" style={{ color: "#0A1F1C" }}>{sub.clientName}</td>
                        <td className="px-4 py-3 opacity-60" style={{ color: "#0A1F1C" }}>{sub.service}</td>
                        <td className="px-4 py-3 font-mono text-[12px] opacity-60" style={{ color: "#0A1F1C" }}>{currentMonth}</td>
                        <td className="px-4 py-3" style={{ color: "#C9A97E" }}>₦{Number(sub.monthlyFee).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase ${
                            monthPayment?.status === "paid" ? "bg-green-100 text-green-700" :
                            monthPayment?.status === "overdue" ? "bg-red-100 text-red-600" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {monthPayment?.status ?? "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {monthPayment?.status !== "paid" && (
                            <button
                              onClick={() => setPayingMonth({ subscriptionId: sub.id, month: currentMonth, amountDue: Number(sub.monthlyFee) })}
                              className="text-[11px] px-3 py-1.5 rounded-lg"
                              style={{ backgroundColor: "#0A1F1C10", color: "#0A1F1C" }}
                            >
                              Record Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {payingMonth && (
              <div className="rounded-2xl p-5 border space-y-3" style={{ borderColor: "#0A1F1C15", backgroundColor: "#0A1F1C04" }}>
                <p className="text-[13px] font-semibold" style={{ color: "#0A1F1C" }}>
                  Record payment for {(subsQuery.data || []).find(s => s.id === payingMonth.subscriptionId)?.clientName} — {payingMonth.month}
                </p>
                <input
                  placeholder="Payment reference (bank/transfer ref)"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-[13px] outline-none"
                  style={{ borderColor: "#0A1F1C20" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { recordPaymentMutation.mutate({ subscriptionId: payingMonth.subscriptionId, month: payingMonth.month, amountPaid: payingMonth.amountDue, paymentRef }); setPayingMonth(null); setPaymentRef(""); }}
                    disabled={recordPaymentMutation.isPending}
                    className="px-4 py-2 rounded-xl text-[13px] font-medium"
                    style={{ backgroundColor: "#0A1F1C", color: "#C9A97E" }}
                  >
                    Confirm ₦{payingMonth.amountDue.toLocaleString()} Received
                  </button>
                  <button onClick={() => setPayingMonth(null)} className="px-3 py-2 rounded-xl text-[13px] opacity-40" style={{ color: "#0A1F1C" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
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

  const G = "#0A1F1C";
  const GOLD = "#C9A97E";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-[#0A1F1C]/10 shadow-sm p-6">
        <h3 className="text-base font-medium mb-1" style={{ color: G }}>Commission Calculator</h3>
        <p className="text-xs opacity-40 mb-6">Enter the quoted deal price to see the full 40/60 split and 5-tier breakdown.</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: GOLD }}>NGN</span>
          <Input
            type="number"
            placeholder="Enter quoted price..."
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="text-lg bg-[#F8F5F0] border-[#0A1F1C]/10"
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
              <p className="text-2xl font-normal" style={{ color: "#F8F5F0" }}>{formatNaira(breakdown.institutionalAmount)}</p>
            </div>
          </div>

          {/* Staff Pool Tier Breakdown */}
          <div className="bg-white rounded-2xl border border-[#0A1F1C]/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-[#0A1F1C]/5" style={{ backgroundColor: "#F8F5F0" }}>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-50" style={{ color: G }}>Staff Pool — 5-Tier Breakdown</p>
            </div>
            <div className="divide-y divide-[#0A1F1C]/5">
              <TierRow badge="T1" label="Department Lead" sub="Oversees the work" pct="4% of revenue" amount={breakdown.tiers.deptLead} />
              <TierRow badge="T2" label="CEO" sub="Support layer" pct="4% of revenue" amount={breakdown.tiers.ceo} sub2={`Finance ${formatNaira(breakdown.tiers.finance)} · HR ${formatNaira(breakdown.tiers.hr)}`} />
              <TierRow badge="T3" label="Execution Team" sub="Split by effort %" pct="16% of revenue" amount={breakdown.tiers.execution} highlight />
              <TierRow badge="T4" label="Facilities" sub="Cleaner, Security, Support" pct="2% of revenue" amount={breakdown.tiers.facilities} />
              <TierRow badge="T5" label="Lead Generator (BizDev)" sub="Demand layer" pct="5% of revenue" amount={breakdown.tiers.leadGenerator} sub2={`Converter (CSO): ${formatNaira(breakdown.tiers.converter)}`} />
            </div>
            <div className="px-5 py-3 border-t flex justify-between" style={{ backgroundColor: "#F8F5F0", borderColor: "#0A1F1C10" }}>
              <span className="text-[12px] font-medium opacity-50" style={{ color: G }}>Total Staff Pool</span>
              <span className="text-[14px] font-medium" style={{ color: GOLD }}>{formatNaira(breakdown.staffPool)}</span>
            </div>
          </div>

          {/* Institutional Breakdown */}
          <div className="bg-white rounded-2xl border border-[#0A1F1C]/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-[#0A1F1C]/5" style={{ backgroundColor: "#F8F5F0" }}>
              <p className="text-[11px] font-medium uppercase tracking-wider opacity-50" style={{ color: G }}>Institutional Allocation (60%)</p>
            </div>
            <div className="divide-y divide-[#0A1F1C]/5">
              <TierRow badge="I1" label="Department Reinvestment" sub="Tools, training, equipment" pct="25%" amount={breakdown.institutional.reinvestment} />
              <TierRow badge="I2" label="Institutional Savings" sub="Emergency fund, expansion capital" pct="10%" amount={breakdown.institutional.savings} />
              <TierRow badge="I3" label="Founder's Share" sub="Strategic vision, legacy" pct="5%" amount={breakdown.institutional.founder} />
              <TierRow badge="I4" label="Emergency Fund" sub="Unplanned crises" pct="2%" amount={breakdown.institutional.emergency} />
              <TierRow badge="I5" label="RIDI Charity" sub="Scholarships, community projects" pct="3%" amount={breakdown.institutional.ridi} />
              <TierRow badge="I6" label="Shareholders" sub="Return on investment" pct="5%" amount={breakdown.institutional.shareholders} />
            </div>
            <div className="px-5 py-3 border-t flex justify-between" style={{ backgroundColor: "#F8F5F0", borderColor: "#0A1F1C10" }}>
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
    <div className="px-5 py-3.5 flex items-center justify-between gap-4" style={{ backgroundColor: highlight ? "#0A1F1C05" : "transparent" }}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ backgroundColor: "#0A1F1C08", color: "#0A1F1C", opacity: 0.6 }}>{badge}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-normal" style={{ color: "#0A1F1C" }}>{label}</span>
            <span className="text-[11px] opacity-30" style={{ color: "#0A1F1C" }}>{pct}</span>
          </div>
          <p className="text-[11px] opacity-40" style={{ color: "#0A1F1C" }}>{sub}</p>
          {sub2 && <p className="text-[11px] opacity-30 mt-0.5" style={{ color: "#0A1F1C" }}>{sub2}</p>}
        </div>
      </div>
      <span className="text-[14px] font-normal shrink-0" style={{ color: "#C9A97E" }}>{formatNaira(amount)}</span>
    </div>
  );
}

// ─── Commission List ────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function CommissionList({ commissions, onRefresh }: { commissions: any[]; onRefresh: () => void }) {
  const [page, setPage] = useState(1);
  const updateMutation = trpc.commissions.updateStatus.useMutation({
    onSuccess: () => { toast.success("Commission status updated"); onRefresh(); },
    onError: () => toast.error("Failed to update commission"),
  });

  const totalPages = Math.max(1, Math.ceil(commissions.length / PAGE_SIZE));
  const paged = commissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusColors: Record<string, string> = {
    pending: "#EAB308",
    approved: "#3B82F6",
    paid: "#22C55E",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#0A1F1C]/10 shadow-sm">
      <div className="p-4 border-b border-[#0A1F1C]/5">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#0A1F1C" }}>All Commissions</h3>
      </div>
      {commissions.length === 0 ? (
        <div className="p-12 text-center">
          <DollarSign size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#C9A97E" }} />
          <p className="text-sm opacity-40">No commissions recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#0A1F1C]/5 text-[11px] uppercase tracking-wider opacity-50">
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
            <tbody className="divide-y divide-[#0A1F1C]/5">
              {paged.map(c => (
                <tr key={c.id} className="hover:bg-[#F8F5F0]/50">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {commissions.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#0A1F1C]/5 text-xs text-gray-500">
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
      <div className="bg-white rounded-2xl border border-[#0A1F1C]/10 p-12 text-center">
        <CheckCircle2 size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium opacity-60">No pending payouts</p>
        <p className="text-sm opacity-40 mt-2">Approved commissions will appear here for payout processing.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#0A1F1C]/10 shadow-sm">
      <div className="p-4 border-b border-[#0A1F1C]/5">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "#0A1F1C" }}>Approved — Ready for Payout</h3>
      </div>
      <div className="divide-y divide-[#0A1F1C]/5">
        {commissions.map(c => {
          const tiers = c.tierBreakdown as any;
          return (
            <div key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded bg-[#0A1F1C]/5">{c.taskRef}</span>
                  <span className="text-[14px] font-semibold ml-3" style={{ color: "#0A1F1C" }}>{c.clientName}</span>
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
    <div className="p-2 rounded-lg bg-[#F8F5F0]">
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-50">{label}</p>
      <p className="text-[13px] font-bold" style={{ color: "#0A1F1C" }}>{formatNaira(amount)}</p>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function FinStatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#0A1F1C]/5 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">{label}</span>
      </div>
      <p className="text-lg font-bold" style={{ color: "#0A1F1C" }}>{value}</p>
    </div>
  );
}
