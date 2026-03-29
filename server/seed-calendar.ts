/**
 * Seed script for Skills 2026 calendar.
 * Run: npx tsx server/seed-calendar.ts
 */
import "dotenv/config";
import { getDb } from "./db";
import { skillsCalendar } from "../drizzle/schema";

const CALENDAR_2026 = [
  {
    quarter: "Q2-2026",
    theme: "Start and Sell",
    registrationStart: "2026-04-01",
    registrationEnd: "2026-04-10",
    orientationDate: "2026-04-11",
    classesStart: "2026-04-13",
    classesEnd: "2026-05-01",
    graduationDate: "2026-05-02",
    supportWindowStart: "2026-05-04",
    supportWindowEnd: "2026-06-20",
    executiveCircleStart: "2026-06-25",
    executiveCircleEnd: "2026-06-27",
    track1Name: "AI Founder Launchpad",
    track2Name: "Vibe Coding for Founders",
    track3Name: "AI Sales Operator",
    roboticsName: "Robotics & Creative Tech Lab",
    status: "upcoming" as const,
  },
  {
    quarter: "Q3-2026",
    theme: "Systemize and Grow",
    registrationStart: "2026-07-01",
    registrationEnd: "2026-07-10",
    orientationDate: "2026-07-11",
    classesStart: "2026-07-13",
    classesEnd: "2026-07-31",
    graduationDate: "2026-08-01",
    supportWindowStart: "2026-08-03",
    supportWindowEnd: "2026-09-19",
    executiveCircleStart: "2026-09-24",
    executiveCircleEnd: "2026-09-26",
    track1Name: "Service Business in 21 Days",
    track2Name: "Operations Automation Sprint",
    track3Name: "AI Marketing & Content Engine",
    roboticsName: "Robotics & Creative Tech Lab",
    status: "upcoming" as const,
  },
  {
    quarter: "Q4-2026",
    theme: "Productize and Scale",
    registrationStart: "2026-10-01",
    registrationEnd: "2026-10-09",
    orientationDate: "2026-10-10",
    classesStart: "2026-10-12",
    classesEnd: "2026-10-30",
    graduationDate: "2026-10-31",
    supportWindowStart: "2026-11-02",
    supportWindowEnd: "2026-12-05",
    executiveCircleStart: "2026-12-10",
    executiveCircleEnd: "2026-12-12",
    track1Name: "Digital Product Builder",
    track2Name: "Dashboard Builder Lab",
    track3Name: "Customer Success & Business Ops Lab",
    roboticsName: "Robotics & Creative Tech Lab",
    status: "upcoming" as const,
  },
];

async function seedCalendar() {
  const db = await getDb();
  if (!db) {
    console.error("[seed-calendar] Database not available");
    process.exit(1);
  }

  // Check if already seeded
  const existing = await db.select().from(skillsCalendar);
  if (existing.length > 0) {
    console.log(`[seed-calendar] Calendar already has ${existing.length} entries — skipping.`);
    process.exit(0);
  }

  console.log(`[seed-calendar] Seeding ${CALENDAR_2026.length} calendar entries...`);
  for (const entry of CALENDAR_2026) {
    await db.insert(skillsCalendar).values(entry);
    console.log(`  ✓ ${entry.quarter} — ${entry.theme}`);
  }
  console.log("[seed-calendar] Done.");
  process.exit(0);
}

seedCalendar().catch(err => {
  console.error("[seed-calendar] Error:", err);
  process.exit(1);
});
