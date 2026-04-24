import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

const cfg: AssessmentConfig = {
  division: "medialy",
  pageTitle: "Medialy Assessment | HAMZURY",
  pageDescription: "Tell us about your brand. We'll build the social rhythm that actually brings clients.",
  brand: "MEDIALY ASSESSMENT",
  accent: "#1D4ED8",
  highlight: "#B48C4C",
  welcome: {
    title: "Let's build a social media rhythm that actually works.",
    sub: "Social media that actually brings clients. Answer a few questions so our Medialy team can design the right posting cadence, content mix, and platform strategy for your brand.",
    bullets: [
      "Takes about 3 minutes.",
      "We want real answers — no filter.",
      "Our strategist will respond personally.",
    ],
  },
  steps: [
    {
      title: "Where is your social right now?",
      questions: [
        { id: "presence", prompt: "Which platforms are you on?", required: true, options: [
          "None — I don't post anywhere",
          "Instagram only",
          "Instagram + Facebook",
          "Instagram + TikTok",
          "All of Instagram, Facebook, LinkedIn, TikTok",
          "Other (I'll tell you in notes)",
        ]},
        { id: "rhythm", prompt: "How often do you actually post?", required: true, options: [
          "Never / almost never",
          "Once a month when I remember",
          "1 – 2 times a week",
          "3+ times a week",
          "Every day",
        ]},
        { id: "followers", prompt: "Roughly how many followers do you have?", required: true, options: [
          "Under 500",
          "500 – 2,000",
          "2,000 – 10,000",
          "10,000+",
        ]},
      ],
    },
    {
      title: "What's broken?",
      sub: "Be honest — we've heard it all.",
      questions: [
        { id: "painpoint", prompt: "What frustrates you most about your social media right now?", required: true, options: [
          "I don't know what to post",
          "I post but no one engages",
          "I have followers but no clients",
          "I can't keep up — life gets in the way",
          "My content doesn't look professional",
          "I'm doing fine — just want more reach",
        ]},
        { id: "goal", prompt: "What's the outcome you actually want?", required: true, options: [
          "More qualified inbox messages",
          "More people recognising my brand",
          "Trust & authority in my niche",
          "Sales directly from social",
          "All of the above",
        ]},
      ],
    },
    {
      title: "Your business",
      questions: [
        { id: "industry", prompt: "What industry are you in?", required: true, kind: "text" },
        { id: "audience", prompt: "Who is your ideal customer? (Short description)", required: true, kind: "textarea" },
      ],
    },
    {
      title: "Your next move",
      questions: [
        { id: "package", prompt: "Which package fits you best right now?", required: true, options: [
          "Setup — ₦50k one-time, I just need the foundation",
          "Manage — ₦150k/mo, handle the daily grind for me",
          "Accelerate — ₦300k/mo, full management across 3 platforms",
          "Authority — ₦500k/mo, dominate with paid ads included",
          "Not sure — advise me",
        ]},
        { id: "notes", prompt: "Anything else? References, competitors you admire, must-avoid topics…", kind: "textarea" },
      ],
    },
  ],
  thankYou: {
    title: "Received. Let's get you posting.",
    sub: "Our Medialy team will review your answers and come back with a content plan — what to post, how often, which platforms, and how we'll measure it.",
    nextStep: "Expect our WhatsApp message within 2 business hours.",
  },
};

export default function MedialyAssessment() {
  return <AssessmentForm cfg={cfg} />;
}
