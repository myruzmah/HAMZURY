/**
 * HAMZURY AI Agent Runner — Background orchestrator for automated company operations.
 *
 * Each agent is a named worker that runs on a schedule, queries the database
 * for its pending work, processes items (optionally calling the LLM), and
 * logs every action to the activity_logs / audit_logs tables.
 */

import { invokeLLM } from "../_core/llm";
import type { InvokeResult } from "../_core/llm";
import { createActivityLog, createAuditLog } from "../db";

// ─── Agent Interface ────────────────────────────────────────────────────────

export interface AgentResult {
  tasksProcessed: number;
  errors: string[];
}

export interface Agent {
  id: string;
  name: string;
  department: string;
  role: string;
  /** Cron-like human-readable schedule description */
  schedule: string;
  /** Milliseconds between runs */
  intervalMs: number;
  lastRun: Date | null;
  status: "idle" | "running" | "error" | "disabled";
  taskCount: number;
  successRate: number;
  enabled: boolean;
  /** The function that does the actual work */
  execute: () => Promise<AgentResult>;
}

// ─── AI Helper ──────────────────────────────────────────────────────────────

/**
 * Calls the configured LLM (Qwen preferred, Anthropic fallback) with a
 * system prompt identifying the agent and a user-supplied prompt + context.
 */
export async function callAI(
  prompt: string,
  context: string,
  agentName: string = "hamzury-agent"
): Promise<string> {
  try {
    const result: InvokeResult = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are ${agentName}, an AI operations agent for HAMZURY Group — a Nigerian business consulting firm based in Abuja. You help automate internal workflows. Be concise, professional, and action-oriented. Use Nigerian business context where appropriate. Currency is Naira (₦). Always respond in plain text unless JSON is explicitly requested.`,
        },
        {
          role: "user",
          content: `${prompt}\n\nContext:\n${context}`,
        },
      ],
      maxTokens: 1024,
    });

    const text =
      result.choices?.[0]?.message?.content ??
      (result as any).content?.[0]?.text ??
      "";
    return typeof text === "string" ? text : JSON.stringify(text);
  } catch (err) {
    console.error(`[Agent:${agentName}] AI call failed:`, err);
    return "";
  }
}

// ─── Agent Registry ─────────────────────────────────────────────────────────

// Lazy-imported to avoid circular deps; populated on first access.
let _registry: Map<string, Agent> | null = null;

function buildRegistry(): Map<string, Agent> {
  // Import agent implementations
  const { executeCSOAgent } = require("./cso-agent");
  const { executeFinanceAgent } = require("./finance-agent");
  const { executeMarketingAgent } = require("./marketing-agent");

  const agents: Agent[] = [
    // 1. Evelyn — General CSO Agent
    {
      id: "evelyn",
      name: "Evelyn",
      department: "cso",
      role: "Lead Qualification & Follow-up",
      schedule: "Every 15 minutes",
      intervalMs: 15 * 60 * 1000,
      lastRun: null,
      status: "idle",
      taskCount: 0,
      successRate: 100,
      enabled: true,
      execute: executeCSOAgent,
    },

    // 2. Amara — BizDoc Agent
    {
      id: "amara",
      name: "Amara",
      department: "bizdoc",
      role: "Document Checklists & Client Emails",
      schedule: "Every 30 minutes",
      intervalMs: 30 * 60 * 1000,
      lastRun: null,
      status: "idle",
      taskCount: 0,
      successRate: 100,
      enabled: true,
      execute: async (): Promise<AgentResult> => {
        const {
          getTasksByDepartment,
          createActivityLog: logAction,
        } = require("../db");

        const errors: string[] = [];
        let processed = 0;

        try {
          const tasks = await getTasksByDepartment("bizdoc");
          const pending = tasks.filter(
            (t: any) => t.status === "Not Started" || t.status === "In Progress"
          );

          for (const task of pending.slice(0, 10)) {
            try {
              // Generate document checklist suggestion
              const checklist = await callAI(
                "Generate a concise document checklist for this BizDoc task. List the specific Nigerian regulatory documents the client needs to provide or that need to be filed. Return as a numbered list.",
                `Service: ${task.service}\nClient: ${task.clientName}\nBusiness: ${task.businessName || "N/A"}\nCurrent notes: ${task.notes || "None"}`,
                "Amara"
              );

              if (checklist) {
                await logAction({
                  taskId: task.id,
                  action: "agent_checklist_generated",
                  details: `[Amara] Document checklist prepared: ${checklist.slice(0, 500)}`,
                });
                processed++;
              }

              // Draft a client email if task has phone/email context
              if (task.status === "Not Started") {
                const email = await callAI(
                  "Draft a short, professional first-contact email to this client about their BizDoc service request. Include what documents they need to prepare. Keep under 150 words.",
                  `Client: ${task.clientName}\nService: ${task.service}\nBusiness: ${task.businessName || "N/A"}`,
                  "Amara"
                );

                if (email) {
                  await logAction({
                    taskId: task.id,
                    action: "agent_email_drafted",
                    details: `[Amara] Client email drafted: ${email.slice(0, 500)}`,
                  });
                }
              }
            } catch (err: any) {
              errors.push(`Task ${task.ref}: ${err.message}`);
            }
          }
        } catch (err: any) {
          errors.push(`BizDoc agent error: ${err.message}`);
        }

        return { tasksProcessed: processed, errors };
      },
    },

    // 3. Nova — Systemise Agent
    {
      id: "nova",
      name: "Nova",
      department: "systemise",
      role: "Project Briefs & Task Setup",
      schedule: "Every 30 minutes",
      intervalMs: 30 * 60 * 1000,
      lastRun: null,
      status: "idle",
      taskCount: 0,
      successRate: 100,
      enabled: true,
      execute: async (): Promise<AgentResult> => {
        const {
          getTasksByDepartment,
          getSystemiseLeads,
          createActivityLog: logAction,
        } = require("../db");

        const errors: string[] = [];
        let processed = 0;

        try {
          // Check systemise leads
          const sysLeads = await getSystemiseLeads();
          const newLeads = sysLeads.filter(
            (l: any) => l.status === "new" || l.status === "pending"
          );

          for (const lead of newLeads.slice(0, 5)) {
            try {
              const brief = await callAI(
                "Create a project brief for this Systemise (tech/digital) request. Include: 1) Project scope, 2) Estimated timeline, 3) Key deliverables, 4) Tech stack suggestions. Keep concise.",
                `Client: ${lead.name}\nBusiness: ${lead.businessName || "N/A"}\nService: ${lead.service}\nDetails: ${lead.context || "No details provided"}`,
                "Nova"
              );

              if (brief) {
                await logAction({
                  leadId: lead.id,
                  action: "agent_brief_created",
                  details: `[Nova] Project brief: ${brief.slice(0, 500)}`,
                });
                processed++;
              }
            } catch (err: any) {
              errors.push(`Systemise lead ${lead.ref}: ${err.message}`);
            }
          }

          // Also check systemise tasks
          const tasks = await getTasksByDepartment("systemise");
          const pendingTasks = tasks.filter(
            (t: any) => t.status === "Not Started"
          );

          for (const task of pendingTasks.slice(0, 5)) {
            try {
              const plan = await callAI(
                "Create an implementation plan for this tech task. Include milestones and estimated hours.",
                `Service: ${task.service}\nClient: ${task.clientName}\nNotes: ${task.notes || "None"}`,
                "Nova"
              );

              if (plan) {
                await logAction({
                  taskId: task.id,
                  action: "agent_plan_created",
                  details: `[Nova] Implementation plan: ${plan.slice(0, 500)}`,
                });
                processed++;
              }
            } catch (err: any) {
              errors.push(`Systemise task ${task.ref}: ${err.message}`);
            }
          }
        } catch (err: any) {
          errors.push(`Systemise agent error: ${err.message}`);
        }

        return { tasksProcessed: processed, errors };
      },
    },

    // 4. Zara — Skills Agent
    {
      id: "zara",
      name: "Zara",
      department: "skills",
      role: "Applications & Assignment Deadlines",
      schedule: "Every hour",
      intervalMs: 60 * 60 * 1000,
      lastRun: null,
      status: "idle",
      taskCount: 0,
      successRate: 100,
      enabled: true,
      execute: async (): Promise<AgentResult> => {
        const {
          getSkillsApplications,
          getStudentAssignments,
          createActivityLog: logAction,
          createNotification,
        } = require("../db");

        const errors: string[] = [];
        let processed = 0;

        try {
          // Process new applications
          const apps = await getSkillsApplications();
          const pendingApps = apps.filter((a: any) => a.status === "pending");

          for (const app of pendingApps.slice(0, 10)) {
            try {
              const welcomeMsg = await callAI(
                "Draft a warm welcome acknowledgment message for this Skills Academy applicant. Mention their chosen program, that their application is being reviewed, and expected timeline (5-7 business days). Keep under 100 words.",
                `Applicant: ${app.fullName}\nProgram: ${app.program}\nEmail: ${app.email || "N/A"}\nMotivation: ${app.motivation || "Not provided"}`,
                "Zara"
              );

              if (welcomeMsg) {
                await logAction({
                  action: "agent_welcome_drafted",
                  details: `[Zara] Welcome message for ${app.fullName} (${app.ref}): ${welcomeMsg.slice(0, 300)}`,
                });
                processed++;
              }
            } catch (err: any) {
              errors.push(`Skills app ${app.ref}: ${err.message}`);
            }
          }

          // Check assignment deadlines — notify if deadline within 48h
          // (studentAssignments have a dueDate field)
          // For now log a summary check
          await logAction({
            action: "agent_deadline_check",
            details: `[Zara] Checked ${pendingApps.length} pending applications. ${processed} processed.`,
          });
        } catch (err: any) {
          errors.push(`Skills agent error: ${err.message}`);
        }

        return { tasksProcessed: processed, errors };
      },
    },

    // 5. Kash — Finance Agent
    {
      id: "kash",
      name: "Kash",
      department: "finance",
      role: "Invoices, Subscriptions & Revenue Reports",
      schedule: "Every hour",
      intervalMs: 60 * 60 * 1000,
      lastRun: null,
      status: "idle",
      taskCount: 0,
      successRate: 100,
      enabled: true,
      execute: async () => {
        const { executeFinanceAgent: execFin } = require("./finance-agent");
        return execFin();
      },
    },

    // 6. Muse — Marketing Agent
    {
      id: "muse",
      name: "Muse",
      department: "media",
      role: "Content Ideas & Post Drafts",
      schedule: "Every 2 hours",
      intervalMs: 2 * 60 * 60 * 1000,
      lastRun: null,
      status: "idle",
      taskCount: 0,
      successRate: 100,
      enabled: true,
      execute: async () => {
        const { executeMarketingAgent: execMkt } = require("./marketing-agent");
        return execMkt();
      },
    },
  ];

  const map = new Map<string, Agent>();
  for (const a of agents) map.set(a.id, a);
  return map;
}

export function getRegistry(): Map<string, Agent> {
  if (!_registry) _registry = buildRegistry();
  return _registry;
}

// ─── Execution ──────────────────────────────────────────────────────────────

export async function executeAgent(agentId: string): Promise<AgentResult> {
  const registry = getRegistry();
  const agent = registry.get(agentId);
  if (!agent) return { tasksProcessed: 0, errors: [`Agent '${agentId}' not found`] };
  if (!agent.enabled) return { tasksProcessed: 0, errors: [`Agent '${agentId}' is disabled`] };
  if (agent.status === "running") return { tasksProcessed: 0, errors: [`Agent '${agentId}' is already running`] };

  agent.status = "running";
  const startTime = Date.now();

  try {
    const result = await agent.execute();

    agent.lastRun = new Date();
    agent.taskCount += result.tasksProcessed;
    agent.status = result.errors.length > 0 ? "error" : "idle";

    // Update success rate (rolling average)
    const total = agent.taskCount || 1;
    const errorCount = result.errors.length;
    agent.successRate = Math.round(
      ((total - errorCount) / total) * 100
    );

    // Log to audit
    await createAuditLog({
      userId: 0, // system
      userName: `Agent:${agent.name}`,
      action: "agent_run",
      resource: "agents",
      resourceId: 0,
      details: `${agent.name} completed: ${result.tasksProcessed} tasks processed, ${result.errors.length} errors, ${Date.now() - startTime}ms`,
    });

    return result;
  } catch (err: any) {
    agent.status = "error";

    await createAuditLog({
      userId: 0,
      userName: `Agent:${agent.name}`,
      action: "agent_error",
      resource: "agents",
      resourceId: 0,
      details: `${agent.name} crashed: ${err.message}`,
    });

    return { tasksProcessed: 0, errors: [err.message] };
  }
}

// ─── Status ─────────────────────────────────────────────────────────────────

export interface AgentStatus {
  id: string;
  name: string;
  department: string;
  role: string;
  schedule: string;
  lastRun: string | null;
  status: string;
  taskCount: number;
  successRate: number;
  enabled: boolean;
}

export function getAgentStatus(): AgentStatus[] {
  const registry = getRegistry();
  const statuses: AgentStatus[] = [];

  for (const agent of Array.from(registry.values())) {
    statuses.push({
      id: agent.id,
      name: agent.name,
      department: agent.department,
      role: agent.role,
      schedule: agent.schedule,
      lastRun: agent.lastRun?.toISOString() ?? null,
      status: agent.status,
      taskCount: agent.taskCount,
      successRate: agent.successRate,
      enabled: agent.enabled,
    });
  }

  return statuses;
}

// ─── Toggle ─────────────────────────────────────────────────────────────────

export function toggleAgent(agentId: string, enabled: boolean): boolean {
  const registry = getRegistry();
  const agent = registry.get(agentId);
  if (!agent) return false;
  agent.enabled = enabled;
  if (!enabled) agent.status = "disabled";
  else if (agent.status === "disabled") agent.status = "idle";
  return true;
}

// ─── Background Scheduler ───────────────────────────────────────────────────

const _intervals: NodeJS.Timeout[] = [];

export function startAgentScheduler(): void {
  const registry = getRegistry();

  console.log(`[AgentRunner] Starting scheduler for ${registry.size} agents...`);

  for (const agent of Array.from(registry.values())) {
    const interval = setInterval(async () => {
      if (!agent.enabled || agent.status === "running") return;

      try {
        await executeAgent(agent.id);
      } catch (err) {
        console.error(`[AgentRunner] Scheduler error for ${agent.id}:`, err);
      }
    }, agent.intervalMs);

    _intervals.push(interval);
    console.log(`[AgentRunner] Scheduled ${agent.name} (${agent.id}) — ${agent.schedule}`);
  }
}

export function stopAgentScheduler(): void {
  for (const interval of _intervals) clearInterval(interval);
  _intervals.length = 0;
  console.log("[AgentRunner] Scheduler stopped.");
}
