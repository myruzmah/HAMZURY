/**
 * Muse — HAMZURY Marketing Agent
 *
 * Responsibilities:
 * - Generates 3 types of content: Educational tip, Client success story, Service spotlight
 * - Has templates for each department (BizDoc, Systemise, Skills)
 * - Each post has: caption (under 200 words), hashtags (10 relevant), best posting time
 * - Stores generated content in the contentQueue (logged via activity_logs)
 * - Tracks: content created today, posted today, engagement (placeholder)
 */

import type { AgentResult } from "./agent-runner";
import { callAI } from "./agent-runner";
import { createActivityLog, createAuditLog } from "../db";

// ─── Content Types & Templates ──────────────────────────────────────────────

type ContentType = "educational_tip" | "client_success_story" | "service_spotlight";

interface ContentTemplate {
  type: ContentType;
  department: "bizdoc" | "systemise" | "skills";
  prompt: string;
  hashtagSeed: string[];
}

const TEMPLATES: ContentTemplate[] = [
  // ── BizDoc ───────────────────────────────────────────────────────────
  {
    type: "educational_tip",
    department: "bizdoc",
    prompt:
      "Write a short educational social media post about Nigerian business registration or compliance. Share one practical tip a business owner should know about CAC, TIN, SCUML, FIRS, or NAFDAC registration. Make it actionable and valuable. Under 200 words.",
    hashtagSeed: [
      "#NigerianBusiness",
      "#CACRegistration",
      "#BusinessInNigeria",
      "#ComplianceTips",
      "#BizDoc",
      "#HAMZURY",
      "#Abuja",
      "#NigeriaEntrepreneur",
      "#StartupNigeria",
      "#BusinessTips",
    ],
  },
  {
    type: "client_success_story",
    department: "bizdoc",
    prompt:
      "Write an anonymized client success story for social media. A Nigerian business owner needed help with business registration/compliance and HAMZURY BizDoc handled it seamlessly. Focus on the transformation — from confusion to clarity. Under 200 words. Do not use real names.",
    hashtagSeed: [
      "#ClientSuccess",
      "#BizDoc",
      "#HAMZURY",
      "#NigerianBusiness",
      "#BusinessRegistration",
      "#SuccessStory",
      "#Abuja",
      "#Entrepreneurship",
      "#BusinessGrowth",
      "#Compliance",
    ],
  },
  {
    type: "service_spotlight",
    department: "bizdoc",
    prompt:
      "Write a service spotlight social media post for HAMZURY BizDoc. Highlight one of these services: Company Registration, Tax Filing, Trademark Registration, Foreign Business Setup, or Annual Returns. Explain what it is, who needs it, and why HAMZURY is the best choice. Under 200 words.",
    hashtagSeed: [
      "#BizDoc",
      "#HAMZURY",
      "#ServiceSpotlight",
      "#BusinessConsulting",
      "#NigerianBusiness",
      "#CompanyRegistration",
      "#TaxFiling",
      "#Trademark",
      "#Abuja",
      "#Nigeria",
    ],
  },

  // ── Systemise ─────────────────────────────────────────────────────────
  {
    type: "educational_tip",
    department: "systemise",
    prompt:
      "Write a short educational social media post about digital transformation for Nigerian businesses. Share one practical tip about websites, branding, social media management, or business automation. Make it actionable. Under 200 words.",
    hashtagSeed: [
      "#DigitalTransformation",
      "#Systemise",
      "#HAMZURY",
      "#NigerianTech",
      "#Branding",
      "#WebDesign",
      "#SocialMedia",
      "#BusinessAutomation",
      "#AbujaTeam",
      "#DigitalNigeria",
    ],
  },
  {
    type: "client_success_story",
    department: "systemise",
    prompt:
      "Write an anonymized client success story for HAMZURY Systemise. A business went from no digital presence to having a professional website, branding, and social media strategy. Focus on measurable impact. Under 200 words. No real names.",
    hashtagSeed: [
      "#ClientSuccess",
      "#Systemise",
      "#HAMZURY",
      "#DigitalPresence",
      "#WebDesign",
      "#Branding",
      "#NigerianBusiness",
      "#TechSuccess",
      "#BeforeAndAfter",
      "#AbujaAgency",
    ],
  },
  {
    type: "service_spotlight",
    department: "systemise",
    prompt:
      "Write a service spotlight for HAMZURY Systemise. Highlight one: Website Development, Brand Identity, Social Media Management, or Business Automation. Explain what it includes, who benefits, and the HAMZURY approach. Under 200 words.",
    hashtagSeed: [
      "#Systemise",
      "#HAMZURY",
      "#ServiceSpotlight",
      "#WebDevelopment",
      "#BrandIdentity",
      "#SocialMediaManagement",
      "#BusinessAutomation",
      "#NigerianTech",
      "#Abuja",
      "#DigitalAgency",
    ],
  },

  // ── Skills ────────────────────────────────────────────────────────────
  {
    type: "educational_tip",
    department: "skills",
    prompt:
      "Write a short educational social media post about career development and digital skills in Nigeria. Share one tip about why learning tech skills, business management, or creative skills matters for Nigerian youth. Under 200 words.",
    hashtagSeed: [
      "#SkillsAcademy",
      "#HAMZURY",
      "#NigerianYouth",
      "#TechSkills",
      "#CareerDevelopment",
      "#LearnToCode",
      "#DigitalSkills",
      "#Abuja",
      "#NigeriaJobs",
      "#FutureReady",
    ],
  },
  {
    type: "client_success_story",
    department: "skills",
    prompt:
      "Write an anonymized student success story for HAMZURY Skills Academy. A young Nigerian enrolled in a cohort program, learned practical skills, and now has better career opportunities. Focus on personal growth. Under 200 words. No real names.",
    hashtagSeed: [
      "#StudentSuccess",
      "#SkillsAcademy",
      "#HAMZURY",
      "#NigerianYouth",
      "#SuccessStory",
      "#CareerGrowth",
      "#CohortGraduate",
      "#Abuja",
      "#TechEducation",
      "#RIDI",
    ],
  },
  {
    type: "service_spotlight",
    department: "skills",
    prompt:
      "Write a service spotlight for HAMZURY Skills Academy. Highlight the cohort-based learning model, RIDI (Rural Impact & Digital Inclusion) initiative, or a specific program track. Explain who should apply and what they will gain. Under 200 words.",
    hashtagSeed: [
      "#SkillsAcademy",
      "#HAMZURY",
      "#ServiceSpotlight",
      "#CohortLearning",
      "#RIDI",
      "#RuralImpact",
      "#DigitalInclusion",
      "#NigerianEducation",
      "#Abuja",
      "#ApplyNow",
    ],
  },
];

// ─── Optimal Posting Times (WAT / GMT+1) ────────────────────────────────────

const POSTING_TIMES = [
  { time: "08:00", label: "8:00 AM WAT — Morning commute" },
  { time: "12:00", label: "12:00 PM WAT — Lunch break" },
  { time: "17:00", label: "5:00 PM WAT — After work" },
  { time: "20:00", label: "8:00 PM WAT — Evening scroll" },
];

function getBestPostingTime(): { time: string; label: string } {
  return POSTING_TIMES[Math.floor(Math.random() * POSTING_TIMES.length)];
}

// ─── Content Queue (tracked via activity_logs) ──────────────────────────────

export interface GeneratedContent {
  department: string;
  type: ContentType;
  caption: string;
  hashtags: string[];
  bestPostingTime: string;
  createdAt: string;
}

// In-memory content queue — persisted via activity_logs for retrieval
const contentQueue: GeneratedContent[] = [];

export function getContentQueue(): GeneratedContent[] {
  return [...contentQueue];
}

export function getContentStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayContent = contentQueue.filter(
    (c) => c.createdAt.startsWith(today)
  );

  return {
    totalQueued: contentQueue.length,
    createdToday: todayContent.length,
    postedToday: 0, // Placeholder — would be tracked when actual posting is integrated
    engagement: { likes: 0, shares: 0, comments: 0 }, // Placeholder
    byDepartment: {
      bizdoc: todayContent.filter((c) => c.department === "bizdoc").length,
      systemise: todayContent.filter((c) => c.department === "systemise").length,
      skills: todayContent.filter((c) => c.department === "skills").length,
    },
  };
}

// ─── Main Executor ──────────────────────────────────────────────────────────

export async function executeMarketingAgent(): Promise<AgentResult> {
  const errors: string[] = [];
  let processed = 0;

  try {
    // Pick 3 templates to generate content for this run
    // Rotate through departments and content types
    const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    for (const template of selected) {
      try {
        // Generate caption via LLM
        const rawCaption = await callAI(
          template.prompt + "\n\nDo NOT include hashtags in the caption. Just the caption text.",
          `Department: ${template.department}\nContent type: ${template.type}\nBrand: HAMZURY Group, Abuja Nigeria\nTone: Professional yet warm, confident, Nigerian context`,
          "Muse"
        );

        if (!rawCaption || rawCaption.trim().length < 20) {
          errors.push(
            `${template.department}/${template.type}: LLM returned empty or too-short content`
          );
          continue;
        }

        const caption = rawCaption.trim().slice(0, 1200); // Safety cap
        const postingTime = getBestPostingTime();

        const content: GeneratedContent = {
          department: template.department,
          type: template.type,
          caption,
          hashtags: template.hashtagSeed,
          bestPostingTime: postingTime.label,
          createdAt: new Date().toISOString(),
        };

        contentQueue.push(content);

        // Log to activity_logs for persistence and dashboard visibility
        await createActivityLog({
          action: "agent_content_created",
          details: `[Muse] ${template.department.toUpperCase()} ${template.type.replace(/_/g, " ")} — Post at ${postingTime.label}\n\nCaption:\n${caption.slice(0, 500)}\n\nHashtags: ${template.hashtagSeed.join(" ")}`,
        });

        processed++;
      } catch (err: any) {
        errors.push(
          `${template.department}/${template.type}: ${err.message}`
        );
      }
    }

    // Log summary
    const stats = getContentStats();
    await createActivityLog({
      action: "agent_marketing_summary",
      details: `[Muse] Content run complete: ${processed} posts generated. Queue: ${stats.totalQueued} total, ${stats.createdToday} today. Departments: BizDoc=${stats.byDepartment.bizdoc}, Systemise=${stats.byDepartment.systemise}, Skills=${stats.byDepartment.skills}`,
    });
  } catch (err: any) {
    errors.push(`Marketing agent top-level error: ${err.message}`);
  }

  return { tasksProcessed: processed, errors };
}
