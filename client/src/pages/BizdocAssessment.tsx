import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "bizdoc",
  pageTitle: "Bizdoc Assessment | HAMZURY",
  pageDescription: "Tell us about your business. We'll prescribe the exact compliance package you need.",
  brand: "BIZDOC ASSESSMENT",
  accent: "#1B4D3E",
  highlight: "#B48C4C",
  welcome: {
    title: "Let's find out what your business actually needs.",
    sub: "We handle FIRS so you can handle business. Answer a few short questions — our compliance team reads your answers and comes back with the exact package. No upsell, no guesswork.",
    bullets: [
      "Takes about 3 minutes.",
      "Every answer is private — only our CSO team sees it.",
      "You'll get a reference number on submit. Keep it.",
    ],
  },
  steps: [
    {
      title: "Where are you now?",
      sub: "A snapshot of your business today.",
      questions: [
        { id: "stage", prompt: "What stage is your business in?", required: true, options: [
          "Not yet registered — still just an idea",
          "Registered (BN / Business Name)",
          "Registered (Ltd / Private Limited)",
          "Operating but unsure if fully compliant",
          "Fully compliant, looking for on-going management",
        ]},
        { id: "industry", prompt: "What industry are you in?", required: true, kind: "text" },
      ],
    },
    {
      title: "Where are the gaps?",
      sub: "Which of these apply to you right now?",
      questions: [
        { id: "tin", prompt: "Do you have a TIN (Tax Identification Number)?", required: true, options: [
          "Yes — active",
          "Yes — but I don't use it",
          "No — never got one",
          "I'm not sure",
        ]},
        { id: "tcc", prompt: "Do you have a current Tax Clearance Certificate (TCC)?", required: true, options: [
          "Yes — current",
          "Yes — but expired",
          "No — never had one",
          "What is TCC?",
        ]},
        { id: "returns", prompt: "Have you filed your annual returns this year?", required: true, options: [
          "Yes — up to date",
          "No — I forgot / didn't know",
          "No — couldn't afford the penalty",
          "N/A (not yet registered)",
        ]},
        { id: "licences", prompt: "Do you need any sector licence (NAFDAC, SCUML, PENCOM, etc.)?", options: [
          "Yes — I know which one(s)",
          "Maybe — I'm not sure which apply to me",
          "No",
        ]},
      ],
    },
    {
      title: "What's pushing you to act now?",
      questions: [
        { id: "urgency", prompt: "What's the trigger?", required: true, options: [
          "I have a contract / tender deadline",
          "I just received a FIRS letter / penalty notice",
          "I want to operate legally without fear",
          "A client / partner asked for documents I don't have",
          "I'm just getting organised",
        ]},
        { id: "timeline", prompt: "When do you need this handled?", required: true, options: [
          "This week",
          "Within 2 weeks",
          "Within a month",
          "Next 2–3 months",
          "No deadline — just exploring",
        ]},
      ],
    },
    {
      title: "Anything else we should know?",
      questions: [
        { id: "notes", prompt: "Add anything that helps us serve you better (optional).", kind: "textarea" },
      ],
    },
  ],
  thankYou: {
    title: "We've got your assessment.",
    sub: "Our Bizdoc team will review your answers and come back with a clear recommendation — exactly what you need, why, and what it costs.",
    nextStep: "You'll hear from us on WhatsApp within 2 business hours. Keep your reference number for tracking.",
  },
};

export default function BizdocAssessment() {
  return <AssessmentForm cfg={cfg} />;
}
