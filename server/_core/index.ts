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

  app.post("/api/dev-logout", (req, res) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
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
