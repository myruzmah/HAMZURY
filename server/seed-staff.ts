/**
 * Seed script for default staff users + pricing.
 *
 * Standalone:  npx tsx server/seed-staff.ts
 * Via tRPC:    staff.seed (founderCEOProcedure)
 */
import "dotenv/config";
import {
  hashPassword,
  createStaffUser,
  listAllStaffUsers,
  seedDefaultPricing,
  getStaffUserByEmail,
  seedContentPosts,
  createLead,
  createInvoice,
  createAffiliate,
  createAffiliateRecord,
  getLeads,
  getAffiliateByEmail,
  getDb,
  generateRef,
  generateInvoiceNumber,
} from "./db";
import { tasks } from "../drizzle/schema";

const DEFAULT_PASSWORD = "Hamzury@2026";

/**
 * Staff roster — maps to staffUsers table.
 *
 * hamzuryRole must be one of the staffHamzuryRole enum values:
 *   founder, ceo, cso, finance, hr, bizdev, bizdev_staff, media,
 *   skills_staff, systemise_head, tech_lead, compliance_staff,
 *   security_staff, department_staff
 */
const STAFF_ROSTER: {
  name: string;
  email: string;
  hamzuryRole:
    | "founder" | "ceo" | "cso" | "finance" | "hr" | "bizdev"
    | "bizdev_staff" | "media" | "skills_staff" | "systemise_head"
    | "tech_lead" | "compliance_staff" | "security_staff" | "department_staff";
}[] = [
  { name: "Muhammad Hamzury",  email: "founder@hamzury.com",     hamzuryRole: "founder" },
  { name: "Idris Ibrahim",     email: "idris@hamzury.com",       hamzuryRole: "ceo" },
  { name: "Abdullahi Musa",    email: "abdullahi@hamzury.com",   hamzuryRole: "bizdev" },           // BizDoc department lead
  { name: "Yusuf",             email: "yusuf@hamzury.com",       hamzuryRole: "compliance_staff" },
  { name: "Khadija",           email: "khadija@hamzury.com",     hamzuryRole: "bizdev" },
  { name: "Faree",             email: "faree@hamzury.com",       hamzuryRole: "bizdev" },
  { name: "Tabitha",           email: "tabitha@hamzury.com",     hamzuryRole: "cso" },
  { name: "Maryam",            email: "maryam@hamzury.com",      hamzuryRole: "department_staff" }, // CSO assist
  { name: "Abubakar",          email: "abubakar@hamzury.com",    hamzuryRole: "finance" },
  { name: "Hikma",             email: "hikma@hamzury.com",       hamzuryRole: "media" },
  { name: "Salis",             email: "salis@hamzury.com",       hamzuryRole: "media" },
  { name: "Abdulmalik Musa",   email: "abdulmalik@hamzury.com",  hamzuryRole: "skills_staff" },    // Skills department lead
  { name: "Dajot",             email: "dajot@hamzury.com",       hamzuryRole: "tech_lead" },
  { name: "Lalo",              email: "lalo@hamzury.com",        hamzuryRole: "department_staff" },
  { name: "Rabilu",            email: "rabilu@hamzury.com",      hamzuryRole: "security_staff" },
];

/**
 * Core seed logic — used by both standalone execution and tRPC procedure.
 * Skips users that already exist (by email). Returns the number created.
 */
export async function seedStaffUsers(): Promise<number> {
  const existing = await listAllStaffUsers();
  if (existing.length > 0) {
    console.log(`[seed] Staff table already has ${existing.length} users — skipping staff seed.`);
    return 0;
  }

  console.log(`[seed] Seeding ${STAFF_ROSTER.length} default staff users...`);

  let created = 0;
  for (const staff of STAFF_ROSTER) {
    // Double-check individual email in case of partial seed
    const exists = await getStaffUserByEmail(staff.email);
    if (exists) {
      console.log(`[seed]   SKIP ${staff.email} — already exists`);
      continue;
    }

    const { hash, salt } = await hashPassword(DEFAULT_PASSWORD);
    await createStaffUser({
      email: staff.email,
      passwordHash: hash,
      passwordSalt: salt,
      name: staff.name,
      hamzuryRole: staff.hamzuryRole,
      isActive: true,
      firstLogin: true,
      passwordChanged: false,
      failedAttempts: 0,
    });
    created++;
    console.log(`[seed]   OK   ${staff.name} (${staff.email}) — ${staff.hamzuryRole}`);
  }

  console.log(`[seed] Staff seeding complete: ${created} users created.`);
  return created;
}

// ─── Sample Client / Lead Seed ────────────────────────────────────────────────

/**
 * Creates sample client leads, tasks, and invoices for testing dashboards.
 * Skips if leads already exist with these emails.
 */
export async function seedSampleClients(): Promise<{ leadsCreated: number; tasksCreated: number; invoicesCreated: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let leadsCreated = 0;
  let tasksCreated = 0;
  let invoicesCreated = 0;

  // Helper: insert a task directly (createTaskFromLead only creates 1 task w/ lead ref)
  async function insertTask(data: {
    leadId: number;
    clientName: string;
    businessName?: string;
    phone?: string;
    service: string;
    department: string;
    status: "Not Started" | "In Progress" | "Waiting on Client" | "Submitted" | "Completed";
    quotedPrice: string;
  }) {
    const ref = generateRef(data.phone);
    await db!.insert(tasks).values({
      ref,
      leadId: data.leadId,
      clientName: data.clientName,
      businessName: data.businessName,
      phone: data.phone,
      service: data.service,
      department: data.department,
      status: data.status,
      quotedPrice: data.quotedPrice,
      notes: `Seeded sample task for ${data.clientName}`,
    });
    tasksCreated++;
    return ref;
  }

  // ─── Client 1: Tilz Spa (₦1.2M project, ₦500K paid) ──────────────────────
  const existingLeads = await getLeads();
  const tilzExists = existingLeads.some((l) => l.email === "tilz@example.com");

  if (!tilzExists) {
    const tilzLead = await createLead({
      ref: generateRef("08012345678"),
      name: "Tilz Spa",
      businessName: "Tilz Spa & Wellness",
      phone: "08012345678",
      email: "tilz@example.com",
      service: "Full Branding + Digital Suite",
      context: "Referred client — needs full branding, website, CRM, and social media management.",
      source: "referral",
      status: "converted",
      leadScore: 9,
      assignedDepartment: "systemise",
    });
    leadsCreated++;
    console.log(`[seed-clients] Created lead: Tilz Spa (id=${tilzLead.id})`);

    // 4 tasks
    await insertTask({
      leadId: tilzLead.id, clientName: "Tilz Spa", businessName: "Tilz Spa & Wellness",
      phone: "08012345678", service: "Full Branding Package",
      department: "systemise", status: "In Progress", quotedPrice: "400000",
    });
    await insertTask({
      leadId: tilzLead.id, clientName: "Tilz Spa", businessName: "Tilz Spa & Wellness",
      phone: "08012345678", service: "Website Design & Development",
      department: "systemise", status: "Not Started", quotedPrice: "350000",
    });
    await insertTask({
      leadId: tilzLead.id, clientName: "Tilz Spa", businessName: "Tilz Spa & Wellness",
      phone: "08012345678", service: "Lead Generation Dashboard & CRM",
      department: "systemise", status: "Not Started", quotedPrice: "250000",
    });
    await insertTask({
      leadId: tilzLead.id, clientName: "Tilz Spa", businessName: "Tilz Spa & Wellness",
      phone: "08012345678", service: "Social Media Management (Monthly)",
      department: "systemise", status: "Not Started", quotedPrice: "200000",
    });

    // Invoice: ₦1,200,000 total, ₦500,000 paid → partial
    await createInvoice({
      invoiceNumber: generateInvoiceNumber(),
      leadId: tilzLead.id,
      clientName: "Tilz Spa",
      clientEmail: "tilz@example.com",
      clientPhone: "08012345678",
      items: [
        { description: "Full Branding Package", amount: 400000 },
        { description: "Website Design & Development", amount: 350000 },
        { description: "Lead Generation Dashboard & CRM", amount: 250000 },
        { description: "Social Media Management (Monthly)", amount: 200000 },
      ],
      subtotal: 1200000,
      total: 1200000,
      amountPaid: 500000,
      status: "partial",
      createdBy: "seed-script",
    });
    invoicesCreated++;
    console.log("[seed-clients] Created invoice for Tilz Spa (₦1.2M, ₦500K paid)");
  } else {
    console.log("[seed-clients] SKIP Tilz Spa — already exists");
  }

  // ─── Client 2: Ikedi (₦630K project, draft invoice) ───────────────────────
  const ikediExists = existingLeads.some((l) => l.email === "ikedi@example.com");

  if (!ikediExists) {
    const ikediLead = await createLead({
      ref: generateRef("08098765432"),
      name: "Ikedi Peace",
      businessName: "Ikedi Ventures",
      phone: "08098765432",
      email: "ikedi@example.com",
      service: "CAC Registration + Trademark + Website",
      context: "Referred client — needs business registration, trademark, and website.",
      source: "referral",
      status: "converted",
      leadScore: 8,
      assignedDepartment: "bizdoc",
    });
    leadsCreated++;
    console.log(`[seed-clients] Created lead: Ikedi Peace (id=${ikediLead.id})`);

    await insertTask({
      leadId: ikediLead.id, clientName: "Ikedi Peace", businessName: "Ikedi Ventures",
      phone: "08098765432", service: "CAC Business Registration",
      department: "bizdoc", status: "Not Started", quotedPrice: "150000",
    });
    await insertTask({
      leadId: ikediLead.id, clientName: "Ikedi Peace", businessName: "Ikedi Ventures",
      phone: "08098765432", service: "Trademark Registration",
      department: "bizdoc", status: "Not Started", quotedPrice: "180000",
    });
    await insertTask({
      leadId: ikediLead.id, clientName: "Ikedi Peace", businessName: "Ikedi Ventures",
      phone: "08098765432", service: "Website Design",
      department: "systemise", status: "Not Started", quotedPrice: "300000",
    });

    await createInvoice({
      invoiceNumber: generateInvoiceNumber(),
      leadId: ikediLead.id,
      clientName: "Ikedi Peace",
      clientEmail: "ikedi@example.com",
      clientPhone: "08098765432",
      items: [
        { description: "CAC Business Registration", amount: 150000 },
        { description: "Trademark Registration", amount: 180000 },
        { description: "Website Design", amount: 300000 },
      ],
      subtotal: 630000,
      total: 630000,
      amountPaid: 0,
      status: "draft",
      createdBy: "seed-script",
    });
    invoicesCreated++;
    console.log("[seed-clients] Created invoice for Ikedi Peace (₦630K, draft)");
  } else {
    console.log("[seed-clients] SKIP Ikedi Peace — already exists");
  }

  // ─── Client 3: TIAS (former employer, ₦1M+ project, new lead) ─────────────
  const tiasExists = existingLeads.some((l) => l.email === "tias@example.com");

  if (!tiasExists) {
    await createLead({
      ref: generateRef("08055555555"),
      name: "TIAS Group",
      businessName: "TIAS International",
      phone: "08055555555",
      email: "tias@example.com",
      service: "Full Digital Transformation",
      context: "Former employer — large potential project. Awaiting confirmation.",
      source: "direct",
      status: "new",
      leadScore: 10,
      assignedDepartment: "",
    });
    leadsCreated++;
    console.log("[seed-clients] Created lead: TIAS Group (no tasks yet)");
  } else {
    console.log("[seed-clients] SKIP TIAS Group — already exists");
  }

  // ─── Client 4: Robotics Client (pending proposal) ─────────────────────────
  const roboticsExists = existingLeads.some((l) => l.phone === "08033333333");

  if (!roboticsExists) {
    await createLead({
      ref: generateRef("08033333333"),
      name: "Robotics Client",
      businessName: "[Robotics Startup]",
      phone: "08033333333",
      service: "Business Registration + Branding",
      context: "Referral — robotics startup, needs proposal.",
      source: "referral",
      status: "new",
      leadScore: 9,
    });
    leadsCreated++;
    console.log("[seed-clients] Created lead: Robotics Client (no tasks yet)");
  } else {
    console.log("[seed-clients] SKIP Robotics Client — already exists");
  }

  // ─── Client 5: Tilz's Friend (same services needed) ───────────────────────
  const tilzFriendExists = existingLeads.some((l) => l.phone === "08044444444");

  if (!tilzFriendExists) {
    await createLead({
      ref: generateRef("08044444444"),
      name: "Tilz Friend",
      businessName: "[Beauty Business]",
      phone: "08044444444",
      service: "Branding + Website + Social Media",
      context: "Referred by Tilz Spa — wants similar services.",
      source: "referral",
      status: "new",
      leadScore: 7,
    });
    leadsCreated++;
    console.log("[seed-clients] Created lead: Tilz Friend (no tasks yet)");
  } else {
    console.log("[seed-clients] SKIP Tilz Friend — already exists");
  }

  console.log(`[seed-clients] Done: ${leadsCreated} leads, ${tasksCreated} tasks, ${invoicesCreated} invoices created.`);
  return { leadsCreated, tasksCreated, invoicesCreated };
}

// ─── Sample Affiliate Seed ────────────────────────────────────────────────────

/**
 * Creates sample affiliates and referral records for testing the affiliate dashboard.
 * Skips if affiliates already exist with these emails.
 */
export async function seedSampleAffiliates(): Promise<{ affiliatesCreated: number; recordsCreated: number }> {
  let affiliatesCreated = 0;
  let recordsCreated = 0;

  // ─── Affiliate 1: Ahmed Ibrahim (active, premier tier) ─────────────────────
  const ahmedExists = await getAffiliateByEmail("ahmed@example.com");

  if (!ahmedExists) {
    const ahmed = await createAffiliate({
      name: "Ahmed Ibrahim",
      email: "ahmed@example.com",
      password: "Affiliate@2026",
      phone: "08061234567",
    });
    affiliatesCreated++;
    console.log(`[seed-affiliates] Created affiliate: Ahmed Ibrahim (code=${ahmed.code})`);

    // Record 1: earned ₦50,000
    await createAffiliateRecord({
      affiliateId: ahmed.id,
      affiliateCode: ahmed.code,
      clientName: "Tilz Spa",
      service: "Full Branding Package",
      department: "systemise",
      quotedAmount: "400000",
      commissionRate: "12.50",
      commissionAmount: "50000",
      status: "earned",
    });
    recordsCreated++;

    // Record 2: pending ₦30,000
    await createAffiliateRecord({
      affiliateId: ahmed.id,
      affiliateCode: ahmed.code,
      clientName: "Ikedi Peace",
      service: "CAC Business Registration",
      department: "bizdoc",
      quotedAmount: "150000",
      commissionRate: "20",
      commissionAmount: "30000",
      status: "pending",
    });
    recordsCreated++;

    // Record 3: paid ₦25,000
    await createAffiliateRecord({
      affiliateId: ahmed.id,
      affiliateCode: ahmed.code,
      clientName: "Previous Client",
      service: "Website Design",
      department: "systemise",
      quotedAmount: "250000",
      commissionRate: "10",
      commissionAmount: "25000",
      status: "paid",
    });
    recordsCreated++;

    console.log("[seed-affiliates] Created 3 referral records for Ahmed Ibrahim");
  } else {
    console.log("[seed-affiliates] SKIP Ahmed Ibrahim — already exists");
  }

  // ─── Affiliate 2: Fatima Yusuf (active, standard tier) ─────────────────────
  const fatimaExists = await getAffiliateByEmail("fatima@example.com");

  if (!fatimaExists) {
    const fatima = await createAffiliate({
      name: "Fatima Yusuf",
      email: "fatima@example.com",
      password: "Affiliate@2026",
      phone: "08071234567",
    });
    affiliatesCreated++;
    console.log(`[seed-affiliates] Created affiliate: Fatima Yusuf (code=${fatima.code})`);

    // Record 1: pending ₦20,000
    await createAffiliateRecord({
      affiliateId: fatima.id,
      affiliateCode: fatima.code,
      clientName: "New Referral",
      service: "Trademark Registration",
      department: "bizdoc",
      quotedAmount: "200000",
      commissionRate: "10",
      commissionAmount: "20000",
      status: "pending",
    });
    recordsCreated++;

    console.log("[seed-affiliates] Created 1 referral record for Fatima Yusuf");
  } else {
    console.log("[seed-affiliates] SKIP Fatima Yusuf — already exists");
  }

  console.log(`[seed-affiliates] Done: ${affiliatesCreated} affiliates, ${recordsCreated} records created.`);
  return { affiliatesCreated, recordsCreated };
}

/**
 * Full seed: staff users + default pricing.
 */
export async function seedAll(): Promise<{ staffCreated: number; pricingSeeded: boolean }> {
  const staffCreated = await seedStaffUsers();

  console.log("[seed] Seeding default pricing...");
  await seedDefaultPricing();
  console.log("[seed] Pricing seed complete.");

  console.log("[seed] Seeding content posts...");
  const contentResult = await seedContentPosts();
  console.log("[seed] Content seed:", contentResult);

  console.log("[seed] Seeding sample clients...");
  const clientResult = await seedSampleClients();
  console.log("[seed] Sample clients seed:", clientResult);

  console.log("[seed] Seeding sample affiliates...");
  const affiliateResult = await seedSampleAffiliates();
  console.log("[seed] Sample affiliates seed:", affiliateResult);

  return { staffCreated, pricingSeeded: true };
}

// ─── Standalone execution ─────────────────────────────────────────────────────

async function main() {
  console.log("[seed] Starting standalone seed...");
  const result = await seedAll();
  console.log("[seed] Done.", result);
  process.exit(0);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[seed] Fatal error:", err);
    process.exit(1);
  });
}
