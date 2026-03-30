import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ChevronDown } from "lucide-react";
import PageMeta from "@/components/PageMeta";

const MILK     = "#FFFAF6";
const CHARCOAL = "#1A1A1A";
const GOLD     = "#B48C4C";
const WHITE    = "#FFFFFF";

/* ── Department training content ─────────────────────────────────────────── */

type Section = { title: string; items: string[] };

const DEPARTMENTS: Record<string, { label: string; sections: Section[] }> = {
  general: {
    label: "General",
    sections: [
      {
        title: "Company Values & Culture",
        items: [
          "HAMZURY exists to handle everything your business owes the system \u2014 completely.",
          "Core values: Integrity, Excellence, Calm Confidence, Client Obsession.",
          "We operate with the precision of a system and the warmth of a partner.",
          "Every department is one body \u2014 BizDoc, Systemise, Skills work as a unified front.",
        ],
      },
      {
        title: "Communication Policy",
        items: [
          "All client communication must be professional, concise, and empathetic.",
          "Internal communication uses the HAMZURY workspace \u2014 no personal WhatsApp for work matters.",
          "Response time: Client queries within 2 hours during business hours (9am\u20136pm WAT, Mon\u2013Fri).",
          "Escalation: If unresolved within 24 hours, escalate to your department lead.",
        ],
      },
      {
        title: "Security Awareness",
        items: [
          "Never share client credentials, documents, or personal data externally.",
          "All client passwords are stored encrypted \u2014 never in plain text, WhatsApp, or notes.",
          "Lock your workstation when stepping away. Use strong passwords (8+ characters).",
          "Report any suspected data breach to the Security Officer (Rabilu Musa) immediately.",
        ],
      },
      {
        title: "Working Hours & Attendance",
        items: [
          "Standard hours: Monday\u2013Friday, 9:00 AM \u2013 6:00 PM WAT.",
          "Check-in via the attendance system daily. Late arrivals are recorded.",
          "Leave requests must be submitted 48 hours in advance through the HR dashboard.",
          "Unapproved absence for 3 consecutive days is grounds for disciplinary action.",
        ],
      },
    ],
  },
  bizdoc: {
    label: "BizDoc Consult",
    sections: [
      {
        title: "CAC Business Registration SOP",
        items: [
          "Step 1: Collect client details \u2014 business name (3 options), directors, share capital, registered address.",
          "Step 2: Run name availability check on CAC portal. Reserve approved name.",
          "Step 3: Prepare Memart (Articles of Association) and upload incorporation documents.",
          "Step 4: Pay statutory fees. Track status daily. Deliver certificate + documents to client.",
        ],
      },
      {
        title: "Industry Licenses (NAFDAC, SON, DPR)",
        items: [
          "Determine applicable license based on client's industry and product category.",
          "Compile required documents: product formulation, facility inspection readiness, lab test results.",
          "Submit application through the relevant portal. Follow up bi-weekly.",
          "NAFDAC processing: 8\u201312 weeks. SON: 4\u20136 weeks. DPR: 6\u201310 weeks.",
        ],
      },
      {
        title: "Tax Compliance (VAT, PAYE, TCC)",
        items: [
          "Register client on FIRS TaxPro Max portal. Obtain TIN if not available.",
          "File monthly VAT returns by the 21st of each month.",
          "PAYE: Calculate employee deductions, file with relevant state IRS.",
          "TCC applications: Compile 3 years of tax returns + evidence of payment.",
        ],
      },
      {
        title: "Document Handling & Confidentiality",
        items: [
          "All client documents stored in the secure file system \u2014 never on personal devices.",
          "Physical documents: scanned, uploaded, and returned to client within 48 hours.",
          "Reference numbers (HMZ-26/3-XXXX) must be attached to every file and communication.",
          "Document retention: 7 years minimum as per Nigerian tax law requirements.",
        ],
      },
    ],
  },
  skills: {
    label: "HAMZURY Skills",
    sections: [
      {
        title: "Curriculum Overview",
        items: [
          "Programs: Digital Marketing, Data Analysis, AI-Powered Business, Faceless Content, Business Development.",
          "Each cohort runs 8\u201312 weeks with weekly modules, assignments, and live sessions.",
          "Pathways: Physical (in-person Abuja), Online (remote), NITDA-sponsored, TVET-partnered.",
          "Capstone project required for certification \u2014 real business problem, mentor-reviewed.",
        ],
      },
      {
        title: "Facilitator Guidelines",
        items: [
          "Prepare module content 1 week before delivery. Submit to Skills Lead for review.",
          "Live sessions: 60\u201390 minutes. Record all sessions for student replay.",
          "Office hours: minimum 2 hours per week for student Q&A.",
          "Grading rubric: Assignments (40%), Participation (20%), Capstone (40%).",
        ],
      },
      {
        title: "Grading & Certification",
        items: [
          "Pass threshold: 60% overall. Distinction: 85%+.",
          "Late assignment penalty: -5% per day, max 3 days. After that: zero.",
          "Certificates issued within 2 weeks of cohort completion.",
          "Certificate numbers are unique and verifiable on the HAMZURY website.",
        ],
      },
      {
        title: "RIDI Scholarship",
        items: [
          "RIDI (Rural & Indigenous Digital Inclusion) provides subsidized training.",
          "Eligibility: Applicants from underserved communities, rural areas, or indigenous groups.",
          "Selection criteria: Motivation, business idea viability, community impact potential.",
          "RIDI scholars follow the same curriculum with additional mentorship support.",
        ],
      },
    ],
  },
  hr: {
    label: "Human Resources",
    sections: [
      {
        title: "Leave Policy",
        items: [
          "Annual leave: 15 working days per year (prorated for new hires).",
          "Sick leave: 10 days with medical certificate. Emergency: 3 days without certificate.",
          "Maternity: 12 weeks paid. Paternity: 2 weeks paid.",
          "All leave requests require a replacement nominee approved by department lead.",
        ],
      },
      {
        title: "Discipline Framework",
        items: [
          "Verbal warning \u2192 Written warning \u2192 Suspension \u2192 Termination.",
          "Gross misconduct (theft, fraud, data breach): immediate suspension pending investigation.",
          "All disciplinary actions documented in the HR system with timestamps.",
          "Appeals: Submit within 5 working days to CEO. Decision is final.",
        ],
      },
      {
        title: "KPI Framework",
        items: [
          "Monthly KPIs set by department leads, reviewed weekly.",
          "Metrics: Tasks completed, client satisfaction, response time, revenue contribution.",
          "Top performer each month: Staff of the Week recognition + bonus consideration.",
          "KPI scores factor into quarterly reviews and promotion decisions.",
        ],
      },
      {
        title: "IT Student Intake",
        items: [
          "IT students enter under HR. Orientation: 1 week (company values, tools, security).",
          "Post-orientation: assigned to a department (Systemise, Skills, BizDoc, or Media).",
          "Supervision: Department lead + HR check-in weekly for first month.",
          "Evaluation at 3 months: conversion to staff or program completion.",
        ],
      },
    ],
  },
  media: {
    label: "Media",
    sections: [
      {
        title: "Content Calendar Process",
        items: [
          "Monthly content calendar drafted by 25th of preceding month.",
          "Platforms: Instagram, TikTok, LinkedIn, X (Twitter), Facebook.",
          "Content mix: 40% educational, 30% promotional, 20% engagement, 10% behind-the-scenes.",
          "All content reviewed by department lead before scheduling.",
        ],
      },
      {
        title: "Brand Guidelines",
        items: [
          "Primary font: Inter. Tone: Calm, confident, premium. Never casual or overly corporate.",
          "Photography: Clean backgrounds, natural lighting, professional attire.",
          "Video: 15\u201360 seconds for social. Subtitles required on all video content.",
          "Logo usage: Minimum clear space of 1x logo height on all sides.",
        ],
      },
      {
        title: "Posting Workflow",
        items: [
          "Draft \u2192 Internal review \u2192 Scheduling \u2192 Post \u2192 Engagement monitoring.",
          "Engagement window: Respond to all comments within 4 hours during business hours.",
          "Weekly social engagement log: All staff must engage with company content.",
          "Monthly report: Reach, engagement rate, follower growth, top-performing content.",
        ],
      },
      {
        title: "Podcast Production",
        items: [
          "Episode planning: Topic + guest confirmed 2 weeks before recording.",
          "Recording: Studio setup, sound check, 30\u201345 minute episodes.",
          "Post-production: Edit within 3 days. Publish within 1 week of recording.",
          "Distribution: Spotify, Apple Podcasts, YouTube, website embed.",
        ],
      },
    ],
  },
  systemise: {
    label: "Systemise",
    sections: [
      {
        title: "Tech Stack Documentation",
        items: [
          "Frontend: React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, Wouter routing.",
          "Backend: Express.js, tRPC (type-safe RPC), Drizzle ORM, MySQL.",
          "Hosting: Railway (production), Vite dev server (development, port 5173).",
          "AI: Qwen Plus (primary, DashScope API), Anthropic Claude (fallback).",
        ],
      },
      {
        title: "Deployment Checklist",
        items: [
          "Run TypeScript check: pnpm check. Fix all errors before deploying.",
          "Build: pnpm run build. Verify dist/ output is complete.",
          "Push to GitHub: myruzmah/bizdoc_consult. Railway auto-deploys from main.",
          "Post-deploy: Verify database migrations ran. Check /api/health. Test login flow.",
        ],
      },
      {
        title: "Code Review Process",
        items: [
          "All changes reviewed by at least one other developer before merge.",
          "Check: No hardcoded secrets, no console.log in production, proper error handling.",
          "Performance: No unnecessary re-renders, efficient database queries, proper indexing.",
          "Security: Input validation on all endpoints, rate limiting on public routes, RBAC enforced.",
        ],
      },
      {
        title: "Client System Setup SOP",
        items: [
          "Brand identity: Logo, color palette, typography, brand guide document.",
          "Website: Domain setup, hosting, SSL, responsive design, SEO basics.",
          "CRM/Automation: Email sequences, lead capture forms, follow-up workflows.",
          "Handoff: Training session with client, documentation, 30-day support window.",
        ],
      },
    ],
  },
};

const DEPT_KEYS = Object.keys(DEPARTMENTS);

/* ── Component ───────────────────────────────────────────────────────────── */

export default function TrainingPage() {
  const params = useParams<{ dept?: string }>();
  const activeDept = params.dept && DEPARTMENTS[params.dept] ? params.dept : "general";
  const dept = DEPARTMENTS[activeDept];
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const toggle = (idx: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: MILK }}>
      <PageMeta
        title={`${dept.label} Training & Policies \u2014 HAMZURY`}
        description={`Standard operating procedures and training documents for ${dept.label} at HAMZURY.`}
        canonical={`https://hamzury.com/training/${activeDept}`}
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14"
        style={{ backgroundColor: `${MILK}F0`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Link href="/" className="flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-50" style={{ color: CHARCOAL }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[11px] font-normal tracking-[0.2em] uppercase" style={{ color: `${CHARCOAL}40` }}>
          Training & Policies
        </span>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-28 md:pt-40 md:pb-36 px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1
            className="text-[clamp(28px,4vw,42px)] font-light tracking-tight leading-[1.1] mb-3"
            style={{ color: CHARCOAL }}
          >
            {dept.label}
          </h1>
          <p className="text-[13px] mb-14" style={{ color: `${CHARCOAL}40` }}>
            Standard operating procedures, policies, and training materials.
          </p>

          {/* Department switcher */}
          <div className="flex flex-wrap gap-2 mb-16">
            {DEPT_KEYS.map((key) => {
              const d = DEPARTMENTS[key];
              const isActive = key === activeDept;
              return (
                <Link key={key} href={`/training/${key}`}>
                  <button
                    className="text-[12px] font-medium px-5 py-2 rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? CHARCOAL : "transparent",
                      color: isActive ? MILK : `${CHARCOAL}50`,
                    }}
                  >
                    {d.label}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Accordion sections */}
          <div className="space-y-1">
            {dept.sections.map((section, idx) => {
              const isOpen = openSections.has(idx);
              return (
                <div
                  key={idx}
                  className="rounded-[16px] overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: isOpen ? WHITE : "transparent",
                    boxShadow: isOpen ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-200"
                  >
                    <span className="text-[15px] font-semibold" style={{ color: CHARCOAL }}>
                      {section.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className="shrink-0 transition-transform duration-300"
                      style={{
                        color: `${CHARCOAL}30`,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isOpen ? 400 : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="px-6 pb-6">
                      <ul className="space-y-3">
                        {section.items.map((item, i) => (
                          <li
                            key={i}
                            className="text-[14px] font-light leading-[1.8] pl-4"
                            style={{
                              color: `${CHARCOAL}70`,
                              borderLeft: `2px solid ${GOLD}30`,
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 md:px-12">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[12px]" style={{ color: `${CHARCOAL}40` }}>
          <span>&copy; {new Date().getFullYear()} HAMZURY. Internal use only.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-opacity hover:opacity-70">Privacy</Link>
            <Link href="/terms" className="transition-opacity hover:opacity-70">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
