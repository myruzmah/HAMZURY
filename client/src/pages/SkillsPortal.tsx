import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ChevronDown,
  Users, GraduationCap, Star, Target,
  Lightbulb, BookOpen, X, Loader2, Menu,
} from "lucide-react";
import MotivationalQuoteBar from "@/components/MotivationalQuoteBar";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS PORTAL. /skills
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#1B2A4A";   // Dark navy blue. Skills primary
const GOLD  = "#C9A97E";   // Gold accent (5% usage)
const TEXT  = "#1A1A1A";
const BG    = "#FAFAF8";   // Milk white background
const CREAM = "#F5F3EF";   // Soft cream for cards
const W     = "#FFFFFF";

// ── WHAT YOU GET - accordion cards ───────────────────────────────────────────
const SKILL_CARDS = [
  {
    icon: Users, badge: "DIGITAL MARKETING",
    pain: "Spending on ads with nothing to show for it",
    program: "Digital Marketing", price: "₦45,000", duration: "8 Weeks · Virtual & Physical",
    description: "Strategy before spend. Build an audience, create content that converts, run profitable campaigns.",
    outcomes: [
      "Social media strategy built for your business and audience",
      "SEO fundamentals. Be found on Google without paying for ads",
      "Content creation system (batch, schedule, repeat)",
      "Paid advertising. Meta, Google, and TikTok basics",
      "Live campaigns running before you finish the program",
    ],
  },
  {
    icon: Target, badge: "BUSINESS DEVELOPMENT",
    pain: "Great product. No structured way to grow clients",
    program: "Business Development", price: "₦35,000", duration: "6 Weeks · Virtual & Physical",
    description: "A repeatable framework for finding, closing, and retaining clients. Beyond referrals.",
    outcomes: [
      "Market positioning. Know exactly who you're selling to and why",
      "Sales pipeline system. From first contact to closed deal",
      "Client acquisition frameworks built for the Nigerian market",
      "Negotiation and objection handling techniques",
      "A 90-day business growth plan ready at graduation",
    ],
  },
  {
    icon: Star, badge: "DATA ANALYSIS",
    pain: "Making decisions by gut. Not by numbers",
    program: "Data Analysis", price: "₦55,000", duration: "10 Weeks · Virtual",
    description: "Raw data to clear dashboards. No prior experience needed.",
    outcomes: [
      "Excel mastery. Formulas, pivot tables, data cleaning",
      "Power BI dashboard design and publishing",
      "Business intelligence. turning data into decisions",
      "Financial analysis and KPI tracking",
      "Real business datasets used throughout. Not textbook exercises",
    ],
  },
  {
    icon: BookOpen, badge: "CONTENT CREATION",
    pain: "Want an online presence. Don't want to be on camera",
    program: "Faceless Content Intensive", price: "₦25,000", duration: "2 Weeks · Virtual",
    description: "Professional content without showing your face. AI voiceover, scripting, editing. All off-camera.",
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
    pain: "Everyone talks about AI. No idea where to start",
    program: "AI-Powered Business Courses", price: "From ₦25,000", duration: "2–3 Days · Virtual",
    description: "Practical AI workflows you implement the same week. Leads, content, automation.",
    outcomes: [
      "AI for lead generation. Build prospect lists automatically",
      "AI for content creation. Captions, emails, scripts in minutes",
      "AI for business automation. Reduce repetitive admin to near zero",
      "ChatGPT / Claude workflows configured for your exact role",
      "Tool stack: free and paid AI tools mapped to your budget",
    ],
  },
  {
    icon: GraduationCap, badge: "INTERNSHIP",
    pain: "Graduated. Can't find real work experience",
    program: "Internship Programme", price: "Free / Stipend-based", duration: "3 Months · Physical & Hybrid",
    description: "Placed inside active departments. Real projects, real deadlines, real deliverables.",
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
  { num: "01", title: "Apply", short: "Tell us your goal and program interest", detail: "Pick a program. Answer a few qualifying questions. We confirm fit, not gatekeep." },
  { num: "02", title: "We Confirm Fit", short: "We verify this program matches your stage", detail: "Reviewed within 24 hours. If a different program suits you better, we say so." },
  { num: "03", title: "You Enrol", short: "Secure your seat with payment or scholarship", detail: "Payment secures your cohort seat. RIDI and partner scholarship codes accepted. Limited seats." },
  { num: "04", title: "You Learn", short: "Live sessions, practicals, real projects", detail: "Every session is live. Real business scenarios. Instructors are operators, not lecturers." },
  { num: "05", title: "You Execute", short: "Leave with a skill and a 30-day action plan", detail: "Graduate with a 30-day plan for your business. Alumni support for 60 days after." },
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
          { title: "Delivery format", detail: "Live sessions every weekend (virtual or physical). Sessions recorded for replay within 48 hours. Cohort size: max 25 students." },
          { title: "What makes this different", detail: "Every module ends with a real deliverable applied to YOUR business. Not a hypothetical. By week 8, your campaigns are live and generating data." },
        ],
        secondary: ["Certificate of completion", "Alumni community access (lifetime)", "30-day post-graduation support", "Optional physical attendance"],
      },
      {
        id: "curriculum", tagline: "8 weeks structured from strategy to execution. Everything in the right order.",
        primary: [
          { title: "Weeks 1–2: Strategy & Positioning", detail: "Audience research, competitor analysis, brand voice definition, and marketing goal setting. You leave with a documented strategy before you spend a naira." },
          { title: "Weeks 3–4: Content & Social Media", detail: "Content pillars, platform selection (Instagram, TikTok, LinkedIn), batch creation workflows, scheduling systems, and engagement tactics." },
          { title: "Weeks 5–6: SEO & Visibility", detail: "Google Business Profile, on-page SEO fundamentals, keyword strategy, and directory listings. Organic traffic without ad spend." },
          { title: "Weeks 7–8: Paid Advertising", detail: "Meta Ads setup, audience targeting, creative briefs, budget management, and performance analysis. Live campaigns with real budgets." },
        ],
        secondary: ["WhatsApp marketing module", "Email marketing basics", "Analytics and reporting setup", "Canva content creation masterclass"],
      },
      {
        id: "outcomes", tagline: "Leave with a running system. Not just knowledge.",
        primary: [
          { title: "A documented marketing strategy", detail: "Written, tested, and personalised to your business. Not a template. A real strategy with a content calendar, targeting parameters, and 90-day plan." },
          { title: "Live social media presence", detail: "Professionally designed profiles, a content bank of 30+ posts, and an active audience that was built during the program." },
          { title: "Running paid ad campaign", detail: "A Meta or Google ad campaign live and generating data by graduation. With your own ad account configured correctly." },
          { title: "Measurement system", detail: "Analytics dashboards tracking the metrics that matter. You'll know your cost-per-lead, content reach, and which channels to double down on." },
        ],
        secondary: ["Certificate of completion", "Instructor feedback on all deliverables", "Alumni WhatsApp group", "60-day post-graduation support"],
      },
      {
        id: "enroll", tagline: "Secure your seat before the cohort fills. Limited to 25 students per intake.",
        primary: [
          { title: "Program fee: ₦45,000", detail: "Full payment secures your seat. Accepted via Moniepoint bank transfer to HAMZURY Skills: Account 8067149356. Use your full name as reference." },
          { title: "RIDI Scholarship", detail: "If you have a RIDI scholarship code, your fee is covered. Enter your code in the application form. Scholarship places are verified within 48 hours." },
          { title: "Installment option", detail: "₦25,000 deposit to secure your seat + ₦20,000 balance before Week 3 begins. Contact us to arrange." },
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
        secondary: ["Certificate of completion", "90-day business growth plan", "Alumni network access", "Optional physical session"],
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
          { title: "Documented sales pipeline", detail: "A real CRM with your ideal client profiles, outreach templates, and stage progression. Built during the program, ready to use day one after graduation." },
          { title: "Active outreach system", detail: "WhatsApp, email, and LinkedIn sequences built and tested on real prospects. You'll have live conversations by week 3." },
          { title: "90-day growth plan", detail: "A specific, sequenced plan with revenue targets, outreach volumes, conversion goals, and a weekly action checklist. Created in the final session." },
          { title: "Closed deal", detail: "The final two weeks focus entirely on closing. Most students close at least one new client during the program. If you don't, we review why together." },
        ],
        secondary: ["Sales script templates", "Proposal template library", "CRM template (Notion)", "60-day post-grad support"],
      },
      {
        id: "enroll", tagline: "20 seats per cohort. First paid, first confirmed.",
        primary: [
          { title: "Program fee: ₦35,000", detail: "Full payment via Moniepoint bank transfer: Account 8067149356. HAMZURY Skills. Use your full name as payment reference." },
          { title: "Installment option", detail: "₦20,000 deposit + ₦15,000 balance before Week 2. Contact us to arrange." },
          { title: "RIDI Scholarship", detail: "Scholarship holders. Enter your code at application stage. Verified within 48 hours." },
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
          { title: "What makes this different", detail: "By week 10 you will have built a complete business intelligence dashboard for a real business. Either your own or a case study company with live data." },
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
          { title: "Excel mastery certificate", detail: "Intermediate-to-advanced Excel. Pivot tables, formulas, dashboards. Verifiable and in demand in every Nigerian industry." },
          { title: "Published Power BI dashboard", detail: "A real, shareable BI dashboard built during the program. Employable portfolio piece or client deliverable from day one after graduation." },
          { title: "Financial analysis capability", detail: "Ability to build P&L reports, track KPIs, analyse costs, and present findings to non-technical stakeholders." },
          { title: "Freelance-ready skill", detail: "Data analysis is one of the highest-paying remote freelance skills in Nigeria. We include a session on how to price and sell your services." },
        ],
        secondary: ["Certificate of completion", "Portfolio project (graded)", "Freelancing starter guide", "Alumni job board access"],
      },
      {
        id: "enroll", tagline: "20 seats. Most cohorts fill 2 weeks before start date.",
        primary: [
          { title: "Program fee: ₦55,000", detail: "Full payment via Moniepoint: Account 8067149356. HAMZURY Skills. Use your full name as reference." },
          { title: "Installment: ₦30,000 + ₦25,000", detail: "₦30,000 deposit to secure + ₦25,000 before Week 4. Contact us to arrange." },
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
          { title: "Delivery format", detail: "Intensive live sessions over 2 weeks (virtual). Daily practicals. You create content during every session. No homework required after class." },
          { title: "What makes this different", detail: "You leave with 30 days of ready-to-publish content already created. Not planned. Actually created, edited, and scheduled." },
        ],
        secondary: ["No camera needed. Ever", "Phone-only setup", "Free tools only", "30 posts created during program"],
      },
      {
        id: "curriculum", tagline: "2 weeks of intensive creation. From blank screen to full content bank.",
        primary: [
          { title: "Days 1–3: Strategy & Pillars", detail: "Identify your 3 content pillars, your target audience persona, and your platform strategy. Script your first 5 posts during class." },
          { title: "Days 4–7: Creation & Tools", detail: "AI voiceover setup (ElevenLabs, CapCut), script writing templates, B-roll sourcing strategy, and video editing on your phone." },
          { title: "Days 8–10: System & Batch", detail: "Batch creation workflow. Create 30 posts in a single session. Scheduling setup (Buffer or Meta Suite). Engagement strategy for faceless accounts." },
        ],
        secondary: ["Canva templates included", "AI voiceover tools setup", "Batch creation session (Day 9)", "Platform algorithm briefings"],
      },
      {
        id: "outcomes", tagline: "Leave with a running content engine. Not just theory.",
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
          { title: "Program fee: ₦25,000", detail: "Full payment via Moniepoint: Account 8067149356. HAMZURY Skills." },
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
        id: "overview", tagline: "For business owners who want to use AI but don't know where to start. No tech background required.",
        primary: [
          { title: "Three courses in one", detail: "Three focused courses: AI for Lead Generation, AI for Content Creation, and AI for Business Automation. Take one or all three. Enroll in sequence or together." },
          { title: "Delivery format", detail: "Intensive 2–3 day virtual sprints. Morning session (strategy), afternoon session (implementation). By end of day one you have something running." },
          { title: "What makes this different", detail: "Every workflow is tested, working, and free or near-free to run. We use tools available to any Nigerian business with a phone and internet connection." },
        ],
        secondary: ["No coding required", "Works on phone or laptop", "Free tools used throughout", "Certificate per course"],
      },
      {
        id: "curriculum", tagline: "Three standalone intensives. One for each AI use case.",
        primary: [
          { title: "Course 1: AI for Lead Generation (1 day)", detail: "Build a prospect list of 100+ ideal clients using AI tools. Automate outreach messages via WhatsApp and email. Set up a lead pipeline that runs without you." },
          { title: "Course 2: AI for Content Creation (1 day)", detail: "Generate captions, emails, scripts, and blog posts in minutes. Set up your custom AI content workflow. Produce a week of content in under 2 hours." },
          { title: "Course 3: AI for Business Automation (1 day)", detail: "Automate invoicing, follow-ups, client onboarding, and reporting. Connect your tools (WhatsApp, email, CRM) into automatic sequences." },
        ],
        secondary: ["ChatGPT + Claude prompts included", "Make.com / Zapier walkthrough", "WhatsApp automation setup", "Tool stack for every budget"],
      },
      {
        id: "outcomes", tagline: "Walk away with a running AI workflow. Not just ideas.",
        primary: [
          { title: "Live AI lead generation system", detail: "A running pipeline generating qualified leads daily. Without cold calling or manual searching." },
          { title: "AI content workflow", detail: "A configured content system producing high-quality posts, emails, and scripts in a fraction of normal time." },
          { title: "Automated business process", detail: "At least one complete automation running in your business. Invoices, follow-ups, or onboarding. Before you leave the course." },
        ],
        secondary: ["Prompt library (50+ prompts)", "Tool comparison guide", "Automation templates", "90-day follow-up check-in"],
      },
      {
        id: "enroll", tagline: "Cohorts run monthly. Take one course or all three.",
        primary: [
          { title: "Per course: From ₦25,000", detail: "Each course is priced individually. Bundle all 3 for ₦65,000 (save ₦10,000). Payment via Moniepoint: Account 8067149356. HAMZURY Skills." },
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
          { title: "Who this program is for", detail: "Fresh graduates (any field), final-year students, and career-changers who want professional experience in a real business environment. Not a fake internship." },
          { title: "Delivery format", detail: "Physical placement at HAMZURY Abuja headquarters. Hybrid option available for select roles. 3-month placement with weekly reviews and monthly performance assessment." },
          { title: "What makes this different", detail: "You work on real client projects under supervision. Real deadlines, real deliverables, real feedback. Your work appears in actual client outcomes. Not training simulations." },
        ],
        secondary: ["Physical placement. Abuja", "Stipend-based roles available", "Reference letter guaranteed", "Open to any field of study"],
      },
      {
        id: "curriculum", tagline: "3 months of structured placement across HAMZURY's active departments.",
        primary: [
          { title: "Month 1: Orientation & Foundations", detail: "Department induction, tool setup, shadow senior team members, attend client calls, and complete your first solo deliverable by end of week 4." },
          { title: "Month 2: Active Contribution", detail: "Assigned to live client projects. You own deliverables end-to-end. Research, execution, and submission. Weekly review with your department lead." },
          { title: "Month 3: Lead & Deliver", detail: "Take ownership of a complete project scope from brief to delivery. Present your work to leadership. Final assessment and reference letter issued." },
        ],
        secondary: ["Available departments: BizDoc, Systemize, Skills, Media", "Weekly 1-on-1 with supervisor", "Monthly performance review", "Access to all internal training materials"],
      },
      {
        id: "outcomes", tagline: "Leave with a portfolio, a reference, and a network.",
        primary: [
          { title: "Professional reference letter", detail: "Written and signed by your department lead at HAMZURY. Specific, credible, and usable for any employer or postgraduate application." },
          { title: "Certificate of completion", detail: "Issued with your department specialisation track (e.g. 'BizDoc Compliance Operations' or 'Systemize Brand & Digital')." },
          { title: "Portfolio of real work", detail: "3 to 5 real deliverables completed for actual clients. With permission to include in your portfolio. This is what separates HAMZURY interns in the job market." },
          { title: "Career mentorship session", detail: "One 45-minute career strategy session with HAMZURY leadership in your final week. CV review, LinkedIn audit, and job-search guidance." },
        ],
        secondary: ["HAMZURY alumni network access", "First consideration for paid roles", "LinkedIn recommendation", "60-day post-placement support"],
      },
      {
        id: "enroll", tagline: "Applications open quarterly. Only 8 placements per intake.",
        primary: [
          { title: "Application process", detail: "Apply using the form below. Tell us your field of study, which department interests you, and what you want to achieve in 3 months. Applications reviewed within 5 working days." },
          { title: "Free placement", detail: "Standard internship placement is unpaid but provides all training, resources, tools, and the full reference package." },
          { title: "Stipend-based roles", detail: "A small number of placements carry a monthly stipend (₦15,000–₦30,000) for high-performing candidates in live revenue-generating roles. Announced at intake." },
        ],
        secondary: ["8 placements per quarter", "Application takes 5 minutes", "Decision within 5 working days", "Physical attendance required. Abuja"],
      },
    ],
  },
  {
    id: "digital", label: "Digital Skills Bootcamp", badge: "8 WEEKS",
    tagline: "A hands-on intensive covering the digital tools that power modern work.",
    duration: "8 Weeks · Virtual", price: "₦35,000",
    stages: [
      {
        id: "overview", tagline: "For school leavers, career changers, and anyone who wants to earn online. No prior technical knowledge required.",
        primary: [
          { title: "Who this is for", detail: "School leavers, career changers, and anyone who wants to earn online. No prior technical knowledge required." },
          { title: "Delivery format", detail: "100% virtual. Live sessions twice weekly. Session recordings available for 48 hours after each class." },
          { title: "What makes this different", detail: "Every module produces a live, published deliverable. By week 8 your social media, email list, and online store are live and generating data." },
        ],
        secondary: ["Certificate of completion", "Alumni network access", "Portfolio project included"],
      },
      {
        id: "curriculum", tagline: "From productivity fundamentals to a live digital income stream. In 8 weeks.",
        primary: [
          { title: "Digital marketing fundamentals", detail: "Learn how digital marketing works across social media, email, and e-commerce. With hands-on application from week one." },
          { title: "Social media strategy & content creation", detail: "Build and grow an audience on the platforms your customers actually use. Content pillars, scheduling, and engagement tactics covered." },
          { title: "Email marketing & automation tools", detail: "Set up your list, design campaigns, and automate sequences using free and affordable tools available in Nigeria." },
          { title: "E-commerce setup & management", detail: "Launch your own online store or product listing. We walk through setup, product photography basics, and first-sale strategies." },
        ],
        secondary: ["Canva design toolkit", "Free tools only", "Live store setup session", "Alumni WhatsApp group"],
      },
      {
        id: "outcomes", tagline: "Leave with a running digital presence and your first income stream active.",
        primary: [
          { title: "Freelance readiness", detail: "Build your first digital income stream during the program. By graduation, you have a portfolio, a social profile, and a store. All live." },
          { title: "Social media & email presence", detail: "A professionally run social account and email list with your first 100 subscribers. Built during the 8 weeks." },
          { title: "Digital marketing capability", detail: "Ability to plan and execute digital campaigns for your business or as a freelance service for clients." },
        ],
        secondary: ["Certificate of completion", "Alumni network access", "Portfolio project included", "60-day post-graduation support"],
      },
      {
        id: "enroll", tagline: "Next cohort forming now. 20 seats available.",
        primary: [
          { title: "Program fee: ₦35,000", detail: "Full payment via Moniepoint: Account 8067149356. HAMZURY Skills. Use your full name as reference." },
          { title: "Installment option", detail: "₦20,000 deposit + ₦15,000 balance before Week 3. Contact us to arrange." },
          { title: "RIDI Scholarship", detail: "University students from underserved communities can apply for a full RIDI scholarship. Apply via the RIDI portal." },
        ],
        secondary: ["Application takes 2 minutes", "Confirmation within 24 hours", "Start date: next available cohort", "RIDI codes welcome"],
      },
    ],
  },
  {
    id: "it", label: "IT Foundations Programme", badge: "10 WEEKS",
    tagline: "Bridges the gap between academic theory and the real-world tech skills employers need.",
    duration: "10 Weeks · Virtual + Physical", price: "₦45,000 / Free with RIDI Scholarship",
    stages: [
      {
        id: "overview", tagline: "For university students and fresh graduates in IT, Computer Science, and related fields.",
        primary: [
          { title: "Who this is for", detail: "University students and fresh graduates in IT, Computer Science, Software Engineering, or related fields. Basic computer literacy required." },
          { title: "Why this is different", detail: "Every session produces a deployable deliverable. By graduation you have 3 real projects on GitHub and a reviewed CV ready for applications." },
          { title: "RIDI Scholarship", detail: "University students from underserved communities can apply for a full RIDI scholarship covering 100% of program fees. Apply via the RIDI portal." },
        ],
        secondary: ["University student discount available", "RIDI scholarship eligible", "Internship pathway through HAMZURY"],
      },
      {
        id: "curriculum", tagline: "10 weeks from academic theory to a GitHub portfolio employers can actually verify.",
        primary: [
          { title: "Practical software development workflow", detail: "Git, version control, code reviews, and professional development practices used in real teams. Not taught in university." },
          { title: "Database design & SQL fundamentals", detail: "Design relational databases from scratch. Write queries, joins, and stored procedures against real datasets." },
          { title: "API integration basics", detail: "Understand REST APIs, make real API calls, and integrate external services into your own projects." },
          { title: "Project management with industry tools", detail: "Jira, Notion, and GitHub Projects. The tools every tech team uses. Setup and workflow covered from day one." },
        ],
        secondary: ["GitHub portfolio setup", "CV & LinkedIn review session", "3 real projects built", "Access to HAMZURY alumni tech network"],
      },
      {
        id: "outcomes", tagline: "Graduate with a verified portfolio, a reviewed CV, and an internship pathway.",
        primary: [
          { title: "3 projects on GitHub", detail: "Three real, deployable projects built during the program. Each with documentation, version history, and live demo links." },
          { title: "CV & GitHub portfolio", detail: "A reviewed, industry-ready CV and GitHub profile. Formatted to pass ATS screening and impress technical interviewers." },
          { title: "Internship pathway", detail: "High-performing graduates are offered placement consideration within HAMZURY's active tech projects and client partnerships." },
        ],
        secondary: ["Certificate of completion", "Internship pathway through HAMZURY", "Alumni job board access", "90-day post-graduation support"],
      },
      {
        id: "enroll", tagline: "Limited to 20 students. University student discount available.",
        primary: [
          { title: "Program fee: ₦45,000", detail: "Full payment via Moniepoint: Account 8067149356. HAMZURY Skills. Use your full name as reference. University student discount available on request." },
          { title: "RIDI Scholarship", detail: "University students from underserved communities can apply for a full RIDI scholarship covering 100% of program fees." },
          { title: "Installment option", detail: "₦25,000 deposit + ₦20,000 balance before Week 4. Contact us to arrange." },
        ],
        secondary: ["Laptop required", "All software is free", "RIDI scholarship eligible", "University student discount available"],
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
          { title: "What RIDI is", detail: "RIDI is HAMZURY's scholarship arm. Funding Skills program seats for young Nigerians who demonstrate talent and ambition but face genuine financial barriers to enrolment." },
          { title: "Who qualifies", detail: "Applicants aged 18–30 who are currently employed in low-income roles, self-employed with limited revenue, or unemployed graduates demonstrating clear intent and a specific skill goal." },
          { title: "What's covered", detail: "Full tuition for any one HAMZURY Skills program. No partial funding. RIDI covers the complete program fee. Non-transferable, non-deferrable." },
        ],
        secondary: ["28 RIDI communities active", "Quarterly intake", "Any program eligible", "Community nominations accepted"],
      },
      {
        id: "curriculum", tagline: "RIDI scholars enroll in the same cohorts as full-fee students. No separate tracks.",
        primary: [
          { title: "Same program, same cohort", detail: "RIDI scholars attend the exact same live sessions, access the same materials, and submit the same deliverables as full-fee students. No separation." },
          { title: "Accountability check-in", detail: "RIDI scholars receive an additional monthly 15-minute check-in with the program coordinator. To support completion and flag challenges early." },
          { title: "Community mentor", detail: "Each RIDI scholar is connected with a HAMZURY alumni mentor from a similar background for the duration of the program and 3 months post-graduation." },
        ],
        secondary: ["Cohort placement guaranteed on approval", "Mentor matching within 5 days of enrolment", "Community accountability group", "Alumni network access on graduation"],
      },
      {
        id: "outcomes", tagline: "RIDI's target: 100% completion rate and immediate income impact.",
        primary: [
          { title: "Full certificate on completion", detail: "RIDI scholars receive the same certificate as full-fee graduates. Including department specialisation and HAMZURY verification." },
          { title: "Income milestone tracking", detail: "RIDI tracks scholar income 3, 6, and 12 months post-graduation. This data funds the next intake cycle. Your success directly enables the next scholar." },
          { title: "Community impact path", detail: "Top RIDI graduates are invited to join the RIDI Ambassador Programme. teaching peers in their community and earning a stipend in the process." },
        ],
        secondary: ["Certificate (same as full-fee)", "3-month income tracking", "Ambassador opportunity", "Nomination chain (each graduate nominates the next)"],
      },
      {
        id: "enroll", tagline: "Apply for RIDI using the form below. Community nominations also accepted.",
        primary: [
          { title: "Individual application", detail: "Apply using the form below. Tell us your situation, your specific skill goal, and which program you'd like to join. Applications assessed within 7 days." },
          { title: "Community nomination", detail: "RIDI community coordinators can nominate candidates directly using a unique community code. If you are a coordinator, contact us to register your community." },
          { title: "Quarterly intake cycle", detail: "RIDI applications are reviewed quarterly (January, April, July, October). Apply anytime. You'll be considered at the next intake cycle." },
        ],
        secondary: ["No income proof required", "Decision within 7 days", "Quarterly intakes", "28 active communities"],
      },
    ],
  },
];



// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SkillsPortal() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // How We Work
  const [activeStep, setActiveStep] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);

  // My Update
  const myUpdateRef = useRef<HTMLElement>(null);
  const [trackRef, setTrackRef] = useState("");
  const [trackSubmitted, setTrackSubmitted] = useState(false);
  const trackQuery = trpc.skills.trackApplication.useQuery(
    { ref: trackRef.trim().toUpperCase() },
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

  const STATUS_LABELS: Record<string, string> = {
    submitted: "Application received",
    under_review: "Under review",
    accepted: "Accepted. Check your email",
    waitlisted: "Waitlisted. We'll notify you",
    rejected: "Not accepted this cycle",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <PageMeta
        title="Hamzury Skills. Business Education & Professional Development"
        description="Cohort-based business education for ambitious professionals. Digital marketing, business development, data analysis, and AI programs."
      />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 relative ${scrolled ? "py-3" : "py-5"}`}
        style={{
          backgroundColor: scrolled ? `${W}F5` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${GOLD}18` : "none",
          boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.04)" : "none",
        }}>
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <span className="font-semibold tracking-[2px] text-sm" style={{ color: TEXT }}>HAMZURY SKILLS</span>
          <button
            onClick={() => setMobileMenuOpen(p => !p)}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 transition-colors"
            style={{ color: TEXT }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-t"
            style={{ backgroundColor: W, borderColor: `${GOLD}20`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Systemise", href: "/systemise" },
                { label: "BizDoc Consult", href: "/bizdoc" },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 rounded-xl text-sm font-medium hover:bg-black/5 transition-colors"
                  style={{ color: TEXT }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-[8%] max-w-[1200px] mx-auto pt-16">
        <span className="text-xs tracking-[3px] font-normal mb-6 uppercase" style={{ color: GOLD }}>Business Education</span>
        <h1 className="text-[clamp(40px,7vw,72px)] leading-[1.05] font-normal tracking-tight mb-6" style={{ color: TEXT }}>
          Skills that build<br />real businesses.
        </h1>
        <p className="text-[clamp(16px,2vw,20px)] leading-relaxed font-light max-w-[560px] mb-12" style={{ color: `${TEXT}CC` }}>
          Taught by operators. Learn what works, then execute.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
            className="px-10 py-5 rounded-lg text-sm font-medium uppercase tracking-[1px] shadow-lg flex items-center gap-3 hover:-translate-y-1 transition-all"
            style={{ backgroundColor: DARK, color: BG, boxShadow: `0 8px 32px ${DARK}25` }}>
            View Programs <ArrowRight className="w-5 h-5" />
          </button>
          <a href="/skills/blueprint"
            className="px-7 py-4 rounded-lg text-sm font-medium border transition-opacity hover:opacity-80 inline-flex items-center gap-2"
            style={{ borderColor: `${TEXT}30`, color: TEXT }}>
            Course Blueprint <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 px-6 border-t border-b" style={{ borderColor: `${TEXT}12`, backgroundColor: W }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: "1,200+", label: "Students Trained" },
            { stat: "85+",    label: "Businesses Launched" },
            { stat: "6",      label: "Active Programs" },
            { stat: "4.8/5",  label: "Student Rating" },
          ].map(item => (
            <div key={item.label}>
              <p className="text-2xl font-light mb-1" style={{ color: TEXT }}>{item.stat}</p>
              <p className="text-xs tracking-wide uppercase opacity-50" style={{ color: TEXT }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAMS OVERVIEW ── */}
      <section id="programs" className="py-20 md:py-28" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>OUR PROGRAMS</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-3" style={{ color: TEXT }}>Six programs. Built for execution.</h2>
          <p className="text-[15px] opacity-50 mb-10" style={{ color: TEXT }}>Pick the gap you want to close.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {["Digital Marketing", "Business Development", "Data Analysis", "Faceless Content Intensive", "AI-Powered Business", "Internship Programme"].map(p => (
              <div key={p} className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: W, border: `1px solid ${GOLD}20` }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DARK }} />
                <span className="text-sm font-medium" style={{ color: TEXT }}>{p}</span>
              </div>
            ))}
          </div>
          <a href="/skills/programs"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: DARK, color: W }}>
            Explore All Programs <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: W }}>
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>HOW WE WORK</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-12" style={{ color: TEXT }}>From application to execution.</h2>

          <div className="hidden md:block">
            <div className="flex gap-0 rounded-2xl overflow-hidden border mb-8" style={{ borderColor: `${TEXT}15` }}>
              {SKILL_STEPS.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  className="flex-1 py-4 px-3 text-center transition-all duration-200"
                  style={{ backgroundColor: activeStep === i ? DARK : "transparent", borderRight: i < SKILL_STEPS.length - 1 ? `1px solid ${TEXT}12` : "none" }}>
                  <div className="text-[10px] font-bold tracking-[0.2em] mb-1" style={{ color: activeStep === i ? GOLD : `${TEXT}55` }}>{s.num}</div>
                  <div className="text-[13px] font-semibold" style={{ color: activeStep === i ? W : TEXT }}>{s.title}</div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl p-8" style={{ backgroundColor: `${TEXT}08` }}>
              <p className="text-[13px] font-semibold mb-2" style={{ color: GOLD }}>{SKILL_STEPS[activeStep].short}</p>
              <p className="text-[15px] leading-relaxed" style={{ color: TEXT }}>{SKILL_STEPS[activeStep].detail}</p>
            </div>
          </div>

          <div className="md:hidden flex flex-col gap-3">
            {SKILL_STEPS.map((s, i) => {
              const isOpen = openStep === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden border transition-all"
                  style={{ borderColor: isOpen ? DARK : `${TEXT}15`, backgroundColor: isOpen ? DARK : W }}>
                  <button onClick={() => setOpenStep(isOpen ? null : i)} className="w-full text-left px-5 py-4 flex items-center gap-4">
                    <span className="text-[11px] font-bold tracking-wider w-6" style={{ color: isOpen ? GOLD : `${TEXT}55` }}>{s.num}</span>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold" style={{ color: isOpen ? W : TEXT }}>{s.title}</p>
                      <p className="text-[11px] opacity-60 mt-0.5" style={{ color: isOpen ? W : TEXT }}>{s.short}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? GOLD : `${TEXT}55` }} />
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

      {/* ── COURSE BLUEPRINT LINK ── */}
      <section className="py-12 px-6 text-center" style={{ backgroundColor: CREAM }}>
        <p className="text-sm mb-4 opacity-60" style={{ color: TEXT }}>Week-by-week curriculum for every program.</p>
        <a href="/skills/blueprint"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
          style={{ borderColor: `${DARK}30`, color: DARK }}>
          View Course Blueprint <ArrowRight size={14} />
        </a>
      </section>

      {/* ── ALUMNI VOICES ── */}
      <section className="py-20 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: GOLD }}>Alumni Voices</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Before Hamzury Skills, I was spending ₦80k/month on ads with no strategy. Now I manage my own campaigns profitably.", name: "Zainab Yusuf", program: "Digital Marketing. Cohort 4", outcome: "3× ROI in 60 days" },
              { quote: "I started my consulting business within 2 months of graduating. The business development course gave me the exact framework.", name: "Emmanuel Okonkwo", program: "Business Development. Cohort 3", outcome: "Business launched" },
              { quote: "I went from Excel beginner to building dashboards for 3 corporate clients. The data analysis cohort changed my career.", name: "Halima Abubakar", program: "Data Analysis. Cohort 5", outcome: "3 new clients" },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl p-5 flex flex-col gap-3" style={{ backgroundColor: W, border: `1px solid ${GOLD}25` }}>
                <span className="text-2xl font-serif" style={{ color: GOLD }}>"</span>
                <p className="text-sm leading-relaxed flex-1" style={{ color: TEXT, opacity: 0.8 }}>{t.quote}</p>
                <div className="pt-3" style={{ borderTop: `1px solid ${GOLD}20` }}>
                  <p className="text-xs font-semibold" style={{ color: TEXT }}>{t.name}</p>
                  <p className="text-xs" style={{ color: GOLD }}>{t.program}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>✓ {t.outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: DARK }}>
        <div className="max-w-[800px] mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-4" style={{ color: GOLD }}>THE HAMZURY SKILLS STANDARD</p>
          <h2 className="text-[clamp(24px,4vw,36px)] font-normal tracking-tight mb-6" style={{ color: W }}>
            We don't run generic courses.<br />We build real capability.
          </h2>
          <p className="text-[clamp(15px,2vw,17px)] leading-[1.7] font-light opacity-70" style={{ color: W }}>
            Every program is built around what operators in Nigeria actually need to execute. And taught by people who have done it, not just studied it.
          </p>
        </div>
      </section>

      {/* ── MILESTONES & SUCCESS STORIES ── */}
      <section className="py-20 md:py-28 px-6" style={{ backgroundColor: W }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>MILESTONES & SUCCESS STORIES</p>
          <h2 className="text-[clamp(24px,3.5vw,36px)] font-light mb-2" style={{ color: TEXT }}>Real results. Real people.</h2>
          <p className="text-[14px] mb-10 opacity-50" style={{ color: TEXT }}>Every number represents a life changed. Every story is one of our graduates.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {[
              { label: "1,200+", sub: "Students Trained", color: DARK },
              { label: "85+",    sub: "Businesses Launched by Graduates", color: DARK },
              { label: "28",     sub: "Communities Reached via RIDI", color: DARK },
              { label: "Adaeze O.",   sub: "Went from job-seeker to digital agency owner in 6 months after our Digital Marketing cohort.", color: "#1B4D3E" },
              { label: "Ibrahim K.",  sub: "Landed a software engineering role 3 weeks after IT Foundations. Now mentoring the next cohort.", color: "#1E3A5F" },
              { label: "Shifa AI",    sub: "AI-powered health advisory startup. Born out of the HAMZURY startup incubation programme.", color: "#2C1A0E" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{ borderColor: `${item.color}15`, backgroundColor: `${item.color}06` }}>
                <p className="text-[20px] font-light mb-2" style={{ color: item.color }}>{item.label}</p>
                <p className="text-[13px] leading-relaxed opacity-60" style={{ color: TEXT }}>{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Our Calendar */}
          <div className="rounded-2xl border p-6 md:p-8" style={{ borderColor: `${DARK}20`, backgroundColor: `${DARK}08` }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: GOLD }}>OUR CALENDAR</p>
                <h3 className="text-[20px] font-light mb-1" style={{ color: TEXT }}>Next cohorts starting soon.</h3>
                <p className="text-[13px] opacity-50" style={{ color: TEXT }}>Digital Marketing · Business Essentials · IT Foundations · CEO Development</p>
              </div>
              <button onClick={() => document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0"
                style={{ backgroundColor: DARK, color: "#FFFFFF" }}>
                Check Availability →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HALS - ONLINE LMS ── */}
      <section className="py-12 px-6 border-t" style={{ borderColor: `${TEXT}10`, backgroundColor: BG }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: DARK }}>HALS. HAMZURY ADAPTIVE LEARNING SYSTEM</p>
            <p className="text-[15px] font-light mb-1" style={{ color: TEXT }}>Our fully online learning platform.</p>
            <p className="text-[13px] opacity-50" style={{ color: TEXT }}>Access your courses, assignments, and cohort materials. Anytime, anywhere.</p>
          </div>
          <a href="https://hals.hamzury.com" target="_blank" rel="noopener noreferrer"
            className="px-7 py-3.5 rounded-xl text-[13px] font-semibold transition-all hover:-translate-y-0.5 flex-shrink-0 border"
            style={{ borderColor: `${DARK}30`, color: DARK, backgroundColor: W }}>
            Access HALS →
          </a>
        </div>
      </section>

      {/* ── TRACK ── */}
      <section ref={myUpdateRef} className="py-16 px-6 border-t" style={{ borderColor: `${TEXT}10`, backgroundColor: W }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>TRACK</p>
          <h2 className="text-[clamp(22px,3vw,30px)] font-light tracking-tight mb-2" style={{ color: TEXT }}>Track Your Application</h2>
          <p className="text-[13px] mb-8 opacity-50" style={{ color: TEXT }}>Enter the reference code from your application confirmation.</p>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={trackRef}
              onChange={e => { setTrackRef(e.target.value); setTrackSubmitted(false); }}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="e.g. HAM-A4K9-1234"
              className="flex-1 px-4 py-3 rounded-xl border text-[14px] font-mono outline-none transition-all"
              style={{ borderColor: `${TEXT}20`, backgroundColor: `${TEXT}04`, color: TEXT }}
            />
            <button
              onClick={handleTrack}
              disabled={trackRef.trim().length < 4 || trackQuery.isFetching}
              className="px-5 py-3 rounded-xl text-[13px] font-medium transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ backgroundColor: DARK, color: BG }}
            >
              {trackQuery.isFetching ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              {trackQuery.isFetching ? "Checking…" : "Check"}
            </button>
          </div>
          {/* Result */}
          {trackSubmitted && !trackQuery.isFetching && (
            <div>
              {trackQuery.data?.found ? (
                <div className="rounded-2xl p-5 border" style={{ borderColor: `${TEXT}12`, backgroundColor: `${TEXT}04` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono opacity-40" style={{ color: TEXT }}>{trackQuery.data.ref}</span>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: `${GOLD}25`, color: DARK }}
                    >
                      {STATUS_LABELS[trackQuery.data.status] ?? trackQuery.data.status}
                    </span>
                  </div>
                  <p className="text-[15px] font-light mb-1" style={{ color: TEXT }}>{trackQuery.data.program}</p>
                  <p className="text-[12px] opacity-40 mb-3" style={{ color: TEXT }}>
                    Applied {new Date(trackQuery.data.createdAt).toLocaleDateString("en-NG")}
                  </p>
                  {/* Payment status */}
                  {trackQuery.data.paymentStatus && trackQuery.data.paymentStatus !== "paid" && (
                    <div className="mt-2 p-3 rounded-xl text-[12px]" style={{ backgroundColor: `${GOLD}12`, color: DARK }}>
                      Payment status: <strong>{trackQuery.data.paymentStatus}</strong>. Transfer to Moniepoint 8067149356 (HAMZURY Skills) to confirm your seat.
                    </div>
                  )}
                  {trackQuery.data.status === "accepted" && (
                    <div className="mt-2 p-3 rounded-xl text-[12px]" style={{ backgroundColor: "#16A34A15", color: "#15803D" }}>
                      🎉 Congratulations. Check your email for onboarding details.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: `${TEXT}05` }}>
                  <p className="text-[14px] font-light mb-1" style={{ color: TEXT }}>Reference not found</p>
                  <p className="text-[12px] opacity-40" style={{ color: TEXT }}>
                    Check the ref format. E.g. HAM-A4K9-1234. Or WhatsApp us on 08067149356.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CEO QUOTE ── */}
      <section className="py-16 px-6" style={{ backgroundColor: DARK }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[clamp(18px,3vw,26px)] font-light leading-relaxed italic mb-8 text-white" style={{ opacity: 0.85 }}>
            "The most expensive skill is the one you never learned. We exist to remove that excuse."
          </p>
          <Link href="/skills/ceo">
            <div className="inline-flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: GOLD, color: DARK }}>CEO</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white group-hover:underline">Skills Division CEO</p>
                <p className="text-[11px]" style={{ color: GOLD, opacity: 0.7 }}>View profile →</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: DARK, color: `${BG}bb` }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-normal tracking-widest text-sm uppercase" style={{ color: BG }}>Hamzury Skills</span>
          <div className="flex items-center gap-6 text-xs flex-wrap justify-center sm:justify-end" style={{ color: `${BG}55` }}>
            <p className="text-[12px] font-light italic mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              "The right skills change everything." — Muhammad Hamzury, Founder
            </p>
            <span>© 2026 Hamzury Skills</span>
            <a href="/login" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Staff</a>
            <a href="/pricing" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Pricing</a>
            <Link href="/alumni" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Alumni</Link>
            <Link href="/ridi" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>RIDI</Link>
            <Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Privacy</Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Terms</Link>
          </div>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM BAR ── */}
      <MotivationalQuoteBar color="#1B2A4A" />
      <div className="md:hidden h-10" />
    </div>
  );
}
