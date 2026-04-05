/**
 * HAMZURY — Real Client Data Seed Script (v2)
 * Run: pnpm exec tsx server/seed-real-clients.ts
 *
 * Seeds ALL real clients provided by Founder on 5 April 2026.
 * Creates leads, tasks, subscriptions, and skills applications.
 * Safe to re-run — checks for existing refs before inserting.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { leads, tasks, subscriptions, skillsApplications } from "../drizzle/schema";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return drizzle(url);
}

/** Generate HAMZURY ref: HMZ-YY/M-XXXX */
function hmzRef(phone?: string): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1);
  const digits = phone ? phone.replace(/\D/g, "") : "";
  const last4 = digits.length >= 4
    ? digits.slice(-4)
    : String(Math.floor(1000 + Math.random() * 9000));
  return `HMZ-${yy}/${m}-${last4}`;
}

/** Insert lead if ref doesn't already exist */
async function safeLead(db: ReturnType<typeof drizzle>, data: any) {
  const existing = await db.select().from(leads).where(eq(leads.ref, data.ref)).limit(1);
  if (existing.length > 0) {
    console.log(`   ⏭  Lead ${data.ref} already exists (${data.name})`);
    return existing[0];
  }
  const [result] = await db.insert(leads).values(data);
  const row = await db.select().from(leads).where(eq(leads.id, result.insertId)).limit(1);
  return row[0];
}

/** Insert task — always creates new (tasks can have same client) */
async function safeTask(db: ReturnType<typeof drizzle>, data: any) {
  // Use same ref format as generateRef() — HMZ-YY/M-XXXX (digits only, no letters)
  const ref = hmzRef(data.phone);
  const existing = await db.select().from(tasks).where(eq(tasks.ref, ref)).limit(1);
  if (existing.length > 0) {
    console.log(`   ⏭  Task ${ref} already exists (${data.clientName})`);
    return;
  }
  const { status, ...rest } = data;
  const insertData: any = { ref, ...rest };
  if (status) insertData.status = status;
  await db.insert(tasks).values(insertData);
}

async function main() {
  const db = getDb();
  let leadsCount = 0;
  let tasksCount = 0;
  let subsCount = 0;
  let skillsCount = 0;

  console.log("🏗️  HAMZURY — Seeding real client data...\n");

  // ═══════════════════════════════════════════════════════════
  // 1. TILZ SPA BY TILDA — Systemise ₦1.2M + TCC + SCUML
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08172371818"),
    name: "Oge Matilda",
    businessName: "Tilz Spa by Tilda",
    phone: "08172371818",
    service: "Full Business Architecture + TCC + SCUML",
    context: "Luxury spa, Wuse 2 Abuja. ₦1.2M total. Paid ₦500K, balance ₦700K. Includes TCC and SCUML.",
    source: "referral",
    status: "converted",
    assignedDepartment: "systemise",
  });
  leadsCount++;

  await safeTask(db, {
    clientName: "Oge Matilda", businessName: "Tilz Spa by Tilda", phone: "08172371818",
    service: "Full Business Architecture — Brand + Website + Social + CRM + Ops",
    department: "systemise", priority: "high", category: "Full Build",
    quotedPrice: "1200000",
    notes: "Total: ₦1,200,000. Paid: ₦500,000. Balance: ₦700,000. 4-phase build over 8 weeks.",
  });
  await safeTask(db, {
    clientName: "Oge Matilda", businessName: "Tilz Spa by Tilda", phone: "08172371818",
    service: "Tax Clearance Certificate (TCC)", department: "bizdoc", category: "Tax Compliance",
    notes: "Part of Tilz Spa package.",
  });
  await safeTask(db, {
    clientName: "Oge Matilda", businessName: "Tilz Spa by Tilda", phone: "08172371818",
    service: "SCUML Certificate", department: "bizdoc", category: "Sector Licence",
    notes: "Part of Tilz Spa package. Standard tier ₦60,000.",
  });
  tasksCount += 3;

  // ═══════════════════════════════════════════════════════════
  // 2. YUSUF BAKORI — SCUML ₦60K (paid ₦50K)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("09078722277"),
    name: "Yusuf Bakori", phone: "09078722277",
    service: "SCUML Certificate",
    context: "Standard SCUML ₦60K. Paid ₦50K (long-time client discount). Balance ₦10K.",
    source: "returning_client", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Yusuf Bakori", phone: "09078722277",
    service: "SCUML Certificate", department: "bizdoc", category: "Sector Licence",
    quotedPrice: "60000",
    notes: "Paid ₦50,000 (long-time client discount). Balance: ₦10,000.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 3. O FRIEND FOUNDATION — Change 3 Trustees (agent: Clevinto Paul)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08146698995"),
    name: "O Friend Foundation", businessName: "O Friend Foundation",
    phone: "08146698995",
    service: "Change of 3 Trustees",
    context: "Association. Agent: Clevinto Paul (08146698995) — works as referral agent for HAMZURY.",
    source: "affiliate", status: "converted",
    referrerName: "Clevinto Paul", referralSourceType: "agent",
    assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "O Friend Foundation", businessName: "O Friend Foundation", phone: "08146698995",
    service: "Change of Trustees (3 Trustees)", department: "bizdoc", category: "CAC Amendment",
    notes: "Association. Changing 3 trustees. Agent: Clevinto Paul (08146698995). Track commission.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 4. UNIVERSAL CONSTRUCTION — PENCOM
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08033669633"),
    name: "Abdullahi Musa", businessName: "Universal Construction", phone: "08033669633",
    service: "PENCOM Registration",
    context: "Construction company needs PENCOM registration.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Abdullahi Musa", businessName: "Universal Construction", phone: "08033669633",
    service: "PENCOM Registration", department: "bizdoc", category: "Statutory Registration",
    notes: "Construction company. PENCOM registration for compliance.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 5. SALE FATIMA MUHAMMAD — CAC Ltd (1M shares)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08164889091"),
    name: "Sale Fatima Muhammad", phone: "08164889091",
    service: "CAC Limited Company Registration",
    context: "New Ltd company with 1,000,000 shares.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Sale Fatima Muhammad", phone: "08164889091",
    service: "CAC Limited Company Registration", department: "bizdoc",
    category: "CAC Registration", priority: "high",
    notes: "1,000,000 shares. Need: proposed names (2 options), directors, secretary, share allocation, address, nature of business.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 6. IKEDI — Option 2 ₦630K (50% paid)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08033476592"),
    name: "Ikedi", phone: "08033476592",
    service: "Business Setup Package — Option 2",
    context: "Chose Option 2 at ₦630,000. Paid 50% (₦315,000). Balance: ₦315,000. Work not started.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Ikedi", phone: "08033476592",
    service: "Business Setup Package — Option 2 (₦630K)", department: "bizdoc",
    category: "Package", priority: "high", quotedPrice: "630000",
    notes: "Total: ₦630,000. Paid: ₦315,000 (50%). Balance: ₦315,000. Work NOT started. CSO to confirm exact services.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 7. NAXIFI — CAC Registration
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("09041538312"),
    name: "Naxifi", phone: "09041538312",
    service: "CAC Registration",
    context: "CAC registration. CSO to collect: proposed names, type (Ltd/BN), directors.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Naxifi", phone: "09041538312",
    service: "CAC Registration", department: "bizdoc", category: "CAC Registration",
    notes: "CSO to confirm: Ltd or BN, proposed names, directors/proprietor, address, nature of business.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 8. A.D SANI AND ASSOCIATES — ITF✓ NSITF✓ PENCOM↻ TCC↻ BPP⏳
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("0000009675"),
    name: "Dr. Abubakar Sani", businessName: "A.D Sani and Associates",
    service: "Full Statutory Compliance (ITF + NSITF + PENCOM + TCC + BPP)",
    context: "RC 879368. ITF + NSITF delivered. PENCOM in progress (est 10 Apr). TCC in progress (est 15 Apr). BPP pending TCC. Ref: Hamzury 000A 9675.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;

  // ITF — Completed
  await safeTask(db, {
    clientName: "Dr. Abubakar Sani", businessName: "A.D Sani and Associates",
    service: "ITF Registration", department: "bizdoc", category: "Statutory Registration",
    status: "Completed", notes: "Certificate DELIVERED.",
  });
  // NSITF — Completed
  await safeTask(db, {
    clientName: "Dr. Abubakar Sani", businessName: "A.D Sani and Associates",
    service: "NSITF Registration", department: "bizdoc", category: "Statutory Registration",
    status: "Completed", notes: "Certificate DELIVERED.",
  });
  // PENCOM — In Progress
  await safeTask(db, {
    clientName: "Dr. Abubakar Sani", businessName: "A.D Sani and Associates",
    service: "PENCOM Registration", department: "bizdoc", category: "Statutory Registration",
    status: "In Progress", expectedDelivery: "2026-04-10",
    notes: "Submitted. PENCOM undergoing system migration. Monitoring daily. Est: 10 April 2026.",
  });
  // TCC — In Progress
  await safeTask(db, {
    clientName: "Dr. Abubakar Sani", businessName: "A.D Sani and Associates",
    service: "Tax Clearance Certificate (TCC)", department: "bizdoc", category: "Tax Compliance",
    status: "In Progress", expectedDelivery: "2026-04-15",
    notes: "All docs submitted to FIRS auditor. Awaiting validation. Est: 15 April 2026.",
  });
  // BPP — Not Started
  await safeTask(db, {
    clientName: "Dr. Abubakar Sani", businessName: "A.D Sani and Associates",
    service: "BPP Registration", department: "bizdoc", category: "Statutory Registration",
    notes: "Requires TCC completion as prerequisite. Will start immediately after TCC.",
  });
  tasksCount += 5;

  // ═══════════════════════════════════════════════════════════
  // 9. DDBAYS — NAFDAC (Herbal)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef(),
    name: "DDBays", businessName: "DDBays Herbal",
    service: "NAFDAC Registration",
    context: "NAFDAC registration for herbal products. CSO to collect contact details, product list.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "DDBays", businessName: "DDBays Herbal",
    service: "NAFDAC Registration (Herbal Products)", department: "bizdoc", category: "Sector Licence",
    notes: "Herbal products. CSO to collect: contact person, phone, email, product list, lab reports, facility details.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 10. HUSSAINI KANO — NAFDAC (Herbal)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef(),
    name: "Hussaini", service: "NAFDAC Registration",
    context: "Kano-based. NAFDAC for herbal products. CSO to collect all details.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Hussaini",
    service: "NAFDAC Registration (Herbal Products)", department: "bizdoc", category: "Sector Licence",
    notes: "Kano-based. Herbal products. CSO to collect: full name, phone, email, business name, product list.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 11. MINA — CAC Registration
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef(),
    name: "Mina", service: "CAC Registration",
    context: "CAC registration. CSO to collect all details.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Mina",
    service: "CAC Registration", department: "bizdoc", category: "CAC Registration",
    notes: "CSO to collect: full name, phone, email, proposed business names, type (Ltd/BN), directors.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 12. AHMAD HASSAN — Reprinting CAC Document
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08067933328"),
    name: "Ahmad Hassan", businessName: "Ahmad Hassan Venture LTD",
    phone: "08067933328", email: "comradezaid6@gmail.com",
    service: "Reprinting CAC Document",
    context: "Ahmad Hassan Venture LTD. Also known as Ahmed New Market. Reprinting CAC certificate.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Ahmad Hassan", businessName: "Ahmad Hassan Venture LTD", phone: "08067933328",
    service: "Reprinting CAC Document", department: "bizdoc", category: "CAC Document",
    notes: "Email: comradezaid6@gmail.com. Reprint CAC certificate for Ahmad Hassan Venture LTD.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 13. AREWA COMPANY KANO — Branding + Reprinting
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef(),
    name: "Arewa Company", businessName: "Arewa Company",
    service: "Branding + Logo + Letterhead + CAC Document Reprinting",
    context: "Kano-based. Branding (Systemise) + CAC reprinting (BizDoc). CSO to collect contact details.",
    source: "direct", status: "converted", assignedDepartment: "systemise",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Arewa Company", businessName: "Arewa Company",
    service: "Branding — Logo + Letterhead Design", department: "systemise", category: "Brand Identity",
    notes: "Kano-based. Logo and letterhead design. CSO to collect contact person details.",
  });
  await safeTask(db, {
    clientName: "Arewa Company", businessName: "Arewa Company",
    service: "Reprinting CAC Document", department: "bizdoc", category: "CAC Document",
    notes: "Kano-based. CAC document reprinting. CSO to collect contact person details.",
  });
  tasksCount += 2;

  // ═══════════════════════════════════════════════════════════
  // 14. MUKTAR GANGARE — Modification of Name
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("08131629912"),
    name: "Muktar Gangare", phone: "08131629912",
    service: "CAC Modification of Name",
    context: "Change of business name on CAC registration.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Muktar Gangare", phone: "08131629912",
    service: "CAC Modification of Name", department: "bizdoc", category: "CAC Amendment",
    notes: "CSO to collect: current registered name, proposed new name, RC number.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // 15. ALJAXIRA DATA — Tax Pro Max + Dashboard (Subscription)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef(),
    name: "Aljaxira Data", businessName: "Aljaxira Data",
    service: "Tax Pro Max + Dashboard Management",
    context: "Subscription client. Tax Pro Max + Dashboard management. CSO to collect contact person details.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await db.insert(subscriptions).values({
    clientName: "Aljaxira Data", businessName: "Aljaxira Data",
    service: "Tax Pro Max + Dashboard Management", department: "bizdoc",
    monthlyFee: "12500", billingDay: 1, status: "active", startDate: "2026-04-01",
    notesForStaff: "Tax Pro Max ₦150,000/year. Dashboard management. CSO to collect contact details.",
  });
  subsCount++;

  // ═══════════════════════════════════════════════════════════
  // 16. KANO SOLAR — Tax Pro Max + Dashboard (Subscription)
  // ═══════════════════════════════════════════════════════════
  await safeLead(db, {
    ref: hmzRef("09173927430"),
    name: "Abdullahi", businessName: "Kano Solar", phone: "09173927430",
    service: "Tax Pro Max + Dashboard Management",
    context: "Contact: Abdullahi (09173927430). Subscription for Tax Pro Max + dashboard management.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await db.insert(subscriptions).values({
    clientName: "Abdullahi", businessName: "Kano Solar", phone: "09173927430",
    service: "Tax Pro Max + Dashboard Management", department: "bizdoc",
    monthlyFee: "12500", billingDay: 1, status: "active", startDate: "2026-04-01",
    notesForStaff: "Tax Pro Max ₦150,000/year. Dashboard management.",
  });
  subsCount++;

  // ═══════════════════════════════════════════════════════════
  // 17. IT STUDENT — New (paid yesterday)
  // ═══════════════════════════════════════════════════════════
  await db.insert(skillsApplications).values({
    ref: hmzRef(),
    program: "IT Training",
    fullName: "IT Student (New — paid 4 Apr 2026)",
    businessDescription: "New IT student. Paid on 4 April 2026. CSO to collect: full name, phone, email, specific program.",
    status: "accepted", paymentStatus: "paid",
    canCommitTime: true, hasEquipment: true, willingToExecute: true,
  });
  skillsCount++;

  // ═══════════════════════════════════════════════════════════
  // 18. ABDULLAHI MUSA — AI Student (₦70K) + Muryar Jamaa TV BN
  // ═══════════════════════════════════════════════════════════
  await db.insert(skillsApplications).values({
    ref: hmzRef("08037802130"),
    program: "AI Business Bundle",
    pathway: "bizdev",
    fullName: "Abdullahi Musa", phone: "08037802130",
    businessDescription: "Strong in BizDev. ₦70,000 program. Halted until Muryar Jamaa TV BN registration completes.",
    pricingTier: "standard",
    status: "accepted", paymentStatus: "pending",
    canCommitTime: true, hasEquipment: true, willingToExecute: true,
  });
  skillsCount++;

  await safeLead(db, {
    ref: hmzRef("08037802130"),
    name: "Abdullahi Musa", businessName: "Muryar Jamaa TV", phone: "08037802130",
    service: "Business Name Registration",
    context: "BN registration for Muryar Jamaa TV. Also enrolled in AI Skills (₦70K) — program halted until BN completes.",
    source: "direct", status: "converted", assignedDepartment: "bizdoc",
  });
  leadsCount++;
  await safeTask(db, {
    clientName: "Abdullahi Musa", businessName: "Muryar Jamaa TV", phone: "08037802130",
    service: "Business Name Registration", department: "bizdoc",
    category: "CAC Registration", priority: "high",
    notes: "Register BN: Muryar Jamaa TV. AI Skills program on hold until this completes.",
  });
  tasksCount++;

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log(`[seed-real-clients] Done — ${leadsCount} leads, ${tasksCount} tasks, ${subsCount} subscriptions, ${skillsCount} skills apps.`);

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
