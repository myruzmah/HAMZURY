/**
 * IBRAHIM — Leave & Commission Pre-Review Agent
 *
 * Pre-reviews pending leave requests and commission payouts.
 * Generates accept/flag recommendations so staff can approve with one click.
 */

import type { AgentResult } from "./agent-runner";
import {
  getLeaveRequests,
  getCommissions,
  createActivityLog,
  createNotification,
  createAgentSuggestion,
  getAgentSuggestions,
} from "../db";

export async function executeHRFinanceAgent(): Promise<AgentResult> {

  const errors: string[] = [];
  let processed = 0;

  try {
    // ─── Leave Request Reviews ──────────────────────────────────────
    const allLeaves = await getLeaveRequests();
    const pendingLeaves = allLeaves.filter((l: any) => l.status === "pending");
    const approvedLeaves = allLeaves.filter((l: any) => l.status === "approved");

    // Check existing suggestions to avoid duplicates
    const existingHR = await getAgentSuggestions("hr");
    const existingLeaveIds = new Set(existingHR.filter((s: any) => s.suggestionType === "leave_review").map((s: any) => s.targetEntityId));

    for (const leave of pendingLeaves.slice(0, 10)) {
      if (existingLeaveIds.has(leave.id)) continue; // Skip if already suggested

      try {
        // Check for date overlaps with approved leaves
        const overlaps = approvedLeaves.filter((al: any) => {
          if (!al.startDate || !al.endDate || !leave.startDate || !leave.endDate) return false;
          const aStart = new Date(al.startDate);
          const aEnd = new Date(al.endDate);
          const lStart = new Date(leave.startDate);
          const lEnd = new Date(leave.endDate);
          return lStart <= aEnd && lEnd >= aStart;
        });

        const hasReason = leave.reason && leave.reason.trim().length > 5;
        const daysRequested = leave.startDate && leave.endDate
          ? Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 0;

        let recommendation: string;
        let title: string;

        if (overlaps.length === 0 && hasReason && daysRequested <= 5) {
          recommendation = `RECOMMEND APPROVE — No date conflicts, reason provided, ${daysRequested} day(s) requested.\n\nStaff: ${leave.staffName || "Unknown"}\nDates: ${leave.startDate} to ${leave.endDate}\nReason: ${leave.reason || "Not provided"}`;
          title = `✅ Approve: ${leave.staffName || "Staff"} — ${daysRequested}d leave`;
        } else {
          const flags: string[] = [];
          if (overlaps.length > 0) flags.push(`Overlaps with ${overlaps.length} approved leave(s): ${overlaps.map((o: any) => o.staffName || "staff").join(", ")}`);
          if (!hasReason) flags.push("No reason provided");
          if (daysRequested > 5) flags.push(`${daysRequested} days is longer than standard (5 days)`);

          recommendation = `FLAG FOR REVIEW — ${flags.join(". ")}.\n\nStaff: ${leave.staffName || "Unknown"}\nDates: ${leave.startDate} to ${leave.endDate}\nReason: ${leave.reason || "Not provided"}`;
          title = `⚠️ Review: ${leave.staffName || "Staff"} — ${daysRequested}d leave`;
        }

        await createAgentSuggestion({
          agentId: "ibrahim",
          targetDepartment: "hr",
          targetEntityType: "leave",
          targetEntityId: leave.id,
          suggestionType: "leave_review",
          title,
          content: recommendation,
        });
        processed++;
      } catch (err: any) {
        errors.push(`Leave ${leave.id}: ${err.message}`);
      }
    }

    // ─── Commission Reviews ──────────────────────────────────────────
    const allCommissions = await getCommissions();
    const pendingComms = allCommissions.filter((c: any) => c.status === "pending");

    const existingFounder = await getAgentSuggestions("founder");
    const existingCommIds = new Set(existingFounder.filter((s: any) => s.suggestionType === "commission_review").map((s: any) => s.targetEntityId));

    for (const comm of pendingComms.slice(0, 10)) {
      if (existingCommIds.has(comm.id)) continue;

      try {
        const quotedPrice = Number(comm.quotedPrice) || 0;
        const commissionPool = Number(comm.commissionPool) || 0;
        const institutionalAmount = Number(comm.institutionalAmount) || 0;

        // Verify 60/40 split math
        const expected60 = quotedPrice * 0.6;
        const expected40 = quotedPrice * 0.4;
        const mathCorrect = Math.abs(institutionalAmount - expected60) < 100 && Math.abs(commissionPool - expected40) < 100;

        let recommendation: string;
        let title: string;

        if (mathCorrect && quotedPrice > 0) {
          recommendation = `RECOMMEND APPROVE — Math verified (60/40 split correct).\n\nStaff: ${comm.clientName || "Unknown"}\nService: ${comm.service || "N/A"}\nQuoted: ₦${quotedPrice.toLocaleString()}\nInstitutional (60%): ₦${institutionalAmount.toLocaleString()}\nStaff Pool (40%): ₦${commissionPool.toLocaleString()}\nStatus: ${comm.status}`;
          title = `✅ Approve: ₦${quotedPrice.toLocaleString()} — ${comm.clientName || "Staff"}`;
        } else {
          const flags: string[] = [];
          if (!mathCorrect) flags.push("60/40 split calculation doesn't match");
          if (quotedPrice <= 0) flags.push("Quoted price is zero or missing");

          recommendation = `FLAG FOR REVIEW — ${flags.join(". ")}.\n\nStaff: ${comm.clientName || "Unknown"}\nService: ${comm.service || "N/A"}\nQuoted: ₦${quotedPrice.toLocaleString()}\nInstitutional (60%): ₦${institutionalAmount.toLocaleString()} (expected ₦${expected60.toLocaleString()})\nStaff Pool (40%): ₦${commissionPool.toLocaleString()} (expected ₦${expected40.toLocaleString()})`;
          title = `⚠️ Review: ₦${quotedPrice.toLocaleString()} — ${comm.clientName || "Staff"}`;
        }

        await createAgentSuggestion({
          agentId: "ibrahim",
          targetDepartment: "founder",
          targetEntityType: "commission",
          targetEntityId: comm.id,
          suggestionType: "commission_review",
          title,
          content: recommendation,
        });
        processed++;
      } catch (err: any) {
        errors.push(`Commission ${comm.id}: ${err.message}`);
      }
    }

    // Summary log
    if (processed > 0) {
      await createActivityLog({
        action: "agent_review_batch",
        details: `[Ibrahim] Pre-reviewed ${processed} items (leaves + commissions)`,
      });

      if (pendingLeaves.length > 0) {
        await createNotification({
          userId: "system",
          type: "system",
          title: "Ibrahim: Leave Reviews Ready",
          message: `${pendingLeaves.length} leave request(s) pre-reviewed with recommendations.`,
          link: "/hub/hr",
        }).catch(() => {});
      }

      if (pendingComms.length > 0) {
        await createNotification({
          userId: "system",
          type: "system",
          title: "Ibrahim: Commission Reviews Ready",
          message: `${pendingComms.length} commission(s) pre-reviewed with recommendations.`,
          link: "/hub/founder",
        }).catch(() => {});
      }
    }
  } catch (err: any) {
    errors.push(`HR-Finance agent error: ${err.message}`);
  }

  return { tasksProcessed: processed, errors };
}
