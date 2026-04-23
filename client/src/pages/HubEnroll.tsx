import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "hub",
  pageTitle: "HUB Enrollment | HAMZURY",
  pageDescription: "Enrol in the HAMZURY HUB programme that fits you. Tech skills that get you paid.",
  brand: "HUB ENROLLMENT",
  accent: "#1E3A5F",
  highlight: "#B48C4C",
  welcome: {
    title: "May Cohort is open. Pick your tech skill.",
    sub: "Tech skills that get you paid. Classes start May 1, 2026. A few short questions so we can match you to the right programme, cohort and payment plan.",
    bullets: [
      "May Cohort orientation: May 1 · Classes: Mon–Wed 8am–2pm.",
      "Scholarships + instalment plans are real options — ask us.",
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
          "My company (corporate training, 10+)",
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
          "Any tech skill — help me choose (clarity session)",
          "Business Builders Academy — 3 wks, ₦150k",
          "Digital Dominance (social media + AI) — 4 wks, ₦80k",
          "Code Craft Bootcamp (full-stack web) — 12 wks, ₦300k",
          "Compliance Mastery — 6 wks, ₦120k",
          "Money Mastery (personal finance + wealth) — 4 wks, ₦90k",
          "MetFix Hardware & Robotics — 8 wks, ₦180k / ₦80k online",
          "Basic Computer Skills (Kids) — 2 wks, ₦25k",
          "Online Academy course (self-paced, ₦10k–₦50k)",
        ]},
        { id: "mode", prompt: "Preferred learning mode:", required: true, options: [
          "In-person at HUB (Abuja)",
          "Fully online",
          "Hybrid (mostly online, some in-person)",
        ]},
      ],
    },
    {
      title: "Your background",
      questions: [
        { id: "level", prompt: "Your current tech level:", required: true, options: [
          "Complete beginner — I barely use a computer",
          "Basic — I can browse, use email, type documents",
          "Intermediate — I've used specific tools (Excel, Canva, etc.)",
          "Advanced — I'm already working in tech",
        ]},
        { id: "goal", prompt: "What do you want AFTER finishing?", required: true, options: [
          "A paid job in tech",
          "To freelance / earn online",
          "To grow my own business",
          "To upskill in my current job",
          "Personal curiosity / growth",
        ]},
      ],
    },
    {
      title: "Payment & cohort",
      questions: [
        { id: "payment", prompt: "Payment preference:", required: true, options: [
          "Full payment (10% discount)",
          "Instalment plan (40% upfront, 30% mid, 30% before graduation)",
          "Apply for scholarship (need-based)",
          "My company / sponsor is paying",
        ]},
        { id: "cohort", prompt: "When do you want to start?", required: true, options: [
          "May Cohort (starts May 1, 2026) — priority",
          "June Cohort",
          "July – September",
          "Later in the year",
          "I'm flexible — whatever fits best",
        ]},
        { id: "notes", prompt: "Anything else we should know?", kind: "textarea" },
      ],
    },
  ],
  thankYou: {
    title: "Welcome to HUB.",
    sub: "Our team (lead: Idris) will review your enrolment and come back with cohort details, payment info, and next steps.",
    nextStep: "You'll hear from us on WhatsApp within 2 business hours. Save your reference number.",
  },
};

export default function HubEnroll() {
  return <AssessmentForm cfg={cfg} />;
}
