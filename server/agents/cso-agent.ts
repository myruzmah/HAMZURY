/**
 * Evelyn — HAMZURY CSO Agent
 *
 * Responsibilities:
 * - Queries unassigned leads
 * - Scores each lead (0-10) based on data completeness and quality signals
 * - Auto-assigns to department based on service mentioned in notes
 * - Creates follow-up notifications for stale leads (>24h no contact)
 * - Drafts personalized first-contact messages via LLM
 */

import type { AgentResult } from "./agent-runner";
import { callAI } from "./agent-runner";
import {
  getUnassignedLeads,
  getLeads,
  assignLead,
  updateLeadScore,
  createActivityLog,
  createNotification,
} from "../db";

// ─── Lead Scoring ───────────────────────────────────────────────────────────

interface LeadData {
  id: number;
  ref: string;
  name: string;
  businessName?: string | null;
  phone?: string | null;
  email?: string | null;
  service: string;
  context?: string | null;
  source?: string | null;
  status: string;
  leadScore?: number | null;
  assignedDepartment?: string | null;
  createdAt: Date;
}

/**
 * Score a lead 0-10 based on data completeness and quality signals.
 */
function scoreLead(lead: LeadData): number {
  let score = 0;

  // Has a business name → established entity (+2)
  if (lead.businessName && lead.businessName.trim().length > 2) score += 2;

  // Has phone number (+1)
  if (lead.phone && lead.phone.replace(/\D/g, "").length >= 10) score += 1;

  // Has email (+1)
  if (lead.email && lead.email.includes("@")) score += 1;

  // Source is referral (+3 — highest quality)
  if (lead.source?.toLowerCase() === "referral") score += 3;

  // Mentioned a specific service in their context/notes (+2)
  const serviceKeywords = [
    "registration", "cac", "tin", "scuml", "trademark", "patent",
    "website", "app", "branding", "social media", "digital",
    "training", "cohort", "skills", "academy",
    "tax", "firs", "annual return", "filing",
    "foreign", "cerpac", "expatriate",
  ];
  const contextLower = (lead.context || "").toLowerCase() + " " + (lead.service || "").toLowerCase();
  const mentionedService = serviceKeywords.some((kw) => contextLower.includes(kw));
  if (mentionedService) score += 2;

  // Mentioned urgency (+1)
  const urgencyKeywords = ["urgent", "asap", "immediately", "deadline", "fast", "rush", "today", "tomorrow"];
  const mentionedUrgency = urgencyKeywords.some((kw) => contextLower.includes(kw));
  if (mentionedUrgency) score += 1;

  return Math.min(score, 10);
}

// ─── Department Auto-Assignment ─────────────────────────────────────────────

/**
 * Guess the best department based on service keywords in the lead data.
 */
function guessDepartment(lead: LeadData): string | null {
  const text = `${lead.service} ${lead.context || ""}`.toLowerCase();

  // BizDoc signals
  const bizdocKeywords = [
    "registration", "cac", "tin", "scuml", "trademark", "patent",
    "incorporation", "business name", "annual return", "filing",
    "tax", "firs", "nafdac", "son", "regulatory", "compliance",
    "foreign", "cerpac", "expatriate", "visa", "apostille",
    "document", "certificate", "license", "permit",
  ];
  if (bizdocKeywords.some((kw) => text.includes(kw))) return "bizdoc";

  // Systemise signals
  const systemiseKeywords = [
    "website", "app", "software", "digital", "branding",
    "social media", "logo", "design", "it", "tech",
    "automation", "system", "crm", "erp",
  ];
  if (systemiseKeywords.some((kw) => text.includes(kw))) return "systemise";

  // Skills signals
  const skillsKeywords = [
    "training", "cohort", "skills", "academy", "course",
    "learn", "workshop", "bootcamp", "certificate", "ridi",
  ];
  if (skillsKeywords.some((kw) => text.includes(kw))) return "skills";

  return null; // Could not determine — leave for human CSO
}

// ─── Main Executor ──────────────────────────────────────────────────────────

export async function executeCSOAgent(): Promise<AgentResult> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // ── 1. Score and assign unassigned leads ────────────────────────────
    const unassigned = await getUnassignedLeads();

    for (const lead of unassigned.slice(0, 15)) {
      try {
        // Score the lead
        const score = scoreLead(lead as LeadData);
        await updateLeadScore(lead.id, score);

        // Auto-assign if we can determine department
        const dept = guessDepartment(lead as LeadData);
        if (dept) {
          await assignLead(lead.id, dept, 0); // 0 = system/agent

          await createActivityLog({
            leadId: lead.id,
            action: "agent_auto_assigned",
            details: `[Evelyn] Lead scored ${score}/10, auto-assigned to ${dept}`,
          });
        } else {
          await createActivityLog({
            leadId: lead.id,
            action: "agent_scored",
            details: `[Evelyn] Lead scored ${score}/10 — department could not be determined, awaiting CSO review`,
          });
        }

        // Draft personalized first-contact message
        const message = await callAI(
          "Draft a friendly, professional WhatsApp-style first-contact message for this lead. Mention their specific service need. Include a greeting, acknowledge their inquiry, and ask one clarifying question. Keep under 80 words. Do not use formal letter format.",
          `Name: ${lead.name}\nBusiness: ${lead.businessName || "Not provided"}\nService: ${lead.service}\nContext: ${lead.context || "General inquiry"}\nPhone: ${lead.phone || "N/A"}`,
          "Evelyn"
        );

        if (message) {
          await createActivityLog({
            leadId: lead.id,
            action: "agent_message_drafted",
            details: `[Evelyn] First-contact message: ${message.slice(0, 400)}`,
          });
        }

        processed++;
      } catch (err: any) {
        errors.push(`Lead ${lead.ref}: ${err.message}`);
      }
    }

    // ── 2. Follow-up check — leads older than 24h still in "new" status ──
    const allLeads = await getLeads();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const staleLeads = allLeads.filter(
      (l) =>
        l.status === "new" &&
        l.createdAt < twentyFourHoursAgo
    );

    for (const lead of staleLeads.slice(0, 10)) {
      try {
        // Create notification for CSO team
        await createNotification({
          userId: "cso",
          type: "reminder",
          title: "Stale Lead — Follow-up Needed",
          message: `Lead ${lead.ref} (${lead.name}) has been uncontacted for over 24 hours. Service: ${lead.service}. Score: ${lead.leadScore ?? "unscored"}/10.`,
          link: "/cso/dashboard",
        });

        // Draft a follow-up message
        const followUp = await callAI(
          "Draft a gentle follow-up WhatsApp message for a lead who hasn't been contacted in over 24 hours. Apologize for the delay, restate their interest, and offer to schedule a call. Keep under 60 words.",
          `Name: ${lead.name}\nService: ${lead.service}\nOriginal inquiry: ${lead.context || "General inquiry"}\nHours since inquiry: ${Math.round((Date.now() - lead.createdAt.getTime()) / (60 * 60 * 1000))}`,
          "Evelyn"
        );

        if (followUp) {
          await createActivityLog({
            leadId: lead.id,
            action: "agent_followup_drafted",
            details: `[Evelyn] Follow-up (${Math.round((Date.now() - lead.createdAt.getTime()) / (60 * 60 * 1000))}h overdue): ${followUp.slice(0, 400)}`,
          });
        }

        processed++;
      } catch (err: any) {
        errors.push(`Follow-up lead ${lead.ref}: ${err.message}`);
      }
    }
  } catch (err: any) {
    errors.push(`CSO agent top-level error: ${err.message}`);
  }

  return { tasksProcessed: processed, errors };
}
