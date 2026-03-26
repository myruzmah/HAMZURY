import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { leads, tasks, commissions, activityLogs } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return drizzle(url);
}

function randomRef(prefix = "HMZ", month = "26/3") {
  const n = Math.floor(1000 + Math.random() * 8999);
  return `${prefix}-${month}-${n}`;
}

// Fixed refs so we can reference them when creating commissions
const REFS = {
  oge:      "HMZ-26/3-9567",  // existing from demo-lead.ts
  emeka:    "HMZ-26/3-1042",
  fatima:   "HMZ-26/3-2891",
  ahmad:    "HMZ-26/3-3374",
  chidi:    "HMZ-26/3-4418",
  blessing: "HMZ-26/3-5503",
  techwave: "HMZ-26/3-6120",
  greenfield:"HMZ-26/3-7234",
  afrique:  "HMZ-26/3-8011",
  lagosl:   "HMZ-26/3-1567",
  naijafit: "HMZ-26/3-2348",
  adeola:   "HMZ-26/3-3902",
};

// ─── Leads ────────────────────────────────────────────────────────────────────

const DEMO_LEADS = [
  // BizDoc leads
  {
    ref: REFS.emeka,
    name: "Emeka Okafor",
    businessName: "OkaforTech Solutions",
    phone: "08033142205",
    email: "emeka@okafortech.ng",
    service: "CAMA Compliance & Annual Filing",
    context: "Company incorporated 3 years ago, has not filed annual returns. Needs urgent compliance. CAC penalty may apply.",
    source: "chat",
    status: "contacted" as const,
    assignedDepartment: "bizdoc",
  },
  {
    ref: REFS.fatima,
    name: "Fatima Hassan",
    businessName: "Hassan Agro Exports",
    phone: "08077654321",
    email: "fatima.hassan@agro.ng",
    service: "Business Name Registration",
    context: "Sole trader wants to register business name under CAC. Also needs TIN. Exporting groundnuts to EU.",
    source: "referral",
    status: "contacted" as const,
    assignedDepartment: "bizdoc",
  },
  {
    ref: REFS.ahmad,
    name: "Ahmad Al-Rashid",
    businessName: "Al-Rashid Trading LLC",
    phone: "08109988776",
    email: "ahmad@alrashidtrading.com",
    service: "Foreign Business Registration",
    context: "UAE-based company wants to open Nigeria office. Needs Section 54 CAMA registration, CERPAC for foreign director, and Business Permit from Ministry of Interior.",
    source: "walk-in",
    status: "new" as const,
    assignedDepartment: null,
  },
  {
    ref: REFS.chidi,
    name: "Chidi Obi",
    businessName: "Prime Medics Ltd",
    phone: "08061234567",
    email: "chidi.obi@primemedics.com",
    service: "Tax Registration & FIRS Compliance",
    context: "Medical equipment company. Needs TIN, VAT registration, and FIRS taxpayer ID. Has existing company registration.",
    source: "chat",
    status: "contacted" as const,
    assignedDepartment: "bizdoc",
  },
  {
    ref: REFS.blessing,
    name: "Blessing Adeyemi",
    businessName: "Blessing Couture",
    phone: "08023456789",
    email: "blessing@blessingcouture.ng",
    service: "Business Name Registration",
    context: "Fashion designer in Lagos. Starting small, wants official registration before Lagos Fashion Week.",
    source: "referral",
    status: "converted" as const,
    assignedDepartment: "bizdoc",
  },
  // Systemise leads
  {
    ref: REFS.techwave,
    name: "Kunle Adebisi",
    businessName: "TechWave Nigeria",
    phone: "08144332211",
    email: "kunle@techwaveng.com",
    service: "Business Process Automation",
    context: "Lagos fintech startup. Manual invoicing and client onboarding costing 40+ hours/month. Needs full workflow automation with Zapier + Notion + email sequences.",
    source: "bizdev",
    status: "contacted" as const,
    assignedDepartment: "systemise",
  },
  {
    ref: REFS.greenfield,
    name: "Mrs. Ngozi Ezeh",
    businessName: "Greenfield Foods & Logistics",
    phone: "08099887766",
    email: "ngozi@greenfieldfoods.ng",
    service: "SOP Documentation & Process Mapping",
    context: "F&B company scaling from 5 to 30 staff. No written SOPs. Need full operational manual, process maps, and staff handbook.",
    source: "chat",
    status: "new" as const,
    assignedDepartment: null,
  },
  {
    ref: REFS.afrique,
    name: "Seun Olatunji",
    businessName: "Afrique Digital Agency",
    phone: "08155661122",
    email: "seun@afriquedigital.co",
    service: "CRM Setup & Sales Pipeline Integration",
    context: "Digital agency with 200+ clients. Using WhatsApp + spreadsheets. Needs HubSpot/Notion CRM, client portal, and automated follow-up sequences.",
    source: "bizdev",
    status: "contacted" as const,
    assignedDepartment: "systemise",
  },
  // Media leads
  {
    ref: REFS.lagosl,
    name: "Tunde Williams",
    businessName: "Lagos Luxe Properties",
    phone: "08166778899",
    email: "tunde@lagosl.ng",
    service: "Brand Identity & Social Media Strategy",
    context: "Luxury real estate brand launching in Lekki. Needs brand identity (logo, palette, fonts), social media strategy for IG/Twitter, and 3-month content calendar.",
    source: "chat",
    status: "contacted" as const,
    assignedDepartment: "media",
  },
  {
    ref: REFS.naijafit,
    name: "Coach Amara",
    businessName: "NaijaFit",
    phone: "08177889900",
    email: "amara@naijafit.ng",
    service: "Social Media Management (Full Package)",
    context: "Fitness brand targeting Nigerian youth. 50k+ IG followers but low engagement. Needs full content management: 3 posts/day, reels, stories, influencer tie-in.",
    source: "referral",
    status: "converted" as const,
    assignedDepartment: "media",
  },
  {
    ref: REFS.adeola,
    name: "Adeola Bello",
    businessName: "Adeola Speaks Podcast",
    phone: "08188990011",
    email: "adeola@adeoLaspeaks.ng",
    service: "Podcast Production & Distribution",
    context: "Leadership coach with 10k YouTube subscribers. Launching weekly podcast. Needs audio production, show notes, thumbnail design, and Spotify/Apple distribution setup.",
    source: "chat",
    status: "new" as const,
    assignedDepartment: null,
  },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

const DEMO_TASKS = [
  // ── BizDoc tasks ──────────────────────────────────────────────────────────
  {
    ref: REFS.oge,
    clientName: "Oge Matilda",
    businessName: "Matilda Catering Services",
    phone: "08012345678",
    service: "CAC Business Name Registration",
    status: "Completed" as const,
    department: "bizdoc",
    notes: "All documents verified. CAC registration successful. Certificate issued 2026-03-24. Client notified via WhatsApp.",
    quotedPrice: "45000.00",
    deadline: "2026-03-25",
    kpiApproved: true,
    isRework: false,
  },
  {
    ref: REFS.emeka,
    clientName: "Emeka Okafor",
    businessName: "OkaforTech Solutions",
    phone: "08033142205",
    service: "CAMA Compliance & Annual Filing",
    status: "In Progress" as const,
    department: "bizdoc",
    notes: "Collected CAC cert copy, Memart, and prior year accounts. Preparing Annual Returns Form CAC 10. Awaiting audited FS from client accountant.",
    quotedPrice: "85000.00",
    deadline: "2026-04-05",
    kpiApproved: false,
    isRework: false,
  },
  {
    ref: REFS.fatima,
    clientName: "Fatima Hassan",
    businessName: "Hassan Agro Exports",
    phone: "08077654321",
    service: "Business Name Registration",
    status: "Waiting on Client" as const,
    department: "bizdoc",
    notes: "Pre-search done — name available. Sent client CAC BN1 form and utility bill requirements on 2026-03-22. Awaiting client's NIN and utility bill.",
    quotedPrice: "35000.00",
    deadline: "2026-04-10",
    kpiApproved: false,
    isRework: false,
  },
  {
    ref: REFS.chidi,
    clientName: "Chidi Obi",
    businessName: "Prime Medics Ltd",
    phone: "08061234567",
    service: "Tax Registration & FIRS Compliance",
    status: "Submitted" as const,
    department: "bizdoc",
    notes: "TIN obtained from FIRS e-portal. VAT registration submitted online. FIRS Taxpayer ID card being processed. Submitted work package to CSO for review.",
    quotedPrice: "60000.00",
    deadline: "2026-03-30",
    kpiApproved: false,
    isRework: false,
  },
  {
    ref: REFS.blessing,
    clientName: "Blessing Adeyemi",
    businessName: "Blessing Couture",
    phone: "08023456789",
    service: "Business Name Registration",
    status: "Completed" as const,
    department: "bizdoc",
    notes: "Business name registered successfully. Certified True Copy collected. Delivered to client via courier. Fashion Week preparation confirmed.",
    quotedPrice: "35000.00",
    deadline: "2026-03-20",
    kpiApproved: true,
    isRework: false,
  },
  // ── Systemise tasks ───────────────────────────────────────────────────────
  {
    ref: REFS.techwave,
    clientName: "Kunle Adebisi",
    businessName: "TechWave Nigeria",
    phone: "08144332211",
    service: "Business Process Automation",
    status: "In Progress" as const,
    department: "systemise",
    notes: "Phase 1 done: mapped current invoice flow (12 manual steps → 4 automated). Building Zapier flows: Invoice trigger → Notion → email → WhatsApp confirmation. Scheduled demo for 2026-04-01.",
    quotedPrice: "250000.00",
    deadline: "2026-04-15",
    kpiApproved: false,
    isRework: false,
  },
  {
    ref: REFS.greenfield,
    clientName: "Mrs. Ngozi Ezeh",
    businessName: "Greenfield Foods & Logistics",
    phone: "08099887766",
    service: "SOP Documentation & Process Mapping",
    status: "Not Started" as const,
    department: "systemise",
    notes: "Discovery call booked for 2026-03-28. Client to provide current org chart, job descriptions, and sample daily ops reports before call.",
    quotedPrice: "180000.00",
    deadline: "2026-04-30",
    kpiApproved: false,
    isRework: false,
  },
  {
    ref: REFS.afrique,
    clientName: "Seun Olatunji",
    businessName: "Afrique Digital Agency",
    phone: "08155661122",
    service: "CRM Setup & Sales Pipeline Integration",
    status: "In Progress" as const,
    department: "systemise",
    notes: "HubSpot workspace created. Migrated 180 contacts from CSV. Building custom pipeline stages: Lead → Discovery → Proposal → Contract → Onboarding → Active → Retained. Client reviewing pipeline naming.",
    quotedPrice: "320000.00",
    deadline: "2026-04-20",
    kpiApproved: false,
    isRework: true,
  },
  // ── Media tasks ───────────────────────────────────────────────────────────
  {
    ref: REFS.lagosl,
    clientName: "Tunde Williams",
    businessName: "Lagos Luxe Properties",
    phone: "08166778899",
    service: "Brand Identity & Social Media Strategy",
    status: "In Progress" as const,
    department: "media",
    notes: "Logo concepts: 3 options presented. Client selected option 2 (gold lettermark on deep charcoal). Working on colour palette extension + brand guidelines doc. Content calendar drafted to April.",
    quotedPrice: "280000.00",
    deadline: "2026-04-10",
    kpiApproved: false,
    isRework: false,
  },
  {
    ref: REFS.naijafit,
    clientName: "Coach Amara",
    businessName: "NaijaFit",
    phone: "08177889900",
    service: "Social Media Management (Full Package)",
    status: "Completed" as const,
    department: "media",
    notes: "Month 1 report: Engagement up 340% (avg 1.2k likes/post). Follower growth +4,200. 3 reels broke 50k views. Influencer collab with @fitnessnaija confirmed. Month 2 calendar ready.",
    quotedPrice: "150000.00",
    deadline: "2026-03-31",
    kpiApproved: true,
    isRework: false,
  },
  {
    ref: REFS.adeola,
    clientName: "Adeola Bello",
    businessName: "Adeola Speaks Podcast",
    phone: "08188990011",
    service: "Podcast Production & Distribution",
    status: "Not Started" as const,
    department: "media",
    notes: "Intake call confirmed 2026-03-29. Client to send 3 sample episode ideas + target audience brief. Will propose recording schedule and artwork brief in first meeting.",
    quotedPrice: "120000.00",
    deadline: "2026-04-25",
    kpiApproved: false,
    isRework: false,
  },
];

// ─── Commissions ─────────────────────────────────────────────────────────────

const DEMO_COMMISSIONS = [
  {
    taskRef: REFS.oge,
    clientName: "Oge Matilda",
    service: "CAC Business Name Registration",
    quotedPrice: "45000.00",
    institutionalAmount: "18000.00",  // 40%
    commissionPool: "27000.00",       // 60%
    tierBreakdown: { founder: 2700, ceo: 2025, cso: 2700, closer: 6750, department: 12825 },
    status: "paid" as const,
  },
  {
    taskRef: REFS.blessing,
    clientName: "Blessing Adeyemi",
    service: "Business Name Registration",
    quotedPrice: "35000.00",
    institutionalAmount: "14000.00",
    commissionPool: "21000.00",
    tierBreakdown: { founder: 2100, ceo: 1575, cso: 2100, closer: 5250, department: 9975 },
    status: "approved" as const,
  },
  {
    taskRef: REFS.naijafit,
    clientName: "Coach Amara / NaijaFit",
    service: "Social Media Management",
    quotedPrice: "150000.00",
    institutionalAmount: "60000.00",
    commissionPool: "90000.00",
    tierBreakdown: { founder: 9000, ceo: 6750, cso: 9000, closer: 22500, department: 42750 },
    status: "pending" as const,
  },
  {
    taskRef: REFS.chidi,
    clientName: "Chidi Obi / Prime Medics",
    service: "Tax Registration & FIRS Compliance",
    quotedPrice: "60000.00",
    institutionalAmount: "24000.00",
    commissionPool: "36000.00",
    tierBreakdown: { founder: 3600, ceo: 2700, cso: 3600, closer: 9000, department: 17100 },
    status: "pending" as const,
  },
];

// ─── Activity Logs ────────────────────────────────────────────────────────────

function buildActivityLogs(taskIdMap: Record<string, number>) {
  const logs = [];
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() - n * 86400000);

  if (taskIdMap[REFS.oge]) {
    logs.push(
      { taskId: taskIdMap[REFS.oge], action: "task_created", details: "Task created from chat lead: Oge Matilda — CAC Business Name Registration", createdAt: days(9) },
      { taskId: taskIdMap[REFS.oge], action: "status_changed", details: "Status: Not Started → In Progress", createdAt: days(7) },
      { taskId: taskIdMap[REFS.oge], action: "note_added", details: "Client documents collected: utility bill, NIN slip, passport photo", createdAt: days(5) },
      { taskId: taskIdMap[REFS.oge], action: "status_changed", details: "Status: In Progress → Completed. CAC certificate obtained and delivered.", createdAt: days(2) },
      { taskId: taskIdMap[REFS.oge], action: "kpi_approved", details: "Manager approved. Smooth task recorded. +1 KPI for Abdullahi Musa", createdAt: days(1) },
    );
  }
  if (taskIdMap[REFS.emeka]) {
    logs.push(
      { taskId: taskIdMap[REFS.emeka], action: "task_created", details: "Task created: Emeka Okafor — CAMA Compliance & Annual Filing", createdAt: days(5) },
      { taskId: taskIdMap[REFS.emeka], action: "status_changed", details: "Status: Not Started → In Progress", createdAt: days(4) },
      { taskId: taskIdMap[REFS.emeka], action: "note_added", details: "Collected CAC cert, Memart. Awaiting audited accounts from client's accountant.", createdAt: days(2) },
    );
  }
  if (taskIdMap[REFS.chidi]) {
    logs.push(
      { taskId: taskIdMap[REFS.chidi], action: "task_created", details: "Task created: Chidi Obi — Tax Registration & FIRS Compliance", createdAt: days(6) },
      { taskId: taskIdMap[REFS.chidi], action: "status_changed", details: "Status: Not Started → In Progress", createdAt: days(5) },
      { taskId: taskIdMap[REFS.chidi], action: "status_changed", details: "Status: In Progress → Submitted. Work package sent to CSO for review.", createdAt: days(1) },
    );
  }
  if (taskIdMap[REFS.afrique]) {
    logs.push(
      { taskId: taskIdMap[REFS.afrique], action: "task_created", details: "Task created: Seun Olatunji — CRM Setup & Sales Pipeline Integration", createdAt: days(8) },
      { taskId: taskIdMap[REFS.afrique], action: "status_changed", details: "Status: Not Started → In Progress", createdAt: days(6) },
      { taskId: taskIdMap[REFS.afrique], action: "rework_flagged", details: "CSO flagged for rework: pipeline stage naming needs to match client's existing terminology", createdAt: days(3) },
      { taskId: taskIdMap[REFS.afrique], action: "status_changed", details: "Status: Submitted → In Progress (Rework). Revising pipeline stage labels.", createdAt: days(3) },
    );
  }
  if (taskIdMap[REFS.naijafit]) {
    logs.push(
      { taskId: taskIdMap[REFS.naijafit], action: "task_created", details: "Task created: Coach Amara — Social Media Management Full Package", createdAt: days(35) },
      { taskId: taskIdMap[REFS.naijafit], action: "status_changed", details: "Status: Not Started → In Progress", createdAt: days(33) },
      { taskId: taskIdMap[REFS.naijafit], action: "note_added", details: "Month 1 complete. Engagement report submitted. +340% engagement growth.", createdAt: days(3) },
      { taskId: taskIdMap[REFS.naijafit], action: "status_changed", details: "Status: In Progress → Completed", createdAt: days(2) },
      { taskId: taskIdMap[REFS.naijafit], action: "kpi_approved", details: "Manager approved. Smooth task. +1 KPI for Media team (Hikma)", createdAt: days(1) },
    );
  }

  return logs;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const db = getDb();
  console.log("\n🌱  HAMZURY Demo Data Seed\n");

  // ── 1. Skip Oge Matilda lead — already exists from demo-lead.ts
  //        But we need to upsert the task for her with full details
  console.log("📋  Checking existing data...");
  const existingLeads = await db.select({ ref: leads.ref }).from(leads);
  const existingRefs = new Set(existingLeads.map(l => l.ref));

  const existingTasks = await db.select({ ref: tasks.ref, id: tasks.id }).from(tasks);
  const existingTaskRefs = new Set(existingTasks.map(t => t.ref));
  const taskIdMap: Record<string, number> = {};
  for (const t of existingTasks) taskIdMap[t.ref] = t.id;

  // ── 2. Insert leads ───────────────────────────────────────────────────────
  console.log("📝  Inserting demo leads...");
  for (const lead of DEMO_LEADS) {
    if (existingRefs.has(lead.ref)) {
      console.log(`   SKIP lead ${lead.ref} (${lead.name}) — already exists`);
      continue;
    }
    await db.insert(leads).values({
      ref: lead.ref,
      name: lead.name,
      businessName: lead.businessName,
      phone: lead.phone,
      email: lead.email,
      service: lead.service,
      context: lead.context,
      source: lead.source as "chat" | "referral" | "walk-in" | "bizdev",
      status: lead.status,
      assignedDepartment: lead.assignedDepartment,
      assignedAt: lead.assignedDepartment ? new Date() : undefined,
    });
    console.log(`   ✅ Lead ${lead.ref} — ${lead.name} (${lead.service})`);
  }

  // ── 3. Insert / update tasks ──────────────────────────────────────────────
  console.log("\n🔧  Inserting demo tasks...");

  // Patch Oge Matilda's task if it exists (update with full details)
  if (existingTaskRefs.has(REFS.oge)) {
    const ogeTask = existingTasks.find(t => t.ref === REFS.oge);
    if (ogeTask) {
      await db.update(tasks).set({
        status: "Completed",
        notes: "All documents verified. CAC registration successful. Certificate issued 2026-03-24. Client notified via WhatsApp.",
        quotedPrice: "45000.00",
        deadline: "2026-03-25",
        kpiApproved: true,
        isRework: false,
        completedAt: new Date("2026-03-24T14:30:00"),
        department: "bizdoc",
      }).where(eq(tasks.id, ogeTask.id));
      console.log(`   ✅ Updated existing task ${REFS.oge} (Oge Matilda)`);
    }
  }

  for (const task of DEMO_TASKS) {
    if (task.ref === REFS.oge) continue; // handled above

    if (existingTaskRefs.has(task.ref)) {
      console.log(`   SKIP task ${task.ref} — already exists`);
      continue;
    }

    // Find the lead id for this task
    const leadRow = await db.select({ id: leads.id }).from(leads).where(eq(leads.ref, task.ref)).limit(1);
    const leadId = leadRow[0]?.id ?? undefined;

    const result = await db.insert(tasks).values({
      ref: task.ref,
      leadId,
      clientName: task.clientName,
      businessName: task.businessName,
      phone: task.phone,
      service: task.service,
      status: task.status,
      department: task.department,
      notes: task.notes,
      quotedPrice: task.quotedPrice,
      deadline: task.deadline,
      kpiApproved: task.kpiApproved,
      isRework: task.isRework,
      completedAt: task.status === "Completed" ? new Date() : undefined,
    });
    const insertId = result[0].insertId;
    taskIdMap[task.ref] = insertId;
    console.log(`   ✅ Task ${task.ref} — ${task.clientName} [${task.status}] dept:${task.department}`);
  }

  // ── 4. Insert commissions ─────────────────────────────────────────────────
  console.log("\n💰  Inserting demo commissions...");
  const existingCommissions = await db.select({ taskRef: commissions.taskRef }).from(commissions);
  const existingCommRefs = new Set(existingCommissions.map(c => c.taskRef));

  for (const comm of DEMO_COMMISSIONS) {
    if (existingCommRefs.has(comm.taskRef)) {
      console.log(`   SKIP commission ${comm.taskRef} — already exists`);
      continue;
    }
    const taskRow = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.ref, comm.taskRef)).limit(1);
    if (!taskRow[0]) {
      console.log(`   SKIP commission ${comm.taskRef} — task not found`);
      continue;
    }
    await db.insert(commissions).values({
      taskId: taskRow[0].id,
      taskRef: comm.taskRef,
      clientName: comm.clientName,
      service: comm.service,
      quotedPrice: comm.quotedPrice,
      institutionalAmount: comm.institutionalAmount,
      commissionPool: comm.commissionPool,
      tierBreakdown: comm.tierBreakdown,
      status: comm.status,
      approvedAt: comm.status === "approved" || comm.status === "paid" ? new Date() : undefined,
      paidAt: comm.status === "paid" ? new Date() : undefined,
    });
    console.log(`   ✅ Commission ${comm.taskRef} — ₦${comm.quotedPrice} [${comm.status}]`);
  }

  // ── 5. Insert activity logs ───────────────────────────────────────────────
  console.log("\n📊  Inserting activity logs...");
  const logsToInsert = buildActivityLogs(taskIdMap);
  for (const log of logsToInsert) {
    try {
      await db.insert(activityLogs).values({
        taskId: log.taskId,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      });
    } catch (_e) {
      // activity logs may fail on duplication — that's fine
    }
  }
  console.log(`   ✅ ${logsToInsert.length} activity log entries inserted`);

  console.log("\n✨  Demo seed complete!\n");
  console.log("─────────────────────────────────────────────────────────────");
  console.log("Dashboard quick-check:");
  console.log("  CSO Dashboard    → should show 11 leads, 3 pending review");
  console.log("  BizDoc Dashboard → 5 tasks (In Progress, Waiting, Submitted, 2× Completed)");
  console.log("  Systemise/CTO    → 3 tasks (2× In Progress, 1 Not Started)");
  console.log("  Media Dashboard  → 3 tasks (In Progress, Completed, Not Started)");
  console.log("  Finance          → 4 commissions (1 paid, 1 approved, 2 pending)");
  console.log("─────────────────────────────────────────────────────────────\n");
}

async function main() {
  try {
    await seed();
    process.exit(0);
  } catch (err) {
    console.error("\n❌  Seed failed:", err);
    process.exit(1);
  }
}

main();
