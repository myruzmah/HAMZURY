import { useState } from "react";
import PageMeta from "@/components/PageMeta";
import {
  ArrowRight, ChevronLeft, ChevronRight, X, Menu,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   HAMZURY SKILLS — COURSE BLUEPRINT PAGE  /skills/blueprint
   ═══════════════════════════════════════════════════════════════════════════ */

const DARK  = "#1E3A5F";   // Dark navy blue — Skills primary
const GOLD  = "#B48C4C";   // Gold accent (5% usage)
const TEXT  = "#1A1A1A";
const BG    = "#FFFAF6";   // Milk white background
const CREAM = "#F5F3EF";   // Soft cream for cards
const W     = "#FFFFFF";

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
          { title: "What makes this different", detail: "Every module ends with a real deliverable applied to YOUR business — not a hypothetical. By week 8, your campaigns are live and generating data." },
        ],
        secondary: ["Certificate of completion", "Alumni community access (lifetime)", "30-day post-graduation support", "Optional physical attendance"],
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
          { title: "Installment option", detail: "₦20,000 deposit + ₦15,000 balance before Week 2. Arrange via Ask Me chat." },
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
          { title: "Application process", detail: "Apply via the Ask Me chat. Tell us your field of study, which department interests you, and what you want to achieve in 3 months. Applications reviewed within 5 working days." },
          { title: "Free placement", detail: "Standard internship placement is unpaid but provides all training, resources, tools, and the full reference package." },
          { title: "Stipend-based roles", detail: "A small number of placements carry a monthly stipend (₦15,000–₦30,000) for high-performing candidates in live revenue-generating roles. Announced at intake." },
        ],
        secondary: ["8 placements per quarter", "Application takes 5 minutes", "Decision within 5 working days", "Physical attendance required — Abuja"],
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
        id: "curriculum", tagline: "From productivity fundamentals to a live digital income stream — in 8 weeks.",
        primary: [
          { title: "Digital marketing fundamentals", detail: "Learn how digital marketing works across social media, email, and e-commerce — with hands-on application from week one." },
          { title: "Social media strategy & content creation", detail: "Build and grow an audience on the platforms your customers actually use. Content pillars, scheduling, and engagement tactics covered." },
          { title: "Email marketing & automation tools", detail: "Set up your list, design campaigns, and automate sequences using free and affordable tools available in Nigeria." },
          { title: "E-commerce setup & management", detail: "Launch your own online store or product listing. We walk through setup, product photography basics, and first-sale strategies." },
        ],
        secondary: ["Canva design toolkit", "Free tools only", "Live store setup session", "Alumni WhatsApp group"],
      },
      {
        id: "outcomes", tagline: "Leave with a running digital presence and your first income stream active.",
        primary: [
          { title: "Freelance readiness", detail: "Build your first digital income stream during the program. By graduation, you have a portfolio, a social profile, and a store — all live." },
          { title: "Social media & email presence", detail: "A professionally run social account and email list with your first 100 subscribers — built during the 8 weeks." },
          { title: "Digital marketing capability", detail: "Ability to plan and execute digital campaigns for your business or as a freelance service for clients." },
        ],
        secondary: ["Certificate of completion", "Alumni network access", "Portfolio project included", "60-day post-graduation support"],
      },
      {
        id: "enroll", tagline: "Next cohort forming now. 20 seats available.",
        primary: [
          { title: "Program fee: ₦35,000", detail: "Full payment via Moniepoint: Account 8067149356 — HAMZURY Skills. Use your full name as reference." },
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
          { title: "Practical software development workflow", detail: "Git, version control, code reviews, and professional development practices used in real teams — not taught in university." },
          { title: "Database design & SQL fundamentals", detail: "Design relational databases from scratch. Write queries, joins, and stored procedures against real datasets." },
          { title: "API integration basics", detail: "Understand REST APIs, make real API calls, and integrate external services into your own projects." },
          { title: "Project management with industry tools", detail: "Jira, Notion, and GitHub Projects — the tools every tech team uses. Setup and workflow covered from day one." },
        ],
        secondary: ["GitHub portfolio setup", "CV & LinkedIn review session", "3 real projects built", "Access to HAMZURY alumni tech network"],
      },
      {
        id: "outcomes", tagline: "Graduate with a verified portfolio, a reviewed CV, and an internship pathway.",
        primary: [
          { title: "3 projects on GitHub", detail: "Three real, deployable projects built during the program — each with documentation, version history, and live demo links." },
          { title: "CV & GitHub portfolio", detail: "A reviewed, industry-ready CV and GitHub profile. Formatted to pass ATS screening and impress technical interviewers." },
          { title: "Internship pathway", detail: "High-performing graduates are offered placement consideration within HAMZURY's active tech projects and client partnerships." },
        ],
        secondary: ["Certificate of completion", "Internship pathway through HAMZURY", "Alumni job board access", "90-day post-graduation support"],
      },
      {
        id: "enroll", tagline: "Limited to 20 students. University student discount available.",
        primary: [
          { title: "Program fee: ₦45,000", detail: "Full payment via Moniepoint: Account 8067149356 — HAMZURY Skills. Use your full name as reference. University student discount available on request." },
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
        id: "enroll", tagline: "Apply for RIDI via the Ask Me chat. Community nominations also accepted.",
        primary: [
          { title: "Individual application", detail: "Apply via the Ask Me button on this page. Tell us your situation, your specific skill goal, and which program you'd like to join. Applications assessed within 7 days." },
          { title: "Community nomination", detail: "RIDI community coordinators can nominate candidates directly using a unique community code. If you are a coordinator, contact us to register your community." },
          { title: "Quarterly intake cycle", detail: "RIDI applications are reviewed quarterly (January, April, July, October). Apply anytime — you'll be considered at the next intake cycle." },
        ],
        secondary: ["No income proof required", "Decision within 7 days", "Quarterly intakes", "28 active communities"],
      },
    ],
  },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SkillsBlueprint() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bizPage, setBizPage] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState(0);
  const BIZ_PER_PAGE = 6;
  const bizPageCount = Math.ceil(COURSE_BLUEPRINTS.length / BIZ_PER_PAGE);
  const pagedBiz = COURSE_BLUEPRINTS.slice(bizPage * BIZ_PER_PAGE, (bizPage + 1) * BIZ_PER_PAGE);
  const selectedBp = COURSE_BLUEPRINTS.find(b => b.id === selectedCourse);
  const activeTabDef = COURSE_STAGE_TABS[activeCourseTab];
  const activeStage = selectedBp?.stages.find(s => s.id === activeTabDef?.id) ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG, color: TEXT }}>
      <PageMeta
        title="Course Blueprint — HAMZURY Skills"
        description="Explore the full week-by-week curriculum, outcomes, and enrollment details for every HAMZURY Skills program."
      />

      {/* ── NAV ── */}
      <nav className="sticky top-0 left-0 right-0 z-50 relative"
        style={{
          backgroundColor: `${W}F5`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${GOLD}18`,
          boxShadow: "0 1px 20px rgba(0,0,0,0.04)",
        }}>
        <div className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between">
          <a href="/skills" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: TEXT }}>
            ← Back to Skills
          </a>
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
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>COURSE BLUEPRINT</p>
          <h1 className="text-[clamp(32px,5vw,52px)] leading-[1.05] font-normal tracking-tight mb-4" style={{ color: TEXT }}>
            Inside every program.
          </h1>
          <p className="text-[16px] leading-relaxed font-light max-w-[540px]" style={{ color: `${TEXT}CC` }}>
            Pick a program below to explore the full curriculum, outcomes, and enrollment details.
          </p>
        </div>
      </section>

      {/* ── BLUEPRINT ── */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {!selectedCourse && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {pagedBiz.map((bp) => (
                  <button key={bp.id}
                    onClick={() => { setSelectedCourse(bp.id); setActiveCourseTab(0); }}
                    className="rounded-2xl p-4 text-left transition-all duration-200 border hover:border-[#1A1A1A] hover:shadow-md"
                    style={{ backgroundColor: W, borderColor: `${TEXT}15` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `${GOLD}18`, color: GOLD }}>{bp.badge}</span>
                    </div>
                    <p className="text-[14px] font-bold mb-1" style={{ color: TEXT }}>{bp.label}</p>
                    <p className="text-[11px] leading-tight opacity-55" style={{ color: TEXT }}>{bp.price} · {bp.duration.split("·")[0].trim()}</p>
                  </button>
                ))}
              </div>
              {bizPageCount > 1 && (
                <div className="flex items-center justify-end gap-2 mb-8">
                  <button onClick={() => setBizPage(p => Math.max(0, p - 1))} disabled={bizPage === 0}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${TEXT}25` }}>
                    <ChevronLeft size={16} style={{ color: TEXT }} />
                  </button>
                  <span className="text-[12px] opacity-50" style={{ color: TEXT }}>{bizPage + 1} / {bizPageCount}</span>
                  <button onClick={() => setBizPage(p => Math.min(bizPageCount - 1, p + 1))} disabled={bizPage === bizPageCount - 1}
                    className="p-2 rounded-xl disabled:opacity-30" style={{ backgroundColor: W, border: `1px solid ${TEXT}25` }}>
                    <ChevronRight size={16} style={{ color: TEXT }} />
                  </button>
                </div>
              )}
            </>
          )}

          {selectedCourse && selectedBp && (
            <div className="rounded-3xl overflow-hidden border" style={{ borderColor: `${TEXT}25` }}>
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
                        style={{ backgroundColor: active ? GOLD : "rgba(255,255,255,0.1)", color: active ? TEXT : "rgba(255,255,255,0.6)" }}>
                        <span className="opacity-50 mr-1">{tab.num}</span>{tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeStage && (
                <div className="px-7 py-8" style={{ backgroundColor: W }}>
                  <p className="text-[13px] leading-relaxed max-w-xl mb-6 opacity-60" style={{ color: TEXT }}>{activeStage.tagline}</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <p className="text-[11px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: GOLD }}>
                        <span className="w-3 h-px inline-block" style={{ backgroundColor: GOLD }} />
                        Details
                      </p>
                      <div className="flex flex-col gap-3">
                        {activeStage.primary.map((item) => (
                          <div key={item.title} className="rounded-xl p-4" style={{ backgroundColor: CREAM }}>
                            <p className="text-[13px] font-semibold mb-1" style={{ color: TEXT }}>{item.title}</p>
                            <p className="text-[12px] leading-relaxed" style={{ color: TEXT, opacity: 0.6 }}>{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: `${TEXT}66` }}>Also includes</p>
                        <ul className="flex flex-col gap-2">
                          {activeStage.secondary.map((s) => (
                            <li key={s} className="flex items-start gap-2 text-[12px]" style={{ color: TEXT, opacity: 0.7 }}>
                              <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: GOLD }} />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <a href="/skills"
                        className="mt-2 w-full py-3 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-90 text-center block"
                        style={{ backgroundColor: DARK, color: W }}>
                        Apply for this program →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-12 px-6 text-center" style={{ backgroundColor: CREAM }}>
        <p className="text-sm mb-3 opacity-60" style={{ color: TEXT }}>Ready to enroll or have questions?</p>
        <a href="/skills"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: DARK, color: W }}>
          Go to Skills Home <ArrowRight size={15} />
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: DARK, color: `${BG}bb` }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-normal tracking-widest text-sm uppercase" style={{ color: BG }}>Hamzury Skills</span>
          <div className="flex items-center gap-6 text-xs flex-wrap justify-center sm:justify-end" style={{ color: `${BG}55` }}>
            <a href="/skills" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>← Skills Home</a>
            <a href="/skills/programs" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Programs</a>
            <a href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Privacy</a>
            <a href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: `${BG}55` }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
