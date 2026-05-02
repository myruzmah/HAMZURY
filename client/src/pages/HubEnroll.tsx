import AssessmentForm, { type AssessmentConfig } from "./_forms/AssessmentForm";

/* ─── Programme category detector ───────────────────────────────────────────
 * Branches the form by the programme the user picks in step 2. Each branch
 * shows ONLY the questions that matter for that path, so an 8-year-old joining
 * the kids programme isn't asked about AI familiarity, and a SIWES intern
 * isn't asked about cohort batch.
 *
 * Categories:
 *   - core      : 7 main physical/online cohort programmes for adults
 *   - kids      : 8–15 Saturday-morning club programmes
 *   - placement : HUB Internship (placement-track for HUB graduates)
 *   - siwes     : Higher-Institution Internship (SIWES / IT for uni / poly students)
 *   - online    : Online Academy (self-paced AI-for-business)
 *   - corporate : Corporate Workshop (team training, max 1 week)
 *   - unsure    : "Not sure — help me choose"
 * ────────────────────────────────────────────────────────────────────────── */
type ProgrammeCategory = "core" | "kids" | "placement" | "siwes" | "online" | "corporate" | "unsure";

function categoryFor(programAnswer: string | undefined): ProgrammeCategory | null {
  if (!programAnswer) return null;
  const p = programAnswer.toLowerCase();
  if (p.includes("not sure")) return "unsure";
  if (p.startsWith("kids") || p.includes("(kids 8") || p.includes("(10–15")) return "kids";
  if (p.startsWith("hub internship")) return "placement";
  if (p.startsWith("higher-institution") || p.includes("siwes")) return "siwes";
  if (p.startsWith("online academy")) return "online";
  if (p.startsWith("corporate workshop")) return "corporate";
  return "core";
}

const isCore       = (a: Record<string, string>) => categoryFor(a.program) === "core";
const isKids       = (a: Record<string, string>) => categoryFor(a.program) === "kids";
const isPlacement  = (a: Record<string, string>) => categoryFor(a.program) === "placement";
const isSiwes      = (a: Record<string, string>) => categoryFor(a.program) === "siwes";
const isOnline     = (a: Record<string, string>) => categoryFor(a.program) === "online";
const isCorporate  = (a: Record<string, string>) => categoryFor(a.program) === "corporate";
const isUnsure     = (a: Record<string, string>) => categoryFor(a.program) === "unsure";
const isAdultLearner = (a: Record<string, string>) =>
  ["core", "online", "placement", "siwes"].includes(categoryFor(a.program) || "");

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
      "Takes about 3 minutes. Questions adapt to the programme you pick.",
    ],
  },
  steps: [
    /* ─── 1. Who + age ─── (always shown) */
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

    /* ─── 2. Programme picker ─── (always shown — this is the branch point) */
    {
      title: "Which programme interests you?",
      sub: "Pick the one closest to your goal. We'll confirm fit and the questions after this will adapt.",
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
      ],
    },

    /* ─── 3a. CORE — mode + batch ─── */
    {
      title: "How would you like to attend?",
      showWhen: isCore,
      questions: [
        { id: "mode", prompt: "Preferred learning mode:", required: true, options: [
          "Physical at Jos (Mon–Wed advanced, or Thu–Sat basics)",
          "Fully online",
          "Hybrid (mostly online, some in-person at Jos)",
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

    /* ─── 3b. KIDS — parent + child context ─── */
    {
      title: "About your child",
      sub: "A few things so the trainer knows where to start.",
      showWhen: isKids,
      questions: [
        { id: "parentName", kind: "text", prompt: "Parent / guardian name", required: true },
        { id: "kidExperience", prompt: "How much have they used a computer or tablet?", required: true, options: [
          "Almost never — they'll learn from scratch",
          "A little — games, watching videos",
          "Comfortable — uses it for school work",
          "Already curious about coding / building",
        ]},
        { id: "kidGoal", prompt: "What would make this worth it for you?", required: true, options: [
          "They get hands-on with real tech, not just screens",
          "They build something they're proud of",
          "They make friends who like the same thing",
          "They start considering tech as a future career",
        ]},
        { id: "kidNotes", kind: "textarea", prompt: "Anything we should know? (allergies, behaviour, special needs)" },
      ],
    },

    /* ─── 3c. PLACEMENT — HUB grad placement track ─── */
    {
      title: "About your HUB graduation",
      showWhen: isPlacement,
      questions: [
        { id: "completedProgramme", prompt: "Which HUB programme did you complete?", required: true, options: [
          "Business Builders Academy",
          "Digital Dominance",
          "Code Craft Bootcamp",
          "Compliance Mastery",
          "Data Analytics",
          "MetFix Hardware & Robotics",
          "Other (mention in notes)",
        ]},
        { id: "graduationYear", prompt: "When did you graduate?", required: true, options: [
          "Within the last 3 months",
          "3–6 months ago",
          "6–12 months ago",
          "Over a year ago",
        ]},
        { id: "placementDept", prompt: "Which Hamzury team are you hoping to join?", required: true, options: [
          "Bizdoc (tax / compliance)",
          "Scalar (websites / software / automation)",
          "Medialy (branding / content / social)",
          "HUB (training delivery)",
          "Studio (podcast / video)",
          "Open — place me where I'd grow most",
        ]},
        { id: "internMonths", prompt: "How many months can you commit?", required: true, options: [
          "1 month", "2 months", "3 months",
          "4–6 months", "6–9 months", "10–12 months",
        ]},
        { id: "portfolio", kind: "text", prompt: "Portfolio / GitHub / IG link (optional)" },
      ],
    },

    /* ─── 3d. SIWES — uni / poly intern track ─── */
    {
      title: "About your SIWES placement",
      sub: "We accept your school's logbook + send back signed evaluation forms at the end.",
      showWhen: isSiwes,
      questions: [
        { id: "schoolName", kind: "text", prompt: "School / University / Polytechnic name", required: true },
        { id: "courseOfStudy", kind: "text", prompt: "Course of study", required: true },
        { id: "currentLevel", prompt: "Current level / year", required: true, options: [
          "100 / Year 1", "200 / Year 2", "300 / Year 3", "400 / Year 4", "500 / Year 5", "ND / HND",
        ]},
        { id: "siwesMonths", prompt: "Required duration", required: true, options: [
          "1 month — ₦45,000",
          "2 months — ₦80,000",
          "3 months — ₦100,000",
          "4 months — ₦120,000",
          "5 months — ₦140,000",
          "6 months — ₦160,000",
          "9 months — ₦220,000",
          "12 months — ₦280,000",
        ]},
        { id: "siwesStart", kind: "text", prompt: "Earliest start date (DD/MM/YYYY)", required: true },
        { id: "schoolLetter", prompt: "Do you have your school's introduction letter?", required: true, options: [
          "Yes — I have it ready",
          "Not yet — getting it this week",
          "Need help — what should I tell my school?",
        ]},
      ],
    },

    /* ─── 3e. ONLINE — self-paced ─── */
    {
      title: "Your online learning",
      showWhen: isOnline,
      questions: [
        { id: "currentRole", kind: "text", prompt: "What do you do day-to-day? (job title or 'student')", required: true },
        { id: "weeklyHours", prompt: "How many hours a week can you study?", required: true, options: [
          "1–3 hours", "4–7 hours", "8+ hours",
        ]},
        { id: "mentorAddon", prompt: "Add a 1-on-1 mentor for ₦10,000 extra?", required: true, options: [
          "Yes — match me with a mentor",
          "No — I'll go self-paced",
          "Maybe later — send me details",
        ]},
      ],
    },

    /* ─── 3f. CORPORATE — team training ─── */
    {
      title: "About your team",
      showWhen: isCorporate,
      questions: [
        { id: "companyName", kind: "text", prompt: "Company name", required: true },
        { id: "teamSize", prompt: "How many people are joining?", required: true, options: [
          "1–5", "6–10", "11–20", "21–50", "50+",
        ]},
        { id: "businessSegment", prompt: "Which segment should AI solve for you?", required: true, options: [
          "Operations / admin",
          "Sales / business development",
          "Marketing / content",
          "Finance / bookkeeping",
          "HR / people ops",
          "Product / strategy",
          "Multiple — let's discuss",
        ]},
        { id: "corpLocation", prompt: "Where should we run it?", required: true, options: [
          "At our office (Jos / Abuja / Lagos)",
          "At HAMZURY HUB Jos",
          "Fully online",
        ]},
        { id: "corpDates", kind: "text", prompt: "Preferred dates (any flexibility helps)", required: true },
        { id: "decisionMaker", prompt: "Are you the decision-maker?", required: true, options: [
          "Yes",
          "No — I'm scoping for the decision-maker",
        ]},
      ],
    },

    /* ─── 4. AI starting point ─── (adult learners only — core/online/placement/siwes) */
    {
      title: "Your AI starting point",
      sub: "We teach you the basics, then how to use AI (Claude, Gemini, ChatGPT — directly or through connectors) to multiply the outcome.",
      showWhen: isAdultLearner,
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
      ],
    },

    /* ─── 5. Goal + commitment ─── (core / placement only — online has its own hours Q, kids/corporate/siwes don't need) */
    {
      title: "Your goal",
      showWhen: (a) => ["core", "placement"].includes(categoryFor(a.program) || ""),
      questions: [
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

    /* ─── 6a. Payment & cohort ─── (core only) */
    {
      title: "Payment & cohort",
      showWhen: isCore,
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

    /* ─── 6b. Kids / SIWES / Online / Placement / Corporate — light closing ─── */
    {
      title: "Anything else?",
      showWhen: (a) => ["kids", "placement", "siwes", "online", "corporate", "unsure"].includes(categoryFor(a.program) || ""),
      questions: [
        { id: "notes", prompt: "Notes / questions for our team", kind: "textarea" },
      ],
    },

    /* ─── 7. Seat-hold payment ─── (only for cash payers — skip scholarship apply / sponsor) */
    {
      title: "Pay your seat hold",
      sub: "Send ₦10,000 to the account below. After this form is submitted, send the receipt to our WhatsApp — we'll match it to your enrolment within minutes. Scholarship-code, scholarship-application, and sponsor payers can skip — we'll arrange this with you separately.",
      accountInfo: {
        bank: "MoniePoint",
        name: "Hamzury Ltd.",
        number: "8034620520",
        amount: "₦10,000 — Seat Hold",
        note: "Use your full name as the transfer narration if your app allows. After submitting this form, the next screen will give you a 1-tap WhatsApp link to send the receipt.",
      },
      showWhen: (a) => {
        // Only for paths that involve cash up-front
        const cat = categoryFor(a.program);
        if (cat === "kids" || cat === "core" || cat === "online" || cat === "placement" || cat === "siwes") {
          // Hide if user picked scholarship-apply / scholarship-code / sponsor
          const p = (a.payment || "").toLowerCase();
          if (p.includes("scholarship") || p.includes("sponsor") || p.includes("company")) return false;
          return true;
        }
        // Corporate is invoiced separately; unsure skips entirely
        return false;
      },
      questions: [
        { id: "paidConfirm", prompt: "Have you sent ₦10,000?", required: true, options: [
          "Yes — I've sent it (next screen has the WhatsApp link to send the receipt)",
          "Not yet — I'll send it after this form (we won't lock the seat until we see the receipt)",
        ]},
        {
          id: "transferNarration",
          kind: "text",
          prompt: "Transfer narration / sender name on the receipt (so we can match it to you):",
          showWhen: (a) => (a.paidConfirm || "").startsWith("Yes"),
        },
      ],
    },
  ],
  thankYou: {
    title: "Welcome to HUB.",
    sub: "Our team will review your enrolment, match you to the right cohort, and send your orientation pack with payment details and next steps.",
    nextStep: "If you've already paid the ₦10,000 seat-hold, tap the WhatsApp button below to send us the receipt. We'll match it to your reference and lock your seat within minutes.",
    whatsappCta: {
      label: "Send receipt on WhatsApp",
      phone: "09130700056",
      messageTemplate: "Hi HAMZURY HUB — I just submitted the enrolment form. Reference: {ref}. Sending my ₦10,000 seat-hold receipt now.",
    },
  },
};

/**
 * Pre-select the programme dropdown when the user clicked "Book a seat" from
 * a specific course card. The card passes `?programme=<course name>`. We find
 * the dropdown option that starts with the same first 4 words (or contains
 * the course name) and pre-fill it so the user doesn't have to scroll the
 * 14-option list a second time.
 */
/**
 * Normalise a programme name so card-name and dropdown-option formats can be
 * compared. Strips parentheticals, em-dashes, prices, weeks notation.
 *   "Business Builders Academy"
 *   "Business Builders Academy — 3 wks, ₦150k (Jos / Online)"
 *   → both → "business builders academy"
 */
function normaliseProgramme(s: string): string {
  return s
    .toLowerCase()
    .replace(/[—–-].*$/, "")           // strip everything after dash
    .replace(/\([^)]*\)/g, "")          // strip parenthetical descriptions
    .replace(/\s+/g, " ")
    .trim();
}

function preselectFromUrl(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const wanted = new URLSearchParams(window.location.search).get("programme");
  if (!wanted) return {};
  const norm = normaliseProgramme(wanted);
  if (!norm) return {};
  const programmeStep = cfg.steps.find(s => s.questions.some(q => q.id === "program"));
  const options = programmeStep?.questions.find(q => q.id === "program")?.options || [];

  // Pass 1: exact normalised prefix match.
  let match = options.find(opt => normaliseProgramme(opt) === norm);
  // Pass 2: dropdown option starts with wanted (handles "Beginner Tech Skills"
  //         card → "Beginner Tech Skills (Kids 8–15)" option).
  if (!match) match = options.find(opt => normaliseProgramme(opt).startsWith(norm));
  // Pass 3: wanted starts with the dropdown option (handles individual online
  //         courses → the single "Online Academy" umbrella option, or
  //         "Corporate Workshop (1–5 days)" → "Corporate Workshop").
  if (!match) {
    if (norm.startsWith("ai for ") || norm.startsWith("ai tools")) {
      match = options.find(opt => opt.toLowerCase().startsWith("online academy"));
    } else if (norm.startsWith("corporate")) {
      match = options.find(opt => opt.toLowerCase().startsWith("corporate"));
    }
  }
  return match ? { program: match } : {};
}

export default function HubEnroll() {
  return <AssessmentForm cfg={cfg} initialAnswers={preselectFromUrl()} />;
}
