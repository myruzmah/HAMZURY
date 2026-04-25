/**
 * Diagnostic form definitions — verbatim copies of the source HTML
 * (hamzury-forms.html). Currently only `clarity` is wired up; the other
 * four (business, software, media, skills) are added in future sessions.
 *
 * Adding a new form is a one-line change here + one-line route in App.tsx.
 */

export type DiagnosticFormId =
  | "clarity"
  | "business"
  | "software"
  | "media"
  | "skills";

export type DiagnosticQuestion =
  | TextareaQuestion
  | TextQuestion
  | SingleQuestion
  | MultiQuestion
  | ScaleQuestion
  | ContactQuestion;

export interface BaseQuestion {
  /** Section eyebrow shown above the question. */
  section: string;
  /** Question text — may contain `<em>` HTML; rendered via dangerouslySetInnerHTML. */
  question: string;
  /** Optional helper line shown under the question. */
  helper?: string;
  /** Show "Skip" button on this question. (None in clarity — supported for future forms.) */
  optional?: boolean;
}

export interface TextareaQuestion extends BaseQuestion {
  type: "textarea";
  placeholder?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder?: string;
}

export interface SingleQuestion extends BaseQuestion {
  type: "single";
  options: string[];
}

export interface MultiQuestion extends BaseQuestion {
  type: "multi";
  options: string[];
}

export interface ScaleQuestion extends BaseQuestion {
  type: "scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface ContactQuestion extends BaseQuestion {
  type: "contact";
}

export interface DiagnosticForm {
  /** Display title (used on the intro card and as the form name). */
  title: string;
  /** Sub-title for the intro card. */
  subtitle: string;
  intro: {
    eyebrow: string;
    /** May contain `<em>` HTML. */
    title: string;
    body: string;
    duration: string;
    questions: string;
    privacy: string;
  };
  questions: DiagnosticQuestion[];
}

// ─── Shared contact step (always the last question on every form) ────────────

const CONTACT_QUESTION: ContactQuestion = {
  type: "contact",
  section: "One last thing",
  question: "Where should we send your plan?",
  helper:
    "We'll review your responses and reach out within 24 hours with a personalised breakdown.",
};

// ─── FORMS ────────────────────────────────────────────────────────────────────

export const FORMS: Partial<Record<DiagnosticFormId, DiagnosticForm>> = {
  clarity: {
    title: "Clarity Session",
    subtitle: "We find the gaps, you get the plan",
    intro: {
      eyebrow: "Full business diagnostic",
      title: "Let's find the <em>gaps</em>.",
      body: "A comprehensive diagnostic across every part of your business — compliance, systems, presence, people, and vision. Most founders finish this feeling calmer than when they started. You might name the thing you've been avoiding for a year.",
      duration: "12–15 minutes",
      questions: "14 questions",
      privacy: "Skippable · private",
    },
    questions: [
      // The Big Picture
      {
        type: "textarea",
        section: "The big picture",
        question:
          "When you think about your business, what's the <em>feeling</em> you want to have in 12 months?",
        helper:
          "Not the revenue number. The feeling. Peace? Pride? Freedom? Something else?",
        placeholder: "Describe it as if the future has already happened.",
      },
      {
        type: "textarea",
        section: "The big picture",
        question:
          "What's the one thing you'd love someone else to <em>take off your plate</em>?",
        helper:
          "The task, role, or responsibility you've been carrying too long.",
        placeholder: "Be specific. The more specific, the more actionable.",
      },
      {
        type: "textarea",
        section: "The big picture",
        question:
          "On a calm Sunday, what's the business thought that <em>still keeps you up</em>?",
        helper:
          "The one that doesn't go away even when the business is going well.",
        placeholder:
          "Nothing leaves our team. This is just for us to help you.",
      },
      // Foundation
      {
        type: "single",
        section: "The foundation",
        question: "Is your business formally registered with CAC?",
        options: [
          "Yes, fully",
          "Started but not finished",
          "No, not yet",
          "I'm not sure what's current",
        ],
      },
      {
        type: "single",
        section: "The foundation",
        question: "When was the last time you filed your taxes?",
        options: [
          "Within the past year",
          "1–2 years ago",
          "More than 2 years ago",
          "I've never filed",
          "I'm not sure",
        ],
      },
      {
        type: "scale",
        section: "The foundation",
        question:
          "If you were audited tomorrow, how ready would you feel?",
        helper: '1 means "not at all", 5 means "completely ready".',
        min: 1,
        max: 5,
        minLabel: "Not at all",
        maxLabel: "Fully ready",
      },
      // Systems
      {
        type: "single",
        section: "The systems",
        question:
          "Where do leads and customer conversations actually live?",
        options: [
          "A proper CRM",
          "Spreadsheets",
          "WhatsApp and my memory",
          "All over the place",
          "We don't really track this",
        ],
      },
      {
        type: "textarea",
        section: "The systems",
        question:
          "What's the <em>most repetitive task</em> your team does each week?",
        helper: "The one everyone grumbles about.",
        placeholder:
          "Describe the task and roughly how often it happens.",
      },
      // Presence
      {
        type: "single",
        section: "The presence",
        question:
          "If a stranger found your business online today, what would they think?",
        options: [
          "Impressed — we look sharp",
          "Neutral — it's fine",
          "Unsure what we actually do",
          "Honestly, I don't want to check",
          "Nothing — we're barely online",
        ],
      },
      {
        type: "multi",
        section: "The presence",
        question: "Which of these sound like you?",
        helper: "Select all that apply.",
        options: [
          "I post but nothing grows",
          "We have no consistent content",
          "Our brand looks inconsistent",
          "I wish someone would just handle media for us",
          "We're happy with where we are",
        ],
      },
      // People
      {
        type: "textarea",
        section: "The people",
        question:
          "What's one <em>skill gap</em> on your team that's costing you this year?",
        helper:
          "The capability you keep paying around instead of building.",
        placeholder:
          "Could be technical, operational, creative, leadership…",
      },
      {
        type: "single",
        section: "The people",
        question: "How does your team currently keep growing their skills?",
        options: [
          "Structured training and learning paths",
          "Occasional courses when needed",
          "Self-directed — they figure it out",
          "Honestly, they don't",
          "I've never thought about this",
        ],
      },
      // Vision
      {
        type: "textarea",
        section: "The vision",
        question:
          "What does a <em>thriving version</em> of your business look like?",
        helper: "Not the pitch-deck version. The real one.",
        placeholder:
          "What does a Monday look like? A Friday? What are you doing, and not doing?",
      },
      {
        type: "textarea",
        section: "The vision",
        question:
          "What's the one change, in the next 90 days, that would <em>matter most</em>?",
        helper:
          "If only one thing got fixed, what would you want it to be?",
        placeholder: "The change whose absence you feel every day.",
      },
      CONTACT_QUESTION,
    ],
  },

  business: {
    title: "Diagnose my Business",
    subtitle: "Compliance & Growth",
    intro: {
      eyebrow: "Department diagnostic",
      title: "Let's look at your <em>foundation</em>.",
      body: "A focused diagnostic for the compliance, legal, and structural side of your business. No pressure, no judgment — just a calm conversation with yourself about where things stand.",
      duration: "6–8 minutes",
      questions: "7 questions",
      privacy: "Skippable · private",
    },
    questions: [
      {
        type: "textarea",
        section: "The quiet worry",
        question:
          "When you think about your business right now, what's the one thing that quietly worries you?",
        helper:
          "The thing that comes to mind at 2am. Be honest — nothing here leaves our team.",
        placeholder:
          "It could be anything — a feeling, a specific task you've been avoiding, a letter you haven't opened…",
      },
      {
        type: "single",
        section: "Registration",
        question:
          "Is your business formally registered with the Corporate Affairs Commission?",
        helper:
          "There's no wrong answer — many businesses operate for years before formalising.",
        options: [
          "Yes, fully registered with CAC",
          "Registered but I'm not sure what's up to date",
          "Started the process, never finished",
          "No, not yet",
          "Honestly, I'm not sure",
        ],
      },
      {
        type: "single",
        section: "Tax",
        question: "When was the last time you filed your taxes?",
        helper: "This tells us a lot about where to start.",
        options: [
          "Within the past year",
          "1–2 years ago",
          "More than 2 years ago",
          "I've never filed",
          "I'm not sure",
        ],
      },
      {
        type: "single",
        section: "Tax",
        question: "Do you know exactly how much tax you paid last year?",
        helper:
          "Most business owners overpay because they don't track this closely.",
        options: [
          "Yes, exactly",
          "A rough idea",
          "Not really",
          "I'd rather not say",
        ],
      },
      {
        type: "single",
        section: "Finances",
        question:
          "How do you currently track your business income and expenses?",
        helper: "The honest answer is often the most useful one.",
        options: [
          "Dedicated accounting software",
          "Spreadsheets",
          "A notebook",
          "My bank statements — that's it",
          "I don't really track it",
        ],
      },
      {
        type: "single",
        section: "Readiness",
        question:
          "If a client asked you for a Tax Clearance Certificate today, could you provide one within 48 hours?",
        helper: "TCCs have become routine requests — especially for contracts.",
        options: [
          "Yes, no problem",
          "I'd have to scramble",
          "No, I couldn't",
          "What's a TCC?",
        ],
      },
      {
        type: "textarea",
        section: "The vision",
        question:
          "When you imagine your business one year from now, what does <em>\"handled\"</em> look like to you?",
        helper: "Describe the feeling, not just the milestones.",
        placeholder:
          "Maybe it's never worrying about tax. Maybe it's sleeping through an audit. Maybe it's something else entirely…",
      },
      CONTACT_QUESTION,
    ],
  },

  software: {
    title: "Diagnose my Software",
    subtitle: "Digital Systems",
    intro: {
      eyebrow: "Department diagnostic",
      title: "Let's look at your <em>systems</em>.",
      body: "A focused diagnostic for your digital tools, workflows, and online presence. The goal isn't to catch you out — it's to see where systems could be doing more of the work.",
      duration: "6–8 minutes",
      questions: "7 questions",
      privacy: "Skippable · private",
    },
    questions: [
      {
        type: "single",
        section: "Digital presence",
        question:
          "When someone searches your business online right now, what do they find?",
        helper: "Be honest with yourself — what's actually there today?",
        options: [
          "A professional website I'm proud of",
          "A basic website that needs work",
          "Just my social media",
          "Almost nothing",
          "I haven't checked in a while",
        ],
      },
      {
        type: "multi",
        section: "Lead flow",
        question: "How do leads currently reach you?",
        helper: "Select all that apply.",
        options: [
          "WhatsApp",
          "Instagram / Facebook DMs",
          "Email",
          "Phone calls",
          "Walk-ins",
          "Website enquiries",
          "Referrals",
          "Other",
        ],
      },
      {
        type: "single",
        section: "Tracking",
        question: "Where do you keep track of leads and conversations?",
        helper:
          "If a lead came in three weeks ago, could you find the conversation?",
        options: [
          "A proper CRM",
          "Spreadsheets",
          "My memory",
          "WhatsApp chat history",
          "A mix of everything",
        ],
      },
      {
        type: "single",
        section: "Manual work",
        question:
          "How many times a week does your team do the same task by hand?",
        helper:
          "Sending the same email, updating the same sheet, replying to the same question…",
        options: [
          "1–5 times",
          "6–15 times",
          "16–30 times",
          "More than 30 times",
          "I've never counted — but a lot",
        ],
      },
      {
        type: "single",
        section: "AI readiness",
        question: "Have you tried using AI in your business yet?",
        helper:
          "Not just playing with ChatGPT — actually using it to do work.",
        options: [
          "Yes, it's working for me",
          "Tried it, didn't stick",
          "Want to, but don't know where to start",
          "Not sure if it applies to my business",
          "I haven't thought about it",
        ],
      },
      {
        type: "scale",
        section: "Digital maturity",
        question:
          "If your website went offline today, how much would it actually affect sales?",
        helper: "Drag to rate — 1 means no impact, 5 means devastating.",
        min: 1,
        max: 5,
        minLabel: "No impact",
        maxLabel: "Devastating",
      },
      {
        type: "textarea",
        section: "The vision",
        question:
          "What's one task that, if it <em>ran itself</em>, would give you your Sunday back?",
        helper: "The specific thing you keep doing and keep resenting.",
        placeholder:
          "Maybe it's invoicing. Maybe it's chasing up leads. Maybe it's scheduling posts…",
      },
      CONTACT_QUESTION,
    ],
  },

  media: {
    title: "Diagnose my Media",
    subtitle: "Content & Presence",
    intro: {
      eyebrow: "Department diagnostic",
      title: "Let's look at your <em>presence</em>.",
      body: "A focused diagnostic for your brand, content, and social presence. Most businesses know something is off here — this is how we find what.",
      duration: "6–8 minutes",
      questions: "7 questions",
      privacy: "Skippable · private",
    },
    questions: [
      {
        type: "single",
        section: "Activity",
        question:
          "When was the last time you posted on your main social channel?",
        helper: "The channel your audience actually spends time on.",
        options: [
          "Today",
          "This week",
          "This month",
          "Longer than a month",
          "I don't really remember",
        ],
      },
      {
        type: "single",
        section: "Clarity",
        question:
          "If someone new finds your Instagram today, would they immediately know what your business does?",
        helper: "Think about it from a stranger's eyes.",
        options: [
          "Yes, totally clear",
          "Somewhat clear",
          "Probably confusing",
          "I'd rather not think about it",
        ],
      },
      {
        type: "single",
        section: "Capacity",
        question: "Who creates your content right now?",
        helper: "The real answer — not the one you wish were true.",
        options: [
          "Me personally, when I can",
          "A team member doing it on the side",
          "An agency or freelancer",
          "No one consistently",
          "Honestly, nobody right now",
        ],
      },
      {
        type: "single",
        section: "Strategy",
        question: "What's your content plan for next month?",
        helper: "Not what you'd like it to be — what it actually is.",
        options: [
          "A full content calendar",
          "Rough ideas written down",
          "I'll figure it out as I go",
          "There is no plan",
        ],
      },
      {
        type: "multi",
        section: "Frustrations",
        question: "Which of these have you felt recently?",
        helper: "Select all that apply. No one is watching.",
        options: [
          "I post but nothing grows",
          "I don't know what to say",
          "I run out of ideas",
          "My content looks inconsistent",
          "I wish someone else could just handle it",
          "I'm embarrassed to check my analytics",
        ],
      },
      {
        type: "textarea",
        section: "The message",
        question:
          "If one piece of content could <em>go viral</em> this month, what would you want it to be about?",
        helper:
          "What's the one thing you wish the world understood about your business?",
        placeholder:
          "It could be a story, a transformation, a message, a product…",
      },
      {
        type: "textarea",
        section: "The vision",
        question:
          "What would a <em>strong media presence</em> actually look like for your business in six months?",
        helper: "Paint the picture.",
        placeholder:
          "How many followers? What kind of engagement? What would people be saying?",
      },
      CONTACT_QUESTION,
    ],
  },

  skills: {
    title: "Diagnose my Skills",
    subtitle: "Training & Development",
    intro: {
      eyebrow: "Department diagnostic",
      title: "Let's look at your <em>people</em>.",
      body: "A focused diagnostic for your team's capability and growth. Your business can only grow as far as your people can carry it.",
      duration: "6–8 minutes",
      questions: "7 questions",
      privacy: "Skippable · private",
    },
    questions: [
      {
        type: "textarea",
        section: "Observation",
        question:
          "When you think about your team, who's <em>quietly outgrowing</em> their role?",
        helper:
          "The one you can already see needs more — more challenge, more training, more growth.",
        placeholder: "Just a name or a role is fine. Or tell us the story.",
      },
      {
        type: "single",
        section: "Training history",
        question: "When was the last time your team did formal training?",
        helper: "YouTube videos don't count.",
        options: [
          "Within the past 3 months",
          "Within the past year",
          "More than a year ago",
          "We've never done formal training",
        ],
      },
      {
        type: "textarea",
        section: "The gap",
        question:
          "Is there a specific skill gap right now that's <em>costing you money</em>?",
        helper:
          "A capability you're paying consultants for, or losing deals over, or just working around.",
        placeholder: "Write it plainly. Naming it is half the work.",
      },
      {
        type: "single",
        section: "Your growth",
        question: "How do you currently keep your own skills sharp?",
        helper: "You're a leader — this matters.",
        options: [
          "I take courses regularly",
          "I learn from mentors",
          "YouTube and Google when I need to",
          "I don't really have time for this",
          "Honestly, I feel stuck",
        ],
      },
      {
        type: "textarea",
        section: "Priority",
        question:
          "If you could add <em>one new capability</em> to your team in the next six months, what would it be?",
        helper: "Not a dream list — the one that would move the needle.",
        placeholder:
          "It could be a technical skill, a soft skill, a whole new discipline…",
      },
      {
        type: "single",
        section: "Investment",
        question: "How much do you currently budget for team development?",
        helper: "Training, courses, coaching, conferences — all of it.",
        options: [
          "None",
          "Under ₦50,000 per year",
          "₦50,000 – ₦200,000 per year",
          "₦200,000 – ₦500,000 per year",
          "More than ₦500,000 per year",
          "I've never thought about it as a line item",
        ],
      },
      {
        type: "single",
        section: "Retention",
        question:
          "When your team thinks about their future at your company, do they see growth?",
        helper: "This one is hard. Answer honestly.",
        options: [
          "Yes, clearly",
          "Somewhat",
          "Honestly, probably not",
          "I don't know",
        ],
      },
      CONTACT_QUESTION,
    ],
  },
};
