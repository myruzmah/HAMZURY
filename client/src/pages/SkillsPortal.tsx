import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight, ChevronDown,
  Users, MessageCircle, GraduationCap, Star, Target,
  Lightbulb, BookOpen, Send, X, CheckCircle, RotateCcw, Loader2, TrendingUp, Menu,
} from "lucide-react";
import { AskMeWidget } from "@/components/AskMeWidget";
import { RateUsWidget } from "@/components/RateUsWidget";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS PORTAL. /skills
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#2D2D2D";   // Charcoal. Skills primary
const GOLD  = "#6B7280";   // Slate grey. Skills accent
const TEXT  = "#1A1A1A";
const BG    = "#F5F5F5";   // Light grey background
const CREAM = "#EBEBEB";   // Slightly darker grey for cards
const W     = "#FFFFFF";

// ── WHAT YOU GET - accordion cards ───────────────────────────────────────────
const SKILL_CARDS = [
  {
    icon: Users, badge: "DIGITAL MARKETING",
    pain: "I'm spending money on ads. But getting little to no results",
    program: "Digital Marketing", price: "₦45,000", duration: "8 Weeks · Virtual & Physical",
    description: "Most owners waste ad spend because there's no strategy. This program teaches you to build an audience, create content that converts, and run profitable campaigns. From zero.",
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
    pain: "I have a great product but I can't grow my client base",
    program: "Business Development", price: "₦35,000", duration: "6 Weeks · Virtual & Physical",
    description: "Most founders plateau because they have no structured sales system. Just referrals and hope. This gives you a repeatable framework for finding, closing, and retaining clients.",
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
    pain: "I make decisions by gut feeling. I don't understand my numbers",
    program: "Data Analysis", price: "₦55,000", duration: "10 Weeks · Virtual",
    description: "Businesses that track their numbers grow faster and waste less. This program takes you from raw data to clear, actionable dashboards. No prior experience needed.",
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
    pain: "I want to build an online presence but I'm scared of the camera",
    program: "Faceless Content Intensive", price: "₦25,000", duration: "2 Weeks · Virtual",
    description: "You don't need to show your face to build authority online. This intensive teaches you to create professional, algorithm-friendly content using AI voiceover, scripting, and editing. All off-camera.",
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
    pain: "Everyone is using AI. I don't know where to start for my business",
    program: "AI-Powered Business Courses", price: "From ₦25,000", duration: "2–3 Days · Virtual",
    description: "AI isn't replacing business owners. But owners who use it will outpace those who don't. This intensive gives you practical AI workflows you can implement the same week.",
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
    pain: "I graduated but can't find real work experience anywhere",
    program: "Internship Programme", price: "Free / Stipend-based", duration: "3 Months · Physical & Hybrid",
    description: "Paper qualifications alone no longer get jobs. This programme places you inside HAMZURY's active departments. Real projects, real deadlines, real deliverables.",
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
  { num: "01", title: "Apply", short: "Tell us your goal and program interest", detail: "Use the Ask Me chat or form. Tell us which program interests you. We ask a few qualifying questions. Not to gatekeep, but to confirm fit." },
  { num: "02", title: "We Confirm Fit", short: "We verify this program matches your stage", detail: "Within 24 hours, we review your application and confirm the program fits where you are. If you need something different, we'll say so." },
  { num: "03", title: "You Enrol", short: "Secure your seat with payment or scholarship", detail: "Payment secures your seat in the cohort. If you have a RIDI or partner scholarship code, it's applied at this stage. Seats are limited per cohort. First paid, first confirmed." },
  { num: "04", title: "You Learn", short: "Live sessions, practicals, real projects", detail: "Every session is live. You work on real business scenarios and apply learnings to your own business during the program. Instructors are operators, not teachers." },
  { num: "05", title: "You Execute", short: "Leave with a skill and a 30-day action plan", detail: "Graduation includes a 30-day execution plan personalised to your business. You leave not just trained. But ready to act the next day. Alumni support continues for 60 days post-graduation." },
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
          { title: "Installment option", detail: "₦25,000 deposit to secure your seat + ₦20,000 balance before Week 3 begins. Contact us via the Ask Me chat to arrange." },
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
          { title: "Installment option", detail: "₦20,000 deposit + ₦15,000 balance before Week 2. Arrange via Ask Me chat." },
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
          { title: "Installment: ₦30,000 + ₦25,000", detail: "₦30,000 deposit to secure + ₦25,000 before Week 4. Contact us via Ask Me chat." },
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
          { title: "Application process", detail: "Apply via the Ask Me chat. Tell us your field of study, which department interests you, and what you want to achieve in 3 months. Applications reviewed within 5 working days." },
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
          { title: "Installment option", detail: "₦20,000 deposit + ₦15,000 balance before Week 3. Contact us via Ask Me chat." },
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
          { title: "Installment option", detail: "₦25,000 deposit + ₦20,000 balance before Week 4. Contact us via Ask Me chat." },
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
        id: "enroll", tagline: "Apply for RIDI via the Ask Me chat. Community nominations also accepted.",
        primary: [
          { title: "Individual application", detail: "Apply via the Ask Me button on this page. Tell us your situation, your specific skill goal, and which program you'd like to join. Applications assessed within 7 days." },
          { title: "Community nomination", detail: "RIDI community coordinators can nominate candidates directly using a unique community code. If you are a coordinator, contact us to register your community." },
          { title: "Quarterly intake cycle", detail: "RIDI applications are reviewed quarterly (January, April, July, October). Apply anytime. You'll be considered at the next intake cycle." },
        ],
        secondary: ["No income proof required", "Decision within 7 days", "Quarterly intakes", "28 active communities"],
      },
    ],
  },
];

// ── SKILLS DESK - Pure AI-driven conversational intake ────────────────────
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
  const [mounted, setMounted]         = useState(false);
  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uid = () => `${Date.now()}-${Math.random()}`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, phase, showReadyBtn]);

  useEffect(() => {
    if (open && !initialized) {
      const greeting = preselectedProgram
        ? `Hi, I'm Zara, your Skills advisor. I can see you're looking at the ${preselectedProgram} program. What's your name?`
        : "Hi, I'm Zara, your Skills advisor. Before anything, what's your name?";
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

  // Slide-in animation
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
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
      addBot("I'm having a moment. Please try again.");
    }
  }, [messages, loading, skillsChat, addBot]);

  const submitContact = useCallback(async () => {
    if (!contactName.trim() || contactPhone.replace(/\D/g, "").length < 7) return;
    setPhase("chat"); setLoading(true);
    const history = messages.map(m => ({ role: m.role === "bot" ? "assistant" as const : "user" as const, text: m.text }));
    try {
      const res = await skillsChat.mutateAsync({
        message: `[System: Contact collected. Name: ${contactName}, Phone: ${contactPhone}. Please confirm warmly and proceed to payment.]`,
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
    <div className="fixed inset-0 z-[200]"
      style={{ backgroundColor: "rgba(44,26,0,0.50)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className={`absolute bottom-0 right-0 w-full max-h-[85vh] md:top-0 md:bottom-auto md:max-h-full md:h-full md:w-[430px] flex flex-col shadow-2xl transition-transform duration-300 ease-out rounded-t-2xl md:rounded-none ${mounted ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"}`}
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
  const [askMeOpen, setAskMeOpen] = useState(false);
  const [rateUsOpen, setRateUsOpen] = useState(false);
  const [chatProgram, setChatProgram] = useState<string | undefined>(undefined);
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

  function openChat(program?: string) {
    setChatProgram(program);
    setSkillsChatOpen(true);
  }

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
          Practical programs taught by operators. Learn what works in the real market, then go execute it.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => openChat()}
            className="px-10 py-5 rounded-lg text-sm font-medium uppercase tracking-[1px] shadow-lg flex items-center gap-3 hover:-translate-y-1 transition-all"
            style={{ backgroundColor: DARK, color: BG, boxShadow: `0 8px 32px ${DARK}25` }}>
            Ask Me <ArrowRight className="w-5 h-5" />
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
      <section className="py-20 md:py-28" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>OUR PROGRAMS</p>
          <h2 className="text-[clamp(28px,4vw,40px)] font-normal tracking-tight mb-3" style={{ color: TEXT }}>Six programs. One outcome each.</h2>
          <p className="text-[15px] opacity-50 mb-10" style={{ color: TEXT }}>Every program is built for execution. Not theory. Pick the gap you want to close.</p>
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
        <p className="text-sm mb-4 opacity-60" style={{ color: TEXT }}>Want the detailed week-by-week curriculum?</p>
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
              <button onClick={() => openChat()}
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

      {/* ── MY UPDATE ── */}
      <section ref={myUpdateRef} className="py-16 px-6 border-t" style={{ borderColor: `${TEXT}10`, backgroundColor: W }}>
        <div className="max-w-lg mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>MY UPDATE</p>
          <h2 className="text-[clamp(22px,3vw,30px)] font-light tracking-tight mb-2" style={{ color: TEXT }}>Check your application status</h2>
          <p className="text-[13px] mb-8 opacity-50" style={{ color: TEXT }}>Enter the reference code from your application confirmation.</p>
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={trackRef}
              onChange={e => { setTrackRef(e.target.value); setTrackSubmitted(false); }}
              onKeyDown={e => e.key === "Enter" && handleTrack()}
              placeholder="e.g. SKL-A4K9P2"
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
                    Check the ref format. E.g. SKL-A4K9P2. Or WhatsApp us on 08067149356.
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="fixed bottom-0 inset-x-0 md:hidden z-50 border-t"
        style={{ backgroundColor: W, borderColor: `${TEXT}15`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch h-16">
          <button onClick={() => setRateUsOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: TEXT, opacity: 0.45 }}>
            <Star size={18} />
            Rate Us
          </button>
          <button
            onClick={() => myUpdateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold uppercase tracking-wider border-x"
            style={{ color: TEXT, borderColor: `${TEXT}12` }}>
            <TrendingUp size={18} />
            My Update
          </button>
          <button onClick={() => openChat()}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: DARK, color: "#FFFFFF" }}>
            <MessageCircle size={18} />
            Ask Me
          </button>
        </div>
      </nav>

      {/* ── SKILLS DESK ── */}
      <SkillsDesk
        open={skillsChatOpen}
        onClose={() => { setSkillsChatOpen(false); setChatProgram(undefined); }}
        preselectedProgram={chatProgram}
      />

      {/* ── ASK ME WIDGET ── */}
      <AskMeWidget open={askMeOpen} onClose={() => setAskMeOpen(false)} />

      {/* ── RATE US WIDGET ── */}
      <RateUsWidget open={rateUsOpen} onClose={() => setRateUsOpen(false)} />
    </div>
  );
}
