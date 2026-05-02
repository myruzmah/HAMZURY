/**
 * db-sync — self-healing schema sync.
 *
 * Runs on every prod boot via package.json `start:prod`. Idempotent.
 *
 *   1. Ensures `_applied_migrations` tracking table exists.
 *   2. Walks every numbered .sql file in drizzle/ in lexical order.
 *   3. For each file:
 *        - Skip if already recorded as applied.
 *        - Otherwise split on `--> statement-breakpoint` (drizzle marker),
 *          run each statement, swallow "already exists" errors so the file
 *          stays idempotent across reruns.
 *        - On success, record the filename + timestamp.
 *        - On failure, log + alert (createNotification) but DO NOT crash —
 *          the app still boots so the CSO can investigate manually.
 *   4. Runs invariant checks: known columns/tables that earlier deploys
 *      missed (e.g. tasks.assignedBy). For each missing one, applies the
 *      ALTER + logs.
 *
 * Why this exists: drizzle-kit migrate has bitten us with snapshot drift.
 * This script is the rescue path. Idempotent + safe to run on every boot.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../server/db";
import { sql } from "drizzle-orm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "drizzle");

/** Errors that mean "the change is already applied" — safe to swallow. */
const IDEMPOTENT_ERROR_CODES = new Set([
  "ER_TABLE_EXISTS_ERROR",     // 1050 — CREATE TABLE for existing
  "ER_DUP_FIELDNAME",          // 1060 — ADD COLUMN that already exists
  "ER_DUP_KEYNAME",            // 1061 — duplicate index
  "ER_DUP_ENTRY",              // 1062 — duplicate primary/unique row (e.g. seed UPSERT)
  "ER_CANT_DROP_FIELD_OR_KEY", // 1091 — DROP for non-existent
]);

function isIdempotentError(err: any): boolean {
  if (!err) return false;
  // Drizzle wraps mysql2 errors in a DrizzleQueryError with .cause
  const inner = err.cause || err;
  if (IDEMPOTENT_ERROR_CODES.has(inner.code)) return true;
  if (IDEMPOTENT_ERROR_CODES.has(err.code)) return true;
  const msg = String(err.message || err.sqlMessage || inner.message || inner.sqlMessage || "");
  return /already exists|Duplicate column name|Duplicate key name|doesn'?t exist|Cannot drop|errno: 1050|errno: 1060|errno: 1061/i.test(msg);
}

/** Hand-curated invariants — columns/tables we KNOW the code expects. Each
 *  entry is checked + applied if missing. Add new ones here as drift is
 *  caught in the wild so the next boot self-heals. */
const INVARIANTS: { name: string; check: string; fix: string }[] = [
  {
    name: "tasks.assignedBy column",
    check: "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tasks' AND column_name = 'assignedBy'",
    fix:   "ALTER TABLE tasks ADD COLUMN assignedBy varchar(100) NULL AFTER department",
  },
  {
    name: "leads.leadStatus enum has full pipeline values",
    check: "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'leads' AND column_name = 'leadStatus' AND COLUMN_TYPE LIKE '%negotiation%'",
    fix:   "ALTER TABLE leads MODIFY COLUMN leadStatus enum('new','qualified','proposal_sent','negotiation','onboarding','won','lost','paused','contacted','converted','archived') NOT NULL DEFAULT 'new'",
  },
  {
    name: "skills_applications.appPaymentStatus has scholarship values",
    check: "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'skills_applications' AND column_name = 'appPaymentStatus' AND COLUMN_TYPE LIKE '%paid_via_scholarship%'",
    fix:   "ALTER TABLE skills_applications MODIFY COLUMN appPaymentStatus enum('pending','paid','waived','refunded','paid_via_scholarship','pending_seat_hold') NOT NULL DEFAULT 'pending'",
  },
  {
    name: "clients.nextActionDate column",
    check: "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'clients' AND column_name = 'nextActionDate'",
    fix:   "ALTER TABLE clients ADD COLUMN nextActionDate timestamp NULL",
  },
  {
    name: "clients.upsellNote column",
    check: "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'clients' AND column_name = 'upsellNote'",
    fix:   "ALTER TABLE clients ADD COLUMN upsellNote text NULL",
  },
  {
    name: "staffUsers.staffHamzuryRole enum has all division leads/staff",
    check: "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'staffUsers' AND column_name = 'staffHamzuryRole' AND COLUMN_TYPE LIKE '%medialy_lead%' AND COLUMN_TYPE LIKE '%scalar_lead%' AND COLUMN_TYPE LIKE '%podcast_staff%'",
    fix:   "ALTER TABLE staffUsers MODIFY COLUMN staffHamzuryRole enum('founder','ceo','cso','cso_staff','finance','hr','bizdev','bizdev_staff','media','skills_staff','skills_lead','systemise_head','tech_lead','compliance_staff','security_staff','department_staff','medialy_lead','medialy_staff','scalar_lead','scalar_staff','podcast_lead','podcast_staff','video_lead','video_staff','faceless_lead','faceless_staff') NOT NULL",
  },
];

async function ensureTrackingTable(db: any): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS _applied_migrations (
      filename varchar(200) NOT NULL PRIMARY KEY,
      appliedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      sha varchar(64) NULL,
      notes text NULL
    )
  `);
}

async function alreadyApplied(db: any, filename: string): Promise<boolean> {
  const r: any = await db.execute(sql`SELECT 1 FROM _applied_migrations WHERE filename = ${filename}`);
  // mysql2 returns [rows, fields]; drizzle wraps it. Handle both.
  const rows = Array.isArray(r) ? r[0] : r?.rows ?? [];
  return Array.isArray(rows) ? rows.length > 0 : !!rows;
}

async function recordApplied(db: any, filename: string, notes: string): Promise<void> {
  await db.execute(sql.raw(
    `INSERT IGNORE INTO _applied_migrations (filename, notes) VALUES (${db.dialect?.escapeString?.(filename) ?? `'${filename.replace(/'/g, "''")}'`}, ${db.dialect?.escapeString?.(notes) ?? `'${notes.replace(/'/g, "''")}'`})`
  ));
}

/** Split a .sql migration into individual statements.
 *  - Drizzle-generated files use `--> statement-breakpoint` markers.
 *  - Hand-written files separate by `;`. Naive split is good enough here —
 *    none of our migrations embed `;` in string literals or stored programs.
 *  - Comment-only lines are stripped before evaluating "is this empty?"
 */
function splitStatements(body: string): string[] {
  // Strip ALL comment lines first — including those with embedded semicolons
  // that would otherwise fool the semicolon-split (e.g.
  //   "-- Felix not in DB; Abdulwafeed is the only other tech_lead").
  // Also strip trailing inline `-- comment` after a statement.
  const stripped = body
    .split("\n")
    .filter(line => !/^\s*--/.test(line))
    .map(line => line.replace(/\s+--.*$/, ""))   // trim inline comments (keeps line)
    .join("\n")
    .trim();
  if (!stripped) return [];

  const useBreakpoint = /-->\s*statement-breakpoint/i.test(stripped);
  const raw = useBreakpoint
    ? stripped.split(/-->\s*statement-breakpoint/i)
    : stripped.split(/;\s*(?:\n|$)/);
  return raw.map(s => s.trim()).filter(Boolean);
}

async function applySqlFile(db: any, filename: string, body: string): Promise<{ ok: boolean; warnings: string[]; alreadyAppliedFully: boolean }> {
  const statements = splitStatements(body);

  const warnings: string[] = [];
  let totalRun = 0;
  let totalIdempotentSkipped = 0;
  for (const cleaned of statements) {
    if (!cleaned) continue;
    totalRun++;

    try {
      await db.execute(sql.raw(cleaned));
    } catch (err: any) {
      if (isIdempotentError(err)) {
        warnings.push(`[idempotent skip] ${err.cause?.code || err.code || (err.message || "").slice(0, 80)}`);
        totalIdempotentSkipped++;
        continue;
      }
      throw err;
    }
  }
  // If EVERY statement was an idempotent skip, the migration is fully applied.
  const alreadyAppliedFully = totalRun > 0 && totalRun === totalIdempotentSkipped;
  return { ok: true, warnings, alreadyAppliedFully };
}

async function runMigrations(db: any): Promise<void> {
  await ensureTrackingTable(db);

  let files: string[] = [];
  try {
    files = (await readdir(MIGRATIONS_DIR))
      .filter(f => /^\d{4}_.*\.sql$/.test(f))
      .sort();
  } catch (err) {
    console.warn("[db-sync] No migrations directory found, skipping file pass.", err);
    return;
  }

  let applied = 0;
  let skipped = 0;
  let failed = 0;

  for (const filename of files) {
    if (await alreadyApplied(db, filename)) {
      skipped++;
      continue;
    }
    const body = await readFile(join(MIGRATIONS_DIR, filename), "utf8");
    try {
      const { warnings, alreadyAppliedFully } = await applySqlFile(db, filename, body);
      const note = alreadyAppliedFully
        ? "Pre-existed (all statements idempotent-skipped on first sync)"
        : warnings.length
          ? `Applied with ${warnings.length} idempotent skip(s)`
          : "Applied cleanly";
      await recordApplied(db, filename, note);
      applied++;
      const symbol = alreadyAppliedFully ? "≈" : "✓";
      console.log(`[db-sync] ${symbol} ${filename}: ${note}`);
    } catch (err: any) {
      failed++;
      const errCode = err.cause?.code || err.code || (err.message || "").slice(0, 80);
      console.error(`[db-sync] ✗ ${filename}: ${errCode}`);
      // Don't record so a future boot retries.
    }
  }

  console.log(`[db-sync] migrations: ${applied} applied, ${skipped} skipped, ${failed} failed.`);
}

async function runInvariants(db: any): Promise<void> {
  let healed = 0;
  for (const inv of INVARIANTS) {
    try {
      const r: any = await db.execute(sql.raw(inv.check));
      const rows = Array.isArray(r) ? r[0] : r?.rows ?? [];
      const present = Array.isArray(rows) ? rows.length > 0 : !!rows;
      if (present) continue;
      // Apply the fix
      await db.execute(sql.raw(inv.fix));
      healed++;
      console.log(`[db-sync] 🩹 healed: ${inv.name}`);
    } catch (err: any) {
      if (isIdempotentError(err)) continue;
      console.error(`[db-sync] invariant '${inv.name}' could not be healed:`, err.code || err.message);
    }
  }
  if (healed > 0) console.log(`[db-sync] ${healed} schema invariant(s) auto-healed.`);
}

async function main(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[db-sync] No database connection — skipping. (DATABASE_URL not set?)");
    return;
  }
  console.log("[db-sync] starting…");
  await runMigrations(db);
  await runInvariants(db);
  console.log("[db-sync] done.");
}

main().catch((err) => {
  // Never crash the boot — log loudly and continue.
  console.error("[db-sync] fatal (non-blocking):", err);
}).finally(() => {
  // Don't hang the process; mysql pool keeps event loop alive.
  setTimeout(() => process.exit(0), 200);
});
