/**
 * Kash — HAMZURY Finance Agent
 *
 * Responsibilities:
 * - Checks invoices with status "sent" where dueDate has passed -> marks as "overdue"
 * - Checks subscriptions where payment is overdue -> creates notification for finance team
 * - Generates daily revenue summary (total received today, pending, overdue)
 * - Flags commissions that have been "approved" for >7 days without being "paid"
 */

import type { AgentResult } from "./agent-runner";
import {
  getInvoices,
  updateInvoice,
  getSubscriptions,
  getAllSubscriptionPayments,
  getCommissions,
  createNotification,
  createActivityLog,
  createAuditLog,
} from "../db";

// ─── Main Executor ──────────────────────────────────────────────────────────

export async function executeFinanceAgent(): Promise<AgentResult> {
  const errors: string[] = [];
  let processed = 0;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // ── 1. Mark overdue invoices ──────────────────────────────────────────

  try {
    const sentInvoices = await getInvoices("sent");

    for (const inv of sentInvoices) {
      try {
        // Check if dueDate has passed
        if (inv.dueDate && new Date(inv.dueDate) < now) {
          await updateInvoice(inv.id, { status: "overdue" });

          await createActivityLog({
            action: "agent_invoice_overdue",
            details: `[Kash] Invoice ${inv.invoiceNumber} marked overdue — was due ${inv.dueDate.toISOString().slice(0, 10)}, client: ${inv.clientName}, total: ₦${inv.total.toLocaleString()}`,
          });

          await createNotification({
            userId: "finance",
            type: "payment",
            title: "Invoice Overdue",
            message: `Invoice ${inv.invoiceNumber} for ${inv.clientName} (₦${inv.total.toLocaleString()}) is now overdue. Due date was ${inv.dueDate.toISOString().slice(0, 10)}.`,
            link: "/finance/dashboard",
          });

          processed++;
        }
      } catch (err: any) {
        errors.push(`Invoice ${inv.invoiceNumber}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Invoice check error: ${err.message}`);
  }

  // ── 2. Check subscription payments ────────────────────────────────────

  try {
    const subscriptions = await getSubscriptions();
    const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
    const allPayments = await getAllSubscriptionPayments();

    for (const sub of activeSubscriptions) {
      try {
        // Find payments for this subscription that are pending and overdue
        const subPayments = allPayments.filter(
          (p) => p.subscriptionId === sub.id
        );

        const overduePayments = subPayments.filter(
          (p) =>
            p.status === "pending" &&
            p.month < todayStr.slice(0, 7) // month is "YYYY-MM", compare to current month
        );

        if (overduePayments.length > 0) {
          await createNotification({
            userId: "finance",
            type: "payment",
            title: "Subscription Payment Overdue",
            message: `${sub.clientName} has ${overduePayments.length} overdue payment(s) for ${sub.service}. Monthly fee: ₦${parseFloat(sub.monthlyFee).toLocaleString()}.`,
            link: "/finance/dashboard",
          });

          await createActivityLog({
            action: "agent_subscription_overdue",
            details: `[Kash] ${sub.clientName} — ${overduePayments.length} overdue payment(s) for ${sub.service} subscription`,
          });

          processed++;
        }
      } catch (err: any) {
        errors.push(`Subscription ${sub.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Subscription check error: ${err.message}`);
  }

  // ── 3. Daily revenue summary ──────────────────────────────────────────

  try {
    const allInvoices = await getInvoices();
    const todayStart = new Date(todayStr + "T00:00:00.000Z");
    const todayEnd = new Date(todayStr + "T23:59:59.999Z");

    // Revenue received today (invoices paid today)
    const paidToday = allInvoices.filter(
      (inv) =>
        inv.status === "paid" &&
        inv.paidAt &&
        new Date(inv.paidAt) >= todayStart &&
        new Date(inv.paidAt) <= todayEnd
    );
    const receivedToday = paidToday.reduce((sum, inv) => sum + (inv.amountPaid ?? 0), 0);

    // Total pending
    const pendingInvoices = allInvoices.filter(
      (inv) => inv.status === "sent" || inv.status === "partial"
    );
    const totalPending = pendingInvoices.reduce((sum, inv) => {
      const remaining = inv.total - (inv.amountPaid ?? 0);
      return sum + remaining;
    }, 0);

    // Total overdue
    const overdueInvoices = allInvoices.filter((inv) => inv.status === "overdue");
    const totalOverdue = overdueInvoices.reduce((sum, inv) => {
      const remaining = inv.total - (inv.amountPaid ?? 0);
      return sum + remaining;
    }, 0);

    const summary = `Daily Revenue Summary (${todayStr}): Received today: ₦${receivedToday.toLocaleString()} | Pending: ₦${totalPending.toLocaleString()} (${pendingInvoices.length} invoices) | Overdue: ₦${totalOverdue.toLocaleString()} (${overdueInvoices.length} invoices)`;

    await createActivityLog({
      action: "agent_revenue_summary",
      details: `[Kash] ${summary}`,
    });

    // Notify finance and founder of daily summary
    await createNotification({
      userId: "finance",
      type: "system",
      title: "Daily Revenue Summary",
      message: summary,
      link: "/finance/dashboard",
    });

    await createNotification({
      userId: "founder",
      type: "system",
      title: "Daily Revenue Summary",
      message: summary,
      link: "/founder/dashboard",
    });

    processed++;
  } catch (err: any) {
    errors.push(`Revenue summary error: ${err.message}`);
  }

  // ── 4. Flag stale approved commissions ────────────────────────────────

  try {
    const commissions = await getCommissions();
    const staleApproved = commissions.filter(
      (c) =>
        c.status === "approved" &&
        c.approvedAt &&
        new Date(c.approvedAt) < sevenDaysAgo
    );

    for (const comm of staleApproved) {
      try {
        const daysSinceApproval = Math.round(
          (now.getTime() - new Date(comm.approvedAt!).getTime()) / (24 * 60 * 60 * 1000)
        );

        await createNotification({
          userId: "finance",
          type: "reminder",
          title: "Commission Awaiting Payment",
          message: `Commission for ${comm.clientName} (${comm.taskRef}) was approved ${daysSinceApproval} days ago but has not been paid. Pool: ₦${parseFloat(comm.commissionPool).toLocaleString()}.`,
          link: "/finance/dashboard",
        });

        await createActivityLog({
          action: "agent_commission_stale",
          details: `[Kash] Commission ${comm.taskRef} approved ${daysSinceApproval} days ago, still unpaid — pool ₦${parseFloat(comm.commissionPool).toLocaleString()}`,
        });

        processed++;
      } catch (err: any) {
        errors.push(`Commission ${comm.taskRef}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`Commission check error: ${err.message}`);
  }

  return { tasksProcessed: processed, errors };
}
