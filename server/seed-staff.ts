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
  generateStaffRef,
  getDb,
} from "./db";
import { staffUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
  { name: "Muhammad Hamzury",  email: "founder@hamzury.com",      hamzuryRole: "founder" },
  { name: "Idris Ibrahim",     email: "ceo@hamzury.com",          hamzuryRole: "ceo" },              // CEO Lead — department email is the single source of login for CEO
  { name: "Abdullahi Musa",    email: "abdullahi@hamzury.com",    hamzuryRole: "bizdev" },           // BizDoc dept lead
  { name: "Yusuf Haruna",      email: "yusuf@hamzury.com",        hamzuryRole: "compliance_staff" },
  { name: "Khadija Saad",      email: "bizdev@hamzury.com",       hamzuryRole: "bizdev" },           // BizDev Lead — department email is the single source of login for BizDev
  { name: "Farida Munir",      email: "faree@hamzury.com",        hamzuryRole: "bizdev" },           // BizDev + Podcast
  { name: "Maryam Ashir Lalo", email: "cso@hamzury.com",          hamzuryRole: "cso" },              // CSO Lead — department email is the single source of login for CSO
  { name: "Abubakar Sadiq",    email: "finance@hamzury.com",      hamzuryRole: "finance" },          // Finance Lead — department email is the single source of login for Finance
  { name: "Sulaiman Hikma",    email: "hikma@hamzury.com",        hamzuryRole: "media" },
  { name: "Salis",             email: "salis@hamzury.com",        hamzuryRole: "media" },            // Video/Sound
  { name: "Abdulmalik Musa",   email: "abdulmalik@hamzury.com",   hamzuryRole: "skills_staff" },     // Skills dept lead
  { name: "Dajot",             email: "dajot@hamzury.com",        hamzuryRole: "tech_lead" },        // Skills/Code
  { name: "Lalo",              email: "lalo@hamzury.com",         hamzuryRole: "department_staff" }, // Design
  { name: "Rabilu Musa",       email: "rabilu@hamzury.com",       hamzuryRole: "security_staff" },
  { name: "Habeeba",           email: "habeeba@hamzury.com",      hamzuryRole: "department_staff" }, // New staff
  { name: "Pius Emmanuel",     email: "pius@hamzury.com",         hamzuryRole: "department_staff" }, // New staff
  { name: "Abdulwafeed Tanko", email: "abdulwafeed@hamzury.com",  hamzuryRole: "tech_lead" },        // IT Student/Tech
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
    const staffRef = await generateStaffRef(staff.hamzuryRole);
    await createStaffUser({
      staffRef,
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
    console.log(`[seed]   OK   ${staff.name} (${staffRef}) — ${staff.hamzuryRole}`);
  }

  console.log(`[seed] Staff seeding complete: ${created} users created.`);
  return created;
}

/**
 * Updates names for existing staff using the real full names from STAFF_ROSTER.
 * Also adds any staff from STAFF_ROSTER that don't exist yet (new hires).
 * Safe to re-run — skips anyone already matching.
 */
export async function syncStaffRoster(): Promise<void> {
  const db = await getDb();
  if (!db) { console.log("[sync-staff] DB not available — skipping"); return; }

  // ─── 2026-04 migration: rename CSO personal email → department email ───
  // The CSO department now logs in via cso@hamzury.com (single source of truth).
  // If the legacy maryam@hamzury.com row still exists, rename it in place so
  // her staffRef, password, audit history, etc. are preserved.
  try {
    const legacy = await getStaffUserByEmail("maryam@hamzury.com");
    if (legacy) {
      const already = await getStaffUserByEmail("cso@hamzury.com");
      if (already) {
        // Both rows exist — delete the legacy one, keep the new cso@ row.
        await db.delete(staffUsers).where(eq(staffUsers.email, "maryam@hamzury.com"));
        console.log("[sync-staff] Removed legacy maryam@hamzury.com (cso@hamzury.com already present)");
      } else {
        await db.update(staffUsers)
          .set({ email: "cso@hamzury.com" })
          .where(eq(staffUsers.email, "maryam@hamzury.com"));
        console.log("[sync-staff] Renamed maryam@hamzury.com → cso@hamzury.com");
      }
    }
  } catch (err) {
    console.log("[sync-staff] CSO email migration error:", String(err));
  }

  // ─── 2026-04 migration: rename CEO personal email → department email ───
  // The CEO department now logs in via ceo@hamzury.com (single source of truth).
  // Rename idris@hamzury.com in place so staffRef, password, audit history are preserved.
  try {
    const legacy = await getStaffUserByEmail("idris@hamzury.com");
    if (legacy) {
      const already = await getStaffUserByEmail("ceo@hamzury.com");
      if (already) {
        await db.delete(staffUsers).where(eq(staffUsers.email, "idris@hamzury.com"));
        console.log("[sync-staff] Removed legacy idris@hamzury.com (ceo@hamzury.com already present)");
      } else {
        await db.update(staffUsers)
          .set({ email: "ceo@hamzury.com" })
          .where(eq(staffUsers.email, "idris@hamzury.com"));
        console.log("[sync-staff] Renamed idris@hamzury.com → ceo@hamzury.com");
      }
    }
  } catch (err) {
    console.log("[sync-staff] CEO email migration error:", String(err));
  }

  // ─── 2026-04 migration: rename BizDev personal email → department email ───
  // The BizDev department now logs in via bizdev@hamzury.com (single source of truth).
  // Rename khadija@hamzury.com in place so staffRef, password, audit history are preserved.
  try {
    const legacy = await getStaffUserByEmail("khadija@hamzury.com");
    if (legacy) {
      const already = await getStaffUserByEmail("bizdev@hamzury.com");
      if (already) {
        await db.delete(staffUsers).where(eq(staffUsers.email, "khadija@hamzury.com"));
        console.log("[sync-staff] Removed legacy khadija@hamzury.com (bizdev@hamzury.com already present)");
      } else {
        await db.update(staffUsers)
          .set({ email: "bizdev@hamzury.com" })
          .where(eq(staffUsers.email, "khadija@hamzury.com"));
        console.log("[sync-staff] Renamed khadija@hamzury.com → bizdev@hamzury.com");
      }
    }
  } catch (err) {
    console.log("[sync-staff] BizDev email migration error:", String(err));
  }

  // ─── 2026-04 migration: rename Finance personal email → department email ───
  try {
    const legacy = await getStaffUserByEmail("abubakar@hamzury.com");
    if (legacy) {
      const already = await getStaffUserByEmail("finance@hamzury.com");
      if (already) {
        await db.delete(staffUsers).where(eq(staffUsers.email, "abubakar@hamzury.com"));
        console.log("[sync-staff] Removed legacy abubakar@hamzury.com (finance@hamzury.com already present)");
      } else {
        await db.update(staffUsers)
          .set({ email: "finance@hamzury.com" })
          .where(eq(staffUsers.email, "abubakar@hamzury.com"));
        console.log("[sync-staff] Renamed abubakar@hamzury.com → finance@hamzury.com");
      }
    }
  } catch (err) {
    console.log("[sync-staff] Finance email migration error:", String(err));
  }

  for (const staff of STAFF_ROSTER) {
    const existing = await getStaffUserByEmail(staff.email);
    if (existing) {
      // Sync name AND role — role drift (e.g. legacy dept_staff → cso) was
      // silently leaving staff with the wrong RoleGuard access on live.
      const patch: Partial<typeof staffUsers.$inferInsert> = {};
      if (existing.name !== staff.name)               patch.name = staff.name;
      if (existing.hamzuryRole !== staff.hamzuryRole) patch.hamzuryRole = staff.hamzuryRole;
      if (!existing.isActive)                         patch.isActive = true;
      if (Object.keys(patch).length > 0) {
        await db.update(staffUsers)
          .set(patch)
          .where(eq(staffUsers.email, staff.email));
        console.log(`[sync-staff] Patched ${staff.email}:`, patch);
      }
    } else {
      // New hire — add them
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
      console.log(`[sync-staff] Added new staff: ${staff.name} (${staff.email})`);
    }
  }
  console.log("[sync-staff] Roster sync complete");
}

// ─── Stubs: demo seeds removed (real clients in db.ts media subscriptions) ──

export async function seedSampleClients(): Promise<{ leadsCreated: number; tasksCreated: number; invoicesCreated: number }> {
  console.log("[seed-clients] Skipped — demo seeds removed.");
  return { leadsCreated: 0, tasksCreated: 0, invoicesCreated: 0 };
}

export async function seedSampleAffiliates(): Promise<{ affiliatesCreated: number; recordsCreated: number }> {
  console.log("[seed-affiliates] Skipped — demo seeds removed.");
  return { affiliatesCreated: 0, recordsCreated: 0 };
}

/**
 * Full seed: staff users + default pricing + content.
 */
export async function seedAll(): Promise<{ staffCreated: number; pricingSeeded: boolean }> {
  const staffCreated = await seedStaffUsers();

  console.log("[seed] Seeding default pricing...");
  await seedDefaultPricing();
  console.log("[seed] Pricing seed complete.");

  console.log("[seed] Seeding content posts...");
  const contentResult = await seedContentPosts();
  console.log("[seed] Content seed:", contentResult);

  return { staffCreated, pricingSeeded: true };
}
