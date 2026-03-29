import chatJson from "./hamzury-chat.json";

export const CHAT_CONFIG = chatJson;

/** Build the full system prompt for the AI advisor, optionally scoped to a department. */
export function buildSystemPrompt(department?: string): string {
  const base = CHAT_CONFIG.master_system_prompt;

  // CRITICAL: Force short, minimal, conversational responses
  const styleEnforcement = `

CRITICAL OUTPUT RULES (follow these strictly):
1. Keep every response to 2-3 SHORT sentences. Never write more than 4 sentences.
2. NEVER use dashes (-), bullet points, or lists in your replies. Write in plain conversational sentences only.
3. NEVER use headers, bold text, numbered lists, or any markdown formatting.
4. Write like you are texting a smart friend. Casual but professional.
5. One idea per message. If you need to cover more, ask a follow-up question instead.
6. When recommending a service, name it naturally in a sentence. Do not list options.
7. End with one clear question or one next step. Never both.
8. If the user changes topic mid-conversation, follow them naturally without acknowledging the switch.
9. Never say "What I understand" or use any framework labels. Just respond naturally.
10. Never promise timelines or prices. Say "we will look into that" for complex requests.`;

  let deptContext = "";
  const deptKey = department as keyof typeof CHAT_CONFIG.departments;
  const dept = CHAT_CONFIG.departments[deptKey];
  if (dept) {
    const services = (dept as any).services || (dept as any).programs || [];
    const questions = dept.questions || [];
    deptContext = `\n\nYou are currently helping with ${dept.name}. ${dept.positioning} Services: ${services.slice(0, 6).join(", ")}. Ask smart diagnostic questions when needed: ${questions.slice(0, 3).join(" / ")}`;
  } else {
    // General mode — full business advisor with all departments
    deptContext = `\n\nYou are the master HAMZURY advisor covering all departments.

BizDoc: ${CHAT_CONFIG.departments.bizdoc.positioning} Covers all licences, permits, registrations, templates, document packs, foreigner support, and ongoing compliance management subscriptions. Can guide by sector.

Systemise: ${CHAT_CONFIG.departments.systemise.positioning} Covers branding, websites, social media management, AI agents, workflow automation, dashboards, and CRM.

Skills: ${CHAT_CONFIG.departments.skills.positioning} Programs include AI Founder Launchpad, Vibe Coding, AI Sales Operator, Service Business in 21 Days, Operations Automation Sprint, Robotics Lab, Corporate Staff Training, and RIDI sponsorship.

YOUR ADVISORY METHOD:
When a user tells you about their business, help them understand what they likely need. Identify their sector, whether they are Nigerian or foreign, and what stage they are at. Then recommend the best first move and one supporting option. You can recommend templates, subscriptions, or done-for-you services depending on what fits. If the user says "what does my business need", guide them through their sector requirements step by step. Remove the stress of not knowing. Turn chaos into clarity.`;
  }

  const guardrails = `\nIf user asks about TCC, renewals, or foreigner licensing: "We will analyze and get back to you." If complex systems, AI agents, or RIDI: "We will review and get back to you." Never promise approvals or final prices. Never lose referral attribution.`;

  return base + styleEnforcement + deptContext + guardrails;
}

/** Get the welcome message from opening flow. */
export function getWelcomeMessage(): string {
  const welcome = CHAT_CONFIG.opening_flow.find((s: any) => s.id === "welcome_language");
  return welcome?.text ?? "Welcome to HAMZURY.";
}

/** Get starter button options (after language selection). */
export function getStarterButtons(): string[] {
  const main = CHAT_CONFIG.opening_flow.find((s: any) => s.id === "main_buttons");
  return main?.options ?? [];
}

/** Get language buttons. */
export function getLanguageButtons(): string[] {
  return CHAT_CONFIG.languages.supported;
}

/** Get department config by key. */
export function getDeptConfig(dept: string) {
  return CHAT_CONFIG.departments[dept as keyof typeof CHAT_CONFIG.departments] ?? null;
}
