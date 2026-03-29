import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";

/* ── Department training content ─────────────────────────────────────────── */

type Section = { title: string; items: string[] };

const DEPARTMENTS: Record<string, { label: string; color: string; sections: Section[] }> = {
  general: {
    label: "General",
    color: "#1A1A1A",
    sections: [
      {
        title: "Company Values & Culture",
        items: [
          "HAMZURY exists to handle everything your business owes the system — completely.",
          "Core values: Integrity, Excellence, Calm Confidence, Client Obsession.",
          "We operate with the precision of a system and the warmth of a partner.",
          "Every department is one body — BizDoc, Systemise, Skills work as a unified front.",
        ],
      },
      {
        title: "Communication Policy",
        items: [
          "All client communication must be professional, concise, and empathetic.",
          "Internal communication uses the HAMZURY workspace — no personal WhatsApp for work matters.",
          "Response time: Client queries within 2 hours during business hours (9am–6pm WAT, Mon–Fri).",
          "Escalation: If unresolved within 24 hours, escalate to your department lead.",
        ],
      },
      {
        title: "Security Awareness",
        items: [
          "Never share client credentials, documents, or personal data externally.",
          "All client passwords are stored encrypted — never in plain text, WhatsApp, or notes.",
          "Lock your workstation when stepping away. Use strong passwords (8+ characters).",
          "Report any suspected data breach to the Security Officer (Rabilu Musa) immediately.",
        ],
      },
      {
        title: "Working Hours & Attendance",
        items: [
          "Standard hours: Monday–Friday, 9:00 AM – 6:00 PM WAT.",
          "Check-in via the attendance system daily. Late arrivals are recorded.",
          "Leave requests must be submitted 48 hours in advance through the HR dashboard.",
          "Unapproved absence for 3 consecutive days is grounds for disciplinary action.",
        ],
      },
    ],
  },
  bizdoc: {
    label: "BizDoc Consult",
    color: "#1B4D3E",
    sections: [
      {
        title: "CAC Business Registration SOP",
        items: [
          "Step 1: Collect client details — business name (3 options), directors, share capital, registered address.",
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
          "NAFDAC processing: 8–12 weeks. SON: 4–6 weeks. DPR: 6–10 weeks.",
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
          "All client documents stored in the secure file system — never on personal devices.",
          "Physical documents: scanned, uploaded, and returned to client within 48 hours.",
          "Reference numbers (HAM-XXXX-YYYY) must be attached to every file and communication.",
          "Document retention: 7 years minimum as per Nigerian tax law requirements.",
        ],
      },
    ],
  },
  skills: {
    label: "HAMZURY Skills",
    color: "#1E3A5F",
    sections: [
      {
        title: "Curriculum Overview",
        items: [
          "Programs: Digital Marketing, Data Analysis, AI-Powered Business, Faceless Content, Business Development.",
          "Each cohort runs 8–12 weeks with weekly modules, assignments, and live sessions.",
          "Pathways: Physical (in-person Abuja), Online (remote), NITDA-sponsored, TVET-partnered.",
          "Capstone project required for certification — real business problem, mentor-reviewed.",
        ],
      },
      {
        title: "Facilitator Guidelines",
        items: [
          "Prepare module content 1 week before delivery. Submit to Skills Lead for review.",
          "Live sessions: 60–90 minutes. Record all sessions for student replay.",
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
    color: "#1A1A1A",
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
          "Verbal warning → Written warning → Suspension → Termination.",
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
    color: "#1A1A1A",
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
          "Video: 15–60 seconds for social. Subtitles required on all video content.",
          "Logo usage: Minimum clear space of 1x logo height on all sides.",
        ],
      },
      {
        title: "Posting Workflow",
        items: [
          "Draft → Internal review → Scheduling → Post → Engagement monitoring.",
          "Engagement window: Respond to all comments within 4 hours during business hours.",
          "Weekly social engagement log: All staff must engage with company content.",
          "Monthly report: Reach, engagement rate, follower growth, top-performing content.",
        ],
      },
      {
        title: "Podcast Production",
        items: [
          "Episode planning: Topic + guest confirmed 2 weeks before recording.",
          "Recording: Studio setup, sound check, 30–45 minute episodes.",
          "Post-production: Edit within 3 days. Publish within 1 week of recording.",
          "Distribution: Spotify, Apple Podcasts, YouTube, website embed.",
        ],
      },
    ],
  },
  systemise: {
    label: "Systemise",
    color: "#2563EB",
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
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFAF6" }}>
      <PageMeta
        title={`${dept.label} Training & Policies — HAMZURY`}
        description={`Standard operating procedures and training documents for ${dept.label} at HAMZURY.`}
        canonical={`https://hamzury.com/training/${activeDept}`}
      />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 bg-[#FFFAF6]/90 backdrop-blur-md border-b border-[#B48C4C]/20 z-50 flex justify-between items-center">
        <Link href="/" className="text-[13px] font-semibold flex items-center gap-1 hover:text-[#B48C4C] transition-colors" style={{ color: "#1A1A1A" }}>
          <ArrowLeft size={14} /> HAMZURY
        </Link>
        <span className="text-[13px] font-semibold uppercase tracking-wider opacity-40" style={{ color: "#1A1A1A" }}>
          Training &amp; Policies
        </span>
      </nav>

      {/* CONTENT */}
      <main className="pt-36 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <span className="text-[12px] font-bold tracking-[0.3em] uppercase mb-6 block" style={{ color: "#B48C4C" }}>
            Internal
          </span>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-4 leading-[1.1]" style={{ color: "#1A1A1A" }}>
            {dept.label}
          </h1>
          <p className="text-[14px] opacity-50 mb-12" style={{ color: "#1A1A1A" }}>
            Standard operating procedures, policies, and training materials.
          </p>

          {/* Department switcher */}
          <div className="flex flex-wrap gap-2 mb-16">
            {DEPT_KEYS.map(key => {
              const d = DEPARTMENTS[key];
              const isActive = key === activeDept;
              return (
                <Link key={key} href={`/training/${key}`}>
                  <button
                    className="text-[12px] font-medium px-4 py-2 rounded-full transition-all"
                    style={{
                      backgroundColor: isActive ? d.color : "transparent",
                      color: isActive ? "#FFFAF6" : "#1A1A1A",
                      border: `1px solid ${isActive ? d.color : "#1A1A1A20"}`,
                    }}
                  >
                    {d.label}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Accordion sections */}
          <div className="space-y-4">
            {dept.sections.map((section, idx) => {
              const isOpen = openSections.has(idx);
              return (
                <div
                  key={idx}
                  className="border rounded-xl overflow-hidden transition-all"
                  style={{ borderColor: "#1A1A1A10" }}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#1A1A1A05] transition-colors"
                  >
                    <span className="text-[15px] font-semibold" style={{ color: dept.color }}>
                      {section.title}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={18} style={{ color: "#1A1A1A", opacity: 0.4 }} />
                    ) : (
                      <ChevronRight size={18} style={{ color: "#1A1A1A", opacity: 0.4 }} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <ul className="space-y-3">
                        {section.items.map((item, i) => (
                          <li
                            key={i}
                            className="text-[14px] font-light leading-relaxed pl-4"
                            style={{
                              color: "#1A1A1A",
                              borderLeft: `2px solid ${dept.color}20`,
                            }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-8 px-6 md:px-12 border-t" style={{ borderColor: "#1A1A1A10" }}>
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] opacity-40" style={{ color: "#1A1A1A" }}>
          <span>&copy; {new Date().getFullYear()} HAMZURY. Internal use only.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
