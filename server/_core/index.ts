import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ─── Staff Login — role-based, env-password-gated ────────────────────────
  app.post("/api/staff-login", async (req, res) => {
    try {
      const { role, password } = req.body ?? {};
      const ROLE_CONFIG: Record<string, { envKey: string; name: string; openId: string; dashboard: string }> = {
        founder: { envKey: "FOUNDER_PW",  name: "Muhammad Hamzury",  openId: "founder__admin__1", dashboard: "/founder/dashboard" },
        ceo:     { envKey: "CEO_PW",      name: "Idris Ibrahim",     openId: "staff__ceo__1",     dashboard: "/hub/ceo" },
        cso:     { envKey: "CSO_PW",      name: "CSO",               openId: "staff__cso__1",     dashboard: "/hub/cso" },
        finance: { envKey: "FINANCE_PW",  name: "Finance",           openId: "staff__finance__1", dashboard: "/hub/finance" },
        hr:      { envKey: "HR_PW",       name: "HR",                openId: "staff__hr__1",      dashboard: "/hub/hr" },
        bizdev:  { envKey: "BIZDEV_PW",   name: "BizDev",            openId: "staff__bizdev__1",  dashboard: "/hub/bizdev" },
      };
      const config = ROLE_CONFIG[role];
      if (!config) return res.status(400).json({ error: "Invalid role." });
      const expected = process.env[config.envKey];
      if (!expected) return res.status(503).json({ error: `${role.toUpperCase()} access not configured on this server.` });
      if (!password || password !== expected) return res.status(401).json({ error: "Incorrect password." });
      const token = await sdk.createSessionToken(config.openId, { name: config.name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 });
      res.json({ success: true, name: config.name, role, dashboard: config.dashboard });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ─── Dev Login — no password, dev-only, bypasses DB ─────────────────────
  app.post("/api/dev-login", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Not available in production." });
    }
    try {
      const { role } = req.body ?? {};
      const DEV_PROFILES: Record<string, { name: string; openId: string; dashboard: string }> = {
        founder:          { name: "Muhammad Hamzury", openId: "dev__founder__1",          dashboard: "/founder/dashboard" },
        ceo:              { name: "Idris Ibrahim",    openId: "dev__ceo__1",              dashboard: "/hub/ceo" },
        cso:              { name: "Tabitha",          openId: "dev__cso__1",              dashboard: "/hub/cso" },
        finance:          { name: "Abubakar",         openId: "dev__finance__1",          dashboard: "/hub/finance" },
        hr:               { name: "Khadija",          openId: "dev__hr__1",               dashboard: "/hub/hr" },
        bizdev:           { name: "Faree",            openId: "dev__bizdev__1",           dashboard: "/hub/bizdev" },
        department_staff: { name: "Abdullahi Musa",   openId: "dev__department_staff__1", dashboard: "/bizdoc/dashboard" },
        media:            { name: "Hikma",            openId: "dev__media__1",            dashboard: "/media/dashboard" },
      };
      const profile = DEV_PROFILES[role];
      if (!profile) return res.status(400).json({ error: "Unknown role." });
      const token = await sdk.createSessionToken(profile.openId, { name: profile.name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 });
      res.json({ success: true, name: profile.name, role, dashboard: profile.dashboard });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ─── Founder Login — password-gated, env-controlled ─────────────────────
  app.post("/api/founder-login", async (req, res) => {
    try {
      const { password } = req.body ?? {};
      const expected = process.env.FOUNDER_PW;
      if (!expected) {
        return res.status(503).json({ error: "Founder access not configured on this server." });
      }
      if (!password || password !== expected) {
        return res.status(401).json({ error: "Incorrect password." });
      }
      const openId = "founder__admin__1";
      const token = await sdk.createSessionToken(openId, { name: "Muhammad Hamzury" });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
      });
      res.json({ success: true, name: "Muhammad Hamzury", role: "admin" });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ─── Staff ID → email mapping (HZ-XXX → email) ──────────────────────────
  const STAFF_ID_MAP: Record<string, string> = {
    "HMZ000-26/3": "muhammad@hamzuryos.biz",
    "HMZ001-26/3": "idris@hamzuryos.biz",
    "HMZ002-26/3": "abdullahi@hamzuryos.biz",
    "HMZ003-26/3": "yusuf@hamzuryos.biz",
    "HMZ004-26/3": "khadija@hamzuryos.biz",
    "HMZ005-26/3": "faree@hamzuryos.biz",
    "HMZ006-26/3": "tabitha@hamzuryos.biz",
    "HMZ007-26/3": "maryam@hamzuryos.biz",
    "HMZ008-26/3": "abubakar@hamzuryos.biz",
    "HMZ009-26/3": "hikma@hamzuryos.biz",
    "HMZ010-26/3": "salis@hamzuryos.biz",
    "HMZ011-26/3": "abdulmalik@hamzuryos.biz",
    "HMZ012-26/3": "dajot@hamzuryos.biz",
    "HMZ013-26/3": "lalo@hamzuryos.biz",
    "HMZ014-26/3": "rabilu@hamzuryos.biz",
  };

  // ─── Unified Staff ID+Password Login ─────────────────────────────────────
  app.post("/api/login", async (req, res) => {
    try {
      const { staffId, password } = req.body ?? {};
      if (!staffId || !password) return res.status(400).json({ error: "Staff ID and password are required." });

      const normalised = String(staffId).trim().toUpperCase();
      const email = STAFF_ID_MAP[normalised];
      if (!email) return res.status(401).json({ error: "Invalid Staff ID or password." });

      const user = await db.getStaffUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid Staff ID or password." });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: "Your account is pending activation. Contact HR." });
      }
      // Check lockout
      if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
        const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
        return res.status(429).json({ error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.` });
      }

      const valid = await db.verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!valid) {
        await db.incrementStaffFailedAttempts(user.id);
        return res.status(401).json({ error: "Invalid Staff ID or password." });
      }

      // Success — create session
      const openId = `staffuser__${user.hamzuryRole}__${user.id}`;
      const token = await sdk.createSessionToken(openId, { name: user.name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 });
      await db.updateStaffUserLogin(user.id);

      const ROLE_DASHBOARDS: Record<string, string> = {
        founder:          "/founder/dashboard",
        ceo:              "/hub/ceo",
        cso:              "/hub/cso",
        finance:          "/hub/finance",
        hr:               "/hub/hr",
        bizdev:           "/hub/bizdev",
        bizdev_staff:     "/hub/workspace",
        media:            "/media/dashboard",
        skills_staff:     "/skills/admin",
        systemise_head:   "/systemise/cto",
        tech_lead:        "/systemise/cto",
        compliance_staff: "/hub/workspace",
        security_staff:   "/hub/workspace",
        department_staff: "/hub/workspace",
      };

      res.json({
        success: true,
        name: user.name,
        role: user.hamzuryRole,
        dashboard: ROLE_DASHBOARDS[user.hamzuryRole] ?? "/",
        firstLogin: user.firstLogin,
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ─── Change Password (session-aware) ──────────────────────────────────────
  app.post("/api/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body ?? {};
      if (!currentPassword || !newPassword) return res.status(400).json({ error: "All fields are required." });
      if (String(newPassword).length < 8) return res.status(400).json({ error: "New password must be at least 8 characters." });

      // Get user from session cookie
      const cookies = req.headers.cookie ?? "";
      const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const sessionToken = cookieMatch?.[1];
      const session = await sdk.verifySession(sessionToken);
      if (!session) return res.status(401).json({ error: "Not authenticated." });

      // Extract staffUserId from openId (format: staffuser__role__id)
      const openId = session.openId;
      if (!openId.startsWith("staffuser__")) return res.status(400).json({ error: "Password change only available for email-based accounts." });
      const parts = openId.split("__");
      const staffId = Number(parts[2]);
      if (!staffId) return res.status(400).json({ error: "Invalid session." });

      const user = await db.getStaffUserById(staffId);
      if (!user) return res.status(404).json({ error: "User not found." });

      const valid = await db.verifyPassword(currentPassword, user.passwordHash, user.passwordSalt);
      if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

      const { hash, salt } = await db.hashPassword(newPassword);
      await db.updateStaffPassword(user.id, hash, salt);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/dev-logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // ─── Affiliate Auth ───────────────────────────────────────────────────────
  const AFFILIATE_COOKIE = "hamzury-affiliate";

  app.post("/api/affiliate-login", async (req, res) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
      const affiliate = await db.getAffiliateByEmail(String(email).trim().toLowerCase());
      if (!affiliate) return res.status(401).json({ error: "Invalid email or password." });
      if (affiliate.status !== "active") return res.status(403).json({ error: "Account not active. Contact HAMZURY." });
      const valid = db.verifyAffiliatePassword(String(password), affiliate.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid email or password." });
      const token = await sdk.createSessionToken(`affiliate__${affiliate.id}`, { name: affiliate.name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(AFFILIATE_COOKIE, token, { ...cookieOptions, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 });
      res.json({ success: true, id: affiliate.id, name: affiliate.name, email: affiliate.email, code: affiliate.code });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/affiliate-logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(AFFILIATE_COOKIE, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  app.get("/api/affiliate/me", async (req, res) => {
    try {
      const cookies = req.headers.cookie ?? "";
      const match = cookies.match(new RegExp(`${AFFILIATE_COOKIE}=([^;]+)`));
      const token = match?.[1];
      if (!token) return res.status(401).json({ error: "Not authenticated." });
      const session = await sdk.verifySession(token);
      if (!session || !session.openId.startsWith("affiliate__")) return res.status(401).json({ error: "Invalid session." });
      const affiliateId = Number(session.openId.split("__")[1]);
      const affiliate = await db.getAffiliateById(affiliateId);
      if (!affiliate) return res.status(404).json({ error: "Affiliate not found." });
      res.json({ id: affiliate.id, name: affiliate.name, email: affiliate.email, code: affiliate.code });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // ─── DEV-ONLY: Role-switching for local development ───────────────────────
  if (process.env.NODE_ENV !== "production") {
    app.post("/api/dev-login", async (req, res) => {
      try {
        const { name = "Dev Admin", role = "admin", staffId = 1 } = req.body ?? {};
        const openId = `dev__${role}__${staffId}`;
        const token = await sdk.createSessionToken(openId, { name });
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          sameSite: "lax",
          maxAge: 8 * 60 * 60 * 1000,
        });
        res.json({ success: true, name, role });
      } catch (err) {
        res.status(500).json({ error: String(err) });
      }
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Chat Event Webhooks — receive events from the BizDoc chat AI ────────
  // Shared bearer token guard for all /api/events/* endpoints
  const EVENTS_TOKEN = process.env.CHAT_EVENTS_TOKEN ?? "";
  function requireEventsToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!EVENTS_TOKEN) { next(); return; } // token not set → open (dev/test)
    const auth = req.headers.authorization ?? "";
    if (auth !== `Bearer ${EVENTS_TOKEN}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  }

  /**
   * POST /api/events/lead-intake
   * Creates a new lead card in the CSODashboard from chat conversations.
   * Body: { name, phone, email?, service?, source?, notes?, referralCode? }
   */
  app.post("/api/events/lead-intake", requireEventsToken, async (req, res) => {
    try {
      const { name, phone, email, service, source, notes, referralCode } = req.body ?? {};
      if (!name || !phone) { res.status(400).json({ error: "name and phone are required" }); return; }
      const lead = await db.createLead({
        ref: db.generateHMZRef(phone),
        name,
        phone: phone ?? null,
        email: email ?? null,
        service: service ?? "General Enquiry",
        source: source ?? "chat_bot",
        context: notes ?? null,
        status: "new",
      });
      res.json({ ok: true, leadId: lead.id, ref: lead.ref ?? null });
    } catch (err) {
      console.error("[Events] lead-intake error:", err);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  /**
   * POST /api/events/document-collection
   * Creates a compliance case (task) with initial checklist when a client
   * provides their documents in chat.
   * Body: { name, phone, service, documents?: string[] }
   */
  app.post("/api/events/document-collection", requireEventsToken, async (req, res) => {
    try {
      const { name, phone, service, documents } = req.body ?? {};
      if (!name || !phone || !service) { res.status(400).json({ error: "name, phone, and service are required" }); return; }
      // Upsert lead then create task
      const lead = await db.createLead({
        ref: db.generateHMZRef(phone),
        name, phone: phone ?? null, service: service ?? "General Enquiry", source: "chat_bot",
        email: null, context: `Documents shared in chat: ${(documents ?? []).join(", ")}`,
        status: "converted",
      });
      const task = await db.createTaskFromLead(lead);
      await db.createActivityLog({ taskId: task.id, action: "Document collection started via chat", details: "Via chat bot" });
      res.json({ ok: true, taskId: task.id, ref: task.ref });
    } catch (err) {
      console.error("[Events] document-collection error:", err);
      res.status(500).json({ error: "Failed to create case" });
    }
  });

  /**
   * POST /api/events/payment-confirmed
   * Records a payment confirmation from the chat flow.
   * Body: { ref, name, phone, amount?, service? }
   */
  app.post("/api/events/payment-confirmed", requireEventsToken, async (req, res) => {
    try {
      const { ref, name, phone, amount, service } = req.body ?? {};
      if (!name || !phone) { res.status(400).json({ error: "name and phone are required" }); return; }
      // Find existing task or create a lead for it
      let task = ref ? await db.getTaskByRef(String(ref).toUpperCase()) : null;
      if (!task) {
        const lead = await db.createLead({
          ref: db.generateHMZRef(phone),
          name, phone: phone ?? null, service: service ?? "General Enquiry", source: "chat_payment",
          email: null, context: `Payment confirmed via chat. Amount: ₦${amount ?? "TBD"}`,
          status: "converted",
        });
        task = await db.createTaskFromLead(lead);
      }
      if (amount) {
        await db.updateTask(task.id, { quotedPrice: String(amount) });
      }
      await db.createActivityLog({ taskId: task.id, action: `Payment confirmed via chat`, details: `Amount: ₦${amount ?? "TBD"} | Client: ${name}` });
      const csoPhone = process.env.CSO_NOTIFY_PHONE ?? "2348067149356";
      const notifyMsg = encodeURIComponent(`🔔 New BizDoc payment confirmed!\nClient: ${name}\nPhone: ${phone}\nRef: ${task.ref}\nService: ${service ?? "General"}`);
      res.json({ ok: true, taskId: task.id, ref: task.ref, csoNotifyUrl: `https://wa.me/${csoPhone}?text=${notifyMsg}` });
    } catch (err) {
      console.error("[Events] payment-confirmed error:", err);
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  /**
   * POST /api/events/analysis-task
   * Creates a compliance review task when the chat AI completes a business
   * analysis and flags items for human review.
   * Body: { name, phone, service, analysisType, findings }
   */
  app.post("/api/events/analysis-task", requireEventsToken, async (req, res) => {
    try {
      const { name, phone, service, analysisType, findings } = req.body ?? {};
      if (!name || !phone) { res.status(400).json({ error: "name and phone are required" }); return; }
      const lead = await db.createLead({
        ref: db.generateHMZRef(phone),
        name, phone: phone ?? null, service: service ?? "Compliance Analysis", source: "chat_analysis",
        email: null,
        context: `Analysis type: ${analysisType ?? "general"}. Findings: ${typeof findings === "object" ? JSON.stringify(findings) : (findings ?? "")}`,
        status: "new",
      });
      const task = await db.createTaskFromLead(lead);
      await db.createActivityLog({ taskId: task.id, action: `Compliance analysis task created`, details: `Type: ${analysisType ?? "general"}` });
      res.json({ ok: true, taskId: task.id, ref: task.ref });
    } catch (err) {
      console.error("[Events] analysis-task error:", err);
      res.status(500).json({ error: "Failed to create analysis task" });
    }
  });

  /**
   * POST /api/events/human-handoff
   * Creates an appointment/handoff record when the chat passes the
   * conversation to a human CSO.
   * Body: { name, phone, email?, service?, preferredDate?, preferredTime?, notes? }
   */
  app.post("/api/events/human-handoff", requireEventsToken, async (req, res) => {
    try {
      const { name, phone, email, service, preferredDate, preferredTime, notes } = req.body ?? {};
      if (!name || !phone) { res.status(400).json({ error: "name and phone are required" }); return; }
      const appointment = await db.createAppointment({
        clientName: name,
        phone: phone ?? null,
        email: email ?? null,
        preferredDate: preferredDate ?? "TBD",
        preferredTime: preferredTime ?? "TBD",
        notes: notes ? `[Chat handoff] ${notes}` : "[Chat handoff] Client requested human assistance",
        status: "pending",
      });
      res.json({ ok: true, appointmentId: appointment.id });
    } catch (err) {
      console.error("[Events] human-handoff error:", err);
      res.status(500).json({ error: "Failed to create handoff" });
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ─── SEO: sitemap.xml ──────────────────────────────────────────────────────
  app.get("/sitemap.xml", (_req, res) => {
    const base = process.env.SITE_URL || "https://hamzury.com";
    const today = new Date().toISOString().split("T")[0];
    const urls = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/bizdoc", changefreq: "weekly", priority: "0.9" },
      { loc: "/systemise", changefreq: "weekly", priority: "0.9" },
      { loc: "/skills", changefreq: "weekly", priority: "0.9" },
      { loc: "/track", changefreq: "monthly", priority: "0.7" },
      { loc: "/founder", changefreq: "monthly", priority: "0.6" },
      { loc: "/consultant", changefreq: "monthly", priority: "0.6" },
      { loc: "/skills/ceo", changefreq: "monthly", priority: "0.6" },
      { loc: "/systemise/cto", changefreq: "monthly", priority: "0.6" },
      { loc: "/affiliate", changefreq: "monthly", priority: "0.5" },
      { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
      { loc: "/terms", changefreq: "yearly", priority: "0.3" },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${base}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  // ─── SEO: robots.txt ───────────────────────────────────────────────────────
  app.get("/robots.txt", (_req, res) => {
    const base = process.env.SITE_URL || "https://hamzury.com";
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *
Allow: /

# Staff / internal dashboards — no indexing
Disallow: /bizdoc/dashboard
Disallow: /hub/
Disallow: /skills/student
Disallow: /skills/admin
Disallow: /affiliate/dashboard

Sitemap: ${base}/sitemap.xml
`);
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
