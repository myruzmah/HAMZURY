import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";
import { seedStaffUsers, syncStaffRoster } from "../seed-staff";
import { runMigrations, seedTaxClients, seedMediaClients } from "../db";
// import { seedRealClients } from "../seed-real-clients"; // disabled 2026-04: CSO adds clients manually
import { invokeLLMStream } from "./llm";
import { buildSystemPrompt } from "../config/chat-config";
import { startAgentScheduler } from "../agents/agent-runner";

/** Strip HTML tags from user input to prevent XSS in stored/reflected content */
function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
}

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

  // ─── Force HTTPS in production (Railway sets x-forwarded-proto) ──────────
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // ─── CORS configuration ──────────────────────────────────────────────────
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowed = ["https://hamzury.com", "https://www.hamzury.com", "http://localhost:5173"];
    if (origin && allowed.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // ─── 2026-04 cleanup: /api/staff-login + /api/founder-login REMOVED.
  // Those endpoints allowed generic role-based login via env passwords
  // (CSO_PW, FOUNDER_PW) not tied to any real staff record. Every staff
  // member — including the founder — now logs in via /api/login with
  // their own Staff ID + personal password from the staffUsers table.
  // ──────────────────────────────────────────────────────────────────────

  // ─── Login rate limiter (10 attempts per 15 minutes per IP) ──────────────
  const loginRateMap = new Map<string, number[]>();
  const LOGIN_RATE_WINDOW = 15 * 60 * 1000;
  const LOGIN_RATE_LIMIT = 10;

  // ─── Unified Staff ID+Password Login ─────────────────────────────────────
  app.post("/api/login", async (req, res) => {
    try {
      // Rate limit by IP
      const forwarded = req.headers["x-forwarded-for"];
      const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip || "unknown";
      const now = Date.now();
      const hits = (loginRateMap.get(ip) || []).filter(ts => now - ts < LOGIN_RATE_WINDOW);
      if (hits.length >= LOGIN_RATE_LIMIT) {
        return res.status(429).json({ error: "Too many login attempts. Please wait 15 minutes." });
      }
      hits.push(now);
      loginRateMap.set(ip, hits);

      const { staffId, password } = req.body ?? {};
      if (!staffId || !password) return res.status(400).json({ error: "Staff ID and password are required." });

      const normalised = String(staffId).trim().toUpperCase();
      // Try lookup by staffRef first, then by email as fallback
      let user = await db.getStaffUserByRef(normalised);
      if (!user) user = await db.getStaffUserByEmail(normalised.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid Staff ID or password." });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: "Your account is pending activation. Contact HR." });
      }
      const valid = await db.verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!valid) {
        return res.status(401).json({ error: "Invalid Staff ID or password." });
      }

      // Success — create session
      const openId = `staffuser__${user.hamzuryRole}__${user.id}`;
      const token = await sdk.createSessionToken(openId, { name: user.name });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, sameSite: "lax", maxAge: 8 * 60 * 60 * 1000 });
      await db.updateStaffUserLogin(user.id);

      // 2026-04 cleanup: only CSO is active. All other roles land on "/"
      // until their dashboards are re-added one at a time.
      const ROLE_DASHBOARDS: Record<string, string> = {
        cso:      "/cso",
        cso_staff: "/cso",
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
    if (!EVENTS_TOKEN) {
      if (process.env.NODE_ENV === "production") {
        res.status(403).json({ error: "Webhook authentication required" });
        return;
      }
      next(); return; // token not set → open (dev/test)
    }
    const auth = req.headers.authorization ?? "";
    if (auth !== `Bearer ${EVENTS_TOKEN}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  }

  /**
   * POST /api/events/lead-intake
   * Creates a new lead card in the CSO Portal from chat conversations.
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

  // ─── HAMZURY v7 Chat API ────────────────────────────────────────────────────
  const chatRateMap = new Map<string, number[]>();
  const CHAT_RATE_WINDOW = 10 * 60 * 1000;
  const CHAT_RATE_LIMIT = 15;

  /** Shared rate limiter for all chat endpoints */
  function chatRateLimit(req: any, res: any): boolean {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip || "unknown";
    const now = Date.now();
    const hits = (chatRateMap.get(ip) || []).filter((ts: number) => now - ts < CHAT_RATE_WINDOW);
    if (hits.length >= CHAT_RATE_LIMIT) {
      res.status(429).json({ error: "Too many requests. Please wait a few minutes." });
      return false;
    }
    hits.push(now);
    chatRateMap.set(ip, hits);
    return true;
  }

  /** Shared SSE stream helper */
  async function streamChatResponse(req: any, res: any, systemPrompt: string, question: string, history: any[]) {
    const historyMessages = Array.isArray(history)
      ? history.slice(-10).map((h: { role: string; content: string }) => ({
          role: h.role as "user" | "assistant",
          content: sanitize(String(h.content).slice(0, 500)),
        }))
      : [];

    const stream = await invokeLLMStream({
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: sanitize(question) },
      ],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let sseBuffer = "";
    let doneSent = false;

    req.on("close", () => { reader.cancel().catch(() => {}); });

    while (true) {
      const { done, value } = await reader.read();
      if (done) { if (!doneSent) res.write("data: [DONE]\n\n"); res.end(); return; }
      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const payload = trimmed.slice(6).trim();
        if (payload === "[DONE]") { if (!doneSent) { res.write("data: [DONE]\n\n"); doneSent = true; } continue; }
        try {
          const parsed = JSON.parse(payload);
          // Anthropic format: transform to OpenAI-compatible format
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            const reformatted = JSON.stringify({ choices: [{ index: 0, delta: { content: parsed.delta.text } }] });
            res.write(`data: ${reformatted}\n\n`);
            continue;
          }
          if (parsed.type === "message_stop") {
            if (!doneSent) { res.write("data: [DONE]\n\n"); doneSent = true; }
            continue;
          }
          if (parsed.type === "message_start" || parsed.type === "content_block_start" || parsed.type === "ping") continue;
          const delta = parsed.choices?.[0]?.delta;
          // Qwen 3.5+ sends reasoning_content (thinking) before content — skip those
          if (delta && delta.content === null && delta.reasoning_content) continue;
        } catch { /* forward unparseable as-is */ }
        res.write(trimmed + "\n\n");
      }
    }
  }

  // POST /api/chat/message — Main public website chat (v7)
  app.post("/api/chat/message", async (req, res) => {
    try {
      if (!chatRateLimit(req, res)) return;
      const { message, history, department, language, selected_mode, session_id, url_referral, context } = req.body ?? {};
      if (!message || typeof message !== "string" || message.length > 1000) {
        return res.status(400).json({ error: "Invalid message." });
      }
      let systemPrompt: string;
      if (context === "consultation") {
        const { buildConsultationPrompt } = await import("../config/chat-config");
        systemPrompt = buildConsultationPrompt(language as string);
      } else {
        systemPrompt = buildSystemPrompt(department as string, undefined, language as string);
      }
      await streamChatResponse(req, res, systemPrompt, message, history || []);
    } catch (err) {
      console.error("[chat/message] error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Chat failed." });
      else res.end();
    }
  });

  // POST /api/chat/dashboard-message — Client dashboard chat (v7)
  app.post("/api/chat/dashboard-message", async (req, res) => {
    try {
      if (!chatRateLimit(req, res)) return;
      const { message, history, tone_preference, task_context, chat_memory, session_id } = req.body ?? {};
      if (!message || typeof message !== "string" || message.length > 1000) {
        return res.status(400).json({ error: "Invalid message." });
      }
      // Sanitize task_context if provided
      const safeContext = task_context ? {
        clientName: String(task_context.clientName || "").slice(0, 100),
        businessName: String(task_context.businessName || "").slice(0, 100),
        service: String(task_context.service || "").slice(0, 200),
        department: String(task_context.department || "").slice(0, 30),
        status: String(task_context.status || "").slice(0, 50),
        progress: typeof task_context.progress === "number" ? task_context.progress : 0,
        checklist: Array.isArray(task_context.checklist) ? task_context.checklist.slice(0, 15).map((c: any) => ({ label: String(c.label || "").slice(0, 100), completed: !!c.completed })) : undefined,
        recentActivity: Array.isArray(task_context.recentActivity) ? task_context.recentActivity.slice(0, 5).map((a: any) => String(a).slice(0, 100)) : undefined,
        chatMemory: typeof chat_memory === "string" ? chat_memory.slice(0, 2000) : undefined,
      } : undefined;
      const { buildDashboardSystemPrompt } = await import("../config/chat-config");
      const systemPrompt = buildDashboardSystemPrompt(safeContext, tone_preference as string);
      await streamChatResponse(req, res, systemPrompt, message, history || []);
    } catch (err) {
      console.error("[chat/dashboard-message] error:", err);
      if (!res.headersSent) res.status(500).json({ error: "Dashboard chat failed." });
      else res.end();
    }
  });

  // POST /api/chat/track-reference — Reference number lookup (v7)
  app.post("/api/chat/track-reference", async (req, res) => {
    try {
      const { reference_number } = req.body ?? {};
      if (!reference_number || typeof reference_number !== "string") {
        return res.status(400).json({ error: "Reference number required." });
      }
      const { getTaskByRef } = await import("../db");
      const task = await getTaskByRef(reference_number.trim().toUpperCase());
      if (!task) return res.json({ found: false, message: "No records found for this reference." });
      res.json({
        found: true,
        ref: task.ref,
        clientName: task.clientName,
        businessName: task.businessName,
        status: task.status,
        department: task.department,
        service: task.service,
      });
    } catch (err) {
      console.error("[chat/track-reference] error:", err);
      res.status(500).json({ error: "Tracking lookup failed." });
    }
  });

  // POST /api/chat/payment-receipt — Receipt upload + pending verification (v7)
  app.post("/api/chat/payment-receipt", async (req, res) => {
    try {
      const { reference_number, receipt_note, session_id } = req.body ?? {};
      if (!reference_number) {
        return res.status(400).json({ error: "Reference number required." });
      }
      // Mark as pending verification — finance team verifies manually
      res.json({
        status: "pending_verification",
        message: "Receipt noted. Payment remains pending until finance verifies. You will be notified once confirmed.",
      });
    } catch (err) {
      console.error("[chat/payment-receipt] error:", err);
      res.status(500).json({ error: "Receipt submission failed." });
    }
  });

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get("/api/health", async (_req, res) => {
    try {
      const dbMod = await import("../db").then(m => m.getDb());
      res.json({ status: "ok", db: dbMod ? "connected" : "disconnected", timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "error", db: "disconnected" });
    }
  });

  // ─── SEO: sitemap.xml ──────────────────────────────────────────────────────
  app.get("/sitemap.xml", (_req, res) => {
    const base = process.env.SITE_URL || "https://hamzury.com";
    const today = new Date().toISOString().split("T")[0];
    const urls = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/bizdoc", changefreq: "weekly", priority: "0.9" },
      { loc: "/systemise", changefreq: "weekly", priority: "0.9" },
      { loc: "/skills", changefreq: "weekly", priority: "0.9" },
      { loc: "/client", changefreq: "monthly", priority: "0.7" },
      { loc: "/founder", changefreq: "monthly", priority: "0.6" },
      { loc: "/consultant", changefreq: "monthly", priority: "0.6" },
      { loc: "/skills/ceo", changefreq: "monthly", priority: "0.6" },
      { loc: "/cto", changefreq: "monthly", priority: "0.6" },
      { loc: "/affiliate", changefreq: "monthly", priority: "0.5" },
      { loc: "/pricing", changefreq: "monthly", priority: "0.7" },
      { loc: "/team", changefreq: "monthly", priority: "0.5" },
      { loc: "/ridi", changefreq: "monthly", priority: "0.6" },
      { loc: "/alumni", changefreq: "monthly", priority: "0.5" },
      { loc: "/metfix", changefreq: "monthly", priority: "0.5" },
      { loc: "/skills/programs", changefreq: "monthly", priority: "0.7" },
      { loc: "/training", changefreq: "monthly", priority: "0.4" },
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
Disallow: /client/dashboard

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

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Run migrations then seed staff — both are safe to re-run
    try {
      await runMigrations();
      await seedStaffUsers();
      await syncStaffRoster();
      // 2026-04 founder decision: CSO (Maryam) adds every real client manually
      // via the CSO Portal. Auto-seeding removed so the DB reflects truth only.
      // await seedTaxClients();
      // await seedMediaClients();
      // await seedRealClients();
      // Start AI agent scheduler (background automation)
      await startAgentScheduler();
    } catch (err) {
      console.log("[startup] DB init error:", String(err));
    }
  });
}

startServer().catch(console.error);
