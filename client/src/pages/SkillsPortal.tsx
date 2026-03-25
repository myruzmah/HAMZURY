import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ChevronDown, ChevronRight, ChevronLeft,
  Users, MessageCircle, GraduationCap, Star, Target,
  Lightbulb, BookOpen, Send, X, CheckCircle, RotateCcw, Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS PORTAL — /skills
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#2C1A00";
const GOLD  = "#D4941A";
const BG    = "#FFFEF8";
const CREAM = "#FFF4D4";
const W     = "#FFFFFF";

// ── WHAT YOU GET — accordion cards ───────────────────────────────────────────
const SKILL_CARDS = [
  {
    icon: Users, badge: "DIGITAL MARKETING",
    pain: "I'm spending money on ads — but getting little to no results",
    program: "Digital Marketing", price: "₦45,000", duration: "8 Weeks · Virtual & Physical",
    description: "Most business owners waste ad spend because there's no strategy behind it. This program teaches you how to build an audience, create content that converts, and run profitable campaigns — starting from zero.",
    outcomes: [
      "Social media strategy built for your business and audience",
      "SEO fundamentals — be found on Google without paying for ads",
      "Content creation system (batch, schedule, repeat)",
      "Paid advertising — Meta, Google, and TikTok basics",
      "Live campaigns running before you finish the program",
    ],
  },
  {
    icon: Target, badge: "BUSINESS DEVELOPMENT",
    pain: "I have a great product but I can't grow my client base",
    program: "Business Development", price: "₦35,000", duration: "6 Weeks · Virtual & Physical",
    description: "Most founders plateau because they have no structured sales system — they rely on referrals and hope. This program gives you a repeatable framework for finding, closing, and retaining clients.",
    outcomes: [
      "Market positioning — know exactly who you're selling to and why",
      "Sales pipeline system — from first contact to closed deal",
      "Client acquisition frameworks built for the Nigerian market",
      "Negotiation and objection handling techniques",
      "A 90-day business growth plan ready at graduation",
    ],
  },
  {
    icon: Star, badge: "DATA ANALYSIS",
    pain: "I make decisions by gut feeling — I don't understand my numbers",
    program: "Data Analysis", price: "₦55,000", duration: "10 Weeks · Virtual",
    description: "Businesses that track their numbers grow faster and waste less. This program takes you from raw data to clear, actionable dashboards — no prior experience needed.",
    outcomes: [
      "Excel mastery — formulas, pivot tables, data cleaning",
      "Power BI dashboard design and publishing",
      "Business intelligence — turning data into decisions",
      "Financial analysis and KPI tracking",
      "Real business datasets used throughout — not textbook exercises",
    ],
  },
  {
    icon: BookOpen, badge: "CONTENT CREATION",
    pain: "I want to build an online presence but I'm scared of the camera",
    program: "Faceless Content Intensive", price: "₦25,000", duration: "2 Weeks · Virtual",
    description: "You don't need to show your face to build authority online. This intensive teaches you to create professional, algorithm-friendly content using AI voiceover, scripting, and editing — all off-camera.",
    outcomes: [
      "Content pillars built around your niche and audience",
      "AI voiceover setup and integration",
      "Script writing framework for short-form and long-form",
      "Video editing workflow (mobile and desktop)",
      "30 days of ready-to-publish content created during the program",
    ],
  },
  {
    icon: Lightbulb, badge: "AI FOR BUSINESS",
    pain: "Everyone is using AI — I don't know where to start for my business",
    program: "AI-Powered Business Courses", price: "From ₦25,000", duration: "2–3 Days · Virtual",
    description: "AI is not replacing business owners — but owners who use AI will outpace those who don't. This short intensive gives you practical AI workflows you can implement in your business the same week.",
    outcomes: [
      "AI for lead generation — build prospect lists automatically",
      "AI for content creation — captions, emails, scripts in minutes",
      "AI for business automation — reduce repetitive admin to near zero",
      "ChatGPT / Claude workflows configured for your exact role",
      "Tool stack: free and paid AI tools mapped to your budget",
    ],
  },
  {
    icon: GraduationCap, badge: "INTERNSHIP",
    pain: "I graduated but can't find real work experience anywhere",
    program: "Internship Programme", price: "Free / Stipend-based", duration: "3 Months · Physical & Hybrid",
    description: "Paper qualifications alone no longer get jobs in Nigeria. This programme places you inside HAMZURY's active departments — working on real client projects, with real deadlines and real deliverables.",
    outcomes: [
      "Hands-on work in BizDoc, Systemize, or Skills department",
      "Real client projects you can show in your portfolio",
      "Professional reference letter from HAMZURY leadership",
      "Certificate of completion with specialisation track",
      "Career mentorship session at end of programme",
    ],
  },
];

// ── HOW WE WORK ───────────────────────────────────────────────────────────────
const SKILL_STEPS = [
  { num: "01", title: "Apply", short: "Tell us your goal and program interest", detail: "Use the Get Clarity chat or form. Tell us which program interests you and what you want to achieve. We ask a few qualifying questions — not to gatekeep, but to make sure we're the right fit for your goal." },
  { num: "02", title: "We Confirm Fit", short: "We verify this program matches your stage", detail: "Within 24 hours, one of our team members reviews your application and confirms the program is right for where you are right now. If we think you need something different, we'll tell you honestly." },
  { num: "03", title: "You Enrol", short: "Secure your seat with payment or scholarship", detail: "Payment secures your seat in the cohort. If you have a RIDI or partner scholarship code, it's applied at this stage. Seats are limited per cohort — first paid, first confirmed." },
  { num: "04", title: "You Learn", short: "Live sessions, practicals, real projects", detail: "Every session is live — not pre-recorded. You work on real business scenarios and apply what you learn to your own business or portfolio during the program. Instructors are operators, not just teachers." },
  { num: "05", title: "You Execute", short: "Leave with a skill and a 30-day action plan", detail: "Graduation includes a 30-day execution plan personalised to your business. You leave not just trained — but ready to act the next day. Alumni support continues for 60 days post-graduation." },
];

// ── COURSE BLUEPRINT ──────────────────────────────────────────────────────────
const COURSE_STAGE_TABS = [
  { id: "overview",    num: "01", label: "Overview" },
  { id: "curriculum",  num: "02", label: "Curriculum" },
  { id: "outcomes",    num: "03", label: "Outcomes" },
  { id: "enroll",      num: "04", label: "Enroll" },
];

type CourseItem = { title: string; detail: string };
type CourseStage = { id: string; tagline: string; primary: CourseItem[]; secondary: string[] };
type CourseBlueprint = { id: string; label: string; tagline: string; badge: string; duration: string; price: string; stages: CourseStage[] };

const COURSE_BLUEPRINTS: CourseBlueprint[] = [
  {
    id: "digital-marketing", label: "Digital Marketing", badge: "8 WEEKS",
    tagline: "Build an audience, generate leads, and run profitable campaigns from scratch.",
    duration: "8 Weeks · Virtual & Physical", price: "₦45,000",
    stages: [
      {
        id: "overview", tagline: "For business owners spending money on marketing with little return. No prior digital knowledge required.",
        primary: [
          { title: "Who this program is for", detail: "Business owners, entrepreneurs, and marketing beginners who want to attract clients online without wasting ad budget on guesswork." },
          { title: "Delivery format", detail: "Live sessions every weekend (virtual or physical — Abuja). Sessions recorded for replay within 48 hours. Cohort size: max 25 students." },
          { title: "What makes this different", detail: "Every module ends with a real deliverable applied to YOUR business — not a hypothetical. By week 8, your campaigns are live and generating data." },
        ],
        secondary: ["Certificate of completion", "Alumni community access (lifetime)", "30-day post-graduation support", "Optional physical attendance — Abuja"],
      },
      {
        id: "curriculum", tagline: "8 weeks structured from strategy to execution — everything in the right order.",
        primary: [
          { title: "Weeks 1–2: Strategy & Positioning", detail: "Audience research, competitor analysis, brand voice definition, and marketing goal setting. You leave with a documented strategy before you spend a naira." },
          { title: "Weeks 3–4: Content & Social Media", detail: "Content pillars, platform selection (Instagram, TikTok, LinkedIn), batch creation workflows, scheduling systems, and engagement tactics." },
          { title: "Weeks 5–6: SEO & Visibility", detail: "Google Business Profile, on-page SEO fundamentals, keyword strategy, and directory listings — organic traffic without ad spend." },
          { title: "Weeks 7–8: Paid Advertising", detail: "Meta Ads setup, audience targeting, creative briefs, budget management, and performance analysis. Live campaigns with real budgets." },
        ],
        secondary: ["WhatsApp marketing module", "Email marketing basics", "Analytics and reporting setup", "Canva content creation masterclass"],
      },
      {
        id: "outcomes", tagline: "Leave with a running system — not just knowledge.",
        primary: [
          { title: "A documented marketing strategy", detail: "Written, tested, and personalised to your business. Not a template — a real strategy with a content calendar, targeting parameters, and 90-day plan." },
          { title: "Live social media presence", detail: "Professionally designed profiles, a content bank of 30+ posts, and an active audience that was built during the program." },
          { title: "Running paid ad campaign", detail: "A Meta or Google ad campaign live and generating data by graduation — with your own ad account configured correctly." },
          { title: "Measurement system", detail: "Analytics dashboards tracking the metrics that matter. You'll know your cost-per-lead, content reach, and which channels to double down on." },
        ],
        secondary: ["Certificate of completion", "Instructor feedback on all deliverables", "Alumni WhatsApp group", "60-day post-graduation support"],
      },
      {
        id: "enroll", tagline: "Secure your seat before the cohort fills. Limited to 25 students per intake.",
        primary: [
          { title: "Program fee: ₦45,000", detail: "Full payment secures your seat. Accepted via Moniepoint bank transfer to HAMZURY Skills: Account 8067149356 — use your full name as reference." },
          { title: "RIDI Scholarship", detail: "If you have a RIDI scholarship code, your fee is covered. Enter your code in the application form. Scholarship places are verified within 48 hours." },
          { title: "Installment option", detail: "₦25,000 deposit to secure your seat + ₦20,000 balance before Week 3 begins. Contact us via the Get Clarity chat to arrange." },
        ],
        secondary: ["Application takes 2 minutes", "Confirmation within 24 hours", "Start date: next available cohort", "RIDI codes welcome"],
      },
    ],
  },
  {
    id: "business-dev", label: "Business Development", badge: "6 WEEKS",
    tagline: "Build a repeatable system for finding, closing, and retaining clients.",
    duration: "6 Weeks · Virtual & Physical", price: "₦35,000",
    stages: [
      {
        id: "overview", tagline: "For founders who rely on referrals, have inconsistent revenue, or can't seem to scale their client base.",
        primary: [
          { title: "Who this program is for", detail: "Founders, consultants, and service providers who have a good product but no structured way to find and close new clients consistently." },
          { title: "Delivery format", detail: "Live sessions twice weekly (virtual). Includes role-plays, real client scenarios, and peer accountability groups. Max 20 students per cohort." },
          { title: "What makes this different", detail: "This is not a motivational course. Every week you apply frameworks to real targets in your actual pipeline. By week 6, you have closed at least one new client." },
        ],
        secondary: ["Certificate of completion", "90-day business growth plan", "Alumni network access", "Optional physical session — Abuja"],
      },
      {
        id: "curriculum", tagline: "6 weeks from positioning to a closed deal.",
        primary: [
          { title: "Weeks 1–2: Positioning & Targeting", detail: "Define your ideal client profile, write your positioning statement, identify your three highest-leverage channels, and set a 90-day revenue target." },
          { title: "Weeks 3–4: Outreach & Pipeline", detail: "Cold outreach scripts (WhatsApp, email, LinkedIn), follow-up sequences, CRM setup, and lead tracking. You leave with an active pipeline." },
          { title: "Weeks 5–6: Closing & Retention", detail: "Proposals, objection handling, pricing psychology, and client onboarding systems. Live role-plays with real objections from your industry." },
        ],
        secondary: ["Negotiation masterclass", "Proposal writing workshop", "CRM setup (Notion or HubSpot)", "Sales script library"],
      },
      {
        id: "outcomes", tagline: "Graduate with a system you can run every week without a sales team.",
        primary: [
          { title: "Documented sales pipeline", detail: "A real CRM with your ideal client profiles, outreach templates, and stage progression — built during the program, ready to use day one after graduation." },
          { title: "Active outreach system", detail: "WhatsApp, email, and LinkedIn sequences built and tested on real prospects. You'll have live conversations by week 3." },
          { title: "90-day growth plan", detail: "A specific, sequenced plan with revenue targets, outreach volumes, conversion goals, and a weekly action checklist — created in the final session." },
          { title: "Closed deal", detail: "The final two weeks focus entirely on closing. Most students close at least one new client during the program. If you don't, we review why together." },
        ],
        secondary: ["Sales script templates", "Proposal template library", "CRM template (Notion)", "60-day post-grad support"],
      },
      {
        id: "enroll", tagline: "20 seats per cohort. First paid, first confirmed.",
        primary: [
          { title: "Program fee: ₦35,000", detail: "Full payment via Moniepoint bank transfer: Account 8067149356 — HAMZURY Skills. Use your full name as payment reference." },
          { title: "Installment option", detail: "₦20,000 deposit + ₦15,000 balance before Week 2. Arrange via Get Clarity chat." },
          { title: "RIDI Scholarship", detail: "Scholarship holders — enter your code at application stage. Verified within 48 hours." },
        ],
        secondary: ["Application takes 2 minutes", "Confirmation within 24 hours", "Next cohort: see calendar", "RIDI codes accepted"],
      },
    ],
  },
  {
    id: "data-analysis", label: "Data Analysis", badge: "10 WEEKS",
    tagline: "Go from raw data to clear dashboards and confident business decisions.",
    duration: "10 Weeks · Virtual", price: "₦55,000",
    stages: [
      {
        id: "overview", tagline: "For business owners and professionals who want to stop guessing and start deciding with data.",
        primary: [
          { title: "Who this program is for", detail: "Business owners, accountants, admin professionals, and anyone who works with numbers but has no structured data analysis training. Zero prior experience required." },
          { title: "Delivery format", detail: "Live virtual sessions twice weekly. All exercises use real business datasets. Every tool covered is free or widely available in Nigerian workplaces." },
          { title: "What makes this different", detail: "By week 10 you will have built a complete business intelligence dashboard for a real business — either your own or a case study company with live data." },
        ],
        secondary: ["Excel + Power BI included", "Certificate of completion", "Datasets provided for all exercises", "Alumni community access"],
      },
      {
        id: "curriculum", tagline: "10 weeks from spreadsheet basics to a published Power BI dashboard.",
        primary: [
          { title: "Weeks 1–3: Excel Mastery", detail: "VLOOKUP, SUMIF, pivot tables, data cleaning techniques, conditional formatting, and structured formulas. Starting from the absolute basics." },
          { title: "Weeks 4–6: Business Intelligence", detail: "Power BI setup, data modelling, relationships, DAX basics, and designing your first interactive report. Connecting to Excel and CSV sources." },
          { title: "Weeks 7–8: Financial & KPI Analysis", detail: "P&L analysis, revenue tracking, customer acquisition costs, and building a financial KPI dashboard from scratch." },
          { title: "Weeks 9–10: Final Project", detail: "Build and present a complete business intelligence dashboard for a real dataset. Peer-reviewed by the cohort. Submitted for certificate." },
        ],
        secondary: ["SQL basics module (bonus week)", "Google Sheets integration", "Chart design principles", "Data storytelling for non-technical audiences"],
      },
      {
        id: "outcomes", tagline: "Leave with a skill that earns in three different directions.",
        primary: [
          { title: "Excel mastery certificate", detail: "Intermediate-to-advanced Excel — pivot tables, formulas, dashboards. Verifiable and in demand in every Nigerian industry." },
          { title: "Published Power BI dashboard", detail: "A real, shareable BI dashboard built during the program. Employable portfolio piece or client deliverable from day one after graduation." },
          { title: "Financial analysis capability", detail: "Ability to build P&L reports, track KPIs, analyse costs, and present findings to non-technical stakeholders." },
          { title: "Freelance-ready skill", detail: "Data analysis is one of the highest-paying remote freelance skills in Nigeria. We include a session on how to price and sell your services." },
        ],
        secondary: ["Certificate of completion", "Portfolio project (graded)", "Freelancing starter guide", "Alumni job board access"],
      },
      {
        id: "enroll", tagline: "20 seats. Most cohorts fill 2 weeks before start date.",
        primary: [
          { title: "Program fee: ₦55,000", detail: "Full payment via Moniepoint: Account 8067149356 — HAMZURY Skills. Use your full name as reference." },
          { title: "Installment: ₦30,000 + ₦25,000", detail: "₦30,000 deposit to secure + ₦25,000 before Week 4. Contact us via Get Clarity chat." },
          { title: "Corporate enrollment", detail: "Enrolling 3 or more staff from one company? Corporate rates available. Contact us directly." },
        ],
        secondary: ["Laptop required (any spec)", "All software is free", "Confirmation within 24 hours", "RIDI scholarship accepted"],
      },
    ],
  },
  {
    id: "faceless-content", label: "Faceless Content Intensive", badge: "2 WEEKS",
    tagline: "Build authority and a content system without ever appearing on camera.",
    duration: "2 Weeks · Virtual", price: "₦25,000",
    stages: [
      {
        id: "overview", tagline: "For business owners who know they need content but refuse to show their face on camera.",
        primary: [
          { title: "Who this program is for", detail: "Entrepreneurs, brand owners, coaches, and professionals who want a social media presence but are camera-shy, private, or simply prefer to stay off-screen." },
          { title: "Delivery format", detail: "Intensive live sessions over 2 weeks (virtual). Daily practicals. You create content during every session — no homework required after class." },
          { title: "What makes this different", detail: "You leave with 30 days of ready-to-publish content already created. Not planned — actually created, edited, and scheduled." },
        ],
        secondary: ["No camera needed — ever", "Phone-only setup", "Free tools only", "30 posts created during program"],
      },
      {
        id: "curriculum", tagline: "2 weeks of intensive creation — from blank screen to full content bank.",
        primary: [
          { title: "Days 1–3: Strategy & Pillars", detail: "Identify your 3 content pillars, your target audience persona, and your platform strategy. Script your first 5 posts during class." },
          { title: "Days 4–7: Creation & Tools", detail: "AI voiceover setup (ElevenLabs, CapCut), script writing templates, B-roll sourcing strategy, and video editing on your phone." },
          { title: "Days 8–10: System & Batch", detail: "Batch creation workflow — create 30 posts in a single session. Scheduling setup (Buffer or Meta Suite). Engagement strategy for faceless accounts." },
        ],
        secondary: ["Canva templates included", "AI voiceover tools setup", "Batch creation session (Day 9)", "Platform algorithm briefings"],
      },
      {
        id: "outcomes", tagline: "Leave with a running content engine — not just theory.",
        primary: [
          { title: "30 days of ready-to-publish content", detail: "Created, edited, captioned, and scheduled during the program. Go live the day after graduation." },
          { title: "Faceless content system", detail: "A repeatable workflow you can run in 3 hours per week to produce 12+ posts per month indefinitely." },
          { title: "AI tool stack configured", detail: "Your voiceover, scripting, and editing tools set up, tested, and integrated into your workflow." },
        ],
        secondary: ["Content calendar template", "Caption swipe file (50 captions)", "Algorithm guide per platform", "Alumni group access"],
      },
      {
        id: "enroll", tagline: "15 seats only. Intensives fill fast.",
        primary: [
          { title: "Program fee: ₦25,000", detail: "Full payment via Moniepoint: Account 8067149356 — HAMZURY Skills." },
          { title: "No installment on this program", detail: "Due to the 2-week format, full payment is required to secure your seat. No exceptions." },
          { title: "Phone is enough", detail: "You do not need a laptop. Everything in this program runs on a smartphone." },
        ],
        secondary: ["Smartphone required", "No laptop needed", "Seats: 15 max", "RIDI scholarship accepted"],
      },
    ],
  },
  {
    id: "ai-business", label: "AI-Powered Business Courses", badge: "2–3 DAYS",
    tagline: "Practical AI workflows you can implement in your business this week.",
    duration: "2–3 Days · Virtual", price: "From ₦25,000",
    stages: [
      {
        id: "overview", tagline: "For business owners who want to use AI but don't know where to start — no tech background required.",
        primary: [
          { title: "Three courses in one", detail: "Three focused courses: AI for Lead Generation, AI for Content Creation, and AI for Business Automation. Take one or all three. Enroll in sequence or together." },
          { title: "Delivery format", detail: "Intensive 2–3 day virtual sprints. Morning session (strategy), afternoon session (implementation). By end of day one you have something running." },
          { title: "What makes this different", detail: "Every workflow is tested, working, and free or near-free to run. We use tools available to any Nigerian business with a phone and internet connection." },
        ],
        secondary: ["No coding required", "Works on phone or laptop", "Free tools used throughout", "Certificate per course"],
      },
      {
        id: "curriculum", tagline: "Three standalone intensives — one for each AI use case.",
        primary: [
          { title: "Course 1: AI for Lead Generation (1 day)", detail: "Build a prospect list of 100+ ideal clients using AI tools. Automate outreach messages via WhatsApp and email. Set up a lead pipeline that runs without you." },
          { title: "Course 2: AI for Content Creation (1 day)", detail: "Generate captions, emails, scripts, and blog posts in minutes. Set up your custom AI content workflow. Produce a week of content in under 2 hours." },
          { title: "Course 3: AI for Business Automation (1 day)", detail: "Automate invoicing, follow-ups, client onboarding, and reporting. Connect your tools (WhatsApp, email, CRM) into automatic sequences." },
        ],
        secondary: ["ChatGPT + Claude prompts included", "Make.com / Zapier walkthrough", "WhatsApp automation setup", "Tool stack for every budget"],
      },
      {
        id: "outcomes", tagline: "Walk away with a running AI workflow — not just ideas.",
        primary: [
          { title: "Live AI lead generation system", detail: "A running pipeline generating qualified leads daily — without cold calling or manual searching." },
          { title: "AI content workflow", detail: "A configured content system producing high-quality posts, emails, and scripts in a fraction of normal time." },
          { title: "Automated business process", detail: "At least one complete automation running in your business — invoices, follow-ups, or onboarding — before you leave the course." },
        ],
        secondary: ["Prompt library (50+ prompts)", "Tool comparison guide", "Automation templates", "90-day follow-up check-in"],
      },
      {
        id: "enroll", tagline: "Cohorts run monthly. Take one course or all three.",
        primary: [
          { title: "Per course: From ₦25,000", detail: "Each course is priced individually. Bundle all 3 for ₦65,000 (save ₦10,000). Payment via Moniepoint: Account 8067149356 — HAMZURY Skills." },
          { title: "Bundle: ₦65,000 for all 3", detail: "Enroll in all three AI courses at once and save ₦10,000. Best option if you want to fully integrate AI across your operations." },
        ],
        secondary: ["Laptop or phone works", "Internet required", "Recorded replays for 7 days", "RIDI scholarship accepted"],
      },
    ],
  },
  {
    id: "internship", label: "Internship Programme", badge: "3 MONTHS",
    tagline: "Real projects. Real departments. A portfolio that proves what you can do.",
    duration: "3 Months · Physical & Hybrid", price: "Free / Stipend-based",
    stages: [
      {
        id: "overview", tagline: "For recent graduates and undergraduates who need real work experience to launch their career.",
        primary: [
          { title: "Who this program is for", detail: "Fresh graduates (any field), final-year students, and career-changers who want professional experience in a real business environment — not a fake internship." },
          { title: "Delivery format", detail: "Physical placement at HAMZURY Abuja headquarters. Hybrid option available for select roles. 3-month placement with weekly reviews and monthly performance assessment." },
          { title: "What makes this different", detail: "You work on real client projects under supervision. Real deadlines, real deliverables, real feedback. Your work appears in actual client outcomes — not training simulations." },
        ],
        secondary: ["Physical placement — Abuja", "Stipend-based roles available", "Reference letter guaranteed", "Open to any field of study"],
      },
      {
        id: "curriculum", tagline: "3 months of structured placement across HAMZURY's active departments.",
        primary: [
          { title: "Month 1: Orientation & Foundations", detail: "Department induction, tool setup, shadow senior team members, attend client calls, and complete your first solo deliverable by end of week 4." },
          { title: "Month 2: Active Contribution", detail: "Assigned to live client projects. You own deliverables end-to-end — research, execution, and submission. Weekly review with your department lead." },
          { title: "Month 3: Lead & Deliver", detail: "Take ownership of a complete project scope from brief to delivery. Present your work to leadership. Final assessment and reference letter issued." },
        ],
        secondary: ["Available departments: BizDoc, Systemize, Skills, Media", "Weekly 1-on-1 with supervisor", "Monthly performance review", "Access to all internal training materials"],
      },
      {
        id: "outcomes", tagline: "Leave with a portfolio, a reference, and a network.",
        primary: [
          { title: "Professional reference letter", detail: "Written and signed by your department lead at HAMZURY. Specific, credible, and usable for any employer or postgraduate application." },
          { title: "Certificate of completion", detail: "Issued with your department specialisation track (e.g. 'BizDoc Compliance Operations' or 'Systemize Brand & Digital')." },
          { title: "Portfolio of real work", detail: "3 to 5 real deliverables completed for actual clients — with permission to include in your portfolio. This is what separates HAMZURY interns in the job market." },
          { title: "Career mentorship session", detail: "One 45-minute career strategy session with HAMZURY leadership in your final week. CV review, LinkedIn audit, and job-search guidance." },
        ],
        secondary: ["HAMZURY alumni network access", "First consideration for paid roles", "LinkedIn recommendation", "60-day post-placement support"],
      },
      {
        id: "enroll", tagline: "Applications open quarterly. Only 8 placements per intake.",
        primary: [
          { title: "Application process", detail: "Apply via the Get Clarity chat. Tell us your field of study, which department interests you, and what you want to achieve in 3 months. Applications reviewed within 5 working days." },
          { title: "Free placement", detail: "Standard internship placement is unpaid but provides all training, resources, tools, and the full reference package." },
          { title: "Stipend-based roles", detail: "A small number of placements carry a monthly stipend (₦15,000–₦30,000) for high-performing candidates in live revenue-generating roles. Announced at intake." },
        ],
        secondary: ["8 placements per quarter", "Application takes 5 minutes", "Decision within 5 working days", "Physical attendance required — Abuja"],
      },
    ],
  },
  {
    id: "ridi", label: "RIDI Scholarship Programme", badge: "SCHOLARSHIP",
    tagline: "Fully-funded skills training for talented young Nigerians with financial barriers.",
    duration: "Variable · per program", price: "Fully Funded",
    stages: [
      {
        id: "overview", tagline: "RIDI (Reach, Invest, Develop, Impact) funds seats in HAMZURY Skills programs for qualifying candidates.",
        primary: [
          { title: "What RIDI is", detail: "RIDI is HAMZURY's scholarship arm — funding Skills program seats for young Nigerians who demonstrate talent and ambition but face genuine financial barriers to enrolment." },
          { title: "Who qualifies", detail: "Applicants aged 18–30 who are currently employed in low-income roles, self-employed with limited revenue, or unemployed graduates demonstrating clear intent and a specific skill goal." },
          { title: "What's covered", detail: "Full tuition for any one HAMZURY Skills program. No partial funding — RIDI covers the complete program fee. Non-transferable, non-deferrable." },
        ],
        secondary: ["28 RIDI communities active", "Quarterly intake", "Any program eligible", "Community nominations accepted"],
      },
      {
        id: "curriculum", tagline: "RIDI scholars enroll in the same cohorts as full-fee students — no separate tracks.",
        primary: [
          { title: "Same program, same cohort", detail: "RIDI scholars attend the exact same live sessions, access the same materials, and submit the same deliverables as full-fee students. No separation." },
          { title: "Accountability check-in", detail: "RIDI scholars receive an additional monthly 15-minute check-in with the program coordinator — to support completion and flag challenges early." },
          { title: "Community mentor", detail: "Each RIDI scholar is connected with a HAMZURY alumni mentor from a similar background for the duration of the program and 3 months post-graduation." },
        ],
        secondary: ["Cohort placement guaranteed on approval", "Mentor matching within 5 days of enrolment", "Community accountability group", "Alumni network access on graduation"],
      },
      {
        id: "outcomes", tagline: "RIDI's target: 100% completion rate and immediate income impact.",
        primary: [
          { title: "Full certificate on completion", detail: "RIDI scholars receive the same certificate as full-fee graduates — including department specialisation and HAMZURY verification." },
          { title: "Income milestone tracking", detail: "RIDI tracks scholar income 3, 6, and 12 months post-graduation. This data funds the next intake cycle — your success directly enables the next scholar." },
          { title: "Community impact path", detail: "Top RIDI graduates are invited to join the RIDI Ambassador Programme — teaching peers in their community and earning a stipend in the process." },
        ],
        secondary: ["Certificate (same as full-fee)", "3-month income tracking", "Ambassador opportunity", "Nomination chain (each graduate nominates the next)"],
      },
      {
        id: "enroll", tagline: "Apply for RIDI via the Get Clarity chat. Community nominations also accepted.",
        primary: [
          { title: "Individual application", detail: "Apply via the Get Clarity button on this page. Tell us your situation, your specific skill goal, and which program you'd like to join. Applications assessed within 7 days." },
          { title: "Community nomination", detail: "RIDI community coordinators can nominate candidates directly using a unique community code. If you are a coordinator, contact us to register your community." },
          { title: "Quarterly intake cycle", detail: "RIDI applications are reviewed quarterly (January, April, July, October). Apply anytime — you'll be considered at the next intake cycle." },
        ],
        secondary: ["No income proof required", "Decision within 7 days", "Quarterly intakes", "28 active communities"],
      },
    ],
  },
];

// ── SKILLS DESK — Pure AI-driven conversational intake ────────────────────
const SD = "#2C1A00";
const SG = "#D4941A";
const SB = "#FFFEF8";

interface SkillsMsg { id: string; role: "bot" | "user"; text: string }
type SPhase = "chat" | "contact" | "payment";

function SkillsDesk({ open, onClose, preselectedProgram }: { open: boolean; onClose: () => void; preselectedProgram?: string }) {
  const skillsChat = trpc.skills.chat.useMutation();
  const [messages, setMessages]         = useState<SkillsMsg[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [phase, setPhase]               = useState<SPhase>("chat");
  const [showReadyBtn, setShowReadyBtn] = useState(false);
  const [contactName, setContactName]   = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentDone, setPaymentDone]   = useState(false);
  const [initialized, setInitialized]   = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uid = () => `${Date.now()}-${Math.random()}`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, phase, showReadyBtn]);

  useEffect(() => {
    if (open && !initialized) {
      const greeting = preselectedProgram
        ? `Hi 👋 I'm Zara, your Skills advisor. I can see you're looking at the ${preselectedProgram} program — what's your name?`
        : "Hi 👋 I'm Zara, your Skills advisor. Before anything — what's your name?";
      setMessages([{ id: uid(), role: "bot", text: greeting }]);
      setInitialized(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, initialized, preselectedProgram]);

  useEffect(() => {
    if (!open) {
      setInitialized(false); setMessages([]); setInput(""); setPhase("chat");
      setShowReadyBtn(false); setPaymentDone(false); setContactName(""); setContactPhone("");
    }
  }, [open]);

  const addBot = useCallback((text: string) => {
    setMessages(p => [...p, { id: uid(), role: "bot", text }]);
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput(""); setShowReadyBtn(false);
    setMessages(p => [...p, { id: uid(), role: "user", text }]);
    setLoading(true);
    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" as const : "user" as const, text: m.text }));
    try {
      const res = await skillsChat.mutateAsync({ message: text, history });
      let reply = res.reply;
      const hasReady = reply.includes("[READY]");
      const hasPayment = reply.includes("[SHOW_PAYMENT]");
      reply = reply.replace(/\[READY\]/g, "").replace(/\[SHOW_PAYMENT\]/g, "").trim();
      setLoading(false);
      if (reply) addBot(reply);
      if (hasPayment) setPhase("payment");
      else if (hasReady) setShowReadyBtn(true);
    } catch {
      setLoading(false);
      addBot("I'm having a moment — please try again.");
    }
  }, [messages, loading, skillsChat, addBot]);

  const submitContact = useCallback(async () => {
    if (!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7) return;
    setPhase("chat"); setLoading(true);
    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" as const : "user" as const, text: m.text }));
    try {
      const res = await skillsChat.mutateAsync({
        message: `[System: Contact collected — Name: ${contactName}, Phone: ${contactPhone}. Please confirm warmly and proceed to payment.]`,
        history,
      });
      let reply = res.reply.replace(/\[READY\]/g, "").replace(/\[SHOW_PAYMENT\]/g, "").trim();
      setLoading(false);
      if (reply) addBot(reply);
      setTimeout(() => setPhase("payment"), 400);
    } catch { setLoading(false); setPhase("payment"); }
  }, [contactName, contactPhone, messages, skillsChat, addBot]);

  const restart = useCallback(() => {
    setMessages([]); setPhase("chat"); setShowReadyBtn(false);
    setPaymentDone(false); setContactName(""); setContactPhone(""); setInitialized(false);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(44,26,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md h-[90vh] sm:rounded-2xl overflow-hidden flex flex-col rounded-t-2xl shadow-2xl"
        style={{ backgroundColor: SB }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ backgroundColor: SD }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ backgroundColor: SG, color: SD }}>Z</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white">HAMZURY SKILLS</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>Zara · Skills Advisor</p>
            </div>
          </div>
          <button onClick={restart} className="p-1.5 text-white/40 hover:text-white/80 transition-colors" title="Restart"><RotateCcw size={15} /></button>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white/80 transition-colors"><X size={18} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === "user"
                  ? { backgroundColor: SD, color: SG, borderBottomRightRadius: 4 }
                  : { backgroundColor: W, color: "#2C2C2C", borderBottomLeftRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={{ backgroundColor: W, borderBottomLeftRadius: 4 }}>
                {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: SD, opacity: 0.4, animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}

          {showReadyBtn && !loading && (
            <div className="flex justify-center pt-1">
              <button onClick={() => { setShowReadyBtn(false); setPhase("contact"); }}
                className="px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                style={{ backgroundColor: SD, color: SG }}>
                Enrol Now →
              </button>
            </div>
          )}

          {phase === "contact" && (
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: W, borderColor: `${SD}20` }}>
              <p className="text-sm font-semibold mb-0.5" style={{ color: SD }}>A few quick details</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>To confirm your seat in the next cohort.</p>
              <input placeholder="Full name" value={contactName} onChange={e => setContactName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-2 outline-none border"
                style={{ borderColor: `${SD}25`, backgroundColor: SB, color: "#2C2C2C" }} />
              <input placeholder="WhatsApp number" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitContact()}
                className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 outline-none border"
                style={{ borderColor: `${SD}25`, backgroundColor: SB, color: "#2C2C2C" }} />
              <button onClick={submitContact}
                disabled={!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7}
                className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40"
                style={{ backgroundColor: SD, color: SG }}>
                Continue →
              </button>
            </div>
          )}

          {phase === "payment" && (
            <div className="rounded-2xl p-4 border-l-4" style={{ backgroundColor: W, borderLeftColor: SG }}>
              <p className="text-sm font-bold mb-0.5" style={{ color: SD }}>Make Payment</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>Transfer your program fee to secure your seat in the next cohort.</p>
              <div className="rounded-xl p-3 mb-3 space-y-1.5 text-[13px]" style={{ backgroundColor: SB }}>
                <div><span style={{ color: "#9CA3AF" }}>Bank</span> · <strong style={{ color: "#1A1A1A" }}>Moniepoint</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Account</span> · <strong className="tracking-widest text-[15px]" style={{ color: "#1A1A1A" }}>8067149356</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Name</span> · <strong style={{ color: "#1A1A1A" }}>HAMZURY SKILLS</strong></div>
                <div><span style={{ color: "#9CA3AF" }}>Reference</span> · <strong style={{ color: "#1A1A1A" }}>Your full name</strong></div>
              </div>
              {!paymentDone ? (
                <button onClick={() => setPaymentDone(true)}
                  className="w-full py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: SD, color: SG }}>
                  I've Made the Payment →
                </button>
              ) : (
                <div className="rounded-xl p-3 text-xs space-y-2" style={{ backgroundColor: "#FFF9E6", border: `1px solid ${SG}40` }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: SG }} />
                    <strong style={{ color: SD }}>Confirming your payment…</strong>
                  </div>
                  <p style={{ color: "#374151" }}>We'll verify your transfer and confirm your seat within 2 hours during business hours (Mon–Sat, 8am–6pm).</p>
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        {phase === "chat" && (
          <div className="px-3 py-3 shrink-0 border-t" style={{ borderColor: `${SD}12`, backgroundColor: W }}>
            <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ backgroundColor: SB, border: `1.5px solid ${SD}18` }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Tell me about your goal…"
                className="flex-1 text-sm outline-none bg-transparent" style={{ color: "#2C2C2C" }} />
              <button onClick={() => send(input)} disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{ backgroundColor: SD }}>
                {loading ? <Loader2 size={14} style={{ color: SG }} className="animate-spin" /> : <Send size={13} style={{ color: SG }} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SkillsPortal() {
  const [scrolled, setScrolled] = useState(false);
  const [skillsChatOpen, setSkillsChatOpen] = useState(false);
  const [chatProgram, setChatProgram] = useState<string | undefined>(undefined);

  // What You Get
  const [openCard, setOpenCard] = useState<string | null>(null);

  // How We Work
  const [activeStep, setActiveStep] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);

  // Course Blueprint
  const blueprintRef = useRef<HTMLElement>(null);
  const [bizPage, setBizPage] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState(0);
  const BIZ_PER_PAGE = 6;
  const bizPageCount = Math.ceil(COURSE_BLUEPRINTS.length / BIZ_PER_PAGE);
  const pagedBiz = COURSE_BLUEPRINTS.slice(bizPage * BIZ_PER_PAGE, (bizPage + 1) * BIZ_PER_PAGE);
  const selectedBp = COURSE_BLUEPRINTS.find(b => b.id === selectedCourse);
  const activeTabDef = COURSE_STAGE_TABS[activeCourseTab];
  const activeStage = selectedBp?.stages.find(s => s.id === activeTabDef?.id) ?? null;

  // My Update
  const [trackRef, setTrackRef] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.skills.trackApplication.useQuery(
    { ref: trackRef },
    { enabled: false, retry: false }
  );
  function handleTrack() {
    if (trackRef.trim().length < 4) return;
    setTrackSubmitted(true);
    trackQuery.refetch();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openChat(program?: string) {
    setChatProgram(program);
    setSkillsChatOpen(true);
  }

  const STATUS_LABELS: Record<string, string> = {
    submitted: "Application received",
    under_review: "Under review",
    accepted: "Accepted — check your email",
    waitlisted: "Waitlisted — we'll notify you",
    rejected: "Not accepted this cycle",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: DARK }}>
      <PageMeta
        title="Hamzury Skills — Business Education & Professional Development"
        description="Cohort-based business education for ambitious professionals. Digital marketing, business development, data analysis, and AI programs. Abuja."
      />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${GOLD}18` : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}>
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <span className="font-semibold tracking-[2px] text-sm" style={{ color: DARK }}>HAMZURY SKILLS</span>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => blueprintRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="text-xs font-medium uppercase tracking-[1px] transition-opacity hover:opacity-60"
              style={{ color: `${DARK}70` }}>
              Course Blueprint
            </button>
            <Link href="/skills/student">
              <span className="text-xs font-medium uppercase tracking-[1px] transition-opacity hover:opacity-60" style={{ color: `${DARK}70` }}>My Portal</span>
            </Link>
            <button onClick={() => openChat()}
              className="px-5 py-2.5 rounded-2xl text-[12px] font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: DARK, color: GOLD }}>
              Get Clarity
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-[8%] max-w-[1200px] mx-auto pt-16">
        <span className="text-xs tracking-[3px] font-normal mb-6 uppercase" style={{ color: GOLD }}>Business Education · Abuja</span>
        <h1 className="text-[clamp(40px,7vw,72px)] leading-[1.05] font-normal tracking-tight mb-6" style={{ color: DARK }}>
          Skills that build<br />real businesses.
        </h1>
        <p className="text-[clamp(16px,2vw,20px)] leading-relaxed font-light max-w-[560px] mb-12" style={{ color: `${DARK}80` }}>
          Practical programs taught by operators. Learn what works in the real market, then go execute it.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => openChat()}
            className="px-10 py-5 rounded-lg text-sm font-medium uppercase tracking-[1px] shadow-lg flex items-center gap-3 hover:-translate-y-1 transition-all"
            style={{ backgroundColor: DARK, color: BG, boxShadow: `0 8px 32px ${DARK}25` }}>
            Get Clarity <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={() => blueprintRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="px-7 py-4 rounded-lg text-sm font-medium border transition-opacity hover:opacity-80"
            style={{ borderColor: `${DARK}30`, color: DARK }}>
            Course Blueprint <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 px-6 border-t border-b" style={{ borderColor: `${DARK}08`, backgroundColor: W }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: "1,200+", label: "Students Trained" },
            { stat: "85+",    label: "Businesses Launched" },
            { stat: "6",      label: "Active Programs" },
            { stat: "4.8/5",  label: "Student Rating" },
          ].map(item => (
            <div key={item.label}>
              <p className="text-2xl font-light mb-1" style={{ color: DARK }}>{item.stat}</p>
              <p className="text-xs tracking-wide uppercase opacity-50" style={{ color: DARK }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>WHAT YOU GET</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-3" style={{ color: DARK }}>Six programs. One outcome each.</h2>
          <p className="text-[15px] opacity-50 mb-12" style={{ color: DARK }}>Every program is built for execution — not theory. Pick the gap you want to close.</p>

          <div className="flex flex-col gap-3">
            {SKILL_CARDS.map((card) => {
              const isOpen = openCard === card.program;
              const Icon = card.icon;
              return (
                <div key={card.program} className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ backgroundColor: isOpen ? DARK : W, border: `1.5px solid ${isOpen ? DARK : GOLD + "30"}`, boxShadow: isOpen ? `0 8px 32px ${DARK}18` : "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <button onClick={() => setOpenCard(isOpen ? null : card.program)} className="w-full text-left px-6 py-5 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" style={{ color: isOpen ? GOLD : DARK }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: isOpen ? `${GOLD}25` : `${DARK}08`, color: isOpen ? GOLD : `${DARK}60` }}>
                          {card.badge}
                        </span>
                        <span className="text-[10px] font-semibold" style={{ color: isOpen ? `${GOLD}90` : `${DARK}40` }}>{card.price}</span>
                      </div>
                      <p className="text-[15px] font-semibold leading-snug pr-4" style={{ color: isOpen ? W : DARK }}>{card.pain}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: isOpen ? GOLD : `${DARK}40` }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "560px" : "0px" }}>
                    <div className="px-6 pb-6">
                      <div className="pl-9">
                        <p className="text-[13px] font-semibold mb-1" style={{ color: GOLD }}>{card.program} — {card.duration}</p>
                        <p className="text-[13px] leading-relaxed mb-4 opacity-70" style={{ color: W }}>{card.description}</p>
                        <ul className="space-y-1.5 mb-5">
                          {card.outcomes.map((o, i) => (
                            <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                              {o}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => openChat(card.program)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5"
                          style={{ backgroundColor: GOLD, color: W }}>
                          Get Clarity <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>HOW WE WORK</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-12" style={{ color: DARK }}>From application to execution.</h2>

          <div className="hidden md:block">
            <div className="flex gap-0 rounded-2xl overflow-hidden border mb-8" style={{ borderColor: `${DARK}10` }}>
              {SKILL_STEPS.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className="flex-1 py-4 px-3 text-center transition-all duration-200"
                  style={{ backgroundColor: activeStep === i ? DARK : "transparent", borderRight: i < SKILL_STEPS.length - 1 ? `1px solid ${DARK}10` : "none" }}>
                  <div className="text-[10px] font-bold tracking-[0.2em] mb-1" style={{ color: activeStep === i ? GOLD : `${DARK}40` }}>{s.num}</div>
                  <div className="text-[13px] font-semibold" style={{ color: activeStep === i ? W : DARK }}>{s.title}</div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl p-8" style={{ backgroundColor: `${DARK}06` }}>
              <p className="text-[13px] font-semibold mb-2" style={{ color: GOLD }}>{SKILL_STEPS[activeStep].short}</p>
              <p className="text-[15px] leading-relaxed" style={{ color: DARK }}>{SKILL_STEPS[activeStep].detail}</p>
            </div>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {SKILL_STEPS.map((s, i) => {
              const isOpen = openStep === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden border transition-all"
                  style={{ borderColor: isOpen ? DARK : `${DARK}12`, backgroundColor: isOpen ? DARK : W }}>
                  <button onClick={() => setOpenStep(isOpen ? null : i)} className="w-full text-left px-5 py-4 flex items-center gap-4">
                    <span className="text-[11px] font-bold tracking-wider w-6" style={{ color: isOpen ? GOLD : `${DARK}40` }}>{s.num}</span>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold" style={{ color: isOpen ? W : DARK }}>{s.title}</p>
                      <p className="text-[11px] opacity-60 mt-0.5" style={{ color: isOpen ? W : DARK }}>{s.short}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? GOLD : `${DARK}40` }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "300px" : "0px" }}>
                    <p className="px-5 pb-5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COURSE BLUEPRINT ── */}
      <section ref={blueprintRef} id="blueprint" className="py-20 md:py-28" style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>COURSE BLUEPRINT</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-3" style={{ color: DARK }}>Inside every program.</h2>
          <p className="text-[15px] opacity-60 mb-12" style={{ color: DARK }}>Pick a program below to explore the full curriculum, outcomes, and enrollment details.</p>

          {!selectedCourse && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {pagedBiz.map((bp) => (
                  <button key={bp.id}
                    onClick={() => { setSelectedCourse(bp.id); setActiveCourseTab(0); }}
                    className="rounded-2xl p-4 text-left transition-all duration-200 border hover:border-[#1A1A1A] hover:shadow-md"
                    style={{ backgroundColor: W, borderColor: `${DARK}12` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}18`, color: GOLD }}>{bp.badge}</span>
                    </div>
                    <p className="text-[14px] font-bold mb-1" style={{ color: DARK }}>{bp.label}</p>
                    <p className="text-[11px] leading-tight opacity-55" style={{ color: DARK }}>{bp.price} · {bp.duration.split("·")[0].trim()}</p>
                  </button>
                ))}
              </div>
              {bizPageCount > 1 && (
                <div className="flex items-center justify-end gap-2 mb-8">
                  <button onClick={() => setBizPage(p => Math.max(0, p - 1))} disabled={bizPage === 0}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${DARK}20` }}>
                    <ChevronLeft size={16} style={{ color: DARK }} />
                  </button>
                  <span className="text-[12px] opacity-50" style={{ color: DARK }}>{bizPage + 1} / {bizPageCount}</span>
                  <button onClick={() => setBizPage(p => Math.min(bizPageCount - 1, p + 1))} disabled={bizPage === bizPageCount - 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${DARK}20` }}>
                    <ChevronRight size={16} style={{ color: DARK }} />
                  </button>
                </div>
              )}
            </>
          )}

          {selectedCourse && selectedBp && (
            <div className="rounded-3xl overflow-hidden border" style={{ borderColor: `${DARK}20` }}>
              {/* Header */}
              <div className="px-8 py-7" style={{ backgroundColor: DARK }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}25`, color: GOLD }}>{selectedBp.badge}</span>
                    </div>
                    <h3 className="text-[clamp(22px,3vw,30px)] font-bold mb-1" style={{ color: W }}>{selectedBp.label}</h3>
                    <p className="text-[13px] opacity-60" style={{ color: W }}>{selectedBp.tagline}</p>
                  </div>
                  <button onClick={() => setSelectedCourse(null)}
                    className="shrink-0 text-[12px] font-medium px-4 py-2 rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)", color: W }}>
                    Close
                  </button>
                </div>
                <div className="flex gap-1 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                  {COURSE_STAGE_TABS.map((tab, i) => {
                    const active = activeCourseTab === i;
                    return (
                      <button key={tab.id} onClick={() => setActiveCourseTab(i)}
                        className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                        style={{ backgroundColor: active ? GOLD : "rgba(255,255,255,0.1)", color: active ? DARK : "rgba(255,255,255,0.6)" }}>
                        <span className="opacity-50 mr-1">{tab.num}</span>{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeStage && (
                <div className="px-7 py-8" style={{ backgroundColor: W }}>
                  <p className="text-[13px] leading-relaxed max-w-xl mb-6 opacity-60" style={{ color: DARK }}>{activeStage.tagline}</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: GOLD }}>
                        <span className="w-3 h-px inline-block" style={{ backgroundColor: GOLD }} />
                        Details
                      </p>
                      <div className="flex flex-col gap-3">
                        {activeStage.primary.map((item) => (
                          <div key={item.title} className="rounded-xl p-4" style={{ backgroundColor: CREAM }}>
                            <p className="text-[13px] font-semibold mb-1" style={{ color: DARK }}>{item.title}</p>
                            <p className="text-[12px] leading-relaxed" style={{ color: DARK, opacity: 0.6 }}>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: `${DARK}50` }}>Also includes</p>
                        <ul className="flex flex-col gap-2">
                          {activeStage.secondary.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-[12px]" style={{ color: DARK, opacity: 0.7 }}>
                              <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: GOLD }} />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button onClick={() => openChat(selectedBp.label)}
                        className="mt-2 w-full py-3 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: DARK, color: GOLD }}>
                        Apply for this program →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── ALUMNI VOICES ── */}
      <section className="py-20 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: GOLD }}>Alumni Voices</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Before Hamzury Skills, I was spending ₦80k/month on ads with no strategy. Now I manage my own campaigns profitably.", name: "Zainab Yusuf", program: "Digital Marketing — Cohort 4", outcome: "3× ROI in 60 days" },
              { quote: "I started my consulting business within 2 months of graduating. The business development course gave me the exact framework.", name: "Emmanuel Okonkwo", program: "Business Development — Cohort 3", outcome: "Business launched" },
              { quote: "I went from Excel beginner to building dashboards for 3 corporate clients. The data analysis cohort changed my career.", name: "Halima Abubakar", program: "Data Analysis — Cohort 5", outcome: "3 new clients" },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: W, border: `1px solid ${GOLD}25` }}>
                <span className="text-2xl font-serif" style={{ color: GOLD }}>"</span>
                <p className="text-sm leading-relaxed flex-1" style={{ color: DARK, opacity: 0.8 }}>{t.quote}</p>
                <div className="pt-3" style={{ borderTop: `1px solid ${GOLD}20` }}>
                  <p className="text-xs font-semibold" style={{ color: DARK }}>{t.name}</p>
                  <p className="text-xs" style={{ color: GOLD }}>{t.program}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>✓ {t.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MY UPDATE ── */}
      <section id="my-update" className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-xl mx-auto px-5 text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>MY UPDATE</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-normal tracking-tight mb-3" style={{ color: DARK }}>Already applied? Check your status.</h2>
          <p className="text-[14px] opacity-60 mb-8" style={{ color: DARK }}>Enter your application reference (SKL-XXXXXX) to see your status.</p>

          <div className="flex gap-2 mb-4">
            <input type="text" value={trackRef} onChange={e => { setTrackRef(e.target.value.toUpperCase()); setTrackSubmitted(false); }}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="SKL-XXXXXX"
              className="flex-1 rounded-2xl px-4 py-3.5 text-[14px] outline-none border font-mono"
              style={{ borderColor: `${DARK}12`, backgroundColor: CREAM, color: DARK }} />
            <button onClick={handleTrack} disabled={trackQuery.isFetching}
              className="px-6 py-3.5 rounded-2xl text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
              style={{ backgroundColor: DARK, color: GOLD }}>
              {trackQuery.isFetching ? "…" : "Access"}
            </button>
          </div>

          <p className="text-[11px] opacity-40 mb-6 font-mono" style={{ color: DARK }}>Format: SKL-XXXXXX</p>

          {trackSubmitted && !trackQuery.isFetching && trackQuery.data && (
            <>
              {trackQuery.data.found ? (
                <div className="rounded-2xl p-5 text-left" style={{ backgroundColor: CREAM, border: `1px solid ${DARK}12` }}>
                  <p className="text-[11px] font-bold tracking-wider uppercase mb-1" style={{ color: GOLD }}>{trackQuery.data.ref}</p>
                  <p className="text-[17px] font-bold mb-0.5" style={{ color: DARK }}>{trackQuery.data.program}</p>
                  <p className="text-[13px] opacity-60 mb-3" style={{ color: DARK }}>
                    Payment: <span className="font-semibold" style={{ color: trackQuery.data.paymentStatus === "paid" ? "#16A34A" : DARK }}>{trackQuery.data.paymentStatus === "paid" ? "Confirmed" : "Pending"}</span>
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ backgroundColor: trackQuery.data.status === "accepted" ? "#DCFCE7" : `${GOLD}18`, color: trackQuery.data.status === "accepted" ? "#16A34A" : DARK }}>
                    {STATUS_LABELS[trackQuery.data.status] ?? trackQuery.data.status}
                  </div>
                  {trackQuery.data.status === "accepted" && (
                    <Link href="/skills/student">
                      <button className="mt-4 w-full py-3 rounded-xl text-[13px] font-semibold" style={{ backgroundColor: DARK, color: GOLD }}>
                        Open My Student Portal →
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-[13px] opacity-60" style={{ color: DARK }}>No application found for that reference. Contact us via Get Clarity.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: DARK }}>
        <div className="max-w-[800px] mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>THE HAMZURY SKILLS STANDARD</p>
          <h2 className="text-[clamp(24px,4vw,36px)] font-normal tracking-tight mb-6" style={{ color: W }}>
            We don't run generic courses.<br />We build real capability.
          </h2>
          <p className="text-[clamp(15px,2vw,17px)] leading-[1.7] font-light mb-10 opacity-70" style={{ color: W }}>
            Every program is built around what operators in Nigeria actually need to execute — and taught by people who have done it, not just studied it.
          </p>
          <button onClick={() => openChat()}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all hover:-translate-y-1"
            style={{ backgroundColor: GOLD, color: DARK }}>
            Get Clarity — Free Intake <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: DARK, color: `${BG}bb` }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-normal tracking-widest text-sm uppercase" style={{ color: BG }}>Hamzury Skills</span>
          <div className="flex items-center gap-6 text-xs" style={{ color: `${BG}55` }}>
            <span>© 2026 Hamzury Skills</span>
            <span>Abuja, FCT</span>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 inset-x-0 md:hidden z-50 border-t"
        style={{ backgroundColor: W, borderColor: `${DARK}12`, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          <button onClick={() => window.location.href = "/"}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: DARK, opacity: 0.45 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>
          <button onClick={() => openChat()}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: DARK, color: GOLD }}>
            <MessageCircle size={18} />
            Get Clarity
          </button>
          <button
            onClick={() => { document.getElementById("my-update")?.scrollIntoView({ behavior: "smooth" }); }}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: DARK, opacity: 0.45 }}>
            <GraduationCap size={20} />
            My Update
          </button>
        </div>
      </nav>

      {/* ── SKILLS DESK ── */}
      <SkillsDesk
        open={skillsChatOpen}
        onClose={() => { setSkillsChatOpen(false); setChatProgram(undefined); }}
        preselectedProgram={chatProgram}
      />
    </div>
  );
}
