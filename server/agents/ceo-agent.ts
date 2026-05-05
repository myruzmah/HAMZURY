/**
 * IDRIS — CEO Hub Meeting Prep Agent
 *
 * Generates weekly meeting prep: agenda, department summaries,
 * key metrics, and suggested to-do items.
 */

import type { AgentResult } from "./agent-runner";
import { callAI } from "./agent-runner";
import {
  getLeads,
  getTasks,
  getCommissions,
  createActivityLog,
  createNotification,
  createAgentSuggestion,
} from "../db";

export async function executeCEOAgent(): Promise<AgentResult> {

  const errors: string[] = [];
  let processed = 0;

  try {
    // Gather this week's data
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const allLeads = await getLeads();
    const allTasks = await getTasks();
    const allCommissions = await getCommissions();

    // Filter to recent activity
    const recentLeads = allLeads.filter((l: any) => new Date(l.createdAt) >= oneWeekAgo);
    const recentTasks = allTasks.filter((t: any) => new Date(t.createdAt) >= oneWeekAgo);
    const completedTasks = allTasks.filter((t: any) => t.status === "Completed" && new Date(t.updatedAt) >= oneWeekAgo);
    const pendingCommissions = allCommissions.filter((c: any) => c.status === "pending");
    const activeTasks = allTasks.filter((t: any) => t.status === "In Progress");

    // Department breakdown
    const deptCounts: Record<string, { leads: number; tasks: number; completed: number }> = {};
    for (const dept of ["bizdoc", "systemise", "skills", "media"]) {
      deptCounts[dept] = {
        leads: recentLeads.filter((l: any) => l.department === dept).length,
        tasks: recentTasks.filter((t: any) => t.department === dept).length,
        completed: completedTasks.filter((t: any) => t.department === dept).length,
      };
    }

    // Build context for AI
    const context = `
WEEKLY SNAPSHOT (last 7 days):
- New leads: ${recentLeads.length}
- New tasks created: ${recentTasks.length}
- Tasks completed: ${completedTasks.length}
- Tasks in progress: ${activeTasks.length}
- Pending commissions: ${pendingCommissions.length} (₦${pendingCommissions.reduce((s: number, c: any) => s + Number(c.quotedPrice || 0), 0).toLocaleString()})

DEPARTMENT BREAKDOWN:
${Object.entries(deptCounts).map(([dept, d]) => `- ${dept}: ${d.leads} leads, ${d.tasks} tasks, ${d.completed} completed`).join("\n")}

TOTAL PIPELINE:
- Total active leads: ${allLeads.filter((l: any) => l.status !== "completed" && l.status !== "lost").length}
- Total active tasks: ${allTasks.filter((t: any) => t.status !== "Completed").length}
- Unassigned leads: ${allLeads.filter((l: any) => !l.department).length}
    `.trim();

    const prompt = `Generate a concise Hub Meeting prep summary. Include:

1. AGENDA (5 bullet points max for the meeting)
2. KEY WINS this week (what went well)
3. RISKS & BLOCKERS (what needs attention)
4. SUGGESTED TO-DO for next week (3-5 actionable items)
5. DEPARTMENT that needs the most attention and why

Keep it sharp, actionable, and under 400 words. Use Nigerian business context.`;

    const aiOutput = await callAI(prompt, context, "Idris");

    if (aiOutput) {
      await createAgentSuggestion({
        agentId: "idris",
        targetDepartment: "ceo",
        targetEntityType: "meeting",
        targetEntityId: 0,
        suggestionType: "meeting_prep",
        title: `Hub Meeting Prep — Week of ${new Date().toLocaleDateString("en-NG")}`,
        content: aiOutput,
      });

      await createNotification({
        userId: "system",
        type: "system",
        title: "Idris: Meeting Prep Ready",
        message: "Weekly hub meeting agenda and summary is ready for review.",
        link: "/hub/ceo",
      });

      await createActivityLog({
        action: "agent_meeting_prep",
        details: `[Idris] Hub meeting prep generated: ${aiOutput.slice(0, 300)}...`,
      });

      processed = 1;
    }
  } catch (err: any) {
    errors.push(`CEO agent error: ${err.message}`);
  }

  return { tasksProcessed: processed, errors };
}
