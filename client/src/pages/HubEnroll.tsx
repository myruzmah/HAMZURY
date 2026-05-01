import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "hub",
  pageTitle: "HUB Enrollment | HAMZURY",
  pageDescription: "Enrol in the HAMZURY HUB programme that fits you. AI-driven tech skills, real businesses built.",
  brand: "HUB ENROLLMENT",
  accent: "#1E3A5F",
  highlight: "#B48C4C",
  welcome: {
    title: "Pick your AI-driven tech skill.",
    sub: "We teach the basics, then how to use AI (Anthropic Claude, Google Gemini, OpenAI ChatGPT — direct or through connectors like Make/Zapier) to do them faster, sharper, and at a higher level. Physical cohorts run from the Jos office (Abuja opens 2027): advanced programmes Mon–Wed 8am–2pm; basics Thu–Sat (morning + afternoon batches). Online is active globally.",
    bullets: [
      "20 students max per class — every student gets a 1-on-1 mentor.",
      "₦10,000 secures your seat. Balance paid on orientation day. Or apply with a scholarship code.",
      "Takes about 3 minutes. You'll get a reference number to track your application.",
    ],
  },
  steps: [
    {
      title: "Who are you enrolling for?",
      questions: [
        { id: "who", prompt: "Enrolment is for:", required: true, options: [
          "Myself (adult learner)",
          "My child / student (kids programme 8–15)",
          "My team / staff (group training)",
          "My company (corporate workshop, AI-solves-business-segment)",
        ]},
        { id: "age", prompt: "What is the student's age?", required: true, options: [
          "8 – 15 (kids programme)",
          "16 – 18",
          "19 – 25",
          "26 – 40",
          "40+",
        ]},
      ],
    },
    {
      title: "Which programme interests you?",
      sub: "Pick the one closest to your goal. We'll confirm fit.",
      questions: [
        { id: "program", prompt: "Programme:", required: true, options: [
          "Not sure — help me choose (clarity session)",
          "Business Builders Academy — 3 wks, ₦150k (Jos / Online)",
          "Digital Dominance (social media + video + AI) — 4 wks, ₦80k",
          "Code Craft Bootcamp (build with AI) — 8 wks, ₦300k",
          "Compliance Mastery — 6 wks, ₦120k",
          "Data Analytics — 6 wks, ₦130k",
          "MetFix Hardware & Robotics — 8 wks, ₦180k physical / ₦80k online",
          "HUB Internship (placement-track, completed HUB programme) — ₦50k/month flat",
          "Higher-Institution Internship (SIWES / IT, school letter required) — ₦45k–₦280k",
          "Beginner Tech Skills (Kids 8–15) — 2 wks, ₦25k",
          "Kids Robotics & Build Club (10–15) — 4 wks, ₦60k",
          "Kids Coding with AI (10–15) — 3 wks, ₦45k",
          "Online Academy — AI-for-business (self-paced, ₦15k–₦35k)",
          "Corporate Workshop (AI solves my business segment, max 1 wk)",
        ]},
        { id: "mode", prompt: "Preferred learning mode:", required: true, options: [
          "Physical at Jos (Mon–Wed advanced, or Thu–Sat basics)",
          "Fully online",
          "Hybrid (mostly online, some in-person at Jos)",
          "Corporate / on-site at our office",
        ]},
        { id: "batch", prompt: "Which batch suits you (physical only)?", options: [
          "Advanced — Mon–Wed, 8am–2pm",
          "Basics morning — Thu–Sat, 8am–11am",
          "Basics afternoon — Thu–Sat, 12pm–3pm",
          "Either is fine",
          "Online — batch not relevant",
        ]},
      ],
    },
    {
      title: "Your AI starting point",
      sub: "We teach you the basics, then how to use AI (Claude, Gemini, ChatGPT — directly or through connectors) to multiply the outcome.",
      questions: [
        { id: "ai_level", prompt: "How comfortable are you with AI tools today?", required: true, options: [
          "Never used an AI tool",
          "Tried ChatGPT / Claude / Gemini once or twice",
          "Use AI weekly for school, work, or personal tasks",
          "Use AI daily — already build with it",
        ]},
        { id: "ai_tools", prompt: "Which of these have you tried? (pick the closest)", required: true, options: [
          "None yet",
          "ChatGPT only",
          "Claude only",
          "Gemini only",
          "More than one chatbot",
          "Chatbots + connectors (Make, Zapier, n8n)",
        ]},
        { id: "device", prompt: "What device will you learn on?", required: true, options: [
          "I have a laptop",
          "Phone / tablet only",
          "I'd like to use the HUB lab in Jos",
          "Not sure — please advise",
        ]},
        { id: "commitment", prompt: "How many hours a week can you commit?", required: true, options: [
          "5–8 hours",
          "9–15 hours",
          "16+ hours (full focus)",
        ]},
        { id: "goal", prompt: "What outcome do you want AI to give you?", required: true, options: [
          "Build my own product / business with AI",
          "Automate my current job and earn back time",
          "Freelance and earn online with AI",
          "Get a paid placement inside Hamzury",
          "Upskill so I'm not left behind",
          "Personal curiosity / growth",
        ]},
      ],
    },
    {
      title: "Payment & cohort",
      questions: [
        { id: "payment", prompt: "Payment plan:", required: true, options: [
          "₦10,000 seat hold now, balance on orientation day (default)",
          "Full payment now (no discount — same price)",
          "Apply for scholarship (need-based)",
          "I have a scholarship code",
          "My company / sponsor is paying",
        ]},
        { id: "scholarshipCode", kind: "text", prompt: "Scholarship code — leave blank unless you have one:" },
        { id: "cohort", prompt: "When do you want to start?", required: true, options: [
          "Next available cohort (priority)",
          "Next 1–2 months",
          "Next 3 months",
          "Later in the year",
          "I'm flexible — whatever fits best",
        ]},
        { id: "notes", prompt: "Anything else we should know?", kind: "textarea" },
      ],
    },
  ],
  thankYou: {
    title: "Welcome to HUB.",
    sub: "Our team will review your enrolment, match you to the right cohort, and send your orientation pack with payment details and next steps.",
    nextStep: "You'll hear from us within 2 business hours. Pay ₦10,000 seat-hold (or send your scholarship code) to lock your spot. Save your reference number.",
  },
};

export default function HubEnroll() {
  return <AssessmentForm cfg={cfg} />;
}
