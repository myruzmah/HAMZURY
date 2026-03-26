import "dotenv/config";
import { hashPassword, createStaffUser, getStaffUserByEmail } from "./db";

const DEFAULT_PASSWORD = "Hamzury@2026";
const FOUNDER_PASSWORD = "Founder@2026";

const STAFF = [
  { email: "muhammad@hamzuryos.biz",  name: "Muhammad Hamzury", hamzuryRole: "founder"          as const, password: FOUNDER_PASSWORD },
  { email: "idris@hamzuryos.biz",     name: "Ibrahim Idris",    hamzuryRole: "ceo"              as const, password: DEFAULT_PASSWORD },
  { email: "abdullahi@hamzuryos.biz", name: "Abdullahi Musa",   hamzuryRole: "bizdev"           as const, password: DEFAULT_PASSWORD },
  { email: "yusuf@hamzuryos.biz",     name: "Yusuf",            hamzuryRole: "compliance_staff" as const, password: DEFAULT_PASSWORD },
  { email: "khadija@hamzuryos.biz",   name: "Khadija",          hamzuryRole: "hr"               as const, password: DEFAULT_PASSWORD },
  { email: "faree@hamzuryos.biz",     name: "Faree",            hamzuryRole: "bizdev_staff"     as const, password: DEFAULT_PASSWORD },
  { email: "tabitha@hamzuryos.biz",   name: "Tabitha",          hamzuryRole: "cso"              as const, password: DEFAULT_PASSWORD },
  { email: "maryam@hamzuryos.biz",    name: "Maryam",           hamzuryRole: "media"            as const, password: DEFAULT_PASSWORD },
  { email: "abubakar@hamzuryos.biz",  name: "Abubakar",         hamzuryRole: "finance"          as const, password: DEFAULT_PASSWORD },
  { email: "hikma@hamzuryos.biz",     name: "Hikma",            hamzuryRole: "systemise_head"   as const, password: DEFAULT_PASSWORD },
  { email: "salis@hamzuryos.biz",     name: "Salis",            hamzuryRole: "media"            as const, password: DEFAULT_PASSWORD },
  { email: "abdulmalik@hamzuryos.biz",name: "Abdulmalik",       hamzuryRole: "skills_staff"     as const, password: DEFAULT_PASSWORD },
  { email: "dajot@hamzuryos.biz",     name: "Dajot",            hamzuryRole: "skills_staff"     as const, password: DEFAULT_PASSWORD },
  { email: "lalo@hamzuryos.biz",      name: "Maryam Ashir",     hamzuryRole: "tech_lead"        as const, password: DEFAULT_PASSWORD },
  { email: "rabilu@hamzuryos.biz",    name: "Rabilu",           hamzuryRole: "security_staff"   as const, password: DEFAULT_PASSWORD },
];

async function seed() {
  console.log("Seeding staff accounts...");
  for (const staff of STAFF) {
    const existing = await getStaffUserByEmail(staff.email);
    if (existing) {
      console.log(`  SKIP  ${staff.email} already exists`);
      continue;
    }
    const { hash, salt } = await hashPassword(staff.password);
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
    console.log(`  OK    ${staff.email} (${staff.hamzuryRole})`);
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
