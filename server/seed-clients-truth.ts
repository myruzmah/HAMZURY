/**
 * HAMZURY — Verified Client Truth Layer Seed (empty by design)
 * Run: pnpm exec tsx server/seed-clients-truth.ts
 *
 * NO clients are seeded automatically.
 *
 * The CSO (Maryam Ashir Lalo) adds every real paying client manually via the
 * CSO Portal → Active Clients → "+ Add Client" button. That keeps the
 * truth layer anchored to what CSO actually has on record, not what a
 * developer remembered to put in a seed file.
 *
 * If you need sample data for local dev, add rows via the portal UI or
 * a one-off script — do NOT reintroduce anchor clients here.
 */
import "dotenv/config";

export async function seedClientsTruth() {
  console.log("🏗️  HAMZURY — Client truth seed is intentionally empty.");
  console.log("   CSO adds all real clients manually via the CSO Portal.");
  console.log("   Skipping — no inserts performed.\n");
}

// Auto-run when called directly
const isDirectRun = process.argv[1]?.includes("seed-clients-truth");
if (isDirectRun) {
  seedClientsTruth()
    .then(() => process.exit(0))
    .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); });
}
