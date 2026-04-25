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
};
