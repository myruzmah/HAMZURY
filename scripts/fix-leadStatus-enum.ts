/**
 * One-off: ensure the leads.leadStatus enum has all the unified pipeline
 * stages. Safe to re-run — MODIFY COLUMN is idempotent.
 *
 * Run: pnpm exec tsx scripts/fix-leadStatus-enum.ts
 */
import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = await getDb();
  const before: any = await db.execute(
    sql`SHOW COLUMNS FROM leads WHERE Field = 'leadStatus'`,
  );
  console.log("BEFORE:", JSON.stringify(before?.[0] ?? before, null, 2));

  await db.execute(sql`
    ALTER TABLE leads MODIFY COLUMN leadStatus enum(
      'new','qualified','proposal_sent','negotiation','onboarding',
      'won','lost','paused',
      'contacted','converted','archived'
    ) NOT NULL DEFAULT 'new'
  `);
  console.log("ALTER applied.");

  const after: any = await db.execute(
    sql`SHOW COLUMNS FROM leads WHERE Field = 'leadStatus'`,
  );
  console.log("AFTER:", JSON.stringify(after?.[0] ?? after, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
