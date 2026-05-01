import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "hub",
  pageTitle: "Feedback & Complaints | HAMZURY HUB",
  pageDescription: "Tell HAMZURY HUB what's working, what's not, or what we should fix. We read every message.",
  brand: "FEEDBACK & COMPLAINTS",
  accent: "#1E3A5F",
  highlight: "#B48C4C",
  welcome: {
    title: "Tell us straight.",
    sub: "Compliment, complaint, or suggestion — it goes to the founder's desk. We read every one.",
    bullets: [
      "Anonymous if you want — name and email are optional.",
      "Founder reads new entries every Friday.",
      "We come back if you leave contact details.",
    ],
  },
  steps: [
    {
      title: "What kind of feedback?",
      questions: [
        { id: "kind", prompt: "Pick one", required: true, options: [
          "Compliment / thank you",
          "Suggestion / idea",
          "Complaint — something broke",
          "Complaint — about a person on staff",
          "Safety / harassment concern",
          "Other",
        ]},
        { id: "area", prompt: "Which area?", required: true, options: [
          "A specific programme / class",
          "Mentor / instructor",
          "Admin / front desk",
          "Payments / finance",
          "Facilities (Jos campus)",
          "Online platform / website",
          "Not sure",
        ]},
      ],
    },
    {
      title: "The details",
      questions: [
        { id: "summary", kind: "text", prompt: "One-line summary", required: true },
        { id: "story",   kind: "textarea", prompt: "What happened, or what would you like to see?", required: true },
        { id: "outcome", kind: "textarea", prompt: "What outcome would feel right to you? (optional)" },
      ],
    },
    {
      title: "Contact (optional)",
      sub: "Leave blank if you'd rather stay anonymous.",
      questions: [
        { id: "anonName",  kind: "text", prompt: "Your name (optional)" },
        { id: "anonEmail", kind: "text", prompt: "Email or phone (optional)" },
      ],
    },
  ],
  thankYou: {
    title: "Received. Thank you.",
    sub: "The founder reads every entry. If you left contact details and asked for a reply, we'll come back within two business days.",
    nextStep: "Save your reference number in case you want to follow up.",
  },
};

export default function HubFeedback() {
  return <AssessmentForm cfg={cfg} />;
}
