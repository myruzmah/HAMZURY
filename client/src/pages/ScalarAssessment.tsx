import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "scalar",
  pageTitle: "Scalar Assessment | HAMZURY",
  pageDescription: "Tell us about your operations. We'll design the right web + automation system.",
  brand: "SCALAR ASSESSMENT",
  accent: "#D4A017",
  highlight: "#B48C4C",
  welcome: {
    title: "Let's see what your business needs to scale.",
    sub: "Websites that work. Systems that scale. A few questions and our Scalar team returns with a clear plan — scoped, priced, honest.",
    bullets: [
      "Takes about 4 minutes.",
      "Your answers go straight to our technical team.",
      "No jargon — we'll translate on our end.",
    ],
  },
  steps: [
    {
      title: "Your digital presence today",
      questions: [
        { id: "website", prompt: "What does your business have online right now?", required: true, options: [
          "Nothing — no website, no social pages",
          "Only social media (Instagram / Facebook etc.)",
          "An outdated website we rarely update",
          "A recent website but it doesn't bring leads",
          "A working site — we want to add more features",
        ]},
        { id: "leads", prompt: "How do you currently track leads?", required: true, options: [
          "WhatsApp (I scroll and hope I remember)",
          "A notebook / phone notes",
          "A Google Sheet",
          "Proper CRM",
          "We don't track at all",
        ]},
      ],
    },
    {
      title: "Where is the friction?",
      sub: "Where does your day get eaten?",
      questions: [
        { id: "bottleneck", prompt: "Which of these hurts most right now?", required: true, options: [
          "People can't find us online",
          "Leads leak — no follow-up system",
          "Too many WhatsApp chats to manage manually",
          "No dashboards — I can't see the numbers",
          "We waste time on tasks that should be automated",
          "All of the above honestly",
        ]},
        { id: "team", prompt: "How big is the team that will use the system?", required: true, options: [
          "Just me",
          "2 – 5 people",
          "6 – 20 people",
          "20+ people",
        ]},
      ],
    },
    {
      title: "What do you want to build?",
      questions: [
        { id: "scope", prompt: "Pick what describes your ideal next step:", required: true, options: [
          "Just a professional website (5–10 pages)",
          "Website + lead capture + WhatsApp integration",
          "Full system: website + CRM + email/WhatsApp automation",
          "Custom platform with dashboards + AI chatbot",
          "I'm not sure — need advice first",
        ]},
        { id: "budget", prompt: "What's your budget range?", required: true, options: [
          "₦300k – ₦500k",
          "₦500k – ₦1M",
          "₦1M – ₦2M",
          "₦2M+",
          "Not decided yet",
        ]},
        { id: "deadline", prompt: "When do you want this live?", required: true, options: [
          "This month",
          "Next 2 months",
          "3 – 6 months",
          "No set deadline",
        ]},
      ],
    },
    {
      title: "Anything else we should know?",
      questions: [
        { id: "notes", prompt: "Tell us anything specific — a reference site you like, a feature you need, a constraint we should respect.", kind: "textarea" },
      ],
    },
  ],
  thankYou: {
    title: "Received. Nice clean brief.",
    sub: "Our Scalar team (lead: Dajot) will review your answers and come back with a scoped plan, timeline and cost. No jargon.",
    nextStep: "Expect our WhatsApp message within 2 business hours.",
  },
};

export default function ScalarAssessment() {
  return <AssessmentForm cfg={cfg} />;
}
