/**
 * Seed / update REAL client data for Aljazira Data and Kano Ltd.
 * Run: pnpm exec tsx server/seed-real-clients.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { leads, tasks } from "../drizzle/schema";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return drizzle(url);
}

function randomRef() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `HAM-${code}-0000`;
}

async function main() {
  const db = getDb();

  // ── Aljazira Data ──
  const aljazira = await db.select().from(leads).where(eq(leads.email, "aljaziradata@gmail.com"));
  if (aljazira.length > 0) {
    console.log(`Found Aljazira Data lead (id=${aljazira[0].id}), updating...`);
    await db.update(leads).set({
      service: "Tax Management Subscription",
      status: "converted",
    }).where(eq(leads.id, aljazira[0].id));

    const aljTasks = await db.select().from(tasks).where(eq(tasks.leadId, aljazira[0].id));
    if (aljTasks.length > 0) {
      await db.update(tasks).set({
        service: "Tax Management Subscription",
        status: "In Progress",
        department: "bizdoc",
        quotedPrice: "150000",
        notes: "Tax Pro Max Annual subscription. ₦150k/year. Started Jan 2026.",
      }).where(eq(tasks.leadId, aljazira[0].id));
      console.log("  Updated existing Aljazira task(s)");
    } else {
      await db.insert(tasks).values({
        ref: randomRef(),
        leadId: aljazira[0].id,
        clientName: aljazira[0].name,
        businessName: aljazira[0].businessName || "Aljazira Data",
        phone: aljazira[0].phone,
        service: "Tax Management Subscription",
        status: "In Progress",
        department: "bizdoc",
        quotedPrice: "150000",
        notes: "Tax Pro Max Annual subscription. ₦150k/year. Started Jan 2026.",
      });
      console.log("  Created new Aljazira task");
    }
  } else {
    console.log("Aljazira Data not found — creating lead + task");
    const [result] = await db.insert(leads).values({
      ref: randomRef(),
      name: "Aljazira Data",
      businessName: "Aljazira Data",
      email: "aljaziradata@gmail.com",
      service: "Tax Management Subscription",
      source: "referral",
      status: "converted",
    });
    await db.insert(tasks).values({
      ref: randomRef(),
      leadId: result.insertId,
      clientName: "Aljazira Data",
      businessName: "Aljazira Data",
      service: "Tax Management Subscription",
      status: "In Progress",
      department: "bizdoc",
      quotedPrice: "150000",
      notes: "Tax Pro Max Annual subscription. ₦150k/year. Started Jan 2026.",
    });
    console.log("  Created Aljazira lead + task");
  }

  // ── Kano Ltd ──
  const kano = await db.select().from(leads).where(eq(leads.email, "kanobaba@gmail.com"));
  if (kano.length > 0) {
    console.log(`Found Kano Ltd lead (id=${kano[0].id}), updating...`);
    await db.update(leads).set({
      service: "Tax Management Subscription",
      status: "converted",
    }).where(eq(leads.id, kano[0].id));

    const kanoTasks = await db.select().from(tasks).where(eq(tasks.leadId, kano[0].id));
    if (kanoTasks.length > 0) {
      await db.update(tasks).set({
        service: "Tax Management Subscription",
        status: "In Progress",
        department: "bizdoc",
        quotedPrice: "150000",
        notes: "Tax Pro Max Annual subscription. ₦150k/year. Started Jan 2026.",
      }).where(eq(tasks.leadId, kano[0].id));
      console.log("  Updated existing Kano task(s)");
    } else {
      await db.insert(tasks).values({
        ref: randomRef(),
        leadId: kano[0].id,
        clientName: kano[0].name,
        businessName: kano[0].businessName || "Kano Ltd",
        phone: kano[0].phone,
        service: "Tax Management Subscription",
        status: "In Progress",
        department: "bizdoc",
        quotedPrice: "150000",
        notes: "Tax Pro Max Annual subscription. ₦150k/year. Started Jan 2026.",
      });
      console.log("  Created new Kano task");
    }
  } else {
    console.log("Kano Ltd not found — creating lead + task");
    const [result] = await db.insert(leads).values({
      ref: randomRef(),
      name: "Kano Ltd",
      businessName: "Kano Ltd",
      email: "kanobaba@gmail.com",
      service: "Tax Management Subscription",
      source: "referral",
      status: "converted",
    });
    await db.insert(tasks).values({
      ref: randomRef(),
      leadId: result.insertId,
      clientName: "Kano Ltd",
      businessName: "Kano Ltd",
      service: "Tax Management Subscription",
      status: "In Progress",
      department: "bizdoc",
      quotedPrice: "150000",
      notes: "Tax Pro Max Annual subscription. ₦150k/year. Started Jan 2026.",
    });
    console.log("  Created Kano lead + task");
  }

  // ── Audit: list all leads ──
  const allLeads = await db.select({
    id: leads.id,
    name: leads.name,
    businessName: leads.businessName,
    email: leads.email,
    ref: leads.ref,
    source: leads.source,
  }).from(leads);

  console.log("\n=== ALL LEADS (Real vs Demo Audit) ===");
  const realEmails = new Set(["aljaziradata@gmail.com", "kanobaba@gmail.com"]);
  const realRefs = new Set(["HMZ-26/3-9567"]); // Tilz Spa / Oge Matilda
  for (const l of allLeads) {
    const isReal = realEmails.has(l.email || "") || realRefs.has(l.ref) || l.source === "chat";
    const tag = isReal ? "REAL" : "DEMO";
    console.log(`  [${tag}] id=${l.id} ref=${l.ref} | ${l.name} | ${l.businessName || "-"} | ${l.email || "-"} | src:${l.source}`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
