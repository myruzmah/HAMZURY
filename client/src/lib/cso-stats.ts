/**
 * CSO stats — single source of truth for the aggregate numbers on the
 * Overview tab + the per-section badges. Phase 3 (2026-05-02) extraction
 * out of CSOPortal.tsx so the same calc isn't duplicated in 3+ places.
 *
 * All inputs are arrays the React tree already has loaded via tRPC; nothing
 * here calls the network. Pure derivation.
 *
 * Multi-service is the dominant rule: a client running Bizdoc + Medialy
 * reports two task contractValues, not one client-level field. Stats sum
 * tasks.contractValue across non-cancelled tasks; the legacy single
 * client.contractValue is only a fallback for rows with no linked task.
 */

const NON_TERMINAL_TASK_STATUSES = new Set([
  "Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed",
]);

const URGENT_RISK_FLAGS = new Set(["critical", "high"]);

export type CsoStats = {
  /** Inbox count — leads with status="new" */
  newLeads: number;
  /** Active Clients count — clientTruth rows with status="active" */
  activeClients: number;
  /** Revenue rollup — sum of every non-cancelled task's contractValue.
   *  Falls back to legacy client.contractValue rollup if no tasks loaded. */
  totalContractValue: number;
  /** Clients flagged critical or high — needs CSO attention today. */
  urgent: any[];
  /** Tasks completed (status "Completed" or "completed") in the current
   *  calendar month. Powers the "in delivery this month" calm line. */
  inDeliveryThisMonth: number;
  /** Phase 4.2 — count of active subscriptions whose next billing day falls
   *  within the next 7 days. Powers the "Renewals this week" Overview tile. */
  renewalsThisWeek: number;
};

/** Derive CSO Overview stats. Inputs are the raw arrays from tRPC queries. */
export function deriveCsoStats(args: {
  leads?: any[] | null;
  clients?: any[] | null;
  tasks?: any[] | null;
  subscriptions?: any[] | null;
}): CsoStats {
  const leads = args.leads || [];
  const clients = args.clients || [];
  const tasks = args.tasks || [];
  const subscriptions = args.subscriptions || [];

  const newLeads = leads.filter((l: any) => l.status === "new").length;
  const activeClients = clients.filter((c: any) => c.status === "active").length;

  // Revenue — sum tasks first (correct for multi-service); fall back to
  // client-level rollup only if no tasks exist (covers legacy single-service
  // rows that haven't been migrated yet).
  const taskSum = tasks
    .filter((t: any) => NON_TERMINAL_TASK_STATUSES.has(t.status))
    .reduce((s: number, t: any) => {
      const v = parseFloat(String(t.contractValue || t.quotedPrice || "0"));
      return s + (Number.isFinite(v) ? v : 0);
    }, 0);
  const clientFallback = clients.reduce((s: number, c: any) => {
    const v = parseFloat(String(c.contractValue || "0"));
    return s + (Number.isFinite(v) ? v : 0);
  }, 0);
  const totalContractValue = taskSum > 0 ? taskSum : clientFallback;

  const urgent = clients.filter((c: any) => URGENT_RISK_FLAGS.has(c.riskFlag));

  // Delivered-this-month — completed tasks whose completedAt or updatedAt
  // falls in the current calendar month. Used by the calm Active Clients
  // header line.
  const now = new Date();
  const inDeliveryThisMonth = tasks.filter((t: any) => {
    const status = String(t.status || "").toLowerCase();
    if (status !== "completed") return false;
    const ts = t.completedAt || t.updatedAt;
    if (!ts) return false;
    const d = new Date(ts);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // Phase 4.2 — renewals due in the next 7 days. Walks each active sub's
  // billingDay, computes its next occurrence, counts those within the window.
  const SEVEN_DAYS_MS = 7 * 86_400_000;
  const renewalsThisWeek = subscriptions.filter((s: any) => {
    if (s.status !== "active") return false;
    const day = Math.max(1, Math.min(28, parseInt(s.billingDay || "1", 10) || 1));
    let next = new Date(now.getFullYear(), now.getMonth(), day);
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear(), now.getMonth() + 1, day);
    }
    return next.getTime() - now.getTime() <= SEVEN_DAYS_MS;
  }).length;

  return { newLeads, activeClients, totalContractValue, urgent, inDeliveryThisMonth, renewalsThisWeek };
}
