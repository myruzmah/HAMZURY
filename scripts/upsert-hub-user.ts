/**
 * One-off: create or reset hub@hamzury.com with skills_staff role + known password.
 * Idempotent — re-running rotates the salt+hash.
 *
 * Run: DATABASE_URL=... pnpm exec tsx scripts/upsert-hub-user.ts
 */
import { getDb, hashPassword } from "../server/db";
import { sql } from "drizzle-orm";

const EMAIL = "hub@hamzury.com";
const NAME = "Hub Admin";
const ROLE = "skills_staff";
const PASSWORD = "Hamzury@2026";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("No DB connection");

  const { hash, salt } = await hashPassword(PASSWORD);

  // Use ON DUPLICATE KEY UPDATE — no need to read first.
  await db.execute(sql`
    INSERT INTO staffUsers
      (email, name, staffHamzuryRole, passwordHash, passwordSalt, passwordChanged, createdAt, updatedAt)
    VALUES
      (${EMAIL}, ${NAME}, ${ROLE}, ${hash}, ${salt}, true, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      staffHamzuryRole = VALUES(staffHamzuryRole),
      passwordHash = VALUES(passwordHash),
      passwordSalt = VALUES(passwordSalt),
      passwordChanged = true,
      updatedAt = NOW()
  `);

  console.log(`Upserted ${EMAIL} with role ${ROLE} and password set.`);
  console.log("Verify with: mysql -e \"SELECT id, email, name, staffHamzuryRole FROM staffUsers WHERE email='hub@hamzury.com'\"");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
