/**
 * Bizdoc Assessment Form — follows the HAMZURY Psychological Web Form spec
 * (HAMZURY_PSYCHOLOGICAL_FORMS/BIZDOC_PSYCHOLOGICAL_FORM.txt).
 *
 * Structure: 8-step progressive disclosure.
 *   Step 1 · Interest (confirmed it's Bizdoc)
 *   Step 2 · Problem Discovery (feel the tax pain)
 *   Step 3 · Current Situation (revenue, industry, compliance awareness)
 *   Step 4 · Desired Outcome (peace of mind, contracts unlocked)
 *   Step 5 · Obstacles (what's stopping them)
 *   Step 6 · Urgency (when they need it)
 *   Step 7 · Investment (budget → prescription)
 *   Step 8 · Contact (only after they're invested — handled in shared shell)
 */
import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "bizdoc",
  pageTitle: "Bizdoc Assessment | HAMZURY",
  pageDescription: "2-minute tax & compliance assessment. Discover what your business truly needs.",
  brand: "BIZDOC ASSESSMENT",
  accent: "#1B4D3E",
  highlight: "#B48C4C",
  welcome: {
    title: "What's holding your business back?",
    sub: "Most founders can't see their own tax and compliance blind spots. Let's find yours — and what it's really costing you. Takes 2 minutes.",
    bullets: [
      "Built to uncover what you might be missing.",
      "Every answer is private — only our Bizdoc team reads it.",
      "You'll get a reference number on submit. Keep it.",
    ],
  },
  steps: [
    /* ──────────────────────── STEP 2 · PROBLEM DISCOVERY ──────────────────────── */
    {
      title: "Let's talk about your tax situation…",
      sub: "Be honest. We've heard everything.",
      questions: [
        {
          id: "tax_handling",
          prompt: "How do you handle tax and compliance right now?",
          required: true,
          options: [
            "Don't — I'm ignoring it (scared)",
            "DIY — I'm doing it myself (stressful)",
            "Accountant — but not reliable",
            "Current provider — but not happy",
            "All good — just exploring",
          ],
        },
        {
          id: "worry",
          prompt: "What worries you most about tax and compliance?",
          required: true,
          options: [
            "Getting it wrong — penalties and fines",
            "Missing deadlines — last-minute panic",
            "Missing opportunities — I don't know what I don't know",
            "Time waste — spending hours on it",
            "Losing sleep — constant worry",
          ],
        },
        {
          id: "last_vat",
          prompt: "When was your last VAT filing?",
          required: true,
          options: [
            "Up to date — last month",
            "A few months behind — need to catch up",
            "Haven't started — should have by now",
            "Don't know if I even need to (confused)",
            "Not applicable — revenue under threshold",
          ],
        },
      ],
    },

    /* ──────────────────────── STEP 3 · CURRENT SITUATION ──────────────────────── */
    {
      title: "Understanding your business…",
      sub: "A snapshot so we can prescribe what fits.",
      questions: [
        {
          id: "revenue",
          prompt: "What's your annual revenue?",
          required: true,
          options: [
            "Under ₦5M",
            "₦5M – ₦25M (VAT registration threshold)",
            "₦25M – ₦100M",
            "₦100M+",
          ],
        },
        {
          id: "industry",
          prompt: "What industry are you in?",
          required: true,
          options: [
            "Healthcare / Pharmaceuticals",
            "Manufacturing",
            "Food & Beverage",
            "Technology / Services",
            "Import / Export",
            "Construction / Real Estate",
            "Retail / Wholesale",
            "Other",
          ],
        },
        {
          id: "compliance_aware",
          prompt: "What compliance are you aware you need?",
          required: true,
          options: [
            "VAT filing",
            "Tax Clearance Certificate (TCC)",
            "CAC registration / annual filing",
            "NAFDAC registration",
            "SON certification",
            "PENCOM / NSITF / ITF compliance",
            "SCUML certificate",
            "Not sure — I need guidance",
          ],
        },
      ],
    },

    /* ──────────────────────── STEP 4 · DESIRED OUTCOME ──────────────────────── */
    {
      title: "What does peace of mind look like?",
      sub: "Imagine it's already handled — what changes?",
      questions: [
        {
          id: "feeling",
          prompt: "If tax and compliance were handled perfectly, how would you feel?",
          required: true,
          options: [
            "Relieved — no more stress",
            "Confident — ready for audits",
            "Focused — can focus on the business itself",
            "Competitive — can bid on contracts that require TCC",
            "Growing — compliance isn't blocking expansion",
          ],
        },
        {
          id: "opportunity",
          prompt: "What opportunity are you missing because of compliance issues?",
          required: true,
          options: [
            "Contracts — no TCC means I can't even apply",
            "Loans — no tax records means banks won't talk",
            "Scale — compliance is too complex to grow through",
            "Sleep — the constant worry is affecting me",
            "Honestly, nothing yet — but I can feel it coming",
          ],
        },
        {
          id: "time_freed",
          prompt: "What would you do with the time you spend worrying about tax?",
          kind: "textarea",
        },
      ],
    },

    /* ──────────────────────── STEP 5 · OBSTACLES ──────────────────────── */
    {
      title: "What's stopping you from solving this today?",
      sub: "Totally honest — we're not judging.",
      questions: [
        {
          id: "obstacle",
          prompt: "Why haven't you fixed this already?",
          required: true,
          options: [
            "Cost — I wasn't sure it was worth the money",
            "Time — I didn't know where to start",
            "Trust — I've been burned by providers before",
            "Confusion — I don't know what I actually need",
            "Priority — other things always felt more urgent",
          ],
        },
        {
          id: "tried_before",
          prompt: "Have you worked with a tax consultant or accountant before?",
          required: true,
          options: [
            "No — never worked with anyone",
            "Yes — and it was fine, just moving on",
            "Yes — but they weren't reliable",
            "Yes — and it ended badly",
          ],
        },
      ],
    },

    /* ──────────────────────── STEP 6 · URGENCY ──────────────────────── */
    {
      title: "How soon do you need this sorted?",
      questions: [
        {
          id: "trigger",
          prompt: "What's pushing you to act right now?",
          required: true,
          options: [
            "I have a contract / tender deadline",
            "I just got a FIRS notice / penalty letter",
            "A client / partner asked for documents I don't have",
            "I want to stop operating in fear",
            "No pressure — I'm just getting organised",
          ],
        },
        {
          id: "timeline",
          prompt: "When do you need this handled?",
          required: true,
          options: [
            "This week — I'm against the wall",
            "Within 2 weeks",
            "Within a month",
            "Next 2–3 months",
            "No deadline — I'm exploring",
          ],
        },
      ],
    },

    /* ──────────────────────── STEP 7 · INVESTMENT ──────────────────────── */
    {
      title: "What are you ready to invest?",
      sub: "Honest range so we match the right package — not over-sell, not under-deliver.",
      questions: [
        {
          id: "budget",
          prompt: "Realistic budget for this:",
          required: true,
          options: [
            "₦90,000 — basic registration + compliance start (Starter)",
            "₦150,000 — registration + SCUML + handover (Compliant)",
            "₦300,000 — full-year managed compliance (ProMax)",
            "₦500,000+ — enterprise-grade + industry licences",
            "Not sure — tell me what I actually need",
          ],
        },
        {
          id: "commitment",
          prompt: "How serious are you about fixing this in the next 30 days?",
          required: true,
          options: [
            "Dead serious — ready to start this week",
            "Very serious — just need the right team",
            "Serious — want to understand cost first",
            "Exploring — comparing options",
          ],
        },
        {
          id: "notes",
          prompt: "Anything else that helps us serve you better?",
          kind: "textarea",
        },
      ],
    },
  ],
  thankYou: {
    title: "We've got your assessment.",
    sub: "Our Bizdoc team (Yusuf + Abdullahi) will review your answers and come back with a clear prescription — exactly what you need, what it unlocks, and what it costs. No upsell, no guesswork.",
    nextStep: "You'll hear from us on WhatsApp within 2 business hours. Keep your reference number for tracking.",
  },
};

export default function BizdocAssessment() {
  return <AssessmentForm cfg={cfg} />;
}
