import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "hub",
  sourceOverride: "partner_hub",
  pageTitle: "Partner with HAMZURY HUB | HAMZURY",
  pageDescription: "Partner with HAMZURY HUB. We work with companies, schools, NGOs, sponsors and ecosystem partners on training, hiring and impact.",
  brand: "PARTNER WITH HUB",
  accent: "#1E3A5F",
  highlight: "#B48C4C",
  welcome: {
    title: "Let's build together.",
    sub: "We partner with companies, schools, NGOs, sponsors and ecosystem players. Tell us what you have in mind and we'll come back within two business days.",
    bullets: [
      "Hiring partners — get first look at vetted graduates.",
      "Training partners — bring your team to a HUB cohort or a private workshop.",
      "Sponsors / scholarships — fund a seat, fund a cohort, fund a region.",
      "Ecosystem — co-host events, co-build content, joint research.",
    ],
  },
  steps: [
    {
      title: "About your organisation",
      questions: [
        { id: "orgName",  kind: "text", prompt: "Organisation name", required: true },
        { id: "orgType",  prompt: "Organisation type", required: true, options: [
          "Company / startup",
          "Larger enterprise",
          "School / university",
          "NGO / non-profit",
          "Government / public sector",
          "Individual sponsor",
          "Other",
        ]},
        { id: "website", kind: "text", prompt: "Website or LinkedIn (optional)" },
      ],
    },
    {
      title: "What kind of partnership?",
      questions: [
        { id: "partnership", prompt: "Closest fit:", required: true, options: [
          "Hire HUB graduates",
          "Bring my team for training",
          "Sponsor seats / scholarships",
          "Sponsor a full cohort or programme",
          "Co-host events / content",
          "Research / pilot project",
          "Not sure yet — let's talk",
        ]},
        { id: "scale", prompt: "Rough scale", required: true, options: [
          "Just exploring",
          "Small (1–5 people / seats)",
          "Medium (6–25)",
          "Large (25+)",
          "National / regional",
        ]},
        { id: "timeline", prompt: "When are you hoping to start?", required: true, options: [
          "Right away",
          "Next 1–2 months",
          "Next 3–6 months",
          "Later this year",
          "No timeline yet",
        ]},
      ],
    },
    {
      title: "What does success look like?",
      questions: [
        { id: "goal",  kind: "textarea", prompt: "In 2–3 sentences, what would make this partnership a win for you?", required: true },
        { id: "notes", kind: "textarea", prompt: "Anything else we should know?" },
      ],
    },
  ],
  thankYou: {
    title: "Thanks — we'll be in touch.",
    sub: "Our partnerships team will review your message and come back with next steps within two business days.",
    nextStep: "Save your reference number. If urgent, email partners@hamzury.com.",
  },
};

export default function HubPartner() {
  return <AssessmentForm cfg={cfg} />;
}
