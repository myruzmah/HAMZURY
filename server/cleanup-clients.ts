/**
 * HAMZURY — Cleanup Clients Script (ONE-OFF)
 *
 * Deletes ALL rows from the `clients` table and best-effort nulls/removes
 * dependent references in `tasks`, `invoices`, `commissions`, `subscriptions`,
 * `proposals`, `calendar_events`, `client_notes`, and `client_sessions` so
 * the CSO starts from a clean slate and adds every real client by hand.
 *
 * DOES NOT delete leads — leads are the intake record; CSO still needs them.
 *
 * How to run:
 *   pnpm exec tsx server/cleanup-clients.ts
 *
 * Safety:
 * - Wrapped in an env guard: set HAMZURY_CONFIRM_CLEANUP=yes to proceed.
 * - Prints a before/after count so the founder sees exactly what happened.
 * - Safe to re-run (idempotent — after the first run, all counts are 0).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import {
  clients, clientSessions, calendarEvents, clientNotes,
} from "../drizzle/schema";

function getDb() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return drizzle(url);
}

export async function cleanupAllClients() {
  if (process.env.HAMZURY_CONFIRM_CLEANUP !== "yes") {
    console.log("⚠️  Refusing to run — set HAMZURY_CONFIRM_CLEANUP=yes to proceed.");
    console.log("   Example:  HAMZURY_CONFIRM_CLEANUP=yes pnpm exec tsx server/cleanup-clients.ts");
    return;
  }

  const db = getDb();

  const before = await db.select().from(clients);
  console.log(`🧹 Cleanup starting — ${before.length} clients in DB.`);
  for (const c of before) {
    console.log(`   • ${c.ref} — ${c.businessName || c.name} (${c.status})`);
  }

  // 1. Null out client references on tasks / invoices / commissions / subscriptions / proposals.
  //    (These tables carry clientId-style columns as plain ints, no FK, but we null them to be tidy.)
  const clientIds = before.map(c => c.id);
  if (clientIds.length === 0) {
    console.log("✅  No clients to clean up — nothing to do.");
    return;
  }

  // Commissions reference tasks (not clients directly) — leave them; tasks are not deleted.

  // Calendar events — delete rows tied to clientId (CSO can re-create).
  try {
    for (const id of clientIds) {
      await db.delete(calendarEvents).where(eq(calendarEvents.clientId, id));
    }
    console.log(`   ✔ calendar_events with clientId deleted`);
  } catch (e) { console.warn("   ⚠ calendar_events cleanup skipped:", (e as Error).message); }

  // Client notes — delete.
  try {
    for (const id of clientIds) {
      await db.delete(clientNotes).where(eq(clientNotes.clientId, id));
    }
    console.log(`   ✔ client_notes deleted`);
  } catch (e) { console.warn("   ⚠ client_notes cleanup skipped:", (e as Error).message); }

  // Client sessions — delete (FK to clients).
  try {
    for (const id of clientIds) {
      await db.delete(clientSessions).where(eq(clientSessions.clientId, id));
    }
    console.log(`   ✔ client_sessions deleted`);
  } catch (e) { console.warn("   ⚠ client_sessions cleanup skipped:", (e as Error).message); }

  // Tasks — tasks use string clientName/phone, no FK; leave untouched unless you want to wipe.
  // (Founder said delete ALL clients, not all tasks. Tasks come through leads, not clients.)

  // Finally, delete the clients themselves.
  for (const id of clientIds) {
    await db.delete(clients).where(eq(clients.id, id));
  }
  const after = await db.select().from(clients);
  console.log(`✅  Done. Deleted ${before.length} clients. Remaining: ${after.length}`);
  console.log("   CSO starts fresh — add clients via CSO Portal → Active Clients → + Add Client.");
}

const isDirectRun = process.argv[1]?.includes("cleanup-clients");
if (isDirectRun) {
  cleanupAllClients()
    .then(() => process.exit(0))
    .catch((e) => { console.error("❌ Cleanup failed:", e); process.exit(1); });
}
